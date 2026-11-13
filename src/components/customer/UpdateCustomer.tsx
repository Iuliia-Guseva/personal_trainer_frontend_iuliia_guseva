import { useState, type FormEvent } from 'react';
import type { Customer, CustomerDetails } from '../../types/CustomerTypes';

interface UpdateCustomerProps {
  customer: Customer;
  onSave: (customerId: number, details: CustomerDetails) => Promise<void>;
  onCancel: () => void;
  onSaved: () => void;
}

function UpdateCustomer({ customer, onSave, onCancel, onSaved }: UpdateCustomerProps) {
  const [details, setDetails] = useState<CustomerDetails>({
    firstname: customer.firstname,
    lastname: customer.lastname,
    streetaddress: customer.streetaddress,
    postcode: customer.postcode,
    city: customer.city,
    email: customer.email,
    phone: customer.phone,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field: keyof CustomerDetails, value: string) {
    setDetails((currentDetails) => ({ ...currentDetails, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(customer.id, details);
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update customer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit customer</h2>
      <label>
        First name
        <input
          required
          value={details.firstname}
          onChange={(event) => handleChange('firstname', event.target.value)}
        />
      </label>
      <label>
        Last name
        <input
          required
          value={details.lastname}
          onChange={(event) => handleChange('lastname', event.target.value)}
        />
      </label>
      <label>
        Address
        <input
          required
          value={details.streetaddress}
          onChange={(event) => handleChange('streetaddress', event.target.value)}
        />
      </label>
      <label>
        Postcode
        <input
          required
          value={details.postcode}
          onChange={(event) => handleChange('postcode', event.target.value)}
        />
      </label>
      <label>
        City
        <input
          required
          value={details.city}
          onChange={(event) => handleChange('city', event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          value={details.email}
          onChange={(event) => handleChange('email', event.target.value)}
        />
      </label>
      <label>
        Phone
        <input
          required
          value={details.phone}
          onChange={(event) => handleChange('phone', event.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
      <button type="button" onClick={onCancel} disabled={saving}>
        Cancel
      </button>
    </form>
  );
}

export default UpdateCustomer;