import type { CardPresetStyle } from '../types/card';

/**
 * 获取默认自定义样式
 */
export const getDefaultCustomStyle = () => ({
  backgroundColor: '#FFFFFF',
  textColor: '#2D3436',
  accentColor: '#5C7C8A',
  badgeColor: 'rgba(0,0,0,0.06)',
  borderColor: 'rgba(92,124,138,0.18)',
  borderRadius: 32,
  shadowOpacity: 0.12
});

/**
 * 主题名称映射
 */
const themeNameMap: Record<string, string> = {
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

/**
 * 显示样式选项
 */
export const displayStyleOptions: { key: CardPresetStyle; label: string }[] = [
  { key: 'soft', label: '柔和' },
  { key: 'outline', label: '描边' },
  { key: 'glass', label: '通透' },
  { key: 'strong', label: '强调' },
  { key: 'custom', label: '自定义' }
];

/**
 * 自定义颜色选项
 */
export const customColorOptions = [
  '#FFFFFF', '#FFF6EE', '#F4F8FF', '#F3FBF6',
  '#FFF1F3', '#F5F1FF', '#EEF7F8', '#FFF8E7'
];

/**
 * 文字颜色选项
 */
export const textColorOptions = [
  '#2D3436', '#1F2937', '#5C7C8A', '#8E5B5B', '#5E6C84', '#355C7D'
];

/**
 * 徽章颜色选项
 */
export const badgeColorOptions = [
  'rgba(0,0,0,0.06)', 'rgba(92,124,138,0.14)',
  'rgba(123,175,192,0.18)', 'rgba(224,122,95,0.16)',
  'rgba(214,197,216,0.28)'
];

/**
 * 边框颜色选项
 */
export const borderColorOptions = [
  'transparent', 'rgba(92,124,138,0.18)',
  'rgba(123,175,192,0.3)', 'rgba(224,122,95,0.24)',
  'rgba(214,197,216,0.32)'
];

/**
 * 圆角选项
 */
export const borderRadiusOptions = [20, 28, 32, 40];

/**
 * 阴影选项
 */
export const shadowOptions = [
  { key: 'none', label: '无', value: 0 },
  { key: 'light', label: '轻', value: 0.08 },
  { key: 'medium', label: '中', value: 0.14 },
  { key: 'strong', label: '强', value: 0.22 }
];
