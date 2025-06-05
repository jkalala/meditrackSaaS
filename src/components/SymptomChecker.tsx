import { useState } from 'react';

interface Symptom {
  id: string;
  name: string;
  selected: boolean;
}

interface Diagnosis {
  condition: string;
  probability: number;
  description: string;
}

const commonSymptoms: Symptom[] = [
  { id: 'fever', name: 'Fever', selected: false },
  { id: 'cough', name: 'Cough', selected: false },
  { id: 'headache', name: 'Headache', selected: false },
  { id: 'fatigue', name: 'Fatigue', selected: false },
  { id: 'nausea', name: 'Nausea', selected: false },
  { id: 'dizziness', name: 'Dizziness', selected: false },
  { id: 'chest_pain', name: 'Chest Pain', selected: false },
  { id: 'shortness_breath', name: 'Shortness of Breath', selected: false },
  { id: 'muscle_pain', name: 'Muscle Pain', selected: false },
  { id: 'sore_throat', name: 'Sore Throat', selected: false }
];

const diagnosisDatabase: Record<string, { symptoms: string[], description: string }> = {
  'Common Cold': {
    symptoms: ['fever', 'cough', 'sore_throat', 'fatigue'],
    description: 'A viral infection of the upper respiratory tract.'
  },
  'Flu': {
    symptoms: ['fever', 'cough', 'headache', 'fatigue', 'muscle_pain'],
    description: 'A contagious respiratory illness caused by influenza viruses.'
  },
  'COVID-19': {
    symptoms: ['fever', 'cough', 'shortness_breath', 'fatigue', 'muscle_pain'],
    description: 'A respiratory illness caused by the SARS-CoV-2 virus.'
  },
  'Migraine': {
    symptoms: ['headache', 'nausea', 'dizziness'],
    description: 'A neurological condition characterized by severe headaches.'
  },
  'Anxiety': {
    symptoms: ['chest_pain', 'shortness_breath', 'dizziness', 'fatigue'],
    description: 'A mental health condition characterized by excessive worry and fear.'
  }
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<Symptom[]>(commonSymptoms);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSymptomToggle = (symptomId: string) => {
    setSymptoms(prevSymptoms =>
      prevSymptoms.map(symptom =>
        symptom.id === symptomId
          ? { ...symptom, selected: !symptom.selected }
          : symptom
      )
    );
  };

  const calculateDiagnosis = () => {
    setLoading(true);
    const selectedSymptoms = symptoms
      .filter(s => s.selected)
      .map(s => s.id);

    const possibleDiagnoses: Diagnosis[] = Object.entries(diagnosisDatabase)
      .map(([condition, data]) => {
        const matchingSymptoms = data.symptoms.filter(s => selectedSymptoms.includes(s));
        const probability = (matchingSymptoms.length / data.symptoms.length) * 100;
        
        return {
          condition,
          probability,
          description: data.description
        };
      })
      .filter(d => d.probability > 0)
      .sort((a, b) => b.probability - a.probability);

    setDiagnoses(possibleDiagnoses);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Symptom Checker</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select your symptoms:</h3>
        <div className="grid grid-cols-2 gap-3">
          {symptoms.map(symptom => (
            <label
              key={symptom.id}
              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={symptom.selected}
                onChange={() => handleSymptomToggle(symptom.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>{symptom.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={calculateDiagnosis}
        disabled={loading || !symptoms.some(s => s.selected)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Check Symptoms'}
      </button>

      {diagnoses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Possible Diagnoses:</h3>
          <div className="space-y-4">
            {diagnoses.map((diagnosis, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{diagnosis.condition}</h4>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(diagnosis.probability)}% match
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{diagnosis.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 italic">
            Note: This is a basic symptom checker and should not replace professional medical advice.
            Please consult a healthcare provider for proper diagnosis and treatment.
          </p>
        </div>
      )}
    </div>
  );
} 