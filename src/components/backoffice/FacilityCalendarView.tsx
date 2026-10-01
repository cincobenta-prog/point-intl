import React, { useState } from 'react';
import { 
  RoomScheduleEvent, 
  GoldenRecordCase,
  RoomId,
  DirectorProfile
} from '../../lib/types/funeral';
import { FACILITY_ROOMS, INITIAL_DIRECTOR_PROFILES } from '../../lib/data/mockCases';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Flame, 
  User, 
  Sparkles,
  X,
  FileText,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  List,
  Check,
  UserCheck
} from 'lucide-react';

interface FacilityCalendarViewProps {
  events: RoomScheduleEvent[];
  cases: GoldenRecordCase[];
  onAddEvent: (newEvent: RoomScheduleEvent) => void;
  onSelectCase: (caseItem: GoldenRecordCase) => void;
  onOpenGoldenRecord: () => void;
  directorProfiles?: DirectorProfile[];
}

type CalendarTimeframe = 'day' | 'week' | 'month';
type DailyDisplayMode = 'matrix' | 'timeline' | 'agenda';

export const FacilityCalendarView: React.FC<FacilityCalendarViewProps> = ({
  events,
  cases,
  onAddEvent,
  onSelectCase,
  onOpenGoldenRecord,
  directorProfiles = INITIAL_DIRECTOR_PROFILES
}) => {
  // Primary Calendar States
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-22');
  const [timeframe, setTimeframe] = useState<CalendarTimeframe>('day');
  const [dailyMode, setDailyMode] = useState<DailyDisplayMode>('matrix');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'chapel' | 'repast' | 'suite' | 'parlor' | 'offsite'>('all');
  const [selectedDirectorFilter, setSelectedDirectorFilter] = useState<string>('all');
  
  // Modals & Detail Popups
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<RoomScheduleEvent | null>(null);

  // New Booking Form State
  const [bookingRoomId, setBookingRoomId] = useState<RoomId>('chapel_1');
  const [bookingCaseId, setBookingCaseId] = useState<string>(cases[0]?.id || '');
  const [bookingTitle, setBookingTitle] = useState('Celebration of Life & Sanctuary Service');
  const [bookingDate, setBookingDate] = useState('2026-09-22');
  const [bookingStartTime, setBookingStartTime] = useState('14:00');
  const [bookingEndTime, setBookingEndTime] = useState('16:30');
  const [bookingServiceType, setBookingServiceType] = useState<RoomScheduleEvent['serviceType']>('Memorial Service');
  const [bookingOfficiant, setBookingOfficiant] = useState('Rev. Dr. Calvin Butts IV');
  const [bookingMusic, setBookingMusic] = useState('Organist & Sanctuary Choral Ensemble');
  const [bookingStreaming, setBookingStreaming] = useState(true);
  const [bookingGuests, setBookingGuests] = useState(100);
  const [bookingNotes, setBookingNotes] = useState('');

  const rooms = FACILITY_ROOMS;

  // Filtered rooms by category and specific room
  const activeRooms = rooms.filter(r => {
    if (selectedCategory !== 'all' && r.type !== selectedCategory) return false;
    if (selectedRoomFilter !== 'all' && r.id !== selectedRoomFilter) return false;
    return true;
  });

  // Helper to get Director Color Theme
  const getDirectorColorTheme = (evt: RoomScheduleEvent) => {
    if (evt.assignedDirectorId) {
      const found = directorProfiles.find(d => d.id === evt.assignedDirectorId);
      if (found?.colorTheme) return found.colorTheme;
    }
    // Match by first name
    const foundByName = directorProfiles.find(d => evt.assignedDirector && d.name.toLowerCase().includes(evt.assignedDirector.toLowerCase().split(' ')[0]));
    if (foundByName?.colorTheme) return foundByName.colorTheme;
    return {
      name: 'Crimson Wine',
      primary: '#991b1b',
      badgeBg: 'bg-red-100 text-red-900 border-red-300',
      calendarBg: 'bg-red-50/95 border-l-4 border-red-600 shadow-xs',
      border: 'border-red-500',
      text: 'text-[#991b1b]'
    };
  };

  // Filter events matching active room/category and director filter
  const matchesFilter = (evt: RoomScheduleEvent) => {
    const room = rooms.find(r => r.id === evt.roomId);
    if (!room) return false;
    if (selectedCategory !== 'all' && room.type !== selectedCategory) return false;
    if (selectedRoomFilter !== 'all' && room.id !== selectedRoomFilter) return false;
    if (selectedDirectorFilter !== 'all') {
      if (evt.assignedDirectorId !== selectedDirectorFilter && !evt.assignedDirector.toLowerCase().includes(selectedDirectorFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  };

  // Filtered events for the selected date
  const dateEvents = events.filter(e => e.date === selectedDate && matchesFilter(e));

  // Check for scheduling conflicts
  const hasConflict = (roomId: RoomId, date: string, start: string, end: string) => {
    return events.some(e => {
      if (e.roomId !== roomId || e.date !== date) return false;
      return (start < e.endTime && end > e.startTime);
    });
  };

  const bookingConflict = hasConflict(bookingRoomId, bookingDate, bookingStartTime, bookingEndTime);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const associatedCase = cases.find(c => c.id === bookingCaseId);
    
    const newEvt: RoomScheduleEvent = {
      id: `evt-${Date.now()}`,
      roomId: bookingRoomId,
      caseId: bookingCaseId,
      caseNumber: associatedCase?.caseNumber || 'BFH-GEN-01',
      decedentName: associatedCase?.decedent.legalName || 'Scheduled Service',
      title: bookingTitle,
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      serviceType: bookingServiceType,
      assignedDirector: associatedCase?.assignedDirector || 'Jason Benta',
      officiantName: bookingOfficiant || undefined,
      organistOrMusic: bookingMusic || undefined,
      livestreamActive: bookingStreaming,
      estimatedGuests: bookingGuests,
      notes: bookingNotes,
      status: 'confirmed'
    };

    onAddEvent(newEvt);
    setIsBookingModalOpen(false);
  };

  // Date Navigation Logic
  const navigatePeriod = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (timeframe === 'day') {
      d.setDate(d.getDate() + offset);
    } else if (timeframe === 'week') {
      d.setDate(d.getDate() + (offset * 7));
    } else if (timeframe === 'month') {
      d.setMonth(d.getMonth() + offset);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Helpers for Week Calculations
  const getWeekDates = (currDateStr: string) => {
    const curr = new Date(currDateStr + 'T00:00:00');
    const dayOfWeek = curr.getDay(); // 0 = Sun, 6 = Sat
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${dt}`;
      week.push({
        date: dateString,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateString === '2026-09-22',
        isSelected: dateString === selectedDate
      });
    }
    return week;
  };

  // Helpers for Month Calculations
  const getMonthGrid = (currDateStr: string) => {
    const curr = new Date(currDateStr + 'T00:00:00');
    const year = curr.getFullYear();
    const month = curr.getMonth(); // 0-indexed

    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month filler days
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];

    // Prepend previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      days.push({
        date: `${y}-${m}-${dt}`,
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: `${y}-${m}-${dt}` === '2026-09-22',
        isSelected: `${y}-${m}-${dt}` === selectedDate
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const y = year;
      const m = String(month + 1).padStart(2, '0');
      const dt = String(i).padStart(2, '0');
      const dateString = `${y}-${m}-${dt}`;
      days.push({
        date: dateString,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateString === '2026-09-22',
        isSelected: dateString === selectedDate
      });
    }

    // Append next month days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      days.push({
        date: `${y}-${m}-${dt}`,
        dayNum: i,
        isCurrentMonth: false,
        isToday: `${y}-${m}-${dt}` === '2026-09-22',
        isSelected: `${y}-${m}-${dt}` === selectedDate
      });
    }

    return days;
  };

  const weekDays = getWeekDates(selectedDate);
  const monthDays = getMonthGrid(selectedDate);

  // Month Statistics
  const currentMonthPrefix = selectedDate.substring(0, 7);
  const currentMonthEvents = events.filter(e => e.date.startsWith(currentMonthPrefix) && matchesFilter(e));
  const weekEvents = events.filter(e => weekDays.some(w => w.date === e.date) && matchesFilter(e));

  // Format header title according to timeframe
  const getHeaderDateTitle = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (timeframe === 'day') {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (timeframe === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.monthName} ${start.dayNum} – ${end.monthName} ${end.dayNum}, ${d.getFullYear()}`;
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Hourly slots for Daily Timeline mode
  const hourlySlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 text-neutral-900 font-sans">
      
      {/* 1. TOP HEADER & PRIMARY CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Facility & Room Availability Calendar
            </h2>
            <span className="bg-red-50 text-[#991b1b] text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              630 Saint Nicholas Ave
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 font-light">
            Live schedule & room booking for <strong>Chapel 1 (120 seats)</strong>, <strong>Chapel 2 (110 seats)</strong>, Repast Room (75), Family Suites 1 & 2, Parlors A–C / AB / ABC, and Offsite Church Services.
          </p>
        </div>

        {/* Primary View Switcher & Action */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Daily / Weekly / Monthly Switcher */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-inner">
            <button
              onClick={() => setTimeframe('day')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === 'day'
                  ? 'bg-white text-[#991b1b] shadow-sm ring-1 ring-neutral-200'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#991b1b]" />
              <span>Daily</span>
            </button>

            <button
              onClick={() => setTimeframe('week')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === 'week'
                  ? 'bg-white text-[#991b1b] shadow-sm ring-1 ring-neutral-200'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-[#991b1b]" />
              <span>Weekly</span>
            </button>

            <button
              onClick={() => setTimeframe('month')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === 'month'
                  ? 'bg-white text-[#991b1b] shadow-sm ring-1 ring-neutral-200'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#991b1b]" />
              <span>Monthly</span>
            </button>
          </div>

          {/* New Booking Button */}
          <button
            onClick={() => {
              setBookingDate(selectedDate);
              setIsBookingModalOpen(true);
            }}
            className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm border border-amber-300/40"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Book Room / Schedule Service</span>
          </button>
        </div>
      </div>

      {/* 2. DATE NAVIGATION & CATEGORY FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        
        {/* Dynamic Date Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 bg-neutral-100 rounded-xl p-1 border border-neutral-200">
            <button
              onClick={() => navigatePeriod(-1)}
              className="p-1.5 hover:bg-white rounded-lg text-neutral-700 transition"
              title={timeframe === 'day' ? 'Previous Day' : timeframe === 'week' ? 'Previous Week' : 'Previous Month'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate('2026-09-22')}
              className="px-2.5 py-1 text-[11px] font-bold text-neutral-800 hover:bg-white rounded-lg transition"
            >
              {timeframe === 'day' ? 'Today (Sept 22)' : timeframe === 'week' ? 'This Week' : 'Current Month'}
            </button>
            <button
              onClick={() => navigatePeriod(1)}
              className="p-1.5 hover:bg-white rounded-lg text-neutral-700 transition"
              title={timeframe === 'day' ? 'Next Day' : timeframe === 'week' ? 'Next Week' : 'Next Month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 font-bold text-sm sm:text-base text-neutral-900 font-serif-title">
            <CalendarIcon className="w-4 h-4 text-[#991b1b]" />
            <span>{getHeaderDateTitle()}</span>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-700 outline-none focus:border-[#991b1b]"
          />
        </div>

        {/* Daily Sub-Mode Switcher (Only visible in Daily view) */}
        {timeframe === 'day' && (
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              onClick={() => setDailyMode('matrix')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                dailyMode === 'matrix'
                  ? 'bg-white text-[#991b1b] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>12-Room Matrix</span>
            </button>
            <button
              onClick={() => setDailyMode('timeline')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                dailyMode === 'timeline'
                  ? 'bg-white text-[#991b1b] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Hourly Timeline</span>
            </button>
            <button
              onClick={() => setDailyMode('agenda')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                dailyMode === 'agenda'
                  ? 'bg-white text-[#991b1b] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="w-3 h-3" />
              <span>Daily Agenda</span>
            </button>
          </div>
        )}

        {/* Space Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedRoomFilter('all'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'all' && selectedRoomFilter === 'all'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All 12 Spaces
          </button>
          <button
            onClick={() => { setSelectedCategory('chapel'); setSelectedRoomFilter('all'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'chapel'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Chapels (1 & 2)
          </button>
          <button
            onClick={() => { setSelectedCategory('repast'); setSelectedRoomFilter('all'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'repast'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Repast Room (75)
          </button>
          <button
            onClick={() => { setSelectedCategory('suite'); setSelectedRoomFilter('all'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'suite'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Family Suites (1 & 2)
          </button>
          <button
            onClick={() => { setSelectedCategory('parlor'); setSelectedRoomFilter('all'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'parlor'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Parlors (A–C, AB, ABC)
          </button>
          <button
            onClick={() => { setSelectedCategory('offsite'); setSelectedRoomFilter('all'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'offsite'
                ? 'bg-[#991b1b] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Church / Other
          </button>
        </div>
      </div>

      {/* Direct Room Quick Chips */}
      <div className="flex flex-wrap gap-1.5 items-center px-1">
        <span className="text-[11px] text-neutral-500 font-medium mr-1">Direct Room:</span>
        {rooms.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSelectedRoomFilter(r.id);
              setSelectedCategory('all');
            }}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition border ${
              selectedRoomFilter === r.id
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {r.name.split(' (')[0]} ({r.capacity})
          </button>
        ))}
      </div>

      {/* COLOR-COORDINATED FUNERAL DIRECTOR LEGEND & QUICK FILTER BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#991b1b]" />
            <span>Director Color Board:</span>
          </span>
          <button
            onClick={() => setSelectedDirectorFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
              selectedDirectorFilter === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
            }`}
          >
            Show All Directors
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {directorProfiles.map(d => {
            const isSelected = selectedDirectorFilter === d.id || selectedDirectorFilter === d.name;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDirectorFilter(isSelected ? 'all' : d.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border flex items-center space-x-1.5 ${
                  isSelected
                    ? 'ring-2 ring-neutral-900 shadow-xs'
                    : 'hover:opacity-90'
                } ${d.colorTheme?.badgeBg || 'bg-neutral-100'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.colorTheme?.primary || '#991b1b' }} />
                <span>{d.name.split(' ')[0]} ({d.colorTheme?.name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. VIEW MODE: DAILY VIEW                                  */}
      {/* ========================================================= */}
      {timeframe === 'day' && (
        <>
          {/* Sub-Mode 1: 12-Room Matrix Columns */}
          {dailyMode === 'matrix' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {activeRooms.map((room) => {
                const roomEvents = dateEvents.filter(e => e.roomId === room.id);
                const isOccupied = roomEvents.length > 0;

                return (
                  <div 
                    key={room.id}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col min-h-[500px] overflow-hidden"
                  >
                    {/* Room Card Header */}
                    <div className={`p-4 border-b ${room.color} bg-opacity-40`}>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-current shadow-xs">
                          {room.code}
                        </span>
                        <span className="text-[11px] font-bold flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full shadow-2xs">
                          <Users className="w-3 h-3 text-[#991b1b]" />
                          <span>{room.capacity} Guests</span>
                        </span>
                      </div>

                      <h3 className="font-serif-title font-bold text-sm text-neutral-900 mt-2 leading-snug">
                        {room.name}
                      </h3>

                      {/* Amenities Badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.features.slice(0, 2).map((feat, i) => (
                          <span key={i} className="text-[9px] bg-white/90 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-medium">Daily Status:</span>
                      {isOccupied ? (
                        <span className="text-[#991b1b] font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#991b1b] animate-pulse" />
                          {roomEvents.length} Service{roomEvents.length > 1 ? 's' : ''} Booked
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Available
                        </span>
                      )}
                    </div>

                    {/* Scheduled Events in this Room */}
                    <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                      {roomEvents.length === 0 ? (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
                          <p className="font-medium text-neutral-500">No services scheduled</p>
                          <button
                            onClick={() => {
                              setBookingRoomId(room.id);
                              setBookingDate(selectedDate);
                              setIsBookingModalOpen(true);
                            }}
                            className="mt-2 text-[11px] text-[#991b1b] hover:text-red-900 font-bold underline"
                          >
                            + Book this room
                          </button>
                        </div>
                      ) : (
                        roomEvents.map((evt) => {
                          const dirTheme = getDirectorColorTheme(evt);

                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedEventDetail(evt)}
                              className={`p-3.5 rounded-xl border ${dirTheme.calendarBg} hover:shadow-xs transition cursor-pointer space-y-2`}
                            >
                              {/* Time & Case Number */}
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-300 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-600" />
                                  {evt.startTime} – {evt.endTime}
                                </span>
                                <span className="font-mono text-[10px] text-neutral-600 font-bold">
                                  {evt.caseNumber}
                                </span>
                              </div>

                              {/* Decedent & Title */}
                              <div>
                                <h4 className="font-serif-title font-bold text-xs text-neutral-900 leading-tight">
                                  {evt.decedentName}
                                </h4>
                                <p className="text-[11px] font-semibold mt-0.5 line-clamp-1" style={{ color: dirTheme.primary }}>
                                  {evt.title}
                                </p>
                              </div>

                              {/* Service Metadata */}
                              <div className="space-y-1 text-[10px] text-neutral-600 pt-1 border-t border-neutral-200/60">
                                {evt.officiantName && (
                                  <p className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-neutral-400" />
                                    <span className="truncate">Clergy: {evt.officiantName}</span>
                                  </p>
                                )}
                                <div className="flex items-center justify-between pt-0.5">
                                  <span className="flex items-center gap-1 text-neutral-500">
                                    <Users className="w-3 h-3 text-neutral-400" />
                                    ~{evt.estimatedGuests} guests
                                  </span>
                                  {evt.livestreamActive && (
                                    <span className="bg-red-100 text-[#991b1b] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                      <Video className="w-2.5 h-2.5" /> HD Stream
                                    </span>
                                  )}
                                </div>
                                {evt.woodlawnDepartureTime && (
                                  <p className="flex items-center gap-1 text-[#991b1b] font-bold">
                                    <Flame className="w-3 h-3 text-[#991b1b]" />
                                    <span>Woodlawn Departure: {evt.woodlawnDepartureTime}</span>
                                  </p>
                                )}
                              </div>

                              {/* Director Badge with Theme Color */}
                              <div className="pt-1.5 flex justify-between items-center text-[10px] border-t border-neutral-200/40">
                                <span className={`px-2 py-0.5 rounded font-bold border ${dirTheme.badgeBg}`}>
                                  Lead: {evt.assignedDirector}
                                </span>
                                <span className="font-bold hover:underline" style={{ color: dirTheme.primary }}>Details →</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Add at bottom of room */}
                    <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
                      <button
                        onClick={() => {
                          setBookingRoomId(room.id);
                          setBookingDate(selectedDate);
                          setIsBookingModalOpen(true);
                        }}
                        className="text-xs text-neutral-700 hover:text-[#991b1b] font-bold flex items-center justify-center gap-1 w-full"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reserve {room.code}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-Mode 2: Hourly Timeline Schedule */}
          {dailyMode === 'timeline' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center text-xs">
                <span className="font-serif-title font-bold text-neutral-900">
                  Master Hourly Schedule ({selectedDate})
                </span>
                <span className="text-neutral-500 font-medium">
                  {dateEvents.length} Active Reservations Across {activeRooms.length} Spaces
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                  <thead>
                    <tr className="bg-neutral-100/70 border-b border-neutral-200 text-[11px] text-neutral-600 font-bold uppercase tracking-wider">
                      <th className="p-3 w-28">Time Slot</th>
                      <th className="p-3">Sanctuary / Room</th>
                      <th className="p-3">Case & Decedent</th>
                      <th className="p-3">Service Details & Clergy</th>
                      <th className="p-3">Director</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {hourlySlots.map((hour) => {
                      // Find events that intersect this hour
                      const slotEvents = dateEvents.filter(e => {
                        return e.startTime <= hour && e.endTime > hour;
                      });

                      if (slotEvents.length === 0) {
                        return (
                          <tr key={hour} className="hover:bg-neutral-50/50 transition">
                            <td className="p-3 font-mono font-bold text-neutral-400 border-r border-neutral-100">
                              {hour}
                            </td>
                            <td colSpan={4} className="p-3 text-neutral-400 italic text-[11px]">
                              All spaces available
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setBookingDate(selectedDate);
                                  setBookingStartTime(hour);
                                  setIsBookingModalOpen(true);
                                }}
                                className="text-[11px] text-neutral-500 hover:text-[#991b1b] font-bold"
                              >
                                + Book Slot
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return slotEvents.map((evt) => {
                        const room = rooms.find(r => r.id === evt.roomId);
                        return (
                          <tr key={`${hour}-${evt.id}`} className="bg-red-50/30 hover:bg-red-50/60 transition">
                            <td className="p-3 font-mono font-bold text-[#991b1b] border-r border-neutral-200">
                              {hour}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-neutral-900 block">{room?.name}</span>
                              <span className="text-[10px] text-neutral-500">{room?.capacity} Seats • {room?.code}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-serif-title font-bold text-neutral-900 block">{evt.decedentName}</span>
                              <span className="font-mono text-[10px] text-[#b45309] font-bold">{evt.caseNumber}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-neutral-800 block">{evt.title}</span>
                              <span className="text-[10px] text-neutral-500">
                                {evt.startTime} – {evt.endTime} {evt.officiantName ? `• ${evt.officiantName}` : ''}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-700 font-medium">
                              {evt.assignedDirector}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedEventDetail(evt)}
                                className="px-2.5 py-1 bg-white border border-neutral-300 rounded text-neutral-800 hover:text-[#991b1b] font-bold text-[11px] transition shadow-2xs"
                              >
                                Packet →
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Mode 3: Daily Agenda List */}
          {dailyMode === 'agenda' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center text-xs">
                <h3 className="font-serif-title font-bold text-neutral-900 uppercase tracking-wider">
                  Chronological Service Schedule for {selectedDate}
                </h3>
                <span className="text-neutral-500 font-medium">{dateEvents.length} Total Bookings</span>
              </div>

              <div className="divide-y divide-neutral-100">
                {dateEvents.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 text-xs">
                    No services or facility reservations logged for this date.
                  </div>
                ) : (
                  dateEvents.map((evt) => {
                    const roomInfo = rooms.find(r => r.id === evt.roomId);
                    return (
                      <div 
                        key={evt.id}
                        onClick={() => setSelectedEventDetail(evt)}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/80 transition cursor-pointer text-xs"
                      >
                        <div className="space-y-1.5 max-w-lg">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-[#991b1b] bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                              {evt.startTime} – {evt.endTime}
                            </span>
                            <span className="font-bold text-neutral-900 text-sm">
                              {evt.decedentName}
                            </span>
                            <span className="text-neutral-400 font-mono text-[11px]">({evt.caseNumber})</span>
                          </div>
                          <p className="text-xs text-[#b45309] font-medium">{evt.title}</p>
                          <p className="text-neutral-500 text-[11px] font-light">{evt.notes}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-neutral-600 shrink-0">
                          <div className="text-right space-y-0.5">
                            <span className="font-bold text-neutral-900 block flex items-center gap-1 justify-end">
                              <MapPin className="w-3.5 h-3.5 text-[#991b1b]" />
                              {roomInfo?.name}
                            </span>
                            <span className="text-[11px] text-neutral-500">Capacity: {roomInfo?.capacity} Guests</span>
                          </div>

                          <div className="flex gap-2">
                            {evt.livestreamActive && (
                              <span className="bg-red-50 text-[#991b1b] border border-red-200 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1">
                                <Video className="w-3 h-3" /> Live Stream
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEventDetail(evt);
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-3 py-1 rounded text-xs transition border border-neutral-300"
                            >
                              View Schedule Packet
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* 4. VIEW MODE: WEEKLY VIEW (7-Day Column Grid)             */}
      {/* ========================================================= */}
      {timeframe === 'week' && (
        <div className="space-y-4">
          
          {/* Week Summary Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Week Total Services</span>
                <strong className="text-base text-neutral-900">{weekEvents.length} Bookings</strong>
              </div>
              <CalendarIcon className="w-5 h-5 text-[#991b1b]" />
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Chapel 1 & 2 Services</span>
                <strong className="text-base text-[#991b1b]">
                  {weekEvents.filter(e => e.roomId === 'chapel_1' || e.roomId === 'chapel_2').length} Sanctuary
                </strong>
              </div>
              <Users className="w-5 h-5 text-[#b45309]" />
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Repast Receptions</span>
                <strong className="text-base text-emerald-700">
                  {weekEvents.filter(e => e.roomId === 'repast_room').length} Held
                </strong>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Offsite & Woodlawn</span>
                <strong className="text-base text-neutral-900">
                  {weekEvents.filter(e => e.roomId === 'church' || !!e.woodlawnDepartureTime).length} Dispatched
                </strong>
              </div>
              <Flame className="w-5 h-5 text-[#991b1b]" />
            </div>
          </div>

          {/* 7-Day Columns */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayEvents = events.filter(e => e.date === day.date && matchesFilter(e));
              const isSelectedDay = day.date === selectedDate;

              return (
                <div
                  key={day.date}
                  className={`bg-white rounded-2xl border flex flex-col min-h-[560px] shadow-sm transition ${
                    isSelectedDay
                      ? 'border-[#991b1b] ring-2 ring-red-500/20'
                      : day.isToday
                      ? 'border-amber-300'
                      : 'border-neutral-200'
                  }`}
                >
                  {/* Day Column Header */}
                  <div 
                    onClick={() => {
                      setSelectedDate(day.date);
                    }}
                    className={`p-3 border-b text-center cursor-pointer transition ${
                      isSelectedDay 
                        ? 'bg-[#991b1b] text-white' 
                        : day.isToday 
                        ? 'bg-amber-50 text-amber-950 border-amber-200' 
                        : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider block">
                      {day.dayName}
                    </span>
                    <span className="text-lg font-bold font-serif-title block">
                      {day.dayNum}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      isSelectedDay 
                        ? 'bg-white/20 text-white' 
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {dayEvents.length} {dayEvents.length === 1 ? 'Service' : 'Services'}
                    </span>
                  </div>

                  {/* Events Container */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <div className="h-36 flex flex-col items-center justify-center text-center p-2 text-neutral-400 text-[11px]">
                        <span>No bookings</span>
                        <button
                          onClick={() => {
                            setBookingDate(day.date);
                            setIsBookingModalOpen(true);
                          }}
                          className="mt-2 text-[10px] text-[#991b1b] hover:underline font-bold"
                        >
                          + Add Booking
                        </button>
                      </div>
                    ) : (
                      dayEvents.map((evt) => {
                        const room = rooms.find(r => r.id === evt.roomId);
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEventDetail(evt)}
                            className="p-2.5 rounded-xl border border-red-200/90 bg-red-50/50 hover:bg-red-100/70 hover:border-red-300 transition cursor-pointer space-y-1.5 shadow-2xs text-left"
                          >
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-mono font-bold text-[#991b1b] bg-white px-1.5 py-0.5 rounded border border-red-200">
                                {evt.startTime}
                              </span>
                              <span className="font-bold text-[9px] text-neutral-600 bg-white px-1 py-0.5 rounded border border-neutral-200 truncate max-w-[80px]">
                                {room?.code}
                              </span>
                            </div>

                            <h5 className="font-serif-title font-bold text-xs text-neutral-900 leading-tight">
                              {evt.decedentName}
                            </h5>

                            <p className="text-[10px] text-[#b45309] font-medium truncate">
                              {evt.title}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-red-100 text-[9px] text-neutral-500">
                              <span>{evt.estimatedGuests} guests</span>
                              {evt.livestreamActive && (
                                <span className="text-[#991b1b] font-bold flex items-center gap-0.5">
                                  <Video className="w-2.5 h-2.5" /> HD
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Day Column Bottom Action */}
                  <div className="p-2 bg-neutral-50 border-t border-neutral-100 text-center">
                    <button
                      onClick={() => {
                        setBookingDate(day.date);
                        setIsBookingModalOpen(true);
                      }}
                      className="text-[11px] text-neutral-600 hover:text-[#991b1b] font-bold flex items-center justify-center gap-1 w-full"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VIEW MODE: MONTHLY VIEW (Full Calendar Grid)           */}
      {/* ========================================================= */}
      {timeframe === 'month' && (
        <div className="space-y-4">
          
          {/* Monthly Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Month Total Services</span>
                <strong className="text-base text-neutral-900">{currentMonthEvents.length} Bookings</strong>
              </div>
              <CalendarDays className="w-5 h-5 text-[#991b1b]" />
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Chapels (1 & 2) Bookings</span>
                <strong className="text-base text-[#991b1b]">
                  {currentMonthEvents.filter(e => e.roomId === 'chapel_1' || e.roomId === 'chapel_2').length} Scheduled
                </strong>
              </div>
              <Users className="w-5 h-5 text-[#b45309]" />
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Repast & Suites</span>
                <strong className="text-base text-emerald-700">
                  {currentMonthEvents.filter(e => ['repast_room', 'family_suite_1', 'family_suite_2'].includes(e.roomId)).length} Receptions
                </strong>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Parlors & Offsite</span>
                <strong className="text-base text-neutral-900">
                  {currentMonthEvents.filter(e => e.roomId.startsWith('parlor') || e.roomId === 'church').length} Events
                </strong>
              </div>
              <Flame className="w-5 h-5 text-[#991b1b]" />
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 bg-neutral-100 border-b border-neutral-200 text-center py-2 text-xs font-bold text-neutral-700 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* 35/42 Day Cells Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200 text-xs">
              {monthDays.map((cell, idx) => {
                const dayEvents = events.filter(e => e.date === cell.date && matchesFilter(e));
                const isSelectedCell = cell.date === selectedDate;

                return (
                  <div
                    key={`${cell.date}-${idx}`}
                    onClick={() => {
                      setSelectedDate(cell.date);
                    }}
                    className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition cursor-pointer relative group ${
                      !cell.isCurrentMonth
                        ? 'bg-neutral-50/50 text-neutral-400'
                        : isSelectedCell
                        ? 'bg-red-50/60 ring-2 ring-inset ring-[#991b1b]'
                        : cell.isToday
                        ? 'bg-amber-50/40'
                        : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {/* Top Cell Header */}
                    <div className="flex justify-between items-start">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs ${
                        cell.isToday
                          ? 'bg-[#991b1b] text-white'
                          : isSelectedCell
                          ? 'bg-red-100 text-[#991b1b]'
                          : 'text-neutral-800'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-[#991b1b] border border-red-200">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event Badges List */}
                    <div className="space-y-1 my-1 overflow-y-auto max-h-[70px]">
                      {dayEvents.slice(0, 3).map((evt) => {
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventDetail(evt);
                            }}
                            className="text-[10px] p-1 rounded bg-white hover:bg-red-50 border border-neutral-200 hover:border-red-300 font-medium text-neutral-900 truncate flex items-center gap-1 shadow-2xs transition"
                            title={`${evt.startTime}: ${evt.decedentName}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#991b1b] shrink-0" />
                            <span className="font-mono font-bold text-[#991b1b]">{evt.startTime}</span>
                            <span className="truncate">{evt.decedentName.split(' ')[0]}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-[#b45309] font-bold block text-center">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Action */}
                    <div className="opacity-0 group-hover:opacity-100 transition flex justify-between items-center text-[10px] pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.date);
                          setTimeframe('day');
                        }}
                        className="text-[#991b1b] font-bold hover:underline"
                      >
                        Day View →
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingDate(cell.date);
                          setIsBookingModalOpen(true);
                        }}
                        className="text-neutral-500 hover:text-neutral-900 font-bold"
                      >
                        + Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. EVENT DETAIL / SERVICE SCHEDULE PACKET MODAL           */}
      {/* ========================================================= */}
      {selectedEventDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-neutral-900">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  Service Schedule Packet
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventDetail(null)}
                className="text-neutral-500 hover:text-neutral-900 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                <span className="font-mono text-[10px] font-bold text-[#991b1b] uppercase">Case {selectedEventDetail.caseNumber}</span>
                <h4 className="font-serif-title text-xl font-bold text-neutral-900">{selectedEventDetail.decedentName}</h4>
                <p className="text-xs text-[#b45309] font-medium">{selectedEventDetail.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Room / Facility</span>
                  <strong className="text-neutral-900">
                    {rooms.find(r => r.id === selectedEventDetail.roomId)?.name}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Date & Time</span>
                  <strong className="text-neutral-900">
                    {selectedEventDetail.date} ({selectedEventDetail.startTime} – {selectedEventDetail.endTime})
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Officiant / Clergy</span>
                  <strong className="text-neutral-900">{selectedEventDetail.officiantName || 'Family Led'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Music / Organist</span>
                  <strong className="text-neutral-900">{selectedEventDetail.organistOrMusic || 'Sanctuary Audio'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Director in Charge</span>
                  <strong className="text-neutral-900">{selectedEventDetail.assignedDirector}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Estimated Attendees</span>
                  <strong className="text-neutral-900">{selectedEventDetail.estimatedGuests} Guests</strong>
                </div>
              </div>

              {selectedEventDetail.woodlawnDepartureTime && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-950 font-medium text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#991b1b]" />
                    <span>Cortege Departure to Woodlawn Crematory:</span>
                  </div>
                  <strong className="font-mono font-bold text-[#991b1b]">{selectedEventDetail.woodlawnDepartureTime} EST</strong>
                </div>
              )}

              {selectedEventDetail.notes && (
                <div>
                  <span className="text-neutral-500 block text-[11px] mb-1 font-medium">Logistics & Family Notes:</span>
                  <p className="p-3 bg-[#fbfbfd] rounded-xl border border-neutral-200 text-neutral-700 font-light">
                    {selectedEventDetail.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
              <button
                onClick={() => {
                  const targetCase = cases.find(c => c.id === selectedEventDetail.caseId);
                  if (targetCase) {
                    onSelectCase(targetCase);
                    onOpenGoldenRecord();
                    setSelectedEventDetail(null);
                  }
                }}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition border border-neutral-300"
              >
                <FileText className="w-3.5 h-3.5 text-[#991b1b]" />
                <span>Open Golden Record Case</span>
              </button>

              <button
                onClick={() => setSelectedEventDetail(null)}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2 rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. BOOK ROOM / SCHEDULE SERVICE MODAL                     */}
      {/* ========================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl text-neutral-900 my-8">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#991b1b]" />
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  Book Facility Room & Schedule Service
                </h3>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 text-xs font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Warning if overlapping */}
            {bookingConflict && (
              <div className="p-3.5 bg-red-50 border border-red-300 text-[#991b1b] rounded-xl flex items-center space-x-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#991b1b]" />
                <span>
                  <strong>Scheduling Conflict Detected:</strong> {rooms.find(r => r.id === bookingRoomId)?.name} is already booked during this time window. Please choose another time or room.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              
              {/* Case Selector */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Select Golden Record Case *</label>
                <select
                  value={bookingCaseId}
                  onChange={(e) => setBookingCaseId(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-bold focus:border-[#991b1b] outline-none"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} • {c.decedent.legalName} ({c.dispositionType.replace('_', ' ').toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Selector */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Select Sanctuary / Room *</label>
                <select
                  value={bookingRoomId}
                  onChange={(e) => setBookingRoomId(e.target.value as RoomId)}
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-bold focus:border-[#991b1b] outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — Capacity: {r.capacity} Guests ({r.features[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Broadcast Venue Capability Badge */}
              {['chapel_1', 'chapel_2', 'repast_room'].includes(bookingRoomId) ? (
                <div className="p-3 bg-red-50 border border-red-200 text-[#991b1b] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-red-600 shrink-0" />
                    <span><strong>Broadcast-Enabled Venue:</strong> 4K PTZ cameras & master soundboard feeds active for {rooms.find(r => r.id === bookingRoomId)?.name}.</span>
                  </div>
                  <span className="bg-[#991b1b] text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    Webcast Ready
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span><strong>Note:</strong> Fixed house webcasting is available in <strong>Chapel 1, Chapel 2, and The Repast Room</strong>.</span>
                </div>
              )}

              {/* Service Type & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Service Type *</label>
                  <select
                    value={bookingServiceType}
                    onChange={(e) => setBookingServiceType(e.target.value as RoomScheduleEvent['serviceType'])}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 font-bold focus:border-[#991b1b] outline-none"
                  >
                    <option value="Memorial Service">Memorial Service</option>
                    <option value="Viewing / Wake">Viewing / Wake</option>
                    <option value="Family Visitation">Family Visitation</option>
                    <option value="Arrangement Conference">Arrangement Conference</option>
                    <option value="Repast Gathering">Repast Gathering</option>
                    <option value="Pre-Need Consultation">Pre-Need Consultation</option>
                    <option value="Preparation / Restorative">Preparation / Restorative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Service / Booking Title *</label>
                  <input
                    type="text"
                    required
                    value={bookingTitle}
                    onChange={(e) => setBookingTitle(e.target.value)}
                    placeholder="e.g. Celebration of Life & Sanctuary Service"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={bookingStartTime}
                    onChange={(e) => setBookingStartTime(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={bookingEndTime}
                    onChange={(e) => setBookingEndTime(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>
              </div>

              {/* Officiant, Music & Attendance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Officiant / Clergy Name</label>
                  <input
                    type="text"
                    value={bookingOfficiant}
                    onChange={(e) => setBookingOfficiant(e.target.value)}
                    placeholder="e.g. Rev. Dr. Calvin Butts"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Organist / Music Selection</label>
                  <input
                    type="text"
                    value={bookingMusic}
                    onChange={(e) => setBookingMusic(e.target.value)}
                    placeholder="e.g. Organist & Choral Ensemble"
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Expected Attendance</label>
                  <input
                    type="number"
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(Number(e.target.value))}
                    className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 focus:border-[#991b1b] outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="streamActive"
                  checked={bookingStreaming}
                  onChange={(e) => setBookingStreaming(e.target.checked)}
                  className="rounded accent-[#991b1b] w-4 h-4"
                />
                <label htmlFor="streamActive" className="text-xs text-neutral-700 font-medium">
                  Enable HD Live-Streaming & 360° Digi-Tribute Screen Integration
                </label>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Special Setup / Staging Notes</label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Reserved seating front row for spouse. Floral delivery arriving at 10 AM."
                  className="w-full bg-[#fbfbfd] border border-neutral-300 rounded-lg p-2.5 text-neutral-900 focus:border-[#991b1b] outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm border border-amber-300/40 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Confirm Schedule Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
