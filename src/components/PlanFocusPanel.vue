<template>
  <view class="plan-focus-container" :class="isDark ? 'pf-dark' : 'pf-light'" v-if="currentPlan">
    <!-- Header -->
    <view class="pf-header">
      <view class="pf-header-left">
        <text class="pf-title">{{ currentPlan.title }}</text>
        <text class="pf-deadline" v-if="currentPlan.deadline">截止：{{ formatDeadline }}</text>
      </view>
      <view class="pf-progress-badge">
        <text class="pf-progress-text">{{ completedCount }}/{{ totalSteps }}</text>
      </view>
    </view>

    <!-- Progress bar -->
    <view class="pf-progress-bar">
      <view class="pf-progress-inner" :style="{ width: progressPercent + '%' }" />
    </view>

    <!-- Steps list -->
    <scroll-view class="pf-steps" scroll-y>
      <view
        v-for="(step, idx) in currentPlan.steps"
        :key="idx"
        class="pf-step"
        :class="{ 'pf-step-completed': step.completed }"
        @tap="onStepTap(idx)"
      >
        <view class="pf-checkbox" :class="{ 'pf-checkbox-checked': step.completed }">
          <text v-if="step.completed" class="pf-check-icon">✓</text>
        </view>
        <view class="pf-step-content">
          <text class="pf-step-time" v-if="step.time">{{ step.time }}</text>
          <text class="pf-step-text">{{ step.text }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Empty state for all completed -->
    <view v-if="completedCount === totalSteps && totalSteps > 0" class="pf-all-done">
      <text class="pf-all-done-icon">🎉</text>
      <text class="pf-all-done-text">全部完成！</text>
    </view>
  </view>

  <!-- No plans state -->
  <view v-else class="plan-focus-empty" :class="isDark ? 'pf-dark' : 'pf-light'">
    <text class="pf-empty-icon">📋</text>
    <text class="pf-empty-text">暂无未完成的计划</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRecordsStore } from "../store/records";
import { useSettingsStore } from "../store/settings";
import type { PlanCard, PlanStep } from "../types/card";

const records = useRecordsStore();
const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");
const now = ref(Date.now());

// Get all plan cards with incomplete steps, sorted by nearest deadline
const incompletePlans = computed(() => {
  return records.cards
    .filter((c): c is PlanCard => {
      if (c.type !== "plan") return false;
      return c.steps.some(s => !s.completed);
    })
    .sort((a, b) => {
      // Sort by deadline (nearest first), then by earliest incomplete step time
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });
});

// Current plan to display (nearest deadline with incomplete steps)
const currentPlan = computed(() => {
  if (incompletePlans.value.length === 0) return null;
  return incompletePlans.value[0];
});

const totalSteps = computed(() => currentPlan.value?.steps.length ?? 0);

const completedCount = computed(() => {
  if (!currentPlan.value) return 0;
  return currentPlan.value.steps.filter(s => s.completed).length;
});

const progressPercent = computed(() => {
  if (totalSteps.value === 0) return 0;
  return Math.round((completedCount.value / totalSteps.value) * 100);
});

const formatDeadline = computed(() => {
  if (!currentPlan.value?.deadline) return "";
  const d = new Date(currentPlan.value.deadline);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
});

// Toggle step completion
function onStepTap(idx: number) {
  if (!currentPlan.value) return;
  const card = currentPlan.value;
  const step = card.steps[idx];
  
  // Toggle the step
  const updatedSteps = card.steps.map((s, i) => 
    i === idx ? { ...s, completed: !s.completed } : s
  );
  
  // Update in store
  records.updateCard(card.id, {
    steps: updatedSteps,
    progress: Math.round((updatedSteps.filter(s => s.completed).length / updatedSteps.length) * 100),
  });
}

// Timer for real-time updates
let timer: number | null = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Watch for card changes - if current plan is completed, it will auto-switch
watch(() => records.cards.length, () => {
  // Reactive update handled by computed
});

defineExpose({});
</script>

<style scoped>
.plan-focus-container {
  margin: 0 32rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

/* Header */
.pf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.pf-header-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.pf-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D3436;
}

.pf-deadline {
  font-size: 22rpx;
  color: #E07A5F;
  font-weight: 600;
}

.pf-progress-badge {
  background: rgba(92, 124, 138, 0.1);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  margin-left: 16rpx;
}

.pf-progress-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #5C7C8A;
}

/* Progress bar */
.pf-progress-bar {
  height: 8rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.pf-progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #5C7C8A, #8FB3C0);
  border-radius: 4rpx;
  transition: width 0.4s ease;
}

/* Steps */
.pf-steps {
  max-height: 400rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.pf-step {
  display: flex;
  align-items: center;
  padding: 16rpx 12rpx;
  border-radius: 12rpx;
  transition: all 0.2s ease;
  gap: 20rpx;
}

.pf-step:active {
  background: rgba(0, 0, 0, 0.03);
}

.pf-step-completed {
  opacity: 0.5;
}

.pf-step-completed .pf-step-text {
  text-decoration: line-through;
  color: #999;
}

/* Checkbox */
.pf-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid #DDD;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.pf-checkbox-checked {
  background: #5C7C8A;
  border-color: #5C7C8A;
}

.pf-check-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
}

/* Step content */
.pf-step-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.pf-step-time {
  font-size: 24rpx;
  font-weight: 700;
  color: #5C7C8A;
  background: rgba(92, 124, 138, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.pf-step-text {
  font-size: 28rpx;
  color: #2D3436;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* All done */
.pf-all-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  gap: 12rpx;
}

.pf-all-done-icon {
  font-size: 64rpx;
}

.pf-all-done-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #5C7C8A;
}

/* Empty state */
.plan-focus-empty {
  margin: 0 32rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.pf-empty-icon {
  font-size: 64rpx;
}

.pf-empty-text {
  font-size: 28rpx;
  color: #999;
}

/* Dark mode */
.pf-dark.plan-focus-container,
.pf-dark.plan-focus-empty {
  background: #1E1E1E;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.pf-dark .pf-title {
  color: #F5F5DC;
}

.pf-dark .pf-step-text {
  color: #F5F5DC;
}

.pf-dark .pf-step:active {
  background: rgba(255, 255, 255, 0.05);
}

.pf-dark .pf-step-completed .pf-step-text {
  color: #666;
}

.pf-dark .pf-checkbox {
  border-color: #555;
}

.pf-dark .pf-checkbox-checked {
  background: #8FB3C0;
  border-color: #8FB3C0;
}

.pf-dark .pf-all-done-text {
  color: #8FB3C0;
}

.pf-dark .pf-empty-text {
  color: #888;
}

.pf-dark .pf-deadline {
  color: #E9A07A;
}

.pf-dark .pf-progress-badge {
  background: rgba(143, 179, 192, 0.15);
}

.pf-dark .pf-progress-text {
  color: #8FB3C0;
}

.pf-dark .pf-progress-bar {
  background: rgba(255, 255, 255, 0.08);
}

.pf-dark .pf-progress-inner {
  background: linear-gradient(90deg, #5C7C8A, #8FB3C0);
}

.pf-dark .pf-step-time {
  color: #8FB3C0;
  background: rgba(143, 179, 192, 0.12);
}

.pf-dark .pf-check-icon {
  color: #1E1E1E;
}
</style>
