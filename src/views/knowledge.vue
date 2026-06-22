<template>
  <div>
    <!-- PageHead 是自定义组件，里面的 title 是组件的属性，buttons 是插槽的名称 -->
    <PageHead title="知识文章">
      <template #buttons>
        <el-button @click="handleEdit({})"  type="primary">新增</el-button>
        <!-- <el-button type="primary">编辑</el-button> -->
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch"></TableSearch>
  <el-table :data="tableData" stripe style="width: 100%;margin-top: 25px;">
 <!--fixed固定列 ，element-plus 提供的属性 --> 
       <el-table-column label="文章标题"  fixed="left">
      <!-- 通过插槽自定义内容 -->
      <template #default="scope">
        <div style="display: flex;align-items: center;">
          <el-icon><timer></timer></el-icon>
          <span>{{ scope.row.title }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column  label="分类" width="200">
      <!-- 通过插槽自定义内容 -->
      <template #default="scope">
        <div style="display: flex;align-items: center;">
          <el-icon><timer></timer></el-icon>
          <span>{{ categoryMap[scope.row.categoryId] }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="authorName" label="作者" width="150" />
    <el-table-column prop="readCount" label="阅读量" width="150" />
    <el-table-column prop="updatedAt" label="发布时间" width="150" />
    <el-table-column label="操作" width="240" fixed="right">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-button @click="handleEdit(scope.row)" text type="primary">编辑</el-button>
          <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2" text type="success">发布</el-button>
          <el-button @click="handleUnpublish(scope.row)" v-if="scope.row.status === 1" text type="warning">下线</el-button>
          <el-button @click="handleDelete(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2" text type="danger">删除</el-button>
        </div>
      </template>
    </el-table-column>

  </el-table>

  <el-pagination 
  style="margin-top: 25px;"
  :page-size="pagination.size" 
  layout="prev, pager, next" 
  :total="pagination.total" 
  @change="handleChange"
  />
  <ArticleDialog v-model:modelValue="dialogVisible" :article="currentArticle" :categories="categories" @success="handleSuccess"></ArticleDialog>

  </div>
</template>

<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { categoryTree, articlePage, getArticleDetail, updateArticleStatus, deleteArticle } from '@/api/admin'
import { onMounted, ref, reactive, computed, onUnmounted } from 'vue'
import ArticleDialog from '@/components/ArticleDialog.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAdminStore } from '@/stores/admin'

const formItem = [
  {comp: 'input', prop: 'title' , label: '标题', placeholder: '请输入标题'},
  {comp: 'select', prop: 'categoryId' , label: '分类', placeholder: '请选择分类'},
  // 不需要后台动态改变的
  {comp: 'select', prop: 'status' , label: '状态', placeholder: '请选择分类', options: [{
    label: '草稿',
    value: '0'
  },
  {
    label: '已发布',
    value: '1'
  },
  {
    label: '已下线',
    value: '2'
  }
   ]}
]

// 分页参数
const pagination = reactive({
  // 根据接口文档
  currentPage: 1,
  size: 10,
  total: 0,
})
// 回调，当用户点击搜索按钮时，要拿到用户输入的搜索条件，
const handleSearch = async (formData) => {
  // console.log(formData, '查询参数')
  // 合并分页参数和查询参数
  const params = {
    ...pagination,
    ...formData
  }

  // 调用接口获取分页数据
  const {records,total} = await articlePage(params)
  console.log(records, '文章列表') 
  pagination.total = total
  // 按更新时间倒序排列，最新的在前面
  tableData.value = records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  // tableData.value = records
  // const response = await articlePage(params)
  // console.log('接口完整响应:', response)
}

// 获取分类可以在页面加载完后
// onMounted(() => {
//   categoryTree().then(data => {
//     console.log(data, '分类树')
//   })
// })

// 分页回调
const handleChange = (page) => {
  pagination.currentPage = page
  handleSearch({})
}

// 分类映射
const categoryMap = reactive({})
// 分类列表
const categories = ref([])
// 列表数据
const tableData = ref([])
// 新增弹窗
const dialogVisible = ref(false)

// 新增成功回调
const handleSuccess = () => {
  // 新增成功后，关闭弹窗
  dialogVisible.value = false
  // 刷新列表
  handleSearch({})
}
// 当前文章数据，用于传给子组件
const currentArticle = ref(null)

// 新增和编辑文章
const handleEdit = (row) => {
  // if (!row.id) return
  if (!row.id) {
    // 新增
    currentArticle.value = null
    dialogVisible.value = true
  }else{
      // 编辑，调用接口获取文章详情
  getArticleDetail(row.id).then(res => {
    console.log(res, '文章详情')
    currentArticle.value = res
    dialogVisible.value = true
  })
  }
}

// 发布
const handlePublish = (row) => {
  ElMessageBox.confirm(`确定发布${row.title}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    updateArticleStatus(row.id, {status: 1}).then(res => {
      ElMessage.success('发布成功')
      handleSearch({})
    })
  })
}
// 下线
const handleUnpublish = (row) => {
  ElMessageBox.confirm(`确定下线${row.title}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    updateArticleStatus(row.id, {status: 2}).then(res => {
      ElMessage.success('下线成功')
      handleSearch({})
    })
  })
}
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除${row.title}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    deleteArticle(row.id).then(res => {
      ElMessage.success('删除成功')
      handleSearch({})
    })
  })
}



onMounted(async () => {
  const data = await categoryTree()
  console.log(data, '分类树')
  categories.value = data.map(item =>{
    categoryMap[item.id] = item.categoryName
    return {
      label: item.categoryName,
      value: item.id
    }
   })
  //  console.log(categories.value, '分类列表')
   formItem[1].options = categories.value

  //  获取数据列表
  handleSearch({})
})

</script>


