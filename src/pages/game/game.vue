<template>
  <view class="game-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Top Left: Menu + Close buttons -->
    <view class="game-topbar">
      <view class="topbar-left">
        <view class="menu-btn" @tap="showMenu = true" aria-label="菜单" role="button">
          <text class="menu-icon">☰</text>
        </view>
        <view class="close-btn" @tap.stop="closeGame" aria-label="关闭" role="button">
          <text class="close-icon">✕</text>
        </view>
      </view>
    </view>

    <!-- Menu Panel -->
    <view v-if="showMenu" class="menu-overlay" @tap="showMenu = false">
      <view class="menu-panel" @tap.stop>
        <view class="menu-header">
          <text class="menu-title">游戏选项</text>
          <view class="menu-close" @tap="showMenu = false">
            <text>×</text>
          </view>
        </view>

        <!-- Option List -->
        <scroll-view class="menu-scroll" scroll-y>
          <view
            v-for="(option, idx) in options"
            :key="idx"
            class="option-item"
          >
            <text class="option-text">{{ option }}</text>
            <view class="option-delete" @tap="deleteOption(idx)">
              <text>×</text>
            </view>
          </view>
          <view v-if="options.length === 0" class="empty-options">
            <text>暂无选项，请添加</text>
          </view>
        </scroll-view>

        <!-- Add Option -->
        <view class="add-option-row">
          <input
            class="add-option-input"
            v-model="newOption"
            placeholder="输入新选项..."
            placeholder-class="placeholder-text"
            maxlength="12"
            @confirm="addOption"
            aria-label="新选项"
          />
          <view class="add-option-btn" @tap="addOption" aria-label="添加选项" role="button">
            <text>添加</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Game Area -->
    <view class="game-area" @touchstart="onGameAreaTap">
      <!-- Water Ripple Effects -->
      <view
        v-for="ripple in waterRipples"
        :key="ripple.id"
        class="water-ripple"
        :style="{
          left: ripple.x + 'px',
          top: ripple.y + 'px',
          width: ripple.size + 'px',
          height: ripple.size + 'px',
          opacity: ripple.opacity,
          borderColor: ripple.color
        }"
      />

      <!-- Current Animal (during gameplay) -->
      <view
        v-if="showAnimal"
        class="game-animal"
        :key="animalKey"
      >
        <text class="animal-emoji">{{ currentAnimal }}</text>
      </view>

      <!-- Play Button (initial state) -->
      <view v-if="!isPlaying && !showResult" class="play-btn" @tap.stop="startGame">
        <text class="play-icon">▶</text>
        <text class="play-text">开始游戏</text>
      </view>

      <!-- Result Popup -->
      <view v-if="showResult" class="result-overlay">
        <view class="result-popup" :class="{ 'popup-show': resultAnimated }">
          <text class="result-label">本轮结果</text>
          <text class="result-text">{{ displayResult }}</text>
          <view class="result-actions">
            <view class="action-btn action-know" @tap="goHome">
              <text>我已知晓</text>
            </view>
            <view class="action-btn action-next" @tap="nextRound">
              <text>继续下一轮</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Playing Hint -->
      <view v-if="isPlaying && !showResult" class="playing-hint">
        <text>点击任意位置停止</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { useSettingsStore } from "../../store/settings";
import { onLoad, onShow } from "@dcloudio/uni-app";

const settings = useSettingsStore();
const isDark = computed(() => settings.theme === "dark");

// Menu state
const showMenu = ref(false);
const newOption = ref("");
const defaultOptions = ["选项1", "选项2", "选项3"];
const options = ref<string[]>([...defaultOptions]);

// Game state
const isPlaying = ref(false);
const showResult = ref(false);
const resultAnimated = ref(false);
const displayResult = ref("");
const selectedOption = ref("");

// Animation state
const waterRipples = ref<Array<{
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}>>([]);

// Animal animation state
const currentAnimal = ref("");
const showAnimal = ref(false);
const animalKey = ref(0);

let animalTimer: number | null = null;
let waterRippleId = 0;

// Morandi color palette for water ripples
const morandiColors = [
  "rgba(139, 155, 158, 0.6)",
  "rgba(196, 183, 183, 0.6)",
  "rgba(168, 181, 160, 0.6)",
  "rgba(184, 169, 201, 0.6)",
  "rgba(232, 224, 216, 0.6)",
  "rgba(160, 170, 180, 0.6)",
  "rgba(180, 170, 160, 0.6)"
];

// Cute animal icons
const animalPool = ["🌟", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐢", "🐍", "🦎", "🐙", "🦑", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🐕", "🐩", "🐈", "🐇", "🐁", "🐀", "🐿️", "🦔"];

// Add option
const addOption = () => {
  const text = newOption.value.trim();
  if (text && !options.value.includes(text)) {
    options.value.push(text);
    newOption.value = "";
  }
};

// Delete option
const deleteOption = (idx: number) => {
  options.value.splice(idx, 1);
};

