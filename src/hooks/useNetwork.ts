/**
 * Meta2d 网络连接管理模块
 * 支持 WebSocket、MQTT、HTTP 轮询三种通信方式
 */

import type { Meta2d } from '@meta2d/core'
import { parseMessage, isValidMessage, handleMessages as handleMeta2dMessages } from '@/utils/messageHandler'

// ==================== 类型定义 ====================

interface HttpConfig {
  http: string
  httpTimeInterval?: number
  httpMethod?: string
  httpHeaders?: Record<string, string>
}

interface NetworkState {
  websocket: WebSocket | null
  mqtt: WebSocket | null
  httpTimers: Set<ReturnType<typeof setTimeout>>
  heartbeatTimer: ReturnType<typeof setInterval> | null
  reconnectTimer: ReturnType<typeof setTimeout> | null
  throttleTimer: ReturnType<typeof setTimeout> | null
  pendingMessages: any[]
  lastHeartbeatTime: number
}

// ==================== 消息节流去重处理 ====================

let messageThrottleTimer: ReturnType<typeof setTimeout> | null = null
// pen 消息按 "id:key" 去重，bind 消息按 dataId 去重，只保留最新值
const pendingPenMessages = new Map<string, any>()
const pendingBindMessages = new Map<string, any>()

/**
 * 节流处理消息，同 key 只保留最新值
 */
function throttledHandleMessages(messages: any, _meta2dInstance: any) {
  const list = Array.isArray(messages) ? messages : [messages]
  for (const msg of list) {
    if (msg.dataId !== undefined) {
      pendingBindMessages.set(msg.dataId, msg)
    } else if (msg.id) {
      for (const key of Object.keys(msg)) {
        if (key !== 'id') {
          pendingPenMessages.set(`${msg.id}:${key}`, { id: msg.id, [key]: msg[key] })
        }
      }
    }
  }

  if (messageThrottleTimer) return

  messageThrottleTimer = setTimeout(() => {
    const penMsgs = Array.from(pendingPenMessages.values())
    const bindMsgs = Array.from(pendingBindMessages.values())
    pendingPenMessages.clear()
    pendingBindMessages.clear()
    messageThrottleTimer = null

    const allMessages = [...penMsgs, ...bindMsgs]
    if (allMessages.length > 0) {
      handleMeta2dMessages(allMessages, _meta2dInstance)
    }
  }, 100)
}

/**
 * 清理消息节流定时器
 */
function cleanupThrottle() {
  if (messageThrottleTimer) {
    clearTimeout(messageThrottleTimer)
    messageThrottleTimer = null
    pendingPenMessages.clear()
    pendingBindMessages.clear()
  }
}

// ==================== WebSocket 管理 ====================

let wsInstance: WebSocket | null = null
let wsHeartbeatTimer: ReturnType<typeof setInterval> | null = null
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null
let lastHeartbeatTime = 0

const WS_HEARTBEAT_INTERVAL = 10000 // 心跳间隔 10s
const WS_HEARTBEAT_TIMEOUT = 30000  // 心跳超时 30s
const WS_RECONNECT_DELAY = 5000     // 重连延迟 5s

/**
 * 连接 WebSocket
 * @param url WebSocket 地址
 * @param meta2dInstance Meta2d 实例
 */
export function connectWebsocket(url: string, meta2dInstance: any) {
  if (!url) {
    console.warn('[WebSocket] URL not configured')
    return
  }

  closeWebsocket()

  try {
    wsInstance = new WebSocket(url)

    wsInstance.onopen = () => {
      meta2dInstance.store.data.websocketConnected = true
      lastHeartbeatTime = Date.now()
      startHeartbeat(meta2dInstance, url)

      if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer)
        wsReconnectTimer = null
      }
    }

    wsInstance.onmessage = (event) => {
      handleWsMessage(event.data, meta2dInstance)
    }

    wsInstance.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
      meta2dInstance.store.data.websocketConnected = false
      stopHeartbeat()
      scheduleReconnect(meta2dInstance, url)
    }

    wsInstance.onclose = (event) => {
      meta2dInstance.store.data.websocketConnected = false
      stopHeartbeat()

      if (event.code !== 1000) {
        scheduleReconnect(meta2dInstance, url)
      }
    }
  } catch (error) {
    console.error('[WebSocket] Connection error:', error)
    scheduleReconnect(meta2dInstance, url)
  }
}

/**
 * 处理 WebSocket 消息
 */
function handleWsMessage(data: string, meta2dInstance: any) {
  // 心跳响应
  if (data === 'pong' || data === '{"type":"pong"}') {
    lastHeartbeatTime = Date.now()
    return
  }

  lastHeartbeatTime = Date.now()

  try {
    const message = parseMessage(data)
    if (message && isValidMessage(message)) {
      throttledHandleMessages(message, meta2dInstance)
    }
  } catch (error) {
    console.error('[WebSocket] Message parse error:', error)
  }
}

/**
 * 启动心跳
 */
function startHeartbeat(meta2dInstance: any, url: string) {
  stopHeartbeat()

  wsHeartbeatTimer = setInterval(() => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      if (Date.now() - lastHeartbeatTime > WS_HEARTBEAT_TIMEOUT) {
        console.warn('[WebSocket] Heartbeat timeout, reconnecting...')
        stopHeartbeat()
        closeWebsocket()
        scheduleReconnect(meta2dInstance, url)
        return
      }
      wsInstance.send('ping')
    }
  }, WS_HEARTBEAT_INTERVAL)
}

