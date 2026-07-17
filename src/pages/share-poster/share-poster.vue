<template>
  <view class="share-page" :class="isDark ? 'sp-dark' : 'sp-light'">
    <!-- Navbar -->
    <view class="sp-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="nav-back" @tap="goBack" aria-label="返回" role="button">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">分享海报</text>
        <view style="width: 60rpx;" />
      </view>
    </view>

    <!-- Options -->
    <view class="sp-options">
      <view class="opt-item" @tap="toggleShowDate">
        <text class="opt-checkbox">{{ showDate ? '☑' : '☐' }}</text>
        <text class="opt-label">日期</text>
      </view>
      <view class="opt-item" @tap="toggleShowAppName">
        <text class="opt-checkbox">{{ showAppName ? '☑' : '☐' }}</text>
        <text class="opt-label">应用名称</text>
      </view>
    </view>

    <!-- Custom Poetic Text -->
    <view class="sp-poetic">
      <view class="poetic-row">
        <text class="poetic-label">文案</text>
        <view class="poetic-reset" @tap="resetPoeticText" v-if="customPoeticText">
          <text class="poetic-reset-text">重置</text>
        </view>
      </view>
      <input
        class="poetic-input"
        v-model="poeticInputText"
        placeholder="输入自定义文案，或留空使用默认文字"
        placeholder-class="poetic-placeholder"
        maxlength="24"
        @input="onPoeticInput"
      />
    </view>

    <!-- Poster Preview -->
    <view class="sp-content">
      <view
        class="poster-wrapper"
        :style="{ width: canvasDisplayWidth + 'px', height: canvasDisplayHeight + 'px' }"
      >
        <canvas
          canvas-id="posterCanvas"
          :width="CANVAS_WIDTH"
          :height="CANVAS_HEIGHT"
          class="poster-canvas"
          :style="{ width: canvasDisplayWidth + 'px', height: canvasDisplayHeight + 'px' }"
        />
      </view>
    </view>

    <!-- Bottom Actions -->
    <view class="sp-actions">
      <view class="action-btn" @tap="savePoster">
        <text class="action-icon">💾</text>
        <text class="action-label">保存到相册</text>
      </view>
      <view class="action-btn" @tap="shareToWechat">
        <text class="action-icon">📤</text>
        <text class="action-label">分享给好友</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useSettingsStore } from "../../store/settings";
import { useRecordsStore } from "../../store/records";
import { useStatusBarHeight } from "../../composables/useStatusBarHeight";
import type { AnyCard } from "../../types/card";
import { allThemeStyles, getThemeCanvasColors } from "../../constants/themes";

const settings = useSettingsStore();
const records = useRecordsStore();
const statusBarHeight = useStatusBarHeight();
const isDark = computed(() => settings.theme === "dark");

// Canvas display size (responsive to screen)
const canvasDisplayWidth = ref(300);
const canvasDisplayHeight = ref(480);

// Canvas internal resolution (high quality)
const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 600;

const card = ref<AnyCard | null>(null);
const posterGenerated = ref(false);
const showDate = ref(true);
const showAppName = ref(true);

// Poetic texts by card type (5+ each)
const poeticTexts: Record<string, string[]> = {
  habit: [
    "日拱一卒，功不唐捐",
    "习惯的力量，让改变悄然发生",
    "每一次坚持，都是未来的馈赠",
    "滴水穿石，非一日之功",
    "自律即自由",
    "微小的积累，成就非凡的你"
  ],
  countdown: [
    "时光荏苒，珍惜当下",
    "每一个值得期待的日子",
    "愿所有的等待，都值得",
    "倒计时里，藏着对未来的期许",
    "时间会给出最好的答案",
    "愿你所期待的，如约而至"
  ],
  birthday: [
    "岁岁年年，愿你被温柔以待",
    "愿你的每一天都如生日般闪耀",
    "时光正好，未来可期",
    "又一年，愿你笑靥如花",
    "愿你三冬暖，愿你春不寒",
    "生辰吉乐，万事胜意"
  ],
  diary: [
    "文字是时光的琥珀",
    "记录，让记忆有了温度",
    "生活不在别处，就在当下",
    "把日子写成诗",
    "岁月不居，时节如流",
    "且将新火试新茶，诗酒趁年华"
  ],
  asset: [
    "每一分钱，都是生活的底气",
    "记录收支，掌控人生",
    "积少成多，聚沙成塔",
    "理财即理生活",
    "精打细算，幸福相伴",
    "财富是智慧的积累"
  ],
  subscription: [
    "为热爱付费，为品质买单",
    "每一笔订阅，都是对自己的投资",
    "持续成长，从订阅开始",
    "知识无价，学习有方",
    "投资自己，是最好的回报",
    "日积月累，终成博学"
  ],
  plan: [
    "凡事预则立，不预则废",
    "一步步，走向目标",
    "今天的努力，明天的收获",
    "计划的人生，从容不迫",
    "千里之行，始于足下",
    "志之所向，无坚不入"
  ]
};