// Start game
const startGame = () => {
  if (options.value.length === 0) {
    uni.showToast({ title: "请先添加选项", icon: "none" });
    return;
  }
  isPlaying.value = true;
  showResult.value = false;
  resultAnimated.value = false;
  displayResult.value = "";
  
  // Start animal animation
  startAnimalAnimation();
};

// Stop game and select random option
const stopGame = () => {
  isPlaying.value = false;
  stopAnimalAnimation();
  
  // Select random option
  const randomIdx = Math.floor(Math.random() * options.value.length);
  selectedOption.value = options.value[randomIdx];
  displayResult.value = selectedOption.value;
  showResult.value = true;
  
  // Trigger animation
  setTimeout(() => {
    resultAnimated.value = true;
  }, 50);
};

// Handle game area tap
const onGameAreaTap = (e: any) => {
  // Create water ripple effect on tap
  let x = 0;
  let y = 0;
  
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX || e.touches[0].pageX || 0;
    y = e.touches[0].clientY || e.touches[0].pageY || 0;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    x = e.changedTouches[0].clientX || e.changedTouches[0].pageX || 0;
    y = e.changedTouches[0].clientY || e.changedTouches[0].pageY || 0;
  } else if (e.detail) {
    x = e.detail.x || e.detail.clientX || 0;
    y = e.detail.y || e.detail.clientY || 0;
  }
  
  if (x > 0 && y > 0) {
    createWaterRipple(x, y);
  }
  
  if (isPlaying.value) {
    stopGame();
  }
};

// Create water ripple effect
const createWaterRipple = (x: number, y: number) => {
  const color = morandiColors[Math.floor(Math.random() * morandiColors.length)];
  
  // Create multiple ripples for more dramatic effect
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const ripple = {
        id: waterRippleId++,
        x: x - 25,
        y: y - 25,
        size: 50 + i * 20,
        opacity: 0.8 - i * 0.2,
        color: color
      };
      waterRipples.value.push(ripple);
      
      // Animate ripple
      const animate = () => {
        const idx = waterRipples.value.findIndex(r => r.id === ripple.id);
        if (idx === -1) return;
        
        const r = waterRipples.value[idx];
        r.size += 6;
        r.opacity -= 0.025;
        r.x -= 3;
        r.y -= 3;
        
        if (r.opacity <= 0) {
          waterRipples.value.splice(idx, 1);
        } else {
          setTimeout(animate, 16);
        }
      };
      setTimeout(animate, 16);
    }, i * 100);
  }
};

// Animal animation - show animals one by one with scale + rotate
const startAnimalAnimation = () => {
  const showNextAnimal = () => {
    if (!isPlaying.value) return;
    
    // Pick random animal
    currentAnimal.value = animalPool[Math.floor(Math.random() * animalPool.length)];
    animalKey.value++;
    showAnimal.value = true;
    
    // Schedule next animal after current one finishes
    animalTimer = setTimeout(() => {
      showAnimal.value = false;
      animalTimer = setTimeout(showNextAnimal, 150);
    }, 1500);
  };
  
  showNextAnimal();
};

const stopAnimalAnimation = () => {
  if (animalTimer) {
    clearTimeout(animalTimer);
    animalTimer = null;
  }
  showAnimal.value = false;
};

// Go home - return to index page
const goHome = () => {
  settings.triggerHaptic();
  stopAnimalAnimation();
  uni.reLaunch({ url: "/pages/index/index" });
};

// Next round - start a new round
const nextRound = () => {
  settings.triggerHaptic();
  isPlaying.value = false;
  showResult.value = false;
  resultAnimated.value = false;
  displayResult.value = "";
  selectedOption.value = "";
  stopAnimalAnimation();
  
  // Start new round after a short delay
  setTimeout(() => {
    startGame();
  }, 300);
};

// Close game - navigate back to home page
const closeGame = () => {
  settings.triggerHaptic();
  stopAnimalAnimation();
  uni.reLaunch({ url: "/pages/index/index" });
};

// Reset game to initial state
const resetGame = () => {
  isPlaying.value = false;
  showResult.value = false;
  resultAnimated.value = false;
  displayResult.value = "";
  selectedOption.value = "";
  stopAnimalAnimation();
};

onLoad(() => {
  // Reset game state when page loads
  resetGame();
});

onShow(() => {
  // Reset game state when page shows
  resetGame();
});

onUnmounted(() => {
  stopAnimalAnimation();
});
</script>

