/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import twilio from "twilio";

admin.initializeApp();

// Initialize Twilio client
const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token,
);

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  patientPhone: string;
  patientName: string;
}

export const sendAppointmentReminders = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // Query appointments for tomorrow
      const appointmentsSnapshot = await admin
        .firestore()
        .collection("appointments")
        .where("date", "==", tomorrow.toISOString().split("T")[0])
        .where("status", "==", "scheduled")
        .get();

      const appointments = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Send SMS for each appointment
      const sendPromises = appointments.map(async (appointment) => {
        const message =
          "Reminder: You have an appointment tomorrow at " +
          appointment.time +
          ". Please arrive 15 minutes early. Reply 'CANCEL' to cancel your " +
          "appointment.";

        try {
          await twilioClient.messages.create({
            body: message,
            to: appointment.patientPhone,
            from: functions.config().twilio.phone_number,
          });

          // Log successful message
          await admin.firestore().collection("sms_logs").add({
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            phoneNumber: appointment.patientPhone,
            message: message,
            status: "sent",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error: unknown) {
          console.error(
            `Failed to send SMS for appointment ${appointment.id}:`,
            error
          );
          // Log failed message
          await admin.firestore().collection("sms_logs").add({
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            phoneNumber: appointment.patientPhone,
            message: message,
            status: "failed",
            error:
              error instanceof Error ? error.message : String(error),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      await Promise.all(sendPromises);
      return null;
    } catch (error) {
      console.error("Error in sendAppointmentReminders:", error);
      throw error;
    }
  });

// Handle SMS responses (for cancellation)
export const handleSMSResponse = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const {Body, From} = req.body;

  if (Body.trim().toUpperCase() === "CANCEL") {
    try {
      // Find the appointment for this phone number
      const appointmentsSnapshot = await admin
        .firestore()
        .collection("appointments")
        .where("patientPhone", "==", From)
        .where("status", "==", "scheduled")
        .orderBy("date", "asc")
        .limit(1)
        .get();

      if (appointmentsSnapshot.empty) {
        await twilioClient.messages.create({
          body: "No upcoming appointments found to cancel.",
          to: From,
          from: functions.config().twilio.phone_number,
        });
        res.status(200).send("No appointments found");
        return;
      }

      const appointment = appointmentsSnapshot.docs[0];

      // Update appointment status
      await appointment.ref.update({
        status: "cancelled",
        cancelledAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send confirmation SMS
      await twilioClient.messages.create({
        body:
          "Your appointment has been cancelled. Please contact the clinic to " +
          "reschedule.",
        to: From,
        from: functions.config().twilio.phone_number,
      });

      res.status(200).send("Appointment cancelled");
    } catch (error) {
      console.error("Error handling SMS response:", error);
      res.status(500).send("Error processing request");
    }
  } else {
    res.status(200).send("Message received");
  }
});
