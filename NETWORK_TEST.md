# MQTT/WebSocket/HTTP 连接测试指南

## 🚀 功能说明

项目已实现完整的网络连接功能，支持：
- **WebSocket** - 实时双向通信（带心跳维持）
- **MQTT** - 物联网消息协议（通过WebSocket）
- **HTTP** - 轮询方式获取数据（性能优化）

## ✨ 新增优化

### 🔄 WebSocket心跳机制
- **自动心跳**: 每10秒发送ping消息
- **超时检测**: 30秒无响应自动重连
- **断线重连**: 连接断开后5秒自动重连

### ⚡ 性能优化
- **消息节流**: 100ms内合并处理消息，避免频繁渲染
- **智能渲染**: 只在数据真正改变时重新渲染
- **HTTP限频**: 最小500ms轮询间隔
- **批量更新**: 合并多个消息的更新操作

## 📋 测试步骤

### 1. 启动应用
```bash
npm run dev
```
访问: http://localhost:5173

### 2. 配置连接

在右侧面板 → **全局配置** → **对应关系** 中配置：

#### WebSocket 测试
- URL: `ws://echo.websocket.org` (公共测试服务器)
- 点击连接按钮

#### MQTT 测试
- URL: `ws://broker.emqx.io:8083/mqtt` (公共MQTT服务器)
- Topics: `le5le`
- 点击连接按钮

#### HTTP 测试
- 请求方式: GET
- URL: `https://jsonplaceholder.typicode.com/posts/1`
- 时间间隔: 5000ms
- 点击添加按钮

### 3. 浏览器控制台测试

打开浏览器控制台（F12），可以使用以下命令：

```javascript
// 测试消息处理功能
meta2d.testMessage([
  { id: "your-element-id", text: "Hello World", color: "#ff0000" }
]);

// 检查连接状态
console.log('WebSocket connected:', meta2d.store.data.websocketConnected);
console.log('MQTT connected:', meta2d.store.data.mqttConnected);

// 检查方法是否绑定
console.log('Methods available:', {
  connectWebsocket: typeof meta2d.connectWebsocket,
  connectMqtt: typeof meta2d.connectMqtt,
  connectHttp: typeof meta2d.connectHttp
});

// 检查心跳状态
console.log('WebSocket heartbeat active:', !!websocketHeartbeatTimer);
```

### 4. 心跳调试

```javascript
// 手动发送心跳
if (websocketInstance && websocketInstance.readyState === WebSocket.OPEN) {
  websocketInstance.send('ping');
  console.log('Manual ping sent');
}

// 检查最后心跳时间
console.log('Last heartbeat:', new Date(lastHeartbeatTime));
```

### 5. 性能监控

```javascript
// 监控消息处理性能
let messageCount = 0;
const startTime = Date.now();

meta2d.on('valueUpdate', () => {
  messageCount++;
  if (messageCount % 10 === 0) {
    console.log(`Processed ${messageCount} messages in ${Date.now() - startTime}ms`);
  }
});

// 检查定时器状态
console.log('Active timers:', {
  websocketHeartbeat: !!websocketHeartbeatTimer,
  websocketReconnect: !!websocketReconnectTimer,
  messageThrottle: !!messageThrottleTimer,
  httpPolling: mqttIntervals.length
});
```

### 4. 创建测试元素

1. 在画布上添加一个文本元素
2. 选中元素，查看右侧属性面板
3. 记录元素的ID（在浏览器控制台中查看）

### 5. 发送测试消息

使用WebSocket测试工具或MQTT客户端发送消息：

```json
{
  "id": "your-element-id",
  "text": "Updated via WebSocket",
  "color": "#00ff00"
}
```

## 🔍 调试信息

所有连接操作都会在浏览器控制台输出详细日志：
- `connectWebsocket called` - WebSocket连接开始
- `WebSocket connected` - 连接成功
- `WebSocket message received` - 收到消息
- `Parsed message` - 消息解析结果
- `HTTP polling started` - HTTP轮询开始

## ⚠️ 注意事项

1. **元素ID**: 确保消息中的`id`与画布上元素的ID匹配
2. **消息格式**: 必须是JSON格式，包含`id`字段
3. **属性更新**: 消息中的其他字段会直接更新到对应元素
4. **渲染**: 每次消息处理后会自动重新渲染画布

## 🛠️ 故障排除

如果连接不生效：
1. 检查浏览器控制台是否有错误信息
2. 确认URL格式正确（WebSocket必须以`ws://`或`wss://`开头）
3. 确认元素ID存在于画布上
4. 使用`meta2d.testMessage()`手动测试消息处理</content>
<parameter name="filePath">/Users/kami/Documents/web/top/meta2d/NETWORK_TEST.md