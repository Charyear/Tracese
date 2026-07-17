<template>
  <view v-if="visible" class="onboarding-overlay" :class="isDark ? 'ob-dark' : 'ob-light'" @touchmove.stop.prevent @touchstart.stop @touchend.stop catchtouchmove="true">
    <!-- Step indicators -->
    <view class="ob-indicators">
      <view
        v-for="(_, idx) in steps"
        :key="idx"
        class="ob-dot"
        :class="{ 'ob-dot-active': idx === currentStep }"
      />
    </view>

    <!-- Step content -->
    <view class="ob-content">
      <view class="ob-icon">{{ steps[currentStep].icon }}</view>
      <text class="ob-title">{{ steps[currentStep].title }}</text>
      <text class="ob-desc">{{ steps[currentStep].desc }}</text>
    </view>

    <!-- Navigation buttons -->
    <view class="ob-actions">
      <view v-if="currentStep > 0" class="ob-btn ob-btn-prev" @tap="prevStep">
        <text class="ob-btn-text">上一步</text>
      </view>
      <view style="flex: 1" />
      <view class="ob-btn ob-btn-next" @tap="nextStep">
        <text class="ob-btn-text">{{ isLastStep ? '开始使用' : '下一步' }}</text>
      </view>
    </view>

    <!-- Skip button -->
    <view class="ob-skip" @tap="skipOnboarding">
      <text class="ob-skip-text">跳过引导</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useSettingsStore } from "../store/settings";

const props = withDefaults(defineProps<{
  visible?: boolean;
}>(), {
  visible: false
});

const emit = defineEmits<{
  complete: [];
  skip: [];
}>();

const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");

const currentStep = ref(0);

const steps = [
  {
    icon: "✨",
    title: "欢迎来到 Tracese",
    desc: "极简、高颜值的本地生活记录工具，帮你记录生活中的每一个重要时刻。"
  },
  {
    icon: "📝",
    title: "多种记录类型",
    desc: "支持习惯打卡、倒计时、生日提醒、资产管理、订阅管理、日记、计划等多种记录类型。"
  },
  {
    icon: "🎨",
    title: "精美卡片主题",
    desc: "十二生肖、星座、自然风景、可爱萌宠等手绘插画主题，让每张卡片都独一无二。"
  },
  {
    icon: "🌓",
    title: "深色模式",
    desc: "支持浅色/深色主题切换，保护你的眼睛，夜间使用更舒适。"
  },
  {
    icon: "📤",
    title: "分享与备份",
    desc: "生成精美海报分享卡片，支持数据导出备份，你的记录永远安全。"
  },
  {
    icon: "👆",
    title: "长按有惊喜",
    desc: "长按卡片可生成精美分享海报，让你的记录以最美的方式呈现。"
  }
];

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const nextStep = () => {
  if (isLastStep.value) {
    settings.completeOnboarding();
    emit("complete");
  } else {
    currentStep.value++;
    settings.triggerHaptic();
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    settings.triggerHaptic();
  }
};

const skipOnboarding = () => {
  settings.completeOnboarding();
  emit("skip");
};

const resetStep = () => {
  currentStep.value = 0;
};

defineExpose({ resetStep });
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 60rpx;
}

.ob-light {
  background: rgba(250, 250, 251, 1.0);
}

.ob-dark {
  background: rgba(0, 0, 0, 1.0);
}

.ob-indicators {
  display: flex;
  gap: 16rpx;
  margin-bottom: 80rpx;
}

.ob-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(150, 150, 150, 0.3);
  transition: all 0.3s ease;
}

.ob-dot-active {
  width: 48rpx;
  border-radius: 8rpx;
  background: #5C7C8A;
}

.ob-dark .ob-dot-active {
  background: #A5C4D4;
}

.ob-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 560rpx;
}

.ob-icon {
  font-size: 120rpx;
  margin-bottom: 48rpx;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

.ob-title {
  font-size: 44rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
}

.ob-light .ob-title {
  color: #2D3436;
}

.ob-dark .ob-title {
  color: #F5F5DC;
}

.ob-desc {
  font-size: 28rpx;
  line-height: 1.8;
  opacity: 0.75;
}

.ob-light .ob-desc {
  color: #6B7280;
}

.ob-dark .ob-desc {
  color: #A0A0A0;
}

.ob-actions {
  display: flex;
  width: 100%;
  max-width: 560rpx;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.ob-btn {
  padding: 24rpx 48rpx;
  border-radius: 50rpx;
  text-align: center;
  transition: transform 0.15s ease;
}

.ob-btn:active {
  transform: scale(0.95);
}

.ob-btn-prev {
  background: rgba(150, 150, 150, 0.15);
}

.ob-btn-next {
  background: #5C7C8A;
  box-shadow: 0 8rpx 24rpx rgba(92, 124, 138, 0.3);
}

.ob-dark .ob-btn-next {
  background: #A5C4D4;
  box-shadow: 0 8rpx 24rpx rgba(165, 196, 212, 0.3);
}

.ob-btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.ob-light .ob-btn-prev .ob-btn-text {
  color: #6B7280;
}

.ob-dark .ob-btn-prev .ob-btn-text {
  color: #A0A0A0;
}

.ob-btn-next .ob-btn-text {
  color: #FFFFFF;
}

.ob-skip {
  padding: 16rpx 32rpx;
}

.ob-skip-text {
  font-size: 24rpx;
  opacity: 0.5;
}

.ob-light .ob-skip-text {
  color: #6B7280;
}

.ob-dark .ob-skip-text {
  color: #A0A0A0;
}
</style>
