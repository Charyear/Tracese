/**
 * 卡片类型常量
 */
export const CARD_TYPES = {
  HABIT: 'habit',
  COUNTDOWN: 'countdown',
  DIARY: 'diary',
  ASSET: 'asset',
  SUBSCRIPTION: 'subscription',
  BIRTHDAY: 'birthday',
  PLAN: 'plan'
} as const;

export type CardType = typeof CARD_TYPES[keyof typeof CARD_TYPES];

/**
 * 默认自定义样式
 */
export const getDefaultCustomStyle = () => ({
  backgroundColor: '#F5F5F5',
  textColor: '#2D3436',
  accentColor: '#5C7C8A',
  badgeColor: '#A5C4D4',
  borderColor: '#E0E0E0',
  borderRadius: 24,
  shadowOpacity: 0.08
});

/**
 * 显示样式选项
 */
export const displayStyleOptions = [
  { key: 'soft', label: '柔和' },
  { key: 'outline', label: '描边' },
  { key: 'glass', label: '玻璃' },
  { key: 'strong', label: '强烈' },
  { key: 'custom', label: '自定义' }
];

/**
 * 自定义颜色选项
 */
export const customColorOptions = [
  '#F0F4F8', '#F1F7F4', '#FBF2F2', '#FDF6F0', '#F7F3F9', '#FAF7F2',
  '#A5C4D4', '#ADC7B8', '#E3B9BC', '#E9C6B1', '#D6C5D8', '#ECC89C'
];

/**
 * 文字颜色选项
 */
export const textColorOptions = [
  '#2D3436', '#5C7C8A', '#6E8B79', '#A67C80', '#8E7B92', '#B08E62'
];

/**
 * 徽章颜色选项
 */
export const badgeColorOptions = [
  '#A5C4D4', '#ADC7B8', '#E3B9BC', '#E9C6B1', '#D6C5D8', '#ECC89C'
];

/**
 * 边框颜色选项
 */
export const borderColorOptions = [
  '#E0E0E0', '#D0D0D0', '#C0C0C0', '#B0B0B0', '#A0A0A0', '#909090'
];

/**
 * 圆角选项
 */
export const borderRadiusOptions = [16, 20, 24, 28, 32];

/**
 * 阴影选项
 */
export const shadowOptions = [0, 0.04, 0.08, 0.12, 0.16];

/**
 * 主题名称映射
 */
export const themeNameMap: Record<string, string> = {
  zodiac: '十二生肖',
  horoscope: '十二星座',
  scenery: '自然风景',
  pets: '可爱萌宠'
};

/**
 * 获取主题名称
 */
export const getThemeName = (themeId?: string): string => {
  if (!themeId) return '';
  return themeNameMap[themeId] || themeId;
};
