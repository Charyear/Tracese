import type { AnyCard, ReminderConfig } from '../types/card';

// WeChat template message configuration
// 模板ID：CjZsVngDhKS9MBRFXP5knGb_aj_vbdnXq6Xo6xCzDqI
// 模板字段：
// - date4.DATA: 日期
// - thing1.DATA: 活动名称
// - thing16.DATA: 温馨提示
const WECHAT_TEMPLATE_ID = 'CjZsVngDhKS9MBRFXP5knGb_aj_vbdnXq6Xo6xCzDqI';

// Default reminder configurations per card type
export const getDefaultReminderConfig = (cardType: AnyCard['type']): ReminderConfig => {
    const base: ReminderConfig = {
        enabled: false,
        reminderTime: '09:00',
        reminderType: 'once',
    };

    switch (cardType) {
        case 'habit':
            return { ...base, reminderType: 'daily', habitRemindTime: '21:00' };
        case 'countdown':
            return { ...base, reminderType: 'custom', countdownDaysBefore: [1, 3] };
        case 'diary':
            return { ...base, reminderType: 'daily', diaryRemindTime: '21:00' };
        case 'asset':
            return { ...base, reminderType: 'monthly' };
        case 'subscription':
            return { ...base, reminderType: 'custom', subscriptionDaysBefore: [1, 3, 7] };
        case 'birthday':
            return { ...base, reminderType: 'custom', birthdayDaysBefore: [1, 3] };
        case 'plan':
            return { ...base, reminderType: 'custom', planDaysBefore: [1, 3, 7] };
        default:
            return base;
    }
};

// Generate reminder message based on card type and context
export const generateReminderMessage = (card: AnyCard): string => {
    const title = card.title;
    const now = new Date();

    switch (card.type) {
        case 'countdown': {
            const target = new Date((card as any).targetDate);
            const diffMs = target.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

            if (diffMs <= 0) {
                return `「${title}」倒计时已结束！`;
            } else if (diffDays <= 0) {
                return `「${title}」还剩${diffHours}小时`;
            } else if (diffDays === 1) {
                return `「${title}」还剩1天`;
            } else if (diffDays <= 3) {
                return `「${title}」还剩${diffDays}天`;
            } else {
                return `「${title}」还剩${diffDays}天`;
            }
        }

        case 'birthday': {
            const birthDate = new Date((card as any).birthDate);
            const thisYear = now.getFullYear();
            const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < now) {
                nextBirthday.setFullYear(thisYear + 1);
            }
            const diffMs = nextBirthday.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const age = thisYear - birthDate.getFullYear();

            if (diffDays === 0) {
                return `🎉 今天是「${title}」的生日，祝TA生日快乐！`;
            } else if (diffDays === 1) {
                return `🎂 「${title}」的生日还有1天，记得准备礼物/祝福！`;
            } else if (diffDays <= 3) {
                return `🎂 「${title}」的生日还有${diffDays}天，记得准备礼物/祝福！`;
            } else {
                return `🎂 「${title}」的生日还有${diffDays}天`;
            }
        }

        case 'habit': {
            const habit = card as any;
            const todayStr = formatDate(now);
            const todayPunches = habit.punches?.filter((p: string) => p.startsWith(todayStr)) || [];
            const limit = habit.dailyLimit ?? 1;

            if (todayPunches.length >= limit) {
                return `「${title}」今日打卡已完成 ✓`;
            }
            return `⏰ 「${title}」习惯打卡提醒，今天还没打卡哦~`;
        }

        case 'diary': {
            const diary = card as any;
            const today = formatDate(now);
            const lastDiaryDate = diary.updatedAt ? formatDate(new Date(diary.updatedAt)) : null;

            if (lastDiaryDate === today) {
                return `「${title}」今天已经写过日记啦 ✓`;
            }
            return `📝 今天过得怎么样？来记录一下心情吧~`;
        }

        case 'subscription': {
            const sub = card as any;
            const nextBilling = new Date(sub.nextBillingDate);
            const diffMs = nextBilling.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
                return `🔔 「${title}」订阅今天扣费（¥${sub.price}），请注意！`;
            } else if (diffDays === 1) {
                return `🔔 「${title}」订阅即将扣费（¥${sub.price}），到期日明天`;
            } else if (diffDays <= 7) {
                return `🔔 「${title}」订阅即将扣费（¥${sub.price}），还有${diffDays}天`;
            } else {
                return `🔔 「${title}」订阅还有${diffDays}天扣费`;
            }
        }

        case 'plan': {
            const plan = card as any;
            const steps = plan.steps || [];
            const completedSteps = steps.filter((s: any) => s.completed).length;
            const totalSteps = steps.length;
            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

            if (totalSteps > 0 && completedSteps === totalSteps) {
                return `🎉 「${title}」计划全部完成！`;
            }
            return `📌 「${title}」完成进度${progress}%（${completedSteps}/${totalSteps}）`;
        }

        case 'asset': {
            const asset = card as any;
            if (asset.flowType === 'expense') {
                return `💰 「${title}」账单提醒：支出 ¥${asset.amount}`;
            }
            return `🎉 「${title}」收入已到账 ¥${asset.amount}`;
        }

        default:
            return `「${title}」提醒`;
    }
};

