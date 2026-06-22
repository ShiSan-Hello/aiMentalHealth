<template>
  <!-- :visible.sync="modelValue" 控制打开和关闭弹窗，一般用v-model来实现 -->
    <el-dialog
      :title="isEdit ? '编辑文章' : '新增文章'"
      v-model="dialogVisible"
      width="50%"
      @close="handleClose"
    >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" maxlength="200" show-word-limit clearable></el-input>
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择分类">
          <el-option v-for="item in props.categories" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文章摘要" prop="summary">
        <el-input type="textarea" v-model="formData.summary" placeholder="请输入摘要(可选)" maxlength="1000" show-word-limit clearable></el-input>
      </el-form-item>
      <el-form-item label="文章标签" prop="tags">
        <!-- 返回的tags是一个值，但是实际需要是一个数组，所以需要进行转换 -->
        <!-- <el-input v-model="formData.tags" placeholder="请输入标签(可选)" maxlength="100" show-word-limit clearable></el-input> -->
      <!-- multiple 多选，filterable 可以过滤选项（输入文字可以筛选），allow-create 允许用户创建新选项 -->
      <el-select
      v-model="formData.tagArray" 
      placeholder="请输入标签(可选)" 
      multiple
      filterable
      allow-create
      style="width: 100%"
      >
        <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="封面图片">
      <div el-cover-upload>
        <!-- :action="uploadUrl"，需要自定义，改为自己的上传接口 -->
         <!-- before-upload 上传前进行的操作 -->
          <!-- :http-request 上传的一个方法 -->
          <!-- :show-file-list 是否显示上传的文件列表 -->
          <!-- accept 上传的格式 -->
        <el-upload
          class="avatar-uploader"
          action="#"
          :before-upload="beforeUpload"
          :http-request="handleUploadRequest"
          :show-file-list="false"
          accept="image/*"
        >
          <div v-if="!imgUrl" class="cover-placeholder">
            <p>点击上传封面</p>
          </div>
            <img v-else :src="imgUrl" alt="封面图片" class="cover-image"></img>
        </el-upload>
        <div v-if="imgUrl" class="cover-remove">
          <el-button type="danger" size="small" @click="handleRemove">删除封面</el-button>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="文章内容" prop="content">
      <RichTextEditor 
      v-model="formData.content" 
      placeholder="请输入文章文本"
      :maxCharCount="5000"
      @change="handleContentChange"
      @created="handleEditorCreated"
      min-height="400px"
            />
    </el-form-item>
    <div v-if="btnPreview">
      <h3>内容预览</h3>
      <div v-html="formData.content"></div>
    </div>
    </el-form>
    <!-- el-form只能写内部定义的组件 -->
     <!-- 插槽要写在外侧 -->
    <template #footer>
      <el-button @click="btnPreview = !btnPreview">{{btnPreview ? '关闭预览' : '预览效果'}}</el-button>
      <el-button @click="handleClose">取消</el-button>
      <!-- loading 记载提示，防止重复提交 -->
      <el-button type="primary" @click="handleSubmit()" :loading="loading">{{isEdit ? '更新文章' : '创建文章'}}</el-button>
    </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, createArticle,updateArticle, getArticleDetail } from '@/api/admin'
import { fileBaseUrl } from '@/config/index.js'
import RichTextEditor from '@/components/RichTextEditor.vue'


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  article: {
    type: Object,
    // default: () => ({})
    // 为了在弹窗里定义一个字段，判断属于新增还是编辑，先设置为null
    default: () => (null)
  }
})

const handleClose = () => {
  // 重置表单，将所有字段重置为最开始赋值的状态，组件原生方法
  formRef.value.resetFields()
  // 重置businessId
  businessId.value = null
  // 重置标签，前面定义的tagArray是一个数组，但是重置的字段里是tags。需要手动清除tagArray
  formData.tagArray = []
  // 重置图片地址
  handleRemove()
  emit('update:modelValue', false)
}

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = computed({
  get () {
    return props.modelValue
  },
  set (val) {
    emit('update:modelValue', val)
  }
})

// 监听编辑的数据
watch (() => props.article, (newVal) => {
  if (newVal) {
    // 点击编辑再取消，然后点新增，此时可能formData没有创建，然后新增页会出现编辑页的内容
    // 所以设置nextTick，需要等 nextTick 完成，确保标签选择器更新完成
    // 还是不懂，ai也没有给出合适回答
    nextTick(() => {
      // formData = newVal
    // formData定义的reactive，直接赋值会导致原响应式对象被丢弃，失去响应式
    // 所以用Object.assign()方法，将newVal的属性赋值给formData
    Object.assign(formData, newVal)
    businessId.value = newVal.id
    imgUrl.value = fileBaseUrl + newVal.coverImage
    })
  }
})


