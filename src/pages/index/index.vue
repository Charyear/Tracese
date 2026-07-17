<template>
  <view class="home-page" :class="[isDark ? 'dark-mode' : 'light-mode', showOnboarding ? 'onboarding-active' : '']">
    <!-- Navbar -->
    <view class="home-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="brand" v-if="!showSearchInput">
          <text class="brand-text">Tracese</text>
          <text class="brand-sub">· {{ todayStr }}</text>
        </view>
        <view class="search-input-wrap" v-else>
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索记录的标题..."
            placeholder-class="placeholder-text"
            focus
            @blur="onSearchBlur"
            aria-label="搜索记录标题"
          />
        </view>
        <view class="navbar-right-actions">
          <view class="nav-action-btn" @tap="toggleSearch" aria-label="搜索" role="button">
            <text class="action-icon">🔍</text>
          </view>
          <view class="nav-action-btn" @tap="goToSettings" aria-label="设置" role="button">
            <text class="action-icon">⚙️</text>
          </view>
        </view>
      </view>

      <!-- Category Tabs -->
      <scroll-view
        class="cat-tabs"
        scroll-x
        :show-scrollbar="false"
      >
        <view class="cat-tabs-inner">
          <view
            v-for="tab in categories"
            :key="tab.key"
            class="cat-tab"
            :class="{ 'cat-tab-active': activeCategory === tab.key }"
            @tap="setCategory(tab.key)"
            :aria-label="tab.label"
            role="button"
          >
            <text class="cat-tab-icon">{{ tab.icon }}</text>
            <text class="cat-tab-label">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Statistics Chart Component -->
    <StatsChart :activeCategory="activeCategory" />
    
    <!-- Habit Heatmap Component -->
    <HabitHeatmap :activeCategory="activeCategory" />

    <!-- Birthday Flip Panel (always show when birthday category is active) -->
    <BirthdayFlipPanel
      v-if="activeCategory === 'birthday'"
      ref="birthdayFlipPanel"
    />

    <!-- Countdown Flip Panel (only when countdown category is active) -->
    <CountdownFlipPanel
      v-if="activeCategory === 'countdown' && countdownCards.length > 0"
      ref="countdownFlipPanel"
    />

    <!-- Plan Focus Panel (only when plan category is active) -->
    <PlanFocusPanel
      v-if="activeCategory === 'plan'"
    />

    <!-- Card List -->
    <scroll-view
      class="card-scroll"
      :scroll-y="!showOnboarding"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- Empty state when no cards -->
      <view v-if="filteredCards.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-title">暂无记录</text>
        <text class="empty-desc">点击右下方按钮，开始记录吧</text>
      </view>

      <!-- Two-column masonry grid with transition -->
      <view v-else class="card-grid" :class="{ 'card-grid-transition': isTransitioning }">
        <!-- Left Column -->
        <view class="card-col">
          <template v-for="card in leftColumn" :key="card.id">
            <AppCard
              :card="card"
              @tap="() => onCardTap(card)"
              @longpress="() => onCardLongPress(card)"
            >
              <!-- Habit punch count (below icon, like birthday zodiac) -->
              <template v-if="card.type === 'habit'" #top>
                <view class="habit-meta-top">
                  <text class="habit-top-streak">🔥 {{ getHabitStreak(card as HabitCard) }}天</text>
                </view>
              </template>
              <view v-if="card.type === 'habit'" class="card-meta habit-meta-bottom">
                <text class="habit-bottom-text">已打卡 {{ (card as HabitCard).totalCount }} 次</text>
                <view
                  class="habit-punch-btn"
                  :class="{ 'habit-punch-disabled': !canPunchNow(card) }"
                  @tap.stop="onPunch(card)"
                >
                  <text class="habit-punch-icon">{{ canPunchNow(card) ? "打卡" : "已满" }}</text>
                </view>
              </view>
              <view v-else-if="card.type === 'countdown'" class="card-meta countdown-meta">
                <text class="countdown-text">已过去</text>
                <text class="countdown-val">{{ daysPassed(card) }}</text>
                <text class="countdown-text">天，还剩</text>
                <text class="countdown-val">{{ Math.max(0, daysLeft(card)) }}</text>
                <text class="countdown-text">天</text>
              </view>
              <view v-else-if="card.type === 'subscription'" class="card-meta subscription-meta">
                <text class="subscription-val">¥{{ (card as SubscriptionCard).price }}</text>
                <text class="subscription-text">/{{ cycleLabel((card as SubscriptionCard).billingCycle) }}</text>
                <view v-if="(card as SubscriptionCard).totalCost" class="subscription-total">
                  <text class="subscription-total-text">累计¥{{ (card as SubscriptionCard).totalCost }}</text>
                </view>
              </view>
              <view v-else-if="card.type === 'asset'" class="card-meta asset-meta" :class="(card as AssetCard).flowType">
                <text class="asset-val">{{ (card as AssetCard).flowType === 'expense' ? '-' : '+' }}¥{{ (card as AssetCard).amount }}</text>
              </view>
              <!-- Diary excerpt -->
              <template v-else-if="card.type === 'diary'">
                <template #top>
                  <view class="diary-card-content">
                    <text class="diary-excerpt">{{ (card as DiaryCard).content }}</text>
                    <view v-if="(card as DiaryCard).images?.length" class="diary-images">
                      <image v-for="(img, idx) in (card as DiaryCard).images" :key="idx" :src="img.url" mode="aspectFill" class="diary-image" />
                    </view>
                    <view v-if="(card as DiaryCard).tags?.length" class="diary-tags">
                      <text v-for="tag in (card as DiaryCard).tags" :key="tag.text" class="diary-tag">{{ tag.text }}</text>
                    </view>
                    <view v-if="(card as DiaryCard).mood || (card as DiaryCard).weather" class="diary-meta-row">
                      <text v-if="(card as DiaryCard).mood" class="diary-mood">{{ (card as DiaryCard).mood }}</text>
                      <text v-if="(card as DiaryCard).weather" class="diary-weather">{{ (card as DiaryCard).weather }}</text>
                    </view>
                  </view>
                </template>
              </template>
              <!-- Birthday display -->
              <template v-else-if="card.type === 'birthday'">
                <template #top>
                  <view class="birthday-details">
                    <text class="birthday-info-text text-orange">{{ getBirthdayZodiac(card as BirthdayCard) }} · {{ getBirthdayConstellation(card as BirthdayCard) }}</text>
                  </view>
                </template>
                <view class="birthday-days">
                  <text class="birthday-age-primary">{{ getBirthdayAgeParts(card as BirthdayCard).years }}岁</text>
                  <text class="birthday-age-secondary"> · {{ getBirthdayAgeParts(card as BirthdayCard).totalMonths }}个月{{ getBirthdayAgeParts(card as BirthdayCard).days }}天</text>
                </view>
              </template>
              <!-- Plan checklist progress -->
              <view v-else-if="card.type === 'plan'" class="card-meta plan-meta">
                <view class="plan-progress-bar">
                  <view class="plan-progress-inner" :style="{ width: getPlanProgress(card as PlanCard) + '%' }" />
                </view>
                <view class="plan-info">
                  <text class="plan-val">{{ getPlanCompletedCount(card as PlanCard) }}</text>
                  <text class="plan-text">/{{ (card as PlanCard).steps.length }}</text>
                </view>
              </view>
            </AppCard>
          </template>
        </view>
        <!-- Right Column -->
        <view class="card-col">
          <template v-for="card in rightColumn" :key="card.id">
            <AppCard
              :card="card"
              @tap="() => onCardTap(card)"
              @longpress="() => onCardLongPress(card)"
            >
              <!-- Habit punch count (below icon, like birthday zodiac) -->
              <template v-if="card.type === 'habit'" #top>
                <view class="habit-meta-top">
                  <text class="habit-top-streak">🔥 {{ getHabitStreak(card as HabitCard) }}天</text>
                </view>
              </template>
              <view v-if="card.type === 'habit'" class="card-meta habit-meta-bottom">
                <text class="habit-bottom-text">已打卡 {{ (card as HabitCard).totalCount }} 次</text>
                <view
                  class="habit-punch-btn"
                  :class="{ 'habit-punch-disabled': !canPunchNow(card) }"
                  @tap.stop="onPunch(card)"
                >
                  <text class="habit-punch-icon">{{ canPunchNow(card) ? "打卡" : "已满" }}</text>
                </view>
              </view>
              <view v-else-if="card.type === 'countdown'" class="card-meta countdown-meta">
                <text class="countdown-text">已过去</text>
                <text class="countdown-val">{{ daysPassed(card) }}</text>
                <text class="countdown-text">天，还剩</text>
                <text class="countdown-val">{{ Math.max(0, daysLeft(card)) }}</text>
                <text class="countdown-text">天</text>
              </view>
              <view v-else-if="card.type === 'subscription'" class="card-meta subscription-meta">
                <text class="subscription-val">¥{{ (card as SubscriptionCard).price }}</text>
                <text class="subscription-text">/{{ cycleLabel((card as SubscriptionCard).billingCycle) }}</text>
                <view v-if="(card as SubscriptionCard).totalCost" class="subscription-total">
                  <text class="subscription-total-text">累计¥{{ (card as SubscriptionCard).totalCost }}</text>
                </view>
              </view>
              <view v-else-if="card.type === 'asset'" class="card-meta asset-meta" :class="(card as AssetCard).flowType">
                <text class="asset-val">{{ (card as AssetCard).flowType === 'expense' ? '-' : '+' }}¥{{ (card as AssetCard).amount }}</text>
              </view>
              <!-- Diary excerpt -->
              <template v-else-if="card.type === 'diary'">
                <template #top>
                  <view class="diary-card-content">
                    <text class="diary-excerpt">{{ (card as DiaryCard).content }}</text>
                    <view v-if="(card as DiaryCard).images?.length" class="diary-images">
                      <image v-for="(img, idx) in (card as DiaryCard).images" :key="idx" :src="img.url" mode="aspectFill" class="diary-image" />
                    </view>
                    <view v-if="(card as DiaryCard).tags?.length" class="diary-tags">
                      <text v-for="tag in (card as DiaryCard).tags" :key="tag.text" class="diary-tag">{{ tag.text }}</text>
                    </view>
                    <view v-if="(card as DiaryCard).mood || (card as DiaryCard).weather" class="diary-meta-row">
                      <text v-if="(card as DiaryCard).mood" class="diary-mood">{{ (card as DiaryCard).mood }}</text>
                      <text v-if="(card as DiaryCard).weather" class="diary-weather">{{ (card as DiaryCard).weather }}</text>
                    </view>
                  </view>
                </template>
              </template>
              <!-- Birthday display -->
              <template v-else-if="card.type === 'birthday'">
                <template #top>
                  <view class="birthday-details">
                    <text class="birthday-info-text text-orange">{{ getBirthdayZodiac(card as BirthdayCard) }} · {{ getBirthdayConstellation(card as BirthdayCard) }}</text>
                  </view>
                </template>
                <view class="birthday-days">
                  <text class="birthday-age-primary">{{ getBirthdayAgeParts(card as BirthdayCard).years }}岁</text>
                  <text class="birthday-age-secondary"> · {{ getBirthdayAgeParts(card as BirthdayCard).totalMonths }}个月{{ getBirthdayAgeParts(card as BirthdayCard).days }}天</text>
                </view>
              </template>
              <!-- Plan checklist progress -->
              <view v-else-if="card.type === 'plan'" class="card-meta plan-meta">
                <view class="plan-progress-bar">
                  <view class="plan-progress-inner" :style="{ width: getPlanProgress(card as PlanCard) + '%' }" />
                </view>
                <view class="plan-info">
                  <text class="plan-val">{{ getPlanCompletedCount(card as PlanCard) }}</text>
                  <text class="plan-text">/{{ (card as PlanCard).steps.length }}</text>
                </view>
              </view>
            </AppCard>
          </template>
        </view>
      </view>

      <!-- Bottom padding for FAB -->
      <view style="height: 160rpx;" />
    </scroll-view>

    <!-- Floating Action Button -->
    <view class="fab-wrap">
      <view class="fab" @tap="onFabTap" aria-label="新建记录" role="button">
        <text class="fab-icon">+</text>
      </view>
    </view>

    <!-- Onboarding Overlay -->
    <OnboardingOverlay
      :visible="showOnboarding"
      @complete="onOnboardingComplete"
      @skip="onOnboardingSkip"
      ref="onboardingRef"
    />

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRecordsStore } from "../../store/records";
import { useSettingsStore } from "../../store/settings";
import AppCard from "../../components/AppCard.vue";
import StatsChart from "../../components/StatsChart.vue";
import HabitHeatmap from "../../components/HabitHeatmap.vue";
import BirthdayFlipPanel from "../../components/BirthdayFlipPanel.vue";
import CountdownFlipPanel from "../../components/CountdownFlipPanel.vue";
import PlanFocusPanel from "../../components/PlanFocusPanel.vue";
import OnboardingOverlay from "../../components/OnboardingOverlay.vue";
import type { AnyCard, CountdownCard, SubscriptionCard, BirthdayCard, PlanCard, AssetCard, DiaryCard, HabitCard } from "../../types/card";
import { useStatusBarHeight } from "../../composables/useStatusBarHeight";
import {
  daysLeft as helperDaysLeft,
  daysPassed as helperDaysPassed,
  cycleLabel as helperCycleLabel,
  getBirthdayZodiac as helperGetBirthdayZodiac,
  getBirthdayConstellation as helperGetBirthdayConstellation,
  getBirthdayAgeParts as helperGetBirthdayAgeParts,
  getPlanCompletedCount as helperGetPlanCompletedCount,
  getPlanProgress as helperGetPlanProgress,
  getHabitStreak as helperGetHabitStreak,
  getHabitLongestStreak as helperGetHabitLongestStreak,
} from "../../utils/card-helpers";

