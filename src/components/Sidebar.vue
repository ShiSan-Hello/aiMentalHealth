<!-- 侧边栏菜单区域有很多条，可以单独写成一个组件 -->
<template>
  <el-aside :width="isCollapsed ? '64px' : '264px'">
    <!-- 根据官方文档，可以用:collapse 来实现侧边栏的收起功能 -->
     <!-- :collapse="isCollapsed" 控制是否收起
        :collapse-transition="false" 关闭过渡动画 -->
<el-menu 
        :collapse="isCollapsed"
        :collapse-transition="false"
        :default-active="activePath"
        class="menu-style"
      >
        <div class="brand" :style="{ padding: isCollapsed ? '10px 0' : '10px' }">
          <el-image :style="{ width: '50px', height: '50px', marginRight: isCollapsed ? '0' : '10px'  }"  :src="iconUrl" alt="logo" />
          <div v-show="!isCollapsed" class="info-card">
            <h1 class="brand-title">心里健康AI助手</h1>
            <p class="brand-subtitle">管理后台</p>
          </div>
        </div>
        <el-menu-item @click="selectMenu(item)" v-for="item in router.options.routes[0].children" :key="item.path" :index="item.path">
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <span>{{ item.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { Key } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const router = useRouter()
const route = useRoute()
// console.log(router)
const iconUrl =new URL('@/assets/images/机器人.png', import.meta.url).href

// 监听 isCollapsed 变化，
const isCollapsed = computed(() => {
    return adminStore.isCollapsed
  })

// 这种写法配合@click="selectMenu(item.path)"，只能传递一个参数，不能操作数组里的其他对象
// const selectMenu = (path) => {
//   router.push(path)
// }

// 完善的侧边栏点击事件
// 这种写法更全面，可以获取path，还可以获取数组里的其他对象
const selectMenu = (key) => {
  // console.log(key)
  const currentRoute = router.options.routes[0]
  // console.log(`${currentRoute.path}/${key.path}`)
  router.push(`${currentRoute.path}/${key.path}`)
}

// 获取默认地址
// const defaultPath = computed(() => {
//   return route.path
// })
// 当前高亮路径：从 /back/dashboard 提取 dashboard，和 :index 的值对应
const activePath = computed(() => {
  return route.path.replace('/back/', '') || ''
})

// onMounted(() => {
//   console.log(route)
// })
// 自动响应屏幕宽度
const checkScreenWidth = () => {
  // 小于 600px 自动收起
  adminStore.isCollapsed = window.innerWidth < 600
  console.log(adminStore.isCollapsed, 'isCollapsed')
}
onMounted(() => {
  checkScreenWidth()  // 初始化时先判断一次
  window.addEventListener('resize', checkScreenWidth) // 监听窗口变化
})
onUnmounted(() => {
  window.removeEventListener('resize', checkScreenWidth)
})

</script>

<style lang="scss" scoped>
.menu-style {
  // 继承了父级高度，同时父级也继承了父级的父级，最上一级设为100vh
  height: 100%;
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 54.1px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7eb;
  /* scss语法允许css中嵌套 */
  .info-card {
    .brand-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #1f2937;
    }
    .brand-subtitle {
      font-size: 14px;
      color: #6b7280;
    }
  }
}

}


</style>
