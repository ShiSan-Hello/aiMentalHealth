// 下载后引入axios
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  // 请求前缀
  baseURL: '/api',
  // 超时时间
  timeout: 5000
})

// 请求拦截器
// 巧用实例的.interceptors.request.use方法
service.interceptors.request.use(
  // 请求拦截器
  config => {
    // console.log('完整 config:', config)
    // 在发送请求之前做些什么
    // 获取token
    const token = localStorage.getItem('token')
    // 如果有token，就添加到请求头中
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  // 请求拦截器错误处理
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
// 巧用实例的.interceptors.response.use方法
service.interceptors.response.use(
  // 响应拦截器
  response => {
    // 对响应数据做点什么,data就是从后端返回的数据
    const { data, config } = response
    // 在开发工具中网络下的Headers可以查看一个Status Code，200表示请求成功，这是网络请求自带了
    // 而在后端返回的data中， 还会有一业务码code 200 表示请求成功，需要和网络码区分开
    // if (data.code === 200) {
    if (data.code === '200') {
      // console.log(data.data)
      return data.data
    }
    // 其他状态码，都认为是失败
    else {
      // -1一般代表超时，比如用户长时间未操作
      if (data.code === '-1') {
        // 如果在登陆页面就不重新登录
        if (!config.url.includes('/login')) {
          ElMessage.error(data.msg || '登录超期，请重新登录')
          // 清除登陆信息
          // 清除本地存储中的token
          localStorage.removeItem('token')
          // 用户信息也在本地存储中，也需要清除
          localStorage.removeItem('userInfo')
          // 跳转到登录页
          // router.push('/auth/login')
          window.location.href = '/auth/login'
        }
        // 其他页面，就重新登录
        else {
          ElMessage.error(data.msg || '登录超期，请重新登录')
          return Promise.reject("网络请求失败。。")
        }
      }
    }
    return response
  },
  // 响应拦截器错误处理
  error => {
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default service