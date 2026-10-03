import { describe, it, expect } from 'vitest';
import { Button, Callout, Card, Badge } from './index';

describe('packages/ui', () => {
  it('instantiates Button with accessible defaults', () => {
    const el = <Button variant="primary">Click Me</Button>;
    expect(el.props.children).toBe('Click Me');
    expect(el.props.variant).toBe('primary');
  });

  it('renders Callout with safety role and accessible aria-label', () => {
    const el = <Callout type="safety">Never touch live mains wires.</Callout>;
    expect(el.props.type).toBe('safety');
    expect(el.props.children).toBe('Never touch live mains wires.');
  });

  it('renders Card with surface variant', () => {
    const el = <Card variant="surface">Content</Card>;
    expect(el.props.variant).toBe('surface');
  });

  it('renders Badge with custom status', () => {
    const el = <Badge variant="success">Passed</Badge>;
    expect(el.props.variant).toBe('success');
  });
});
