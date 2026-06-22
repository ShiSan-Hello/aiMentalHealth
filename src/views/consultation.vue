<template>
  <div class="consultation-container">
    <div class="sidebar">
        <div class="ai-assistant-info">
          <div class="breathing-circle">
            <el-image style="width: 25px; height: 25px;" :src="iconUrl" alt="AI助手" />
          </div>
          <h3 class="assistant-name">AI助手</h3>
          <div class="online-status">
            <div class="status-dot"></div>
            在线服务中
          </div> 
        </div>

        <!-- 情绪花园 -->
        <div class="emotion-garden">
          <div class="garden-header">
            <div class="garden-title">情绪花园</div>
          </div>
          <div class="emotion-info">
            <div class="emotion-name">情绪名称</div>
            <div class="emotion-score">情绪分数</div>
          </div>
          <div class="warm-tips">
            <div class="emotion-status-text">
                <span class="status-label">今天感觉</span>
                <span class="status-emotion">{{ currentEmotion.primaryEmotion? '需要关注' : '很不错' }}</span>
            </div>
            <div class="emotion-intensity">
                <span class="intensity-dots">
                    <span v-for="dot in 3" :key="dot" class="dot" :class="{'active':getIntensityClass(currentEmotion.emotionScore) >= dot}"></span>
                </span>
                <span class="intensity-text">
                    {{ getRiskText(currentEmotion.riskLevel) }}
                </span>
            </div>
            <!-- 温暖建议卡片 -->
             <!-- 返回字段没有建议时，不显示卡片内容 -->
             <div class="warm-suggestion" v-if="currentEmotion.suggestion">
                <!-- 💝 ✨ 🤗 -->
                <div class="suggestion-icon">💝</div>
                <div class="suggest-content">
                    <div class="suggest-title">小建议</div>
                    <div class="suggest-text">{{ currentEmotion.suggestion }}</div>
                </div>
             </div>
             <!-- 治愈行动卡片 -->
              <div class="healing-actions" v-if="currentEmotion.improvementSuggestions.length > 0">
                <div class="actions-title">治愈小行动</div>
                <div class="actions-list">
                    <div v-for="action in currentEmotion.improvementSuggestions" :key="action" class="action-item">
                        <div class="action-icon">✨</div>
                        <div class="action-text">{{ action }}</div>
                    </div>
                </div>
              </div>
              <!-- 风险提示 -->
               <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel >1 ">
                <!-- 💝 ✨ 🤗 -->
                <div class="notice-icon">🤗</div>
                <div class="notice-content">
                    <div class="title">温习提示</div>
                    <div class="text">{{ currentEmotion.riskDescription }}</div>
                </div>
               </div>
          </div>
        </div>
        <!-- 会话列表 -->
         <div class="session-history">
            <h4 class="section-title">会话历史</h4>
            <div class="session-list">
                <div v-for="session in sessionsList" :key="session.id" @click="handleSessionClick(session)"  class="session-item">
                    <div class="session-info">
                        <div class="session-title">
                            <span>{{ session.sessionTitle }}</span>
                            <div class="session-meta">
                                <span>{{ session.createdAt }}</span>
                            </div>
                            <div class="session-preview">{{ session.lastMessageContent }}</div>
                            <div class="session-status">
                                <span>
                                    <el-icon>
                                        <ChatRound />
                                    </el-icon>
                                    {{ session.messageCount || 0 }}
                                </span>
                                <span>
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    {{ session.durationMinutes || '0' }}
                                </span>
                            </div>
                        </div>
                        <div class="session-actions">
                            <el-button text @click="handleDeleteSession(session.id)" type="danger" size="small">
                                <el-icon>
                                    <DeleteFilled />
                                </el-icon>
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div class="chat-main">
        <div class="chat-header">
          <div class="header-left">
            <div class="chat-avatar">
              <el-image style="width: 30px; height: 30px;" :src="iconUrl1" alt="AI助手" fit="contain" />
            </div>
            <div class="chat-info">
              <h2>AI助手</h2>
              <p>您的贴心ai心理健康助理</p>
            </div>
          </div>
          <el-button style="height: 48px;width: 48px;" circle @click="createNewFrontendSession" title="新建会话">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </div>
        <div class="chat-messages">
          <!-- 判断如果没有消息记录，则发送ai默认消息 -->
           <div class="message-item ai-message" v-if="messageHistory.length === 0">
            <div class="message-avatar">
              <el-image style="width: 18px; height: 18px;" :src="iconUrl" />
            </div> 
            <div class="message-content">
              <div class="message-bubble">
                <p>你好，我是AI助手，我可以帮助你解决心理健康问题。</p>
              </div>
            <div class="message-time">刚刚</div>
            </div>
          </div>
          <!-- 消息列表渲染 -->
           <div v-for="msg in messageHistory" :key="msg.id" class="message-item" :class="msg.senderType === 1? 'user-message' : 'ai-message'">
            <div class="message-avatar">
                <el-image v-if="msg.senderType === 1" style="width: 18px; height: 18px;" :src="iconUrl2" />
                <el-image v-if="msg.senderType === 2" style="width: 18px; height: 18px;" :src="iconUrl" />
            </div> 
            <div class="message-content">
              <div class="message-bubble">
                <!-- 如果是ai回复且没有内容，则显示loading效果。正在思考中 -->
                <div v-if="msg.senderType === 2 && isAiTyping && !msg.content" class="typing-indicatar">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <!-- 如果后台访问大模型无效，返回的错误信息，那么前端也要处理并显示错误提示 -->
                 <div v-else-if="msg.isError" class="error-message">
                    <p>{{ msg.content }}</p>
                 </div>
                 <!-- ai返回的消息有表情，空格等需要额外组件处理 -->
                  <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.isError" :content="msg.content" :isAiMessage="true" />
                  <!-- 用户数据 -->
                   <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
              </div>
              <!-- 消息时间 -->
              <div class="message-time">{{msg.senderType === 2 && isAiTyping ? '正在输入中' : msg.createdAt }}</div>
            </div>
           </div>
        </div>

        <!-- 消息输入区 -->
         <div class="chat-input">
          <div class="input-container">
            <!-- textarea文本域,rows行数为3,
             禁用状态为isAiTyping，发送消息后禁用输入，根据后台返回ai是否回答完来解锁
             @keydown=handleKeydown，键盘监听 -->
            <el-input 
            v-model="userMessage" 
            placeholder="请输入消息" 
            clearable
            type="textarea"
            :rows="3"
            :disabled="isAiTyping"
            @keydown="handleKeydown"
            class="message-input"
            ></el-input>
            <div class="input-footer">
                <span>按enter发送，shift+enter换行</span>
                <span>{{ userMessage.length }} / 500</span>
            </div>
          </div>
          <!-- 绑定规则，字数不大于500 -->
          <el-button :disabled="!userMessage.trim() || userMessage.length > 500" class="send-btn" type="primary" @click="sendMessage">
            <el-icon>
              <Promotion />
            </el-icon>
          </el-button>
         </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted ,reactive} from 'vue'
