import { useRef } from 'react';

function Navigation() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Navigation
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="navigation-title"
        style={{
          position: 'fixed',
          inset: '0 auto 0 0',
          width: 'min(280px, 85vw)',
          height: '100vh',
          maxHeight: 'none',
          margin: 0,
          border: 0,
        }}
      >
        <h2 id="navigation-title">Navigation</h2>
        <nav>
          <ul>
            <li>
              <a href="#/customers" onClick={() => dialogRef.current?.close()}>
                Customers
              </a>
            </li>
            <li>
              <a href="#/trainings" onClick={() => dialogRef.current?.close()}>
                Trainings
              </a>
            </li>
          </ul>
        </nav>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Close
        </button>
      </dialog>
    </>
  );
}

export default Navigation;
