<template>
    <!-- 先检测是否有项目文件 -->
    <div v-if="showDialog" class="preview-dialog-container">
        <div class="preview-dialog">
            <!-- <div class="dialog-icon"></div> -->
            <h3>⚠️ 提示</h3>
            <p>未找到项目文件，请先创建项目。</p>
            <button class="dialog-button" @click="goToEdit">点击创建</button>
        </div>
    </div>
    <!-- 有项目文件才渲染 Meta2d -->
    <Meta2d v-else preview />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { emitter } from '@/utils/emitter'
import Meta2d from '@/components/Meta2d.vue'

const router = useRouter()
const showDialog = ref(false)

onMounted(async () => {
    // 检测是否有项目文件
    if (window.electronAPI?.readJson) {
        try {
            const result = await window.electronAPI.readJson('project.json')
            if (!result.success || !result.data) {
                // 没有项目文件，显示弹窗
                showDialog.value = true
            }
        } catch (err) {
            // 读取失败，也显示弹窗
            showDialog.value = true
        }
    }
    
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
    console.log('[Preview] Menu action:', action)
    
    // 切换编辑/预览
    if (action === 'toggleView') {
        router.push('/edit')
        return
    }
    
}

function goToEdit() {
    router.push('/edit')
}
</script>

<style scoped>
.preview-dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.preview-dialog {
    background: white;
    border-radius: 8px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.preview-dialog h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #333;
}

.preview-dialog p {
    margin: 0 0 25px 0;
    color: #666;
    line-height: 1.6;
}

.dialog-button {
    background: #409eff;
    color: white;
    border: none;
    padding: 10px 30px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
}

.dialog-button:hover {
    background: #66b1ff;
}

.dialog-button:active {
    background: #3a8ee6;
}
</style>