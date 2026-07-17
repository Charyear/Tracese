<template>
  <view class="style-lib-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Custom navbar -->
    <view class="lib-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="nav-back" @tap="goBack" aria-label="返回" role="button">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">卡片手绘样式库</text>
        <view style="width: 60rpx;" />
      </view>
    </view>

    <!-- Card Live Preview Section -->
    <view class="preview-section" v-if="previewCard">
      <text class="section-title">实时效果预览</text>
      <view class="preview-card-wrapper">
        <AppCard :card="previewCard" />
      </view>
    </view>

    <!-- Tabs for different themes -->
    <view class="theme-tabs-row">
      <view
        v-for="tab in themes"
        :key="tab.id"
        class="theme-tab-btn"
        :class="{ 'theme-tab-active': activeThemeId === tab.id }"
        @tap="selectTheme(tab.id)"
      >
        <text class="tab-emoji">{{ tab.emoji }}</text>
        <text class="tab-label">{{ tab.name }}</text>
      </view>
    </view>

    <!-- Illustrations Grid -->
    <scroll-view class="illustrations-scroll" scroll-y>
      <view class="illustrations-grid">
        <!-- "No illustration" option to clear -->
        <view
          class="illustration-item none-item"
          :class="{ 'illustration-item-selected': !selectedStyleId }"
          @tap="selectIllustration('', '')"
        >
          <view class="none-icon-box">
            <text class="none-icon">✕</text>
          </view>
          <text class="illustration-label">经典纯色</text>
        </view>

        <!-- Listed illustrations -->
        <view
          v-for="item in currentThemeItems"
          :key="item.id"
          class="illustration-item"
          :class="{ 'illustration-item-selected': selectedStyleId === item.id }"
          @tap="selectStyle(item.id)"
        >
          <view class="illustration-img-wrapper">
            <text v-if="item.emoji" class="illustration-emoji">{{ item.emoji }}</text>
            <view v-else class="illustration-placeholder" />
          </view>
          <text class="illustration-label">{{ item.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Bottom Action Button -->
    <view class="bottom-action-bar">
      <button class="confirm-btn" @tap="confirmSelection" aria-label="确定更换并回到主页">确定更换并回到主页</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSettingsStore } from "../../store/settings";
import { useRecordsStore } from "../../store/records";
import AppCard from "../../components/AppCard.vue";
import type { AnyCard } from "../../types/card";
import { useStatusBarHeight } from "../../composables/useStatusBarHeight";

const settings = useSettingsStore();
const records = useRecordsStore();

const statusBarHeight = useStatusBarHeight();
const isDark = computed(() => settings.theme === "dark");

// Route parameter
const cardId = ref("");
const selectedCard = ref<AnyCard | null>(null);

// Active selection states
const activeThemeId = ref("zodiac");
const selectedStyleId = ref("");

// Live Card Preview
const previewCard = computed<AnyCard | null>(() => {
  if (!selectedCard.value) return null;
  return {
    ...selectedCard.value,
    customStyle: {
      ...(selectedCard.value.customStyle || {}),
      themeStyleId: selectedStyleId.value || undefined
    }
  };
});

// Theme Style Definitions - virtual / hand-drawn / emoji, NO real photos
interface ThemeItem {
  id: string;
  name: string;
  emoji?: string;
  bg: string;
  textColor: string;
  accentColor: string;
}

const themes: { id: string; name: string; emoji: string; items: ThemeItem[] }[] = [
  { id: "zodiac", name: "十二生肖", emoji: "🐱", items: [
    { id: "zodiac-rat",    name: "灵鼠献瑞", emoji: "🐀", bg: "linear-gradient(145deg, #FDF5EE, #F8E8D4, #FDEBD0)", textColor: "#4A3728", accentColor: "#C9956B" },
    { id: "zodiac-ox",     name: "金牛迎福", emoji: "🐂", bg: "linear-gradient(145deg, #FFF8E7, #F5E6C8, #EDD9A3)", textColor: "#5C4A1E", accentColor: "#D4A843" },
    { id: "zodiac-tiger",  name: "福虎生威", emoji: "🐯", bg: "linear-gradient(145deg, #FFF3E0, #FFE0B2, #FFCC80)", textColor: "#5D3A1A", accentColor: "#E8863A" },
    { id: "zodiac-rabbit", name: "玉兔呈祥", emoji: "🐰", bg: "linear-gradient(145deg, #FFF0F5, #F8DDE8, #F0C4D8)", textColor: "#5A2D3E", accentColor: "#D4799A" },
    { id: "zodiac-dragon", name: "祥龙腾飞", emoji: "🐉", bg: "linear-gradient(145deg, #E8F0FE, #C5D9F2, #A8C8E8)", textColor: "#1A3A5C", accentColor: "#4080B0" },
    { id: "zodiac-snake",  name: "灵蛇起舞", emoji: "🐍", bg: "linear-gradient(145deg, #E8F5E9, #C8E6C9, #A5D6A7)", textColor: "#1B5E20", accentColor: "#66BB6A" },
    { id: "zodiac-horse",  name: "骏马奔腾", emoji: "🐴", bg: "linear-gradient(145deg, #FFF8E1, #FFECB3, #FFE082)", textColor: "#5D4037", accentColor: "#D4A04A" },
    { id: "zodiac-goat",   name: "吉羊开泰", emoji: "🐑", bg: "linear-gradient(145deg, #F3E5F5, #E1BEE7, #CE93D8)", textColor: "#4A148C", accentColor: "#AB47BC" },
    { id: "zodiac-monkey", name: "金猴献寿", emoji: "🐵", bg: "linear-gradient(145deg, #FFF3E0, #FFCCBC, #FFAB91)", textColor: "#4E342E", accentColor: "#E07040" },
    { id: "zodiac-rooster",name: "雄鸡报晓", emoji: "🐓", bg: "linear-gradient(145deg, #FFFDE7, #FFF9C4, #FFF176)", textColor: "#5D4037", accentColor: "#F9A825" },
    { id: "zodiac-dog",    name: "瑞犬守护", emoji: "🐶", bg: "linear-gradient(145deg, #EFEBE9, #D7CCC8, #BCAAA4)", textColor: "#3E2723", accentColor: "#A1887F" },
    { id: "zodiac-pig",    name: "福猪拱门", emoji: "🐷", bg: "linear-gradient(145deg, #FCE4EC, #F8BBD0, #F48FB1)", textColor: "#5C1528", accentColor: "#E91E63" }
  ]},
  { id: "horoscope", name: "十二星座", emoji: "✨", items: [
    { id: "horoscope-aries",      name: "白羊座 ♈", emoji: "♈", bg: "linear-gradient(145deg, #FFE5E5, #FFB3B3, #FF8A80)", textColor: "#7F1D1D", accentColor: "#EF5350" },
    { id: "horoscope-taurus",     name: "金牛座 ♉", emoji: "♉", bg: "linear-gradient(145deg, #E8F5E9, #A5D6A7, #81C784)", textColor: "#1B5E20", accentColor: "#43A047" },
    { id: "horoscope-gemini",     name: "双子座 ♊", emoji: "♊", bg: "linear-gradient(145deg, #FFF8E1, #FFF3C4, #FFEE9C)", textColor: "#5D4037", accentColor: "#FFB300" },
    { id: "horoscope-cancer",     name: "巨蟹座 ♋", emoji: "♋", bg: "linear-gradient(145deg, #E0F7FA, #B2EBF2, #80DEEA)", textColor: "#004D40", accentColor: "#00ACC1" },
    { id: "horoscope-leo",        name: "狮子座 ♌", emoji: "♌", bg: "linear-gradient(145deg, #FFF3E0, #FFE0B2, #FFCC80)", textColor: "#5D3A1A", accentColor: "#FB8C00" },
    { id: "horoscope-virgo",      name: "处女座 ♍", emoji: "♍", bg: "linear-gradient(145deg, #F3E5F5, #E1BEE7, #CE93D8)", textColor: "#4A148C", accentColor: "#8E24AA" },
    { id: "horoscope-libra",      name: "天秤座 ♎", emoji: "♎", bg: "linear-gradient(145deg, #FCE4EC, #F8BBD0, #F48FB1)", textColor: "#5C1528", accentColor: "#D81B60" },
    { id: "horoscope-scorpio",    name: "天蝎座 ♏", emoji: "♏", bg: "linear-gradient(145deg, #EDE7F6, #B39DDB, #9575CD)", textColor: "#1A0033", accentColor: "#5E35B1" },
    { id: "horoscope-sagittarius",name: "射手座 ♐", emoji: "♐", bg: "linear-gradient(145deg, #E8EAF6, #C5CAE9, #9FA8DA)", textColor: "#1A237E", accentColor: "#3F51B5" },
    { id: "horoscope-capricorn",  name: "摩羯座 ♑", emoji: "♑", bg: "linear-gradient(145deg, #EFEBE9, #BCAAA4, #A1887F)", textColor: "#3E2723", accentColor: "#5D4037" },
    { id: "horoscope-aquarius",   name: "水瓶座 ♒", emoji: "♒", bg: "linear-gradient(145deg, #E0F7FA, #80DEEA, #4DD0E1)", textColor: "#006064", accentColor: "#0097A7" },
    { id: "horoscope-pisces",     name: "双鱼座 ♓", emoji: "♓", bg: "linear-gradient(145deg, #E8EAF6, #B3C6E8, #8EA8D8)", textColor: "#1A3A6C", accentColor: "#3F60A8" }
  ]},
  { id: "scenery", name: "自然风景", emoji: "🌲", items: [
    { id: "scenery-forest", name: "绿野仙踪", emoji: "🌲", bg: "linear-gradient(145deg, #E8F5E9, #C8E6C9, #A5D6A7)", textColor: "#1B5E20", accentColor: "#4CAF50" },
    { id: "scenery-ocean",  name: "深蓝海岸", emoji: "🌊", bg: "linear-gradient(145deg, #E0F7FA, #B2EBF2, #80DEEA)", textColor: "#004D40", accentColor: "#00ACC1" },
    { id: "scenery-snow",   name: "雪国圣殿", emoji: "🏔️", bg: "linear-gradient(145deg, #F5F7FA, #E8EEF4, #D0DAE8)", textColor: "#2C3E50", accentColor: "#5D7B93" },
    { id: "scenery-sunset", name: "霞光万道", emoji: "🌅", bg: "linear-gradient(145deg, #FFF3E0, #FFCC80, #FFB74D)", textColor: "#5D3A1A", accentColor: "#FB8C00" },
    { id: "scenery-starry", name: "璀璨星河", emoji: "🌃", bg: "linear-gradient(145deg, #1A1A2E, #16213E, #0F3460)", textColor: "#E0E0E0", accentColor: "#FFD54F" },
    { id: "scenery-desert", name: "浩瀚大漠", emoji: "🏜️", bg: "linear-gradient(145deg, #FFF8E1, #FFE082, #FFD54F)", textColor: "#5D4037", accentColor: "#FF8F00" }
  ]},
  { id: "pets", name: "可爱萌宠", emoji: "🐹", items: [
    { id: "pets-cat",     name: "慵懒小橘", emoji: "🐱", bg: "linear-gradient(145deg, #FFF3E0, #FFE0B2, #FFCC80)", textColor: "#5D3A1A", accentColor: "#FB8C00" },
    { id: "pets-dog",     name: "治愈萨摩", emoji: "🐕", bg: "linear-gradient(145deg, #F5F5F5, #E0E0E0, #BDBDBD)", textColor: "#37474F", accentColor: "#607D8B" },
    { id: "pets-bunny",   name: "乖萌垂耳", emoji: "🐰", bg: "linear-gradient(145deg, #FCE4EC, #F8BBD0, #F48FB1)", textColor: "#5C1528", accentColor: "#E91E63" },
    { id: "pets-fox",     name: "机灵红狐", emoji: "🦊", bg: "linear-gradient(145deg, #FBE9E7, #FFAB91, #FF8A65)", textColor: "#4E342E", accentColor: "#FF5722" },
    { id: "pets-panda",   name: "胖哒团子", emoji: "🐼", bg: "linear-gradient(145deg, #FAFAFA, #E8E8E8, #D0D0D0)", textColor: "#212121", accentColor: "#424242" },
    { id: "pets-hamster", name: "仓鼠团团", emoji: "🐹", bg: "linear-gradient(145deg, #FFF8E1, #FFECB3, #FFE082)", textColor: "#5D4037", accentColor: "#FFB300" }
  ]}
];

const currentThemeItems = computed(() => {
  const t = themes.find(x => x.id === activeThemeId.value);
  return t ? t.items : [];
});

const selectTheme = (id: string) => {
  settings.triggerHaptic();
  activeThemeId.value = id;
};

const selectStyle = (styleId: string) => {
  settings.triggerHaptic();
  selectedStyleId.value = styleId;
};

const goBack = () => {
  settings.triggerHaptic();
  uni.navigateBack();
};

const confirmSelection = () => {
  settings.triggerHaptic();
  if (!cardId.value) {
    uni.showToast({ title: "无效卡片ID", icon: "none" });
    return;
  }

  // Save selection directly to records store
  const updatedCustomStyle = {
    ...(selectedCard.value?.customStyle || {}),
    themeStyleId: selectedStyleId.value || undefined
  };

  // If a style was selected, switch displayStyle to 'custom'
  const displayStyle = selectedStyleId.value ? "custom" : (selectedCard.value?.displayStyle || "soft");

  records.updateCard(cardId.value, {
    customStyle: updatedCustomStyle,
    displayStyle
  });

  uni.showToast({
    title: "更换成功",
    icon: "success",
    duration: 1000,
    success: () => {
      setTimeout(() => {
        // Navigate back to main index page instead of edit page
        uni.reLaunch({
          url: "/pages/index/index"
        });
      }, 1000);
    }
  });
};

onMounted(() => {
  // Load routing query params
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage ? currentPage.$page?.options || currentPage.options : {};

  if (options && options.id) {
    cardId.value = options.id;
    // Find card from store
    const found = records.cards.find(c => c.id === options.id);
    if (found) {
      selectedCard.value = JSON.parse(JSON.stringify(found));
      if (found.customStyle) {
        activeThemeId.value = found.customStyle.illustrationTheme || "zodiac";
      }
    }
  } else {
    uni.showToast({ title: "未指定卡片参数", icon: "none" });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});
</script>

<style scoped>
.style-lib-page {
  min-height: 100vh;
  background: #F0F4F8;
  display: flex;
  flex-direction: column;
  padding-bottom: 180rpx; /* Leave space for bottom action bar */
  box-sizing: border-box;
}
.dark-mode {
  background: #000000;
}

/* Custom navbar */
.lib-navbar {
  background: #F0F4F8;
  position: sticky;
  top: 0;
  z-index: 50;
  padding-bottom: 10rpx;
}
.dark-mode .lib-navbar {
  background: #000000;
  border-bottom: 1rpx solid #222222;
}
.navbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx;
}
.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  font-size: 50rpx;
  font-weight: 300;
  color: #2D3436;
}
.dark-mode .back-icon {
  color: #F5F5DC;
}
.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2D3436;
}
.dark-mode .nav-title {
  color: #F5F5DC;
}

