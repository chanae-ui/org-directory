import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDown, IconCheck, IconX } from './icons.jsx';

export default function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  function openPanel() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function handleOutside(e) {
      if (
        (!triggerRef.current || !triggerRef.current.contains(e.target)) &&
        (!panelRef.current || !panelRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    // גלילה של הרשימה תזיז את הכפתור מתחת לפאנל (שממוקם קבוע ביחס למסך) - פשוט סוגרים.
    function handleScroll() {
      setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  function select(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <span className="dropdown-wrap">
      <button
        ref={triggerRef}
        type="button"
        className={`chip dropdown-trigger ${value ? 'active' : ''}`}
        onClick={() => (open ? setOpen(false) : openPanel())}
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

      {open &&
        position &&
        createPortal(
          <div className="dropdown-panel" ref={panelRef} style={{ top: position.top, right: position.right }}>
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
          </div>,
          document.body
        )}
    </span>
  );
}
