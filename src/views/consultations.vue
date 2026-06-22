<template>
  <div>
      <PageHead title="咨询记录" />
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="creatTime" label="会话ID" width="200">
          <template #default="scope">
            <!-- 头像组件 -->
             <!-- scope是elemnet表格组件的插槽机制自带的，可以获取行、列、行索引等状态 -->
           <!-- scope.row是当前行的数据, -->
            <el-avatar >{{ scope.row.userNickname }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column  label="情绪日志">
          <template #default="scope">
            <div class="session-title">{{ scope.row.sessionTitle }}</div>
            <div class="session-preview">{{ scope.row.lastMessageContent }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="messageCount" label="消息数" width="100" />
        <el-table-column prop="messageCount" label="消息数" width="100" />
        <el-table-column  label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" text @click="viewSessionDetail(scope.row)">详情</el-button>
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
          <el-dialog
            v-model="showDetailDialog"
            title="咨询会话详情"
            width="70%"
            :close-on-click-modal="false"

            >
            <div class="session-detail">
              <div class="detail-header">
                <div class="detail-row">
                  <div class="detail-label">用户：</div>
                  <div class="detail-value">{{ sessionDetail.userNickname}}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">开始时间：</div>
                  <div class="detail-value">{{ sessionDetail.startedAt }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">消息数：</div>
                  <div class="detail-value">{{ sessionDetail.messageCount }}</div>
                </div>
              </div>
              <div class="messages-container">
                <div class="messages-header">
                  <h4>会话记录</h4>
                </div>
                <div class="messages-list" v-loading="loadingMessages">
                  <div v-for="session in sessionMessages" :key="session.id" class="message-item" :class="session.senderType ===1 ?'user-message':'ai-message'">
                    <div class="messages-header">
                      <span class="sender">{{session.senderType ===1 ?'user-message':'ai-message'}}</span>
                      <span class="time">{{session.createdAt}}</span>
                    </div>
                    <div class="messages-content">{{ session.content }}</div>
                  </div>
                </div>
              </div>
            </div>
           <template #footer>
            <el-button @click="showDetailDialog = false">关闭</el-button>
           </template>
          </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive, onMounted, toHandlers } from 'vue'
import PageHead from '@/components/PageHead.vue'
import { getConsultations, getSessionDetail } from '@/api/admin'

const tableData = ref([])
const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})

// 会话详情
const sessionDetail = ref({})
const sessionMessages = ref([])
const loadingMessages = ref(false)
const viewSessionDetail = (row) => {
  loadingMessages.value = true
  // 等待5s，模拟加载效果
  // 注意：计时器和then方法是同时执行的，
  // 想看到loading效果需要把then的loadingMessages.value = false注释掉
  // setTimeout(() => {
  //   loadingMessages.value = false
  // }, 5000)
  getSessionDetail(row.id).then(res => {
    // sessionDetail.value = res
    sessionMessages.value = res
    sessionDetail.value = row
    showDetailDialog.value = true
    loadingMessages.value = false
  })

}

const handleChange = (page) =>{
  pagination.currentPage = page
  handleSearch()
}

const handleSearch = () => {
  getConsultations(pagination).then(res => {
    const { records,total } = res
    tableData.value = records
    pagination.total = total
  })
}

const showDetailDialog = ref(false)

onMounted(() => {
  handleSearch()
})

</script>

<style lang="scss" scoped>
 .session-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  .session-preview {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .session-detail {
    max-height: 70vh;
    overflow-y: auto;
    .detail-header {
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      :last-child {
        margin-bottom: 0;
      }
      .detail-label {
        font-weight: 500;
        color: #495057;
        min-width: 80px;
        margin-right: 8px;
      }

      .detail-value {
        color: #333;
      }
    }
  }
  .messages-container {
    margin-top: 20px;
    .messages-header {
      margin-bottom: 16px;
      h4 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 500;
      }
    }
    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      .message-item {
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        :last-child {
          margin-bottom: 0;
        }
        &.user-message {
          background: #e8f4fd;
        }

        &.ai-message {
          background: #f0f9f0;
        }
      }
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .sender {
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .time {
          font-size: 12px;
          color: #999;
        }

        .message-content {
          color: #333;
          line-height: 1.6;
          white-space: pre-wrap;
          margin-top: 8px;
          font-size: 14px;
        }
      }
    }
  }
</style>