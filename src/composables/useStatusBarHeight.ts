import { ref, onMounted } from 'vue';
import { DEFAULT_STATUS_BAR_HEIGHT } from '../constants/storage';

/**
 * 获取状态栏高度的 composable
 * 在所有页面中复用，避免重复代码
 */
export function useStatusBarHeight() {
  const height = ref(DEFAULT_STATUS_BAR_HEIGHT);
  
  onMounted(() => {
    uni.getSystemInfo({
      success(res) {
        height.value = res.statusBarHeight ?? DEFAULT_STATUS_BAR_HEIGHT;
      }
    });
  });
  
  return height;
}
