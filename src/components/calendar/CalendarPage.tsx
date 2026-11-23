import { useMemo, useState } from 'react';
import type { Training } from '../../types/TrainingTypes';
import './CalendarPage.css';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarPageProps {
  trainings: Training[];
}

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Helsinki',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const trainingTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Helsinki',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const calendarDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

const calendarTitleFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const monthTitleFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'long',
});

const weekdayShortFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
});

function getDateKey(date: Date): string {
  const parts = dateKeyFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Could not format calendar date.');
  }

  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function addDays(key: string, amount: number): string {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function getWeekStart(key: string): string {
  const dayOfWeek = dateFromKey(key).getUTCDay();
  return addDays(key, -((dayOfWeek + 6) % 7));
}

function getTrainingTime(training: Training): number {
  return new Date(training.date).getTime();
}

function formatTrainingTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid training date: ${value}`);
  }
  return trainingTimeFormatter.format(date);
}

function getCustomerName(training: Training): string {
  return `${training.customer.firstname} ${training.customer.lastname}`;
}

function getActivityColorIndex(activity: string): number {
  const hash = Array.from(activity.toLocaleLowerCase()).reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
  return hash % 4;
}

function CalendarEvent({ training }: { training: Training }) {
  return (
    <div
      className={`calendar-event calendar-event-color-${getActivityColorIndex(training.activity)}`}
      title={`${training.activity} — ${getCustomerName(training)}`}
    >
      <span className="calendar-event-time">{formatTrainingTime(training.date)}</span>
      <span className="calendar-event-name">{training.activity}</span>
      <span className="calendar-event-customer">{getCustomerName(training)}</span>
    </div>
  );
}

function CalendarPage({ trainings }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
  const [todayDate, setTodayDate] = useState(() => getDateKey(new Date()));
  const [view, setView] = useState<CalendarView>('month');

  const trainingsByDate = useMemo(() => {
    const grouped = new Map<string, Training[]>();
    trainings.forEach((training) => {
      const date = new Date(training.date);
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid training date: ${training.date}`);
      }
      const key = getDateKey(date);
      const dayTrainings = grouped.get(key) ?? [];
      dayTrainings.push(training);
      grouped.set(key, dayTrainings);
    });

    grouped.forEach((dayTrainings) =>
      dayTrainings.sort((first, second) => getTrainingTime(first) - getTrainingTime(second)),
    );
    return grouped;
  }, [trainings]);

  const calendarDays = useMemo(() => {
    if (view === 'day') {
      return [selectedDate];
    }

    if (view === 'week') {
      const weekStart = getWeekStart(selectedDate);
      return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    }

    const monthStart = dateFromKey(selectedDate);
    monthStart.setUTCDate(1);
    const firstMonthDay = monthStart.toISOString().slice(0, 10);
    const gridStart = getWeekStart(firstMonthDay);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [selectedDate, view]);

  const title = useMemo(() => {
    if (view === 'month') {
      return monthTitleFormatter.format(dateFromKey(selectedDate));
    }
    if (view === 'day') {
      return `${weekdayFormatter.format(dateFromKey(selectedDate))}, ${calendarTitleFormatter.format(dateFromKey(selectedDate))}`;
    }
    const firstDate = dateFromKey(calendarDays[0]);
    const lastDate = dateFromKey(calendarDays[calendarDays.length - 1]);
    return `${calendarDateFormatter.format(firstDate)} – ${calendarTitleFormatter.format(lastDate)}`;
  }, [calendarDays, selectedDate, view]);

  function moveCalendar(amount: number) {
    if (view === 'month') {
      const date = dateFromKey(selectedDate);
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() + amount);
      setSelectedDate(date.toISOString().slice(0, 10));
      return;
    }

    setSelectedDate(addDays(selectedDate, amount * (view === 'week' ? 7 : 1)));
  }

  function renderDay(date: string, isOutsideMonth = false) {
    const dayTrainings = trainingsByDate.get(date) ?? [];
    const dateObject = dateFromKey(date);
    const isToday = date === todayDate;
    const isSelected = date === selectedDate;

    return (
      <div
        className={[
          'calendar-day',
          isOutsideMonth ? 'calendar-day-outside' : '',
          isToday ? 'calendar-day-today' : '',
          isSelected ? 'calendar-day-selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        key={date}
      >
        <button
          type="button"
          className="calendar-day-number"
          onClick={() => {
            setSelectedDate(date);
            if (view === 'month') {
              setView('day');
            }
          }}
          aria-label={`Show trainings for ${calendarTitleFormatter.format(dateObject)}`}
        >
          {dateObject.getUTCDate()}
        </button>
        <div className="calendar-day-events">
          {dayTrainings.map((training) => (
            <CalendarEvent key={training.id} training={training} />
          ))}
          {dayTrainings.length === 0 && view !== 'month' && (
            <span className="calendar-no-events">No trainings</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-heading">
          <h1>Training Calendar</h1>
          <p>View and manage trainings</p>
        </div>
        <div className="calendar-navigation">
          <div className="calendar-date-controls">
            <button
              type="button"
              onClick={() => moveCalendar(-1)}
              aria-label="Previous period"
            >
              ‹
            </button>
            <button type="button" onClick={() => moveCalendar(1)} aria-label="Next period">
              ›
            </button>
            <button
              type="button"
              className="calendar-today-button"
              onClick={() => {
                const today = getDateKey(new Date());
                setTodayDate(today);
                setSelectedDate(today);
              }}
            >
              Today
            </button>
          </div>
          <h2>{title}</h2>
          <div className="calendar-view-switch" role="group" aria-label="Calendar view">
            {(['month', 'week', 'day'] as const).map((calendarView) => (
              <button
                type="button"
                key={calendarView}
                className={view === calendarView ? 'calendar-view-active' : ''}
                aria-pressed={view === calendarView}
                onClick={() => setView(calendarView)}
              >
                {calendarView[0].toUpperCase() + calendarView.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className={`calendar-grid calendar-grid-${view}`}>
          {view !== 'day' &&
            calendarDays.slice(0, 7).map((date) => {
              const dateObject = dateFromKey(date);
              const weekday = view === 'month' ? weekdayShortFormatter : weekdayFormatter;
              return (
                <div className="calendar-weekday" key={`weekday-${date}`}>
                  {weekday.format(dateObject)}
                  {view === 'week' && (
                    <span>{calendarDateFormatter.format(dateObject)}</span>
                  )}
                </div>
              );
            })}
          {view === 'month'
            ? calendarDays.map((date) => {
                const isOutsideMonth =
                  dateFromKey(date).getUTCMonth() !== dateFromKey(selectedDate).getUTCMonth();
                return renderDay(date, isOutsideMonth);
              })
            : calendarDays.map((date) => (
                <div className="calendar-column" key={date}>
                  {view === 'day' && (
                    <div className="calendar-day-heading">
                      <span>{weekdayFormatter.format(dateFromKey(date))}</span>
                      <strong>{calendarTitleFormatter.format(dateFromKey(date))}</strong>
                    </div>
                  )}
                  {renderDay(date)}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default CalendarPage;