import { startSession, getSessionsList, deleteSession, getSessionDetail, getSessionEmotion } from '@/api/frontend'
import {ElMessage} from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import {fetchEventSource} from '@microsoft/fetch-event-source'

const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const iconUrl1 = new URL('@/assets/images/like.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/users.png', import.meta.url).href

const createNewFrontendSession = () => {
  console.log('新建会话')
}
// 临时对话，初始默认消息
const createNewSession = () => {
  // 创建一个新的会话消息
  const newSession = {
    // 唯一标识，一般按照后台的规范.比如临时的标识拼接当前的时间戳
    sessionId: `temp_${Date.now()}`,
    // 临时对话状态
    status: 'TEMP',
    // 新对话
    sessionTitle: '新对话'
  }
  // 存储当前会话
  currentSession.value = newSession
}

// 定义一个当前会话对象
const currentSession = ref(null)
const sessionsList = ref([])

// // 定义对话消息
// const message = ref([])
// 定义用户输入
const userMessage = ref('')
// 定义是否正在发送消息
const isAiTyping = ref(false)
// 定义每一条历史消息
const messageHistory = ref([])

// 情绪花园
const currentEmotion = ref({
    primaryEmotion:'中性',
    emotionScore:50,
    isNegative:false,
    suggestion:'情绪状态平稳',
    improvementSuggestions:[],
})
const loadSessionEmotion = (sessionId) => {
    // <!-- 判断sessionId格式正确，根据接口应当是session_id格式 -->
    const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
    getSessionEmotion(id).then(res => {
        currentEmotion.value = res
    })
}

