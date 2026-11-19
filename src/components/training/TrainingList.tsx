import { useMemo, useState } from 'react';
import type { Customer } from '../../types/CustomerTypes';
import type { Training } from '../../types/TrainingTypes';
import AddTraining from './AddTraining';

interface TrainingListProps {
  trainings: Training[];
  customers: Customer[];
  onAddTraining: (
    details: Omit<Training, 'id' | 'customer'>,
    customerId: number,
  ) => Promise<void>;
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

function TrainingList({
  trainings,
  customers,
  onAddTraining,
  onDeleteTraining,
}: TrainingListProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<TrainingSortKey>('id');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [deletingTrainingId, setDeletingTrainingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [addingTraining, setAddingTraining] = useState(false);

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

  const pageCount = Math.ceil(visibleTrainings.length / pageSize);
  const currentPage = Math.min(page, pageCount || 1);
  const pageTrainings = visibleTrainings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstTrainingNumber =
    visibleTrainings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastTrainingNumber = Math.min(currentPage * pageSize, visibleTrainings.length);

  function handleSort(key: TrainingSortKey) {
    setPage(1);
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
    <section className="listing-page">
      <div className="listing-toolbar">
        <div className="listing-heading">
          <h1>Trainings</h1>
          <p>Manage your training sessions</p>
        </div>
        <div className="listing-controls">
          <label className="listing-search">
            <span className="visually-hidden">Search trainings</span>
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
              placeholder="Search trainings..."
            />
          </label>
          <div className="listing-actions">
            {addingTraining ? (
              <button type="button" onClick={() => setAddingTraining(false)}>
                Cancel
              </button>
            ) : (
              <button type="button" onClick={() => setAddingTraining(true)}>
                <span aria-hidden="true">+</span> Add training
              </button>
            )}
          </div>
        </div>
      </div>
      {deleteError && <p role="alert">{deleteError}</p>}
      {addingTraining ? (
        <AddTraining
          customers={customers}
          onAdd={onAddTraining}
          onCancel={() => setAddingTraining(false)}
          onAdded={() => setAddingTraining(false)}
        />
      ) : null}
      <div className="listing-table-container">
        <table>
          <thead>
            <tr>
              {sortHeading('#', 'id')}
              {sortHeading('Date', 'date')}
              {sortHeading('Activity', 'activity')}
              {sortHeading('Duration', 'duration')}
              {sortHeading('Customer', 'customer')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageTrainings.map((training) => (
              <tr key={training.id}>
                <td>{training.id}</td>
                <td>{formatTrainingDate(training.date)}</td>
                <td>{training.activity}</td>
                <td>{training.duration} min</td>
                <td>
                  {training.customer.firstname} {training.customer.lastname}
                </td>
                <td className="listing-row-actions">
                  <button
                    type="button"
                    className="listing-delete"
                    onClick={() => void handleDeleteTraining(training)}
                    disabled={deletingTrainingId !== null}
                    aria-label={`Delete ${training.activity} for ${training.customer.firstname} ${training.customer.lastname}`}
                    title="Delete training"
                  >
                    {deletingTrainingId === training.id ? (
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
            {visibleTrainings.length === 0 && (
              <tr>
                <td colSpan={6}>No trainings match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="listing-pagination" aria-label="Training list pagination">
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
          {firstTrainingNumber}-{lastTrainingNumber} of {visibleTrainings.length}
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

export default TrainingList;