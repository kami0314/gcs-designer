<template>
  <div class="nav-box">
    <!-- 左侧 -->
    <div class="nav-left">
      <div class="nav-item" v-for="(item, index) in menu.left" :key="index">
        <template v-if="item.children && item.children.length > 0">
          <el-dropdown @command="handleCommand($event, item)">
            <div class="el-dropdown-link">
              <div class="text-center">
                <svg v-if="item.icon" class="icon-svg" aria-hidden="true">
                  <use :xlink:href="'#' + item.icon" />
                </svg>
                <div>{{ item.name }}</div>
              </div>
              <el-icon class="font-12">
                <el-icon-arrow-down />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(c, i) in item.children" :key="i" :command="c.action">{{ c.name
                  }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <div v-else class="pointer" :class="{ active: item.active }" @click="dispatchFunc(item.action, item)">
          <div class="el-dropdown-link">
            <div class="text-center">
              <svg v-if="item.icon" class="icon-svg" aria-hidden="true">
                <use :xlink:href="'#' + item.icon" />
              </svg>
              <div class="l-14">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧 -->
    <div class="nav-right">
      <div class="nav-item" v-for="(item, index) in menu.right" :key="index">
        <template v-if="item.children && item.children.length > 0">
          <el-dropdown @command="handleCommand($event, item)">
            <div class="el-dropdown-link">
              <div class="text-center">
                <svg v-if="item.icon" class="icon-svg" aria-hidden="true">
                  <use :xlink:href="'#' + item.icon" />
                </svg>
                <div>{{ item.name }}</div>
              </div>
              <el-icon class="font-12">
                <el-icon-arrow-down />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(c, i) in item.children" :key="i" :command="c.action + ',' + c.value">
                  <div class="flex-center">
                    <svg v-if="c.icon" class="icon-svg" aria-hidden="true">
                      <use :xlink:href="'#' + c.icon" />
                    </svg>
                    {{ c.name }}
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <div v-else class="pointer" :class="{ active: item.active }" @click="dispatchFunc(item.action, item)">
          <div class="el-dropdown-link">
            <div class="text-center">
              <svg v-if="item.icon" class="icon-svg" aria-hidden="true">
                <use :xlink:href="'#' + item.icon" />
              </svg>
              <div class="l-14">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <el-popover :width="300"
          popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;">
          <template #reference>
            <div class="scale-result-box">
              <p class="mb-7">{{ scaleValue }}%</p>
              <div>缩放</div>
            </div>
          </template>
          <template #default>
            <el-slider :min="min" :max="max" size="small" v-model="scaleValue" show-input @change="scaleView" />
          </template>
        </el-popover>
      </div>
      <div class="nav-item">
        <div class="el-dropdown-link pointer" @click="handlePreview">
          <div class="text-center">
            <svg class="icon-svg" aria-hidden="true">
              <use xlink:href="#l-attention" />
            </svg>
            <div class="l-14">预览</div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <div class="el-dropdown-link pointer" @click="handleEditStatus">
          <div class="text-center" :style="{ color: mapEditStatus.color }">
            <svg v-if="mapEditStatus.icon" class="icon-svg" :fill="mapEditStatus.color" aria-hidden="true">
              <use :xlink:href="'#' + mapEditStatus.icon" />
            </svg>
            <div class="l-14">{{ mapEditStatus.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { menu, dispatchFunc } from '../config/defaultNav'
import { LockState } from '@meta2d/core'
import { useRouter } from 'vue-router'
import { emitter } from '@/utils'
const router = useRouter()

const mapEditConfig = {
  [LockState.None]: {
    name: '编辑',
    icon: 'l-unlock',
    color: "#000",
    locked: LockState.None
  },
  [LockState.DisableEdit]: {
    name: '预览',
    icon: 'l-lock',
    color: '#faad14',
    locked: LockState.DisableEdit
  },
  [LockState.Disable]: {
    name: '锁定',
    icon: 'l-wufayidong',
    color: '#f50000',
    locked: LockState.Disable
  },
}

interface LockConfig {
  name: string;
  icon: string;
  color: string;
  locked: LockState;
}

let mapEditStatus = ref<LockConfig>(mapEditConfig[LockState.None])

/** 下拉菜单点击事件 */
function handleCommand(command: string, data: any) {
  let [action, value] = command.split(',')
  let item = data.children.find((it: any) => (value ? it.value === value : it.action === action))
  item.icon && (data.icon = item.icon)
  dispatchFunc(action, item)
}

// 缩放
const scaleValue = ref(0)
const min = ref(1)
const max = ref(100)
const scaleView = (val: number) => {
  meta2d.scale(val / 100)
  // 将图元移动到图纸中央
  meta2d.centerView()
}

/** 获取图纸锁定状态 */
function openFn() {
  let data = meta2d.data()
  let locked: LockState | number = data.locked || 0
  mapEditStatus.value = (mapEditConfig as any)[locked]
}

/** 改变图纸状态 */
function handleEditStatus() {
  let locked = mapEditStatus.value.locked
  if (locked === LockState.None) {
    meta2d.lock(LockState.DisableEdit)
    mapEditStatus.value = mapEditConfig[LockState.DisableEdit]
  } else if (locked === LockState.DisableEdit) {
    meta2d.lock(LockState.Disable)
    mapEditStatus.value = mapEditConfig[LockState.Disable]
  } else {
    meta2d.lock(LockState.None)
    mapEditStatus.value = mapEditConfig[LockState.None]
  }
}
/** 预览 */
function handlePreview() {
  let json = meta2d.data()
  localStorage.setItem("meta2dJSON", JSON.stringify(json))
  router.push({
    path: '/'
  })
}

onMounted(() => {
  setTimeout(() => {
    // 添加安全检查，避免刷新时 meta2d.store.options 未初始化
    if (meta2d.store?.options) {
      min.value = (meta2d.store.options as any).minScale * 100
      max.value = (meta2d.store.options as any).maxScale * 100
    }
    
    const data = meta2d.data()
    if (data) {
      scaleValue.value = +(data.scale * 100).toFixed()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta2d.on('scale' as any, (data: any) => {
      console.log(data)
      if (data !== undefined && data !== null) {
        scaleValue.value = +(data * 100).toFixed()
      }
    })
    openFn()
    meta2d.on("opened", openFn)
  }, 500)

  // 监听 Electron 菜单事件
  if (window.electronAPI?.onMenuAction) {
    emitter.on('menu:action', handleMenuAction as any)
  }
})

onUnmounted(() => {
  // 清理事件监听
  emitter.off('menu:action', handleMenuAction as any)
})

/** 处理 Electron 菜单事件 */
function handleMenuAction(action: string) {
  console.log('[Nav] Menu action:', action)
  
  // 映射菜单操作到 dispatchFunc
  const actionMap: Record<string, string> = {
    'newFile': 'newFile',
    'openFile': 'openFile',
    'saveJson': 'saveJson',
    'exportJson': 'exportJson',
    'saveSvg': 'saveSvg',
    'savePng': 'savePng',
    'undo': 'undo',
    'redo': 'redo',
    'cut': 'cut',
    'copy': 'copy',
    'paste': 'paste',
    'selectAll': 'selectAll',
    'zoomIn': 'zoomIn',
    'zoomOut': 'zoomOut',
    'zoomToFit': 'zoomToFit',
    'toggleView': 'toggleView'
  }
  
  const mappedAction = actionMap[action]
  if (mappedAction) {
    // 特殊处理：切换视图
    if (action === 'toggleView') {
      const isPreview = router.currentRoute.value.name === 'preview'
      if (isPreview) {
        router.push('/edit')
      } else {
        router.push('/')
      }
      return
    }
    
    // 调用对应的菜单函数
    dispatchFunc(mappedAction, null)
  }
}
</script>

<style scoped>
.nav-box {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-item {
  margin-right: 30px;
}

.nav-right,
.nav-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.nav-right {
  justify-content: flex-end;
}

.pointer {
  cursor: pointer;
}

.active {
  color: var(--el-color-primary);
}

.active svg {
  fill: var(--el-color-primary);
}

.scale-result-box {
  text-align: center;
  line-height: 1;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.text-center {
  text-align: center
}

.font-12 {
  font-size: 12px
}

.el-dropdown-link {
  display: flex;
  align-items: baseline;
  justify-content: center;
  outline: none;
}

.flex-center {
  display: flex;
  justify-content: flex-start;
  align-items: center
}

.l-14 {
  line-height: 14px;
  margin-top: -4px
}

.mb-7 {
  margin-bottom: 7px;
}
</style>