// 定义情绪强度的类名
const getIntensityClass = (score) => {
    if(score >= 61){
        return 3
    }else if(score >= 31){
        return 2
    }else{
        return 1
    }
}

// 定义情绪强度的文本
const getRiskText = (level) => {
    switch(level){
        case 0:
            return '正常'
        case 1:
            return '关注'
        case 2:
            return '预警'
        case 3:
            return '严重'
        default:
            return '正常'
    }
}



// 定义键盘监听函数
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    // 阻止默认行为，比如换行
    e.preventDefault()
    sendMessage()
  }
}
// 用户发送消息
const sendMessage = () => {
  // <!-- trim()去除首尾空格，判断用户是否真的输入 -->
  if (!userMessage.value.trim()) return
  // isAiTyping.value = true
  if(isAiTyping.value){
    ElMessage.error('AI助手正在回复中，请稍后')
    return
  }
  // 存储用户消息并清空输入框内容
  const message = userMessage.value.trim()
  userMessage.value = ''
  // 判断是在历史会话还是新建的会话
  // 没有历史记录或临时会话，就创建新会话
  if(currentSession.value.status === 'TEMP'){
    // 新建会话
    startNewSession(message)
  }else{
    // 继续当前会话
    messageHistory.value.push({
        id: Date.now(),
        senderType:1,
        content:message,
        createdAt:new Date().toLocaleString()
    })
    // ai回复，流式接口要调用
    startAIResponse(currentSession.value.sessionId, message)
  }
}

// 创建新的会话
const startNewSession = (message) => {
  // 构建绘画参数
  const sessionParams= {
    // 接口文档要求传入initialMessage和sessionTitle
    initialMessage: message,
  }
  // 如果是新对话则各一个新的标题，如果是历史会话则找回原来的标题
  if(currentSession.value.sessionTitle === '新对话'){
    // 新对话拼接当前时间的字符串作为标题
    sessionParams.sessionTitle = `AI助手 - ${new Date().toLocaleString()}`
  }else{
    // 历史会话找回原来的标题
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }
  // 调用后端接口创建新会话
  startSession(sessionParams).then(res => {
    // console.log(res)
    // 将后端返回的数据转为前端会话格式
    const sessionData =  {
        sessionId: res.sessionId,
        status: res.status,
        // 返回数据没有sessionTitle，所以用当前会话的sessionTitle
        sessionTitle: sessionParams.sessionTitle
    }
    // 如果是当前是临时会话，需要更新当前会话为正式会话
    // 当前会话存在且为TEMP状态，才更新当前会话为正式会话
    if(currentSession.value && currentSession.value.status === 'TEMP'){
    //   更新为正式会话，将后台返回数据和当前消息合并
        Object.assign(currentSession.value, sessionData)
    }else{
        // 非临时会话，直接赋值
        currentSession.value = sessionData
    }
    // 刷新会话列表
    getSessionsPage()
    // 添加用户消息到消息列表
    messageHistory.value.push({
        id: Date.now(),
        senderType:1,
        content:message,
        createdAt:new Date().toLocaleString()
    })
    // 更新流式对话
    startAIResponse(currentSession.value.sessionId, message)
  })
}

