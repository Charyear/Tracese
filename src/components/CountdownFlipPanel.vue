<template>
  <view class="countdown-flip-container" :class="isDark ? 'cd-dark' : 'cd-light'">
    <!-- Card selector -->
    <view class="cd-selector" v-if="showSelector">
      <view class="cd-selector-mask" @tap="showSelector = false" />
      <view class="cd-selector-sheet">
        <text class="cd-selector-title">选择倒计时卡片</text>
        <scroll-view class="cd-selector-list" scroll-y>
          <view
            v-for="card in countdownCards"
            :key="card.id"
            class="cd-selector-item"
            :class="{ 'cd-selector-active': selectedCardId === card.id }"
            @tap="selectCard(card.id)"
          >
            <text class="cd-selector-name">{{ card.title }}</text>
            <text class="cd-selector-days">{{ getDaysLeft(card) }}天</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- Main flip panel -->
    <view class="cd-flip-panel" @tap="onPanelTap">
      <!-- Flip clock display -->
      <view class="cd-clock">
        <!-- Days -->
        <view class="cd-digit-group">
          <view class="cd-flip-wrapper">
            <view class="cd-flip-card" :class="{ 'cd-flipping': flippingDays }">
              <view class="cd-flip-face cd-flip-front">{{ displayDays }}</view>
              <view class="cd-flip-face cd-flip-back">{{ prevDisplayDays }}</view>
            </view>
          </view>
          <text class="cd-digit-label">天</text>
        </view>
        <text class="cd-separator">:</text>
        <!-- Hours -->
        <view class="cd-digit-group">
          <view class="cd-flip-wrapper">
            <view class="cd-flip-card" :class="{ 'cd-flipping': flippingHours }">
              <view class="cd-flip-face cd-flip-front">{{ displayHours }}</view>
              <view class="cd-flip-face cd-flip-back">{{ prevDisplayHours }}</view>
            </view>
          </view>
          <text class="cd-digit-label">时</text>
        </view>
        <text class="cd-separator">:</text>
        <!-- Minutes -->
        <view class="cd-digit-group">
          <view class="cd-flip-wrapper">
            <view class="cd-flip-card" :class="{ 'cd-flipping': flippingMinutes }">
              <view class="cd-flip-face cd-flip-front">{{ displayMinutes }}</view>
              <view class="cd-flip-face cd-flip-back">{{ prevDisplayMinutes }}</view>
            </view>
          </view>
          <text class="cd-digit-label">分</text>
        </view>
        <text class="cd-separator">:</text>
        <!-- Seconds -->
        <view class="cd-digit-group">
          <view class="cd-flip-wrapper">
            <view class="cd-flip-card" :class="{ 'cd-flipping': flippingSeconds }">
              <view class="cd-flip-face cd-flip-front">{{ displaySeconds }}</view>
              <view class="cd-flip-face cd-flip-back">{{ prevDisplaySeconds }}</view>
            </view>
          </view>
          <text class="cd-digit-label">秒</text>
        </view>
      </view>

      <!-- Card title -->
      <view class="cd-card-title-row">
        <text class="cd-card-title">{{ currentCard?.title || '倒计时' }}</text>
        <text class="cd-card-target">{{ formatTargetDate }}</text>
      </view>

      <!-- Hint -->
      <text class="cd-hint">点击选择卡片</text>
    </view>

    <!-- Page indicator -->
    <view class="cd-indicator">
      <view
        v-for="(_, idx) in countdownCards"
        :key="idx"
        class="cd-dot"
        :class="{ 'cd-dot-active': idx === currentIndex }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRecordsStore } from "../store/records";
import { useSettingsStore } from "../store/settings";
import type { CountdownCard } from "../types/card";

const records = useRecordsStore();
const settings = useSettingsStore();

const isDark = computed(() => settings.theme === "dark");

const currentIndex = ref(0);
const selectedCardId = ref<string | null>(null);
const showSelector = ref(false);
const now = ref(Date.now());