const customPoeticText = ref("");
const poeticInputText = ref("");

const getPoeticText = (): string => {
  if (customPoeticText.value) return customPoeticText.value;
  if (!card.value) return "记录生活，珍藏回忆";
  const texts = poeticTexts[card.value.type] || ["记录生活中的每一个重要时刻"];
  const index = card.value.id.charCodeAt(card.value.id.length - 1) % texts.length;
  return texts[index];
};

const onPoeticInput = () => {
  customPoeticText.value = poeticInputText.value.trim();
  if (card.value) drawPoster();
};

const resetPoeticText = () => {
  customPoeticText.value = "";
  poeticInputText.value = "";
  if (card.value) drawPoster();
};

const toggleShowDate = () => {
  showDate.value = !showDate.value;
  if (card.value) drawPoster();
};

const toggleShowAppName = () => {
  showAppName.value = !showAppName.value;
  if (card.value) drawPoster();
};

onMounted(() => {
  // Calculate canvas display size based on screen width
  const sysInfo = uni.getSystemInfoSync();
  const screenWidth = sysInfo.windowWidth || 375;
  const maxCanvasWidth = Math.min(screenWidth - 40, 600);
  canvasDisplayWidth.value = maxCanvasWidth;
  canvasDisplayHeight.value = Math.round(maxCanvasWidth * CANVAS_HEIGHT / CANVAS_WIDTH);

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage?.options?.id;

  if (id) {
    card.value = records.cards.find((c) => c.id === id) || null;
  }

  nextTick(() => {
    if (card.value) {
      drawPoster();
    }
  });

  // Redraw when options change
  watch([showDate, showAppName], () => {
    if (card.value) {
      drawPoster();
    }
  });

  // Watch poetic input for changes
  watch(poeticInputText, () => {
    customPoeticText.value = poeticInputText.value.trim();
    if (card.value) drawPoster();
  });
});

const goBack = () => {
  settings.triggerHaptic();
  uni.navigateBack();
};

