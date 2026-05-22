<template>
    <el-container class="full-height" direction="vertical">
        <Header />
        <el-container class="main-height">
            <Aside />
            <Suspense>
                <template #default>
                    <Meta2d />
                </template>
                <template #fallback>
                    <div class="loading-box">
                        <el-icon class="loading-icon" :size="40">
                            <Loading />
                        </el-icon>
                        <p>画布加载中...</p>
                    </div>
                </template>
            </Suspense>
            <Suspense>
                <template #default>
                    <Setting />
                </template>
                <template #fallback>
                    <div class="setting-placeholder"></div>
                </template>
            </Suspense>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import Aside from '@/components/Aside.vue'

// 异步加载 Meta2d 和 Setting 组件，减少首屏加载时间
const Meta2d = defineAsyncComponent(() => import('@/components/Meta2d.vue'))
// @ts-expect-error Setting.vue 缺少 ts 声明
const Setting = defineAsyncComponent(() => import('@/components/Setting.vue'))

</script>

<style scoped>
.full-height {
    height: 100%;
}

.main-height {
    height: calc(100% - 50px);
}

.loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
    font-size: 14px;
}

.loading-icon {
    animation: rotating 2s linear infinite;
    margin-bottom: 12px;
}

/* Setting 组件加载占位，防止页面跳动 */
.setting-placeholder {
    width: 300px;
    min-height: 100%;
    box-shadow: 0 2px 4px 0 #dad7d7;
    background: linear-gradient(90deg, #f5f7fa 25%, #e8eaed 50%, #f5f7fa 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes rotating {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>