<template>
  <el-main class="meta2d-box">
    <div id="meta2d"></div>
  </el-main>
  <!-- 右键菜单 -->
  <RightMenu v-model="contextMenuVisible" :menus="contextMenus" :position="contextMenusByCtx" />
</template>

<script setup lang="ts">
import { PenType, type Options, type Pen, LockState, Meta2d, register, registerAnchors, registerCanvasDraw } from '@meta2d/core'
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import RightMenu from './RightMenu.vue'
import { ElMessageBox } from 'element-plus'
import "element-plus/theme-chalk/el-message-box.css";
import { useRouter } from 'vue-router'
import { cleanupNetwork, connectWebsocket, closeWebsocket, connectMqtt, closeMqtt, connectHttp, closeHttp } from '@/hooks/useNetwork'

const router = useRouter()

// 默认项目文件名称（存储在用户数据目录）
const PROJECT_FILE = 'project.json'

const props = withDefaults(defineProps<{
  preview?: boolean
}>(), { preview: false })

// Meta2d 实例（在 onMounted 中初始化）
let meta2d!: Meta2d

let contextMenus = ref<Record<string, any>[]>([])
let contextMenusByCtx = ref<number[]>([])

interface ContextMenuConfig {
  title?: string
  type?: string
  disabled?: boolean
  func?: () => void
  ctrl?: string
}

const contextMenusConfig: ContextMenuConfig[] = [
  {
    title: '置顶',
    func() {
      let active = meta2d.store.active || []
      meta2d.top(active)
    }
  },
  {
    title: '置底',
    func() {
      let active = meta2d.store.active || []
      meta2d.bottom(active)
    }
  },
  {
    title: '上一个图层',
    func() {
      let active = meta2d.store.active || []
      meta2d.up(active)
    }
  },
  {
    title: '下一个图层',
    func() {
      let active = meta2d.store.active || []
      meta2d.down(active)
    }
  },
  { type: 'divider' },
  {
    title: '组合',
    func() {
      let pens = meta2d.store.active || []
      meta2d.combine(pens)
    }
  },
  {
    title: '取消组合',
    func() {
      meta2d.uncombine()
    }
  },
  {
    title: '组合状态',
    func() {
      let pens = meta2d.store.active || []
      meta2d.combine(pens, 0)
    }
  },
  {
    title: '取消组合状态',
    func() {
      meta2d.uncombine()
    }
  },
  {
    title: '锁定',
    func() {
      let active = meta2d.store.active || []
      active.forEach((item) => {
        item.locked = 2
        meta2d.setValue(item)
      })
      meta2d.emit("changePens")
    }
  },
  {
    title: '解锁',
    func() {
      let active = meta2d.store.active || []
      active.forEach((item) => {
        item.locked = 0
        meta2d.setValue(item)
      })
      meta2d.emit("changePens")
    }
  },
  { type: 'divider' },
  {
    title: '删除',
    func() {
      let active = meta2d.store.active
      meta2d.delete(active, true)
    }
  },
  { type: 'divider' },
  {
    title: '变成节点',
    func() {
      let active = meta2d.store.active || []
      let pen = active[0]
      pen.type = PenType.Node
      meta2d.setValue(pen)
    }
  },
  {
    title: '变成连线',
    func() {
      let active = meta2d.store.active || []
      let pen = active[0]
      pen.type = PenType.Line
      meta2d.setValue(pen)
    }
  },

  { type: 'divider' },
  {
    title: '撤销',
    ctrl: 'Ctrl + Z',
    func() {
      meta2d.undo()
      meta2d.emit("changePens")
    }
  },
  {
    title: '重做',
    ctrl: 'Shift + Z',
    func() {
      meta2d.redo()
      meta2d.emit("changePens")
    }
  },
  { type: 'divider' },
  {
    title: '剪切',
    ctrl: 'Ctrl + X',
    func() {
      let active = meta2d.store.active
      meta2d.cut(active)
    }
  },
  {
    title: '复制',
    ctrl: 'Ctrl + C',
    func() {
      let active = meta2d.store.active
      meta2d.copy(active)
    }
  },
  {
    title: '粘贴',
    ctrl: 'Ctrl + V',
    func() {
      meta2d.paste()
    }
  }
]


const meta2dOptions: Options = {
  rule: true,
  grid: false,
  width: 1920,
  height: 1080
}

/** 预览配置 */
if (props.preview) {
  meta2dOptions.rule = false
}

