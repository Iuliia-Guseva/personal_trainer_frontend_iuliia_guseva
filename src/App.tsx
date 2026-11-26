import { useEffect, useState } from 'react';
import './App.css';
import {
  createCustomer,
  createTraining,
  deleteCustomer,
  deleteTraining,
  getCustomers,
  getTrainings,
  updateCustomer,
} from './api';
import Navigation from './components/Navigation';
import CalendarPage from './components/calendar/CalendarPage';
import CustomerList from './components/customer/CustomerList';
import StatisticsPage from './components/statistics/StatisticsPage';
import TrainingList from './components/training/TrainingList';
import type { Customer, CustomerDetails } from './types/CustomerTypes';
import type { Training } from './types/TrainingTypes';

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(() => window.location.hash.slice(2) || 'customers');

  useEffect(() => {
    function syncPage() {
      setPage(window.location.hash.slice(2) || 'customers');
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

  async function handleCreateCustomer(details: CustomerDetails) {
    const customer = await createCustomer(details);
    setCustomers((currentCustomers) => [...currentCustomers, customer]);
  }

  async function handleDeleteTraining(trainingId: number) {
    await deleteTraining(trainingId);
    setTrainings((currentTrainings) =>
      currentTrainings.filter((training) => training.id !== trainingId),
    );
  }

  async function handleCreateTraining(
    details: Omit<Training, 'id' | 'customer'>,
    customerId: number,
  ) {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) {
      throw new Error('The selected customer could not be found.');
    }

    const training = await createTraining(details, customer);
    setTrainings((currentTrainings) => [...currentTrainings, training]);
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
          <TrainingList
            trainings={trainings}
            customers={customers}
            onAddTraining={handleCreateTraining}
            onDeleteTraining={handleDeleteTraining}
          />
        ) : page === 'calendar' ? (
          <CalendarPage trainings={trainings} />
        ) : page === 'statistics' ? (
          <StatisticsPage customers={customers} trainings={trainings} />
        ) : (
          <CustomerList
            customers={customers}
            onCreateCustomer={handleCreateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onUpdateCustomer={handleUpdateCustomer}
          />
        )}
      </main>
    </div>
  );
}

export default App;
