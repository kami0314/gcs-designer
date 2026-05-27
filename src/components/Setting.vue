<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import MapProps from './MapProps/Map.vue'
import Global from './MapProps/Global.vue'
// 使用异步组件 + 懒加载，首次不加载 Appearance 内部的大列表
import Appearance from './PenProps/Appearance.vue'
import Event from './PenProps/Event.vue'
import Animate from './PenProps/Animate.vue'
import Correspondence from './MapProps/Correspondence.vue'
import Construction from './MapProps/Construction.vue'
import Layout from './MapProps/Layout.vue'
import DataBind from './PenProps/DataBind.vue'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  activeType?: string
}>()
let activeName1 = ref('map')
let activeName2 = ref('appearance')
let activeName3 = ref('appearance')
let activePen = ref(false)
let multiPen = ref(false)

// 用于控制组件懒加载 - 使用标记控制是否渲染
const isAppearanceLoaded = ref(false)   // 首次加载时延迟渲染
const isEventLoaded = ref(false)       
const isAnimateLoaded = ref(false)
const isDataBindLoaded = ref(false)
const isLayoutLoaded = ref(false)
const isConstructionLoaded = ref(false)

// 强制触发首次加载完成后再渲染 Appearance
let isInitialLoad = true

const active = (args: unknown[]) => {
  if (args.length >= 1) activePen.value = true
  if (args.length > 1) {
    multiPen.value = true
  } else {
    multiPen.value = false
  }
  
  // 当有图元被选中时，根据当前活跃的 Tab 立即触发懒加载
  // 避免切换 Tab 时组件未接收到 active 事件数据
  if (args.length >= 1) {
    if (activeName2.value === 'appearance' || activeName3.value === 'appearance') {
      isAppearanceLoaded.value = true
    }
    if (activeName2.value === 'animate') {
      isAnimateLoaded.value = true
    }
    if (activeName2.value === 'event') {
      isEventLoaded.value = true
    }
    if (activeName2.value === 'other') {
      isDataBindLoaded.value = true
    }
  }
}
let autoLoadAppearance: ((args: unknown[]) => void) | null = null

