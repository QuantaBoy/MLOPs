import type {
  Ticket,
  TicketFeedback,
  ModelVersion,
  AccuracyTrendPoint,
  ConfusionMatrixCell,
  DriftMetric,
  Profile
} from '../types';

export const INITIAL_PROFILES: Profile[] = [
  { id: 'usr-1', full_name: 'Alex Johnson', email: 'alex@company.com', role: 'customer', created_at: '2026-06-01T10:00:00Z' },
  { id: 'usr-2', full_name: 'Sarah Connor', email: 'sarah.c@company.com', role: 'agent', created_at: '2026-05-15T08:30:00Z' },
  { id: 'usr-3', full_name: 'David Miller', email: 'david.m@company.com', role: 'agent', created_at: '2026-05-20T09:15:00Z' },
  { id: 'usr-4', full_name: 'Elena Rostova (Admin)', email: 'elena.admin@company.com', role: 'admin', created_at: '2026-04-01T11:00:00Z' },
  { id: 'usr-5', full_name: 'Marcus Vance (MLOps)', email: 'marcus.ml@company.com', role: 'mlops', created_at: '2026-04-10T14:20:00Z' }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tck-1001',
    requester_id: 'usr-1',
    requester_name: 'Alex Johnson',
    title: 'Production Database Outage - Payment API Crashing',
    description: 'Our primary Postgres server in us-east-1 is throwing fatal connection reset errors. All incoming customer checkout transactions are failing immediately with 500 error codes.',
    category: 'Infrastructure',
    status: 'open',
    predicted_priority: 'critical',
    prediction_confidence: 0.96,
    current_priority: 'critical',
    assigned_agent_id: 'usr-2',
    assigned_agent_name: 'Sarah Connor',
    model_version: 'xgb_v3',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'tck-1002',
    requester_id: 'usr-1',
    requester_name: 'Alex Johnson',
    title: 'Security Vulnerability - JWT Auth Token Leak in URL Parameters',
    description: 'Spotted plain-text JWT tokens being appended to query params during OAuth redirect flow. Needs immediate patch to prevent session hijacking.',
    category: 'Security',
    status: 'in_progress',
    predicted_priority: 'critical',
    prediction_confidence: 0.91,
    current_priority: 'critical',
    assigned_agent_id: 'usr-3',
    assigned_agent_name: 'David Miller',
    model_version: 'xgb_v3',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'tck-1003',
    requester_id: 'usr-1',
    requester_name: 'Alex Johnson',
    title: 'CSV Data Export Timing Out on Large Datasets',
    description: 'When attempting to export more than 50,000 transaction records, the HTTP request times out after 30 seconds without returning a file download link.',
    category: 'API / Export',
    status: 'open',
    predicted_priority: 'high',
    prediction_confidence: 0.88,
    current_priority: 'high',
    assigned_agent_id: 'usr-2',
    assigned_agent_name: 'Sarah Connor',
    model_version: 'xgb_v3',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tck-1004',
    requester_id: 'usr-1',
    requester_name: 'Alex Johnson',
    title: 'Slow Dashboard Load Time During Peak Hours',
    description: 'Analytics widgets take up to 6.5 seconds to render when loading team performance metrics between 2 PM and 4 PM EST.',
    category: 'Performance',
    status: 'in_progress',
    predicted_priority: 'medium',
    prediction_confidence: 0.79,
    current_priority: 'high', // Overridden by agent!
    assigned_agent_id: 'usr-3',
    assigned_agent_name: 'David Miller',
    model_version: 'xgb_v3',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    is_overridden: true
  },
  {
    id: 'tck-1005',
    requester_id: 'usr-1',
    requester_name: 'Alex Johnson',
    title: 'Billing Invoice Address Line 2 Formatting Glitch',
    description: 'The PDF generator truncates suite numbers if line 2 contains special characters like "#" or "&".',
    category: 'Billing',
    status: 'resolved',
    predicted_priority: 'medium',
    prediction_confidence: 0.84,
    current_priority: 'medium',
    assigned_agent_id: 'usr-2',
    assigned_agent_name: 'Sarah Connor',
    model_version: 'xgb_v3',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tck-1006',
    requester_id: 'usr-1',
    requester_name: 'Alex Johnson',
    title: 'Update Dark Mode Navbar Alignment & Icon Spacing',
    description: 'Minor cosmetic issue: search bar icon is misaligned by 3px on Safari browser windows wider than 1440px.',
    category: 'UI / UX',
    status: 'closed',
    predicted_priority: 'low',
    prediction_confidence: 0.94,
    current_priority: 'low',
    assigned_agent_id: 'usr-3',
    assigned_agent_name: 'David Miller',
    model_version: 'xgb_v3',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_FEEDBACK: TicketFeedback[] = [
  {
    id: 'fb-101',
    ticket_id: 'tck-1004',
    ticket_title: 'Slow Dashboard Load Time During Peak Hours',
    original_prediction: 'medium',
    corrected_priority: 'high',
    corrected_by: 'usr-3',
    corrected_by_name: 'David Miller',
    reason: 'Affects executive team SLA reporting during live trading sessions.',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-102',
    ticket_id: 'tck-0992',
    ticket_title: 'User unable to reset password via SMS token',
    original_prediction: 'low',
    corrected_priority: 'medium',
    corrected_by: 'usr-2',
    corrected_by_name: 'Sarah Connor',
    reason: 'Authentication blocker for tier-1 enterprise customer.',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_MODEL_VERSIONS: ModelVersion[] = [
  {
    id: 'mv-v3',
    version_tag: 'xgb_v3',
    mlflow_run_id: 'run_8f9a2b71',
    macro_f1: 0.81,
    accuracy: 0.86,
    is_active: true,
    trained_at: '2026-07-28T14:30:00Z',
    training_samples: 1420
  },
  {
    id: 'mv-v2',
    version_tag: 'logreg_v2',
    mlflow_run_id: 'run_3c4d5e6f',
    macro_f1: 0.74,
    accuracy: 0.79,
    is_active: false,
    trained_at: '2026-07-10T10:00:00Z',
    training_samples: 1100
  },
  {
    id: 'mv-v1',
    version_tag: 'baseline_tfidf_v1',
    mlflow_run_id: 'run_1a2b3c4d',
    macro_f1: 0.68,
    accuracy: 0.73,
    is_active: false,
    trained_at: '2026-06-15T09:00:00Z',
    training_samples: 750
  }
];

export const INITIAL_ACCURACY_TREND: AccuracyTrendPoint[] = [
  { date: 'Jul 01', macroF1: 0.73, accuracy: 0.77, overrideRate: 18.5 },
  { date: 'Jul 07', macroF1: 0.75, accuracy: 0.79, overrideRate: 16.2 },
  { date: 'Jul 14', macroF1: 0.77, accuracy: 0.81, overrideRate: 14.8 },
  { date: 'Jul 21', macroF1: 0.76, accuracy: 0.80, overrideRate: 15.4 },
  { date: 'Jul 28', macroF1: 0.81, accuracy: 0.86, overrideRate: 11.2 },
  { date: 'Aug 04', macroF1: 0.82, accuracy: 0.87, overrideRate: 9.8 }
];

export const INITIAL_CONFUSION_MATRIX: ConfusionMatrixCell[] = [
  { actual: 'critical', predicted: 'critical', count: 48 },
  { actual: 'critical', predicted: 'high', count: 3 },
  { actual: 'critical', predicted: 'medium', count: 1 },
  { actual: 'critical', predicted: 'low', count: 0 },

  { actual: 'high', predicted: 'critical', count: 4 },
  { actual: 'high', predicted: 'high', count: 142 },
  { actual: 'high', predicted: 'medium', count: 9 },
  { actual: 'high', predicted: 'low', count: 1 },

  { actual: 'medium', predicted: 'critical', count: 1 },
  { actual: 'medium', predicted: 'high', count: 12 },
  { actual: 'medium', predicted: 'medium', count: 310 },
  { actual: 'medium', predicted: 'low', count: 8 },

  { actual: 'low', predicted: 'critical', count: 0 },
  { actual: 'low', predicted: 'high', count: 2 },
  { actual: 'low', predicted: 'medium', count: 15 },
  { actual: 'low', predicted: 'low', count: 240 }
];

export const INITIAL_DRIFT_METRICS: DriftMetric[] = [
  { feature: 'tf_idf_outage_freq', drift_score: 0.03, has_drift: false, threshold: 0.05 },
  { feature: 'tf_idf_crash_freq', drift_score: 0.02, has_drift: false, threshold: 0.05 },
  { feature: 'description_char_len', drift_score: 0.04, has_drift: false, threshold: 0.05 },
  { feature: 'tf_idf_payment_freq', drift_score: 0.07, has_drift: true, threshold: 0.05 },
  { feature: 'title_word_count', drift_score: 0.01, has_drift: false, threshold: 0.05 }
];