// Flip states
const flippingDays = ref(false);
const flippingHours = ref(false);
const flippingMinutes = ref(false);
const flippingSeconds = ref(false);

// Previous values for flip comparison
const prevDays = ref(-1);
const prevHours = ref(-1);
const prevMinutes = ref(-1);
const prevSeconds = ref(-1);

// Get all countdown cards sorted by nearest target date
const countdownCards = computed(() => {
  const cards = records.cards.filter((c): c is CountdownCard => c.type === "countdown");
  return cards.sort((a, b) => {
    const timeA = new Date(a.targetDate).getTime();
    const timeB = new Date(b.targetDate).getTime();
    const nowTime = Date.now();
    // Future events first (ascending), then past events
    const diffA = timeA - nowTime;
    const diffB = timeB - nowTime;
    if (diffA >= 0 && diffB < 0) return -1;
    if (diffA < 0 && diffB >= 0) return 1;
    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
    return diffB - diffA; // both past: most recent first
  });
});

// Current card to display
const currentCard = computed(() => {
  if (countdownCards.value.length === 0) return null;
  return countdownCards.value[currentIndex.value];
});

// Days until target
function getDaysLeft(card: CountdownCard): number {
  if (!card.targetDate) return 0;
  const target = new Date(card.targetDate).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Time remaining breakdown
const timeRemaining = computed(() => {
  if (!currentCard.value) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const target = new Date(currentCard.value.targetDate).getTime();
  const diff = Math.max(0, target - now.value);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
});

const displayDays = computed(() => String(timeRemaining.value.days).padStart(2, "0"));
const displayHours = computed(() => String(timeRemaining.value.hours).padStart(2, "0"));
const displayMinutes = computed(() => String(timeRemaining.value.minutes).padStart(2, "0"));
const displaySeconds = computed(() => String(timeRemaining.value.seconds).padStart(2, "0"));

const prevDisplayDays = computed(() => String(prevDays.value).padStart(2, "0"));
const prevDisplayHours = computed(() => String(prevHours.value).padStart(2, "0"));
const prevDisplayMinutes = computed(() => String(prevMinutes.value).padStart(2, "0"));
const prevDisplaySeconds = computed(() => String(prevSeconds.value).padStart(2, "0"));

const formatTargetDate = computed(() => {
  if (!currentCard.value?.targetDate) return "";
  const d = new Date(currentCard.value.targetDate);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
});

// Select a card
function selectCard(id: string) {
  selectedCardId.value = id;
  const idx = countdownCards.value.findIndex(c => c.id === id);
  if (idx >= 0) currentIndex.value = idx;
  showSelector.value = false;
}

// Handle panel tap - show selector
function onPanelTap() {
  showSelector.value = true;
}

// Reset to nearest card
function resetToNearest() {
  selectedCardId.value = null;
  currentIndex.value = 0;
}

// Timer
let timer: number | null = null;

onMounted(() => {
  resetToNearest();
  timer = setInterval(() => {
    const rem = timeRemaining.value;
    // Trigger flip animations on change
    if (prevDays.value !== rem.days) {
      flippingDays.value = true;
      setTimeout(() => { flippingDays.value = false; }, 500);
    }
    if (prevHours.value !== rem.hours) {
      flippingHours.value = true;
      setTimeout(() => { flippingHours.value = false; }, 500);
    }
    if (prevMinutes.value !== rem.minutes) {
      flippingMinutes.value = true;
      setTimeout(() => { flippingMinutes.value = false; }, 500);
    }
    if (prevSeconds.value !== rem.seconds) {
      flippingSeconds.value = true;
      setTimeout(() => { flippingSeconds.value = false; }, 500);
    }
    prevDays.value = rem.days;
    prevHours.value = rem.hours;
    prevMinutes.value = rem.minutes;
    prevSeconds.value = rem.seconds;
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

watch(() => records.cards.length, () => {
  if (currentIndex.value >= countdownCards.value.length) {
    currentIndex.value = 0;
  }
});

defineExpose({ resetToNearest });
</script>

<style scoped>
.countdown-flip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

/* Light theme (default) */
.cd-light {
  --cd-panel-bg: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  --cd-digit-bg: #ffffff;
  --cd-digit-color: #2D3436;
  --cd-separator-color: #5C7C8A;
  --cd-label-color: #666;
  --cd-title-color: #2D3436;
  --cd-target-color: #999;
  --cd-hint-color: #bbb;
  --cd-dot-bg: rgba(0, 0, 0, 0.1);
  --cd-dot-active: #5C7C8A;
  --cd-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
}

/* Dark theme */
.cd-dark {
  --cd-panel-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  --cd-digit-bg: rgba(255, 255, 255, 0.08);
  --cd-digit-color: #FFD700;
  --cd-separator-color: rgba(255, 215, 0, 0.6);
  --cd-label-color: rgba(255, 255, 255, 0.5);
  --cd-title-color: #ffffff;
  --cd-target-color: rgba(255, 255, 255, 0.5);
  --cd-hint-color: rgba(255, 255, 255, 0.3);
  --cd-dot-bg: rgba(255, 255, 255, 0.15);
  --cd-dot-active: #FFD700;
  --cd-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.3);
}

/* Selector overlay */
.cd-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}
.cd-selector-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}
.cd-selector-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  max-height: 60vh;
}
.cd-selector-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 24rpx;
  display: block;
  text-align: center;
}
.cd-selector-list {
  max-height: 50vh;
}
.cd-selector-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  background: rgba(0, 0, 0, 0.03);
}
.cd-selector-active {
  background: rgba(92, 124, 138, 0.12);
  border: 2rpx solid #5C7C8A;
}
.cd-selector-name {
  font-size: 28rpx;
  color: #2D3436;
}
.cd-selector-days {
  font-size: 26rpx;
  color: #5C7C8A;
  font-weight: 600;
}

