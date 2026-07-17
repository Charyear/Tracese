<template>
  <view class="birthday-flip-container" :class="isDark ? 'bfp-dark' : 'bfp-light'">
    <!-- Empty state when no birthday cards -->
    <view v-if="birthdayCards.length === 0" class="bfp-empty">
      <text class="bfp-empty-icon">🎂</text>
      <text class="bfp-empty-title">暂无生日记录</text>
      <text class="bfp-empty-desc">点击右下角 + 号添加生日卡片</text>
    </view>

    <!-- Cuboid panel with flip animation -->
    <view 
      v-else
      class="birthday-cuboid"
      :class="{ 'flipping': isFlipping }"
      @tap="flipNext"
    >
      <!-- Current face -->
      <view class="cuboid-face">
        <!-- Image side (left, fills the surface) -->
        <view class="cuboid-image-side">
          <image 
            v-if="!imageErrorStates[currentIndex]"
            :src="currentImage"
            mode="aspectFill"
            class="cuboid-image"
            @error="imageErrorStates[currentIndex] = true"
          />
          <view v-else class="cuboid-image-fallback">
            <text class="fallback-icon">🎂</text>
          </view>
        </view>
        <!-- Content side (right, only if card has info) -->
        <view class="cuboid-content-side" v-if="currentCard">
          <view class="cuboid-header">
            <text class="cuboid-title">{{ currentCard.title }}</text>
            <text class="cuboid-subtitle">{{ currentZodiac }} · {{ currentConstellation }}</text>
          </view>
          <view class="cuboid-countdown">
            <text class="countdown-days">{{ currentDays }}</text>
            <text class="countdown-label">天</text>
          </view>
          <view class="cuboid-upcoming" v-if="upcomingBirthdays.length > 0">
            <text class="upcoming-title">即将到来</text>
            <view class="upcoming-list">
              <view v-for="(item, i) in upcomingBirthdays" :key="i" class="upcoming-item">
                <text class="upcoming-name">{{ item.title }}</text>
                <text class="upcoming-days">{{ getDaysUntilBirthday(item) }}天</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- Page indicator (max 4 dots) -->
    <view class="page-indicator" v-if="birthdayCards.length > 1">
      <view
        v-for="(card, idx) in birthdayCards"
        :key="idx"
        class="indicator-dot"
        :class="{ 'active': idx === currentIndex }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRecordsStore } from "../store/records";
import { useSettingsStore } from "../store/settings";
import type { BirthdayCard } from "../types/card";
import { getBirthdayZodiac, getBirthdayConstellation } from "../utils/card-helpers";

const records = useRecordsStore();
const settings = useSettingsStore();

const isDark = computed(() => settings.theme === "dark");

// Images from static/image
const images = [
  "/static/image/cat.png",
  "/static/image/dog.png",
  "/static/image/goals.png",
  "/static/image/panda.png",
];

const currentIndex = ref(0);
const now = ref(Date.now());
const isFlipping = ref(false);
const imageErrorStates = ref<Record<number, boolean>>({});

// Get nearest 4 birthday cards sorted by nearest birthday first
const birthdayCards = computed(() => {
  const cards = records.cards.filter((c): c is BirthdayCard => c.type === "birthday");
  const sorted = cards.sort((a, b) => getDaysUntilBirthday(a) - getDaysUntilBirthday(b));
  return sorted.slice(0, 4); // Max 4 faces
});

// Current card being displayed
const currentCard = computed(() => birthdayCards.value[currentIndex.value] || null);

// Current image based on index
const currentImage = computed(() => images[currentIndex.value % images.length]);

// Current card's days until birthday
const currentDays = computed(() => {
  if (!currentCard.value) return 0;
  return getDaysUntilBirthday(currentCard.value);
});

// Current card's zodiac
const currentZodiac = computed(() => {
  if (!currentCard.value) return "";
  return getBirthdayZodiac(currentCard.value);
});

// Current card's constellation
const currentConstellation = computed(() => {
  if (!currentCard.value) return "";
  return getBirthdayConstellation(currentCard.value);
});

// Upcoming birthdays (next 3 after current)
const upcomingBirthdays = computed(() => {
  const all = birthdayCards.value;
  if (all.length <= 1) return [];
  const result: BirthdayCard[] = [];
  for (let i = 1; i <= 3 && i < all.length; i++) {
    result.push(all[(currentIndex.value + i) % all.length]);
  }
  return result;
});

