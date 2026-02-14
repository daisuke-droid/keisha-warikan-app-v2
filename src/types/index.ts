export type EventID = string;
export type ParticipantID = string;

// 役職・役割定数
export const ROLE_RANKS = {
  BOSS: 'boss',
  SENIOR: 'senior',
  PEER: 'peer',
  JUNIOR: 'junior',
  CUSTOM: 'custom',
} as const;

export type RoleRank = typeof ROLE_RANKS[keyof typeof ROLE_RANKS];

// 丸め単位
export const ROUNDING_UNITS = {
  ONE: 1,
  TEN: 10,
  HUNDRED: 100,
  FIVE_HUNDRED: 500,
  THOUSAND: 1000,
} as const;

export type RoundingUnit = typeof ROUNDING_UNITS[keyof typeof ROUNDING_UNITS];

// 丸め方向
export const ROUNDING_METHODS = {
  ROUND: 'round', // 四捨五入
  CEIL: 'ceil',   // 切り上げ
  FLOOR: 'floor', // 切り捨て
} as const;

export type RoundingMethod = typeof ROUNDING_METHODS[keyof typeof ROUNDING_METHODS];

// 端数調整の優先順位
export const ADJUSTMENT_PRIORITIES = {
  PAY_MORE: 'pay_more', // 多く払う人に寄せる
  EVEN: 'even',         // 均等にばらす
  ORGANIZER: 'organizer', // 幹事に寄せる
} as const;

export type AdjustmentPriority = typeof ADJUSTMENT_PRIORITIES[keyof typeof ADJUSTMENT_PRIORITIES];

export interface Participant {
  id: ParticipantID;
  name: string;
  rank: RoleRank;
  weight: number; // 係数 (例: 1.0, 1.5)
  fixedAmount?: number; // 固定額設定がある場合
  note?: string;
  // 計算結果格納用
  calculatedAmount?: number; 
}

export interface WarikanEvent {
  id: EventID;
  name: string;
  totalAmount: number;
  participants: Participant[];
  
  // 設定
  roundingUnit: RoundingUnit;
  roundingMethod: RoundingMethod;
  adjustmentPriority: AdjustmentPriority;
  
  memo?: string;
  createdAt: number;
  updatedAt: number;
}
