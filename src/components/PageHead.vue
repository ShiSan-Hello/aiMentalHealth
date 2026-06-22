<template>
  <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <!-- 部分页面有案件，部分没有。采用插槽的语法来显示 -->
    <div class="action-btn">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '标题'
  }
})
</script>

<style lang="scss" scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .page-title {
    font-size: 24px;
    color: #2d3748;
  }
}
</style>
