import React, { useState, useRef, useEffect } from 'react';
import { Button, Badge } from '@roboforge/ui';

interface SerialMonitorProps {
  lines: string[];
  onSendMessage: (msg: string) => void;
  onClear: () => void;
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({
  lines,
  onSendMessage,
  onClear,
  baudRate,
  onBaudRateChange,
}) => {
  const [inputText, setInputText] = useState('');
  const [autoscroll, setAutoscroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoscroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, autoscroll]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText + '\n');
    setInputText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-border-subtle rounded-2xl overflow-hidden font-mono shadow-xl">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-border-subtle text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">📟</span>
          <span className="font-bold text-slate-200">Serial Monitor</span>
          <Badge variant="primary">{baudRate} baud</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Baud Rate Selector */}
          <select
            value={baudRate}
            onChange={e => onBaudRateChange(parseInt(e.target.value, 10))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="9600">9600 baud</option>
            <option value="19200">19200 baud</option>
            <option value="38400">38400 baud</option>
            <option value="57600">57600 baud</option>
            <option value="115200">115200 baud</option>
          </select>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAutoscroll(!autoscroll)}
            className="text-[11px] h-7 px-2"
          >
            {autoscroll ? '✓ Autoscroll' : 'Autoscroll'}
          </Button>

          <Button size="sm" variant="ghost" onClick={handleCopy} className="text-[11px] h-7 px-2">
            Copy
          </Button>

          <Button size="sm" variant="ghost" onClick={onClear} className="text-[11px] h-7 px-2">
            Clear
          </Button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-1 text-xs text-emerald-400 min-h-[160px] max-h-[300px] select-text"
        role="log"
        aria-live="polite"
      >
        {lines.length === 0 ? (
          <p className="text-slate-600 italic">
            No serial communication yet. Run sketch to receive output.
          </p>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-600 select-none w-6 text-right font-mono text-[10px]">
                {idx + 1}
              </span>
              <span className="break-all">{line}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Serial Input Bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-2 bg-slate-900 border-t border-border-subtle"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type message to send via Serial.read()..."
          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-text-main placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <Button type="submit" size="sm" variant="secondary" className="h-8">
          Send
        </Button>
      </form>
    </div>
  );
};