const records = useRecordsStore();
const settings = useSettingsStore();

const statusBarHeight = useStatusBarHeight();
const activeCategory = ref("all");
const refreshing = ref(false);
const showTypeSelector = ref(false);
const isDark = computed(() => settings.theme === "dark");
const isTransitioning = ref(false);
const birthdayFlipPanel = ref<InstanceType<typeof BirthdayFlipPanel> | null>(null);
const countdownFlipPanel = ref<InstanceType<typeof CountdownFlipPanel> | null>(null);
const onboardingRef = ref<InstanceType<typeof OnboardingOverlay> | null>(null);
const showOnboarding = ref(false);

// Prevent any touch events from reaching background content when overlay is active
const onOverlayTouchMove = (e: TouchEvent) => {
  e.stopPropagation();
  e.preventDefault();
};

const onOnboardingComplete = () => {
  showOnboarding.value = false;
};

const onOnboardingSkip = () => {
  showOnboarding.value = false;
};

// Get all birthday cards sorted by nearest birthday
const birthdayCards = computed(() => {
  return records.cards
    .filter((c): c is BirthdayCard => c.type === "birthday")
    .sort((a, b) => {
      const daysA = getDaysUntilBirthdaySimple(a);
      const daysB = getDaysUntilBirthdaySimple(b);
      return daysA - daysB;
    });
});

