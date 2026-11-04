import { useMemo, useState } from 'react';
import type { Training } from '../../types/TrainingTypes';

interface TrainingListProps {
  trainings: Training[];
}

type TrainingSortKey = 'id' | 'date' | 'activity' | 'duration' | 'customer';

function TrainingList({ trainings }: TrainingListProps) {
  const [sortKey, setSortKey] = useState<TrainingSortKey>('id');
  const [ascending, setAscending] = useState(true);

  const sortedTrainings = useMemo(
    () =>
      [...trainings].sort((first, second) => {
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
      }),
    [trainings, sortKey, ascending],
  );

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

  return (
    <section>
      <h1>Trainings</h1>
      <table>
        <thead>
          <tr>
            {sortHeading('ID', 'id')}
            {sortHeading('Date', 'date')}
            {sortHeading('Activity', 'activity')}
            {sortHeading('Duration', 'duration')}
            {sortHeading('Customer', 'customer')}
          </tr>
        </thead>
        <tbody>
          {sortedTrainings.map((training) => (
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
  );
}

export default TrainingList;