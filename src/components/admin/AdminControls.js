import React from 'react';

export function AdminToggle({ checked, onChange, label, ariaLabel, disabled, id }) {
  return (
    <label className="admin-toggle">
      <input
        id={id}
        className="admin-toggle-input"
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        aria-label={label ? undefined : ariaLabel}
        onChange={onChange}
      />
      <span className="admin-toggle-track" aria-hidden="true">
        <span className="admin-toggle-thumb" />
      </span>
      {label ? <span className="admin-toggle-label">{label}</span> : null}
    </label>
  );
}

function Icon({ name }) {
  if (name === 'up') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'down') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1A2 2 0 0 1 14.3 21H9.7a2 2 0 0 1-2-1.9L7 7m3 4v6m4-6v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminIconButton({ icon, label, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`admin-icon-btn${icon === 'remove' ? ' admin-icon-btn-danger' : ''}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}
