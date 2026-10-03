import React, { useState } from 'react';
import { Modal, Button } from '@roboforge/ui';

interface SpiceExportModalProps {
  isOpen: boolean;
  spiceNetlist: string;
  onClose: () => void;
}

export const SpiceExportModal: React.FC<SpiceExportModalProps> = ({
  isOpen,
  spiceNetlist,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spiceNetlist);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([spiceNetlist], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'circuit.cir';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Standard SPICE Netlist (.cir)">
      <div className="space-y-4">
        <p className="text-xs text-text-muted leading-relaxed">
          This netlist is generated in standard Berkeley SPICE 3f5 / Ngspice syntax. You can run it
          directly in external tools like LTspice, Ngspice, or KiCad to verify RoboForge&apos;s
          mathematical solver against industrial-grade simulation engines.
        </p>

        <div className="relative">
          <pre className="p-4 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-mono text-text-main overflow-x-auto max-h-72 select-all leading-normal">
            {spiceNetlist}
          </pre>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-text-muted">Format: Standard SPICE .cir</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button variant="primary" onClick={handleDownload}>
              Download .cir File
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
