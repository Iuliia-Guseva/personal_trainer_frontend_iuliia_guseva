import { useMemo, useState } from 'react';
import type { Customer } from '../../types/CustomerTypes';

interface CustomerListProps {
  customers: Customer[];
  onDeleteCustomer: (customerId: number) => Promise<void>;
}

type CustomerSortKey = keyof Customer;

function CustomerList({ customers, onDeleteCustomer }: CustomerListProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<CustomerSortKey>('id');
  const [ascending, setAscending] = useState(true);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const visibleCustomers = useMemo(() => {
    const words = search
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    return [...customers]
      .filter((customer) => {
        const searchableText = Object.values(customer)
          .join(' ')
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return words.every((word) => searchableText.includes(word));
      })
      .sort((first, second) => {
        const firstValue = first[sortKey];
        const secondValue = second[sortKey];
        const comparison =
          typeof firstValue === 'number' && typeof secondValue === 'number'
            ? firstValue - secondValue
            : String(firstValue).localeCompare(String(secondValue), undefined, {
                numeric: true,
                sensitivity: 'base',
              });

        return ascending ? comparison : -comparison;
      });
  }, [customers, search, sortKey, ascending]);

  function handleSort(key: CustomerSortKey) {
    if (sortKey === key) {
      setAscending((current) => !current);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  }

  function sortHeading(label: string, key: CustomerSortKey) {
    const active = sortKey === key;

    return (
      <th aria-sort={active ? (ascending ? 'ascending' : 'descending') : 'none'}>
        <button type="button" onClick={() => handleSort(key)}>
          {label} {active ? (ascending ? '↑' : '↓') : '↕'}
        </button>
      </th>
    );
  }

  async function handleDeleteCustomer(customer: Customer) {
    const fullName = `${customer.firstname} ${customer.lastname}`;
    const confirmed = window.confirm(
      `Delete ${fullName}? This will also delete all of their training sessions. This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingCustomerId(customer.id);
    setDeleteError('');
    try {
      await onDeleteCustomer(customer.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete customer.');
    } finally {
      setDeletingCustomerId(null);
    }
  }

  return (
    <section>
      <h1>Customers</h1>
      {deleteError && <p role="alert">{deleteError}</p>}
      <label>
        Search customers
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, address, email..."
        />
      </label>
      <table>
        <thead>
          <tr>
            {sortHeading('ID', 'id')}
            {sortHeading('First name', 'firstname')}
            {sortHeading('Last name', 'lastname')}
            {sortHeading('Address', 'streetaddress')}
            {sortHeading('Postcode', 'postcode')}
            {sortHeading('City', 'city')}
            {sortHeading('Email', 'email')}
            {sortHeading('Phone', 'phone')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.firstname}</td>
              <td>{customer.lastname}</td>
              <td>{customer.streetaddress}</td>
              <td>{customer.postcode}</td>
              <td>{customer.city}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>
                <button
                  type="button"
                  onClick={() => void handleDeleteCustomer(customer)}
                  disabled={deletingCustomerId !== null}
                  aria-label={`Delete ${customer.firstname} ${customer.lastname}`}
                >
                  {deletingCustomerId === customer.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
          {visibleCustomers.length === 0 && (
            <tr>
              <td colSpan={9}>No customers match your search.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default CustomerList;