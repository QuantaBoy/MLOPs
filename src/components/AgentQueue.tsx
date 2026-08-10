import React, { useState } from 'react';
import type { Ticket, Priority, TicketStatus, TicketFeedback } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import {
  Search,
  CheckSquare,
  Edit3,
  History,
  X,
  ChevronRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  Info
} from 'lucide-react';

interface AgentQueueProps {
  tickets: Ticket[];
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onOverridePriority: (ticketId: string, newPriority: Priority, reason: string) => void;
  onAssignAgent: (ticketId: string, agentName: string) => void;
  feedbackLog: TicketFeedback[];
}

export const AgentQueue: React.FC<AgentQueueProps> = ({
  tickets,
  onUpdateTicketStatus,
  onOverridePriority,
  onAssignAgent,
  feedbackLog
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overridePriority, setOverridePriority] = useState<Priority>('critical');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  const priorityRank: Record<Priority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const filteredTickets = tickets
    .filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.current_priority === priorityFilter;
      const matchesAssignment =
        assignmentFilter === 'all'
          ? true
          : assignmentFilter === 'unassigned'
          ? !t.assigned_agent_name
          : t.assigned_agent_name === 'Sarah Connor';
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.requester_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesAssignment && matchesSearch;
    })
    .sort((a, b) => priorityRank[b.current_priority] - priorityRank[a.current_priority]);

  const criticalCount = tickets.filter((t) => t.current_priority === 'critical' && t.status !== 'resolved').length;
  const unassignedCount = tickets.filter((t) => !t.assigned_agent_name && t.status !== 'resolved').length;

  const handleOpenOverride = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOverridePriority(ticket.current_priority);
    setOverrideReason('');
    setShowOverrideModal(true);
  };

  const handleSubmitOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    onOverridePriority(selectedTicket.id, overridePriority, overrideReason);
    setShowOverrideModal(false);
    setSelectedTicket({
      ...selectedTicket,
      current_priority: overridePriority,
      is_overridden: true
    });
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.length === filteredTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredTickets.map((t) => t.id));
    }
  };

  const toggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const quickReasonChips = [
    'Enterprise VIP SLA',
    'False Positive Keyword',
    'Non-blocking Issue',
    'User Error',
    'Escalated by Account Mgr'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* KPI Summary Cards Grid (5 Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Active Tickets</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">{tickets.length}</span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.4%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unassigned Queue</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-teal-700 font-mono">{unassignedCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">Needs agent</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs space-y-1 bg-red-50/40">
          <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Critical SLA Urgent
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-red-700 font-mono">{criticalCount}</span>
            <span className="text-[11px] text-red-700 font-bold uppercase tracking-wider">Target &lt; 15m</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg First Response</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">11m 45s</span>
            <span className="text-[11px] text-teal-700 font-bold">Optimal</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs space-y-1 bg-orange-50/30">
          <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider">Overrides Logged</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-800 font-mono">{feedbackLog.length}</span>
            <span className="text-[11px] text-orange-700 font-medium">Pending Retrain</span>
          </div>
        </div>
      </div>

      {/* Main Header & View Tab Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Support Agent Priority Triage Queue</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time ticket queue prioritized by XGBoost NLP inference engine with automated SLA timer tracking.
          </p>
        </div>

        {/* Queue vs Override Audit Log Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'queue' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Triage Queue ({tickets.filter((t) => t.status !== 'closed').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'history' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Override Audit Log ({feedbackLog.length})
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Ticket ID, Org, Title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:bg-white focus:border-teal-600"
              >
                <option value="all">Priority: All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:bg-white focus:border-teal-600"
              >
                <option value="all">Status: All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Assignment Filter */}
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:bg-white focus:border-teal-600"
              >
                <option value="all">Assigned: All</option>
                <option value="mine">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Batch Action Buttons */}
            {selectedTicketIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{selectedTicketIds.length} selected</span>
                <button
                  onClick={() => {
                    selectedTicketIds.forEach((id) => onAssignAgent(id, 'Sarah Connor'));
                    setSelectedTicketIds([]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100"
                >
                  Assign to Me
                </button>
              </div>
            )}
          </div>

          {/* Sorted Priority Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 uppercase font-bold text-slate-500 text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={selectedTicketIds.length === filteredTickets.length && filteredTickets.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="py-3 px-4">Ticket ID &amp; Category</th>
                    <th className="py-3 px-4">Title &amp; Organization</th>
                    <th className="py-3 px-4">AI vs Agent Priority</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">SLA Countdown</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No tickets matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => {
                      const isCritical = t.current_priority === 'critical';
                      const isSelected = selectedTicketIds.includes(t.id);
                      return (
                        <tr
                          key={t.id}
                          className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${
                            isCritical ? 'row-critical' : t.current_priority === 'high' ? 'row-high' : ''
                          }`}
                          onClick={() => setSelectedTicket(t)}
                        >
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectTicket(t.id)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-teal-700">{t.id}</div>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {t.category || 'Infrastructure'}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{t.title}</div>
                            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{t.requester_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <PriorityBadge priority={t.current_priority} size="sm" pulse={isCritical} />
                              {t.is_overridden && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-200">
                                  Override
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 w-32">
                            <ConfidenceMeter confidence={t.prediction_confidence} />
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={t.assigned_agent_name || ''}
                              onChange={(e) => onAssignAgent(t.id, e.target.value)}
                              className="bg-transparent border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:bg-white focus:border-teal-600"
                            >
                              <option value="">Unassigned</option>
                              <option value="Sarah Connor">Sarah Connor</option>
                              <option value="David Miller">David Miller</option>
                              <option value="Elena Rostova">Elena Rostova</option>
                            </select>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={t.status}
                              onChange={(e) => onUpdateTicketStatus(t.id, e.target.value as TicketStatus)}
                              className={`border rounded px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                                t.status === 'open'
                                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                                  : t.status === 'in_progress'
                                  ? 'bg-orange-50 text-orange-800 border-orange-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                                <Clock className="w-3 h-3 text-red-600" /> 14m left
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-500">&lt; 2h SLA</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenOverride(t)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-orange-700 hover:bg-slate-100 transition-colors"
                                title="Override AI Priority"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedTicket(t)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                                title="View Ticket"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Override Audit Log History View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-700" />
              Agent Priority Override Audit Log (Supabase Retraining Dataset)
            </h3>
            <span className="text-xs font-mono text-slate-500">Total samples: {feedbackLog.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase font-bold text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Original Prediction</th>
                  <th className="py-3 px-4">Agent Corrected</th>
                  <th className="py-3 px-4">Agent &amp; Reason</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackLog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No agent priority overrides recorded yet.
                    </td>
                  </tr>
                ) : (
                  feedbackLog.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-teal-700">{fb.ticket_id}</span>
                        <div className="font-bold text-slate-900 truncate max-w-xs">{fb.ticket_title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={fb.original_prediction} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={fb.corrected_priority} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{fb.corrected_by_name}</div>
                        <div className="text-slate-500 italic mt-0.5">"{fb.reason || 'No reason specified'}"</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(fb.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Priority Override Drawer Modal (Matching Stitch screen 0e0090687cb94d8d97b38feca6eb61d8) */}
      {showOverrideModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-700" />
                  Override AI Priority Level
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Ticket #{selectedTicket.id}: {selectedTicket.title}
                </p>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOverride} className="p-6 space-y-5">
              
              {/* Original AI Inference Summary Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Original AI Model Inference</span>
                  <span className="font-mono text-teal-800 font-bold">XGBoost v3.2.0</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Predicted Priority:</span>
                  <PriorityBadge priority={selectedTicket.predicted_priority} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {(selectedTicket.prediction_confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">Detected Key Terms:</span>
                  <div className="flex flex-wrap gap-1">
                    {['api', '500 error', 'production', 'outage'].map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white text-[10px] font-mono text-slate-700 border border-slate-200">
                        '{kw}'
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Select Correct Priority Card Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Corrected Priority Level <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setOverridePriority(p)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                        overridePriority === p
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PriorityBadge priority={p} size="sm" />
                      {overridePriority === p && <CheckSquare className="w-4 h-4 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Reason with Quick Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Override Reason <span className="text-red-600">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickReasonChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setOverrideReason(chip)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 border border-slate-200"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain rationale for overriding priority..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                />
              </div>

              {/* MLOps Retrain Pipeline Notice Box */}
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  This override will be logged directly into the Supabase training dataset to retrain the next XGBoost model iteration.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                >
                  Submit Priority Correction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
