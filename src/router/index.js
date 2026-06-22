import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

// 路由配置
const backendRoutes = [
  //后台路由
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart'
        }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/Knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare'
        }
      },
      {
        path: 'consultations',
        component: () => import('@/views/Consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message'
        }
      },
      {
        path: 'emotional',
        component: () => import('@/views/Emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'user'
        }
      }
    ]
  },
  // 登录注册页路由
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: () => import('@/views/Login.vue'),
        meta: {
          title: '登录',
        }
      },
      {
        path: 'register',
        component: () => import('@/views/Register.vue'),
        meta: {
          title: '注册',
        }
      },
    ]
  }
]

// 前台路由
const frontendRoutes = [
  {
    path: '/',
    // redirect: '/knowledge',
    component: FrontendLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/home.vue'),
        // meta: {
        //   title: '首页',
        // }
      },
      {
        path: 'consultation',
        component: () => import('@/views/consultation.vue'),
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/emotionDiary.vue'),
      },
      {
        path: 'knowledge',
        component: () => import('@/views/frontendKnowledge.vue'),
      },
      {
        // 动态获取路由参数，:id代表动态参数
        path: 'knowledge/article/:id',
        component: () => import('@/views/articleDetail.vue'),
        // 动态获取路由参数，开启props后，路由可以传递参数
        // props: true 是 Vue Router 的一个语法糖，等价于：
        // <articleDetail :id="$route.params.id" />
        props: true,
      },
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  // routes: backendRoutes
  // 合并前台和后台路由
  routes: [...backendRoutes, ...frontendRoutes]
})



// 路由前置守卫，也就是页面跳转之前要做的操作
router.beforeEach((to, from, next) => {
  // 检查是否有token
  const token = localStorage.getItem('token')
  // 如果有token，且不是登录页，就跳转到首页
  if (token) {
    // 已经在用户信息定义了userType代表管理端，1代表用户端
    // 将返回的字符串转变为对象，再赋值
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo.userType == 2) {
      if (to.path.startsWith('/back')) {
        next()
      } else {
        next('/back/dashboard')
      }
    } else if (userInfo.userType == 1) {
      // 只能访问前台路由，而且已登录，就不能再进入登录页
      if (to.path.startsWith('/auth') || to.path.startsWith('/back')) {
        next('/')
      } else {
        next()
      }
    }
  } else {
    // 再次判断前台还是后台
    // 如果无token，访问了后台路径则返回登录页
    if (to.path.startsWith('/back')) {
      next()
    } else {
      next()
    }
  }
})

export default router
