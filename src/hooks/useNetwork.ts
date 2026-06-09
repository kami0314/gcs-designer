/**
 * Meta2d 网络连接管理模块
 * 支持 WebSocket、MQTT、HTTP 轮询三种通信方式
 *
 * 优化特性：
 * - WebSocket: 自适应心跳 + 指数退避重连 + 状态事件通知
 * - HTTP: 自适应轮询 + AbortController取消 + 错误重试
 * - 消息处理: 自适应节流 + 优先级队列
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

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

interface PendingMessage {
  data: any
  priority: number // 0: 普通, 1: 高优先级
  timestamp: number
}

// ==================== 消息自适应节流处理 ====================

const BASE_THROTTLE_INTERVAL = 100
const MIN_THROTTLE_INTERVAL = 50
const MAX_THROTTLE_INTERVAL = 500

let messageThrottleTimer: ReturnType<typeof setTimeout> | null = null
let currentThrottleInterval = BASE_THROTTLE_INTERVAL
let messageCountInWindow = 0
let messageWindowStart = Date.now()

// 优先级队列
const priorityQueue: PendingMessage[] = []
// pen 消息按 "id:key" 去重，bind 消息按 dataId 去重，只保留最新值
const pendingPenMessages = new Map<string, any>()
const pendingBindMessages = new Map<string, any>()

/**
 * 自适应调整节流间隔
 */
function adjustThrottleInterval() {
  const now = Date.now()
  const windowDuration = now - messageWindowStart

  // 每秒重置计数
  if (windowDuration >= 1000) {
    const messagesPerSecond = messageCountInWindow / (windowDuration / 1000)

    if (messagesPerSecond > 100) {
      // 消息频率高，增加节流间隔
      currentThrottleInterval = Math.min(currentThrottleInterval * 1.5, MAX_THROTTLE_INTERVAL)
    } else if (messagesPerSecond < 10) {
      // 消息频率低，减少节流间隔
      currentThrottleInterval = Math.max(currentThrottleInterval * 0.8, MIN_THROTTLE_INTERVAL)
    }

    // 重置计数器
    messageCountInWindow = 0
    messageWindowStart = now
  }
}

/**
 * 节流处理消息，同 key 只保留最新值
 * @param messages 消息数据
 * @param _meta2dInstance Meta2d 实例
 * @param priority 优先级 (0: 普通, 1: 高优先级)
 */
function throttledHandleMessages(messages: any, _meta2dInstance: any, priority = 0) {
  const list = Array.isArray(messages) ? messages : [messages]
  messageCountInWindow += list.length

  // 高优先级消息直接加入优先级队列
  if (priority > 0) {
    priorityQueue.push({
      data: list,
      priority,
      timestamp: Date.now()
    })
  }

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

  // 自适应调整节流间隔
  adjustThrottleInterval()

  messageThrottleTimer = setTimeout(() => {
    const penMsgs = Array.from(pendingPenMessages.values())
    const bindMsgs = Array.from(pendingBindMessages.values())
    pendingPenMessages.clear()
    pendingBindMessages.clear()
    messageThrottleTimer = null

    // 处理优先级队列中的高优先级消息
    const highPriorityData: any[] = []
    while (priorityQueue.length > 0) {
      const item = priorityQueue.shift()
      if (item) {
        highPriorityData.push(...(Array.isArray(item.data) ? item.data : [item.data]))
      }
    }

    const allMessages = [...highPriorityData, ...penMsgs, ...bindMsgs]
    if (allMessages.length > 0) {
      handleMeta2dMessages(allMessages, _meta2dInstance)
    }
  }, currentThrottleInterval)
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
    priorityQueue.length = 0
  }
}

// ==================== WebSocket 管理 ====================

let wsInstance: WebSocket | null = null
let wsHeartbeatTimer: ReturnType<typeof setInterval> | null = null
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null
let lastHeartbeatTime = 0
let wsReconnectAttempts = 0
let wsMeta2dInstance: any = null
let wsUrl = ''
let wsLastLatency = 0

