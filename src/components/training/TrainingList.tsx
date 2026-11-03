import type { Training } from '../../types/TrainingTypes';

interface TrainingListProps {
  trainings: Training[];
}

function TrainingList({ trainings }: TrainingListProps) {
  return (
    <section>
      <h1>Trainings</h1>
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
  );
}

export default TrainingList;