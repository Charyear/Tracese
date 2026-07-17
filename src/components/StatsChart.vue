<template>
  <view class="stats-chart" :class="isDark ? 'sc-dark' : 'sc-light'">
    <!-- Asset Statistics Panel -->
    <view v-if="activeCategory === 'asset'" class="stats-panel">
      <view class="stats-header">
        <text class="stats-title">资产统计</text>
        <picker 
          mode="selector" 
          :range="timeRangeOptions" 
          :value="selectedTimeRange"
          @change="onTimeRangeChange"
          class="time-range-picker"
        >
          <view class="picker-display">
            <text>{{ timeRangeOptions[selectedTimeRange] }}</text>
            <text class="picker-arrow">▾</text>
          </view>
        </picker>
      </view>
      
      <!-- Summary Row -->
      <view class="stats-summary">
        <view class="summary-item income">
          <text class="summary-label">收入</text>
          <text class="summary-value">¥{{ assetStats.income }}</text>
        </view>
        <view class="summary-item expense">
          <text class="summary-label">支出</text>
          <text class="summary-value">¥{{ assetStats.expense }}</text>
        </view>
        <view class="summary-item net">
          <text class="summary-label">结余</text>
          <text class="summary-value" :class="assetStats.net >= 0 ? 'text-positive' : 'text-negative'">¥{{ assetStats.net }}</text>
        </view>
      </view>

      <!-- Budget Progress -->
      <view v-if="budgetStats.hasBudget" class="budget-section">
        <view class="budget-header">
          <text class="budget-title">本月预算</text>
          <text class="budget-remaining" :class="budgetStats.remaining >= 0 ? 'text-positive' : 'text-negative'">
            剩余 ¥{{ budgetStats.remaining }}
          </text>
        </view>
        <view class="budget-progress-bar">
          <view class="budget-progress-inner" :style="{ width: budgetStats.percentage + '%' }" :class="{ 'budget-over': budgetStats.percentage > 100 }" />
        </view>
        <view class="budget-detail">
          <text class="budget-text">已支出 ¥{{ budgetStats.spent }} / 预算 ¥{{ budgetStats.total }}</text>
        </view>
      </view>

      <!-- Category Breakdown -->
      <view v-if="categoryStats.length > 0" class="category-section">
        <text class="section-title">支出分类</text>
        <view class="category-list">
          <view v-for="cat in categoryStats" :key="cat.name" class="category-item">
            <view class="category-info">
              <text class="category-name">{{ cat.name }}</text>
              <text class="category-amount">¥{{ cat.amount }}</text>
            </view>
            <view class="category-bar-bg">
              <view class="category-bar-inner" :style="{ width: cat.percentage + '%' }" />
            </view>
            <text class="category-percent">{{ cat.percentage }}%</text>
          </view>
        </view>
      </view>

      <!-- Chart Area -->
      <view class="chart-container">
        <view class="chart-header">
          <text class="chart-title">收支趋势</text>
          <view class="chart-legend">
            <view class="legend-item">
              <view class="legend-dot income"></view>
              <text>收入</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot expense"></view>
              <text>支出</text>
            </view>
          </view>
        </view>
        <view class="chart-area">
          <view 
            v-for="(bar, index) in chartData" 
            :key="index" 
            class="chart-bar-group"
          >
            <view class="bar-container">
              <view 
                class="bar income-bar" 
                :style="{ height: bar.incomeHeight + '%' }"
              ></view>
              <view 
                class="bar expense-bar" 
                :style="{ height: bar.expenseHeight + '%' }"
              ></view>
            </view>
            <text class="bar-label">{{ bar.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Subscription Statistics Panel -->
    <view v-if="activeCategory === 'subscription' && subscriptionStats.count > 0" class="stats-panel sub-stats-panel">
      <view class="stats-header">
        <text class="stats-title">订阅概览</text>
        <text class="sub-stats-badge">{{ subscriptionStats.count }}个</text>
      </view>
      <view class="stats-summary">
        <view class="summary-item expense">
          <text class="summary-label">月均花费</text>
          <text class="summary-value">¥{{ subscriptionStats.monthly }}</text>
        </view>
        <view class="summary-item income">
          <text class="summary-label">日均支出</text>
          <text class="summary-value">¥{{ subscriptionStats.dailyAvg }}</text>
        </view>
        <view class="summary-item expense">
          <text class="summary-label">累计花费</text>
          <text class="summary-value">¥{{ subscriptionStats.totalCost }}</text>
        </view>
      </view>
      <!-- Upcoming renewals -->
      <view v-if="upcomingRenewals.length > 0" class="renewal-section">
        <text class="section-title">即将到期</text>
        <view class="renewal-list">
          <view v-for="item in upcomingRenewals" :key="item.id" class="renewal-item">
            <view class="renewal-info">
              <text class="renewal-title">{{ item.title }}</text>
              <text class="renewal-date">{{ item.nextBillingDate }}</text>
            </view>
            <text class="renewal-price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRecordsStore } from "../store/records";
import { useSettingsStore } from "../store/settings";

const props = defineProps<{
  activeCategory: string;
}>();

const emit = defineEmits<{
  (e: "timeRangeChange", value: number): void;
}>();

const records = useRecordsStore();
const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");

const selectedTimeRange = ref(0);

const timeRangeOptions = [
  '全部', '半年内', '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

const onTimeRangeChange = (e: any) => {
  selectedTimeRange.value = e.detail.value;
  settings.triggerHaptic();
  emit("timeRangeChange", e.detail.value);
};

// 资产统计计算 - 使用 Map 优化为 O(n)
const assetStats = computed(() => {
  const assetCards = records.cards.filter(card => card.type === 'asset');
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Build monthly lookup map once
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  assetCards.forEach(card => {
    const cardDate = new Date(card.date);
    const key = `${cardDate.getFullYear()}-${cardDate.getMonth()}`;
    if (!monthlyMap.has(key)) monthlyMap.set(key, { income: 0, expense: 0 });
    const data = monthlyMap.get(key)!;
    if (card.flowType === 'income') data.income += card.amount;
    else if (card.flowType === 'expense') data.expense += card.amount;
  });
  
  let income = 0;
  let expense = 0;
  
  if (selectedTimeRange.value === 0) {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const vals = monthlyMap.get(key);
      if (vals) { income += vals.income; expense += vals.expense; }
    }
  } else if (selectedTimeRange.value === 1) {
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const vals = monthlyMap.get(key);
      if (vals) { income += vals.income; expense += vals.expense; }
    }
  } else {
    // Specific month
    const targetMonth = selectedTimeRange.value - 2;
    const targetKey = `${currentYear}-${targetMonth}`;
    const vals = monthlyMap.get(targetKey);
    if (vals) { income = vals.income; expense = vals.expense; }
  }
  
  return {
    income: income.toFixed(2),
    expense: expense.toFixed(2),
    net: (income - expense).toFixed(2),
    count: assetCards.length.toString()
  };
});

// 预算统计计算
const budgetStats = computed(() => {
  const assetCards = records.cards.filter(card => card.type === 'asset' && card.flowType === 'expense');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Get budget from settings or card-level budget
  const monthlyBudget = settings.monthlyBudget || 0;
  
  // Calculate current month spending
  let spent = 0;
  assetCards.forEach(card => {
    const cardDate = new Date(card.date);
    if (cardDate.getFullYear() === currentYear && cardDate.getMonth() === currentMonth) {
      spent += card.amount;
    }
  });
  
  const remaining = monthlyBudget - spent;
  const percentage = monthlyBudget > 0 ? Math.min(100, Math.round((spent / monthlyBudget) * 100)) : 0;
  
  return {
    hasBudget: monthlyBudget > 0,
    total: monthlyBudget.toFixed(2),
    spent: spent.toFixed(2),
    remaining: remaining.toFixed(2),
    percentage
  };
});

// 支出分类统计
const categoryStats = computed(() => {
  const assetCards = records.cards.filter(card => card.type === 'asset' && card.flowType === 'expense');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Group by category for current month
  const categoryMap = new Map<string, number>();
  let total = 0;
  
  assetCards.forEach(card => {
    const cardDate = new Date(card.date);
    if (cardDate.getFullYear() === currentYear && cardDate.getMonth() === currentMonth) {
      const cat = card.category || '其他';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + card.amount);
      total += card.amount;
    }
  });
  
  // Convert to array and sort by amount
  const result = Array.from(categoryMap.entries()).map(([name, amount]) => ({
    name,
    amount: amount.toFixed(2),
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0
  }));
  
  result.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  return result.slice(0, 5); // Top 5 categories
});

