import React from 'react';
import { CoachPanel } from '../components/coach/CoachPanel';

export const CoachView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" role="img" aria-label="Robot speech bubble">
            💬
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Local Socratic AI Coach
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          Your private, 100% on-device robotics coach. Powered by local Ollama with multi-level hint
          ladders and hardware safety guardrails.
        </p>
      </div>

      <CoachPanel />
    </div>
  );
};
