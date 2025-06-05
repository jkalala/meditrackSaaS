import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Admin Dashboard</h1>
      <p>Manage patient records and appointments here.</p>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '10px 0' }}>
            <Link href="/admin/patients" style={{ color: '#0070f3', textDecoration: 'none' }}>
              Patient Management
            </Link>
          </li>
          <li style={{ margin: '10px 0' }}>
            <Link href="/admin/appointments" style={{ color: '#0070f3', textDecoration: 'none' }}>
              Appointment Management
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminDashboard; 