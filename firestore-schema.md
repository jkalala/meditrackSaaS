# MediTrack Firestore Schema

## Collections Structure

### 1. patients
```javascript
{
  id: string,                    // Auto-generated document ID
  personalInfo: {
    firstName: string,
    lastName: string,
    dateOfBirth: timestamp,
    gender: string,
    nationality: string,
    address: {
      street: string,
      city: string,
      province: string,
      postalCode: string
    },
    contactInfo: {
      phone: string,
      email: string,
      emergencyContact: {
        name: string,
        relationship: string,
        phone: string
      }
    }
  },
  medicalInfo: {
    bloodType: string,
    allergies: array<string>,
    chronicConditions: array<string>,
    insuranceInfo: {
      provider: string,
      policyNumber: string,
      coverageDetails: string
    }
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. doctors
```javascript
{
  id: string,                    // Auto-generated document ID
  personalInfo: {
    firstName: string,
    lastName: string,
    specialization: string,
    licenseNumber: string,
    qualifications: array<string>
  },
  contactInfo: {
    phone: string,
    email: string,
    officeLocation: string
  },
  schedule: {
    workingHours: {
      monday: { start: string, end: string },
      tuesday: { start: string, end: string },
      wednesday: { start: string, end: string },
      thursday: { start: string, end: string },
      friday: { start: string, end: string }
    },
    availableSlots: array<timestamp>
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. appointments
```javascript
{
  id: string,                    // Auto-generated document ID
  patientId: string,             // Reference to patients collection
  doctorId: string,              // Reference to doctors collection
  dateTime: timestamp,
  status: string,                // 'scheduled', 'completed', 'cancelled', 'no-show'
  type: string,                  // 'consultation', 'follow-up', 'emergency', etc.
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. medicalRecords
```javascript
{
  id: string,                    // Auto-generated document ID
  patientId: string,             // Reference to patients collection
  doctorId: string,              // Reference to doctors collection
  appointmentId: string,         // Reference to appointments collection
  visitDate: timestamp,
  diagnosis: {
    primary: string,
    secondary: array<string>
  },
  symptoms: array<string>,
  vitalSigns: {
    bloodPressure: {
      systolic: number,
      diastolic: number
    },
    heartRate: number,
    temperature: number,
    weight: number,
    height: number
  },
  medications: array<{
    name: string,
    dosage: string,
    frequency: string,
    duration: string,
    prescribedDate: timestamp
  }>,
  labResults: array<{
    testName: string,
    result: string,
    date: timestamp,
    labName: string
  }>,
  notes: string,
  followUpRequired: boolean,
  followUpDate: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isDoctor() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
    }
    
    function isPatient() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'patient';
    }
    
    function isOwnDoctor(doctorId) {
      return isDoctor() && request.auth.uid == doctorId;
    }
    
    function isOwnPatient(patientId) {
      return isPatient() && request.auth.uid == patientId;
    }
    
    // Patients collection rules
    match /patients/{patientId} {
      // Patients can only read their own records
      allow read: if isAuthenticated() && 
        (isAdmin() || isDoctor() || isOwnPatient(patientId));
      // Only admins and doctors can create/update patient records
      allow create: if isAdmin() || isDoctor();
      allow update: if isAdmin() || isDoctor();
      allow delete: if isAdmin();
    }
    
    // Doctors collection rules
    match /doctors/{doctorId} {
      // Everyone can read doctor profiles
      allow read: if isAuthenticated();
      // Only admins can create/update doctor records
      allow write: if isAdmin();
    }
    
    // Appointments collection rules
    match /appointments/{appointmentId} {
      // Patients can read their own appointments
      // Doctors can read appointments they're assigned to
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         (isDoctor() && resource.data.doctorId == request.auth.uid) ||
         (isPatient() && resource.data.patientId == request.auth.uid));
      
      // Patients can create their own appointments
      allow create: if isAuthenticated() && 
        (isAdmin() || 
         (isPatient() && request.resource.data.patientId == request.auth.uid));
      
      // Doctors can only update their own appointments
      // Patients can update their own appointments
      allow update: if isAuthenticated() && 
        (isAdmin() || 
         (isDoctor() && resource.data.doctorId == request.auth.uid) ||
         (isPatient() && resource.data.patientId == request.auth.uid));
      
      // Only admins and doctors can delete appointments
      allow delete: if isAdmin() || 
        (isDoctor() && resource.data.doctorId == request.auth.uid);
    }
    
    // Medical records collection rules
    match /medicalRecords/{recordId} {
      // Patients can only read their own records
      // Doctors can read records they created
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         (isDoctor() && resource.data.doctorId == request.auth.uid) ||
         (isPatient() && resource.data.patientId == request.auth.uid));
      
      // Only doctors can create medical records
      allow create: if isAuthenticated() && 
        (isAdmin() || 
         (isDoctor() && request.resource.data.doctorId == request.auth.uid));
      
      // Only doctors can update their own records
      allow update: if isAuthenticated() && 
        (isAdmin() || 
         (isDoctor() && resource.data.doctorId == request.auth.uid));
      
      // Only admins can delete medical records
      allow delete: if isAdmin();
    }
  }
}
```

## Indexes

Create the following composite indexes:

1. Appointments by date and status:
```javascript
Collection: appointments
Fields indexed:
- dateTime (Ascending)
- status (Ascending)
```

2. Medical records by patient and date:
```javascript
Collection: medicalRecords
Fields indexed:
- patientId (Ascending)
- visitDate (Descending)
```

3. Doctors by specialization:
```javascript
Collection: doctors
Fields indexed:
- specialization (Ascending)
- personalInfo.lastName (Ascending)
```

## Best Practices

1. **Data Validation**: Implement data validation rules in your application code before writing to Firestore.

2. **Batch Operations**: Use batch operations when creating related documents (e.g., appointment and medical record).

3. **Offline Support**: Implement proper offline support using Firestore's offline persistence.

4. **Data Migration**: Plan for data migration strategies as the schema evolves.

5. **Backup Strategy**: Implement regular backups of your Firestore database.

6. **Audit Trail**: Consider creating an audit collection to track important changes to sensitive data.

7. **Rate Limiting**: Implement rate limiting in your security rules to prevent abuse.

8. **Data Retention**: Implement data retention policies for medical records as per local regulations. 