/**
 * 停止心跳
 */
function stopHeartbeat() {
  if (wsHeartbeatTimer) {
    clearInterval(wsHeartbeatTimer)
    wsHeartbeatTimer = null
  }
}

/**
 * 计划重连
 */
function scheduleReconnect(meta2dInstance: any, url: string) {
  if (wsReconnectTimer) return

  wsReconnectTimer = setTimeout(() => {
    connectWebsocket(url, meta2dInstance)
  }, WS_RECONNECT_DELAY)
}

/**
 * 关闭 WebSocket 连接
 */
export function closeWebsocket() {
  stopHeartbeat()

  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer)
    wsReconnectTimer = null
  }

  if (wsInstance) {
    wsInstance.close(1000, 'Client closed')
    wsInstance = null
  }
}

// ==================== MQTT 管理 ====================

let mqttInstance: WebSocket | null = null
let mqttReconnectTimer: ReturnType<typeof setTimeout> | null = null
let mqttReconnectUrl = ''
let mqttReconnectOptions: any = null
let mqttReconnectMeta2d: any = null
const MQTT_RECONNECT_DELAY = 5000

/**
 * 计划 MQTT 重连
 */
function scheduleMqttReconnect() {
  if (mqttReconnectTimer) return
  if (!mqttReconnectUrl) return

  mqttReconnectTimer = setTimeout(() => {
    mqttReconnectTimer = null
    if (mqttReconnectUrl) {
      connectMqtt(mqttReconnectUrl, mqttReconnectOptions, mqttReconnectMeta2d)
    }
  }, MQTT_RECONNECT_DELAY)
}

/**
 * 连接 MQTT（通过 WebSocket 模拟）
 * @param url MQTT WebSocket 地址
 * @param options MQTT 配置选项
 * @param meta2dInstance Meta2d 实例
 */
export function connectMqtt(url: string, options: any, meta2dInstance: any) {
  if (!url) {
    console.warn('[MQTT] URL not configured')
    return
  }

  // 保存重连参数
  mqttReconnectUrl = url
  mqttReconnectOptions = options
  mqttReconnectMeta2d = meta2dInstance

  closeMqtt()

  try {
    mqttInstance = new WebSocket(url)

    mqttInstance.onopen = () => {
      meta2dInstance.store.data.mqttConnected = true
    }

    mqttInstance.onmessage = (event) => {
      try {
        const message = parseMessage(event.data)
        if (message && isValidMessage(message)) {
          throttledHandleMessages(message, meta2dInstance)
        }
      } catch (error) {
        console.error('[MQTT] Message parse error:', error)
      }
    }

    mqttInstance.onerror = (error) => {
      console.error('[MQTT] Error:', error)
      meta2dInstance.store.data.mqttConnected = false
    }

    mqttInstance.onclose = () => {
      meta2dInstance.store.data.mqttConnected = false
      scheduleMqttReconnect()
    }
  } catch (error) {
    console.error('[MQTT] Connection error:', error)
    scheduleMqttReconnect()
  }
}

/**
 * 关闭 MQTT 连接
 */
export function closeMqtt() {
  if (mqttReconnectTimer) {
    clearTimeout(mqttReconnectTimer)
    mqttReconnectTimer = null
  }
  mqttReconnectUrl = ''

  if (mqttInstance) {
    mqttInstance.close()
    mqttInstance = null
  }
}

// ==================== HTTP 轮询管理 ====================

let httpTimers = new Set<ReturnType<typeof setTimeout>>()

/**
 * 连接 HTTP 轮询
 * @param configs HTTP 配置数组
 * @param meta2dInstance Meta2d 实例
 */
export function connectHttp(configs: HttpConfig[], meta2dInstance: any) {
  if (!configs || configs.length === 0) {
    console.warn('[HTTP] No endpoints configured')
    return
  }

  closeHttp()

  configs.forEach((config, index) => {
    if (!config.http) {
      console.warn(`[HTTP] Endpoint ${index + 1} URL not configured`)
      return
    }

    const interval = Math.max(config.httpTimeInterval || 1000, 500)
    const method = (config.httpMethod || 'GET').toUpperCase()
    const headers = config.httpHeaders || {}

    startPolling(config.http, interval, method, headers, meta2dInstance)
  })
}

/**
 * 开始轮询（使用递归 setTimeout 避免请求重叠）
 */
function startPolling(
  url: string,
  interval: number,
  method: string,
  headers: Record<string, string>,
  meta2dInstance: any
) {
  let isRunning = false
  let timer: ReturnType<typeof setTimeout> | null = null

  async function poll() {
    if (isRunning) return // 防止重叠请求

    isRunning = true
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data && isValidMessage(data)) {
        throttledHandleMessages(data, meta2dInstance)
      }
    } catch (error) {
      console.error(`[HTTP] Request error (${url}):`, error)
    } finally {
      isRunning = false
      // 移除旧 timer，避免 Set 无限增长
      if (timer) httpTimers.delete(timer)
      timer = setTimeout(poll, interval)
      httpTimers.add(timer)
    }
  }

  // 立即发起第一次请求
  poll()
}

/**
 * 关闭 HTTP 轮询
 */
export function closeHttp() {
  httpTimers.forEach(timer => clearTimeout(timer))
  httpTimers.clear()
}

// ==================== 统一清理 ====================

/**
 * 清理所有网络资源
 */
export function cleanupNetwork() {
  closeWebsocket()
  closeMqtt()
  closeHttp()
  cleanupThrottle()
}
