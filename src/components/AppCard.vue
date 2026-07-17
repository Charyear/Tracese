<template>
  <!-- Card visual -->
  <view
    class="app-card"
    :class="[
      `card-${card.colorClass}`,
      `card-style-${resolvedDisplayStyle}`,
      { 'card-selected': selected },
      themeCardClass,
      isDark ? 'card-dark' : 'card-light'
    ]"
    :style="cardStyleVars"
    @tap="onTap"
    @longpress="onLongPress"
  >
    <!-- Theme decorative background patterns -->
    <view v-if="themeData" class="card-theme-bg" :class="`theme-bg-${themeData.themeId}`">
      <text v-for="(dot, i) in themeBgDots" :key="i" class="theme-bg-dot" :style="dot" />
    </view>

    <!-- Center theme character (emoji for zodiac/pets) -->
    <view v-if="themeData && themeCharEmoji" class="card-center-theme-char">
      <text class="theme-emoji">{{ themeCharEmoji }}</text>
      <text class="theme-char-name">{{ themeData.name }}</text>
    </view>

    <!-- Header row with icon, title and badge -->
    <view class="card-header">
      <view class="card-header-left">
        <text class="card-icon">{{ card.icon }}</text>
        <text class="card-title">{{ card.title }}</text>
      </view>
      <view class="card-header-right">
        <text v-if="card.reminder?.enabled" class="card-reminder-icon">⏰</text>
        <text v-if="card.isPinned" class="card-pin-icon">📌</text>
      </view>
      <view class="card-type-badge">
        <text class="card-type-label">{{ typeLabel }}</text>
      </view>
    </view>

    <!-- Top slot for content below header (e.g., birthday tags) -->
    <view class="card-top-content">
      <slot name="top" />
    </view>

    <!-- Footer row: date bottom-left, type-specific content bottom-right -->
    <view class="card-footer">
      <view class="card-footer-left">
        <text class="card-date">{{ dateStr }}</text>
      </view>
      <view class="card-body">
        <slot />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "../store/settings";
import { allThemeStyles } from "../constants/themes";
import type { ThemeDef } from "../constants/themes";
import type { AnyCard, CardPresetStyle } from "../types/card";
const props = defineProps<{
  card: AnyCard;
  selected?: boolean;
}>();

const emit = defineEmits<{
  tap: [card: AnyCard];
  longpress: [card: AnyCard];
}>();

const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");

const resolvedDisplayStyle = computed<CardPresetStyle>(() => props.card.displayStyle ?? "soft");

// Resolve current theme
const themeData = computed<ThemeDef | null>(() => {
  const styleId = props.card.customStyle?.themeStyleId;
  if (!styleId) return null;
  return allThemeStyles[styleId] ?? null;
});

const themeCardClass = computed(() => {
  if (!themeData.value) return "";
  return `card-theme-${themeData.value.themeId}`;
});

// Generate decorative dots for theme background
const themeBgDots = computed(() => {
  if (!themeData.value) return [];
  const count = 6;
  const dots: Record<string, string>[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      left: `${10 + (i % 3) * 35}%`,
      top: `${15 + Math.floor(i / 3) * 40}%`,
      width: `${16 + (i * 7) % 20}rpx`,
      height: `${16 + (i * 7) % 20}rpx`,
      opacity: `${0.06 + (i * 0.02)}`
    });
  }
  return dots;
});

// Center theme character (zodiac symbols for horoscope)
const themeCharEmoji = computed<string | null>(() => {
  if (!themeData.value) return null;
  
  const zodiacSymbols = {
    "horoscope-aries":      "♈",
    "horoscope-taurus":     "♉", 
    "horoscope-gemini":     "♊",
    "horoscope-cancer":     "♋",
    "horoscope-leo":        "♌",
    "horoscope-virgo":      "♍",
    "horoscope-libra":      "♎",
    "horoscope-scorpio":    "♏",
    "horoscope-sagittarius":"♐",
    "horoscope-capricorn":  "♑", 
    "horoscope-aquarius":   "♒",
    "horoscope-pisces":     "♓",
    "zodiac-rat":          "🐀",
    "zodiac-ox":           "🐂", 
    "zodiac-tiger":        "🐯",
    "zodiac-rabbit":       "🐰",
    "zodiac-dragon":       "🐉",
    "zodiac-snake":        "🐍",
    "zodiac-horse":        "🐴",
    "zodiac-goat":         "🐑",
    "zodiac-monkey":       "🐵",
    "zodiac-rooster":      "🐓",
    "zodiac-dog":          "🐶",
    "zodiac-pig":          "🐷",
    "pets-cat":            "🐱",
    "pets-dog":            "🐕",
    "pets-bunny":          "🐰",
    "pets-fox":            "🦊",
    "pets-panda":          "🐼",
    "pets-hamster":        "🐹",
    "scenery-forest":      "🌲",
    "scenery-ocean":       "🌊",
    "scenery-snow":        "🏔️",
    "scenery-sunset":      "🌅", 
    "scenery-starry":      "🌃",
    "scenery-desert":      "🏜️",
    "healing-garden":      "🌸",
    "healing-sunshine":    "☀️",
    "healing-cloud":       "☁️",
    "healing-sakura":      "🌺",
    "healing-forest":      "🌿",
    "healing-sea":         "🐚",
    "healing-dusk":        "🌇",
    "healing-tea":         "🍵",
    "healing-lavender":    "💜",
    "healing-rain":        "🌈",
    "healing-coffee":      "☕",
    "healing-meadow":      "🌻"
  };
  
  return zodiacSymbols[themeData.value.id] ?? themeData.value.emoji ?? null;
});

