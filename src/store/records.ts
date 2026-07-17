import { defineStore } from "pinia";
import { ref } from "vue";
import { useSettingsStore } from "./settings";
import type { AnyCard, HabitCard, ReminderConfig } from "../types/card";
import { checkAllReminders } from "../utils/reminder";
import { getHabitStreak, getHabitLongestStreak } from "../utils/card-helpers";
import { STORAGE_KEYS, MAX_PINNED_CARDS } from "../constants/storage";

export const useRecordsStore = defineStore("records", () => {
    const cards = ref<AnyCard[]>([]);
    const settings = useSettingsStore();

    // Load cards from LocalStorage with migration for new fields
    const loadCards = () => {
        try {
            const stored = uni.getStorageSync(STORAGE_KEYS.CARDS);
            if (stored) {
                cards.value = JSON.parse(stored);
                // Migrate cards with missing new fields
                migrateCards();
                sortCards();
            } else {
                cards.value = [];
            }
        } catch (e) {
            console.error("Failed to load cards", e);
            cards.value = [];
            uni.showToast({ title: "加载数据失败，已重置", icon: "none" });
        }
    };

    // Calculate subscription total cost based on startDate, billingCycle, and price
    const calculateSubscriptionTotalCost = (card: any): number => {
        if (!card.startDate || !card.price || !card.billingCycle) return 0;
        
        const start = new Date(card.startDate);
        const now = new Date();
        
        if (start > now) return 0;
        
        let cycles = 0;
        const price = card.price;
        
        if (card.billingCycle === 'weekly') {
            // Calculate weeks between start and now
            const diffTime = now.getTime() - start.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            cycles = Math.floor(diffDays / 7);
        } else if (card.billingCycle === 'monthly') {
            // Calculate months between start and now
            const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
            // Adjust if current day is before start day
            if (now.getDate() < start.getDate()) {
                cycles = months - 1;
            } else {
                cycles = months;
            }
        } else if (card.billingCycle === 'yearly') {
            // Calculate years between start and now
            const years = now.getFullYear() - start.getFullYear();
            // Adjust if current month/day is before start month/day
            if (now.getMonth() < start.getMonth() || 
                (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())) {
                cycles = years - 1;
            } else {
                cycles = years;
            }
        }
        
        return Math.max(0, cycles * price);
    };

    // Migrate old cards to include new fields
    const migrateCards = () => {
        cards.value = cards.value.map(card => {
            if (card.type === 'habit') {
                const habit = card as HabitCard;
                if (habit.streak === undefined) {
                    habit.streak = getHabitStreak(habit);
                }
                if (habit.longestStreak === undefined) {
                    habit.longestStreak = getHabitLongestStreak(habit);
                }
            }
            if (card.type === 'diary') {
                const diary = card as any;
                if (!diary.tags) diary.tags = [];
                if (!diary.images) diary.images = [];
            }
            if (card.type === 'asset') {
                const asset = card as any;
                if (!asset.category) asset.category = asset.source || '其他';
            }
            if (card.type === 'subscription') {
                const sub = card as any;
                if (sub.totalCost === undefined || sub.totalCost === 0) {
                    sub.totalCost = calculateSubscriptionTotalCost(sub);
                }
                if (!sub.reminderDays) sub.reminderDays = [1, 3, 7];
            }
            if (card.type === 'plan') {
                const plan = card as any;
                if (plan.progress === undefined) {
                    const completed = plan.steps?.filter((s: any) => s.completed).length || 0;
                    const total = plan.steps?.length || 0;
                    plan.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                }
                if (plan.deadline === undefined) plan.deadline = '';
                if (plan.steps) {
                    plan.steps = plan.steps.map((s: any) => ({
                        ...s,
                        dependencies: s.dependencies || [],
                        deadline: s.deadline || '',
                        progress: s.progress ?? (s.completed ? 100 : 0)
                    }));
                }
            }
            return card;
        });
    };

    const saveCards = () => {
        try {
            uni.setStorageSync(STORAGE_KEYS.CARDS, JSON.stringify(cards.value));
        } catch (e) {
            console.error("Failed to save cards", e);
            uni.showToast({ title: "保存失败，请重试", icon: "none" });
        }
    };

    const sortCards = () => {
        cards.value.sort((a, b) => {
            if (a.sortIndex !== b.sortIndex) {
                return a.sortIndex - b.sortIndex;
            }
            return b.createdAt - a.createdAt;
        });
    };

    const addCard = (card: Omit<AnyCard, "id" | "createdAt" | "updatedAt" | "sortIndex">): AnyCard => {
        const baseCard = {
            ...card,
            id: "card_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sortIndex: cards.value.length ? Math.max(...cards.value.map(c => c.sortIndex)) + 1 : 0
        };

        // Set default values for new fields based on card type
        if (card.type === 'habit') {
            (baseCard as any).streak = 0;
            (baseCard as any).longestStreak = 0;
        }
        if (card.type === 'diary') {
            (baseCard as any).tags = (card as any).tags || [];
            (baseCard as any).images = (card as any).images || [];
        }
        if (card.type === 'asset') {
            (baseCard as any).category = (card as any).category || '其他';
        }
        if (card.type === 'subscription') {
            (baseCard as any).totalCost = calculateSubscriptionTotalCost(card);
            (baseCard as any).reminderDays = (card as any).reminderDays || [1, 3, 7];
        }
        if (card.type === 'plan') {
            (baseCard as any).progress = 0;
            (baseCard as any).deadline = (card as any).deadline || '';
            if ((baseCard as any).steps) {
                (baseCard as any).steps = (baseCard as any).steps.map((s: any) => ({
                    ...s,
                    dependencies: s.dependencies || [],
                    deadline: s.deadline || '',
                    progress: s.progress ?? (s.completed ? 100 : 0)
                }));
            }
        }

        const newCard: AnyCard = baseCard as AnyCard;
        cards.value.push(newCard);
        sortCards();
        saveCards();
        settings.triggerHaptic();
        return newCard;
    };

    const updateCard = (id: string, updates: Partial<Omit<AnyCard, "id" | "createdAt" | "updatedAt">>) => {
        const index = cards.value.findIndex(c => c.id === id);
        if (index !== -1) {
            cards.value[index] = {
                ...cards.value[index],
                ...updates,
                updatedAt: Date.now()
            } as AnyCard;
            sortCards();
            saveCards();
            settings.triggerHaptic();
        }
    };

    const deleteCard = (id: string) => {
        cards.value = cards.value.filter(c => c.id !== id);
        saveCards();
        settings.triggerHaptic();
    };

    const pinnedCount = (excludeId?: string) =>
        cards.value.filter(c => c.isPinned && c.id !== excludeId).length;

    const canPin = (excludeId?: string) => pinnedCount(excludeId) < MAX_PINNED_CARDS;

    const pad = (n: number) => String(n).padStart(2, "0");

    const formatLocalDateTime = (date: Date) => {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const getTodayPunchCount = (habit: HabitCard) => {
        const todayStr = formatLocalDateTime(new Date()).slice(0, 10);
        return habit.punches.filter(p => p.startsWith(todayStr)).length;
    };

    const canPunch = (habit: HabitCard): { allowed: boolean; reason?: string } => {
        const limit = habit.dailyLimit ?? 1;
        if (getTodayPunchCount(habit) >= limit) {
            return { allowed: false, reason: `今日已打卡${limit}次，明天再来吧` };
        }

        const interval = habit.minIntervalMinutes ?? 0;
        if (interval > 0 && habit.punches.length > 0) {
            const lastPunch = new Date(habit.punches[habit.punches.length - 1]).getTime();
            const diffMinutes = (Date.now() - lastPunch) / (1000 * 60);
            if (diffMinutes < interval) {
                return { allowed: false, reason: `还需等待${Math.ceil(interval - diffMinutes)}分钟才能再次打卡` };
            }
        }

        return { allowed: true };
    };

    const punchIn = (id: string): { success: boolean; message?: string } => {
        const index = cards.value.findIndex(c => c.id === id && c.type === "habit");
        if (index === -1) return { success: false, message: "记录不存在" };

        const habit = cards.value[index] as HabitCard;
        const check = canPunch(habit);
        if (!check.allowed) return { success: false, message: check.reason };

        habit.punches.push(formatLocalDateTime(new Date()));
        habit.totalCount = habit.punches.length;
        habit.updatedAt = Date.now();
        
        // Update streak values
        habit.streak = getHabitStreak(habit);
        habit.longestStreak = getHabitLongestStreak(habit);
        habit.streakUpdatedAt = Date.now();
        
        saveCards();
        settings.triggerHaptic();
        return { success: true };
    };

    const reorderCards = (newOrder: AnyCard[]) => {
        // Re-assign sortIndex based on new order array
        newOrder.forEach((card, index) => {
            const match = cards.value.find(c => c.id === card.id);
            if (match) {
                match.sortIndex = index;
            }
        });
        sortCards();
        saveCards();
    };

    // Update reminder configuration for a card
    const updateReminder = (id: string, reminder: ReminderConfig) => {
        const index = cards.value.findIndex(c => c.id === id);
        if (index !== -1) {
            cards.value[index] = {
                ...cards.value[index],
                reminder,
                updatedAt: Date.now()
            } as AnyCard;
            saveCards();
        }
    };

    // Toggle reminder enabled/disabled
    const toggleReminder = (id: string) => {
        const index = cards.value.findIndex(c => c.id === id);
        if (index !== -1) {
            const card = cards.value[index];
            if (card.reminder) {
                card.reminder.enabled = !card.reminder.enabled;
                card.reminder.lastTriggeredAt = undefined;
                card.updatedAt = Date.now();
                saveCards();
            }
        }
    };

    // Concurrency guard to prevent duplicate reminder checks
    let isCheckingReminders = false;

    // Check and trigger due reminders
    const checkReminders = async () => {
        if (isCheckingReminders) return;
        isCheckingReminders = true;
        try {
            await checkAllReminders(cards.value);
            // Save cards to persist lastTriggeredAt updates
            saveCards();
        } finally {
            isCheckingReminders = false;
        }
    };

    // Get all cards with active reminders
    const getCardsWithReminders = () => {
        return cards.value.filter(c => c.reminder?.enabled);
    };

    // Initial load
    loadCards();

    return {
        cards,
        loadCards,
        addCard,
        updateCard,
        deleteCard,
        canPin,
        canPunch,
        punchIn,
        reorderCards,
        updateReminder,
        toggleReminder,
        checkReminders,
        getCardsWithReminders
    };
});