const startAIResponse = (sessionId,userMessage) =>{
    // 防止重复发送
    if(isAiTyping.value){
        ElMessage.error('AI助手正在回复中，请稍后')
        return
    }
  isAiTyping.value = true

//   三个点
  const aiMessage = {
    // 还没拿到后台内容，给一个唯一默认id
    // 拼接时间+随机字符串。转为0-9和a-z这36个字符，并且从第二个字符开始取
    id: `ai_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    senderType:2,
    content:'',
    // 返回一个日期格式
    createdAt:new Date().toLocaleString()
  }
  // 存储AI消息
  messageHistory.value.push(aiMessage)

//   调用流式接口，流式接口和普通接口不一样。需要第三方库
// 第一个参数是后台api，第二个接口是配置项
// AbortController()时JS里用于终止fetch请求，创建实例并接受
const ctrl = new AbortController()
// const signal = ctrl.signal      // 一个控制令牌
// 传给后台给出的流式回复接口。
fetchEventSource(`/api/psychological-chat/stream`,{
    // 请求方式，post或get等
    method:'POST',

    headers:{
        // 接受的JSON数据
        'Content-Type':'application/json',
        'Token':localStorage.getItem('token'),
        'Accept':'text/event-stream'
    },
    // 将接受对象转为JSON字符串
    body:JSON.stringify({
        sessionId,
        userMessage
    }),
    // 当Type为done时停止
    // 可以手动停止，需要定义ctrl实例
    signal: ctrl.signal,
    // onopen属性，当连接成功时，response监听返回的是不是需要的状态。
    // 这里看是不是流式
    onopen: (response) => {
        console.log(response,'连接成功')
        if (response.headers.get('Content-Type') !== 'text/event-stream') {
            ElMessage.error('服务器返回非流式数据')
        }
    },
    // 有正常返回的数据时，正常返回的数据在onmessage里
    onmessage: (event) => {
        // 获取到里面的data，并去除空格
        const raw = event.data.trim()
        if (!raw) return
        // 读取到event下的event属性
        const eventName = event.event
        // 获取到当前正在打印的ai消息，一格一格拼接的消息。
        const aiMessage = messageHistory.value[messageHistory.value.length - 1]
        // 当到达最后的done则停止
        if(eventName === 'done'){
            isAiTyping.value = false
            // 手动终止请求
            ctrl.abort()
            loadSessionEmotion(currentSession.value.sessionId)
            return
        }
        // 如果还没到done
        const payload = JSON.parse(raw)
        // 正常数据data里还有一个code属性，200为正常可以接受
        const ok = String(payload.code) === '200'
        // 状态正常且数据存在且有content属性，则进行追加拼接
        if(ok && payload.data && payload.data.content ){
            // 拼接内容
            aiMessage.content += payload.data.content
        }else if (!ok){
            // 错误数据提示
            handleStreamError(payload.message || 'AI回复失败')
        }
    },
    // 错误返回信息
    onerror: (err) => {
        handleStreamError(err || 'AI回复失败，请重试')
        throw err
    },
    // 连接关闭之后可进行操作
    onclose: () => {
        // 停止后的操作
        loadSessionEmotion(currentSession.value.sessionId)
    }
   }) 
}
// 流式错误处理
const handleStreamError = (error) => {
    // 当前一点流式数据
    const aiMessage = message.value[message.value.length - 1]
    if(aiMessage){
        aiMessage.content = "AI回复失败，请重试"
    }
    isAiTyping.value = false
    ElMessage.error("AI回复失败，请重试")
}

// 获取会话列表
const getSessionsPage = () => {
  getSessionsList(
    {
        pageNum: 1,
        pageSize: 10
    }
  ).then(res => {
    console.log(res)
    // 将后端返回的数据转为前端会话格式
    sessionsList.value = res.records
  })
}

// 获取会话数据
const handleSessionClick = (session) => {
    // 调用后端接口获取会话详情
    getSessionDetail(session.id).then(res => {
        console.log(res)
        // 将后端返回的数据转为前端会话格式
        messageHistory.value = res
    })
    // 点击历史会话，显示小卡片
    loadSessionEmotion(session.id)
    // 更新当前会话对象数据
    const sessionData = {
        sessionId: "session_" + session.id,
        status: 'ACTIVE',
        sessionTitle: session.sessionTitle
    }
    currentSession.value = sessionData
}
// 删除会话
// const handleDeleteSession = (sessionId) => {
//     deleteSession(sessionId).then(res => {
//         console.log(res)
//         ElMessage.success('删除成功')
//         // 刷新会话列表
//         getSessionsPage()
//     })
// }
// 发现bug，点击删除后，如果后台数据还没传过来，前端界面未刷新再点击刚才删除的记录企图变成当前会话，
// 后台会返回空的response，响应拦截器检测到就清除本地token和userInfo并跳回登录页，影响用户体验
// 解决方法：乐观更新。在点击删除后，备份记录信息并立刻显示删除后的效果。
// 等待后台传会数据。删除成功就弹提示，删除失败就回复备份并弹出提示
const handleDeleteSession = (sessionId) => {
    const oldList = [...sessionsList.value]  // 备份
    
    // 先移除（用户立即看到效果）
    sessionsList.value = sessionsList.value.filter(s => s.id !== sessionId)
    
    deleteSession(sessionId)
        .then(() => {
            ElMessage.success('删除成功')
        })
        .catch(() => {
            // 失败则恢复
            sessionsList.value = oldList
            ElMessage.error('删除失败，已恢复')
        })
}

// 历史消息中，用户消息处理。换行逻辑
const formatMessageContent = (content) => {
    // 将换行符替换为<br标签，实现换行效果
    return content.replace(/\n/g, '<br>')
}

onMounted(() => {
  // 初始化时创建一个临时会话，
  createNewSession()
  // 获取会话列表
  getSessionsPage()
})
</script>

<style lang="scss" scoped>
.consultation-container {
    margin: 0 auto;
    width: 1200px;
    display: flex;
    gap: 20px;
    padding: 20px;
    .sidebar {
        width: 320px;
        .ai-assistant-info {
            margin-bottom: 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(251, 146, 60, 0.08);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            .breathing-circle {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 12px;
                animation: breathing 4s ease-in-out infinite;
                box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
                position: relative;
            }
            .assistant-name {
                font-size: 16px;
                font-weight: 700;
                background: linear-gradient(135deg, #fb923c, #f59e0b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                background-clip: text;
                margin: 0 0 12px;
            }
            .online-status {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #059669;
                font-size: 12px;
                font-weight: 600;
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #059669;
                    border-radius: 50%;
                    margin-right: 8px;
                    animation: pulse 2s infinite;
                    box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
                }
            }
        }
        .session-history {
            background: white;
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            min-height: 250px;
            display: flex;
            flex-direction: column;
            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin: 0 0 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                
            }
            .session-list {
                overflow-y: auto;
                max-height: 200px;
                scrollbar-width: thin;
                scrollbar-color: rgba(64, 150, 255, 0.3) transparent;
                .session-item {
                    position: relative;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    &:hover {
                        background: #f8f9ff;
                        border-color: #e6f0ff;
                    }
                    &.active {
                        background: #e6f0ff;
                        border-color: #4096ff;
                    }
                    .session-info {
                        flex: 1;
                        .session-title {
                            font-weight: 500;
                            font-size: 14px;
                            color: #333;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            .session-meta {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                margin-bottom: 6px;
                                .session-time {
                                    font-size: 12px;
                                    color: #999;
                                }
                            }
                            .session-preview {
                                width: 200px;
                                font-size: 12px;
                                color: #666;
                                margin-bottom: 6px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                            .session-stats {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                span {
                                    font-size: 12px;
                                    color: #999;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                }
                            }
                        }
                        .session-actions {
                            position: absolute;
                            top: 10px;
                            right: 12px;
                        }
                    }
                }
                .no-sessions-text {
                    text-align: center;
                    font-size: 14px;
                    color: #999;
                }
            }
        }
        .emotion-garden {
            background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            min-height: 300px;
            
            .garden-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                position: relative;
                z-index: 2;
                .garden-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #8b4513;
                }
            }
            .emotion-info {
                margin: 0 auto;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.8);
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                color: #fff;
                .emotion-name {
                    font-size: 15px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .emotion-score {
                    font-size: 14px;
                    font-weight: 700;
                    opacity: 0.9;
                }
            }
            .warm-tips {
                text-align: center;
                margin-bottom: 16px;
                .emotion-status-text {
                    margin-bottom: 12px;
                    .status-label {
                        font-size: 14px;
                        color: #8b7355;
                        margin-right: 8px;
                    }
                    .status-emotion {
                        font-size: 16px;
                        font-weight: 600;
                        padding: 4px 12px;
                        border-radius: 16px;
                        display: inline-block;
                    }
                }
                .emotion-intensity {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    .intensity-dots {
                        display: flex;
                        gap: 4px;
                        .dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #e0e0e0;
                            transition: all 0.3s ease;
                            &.active {
                                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                                transform: scale(1.2);
                                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
                            }
                        }
                    }
                    .intensity-text {
                        font-size: 12px;
                        color: #8b7355;
                        font-weight: 500;
                    }
                }
                .warm-suggestion {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
                    border-radius: 16px;
                    padding: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                    .suggestion-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    .suggestion-content {
                        text-align: left;
                        flex: 1;
                        .suggestion-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #8b7355;
                            margin-bottom: 6px;
                        }
                        .suggestion-text {
                            font-size: 13px;
                            color: #6b5b47;
                            line-height: 1.5;
                        }
                    }
                }
                .healing-actions {
                    margin-bottom: 16px;
                    .actions-title {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #8b7355;
                        margin-bottom: 16px;
                    }
                    .actions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        .action-item {
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
                            border-radius: 12px;
                            padding: 12px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.5);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                            text-align: left;
                            .action-icon {
                                font-size: 14px;
                                color: #ffd700;
                                flex-shrink: 0;
                            }
                            .action-text {
                                font-size: 12px;
                                color: #6b5b47;
                                line-height: 1.4;
                                flex: 1;
                            }
                        }
                    }
                }
                .risk-notice {
                    background: linear-gradient(135deg, #fff9e6, #ffeaa7);
                    border-radius: 16px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    border: 1px solid rgba(255, 234, 167, 0.6);
                    box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);
                    .notice-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    .notice-content {
                        flex: 1;
                        .notice-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #d4840f;
                            margin-bottom: 6px;
                        }
                        .notice-text {
                            font-size: 13px;
                            color: #b8740c;
                            line-height: 1.5;
                        }
                    }
                }
            }
        }
    }
    .chat-main {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(251, 146, 60, 0.1);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        .chat-header {
            background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
            color: white;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            flex-shrink: 0;
            .header-left {
                display: flex;
                align-items: center;
                .chat-avatar {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    position: relative;
                    z-index: 1;
                }
                .chat-info {
                    h2 {
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 4px;
                    }
                    p {
                        font-size: 14px;
                    }
                }
            }
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
            min-height: 0;
            max-height: calc(100vh - 200px);
            scrollbar-width: thin;
            scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
            .message-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    flex-shrink: 0;
                }
                &.ai-message {
                    .message-avatar {
                        background: linear-gradient(135deg, #fb923c, #f59e0b);
                        box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
                    }
                }
                &.user-message {
                    .message-avatar {
                        background: linear-gradient(135deg, #6b7280, #4b5563);
                        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
                    }
                }
                .message-content {
                    max-width: 70%;
                    .message-bubble {
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
                        border-radius: 16px;
                        padding: 12px 16px;
                        position: relative;
                        animation: fadeInUp 0.4s ease-out;
                        border: 1px solid rgba(251, 146, 60, 0.1);
                        box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);
                        .typing-indicator {
                            display: flex;
                            gap: 4px;
                            padding: 8px 0;
                            .typing-dot {
                                width: 8px;
                                height: 8px;
                                background: #ccc;
                                border-radius: 50%;
                                animation: typing 1.5s ease-in-out infinite;
                                &:nth-child(2) {
                                    animation-delay: 0.2s;
                                }
                                &:nth-child(3) {
                                    animation-delay: 0.4s;
                                }   
                            }
                        }
                        /* 错误消息样式 */
                        .error-message {
                            background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
                            border: 1px solid #F87171;
                            border-radius: 12px;
                            padding: 12px 16px;
                            color: #991B1B;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                    }
                    .message-time {
                        font-size: 12px;
                        color: #999;
                        margin-top: 4px;
                    }
                }
            }
        }
        .chat-input {
            border-top: 1px solid rgba(251, 146, 60, 0.1);
            padding: 20px 24px;
            display: flex;
            gap: 12px;
            align-items: flex-end;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
            backdrop-filter: blur(10px);
            flex-shrink: 0;
            .input-container {
                flex: 1;
            }
            .input-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #78716c;
                font-weight: 500;
            }
            .send-btn {
                height: 60px;
                width: 60px;
                border-radius: 16px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
                border: none !important;
                box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
                transition: all 0.3s ease;
            }

        }

    }
}
</style>