import { describe, it, expect } from 'vitest';
import { Button, Callout, Card, Badge, Modal, Toast } from './index';

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

  it('renders Modal with dialog role and title', () => {
    const el = (
      <Modal isOpen={true} onClose={() => {}} title="Test Dialog">
        Modal body
      </Modal>
    );
    expect(el.props.isOpen).toBe(true);
    expect(el.props.title).toBe('Test Dialog');
  });

  it('renders Toast with live region and status role', () => {
    const el = <Toast message="Data saved" type="success" />;
    expect(el.props.message).toBe('Data saved');
    expect(el.props.type).toBe('success');
  });
});
