<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useRecordsStore } from "./store/records";

const records = useRecordsStore();

onLaunch(() => {
  console.log("App Launch");
  // Initialize local theme settings on launch
  const theme = uni.getStorageSync("theme") || "light";
  uni.setStorageSync("theme", theme);
  // Load cards and check reminders on launch
  records.loadCards();
  records.checkReminders();
});

onShow(() => {
  console.log("App Show");
  // Check reminders when app comes to foreground
  records.checkReminders();
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* Global CSS transitions and rules that cannot be handled easily by Tailwind utility classes */
.scale-press {
  transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.scale-press:active {
  transform: scale(0.96);
}
</style>
