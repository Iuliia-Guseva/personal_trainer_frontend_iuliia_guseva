import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Customer } from '../../types/CustomerTypes';
import type { Training } from '../../types/TrainingTypes';
import './StatisticsPage.css';

interface StatisticsPageProps {
  customers: Customer[];
  trainings: Training[];
}

interface ActivityStatistic {
  activity: string;
  minutes: number;
  trainingCount: number;
}

interface WeekStatistic {
  week: string;
  count: number;
  dateRange: string;
}

const chartColors = ['#4f91c4', '#61b79d', '#8880c8', '#658eb6', '#4f8999', '#d2a35f'];

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

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
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

  const activityStats = useMemo(() => {
    const activities = new Map<string, ActivityStatistic>();

    periodTrainings.forEach((training) => {
      const current = activities.get(training.activity) ?? {
        activity: training.activity,
        minutes: 0,
        trainingCount: 0,
      };
      current.minutes += training.duration;
      current.trainingCount += 1;
      activities.set(training.activity, current);
    });

    return [...activities.values()].sort((first, second) => second.minutes - first.minutes);
  }, [periodTrainings]);

  const weeklyStats = useMemo(() => {
    const dayCount =
      (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) /
        86_400_000 +
      1;
    const weeks: WeekStatistic[] = Array.from(
      { length: Math.ceil(dayCount / 7) },
      (_, index) => {
        const weekStart = addDays(startDate, index * 7);
        const weekEnd = addDays(startDate, Math.min(index * 7 + 6, dayCount - 1));
        return {
          week: `W${index + 1}`,
          count: 0,
          dateRange: `${formatInputDate(weekStart)} - ${formatInputDate(weekEnd)}`,
        };
      },
    );

    periodTrainings.forEach((training) => {
      const dayOffset =
        (Date.parse(`${getTrainingDateKey(training.date)}T00:00:00Z`) -
          Date.parse(`${startDate}T00:00:00Z`)) /
        86_400_000;
      const week = weeks[Math.floor(dayOffset / 7)];
      if (week) {
        week.count += 1;
      }
    });

    return weeks;
  }, [endDate, periodTrainings, startDate]);

  const chartTotalDuration = activityStats.reduce((total, item) => total + item.minutes, 0);

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

      <div className="statistics-charts">
        <article className="statistics-chart-card">
          <h2>Training by Activity Type</h2>
          {activityStats.length > 0 ? (
            <div className="statistics-activity-chart">
              <div className="statistics-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityStats}
                      dataKey="minutes"
                      nameKey="activity"
                      innerRadius="58%"
                      outerRadius="88%"
                      paddingAngle={1}
                      stroke="none"
                    >
                      {activityStats.map((item, index) => (
                        <Cell
                          key={item.activity}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value).toLocaleString('en-US')} min`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="statistics-donut-center" aria-hidden="true">
                  <strong>{chartTotalDuration.toLocaleString('en-US')}</strong>
                  <span>minutes</span>
                </div>
              </div>
              <ul className="statistics-activity-legend">
                {activityStats.map((item, index) => {
                  const percentage =
                    chartTotalDuration > 0
                      ? Math.round((item.minutes / chartTotalDuration) * 100)
                      : 0;
                  return (
                    <li key={item.activity}>
                      <span
                        className="statistics-legend-swatch"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        aria-hidden="true"
                      />
                      <span className="statistics-legend-name">{item.activity}</span>
                      <span className="statistics-legend-value">
                        {item.minutes.toLocaleString('en-US')} min · {percentage}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="statistics-chart-empty">No trainings in this date range.</p>
          )}
        </article>

        <article className="statistics-chart-card">
          <h2>Trainings per Week</h2>
          {weeklyStats.some((week) => week.count > 0) ? (
            <div className="statistics-weekly-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyStats}
                  margin={{ top: 8, right: 4, bottom: 0, left: -18 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid vertical={false} stroke="#e8edf2" />
                  <XAxis
                    dataKey="week"
                    axisLine={{ stroke: '#dce4ed' }}
                    tickLine={false}
                    tick={{ fill: '#627186', fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#627186', fontSize: 11 }}
                    width={34}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value), 'Trainings']}
                    labelFormatter={(_, payload) => payload[0]?.payload.dateRange ?? ''}
                    cursor={{ fill: '#f3f6fa' }}
                  />
                  <Bar dataKey="count" fill="#75a9d2" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="statistics-chart-empty">No trainings in this date range.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default StatisticsPage;