// Get all countdown cards sorted by nearest target
const countdownCards = computed(() => {
  return records.cards
    .filter((c): c is CountdownCard => c.type === "countdown")
    .sort((a, b) => {
      const timeA = new Date(a.targetDate).getTime();
      const timeB = new Date(b.targetDate).getTime();
      const nowTime = Date.now();
      const diffA = timeA - nowTime;
      const diffB = timeB - nowTime;
      if (diffA >= 0 && diffB < 0) return -1;
      if (diffA < 0 && diffB >= 0) return 1;
      if (diffA >= 0 && diffB >= 0) return diffA - diffB;
      return diffB - diffA;
    });
});

function getDaysUntilBirthdaySimple(card: BirthdayCard): number {
  if (!card.birthDate) return 999;
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

// Reset flip panel when birthday category is selected
watch(activeCategory, (newVal) => {
  if (newVal === "birthday" && birthdayFlipPanel.value) {
    birthdayFlipPanel.value.resetToFirst();
  }
  if (newVal === "countdown" && countdownFlipPanel.value) {
    countdownFlipPanel.value.resetToNearest();
  }
});

// Search functionality
const showSearchInput = ref(false);
const searchKeyword = ref("");

const toggleSearch = () => {
  settings.triggerHaptic();
  showSearchInput.value = !showSearchInput.value;
  if (!showSearchInput.value) {
    searchKeyword.value = "";
  }
};

const onSearchBlur = () => {
  if (searchKeyword.value.trim() === "") {
    showSearchInput.value = false;
  }
};

const goToSettings = () => {
  settings.triggerHaptic();
  uni.navigateTo({ url: "/pages/settings/settings" });
};

const todayStr = computed(() => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
});

