import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
}

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsCollection = collection(db, 'appointments');
      const appointmentsSnapshot = await getDocs(appointmentsCollection);
      const appointmentsList = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      setAppointments(appointmentsList);
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId: string) => {
    // Update appointment status to cancelled
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { status: 'cancelled' });
    // Refresh the appointments list
    const appointmentsCollection = collection(db, 'appointments');
    const appointmentsSnapshot = await getDocs(appointmentsCollection);
    const appointmentsList = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
    setAppointments(appointmentsList);
  };

  return (
    <div>
      <h1>Appointment Management</h1>
      <p>Manage patient appointments here.</p>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.patientName}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.status}</td>
              <td>
                <button onClick={() => handleCancel(appointment.id)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentManagement; 