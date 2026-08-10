import { useState } from 'react';
import type {
  Ticket,
  TicketStatus,
  Priority,
  UserRole,
  TicketFeedback,
  ModelVersion,
  RetrainJob,
  AppNotification,
  Profile
} from './types';
import {
  INITIAL_TICKETS,
  INITIAL_FEEDBACK,
  INITIAL_MODEL_VERSIONS,
  INITIAL_ACCURACY_TREND,
  INITIAL_CONFUSION_MATRIX,
  INITIAL_DRIFT_METRICS,
  INITIAL_PROFILES
} from './services/mockData';
import { Header } from './components/Header';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AgentQueue } from './components/AgentQueue';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('agent');
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [feedbackLog, setFeedbackLog] = useState<TicketFeedback[]>(INITIAL_FEEDBACK);
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>(INITIAL_MODEL_VERSIONS);
  const [activeModelVersion, setActiveModelVersion] = useState<string>('xgb_v3.2.0');
  const [accuracyTrend, setAccuracyTrend] = useState(INITIAL_ACCURACY_TREND);
  const [retrainJob, setRetrainJob] = useState<RetrainJob | null>(null);
  const [users, setUsers] = useState<Profile[]>(INITIAL_PROFILES);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      user_id: 'usr-2',
      ticket_id: 'tck-1001',
      ticket_title: 'Production Database Outage - Payment API Crashing',
      priority: 'critical',
      message: 'New CRITICAL priority ticket created & flagged for immediate SLA response.',
      read: false,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ]);

  const activeModel = modelVersions.find((m) => m.version_tag === activeModelVersion) || modelVersions[0];

  // Handler: Add New Ticket (Customer)
  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);

    if (newTicket.predicted_priority === 'critical' || newTicket.predicted_priority === 'high') {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        user_id: 'all_agents',
        ticket_id: newTicket.id,
        ticket_title: newTicket.title,
        priority: newTicket.predicted_priority,
        message: `New ${newTicket.predicted_priority.toUpperCase()} ticket detected: "${newTicket.title}"`,
        read: false,
        created_at: new Date().toISOString()
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Handler: Update Ticket Status (Agent)
  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );
  };

  // Handler: Override Priority (Agent Triage Feedback Loop)
  const handleOverridePriority = (ticketId: string, newPriority: Priority, reason: string) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              current_priority: newPriority,
              is_overridden: true,
              updated_at: new Date().toISOString()
            }
          : t
      )
    );

    const newFeedback: TicketFeedback = {
      id: `fb-${Date.now()}`,
      ticket_id: ticketId,
      ticket_title: targetTicket.title,
      original_prediction: targetTicket.predicted_priority,
      corrected_priority: newPriority,
      corrected_by: 'usr-2',
      corrected_by_name: 'Sarah Connor',
      reason,
      created_at: new Date().toISOString()
    };

    setFeedbackLog((prev) => [newFeedback, ...prev]);
  };

  // Handler: Assign Agent
  const handleAssignAgent = (ticketId: string, agentName: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assigned_agent_name: agentName } : t))
    );
  };

  // Handler: Trigger Model Retraining Pipeline (Admin / MLOps)
  const handleTriggerRetrain = async () => {
    const jobId = `job-${Math.floor(100 + Math.random() * 900)}`;

    const initialJob: RetrainJob = {
      id: jobId,
      status: 'running',
      triggered_by: 'usr-4',
      triggered_by_name: 'Elena Rostova',
      started_at: new Date().toISOString(),
      progress: 10,
      logs: ['[00:01] Retraining job initialized by Admin.', '[00:02] Pulling labeled feedback records from Supabase...']
    };

    setRetrainJob(initialJob);

    // Step 1: DVC Data Versioning
    await new Promise((r) => setTimeout(r, 1200));
    setRetrainJob((prev) =>
      prev
        ? {
            ...prev,
            progress: 35,
            logs: [
              ...prev.logs,
              `[00:03] Merged ${feedbackLog.length} fresh agent priority overrides into training dataset.`,
              '[00:04] DVC tracking checkpoint: commit hash 4f8a92b.'
            ]
          }
        : null
    );

    // Step 2: XGBoost Hyperparameter Search
    await new Promise((r) => setTimeout(r, 1400));
    setRetrainJob((prev) =>
      prev
        ? {
            ...prev,
            progress: 70,
            logs: [
              ...prev.logs,
              '[00:05] Fitting XGBoost Classifier with TF-IDF n-gram features...',
              '[00:06] MLflow Run ID logged: run_9e8d7c6b.'
            ]
          }
        : null
    );

    // Step 3: Evaluation & Model Promotion
    await new Promise((r) => setTimeout(r, 1200));
    const newVersionTag = `xgb_v3.3.0`;
    const newModelVer: ModelVersion = {
      id: `mv-v${modelVersions.length + 1}`,
      version_tag: newVersionTag,
      mlflow_run_id: 'run_9e8d7c6b',
      macro_f1: 0.912,
      accuracy: 0.93,
      is_active: true,
      trained_at: new Date().toISOString(),
      training_samples: 1420 + feedbackLog.length * 25
    };

    setModelVersions((prev) => [
      newModelVer,
      ...prev.map((m) => ({ ...m, is_active: false }))
    ]);
    setActiveModelVersion(newVersionTag);

    setAccuracyTrend((prev) => [
      ...prev,
      { date: 'Aug 05 (v3.3)', macroF1: 0.912, accuracy: 0.93, overrideRate: 5.2 }
    ]);

    setRetrainJob((prev) =>
      prev
        ? {
            ...prev,
            status: 'succeeded',
            progress: 100,
            resulting_model_version_id: newModelVer.id,
            finished_at: new Date().toISOString(),
            logs: [
              ...prev.logs,
              `[00:07] Validation Macro-F1: 0.912 >= 0.75 target threshold. PASS!`,
              `[00:08] PROMOTED version ${newVersionTag} to active production serving!`
            ]
          }
        : null
    );
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-teal-600 selection:text-white">
      {/* Persistent Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        activeModelVersion={activeModelVersion}
        macroF1={activeModel.macro_f1}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'customer' && (
          <CustomerDashboard
            tickets={tickets}
            onAddTicket={handleAddTicket}
            activeModelVersion={activeModelVersion}
          />
        )}

        {currentRole === 'agent' && (
          <AgentQueue
            tickets={tickets}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onOverridePriority={handleOverridePriority}
            onAssignAgent={handleAssignAgent}
            feedbackLog={feedbackLog}
          />
        )}

        {(currentRole === 'admin' || currentRole === 'mlops') && (
          <AdminDashboard
            modelVersions={modelVersions}
            activeVersion={activeModelVersion}
            onTriggerRetrain={handleTriggerRetrain}
            retrainJob={retrainJob}
            accuracyTrend={accuracyTrend}
            confusionMatrix={INITIAL_CONFUSION_MATRIX}
            driftMetrics={INITIAL_DRIFT_METRICS}
            users={users}
            onUpdateUserRole={handleUpdateUserRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SmartSupport MLOps Platform</span>
            <span>• Google Stitch UI/UX Design System (`8994567368415573183`)</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>FastAPI + XGBoost + React Vite</span>
            <span>MLflow + Supabase Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