/** 注册所有图形库（延迟加载优化） */
async function registerAllPens() {
  // 并行加载基础图形库
  const [
    { flowPens, flowAnchors },
    { activityDiagram, activityDiagramByCtx },
    { classPens },
    { sequencePens, sequencePensbyCtx },
    { formPens, formPath2DPens },
    { chartsPens },
    { ftaPens, ftaPensbyCtx, ftaAnchors }
  ] = await Promise.all([
    import('@meta2d/flow-diagram'),
    import('@meta2d/activity-diagram'),
    import('@meta2d/class-diagram'),
    import('@meta2d/sequence-diagram'),
    import('@meta2d/form-diagram'),
    import('@meta2d/le5le-charts'),
    import('@meta2d/fta-diagram')
  ])

  // 同步注册
  register(flowPens())
  registerAnchors(flowAnchors())
  register(activityDiagram())
  registerCanvasDraw(activityDiagramByCtx())
  register(classPens())
  register(sequencePens())
  registerCanvasDraw(sequencePensbyCtx())
  registerCanvasDraw(formPens())
  register(formPath2DPens())
  registerCanvasDraw(chartsPens())
  register(ftaPens())
  registerCanvasDraw(ftaPensbyCtx())
  registerAnchors(ftaAnchors())

  // echarts 单独加载（体积较大）
  const { register: registerEcharts } = await import('@meta2d/chart-diagram')
  registerEcharts()
}

/** 初始化网络方法（延迟执行） */
function initNetworkMethods() {
  const meta2dAny = meta2d as any
  
  meta2dAny.connectWebsocket = function() {
    const url = meta2d.store.data.websocket
    if (url) {
      connectWebsocket(url, meta2d)
    } else {
      console.warn('[WebSocket] URL not configured')
    }
  }

  meta2dAny.closeWebsocket = function() {
    closeWebsocket()
  }

  meta2dAny.connectMqtt = function() {
    const url = meta2d.store.data.mqtt
    const options = meta2d.store.data.mqttOptions || {}
    if (url) {
      connectMqtt(url, options, meta2d)
    } else {
      console.warn('[MQTT] URL not configured')
    }
  }

  meta2dAny.closeMqtt = function() {
    closeMqtt()
  }

  meta2dAny.connectHttp = function() {
    const configs = meta2d.store.data.https || []
    if (configs.length > 0) {
      connectHttp(configs as any, meta2d)
    } else {
      console.warn('[HTTP] No endpoints configured')
    }
  }

  meta2dAny.closeHttp = function() {
    closeHttp()
  }

  meta2dAny.testMessage = async function(testData: any) {
    console.log('[Debug] Testing message:', testData)
    const { isValidMessage, handleMessages } = await import('@/utils/messageHandler')
    if (isValidMessage(testData)) {
      handleMessages(testData, meta2d)
      console.log('[Debug] Message processed')
    } else {
      console.warn('[Debug] Invalid message format')
    }
  }

  console.log('[Network] Methods initialized')
}

onMounted(async () => {
  // 1. 立即创建 Meta2d 实例
  meta2d = new Meta2d('meta2d', meta2dOptions)
  
  // 2. 监听事件
  meta2d.on('contextmenu', contextmenu)
  meta2d.on('click', click)
  ;(meta2d.store.options as any).fileName = '未命名'
  
  // 3. 初始化网络方法（同步，轻量级）
  initNetworkMethods()
  
  // 4. 注册图形库（异步，不阻塞后续逻辑）
  registerAllPens()
  
  // 5. 全局快捷键
  document.addEventListener('keydown', handleGlobalKeydown)

  // 6. 加载项目文件（异步，不阻塞渲染）
  if (props.preview) {
    loadProjectFile()
  } else {
    loadProjectFile().then(hasLoaded => {
      if (!hasLoaded) {
        const json = localStorage.getItem("meta2dJSON")
        if (json) {
          ElMessageBox.confirm('有缓存数据，是否打开？',
            '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
          }).then(() => {
            meta2d.open(JSON.parse(json) as any)
          }).catch(() => {
            localStorage.removeItem("meta2dJSON")
          })
        }
      }
    })
  }
})
onUnmounted(() => {
  if (meta2d) {
    meta2d.off('contextmenu', contextmenu)
    meta2d.off('click', click)
    
    // 统一清理所有网络资源
    cleanupNetwork()
    
    meta2d.destroy()
  }
  document.removeEventListener('keydown', handleGlobalKeydown)
})

/** 从用户数据目录加载项目文件 */
async function loadProjectFile(): Promise<boolean> {
  if (!window.electronAPI?.readJson) return false
  try {
    const result = await window.electronAPI.readJson(PROJECT_FILE)
    if (result.success && result.data) {
      const json = result.data
      if (props.preview) {
        json.rule = false
        json.locked = LockState.DisableEdit
      }
      meta2d.open(json as any)
      if (json.fileName) {
        (meta2d.store.options as any).fileName = json.fileName
      }
      return true
    }
  } catch (err) {
    console.warn('Load project file failed:', err)
  }
  return false
}

