import React from 'react';
import { Card, Badge, Button } from '@roboforge/ui';

interface PlaceholderViewProps {
  title: string;
  icon: string;
  phase: string;
  description: string;
  features: string[];
  onNavigateHome: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  icon,
  phase,
  description,
  features,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
      <div className="text-6xl mb-2">{icon}</div>
      <Badge variant="primary">{phase}</Badge>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="text-base text-text-muted max-w-xl mx-auto">{description}</p>

      <Card variant="surface" className="max-w-md mx-auto text-left mt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
          Roadmap Deliverables
        </h2>
        <ul className="space-y-2 text-sm text-text-muted">
          {features.map((feat, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="pt-4">
        <Button variant="outline" onClick={onNavigateHome}>
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};
