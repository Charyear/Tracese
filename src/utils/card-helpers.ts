import type { AnyCard, CountdownCard, BirthdayCard, PlanCard, AssetCard, SubscriptionCard, HabitCard } from '../types/card';

const DAY_MS = 1000 * 60 * 60 * 24;

// Parse local date string to Date object
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

// Get start of today
export const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Calculate days left until target date
export const daysLeft = (card: CountdownCard): number => {
  if (!card.targetDate) return 0;
  const target = parseLocalDate(card.targetDate).getTime();
  const today = startOfToday().getTime();
  return Math.ceil((target - today) / DAY_MS);
};

// Calculate days passed since card creation
export const daysPassed = (card: CountdownCard): number => {
  const created = new Date(card.createdAt);
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const today = startOfToday().getTime();
  return Math.max(0, Math.floor((today - createdDay.getTime()) / DAY_MS));
};

// Get countdown caption
export const getCountdownCaption = (card: CountdownCard): string => {
  const diff = daysLeft(card);
  if (diff > 0) return "还剩";
  if (diff === 0) return "就是今天";
  return "已过去";
};

// Cycle label mapping
export const cycleLabel = (cycle: string): string => {
  const map: Record<string, string> = { monthly: "月", yearly: "年", weekly: "周" };
  return map[cycle] ?? cycle;
};

// Birthday age calculation
export const getBirthdayAge = (card: BirthdayCard): number => {
  if (!card.birthDate) return 0;
  const birth = parseLocalDate(card.birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

// Birthday days left
export const getBirthdayDaysLeft = (card: BirthdayCard): number => {
  if (!card.birthDate) return 0;
  const birth = parseLocalDate(card.birthDate);
  const now = new Date();
  const currentYearBirth = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const today = startOfToday();

  let diff = currentYearBirth.getTime() - today.getTime();
  if (diff < 0) {
    const nextYearBirth = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    diff = nextYearBirth.getTime() - today.getTime();
  }
  return Math.round(diff / DAY_MS);
};

// Birthday age parts (years, months, days)
export const getBirthdayAgeParts = (card: BirthdayCard): { years: number; months: number; totalMonths: number; days: number } => {
  if (!card.birthDate) {
    return { years: 0, months: 0, totalMonths: 0, days: 0 };
  }

  const birth = parseLocalDate(card.birthDate);
  const today = startOfToday();

  if (birth.getTime() > today.getTime()) {
    return { years: 0, months: 0, totalMonths: 0, days: 0 };
  }

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = Math.max(0, years) * 12 + Math.max(0, months);

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    totalMonths,
    days: Math.max(0, days)
  };
};

// Chinese zodiac
export const getBirthdayZodiac = (card: BirthdayCard): string => {
  if (!card.birthDate) return "";
  const year = parseLocalDate(card.birthDate).getFullYear();
  const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  return animals[(year - 4) % 12] + "年";
};

// Constellation
export const getBirthdayConstellation = (card: BirthdayCard): string => {
  if (!card.birthDate) return "";
  const d = parseLocalDate(card.birthDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const s = "魔羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯";
  const arr = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  return s.substr(month * 2 - (day < arr[month - 1] ? 2 : 0), 2) + "座";
};

// Plan progress
export const getPlanCompletedCount = (card: PlanCard): number => {
  if (!card.steps || !card.steps.length) return 0;
  return card.steps.filter(s => s.completed).length;
};

export const getPlanProgress = (card: PlanCard): number => {
  if (!card.steps || !card.steps.length) return 0;
  const comp = getPlanCompletedCount(card);
  return Math.round((comp / card.steps.length) * 100);
};

// Type guards
export const isHabitCard = (card: AnyCard): card is HabitCard => card.type === 'habit';
export const isCountdownCard = (card: AnyCard): card is CountdownCard => card.type === 'countdown';
export const isBirthdayCard = (card: AnyCard): card is BirthdayCard => card.type === 'birthday';
export const isAssetCard = (card: AnyCard): card is AssetCard => card.type === 'asset';
export const isSubscriptionCard = (card: AnyCard): card is SubscriptionCard => card.type === 'subscription';
export const isPlanCard = (card: AnyCard): card is PlanCard => card.type === 'plan';

// ========== Habit Streak & Heatmap Helpers ==========

/** 将打卡时间字符串转为 YYYY-MM-DD 格式 */
const toDateKey = (punch: string): string => punch.slice(0, 10);

/** 获取习惯打卡热力图数据（最近 N 天，默认 91 天 ≈ 13 周） */
export const getHabitHeatmap = (card: HabitCard, days: number = 91): { date: string; count: number; level: number }[] => {
  const today = startOfToday();
  const dateMap = new Map<string, number>();
  
  card.punches.forEach(p => {
    const key = toDateKey(p);
    dateMap.set(key, (dateMap.get(key) || 0) + 1);
  });
  
  const result: { date: string; count: number; level: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = dateMap.get(key) || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    result.push({ date: key, count, level });
  }
  return result;
};

/** 计算当前连续打卡天数 */
export const getHabitStreak = (card: HabitCard): number => {
  if (!card.punches.length) return 0;
  
  const today = startOfToday();
  const punchSet = new Set(card.punches.map(toDateKey));
  
  let streak = 0;
  let cursor = new Date(today);
  
  // 如果今天还没打卡，从昨天开始算
  const todayKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
  if (!punchSet.has(todayKey)) {
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (punchSet.has(key)) {
      streak++;
      cursor = new Date(cursor.getTime() - DAY_MS);
    } else {
      break;
    }
  }
  
  return streak;
};

/** 计算历史最长连续打卡天数 */
export const getHabitLongestStreak = (card: HabitCard): number => {
  if (!card.punches.length) return 0;
  
  const sortedDays = [...new Set(card.punches.map(toDateKey))].sort();
  let maxStreak = 1;
  let current = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = parseLocalDate(sortedDays[i - 1]);
    const curr = parseLocalDate(sortedDays[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / DAY_MS);
    if (diff === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }
  
  return maxStreak;
};

/** 获取周打卡统计 */
export const getHabitWeeklyStats = (card: HabitCard): { week: string; count: number }[] => {
  const today = startOfToday();
  const result: { week: string; count: number }[] = [];
  
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(today.getTime() - (today.getDay() || 7 + w * 7) * DAY_MS);
    const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
    
    let count = 0;
    card.punches.forEach(p => {
      const d = parseLocalDate(toDateKey(p));
      if (d >= weekStart && d <= weekEnd) count++;
    });
    
    const label = w === 0 ? '本周' : `${w}周前`;
    result.push({ week: label, count });
  }
  
  return result;
};
