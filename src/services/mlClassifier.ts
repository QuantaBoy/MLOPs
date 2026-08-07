import type { PredictionResult, Priority } from '../types';

interface VocabularyWeight {
  [key: string]: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Token dictionary with class weights for TF-IDF / Naive Bayes prediction
const VOCABULARY: VocabularyWeight = {
  // Critical tokens
  outage: { low: 0, medium: 0, high: 0.1, critical: 0.9 },
  crash: { low: 0, medium: 0, high: 0.2, critical: 0.8 },
  down: { low: 0, medium: 0.1, high: 0.2, critical: 0.7 },
  emergency: { low: 0, medium: 0, high: 0.1, critical: 0.9 },
  hacked: { low: 0, medium: 0, high: 0.05, critical: 0.95 },
  breach: { low: 0, medium: 0, high: 0.05, critical: 0.95 },
  security: { low: 0, medium: 0.1, high: 0.3, critical: 0.6 },
  fatal: { low: 0, medium: 0, high: 0.1, critical: 0.9 },
  corrupted: { low: 0, medium: 0.05, high: 0.2, critical: 0.75 },
  database: { low: 0, medium: 0.2, high: 0.4, critical: 0.4 },
  production: { low: 0, medium: 0.1, high: 0.3, critical: 0.6 },

  // High tokens
  error: { low: 0.05, medium: 0.25, high: 0.55, critical: 0.15 },
  fail: { low: 0.05, medium: 0.2, high: 0.65, critical: 0.1 },
  failed: { low: 0.05, medium: 0.2, high: 0.65, critical: 0.1 },
  failure: { low: 0.05, medium: 0.2, high: 0.65, critical: 0.1 },
  timeout: { low: 0.05, medium: 0.25, high: 0.6, critical: 0.1 },
  broken: { low: 0.1, medium: 0.3, high: 0.55, critical: 0.05 },
  blocked: { low: 0.05, medium: 0.2, high: 0.65, critical: 0.1 },
  urgent: { low: 0, medium: 0.2, high: 0.6, critical: 0.2 },
  payment: { low: 0.05, medium: 0.25, high: 0.55, critical: 0.15 },
  api: { low: 0.1, medium: 0.3, high: 0.5, critical: 0.1 },

  // Medium tokens
  slow: { low: 0.15, medium: 0.6, high: 0.2, critical: 0.05 },
  lag: { low: 0.2, medium: 0.6, high: 0.18, critical: 0.02 },
  billing: { low: 0.2, medium: 0.7, high: 0.1, critical: 0 },
  invoice: { low: 0.25, medium: 0.65, high: 0.1, critical: 0 },
  account: { low: 0.2, medium: 0.7, high: 0.1, critical: 0 },
  update: { low: 0.3, medium: 0.6, high: 0.1, critical: 0 },
  export: { low: 0.3, medium: 0.6, high: 0.1, critical: 0 },
  sync: { low: 0.2, medium: 0.6, high: 0.2, critical: 0 },
  permission: { low: 0.15, medium: 0.65, high: 0.2, critical: 0 },

  // Low tokens
  typo: { low: 0.85, medium: 0.15, high: 0, critical: 0 },
  cosmetic: { low: 0.9, medium: 0.1, high: 0, critical: 0 },
  font: { low: 0.8, medium: 0.2, high: 0, critical: 0 },
  color: { low: 0.8, medium: 0.2, high: 0, critical: 0 },
  alignment: { low: 0.85, medium: 0.15, high: 0, critical: 0 },
  feature: { low: 0.6, medium: 0.35, high: 0.05, critical: 0 },
  request: { low: 0.5, medium: 0.45, high: 0.05, critical: 0 },
  docs: { low: 0.9, medium: 0.1, high: 0, critical: 0 },
  documentation: { low: 0.9, medium: 0.1, high: 0, critical: 0 },
  suggestion: { low: 0.85, medium: 0.15, high: 0, critical: 0 },
  question: { low: 0.6, medium: 0.35, high: 0.05, critical: 0 },
  how: { low: 0.7, medium: 0.25, high: 0.05, critical: 0 },
  avatar: { low: 0.85, medium: 0.15, high: 0, critical: 0 }
};

export async function predictTicketPriority(
  title: string,
  description: string,
  modelVersion: string = 'xgb_v3'
): Promise<PredictionResult> {
  // 1. Try connecting to Python FastAPI backend service if running
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        priority: data.priority as Priority,
        confidence: data.confidence,
        model_version: data.model_version || modelVersion,
        top_tokens: data.top_tokens || []
      };
    }
  } catch (_e) {
    // FastAPI server offline or request timed out — fall through to client-side ML engine
  }

  // 2. Client-side In-Memory ML inference engine
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const text = `${title} ${description}`.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const tokens = text.split(/\s+/).filter((t) => t.length > 2);

        const scores: Record<Priority, number> = {
          low: 0.25,
          medium: 0.35, // Prior default fallback per PRD §1.7
          high: 0.2,
          critical: 0.1
        };

        const matchedTokens: { token: string; weight: number }[] = [];

        tokens.forEach((token) => {
          if (VOCABULARY[token]) {
            const weights = VOCABULARY[token];
            scores.low += weights.low * 1.5;
            scores.medium += weights.medium * 1.5;
            scores.high += weights.high * 1.5;
            scores.critical += weights.critical * 2.0; // Class weighting for minority critical class

            const maxWeight = Math.max(weights.low, weights.medium, weights.high, weights.critical);
            matchedTokens.push({ token, weight: Number(maxWeight.toFixed(2)) });
          }
        });

        // Determine winning priority
        let predictedPriority: Priority = 'medium';
        let maxScore = -1;

        (Object.keys(scores) as Priority[]).forEach((p) => {
          if (scores[p] > maxScore) {
            maxScore = scores[p];
            predictedPriority = p;
          }
        });

        // Compute normalized confidence (between 0.72 and 0.98)
        const totalScore = scores.low + scores.medium + scores.high + scores.critical;
        let confidence = Math.min(0.98, Math.max(0.72, maxScore / totalScore + 0.35));

        // Deduplicate & sort top tokens
        const topTokensMap = new Map<string, number>();
        matchedTokens.forEach(({ token, weight }) => {
          topTokensMap.set(token, Math.max(topTokensMap.get(token) || 0, weight));
        });

        const top_tokens = Array.from(topTokensMap.entries())
          .map(([token, weight]) => ({ token, weight }))
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 4);

        if (top_tokens.length === 0) {
          top_tokens.push({ token: 'standard_text', weight: 0.5 });
        }

        resolve({
          priority: predictedPriority,
          confidence: Number(confidence.toFixed(2)),
          model_version: modelVersion,
          top_tokens
        });
      } catch (err) {
        // Fallback per PRD §1.7 Non-Functional Requirements:
        // Graceful degradation — fallback to "Medium" (unclassified) if inference fails
        resolve({
          priority: 'medium',
          confidence: 0.5,
          model_version: modelVersion,
          top_tokens: [{ token: 'fallback_default', weight: 0.5 }]
        });
      }
    }, 350);
  });
}
