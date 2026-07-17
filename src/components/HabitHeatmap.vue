<template>
  <view class="habit-heatmap" :class="isDark ? 'hh-dark' : 'hh-light'" v-if="activeCategory === 'habit'">
    <view class="heatmap-header">
      <text class="heatmap-title">{{ monthTitle }}</text>
      <text class="heatmap-subtitle">{{ monthSubtitle }}</text>
    </view>
    
    <!-- Weekday Headers -->
    <view class="weekday-headers">
      <text v-for="day in weekdayLabels" :key="day" class="weekday-label">{{ day }}</text>
    </view>
    
    <!-- Calendar Grid -->
    <view class="calendar-grid">
      <view
        v-for="(week, wIdx) in calendarWeeks"
        :key="wIdx"
        class="calendar-week"
      >
        <view
          v-for="(day, dIdx) in week"
          :key="dIdx"
          class="calendar-day"
          :class="[
            `level-${day.level}`,
            { 
              'day-empty': !day.date,
              'day-future': day.isFuture,
              'day-today': day.isToday
            }
          ]"
        >
          <text v-if="day.date" class="day-number">{{ day.dayNum }}</text>
          <text v-if="day.date && day.count > 0" class="day-count">{{ day.count }}</text>
        </view>
      </view>
    </view>
    
    <!-- Legend -->
    <view class="heatmap-legend">
      <text class="legend-label">少</text>
      <view class="legend-cells">
        <view class="legend-cell level-0" />
        <view class="legend-cell level-1" />
        <view class="legend-cell level-2" />
        <view class="legend-cell level-3" />
        <view class="legend-cell level-4" />
      </view>
      <text class="legend-label">多</text>
    </view>
    
    <!-- Streak Stats -->
    <view class="streak-stats">
      <view class="streak-item">
        <text class="streak-value">{{ habitCards.length }}</text>
        <text class="streak-label">习惯数</text>
      </view>
      <view class="streak-divider" />
      <view class="streak-item">
        <text class="streak-value">{{ completedTodayCount }}</text>
        <text class="streak-label">今日完成</text>
      </view>
      <view class="streak-divider" />
      <view class="streak-item">
        <text class="streak-value">{{ currentStreak }}</text>
        <text class="streak-label">当前连续</text>
      </view>
      <view class="streak-divider" />
      <view class="streak-item">
        <text class="streak-value">{{ longestStreak }}</text>
        <text class="streak-label">最长连续</text>
      </view>
      <view class="streak-divider" />
      <view class="streak-item">
        <text class="streak-value">{{ totalPunches }}</text>
        <text class="streak-label">累计打卡</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRecordsStore } from "../store/records";
import { useSettingsStore } from "../store/settings";
import { getHabitStreak, getHabitLongestStreak } from "../utils/card-helpers";
import type { HabitCard } from "../types/card";

const props = defineProps<{
  activeCategory: string;
}>();

const records = useRecordsStore();
const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");

const habitCards = computed(() => records.cards.filter(c => c.type === 'habit') as HabitCard[]);

const currentStreak = computed(() => {
  if (habitCards.value.length === 0) return 0;
  return Math.max(...habitCards.value.map(c => getHabitStreak(c)));
});

const longestStreak = computed(() => {
  if (habitCards.value.length === 0) return 0;
  return Math.max(...habitCards.value.map(c => getHabitLongestStreak(c)));
});

const totalPunches = computed(() => {
  return habitCards.value.reduce((sum, c) => sum + c.totalCount, 0);
});

const completedTodayCount = computed(() => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return habitCards.value.filter(c => c.punches.some(p => p.startsWith(todayKey))).length;
});

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