// Check if a reminder should be triggered now
export const shouldTriggerReminder = (card: AnyCard, config: ReminderConfig): boolean => {
    if (!config.enabled) return false;

    const now = new Date();
    const currentTime = formatTime(now);

    // Check if already triggered recently (within 1 hour)
    if (config.lastTriggeredAt) {
        const lastTriggered = new Date(config.lastTriggeredAt);
        const hoursSinceLastTrigger = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastTrigger < 1) return false;
    }

    switch (card.type) {
        case 'habit': {
            const habitRemindTime = config.habitRemindTime || config.reminderTime;
            return currentTime === habitRemindTime;
        }

        case 'diary': {
            const diaryRemindTime = config.diaryRemindTime || config.reminderTime;
            return currentTime === diaryRemindTime;
        }

        case 'countdown': {
            const target = new Date((card as any).targetDate);
            const diffMs = target.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const daysBefore = config.countdownDaysBefore || [1, 3];
            return daysBefore.includes(diffDays);
        }

        case 'birthday': {
            const birthDate = new Date((card as any).birthDate);
            const thisYear = now.getFullYear();
            const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
            if (nextBirthday < now) {
                nextBirthday.setFullYear(thisYear + 1);
            }
            const diffMs = nextBirthday.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const daysBefore = config.birthdayDaysBefore || [1, 3];
            return daysBefore.includes(diffDays) && currentTime === config.reminderTime;
        }

        case 'subscription': {
            const sub = card as any;
            const nextBilling = new Date(sub.nextBillingDate);
            const diffMs = nextBilling.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const daysBefore = config.subscriptionDaysBefore || [1, 3, 7];
            return daysBefore.includes(diffDays) && currentTime === config.reminderTime;
        }

        case 'plan': {
            const plan = card as any;
            const steps = plan.steps || [];
            const hasIncomplete = steps.some((s: any) => !s.completed);
            if (!hasIncomplete) return false;
            // For plans, remind daily at the set time
            return currentTime === config.reminderTime;
        }

        case 'asset': {
            return currentTime === config.reminderTime;
        }

        default:
            return currentTime === config.reminderTime;
    }
};

// Queue to prevent multiple modals stacking
let reminderQueue: Array<{ title: string; content: string }> = [];
let isProcessingQueue = false;

