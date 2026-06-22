<template>
<div class="navbar">
  <div class="flex-box"> 
    <el-button @click="handleCollapsed">
     <!-- 类似插槽的写法 -->
      <el-icon>
        <Expand />
      </el-icon>
    </el-button>
    <p class="page-title">
      {{route.meta.title}}
    </p>
  </div>
  <div class="flex-box">
    <el-dropdown @command="handleCommand">
      <div class="flex-box">
        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
        <p class="user-name">用户</p>
        <el-icon><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  
</div>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue';
import { useAdminStore } from '@/stores/admin'
// useRouter拿到实例，用于跳转路由
// useRoute拿到对象，用于获取当前路由对象，获取当前页路由信息
import { useRouter, useRoute } from 'vue-router'
import {ElMessageBox} from 'element-plus'
import { lgout } from '@/api/admin'

const router = useRouter()
const route = useRoute()
// {{route.meta.title}}可以获取到路由对象里的meta属性，
// 动态使用meta下的title属性，可以在当行栏显示当前页面

const adminStore = useAdminStore()

const handleCommand = (command) => {
  if(command === 'logout') {
    // 退出登录逻辑
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 退出登录逻辑
      lgout().then( () => {
        // 在storage中查看
        localStorage.removeItem('token')
        localStorage.removeItem('token')
        router.push('/auth/login')
      })
    }).catch(() => {
      // 取消退出登录
    })
  }
}

const handleCollapsed = () => {
  adminStore.toggleCollapsed()
}
</script>

<style lang="scss" scoped>
.navbar{
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;
  .flex-box {
  display: flex;
  align-items: center;
  justify-content: center;
  }
  .page-title {
    margin-left: 10px;
    font-size: 26px;
    font-weight: bold;
    color: #1f2937;
  }
}

</style>
