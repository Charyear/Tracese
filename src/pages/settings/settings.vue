<template>
  <view class="settings-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Navbar -->
    <view class="edit-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="nav-back" @tap="goBack" aria-label="返回" role="button">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">设置</text>
        <view style="width: 60rpx;" />
      </view>
    </view>

    <scroll-view class="settings-scroll" scroll-y>

      <!-- Appearance -->
      <view class="section-header"><text>外观</text></view>
      <view class="settings-group">
        <view class="settings-row" @tap="settingsStore.toggleTheme" aria-label="切换深色模式" role="switch" :aria-checked="isDark">
          <view class="row-left">
            <text class="row-icon">{{ isDark ? '🌙' : '☀️' }}</text>
            <text class="row-label">深色模式</text>
          </view>
          <view class="switch-track" :class="{ 'switch-on': isDark }">
            <view class="switch-thumb" :class="{ 'thumb-on': isDark }" />
          </view>
        </view>
        <view class="divider" />
        <view class="settings-row" @tap="settingsStore.toggleHaptic" aria-label="切换振动反馈" role="switch" :aria-checked="settingsStore.hapticEnabled">
          <view class="row-left">
            <text class="row-icon">📳</text>
            <text class="row-label">振动反馈</text>
          </view>
          <view class="switch-track" :class="{ 'switch-on': settingsStore.hapticEnabled }">
            <view class="switch-thumb" :class="{ 'thumb-on': settingsStore.hapticEnabled }" />
          </view>
        </view>
      </view>

      <!-- Data -->
      <view class="section-header"><text>数据管理</text></view>
      <view class="settings-group">
        <view class="settings-row" @tap="exportData" aria-label="导出数据" role="button">
          <view class="row-left">
            <text class="row-icon">📤</text>
            <text class="row-label">导出数据</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
        <view class="divider" />
        <view class="settings-row" @tap="importData" aria-label="导入数据" role="button">
          <view class="row-left">
            <text class="row-icon">📥</text>
            <text class="row-label">导入数据</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
        <view class="divider" />
        <view class="settings-row" @tap="clearCache" aria-label="清除缓存" role="button">
          <view class="row-left">
            <text class="row-icon">🧹</text>
            <text class="row-label">清除缓存</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <!-- Stats -->
      <view class="section-header"><text>统计</text></view>
      <view class="settings-group">
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-val">{{ totalCards }}</text>
            <text class="stat-label">总记录</text>
          </view>
          <view class="stat-item">
            <text class="stat-val">{{ habitCount }}</text>
            <text class="stat-label">习惯</text>
          </view>
          <view class="stat-item">
            <text class="stat-val">{{ countdownCount }}</text>
            <text class="stat-label">倒计日</text>
          </view>
          <view class="stat-item">
            <text class="stat-val">{{ diaryCount }}</text>
            <text class="stat-label">日记</text>
          </view>
        </view>
      </view>

      <!-- Reminder Settings -->
      <view class="section-header"><text>提醒设置</text></view>
      <view class="settings-group">
        <view class="settings-row" @tap="checkReminders" aria-label="检查提醒" role="button">
          <view class="row-left">
            <text class="row-icon">🔔</text>
            <text class="row-label">检查提醒</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
        <view class="divider" />
        <view class="settings-row" aria-label="已启用提醒数量">
          <view class="row-left">
            <text class="row-icon">📋</text>
            <text class="row-label">已启用提醒</text>
          </view>
          <text class="row-value">{{ reminderCount }}个</text>
        </view>
        <view class="divider" />
        <view class="settings-row" @tap="clearAllReminders" aria-label="清除所有提醒" role="button">
          <view class="row-left">
            <text class="row-icon">🗑️</text>
            <text class="row-label">清除所有提醒</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <!-- About -->
      <view class="section-header"><text>关于</text></view>
      <view class="settings-group">
        <view class="settings-row" aria-label="版本号">
          <view class="row-left">
            <text class="row-icon">✦</text>
            <text class="row-label">版本</text>
          </view>
          <text class="row-value">1.0.0</text>
        </view>
        <view class="divider" />
        <view class="settings-row" @tap="showPrivacy" aria-label="隐私政策" role="button">
          <view class="row-left">
            <text class="row-icon">🔒</text>
            <text class="row-label">隐私政策</text>
          </view>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <view style="height: 100rpx;" />
    </scroll-view>

    <!-- Import textarea popup -->
    <view v-if="showImportBox" class="overlay" @tap="showImportBox = false">
      <view class="bottom-sheet" @tap.stop>
        <view class="sheet-handle" />
        <text class="sheet-title">粘贴备份 JSON 内容</text>
        <textarea
          class="import-textarea"
          v-model="importJson"
          placeholder="粘贴从导出功能复制的 JSON 数据..."
          placeholder-class="placeholder-text"
          aria-label="导入的JSON数据"
        />
        <view class="import-btn" @tap="doImport">
          <text class="import-btn-text">确认导入</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSettingsStore } from "../../store/settings";
