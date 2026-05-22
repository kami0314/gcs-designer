<script setup lang="ts">
import { RouterView } from 'vue-router'
import { reactive,onMounted } from 'vue'
import { emitter } from '@/utils'

// 监听 Electron 菜单事件
onMounted(() => {
  if (window.electronAPI?.onMenuAction) {
    window.electronAPI.onMenuAction((action: string) => {
      console.log('[Menu] Action:', action)
      // 触发全局事件，让其他组件处理
      emitter.emit('menu:action', action)
    })
  }
})
const font = reactive({
  color: 'rgba(0, 0, 0, .15)',
})
</script>

<template>
  <el-watermark :zIndex="1000" :font="font" class="watermark-box" content="工业组态编辑器">
    <RouterView />
  </el-watermark>
</template>

<style scoped>
.watermark-box {
  height: 100%;
}
</style>