const presetStyleMap: Record<string, Record<string, string | number>> = {
  soft: {
    "--card-text-color": "#2D3436",
    "--card-muted-color": "#7F8B95",
    "--card-badge-bg": "rgba(0,0,0,0.06)",
    "--card-border-color": "transparent",
    "--card-shadow": "0 8rpx 24rpx rgba(31, 41, 55, 0.06)",
    "--card-radius": "32rpx"
  },
  outline: {
    "--card-text-color": "#2D3436",
    "--card-muted-color": "#6B7280",
    "--card-badge-bg": "rgba(255,255,255,0.75)",
    "--card-border-color": "rgba(92,124,138,0.22)",
    "--card-shadow": "none",
    "--card-radius": "32rpx"
  },
  glass: {
    "--card-text-color": "#2D3436",
    "--card-muted-color": "#6B7280",
    "--card-badge-bg": "rgba(255,255,255,0.55)",
    "--card-border-color": "rgba(255,255,255,0.45)",
    "--card-shadow": "0 10rpx 28rpx rgba(92,124,138,0.12)",
    "--card-radius": "36rpx"
  },
  strong: {
    "--card-text-color": "#1F2933",
    "--card-muted-color": "#52606D",
    "--card-badge-bg": "rgba(92,124,138,0.14)",
    "--card-border-color": "rgba(92,124,138,0.18)",
    "--card-shadow": "0 14rpx 32rpx rgba(92,124,138,0.18)",
    "--card-radius": "28rpx"
  },
  custom: {
    "--card-text-color": "#2D3436",
    "--card-muted-color": "#7F8B95",
    "--card-badge-bg": "rgba(0,0,0,0.06)",
    "--card-border-color": "transparent",
    "--card-shadow": "0 8rpx 24rpx rgba(31, 41, 55, 0.08)",
    "--card-radius": "32rpx"
  }
};

const cardStyleVars = computed(() => {
  const preset = presetStyleMap[resolvedDisplayStyle.value] ?? presetStyleMap.soft;
  const custom = props.card.customStyle ?? {};

  const styleVars: Record<string, string> = Object.fromEntries(
    Object.entries(preset).map(([k, v]) => [k, String(v)])
  );

  if (resolvedDisplayStyle.value === "custom") {
    if (custom.backgroundColor) styleVars.background = custom.backgroundColor;
    if (custom.textColor) styleVars["--card-text-color"] = custom.textColor;
    if (custom.accentColor) styleVars["--card-accent-color"] = custom.accentColor;
    if (custom.badgeColor) styleVars["--card-badge-bg"] = custom.badgeColor;
    if (custom.borderColor) styleVars["--card-border-color"] = custom.borderColor;
    if (typeof custom.borderRadius === "number") styleVars["--card-radius"] = `${custom.borderRadius}rpx`;
    if (typeof custom.shadowOpacity === "number") {
      styleVars["--card-shadow"] = `0 10rpx 28rpx rgba(92,124,138,${custom.shadowOpacity})`;
    }
  }

  // Theme style overrides - this is the key: theme completely changes the card look
  if (themeData.value) {
    const t = themeData.value;
    styleVars.background = t.bg;
    styleVars["--card-text-color"] = t.textColor ?? "#2D3436";
    styleVars["--card-muted-color"] = t.mutedColor ?? "#7F8B95";
    styleVars["--card-accent-color"] = t.accentColor ?? "#5C7C8A";
    styleVars["--card-border-color"] = t.borderCSS?.replace(/^2rpx solid /, "") ?? "transparent";
    styleVars["--card-shadow"] = t.shadowCSS ?? "0 8rpx 24rpx rgba(31,41,55,0.06)";
    styleVars["--card-badge-bg"] = t.accentColor ? `${t.accentColor}18` : "rgba(0,0,0,0.06)";
  }

  return styleVars;
});

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    habit: "习惯",
    countdown: "倒计日",
    diary: "日记",
    asset: "资产",
    subscription: "订阅",
    birthday: "生日",
    plan: "计划"
  };
  return map[props.card.type] ?? "";
});