/** 全局快捷键处理 */
function handleGlobalKeydown(e: KeyboardEvent) {
  // Cmd/Ctrl + Y 切换编辑/预览
  if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
    e.preventDefault()
    const isPreview = router.currentRoute.value.name === 'preview'
    if (isPreview) {
      router.push('/edit')
    } else {
      router.push('/')
    }
    return
  }
  
}
/** 右键菜单 */
const contextMenuVisible = ref(false)
function contextmenu(res: any) {
  /** 预览模式禁止使用右键菜单 */
  if (props.preview) return false
  contextMenusByCtx.value = [res.e.pageX + 10, res.e.pageY]
  contextMenuVisible.value = true
  setMenusListAndStatus()
}
function click() {
  contextMenuVisible.value = false
}

// 设置菜单项及可点击状态
async function setMenusListAndStatus() {
  await nextTick()
  let active = meta2d.store.active || []
  let pens = meta2d.store.data.pens || []
  // 是否有gif
  let hasGif = false

  if (active.length > 0) {
    let filterActive: string[] = []
    active.forEach(it => {
      filterActive.push(it.id || '', ...(it.children || []))
    })
    filterActive = [...new Set(filterActive)]
    let filterPens = pens.filter(it => {
      return filterActive.includes(it.id || '')
    })

    let gifPen = filterPens.find((item: Pen) => {
      let image = item.image || ""
      let ext = image.split('.').pop()
      return ext === 'gif'
    })
    if (gifPen) hasGif = true;
  }


  // 选中pen集合
  let activeNum = active.length
  contextMenus.value = []
  let histories = meta2d.store.histories || [] // 历史记录列表
  let historiesL = histories.length
  let historyIndex = meta2d.store.historyIndex || 0  // 操作列表步数
  let lastIndex = historiesL - 1
  // 画纸右键菜单
  if (activeNum == 0) {
    let exclude = ['组合', '组合状态', '取消组合', '取消组合状态', '解锁', '变成节点', '变成连线']
    let disabled = ['置顶', '置底', '上一个图层', '下一个图层', '删除', '锁定', '剪切', '复制']
    if (historiesL == 0) {
      disabled.push('撤销', '重做')
    }
    if (historyIndex == -1) {
      disabled.push('撤销')
    }
    if (historiesL > 0 && historyIndex == lastIndex) {
      disabled.push('重做')
    }
    let filterContext = contextMenusConfig.filter((item) => !exclude.includes(item.title || ''))
    filterContext.forEach((item) => {
      item.disabled = false
      if (disabled.includes(item.title || '')) {
        item.disabled = true
      }
    })
    contextMenus.value = filterContext
  }
  // 选中一个图元
  if (activeNum == 1) {
    let exclude = ['组合', '组合状态']
    let disabled: string[] = []

    if (hasGif) {
      disabled.push('置顶', '置底', '上一个图层', '下一个图层')
    }

    let locked = !!active[0].locked
    if (!locked) {
      exclude.push('解锁')
    } else {
      exclude.push('锁定')
    }
    if (historyIndex == -1) {
      disabled.push('撤销')
    }
    if (historiesL > 0 && historyIndex == lastIndex) {
      disabled.push('重做')
    }

    let currentActive = active[0]
    // 判断pen的类型
    let type = currentActive.type
    if (type == PenType.Line) {
      exclude.push('变成连线')
    } else if (type == PenType.Node) {
      exclude.push('变成节点')
    } else {
      exclude.push('变成节点', '变成连线')
    }


    // 是否组合判断
    let children = currentActive.children || []
    let childrenL = children.length
    let showChild = currentActive.showChild

    if (childrenL && showChild === undefined) {
      exclude.push('取消组合状态')
    } else if (childrenL && showChild !== undefined) {
      exclude.push('取消组合')
    } else {
      exclude.push('取消组合', '取消组合状态')
    }

    let filterContext = contextMenusConfig.filter((item) => !exclude.includes(item.title || ''))
    filterContext.forEach((item) => {
      item.disabled = false
      if (disabled.includes(item.title || '')) {
        item.disabled = true
      }
    })
    contextMenus.value = filterContext
  }
  // 选中多个图元
  if (activeNum > 1) {
    let exclude: string[] = ['取消组合', '取消组合状态', '解锁', '变成节点', '变成连线']
    let disabled: string[] = []

    if (hasGif) {
      disabled.push('置顶', '置底', '上一个图层', '下一个图层')
    }

    if (historyIndex == -1) {
      disabled.push('撤销')
    }
    if (historiesL > 0 && historyIndex == lastIndex) {
      disabled.push('重做')
    }
    let filterContext = contextMenusConfig.filter((item) => !exclude.includes(item.title || ''))
    filterContext.forEach((item) => {
      item.disabled = false
      if (disabled.includes(item.title || '')) {
        item.disabled = true
      }
    })
    contextMenus.value = filterContext
  }
}

</script>

<style scoped>
.meta2d-box {
  height: 100%;
  padding: 0;
}

#meta2d {
  height: 100%;
}
</style>