// ============================================================
// 卡片配色映射（用于背景）
// ============================================================
const getCardColorPalette = () => {
  if (!card.value) return { bg: "#FAFAFB", glow: "rgba(92,124,138,0.06)", decor: "rgba(45,52,54,0.04)", darkBg: "#1A1A1A", darkGlow: "rgba(92,124,138,0.1)", darkDecor: "rgba(245,245,220,0.06)" };

  // Check if card has a theme applied - use theme colors if so
  const themeStyleId = card.value.customStyle?.themeStyleId;
  if (themeStyleId && allThemeStyles[themeStyleId]) {
    const theme = allThemeStyles[themeStyleId];
    const colors = getThemeCanvasColors(themeStyleId);
    if (colors) {
      const accentRgb = hexToRgb(colors.accentColor);
      return {
        bg: colors.startColor,
        glow: `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.12)`,
        decor: `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.06)`,
        darkBg: "#1A1A1A",
        darkGlow: `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.1)`,
        darkDecor: "rgba(245,245,220,0.06)",
      };
    }
  }

  const paletteMap: Record<string, any> = {
    blue:    { bg: "#F0F4F8", glow: "rgba(165,196,212,0.12)", decor: "rgba(92,124,138,0.06)",  darkBg: "#1A1A1A", darkGlow: "rgba(92,124,138,0.1)",  darkDecor: "rgba(245,245,220,0.06)" },
    green:   { bg: "#F1F7F4", glow: "rgba(173,199,184,0.12)",  decor: "rgba(110,139,121,0.06)", darkBg: "#1A1A1A", darkGlow: "rgba(110,139,121,0.1)",  darkDecor: "rgba(245,245,220,0.06)" },
    pink:    { bg: "#FBF2F2", glow: "rgba(227,185,188,0.12)",  decor: "rgba(166,124,128,0.06)", darkBg: "#1A1A1A", darkGlow: "rgba(166,124,128,0.1)",  darkDecor: "rgba(245,245,220,0.06)" },
    orange:  { bg: "#FDF6F0", glow: "rgba(233,198,177,0.12)",  decor: "rgba(172,128,101,0.06)", darkBg: "#1A1A1A", darkGlow: "rgba(172,128,101,0.1)",  darkDecor: "rgba(245,245,220,0.06)" },
    purple:  { bg: "#F7F3F9", glow: "rgba(214,197,216,0.12)",  decor: "rgba(142,123,146,0.06)", darkBg: "#1A1A1A", darkGlow: "rgba(142,123,146,0.1)",  darkDecor: "rgba(245,245,220,0.06)" },
    cream:   { bg: "#FAF7F2", glow: "rgba(236,200,156,0.12)",  decor: "rgba(176,142,98,0.06)",  darkBg: "#1A1A1A", darkGlow: "rgba(176,142,98,0.1)",   darkDecor: "rgba(245,245,220,0.06)" },
  };
  return paletteMap[card.value.colorClass] || paletteMap.blue;
};

// ============================================================
// Layer 1: 海报背景（使用卡片配色的渐变光晕）
// ============================================================
const drawBackground = (ctx: any, W: number, H: number) => {
  const palette = getCardColorPalette();
  const themeStyleId = card.value?.customStyle?.themeStyleId;
  const themeColors = themeStyleId ? getThemeCanvasColors(themeStyleId) : null;

  // 基础背景色
  ctx.setFillStyle(isDark.value ? palette.darkBg : palette.bg);
  ctx.fillRect(0, 0, W, H);

  // 顶部渐变光晕
  ctx.setFillStyle(isDark.value ? palette.darkGlow : palette.glow);
  ctx.beginPath();
  ctx.arc(W / 2, 60, 100, 0, Math.PI * 2);
  ctx.fill();

  // 底部装饰光晕
  ctx.setFillStyle(isDark.value ? palette.darkGlow : palette.glow);
  ctx.beginPath();
  ctx.arc(W / 2, H - 80, 70, 0, Math.PI * 2);
  ctx.fill();

  // 装饰小圆点
  ctx.setFillStyle(isDark.value ? palette.darkDecor : palette.decor);
  const dots = [
    { x: 25, y: 100, r: 3 },
    { x: W - 30, y: 180, r: 2 },
    { x: 40, y: H - 160, r: 2 },
    { x: W - 35, y: H - 100, r: 3 },
    { x: W / 2 - 50, y: H - 70, r: 2 },
    { x: W / 2 + 60, y: 140, r: 2 },
  ];
  dots.forEach((d) => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 装饰线条
  ctx.setStrokeStyle(isDark.value ? palette.darkDecor : toCanvasColor(palette.decor, 1));
  ctx.setLineWidth(0.5);
  ctx.beginPath();
  ctx.moveTo(15, 90);
  ctx.lineTo(50, 120);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - 15, 230);
  ctx.lineTo(W - 50, 260);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, H - 180);
  ctx.lineTo(60, H - 150);
  ctx.stroke();
};