import { useRecordsStore } from "../../store/records";
import { useBackupStore } from "../../store/backup";
import { useStatusBarHeight } from "../../composables/useStatusBarHeight";

const settingsStore = useSettingsStore();
const recordsStore = useRecordsStore();
const backupStore = useBackupStore();

const statusBarHeight = useStatusBarHeight();
const showImportBox = ref(false);
const importJson = ref("");

const isDark = computed(() => settingsStore.theme === "dark");

// 性能优化：单次遍历计算所有统计
const stats = computed(() => {
  const cards = recordsStore.cards;
  let habit = 0, countdown = 0, diary = 0;
  for (const card of cards) {
    if (card.type === "habit") habit++;
    else if (card.type === "countdown") countdown++;
    else if (card.type === "diary") diary++;
  }
  return { total: cards.length, habit, countdown, diary };
});

const totalCards = computed(() => stats.value.total);
const habitCount = computed(() => stats.value.habit);
const countdownCount = computed(() => stats.value.countdown);
const diaryCount = computed(() => stats.value.diary);

const goBack = () => {
  settingsStore.triggerHaptic();
  uni.navigateBack();
};

const exportData = () => {
  const json = backupStore.exportBackup();
  if (!json) {
    uni.showToast({ title: "导出失败", icon: "none" });
    return;
  }
  
  // Try to save as file first, fallback to clipboard
  try {
    const fs = uni.getFileSystemManager();
    const filePath = `${uni.env.USER_DATA_PATH}/tracese_backup_${Date.now()}.json`;
    
    fs.writeFileSync(filePath, json, 'utf8');
    
    // Share or save the file
    uni.showActionSheet({
      itemList: ["保存到设备", "复制到剪贴板"],
      success(res) {
        if (res.tapIndex === 0) {
          // Save to device documents
          uni.saveFile({
            tempFilePath: filePath,
            success(saveRes) {
              uni.showToast({ title: "已保存到设备", icon: "success" });
            },
            fail() {
              // Fallback: copy to clipboard
              copyToClipboard(json);
            }
          });
        } else if (res.tapIndex === 1) {
          copyToClipboard(json);
        }
      }
    });
  } catch (e) {
    // Fallback to clipboard
    copyToClipboard(json);
  }
};

const copyToClipboard = (text: string) => {
  uni.setClipboardData({
    data: text,
    success() {
      uni.showToast({ title: "已复制到剪贴板", icon: "success" });
    }
  });
};

const importData = () => {
  // Show options for import source
  uni.showActionSheet({
    itemList: ["从文件导入", "粘贴文本导入"],
    success(res) {
      if (res.tapIndex === 0) {
        importFromFile();
      } else if (res.tapIndex === 1) {
        importJson.value = "";
        showImportBox.value = true;
      }
    }
  });
};

const importFromFile = () => {
  // Choose file from device
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json'],
    success(res) {
      const file = res.tempFiles[0];
      const fs = uni.getFileSystemManager();
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        importJson.value = content as string;
        showImportBox.value = true;
      } catch (e) {
        uni.showToast({ title: "读取文件失败", icon: "none" });
      }
    },
    fail() {
      // User cancelled or API not available
      importJson.value = "";
      showImportBox.value = true;
    }
  });
};

const doImport = () => {
  const result = backupStore.importBackup(importJson.value);
  showImportBox.value = false;
  uni.showToast({ title: result.message, icon: result.success ? "success" : "none" });
};

const clearCache = () => {
  uni.showModal({
    title: "清除缓存",
    content: "此操作将删除所有本地数据，无法恢复！",
    confirmColor: "#E57373",
    success(res) {
      if (res.confirm) {
        backupStore.clearAllData();
        uni.showToast({ title: "已清除", icon: "success" });
      }
    }
  });
};

const showPrivacy = () => {
  uni.showModal({
    title: "隐私政策",
    content: "Tracese不收集您的任何个人信息。所有数据仅储存在您的设备本地，不会上传至任何服务器。",
    showCancel: false,
    confirmText: "我知道了"
  });
};

// Reminder settings
const reminderCount = computed(() => recordsStore.getCardsWithReminders().length);

const checkReminders = async () => {
  uni.showLoading({ title: "检查中..." });
  await recordsStore.checkReminders();
  uni.hideLoading();
  uni.showToast({ title: "提醒检查完成", icon: "success" });
};

const clearAllReminders = () => {
  uni.showModal({
    title: "清除所有提醒",
    content: "确定要清除所有卡片的提醒设置吗？此操作不可撤销。",
    confirmColor: "#E57373",
    success(res) {
      if (res.confirm) {
        recordsStore.cards.forEach(card => {
          if (card.reminder) {
            card.reminder.enabled = false;
          }
        });
        uni.showToast({ title: "已清除所有提醒", icon: "success" });
      }
    }
  });
};


</script>