const categories = [
  { key: "all", label: "全部", icon: "✦" },
  { key: "habit", label: "习惯", icon: "🔥" },
  { key: "countdown", label: "倒计日", icon: "📅" },
  { key: "birthday", label: "生日", icon: "🎂" },
  { key: "diary", label: "日记", icon: "📓" },
  { key: "asset", label: "资产", icon: "💰" },
  { key: "subscription", label: "订阅", icon: "🔔" },
  { key: "plan", label: "计划", icon: "📋" },
];

const cardTypes = [
  { key: "countdown", label: "正/倒计时", icon: "📅", color: "blue" },
  { key: "birthday", label: "生日", icon: "🎂", color: "pink" },
  { key: "habit", label: "打卡记录", icon: "🔥", color: "orange" },
  { key: "diary", label: "日记", icon: "📓", color: "green" },
  { key: "asset", label: "资产记录", icon: "💰", color: "cream" },
  { key: "subscription", label: "订阅记录", icon: "🔔", color: "purple" },
  { key: "plan", label: "计划记录", icon: "📋", color: "blue" },
];

const filteredCards = computed(() => {
  let cards = records.cards;
  if (activeCategory.value !== "all") {
    cards = cards.filter(c => c.type === activeCategory.value);
  }
  if (searchKeyword.value.trim() !== "") {
    const keyword = searchKeyword.value.toLowerCase().trim();
    cards = cards.filter(c => c.title.toLowerCase().includes(keyword));
  }
  // Pinned cards float to the top, using sortIndex as tiebreaker for stable ordering
  return [...cards].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Both pinned or both unpinned: preserve original sortIndex order
    return a.sortIndex - b.sortIndex;
  });
});