onMounted(() => {
  // 监听鼠标点击事件，返回
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.on('active' as any, active as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.on('inactive' as any, inactive as any)

  // 首次激活后自动加载 Appearance
  autoLoadAppearance = (args: unknown[]) => {
    if (args.length >= 1 && !multiPen.value && isInitialLoad) {
      triggerAppearanceLoad()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta2d.off('active' as any, autoLoadAppearance as any)
      autoLoadAppearance = null
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.on('active' as any, autoLoadAppearance as any)
})

onUnmounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.off('active' as any, active as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.off('inactive' as any, inactive as any)
  if (autoLoadAppearance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta2d.off('active' as any, autoLoadAppearance as any)
  }
})

// Tab 切换时触发懒加载
const handleTabChange = (tabName: string) => {
  // 根据切换到的 Tab 标记已加载
  if (activeName2.value === 'appearance' || activeName3.value === 'appearance') {
    isAppearanceLoaded.value = true
  }
  if (tabName === 'event') isEventLoaded.value = true
  if (tabName === 'animate') isAnimateLoaded.value = true
  if (tabName === 'other') isDataBindLoaded.value = true
  if (tabName === 'layout') isLayoutLoaded.value = true
  if (tabName === 'construction') isConstructionLoaded.value = true
}

// 监听单节点选中，首次加载后立即渲染 Appearance
const triggerAppearanceLoad = () => {
  if (isInitialLoad && !multiPen.value && activePen.value) {
    setTimeout(() => {
      isAppearanceLoaded.value = true
      isInitialLoad = false
    }, 100) // 延迟 100ms 让主线程空闲
  }
}



function inactive() {
  activePen.value = false
  multiPen.value = false
  // 重置懒加载状态，确保下次选中时能正确触发
  // 但保留 Appearance 的加载状态，因为它是最常用的 Tab
  isEventLoaded.value = false
  isAnimateLoaded.value = false
  isDataBindLoaded.value = false
  isLayoutLoaded.value = false
  isConstructionLoaded.value = false
}

</script>

<template>
  <div class="setting">
    <div class="tz_props" v-show="!activePen">
      <el-tabs v-model="activeName1" class="demo-tabs" active-name="first">
        <el-tab-pane label="图纸" name="map" class="tab">
          <MapProps></MapProps>
        </el-tab-pane>
        <el-tab-pane label="全局配置" name="global" class="tab">
          <Global></Global>
        </el-tab-pane>
        <el-tab-pane label="通信" name="correspondence" class="tab">
          <Correspondence></Correspondence>
        </el-tab-pane>
        <el-tab-pane label="布局" name="layout" class="tab">
          <Layout></Layout>
        </el-tab-pane>
        <el-tab-pane label="结构" name="construction" class="tab">
          <Construction></Construction>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="ty_props" v-show="activePen && !multiPen">
      <el-tabs v-model="activeName2" class="demo-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="外观" name="appearance">
          <!-- 使用 v-if 控制渲染时机 -->
          <Appearance v-if="isAppearanceLoaded" />
        </el-tab-pane>
        <el-tab-pane label="事件" name="event">
          <Event v-if="isEventLoaded" />
        </el-tab-pane>
        <el-tab-pane label="动效" name="animate">
          <Animate v-if="isAnimateLoaded" />
        </el-tab-pane>
        <el-tab-pane label="数据" name="other">
          <DataBind v-if="isDataBindLoaded" />
        </el-tab-pane>
        <el-tab-pane label="结构" name="construction" class="tab">
          <Construction></Construction>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="ty_props" v-show="activePen && multiPen">
      <el-tabs v-model="activeName3" class="demo-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="外观" name="appearance">
          <!-- 多选时也懒加载 -->
          <Appearance v-if="isAppearanceLoaded" />
        </el-tab-pane>
        <el-tab-pane label="布局" name="layout" class="tab">
          <Layout v-if="isLayoutLoaded" />
        </el-tab-pane>
        <el-tab-pane label="结构" name="construction" class="tab">
          <Construction v-if="isConstructionLoaded" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.setting {
  position: relative;
  display: flex;
  width: 300px;
  padding: 10px 0 0 10px;
  overflow: auto;
  box-shadow: 0 2px 4px 0 #dad7d7;
  font-size: 12px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__content::-webkit-scrollbar) {
  width: 4px;
  height: 1px;
}

:deep(.el-tabs__content::-webkit-scrollbar-thumb) {
  border-radius: 2px;
  background: #c0c4cc;
}

:deep(.el-tabs__content::-webkit-scrollbar-track) {
  background: transparent;
}

.tz_props {
  display: flex;
  width: 100%;
}

.ty_props {
  display: flex;
  width: 100%;
}

:deep(.el-tabs__header) {
  height: 36px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 10px;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding-right: 6px;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 右侧表单字体调小 */
:deep(.el-form-item__label) {
  font-size: 12px;
  padding: 0 6px 0 0;
  line-height: 28px;
}

:deep(.el-form-item__content) {
  line-height: 28px;
}

:deep(.el-form-item) {
  margin-bottom: 6px;
}

:deep(.el-input__inner) {
  font-size: 12px;
  height: 28px;
  line-height: 28px;
}

:deep(.el-input__icon) {
  line-height: 28px;
}

:deep(.el-collapse-item__header) {
  font-size: 12px;
  height: 36px;
  line-height: 36px;
  padding-left: 8px;
}

:deep(.el-collapse-item__content) {
  font-size: 12px;
  padding-bottom: 8px;
}

:deep(.el-button--small) {
  font-size: 12px;
  padding: 5px 10px;
}

:deep(.el-tag) {
  font-size: 12px;
  height: 22px;
  line-height: 20px;
}

:deep(.el-select .el-input__inner) {
  font-size: 12px;
}

:deep(.el-color-picker--small .el-color-picker__trigger) {
  width: 28px;
  height: 28px;
}
</style>