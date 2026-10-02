import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Briefcase, 
  Phone, 
  Filter, 
  Scale, 
  Check, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { 
  DirectorProfile, 
  ServiceDirectorAssignment, 
  Director1099Voucher,
  GoldenRecordCase
} from '../../lib/types/funeral';

interface ManagerDirectorSchedulingViewProps {
  cases: GoldenRecordCase[];
  directorProfiles: DirectorProfile[];
  serviceAssignments: ServiceDirectorAssignment[];
  vouchers: Director1099Voucher[];
  onOpenAssignModal: (assignment: ServiceDirectorAssignment) => void;
  onApproveVoucher: (voucherId: string) => void;
  onUpdateDirectorHours: (directorId: string, additionalHours: number) => void;
  onAddOutsourcedDirector?: (newDirector: DirectorProfile) => void;
}

export const ManagerDirectorSchedulingView: React.FC<ManagerDirectorSchedulingViewProps> = ({
  cases,
  directorProfiles,
  serviceAssignments,
  vouchers,
  onOpenAssignModal,
  onApproveVoucher,
  onUpdateDirectorHours
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'in_house' | 'outsourced' | 'optimizer' | 'vouchers'>('services');
  const [filterType, setFilterType] = useState<'all' | 'unassigned' | 'in_house' | 'outsourced'>('all');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('all');

  // Optimizer interactive simulation state
  const [simServiceType, setSimServiceType] = useState<string>('Traditional Service and Burial');
  const [simVenue, setSimVenue] = useState<'Main Chapel (630 St Nicholas)' | 'External Church / Sanctuary' | 'Graveside Committal'>('External Church / Sanctuary');
  const [simAssignedInHouseHours, setSimAssignedInHouseHours] = useState<number>(32); // Beth Crowe at 32h

  // Aggregate Metrics
  const totalServices = serviceAssignments.length;
  const unassignedCount = serviceAssignments.filter(s => s.status === 'unassigned').length;
  const inHouseAssigned = serviceAssignments.filter(s => s.directorType === 'in_house').length;
  const outsourcedAssigned = serviceAssignments.filter(s => s.directorType === 'outsourced').length;
  const totalOvertimePreventedSavings = serviceAssignments.reduce((acc, s) => acc + (s.costAnalysis.marginImpactSavings || 0), 0);
  const pendingVoucherTotal = vouchers.filter(v => v.status === 'pending_approval').reduce((acc, v) => acc + v.amount, 0);

  // In-House & Outsourced sub-lists
  const inHouseDirectors = directorProfiles.filter(d => d.type === 'in_house');
  const outsourcedDirectors = directorProfiles.filter(d => d.type === 'outsourced');

  const filteredAssignments = serviceAssignments.filter(s => {
    if (filterType === 'unassigned') return s.status === 'unassigned';
    if (filterType === 'in_house') return s.directorType === 'in_house';
    if (filterType === 'outsourced') return s.directorType === 'outsourced';
    if (selectedCaseFilter !== 'all') return s.caseId === selectedCaseFilter;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-neutral-900">
      
      {/* Top Executive Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#1c1917] to-neutral-900 text-white p-6 sm:p-7 rounded-3xl border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#991b1b]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Executive Management Suite • NYS Bureau of Funeral Directing</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                7 / 7 Active LFDs Verified
              </span>
            </div>

            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight">
              Director Scheduling & Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-light leading-relaxed">
              Allocate In-House Licensed Staff and Outsourced Harlem Guild Trade Directors across upcoming services. Mitigate overtime penalties and maximize service margins with smart staffing intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('optimizer')}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Smart Labor Optimizer</span>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>1099 Pay Ledger (${pendingVoucherTotal} Pending)</span>
            </button>
          </div>
        </div>

        {/* 5-Metric Quick Performance Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-neutral-800 text-xs">
          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/50">
            <span className="text-neutral-400 text-[10px] block">Upcoming Services</span>
            <strong className="text-xl font-bold font-mono text-white">{totalServices} Services</strong>
            <span className="text-[10px] text-neutral-400 block mt-0.5">This Operating Week</span>
          </div>

          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/50">
            <span className="text-neutral-400 text-[10px] block">In-House Staffing</span>
            <strong className="text-xl font-bold font-mono text-emerald-400">{inHouseAssigned} ({Math.round((inHouseAssigned/totalServices)*100)}%)</strong>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Salaried Capacity</span>
          </div>

          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/50">
            <span className="text-neutral-400 text-[10px] block">Outsourced Trade Guild</span>
            <strong className="text-xl font-bold font-mono text-blue-400">{outsourcedAssigned} ({Math.round((outsourcedAssigned/totalServices)*100)}%)</strong>
            <span className="text-[10px] text-blue-300 block mt-0.5">Per-Diem Contracts</span>
          </div>

          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/50">
            <span className="text-neutral-400 text-[10px] block">Overtime Mitigated</span>
            <strong className="text-xl font-bold font-mono text-amber-300">+${totalOvertimePreventedSavings.toFixed(0)}</strong>
            <span className="text-[10px] text-amber-200 block mt-0.5">Margin Savings</span>
          </div>

          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/50">
            <span className="text-neutral-400 text-[10px] block">Unassigned Services</span>
            <strong className={`text-xl font-bold font-mono ${unassignedCount > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {unassignedCount} Needs Director
            </strong>
            <span className="text-[10px] text-neutral-400 block mt-0.5">Action Required</span>
          </div>
        </div>
      </div>

      {/* Main Tab Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-[#991b1b] text-white shadow-sm border border-amber-400/30'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Service Scheduling Board</span>
            {unassignedCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-900 text-[10px] font-mono rounded-full font-bold">
                {unassignedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('in_house')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'in_house'
                ? 'bg-[#991b1b] text-white shadow-sm border border-amber-400/30'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. In-House Staff Roster ({inHouseDirectors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('outsourced')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'outsourced'
                ? 'bg-[#991b1b] text-white shadow-sm border border-amber-400/30'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Outsourced Trade Guild LFDs ({outsourcedDirectors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'optimizer'
                ? 'bg-[#991b1b] text-white shadow-sm border border-amber-400/30'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>4. Smart Labor Optimizer</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'vouchers'
                ? 'bg-[#991b1b] text-white shadow-sm border border-amber-400/30'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>5. 1099 Pay Vouchers ({vouchers.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FUNERAL SERVICE SCHEDULING BOARD                                   */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          
          {/* Sub-Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-bold text-neutral-700">Filter Board:</span>
              <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-xl text-xs">
                {(['all', 'unassigned', 'in_house', 'outsourced'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      filterType === f ? 'bg-[#991b1b] text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {f === 'all' ? 'All Services' : f === 'unassigned' ? '⚠️ Unassigned Only' : f === 'in_house' ? 'In-House' : 'Outsourced Guild'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-neutral-500 font-medium">Filter by Case:</span>
              <select
                value={selectedCaseFilter}
                onChange={(e) => setSelectedCaseFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 font-medium outline-none focus:border-[#991b1b]"
              >
                <option value="all">All Active Cases</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.caseNumber} • {c.decedent.legalName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => {
              const isUnassigned = assignment.status === 'unassigned';
              const isInHouse = assignment.directorType === 'in_house';

              return (
                <div
                  key={assignment.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isUnassigned
                      ? 'border-red-300 ring-2 ring-red-200/50 bg-red-50/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Left Column: Service Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#991b1b] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                        {assignment.caseNumber}
                      </span>
                      <h3 className="font-serif-title text-base font-bold text-neutral-900">
                        {assignment.decedentName}
                      </h3>
                      <span className="text-xs text-neutral-500">• {assignment.serviceType}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#991b1b]" />
                        <span className="font-semibold text-neutral-900">{assignment.serviceDate} ({assignment.serviceTime})</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                        <span>Call Time: <strong className="font-mono text-neutral-900">{assignment.callTime}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Venue: <strong className="text-neutral-900">{assignment.venueName}</strong> (~{assignment.estimatedAttendance} guests)</span>
                      </div>
                    </div>

                    {/* VIP Protocols & Instructions */}
                    {assignment.vipProtocols && assignment.vipProtocols.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {assignment.vipProtocols.map((vip, i) => (
                          <span key={i} className="bg-amber-50 text-amber-900 border border-amber-200/70 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            ⭐ {vip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Director Badge & Cost Recommendation */}
                  <div className="lg:w-72 shrink-0 space-y-2 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Assigned Director</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        isUnassigned
                          ? 'bg-red-100 text-red-800'
                          : assignment.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>

                    {isUnassigned ? (
                      <div className="p-2 bg-red-100/70 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>No Director Assigned Yet!</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-neutral-900 font-bold">{assignment.assignedDirectorName}</strong>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            isInHouse ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {isInHouse ? 'In-House' : 'Outsourced Guild'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono">{assignment.directorLicense}</p>
                      </div>
                    )}

                    {/* Cost recommendation preview */}
                    <div className="pt-2 border-t border-neutral-200 text-[10px] text-neutral-600 flex items-center justify-between">
                      <span>Labor Recommendation:</span>
                      <strong className="text-[#991b1b] font-mono font-semibold">
                        {assignment.costAnalysis.recommendedType === 'in_house' ? 'In-House ($0 base)' : `Trade Guild ($${assignment.costAnalysis.outsourcedCost})`}
                      </strong>
                    </div>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => onOpenAssignModal(assignment)}
                      className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm border border-amber-400/40"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isUnassigned ? 'Assign Director' : 'Reassign / Dispatch'}</span>
                    </button>

                    {assignment.dispatchSmsThread && assignment.dispatchSmsThread.length > 0 && (
                      <button
                        onClick={() => onOpenAssignModal(assignment)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3 text-[#991b1b]" />
                        <span>View SMS Thread ({assignment.dispatchSmsThread.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IN-HOUSE FULL-TIME STAFF DIRECTORS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'in_house' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <div>
              <h3 className="font-serif-title font-bold text-base text-neutral-900">
                In-House Salaried Funeral Directors (Benta's Dedicated Staff)
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Full-time licensed funeral directors at 630 St. Nicholas Ave. Monitor weekly logged hours, active case custody, and overtime thresholds.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl">
              3 Full-Time NYS LFDs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inHouseDirectors.map((director) => {
              const hoursLogged = director.weeklyHoursLogged || 0;
              const hoursCap = director.weeklyHoursCap || 40;
              const percentUsed = Math.min(100, Math.round((hoursLogged / hoursCap) * 100));
              const isNearOvertime = hoursLogged >= 38;

              return (
                <div
                  key={director.id}
                  className="bg-white rounded-3xl border border-neutral-200 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-serif-title font-bold text-base text-neutral-900">{director.name}</h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-xs font-semibold text-[#991b1b]">{director.title}</p>
                        <p className="text-[11px] text-neutral-400 font-mono">{director.licenseNumber} • {director.yearsExperience} yrs experience</p>
                      </div>
                      <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        ★ {director.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Hours Gauge */}
                    <div className="space-y-1.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-700">Weekly Hours Logged:</span>
                        <strong className={`font-mono ${isNearOvertime ? 'text-red-700' : 'text-neutral-900'}`}>
                          {hoursLogged} / {hoursCap} hrs ({percentUsed}%)
                        </strong>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isNearOvertime ? 'bg-red-600' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                        <span>Active Cases: <strong>{director.activeCasesCount}</strong></span>
                        <span>Overtime Rate: <strong>${director.hourlyOvertimeRate}/hr</strong></span>
                      </div>
                    </div>

                    {/* Overtime Warning / Capacity status */}
                    {isNearOvertime ? (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="text-[11px]">
                          <strong>Overtime Alert:</strong> Recommend assigning Outsourced Trade Director to prevent ${director.hourlyOvertimeRate}/hr surcharge.
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px]">
                          <strong>Optimal Capacity:</strong> {hoursCap - hoursLogged} hours available this week within regular salary.
                        </span>
                      </div>
                    )}

                    {/* Specialties */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Specialties & Honors</span>
                      <div className="flex flex-wrap gap-1">
                        {director.specialties.map((spec, i) => (
                          <span key={i} className="bg-neutral-100 text-neutral-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-mono">{director.phone}</span>
                    <button
                      onClick={() => onUpdateDirectorHours(director.id, 2)}
                      className="text-xs text-[#991b1b] hover:text-red-800 font-bold hover:underline"
                    >
                      + Log 2 hrs Service
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INDEPENDENT CONTRACTOR FUNERAL DIRECTORS (SERVICE ONLY)           */}
      {/* ========================================================================= */}
      {activeTab === 'outsourced' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <div>
              <h3 className="font-serif-title font-bold text-base text-neutral-900">
                Independent Contractor Licensed Funeral Directors (Funeral Services Only)
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Vetted independent licensed funeral directors hired as contractors to direct and lead chapel, church, wake, and graveside committal services (do not make arrangement conferences).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                {outsourcedDirectors.length} Independent Contractor LFDs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outsourcedDirectors.map((director) => (
              <div
                key={director.id}
                className="bg-white rounded-3xl border border-neutral-200 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-serif-title font-bold text-base text-neutral-900">{director.name}</h4>
                        <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.2 rounded-full border border-blue-200">
                          {director.guildAffiliation || 'Trade Guild'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 font-medium">{director.title}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">{director.licenseNumber} • {director.yearsExperience} yrs experience</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        ★ {director.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Rates & Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Per-Diem Rate</span>
                      <strong className="text-neutral-900 font-mono text-sm">${director.perDiemRate}</strong>
                      <span className="text-[9px] text-neutral-400 block">Flat / Service</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Punctuality Score</span>
                      <strong className="text-emerald-700 font-mono text-sm">{director.punctualityScore}%</strong>
                      <span className="text-[9px] text-neutral-400 block">On-Time Arrival</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">YTD Services</span>
                      <strong className="text-neutral-900 font-mono text-sm">{director.ytdServicesCompleted}</strong>
                      <span className="text-[9px] text-neutral-400 block">(${director.ytdEarnings?.toLocaleString()} 1099)</span>
                    </div>
                  </div>

                  {/* Credentials & Insurance verification */}
                  <div className="flex items-center justify-between text-[11px] p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>NYS Bureau of Funeral Directing License & Liability Insurance</span>
                    </div>
                    <strong className="font-bold text-emerald-700">VERIFIED ✅</strong>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Liturgical & Ceremony Strengths</span>
                    <div className="flex flex-wrap gap-1">
                      {director.specialties.map((spec, i) => (
                        <span key={i} className="bg-neutral-100 text-neutral-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
                    <Phone className="w-3 h-3" />
                    <span>{director.phone}</span>
                  </div>

                  <a
                    href={`tel:${director.phone.replace(/[^0-9]/g, '')}`}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                  >
                    Direct Call / SMS
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SMART LABOR COST & SELECTION OPTIMIZER                             */}
      {/* ========================================================================= */}
      {activeTab === 'optimizer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                🧠
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-lg text-neutral-900">
                  Interactive In-House vs. Outsourced Trade Labor Cost Optimizer
                </h3>
                <p className="text-xs text-neutral-500 font-light">
                  Simulate upcoming ceremony parameters to calculate precise overtime break-even points and margin optimization.
                </p>
              </div>
            </div>

            {/* Simulation Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Service Ceremony Type</label>
                <select
                  value={simServiceType}
                  onChange={(e) => setSimServiceType(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 text-neutral-900 font-medium outline-none focus:border-[#991b1b]"
                >
                  <option value="Traditional Service and Burial">Traditional Service and Burial (Church + Cortege)</option>
                  <option value="Funeral Service with Cremation">Funeral Service with Cremation (Chapel)</option>
                  <option value="Cremation and Memorial Service">Cremation and Memorial Service</option>
                  <option value="Graveside Earth Burial & Committal">Graveside Earth Burial & Committal</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">Venue & Travel Logistics</label>
                <select
                  value={simVenue}
                  onChange={(e) => setSimVenue(e.target.value as any)}
                  className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 text-neutral-900 font-medium outline-none focus:border-[#991b1b]"
                >
                  <option value="Main Chapel (630 St Nicholas)">Main Chapel (630 St Nicholas Ave)</option>
                  <option value="External Church / Sanctuary">External Church / Sanctuary (Abyssinian, St. Aloysius)</option>
                  <option value="Graveside Committal">Graveside Committal (Ferncliff, Woodlawn, Calverton)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  In-House Director Current Week Hours: <strong className="text-[#991b1b]">{simAssignedInHouseHours} hrs</strong>
                </label>
                <input
                  type="range"
                  min={20}
                  max={45}
                  step={1}
                  value={simAssignedInHouseHours}
                  onChange={(e) => setSimAssignedInHouseHours(Number(e.target.value))}
                  className="w-full accent-[#991b1b] mt-2"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>20h (Light)</span>
                  <span>40h (Base Cap)</span>
                  <span>45h (High Overtime)</span>
                </div>
              </div>
            </div>

            {/* Simulation Comparison Results */}
            {(() => {
              const serviceDurationHours = simVenue === 'External Church / Sanctuary' ? 5.5 : simVenue === 'Graveside Committal' ? 4.5 : 3.5;
              const projectedHours = simAssignedInHouseHours + serviceDurationHours;
              const overtimeHours = Math.max(0, projectedHours - 40);
              const inHouseHourlyOvertimeRate = 85;
              const inHouseCost = overtimeHours * inHouseHourlyOvertimeRate;
              const outsourcedTradeRate = simVenue === 'External Church / Sanctuary' ? 350 : simVenue === 'Graveside Committal' ? 325 : 300;
              const shouldOutsource = inHouseCost > outsourcedTradeRate || simAssignedInHouseHours >= 38;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Option A: In-House Staff */}
                  <div className={`p-5 rounded-3xl border transition-all ${
                    !shouldOutsource
                      ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-300/40'
                      : 'bg-neutral-50 border-neutral-200 opacity-90'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-700" />
                        <h4 className="font-bold text-sm text-neutral-900">Option A: In-House Staff Director</h4>
                      </div>
                      {!shouldOutsource && (
                        <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          RECOMMENDED
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-500">Service Hours Required:</span>
                        <strong className="font-mono">{serviceDurationHours} hours</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-500">Projected Total Weekly Hours:</span>
                        <strong className={`font-mono ${projectedHours > 40 ? 'text-red-700' : 'text-neutral-900'}`}>
                          {projectedHours.toFixed(1)} / 40.0 hrs
                        </strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-500">Overtime Hours Incurred:</span>
                        <strong className="font-mono text-red-700">{overtimeHours.toFixed(1)} hrs</strong>
                      </div>
                      <div className="flex justify-between pt-2 text-sm font-bold">
                        <span>Net Incremental Cost:</span>
                        <span className="font-mono text-[#991b1b]">
                          {inHouseCost === 0 ? '$0.00 (Salary Base)' : `$${inHouseCost.toFixed(2)} (Overtime)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option B: Outsourced Trade Guild Director */}
                  <div className={`p-5 rounded-3xl border transition-all ${
                    shouldOutsource
                      ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-300/40'
                      : 'bg-neutral-50 border-neutral-200 opacity-90'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-700" />
                        <h4 className="font-bold text-sm text-neutral-900">Option B: Outsourced Trade Guild LFD</h4>
                      </div>
                      {shouldOutsource && (
                        <span className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          RECOMMENDED
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-500">Trade Guild Rate Schedule:</span>
                        <strong className="font-mono">${outsourcedTradeRate}.00 Flat Per-Diem</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-500">Staff Fatigue Impact:</span>
                        <strong className="text-emerald-700">Zero In-House Burnout</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-500">In-House Staff Availability:</span>
                        <strong className="text-neutral-900">Available for Harlem Walk-In Intakes</strong>
                      </div>
                      <div className="flex justify-between pt-2 text-sm font-bold">
                        <span>Total 1099 Disbursement:</span>
                        <span className="font-mono text-blue-800">${outsourcedTradeRate}.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 1099 PAY VOUCHERS & DISBURSEMENT LEDGER                             */}
      {/* ========================================================================= */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <div>
              <h3 className="font-serif-title font-bold text-base text-neutral-900">
                1099 Trade Guild Director Payout & Voucher Settlement Ledger
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Approve per-diem fees for outsourced trade directors upon service completion. Directly routes to Back-Office Finance Hub for ACH disbursement.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                ${vouchers.reduce((acc, v) => acc + v.amount, 0).toLocaleString()} Total Vouchers
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
            {vouchers.map((voucher) => {
              const isPending = voucher.status === 'pending_approval';

              return (
                <div key={voucher.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-neutral-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {voucher.voucherNumber}
                      </span>
                      <strong className="text-sm font-bold text-neutral-900">{voucher.directorName}</strong>
                      <span className="text-neutral-500 font-mono">({voucher.directorLicense})</span>
                    </div>
                    <p className="text-xs text-neutral-700 font-medium">
                      Case <strong className="text-[#991b1b]">{voucher.caseNumber}</strong> • {voucher.decedentName} — {voucher.serviceType}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Service Date: {voucher.serviceDate} {voucher.notes && `• Note: ${voucher.notes}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-neutral-900">${voucher.amount.toFixed(2)}</span>
                      <span className={`block text-[10px] font-bold uppercase ${
                        voucher.status === 'paid_ach'
                          ? 'text-emerald-700'
                          : voucher.status === 'approved_for_payment'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}>
                        {voucher.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {isPending ? (
                      <button
                        onClick={() => onApproveVoucher(voucher.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve ACH Payout</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                        ✓ Approved ({voucher.approvedBy || 'Manager'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
