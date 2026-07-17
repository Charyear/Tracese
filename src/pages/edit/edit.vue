<template>
  <view class="edit-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Navbar -->
    <view class="edit-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-row">
        <view class="nav-back" @tap="goBack" aria-label="返回" role="button">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">{{ isEdit ? "编辑记录" : "新建" + typeLabel }}</text>
      </view>
    </view>

    <scroll-view class="edit-scroll" scroll-y>
      <!-- Color & Icon Row -->
      <view class="section">
        <text class="field-label">图标与颜色</text>
        <view class="icon-color-row">
          <!-- Icon selector -->
          <view class="icon-selector" :class="`bg-${form.colorClass}`" @tap="showIconPicker = true" aria-label="选择图标" role="button">
            <text class="icon-display">{{ form.icon }}</text>
          </view>
          <!-- Color picker circles -->
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

      <!-- Title input -->
      <view class="section">
        <text class="field-label">标题</text>
        <input
          class="field-input"
          v-model="form.title"
          placeholder="给这条记录取个名字..."
          placeholder-class="placeholder-text"
          maxlength="30"
          aria-label="记录标题"
        />
      </view>

      <!-- Custom Settings Entry Button -->
      <view class="section custom-settings-entry" @tap="goToCustomSettings" aria-label="自定义设置" role="button">
        <view class="settings-entry-row">
          <view class="settings-entry-left">
            <text class="settings-entry-icon">🎨 自定义设置</text>
          </view>
        </view>
      </view>

      <!-- Type-specific fields -->
      <view class="section" v-if="form.type === 'countdown'">
        <text class="field-label">目标日期</text>
        <picker
          mode="date"
          :value="form.targetDate"
          @change="(e: any) => form.targetDate = e.detail.value"
        >
          <view class="field-picker">
            <text class="picker-value">{{ form.targetDate || "点击选择日期" }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="section" v-if="form.type === 'habit'">
        <text class="field-label">每日打卡次数</text>
        <view class="seg-control">
          <view
            v-for="n in dailyLimitOptions"
            :key="n"
            class="seg-item"
            :class="{ 'seg-active': form.dailyLimit === n }"
            @tap="form.dailyLimit = n"
          >
            <text>{{ n }}次</text>
          </view>
        </view>
        <text class="field-label" style="margin-top: 24rpx;">打卡间隙</text>
        <view class="seg-control">
          <view
            v-for="o in intervalOptions"
            :key="o.key"
            class="seg-item"
            :class="{ 'seg-active': form.minIntervalMinutes === o.key }"
            @tap="form.minIntervalMinutes = o.key"
          >
            <text>{{ o.label }}</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="form.type === 'asset'">
        <text class="field-label">金额</text>
        <input
          class="field-input"
          v-model.number="form.amount"
          type="digit"
          placeholder="0.00"
          placeholder-class="placeholder-text"
          aria-label="金额"
        />
        <text class="field-label" style="margin-top: 24rpx;">{{ form.flowType === 'income' ? '来源' : '去处' }}</text>
        <view class="seg-control" style="position: relative;">
          <!-- 滑动指示器 -->
          <view class="slider-indicator" :class="`indicator-${form.flowType}`"></view>
          <view
            v-for="o in flowOptions"
            :key="o.key"
            class="seg-item"
            :class="{ 
              'seg-active': form.flowType === o.key,
              'income-active': form.flowType === 'income',
              'expense-active': form.flowType === 'expense'
            }"
            @tap="form.flowType = o.key"
          >
            <text>{{ o.label }}</text>
          </view>
        </view>
        
        <text class="field-label" style="margin-top: 24rpx;">{{ form.flowType === 'income' ? '来源' : '去处' }}</text>
        <picker 
          mode="selector"
          :range="sources" 
          :value="form.sourceIndex" 
          @change="(e: any) => {
            form.sourceIndex = e.detail.value;
            form.source = sources[e.detail.value];
          }"
        >
          <view class="field-picker">
            <text class="picker-value">{{ form.source || sources[0] }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        
        <text class="field-label" style="margin-top: 24rpx;">日期</text>
        <picker
          mode="date"
          :value="form.date"
          @change="(e: any) => form.date = e.detail.value"
        >
          <view class="field-picker">
            <text class="picker-value">{{ form.displayDate || "点击选择日期" }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="section" v-if="form.type === 'subscription'">
        <view class="inline-fields">
          <view class="field-group flex-1">
            <text class="field-label">费用</text>
            <input
              class="field-input"
              v-model.number="form.price"
              type="digit"
              placeholder="¥ 金额"
              placeholder-class="placeholder-text"
              aria-label="订阅费用"
            />
          </view>
          <view class="field-group flex-1" style="margin-left: 16rpx;">
            <text class="field-label">周期</text>
            <picker 
              mode="selector"
              :range="cycleOptions"
              range-key="label"
              :value="form.cycleIndex"
              @change="(e: any) => {
                form.cycleIndex = e.detail.value;
                form.billingCycle = cycleOptions[e.detail.value].key;
              }"
            >
              <view class="field-picker">
                <text class="picker-value">{{ cycleOptions[form.cycleIndex]?.label || '1个月' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>
        <text class="field-label" style="margin-top: 24rpx;">最近一次下单日期</text>
        <picker
          mode="date"
          :value="form.lastOrderDate"
          @change="(e: any) => form.lastOrderDate = e.detail.value"
        >
          <view class="field-picker">
            <text class="picker-value">{{ form.lastOrderDate || "点击选择日期" }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        <view v-if="form.lastOrderDate" class="next-billing-info">
          <text class="next-billing-label">下次续费时间：</text>
          <text class="next-billing-date">{{ computedNextBillingDate }}</text>
        </view>
      </view>

      <view class="section" v-if="form.type === 'diary'">
        <text class="field-label">正文</text>
        <textarea
          class="field-textarea"
          v-model="form.content"
          placeholder="记录今天的心情、想法..."
          placeholder-class="placeholder-text"
          auto-height
          :maxlength="2000"
          aria-label="日记内容"
          :readonly="isDiaryLocked"
        />
        <!-- Mood & Weather Row -->
        <view class="diary-meta-row">
          <view class="diary-meta-item">
            <text class="field-label">心情</text>
            <view class="mood-selector">
              <view
                v-for="m in moodOptions"
                :key="m"
                class="mood-option"
                :class="{ 'mood-active': form.mood === m }"
                @tap="!isDiaryLocked && (form.mood = m)"
              >
                <text class="mood-emoji">{{ m }}</text>
                <view class="mood-checkbox" :class="{ 'checked': form.mood === m }">
                  <text v-if="form.mood === m" class="check-mark">✓</text>
                </view>
              </view>
            </view>
          </view>
          <view class="diary-meta-item">
            <text class="field-label">天气</text>
            <view class="weather-selector">
              <view
                v-for="w in weatherOptions"
                :key="w"
                class="weather-option"
                :class="{ 'weather-active': form.weather === w }"
                @tap="!isDiaryLocked && (form.weather = w)"
              >
                <text class="weather-emoji">{{ w }}</text>
                <view class="weather-checkbox" :class="{ 'checked': form.weather === w }">
                  <text v-if="form.weather === w" class="check-mark">✓</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- Images -->
        <view class="diary-images-section">
          <text class="field-label">照片</text>
          <view class="images-grid">
            <view v-for="(img, idx) in form.images" :key="idx" class="image-item">
              <image :src="img.url" mode="aspectFill" class="diary-image" />
              <view class="image-remove" @tap="removeImage(idx)" v-if="!isDiaryLocked">
                <text class="image-remove-icon">×</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Birthday Form -->
      <view class="section" v-if="form.type === 'birthday'">
        <text class="field-label">出生日期</text>
        <picker
          mode="date"
          :value="form.birthDate"
          @change="(e: any) => form.birthDate = e.detail.value"
        >
          <view class="field-picker">
            <text class="picker-value">{{ form.birthDate || "点击选择日期" }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- Plan/Checklist Form -->
      <view class="section" v-if="form.type === 'plan'">
        <text class="field-label">实施日期</text>
        <picker
          mode="date"
          :value="form.deadline"
          @change="(e: any) => form.deadline = e.detail.value"
        >
          <view class="field-picker">
            <text class="picker-value">{{ form.deadline || "点击选择实施日期" }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
        <text class="field-label" style="margin-top: 24rpx;">计划步骤</text>
        <view v-for="(step, sIdx) in form.steps" :key="sIdx" class="step-input-row" :class="{ 'step-locked': isStepLocked(step) }">
          <view class="step-checkbox" :class="{ 'step-completed': step.completed }" @tap="!isStepLocked(step) && (step.completed = !step.completed)">
            <text v-if="step.completed" class="step-check-mark">✓</text>
          </view>
          <view class="step-content">
            <input
              class="step-text-input"
              v-model="step.text"
              placeholder="步骤描述..."
              placeholder-class="placeholder-text"
              aria-label="计划步骤描述"
              :readonly="isStepLocked(step)"
            />
            <view class="step-time-row">
              <text class="step-time-label">时间</text>
              <picker
                mode="time"
                :value="step.time"
                @change="(e: any) => step.time = e.detail.value"
              >
                <view class="step-time-picker">
                  <text class="step-time-value">{{ step.time || "点击选择时间" }}</text>
                  <text class="step-time-arrow">›</text>
                </view>
              </picker>
              <text v-if="isStepLocked(step)" class="step-locked-icon">🔒</text>
            </view>
          </view>
          <view class="step-delete" @tap="removePlanStep(sIdx)" v-if="!isStepLocked(step)">
            <text class="step-delete-icon">×</text>
          </view>
        </view>
        <view class="add-step-btn" @tap="addPlanStep">
          <text class="add-step-btn-text">+ 添加步骤</text>
        </view>
      </view>

      <!-- Notes -->
      <view class="section">
        <text class="field-label">备注</text>
        <textarea
          class="field-textarea"
          v-model="form.notes"
          placeholder="添加备注（可选）"
          placeholder-class="placeholder-text"
          :maxlength="200"
          :auto-height="true"
          aria-label="备注"
        />
      </view>

      <!-- Delete button for edit mode -->
      <view class="section" v-if="isEdit">
        <view class="delete-btn" @tap="onDelete" aria-label="删除记录" role="button">
          <text class="delete-text">删除记录</text>
        </view>
      </view>

      <view style="height: 180rpx;" />
    </scroll-view>

    <!-- Bottom Save Bar -->
    <view class="edit-footer">
      <view class="save-button" @tap="saveCard" aria-label="保存" role="button">
        <text class="save-button-text">{{ saveButtonText }}</text>
      </view>
    </view>

    <!-- Icon Picker Bottom Sheet -->
    <view v-if="showIconPicker" class="overlay" @tap="showIconPicker = false">
      <view class="bottom-sheet" @tap.stop>
        <view class="sheet-handle" />
        <text class="sheet-title">选择图标</text>
        <view class="icon-grid">
          <view
            v-for="icon in iconOptions"
            :key="icon"
            class="icon-option"
            :class="{ 'icon-selected': form.icon === icon }"
            @tap="selectIcon(icon)"
          >
            <text class="icon-opt-text">{{ icon }}</text>
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
import type { AnyCard, CardPresetStyle, ReminderConfig } from "../../types/card";
import type { EditFormState } from "../../types/form";
import { getDefaultReminderConfig } from "../../utils/reminder";
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

const records = useRecordsStore();
const settings = useSettingsStore();

const statusBarHeight = useStatusBarHeight();
const showIconPicker = ref(false);
const isDark = computed(() => settings.theme === "dark");
// Read query params
const query = ref<Record<string, string>>({});
const isEdit = computed(() => !!query.value.id);
const isDiaryLocked = computed(() => {
  if (form.type !== 'diary') return false;
  const card = records.cards.find(c => c.id === query.value.id);
  return card && (card as any).editCount >= 2;
});

// Check if a plan step is locked (its time has passed)
const isStepLocked = (step: any): boolean => {
  if (!step.time || !form.deadline) return false;
  const now = new Date();
  const stepDateTime = new Date(form.deadline + 'T' + step.time + ':00');
  return stepDateTime < now;
};

// Form state
const form = reactive<EditFormState>({
  type: "habit",
  title: "",
  icon: "🔥",
  colorClass: "orange",
  notes: "",
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
  },
  // habit
  punches: [],
  totalCount: 0,
  dailyLimit: 1,
  minIntervalMinutes: 0,
  streak: 0,
  longestStreak: 0,
  // countdown
  targetDate: "",
  // diary
  content: "",
  tags: [] as { text: string; color?: string }[],
  images: [] as { url: string; width?: number; height?: number }[],
  mood: "",
  weather: "",
  // asset
  amount: 0,
  flowType: "expense",
  category: "",
  source: "",
  sourceIndex: 0,
  date: "",
  budget: 0,
  // subscription
  price: 0,
  billingCycle: "monthly",
  cycleIndex: 2, // 默认1个月
  lastOrderDate: "",
  nextBillingDate: "",
  totalCost: 0,
  reminderDays: [1, 3, 7],
  startDate: "",
  // birthday
  birthDate: "",
  // plan
  steps: [] as { text: string; completed: boolean; dependencies?: number[]; deadline?: string; progress?: number }[],
  deadline: "",
  progress: 0,
  // reminder
  reminder: {
    enabled: false,
    reminderTime: '09:00',
    reminderType: 'once' as const,
    countdownDaysBefore: [1, 3],
    birthdayDaysBefore: [1, 3],
    subscriptionDaysBefore: [1, 3, 7],
    planDaysBefore: [1, 3, 7],
    habitRemindTime: '21:00',
    diaryRemindTime: '21:00',
  }
});

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    habit: "习惯",
    countdown: "倒计日",
    diary: "日记",
    asset: "资产",
    subscription: "订阅",
    birthday: "生日",
    plan: "计划",
  };
  return map[form.type] ?? "";
});

const defaultIconMap: Record<string, string> = {
  habit: "🔥",
  countdown: "📅",
  diary: "📓",
  asset: "💰",
  subscription: "🔔",
  birthday: "🎂",
  plan: "📋"
};

const defaultColorMap: Record<string, string> = {
  habit: "orange",
  countdown: "blue",
  diary: "green",
  asset: "cream",
  subscription: "purple",
  birthday: "pink",
  plan: "blue"
};


const saveButtonText = computed(() => isEdit.value ? "保存" : "添加");

const maxPinnedCards = MAX_PINNED_CARDS;

// 订阅下次续费时间计算
const computedNextBillingDate = computed(() => {
  if (!form.lastOrderDate) return "";
  
  const lastDate = new Date(form.lastOrderDate);
  let nextDate = new Date(lastDate);
  
  switch (form.billingCycle) {
    case "daily":
      nextDate.setDate(lastDate.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(lastDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(lastDate.getMonth() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(lastDate.getMonth() + 3);
      break;
    case "yearly":
      nextDate.setFullYear(lastDate.getFullYear() + 1);
      break;
  }
  
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[nextDate.getDay()];
  
  return `${year}年${month}月${day}日 星期${weekDay}`;
});

// 资产相关计算属性
const sources = computed(() => {
  return form.flowType === 'income' ? incomeSources : expenseSources;
});

const displayDate = computed(() => {
  if (!form.date) return "";
  const date = new Date(form.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[date.getDay()];
  return `${year}年${month}月${day}日 星期${weekDay}`;
});



// Plan step management
const addPlanStep = () => {
  form.steps.push({ text: "", completed: false, dependencies: [], deadline: "", progress: 0 });
};

const removePlanStep = (index: number) => {
  form.steps.splice(index, 1);
  // Update dependencies
  form.steps.forEach(step => {
    if (step.dependencies) {
      step.dependencies = step.dependencies.filter(d => d !== index).map(d => d > index ? d - 1 : d);
    }
  });
};

// Diary image functions
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - form.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const newImages = res.tempFilePaths.map(url => ({ url }));
      form.images.push(...newImages);
    }
  });
};

const removeImage = (index: number) => {
  form.images.splice(index, 1);
};

const moodOptions = ["😊", "😢", "😡", "😴", "🤔", "😍"];
const weatherOptions = ["☀️", "⛅", "☁️", "🌧️", "⛈️", "🌨️"];

const colorOptions = [
  { key: "orange" }, { key: "blue" }, { key: "green" },
  { key: "pink" }, { key: "purple" }, { key: "cream" }
];

const flowOptions = [
  { key: "expense", label: "支出" },
  { key: "income", label: "收入" }
];

const incomeSources = [
  "工资",
  "奖金",
  "投资收益",
  "兼职收入",
  "礼金",
  "其他收入"
];

const expenseSources = [
  "餐饮",
  "购物",
  "交通",
  "娱乐",
  "医疗",
  "教育",
  "房租",
  "水电费",
  "其他支出"
];

const dailyLimitOptions = [1, 2, 3, 4, 5];

const intervalOptions = [
  { key: 0, label: "不限" },
  { key: 30, label: "30分钟" },
  { key: 60, label: "1小时" },
  { key: 120, label: "2小时" },
  { key: 240, label: "4小时" }
];

const cycleOptions = [
  { key: "daily", label: "1天" },
  { key: "weekly", label: "7天" },
  { key: "monthly", label: "1个月" },
  { key: "quarterly", label: "一季度" },
  { key: "yearly", label: "一年" }
];

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
  const pages = getCurrentPages();
  if (pages.length > 1 && pages[pages.length - 2]?.route === 'pages/custom-settings/custom-settings') {
    uni.navigateBack({ delta: 2 });
  } else {
    uni.navigateBack();
  }
};

const goToCustomSettings = () => {
  settings.triggerHaptic();
  
  // Only allow going to custom settings if this is an existing card or one that's just been saved
  if (!query.value.id) {
    uni.showToast({ title: "请先保存卡片后再进行自定义设置", icon: "none" });
    return;
  }

  uni.navigateTo({
    url: `/pages/custom-settings/custom-settings?id=${query.value.id}`
  });
};

const goToStyleLibrary = () => {
  settings.triggerHaptic();
  if (!query.value.id) {
    // 保存当前卡片获取id后再跳转
    uni.showToast({ title: "请先保存卡片", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/style-library/style-library?id=${query.value.id}`
  });
};



const resetForm = () => {
  form.type = "habit";
  form.title = "";
  form.icon = "🔥";
  form.colorClass = "orange";
  form.notes = "";
  form.displayStyle = "soft";
  form.customStyle = getDefaultCustomStyle();
  form.punches = [];
  form.totalCount = 0;
  form.dailyLimit = 1;
  form.minIntervalMinutes = 0;
  form.targetDate = "";
  form.isPinned = false;
  form.content = "";
  form.amount = 0;
  form.flowType = "expense";
  form.category = "";
  form.source = "";
  form.sourceIndex = 0;
  form.date = "";
  form.price = 0;
  form.billingCycle = "monthly";
  form.cycleIndex = 2;
  form.lastOrderDate = "";
  form.nextBillingDate = "";
  form.birthDate = "";
  form.steps = [];
  form.deadline = "";
  // Reset reminder to default
  const defaults = getDefaultReminderConfig(form.type);
  form.reminder = { ...defaults, enabled: false };
};

const applyTypeDefaults = (type: string) => {
  form.type = type;
  form.icon = defaultIconMap[type] ?? "✦";
  form.colorClass = defaultColorMap[type] ?? "blue";
  if (type === "plan") {
    form.steps = [{ text: "", completed: false }];
  }
  if (type === "asset") {
    form.flowType = "expense";
    form.source = expenseSources[0];
    form.sourceIndex = 0;
    form.date = new Date().toISOString().split('T')[0];
  }
};

const fillFormFromCard = (card: AnyCard) => {
  form.type = card.type;
  form.title = card.title;
  form.icon = card.icon;
  form.colorClass = card.colorClass;
  form.notes = card.notes ?? "";
  form.displayStyle = card.displayStyle ?? "soft";
  form.isPinned = card.isPinned ?? false;
  form.customStyle = {
    ...getDefaultCustomStyle(),
    ...(card.customStyle ?? {})
  };

  const currentCard = card as any;
  form.punches = currentCard.punches ? [...currentCard.punches] : [];
  form.totalCount = currentCard.totalCount ?? form.punches.length;
  form.dailyLimit = currentCard.dailyLimit ?? 1;
  form.minIntervalMinutes = currentCard.minIntervalMinutes ?? 0;
  form.targetDate = currentCard.targetDate ?? "";
  form.content = currentCard.content ?? "";
  form.mood = currentCard.mood ?? "";
  form.weather = currentCard.weather ?? "";
  form.tags = currentCard.tags ? [...currentCard.tags] : [];
  form.images = currentCard.images ? [...currentCard.images] : [];
  form.amount = currentCard.amount ?? 0;
  form.flowType = currentCard.flowType ?? "expense";
  form.category = currentCard.category ?? "";
  // 资产字段
  form.source = currentCard.source || "";
  form.sourceIndex = 0; // 默认值，可以根据实际需要调整
  form.date = currentCard.date || "";
  form.price = currentCard.price ?? 0;
  form.billingCycle = currentCard.billingCycle ?? "monthly";
  form.cycleIndex = cycleOptions.findIndex(c => c.key === form.billingCycle);
  if (form.cycleIndex < 0) form.cycleIndex = 2;
  form.lastOrderDate = currentCard.lastOrderDate || "";
  form.nextBillingDate = currentCard.nextBillingDate ?? "";
  form.birthDate = currentCard.birthDate ?? "";
  form.steps = currentCard.steps ? JSON.parse(JSON.stringify(currentCard.steps)) : [];
  form.deadline = currentCard.deadline || "";
  // Load reminder config or set default
  if (currentCard.reminder) {
    form.reminder = { ...currentCard.reminder };
  } else {
    form.reminder = getDefaultReminderConfig(card.type);
    form.reminder.enabled = false;
  }
};

const initializePage = (options?: Record<string, string>) => {
  resetForm();
  query.value = options ?? {};

  if (query.value.id) {
    records.loadCards();
    const card = records.cards.find(c => c.id === query.value.id);
    if (card) {
      fillFormFromCard(card);
      return;
    }
  }

  if (query.value.type) {
    applyTypeDefaults(query.value.type);
  }
};

const saveCard = () => {
  if (!form.title.trim()) {
    uni.showToast({ title: "请输入标题", icon: "none" });
    return;
  }

  const base = {
    type: form.type,
    title: form.title.trim(),
    icon: form.icon,
    colorClass: form.colorClass,
    notes: form.notes || "",
    displayStyle: form.displayStyle,
    customStyle: form.displayStyle === "custom" ? { ...form.customStyle } : undefined,
    isPinned: form.isPinned
  };

  let extra: Record<string, any> = {};

  switch (form.type) {
    case "habit":
      extra = { punches: form.punches, totalCount: form.punches.length, dailyLimit: form.dailyLimit, minIntervalMinutes: form.minIntervalMinutes };
      break;
    case "countdown":
      if (!form.targetDate) {
        uni.showToast({ title: "请选择目标日期", icon: "none" });
        return;
      }
      extra = { targetDate: form.targetDate };
      break;
    case "diary":
      extra = { 
        content: form.content, 
        mood: form.mood, 
        weather: form.weather, 
        tags: form.tags, 
        images: form.images 
      };
      // Increment edit count for diary content lock
      if (isEdit.value) {
        const existingCard = records.cards.find(c => c.id === query.value.id) as any;
        const currentEditCount = existingCard?.editCount || 0;
        extra.editCount = currentEditCount + 1;
      } else {
        extra.editCount = 0;
      }
      break;
    case "asset":
      if (!form.title.trim()) {
        uni.showToast({ title: "请输入标题", icon: "none" });
        return;
      }
      if (!form.date) {
        uni.showToast({ title: "请选择日期", icon: "none" });
        return;
      }
      extra = { 
        amount: Number(form.amount) || 0, 
        flowType: form.flowType, 
        source: form.source,
        date: form.date
      };
      break;
    case "subscription":
      extra = { price: Number(form.price) || 0, billingCycle: form.billingCycle, nextBillingDate: form.nextBillingDate };
      break;
    case "birthday":
      if (!form.birthDate) {
        uni.showToast({ title: "请选择出生日期", icon: "none" });
        return;
      }
      extra = { birthDate: form.birthDate };
      break;
    case "plan":
      // filter out empty step descriptions
      const validSteps = form.steps.filter((s: any) => s.text.trim() !== "");
      if (validSteps.length === 0) {
        uni.showToast({ title: "请至少添加一个步骤", icon: "none" });
        return;
      }
      extra = { steps: validSteps, deadline: form.deadline };
      break;
  }

  // Include reminder config if enabled
  const reminderData = form.reminder.enabled ? { reminder: { ...form.reminder } } : {};

  if (isEdit.value) {
    records.updateCard(query.value.id, { ...base, ...extra, ...reminderData });
    uni.showToast({ title: "已更新", icon: "success" });
  } else {
    records.addCard({ ...base, ...extra, ...reminderData } as any);
    uni.showToast({ title: "已保存", icon: "success" });
  }

  if (!isEdit.value) {
    uni.redirectTo({ url: "/pages/index/index" });
  } else {
    if (getCurrentPages().length > 1 && getCurrentPages()[getCurrentPages().length - 2]?.route === 'pages/custom-settings/custom-settings') {
      uni.navigateBack({
        delta: 2 // Go back two pages: Custom Settings -> Edit -> Previous page
      });
    } else {
      uni.navigateBack();
    }
  }
};

const onDelete = () => {
  uni.showModal({
    title: "删除记录",
    content: "确定要删除这条记录吗？",
    confirmColor: "#E57373",
    success(res) {
      if (res.confirm) {
        records.deleteCard(query.value.id);
        uni.navigateBack();
      }
    }
  });
};

onLoad((options) => {
  initializePage((options ?? {}) as Record<string, string>);
});

onShow(() => {
  // Refresh form from store when returning from style-library
  if (query.value.id) {
    records.loadCards();
    const card = records.cards.find(c => c.id === query.value.id);
    if (card) {
      fillFormFromCard(card);
    }
  }
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
.bg-orange { background: #FDF5EE; }
.bg-blue   { background: #EFF5F8; }
.bg-green  { background: #EFF6F2; }
.bg-pink   { background: #FBF1F1; }
.bg-purple { background: #F5F1F8; }
.bg-cream  { background: #FAF6EF; }

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

/* Fields */
.field-label {
  font-size: 26rpx; color: #999; font-weight: 500;
  display: block; margin-bottom: 16rpx;
}
.dark-mode .field-label { color: #888888; }
.field-input {
  width: 100%; font-size: 30rpx; color: #2D3436;
  border-bottom: 2rpx solid #F0F0F5;
  padding: 12rpx 0; background: transparent;
}
.field-textarea {
  width: 100%; font-size: 28rpx; color: #2D3436;
  min-height: 120rpx; line-height: 1.7;
  background: transparent;
}
.placeholder-text { color: #CCC; }
.dark-mode .field-input,
.dark-mode .field-textarea { color: #F5F5DC; border-bottom-color: #333333; }

/* Picker */
.field-picker {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 2rpx solid #F0F0F5; padding: 16rpx 0;
}
.dark-mode .field-picker { border-bottom-color: #333333; }
.picker-value { font-size: 30rpx; color: #2D3436; }
.dark-mode .picker-value { color: #F5F5DC; }
.picker-arrow { font-size: 40rpx; color: #CCC; }

/* Segment control */
.seg-control {
  display: flex; border-radius: 20rpx;
  overflow: hidden; background: #F5F5F7;
  margin-top: 16rpx; position: relative;
  transition: all 0.3s ease;
}
.dark-mode .seg-control { background: #222222; }
.slider-indicator {
  position: absolute; top: 0; height: 100%; width: 50%;
  border-radius: 18rpx; z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.indicator-income {
  background: #FFC0CB; left: 0;
}
.indicator-expense {
  background: #F0FFF0; left: 50%;
}
.seg-item {
  flex: 1; text-align: center;
  padding: 14rpx 0; font-size: 26rpx; color: #666;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}
.seg-active {
  font-weight: 700; 
  position: relative;
  z-index: 3;
}
.seg-active.income-active {
  background: #FF6B6B; color: #fff;
  border-radius: 18rpx;
}
.seg-active.expense-active {
  background: #51CF66; color: #fff;
  border-radius: 18rpx;
}
.inline-fields { display: flex; align-items: center; }

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

/* Plan Steps Styling */
.step-input-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.step-locked {
  opacity: 0.6;
}
.step-checkbox {
  width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  border: 4rpx solid #5C7C8A;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 8rpx;
}
.step-completed {
  background: #5C7C8A;
  border-color: #5C7C8A;
}
.step-check-mark {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 800;
}
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.step-text-input {
  font-size: 28rpx;
  color: #2D3436;
  border-bottom: 2rpx solid #F0F0F5;
  padding: 8rpx 0;
  background: transparent;
}
.dark-mode .step-text-input {
  color: #F5F5DC;
  border-color: #333333;
}
.step-time-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.step-time-label {
  font-size: 22rpx;
  color: #7F8B95;
  font-weight: 600;
}
.step-time-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  background: rgba(92, 124, 138, 0.06);
}
.step-time-value {
  font-size: 22rpx;
  color: #5C7C8A;
  font-weight: 600;
}
.step-time-arrow {
  font-size: 22rpx;
  color: #5C7C8A;
}
.step-locked-icon {
  font-size: 24rpx;
}
.step-delete {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 8rpx;
}
.step-delete-icon {
  font-size: 38rpx;
  color: #E57373;
}
.add-step-btn {
  margin-top: 16rpx;
  padding: 16rpx 0;
  text-align: center;
  border: 2rpx dashed rgba(92, 124, 138, 0.3);
  border-radius: 18rpx;
}
.add-step-btn:active {
  background: rgba(92, 124, 138, 0.05);
}
.add-step-btn-text {
  font-size: 26rpx;
  color: #5C7C8A;
  font-weight: 600;
}

/* Delete btn */
.delete-btn {
  padding: 28rpx; border-radius: 20rpx;
  background: #FFF0F0; text-align: center;
}
.delete-btn:active { opacity: 0.7; }
.delete-text { font-size: 28rpx; color: #E57373; font-weight: 600; }

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
.sheet-handle {
  width: 80rpx; height: 8rpx;
  background: #E0E0E0; border-radius: 10rpx;
  margin: 0 auto 24rpx;
}
.sheet-title {
  font-size: 30rpx; font-weight: 700; color: #333;
  display: block; text-align: center; margin-bottom: 32rpx;
}
.icon-grid {
  display: flex; flex-wrap: wrap; gap: 16rpx; justify-content: center;
}
.icon-option {
  width: 88rpx; height: 88rpx; border-radius: 22rpx;
  background: #F8F8FA; display: flex;
  align-items: center; justify-content: center;
}
.icon-option:active { transform: scale(0.9); }
.icon-selected { background: #D6E8EE; }
.icon-opt-text { font-size: 44rpx; }

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
  border-radius: 20rpx;
  background: #F5F5F7;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;
}
.reminder-option.option-active {
  background: #EEF5F7;
  border-color: #5C7C8A;
  color: #5C7C8A;
  font-weight: 600;
}

/* Diary mood/weather selectors */
.diary-meta-row {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}
.diary-meta-item {
  flex: 1;
}
.mood-selector,
.weather-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}
.mood-option,
.weather-option {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #F5F5F5;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}
.mood-option.mood-active,
.weather-option.weather-active {
  background: #EEF5F7;
  border-color: #5C7C8A;
}
.mood-emoji,
.weather-emoji {
  font-size: 32rpx;
}
.mood-checkbox,
.weather-checkbox {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #CCC;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFF;
}
.mood-checkbox.checked,
.weather-checkbox.checked {
  background: #5C7C8A;
  border-color: #5C7C8A;
}
.check-mark {
  color: #FFF;
  font-size: 20rpx;
  font-weight: 700;
}

/* Diary images */
.diary-images-section {
  margin-top: 24rpx;
}
.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}
.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}
.diary-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
}
.image-remove {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #E57373;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-remove-icon {
  color: #FFF;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
