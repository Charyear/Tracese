import { defineStore } from "pinia";
import { useRecordsStore } from "./records";
import { useSettingsStore } from "./settings";
import type { AnyCard } from "../types/card";
import { STORAGE_KEYS } from "../constants/storage";

export const useBackupStore = defineStore("backup", () => {
    const recordsStore = useRecordsStore();
    const settingsStore = useSettingsStore();

    const exportBackup = (): string => {
        try {
            const data = {
                version: "1.0.0",
                timestamp: Date.now(),
                cards: recordsStore.cards
            };
            settingsStore.triggerHaptic();
            return JSON.stringify(data, null, 2);
        } catch (e) {
            console.error("Backup export failed", e);
            uni.showToast({ title: "导出失败，请重试", icon: "none" });
            return "";
        }
    };

    const importBackup = (jsonStr: string): { success: boolean; message: string } => {
        try {
            if (!jsonStr.trim()) {
                return { success: false, message: "导入内容不能为空" };
            }

            const parsed = JSON.parse(jsonStr);

            // Basic validation
            if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.cards)) {
                return { success: false, message: "数据格式不正确，缺少 cards 数组" };
            }

            const validCards: AnyCard[] = [];

            // Card field validation
            for (const card of parsed.cards) {
                if (
                    card &&
                    typeof card === "object" &&
                    typeof card.id === "string" &&
                    ["habit", "countdown", "diary", "asset", "subscription"].includes(card.type) &&
                    typeof card.title === "string" &&
                    typeof card.createdAt === "number"
                ) {
                    // Keep structure valid
                    validCards.push(card as AnyCard);
                }
            }

            if (validCards.length === 0 && parsed.cards.length > 0) {
                return { success: false, message: "未找到有效的记录数据" };
            }

            // Save valid imported cards to local storage
            uni.setStorageSync(STORAGE_KEYS.CARDS, JSON.stringify(validCards));
            recordsStore.loadCards(); // Reload state
            settingsStore.triggerHaptic();

            return { success: true, message: `成功导入 ${validCards.length} 条记录` };
        } catch (e) {
            console.error("Backup import failed", e);
            return { success: false, message: "JSON 解析错误，请检查格式" };
        }
    };

    const clearAllData = () => {
        uni.removeStorageSync(STORAGE_KEYS.CARDS);
        recordsStore.loadCards();
        settingsStore.triggerHaptic();
    };

    return {
        exportBackup,
        importBackup,
        clearAllData
    };
});