const isEdit = computed(() => {
  // 双重!!代表把任意值转换为布尔值，true或false，
  // ？后面代表有则取id，无则未定义。两次!把结果转为布尔值，true或false，
  // !props.article?.id  // 取反：有 id 为 false，无 id 为 true
  // !!props.article?.id // 再取反：有 id 为 true，无 id 为 false
  return !!props.article?.id
})

// 分类列表
// 表单数据
const formData = reactive({
    "title": "",
    "content": "",
    "coverImage": "",
    "categoryId": 1,
    "summary": "",
    "tags": "",
    "id": "",
    // "tagArray": []
})
// 常用标签
const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠', 
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]

// 表单校验规则
const rules = reactive({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 200, message: '文章标题长度必须在200个字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { max: 5000, message: '文章内容长度必须在5000个字符之内', trigger: 'blur' }
  ],
})

// 上传封面图片
const imgUrl = ref('')
// 上传校验，必须返回值，否则上传会失败
const beforeUpload = (file) => {
  // 文件的对象
  console.log(file)
  // 校验文件类型
  const isImage = file.type.startsWith('image/')
  // 限制小于5M，由于获取的图片对象里大小为字节，需要转换
  const isLi5M=file.size / 1024 / 1024 < 5
  // 校验文件类型
  if (!isImage) {
    ElMessage.error('请选择图片格式，上传图片文件')
    return false
  }
  // 除了格式校验，还可以校验文件大小
  if (!isLi5M) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }

  return isImage
}
// 上传图片
const imageUpload = () => {}

const businessId = ref(null)
// 上传请求
const handleUploadRequest = async ({file}) => {
  // 生成唯一的UUID。crypto用于加密，randomUUID()用于生成随机UUID
  businessId.value = crypto.randomUUID()
  const fileRes = await uploadFile(file, {
    businessId: businessId.value
  })

  console.log(fileRes, '图片上传结果')
  // 拼接完整图片地址
  // imgUrl.value = `${fileBaseUrl}${fileRes.filePath}`
  imgUrl.value = fileBaseUrl + fileRes.filePath
  console.log(fileRes.filePath, 'fileRes.filePath')
  console.log(imgUrl.value, 'imgUrl.value')
  // 赋值给表单数据,传给后台的地址，后台只需要相对路径
  formData.coverImage = fileRes.filePath
}
// 删除封面
const handleRemove = () => {
  // 清空图片地址
  formData.coverImage = ''
  imgUrl.value = ''
}
// 富文本
const handleContentChange = (data) => {
  // console.log(data, 'data')
  formData.content = data.html
}

// 存储富文本实例
const editorInstance = ref(null)
// 文章完成，
const handleEditorCreated = (edtior) => {
  editorInstance.value = edtior
  // 编辑的情况下
  if (formData.content && editor) {
    nextTick(() =>{
          // 编辑的情况下，需要设置摘要
          // 异步的设置摘要，确保富文本实例初始化完成。
          // nextTick 是 Vue 提供的一个工具函数，作用是 在下次 DOM 更新完成后执行回调 。
          editor.setHtml(formData.content)
    })
  }
}

// 拿到表单的实例
const formRef = ref()

const btnPreview = ref(false)
const loading = ref(false)
 
const handleSubmit =  () => {
  // 校验表单，第一个参数是校验状态，第二个是表单元素
  formRef.value.validate((valid, fields) =>{
    if (valid) {
      loading.value = true
    } 
    // console.log(formData.tagArray, 'formData.tagArray')
    // 控制台输出发现没有tags和id
    console.log(formData, 'formData')
    const submitData = {
      ...formData,
      // categoryId: formData.categoryId,
      // 拼接标签
      tags: formData.tagArray.join(',')
    }
    // console.log(submitData, 'submitData')
    // console.log(formData.tagArray, 'formData.tagArray')
    delete submitData.tagArray

    if (!isEdit.value) {
      // 新增
      submitData.id = businessId.value
      createArticle(submitData).then(res => {
        loading.value = false
        emit('success')
      })
    }else{
      updateArticle(props.article.id,submitData).then(res => {
        loading.value = false
        emit('success')
      })
    }
  })
}
 
</script>

<style lang="scss" scoped>
.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 120px;
  color: #8b949e;
  background: #f6f8fa;
}
.cover-image {
  width: 120px;
  height: 120px;
  display: block;
}
</style>
