import { useEffect, useState } from 'react';
import {
  deleteCustomer,
  deleteTraining,
  getCustomers,
  getTrainings,
  updateCustomer,
} from './api';
import Navigation from './components/Navigation';
import CustomerList from './components/customer/CustomerList';
import TrainingList from './components/training/TrainingList';
import type { Customer, CustomerDetails } from './types/CustomerTypes';
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

  async function handleDeleteCustomer(customerId: number) {
    await deleteCustomer(customerId);
    setCustomers((currentCustomers) =>
      currentCustomers.filter((customer) => customer.id !== customerId),
    );
    setTrainings((currentTrainings) =>
      currentTrainings.filter((training) => training.customer.id !== customerId),
    );
  }

  async function handleDeleteTraining(trainingId: number) {
    await deleteTraining(trainingId);
    setTrainings((currentTrainings) =>
      currentTrainings.filter((training) => training.id !== trainingId),
    );
  }

  async function handleUpdateCustomer(customerId: number, details: CustomerDetails) {
    await updateCustomer(customerId, details);
    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === customerId ? { ...details, id: customerId } : customer,
      ),
    );
    setTrainings((currentTrainings) =>
      currentTrainings.map((training) =>
        training.customer.id === customerId
          ? { ...training, customer: { ...details, id: customerId } }
          : training,
      ),
    );
  }

  return (
    <div className="app-layout">
      <Navigation />
      <main className="page-content">
        {loading ? (
          <p role="status">Loading database...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : page === 'trainings' ? (
          <TrainingList trainings={trainings} onDeleteTraining={handleDeleteTraining} />
        ) : (
          <CustomerList
            customers={customers}
            onDeleteCustomer={handleDeleteCustomer}
            onUpdateCustomer={handleUpdateCustomer}
          />
        )}
      </main>
    </div>
  );
}

export default App;
