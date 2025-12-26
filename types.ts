
export interface Candidate {
  id: string; // 编号
  name: string; // 姓名
  department: string; // 部门
}

export interface LotteryState {
  candidates: Candidate[];
  winners: Candidate[];
  isSpinning: boolean;
  currentWinner: Candidate | null;
}

export enum AppStatus {
  IDLE = 'IDLE',
  READY = 'READY',
  SPINNING = 'SPINNING',
  WINNER_REVEALED = 'WINNER_REVEALED'
}
