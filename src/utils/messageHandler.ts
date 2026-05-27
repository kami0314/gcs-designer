/**
 * 消息处理工具
 * 处理从WebSocket、MQTT、HTTP接收到的消息，更新画布元素
 * 
 * 支持两种消息格式：
 * 1. { id: "pen-id", text: "value", ... } - 直接按图元ID更新属性
 * 2. { dataId: "variable-name", value: any } - 按变量绑定更新（利用meta2d.js内置setDatas）
 */

interface PenMessageData {
  id: string;
  [key: string]: any;
}

interface BindMessageData {
  dataId: string;
  value: any;
  [key: string]: any;
}

type MessageData = PenMessageData | BindMessageData;

/**
 * 降级处理：手动遍历 bindDatas 映射，逐个调用 setValue 更新图元
 * 绕过 echarts.js 中 onBinds 的解构 undefined bug
 */
function fallbackBindUpdate(bindMessages: BindMessageData[], meta2dInstance: any) {
  bindMessages.forEach((message) => {
    const bindings = meta2dInstance.store.bindDatas?.[message.dataId];
    if (!bindings || bindings.length === 0) {
      console.warn(`No pen bound to dataId '${message.dataId}'`);
      return;
    }
    bindings.forEach((p: any) => {
      const pen = meta2dInstance.store.pens[p.id];
      // 防御：表格图元的 data 必须是二维数组，styles 必须是数组
      // 直接赋值非数组值会破坏 table2.js 的内部结构
      if (pen && pen.name === 'table2' && (p.formItem.key === 'data' || p.formItem.key === 'styles')) {
        console.warn(
          `[messageHandler] Skipping unsafe bind for table2 pen ${p.id}: ` +
          `key="${p.formItem.key}" would corrupt table structure. ` +
          `Please use a custom key (e.g. "text") instead.`
        );
        return;
      }
      meta2dInstance.setValue({
        id: p.id,
        [p.formItem.key]: message.value,
      });
    });
  });
}

/**
 * 处理接收到的消息数组，更新对应的画布元素属性
 * @param messages - 消息数组，每个消息包含id和属性值，或dataId和value
 * @param meta2dInstance - Meta2d实例
 */
export function handleMessages(messages: MessageData | MessageData[], meta2dInstance: any) {
  if (!meta2dInstance || !meta2dInstance.store) {
    console.warn('Meta2d instance not available');
    return;
  }

  // 确保messages是数组
  const messageList = Array.isArray(messages) ? messages : [messages];
  
  if (messageList.length === 0) return;

  // 将消息按格式分类
  const penMessages: PenMessageData[] = [];
  const bindMessages: BindMessageData[] = [];

  messageList.forEach((message) => {
    if (message.dataId !== undefined) {
      bindMessages.push(message as BindMessageData);
    } else if (message.id) {
      penMessages.push(message as PenMessageData);
    } else {
      console.warn('Message missing id or dataId field:', message);
    }
  });

  // ========== 处理 dataId 格式的消息（变量绑定更新）==========
  if (bindMessages.length > 0) {
    if (typeof meta2dInstance.setDatas === 'function') {
      try {
        meta2dInstance.setDatas(bindMessages);
      } catch (error) {
        // echarts.js 中 onBinds 存在 bug：当 series name 和 dataIds 中的 name 不匹配时，
        // formItem.dataIds.find(...) 返回 undefined，解构报错。
        // 降级为手动 setValue 更新，保证其他图元正常刷新。
        console.warn('meta2d.setDatas failed (likely echarts onBinds bug), falling back to manual setValue:', error);
        fallbackBindUpdate(bindMessages, meta2dInstance);
      }
    } else {
      console.warn('meta2d.setDatas is not available, falling back to manual update');
      fallbackBindUpdate(bindMessages, meta2dInstance);
    }
  }

  // ========== 处理 id 格式的消息（直接按 pen ID 更新属性）==========
  if (penMessages.length > 0) {
    const pensMap = meta2dInstance.store.pens || {};
    const updatedPens = new Set<any>();
    let hasUpdates = false;

    penMessages.forEach((message) => {
      const targetPen = pensMap[message.id];

      if (targetPen) {
        // 更新元素的属性（除了id外的所有字段）
        Object.keys(message).forEach((key) => {
          if (key !== 'id') {
            const oldValue = targetPen[key];
            const newValue = message[key];
            
            // 只在值真正改变时更新
            if (oldValue !== newValue) {
              targetPen[key] = newValue;
              updatedPens.add(targetPen);
              hasUpdates = true;

              // 触发值更新事件，通知UI更新
              meta2dInstance.emit('valueUpdate', { pen: targetPen, key, oldValue, newValue });
            }
          }
        });
      } else {
        console.warn(`Pen with id '${message.id}' not found on canvas`);
      }
    });

    // 只有在有实际更新时才重新渲染
    if (hasUpdates) {
      requestAnimationFrame(() => {
        meta2dInstance.render();
      });
    }
  }
}

/**
 * 解析JSON字符串为消息对象
 */
export function parseMessage(data: string | any): MessageData | MessageData[] | null {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed;
    } catch (error) {
      console.error('Failed to parse message:', error);
      return null;
    }
  }
  return data;
}

/**
 * 验证消息格式
 * 支持两种格式：
 * 1. { id: string, ... } - 直接按图元ID更新
 * 2. { dataId: string, value: any } - 按变量绑定更新
 */
export function isValidMessage(data: any): boolean {
  const isValidItem = (item: any) =>
    typeof item === 'object' && (item.id || item.dataId !== undefined);
  if (Array.isArray(data)) {
    return data.every(isValidItem);
  }
  return isValidItem(data);
}