// ============================================================
// Layer 2: 品牌区域（Logo、应用名）
// ============================================================
const drawBrandArea = (ctx: any, W: number, H: number) => {
  if (!showAppName.value) return;

  const palette = getCardColorPalette();
  const themeStyleId = card.value?.customStyle?.themeStyleId;
  const themeColors = themeStyleId ? getThemeCanvasColors(themeStyleId) : null;
  const brandY = 35;

  // Logo 背景圆形
  ctx.setFillStyle(isDark.value ? "rgba(92,124,138,0.15)" : "rgba(255,255,255,0.6)");
  ctx.beginPath();
  ctx.arc(W / 2, brandY, 18, 0, Math.PI * 2);
  ctx.fill();

  // Logo 图标（使用 goals.png）
  ctx.drawImage("/static/image/goals.png", W / 2 - 14, brandY - 14, 28, 28);

  // 应用名
  ctx.setFontSize(10);
  ctx.setFillStyle(isDark.value ? "rgba(245,245,220,0.5)" : (themeColors ? toCanvasColor(themeColors.mutedColor, 1) : "rgba(45,52,54,0.5)"));
  ctx.setTextAlign("center");
  ctx.setTextBaseline("alphabetic");
  ctx.fillText("Tracese", W / 2, brandY + 30);
};