/* Live Preview */
.preview-section {
  padding: 24rpx 32rpx;
}
.section-title {
  font-size: 26rpx;
  color: #7F8B95;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}
.dark-mode .section-title {
  color: #888888;
}
.preview-card-wrapper {
  perspective: 1000px;
}

/* Themes Tab Row */
.theme-tabs-row {
  display: flex;
  justify-content: space-around;
  background: #FFFFFF;
  margin: 16rpx 32rpx;
  padding: 12rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(31, 41, 55, 0.04);
}
.dark-mode .theme-tabs-row {
  background: #111111;
  box-shadow: none;
}
.theme-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 16rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
  flex: 1;
}
.theme-tab-active {
  background: #EFF5F8;
}
.dark-mode .theme-tab-active {
  background: #222222;
}
.tab-emoji {
  font-size: 38rpx;
  margin-bottom: 6rpx;
}
.tab-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #64748B;
}
.theme-tab-active .tab-label {
  color: #5C7C8A;
}
.dark-mode .theme-tab-active .tab-label {
  color: #83A5B5;
}

/* Scroll grid */
.illustrations-scroll {
  flex: 1;
  padding: 10rpx 32rpx;
  box-sizing: border-box;
}
.illustrations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.illustration-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(31, 41, 55, 0.03);
  border: 4rpx solid transparent;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.dark-mode .illustration-item {
  background: #111111;
}
.illustration-item-selected {
  border-color: #5C7C8A;
  background: #F4F8FA;
}
.dark-mode .illustration-item-selected {
  border-color: #83A5B5;
  background: #222222;
}
.illustration-img-wrapper {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-mode .illustration-img-wrapper {
  background: #222222;
}
.illustration-img {
  width: 100%;
  height: 100%;
}
.illustration-emoji {
  font-size: 100rpx;
  line-height: 1;
}
.illustration-placeholder {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: linear-gradient(145deg, #E8F5E9, #C8E6C9);
}
.illustration-label {
  font-size: 22rpx;
  font-weight: 500;
  color: #334155;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.dark-mode .illustration-label {
  color: #F5F5DC;
}

/* None / Clear Style */
.none-item {
  justify-content: center;
}
.none-icon-box {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: #F8FAFC;
  border: 2rpx dashed #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  box-sizing: border-box;
}
.dark-mode .none-icon-box {
  background: #111111;
  border-color: #333333;
}
.none-icon {
  font-size: 44rpx;
  color: #94A3B8;
}

/* Bottom Action Bar */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
}
.dark-mode .bottom-action-bar {
  background: rgba(0, 0, 0, 0.9);
}
.confirm-btn {
  background: #5C7C8A;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 28rpx;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  box-shadow: 0 8rpx 20rpx rgba(92, 124, 138, 0.25);
  border: none;
}
.confirm-btn:active {
  transform: scale(0.98);
  opacity: 0.95;
}
</style>