const leftColumn = computed(() => filteredCards.value.filter((_, i) => i % 2 === 0));
const rightColumn = computed(() => filteredCards.value.filter((_, i) => i % 2 === 1));

const visibleCardTypes = computed(() => {
  if (activeCategory.value === "all") return cardTypes;
  return cardTypes.filter(t => t.key === activeCategory.value);
});

let transitionTimer: number | null = null;

const setCategory = (key: string) => {
  if (key === activeCategory.value) return;
  
  // Trigger transition animation
  isTransitioning.value = true;
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
  
  activeCategory.value = key;
  settings.triggerHaptic();
};

const onRefresh = () => {
  refreshing.value = true;
  records.loadCards();
  setTimeout(() => { refreshing.value = false; }, 600);
};

const onCardTap = (card: AnyCard) => {
  uni.navigateTo({ url: `/pages/edit/edit?id=${card.id}` });
};

const canPunchNow = (card: AnyCard) => {
  if (card.type !== 'habit') return false;
  return records.canPunch(card as HabitCard).allowed;
};

const onPunch = (card: AnyCard) => {
  if (card.type !== 'habit') return;
  const result = records.punchIn(card.id);
  if (result.success) {
    uni.showToast({ title: "打卡成功", icon: "success" });
  } else {
    uni.showToast({ title: result.message || "暂时无法打卡", icon: "none" });
  }
};

const onCardLongPress = (card: AnyCard) => {
  uni.showActionSheet({
    itemList: ["生成分享海报", "删除"],
    success(res) {
      if (res.tapIndex === 0) {
        uni.navigateTo({
          url: `/pages/share-poster/share-poster?id=${card.id}`
        });
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: "删除记录",
          content: `确定删除「${card.title}」吗？`,
          confirmColor: "#E57373",
          success(modal) {
            if (modal.confirm) {
              records.deleteCard(card.id);
            }
          }
        });
      }
    }
  });
};

const selectType = (type: string) => {
  showTypeSelector.value = false;
  settings.triggerHaptic();
  uni.navigateTo({ url: `/pages/edit/edit?type=${type}` });
};

const onFabTap = () => {
  settings.triggerHaptic();
  if (activeCategory.value === "all") {
    uni.navigateTo({ url: "/pages/type-select/type-select" });
  } else {
    uni.navigateTo({ url: `/pages/edit/edit?type=${activeCategory.value}` });
  }
};

// Use shared helper functions
const daysLeft = (card: CountdownCard) => helperDaysLeft(card);
const daysPassed = (card: CountdownCard) => helperDaysPassed(card);
const cycleLabel = (cycle: string) => helperCycleLabel(cycle);
const getBirthdayZodiac = (card: BirthdayCard) => helperGetBirthdayZodiac(card);
const getBirthdayConstellation = (card: BirthdayCard) => helperGetBirthdayConstellation(card);
const getBirthdayAgeParts = (card: BirthdayCard) => helperGetBirthdayAgeParts(card);
const getPlanCompletedCount = (card: PlanCard) => helperGetPlanCompletedCount(card);
const getPlanProgress = (card: PlanCard) => helperGetPlanProgress(card);
const getHabitStreak = (card: HabitCard) => helperGetHabitStreak(card);

