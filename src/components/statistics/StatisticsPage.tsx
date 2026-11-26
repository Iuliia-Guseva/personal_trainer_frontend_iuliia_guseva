import { useMemo, useState } from 'react';
import type { Customer } from '../../types/CustomerTypes';
import type { Training } from '../../types/TrainingTypes';
import './StatisticsPage.css';

interface StatisticsPageProps {
  customers: Customer[];
  trainings: Training[];
}

const trainingDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Helsinki',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function getLocalDateKey(date: Date): string {
  const parts = trainingDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Could not format statistics date.');
  }

  return `${year}-${month}-${day}`;
}

function getTrainingDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid training date: ${value}`);
  }
  return getLocalDateKey(date);
}

function formatInputDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

function StatisticsPage({ customers, trainings }: StatisticsPageProps) {
  const [today] = useState(() => getLocalDateKey(new Date()));
  const [startDate, setStartDate] = useState(() => `${today.slice(0, 7)}-01`);
  const [endDate, setEndDate] = useState(today);

  const periodTrainings = useMemo(
    () =>
      trainings.filter((training) => {
        const trainingDate = getTrainingDateKey(training.date);
        return trainingDate >= startDate && trainingDate <= endDate;
      }),
    [endDate, startDate, trainings],
  );
  const totalDuration = periodTrainings.reduce(
    (total, training) => total + training.duration,
    0,
  );

  return (
    <section className="statistics-page">
      <div className="statistics-heading">
        <div>
          <h1>Training Statistics</h1>
          <p>Overview of your clients’ training activities</p>
        </div>
        <div className="statistics-date-range">
          <label>
            <span className="visually-hidden">Start date</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => {
                if (event.target.value) {
                  setStartDate(event.target.value);
                }
              }}
            />
          </label>
          <span aria-hidden="true">–</span>
          <label>
            <span className="visually-hidden">End date</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(event) => {
                if (event.target.value) {
                  setEndDate(event.target.value);
                }
              }}
            />
          </label>
          <span className="statistics-date-summary" aria-hidden="true">
            {formatInputDate(startDate)} - {formatInputDate(endDate)}
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Zm10 8 2 2 3-3" />
          </svg>
        </div>
      </div>

      <div className="statistics-cards">
        <article className="statistics-card">
          <span className="statistics-card-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="15" r="7" />
              <path d="M10 38v-4c0-7 6-12 14-12s14 5 14 12v4M7 18c0-4 3-7 7-7m-5 18c-4 1-6 4-6 8m35-19c0-4-3-7-7-7m5 18c4 1 6 4 6 8" />
            </svg>
          </span>
          <div className="statistics-card-copy">
            <strong>{customers.length.toLocaleString('en-US')}</strong>
            <span>Total customers</span>
          </div>
        </article>

        <article className="statistics-card">
          <span className="statistics-card-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M8 20v8m5-13v18m22-13v8m5-13v18M13 24h22m-18-5h14v10H17z" />
            </svg>
          </span>
          <div className="statistics-card-copy">
            <strong>{periodTrainings.length.toLocaleString('en-US')}</strong>
            <span>Total trainings</span>
          </div>
        </article>

        <article className="statistics-card">
          <span className="statistics-card-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="18" />
              <path d="M24 13v12l8 5" />
            </svg>
          </span>
          <div className="statistics-card-copy">
            <strong>{totalDuration.toLocaleString('en-US')}</strong>
            <span>Total duration (min)</span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default StatisticsPage;
