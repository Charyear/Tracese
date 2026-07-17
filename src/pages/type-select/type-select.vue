<template>
  <view class="type-select-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Custom navbar -->
    <view class="select-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="nav-back" @tap="goBack" aria-label="返回" role="button">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">选择你要记录的类型</text>
        <view style="width: 60rpx;" />
      </view>
    </view>

    <!-- Subtitle description -->
    <view class="header-desc">
      <text class="desc-text">Tracese，记录你的专属节奏</text>
    </view>

    <!-- Main selections scroll view -->
    <scroll-view class="type-scroll" scroll-y>
      <view class="type-grid">
        <view
          v-for="t in cardTypes"
          :key="t.key"
          class="type-card"
          :class="`bg-${t.color}`"
          @tap="selectType(t.key)"
          :aria-label="t.label"
          role="button"
        >
          <view class="type-icon-wrapper">
            <text class="type-icon">{{ t.icon }}</text>
          </view>
          <view class="type-info">
            <text class="type-title">{{ t.label }}</text>
            <text class="type-subtitle">{{ t.desc }}</text>
          </view>
          <text class="type-arrow">›</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSettingsStore } from "../../store/settings";
import { useStatusBarHeight } from "../../composables/useStatusBarHeight";

const settings = useSettingsStore();
const statusBarHeight = useStatusBarHeight();
const isDark = computed(() => settings.theme === "dark");

const cardTypes = [
  { key: "countdown", label: "正/倒计时", icon: "📅", color: "blue", desc: "记录纪念日、倒计时、重要日程" },
  { key: "birthday", label: "生日", icon: "🎂", color: "pink", desc: "记录亲友生日，计算年龄、星座与倒计时" },
  { key: "habit", label: "打卡记录", icon: "🔥", color: "orange", desc: "追踪日常习惯，统计坚持打卡次数" },
  { key: "diary", label: "日记", icon: "📓", color: "green", desc: "记下今天的心情、想法和美好瞬间" },
  { key: "asset", label: "资产记录", icon: "💰", color: "cream", desc: "简单记账，追踪日常的收入和支出" },
  { key: "subscription", label: "订阅记录", icon: "🔔", color: "purple", desc: "管理续费服务，把握下一次扣费日程" },
  { key: "plan", label: "计划记录", icon: "📋", color: "blue", desc: "设立分步计划，掌控任务的 checklist 进度" }
];

const goBack = () => {
  settings.triggerHaptic();
  uni.navigateBack();
};

const selectType = (type: string) => {
  settings.triggerHaptic();
  uni.redirectTo({
    url: `/pages/edit/edit?type=${type}`,
    success: () => {
      // Optionally, show a toast or perform other actions after navigation
      // uni.showToast({ title: `开始新建${type}记录`, icon: 'none' });
    },
    fail: (err) => {
      console.error("Navigation failed:", err);
      uni.showToast({ title: "页面跳转失败", icon: "none" });
    }
  });
};

const goToAddPage = () => {
  settings.triggerHaptic();
  uni.redirectTo({ url: "/pages/edit/edit" });
};


</script>

<style scoped>
.type-select-page {
  min-height: 100vh;
  background: #EFF5F8;
  display: flex;
  flex-direction: column;
}
.dark-mode {
  background: #000000;
}

/* Navbar */
.select-navbar {
  background: transparent;
  border-bottom: 1rpx solid rgba(92,124,138,0.14);
}
.dark-mode .select-navbar {
  border-color: #222222;
}
.navbar-row {
  display: flex;
  align-items: center;
  height: 92rpx;
  padding: 0 24rpx;
}
.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  font-size: 52rpx;
  color: #5C7C8A;
  font-weight: 300;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 800;
  color: #1F3040;
}
.dark-mode .nav-title {
  color: #F5F5DC;
}

/* Header Desc */
.header-desc {
  padding: 32rpx 32rpx 16rpx;
  text-align: center;
}
.desc-text {
  font-size: 26rpx;
  color: #7B8A99;
  font-weight: 600;
  letter-spacing: 2rpx;
}
.dark-mode .desc-text {
  color: #888888;
}

/* Scroll grid */
.type-scroll {
  flex: 1;
  height: calc(100vh - 180rpx);
}
.type-grid {
  padding: 16rpx 32rpx 60rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* Type Card Style */
.type-card {
  display: flex;
  align-items: center;
  padding: 36rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(92,124,138,0.1);
  box-shadow: 0 12rpx 30rpx rgba(92,124,138,0.04);
  transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.type-card:active {
  transform: scale(0.97);
}

.bg-blue   { background: #EFF5F8; }
.bg-green  { background: #EFF6F2; }
.bg-pink   { background: #FBF1F1; }
.bg-orange { background: #FDF5EE; }
.bg-purple { background: #F5F1F8; }
.bg-cream  { background: #FAF6EF; }

.dark-mode .bg-blue { background: rgba(92,124,138,0.15); }
.dark-mode .bg-green { background: rgba(107,158,122,0.15); }
.dark-mode .bg-pink { background: rgba(229,115,115,0.15); }
.dark-mode .bg-orange { background: rgba(233,198,177,0.15); }
.dark-mode .bg-purple { background: rgba(186,104,200,0.15); }
.dark-mode .bg-cream { background: rgba(236,200,156,0.15); }

.type-icon-wrapper {
  width: 90rpx;
  height: 90rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
}
.dark-mode .type-icon-wrapper {
  background: rgba(255, 255, 255, 0.08);
}

.type-icon {
  font-size: 46rpx;
}
.type-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.type-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #1F3040;
}
.dark-mode .type-title {
  color: #F5F5DC;
}
.type-subtitle {
  font-size: 22rpx;
  color: #7B8A99;
  line-height: 1.3;
}
.dark-mode .type-subtitle {
  color: #888888;
}
.type-arrow {
  font-size: 44rpx;
  color: #C8C8CE;
  margin-left: 16rpx;
}
.dark-mode .type-arrow {
  color: #555555;
}
</style>
