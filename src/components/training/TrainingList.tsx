import { useMemo, useState } from 'react';
import type { Training } from '../../types/TrainingTypes';

interface TrainingListProps {
  trainings: Training[];
  onDeleteTraining: (trainingId: number) => Promise<void>;
}

type TrainingSortKey = 'id' | 'date' | 'activity' | 'duration' | 'customer';

const trainingDateFormatter = new Intl.DateTimeFormat('fi-FI', {
  timeZone: 'Europe/Helsinki',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function formatTrainingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid training date: ${value}`);
  }

  const parts = trainingDateFormatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((datePart) => datePart.type === type);
    if (!part) {
      throw new Error(`Could not format training date: missing ${type}`);
    }
    return part.value;
  };

  return `${getPart('day')}.${getPart('month')}.${getPart('year')} ${getPart('hour')}:${getPart('minute')}`;
}

function TrainingList({ trainings, onDeleteTraining }: TrainingListProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<TrainingSortKey>('id');
  const [ascending, setAscending] = useState(true);
  const [deletingTrainingId, setDeletingTrainingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const visibleTrainings = useMemo(() => {
    const words = search
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    return [...trainings]
      .filter((training) => {
        const searchableText = [
          training.id,
          training.date,
          formatTrainingDate(training.date),
          training.activity,
          training.duration,
          training.customer.firstname,
          training.customer.lastname,
        ]
          .join(' ')
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return words.every((word) => searchableText.includes(word));
      })
      .sort((first, second) => {
        let comparison: number;

        switch (sortKey) {
          case 'date':
            comparison = new Date(first.date).getTime() - new Date(second.date).getTime();
            break;
          case 'activity':
            comparison = first.activity.localeCompare(second.activity, undefined, {
              numeric: true,
              sensitivity: 'base',
            });
            break;
          case 'duration':
            comparison = first.duration - second.duration;
            break;
          case 'customer':
            comparison = `${first.customer.firstname} ${first.customer.lastname}`.localeCompare(
              `${second.customer.firstname} ${second.customer.lastname}`,
              undefined,
              { numeric: true, sensitivity: 'base' },
            );
            break;
          default:
            comparison = first.id - second.id;
        }

        return ascending ? comparison : -comparison;
      });
  }, [trainings, search, sortKey, ascending]);

  function handleSort(key: TrainingSortKey) {
    if (sortKey === key) {
      setAscending((current) => !current);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  }

  function sortHeading(label: string, key: TrainingSortKey) {
    const active = sortKey === key;

    return (
      <th aria-sort={active ? (ascending ? 'ascending' : 'descending') : 'none'}>
        <button type="button" onClick={() => handleSort(key)}>
          {label} {active ? (ascending ? '↑' : '↓') : '↕'}
        </button>
      </th>
    );
  }

  async function handleDeleteTraining(training: Training) {
    const customerName = `${training.customer.firstname} ${training.customer.lastname}`;
    const confirmed = window.confirm(
      `Delete ${training.activity} on ${formatTrainingDate(training.date)} for ${customerName}? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingTrainingId(training.id);
    setDeleteError('');
    try {
      await onDeleteTraining(training.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete training.');
    } finally {
      setDeletingTrainingId(null);
    }
  }

  return (
    <section>
      <h1>Trainings</h1>
      {deleteError && <p role="alert">{deleteError}</p>}
      <label>
        Search trainings
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by activity, customer, date..."
        />
      </label>
      <table>
        <thead>
          <tr>
            {sortHeading('ID', 'id')}
            {sortHeading('Date', 'date')}
            {sortHeading('Activity', 'activity')}
            {sortHeading('Duration', 'duration')}
            {sortHeading('Customer', 'customer')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleTrainings.map((training) => (
            <tr key={training.id}>
              <td>{training.id}</td>
              <td>{formatTrainingDate(training.date)}</td>
              <td>{training.activity}</td>
              <td>{training.duration} min</td>
              <td>
                {training.customer.firstname} {training.customer.lastname}
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => void handleDeleteTraining(training)}
                  disabled={deletingTrainingId !== null}
                  aria-label={`Delete ${training.activity} for ${training.customer.firstname} ${training.customer.lastname}`}
                >
                  {deletingTrainingId === training.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
          {visibleTrainings.length === 0 && (
            <tr>
              <td colSpan={6}>No trainings match your search.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default TrainingList;