const WS_HEARTBEAT_INTERVAL = 10000 // 心跳间隔 10s
const WS_HEARTBEAT_TIMEOUT = 30000  // 心跳超时 30s
const WS_RECONNECT_BASE_DELAY = 5000 // 重连基础延迟 5s
const WS_RECONNECT_MAX_DELAY = 60000 // 最大重连延迟 60s
const WS_MAX_RECONNECT_ATTEMPTS = 10 // 最大重连尝试次数

/**
 * 计算指数退避重连延迟
 */
function getReconnectDelay(): number {
  const delay = Math.min(
    WS_RECONNECT_BASE_DELAY * Math.pow(2, wsReconnectAttempts),
    WS_RECONNECT_MAX_DELAY
  )
  return delay
}

/**
 * 触发连接状态事件
 */
function emitConnectionState(state: ConnectionState) {
  if (wsMeta2dInstance && typeof wsMeta2dInstance.emit === 'function') {
    wsMeta2dInstance.emit('wsConnectionState', {
      state,
      url: wsUrl,
      reconnectAttempts: wsReconnectAttempts,
      latency: wsLastLatency
    })
  }
}

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

  // 保存重连参数
  wsUrl = url
  wsMeta2dInstance = meta2dInstance

  closeWebsocket()
  emitConnectionState('connecting')

  try {
    wsInstance = new WebSocket(url)

    wsInstance.onopen = () => {
      meta2dInstance.store.data.websocketConnected = true
      lastHeartbeatTime = Date.now()
      wsReconnectAttempts = 0 // 重置重连计数
      startHeartbeat(meta2dInstance, url)
      emitConnectionState('connected')

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
      emitConnectionState('disconnected')
      scheduleReconnect(meta2dInstance, url)
    }

    wsInstance.onclose = (event) => {
      meta2dInstance.store.data.websocketConnected = false
      stopHeartbeat()
      emitConnectionState('disconnected')

      if (event.code !== 1000) {
        scheduleReconnect(meta2dInstance, url)
      }
    }
  } catch (error) {
    console.error('[WebSocket] Connection error:', error)
    emitConnectionState('disconnected')
    scheduleReconnect(meta2dInstance, url)
  }
}

/**
 * 处理 WebSocket 消息
 */