// 即将到期的订阅
const upcomingRenewals = computed(() => {
  const subs = records.cards.filter(c => c.type === 'subscription');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const result: { id: string; title: string; nextBillingDate: string; price: number; daysLeft: number }[] = [];
  
  subs.forEach((card: any) => {
    if (card.nextBillingDate) {
      const nextDate = new Date(card.nextBillingDate);
      const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays >= 0) {
        result.push({
          id: card.id,
          title: card.title,
          nextBillingDate: card.nextBillingDate,
          price: card.price,
          daysLeft: diffDays
        });
      }
    }
  });
  
  result.sort((a, b) => a.daysLeft - b.daysLeft);
  return result;
});

// 订阅统计计算
const subscriptionStats = computed(() => {
  const subs = records.cards.filter(c => c.type === 'subscription');
  if (subs.length === 0) return { count: 0, monthly: '0.00', dailyAvg: '0.00', totalCost: '0.00' };

  let totalMonthly = 0;
  let totalCost = 0;
  subs.forEach((card: any) => {
    const price = card.price || 0;
    switch (card.billingCycle) {
      case 'monthly':
        totalMonthly += price;
        break;
      case 'yearly':
        totalMonthly += price / 12;
        break;
      case 'weekly':
        totalMonthly += price * 4.33;
        break;
      default:
        totalMonthly += price;
    }
    totalCost += card.totalCost || 0;
  });

  const dailyAvg = totalMonthly / 30;

  return {
    count: subs.length,
    monthly: totalMonthly.toFixed(2),
    dailyAvg: dailyAvg.toFixed(2),
    totalCost: totalCost.toFixed(2)
  };
});

