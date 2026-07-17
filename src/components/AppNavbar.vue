<template>
  <view class="app-navbar" :class="isDark ? 'nav-dark' : 'nav-light'" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content">
      <view class="navbar-left" @tap="onBack" v-if="showBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="navbar-title-wrap">
        <text class="navbar-title">{{ title }}</text>
      </view>
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStatusBarHeight } from "../composables/useStatusBarHeight";
import { useSettingsStore } from "../store/settings";

const props = withDefaults(defineProps<{
  title?: string;
  showBack?: boolean;
}>(), {
  title: "Tracese",
  showBack: false
});

const statusBarHeight = useStatusBarHeight();
const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");

const onBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--nav-bg, #FAFAFB);
  border-bottom: 1rpx solid var(--nav-border, #F0F0F5);
}

/* Dark mode */
.nav-dark {
  --nav-bg: #1A1A1A;
  --nav-border: #333333;
  --text-primary: #F5F5DC;
}

.nav-dark .back-icon {
  color: #A5C4D4;
}
.navbar-content {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
}
.navbar-left {
  width: 60rpx;
  display: flex;
  align-items: center;
}
.back-icon {
  font-size: 52rpx;
  color: #5C7C8A;
  font-weight: 300;
  line-height: 1;
}
.navbar-title-wrap {
  flex: 1;
  display: flex;
  align-items: center;
}
.navbar-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary, #333333);
  letter-spacing: -0.5rpx;
}
.navbar-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
