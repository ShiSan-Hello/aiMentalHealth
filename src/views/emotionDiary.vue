<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="iconUrl" alt="logo" style="width: 60px; height: 60px;" />
        <h1>情绪日记</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 情绪评分 -->
      <div class="diary-card">
        <div class="title">今日情绪评分</div>
        <div class="section">
          <p>今天情绪状态如何</p>
        </div>
        <div class="rate">
          <el-rate
            v-model="diaryData.moodScore"
            :text="emotionStatus[diaryData.moodScore-1]"
            show-texts
            :max="10"
            size="large"
          />
        </div>
      </div>
      <!-- 主要情绪 -->
      <div class="diary-card">
        <div class="title">主要情绪</div>
        <div class="emotion-grid">
          <!-- 点击将情绪表示传给diaryData.dominantEmotion，在比较相等就可保证只选择一个情绪 -->
          <div 
          :class="{'selected': item.name === diaryData.dominantEmotion}" 
          @click="selectEmotion(item.name)" 
          v-for="item in emotionOptions" 
          :key="item.name" 
          class="emotion-card">
            <el-image :src="item.url" alt="emotion" style="width: 60px; height: 60px;" />
            <div class="emotion-name">{{item.name}}</div>
          </div>
        </div>
      </div>
      <!-- 详细记录 -->
      <div class="diary-card">
        <div class="title">详细记录</div>
        <div class="detail-form">
          <div class="form-group">
            <div class="emotionTriggers">情绪触发因素</div>
            <el-input v-model="diaryData.emotionTriggers" placeholder="请输入情绪触发" type="textarea" :rows="3" maxlength="1000" show-word-limit></el-input>
          </div><div class="form-group">
            <div class="emotionTriggers">今日感想</div>
            <el-input v-model="diaryData.diaryContent" placeholder="写下今日想法" type="textarea" :rows="5" maxlength="2000" show-word-limit></el-input>
          </div>
          <!-- 生活指标 -->
            <div class="life-indicators">
              <div class="indicator-group">
                <div class="form-label">睡眠质量</div>
                <el-select v-model="diaryData.sleepQuality" placeholder="请选择睡眠质量">
                  <el-option label="很差" :value="1"></el-option>
                  <el-option label="较差" :value="2"></el-option>
                  <el-option label="一般" :value="3"></el-option>
                  <el-option label="良好" :value="4"></el-option>
                  <el-option label="优秀" :value="5"></el-option>
                </el-select>
              </div>
              <div class="indicator-group">
                <div class="form-label">压力水平</div>
                <el-select v-model="diaryData.stressLevel" placeholder="请选择压力水平">
                  <el-option label="很低" :value="1"></el-option>
                  <el-option label="较低" :value="2"></el-option>
                  <el-option label="中等" :value="3"></el-option>
                  <el-option label="较高" :value="4"></el-option>
                  <el-option label="很高" :value="5"></el-option>
                </el-select>
              </div>
            </div>
            <div class="action-buttons">
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" @click="submit">提交</el-button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted ,reactive} from 'vue'
import {dayjs} from 'element-plus'
import { addEmotionDiary } from '@/api/frontend'
import { ElMessage } from 'element-plus'

const iconUrl= new URL('@/assets/images/like.png', import.meta.url).href
// 情绪评分
const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']
// 情绪选项
const emotionOptions = [
  {name: '开心', url: new URL('@/assets/images/开心.png', import.meta.url).href},
  {name: '平静', url: new URL('@/assets/images/平静.png', import.meta.url).href},
  {name: '焦虑', url: new URL('@/assets/images/焦虑.png', import.meta.url).href},
  {name: '悲伤', url: new URL('@/assets/images/悲伤.png', import.meta.url).href},
  {name: '兴奋', url: new URL('@/assets/images/兴奋.png', import.meta.url).href},
  {name: '疲惫', url: new URL('@/assets/images/疲惫.png', import.meta.url).href},
  {name: '惊讶', url: new URL('@/assets/images/惊讶.png', import.meta.url).href},
  {name: '困惑', url: new URL('@/assets/images/困惑.png', import.meta.url).href},
]

const diaryData = reactive({
    diaryDate: dayjs().format('YYYY-MM-DD'),
    moodScore: null,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null,
})

// 选择主要情绪
const selectEmotion = (emotion) => {
    diaryData.dominantEmotion = emotion
}

// 重置，没有api就手动清空
// 当前数据和默认数据合并
const resetForm = () => {
    Object.assign(diaryData, {
        moodScore: null,
        dominantEmotion: '',
        emotionTriggers: '',
        diaryContent: '',
        sleepQuality: null,
        stressLevel: null,
    })
}
// 提交，没有api就手动提交
const submit = () => {
    console.log(diaryData)
    if (!diaryData.moodScore) {
        ElMessage.error('请选择情绪评分')
        return
    }
    addEmotionDiary(diaryData).then( () => {
            ElMessage.success('提交成功')
            resetForm()
    })
}

</script>

<style lang="scss" scoped>
.emotionDiary-container {
    background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
    .header-section {
        background: linear-gradient(135deg, #7ED321 0%, #F5A623 100%);
        color: white;
        padding: 48px;
        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
    .content {
        margin: 0 auto;
        width: 980px;
        padding: 20px;
        .diary-card {
            margin-bottom: 20px;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            .title {
                margin-bottom: 20px;
                font-size: 25px;
                font-weight: 600;
                color: #374151;
            }
            .section {
                margin-bottom: 20px;
                p {
                    font-size: 15px;
                    color: #6B7280;
                    margin-bottom: 15px;
                }
            }
            .emotion-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                .emotion-card {
                    padding: 15px;
                    border: 2px solid #E5E7EB;
                    border-radius: 15px;
                    text-align: center;
                    cursor: pointer;
                    background: #F9FAFB;
                    .emotion-name {
                        margin-top: 10px;
                        padding: 0 75px;
                        color: #374151;
                    }
                    &.selected {
                        border-color: #7ED321;
                        background: #F0FDF4;
                        transform: translateY(-3px);
                    }
                }
            }
            .detail-form {
                .form-label {
                    margin: 10px 0;
                    color: #374151;
                }
                .life-indicators {
                    display: flex;
                    gap: 20px;
                    .indicator-group {
                        flex: 1;
                    }
                }
                .action-buttons {
                    margin-top: 40px
                }
            }
        }
    }
}
</style>