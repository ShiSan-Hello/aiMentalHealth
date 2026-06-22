import service from '@/utils/request'

export function login(data) {
  return service.post('/user/login', data)
}

export function categoryTree() {
  return service.get('/knowledge/category/tree')
}

export function articlePage(params) {
  return service.get('/knowledge/article/page', { params: params })
}

// file来自element-plus的el-upload组件，businessInfo是后台要求
export function uploadFile(file, businessInfo) {
  // 创建一个FormData对象
  const formData = new FormData()
  // formData 是一个表单数据对象，看作盒子，里面可以放文件、字符串、数字等
  // append往里面当数据。参数代表标签，第二个参数内容
  formData.append('file', file)
  // 根据后台要求，需要传递businessType，按照实例传递写死的
  formData.append('businessType', 'ARTICLE')
  formData.append('businessId', businessInfo.businessId)
  formData.append('businessField', 'cover')
  // 第三个参数是配置项，这里固定设置Content-Type为multipart/form-data
  return service.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function createArticle(data) {
  return service.post('/knowledge/article', data)
}

export function getArticleDetail(id) {
  return service.get(`/knowledge/article/${id}`)
}


export function updateArticle(id, data) {
  return service.put(`/knowledge/article/${id}`, data)
}

export function updateArticleStatus(id, data) {
  return service.put(`/knowledge/article/${id}/status`, data)
}

export function deleteArticle(id) {
  return service.delete(`/knowledge/article/${id}`)
}

export function getConsultations(params) {
  return service.get('/psychological-chat/sessions', { params: params })
}

export function getSessionDetail(sessionId) {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

export function getEmotionalPage(params) {
  return service.get('/emotion-diary/admin/page', { params: params })
}

export function getAnalyticsOverview() {
  return service.get('/data-analytics/overview')
}

export function lgout() {
  return service.post('/user/logout')
}

export function deleteEmotional(id) {
  return service.delete(`/emotion-diary/admin/${id}`)
}