function handleWsMessage(data: string, meta2dInstance: any) {
  const receiveTime = Date.now()

  // 心跳响应
  if (data === 'pong' || data === '{"type":"pong"}') {
    wsLastLatency = receiveTime - lastHeartbeatTime
    lastHeartbeatTime = receiveTime
    return
  }

  lastHeartbeatTime = receiveTime

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
      lastHeartbeatTime = Date.now() // 更新发送时间用于计算延迟
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
  if (wsReconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) {
    console.error('[WebSocket] Max reconnect attempts reached')
    emitConnectionState('disconnected')
    return
  }

  wsReconnectAttempts++
  const delay = getReconnectDelay()
  console.log(`[WebSocket] Scheduling reconnect attempt ${wsReconnectAttempts} in ${delay}ms`)
  emitConnectionState('reconnecting')

  wsReconnectTimer = setTimeout(() => {
    wsReconnectTimer = null
    connectWebsocket(url, meta2dInstance)
  }, delay)
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
let mqttReconnectAttempts = 0
const MQTT_RECONNECT_BASE_DELAY = 5000
const MQTT_RECONNECT_MAX_DELAY = 60000
const MQTT_MAX_RECONNECT_ATTEMPTS = 10

/**
 * 计算 MQTT 指数退避重连延迟
 */
function getMqttReconnectDelay(): number {
  return Math.min(
    MQTT_RECONNECT_BASE_DELAY * Math.pow(2, mqttReconnectAttempts),
    MQTT_RECONNECT_MAX_DELAY
  )
}

/**
 * 计划 MQTT 重连
 */
function scheduleMqttReconnect() {
  if (mqttReconnectTimer) return
  if (!mqttReconnectUrl) return
  if (mqttReconnectAttempts >= MQTT_MAX_RECONNECT_ATTEMPTS) {
    console.error('[MQTT] Max reconnect attempts reached')
    return
  }

  mqttReconnectAttempts++
  const delay = getMqttReconnectDelay()
  console.log(`[MQTT] Scheduling reconnect attempt ${mqttReconnectAttempts} in ${delay}ms`)

  mqttReconnectTimer = setTimeout(() => {
    mqttReconnectTimer = null
    if (mqttReconnectUrl) {
      connectMqtt(mqttReconnectUrl, mqttReconnectOptions, mqttReconnectMeta2d)
    }
  }, delay)
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
      mqttReconnectAttempts = 0 // 重置重连计数
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
  mqttReconnectAttempts = 0

  if (mqttInstance) {
    mqttInstance.close()
    mqttInstance = null
  }
}

// ==================== HTTP 轮询管理 ====================

const httpPollers = new Map<string, {
  timer: ReturnType<typeof setTimeout> | null
  controller: AbortController | null
  isRunning: boolean
  currentInterval: number
  baseInterval: number
  maxInterval: number
  errorCount: number
  noChangeCount: number
  lastDataHash: string
}>()

/**
 * 简单的数据哈希函数，用于检测数据变化
 */
function hashData(data: any): string {
  try {
    return JSON.stringify(data)
  } catch {
    return String(Math.random())
  }
}

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
 * 支持自适应间隔、AbortController取消、错误重试
 */
function startPolling(
  url: string,
  interval: number,
  method: string,
  headers: Record<string, string>,
  meta2dInstance: any
) {
  const maxInterval = interval * 10 // 最大间隔为基础间隔的10倍

  const pollerState = {
    timer: null as ReturnType<typeof setTimeout> | null,
    controller: null as AbortController | null,
    isRunning: false,
    currentInterval: interval,
    baseInterval: interval,
    maxInterval,
    errorCount: 0,
    noChangeCount: 0,
    lastDataHash: ''
  }

  httpPollers.set(url, pollerState)

  async function poll() {
    if (pollerState.isRunning) return // 防止重叠请求

    pollerState.isRunning = true
    pollerState.controller = new AbortController()

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: pollerState.controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data && isValidMessage(data)) {
        // 检测数据是否变化
        const dataHash = hashData(data)
        if (dataHash === pollerState.lastDataHash) {
          pollerState.noChangeCount++
          // 数据未变化，逐渐增加轮询间隔
          pollerState.currentInterval = Math.min(
            pollerState.baseInterval * (1 + pollerState.noChangeCount * 0.5),
            pollerState.maxInterval
          )
        } else {
          pollerState.noChangeCount = 0
          pollerState.currentInterval = pollerState.baseInterval
          pollerState.lastDataHash = dataHash
        }

        throttledHandleMessages(data, meta2dInstance)
        pollerState.errorCount = 0 // 成功后重置错误计数
      }
    } catch (error: any) {
      // 忽略 AbortError（用户主动取消）
      if (error.name === 'AbortError') {
        return
      }

      console.error(`[HTTP] Request error (${url}):`, error)
      pollerState.errorCount++

      // 错误时使用指数退避
      pollerState.currentInterval = Math.min(
        pollerState.baseInterval * Math.pow(2, Math.min(pollerState.errorCount, 5)),
        pollerState.maxInterval
      )
    } finally {
      pollerState.isRunning = false
      pollerState.controller = null

      // 移除旧 timer，避免 Set 无限增长
      if (pollerState.timer) {
        clearTimeout(pollerState.timer)
      }

      pollerState.timer = setTimeout(poll, pollerState.currentInterval)
    }
  }

  // 立即发起第一次请求
  poll()
}

/**
 * 关闭 HTTP 轮询
 */
export function closeHttp() {
  httpPollers.forEach((state) => {
    if (state.timer) {
      clearTimeout(state.timer)
    }
    if (state.controller) {
      state.controller.abort()
    }
  })
  httpPollers.clear()
}

/**
 * 取消指定 URL 的 HTTP 轮询
 */
export function cancelHttpPolling(url: string) {
  const state = httpPollers.get(url)
  if (state) {
    if (state.timer) {
      clearTimeout(state.timer)
    }
    if (state.controller) {
      state.controller.abort()
    }
    httpPollers.delete(url)
  }
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
