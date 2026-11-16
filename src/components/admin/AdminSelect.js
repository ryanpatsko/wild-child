'use client';

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function readPlace(button, menu) {
  const rect = button.getBoundingClientRect();
  const gap = 6;
  const contentHeight = menu?.scrollHeight ?? 240;
  const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
  const spaceAbove = rect.top - gap - 8;
  const openUp = spaceBelow < Math.min(contentHeight, 200) && spaceAbove > spaceBelow;
  const maxHeight = Math.max(120, Math.min(280, openUp ? spaceAbove : spaceBelow));
  const height = Math.min(contentHeight, maxHeight);
  const width = Math.min(Math.max(rect.width, 200), window.innerWidth - 16);
  let left = rect.left;
  if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width);
  const top = openUp ? rect.top - gap - height : rect.bottom + gap;
  return { top, left, width, maxHeight };
}

/**
 * Dark-theme listbox used everywhere the admin used a native select.
 * `onChange` receives `{ target: { value } }` so existing handlers stay the same.
 */
export default function AdminSelect({ id, value, onChange, options, ariaLabel, className = '', disabled = false }) {
  const autoId = useId();
  const buttonId = id || autoId;
  const listId = `${buttonId}-list`;
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState(null);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const isPlaceholder = value === '' || value == null;

  function closeMenu() {
    setOpen(false);
  }

  function openMenu() {
    if (disabled || options.length === 0) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setPlace(buttonRef.current ? readPlace(buttonRef.current, null) : null);
    setOpen(true);
  }

  function commit(next) {
    onChange({ target: { value: next } });
    closeMenu();
    buttonRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    function update() {
      const button = buttonRef.current;
      if (!button) return;
      const next = readPlace(button, menuRef.current);
      setPlace((prev) => {
        if (
          prev &&
          prev.top === next.top &&
          prev.left === next.left &&
          prev.width === next.width &&
          prev.maxHeight === next.maxHeight
        ) {
          return prev;
        }
        return next;
      });
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(ev) {
      if (rootRef.current?.contains(ev.target) || menuRef.current?.contains(ev.target)) return;
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function onButtonKey(ev) {
    if (disabled) return;
    if (!open) {
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp' || ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openMenu();
      }
      return;
    }
    if (ev.key === 'Escape') {
      ev.preventDefault();
      closeMenu();
      return;
    }
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
      return;
    }
    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }
    if (ev.key === 'Home') {
      ev.preventDefault();
      setActive(0);
      return;
    }
    if (ev.key === 'End') {
      ev.preventDefault();
      setActive(Math.max(0, options.length - 1));
      return;
    }
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      const opt = options[active];
      if (opt) commit(opt.value);
      return;
    }
    if (ev.key === 'Tab') {
      closeMenu();
      return;
    }
    if (ev.key.length === 1 && /\S/.test(ev.key)) {
      const q = ev.key.toLowerCase();
      const start = (active + 1) % options.length;
      for (let n = 0; n < options.length; n += 1) {
        const i = (start + n) % options.length;
        if (String(options[i].label).toLowerCase().startsWith(q)) {
          setActive(i);
          break;
        }
      }
    }
  }

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <ul
            id={listId}
            ref={menuRef}
            className="admin-select-menu"
            role="listbox"
            style={
              place
                ? { top: place.top, left: place.left, width: place.width, maxHeight: place.maxHeight }
                : { visibility: 'hidden' }
            }
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={`${String(opt.value)}-${i}`}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  data-active={i === active ? 'true' : undefined}
                  className="admin-select-option"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => commit(opt.value)}
                >
                  <span>{opt.label}</span>
                  {isSelected ? (
                    <span className="admin-select-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className={`admin-select ${className}`.trim()} ref={rootRef}>
      <button
        id={buttonId}
        ref={buttonRef}
        type="button"
        className={`admin-select-trigger${isPlaceholder ? ' admin-select-placeholder' : ''}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-opt-${active}` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onButtonKey}
      >
        <span className="admin-select-value">{selected?.label ?? ''}</span>
        <svg className={`admin-select-chevron${open ? ' admin-select-chevron-open' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.5 6.25 8 10.75l4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {menu}
    </div>
  );
}
