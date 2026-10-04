import React from 'react';

interface CompletionCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  learnerNickname?: string;
}

export const CompletionCertificateModal: React.FC<CompletionCertificateModalProps> = ({
  isOpen,
  onClose,
  learnerNickname = 'Cadet Spark',
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certificateId = `RF-${Date.now().toString(36).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-4 print:bg-white">
        {/* Certificate Card */}
        <div className="relative border-4 border-double border-amber-400/60 p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-center space-y-4 print:bg-white print:text-black">
          {/* Header Seal */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl" role="img" aria-label="Certificate Seal">
              🏅
            </span>
            <div className="text-left">
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase block">
                RoboForge Open Robotics School
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Serial: {certificateId}</span>
            </div>
          </div>

          <div className="space-y-1 py-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white print:text-black uppercase">
              Certificate of Completion
            </h1>
            <p className="text-xs text-amber-200/80 italic">
              Electronics, Embedded Systems & Autonomous Mobile Robotics
            </p>
          </div>

          <div className="py-2 space-y-2">
            <p className="text-xs text-slate-400 print:text-slate-600">
              This certificate officially honors the dedication and achievement of:
            </p>
            <div className="text-3xl font-black text-sky-400 print:text-sky-700 tracking-wide font-mono border-b-2 border-amber-400/40 pb-2 inline-block px-8">
              {learnerNickname}
            </div>
            <p className="text-xs text-slate-300 print:text-slate-700 max-w-lg mx-auto pt-2 leading-relaxed">
              who has completed all 30 foundational lessons across discrete circuit theory,
              ATmega328P Arduino C++ firmware, actuator mechanics, and autonomous differential-drive
              robotics navigation.
            </p>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 print:border-slate-300 text-xs">
            <div>
              <div className="font-mono text-slate-200 print:text-black font-bold">{todayStr}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Date Granted
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-400 font-black text-xs">
                SEAL
              </div>
              <div className="text-[10px] text-amber-400 uppercase tracking-widest mt-1">
                Verified
              </div>
            </div>

            <div>
              <div className="font-mono text-slate-200 print:text-black font-bold">
                RoboForge Engine
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Course Authority
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between print:hidden">
          <p className="text-xs text-slate-400">
            Export as high-resolution printable PDF or paper certificate.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <span>🖨️ Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-text-main font-bold text-xs rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