// 图表数据计算 - 使用 Map 优化为 O(n+m)
const chartData = computed(() => {
  const assetCards = records.cards.filter(card => card.type === 'asset');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Build lookup map: key = "year-month" or "year-month-day" -> { income, expense }
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  const dailyMap = new Map<string, { income: number; expense: number }>();
  
  assetCards.forEach(card => {
    const cardDate = new Date(card.date);
    const y = cardDate.getFullYear();
    const m = cardDate.getMonth();
    const d = cardDate.getDate();
    
    const monthKey = `${y}-${m}`;
    const dayKey = `${y}-${m}-${d}`;
    
    if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, { income: 0, expense: 0 });
    if (!dailyMap.has(dayKey)) dailyMap.set(dayKey, { income: 0, expense: 0 });
    
    const monthData = monthlyMap.get(monthKey)!;
    const dayData = dailyMap.get(dayKey)!;
    
    if (card.flowType === 'income') {
      monthData.income += card.amount;
      dayData.income += card.amount;
    } else if (card.flowType === 'expense') {
      monthData.expense += card.amount;
      dayData.expense += card.amount;
    }
  });
  
  const data: { label: string; income: number; expense: number }[] = [];
  
  if (selectedTimeRange.value === 0) {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const vals = monthlyMap.get(key) ?? { income: 0, expense: 0 };
      data.push({ label: `${d.getMonth() + 1}月`, ...vals });
    }
  } else if (selectedTimeRange.value === 1) {
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const vals = monthlyMap.get(key) ?? { income: 0, expense: 0 };
      data.push({ label: `${d.getMonth() + 1}月`, ...vals });
    }
  } else {
    // Specific month - daily view
    const targetMonth = selectedTimeRange.value - 2;
    const daysInMonth = new Date(currentYear, targetMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${currentYear}-${targetMonth}-${day}`;
      const vals = dailyMap.get(key) ?? { income: 0, expense: 0 };
      data.push({ label: `${day}日`, ...vals });
    }
  }
  
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
  
  return data.map(d => ({
    label: d.label,
    incomeHeight: (d.income / maxVal) * 100,
    expenseHeight: (d.expense / maxVal) * 100
  }));
});
</script>

<style scoped>
.stats-chart {
  margin: 0 24rpx 20rpx;
}

.stats-panel {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.sc-dark .stats-panel {
  background: #1A1A1A;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.stats-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
}

.sc-dark .stats-title {
  color: #F5F5DC;
}

.time-range-picker {
  flex-shrink: 0;
}

.picker-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.sc-dark .picker-display {
  background: rgba(255, 255, 255, 0.08);
  color: #AAA;
}

.picker-arrow {
  font-size: 20rpx;
}

.stats-summary {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.summary-item {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
}

.summary-item.income {
  background: rgba(173, 199, 184, 0.15);
}

.summary-item.expense {
  background: rgba(227, 185, 188, 0.15);
}

.summary-label {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.summary-value {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #2D3436;
}

.dark-mode .summary-value {
  color: #F5F5DC;
}

.summary-item.income .summary-value {
  color: #6E8B79;
}

.summary-item.expense .summary-value {
  color: #A67C80;
}

.chart-container {
  margin-top: 20rpx;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.chart-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
}

.dark-mode .chart-title {
  color: #AAA;
}

.chart-legend {
  display: flex;
  gap: 20rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-dot.income {
  background: #ADC7B8;
}

.legend-dot.expense {
  background: #E3B9BC;
}

.chart-area {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  height: 200rpx;
  padding-bottom: 40rpx;
  position: relative;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 4rpx;
  width: 100%;
}

.bar {
  flex: 1;
  border-radius: 4rpx 4rpx 0 0;
  min-height: 4rpx;
  transition: height 0.3s ease;
}

.income-bar {
  background: #ADC7B8;
}

.expense-bar {
  background: #E3B9BC;
}

.bar-label {
  position: absolute;
  bottom: -32rpx;
  font-size: 18rpx;
  color: #BBB;
  white-space: nowrap;
}

.dark-mode .bar-label {
  color: #666;
}

/* Subscription Stats */
.sub-stats-panel {
  margin-top: 20rpx;
}

.sub-stats-badge {
  padding: 6rpx 16rpx;
  background: rgba(216, 197, 216, 0.2);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #8E7B92;
  font-weight: 600;
}

/* Budget Section */
.budget-section {
  margin-top: 24rpx;
  padding: 20rpx;
  background: rgba(92, 124, 138, 0.06);
  border-radius: 16rpx;
}

.dark-mode .budget-section {
  background: rgba(92, 124, 138, 0.1);
}

.budget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.budget-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
}

.dark-mode .budget-title {
  color: #AAA;
}

.budget-remaining {
  font-size: 24rpx;
  font-weight: 700;
}

.budget-progress-bar {
  height: 16rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8rpx;
  overflow: hidden;
}

.dark-mode .budget-progress-bar {
  background: rgba(255, 255, 255, 0.06);
}

.budget-progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #5C7C8A, #7BA3B0);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.budget-over {
  background: linear-gradient(90deg, #E57373, #EF5350) !important;
}

.budget-detail {
  margin-top: 8rpx;
}

.budget-text {
  font-size: 20rpx;
  color: #999;
}

.dark-mode .budget-text {
  color: #888;
}

/* Category Section */
.category-section {
  margin-top: 24rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.dark-mode .section-title {
  color: #AAA;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.category-info {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.category-name {
  font-size: 22rpx;
  color: #666;
}

.dark-mode .category-name {
  color: #AAA;
}

.category-amount {
  font-size: 20rpx;
  color: #999;
  font-weight: 600;
}

.category-bar-bg {
  flex: 1;
  height: 12rpx;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6rpx;
  overflow: hidden;
}

.dark-mode .category-bar-bg {
  background: rgba(255, 255, 255, 0.04);
}

.category-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #E3B9BC, #D4A0A4);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.category-percent {
  width: 60rpx;
  text-align: right;
  font-size: 20rpx;
  color: #999;
  font-weight: 600;
}

/* Renewal Section */
.renewal-section {
  margin-top: 24rpx;
}

.renewal-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.renewal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background: rgba(216, 197, 216, 0.08);
  border-radius: 12rpx;
}

.dark-mode .renewal-item {
  background: rgba(216, 197, 216, 0.05);
}

.renewal-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.renewal-title {
  font-size: 24rpx;
  color: #2D3436;
  font-weight: 600;
}

.dark-mode .renewal-title {
  color: #F5F5DC;
}

.renewal-date {
  font-size: 20rpx;
  color: #999;
}

.renewal-price {
  font-size: 24rpx;
  color: #8E7B92;
  font-weight: 700;
}

/* Text Utilities */
.text-positive {
  color: #6E8B79 !important;
}

.text-negative {
  color: #A67C80 !important;
}

.summary-item.net {
  background: rgba(92, 124, 138, 0.08);
}

.dark-mode .summary-item.net {
  background: rgba(92, 124, 138, 0.12);
}
</style>
