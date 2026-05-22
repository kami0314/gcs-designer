<template>
  <div class="search-input">
    <el-input
      type="text"
      @input="searchChange"
      @clear="handleClear"
      v-model="search"
      placeholder="搜索图标"
      :prefix-icon="Search"
      clearable
    ></el-input>
  </div>
  <el-scrollbar height="100%" class="icons-scrollbar">
    <el-empty v-if="isEmpty" description="暂无图元"></el-empty>
    <div class="icons-container" v-else>
      <el-collapse v-model="activeNames">
        <template v-for="item in searchList" :key="item.name">
          <el-collapse-item v-if="item.show" :title="item.name" :name="item.name">
            <div class="icon-wrap" v-if="activeNames.includes(item.name)">
              <div
                class="icon-item"
                :title="child.name"
                v-for="child in item.list"
                :key="child.icon"
                :draggable="true"
                @dragstart.stop="dragStart($event, child)"
              >
                <!-- 自定义图 -->
                <el-image class="svg-icon" fit="contain" v-if="child.image" :src="child.image" />
                <!-- svg内置 -->
                <svg v-else class="l-icon svg-icon" aria-hidden="true">
                  <use :xlink:href="'#' + child.icon" />
                </svg>
                <div>{{ child?.iconName ?? child?.name ?? '图元' }}</div>
              </div>
            </div>
          </el-collapse-item>
        </template>
      </el-collapse>
    </div>
  </el-scrollbar>
  <div class="text-center">
    <el-button @click="showChartDialog" :icon="Menu"> 管理图元 </el-button>
  </div>
  <!-- 图元管理弹框 -->
  <el-dialog title="管理图元" v-model="chartDialogVisible" width="600px">
    <el-row :gutter="20">
      <el-col class="chart-wrap" :span="24" v-for="(item, index) in searchList" :key="index">
        <div>{{ item.name }}</div>
        <el-switch v-model="item.show"></el-switch>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts" setup>
/** 防抖函数 */
function debounce(this: any, fn: Function, timers = 200) {
  let timeId: any = null
  return (...args: any[]) => {
    if (timeId) clearTimeout(timeId)
    timeId = setTimeout(() => {
      fn.apply(this, args as any[])
    }, timers)
  }
}

import { Search, Menu } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { defaultIcons } from '../config/defaultIcon'
import { otherIcons } from '../config/otherIcon'
import ContomIcons from '@/config/constomSvg.json'
import { pngToPens, svgToPens } from '@/utils/index'

// Electron 环境下将绝对路径 /pens/... 转为相对路径 ./pens/...
function resolveIconPath(iconPath: string): string {
  if (window.electronAPI?.isElectron) {
    return iconPath.replace(/^\/pens\//, './pens/')
  }
  return iconPath
}

let customIconList: Array<any> = []
// 加载自定义图表
ContomIcons.forEach((item) => {
  let obj = {
    name: item.name,
    show: true,
    list: [] as Array<any>
  }
  item.list.forEach((path: string) => {
    obj.list.push(pngToPens(resolveIconPath(path)))
  })
  customIconList.push(obj)
})

const activeNames = ref([])
const search = ref('')
let searchList = ref([...defaultIcons, ...otherIcons, ...customIconList])
const chartDialogVisible = ref(false)

/** 拖拽 */
function dragStart(e: DragEvent, item: any) {
  if (!item) return false
  e.dataTransfer?.setData('Meta2d', JSON.stringify(item.data))
}

/** 搜索图标 */
const searchChange = debounce((value: string) => {
  searchList.value = []
  let list = [...defaultIcons, ...otherIcons, ...customIconList]
  if (!value) {
    searchList.value = list
    return false
  }
  list.forEach((item) => {
    if (!item.show) return false
    let filter = item.list.filter((i: any) => <string>i.name.includes(value))
    if (filter.length) {
      searchList.value.push({
        ...item,
        list: filter
      })
    }
  })
})

/** 清空搜索 */
function handleClear() {
  console.log([...defaultIcons, ...otherIcons, ...customIconList])
  searchList.value = [...defaultIcons, ...otherIcons, ...customIconList]
}
/** 图元管理 */
function showChartDialog() {
  chartDialogVisible.value = true
}

/** 是否为空 */
const isEmpty = computed(() => {
  return searchList.value.filter((it) => it.show).length === 0
})
</script>

<style scoped>
.icons-container {
  padding-left: 10px;
  padding-right: 10px;
}

.icon-wrap {
  display: grid;
  text-align: center;
  grid-template-columns: repeat(5, 20%);
}

.icon-item {
  padding: 5px;
}

.svg-icon {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.icons-scrollbar {
  height: calc(100% - 100px);
}

.text-center {
  margin-top: 10px;
  text-align: center;
}

.search-input {
  padding: 10px;
}

.chart-wrap {
  display: flex;
  justify-content: space-between;
}

.elips {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
