import { useState, type FormEvent } from 'react';
import type { Customer } from '../../types/CustomerTypes';
import type { Training } from '../../types/TrainingTypes';

interface AddTrainingProps {
  customers: Customer[];
  onAdd: (
    details: Omit<Training, 'id' | 'customer'>,
    customerId: number,
  ) => Promise<void>;
  onCancel: () => void;
  onAdded: () => void;
}

function AddTraining({ customers, onAdd, onCancel, onAdded }: AddTrainingProps) {
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState('');
  const [activity, setActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedCustomerId = Number(customerId);
    const selectedDate = new Date(date);
    if (!Number.isInteger(selectedCustomerId) || Number.isNaN(selectedDate.getTime())) {
      setError('Select a customer and enter a valid date and time.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onAdd(
        {
          date: selectedDate.toISOString(),
          activity: activity.trim(),
          duration: Number(duration),
        },
        selectedCustomerId,
      );
      onAdded();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add training.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add training</h2>
      {customers.length === 0 ? (
        <p>Add a customer before creating a training.</p>
      ) : (
        <>
          <label>
            Customer
            <select
              required
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstname} {customer.lastname}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date and time
            <input
              required
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label>
            Activity
            <input
              required
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            />
          </label>
          <label>
            Duration (minutes)
            <input
              required
              type="number"
              min="1"
              step="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </label>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving || customers.length === 0}>
        {saving ? 'Saving...' : 'Add training'}
      </button>
      <button type="button" onClick={onCancel} disabled={saving}>
        Cancel
      </button>
    </form>
  );
}

export default AddTraining;