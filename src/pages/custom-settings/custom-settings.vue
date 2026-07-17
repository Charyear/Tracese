<template>
  <view class="edit-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Navbar -->
    <view class="edit-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="nav-back" @tap="goBack" aria-label="返回" role="button">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">自定义设置</text>
      </view>
    </view>

    <scroll-view class="edit-scroll" scroll-y>
      <!-- Pin toggle -->
      <view class="section">
        <view class="toggle-row">
          <view class="toggle-info">
            <text class="field-label" style="margin-bottom: 6rpx;">置顶显示</text>
            <text class="toggle-desc">置顶后固定显示在列表最前面，最多可置顶{{ maxPinnedCards }}个卡片</text>
          </view>
          <switch :checked="form.isPinned" color="#5C7C8A" @change="onTogglePin" />
        </view>
      </view>

      <!-- Reminder Settings -->
      <view class="section">
        <view class="reminder-header">
          <text class="field-label">提醒设置</text>
          <view class="reminder-toggle" :class="{ 'toggle-active': form.reminder?.enabled }" @tap="toggleReminder">
            <view class="toggle-thumb" :class="{ 'thumb-active': form.reminder?.enabled }" />
          </view>
        </view>
        
        <view v-if="form.reminder?.enabled" class="reminder-content">
          <!-- Reminder Time -->
          <view class="reminder-field">
            <text class="reminder-label">提醒时间</text>
            <picker mode="time" :value="form.reminder.reminderTime" @change="(e: any) => form.reminder.reminderTime = e.detail.value">
              <view class="reminder-picker">
                <text class="picker-value">{{ form.reminder.reminderTime || "09:00" }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- Habit: Remind time for punch -->
          <view v-if="form.type === 'habit'" class="reminder-field">
            <text class="reminder-label">打卡提醒时间</text>
            <picker mode="time" :value="form.reminder.habitRemindTime" @change="(e: any) => form.reminder.habitRemindTime = e.detail.value">
              <view class="reminder-picker">
                <text class="picker-value">{{ form.reminder.habitRemindTime || "21:00" }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- Diary: Remind time for writing -->
          <view v-if="form.type === 'diary'" class="reminder-field">
            <text class="reminder-label">写日记提醒时间</text>
            <picker mode="time" :value="form.reminder.diaryRemindTime" @change="(e: any) => form.reminder.diaryRemindTime = e.detail.value">
              <view class="reminder-picker">
                <text class="picker-value">{{ form.reminder.diaryRemindTime || "21:00" }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- Countdown: Days before target -->
          <view v-if="form.type === 'countdown'" class="reminder-field">
            <text class="reminder-label">提前提醒天数</text>
            <view class="reminder-options">
              <view 
                v-for="day in [1, 3, 7]" 
                :key="day"
                class="reminder-option"
                :class="{ 'option-active': form.reminder.countdownDaysBefore?.includes(day) }"
                @tap="toggleCountdownDay(day)"
              >
                <text>{{ day }}天</text>
              </view>
            </view>
          </view>

          <!-- Birthday: Days before birthday -->
          <view v-if="form.type === 'birthday'" class="reminder-field">
            <text class="reminder-label">提前提醒天数</text>
            <view class="reminder-options">
              <view 
                v-for="day in [1, 3, 7]" 
                :key="day"
                class="reminder-option"
                :class="{ 'option-active': form.reminder.birthdayDaysBefore?.includes(day) }"
                @tap="toggleBirthdayDay(day)"
              >
                <text>{{ day }}天</text>
              </view>
            </view>
          </view>

          <!-- Subscription: Days before billing -->
          <view v-if="form.type === 'subscription'" class="reminder-field">
            <text class="reminder-label">扣费前提醒天数</text>
            <view class="reminder-options">
              <view 
                v-for="day in [1, 3, 7]" 
                :key="day"
                class="reminder-option"
                :class="{ 'option-active': form.reminder.subscriptionDaysBefore?.includes(day) }"
                @tap="toggleSubscriptionDay(day)"
              >
                <text>{{ day }}天</text>
              </view>
            </view>
          </view>

          <!-- Plan: Days before deadline -->
          <view v-if="form.type === 'plan'" class="reminder-field">
            <text class="reminder-label">截止前提醒天数</text>
            <view class="reminder-options">
              <view 
                v-for="day in [1, 3, 7]" 
                :key="day"
                class="reminder-option"
                :class="{ 'option-active': form.reminder.planDaysBefore?.includes(day) }"
                @tap="togglePlanDay(day)"
              >
                <text>{{ day }}天</text>
              </view>
            </view>
          </view>

          <!-- Custom Message -->
          <view class="reminder-field">
            <text class="reminder-label">自定义消息（可选）</text>
            <input
              class="reminder-input"
              v-model="form.reminder.customMessage"
              placeholder="留空则使用默认消息"
              placeholder-class="placeholder-text"
              maxlength="100"
              aria-label="自定义提醒消息"
            />
          </view>
        </view>
      </view>

      <!-- Icon & Color -->
      <view class="section">
        <text class="field-label">图标与颜色</text>
        <view class="icon-color-row">
          <view class="icon-selector" :class="`bg-${form.colorClass}`" @tap="showIconPicker = true" aria-label="选择图标" role="button">
            <text class="icon-display">{{ form.icon }}</text>
          </view>
          <scroll-view scroll-x :show-scrollbar="false">
            <view class="color-row">
              <view
                v-for="c in colorOptions"
                :key="c.key"
                class="color-dot"
                :class="[`dot-${c.key}`, form.colorClass === c.key ? 'dot-selected' : '']"
                @tap="form.colorClass = c.key"
              />
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- Card Style Selector -->
      <view class="section">
        <text class="field-label">卡片样式</text>
        <view class="style-preset-grid">
          <view
            v-for="style in displayStyleOptions"
            :key="style.key"
            class="style-preset-item"
            :class="{ 'style-preset-active': form.displayStyle === style.key }"
            @tap="form.displayStyle = style.key"
          >
            <view class="style-preview" :class="`style-preview-${style.key}`">
              <view class="style-preview-badge" />
              <view class="style-preview-line style-preview-line-lg" />
              <view class="style-preview-line" />
            </view>
            <text class="style-preset-label">{{ style.label }}</text>
          </view>
          <!-- More Styles Entry -->
          <view class="style-preset-item more-styles-entry" @tap="goToStyleLibrary">
            <view class="style-preview style-preview-more">
              <view class="more-dots">
                <view class="more-dot" />
                <view class="more-dot" />
                <view class="more-dot" />
              </view>
              <view class="style-preview-line style-preview-line-lg" />
              <view class="style-preview-line" />
            </view>
            <text class="style-preset-label">更多</text>
          </view>
        </view>

        <!-- Custom Style Panel -->
        <view v-if="form.displayStyle === 'custom'" class="custom-style-panel">
          <view v-if="form.customStyle.illustrationUrl" class="illustration-preview-row">
            <image class="illustration-preview-img" :src="form.customStyle.illustrationUrl" mode="aspectFill" />
            <view class="illustration-info">
              <text class="illustration-name">{{ form.customStyle.illustrationName }}</text>
              <text class="illustration-theme">{{ getThemeName(form.customStyle.illustrationTheme) }}</text>
            </view>
          </view>

          <text class="field-label">背景色</text>
          <scroll-view scroll-x :show-scrollbar="false">
            <view class="custom-color-row">
              <view
                v-for="color in customColorOptions"
                :key="`bg-${color}`"
                class="custom-color-dot"
                :style="{ backgroundColor: color }"
                :class="{ 'custom-color-active': form.customStyle.backgroundColor === color }"
                @tap="form.customStyle.backgroundColor = color"
              />
            </view>
          </scroll-view>

          <text class="field-label" style="margin-top: 24rpx;">文字色</text>
          <scroll-view scroll-x :show-scrollbar="false">
            <view class="custom-color-row">
              <view
                v-for="color in textColorOptions"
                :key="`text-${color}`"
                class="custom-color-dot"
                :style="{ backgroundColor: color }"
                :class="{ 'custom-color-active': form.customStyle.textColor === color }"
                @tap="form.customStyle.textColor = color"
              />
            </view>
          </scroll-view>

          <text class="field-label" style="margin-top: 24rpx;">标签底色</text>
          <scroll-view scroll-x :show-scrollbar="false">
            <view class="custom-color-row">
              <view
                v-for="color in badgeColorOptions"
                :key="`badge-${color}`"
                class="custom-color-dot"
                :style="{ backgroundColor: color }"
                :class="{ 'custom-color-active': form.customStyle.badgeColor === color }"
                @tap="form.customStyle.badgeColor = color"
              />
            </view>
          </scroll-view>

          <text class="field-label" style="margin-top: 24rpx;">边框颜色</text>
          <scroll-view scroll-x :show-scrollbar="false">
            <view class="custom-color-row">
              <view
                v-for="color in borderColorOptions"
                :key="`border-${color}`"
                class="custom-color-dot"
                :style="{ backgroundColor: color }"
                :class="{ 'custom-color-active': form.customStyle.borderColor === color }"
                @tap="form.customStyle.borderColor = color"
              />
            </view>
          </scroll-view>

          <text class="field-label" style="margin-top: 24rpx;">圆角</text>
          <view class="seg-control">
            <view
              v-for="radius in borderRadiusOptions"
              :key="radius"
              class="seg-item"
              :class="{ 'seg-active': form.customStyle.borderRadius === radius }"
              @tap="form.customStyle.borderRadius = radius"
            >
              <text>{{ radius }}</text>
            </view>
          </view>

          <text class="field-label" style="margin-top: 24rpx;">阴影强度</text>
          <view class="seg-control">
            <view
              v-for="shadow in shadowOptions"
              :key="shadow.key"
              class="seg-item"
              :class="{ 'seg-active': form.customStyle.shadowOpacity === shadow.value }"
              @tap="form.customStyle.shadowOpacity = shadow.value"
            >
              <text>{{ shadow.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 180rpx;" />
    </scroll-view>

    <!-- Bottom Save Bar -->
    <view class="edit-footer">
      <view class="save-button" @tap="saveSettings">
        <text class="save-button-text">保存设置</text>
      </view>
    </view>

    <!-- Icon Picker Bottom Sheet -->
    <view v-if="showIconPicker" class="icon-picker-overlay" @tap="showIconPicker = false">
      <view class="icon-picker-sheet" @tap.stop>
        <view class="sheet-header">
          <text class="sheet-title">选择图标</text>
          <view class="sheet-close" @tap="showIconPicker = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="icon-grid">
          <view
            v-for="icon in iconOptions"
            :key="icon"
            class="icon-cell"
            :class="{ 'icon-cell-active': form.icon === icon }"
            @tap="selectIcon(icon)"
          >
            <text class="icon-cell-text">{{ icon }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useRecordsStore } from "../../store/records";
import { MAX_PINNED_CARDS } from "../../constants/storage";
import { useSettingsStore } from "../../store/settings";
import type { CardPresetStyle } from "../../types/card";
import { useStatusBarHeight } from "../../composables/useStatusBarHeight";
import {
  getDefaultCustomStyle,
  displayStyleOptions,
  customColorOptions,
  textColorOptions,
  badgeColorOptions,
  borderColorOptions,
  borderRadiusOptions,
  shadowOptions,
  getThemeName
} from "../../utils/helpers";
import { getDefaultReminderConfig } from "../../utils/reminder";

const records = useRecordsStore();
const settings = useSettingsStore();

const statusBarHeight = useStatusBarHeight();

const showIconPicker = ref(false);
const isDark = computed(() => settings.theme === "dark");

const query = ref<Record<string, string>>({});

const iconOptions = [
  "🔥","📅","📓","💰","🔔","⭐","❤️","🎯","🏃","📚",
  "🎵","✈️","🌿","🌸","☀️","🌙","💎","🎨","🏋️","🍎",
  "🎉","🌊","🌈","⚡","🦋","🍀","🎸","🔑","🧘","💡"
];

const selectIcon = (icon: string) => {
  form.icon = icon;
  showIconPicker.value = false;
  settings.triggerHaptic();
};

// Reminder functions
const toggleReminder = () => {
  if (!form.reminder) {
    form.reminder = getDefaultReminderConfig(form.type || 'habit');
  }
  form.reminder.enabled = !form.reminder.enabled;
  if (form.reminder.enabled) {
    const defaults = getDefaultReminderConfig(form.type || 'habit');
    form.reminder.reminderTime = defaults.reminderTime;
    form.reminder.reminderType = defaults.reminderType;
    if (defaults.habitRemindTime) form.reminder.habitRemindTime = defaults.habitRemindTime;
    if (defaults.diaryRemindTime) form.reminder.diaryRemindTime = defaults.diaryRemindTime;
    if (defaults.countdownDaysBefore) form.reminder.countdownDaysBefore = [...defaults.countdownDaysBefore];
    if (defaults.birthdayDaysBefore) form.reminder.birthdayDaysBefore = [...defaults.birthdayDaysBefore];
    if (defaults.subscriptionDaysBefore) form.reminder.subscriptionDaysBefore = [...defaults.subscriptionDaysBefore];
    if (defaults.planDaysBefore) form.reminder.planDaysBefore = [...defaults.planDaysBefore];
  }
  settings.triggerHaptic();
};

const toggleCountdownDay = (day: number) => {
  if (!form.reminder.countdownDaysBefore) {
    form.reminder.countdownDaysBefore = [];
  }
  const idx = form.reminder.countdownDaysBefore.indexOf(day);
  if (idx >= 0) {
    form.reminder.countdownDaysBefore.splice(idx, 1);
  } else {
    form.reminder.countdownDaysBefore.push(day);
  }
};

const toggleBirthdayDay = (day: number) => {
  if (!form.reminder.birthdayDaysBefore) {
    form.reminder.birthdayDaysBefore = [];
  }
  const idx = form.reminder.birthdayDaysBefore.indexOf(day);
  if (idx >= 0) {
    form.reminder.birthdayDaysBefore.splice(idx, 1);
  } else {
    form.reminder.birthdayDaysBefore.push(day);
  }
};

const toggleSubscriptionDay = (day: number) => {
  if (!form.reminder.subscriptionDaysBefore) {
    form.reminder.subscriptionDaysBefore = [];
  }
  const idx = form.reminder.subscriptionDaysBefore.indexOf(day);
  if (idx >= 0) {
    form.reminder.subscriptionDaysBefore.splice(idx, 1);
  } else {
    form.reminder.subscriptionDaysBefore.push(day);
  }
};

const togglePlanDay = (day: number) => {
  if (!form.reminder.planDaysBefore) {
    form.reminder.planDaysBefore = [];
  }
  const idx = form.reminder.planDaysBefore.indexOf(day);
  if (idx >= 0) {
    form.reminder.planDaysBefore.splice(idx, 1);
  } else {
    form.reminder.planDaysBefore.push(day);
  }
};

const form = reactive<any>({
  displayStyle: "soft" as CardPresetStyle,
  isPinned: false,
  customStyle: {
    backgroundColor: "#FFFFFF",
    textColor: "#2D3436",
    accentColor: "#5C7C8A",
    badgeColor: "rgba(0,0,0,0.06)",
    borderColor: "rgba(92,124,138,0.18)",
    borderRadius: 32,
    shadowOpacity: 0.12
  }
});

const maxPinnedCards = MAX_PINNED_CARDS;

const colorOptions = [
  { key: "orange" }, { key: "blue" }, { key: "green" },
  { key: "pink" }, { key: "purple" }, { key: "cream" }
];



const onTogglePin = (e: any) => {
  const checked = !!e.detail.value;
  if (checked && !records.canPin(query.value.id)) {
    uni.showModal({
      title: "置顶数量已满",
      content: `最多只能置顶${MAX_PINNED_CARDS}个卡片，请先取消其他卡片的置顶`,
      showCancel: false,
      confirmText: "确定",
      confirmColor: "#5C7C8A",
      success(res) {
        if (res.confirm) {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      }
    });
    return;
  }
  form.isPinned = checked;
  settings.triggerHaptic();
};

const goBack = () => {
  settings.triggerHaptic();
  uni.navigateBack();
};

const goToStyleLibrary = () => {
  settings.triggerHaptic();
  if (!query.value.id) {
    uni.showToast({ title: "请先保存卡片", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/style-library/style-library?id=${query.value.id}`
  });
};



const loadCardData = () => {
  if (query.value.id) {
    records.loadCards();
    const card = records.cards.find(c => c.id === query.value.id);
    if (card) {
      form.icon = card.icon;
      form.colorClass = card.colorClass;
      form.displayStyle = card.displayStyle ?? "soft";
      form.isPinned = card.isPinned ?? false;
      form.type = card.type;
      form.reminder = card.reminder ? { ...card.reminder } : undefined;
      form.customStyle = {
        ...getDefaultCustomStyle(),
        ...(card.customStyle ?? {})
      };
    }
  }
};

const saveSettings = () => {
  if (!query.value.id) {
    uni.showToast({ title: "卡片未保存", icon: "none" });
    return;
  }

  const updatedData: Record<string, any> = {
    icon: form.icon,
    colorClass: form.colorClass,
    displayStyle: form.displayStyle,
    isPinned: form.isPinned,
    reminder: form.reminder,
    customStyle: form.displayStyle === "custom" ? { ...form.customStyle } : undefined
  };

  records.updateCard(query.value.id, updatedData);
  uni.showToast({ title: "设置已保存", icon: "success" });
  
  setTimeout(() => {
    uni.navigateBack();
  }, 600);
};

onLoad((options) => {
  query.value = (options ?? {}) as Record<string, string>;
  loadCardData();
});

onShow(() => {
  loadCardData();
});


</script>

<style scoped>
.edit-page { min-height: 100vh; background: #FAFAFB; }
.dark-mode { background: #000000; }

/* Navbar */
.edit-navbar {
  background: #FAFAFB;
  border-bottom: 1rpx solid #F0F0F5;
}
.dark-mode .edit-navbar { background: #000000; border-color: #222222; }
.navbar-row {
  display: flex; align-items: center;
  height: 88rpx; padding: 0 24rpx;
}
.nav-back {
  width: 60rpx; height: 60rpx; display: flex;
  align-items: center; justify-content: center;
}
.back-icon { font-size: 52rpx; color: #5C7C8A; font-weight: 300; }
.nav-title {
  flex: 1; text-align: center;
  font-size: 32rpx; font-weight: 700; color: #2D3436;
}
.dark-mode .nav-title { color: #F5F5DC; }
.nav-save {
  min-width: 112rpx;
  padding: 12rpx 24rpx;
  background: #5C7C8A;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(92, 124, 138, 0.16);
}
.nav-save:active { opacity: 0.8; }
.save-text { font-size: 26rpx; color: #fff; font-weight: 600; }

/* Scroll & sections */
.edit-scroll { height: calc(100vh - 200rpx); }
.section {
  margin: 24rpx 32rpx 0;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 28rpx;
}
.dark-mode .section { background: #111111; }

/* Icon & Color */
.icon-color-row {
  display: flex; align-items: center; gap: 24rpx;
}
.icon-selector {
  width: 100rpx; height: 100rpx;
  border-radius: 28rpx;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.icon-selector:active { transform: scale(0.93); }
.icon-display { font-size: 52rpx; }
.color-row {
  display: flex; align-items: center; gap: 16rpx; padding: 4rpx;
}
.color-dot {
  width: 52rpx; height: 52rpx;
  border-radius: 50%;
  transition: transform 0.15s;
  border: 4rpx solid transparent;
  flex-shrink: 0;
}
.color-dot:active { transform: scale(0.85); }
.dot-selected { border-color: #5C7C8A; transform: scale(1.15); }
.dot-orange { background: #E9C6B1; }
.dot-blue   { background: #A5C4D4; }
.dot-green  { background: #ADC7B8; }
.dot-pink   { background: #E3B9BC; }
.dot-purple { background: #D6C5D8; }
.dot-cream  { background: #ECC89C; }

/* Icon Picker Bottom Sheet */
.icon-picker-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 999;
  display: flex; align-items: flex-end;
}
.icon-picker-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx 60rpx;
  max-height: 70vh;
}
.dark-mode .icon-picker-sheet { background: #1A1A1A; }
.sheet-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24rpx;
}
.sheet-title { font-size: 32rpx; font-weight: 700; color: #2D3436; }
.dark-mode .sheet-title { color: #F5F5DC; }
.sheet-close {
  width: 60rpx; height: 60rpx;
  display: flex; align-items: center; justify-content: center;
}
.close-icon { font-size: 48rpx; color: #999; }
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16rpx;
}
.icon-cell {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: 20rpx;
  background: #F5F5F5;
}
.icon-cell-active { background: #EFF5F8; border: 2rpx solid #5C7C8A; }
.icon-cell-text { font-size: 48rpx; }

/* Reminder styles */
.reminder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.reminder-toggle {
  width: 80rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: #E0E0E0;
  position: relative;
  transition: background 0.3s;
}
.reminder-toggle.toggle-active {
  background: #5C7C8A;
}
.toggle-thumb {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #FFFFFF;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.3s;
}
.toggle-thumb.thumb-active {
  transform: translateX(32rpx);
}
.reminder-content {
  padding-top: 16rpx;
  border-top: 2rpx solid #F0F0F5;
}
.reminder-field {
  margin-bottom: 24rpx;
}
.reminder-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}
.reminder-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2rpx solid #F0F0F5;
  padding: 12rpx 0;
}
.reminder-input {
  width: 100%;
  font-size: 28rpx;
  color: #2D3436;
  border-bottom: 2rpx solid #F0F0F5;
  padding: 12rpx 0;
  background: transparent;
}
.reminder-options {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
.reminder-option {
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
  background: #F5F5F5;
  font-size: 26rpx;
  color: #666;
}
.reminder-option.option-active {
  background: #D6E8EE;
  color: #5C7C8A;
}

/* Fields */
.field-label {
  font-size: 26rpx; color: #999; font-weight: 500;
  display: block; margin-bottom: 16rpx;
}

/* Segment control */
.seg-control {
  display: flex; border-radius: 20rpx;
  overflow: hidden; background: #F5F5F7;
  margin-top: 16rpx;
}
.seg-active {
  background: #5C7C8A; color: #fff;
  font-weight: 700; border-radius: 18rpx;
}
.seg-item {
  flex: 1; text-align: center;
  padding: 14rpx 0; font-size: 26rpx; color: #666;
}

/* Pin toggle */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}
.toggle-info {
  flex: 1;
  min-width: 0;
}
.toggle-desc {
  font-size: 22rpx;
  color: #B0B6BC;
  display: block;
  line-height: 1.5;
}

.style-preset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}
.style-preset-item {
  padding: 18rpx;
  border-radius: 22rpx;
  background: #F7F8FA;
  border: 2rpx solid transparent;
}
.style-preset-active {
  border-color: #5C7C8A;
  background: #EEF5F7;
}
.style-preview {
  height: 100rpx;
  border-radius: 20rpx;
  padding: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.style-preview-soft { background: #F7EEE9; }
.style-preview-outline { background: #FFFFFF; border: 2rpx solid rgba(92,124,138,0.2); }
.style-preview-glass { background: rgba(255,255,255,0.7); border: 2rpx solid rgba(255,255,255,0.5); }
.style-preview-strong { background: #E6F1F4; box-shadow: 0 8rpx 20rpx rgba(92,124,138,0.15); }
.style-preview-custom { background: linear-gradient(135deg, #FFF8E7, #EEF7F8); }
.style-preview-more {
  background: linear-gradient(135deg, #F0E6FA, #E6F1F4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}
.more-dots {
  display: flex;
  gap: 10rpx;
  margin-bottom: 4rpx;
}
.more-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(92,124,138,0.35);
}
.style-preview-badge {
  width: 44rpx;
  height: 16rpx;
  border-radius: 10rpx;
  background: rgba(92,124,138,0.18);
}
.style-preview-line {
  height: 10rpx;
  border-radius: 8rpx;
  background: rgba(45,52,54,0.18);
}
.style-preview-line-lg { width: 72%; }
.style-preset-label {
  display: block;
  margin-top: 12rpx;
  text-align: center;
  font-size: 22rpx;
  color: #5E6C76;
  font-weight: 600;
}
.custom-style-panel {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #F2F4F7;
}
.custom-color-row {
  display: flex;
  gap: 16rpx;
  padding: 4rpx;
}
.custom-color-dot {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  flex-shrink: 0;
}
.custom-color-active {
  border-color: #5C7C8A;
  transform: scale(1.08);
}

.illustration-preview-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
  padding: 16rpx;
  background: rgba(92, 124, 138, 0.05);
  border-radius: 20rpx;
}
.illustration-preview-img {
  width: 120rpx;
  height: 80rpx;
  border-radius: 12rpx;
}
.illustration-info {
  display: flex;
  flex-direction: column;
}
.illustration-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #2D3436;
}
.illustration-theme {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}

/* Footer save bar */
.edit-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 120;
  padding: 20rpx 32rpx calc(env(safe-area-inset-bottom) + 20rpx);
  background: linear-gradient(180deg, rgba(250,250,251,0) 0%, rgba(250,250,251,0.92) 22%, #FAFAFB 56%);
}
.dark-mode .edit-footer {
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 22%, #000000 56%);
}
.save-button {
  height: 92rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #7BAFC0, #5C7C8A);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(92, 124, 138, 0.24);
}
.save-button:active {
  transform: scale(0.98);
  opacity: 0.92;
}
.save-button-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 800;
  letter-spacing: 2rpx;
}

/* Overlay / bottom sheet */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4); z-index: 300;
  display: flex; align-items: flex-end;
}
.bottom-sheet {
  width: 100%; background: #FFFFFF;
  border-radius: 40rpx 40rpx 0 0;
  padding: 20rpx 32rpx 80rpx;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

</style>
