'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

// Define the validation schema using Zod
const patientSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string().refine((date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Please enter a valid date of birth'),
    gender: z.enum(['male', 'female', 'other']),
    nationality: z.string().min(2, 'Please enter a valid nationality'),
    address: z.object({
      street: z.string().min(5, 'Please enter a valid street address'),
      city: z.string().min(2, 'Please enter a valid city'),
      province: z.string().min(2, 'Please enter a valid province'),
      postalCode: z.string().min(4, 'Please enter a valid postal code'),
    }),
    contactInfo: z.object({
      phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
      email: z.string().email('Please enter a valid email address'),
      emergencyContact: z.object({
        name: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
        relationship: z.string().min(2, 'Please specify the relationship'),
        phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
      }),
    }),
  }),
  medicalInfo: z.object({
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    insuranceInfo: z.object({
      provider: z.string().min(2, 'Please enter insurance provider'),
      policyNumber: z.string().min(2, 'Please enter policy number'),
      coverageDetails: z.string().optional(),
    }),
  }),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsSubmitting(true);
      
      // Add timestamps
      const patientData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'patients'), patientData);
      
      toast.success('Patient registered successfully!');
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error('Failed to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Patient Registration</h2>
        
        {/* Personal Information Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                {...register('personalInfo.firstName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.personalInfo?.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.personalInfo.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                {...register('personalInfo.lastName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.personalInfo?.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.personalInfo.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                {...register('personalInfo.dateOfBirth')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.personalInfo?.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.personalInfo.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                {...register('personalInfo.gender')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.personalInfo?.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.personalInfo.gender.message}</p>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  {...register('personalInfo.address.street')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.personalInfo?.address?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.address.street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  {...register('personalInfo.address.city')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.personalInfo?.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <input
                  type="text"
                  {...register('personalInfo.address.province')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.personalInfo?.address?.province && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.address.province.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  {...register('personalInfo.address.postalCode')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.personalInfo?.address?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.address.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  {...register('personalInfo.contactInfo.phone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.personalInfo?.contactInfo?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.contactInfo.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('personalInfo.contactInfo.email')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.personalInfo?.contactInfo?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.contactInfo.email.message}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h5 className="text-md font-medium">Emergency Contact</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    {...register('personalInfo.contactInfo.emergencyContact.name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.personalInfo?.contactInfo?.emergencyContact?.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.personalInfo.contactInfo.emergencyContact.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    {...register('personalInfo.contactInfo.emergencyContact.relationship')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.personalInfo?.contactInfo?.emergencyContact?.relationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.personalInfo.contactInfo.emergencyContact.relationship.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    {...register('personalInfo.contactInfo.emergencyContact.phone')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.personalInfo?.contactInfo?.emergencyContact?.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.personalInfo.contactInfo.emergencyContact.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold">Medical Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Type</label>
              <select
                {...register('medicalInfo.bloodType')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.medicalInfo?.bloodType && (
                <p className="mt-1 text-sm text-red-600">{errors.medicalInfo.bloodType.message}</p>
              )}
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Insurance Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <input
                  type="text"
                  {...register('medicalInfo.insuranceInfo.provider')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.medicalInfo?.insuranceInfo?.provider && (
                  <p className="mt-1 text-sm text-red-600">{errors.medicalInfo.insuranceInfo.provider.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                <input
                  type="text"
                  {...register('medicalInfo.insuranceInfo.policyNumber')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.medicalInfo?.insuranceInfo?.policyNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.medicalInfo.insuranceInfo.policyNumber.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Coverage Details</label>
                <textarea
                  {...register('medicalInfo.insuranceInfo.coverageDetails')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </div>
    </form>
  );
} 