// Process reminder queue one at a time
const processReminderQueue = async (): Promise<void> => {
    if (isProcessingQueue || reminderQueue.length === 0) return;
    isProcessingQueue = true;

    while (reminderQueue.length > 0) {
        const { title, content } = reminderQueue.shift()!;
        await new Promise<void>((resolve) => {
            if (typeof uni !== 'undefined' && uni.showModal) {
                uni.showModal({
                    title: title,
                    content: content,
                    showCancel: false,
                    confirmText: '知道了',
                    success: () => resolve(),
                    fail: () => resolve()
                });
            } else {
                console.log(`[Reminder] ${title}: ${content}`);
                resolve();
            }
        });
    }

    isProcessingQueue = false;
};

// Show local notification (queued to prevent stacking)
const showLocalNotification = (title: string, content: string): void => {
    reminderQueue.push({ title, content });
    processReminderQueue();
};

// Send reminder notification
export const sendWechatReminder = async (card: AnyCard, config: ReminderConfig): Promise<boolean> => {
    const message = config.customMessage || generateReminderMessage(card);

    // Check if WeChat API is available
    if (typeof uni === 'undefined' || !uni.requestSubscribeMessage) {
        console.warn('WeChat subscription message API not available');
        showLocalNotification(card.title, message);
        return false;
    }

    try {
        // Request subscription permission with configured template ID
        const templateId = WECHAT_TEMPLATE_ID;
        
        const res = await new Promise<any>((resolve) => {
            uni.requestSubscribeMessage({
                tmplIds: [templateId],
                complete: (res: any) => {
                    resolve(res);
                }
            });
        });

        if (res.errMsg && res.errMsg.includes('fail')) {
            console.error('Failed to request subscription:', res.errMsg);
            showLocalNotification(card.title, message);
            return false;
        }

        // Check if user accepted the subscription
        const acceptStatus = res[templateId];
        if (acceptStatus === 'accept') {
            // Prepare template data for WeChat message
            const today = new Date();
            const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
            
            // In production, send this data to your backend to dispatch the template message
            // The backend would call WeChat API to send the actual message
            console.log('WeChat template message data prepared:', {
                templateId,
                cardTitle: card.title,
                date: dateStr,
                activityName: card.title,
                tipMessage: message,
            });
            
            // Show local notification as confirmation
            showLocalNotification(card.title, message);
            return true;
        } else {
            console.log('User declined WeChat subscription for:', card.title);
            showLocalNotification(card.title, message);
            return false;
        }
    } catch (error) {
        console.error('Error sending WeChat reminder:', error);
        uni.showToast({ title: '发送提醒失败', icon: 'none' });
        showLocalNotification(card.title, message);
        return false;
    }
};

// Utility functions
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Check all cards for due reminders
export const checkAllReminders = async (cards: AnyCard[]): Promise<void> => {
    for (const card of cards) {
        if (card.reminder && shouldTriggerReminder(card, card.reminder)) {
            await sendWechatReminder(card, card.reminder);
            // Update lastTriggeredAt to prevent duplicate triggers within 1 hour
            card.reminder.lastTriggeredAt = Date.now();
        }
    }
};

// Get reminder status text for display
export const getReminderStatusText = (card: AnyCard): string => {
    if (!card.reminder || !card.reminder.enabled) return '';

    const config = card.reminder;
    const time = config.reminderTime;

    switch (card.type) {
        case 'habit':
            return `⏰ 每日${config.habitRemindTime || time}提醒打卡`;
        case 'countdown':
            return `📅 到期前${config.countdownDaysBefore?.join('、') || '1、3'}天提醒`;
        case 'diary':
            return `📝 每日${config.diaryRemindTime || time}提醒写日记`;
        case 'subscription':
            return `🔔 扣费前${config.subscriptionDaysBefore?.join('、') || '1、3、7'}天提醒`;
        case 'birthday':
            return `🎂 生日前${config.birthdayDaysBefore?.join('、') || '1、3'}天提醒`;
        case 'plan':
            return `📌 每日${time}提醒待办`;
        case 'asset':
            return `💰 每月${time}提醒`;
        default:
            return `🔔 ${time}提醒`;
    }
};
