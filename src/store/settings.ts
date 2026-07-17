import { defineStore } from "pinia";
import { ref } from "vue";
import { STORAGE_KEYS } from "../constants/storage";

export const useSettingsStore = defineStore("settings", () => {
    const theme = ref<"light" | "dark">("light");
    const hapticEnabled = ref<boolean>(true);
    const monthlyBudget = ref<number>(0);
    const onboardingCompleted = ref<boolean>(false);

    // Initialize from storage
    theme.value = (uni.getStorageSync(STORAGE_KEYS.THEME) as "light" | "dark") || "light";
    const storedHaptic = uni.getStorageSync(STORAGE_KEYS.HAPTIC);
    if (storedHaptic !== "") {
        hapticEnabled.value = !!storedHaptic;
    }
    const storedBudget = uni.getStorageSync(STORAGE_KEYS.MONTHLY_BUDGET);
    if (storedBudget !== "") {
        monthlyBudget.value = Number(storedBudget) || 0;
    }
    onboardingCompleted.value = uni.getStorageSync(STORAGE_KEYS.ONBOARDING_COMPLETED) === true;

    const completeOnboarding = () => {
        onboardingCompleted.value = true;
        uni.setStorageSync(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    };

    const resetOnboarding = () => {
        onboardingCompleted.value = false;
        uni.removeStorageSync(STORAGE_KEYS.ONBOARDING_COMPLETED);
    };

    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light";
        uni.setStorageSync(STORAGE_KEYS.THEME, theme.value);
        triggerHaptic();
    };

    const toggleHaptic = () => {
        hapticEnabled.value = !hapticEnabled.value;
        uni.setStorageSync(STORAGE_KEYS.HAPTIC, hapticEnabled.value);
        triggerHaptic();
    };

    const setMonthlyBudget = (amount: number) => {
        monthlyBudget.value = amount;
        uni.setStorageSync(STORAGE_KEYS.MONTHLY_BUDGET, amount);
        triggerHaptic();
    };

    const triggerHaptic = () => {
        if (hapticEnabled.value) {
            uni.vibrateShort({
                type: "medium"
            });
        }
    };

    return {
        theme,
        hapticEnabled,
        monthlyBudget,
        onboardingCompleted,
        toggleTheme,
        toggleHaptic,
        setMonthlyBudget,
        triggerHaptic,
        completeOnboarding,
        resetOnboarding
    };
});