// ============================================================
// Layer 3: 动态内容（卡片区域，唯一变化部分）
// ============================================================
const drawDynamicContent = (ctx: any, W: number, H: number) => {
  if (!card.value) return;

  const cardX = 25;
  const cardY = 80;
  const cardW = W - 50;
  const cardH = 300;

  // 卡片阴影
  ctx.setFillStyle(isDark.value ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.06)");
  ctx.beginPath();
  const radius = 16;
  ctx.moveTo(cardX + radius, cardY + 4);
  ctx.lineTo(cardX + cardW - radius, cardY + 4);
  ctx.quadraticCurveTo(cardX + cardW, cardY + 4, cardX + cardW, cardY + radius + 4);
  ctx.lineTo(cardX + cardW, cardY + cardH - radius + 4);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH + 4, cardX + cardW - radius, cardY + cardH + 4);
  ctx.lineTo(cardX + radius, cardY + cardH + 4);
  ctx.quadraticCurveTo(cardX, cardY + cardH + 4, cardX, cardY + cardH - radius + 4);
  ctx.lineTo(cardX, cardY + radius + 4);
  ctx.quadraticCurveTo(cardX, cardY + 4, cardX + radius, cardY + 4);
  ctx.closePath();
  ctx.fill();

  // 卡片背景（使用渐变，与AppCard风格一致）
  const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  const cardColors = getCardGradientColors();
  gradient.addColorStop(0, cardColors[0]);
  gradient.addColorStop(1, cardColors[1]);
  ctx.setFillStyle(gradient);
  ctx.beginPath();
  ctx.moveTo(cardX + radius, cardY);
  ctx.lineTo(cardX + cardW - radius, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
  ctx.lineTo(cardX + cardW, cardY + cardH - radius);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
  ctx.lineTo(cardX + radius, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
  ctx.lineTo(cardX, cardY + radius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  ctx.closePath();
  ctx.fill();

  // 装饰性圆点（与AppCard主题背景风格一致）
  const themeStyleId = card.value?.customStyle?.themeStyleId;
  const themeColors = themeStyleId ? getThemeCanvasColors(themeStyleId) : null;
  const dotColor = themeColors ? toCanvasColor(themeColors.accentColor, 0.2) : (isDark.value ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.2)");
  ctx.setFillStyle(dotColor);
  const decorDots = [
    { x: cardX + 30, y: cardY + 25, r: 8 },
    { x: cardX + cardW - 35, y: cardY + 40, r: 6 },
    { x: cardX + 50, y: cardY + cardH - 30, r: 5 },
    { x: cardX + cardW - 40, y: cardY + cardH - 45, r: 7 },
    { x: cardX + cardW / 2 - 40, y: cardY + 20, r: 4 },
    { x: cardX + cardW / 2 + 50, y: cardY + cardH - 25, r: 5 },
  ];
  decorDots.forEach((d) => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 卡片边框
  const borderColor = themeColors ? toCanvasColor(themeColors.accentColor, 0.3) : (isDark.value ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.3)");
  ctx.setStrokeStyle(borderColor);
  ctx.setLineWidth(1);
  ctx.beginPath();
  ctx.moveTo(cardX + radius, cardY);
  ctx.lineTo(cardX + cardW - radius, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
  ctx.lineTo(cardX + cardW, cardY + cardH - radius);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
  ctx.lineTo(cardX + radius, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
  ctx.lineTo(cardX, cardY + radius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  ctx.closePath();
  ctx.stroke();

  const centerX = W / 2;
  const themeDisplay = getThemeDisplay();
  const textColor = isDark.value ? "#F5F5DC" : cardColors[2];
  const subTextColor = isDark.value ? "rgba(245,245,220,0.6)" : (themeColors ? themeColors.mutedColor : "rgba(45,52,54,0.6)");

  // 卡片图标
  ctx.setFontSize(28);
  ctx.setTextAlign("center");
  ctx.setTextBaseline("middle");
  ctx.fillText(card.value.icon || "📝", centerX, cardY + 30);

  // 卡片标题
  ctx.setFontSize(18);
  ctx.setFillStyle(textColor);
  ctx.setTextAlign("center");
  ctx.setTextBaseline("alphabetic");
  ctx.fillText(card.value.title, centerX, cardY + 65);

  // 类型标签（显示主题名称如果已应用）
  ctx.setFontSize(10);
  ctx.setFillStyle(subTextColor);
  const typeLabel = themeDisplay ? `${themeDisplay.emoji} ${themeDisplay.name}` : getTypeLabel();
  ctx.fillText(typeLabel, centerX, cardY + 85);

  // 分隔线
  const separatorColor = themeColors ? toCanvasColor(themeColors.accentColor, 0.2) : (isDark.value ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)");
  ctx.setStrokeStyle(separatorColor);
  ctx.setLineWidth(0.5);
  ctx.beginPath();
  ctx.moveTo(cardX + 30, cardY + 100);
  ctx.lineTo(cardX + cardW - 30, cardY + 100);
  ctx.stroke();

  // 卡片详细信息（每行一个，居中显示）
  const infoLines = getCardInfoLines();
  let lineY = cardY + 125;
  const lineHeight = 22;

  infoLines.forEach((line) => {
    ctx.setFontSize(line.size || 12);
    ctx.setFillStyle(line.color === "sub" ? subTextColor : textColor);
    ctx.setTextAlign("center");
    ctx.setTextBaseline("alphabetic");
    ctx.fillText(line.text, centerX, lineY);
    lineY += lineHeight;
  });

  // 日期（在卡片底部）
  if (showDate.value) {
    ctx.setFontSize(9);
    ctx.setFillStyle(isDark.value ? "rgba(245,245,220,0.4)" : (themeColors ? themeColors.mutedColor : "rgba(45,52,54,0.4)"));
    ctx.setTextAlign("center");
    ctx.setTextBaseline("alphabetic");
    const dateStr = new Date(card.value.updatedAt).toLocaleDateString("zh-CN");
    ctx.fillText(dateStr, centerX, cardY + cardH - 12);
  }
};

// Helper: Convert hex color to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

// Helper: Convert color to WeChat Canvas compatible format
const toCanvasColor = (color: string, opacity: number = 1): string => {
  // If it's already a valid canvas color, return as is
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    return color;
  }
  
  // If it's a hex color with opacity (e.g. #E8863A33), convert to rgba
  if (color.length === 9 && color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const alpha = parseInt(color.slice(7, 9), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha * opacity})`;
  }
  
  // If it's a hex color, convert to rgba with specified opacity
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Return original color if no conversion needed
  return color;
};

// 获取卡片渐变颜色（与AppCard配色一致）
const getCardGradientColors = (): string[] => {
  if (!card.value) return ["#EFF5F8", "#DCE8F0", "#2D3436"];

  // Check if card has a theme applied - use theme gradient colors if so
  const themeStyleId = card.value.customStyle?.themeStyleId;
  if (themeStyleId && allThemeStyles[themeStyleId]) {
    const colors = getThemeCanvasColors(themeStyleId);
    if (colors) {
      return [colors.startColor, colors.midColor, colors.textColor];
    }
  }

  const gradientMap: Record<string, string[]> = {
    blue:    ["#EFF5F8", "#DCE8F0", "#2D3436"],
    green:   ["#EFF6F2", "#D6EBE0", "#2D3436"],
    pink:    ["#FBF1F1", "#F5DADA", "#2D3436"],
    orange:  ["#FDF5EE", "#F5E0CC", "#5D3A1A"],
    purple:  ["#F5F1F8", "#E5DCE8", "#2D3436"],
    cream:   ["#FAF6EF", "#F0E5D0", "#5D4037"],
  };
  return gradientMap[card.value.colorClass] || gradientMap.blue;
};

// Get theme info for display on poster
const getThemeDisplay = (): { name: string; emoji: string } | null => {
  if (!card.value?.customStyle?.themeStyleId) return null;
  const theme = allThemeStyles[card.value.customStyle.themeStyleId];
  if (!theme) return null;
  return { name: theme.name, emoji: theme.emoji || "" };
};

// 获取卡片详细信息（每行一个字段）
const getCardInfoLines = (): Array<{ text: string; size?: number; color?: string }> => {
  if (!card.value) return [];
  const lines: Array<{ text: string; size?: number; color?: string }> = [];

  switch (card.value.type) {
    case "habit": {
      const c = card.value as any;
      lines.push({ text: `连续打卡 ${c.streak || 0} 天`, size: 14 });
      lines.push({ text: `累计打卡 ${c.totalCount || 0} 次`, size: 12, color: "sub" });
      if (c.dailyLimit) {
        lines.push({ text: `每日上限 ${c.dailyLimit} 次`, size: 12, color: "sub" });
      }
      break;
    }
    case "countdown": {
      const c = card.value as any;
      const target = new Date(c.targetDate);
      const now = new Date();
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      lines.push({ text: diff >= 0 ? `还有 ${diff} 天` : `已过 ${Math.abs(diff)} 天`, size: 16 });
      lines.push({ text: `目标：${target.toLocaleDateString("zh-CN")}`, size: 12, color: "sub" });
      break;
    }
    case "birthday": {
      const c = card.value as any;
      const birth = new Date(c.birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBirthday < now) {
        age++;
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }
      const daysLeft = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      lines.push({ text: `${age} 岁`, size: 16 });
      lines.push({ text: `生日：${birth.toLocaleDateString("zh-CN")}`, size: 12, color: "sub" });
      lines.push({ text: `还有 ${daysLeft} 天`, size: 12, color: "sub" });
      break;
    }
    case "diary": {
      const c = card.value as any;
      const content = c.content || "";
      const excerpt = content.length > 20 ? content.substring(0, 20) + "..." : content;
      lines.push({ text: excerpt || "暂无内容", size: 12 });
      if (c.mood) {
        lines.push({ text: `心情：${c.mood}`, size: 12, color: "sub" });
      }
      if (c.weather) {
        lines.push({ text: `天气：${c.weather}`, size: 12, color: "sub" });
      }
      break;
    }
    case "asset": {
      const c = card.value as any;
      const prefix = c.flowType === "income" ? "+" : "-";
      lines.push({ text: `${prefix}¥${c.amount}`, size: 16 });
      lines.push({ text: `来源：${c.source || "其他"}`, size: 12, color: "sub" });
      lines.push({ text: `日期：${c.date || ""}`, size: 12, color: "sub" });
      break;
    }
    case "subscription": {
      const c = card.value as any;
      lines.push({ text: `¥${c.price}`, size: 16 });
      lines.push({ text: `周期：${getCycleLabel(c.billingCycle)}`, size: 12, color: "sub" });
      if (c.nextBillingDate) {
        lines.push({ text: `下次扣费：${c.nextBillingDate}`, size: 12, color: "sub" });
      }
      break;
    }
    case "plan": {
      const c = card.value as any;
      const completed = c.steps?.filter((s: any) => s.completed).length || 0;
      const total = c.steps?.length || 0;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      lines.push({ text: `进度：${completed}/${total} (${percent}%)`, size: 14 });
      if (c.deadline) {
        lines.push({ text: `截止：${c.deadline}`, size: 12, color: "sub" });
      }
      break;
    }
  }

  return lines;
};

const getCycleLabel = (cycle: string): string => {
  const map: Record<string, string> = {
    daily: "每天",
    weekly: "每周",
    monthly: "每月",
    quarterly: "每季度",
    yearly: "每年",
  };
  return map[cycle] || cycle || "未知";
};

// ============================================================
// Layer 4: 治愈文案 & 底部品牌信息
// ============================================================
const drawPoeticAndFooter = (ctx: any, W: number, H: number) => {
  const palette = getCardColorPalette();
  const decorColor = isDark.value ? palette.darkDecor : palette.decor;
  const themeStyleId = card.value?.customStyle?.themeStyleId;
  const themeColors = themeStyleId ? getThemeCanvasColors(themeStyleId) : null;
  const textMuted = isDark.value ? "rgba(245,245,220,0.6)" : (themeColors ? themeColors.mutedColor : "rgba(45,52,54,0.55)");

  // 治愈文案（始终显示）
  const poeticY = H - 130;
  const poeticText = getPoeticText();

  // 装饰短线
  ctx.setStrokeStyle(toCanvasColor(decorColor, 1));
  ctx.setLineWidth(0.5);
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, poeticY - 14);
  ctx.lineTo(W / 2 - 8, poeticY - 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 8, poeticY - 14);
  ctx.lineTo(W / 2 + 40, poeticY - 14);
  ctx.stroke();

  // 装饰小圆点
  ctx.setFillStyle(isDark.value ? "rgba(245,245,220,0.3)" : "rgba(255,255,255,0.5)");
  ctx.beginPath();
  ctx.arc(W / 2, poeticY - 14, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 文案文字
  ctx.setFontSize(12);
  ctx.setFillStyle(textMuted);
  ctx.setTextAlign("center");
  ctx.setTextBaseline("middle");
  ctx.fillText(poeticText, W / 2, poeticY + 2);

  // 底部装饰线
  ctx.setStrokeStyle(toCanvasColor(decorColor, 1));
  ctx.setLineWidth(0.5);
  ctx.beginPath();
  ctx.moveTo(W / 2 - 30, poeticY + 20);
  ctx.lineTo(W / 2 + 30, poeticY + 20);
  ctx.stroke();

  // 底部品牌信息已移至顶部品牌区域，此处不再绘制
};

// ============================================================
// 主绘制入口：按四层顺序绘制
// ============================================================
const drawPoster = () => {
  if (!card.value) return;

  const ctx = uni.createCanvasContext("posterCanvas");
  const dpr = CANVAS_WIDTH / canvasDisplayWidth.value;
  ctx.scale(dpr, dpr);
  const W = CANVAS_WIDTH / dpr;
  const H = CANVAS_HEIGHT / dpr;

  // 第一层：背景（渐变、光晕、装饰元素）
  drawBackground(ctx, W, H);

  // 第二层：品牌区域（Logo、应用名）
  drawBrandArea(ctx, W, H);

  // 第三层：动态内容（卡片区域，唯一变化部分）
  drawDynamicContent(ctx, W, H);

  // 第四层：治愈文案 & 底部品牌信息
  drawPoeticAndFooter(ctx, W, H);

  ctx.draw(false, () => {
    posterGenerated.value = true;
  });
};

const getTypeLabel = (): string => {
  if (!card.value) return "";
  const map: Record<string, string> = {
    habit: "习惯打卡",
    countdown: "倒计日",
    diary: "日记",
    asset: "资产记录",
    subscription: "订阅记录",
    birthday: "生日",
    plan: "计划"
  };
  return map[card.value.type] || "";
};

const handleSaveFail = (err: any) => {
  if (err?.errMsg?.includes("auth")) {
    uni.showModal({
      title: "需要相册权限",
      content: "请在设置中允许访问相册",
      success(modal) {
        if (modal.confirm) {
          uni.openSetting();
        }
      },
    });
  } else {
    uni.showToast({ title: "保存失败", icon: "none" });
  }
};

const savePoster = () => {
  if (!posterGenerated.value) {
    uni.showToast({ title: "海报生成中，请稍候", icon: "none" });
    return;
  }

  uni.canvasToTempFilePath({
    canvasId: "posterCanvas",
    success(res) {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success() {
          uni.showToast({ title: "已保存到相册", icon: "success" });
        },
        fail: handleSaveFail,
      });
    },
    fail() {
      uni.showToast({ title: "生成失败", icon: "none" });
    },
  });
};

const shareToWechat = () => {
  if (!posterGenerated.value) {
    uni.showToast({ title: "海报生成中，请稍候", icon: "none" });
    return;
  }

  uni.canvasToTempFilePath({
    canvasId: "posterCanvas",
    success(res) {
      uni.shareAppMessage({
        title: `${card.value?.title} - Tracese`,
        path: "/pages/index/index",
        imageUrl: res.tempFilePath,
      });
    },
    fail() {
      uni.showToast({ title: "分享失败", icon: "none" });
    },
  });
};
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sp-light {
  background: #FAFAFB;
}

.sp-dark {
  background: #000000;
}

.sp-navbar {
  padding-bottom: 20rpx;
}

.sp-light .sp-navbar {
  background: #FAFAFB;
}

.sp-dark .sp-navbar {
  background: #000000;
}

.navbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  height: 80rpx;
}

.nav-back {
  width: 60rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 48rpx;
  font-weight: 300;
}

.sp-light .back-icon {
  color: #2D3436;
}

.sp-dark .back-icon {
  color: #F5F5DC;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
}

.sp-light .nav-title {
  color: #2D3436;
}

.sp-dark .nav-title {
  color: #F5F5DC;
}

/* Options */
.sp-options {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  padding: 16rpx 30rpx;
}

.opt-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(92, 124, 138, 0.08);
}

.sp-dark .opt-item {
  background: rgba(165, 196, 212, 0.1);
}

.opt-checkbox {
  font-size: 24rpx;
}

.sp-light .opt-checkbox {
  color: #5C7C8A;
}

.sp-dark .opt-checkbox {
  color: #A5C4D4;
}

.opt-label {
  font-size: 22rpx;
  font-weight: 500;
}

.sp-light .opt-label {
  color: #5C7C8A;
}

.sp-dark .opt-label {
  color: #A5C4D4;
}

.sp-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 40rpx;
}

.poster-scaler {
  transform: scale(0.55);
  transform-origin: top center;
  margin-bottom: -300rpx;
}

.poster-wrapper {
  border-radius: 20rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.poster-canvas {
  display: block;
  border-radius: 20rpx;
  /* CSS display size is bound inline to canvasDisplayWidth/Height */
}

.sp-actions {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  padding: 40rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  border-radius: 20rpx;
  background: rgba(92, 124, 138, 0.1);
}

.sp-dark .action-btn {
  background: rgba(165, 196, 212, 0.15);
}

.action-icon {
  font-size: 40rpx;
}

.action-label {
  font-size: 22rpx;
  font-weight: 500;
}

.sp-light .action-label {
  color: #5C7C8A;
}

.sp-dark .action-label {
  color: #A5C4D4;
}

/* Poetic Text Input */
.sp-poetic {
  padding: 16rpx 40rpx;
}

.poetic-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.poetic-label {
  font-size: 24rpx;
  font-weight: 600;
}

.sp-light .poetic-label {
  color: #5C7C8A;
}

.sp-dark .poetic-label {
  color: #A5C4D4;
}

.poetic-reset {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  background: rgba(92, 124, 138, 0.1);
}

.sp-dark .poetic-reset {
  background: rgba(165, 196, 212, 0.15);
}

.poetic-reset-text {
  font-size: 20rpx;
}

.sp-light .poetic-reset-text {
  color: #5C7C8A;
}

.sp-dark .poetic-reset-text {
  color: #A5C4D4;
}

.poetic-input {
  width: 100%;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  background: rgba(92, 124, 138, 0.06);
  border: 1rpx solid rgba(92, 124, 138, 0.12);
}

.sp-dark .poetic-input {
  background: rgba(165, 196, 212, 0.08);
  border: 1rpx solid rgba(165, 196, 212, 0.15);
}

.sp-light .poetic-input {
  color: #2D3436;
}

.sp-dark .poetic-input {
  color: #F5F5DC;
}

.poetic-placeholder {
  color: #999;
}

.sp-dark .poetic-placeholder {
  color: #666;
}
</style>
