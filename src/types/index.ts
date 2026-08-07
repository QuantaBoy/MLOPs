export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type UserRole = 'customer' | 'agent' | 'admin' | 'mlops';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface PredictionResult {
  priority: Priority;
  confidence: number;
  model_version: string;
  top_tokens: { token: string; weight: number }[];
}

export interface Ticket {
  id: string;
  requester_id: string;
  requester_name: string;
  title: string;
  description: string;
  category?: string;
  status: TicketStatus;
  predicted_priority: Priority;
  prediction_confidence: number;
  current_priority: Priority;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  model_version: string;
  created_at: string;
  updated_at: string;
  is_overridden?: boolean;
}

export interface TicketFeedback {
  id: string;
  ticket_id: string;
  ticket_title: string;
  original_prediction: Priority;
  corrected_priority: Priority;
  corrected_by: string;
  corrected_by_name: string;
  reason?: string;
  created_at: string;
}

export interface ModelVersion {
  id: string;
  version_tag: string;
  mlflow_run_id: string;
  macro_f1: number;
  accuracy: number;
  is_active: boolean;
  trained_at: string;
  training_samples: number;
}

export interface RetrainJob {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  triggered_by: string;
  triggered_by_name: string;
  resulting_model_version_id?: string;
  started_at: string;
  finished_at?: string;
  progress: number;
  logs: string[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  ticket_id: string;
  ticket_title: string;
  priority: Priority;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AccuracyTrendPoint {
  date: string;
  macroF1: number;
  accuracy: number;
  overrideRate: number;
}

export interface ConfusionMatrixCell {
  actual: Priority;
  predicted: Priority;
  count: number;
}

export interface DriftMetric {
  feature: string;
  drift_score: number;
  has_drift: boolean;
  threshold: number;
}
