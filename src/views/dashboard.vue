<template>
  <div class="dashboard-container">
    <!-- 上方四卡片 -->
    <!-- 栅格间隔 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar users">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl1"/>
            </div>
            <div class="info">
              <p class="title">总用户数</p>
              <p class="number">{{ aiData.systemOverview.totalUsers}}</p>
              <p class="subtitle-title">活跃用户：{{aiData.systemOverview?.activeUsers || 0}}</p>
            </div>
          </div>  
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar like">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl2"/>
            </div>
            <div class="info">
              <p class="title">情绪日志</p>
              <p class="number">{{ aiData.systemOverview.totalDiaries}}</p>
              <p class="subtitle-title">今日新增：{{aiData.systemOverview?.totalNewDiaries || 0}}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar comments">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl3"/>
            </div>
            <div class="info">
              <p class="title">咨询会话</p>
              <p class="number">{{ aiData.systemOverview.totalSessions}}</p>
              <p class="subtitle-title">今日新增：{{aiData.systemOverview?.totalNewSessions || 0}}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar smile">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl4"/>
            </div>
            <div class="info">
              <p class="title">平均情绪</p>
              <p class="number">{{ aiData.systemOverview.avgMoodScore}} / 10</p>
              <p class="subtitle-title">情绪健康指数</p>
            </div>
          </div>
        </el-card>
      </el-col>

    <!-- 中间图表 -->
      <el-col :span="12" style="margin-top: 20px;">
        <el-card style="width: 100%;  ">
          <template #header>
            <div class="card-header">情绪趋势分析</div>
          </template>
           <div class="chart-content">
             <div ref="emotionChartRef" style="height: 300px;width: 100%;"></div>
           </div>
        </el-card>
      </el-col>
      <el-col :span="12" style="margin-top: 20px;">
        <el-card  style="width: 100%; ">
          <template #header>
            <div class="card-header">咨询会话统计</div>
          </template>
          <div class="chart-content">
            <div v-if="aiData.consultationStats" class="consultation-stats">
              <div class="stat-item">
                <div class="stat-label">总对话数</div>
                <div class="stat-value">{{ aiData.consultationStats?.totalSessions || 0}}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均时长</div>
                <div class="stat-value">{{ aiData.consultationStats?.avgDurationMinutes || 0}} 分钟</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ aiData.systemOverview?.activeUsers || 0}}</div>
              </div>
            </div>
           <div ref="consulationChartRef" style="height: 260px;width: 100%;"></div>
           </div> 
        </el-card>
      </el-col>
     </el-row>

  </div>
</template>


<script setup>
import { getAnalyticsOverview } from '@/api/admin'
import { ref,reactive,onMounted,onUnmounted } from 'vue'
// 这种写法是引入，然后用echarts接收
import * as echarts from 'echarts'
// import { init } from 'echarts/types/src/echarts.all.js'


// 接受后台数据
const aiData = ref({})
// 统计图片引入
const iconUrl1 = new URL('@/assets/images/users.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/like.png', import.meta.url).href
const iconUrl3 = new URL('@/assets/images/comments.png', import.meta.url).href
const iconUrl4 = new URL('@/assets/images/smile.png', import.meta.url).href

// 情绪趋势，图表
const emotionChartRef = ref(null)
// 图表实例
let emotionChart = null
let emotionObserver = null

// 初始化图表
const initCharts = () =>{
  initEmotionChart()
  initConsulationChart()
}

// 接收echarts实例
let consulationChart = null
let consulationObserver = null
// 接收DOM节点
const consulationChartRef = ref(null)
// 初始化情绪图表
const initEmotionChart = () =>{
  // 先判断DOM节点是否存在
  if(!emotionChartRef.value){
    return
  }
  // 销毁现有图标，如果需要实时更新，需要销毁重绘
  if(emotionChart){
    // dispose() 方法用于销毁图表实例，释放资源。
    // 注意：销毁图表后，图表实例将无法再使用，需要重新初始化
    emotionChart.dispose()
  }
  emotionChart = echarts.init(emotionChartRef.value)
  console.log(emotionChart,"emotionChart实例")

  const TrendData = aiData.value.emotionTrend
  const option = {
    title: {
      text: '情绪趋势分析',
      textStyle: {
        color: '#2d3436',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    // 鼠标在图表中有提示框
    tooltip: {
      trigger: 'axis',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        fontSize: 14,
        color: '#2d3436'
      }
    },
    // 可选择图例
    legend:{
      data: ['平均情绪分','记录数量'],
      top: 40,
    },
    // grid可以控制图表的布局和样式
    grid: {
      left: '3%',
      right: '4%',
      top: 80,
      bottom: '3%',
    },
    xAxis: {
      type: 'category',
      // 把对象的date提取出来组成新数组
      data: TrendData.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#2d3436'
        }
      }
    },
    yAxis: [{
      // 有左右两边，需要接收数组
      type: 'value',
      name:'情绪评分',
      position:'left',
      axisLine: {
        // color: '#2d3436'
        lineStyle: {
          color: '#2d3436'
        }
      }
    },{
      // 有左右两边，需要接收数组
      type: 'value',
      name:'记录数量',
      position:'right',
      axisLine: {
        // color: '#2d3436'
        lineStyle: {
          color: '#2d3436'
        }
      }
    }],
    // 代表图表数据
    series: [{
        name: '平均情绪分',
        // type是显示的效果如折线图、柱状图等
        type: 'line',
        data: TrendData.map(item => item.avgMoodScore),
        // 使用平滑曲线
        smooth: true,
        // 平滑折现的样式
        lineStyle: {
          width: 3,
          color: '#faebaf'
        },
        // 点的样式
        itemStyle: {
          color: '#faebaf'
        }
      },{
        name: '记录数量',
        // type是显示的效果如折线图、柱状图等
        type: 'line',
        data: TrendData.map(item => item.recordCount),
        // 使用平滑曲线
        smooth: true,
        // 平滑折现的样式
        lineStyle: {
          width: 3,
          color: '#eeb5a3'
        },
        // 点的样式
        itemStyle: {
          color: '#eeb5a3'
        }
      }
    ]
  }

  // 渲染图表
  emotionChart.setOption(option)

  // ResizeObserver 监听容器大小变化，自动自适应
  if (emotionObserver) emotionObserver.disconnect()
  emotionObserver = new ResizeObserver(() => {
    emotionChart && emotionChart.resize()
  })
  emotionObserver.observe(emotionChartRef.value)
}