const monthTitle = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月`;
});

const monthSubtitle = computed(() => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `共 ${daysInMonth} 天`;
});

interface CalendarDay {
  date: string;
  dayNum: number;
  count: number;
  level: number;
  isFuture: boolean;
  isToday: boolean;
}

const calendarWeeks = computed((): CalendarDay[][] => {
  if (habitCards.value.length === 0) return [];
  
  // Merge all habit punches
  const allPunches: string[] = [];
  habitCards.value.forEach(c => allPunches.push(...c.punches));
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = new Date(year, month, now.getDate());
  
  // Build date -> count map
  const dateMap = new Map<string, number>();
  allPunches.forEach(p => {
    const key = p.slice(0, 10);
    dateMap.set(key, (dateMap.get(key) || 0) + 1);
  });
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0=Sun, 1=Mon, ...
  const daysInMonth = lastDay.getDate();
  
  // Build calendar grid (6 rows max × 7 columns)
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  // Fill empty cells before the first day
  for (let i = 0; i < startWeekday; i++) {
    currentWeek.push({
      date: '',
      dayNum: 0,
      count: 0,
      level: 0,
      isFuture: false,
      isToday: false
    });
  }
  
  // Fill actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const count = dateMap.get(key) || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    const isFuture = date > today;
    const isToday = date.getTime() === today.getTime();
    
    currentWeek.push({
      date: key,
      dayNum: d,
      count,
      level,
      isFuture,
      isToday
    });
    
    // Start new week after Saturday
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill remaining cells in last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        dayNum: 0,
        count: 0,
        level: 0,
        isFuture: false,
        isToday: false
      });
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
});
</script>

<style scoped>
.habit-heatmap {
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.hh-dark.habit-heatmap {
  background: #1A1A1A;
}

.heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.heatmap-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
}

.hh-dark .heatmap-title {
  color: #F5F5DC;
}

.heatmap-subtitle {
  font-size: 22rpx;
  color: #999;
}

.hh-dark .heatmap-subtitle {
  color: #888;
}

/* Weekday headers */
.weekday-headers {
  display: flex;
  margin-bottom: 12rpx;
}

.weekday-label {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #999;
  font-weight: 600;
}

.hh-dark .weekday-label {
  color: #888;
}

/* Calendar grid */
.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.calendar-week {
  display: flex;
  gap: 8rpx;
}

.calendar-day {
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  position: relative;
  transition: all 0.2s ease;
  min-height: 64rpx;
}

.day-empty {
  background: transparent !important;
}

.day-number {
  font-size: 24rpx;
  font-weight: 600;
  color: #2D3436;
  line-height: 1;
}

.hh-dark .day-number {
  color: #F5F5DC;
}

.day-count {
  font-size: 16rpx;
  color: #999;
  line-height: 1;
  margin-top: 2rpx;
}

.hh-dark .day-count {
  color: #888;
}

.day-future {
  opacity: 0.3;
}

.day-today {
  border: 2rpx solid #6B9E7A;
  box-sizing: border-box;
}

.hh-dark .day-today {
  border-color: #8FBC8F;
}

/* Level colors */
.level-0 {
  background: rgba(0, 0, 0, 0.04);
}

.level-1 {
  background: rgba(107, 158, 122, 0.2);
}

.level-2 {
  background: rgba(107, 158, 122, 0.4);
}

.level-3 {
  background: rgba(107, 158, 122, 0.6);
}

.level-4 {
  background: rgba(107, 158, 122, 0.85);
}

.hh-dark .level-0 {
  background: rgba(255, 255, 255, 0.05);
}

.hh-dark .level-1 {
  background: rgba(143, 188, 143, 0.2);
}

.hh-dark .level-2 {
  background: rgba(143, 188, 143, 0.4);
}

.hh-dark .level-3 {
  background: rgba(143, 188, 143, 0.6);
}

.hh-dark .level-4 {
  background: rgba(143, 188, 143, 0.85);
}

/* Legend */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 20rpx;
}

.legend-label {
  font-size: 20rpx;
  color: #999;
}

.hh-dark .legend-label {
  color: #888;
}

.legend-cells {
  display: flex;
  gap: 4rpx;
}

.legend-cell {
  width: 24rpx;
  height: 24rpx;
  border-radius: 6rpx;
}

/* Streak stats */
.streak-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.dark-mode .streak-stats {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.streak-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.streak-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #6B9E7A;
  line-height: 1;
}

.streak-label {
  font-size: 20rpx;
  color: #999;
}

.dark-mode .streak-label {
  color: #888;
}

.streak-divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.08);
}

.dark-mode .streak-divider {
  background: rgba(255, 255, 255, 0.1);
}
</style>
