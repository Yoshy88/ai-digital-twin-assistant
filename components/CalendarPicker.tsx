'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPickerProps {
  onConfirm: (dateTime: string) => void;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TIMES = ['09:00', '10:30', '11:00', '14:00', '15:30', '17:00'];

const CalendarPicker: React.FC<CalendarPickerProps> = ({ onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(currentYear, currentMonth));

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(`${monthName} ${selectedDate}, ${currentYear} at ${selectedTime}`);
    }
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200 max-w-[280px]">
      {/* Compact Header */}
      <div className="bg-indigo-600 px-3 py-2 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold flex items-center gap-1.5">
            <CalendarIcon size={12} /> {monthName} {currentYear}
          </h3>
        </div>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 rounded"><ChevronLeft size={14} /></button>
          <button className="p-0.5 hover:bg-white/20 rounded"><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="p-2.5">
        {/* Compact Days Grid */}
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {DAYS.map((d, i) => (
            <div key={i} className="text-[9px] font-bold text-slate-400 text-center uppercase py-0.5">{d}</div>
          ))}
          {days.map((day, idx) => (
            <button
              key={idx}
              disabled={!day || day < new Date().getDate()}
              onClick={() => day && setSelectedDate(day)}
              className={`h-7 w-7 text-[10px] rounded-md transition-all mx-auto ${
                !day ? 'invisible' : 
                day < new Date().getDate() ? 'text-slate-600 cursor-not-allowed' :
                selectedDate === day ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Compact Time Selection */}
        {selectedDate && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-white/10 pt-2 mt-1">
            <div className="grid grid-cols-3 gap-1.5">
              {TIMES.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-1 text-[9px] rounded border transition-all ${
                    selectedTime === time 
                      ? 'bg-indigo-900/50 border-indigo-400 text-indigo-300 font-bold' 
                      : 'border-white/10 text-slate-400 hover:border-indigo-500/50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Action */}
        <button
          disabled={!selectedDate || !selectedTime}
          onClick={handleConfirm}
          className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-30 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-50"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default CalendarPicker;
