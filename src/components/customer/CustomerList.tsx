import { useMemo, useState } from 'react';
import type { Customer } from '../../types/CustomerTypes';

interface CustomerListProps {
  customers: Customer[];
}

type CustomerSortKey = keyof Customer;

function CustomerList({ customers }: CustomerListProps) {
  const [sortKey, setSortKey] = useState<CustomerSortKey>('id');
  const [ascending, setAscending] = useState(true);

  const sortedCustomers = useMemo(
    () =>
      [...customers].sort((first, second) => {
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
      }),
    [customers, sortKey, ascending],
  );

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

  return (
    <section>
      <h1>Customers</h1>
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
          </tr>
        </thead>
        <tbody>
          {sortedCustomers.map((customer) => (
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
  );
}

export default CustomerList;