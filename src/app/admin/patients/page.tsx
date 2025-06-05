import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const PatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsCollection = collection(db, 'patients');
        const patientsSnapshot = await getDocs(patientsCollection);
        const patientsList = patientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[];
        setPatients(patientsList);
      } catch (err: any) {
        setError('Failed to fetch patients: ' + err.message);
      }
    };

    fetchPatients();
  }, []);

  const handleEdit = async (patientId: string) => {
    try {
      // Example: Update patient name
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, { name: 'Updated Name' });
      // Refresh the patients list
      const patientsCollection = collection(db, 'patients');
      const patientsSnapshot = await getDocs(patientsCollection);
      const patientsList = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Patient[];
      setPatients(patientsList);
    } catch (err: any) {
      setError('Failed to update patient: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Patient Management</h1>
      <p>View and edit patient information here.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{patient.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{patient.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{patient.phone}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleEdit(patient.id)} style={{ backgroundColor: '#0070f3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientManagement; 