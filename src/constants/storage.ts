/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  CARDS: 'every_trace_cards',
  THEME: 'theme',
  HAPTIC: 'hapticEnabled',
  MONTHLY_BUDGET: 'monthlyBudget',
  ONBOARDING_COMPLETED: 'onboarding_completed'
} as const;

/**
 * 默认状态栏高度
 */
export const DEFAULT_STATUS_BAR_HEIGHT = 20;

/**
 * 最大置顶卡片数
 */
export const MAX_PINNED_CARDS = 4;

/**
 * 日期格式常量
 */
export const DATE_FORMAT = {
  ISO: 'YYYY-MM-DD',
  LOCAL_DATETIME: 'YYYY-MM-DDTHH:mm:ss'
} as const;
