import { useEffect, useState } from 'react';
import './Navigation.css';

function Navigation() {
  const [page, setPage] = useState(() => window.location.hash.slice(2) || 'customers');

  useEffect(() => {
    function syncPage() {
      setPage(window.location.hash.slice(2) || 'customers');
    }

    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  return (
    <aside className="navigation-sidebar">
      <div className="navigation-brand">
        <span className="navigation-brand-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path d="M7 12v8M3.5 13.5v5M25 12v8M28.5 13.5v5M7 16h18M11 12l1.5-3h7l1.5 3M11 20l1.5 3h7l1.5-3" />
          </svg>
        </span>
        <h1 id="navigation-title">Personal Trainer</h1>
      </div>
      <nav className="navigation-links" aria-label="Main navigation">
        <a
          href="#/customers"
          className={page === 'customers' ? 'navigation-link active' : 'navigation-link'}
          aria-current={page === 'customers' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5M5 9v12h14V9M9 21v-7h6v7" />
          </svg>
          <span>Customers</span>
        </a>
        <a
          href="#/trainings"
          className={page === 'trainings' ? 'navigation-link active' : 'navigation-link'}
          aria-current={page === 'trainings' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7h10M7 17h10M5 4h14v16H5zM9 4V2m6 2V2M9 12h6" />
          </svg>
          <span>Trainings</span>
        </a>
        <a
          href="#/calendar"
          className={page === 'calendar' ? 'navigation-link active' : 'navigation-link'}
          aria-current={page === 'calendar' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14a2 2 0 0 1 2 2v13H3V6a2 2 0 0 1 2-2Zm3-2v4m8-4v4M3 9h18m-14 4h3m2 0h3m-8 4h3m2 0h3" />
          </svg>
          <span>Calendar</span>
        </a>
        <a
          href="#/statistics"
          className={page === 'statistics' ? 'navigation-link active' : 'navigation-link'}
          aria-current={page === 'statistics' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19V5m0 14h17M8 16v-5m5 5V7m5 9v-8" />
          </svg>
          <span>Statistics</span>
        </a>
      </nav>
    </aside>
  );
}

export default Navigation;
