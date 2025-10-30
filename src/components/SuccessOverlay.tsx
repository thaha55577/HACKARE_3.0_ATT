import React from 'react';

type Props = {
  visible: boolean;
  message?: string;
};

const SuccessOverlay: React.FC<Props> = ({ visible, message }) => {
  if (!visible) return null;
  return (
    <div aria-hidden={!visible} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white/5 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl">
        <div className="checkmark w-40 h-40 flex items-center justify-center mb-4">
          <svg viewBox="0 0 52 52" className="w-28 h-28">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#7DD3FC" strokeWidth="2" className="circle" />
            <path fill="none" stroke="#fff" strokeWidth="3" d="M14 27 l7 7 l17 -17" className="check" />
          </svg>
        </div>
        {message && <div className="text-lg font-medium text-white/90">{message}</div>}
      </div>
      <style>{`
        .checkmark .circle{stroke-dasharray: 157; stroke-dashoffset: 157; animation: circle 0.6s ease-out forwards;}
        .checkmark .check{stroke-dasharray: 60; stroke-dashoffset: 60; transform-origin: center; animation: check 0.5s 0.45s ease-out forwards;}
        @keyframes circle{to{stroke-dashoffset:0;}}
        @keyframes check{0%{stroke-dashoffset:60;transform:scale(0.9)}50%{transform:scale(1.05)}100%{stroke-dashoffset:0;transform:scale(1)}}
      `}</style>
    </div>
  );
};

export default SuccessOverlay;
