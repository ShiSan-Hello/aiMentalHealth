<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

</script>

<template>
  <div class="backend-layout">
    <el-container class="main-container">
      <Sidebar></Sidebar>
      <el-container>
        <el-header>
          <Navbar></Navbar>
        </el-header>
        <!-- 主内容区域，作为子路由 -->
        <el-main class="main-content">
          <router-view class="content-container"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.backend-layout {
  height: 100vh;
  .el-header {
    height: 75px !important;
  }
  // 自动继承父级的100%的高度
  .main-container {
    height: 100%;
    .content-container {
      padding: 20px;
      // margin-top: 20px;
      background-color: #fff;
      min-height: calc(100% - 75px);
    }
  }
}

</style>

