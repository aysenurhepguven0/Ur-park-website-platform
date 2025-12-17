import React, { useState, useEffect } from 'react';
import '../styles/AvailabilityCalendar.css';

interface TimeSlot {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityCalendarProps {
  parkingSpaceId: string;
  availabilities: TimeSlot[];
  onAvailabilityChange?: (availabilities: TimeSlot[]) => void;
  readOnly?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  parkingSpaceId,
  availabilities,
  onAvailabilityChange,
  readOnly = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availabilities);

  useEffect(() => {
    setTimeSlots(availabilities);
  }, [availabilities]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const formatDate = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAvailabilityForDate = (dateStr: string) => {
    return timeSlots.filter(slot => slot.date === dateStr);
  };

  const hasAvailability = (dateStr: string) => {
    const slots = getAvailabilityForDate(dateStr);
    return slots.some(slot => slot.isAvailable);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    if (readOnly) return;
    const dateStr = formatDate(day);
    setSelectedDate(dateStr);
  };

  const handleAddTimeSlot = (dateStr: string, startTime: string, endTime: string) => {
    const newSlot: TimeSlot = {
      date: dateStr,
      startTime,
      endTime,
      isAvailable: true
    };
    const updatedSlots = [...timeSlots, newSlot];
    setTimeSlots(updatedSlots);
    if (onAvailabilityChange) {
      onAvailabilityChange(updatedSlots);
    }
  };

  const handleRemoveTimeSlot = (index: number) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
    if (onAvailabilityChange) {
      onAvailabilityChange(updatedSlots);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isPastDate = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <button onClick={handlePreviousMonth} className="nav-button">
          &#8249;
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button onClick={handleNextMonth} className="nav-button">
          &#8250;
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="week-day">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const isAvailable = hasAvailability(dateStr);
          const isPast = isPastDate(day);
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={day}
              className={`calendar-day ${isAvailable ? 'available' : ''} ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''} ${readOnly ? 'readonly' : ''}`}
              onClick={() => !isPast && handleDateClick(day)}
            >
              <span className="day-number">{day}</span>
              {isAvailable && <div className="availability-indicator" />}
            </div>
          );
        })}
      </div>

      {selectedDate && !readOnly && (
        <TimeSlotEditor
          date={selectedDate}
          timeSlots={getAvailabilityForDate(selectedDate)}
          onAddSlot={handleAddTimeSlot}
          onRemoveSlot={(slot) => {
            const index = timeSlots.findIndex(s =>
              s.date === slot.date &&
              s.startTime === slot.startTime &&
              s.endTime === slot.endTime
            );
            if (index !== -1) handleRemoveTimeSlot(index);
          }}
        />
      )}

      {selectedDate && readOnly && (
        <TimeSlotDisplay
          date={selectedDate}
          timeSlots={getAvailabilityForDate(selectedDate)}
        />
      )}
    </div>
  );
};

interface TimeSlotEditorProps {
  date: string;
  timeSlots: TimeSlot[];
  onAddSlot: (date: string, startTime: string, endTime: string) => void;
  onRemoveSlot: (slot: TimeSlot) => void;
}

const TimeSlotEditor: React.FC<TimeSlotEditorProps> = ({
  date,
  timeSlots,
  onAddSlot,
  onRemoveSlot
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleAdd = () => {
    if (startTime && endTime && startTime < endTime) {
      onAddSlot(date, startTime, endTime);
      setStartTime('09:00');
      setEndTime('17:00');
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="time-slot-editor">
      <h4>Manage Availability for {formatDateDisplay(date)}</h4>

      <div className="existing-slots">
        {timeSlots.length === 0 ? (
          <p className="no-slots">No time slots set for this date</p>
        ) : (
          timeSlots.map((slot, index) => (
            <div key={index} className="time-slot-item">
              <span>{slot.startTime} - {slot.endTime}</span>
              <button
                onClick={() => onRemoveSlot(slot)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="add-slot-form">
        <h5>Add Time Slot</h5>
        <div className="time-inputs">
          <div className="input-group">
            <label>Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <button onClick={handleAdd} className="add-button">
          Add Time Slot
        </button>
      </div>
    </div>
  );
};

interface TimeSlotDisplayProps {
  date: string;
  timeSlots: TimeSlot[];
}

const TimeSlotDisplay: React.FC<TimeSlotDisplayProps> = ({ date, timeSlots }) => {
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="time-slot-display">
      <h4>Available Times for {formatDateDisplay(date)}</h4>
      {timeSlots.length === 0 ? (
        <p className="no-slots">No available time slots</p>
      ) : (
        <div className="slots-list">
          {timeSlots.map((slot, index) => (
            <div key={index} className="time-slot-item readonly">
              <span>{slot.startTime} - {slot.endTime}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