// Calculate days until next birthday
function getDaysUntilBirthday(card: BirthdayCard): number {
  if (!card.birthDate) return 0;
  const birth = new Date(card.birthDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  
  const diff = nextBirthday.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Flip to next card
function flipNext() {
  if (isFlipping.value) return;
  if (birthdayCards.value.length <= 1) return;
  
  isFlipping.value = true;
  
  // Change card after half of flip animation
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % birthdayCards.value.length;
    imageErrorStates.value = {};
  }, 200);
  
  // Reset flipping state after animation completes
  setTimeout(() => {
    isFlipping.value = false;
  }, 400);
}

// Reset to first birthday when page is shown
function resetToFirst() {
  currentIndex.value = 0;
  imageErrorStates.value = {};
}

// Timer for real-time updates
let timer: number | null = null;

onMounted(() => {
  resetToFirst();
  // Update every minute for real-time countdown
  timer = setInterval(() => {
    now.value = Date.now();
  }, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Watch for card changes - sync data when cards are added/removed
watch(() => records.cards.length, (newLen, oldLen) => {
  if (currentIndex.value >= birthdayCards.value.length) {
    currentIndex.value = 0;
  }
  // When new cards are added, reset to first to show the new data
  if (newLen > oldLen && birthdayCards.value.length > 0) {
    currentIndex.value = 0;
    imageErrorStates.value = {};
  }
});

// Expose reset function for parent
defineExpose({ resetToFirst });
</script>

<style scoped>
.birthday-flip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.birthday-cuboid {
  width: 680rpx;
  height: 341rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  background: #FFF;
  cursor: pointer;
  transition: transform 0.15s ease;
  position: relative;
}

.birthday-cuboid:active {
  transform: scale(0.98);
}

.birthday-cuboid.flipping {
  animation: cuboidFlip 0.4s ease-in-out;
}

@keyframes cuboidFlip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}

.cuboid-face {
  width: 100%;
  height: 100%;
  display: flex;
}

.cuboid-image-side {
  width: 50%;
  height: 100%;
  flex-shrink: 0;
  background: #F8F8F8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cuboid-image {
  width: 100%;
  height: 100%;
}

.cuboid-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FDEBD0 0%, #FAD7A0 100%);
}

.fallback-icon {
  font-size: 80rpx;
}

.cuboid-content-side {
  flex: 1;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.cuboid-header {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.cuboid-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cuboid-subtitle {
  font-size: 18rpx;
  color: #E07A5F;
  font-weight: 600;
}

.cuboid-countdown {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  justify-content: center;
  padding: 8rpx 0;
}

.countdown-days {
  font-size: 48rpx;
  font-weight: 800;
  color: #5C7C8A;
  line-height: 1;
}

.countdown-label {
  font-size: 20rpx;
  color: #7F8B95;
  font-weight: 600;
}

.cuboid-upcoming {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.upcoming-title {
  font-size: 18rpx;
  color: #7F8B95;
  font-weight: 600;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.upcoming-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4rpx 8rpx;
  background: rgba(92, 124, 138, 0.06);
  border-radius: 8rpx;
}

.upcoming-name {
  font-size: 18rpx;
  color: #2D3436;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.upcoming-days {
  font-size: 18rpx;
  color: #5C7C8A;
  font-weight: 700;
}

.page-indicator {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}

.indicator-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(92, 124, 138, 0.2);
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #5C7C8A;
  width: 32rpx;
  border-radius: 6rpx;
}

/* Dark mode */
.bfp-dark .birthday-cuboid {
  background: #2A2A2A;
}

.bfp-dark .cuboid-title {
  color: #F5F5DC;
}

.bfp-dark .upcoming-name {
  color: #F5F5DC;
}

.bfp-dark .upcoming-item {
  background: rgba(255, 255, 255, 0.06);
}

.bfp-dark .cuboid-image-side {
  background: #3A3A3A;
}

.bfp-dark .cuboid-image-fallback {
  background: linear-gradient(135deg, #4A3A2A 0%, #5A4A3A 100%);
}

.bfp-dark .indicator-dot {
  background: rgba(255, 255, 255, 0.2);
}

.bfp-dark .indicator-dot.active {
  background: #A5C4D4;
}

/* Empty state */
.bfp-empty {
  width: 680rpx;
  height: 341rpx;
  border-radius: 24rpx;
  background: #FFF;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.bfp-empty-icon {
  font-size: 80rpx;
}

.bfp-empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D3436;
}

.bfp-empty-desc {
  font-size: 24rpx;
  color: #999;
}

.bfp-dark .bfp-empty {
  background: #2A2A2A;
}

.bfp-dark .bfp-empty-title {
  color: #F5F5DC;
}

.bfp-dark .bfp-empty-desc {
  color: #888;
}
</style>
