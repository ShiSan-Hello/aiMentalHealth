<template>
  <div class="container">
    <div class="title">
      <div class="title-text">
        <h2>注册您的账号</h2>
        <p>注册后即可开始使用</p>
      </div>
    </div>

    <!-- 表单部分 -->
     <div class="form-container">
      <el-form
      ref="submitFormRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" size="large" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" size="large" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" size="large" placeholder="请输入昵称"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" size="large" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" show-password v-model="formData.password" size="large" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input type="password" show-password v-model="formData.confirmPassword" size="large" placeholder="请确认密码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="btn" type="primary" size="large" @click="submitForm(submitFormRef)">注册</el-button>
      </el-form-item>

    </el-form>
     </div>

  </div>
</template>

<script setup>
import { ref,reactive, onMounted } from 'vue'
import { register } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const formData = reactive(
  {
    "username": "",
    "email": "",
    "nickname": "",
    "phone": "",
    "password": "",
    "confirmPassword": "",
    "gender": 0,
    "userType": 1
})

const rules = reactive({
  username: [
    // required: true 表示必需填写项，trigger: 'blur' 表示在失去焦点时触发验证验
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' }
  ],
})

// 获取到表单
const submitFormRef = ref(null)
const router = useRouter()
const submitForm = async (formEl) => {
  if (!formEl) {
    return
  }
  formEl.validate( async (valid) => {
    // 拿到后台数据进行验证是否重复
    register(formData).then(({data}) =>{
      console.log(data)
      if(!data){
        ElMessage.success('注册成功')
        // 需要引入useRouter方法，才能使用router.push方法跳转路由
        router.push('/auth/login')
      }
      if(data.code === "BUSINESS_ERROR"){
        ElMessage.error(data.message)
      }
    })
  })
}
onMounted(() => {
  console.log("测试")
})



</script>

<style lang="scss" scoped>
.container {
    width: 384px;
    .flex-box {
        display: flex;
        align-items: center;
    }
    .title {
        .title-text {
            text-align: center;
            h2 {
                font-size: 36px;
                margin-bottom: 10px;
            }
            p {
                font-size: 18px;
                color: #6b7280;
            }
        }
    }
    .form-container {
        margin-top: 30px;
        .btn {
            margin-top: 40px;
            width: 100%;
        }
        .footer {
            padding: 30px;
            text-align: center;
        }
    }
}
</style>