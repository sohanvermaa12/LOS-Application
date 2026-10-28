'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Clock, Check, AlertCircle } from 'lucide-react';
import { getMaxDateFor18YearsOld, calculateAge, isAtLeast18YearsOld } from '../utils/validation';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Convert ISO YYYY-MM-DD to DD/MM/YYYY
function isoToDisplay(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return iso;
}

// Convert DD/MM/YYYY to ISO YYYY-MM-DD
function displayToIso(display) {
  if (!display) return '';
  const parts = String(display).split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return '';
}

export default function DobPicker({
  id = 'field-dateOfBirth',
  name = 'dateOfBirth',
  value = '',
  onChange,
  onBlur,
  hasError = false,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic 18-year cutoff based strictly on TODAY's current date
  // Adapts automatically to future years/dates with zero code changes needed
  const today = useMemo(() => new Date(), []);
  const cutoffDateObj = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(today.getFullYear() - 18);
    return d;
  }, [today]);

  const cutoffYear = cutoffDateObj.getFullYear();
  const cutoffMonth = cutoffDateObj.getMonth(); // 0-indexed (e.g. 9 for October)
  const cutoffDay = cutoffDateObj.getDate();

  const cutoffIsoString = useMemo(() => getMaxDateFor18YearsOld(), []);
  const cutoffFormatted = useMemo(() => isoToDisplay(cutoffIsoString), [cutoffIsoString]);

  // Calendar view state (which year and month the calendar popover is currently showing)
  // DEFAULTS DIRECTLY to the 18-year cutoff year and month (e.g. October 2008) - NEVER 2026!
  const [viewYear, setViewYear] = useState(cutoffYear);
  const [viewMonth, setViewMonth] = useState(cutoffMonth);

  // Text input display state
  const [textInput, setTextInput] = useState(() => isoToDisplay(value));

  // Sync text input whenever value changes externally
  useEffect(() => {
    setTextInput(isoToDisplay(value));
  }, [value]);

  // When value changes or calendar opens, adjust view year & month
  useEffect(() => {
    if (value) {
      const parts = String(value).split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m) && y <= cutoffYear) {
          setViewYear(y);
          setViewMonth(m);
          return;
        }
      }
    }
    // If no value or value is in future, default calendar view to 18-year cutoff (e.g. October 2008), NEVER 2026
    setViewYear(cutoffYear);
    setViewMonth(cutoffMonth);
  }, [value, cutoffYear, cutoffMonth]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isOpen) {
          setIsOpen(false);
          if (onBlur) {
            onBlur({ target: { name, value } });
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur, name, value]);

  // Available selectable years: strictly from (cutoffYear - 82) up to cutoffYear (e.g. 1926 to 2008).
  // Years AFTER cutoffYear (2009-2026) DO NOT EXIST in the calendar dropdown!
  const availableYears = useMemo(() => {
    const years = [];
    const minYear = cutoffYear - 82;
    for (let y = cutoffYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [cutoffYear]);

  // Available selectable months for the currently selected viewYear:
  // If viewing the cutoffYear (e.g. 2008), ONLY months up to cutoffMonth (e.g. January to October) are shown!
  // Future months (November, December 2008) DO NOT EXIST because anyone born in them is under 18!
  const availableMonths = useMemo(() => {
    if (viewYear === cutoffYear) {
      return MONTH_NAMES.slice(0, cutoffMonth + 1).map((mName, idx) => ({
        index: idx,
        name: mName,
        disabled: false,
      }));
    }
    return MONTH_NAMES.map((mName, idx) => ({
      index: idx,
      name: mName,
      disabled: false,
    }));
  }, [viewYear, cutoffYear, cutoffMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => Math.max(prev - 1, cutoffYear - 82));
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    // Cannot navigate past cutoffMonth in cutoffYear
    if (viewYear === cutoffYear && viewMonth >= cutoffMonth) {
      return;
    }
    if (viewMonth === 11) {
      if (viewYear + 1 <= cutoffYear) {
        setViewMonth(0);
        setViewYear((prev) => prev + 1);
      }
    } else {
      if (viewYear === cutoffYear && viewMonth + 1 > cutoffMonth) {
        return;
      }
      setViewMonth((prev) => prev + 1);
    }
  };

  const isNextMonthDisabled = viewYear === cutoffYear && viewMonth >= cutoffMonth;

  // Build the days grid for the current viewMonth & viewYear
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];

    // Empty lead slots before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false, disabled: true });
    }

    // Days in current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      let isEligible = true;
      let isCutoffDay = false;

      // In the cutoff year (e.g. 2008) and cutoff month (e.g. October):
      // ONLY dates up to cutoffDay (e.g. 9th) are eligible!
      // Any date after cutoffDay (10th onwards) is strictly disabled (under 18 years old).
      if (viewYear === cutoffYear) {
        if (viewMonth > cutoffMonth) {
          isEligible = false;
        } else if (viewMonth === cutoffMonth) {
          if (day > cutoffDay) {
            isEligible = false;
          } else if (day === cutoffDay) {
            isCutoffDay = true;
          }
        }
      }

      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === iso;

      days.push({
        day,
        iso,
        isCurrentMonth: true,
        disabled: !isEligible,
        isCutoffDay,
        isSelected,
      });
    }

    return days;
  }, [viewYear, viewMonth, cutoffYear, cutoffMonth, cutoffDay, value]);

  // Select a day from calendar
  const handleSelectDay = (dayObj) => {
    if (dayObj.disabled || !dayObj.iso) return;

    if (onChange) {
      onChange({
        target: {
          name,
          value: dayObj.iso,
        },
      });
    }
    setTextInput(isoToDisplay(dayObj.iso));
    setIsOpen(false);
  };

  // One-click select exact 18-year cutoff date (e.g. 09/10/2008)
  const handleSelectCutoff = () => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: cutoffIsoString,
        },
      });
    }
    setTextInput(cutoffFormatted);
    setViewYear(cutoffYear);
    setViewMonth(cutoffMonth);
    setIsOpen(false);
  };

  // Clear date
  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        target: {
          name,
          value: '',
        },
      });
    }
    setTextInput('');
  };

  // Handle manual typing in text input (supports typing DD/MM/YYYY with auto-slashes)
  const handleTextChange = (e) => {
    const raw = e.target.value;
    // Allow digits and slashes
    let cleaned = raw.replace(/[^\d/]/g, '');

    // Format as DD/MM/YYYY if typing pure digits
    const digitsOnly = cleaned.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.slice(0, 2);
      if (digitsOnly.length >= 3) {
        formatted += '/' + digitsOnly.slice(2, 4);
      }
      if (digitsOnly.length >= 5) {
        formatted += '/' + digitsOnly.slice(4, 8);
      }
    } else {
      formatted = cleaned;
    }

    setTextInput(formatted);

    // If complete 10-char date DD/MM/YYYY, validate and sync to form
    if (formatted.length === 10) {
      const iso = displayToIso(formatted);
      if (iso) {
        const parts = iso.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);

        const checkDate = new Date(y, m, d);
        if (
          !isNaN(checkDate.getTime()) &&
          checkDate.getFullYear() === y &&
          checkDate.getMonth() === m &&
          checkDate.getDate() === d
        ) {
          if (onChange) {
            onChange({ target: { name, value: iso } });
          }
          if (y <= cutoffYear) {
            setViewYear(y);
            setViewMonth(m);
          }
          return;
        }
      }
    }

    // If cleared
    if (formatted === '') {
      if (onChange) {
        onChange({ target: { name, value: '' } });
      }
    }
  };

  // Age badge info
  const age = useMemo(() => {
    if (!value) return null;
    return calculateAge(value);
  }, [value]);

  const isEligible = useMemo(() => {
    if (!value) return true;
    return isAtLeast18YearsOld(value);
  }, [value]);

  return (
    <div className="dob-picker-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input container with calendar icon & age indicator */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={textInput}
          onChange={handleTextChange}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onClick={() => {
            if (!disabled) setIsOpen(true);
          }}
          placeholder="DD/MM/YYYY (e.g. 09/10/2008)"
          maxLength={10}
          disabled={disabled}
          className={`form-input ${hasError ? 'has-error' : ''}`}
          style={{
            width: '100%',
            paddingRight: value ? '140px' : '70px',
            fontSize: '12px',
            cursor: disabled ? 'not-allowed' : 'text',
            backgroundColor: disabled ? '#f4f7f7' : '#ffffff',
            fontWeight: 500,
          }}
        />

        {/* Status badges & action icons inside input */}
        <div
          style={{
            position: 'absolute',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
          }}
        >
          {/* Age indicator tag */}
          {value && age !== null && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: isEligible ? '#e2f4f2' : '#fee2e2',
                color: isEligible ? '#12615e' : '#b91c1c',
                border: `1px solid ${isEligible ? '#b5e3de' : '#fecaca'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {age} yrs
            </span>
          )}

          {/* Clear button */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#8b9a9c',
                display: 'grid',
                placeItems: 'center',
                padding: '2px',
              }}
              title="Clear date"
            >
              <X size={14} />
            </button>
          )}

          {/* Calendar trigger toggle */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) setIsOpen((prev) => !prev);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: '#167c78',
              display: 'grid',
              placeItems: 'center',
              padding: '2px',
            }}
            title="Open Birthdate Calendar"
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Hidden standard input for reliable form submission */}
      <input type="hidden" name={name} value={value} />

      {/* =======================================================
          Custom 18-Year Minimum LOS Calendar Popover
          - Opens directly at cutoff year (e.g. 2008) and month (October)
          - NEVER opens or shows 2026
          - In 2008, only dates up to today (e.g. 09/10/2008) are selectable
          - Dates after today in 2008 and years 2009-2026 DO NOT EXIST
      ======================================================= */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 1000,
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #d2dedc',
            boxShadow: '0 14px 38px rgba(17, 43, 49, 0.18)',
            padding: '14px',
            fontFamily: 'inherit',
          }}
        >
          {/* Calendar Header: Month & Year Selectors */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid #dbe5e4',
                background: '#f8faf9',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: '#26545b',
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Month Select: When in cutoffYear (2008), ONLY lists months up to cutoffMonth (Oct) */}
              <select
                value={viewMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  setViewMonth(m);
                }}
                style={{
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #dbe5e4',
                  background: '#f8faf9',
                  color: '#173e46',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '0 6px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {availableMonths.map((m) => (
                  <option key={m.index} value={m.index}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* Year Select: ONLY contains years <= cutoffYear (e.g. 1926 to 2008). 2009-2026 DO NOT EXIST */}
              <select
                value={viewYear}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10);
                  setViewYear(y);
                  // Clamp month if switching to cutoffYear and viewing past cutoffMonth
                  if (y === cutoffYear && viewMonth > cutoffMonth) {
                    setViewMonth(cutoffMonth);
                  }
                }}
                style={{
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #dbe5e4',
                  background: '#f8faf9',
                  color: '#173e46',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '0 6px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y} {y === cutoffYear ? '(18 Yrs Cutoff)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid #dbe5e4',
                background: isNextMonthDisabled ? '#f1f4f4' : '#f8faf9',
                display: 'grid',
                placeItems: 'center',
                cursor: isNextMonthDisabled ? 'not-allowed' : 'pointer',
                color: isNextMonthDisabled ? '#b4c2c2' : '#26545b',
                opacity: isNextMonthDisabled ? 0.45 : 1,
              }}
              title={isNextMonthDisabled ? 'Next month unavailable (under 18 years old)' : 'Next Month'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dynamic 18-Year Cutoff Banner with 1-Click "Set Today" Button */}
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#edf6f5',
              border: '1px solid #d1e8e5',
              fontSize: '11px',
              color: '#146b67',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              <strong>18 Yrs Cutoff:</strong> {cutoffFormatted}
            </span>
            <button
              type="button"
              onClick={handleSelectCutoff}
              style={{
                border: 'none',
                background: '#167c78',
                color: '#fff',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`Set birthdate to ${cutoffFormatted} (exactly 18 years old today)`}
            >
              <Check size={11} />
              Set Today
            </button>
          </div>

          {/* Weekday Names Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            {WEEKDAYS.map((w, idx) => (
              <span
                key={w}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: idx === 0 || idx === 6 ? '#9aa8aa' : '#556d70',
                  padding: '3px 0',
                }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {calendarDays.map((d, index) => {
              if (!d.day) {
                return <div key={`empty-${index}`} style={{ height: '32px' }} />;
              }

              const isCutoff = d.isCutoffDay;
              const isSelected = d.isSelected;
              const isDisabled = d.disabled;

              return (
                <button
                  type="button"
                  key={d.iso}
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(d)}
                  style={{
                    height: '32px',
                    borderRadius: '6px',
                    border: isSelected
                      ? '1px solid #167c78'
                      : isCutoff
                      ? '1px solid #0f766e'
                      : '1px solid transparent',
                    background: isSelected
                      ? '#167c78'
                      : isCutoff
                      ? '#ccfbf1'
                      : '#ffffff',
                    color: isSelected
                      ? '#ffffff'
                      : isDisabled
                      ? '#c4d1d1'
                      : isCutoff
                      ? '#0f766e'
                      : '#1e3f45',
                    fontSize: '12px',
                    fontWeight: isSelected || isCutoff ? 700 : 500,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  title={
                    isDisabled
                      ? `Ineligible (under 18 years old)`
                      : isCutoff
                      ? `Turned 18 years old today (${cutoffFormatted})`
                      : `Born ${d.day} ${MONTH_NAMES[viewMonth]} ${viewYear}`
                  }
                >
                  {d.day}
                  {isCutoff && !isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#0f766e',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Popover Footer Info */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid #edf2f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#708386',
            }}
          >
            <span>Eligible age: 18 – 100 yrs</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onBlur) {
                  onBlur({ target: { name, value } });
                }
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#167c78',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