<style scoped>
/* Morandi Color Scheme */
.game-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #B8A9A0 0%, #A8B5A0 50%, #C4B7B7 100%);
}
.dark-mode {
  background: linear-gradient(135deg, #4A4A4A 0%, #3A3A3A 50%, #2D2D2D 100%);
}

/* Top Bar */
.game-topbar {
  position: absolute;
  top: 60rpx;
  left: 30rpx;
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

/* Menu Button - Morandi Style */
.menu-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(184, 169, 160, 0.7), rgba(196, 183, 183, 0.7));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.4);
}
.menu-icon {
  font-size: 40rpx;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* Close Button - Morandi Style */
.close-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(196, 183, 183, 0.7), rgba(184, 169, 160, 0.7));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.4);
}
.close-icon {
  font-size: 36rpx;
  color: #fff;
  font-weight: 300;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-panel {
  width: 80%;
  max-height: 70%;
  background: #fff;
  border-radius: 30rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}
.dark-mode .menu-panel {
  background: #1a1a2e;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.menu-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}
.dark-mode .menu-title {
  color: #f5f5dc;
}
.menu-close {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-mode .menu-close {
  background: #333;
}
.menu-close text {
  font-size: 30rpx;
  color: #666;
}

/* Menu Scroll */
.menu-scroll {
  flex: 1;
  max-height: 400rpx;
}
.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  margin-bottom: 10rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}
.dark-mode .option-item {
  background: #2a2a3e;
}
.option-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}
.dark-mode .option-text {
  color: #f5f5dc;
}
.option-delete {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.option-delete text {
  color: #fff;
  font-size: 24rpx;
}
.empty-options {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

/* Add Option */
.add-option-row {
  display: flex;
  gap: 15rpx;
  margin-top: 20rpx;
}
.add-option-input {
  flex: 1;
  height: 70rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  font-size: 26rpx;
  background: #fff;
}
.dark-mode .add-option-input {
  background: #2a2a3e;
  border-color: #444;
  color: #f5f5dc;
}
.add-option-btn {
  padding: 0 30rpx;
  height: 70rpx;
  background: #667eea;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-option-btn text {
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

/* Game Area */
.game-area {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Water Ripple Effect */
.water-ripple {
  position: absolute;
  border-radius: 50%;
  border: 3rpx solid;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: waterRipple 1.5s ease-out forwards;
}

@keyframes waterRipple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

/* Game Ripple Effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, 0.6);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Floating Items */
.floating-item {
  position: absolute;
  pointer-events: none;
}

/* Play Button - Morandi Style */
.play-btn {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(184, 169, 160, 0.8), rgba(196, 183, 183, 0.8));
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
  animation: pulse 2s ease-in-out infinite;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.play-icon {
  font-size: 60rpx;
  color: #fff;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}
.play-text {
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: 4rpx;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

/* Result Display - Morandi Style */
.result-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.result-card {
  background: linear-gradient(135deg, rgba(184, 169, 160, 0.95), rgba(196, 183, 183, 0.95));
  border-radius: 30rpx;
  padding: 60rpx 80rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  transform: scale(0);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.result-card.result-show {
  transform: scale(1);
  opacity: 1;
}
.dark-mode .result-card {
  background: linear-gradient(135deg, rgba(74, 74, 74, 0.95), rgba(58, 58, 58, 0.95));
}
.result-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  text-align: center;
  white-space: pre-line;
  line-height: 1.4;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}
.dark-mode .result-text {
  color: #f5f5dc;
}

/* Playing Hint */
.playing-hint {
  position: absolute;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
}
.playing-hint text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* Reset Button - Morandi Style */
.reset-btn {
  margin-top: 40rpx;
  padding: 20rpx 60rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, rgba(168, 181, 160, 0.8), rgba(184, 169, 201, 0.8));
  backdrop-filter: blur(10px);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
}
.reset-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* Game Animal Animation */
.game-animal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
  animation: animalCycle 1.5s ease-in-out forwards;
}

.animal-emoji {
  font-size: 120rpx;
}

@keyframes animalCycle {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    transform: translate(-50%, -50%) scale(1.2) rotate(60deg);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1) rotate(180deg);
    opacity: 1;
  }
  85% {
    transform: translate(-50%, -50%) scale(1.2) rotate(300deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0) rotate(360deg);
    opacity: 0;
  }
}

/* Result Popup */
.result-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
}

.result-popup {
  background: linear-gradient(135deg, rgba(184, 169, 160, 0.97), rgba(196, 183, 183, 0.97));
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  width: 75%;
  max-width: 500rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
  transform: scale(0);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-popup.popup-show {
  transform: scale(1);
  opacity: 1;
}

.dark-mode .result-popup {
  background: linear-gradient(135deg, rgba(74, 74, 74, 0.97), rgba(58, 58, 58, 0.97));
}

.result-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15rpx;
  font-weight: 500;
}

.result-text {
  font-size: 44rpx;
  font-weight: 700;
  color: #fff;
  text-align: center;
  white-space: pre-line;
  line-height: 1.4;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
  margin-bottom: 40rpx;
}

.dark-mode .result-text {
  color: #f5f5dc;
}

.result-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.action-btn {
  flex: 1;
  padding: 22rpx 0;
  border-radius: 25rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-know {
  background: rgba(255, 255, 255, 0.25);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  color: #fff;
}

.action-next {
  background: linear-gradient(135deg, rgba(168, 181, 160, 0.9), rgba(184, 169, 201, 0.9));
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  color: #fff;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.15);
}
</style>
