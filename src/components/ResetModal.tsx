import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#FFF9F4] border-[2.5px] border-[#2F2E33] rounded-3xl shadow-[8px_8px_0px_#2F2E33] p-6 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#FFB8B0] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#2F2E33] border-2 border-[#2F2E33] bg-white rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold font-display text-[#2F2E33]">
            Reset Learning Progress?
          </h3>
          <p className="text-xs font-bold text-[#858B98] mt-1 leading-relaxed">
            This action will clear all your experience points (XP), completed challenge records, accuracy metrics, and daily streak.
          </p>
        </div>

        <div className="p-3 bg-white border-2 border-[#2F2E33] rounded-xl text-xs font-bold text-[#2F2E33] space-y-1 shadow-[2px_2px_0px_#2F2E33]">
          <div className="flex justify-between">
            <span>XP reset to:</span>
            <span className="font-mono">0 XP</span>
          </div>
          <div className="flex justify-between">
            <span>Solved challenges:</span>
            <span className="font-mono">0</span>
          </div>
          <div className="flex justify-between">
            <span>Daily streak:</span>
            <span className="font-mono">0 days</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-extrabold text-[#2F2E33] bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
          >
            Yes, Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};
