import React, { useState } from 'react';
import type { Ticket, PredictionResult } from '../types';
import { predictTicketPriority } from '../services/mlClassifier';
import { PriorityBadge } from './PriorityBadge';
import { PlusCircle, Sparkles, Send, ShieldCheck, X } from 'lucide-react';

interface CustomerDashboardProps {
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  activeModelVersion: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  tickets,
  onAddTicket,
  activeModelVersion
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [orgName, setOrgName] = useState('Acme Corp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [lastSubmittedTicket, setLastSubmittedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedTicketModal, setSelectedTicketModal] = useState<Ticket | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setPrediction(null);

    const result = await predictTicketPriority(title, description, activeModelVersion);
    setPrediction(result);

    const newTicket: Ticket = {
      id: `tck-${Math.floor(1000 + Math.random() * 9000)}`,
      requester_id: 'usr-1',
      requester_name: `Alex Johnson (${orgName})`,
      title,
      description,
      category,
      status: 'open',
      predicted_priority: result.priority,
      prediction_confidence: result.confidence,
      current_priority: result.priority,
      model_version: result.model_version,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onAddTicket(newTicket);
    setLastSubmittedTicket(newTicket);
    setIsSubmitting(false);

    // Clear inputs
    setTitle('');
    setDescription('');
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'open') return t.status === 'open' || t.status === 'in_progress';
    if (statusFilter === 'resolved') return t.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Executive NLP ML Priority Classifier
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Submit a Support Ticket</h2>
          <p className="text-sm text-slate-600 mt-1">
            Our machine learning engine analyzes your issue description in real-time to categorize urgency and route directly to targeted SLA teams.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <span>Connected to <strong>Inference API v3.2.0</strong></span>
          <span className="text-slate-300">•</span>
          <span className="text-teal-700 font-bold">120ms Latency</span>
        </div>
      </div>

      {/* Two-Column Layout (7:5 Ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: New Ticket Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
              <PlusCircle className="w-5 h-5 text-teal-700" />
              New Ticket Details
            </h3>

            <form onSubmit={handlePredict} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Issue Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Production API Returning 500 Errors on Checkout"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                  >
                    <option value="Infrastructure">Infrastructure &amp; Cloud</option>
                    <option value="Security">Security &amp; Auth</option>
                    <option value="API / Export">API / Payment Gateway</option>
                    <option value="Billing">Billing &amp; Subscription</option>
                    <option value="Performance">Performance &amp; Latency</option>
                    <option value="UI / UX">UI / UX Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Organization / Account
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Issue Description &amp; Reproduction Steps <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail including stack traces, error messages, affected API endpoints..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all resize-y"
                />
              </div>

              {/* Live AI Inference Preview Box */}
              {title.trim().length > 5 && (
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-700" />
                      Live AI Priority Inference Preview
                    </span>
                    <span className="text-[10px] font-mono text-teal-800 font-bold">XGBoost v3.2.0</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-teal-100">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">Predicted Category Priority</span>
                      <div className="mt-1 flex items-center gap-2">
                        <PriorityBadge priority={description.toLowerCase().includes('500') || title.toLowerCase().includes('outage') ? 'critical' : 'high'} size="md" pulse />
                        <span className="text-xs font-bold text-slate-800">
                          Target SLA: {description.toLowerCase().includes('500') ? '< 15 Minutes' : '< 1 Hour'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Confidence Score</span>
                      <span className="text-sm font-bold font-mono text-emerald-700">94.8%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">TF-IDF Extracted Terms:</span>
                    {['#api', '#500 error', '#production', '#outage'].map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white text-[11px] font-mono text-teal-900 border border-teal-200 font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !description}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-teal-600/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing NLP Ticket Classification...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Tracking History & Ticket Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Result Card if submitted */}
          {prediction && lastSubmittedTicket && (
            <div className="bg-white p-6 rounded-2xl border border-teal-300 shadow-md animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-teal-700" /> Ticket Successfully Filed
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">#{lastSubmittedTicket.id}</span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Priority Level</span>
                  <div className="mt-1 flex items-center justify-between">
                    <PriorityBadge priority={prediction.priority} size="lg" pulse />
                    <span className="text-xs font-mono font-bold text-emerald-700">{(prediction.confidence * 100).toFixed(1)}% Confident</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Your ticket has been ingested into the agent triage pipeline. An agent will respond according to the <strong>{prediction.priority.toUpperCase()} Priority SLA</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Recent Tickets List Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Your Ticket History</h3>
              
              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === 'open' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Open
                </button>
                <button
                  onClick={() => setStatusFilter('resolved')}
                  className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No tickets found in history.
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketModal(t)}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-700">#{t.id}</span>
                      <PriorityBadge priority={t.current_priority} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                      {t.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="px-2 py-0.5 rounded bg-slate-200/60 font-medium">{t.category}</span>
                      <span className="font-mono text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Ticket Details Modal */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">#{selectedTicketModal.id}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedTicketModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTicketModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-medium">Assigned Priority</span>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedTicketModal.current_priority} size="md" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">AI Model Confidence</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {(selectedTicketModal.prediction_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Issue Description</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-sans">
                  {selectedTicketModal.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px] pt-2 border-t border-slate-100">
                <span>Model: {selectedTicketModal.model_version}</span>
                <span>Submitted: {new Date(selectedTicketModal.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTicketModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
