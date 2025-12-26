
import React, { useState, useCallback, useMemo } from 'react';
import { Candidate, AppStatus } from './types';
import ExcelUploader from './components/ExcelUploader';
import Wheel from './components/Wheel';
import WinnerModal from './components/WinnerModal';

const RESTRICTED_NAME = '孙卓群';
const DEPARTMENT_ORDER = ["研究一部", "研究二部", "研究三部", "北京分部", "科研管理部", "综合部"];

const App: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<Candidate[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const handleDataLoaded = useCallback((data: Candidate[]) => {
    setCandidates(data);
    setStatus(AppStatus.READY);
    setSelectedDepartments([]); 
  }, []);

  const allDepartments = useMemo(() => {
    const deps = Array.from(new Set(candidates.map(c => c.department)));
    
    return deps.sort((a, b) => {
      const indexA = DEPARTMENT_ORDER.indexOf(a);
      const indexB = DEPARTMENT_ORDER.indexOf(b);
      
      // If both are in our predefined list, sort by list order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only one is in the list, that one comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither is in the list, sort alphabetically
      return a.localeCompare(b);
    });
  }, [candidates]);

  // Candidates to SHOW on wheel (Includes everyone in selected depts)
  const filteredCandidates = useMemo(() => {
    if (selectedDepartments.length === 0) return candidates;
    return candidates.filter(c => selectedDepartments.includes(c.department));
  }, [candidates, selectedDepartments]);

  // Candidates that can actually WIN (Excludes restricted names)
  const eligibleCandidates = useMemo(() => {
    return filteredCandidates.filter(c => c.name !== RESTRICTED_NAME);
  }, [filteredCandidates]);

  const toggleDepartment = (dep: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dep) ? prev.filter(d => d !== dep) : [...prev, dep]
    );
  };

  const selectAllDepartments = () => setSelectedDepartments([]);
  
  const handleStartSpin = useCallback(() => {
    if (status !== AppStatus.READY && status !== AppStatus.WINNER_REVEALED) return;
    
    if (eligibleCandidates.length === 0) {
      alert("当前筛选条件下没有可中奖的人员！");
      return;
    }
    
    // 1. Randomly pick from ELIGIBLE pool
    const winner = eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
    
    // 2. Find the index of this person in the DISPLAY pool (filteredCandidates) 
    const indexInFiltered = filteredCandidates.indexOf(winner);
    
    setWinnerIndex(indexInFiltered);
    setStatus(AppStatus.SPINNING);
  }, [status, eligibleCandidates, filteredCandidates]);

  const handleSpinEnd = useCallback(() => {
    if (winnerIndex !== null) {
      const winner = filteredCandidates[winnerIndex];
      setHistory(prev => [winner, ...prev]);
      setStatus(AppStatus.WINNER_REVEALED);
    }
  }, [winnerIndex, filteredCandidates]);

  const handleReset = useCallback(() => {
    setCandidates([]);
    setHistory([]);
    setStatus(AppStatus.IDLE);
    setWinnerIndex(null);
    setSelectedDepartments([]);
  }, []);

  const currentWinner = useMemo(() => {
    return (winnerIndex !== null && status === AppStatus.WINNER_REVEALED) ? filteredCandidates[winnerIndex] : null;
  }, [winnerIndex, status, filteredCandidates]);

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-chinese font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 mb-4 drop-shadow-2xl">
          幸运大抽奖
        </h1>
        <p className="text-indigo-300 text-lg md:text-xl tracking-widest font-light opacity-60">
          FORTUNE WHEEL LOTTERY SYSTEM
        </p>
      </div>

      {/* Department Filter UI */}
      {candidates.length > 0 && (
        <div className="w-full max-w-3xl mb-12 animate-fade-in">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <h3 className="text-indigo-200 font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                筛选参与部门
              </h3>
              <button 
                onClick={selectAllDepartments}
                className={`px-3 py-1 text-xs rounded-full transition-all ${selectedDepartments.length === 0 ? 'bg-indigo-500 text-white' : 'bg-white/5 text-indigo-300 hover:bg-white/10'}`}
              >
                显示全部
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {allDepartments.map(dep => {
                const isSelected = selectedDepartments.includes(dep);
                return (
                  <button
                    key={dep}
                    onClick={() => toggleDepartment(dep)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95
                      ${isSelected 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 border-transparent' 
                        : 'bg-white/5 text-indigo-300 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10'}
                    `}
                  >
                    {dep}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <span className="text-xs text-indigo-400/60">
                当前备选池人数：<span className="text-indigo-300 font-bold">{filteredCandidates.length}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center">
        {status === AppStatus.IDLE ? (
          <div className="w-full max-w-lg mt-10">
            <ExcelUploader onDataLoaded={handleDataLoaded} />
            <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-indigo-200/60 text-sm leading-relaxed">
                请上传一份包含“部门”、“姓名”列的 Excel 文件。
                <br />
                数据上传后，部门将按指定顺序排列供您筛选。
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-12 w-full">
            <div className="relative">
              {filteredCandidates.length > 0 ? (
                <Wheel 
                  candidates={filteredCandidates} 
                  isSpinning={status === AppStatus.SPINNING} 
                  winnerIndex={winnerIndex}
                  onSpinEnd={handleSpinEnd}
                />
              ) : (
                <div className="w-[450px] h-[450px] flex items-center justify-center rounded-full border-4 border-dashed border-white/10 text-indigo-400/40 italic text-xl">
                  请至少选择一个部门
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <button
                disabled={status === AppStatus.SPINNING || eligibleCandidates.length === 0}
                onClick={handleStartSpin}
                className={`
                  px-16 py-5 rounded-full text-3xl font-bold font-chinese tracking-widest transition-all transform shadow-2xl
                  ${(status === AppStatus.SPINNING || eligibleCandidates.length === 0)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed translate-y-1' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white hover:scale-105 active:scale-95 shadow-orange-600/40'}
                `}
              >
                {status === AppStatus.SPINNING ? '正在开奖...' : '立即开奖'}
              </button>
              
              <button
                onClick={handleReset}
                className="px-10 py-4 rounded-full bg-white/5 hover:bg-white/10 text-indigo-200/60 font-semibold transition-all border border-white/5 hover:text-indigo-200"
              >
                清空数据
              </button>
            </div>
          </div>
        )}
      </div>

      {currentWinner && (
        <WinnerModal 
          winner={currentWinner} 
          onClose={() => setStatus(AppStatus.READY)} 
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