/* Main panel */
.cd-flip-panel {
  width: 680rpx;
  min-height: 320rpx;
  background: var(--cd-panel-bg);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--cd-shadow);
}

/* Flip clock */
.cd-clock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 32rpx;
}

.cd-digit-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

/* Flip card wrapper - 3D perspective */
.cd-flip-wrapper {
  width: 90rpx;
  height: 110rpx;
  perspective: 200rpx;
  position: relative;
}

/* The flip card itself */
.cd-flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.cd-flip-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: var(--cd-digit-bg);
  font-size: 64rpx;
  font-weight: 800;
  color: var(--cd-digit-color);
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
}

.cd-flip-front {
  transform: rotateX(0deg);
  z-index: 2;
}

.cd-flip-back {
  transform: rotateX(180deg);
}

/* Flip animation - when flipping, rotate the card */
.cd-flipping {
  animation: cd-flip-down 0.5s ease-in-out;
}

@keyframes cd-flip-down {
  0% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(-90deg);
  }
  100% {
    transform: rotateX(-180deg);
  }
}

/* After animation completes, reset to show new front */
.cd-flipping .cd-flip-front {
  z-index: 1;
}

.cd-flipping .cd-flip-back {
  z-index: 2;
}

.cd-digit-label {
  font-size: 20rpx;
  color: var(--cd-label-color);
  font-weight: 600;
}

.cd-separator {
  font-size: 48rpx;
  color: var(--cd-separator-color);
  font-weight: 700;
  margin: 0 4rpx;
  align-self: flex-start;
  padding-top: 16rpx;
}

/* Card title */
.cd-card-title-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.cd-card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--cd-title-color);
}

.cd-card-target {
  font-size: 24rpx;
  color: var(--cd-target-color);
}

.cd-hint {
  font-size: 20rpx;
  color: var(--cd-hint-color);
}

/* Indicator */
.cd-indicator {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}

.cd-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: var(--cd-dot-bg);
  transition: all 0.3s ease;
}

.cd-dot-active {
  background: var(--cd-dot-active);
  width: 32rpx;
  border-radius: 6rpx;
}
</style>