// 初始化咨询图表
const initConsulationChart = () =>{
  // 先判断DOM节点是否存在
  if(!consulationChartRef.value){
    return
  }
  // 销毁现有图标，如果需要实时更新，需要销毁重绘
  if(consulationChart){
    // dispose() 方法用于销毁图表实例，释放资源。
    // 注意：销毁图表后，图表实例将无法再使用，需要重新初始化
    consulationChart.dispose()
  }
  consulationChart = echarts.init(consulationChartRef.value)
  // 获取数据
  const dailyTrend = aiData.value.consultationStats?.dailyTrend || []
  const option = {
  title: {
    text: '咨询活动统计',
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#2d3436'
    },
    left: 'center',
    top: 10
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#fab1a0',
    borderWidth: 1,
    textStyle: {
      color: '#2d3436'
    }
  },
  legend: {
    data: ['会话数量', '参与用户数'],
    top: 40,
    textStyle: {
      color: '#636e72'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 80,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: dailyTrend.map(item => item.date),
    axisLine: {
      lineStyle: {
        color: 'rgba(244, 162, 97, 0.3)'
      }
    },
    axisLabel: {
      color: '#636e72'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#636e72'
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(244, 162, 97, 0.3)'
      }
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(244, 162, 97, 0.1)'
      }
    }
  },
  series: [
    {
      name: '会话数量',
      type: 'bar',
      data: dailyTrend.map(item => item.sessionCount),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#74b9ff' },
            { offset: 1, color: '#0984e3' }
          ]
        }
      },
      barWidth: '40%'
    },
    {
      name: '参与用户数',
      type: 'bar',
      data: dailyTrend.map(item => item.userCount),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#fdcb6e' },
            { offset: 1, color: '#f39c12' }
          ]
        }
      },
      barWidth: '40%'
    }
  ]
}
// 渲染图表
consulationChart.setOption(option)

  // ResizeObserver 监听容器大小变化，自动自适应
  if (consulationObserver) consulationObserver.disconnect()
  consulationObserver = new ResizeObserver(() => {
    consulationChart && consulationChart.resize()
  })
  consulationObserver.observe(consulationChartRef.value)
}

onMounted(() => {
  // console.log('onMounted 执行了')  // 加这行
  getAnalyticsOverview().then(res => {
    console.log(res)
    aiData.value = res
    initCharts()
  })
})

onUnmounted(() => {
  if (emotionChart) {
    emotionChart.dispose()
    emotionChart = null
  }
  if (consulationChart) {
    consulationChart.dispose()
    consulationChart = null
  }
  if (emotionObserver) {
    emotionObserver.disconnect()
    emotionObserver = null
  }
  if (consulationObserver) {
    consulationObserver.disconnect()
    consulationObserver = null
  }
})

</script>

<style lang="scss" scoped>
.dashboard-container {
    .card-content {
      display: flex;
      align-items: center;
      .avatar {
        margin-right: 12px;
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.users {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        &.like {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        &.comments {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        &.smile {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }
      .info {
        .title {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 4px;
        }
        .value {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 4px
        }
        .subtitle-title {
          font-size: 12px;
          color: #95a5a6;
        }
      }
    }
    .chart-content {
      padding: 20px;
      height: 300px;
      position: relative;

      canvas {
        width: 100% !important;
        height: 100% !important;
      }

      .consultation-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;

        .stat-item {
          text-align: center;

          .stat-label {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
          }
        }
      }
    }
  }
</style>
