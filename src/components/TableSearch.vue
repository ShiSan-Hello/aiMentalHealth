<template>
  <el-form ref="ruleFormRef" :model="formData">
    <el-row :gutter="24">
      <template v-for="item in formItemAttr" :key="item.prop">
        <el-col v-bind="item.col">
          <!-- 在element说明里，:label显示提示，:prop显示属性 -->
          <el-form-item :label="item.label" :prop="item.prop">
          <!-- 判断是input还是select组件 -->
         <!-- v-if不适合判断多个条件，判断太多条件需要写很多代码 -->
            <component v-model="formData[item.prop]" :is="isComp(item.comp)" :placeholder="item.placeholder">
            <template v-if="item.comp === 'select'">
              <el-option  label="全部" value="" />
              <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
             </template>
            </component>
          </el-form-item>
        </el-col >
    </template>
    </el-row>
    <el-row>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button  @click="handleReset(ruleFormRef)">重置</el-button>
    </el-row>
  </el-form>
</template>

<script setup>
import { ref, reactive,computed } from 'vue'

const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  }
})

// 计算属性，根据formItem动态生成formItem的属性
const formItemAttr= computed(() => {
  // props接受父组件传来的formItem数组，
  const formItem = props.formItem
  // 遍历formItem数组，为每个对象添加col属性，
  // col被24（组件默认栅格）传除后的数代表每一行可以放几个表单元素
  formItem.forEach(item => {
    // 参看element里layout下的col api文档
    item.col = { xs:24, sm:12, md:8, lg:6, xl:6 }
  })
  // 返回处理后的formItem数组
  return formItem
})


const isComp = (comp) => {
  return {
    input: 'elInput',
    select: 'elSelect'
  }[comp]
}

const emit = defineEmits(['search'])

// 初始化表单数据
const formData = reactive({})

// 处理查询
// 这里的'search'是defineEmits(['search'])自定义的事件名，
// emit触发'search'事件，将formData作为参数传递给父组件
// 父组件也需要@search绑定同样命名为search的函数，就可以接收查询参数并处理
const handleSearch = () => {
  console.log(formData)
  // emit('search', formData)
  // 把formData展开为对象，再传递给父组件
  emit('search', { ...formData })
  
}

// 处理重置
const ruleFormRef = ref()
const handleReset = (forEl) => {
  // 判断表单是否存在，不存在则直接返回
  if (!forEl) return

  // 重置表单数据，根据Element文档，找到可以用的resetFields方法，调用后表单数据会被重置为默认值
  forEl.resetFields()
  // 把重置后的formData传递给父组件
  emit('search', { ...formData })
}
</script>

