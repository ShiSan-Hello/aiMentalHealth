<template>
  <div class="container">
    <div class="title">
      <div class="back-home">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回首页</span>
      </div>
      <div class="title-text">
        <h2>登录您的账号</h2>
        <p>登录后即可开始使用</p>
      </div>
    </div>
    <div class="form-container">
      <!-- 输入框的验证规则 -->
      <!-- 标签位置为顶部，默认为左侧 -->
      <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      >
      <el-form-item label="用户名和邮箱" prop="username">
        <el-input v-model="formData.username" size="large" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <!-- 加上type="password" 表示密文输入 -->
        <el-input type="password" show-password v-model="formData.password" size="large" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-button class="login-btn" type="primary" size="large" @click="submitForm(ruleFormRef)">登录</el-button>
      </el-form>

      <div class="footer">
        <!-- router-link 组件用于跳转路由，点击后跳转到注册页 -->
        <p>还没有账号？<router-link to="/auth/register">去注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/admin'

const router = useRouter()

const ruleFormRef = ref()
const formData = reactive({
  // 具体名字根据后端接口确定
  username: '',
  password: ''
})
const rules = reactive({
  username: [
    // required: true 表示必需填写项，trigger: 'blur' 表示在失去焦点时触发验证验
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

const submitForm = async (formEl) => {
  if (!formEl) {
    return
  }
  // 查看官方文档
  // validate 代表当前的状态。
  // fields 代表当前的表单数据
  await formEl.validate((valid,fields) => {
    if (valid) {
      // console.log(formData, 'formData')
      // 通过.then可以拿到异步的结果
      login(formData).then(data => {
        //  console.log(data)
        // 判断token是否存在
        if(!data.token){
          return console.error("登录失败，返回数据：", data)
        }
        // 登录成功，将token存储到localStorage
        localStorage.setItem('token', data.token)
        // 缓存里是字符串，需要转换为对象
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        // 跳转到首页
        // router.push('/auth') 
        // 在用户信息里有一个userType决定登陆者是管理端还是用户端
        if(data.userInfo.userType === 2){
          router.push('/back/knowledge')
        }else{
          router.push('/')
        }
      })
    } else {
      console.log('表单验证失败', fields)
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
    width: 384px;
    .title{
      .back-home{
        margin-bottom: 60px;
      }
      .title-text{
        text-align: center;
        
        h2{
          font-size: 36px;
          margin-bottom: 10px;
        }
        p{
          font-size: 20px;
          color: #6b7280;
        }
      }
    }
    .form-container{
      margin-top: 30px;
      .login-btn{
        margin-top: 40px;
        width: 100%;
      }
      .footer{
        margin-top: 40px;
        text-align: center;
        // p{
        //   font-size: 20px;
        //   color: #6b7280;
        // }
      }
    }
}
</style>