import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PatientManagement from '../page';

// Mock the entire firebase module
jest.mock('../../../../lib/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Import mocked functions
import { getDocs, updateDoc } from 'firebase/firestore';

// Add type declaration for toBeInTheDocument
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

describe('PatientManagement', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders patient management page', () => {
    render(<PatientManagement />);
    expect(screen.getByText('Patient Management')).toBeInTheDocument();
  });

  it('fetches and displays patients', async () => {
    const mockPatients = [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321' },
    ];

    (getDocs as jest.Mock).mockResolvedValue({
      docs: mockPatients.map(patient => ({
        id: patient.id,
        data: () => patient,
      })),
    });

    await act(async () => {
      render(<PatientManagement />);
    });

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles edit action', async () => {
    const mockPatients = [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
    ];

    (getDocs as jest.Mock).mockResolvedValue({
      docs: mockPatients.map(patient => ({
        id: patient.id,
        data: () => patient,
      })),
    });

    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    await act(async () => {
      render(<PatientManagement />);
    });

    const editButton = await screen.findByText('Edit');
    
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(updateDoc).toHaveBeenCalled();
  });
}); 