<style scoped>
.settings-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #EFF5F8;
}
.dark-mode .settings-page { background: #000000; }

.edit-navbar {
  background: transparent;
  border-bottom: 1rpx solid rgba(92,124,138,0.14);
}
.dark-mode .edit-navbar { border-color: #1A1A1A; background: #000000; }
.navbar-row {
  display: flex; align-items: center;
  height: 92rpx; padding: 0 24rpx;
}
.nav-back { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 52rpx; color: #5C7C8A; font-weight: 300; }
.dark-mode .back-icon { color: #F5F5DC; }
.nav-title { flex: 1; text-align: center; font-size: 34rpx; font-weight: 800; color: #1F3040; }
.dark-mode .nav-title { color: #F5F5DC; }

.settings-scroll {
  flex: 1;
  background: #EFF5F8;
}
.dark-mode .settings-scroll { background: #000000; }

.section-header {
  padding: 24rpx 28rpx 12rpx;
  font-size: 22rpx; font-weight: 800;
  color: #7B8A99;
  letter-spacing: 1.5rpx;
  text-transform: uppercase;
}
.dark-mode .section-header { color: #AAAAAA; }

.settings-group {
  margin: 0 20rpx 18rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  overflow: hidden;
  border: 1rpx solid rgba(92,124,138,0.1);
  box-shadow: 0 24rpx 48rpx rgba(92,124,138,0.08);
}
.dark-mode .settings-group { background: #000000; border-color: #1A1A1A; box-shadow: none; }

.settings-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 28rpx;
}
.settings-row:active { background: rgba(92,124,138,0.08); }
.dark-mode .settings-row:active { background: rgba(255,255,255,0.03); }

.row-left { display: flex; align-items: center; gap: 18rpx; }
.row-icon {
  width: 62rpx; height: 62rpx;
  border-radius: 22rpx;
  background: rgba(92,124,138,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx;
}
.dark-mode .row-icon { background: rgba(255,255,255,0.05); }
.row-label { font-size: 30rpx; color: #1F3040; font-weight: 700; }
.dark-mode .row-label { color: #F5F5DC; }
.row-value { font-size: 28rpx; color: #7B8A99; }
.dark-mode .row-value { color: #B8B8B8; }
.row-arrow { font-size: 36rpx; color: #C8C8CE; }
.dark-mode .row-arrow { color: #666666; }

/* Toggle switch */
.switch-track {
  width: 96rpx; height: 56rpx;
  border-radius: 56rpx; background: #E0E0E0;
  position: relative; transition: background 0.25s;
}
.dark-mode .switch-track { background: #2A2A2A; }
.switch-on { background: #5C7C8A; }
.switch-thumb {
  position: absolute; top: 6rpx; left: 6rpx;
  width: 44rpx; height: 44rpx;
  border-radius: 50%; background: #fff;
  transition: left 0.25s; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
}
.thumb-on { left: 46rpx; }

.divider {
  height: 1rpx; background: #F5F5F7;
  margin: 0 28rpx;
}
.dark-mode .divider { background: #1A1A1A; }

/* Stats */
.stats-row {
  display: flex;
  gap: 18rpx;
  padding: 24rpx;
}
.stat-item {
  flex: 1;
  border-radius: 28rpx;
  padding: 24rpx;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}
.dark-mode .stat-item { background: #000000; border: 1rpx solid #1A1A1A; }
.stat-val { font-size: 44rpx; font-weight: 800; color: #5C7C8A; }
.dark-mode .stat-val { color: #7BAFC0; }
.stat-label { font-size: 22rpx; color: #7B8A99; }
.dark-mode .stat-label { color: #B8B8B8; }

/* Overlay */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 300; display: flex; align-items: flex-end;
}
.bottom-sheet {
  width: 100%; background: #FFFFFF;
  border-radius: 40rpx 40rpx 0 0;
  padding: 20rpx 32rpx 80rpx;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.dark-mode .bottom-sheet { background: #000000; border-top: 1rpx solid #1A1A1A; }
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.sheet-handle {
  width: 80rpx; height: 8rpx;
  background: #E0E0E0; border-radius: 10rpx;
  margin: 0 auto 24rpx;
}
.dark-mode .sheet-handle { background: #2A2A2A; }
.sheet-title {
  font-size: 30rpx; font-weight: 700; color: #333;
  display: block; text-align: center; margin-bottom: 24rpx;
}
.dark-mode .sheet-title { color: #F5F5DC; }
.import-textarea {
  width: 100%; min-height: 220rpx;
  background: #F3F7FB; border-radius: 28rpx;
  padding: 24rpx; font-size: 26rpx;
  color: #1F3040; margin-bottom: 24rpx;
  border: 1rpx solid rgba(92,124,138,0.12);
}
.dark-mode .import-textarea {
  background: #0A0A0A;
  color: #F5F5DC;
  border-color: #1A1A1A;
}
.placeholder-text { color: #A7B0BB; }
.dark-mode .placeholder-text { color: #666666; }
.import-btn {
  background: #5C7C8A; border-radius: 28rpx;
  padding: 26rpx; text-align: center;
}
.import-btn:active { opacity: 0.8; }
.import-btn-text { font-size: 28rpx; color: #fff; font-weight: 700; }
</style>
