import { useEffect, useState } from 'react';
import { getCustomers, getTrainings } from './api';
import type { Customer } from './types/CustomerTypes';
import type { Training } from './types/TrainingTypes';

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <section>
        <h2>Customers</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Address</th>
              <th>Postcode</th>
              <th>City</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.firstname}</td>
                <td>{customer.lastname}</td>
                <td>{customer.streetaddress}</td>
                <td>{customer.postcode}</td>
                <td>{customer.city}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Trainings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Activity</th>
              <th>Duration</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map((training) => (
              <tr key={training.id}>
                <td>{training.id}</td>
                <td>{new Date(training.date).toLocaleString()}</td>
                <td>{training.activity}</td>
                <td>{training.duration} min</td>
                <td>
                  {training.customer.firstname} {training.customer.lastname}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default App;
