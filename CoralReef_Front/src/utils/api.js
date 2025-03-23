import axios from 'axios'

// 创建axios实例（避免污染全局axios）
const api = axios.create({
  baseURL: 'http://localhost:8080', // 基础路径
  timeout: 10000, // 超时时间
  withCredentials: true // 关键：允许携带凭证
})

// 请求拦截器
api.interceptors.request.use(config => {
  // 从cookie中获取token（匹配jwt=后面的值）
  const cookieString = document.cookie
  const jwtCookie = cookieString.split('; ')
    .find(row => row.startsWith('jwt='))
  const token = jwtCookie ? jwtCookie.split('=')[1] : null

  // 添加Authorization头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器（处理401未授权）
api.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response?.status === 401) {
    // 清除cookie并跳转登录页
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

export default api