const dateStr = computed(() => {
  const d = new Date(props.card.updatedAt);
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

const onTap = () => {
  settings.triggerHaptic();
  emit("tap", props.card);
};

const onLongPress = () => {
  settings.triggerHaptic();
  emit("longpress", props.card);
};
</script>

<style scoped>
.app-card {
  background: var(--card-bg, transparent);
  border-radius: 32rpx;
  border: 2rpx solid var(--card-border-color, transparent);
  padding: 24rpx 20rpx 18rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  height: 341rpx;
  box-sizing: border-box;
  box-shadow: var(--card-shadow, none);
  transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  border-radius: var(--card-radius, 32rpx);
}
.app-card:active {
  transform: scale(0.96);
}
.card-blue   { background: #EFF5F8; }
.card-green  { background: #EFF6F2; }
.card-pink   { background: #FBF1F1; }
.card-orange { background: #FDF5EE; }
.card-purple { background: #F5F1F8; }
.card-cream  { background: #FAF6EF; }

/* Dark mode */
.card-dark.card-blue   { background: #1A2A3A; }
.card-dark.card-green  { background: #1A2A22; }
.card-dark.card-pink   { background: #2A1A1A; }
.card-dark.card-orange { background: #2A2218; }
.card-dark.card-purple { background: #221A2A; }
.card-dark.card-cream  { background: #2A2820; }
.card-dark .card-title { color: #F5F5DC; }
.card-dark .card-date { color: #A0A0A0; }
.card-dark .card-type-label { color: #A0A0A0; }
.card-dark .card-type-badge { background: rgba(255,255,255,0.08); }
.card-dark .card-icon { opacity: 0.8; }
.card-style-outline { backdrop-filter: none; }
.card-style-glass { backdrop-filter: blur(12rpx); }

/* Theme background decorations */
.card-theme-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
}
.theme-bg-dot {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
}

/* Per-theme decorative patterns */
.theme-bg-zodiac .theme-bg-dot {
  background: rgba(201,149,107,0.08);
  border-radius: 40%;
}
.theme-bg-horoscope .theme-bg-dot {
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  box-shadow: 0 0 20rpx rgba(255,255,255,0.1);
}
.theme-bg-scenery .theme-bg-dot {
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}
.theme-bg-pets .theme-bg-dot {
  background: rgba(255,255,255,0.18);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}
.theme-bg-healing .theme-bg-dot {
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  box-shadow: 0 0 16rpx rgba(255,255,255,0.15);
}

/* Center theme character display */
.card-center-theme-char {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}
.theme-emoji {
  font-size: 100rpx;
  line-height: 1;
  filter: drop-shadow(0 4rpx 12rpx rgba(0,0,0,0.08));
}
.theme-char-name {
  font-size: 20rpx;
  font-weight: 600;
  color: var(--card-accent-color, #5C7C8A);
  margin-top: 6rpx;
  opacity: 0.7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 12rpx;
  position: relative;
  z-index: 2;
}
.card-header-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: 1;
  min-width: 0;
}
.card-icon {
  font-size: 36rpx;
  line-height: 1;
  flex-shrink: 0;
}
.card-type-badge {
  background: var(--card-badge-bg, rgba(0,0,0,0.06));
  border-radius: 20rpx;
  padding: 4rpx 14rpx;
  flex-shrink: 0;
}
.card-header-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}
.card-reminder-icon {
  font-size: 22rpx;
  flex-shrink: 0;
  line-height: 1;
}
.card-pin-icon {
  font-size: 22rpx;
  flex-shrink: 0;
  line-height: 1;
}
.card-type-label {
  font-size: 20rpx;
  color: var(--card-muted-color, #666);
  font-weight: 500;
}
.card-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--card-text-color, #2D3436);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.card-top-content {
  margin-top: 8rpx;
  position: relative;
  z-index: 2;
}
.card-footer {
  margin-top: auto;
  padding-top: 8rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12rpx;
  position: relative;
  z-index: 2;
}
.card-date {
  font-size: 22rpx;
  color: var(--card-muted-color, #999);
  flex-shrink: 0;
}
.card-body {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
}
.card-selected::after {
  content: "✓";
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #5C7C8A;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}
</style>
