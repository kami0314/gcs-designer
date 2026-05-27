<template>
    <el-dialog append-to-body @open="open" draggable title="绑定变量" width="800px" v-model="visible">
        <div class="prl-10 mb-15 bind-data-box">
            <span>当前绑定：</span>
            <span>{{ defaultCheckedKeys.join() || '无' }}</span>
        </div>
        <div class="prl-10">
            <el-input class="mb-15" v-model="query" placeholder="输入关键字进行搜索" :suffix-icon="Search"
                @input="onQueryChanged" clearable @clear="onQueryChanged('')" />
            <el-tree-v2 :class="{ sigleCheck: !showCheckbox }" ref="treeRef" @check-change="onCheckChange" showCheckbox
                :data="treeData" :props="treeProps" :filter-method="filterMethod" @node-click="onNodeClick"
                empty-text="暂无数据" :height="400" />
        </div>

        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { getData, type DataTree } from '@/api/data'
import { onMounted, ref, computed, watchEffect } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { deepClone } from '@meta2d/core';

let treeData: DataTree[] = []
const treeRef = ref()

const treeProps = {
    value: 'id',
    label: 'name',
    children: 'children',
}
const query = ref('')
const checkNodes = ref<any[]>([])

const props = withDefaults(defineProps<{
    modelValue: boolean,
    showCheckbox: boolean,
    select: Array<{ dataId: string, name: string }>
}>(), {
    modelValue: false,
    showCheckbox: false,
    select: () => []
})


const emit = defineEmits(['update:modelValue', 'update'])

const visible = computed({
    get: () => props.modelValue,
    set: (val) => {
        emit('update:modelValue', val)
    }
})

const defaultCheckedKeys = computed(() => {
    return props.select.map(item => item.dataId)
})

async function loadTreeData() {
    try {
        treeData = await getData()
    } catch (err) {
        console.error('Failed to load device data:', err)
        treeData = []
    }
}

onMounted(() => {
    loadTreeData()
})

watchEffect(() => {
    checkNodes.value = props.select.map(item => {
        return {
            id: item.dataId,
            name: item.name
        }
    })
})

const open = () => {
    query.value = ""
    onQueryChanged('')
    treeRef.value!.setCheckedKeys(checkNodes.value.map(it => it.id))
    // 重新加载设备数据（可能已更新）
    loadTreeData().then(() => {
        onQueryChanged('')
    })
}

/** tree过滤 */
const filterMethod = (query: string, node: any) => {
    return node.name!.includes(query)
}
/** 搜索 */
const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query)
}
/** 勾选改变 */
const onCheckChange = (data: any, checked: boolean) => {
    // 单选模式下由 onNodeClick 管理 checkNodes，不依赖复选框的 check-change 事件
    if (!props.showCheckbox) {
        return
    }
    let selectNodes = treeRef.value!.getCheckedNodes()
    checkNodes.value = selectNodes.filter((it: any) => !it.children?.length)
}
/** 确定 */
const handleSubmit = () => {
    const result = checkNodes.value.map(item => ({ dataId: item.id, name: item.name }))
    emit('update', deepClone(result))
    visible.value = false
}
/** 点击节点 */
const onNodeClick = (data: any) => {
    if (!props.showCheckbox) {
        treeRef.value.setCheckedKeys([])
        if (data.children?.length) {
            return false
        }
        treeRef.value.setChecked(data.id, true)
        checkNodes.value = [data]
    }
}
</script>

<style scoped>
.prl-10 {
    padding: 0 10px;
}

.mb-15 {
    margin-bottom: 15px;
}

.bind-data-box {
    display: flex;
    align-items: baseline;
}

.bind-data-box>span:nth-child(1) {
    flex-shrink: 0;
    flex-basis: 70px;
}

.sigleCheck :deep(.is-checked + .el-tree-node__label) {
    background: rgb(59, 134, 233);
    color: #fff;
    padding: 0 5px;
}

.sigleCheck :deep(.el-checkbox) {
    display: none;
}
</style>