export type CardPresetStyle = 'soft' | 'outline' | 'glass' | 'strong' | 'custom';

export interface CardCustomStyle {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    badgeColor?: string;
    borderColor?: string;
    borderRadius?: number;
    shadowOpacity?: number;
    illustrationUrl?: string;   // kept for backward compat, unused for new themes
    illustrationName?: string;
    illustrationTheme?: string;
    themeStyleId?: string;      // e.g. "zodiac-rat", "horoscope-aries", "scenery-forest"
}

// Reminder configuration for a card
export interface ReminderConfig {
    enabled: boolean;           // Whether reminder is enabled
    reminderTime: string;       // Time in HH:mm format (e.g. "09:00")
    reminderDays?: number[];    // Days of week [0-6] (0=Sunday), for weekly repeat
    reminderDate?: string;      // Specific date for one-time reminder (YYYY-MM-DD)
    reminderType: 'daily' | 'weekly' | 'monthly' | 'once' | 'custom';
    // For countdown: days before target to remind (e.g. [1, 3] = 1 day and 3 days before)
    countdownDaysBefore?: number[];
    // For subscription: days before next billing to remind
    subscriptionDaysBefore?: number[];
    // For birthday: days before birthday to remind
    birthdayDaysBefore?: number[];
    // For habit: remind if not punched by this time
    habitRemindTime?: string;   // HH:mm format
    // For diary: remind if not written by this time
    diaryRemindTime?: string;   // HH:mm format
    // For plan: remind days before deadline
    planDaysBefore?: number[];
    // Custom message override
    customMessage?: string;
    // Last time reminder was triggered (to avoid duplicate sends)
    lastTriggeredAt?: number;
}

export interface BaseCard {
    id: string;
    type: 'habit' | 'countdown' | 'diary' | 'asset' | 'subscription' | 'birthday' | 'plan';
    title: string;
    createdAt: number;
    updatedAt: number;
    sortIndex: number;
    colorClass: string; // The Morandi color key (e.g. 'blue', 'green', 'pink')
    icon: string;       // Icon identifier (e.g. 'heart', 'calendar')
    notes?: string;     // Explanatory comment or remark
    displayStyle?: CardPresetStyle;
    customStyle?: CardCustomStyle;
    isPinned?: boolean; // Pinned cards are shown first in list views
    reminder?: ReminderConfig; // Reminder configuration
}

export interface HabitCard extends BaseCard {
    type: 'habit';
    punches: string[]; // List of local datetime strings 'YYYY-MM-DDTHH:mm:ss' when punch-in happened
    totalCount: number;
    dailyLimit?: number;        // Max punch-ins allowed per day, default 1
    minIntervalMinutes?: number; // Minimum minutes required between two punch-ins, default 0 (no limit)
    streak: number;             // 当前连续打卡天数
    longestStreak: number;      // 历史最长连续打卡天数
    streakUpdatedAt?: number;   // 上次 streak 计算时间戳
}

export interface CountdownCard extends BaseCard {
    type: 'countdown';
    targetDate: string; // ISO date string 'YYYY-MM-DD HH:mm:ss'
}

export interface DiaryTag {
    text: string;
    color?: string;
}

export interface DiaryImage {
    url: string;
    width?: number;
    height?: number;
}

export interface DiaryCard extends BaseCard {
    type: 'diary';
    content: string;    // Diary text body
    tags: DiaryTag[];   // 日记标签列表
    images: DiaryImage[]; // 图片列表
    mood?: string;      // 心情 emoji
    weather?: string;   // 天气标识
    editCount?: number; // Number of times content/tags have been edited (0 = first write, 1 = one edit, 2+ = locked)
}

export interface AssetCard extends BaseCard {
    type: 'asset';
    amount: number;     // Sum of money
    flowType: 'income' | 'expense';
    source: string;     // Income/Expense source, e.g. "Salary", "Food"
    date: string;      // Date of the transaction 'YYYY-MM-DD'
    category: string;   // 分类（餐饮、交通等）
    budget?: number;    // 预算金额
}

export interface SubscriptionCard extends BaseCard {
    type: 'subscription';
    price: number;
    billingCycle: 'monthly' | 'yearly' | 'weekly';
    nextBillingDate: string;
    totalCost: number;       // 累计花费
    reminderDays: number[];  // 到期前提醒天数
    startDate?: string;      // 订阅开始日期
}

export interface BirthdayCard extends BaseCard {
    type: 'birthday';
    birthDate: string; // ISO Date 'YYYY-MM-DD'
}

export interface PlanStep {
    text: string;
    completed: boolean;
    dependencies?: number[];  // 依赖的其他步骤索引
    deadline?: string;        // 子任务截止日期
    progress?: number;        // 子任务进度 0-100
    time?: string;            // 当天具体时间 HH:mm
}

export interface PlanCard extends BaseCard {
    type: 'plan';
    steps: PlanStep[];
    deadline?: string;        // 计划截止日期
    progress: number;         // 整体进度 0-100
}

export type AnyCard = HabitCard | CountdownCard | DiaryCard | AssetCard | SubscriptionCard | BirthdayCard | PlanCard;
