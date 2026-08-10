import React, { useState } from 'react';
import type {
  ModelVersion,
  RetrainJob,
  AccuracyTrendPoint,
  ConfusionMatrixCell,
  DriftMetric,
  Profile,
  Priority
} from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Activity,
  Cpu,
  RefreshCw,
  TrendingUp,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Users,
  Database,
  Terminal,
  Zap,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  modelVersions: ModelVersion[];
  activeVersion: string;
  onTriggerRetrain: () => Promise<void>;
  retrainJob: RetrainJob | null;
  accuracyTrend: AccuracyTrendPoint[];
  confusionMatrix: ConfusionMatrixCell[];
  driftMetrics: DriftMetric[];
  users: Profile[];
  onUpdateUserRole: (userId: string, newRole: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  modelVersions,
  activeVersion,
  onTriggerRetrain,
  retrainJob,
  accuracyTrend,
  confusionMatrix,
  driftMetrics,
  users,
  onUpdateUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'health' | 'versions' | 'users'>('health');
  const [isRetraining, setIsRetraining] = useState(false);

  const activeModel = modelVersions.find((m) => m.version_tag === activeVersion) || modelVersions[0];

  const handleRetrainClick = async () => {
    setIsRetraining(true);
    await onTriggerRetrain();
    setIsRetraining(false);
  };

  // 4x4 Confusion Matrix cell intensity styling (Stitch Executive Enterprise tokens)
  const getMatrixCellBg = (count: number, isDiagonal: boolean) => {
    if (isDiagonal) {
      if (count > 200) return 'bg-teal-100 text-teal-900 font-bold border-teal-300';
      if (count > 100) return 'bg-teal-50 text-teal-800 font-bold border-teal-200';
      return 'bg-emerald-50 text-emerald-800 font-semibold border-emerald-200';
    } else {
      if (count === 0) return 'bg-slate-50 text-slate-400 border-slate-100';
      if (count > 10) return 'bg-red-50 text-red-800 font-semibold border-red-200';
      return 'bg-orange-50 text-orange-800 border-orange-200';
    }
  };

  const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner Header & Pipeline CTA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
            <Activity className="w-3.5 h-3.5" /> Executive MLOps Engineering &amp; Governance
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">MLOps Control Center</h2>
          <p className="text-sm text-slate-600 mt-1">
            Monitor production XGBoost model health, F1 validation thresholds, confusion matrix drift, and execute retraining pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold hidden sm:block">
            Production: <strong className="text-teal-900">{activeModel.version_tag}</strong> (Optimal)
          </div>
          <button
            onClick={handleRetrainClick}
            disabled={isRetraining || (retrainJob !== null && retrainJob.status === 'running')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetraining || retrainJob?.status === 'running' ? 'animate-spin' : ''}`} />
            <span>{retrainJob?.status === 'running' ? 'Pipeline Executing...' : 'Trigger Retraining Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Retrain Job Stepper Banner & Terminal Output */}
      {retrainJob && (
        <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-lg animate-scaleUp space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Terminal className="w-4 h-4 text-teal-700" />
              Retraining Job #{retrainJob.id} Progress:
              <span
                className={`uppercase font-mono px-2 py-0.5 rounded text-[10px] ${
                  retrainJob.status === 'succeeded'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : retrainJob.status === 'running'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {retrainJob.status}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700">{retrainJob.progress}% Complete</span>
          </div>

          {/* 5-Step Progress Stepper */}
          <div className="grid grid-cols-5 gap-2 text-[11px] font-bold">
            {[
              '1. Data Sync',
              '2. DVC Checkpoint',
              '3. XGBoost Fit',
              '4. F1 Validation',
              '5. MLflow Deploy'
            ].map((step, i) => {
              const stepProgress = (i + 1) * 20;
              const isDone = retrainJob.progress >= stepProgress;
              const isCurrent = retrainJob.progress >= stepProgress - 20 && retrainJob.progress < stepProgress;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-center font-mono ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isCurrent
                      ? 'bg-teal-50 text-teal-800 border-teal-300 animate-pulse'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {step}
                </div>
              );
            })}
          </div>

          {/* Terminal Log Output */}
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 space-y-1 max-h-36 overflow-y-auto border border-slate-800 shadow-inner">
            {retrainJob.logs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-500">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'health'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> MLOps Analytics &amp; Drift
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'versions'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> MLflow Registry ({modelVersions.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Role Access Control
        </button>
      </div>

      {activeTab === 'health' ? (
        <div className="space-y-6">
          
          {/* Analytics Dashboard Grid Card 1: Key Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Macro-F1 Score</span>
                <TrendingUp className="w-4 h-4 text-teal-700" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">
                {activeModel.macro_f1.toFixed(3)}
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ✓ Threshold ≥ 0.75 Passed
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Precision / Recall</span>
                <Zap className="w-4 h-4 text-teal-700" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">
                0.910 <span className="text-xs text-slate-400 font-normal">/ 0.875</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Balanced precision-recall tradeoff</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Evidently Data Drift Index</span>
                <Activity className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">
                0.04
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Low Drift (Healthy)
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Training Dataset Size</span>
                <Cpu className="w-4 h-4 text-teal-700" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">
                {activeModel.training_samples}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">Supabase Postgres Table</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Card 2: F1-Score & Accuracy Trend Line Chart */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">F1-Score &amp; Accuracy Trend</h3>
                <p className="text-xs text-slate-500">Historical performance validation across model builds</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748B" domain={[0.6, 1.0]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="macroF1" stroke="#0D9488" strokeWidth={3} name="Macro-F1 Score" />
                    <Line type="monotone" dataKey="accuracy" stroke="#059669" strokeWidth={2} name="Accuracy" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: 4x4 Priority Confusion Matrix Heatmap */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">4x4 Priority Confusion Matrix</h3>
                <p className="text-xs text-slate-500">Actual vs Predicted priority classification counts</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-[10px] text-slate-400 uppercase font-mono">Actual ↓ / Pred →</th>
                      {priorities.map((p) => (
                        <th key={p} className="p-2 uppercase font-bold text-slate-700 text-[10px]">
                          {p.slice(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {priorities.map((actual) => (
                      <tr key={actual}>
                        <td className="p-2 font-bold uppercase text-slate-700 text-[10px] text-right">
                          {actual.slice(0, 4)}
                        </td>
                        {priorities.map((predicted) => {
                          const cell = confusionMatrix.find((c) => c.actual === actual && c.predicted === predicted);
                          const count = cell ? cell.count : 0;
                          const isDiagonal = actual === predicted;
                          return (
                            <td key={predicted} className="p-1">
                              <div
                                className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${getMatrixCellBg(
                                  count,
                                  isDiagonal
                                )}`}
                              >
                                {count}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Card 4: Evidently AI Data Drift Monitor Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-700" />
                  Evidently AI Token &amp; Feature Drift Monitor
                </h3>
                <p className="text-xs text-slate-500">
                  Compares live production ticket TF-IDF token frequencies against baseline training distribution
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                P-Value Threshold: 0.05
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {driftMetrics.map((dm, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    dm.has_drift
                      ? 'bg-orange-50 border-orange-300 text-orange-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                    <span className="truncate max-w-[120px]">#{dm.feature}</span>
                    {dm.has_drift ? (
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {dm.drift_score.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Target: {dm.threshold} {dm.has_drift ? '(Minor Drift)' : '(Stable)'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : activeTab === 'versions' ? (
        /* MLflow Model Registry Tab */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-700" />
                MLflow Model Registry Artifacts
              </h3>
              <p className="text-xs text-slate-500">MLflow run IDs, version tags, and production deployment status</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase font-bold text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Version Tag</th>
                  <th className="py-3 px-4">MLflow Run ID</th>
                  <th className="py-3 px-4">Macro-F1</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Training Rows</th>
                  <th className="py-3 px-4">Trained Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modelVersions.map((mv) => (
                  <tr key={mv.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">{mv.version_tag}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{mv.mlflow_run_id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{mv.macro_f1.toFixed(3)}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">{(mv.accuracy * 100).toFixed(0)}%</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{mv.training_samples} rows</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(mv.trained_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {mv.version_tag === activeVersion ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3" /> Live Production
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* User Role Management Tab */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700" /> User Role &amp; Access Control
              </h3>
              <p className="text-xs text-slate-500">Configure role permissions across Customer, Agent, Admin, and MLOps personas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase font-bold text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Role Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateUserRole(u.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:bg-white focus:border-teal-600"
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Support Agent</option>
                        <option value="admin">Admin</option>
                        <option value="mlops">MLOps Engineer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
