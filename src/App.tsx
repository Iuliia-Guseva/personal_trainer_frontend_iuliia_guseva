import { useEffect, useState } from 'react';
import { getCustomers, getTrainings } from './api';
import Navigation from './components/Navigation';
import CustomerList from './components/customer/CustomerList';
import TrainingList from './components/training/TrainingList';
import type { Customer } from './types/CustomerTypes';
import type { Training } from './types/TrainingTypes';

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(
    window.location.hash === '#/trainings' ? 'trainings' : 'customers',
  );

  useEffect(() => {
    function syncPage() {
      setPage(window.location.hash === '#/trainings' ? 'trainings' : 'customers');
    }

    window.addEventListener('hashchange', syncPage);

    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [customerData, trainingData] = await Promise.all([
          getCustomers(),
          getTrainings(),
        ]);
        setCustomers(customerData);
        setTrainings(trainingData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load database.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  if (loading) {
    return (
      <main>
        <p role="status">Loading database...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main>
      <Navigation />
      {loading ? (
        <p role="status">Loading database...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : page === 'trainings' ? (
        <TrainingList trainings={trainings} />
      ) : (
        <CustomerList customers={customers} />
      )}
    </main>
  );
}

export default App;
