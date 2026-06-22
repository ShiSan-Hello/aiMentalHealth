// 定义管理员模块
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义管理员模块
export const useAdminStore = defineStore('admin', () => {
  // 是否展开
  const isCollapsed = ref(false)

  // 修改切换状态
  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
  }

  // 并将值返回，可以全局访问
  return {
    isCollapsed,
    toggleCollapsed
  }
})