onMounted(() => {
  records.loadCards();
  // Check for due reminders on app launch
  records.checkReminders();
  // Show onboarding for first-time users
  if (!settings.onboardingCompleted) {
    showOnboarding.value = true;
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #FAFAFB;
  display: flex;
  flex-direction: column;
}

.home-page.onboarding-active {
  overflow: hidden;
  height: 100vh;
  position: fixed;
  width: 100%;
}
/* Dark Mode - 全黑米白 */
.dark-mode { background: #000000; }

/* Navbar */
.home-navbar {
  background: #FAFAFB;
  padding-bottom: 0;
  position: sticky;
  top: 0;
  z-index: 50;
}
.dark-mode .home-navbar { background: #000000; border-bottom-color: #222222; }

.navbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 48rpx 16rpx;
  gap: 24rpx;
}
.brand { display: flex; align-items: baseline; gap: 8rpx; }
.brand-text {
  font-size: 44rpx;
  font-weight: 800;
  color: #2D3436;
  letter-spacing: -1rpx;
}
.brand-sub { font-size: 24rpx; color: #999; }
.dark-mode .brand-text { color: #F5F5DC; }
.dark-mode .brand-sub { color: #888888; }

/* Search Input Wrap */
.search-input-wrap {
  flex: 1;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 30rpx;
  padding: 10rpx 24rpx;
  display: flex;
  align-items: center;
}
.dark-mode .search-input-wrap {
  background: rgba(255, 255, 255, 0.08);
}
.search-input {
  width: 100%;
  font-size: 26rpx;
  color: #2D3436;
  background: transparent;
}
.dark-mode .search-input {
  color: #F5F5DC;
}

/* Navbar Right Actions */
.navbar-right-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-right: 180rpx;
}
.nav-action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-mode .nav-action-btn {
  background: rgba(255, 255, 255, 0.08);
}
.action-icon { font-size: 32rpx; }

/* Category Tabs */
.cat-tabs { width: 100%; }
.cat-tabs-inner {
  display: flex;
  padding: 12rpx 24rpx 16rpx;
  gap: 12rpx;
}
.cat-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.dark-mode .cat-tab {
  background: rgba(255, 255, 255, 0.08);
}
.cat-tab-active {
  background: #5C7C8A;
  transform: scale(1.05);
}
.dark-mode .cat-tab-active {
  background: #5C7C8A;
}
.cat-tab-icon { font-size: 28rpx; }
.cat-tab-label {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}
.dark-mode .cat-tab-label { color: #AAA; }
.cat-tab-active .cat-tab-label { color: #FFFFFF; }

/* Card Scroll */
.card-scroll {
  flex: 1;
  height: calc(100vh - 200rpx);
}
.card-grid {
  display: flex;
  gap: 20rpx;
  padding: 0 24rpx;
}
.card-grid-transition {
  animation: fadeSlideIn 0.3s ease;
}
@keyframes fadeSlideIn {
  from {
    opacity: 0.6;
    transform: translateY(8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.card-col { flex: 1; display: flex; flex-direction: column; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #999;
  margin-bottom: 12rpx;
}
.dark-mode .empty-title { color: #888; }
.empty-desc {
  font-size: 26rpx;
  color: #BBB;
}
.dark-mode .empty-desc { color: #666; }

/* Card meta indicators */
.card-meta { display: flex; align-items: baseline; }

/* Habit card */
/* Habit card - top display (below icon) */
.habit-meta-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}
.habit-top-streak {
  font-size: 18rpx;
  color: #E07A5F;
  font-weight: 600;
  background: rgba(224, 122, 95, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  white-space: nowrap;
}
/* Habit card - bottom display (punch button) */
.habit-meta-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.habit-bottom-text {
  font-size: 18rpx;
  color: #6B9E7A;
  font-weight: 600;
  background: rgba(107, 158, 122, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  white-space: nowrap;
}
.habit-punch-btn {
  padding: 8rpx 18rpx;
  border-radius: 24rpx;
  background: #6B9E7A;
  flex-shrink: 0;
}
.habit-punch-btn:active {
  opacity: 0.8;
}
.habit-punch-icon {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
}
.habit-punch-disabled {
  background: rgba(0, 0, 0, 0.08);
}
.habit-punch-disabled .habit-punch-icon {
  color: #9AA5AC;
}

/* Countdown card */
.countdown-meta {
  display: flex;
  align-items: baseline;
  gap: 3rpx;
  flex-wrap: wrap;
  max-width: 100%;
}
.countdown-text {
  font-size: 18rpx;
  color: #7F8B95;
  font-weight: 600;
}
.countdown-val {
  font-size: 40rpx;
  font-weight: 800;
  color: #5C7C8A;
  line-height: 1;
}

/* Subscription card */
.subscription-meta {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.subscription-val {
  font-size: 40rpx;
  font-weight: 800;
  color: #E07A5F;
  line-height: 1;
}
.subscription-text {
  font-size: 18rpx;
  color: #7F8B95;
  font-weight: 600;
}
.subscription-total {
  display: flex;
  align-items: center;
  margin-left: 8rpx;
}
.subscription-total-text {
  font-size: 18rpx;
  color: #E07A5F;
  font-weight: 600;
  background: rgba(224, 122, 95, 0.08);
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  white-space: nowrap;
}

/* Asset card */
.asset-meta {
  display: flex;
  align-items: baseline;
}
.asset-val {
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1;
}
.expense .asset-val { color: #D07070; }
.income .asset-val { color: #6B9E7A; }
.info .asset-val { color: #5C7C8A; }

/* Diary card */
.diary-excerpt {
  font-size: 24rpx;
  color: #52606D;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.diary-card-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.diary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
}
.diary-tag {
  font-size: 18rpx;
  color: #5C7C8A;
  background: rgba(92, 124, 138, 0.1);
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  font-weight: 500;
}
.diary-meta-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
}
.diary-mood {
  font-size: 22rpx;
}
.diary-weather {
  font-size: 20rpx;
  color: #9AA5AC;
}
.diary-images {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin: 8rpx 0;
}
.diary-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

/* Habit streak */
.habit-streak {
  display: flex;
  align-items: center;
  margin-left: 8rpx;
}
.streak-text {
  font-size: 20rpx;
  color: #E07A5F;
  font-weight: 700;
  background: rgba(224, 122, 95, 0.1);
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  white-space: nowrap;
}

/* Birthday and plan styles */
.birthday-details {
  display: flex;
}
.birthday-info-text {
  font-size: 18rpx;
  color: #E07A5F;
  font-weight: 600;
  background: rgba(224, 122, 95, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  white-space: nowrap;
}
.birthday-days {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4rpx;
}
.birthday-age-primary {
  font-size: 40rpx;
  font-weight: 800;
  color: #5C7C8A;
  line-height: 1;
}
.birthday-age-secondary {
  font-size: 18rpx;
  color: #7F8B95;
  font-weight: 600;
  white-space: nowrap;
}

/* Plan card */
.plan-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  width: 100%;
}
.plan-progress-bar {
  width: 100%;
  height: 6rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3rpx;
  overflow: hidden;
}
.plan-progress-inner {
  height: 100%;
  background: #5C7C8A;
  border-radius: 3rpx;
  transition: width 0.3s ease;
}
.plan-info {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}
.plan-val {
  font-size: 40rpx;
  font-weight: 800;
  color: #5C7C8A;
  line-height: 1;
}
.plan-text {
  font-size: 18rpx;
  color: #7F8B95;
  font-weight: 600;
}

.flex-col { display: flex; flex-direction: column; }
.align-start { align-items: flex-start; }
.w-full { width: 100%; }
.mt-1 { margin-top: 8rpx; }

/* FAB */
.fab-wrap {
  position: fixed;
  bottom: 48rpx;
  right: 40rpx;
  z-index: 200;
}
.fab {
  width: 108rpx; height: 108rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #7BAFC0, #5C7C8A);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(92,124,138,0.45);
  transition: transform 0.15s;
}
.fab:active { transform: scale(0.92); }
.fab-icon { font-size: 56rpx; color: #fff; font-weight: 300; line-height: 1; margin-top: -4rpx; }

/* Bottom Sheet */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}
.bottom-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 40rpx 40rpx 0 0;
  padding: 20rpx 32rpx 60rpx;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.sheet-handle {
  width: 80rpx; height: 8rpx;
  background: #E0E0E0;
  border-radius: 10rpx;
  margin: 0 auto 24rpx;
}
.sheet-title {
  font-size: 30rpx; font-weight: 700; color: #333;
  display: block; text-align: center; margin-bottom: 32rpx;
}
.type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}
.type-item {
  width: 180rpx;
  border-radius: 28rpx;
  padding: 32rpx 20rpx;
  display: flex; flex-direction: column;
  align-items: center; gap: 12rpx;
  transition: transform 0.15s;
}
.type-item:active { transform: scale(0.93); }
.type-blue   { background: #EFF5F8; }
.type-green  { background: #EFF6F2; }
.type-orange { background: #FDF5EE; }
.type-purple { background: #F5F1F8; }
.type-cream  { background: #FAF6EF; }
.type-icon { font-size: 52rpx; }
.type-label { font-size: 26rpx; font-weight: 600; color: #444; }

/* Asset Statistics Panel - Morandi Style */
.stats-panel {
  background: linear-gradient(145deg, #F5F0EB 0%, #EDE6E0 100%);
  border-radius: 28rpx;
  margin: 24rpx 24rpx 0;
  padding: 36rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(180, 160, 140, 0.12), inset 0 1rpx 0 rgba(255,255,255,0.6);
  position: sticky;
  top: 24rpx;
  z-index: 10;
  border: 1rpx solid rgba(200, 185, 170, 0.25);
}
.dark-mode .stats-panel {
  background: linear-gradient(145deg, #1A1815 0%, #15130F 100%);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.5), inset 0 1rpx 0 rgba(255,255,255,0.03);
  border-color: rgba(80, 70, 60, 0.4);
}
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}
.stats-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #6B5E54;
  letter-spacing: 1rpx;
}
.dark-mode .stats-title {
  color: #C4B8AA;
}
.time-range-picker {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  border: 1rpx solid rgba(200, 185, 170, 0.3);
  backdrop-filter: blur(8rpx);
}
.dark-mode .time-range-picker {
  background: rgba(60, 55, 50, 0.6);
  border-color: rgba(100, 90, 80, 0.4);
}
.picker-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #8B7D72;
  font-weight: 500;
}
.dark-mode .picker-display {
  color: #A89B8E;
}
.picker-arrow {
  font-size: 18rpx;
  color: #B8A99A;
}

/* Summary Row - Morandi */
.stats-summary {
  display: flex;
  gap: 20rpx;
  margin-bottom: 28rpx;
}
.summary-item {
  flex: 1;
  border-radius: 24rpx;
  padding: 28rpx 20rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.summary-item.income {
  background: linear-gradient(135deg, #F2E6E1 0%, #E8D9D2 100%);
  border: 1rpx solid rgba(210, 180, 170, 0.35);
  box-shadow: 0 4rpx 16rpx rgba(200, 170, 160, 0.15);
}
.summary-item.expense {
  background: linear-gradient(135deg, #E4E8DF 0%, #D5DDD2 100%);
  border: 1rpx solid rgba(180, 195, 175, 0.35);
  box-shadow: 0 4rpx 16rpx rgba(170, 185, 165, 0.15);
}
.dark-mode .summary-item.income {
  background: linear-gradient(135deg, #2A221E 0%, #241D19 100%);
  border-color: rgba(150, 110, 100, 0.3);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
}
.dark-mode .summary-item.expense {
  background: linear-gradient(135deg, #1E241E 0%, #191F19 100%);
  border-color: rgba(100, 120, 100, 0.3);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
}
.summary-label {
  font-size: 20rpx;
  color: #9B8D82;
  font-weight: 600;
  margin-bottom: 10rpx;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}
.dark-mode .summary-label {
  color: #8A7D72;
}
.summary-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #5C4F45;
  letter-spacing: -0.5rpx;
}
.summary-item.income .summary-value {
  color: #B8736E;
}
.summary-item.expense .summary-value {
  color: #7A9B76;
}
.dark-mode .summary-value {
  color: #D4C8BC;
}
.dark-mode .summary-item.income .summary-value {
  color: #C4948E;
}
.dark-mode .summary-item.expense .summary-value {
  color: #9CAF96;
}

/* Subscription Stats Badge - Morandi */
.sub-stats-badge {
  font-size: 20rpx;
  font-weight: 600;
  color: #8B7D72;
  background: rgba(255, 255, 255, 0.8);
  padding: 8rpx 18rpx;
  border-radius: 24rpx;
  border: 1rpx solid rgba(200, 185, 170, 0.35);
  backdrop-filter: blur(8rpx);
}
.dark-mode .sub-stats-badge {
  color: #A89B8E;
  background: rgba(60, 55, 50, 0.7);
  border-color: rgba(100, 90, 80, 0.4);
}

/* Chart Area - Morandi */
.chart-container {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid rgba(200, 185, 170, 0.2);
  backdrop-filter: blur(12rpx);
}
.dark-mode .chart-container {
  background: rgba(40, 37, 34, 0.6);
  border-color: rgba(80, 70, 60, 0.3);
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}
.chart-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #7B6E64;
  letter-spacing: 1rpx;
}
.dark-mode .chart-title {
  color: #A89B8E;
}
.chart-legend {
  display: flex;
  gap: 20rpx;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 18rpx;
  color: #9B8D82;
  font-weight: 500;
}
.dark-mode .legend-item {
  color: #8A7D72;
}
.legend-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 6rpx;
}
.legend-dot.income {
  background: linear-gradient(135deg, #D4A09A 0%, #C48E88 100%);
  box-shadow: 0 2rpx 8rpx rgba(200, 150, 145, 0.3);
}
.legend-dot.expense {
  background: linear-gradient(135deg, #A8B8A4 0%, #96A892 100%);
  box-shadow: 0 2rpx 8rpx rgba(160, 175, 155, 0.3);
}

/* Chart Bars - Morandi */
.chart-area {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200rpx;
  gap: 10rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
}
.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 40rpx;
}
.bar-container {
  display: flex;
  align-items: flex-end;
  gap: 5rpx;
  height: 160rpx;
  width: 100%;
  justify-content: center;
}
.bar {
  width: 14rpx;
  border-radius: 8rpx 8rpx 0 0;
  transition: height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 6rpx;
}
.income-bar {
  background: linear-gradient(180deg, #D4A09A 0%, #C48E88 60%, #B8807A 100%);
  box-shadow: 0 4rpx 12rpx rgba(200, 150, 145, 0.25);
}
.expense-bar {
  background: linear-gradient(180deg, #A8B8A4 0%, #96A892 60%, #849880 100%);
  box-shadow: 0 4rpx 12rpx rgba(160, 175, 155, 0.25);
}
.bar-label {
  font-size: 14rpx;
  color: #B8A99A;
  margin-top: 10rpx;
  white-space: nowrap;
  font-weight: 500;
}
.dark-mode .bar-label {
  color: #6A5D54;
}
</style>
