import { useMemo, useState } from 'react';
import type { Customer, CustomerDetails } from '../../types/CustomerTypes';
import AddCustomer from './AddCustomer';
import UpdateCustomer from './UpdateCustomer';

interface CustomerListProps {
  customers: Customer[];
  onCreateCustomer: (details: CustomerDetails) => Promise<void>;
  onDeleteCustomer: (customerId: number) => Promise<void>;
  onUpdateCustomer: (customerId: number, details: CustomerDetails) => Promise<void>;
}

type CustomerSortKey = keyof Customer;

function CustomerList({
  customers,
  onCreateCustomer,
  onDeleteCustomer,
  onUpdateCustomer,
}: CustomerListProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<CustomerSortKey>('id');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [addingCustomer, setAddingCustomer] = useState(false);

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

  const pageCount = Math.ceil(visibleCustomers.length / pageSize);
  const currentPage = Math.min(page, pageCount || 1);
  const pageCustomers = visibleCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstCustomerNumber = visibleCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastCustomerNumber = Math.min(currentPage * pageSize, visibleCustomers.length);

  function handleSort(key: CustomerSortKey) {
    setPage(1);
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

  function exportCustomers() {
    const headers = [
      'ID',
      'First name',
      'Last name',
      'Address',
      'Postcode',
      'City',
      'Email',
      'Phone',
    ];
    const rows = visibleCustomers.map((customer) => [
      customer.id,
      customer.firstname,
      customer.lastname,
      customer.streetaddress,
      customer.postcode,
      customer.city,
      customer.email,
      customer.phone,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'),
      )
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
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
    <section className="listing-page">
      <div className="listing-toolbar">
        <div className="listing-heading">
          <h1>Customers</h1>
          <p>Manage your clients</p>
        </div>
        <div className="listing-controls">
          <label className="listing-search">
            <span className="visually-hidden">Search customers</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.3" />
              <path d="m15.5 15.5 4.2 4.2" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search customers..."
            />
          </label>
          <div className="listing-actions">
            <button type="button" className="listing-export" onClick={exportCustomers}>
              Export CSV
            </button>
            {addingCustomer ? (
              <button type="button" onClick={() => setAddingCustomer(false)}>
                Cancel
              </button>
            ) : (
              <button type="button" onClick={() => setAddingCustomer(true)}>
                <span aria-hidden="true">+</span> Add customer
              </button>
            )}
          </div>
        </div>
      </div>
      {deleteError && <p role="alert">{deleteError}</p>}
      {addingCustomer ? (
        <AddCustomer
          onAdd={onCreateCustomer}
          onCancel={() => setAddingCustomer(false)}
          onAdded={() => setAddingCustomer(false)}
        />
      ) : null}
      {editingCustomer && (
        <UpdateCustomer
          key={editingCustomer.id}
          customer={editingCustomer}
          onSave={onUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
          onSaved={() => setEditingCustomer(null)}
        />
      )}
      <div className="listing-table-container">
        <table>
          <thead>
            <tr>
              {sortHeading('#', 'id')}
              {sortHeading('First name', 'firstname')}
              {sortHeading('Last name', 'lastname')}
              {sortHeading('Email', 'email')}
              {sortHeading('Phone', 'phone')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.firstname}</td>
                <td>{customer.lastname}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td className="listing-row-actions">
                  <button
                    type="button"
                    className="listing-edit"
                    onClick={() => setEditingCustomer(customer)}
                    disabled={deletingCustomerId !== null}
                    aria-label={`Edit ${customer.firstname} ${customer.lastname}`}
                    title="Edit customer"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m14 5 5 5M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="listing-delete"
                    onClick={() => void handleDeleteCustomer(customer)}
                    disabled={deletingCustomerId !== null}
                    aria-label={`Delete ${customer.firstname} ${customer.lastname}`}
                    title="Delete customer"
                  >
                    {deletingCustomerId === customer.id ? (
                      '...'
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m4 3v6m4-6v6" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {visibleCustomers.length === 0 && (
              <tr>
                <td colSpan={6}>No customers match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="listing-pagination" aria-label="Customer list pagination">
        <label className="listing-page-size">
          Rows per page:
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </label>
        <span className="listing-page-range" aria-live="polite">
          {firstCustomerNumber}-{lastCustomerNumber} of {visibleCustomers.length}
        </span>
        <div className="listing-page-navigation">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next page"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default CustomerList;