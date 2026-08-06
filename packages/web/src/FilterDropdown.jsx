import { useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconCheck, IconX } from './icons.jsx';

export default function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function select(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <span className="dropdown-wrap" ref={rootRef}>
      <button
        type="button"
        className={`chip dropdown-trigger ${value ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="dropdown-trigger-label">{value || label}</span>
        <IconChevronDown className="dropdown-chevron" />
      </button>
      {value ? (
        <button className="chip-clear" onClick={() => onChange('')} aria-label={`נקה ${label}`}>
          <IconX />
        </button>
      ) : null}

      {open && (
        <div className="dropdown-panel">
          <button
            className={`dropdown-option ${!value ? 'selected' : ''}`}
            onClick={() => select('')}
          >
            {!value && <IconCheck className="dropdown-option-check" />}
            <span>{label}</span>
          </button>
          {options.map((o) => (
            <button
              key={o}
              className={`dropdown-option ${o === value ? 'selected' : ''}`}
              onClick={() => select(o)}
            >
              {o === value && <IconCheck className="dropdown-option-check" />}
              <span>{o}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
