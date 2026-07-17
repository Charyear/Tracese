import type { CardPresetStyle, CardCustomStyle, ReminderConfig } from './card';

/**
 * 计划步骤
 */
export interface PlanStepForm {
  text: string;
  completed: boolean;
  dependencies?: number[];
  deadline?: string;
  progress?: number;
  time?: string;  // 当天具体时间 HH:mm
}

/**
 * 日记标签
 */
export interface DiaryTagForm {
  text: string;
  color?: string;
}

/**
 * 编辑页面表单状态
 */
export interface EditFormState {
  type: 'habit' | 'countdown' | 'diary' | 'asset' | 'subscription' | 'birthday' | 'plan';
  title: string;
  icon: string;
  colorClass: string;
  notes: string;
  displayStyle: CardPresetStyle;
  isPinned: boolean;
  customStyle: CardCustomStyle;
  // habit
  punches: string[];
  totalCount: number;
  dailyLimit: number;
  minIntervalMinutes: number;
  streak: number;
  longestStreak: number;
  // countdown
  targetDate: string;
  // diary
  content: string;
  tags: DiaryTagForm[];
  images: { url: string; width?: number; height?: number }[];
  mood?: string;
  weather?: string;
  // asset
  amount: number;
  flowType: 'income' | 'expense';
  category: string;
  source: string;
  sourceIndex: number;
  date: string;
  budget?: number;
  // subscription
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  cycleIndex: number;
  lastOrderDate: string;
  nextBillingDate: string;
  totalCost: number;
  reminderDays: number[];
  startDate?: string;
  // birthday
  birthDate: string;
  // plan
  steps: PlanStepForm[];
  deadline?: string;
  progress: number;
  // reminder
  reminder: ReminderConfig;
}

/**
 * 创建默认表单状态
 */
export const createDefaultFormState = (): EditFormState => ({
  type: 'habit',
  title: '',
  icon: '🔥',
  colorClass: 'orange',
  notes: '',
  displayStyle: 'soft',
  isPinned: false,
  customStyle: {
    backgroundColor: '#FFFFFF',
    textColor: '#2D3436',
    accentColor: '#5C7C8A',
    badgeColor: 'rgba(0,0,0,0.06)',
    borderColor: 'rgba(92,124,138,0.18)',
    borderRadius: 32,
    shadowOpacity: 0.12
  },
  punches: [],
  totalCount: 0,
  dailyLimit: 1,
  minIntervalMinutes: 0,
  targetDate: '',
  content: '',
  amount: 0,
  flowType: 'expense',
  category: '',
  source: '',
  sourceIndex: 0,
  date: '',
  price: 0,
  billingCycle: 'monthly',
  cycleIndex: 2,
  lastOrderDate: '',
  nextBillingDate: '',
  birthDate: '',
  steps: [],
  reminder: {
    enabled: false,
    reminderTime: '09:00',
    reminderType: 'once',
    countdownDaysBefore: [1, 3],
    birthdayDaysBefore: [1, 3],
    subscriptionDaysBefore: [1, 3, 7],
    planDaysBefore: [1, 3, 7],
    habitRemindTime: '21:00',
    diaryRemindTime: '21:00'
  }
});
