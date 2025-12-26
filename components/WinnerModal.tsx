
import React, { useEffect } from 'react';
import { Candidate } from '../types';

interface WinnerModalProps {
  winner: Candidate;
  onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  useEffect(() => {
    // Create confetti
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.width = (Math.random() * 10 + 5) + 'px';
      confetti.style.height = (Math.random() * 10 + 5) + 'px';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  }, [winner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative max-w-lg w-full bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden animate-float">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
        
        <div className="bg-slate-900 rounded-[calc(1.5rem-4px)] p-8 text-center">
          <h2 className="text-4xl font-chinese text-yellow-400 mb-6 drop-shadow-lg">🎉 恭喜中奖 🎉</h2>
          
          <div className="space-y-4 mb-8 py-6 border-y border-white/10">
            <div>
              <p className="text-indigo-300 text-sm uppercase tracking-widest mb-1">所属部门</p>
              <p className="text-2xl font-semibold text-white">{winner.department}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-sm uppercase tracking-widest mb-1">幸运中奖者</p>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 font-chinese">{winner.name}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-sm uppercase tracking-widest mb-1">工号/编号</p>
              <p className="text-2xl font-mono text-white">{winner.id}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
          >
            收下好运
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
