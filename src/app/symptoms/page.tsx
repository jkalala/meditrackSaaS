import SymptomChecker from '../../components/SymptomChecker';

export default function SymptomsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Symptom Checker</h1>
          <p className="mt-2 text-gray-600">Select your symptoms to get possible diagnoses</p>
        </div>
        <SymptomChecker />
      </div>
    </main>
  );
} 