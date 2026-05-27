<template>
    <el-form class="p10" :model="bindData" label-width="80px" label-position="left">
        <el-form-item class="mb-10" label="ID">
            <el-input disabled v-model="bindData.id" placeholder="请输入ID" />
        </el-form-item>
        <el-collapse>
            <el-collapse-item title="Tag标签">
                <el-tag type="info" class="mtb-5" v-for="(tag, index) in bindData.tags" :key="index" closable
                    @close="handleCloseTag(index)">{{ tag }}</el-tag>
                <el-form-item class="mb0" label-width="0px">
                    <el-input v-model="tags" @keyup.enter="addTags" placeholder="按回车添加（最大长度100）" />
                </el-form-item>
            </el-collapse-item>
            <el-collapse-item title="数据">
                <template v-for="(item, index) in bindData.form">
                    <el-form-item class="mb-10" :label="item.name">
                        <div class="form-item-box flex-between">
                            <!-- 文字 -->
                            <el-input class="flex-left" v-if="item.type == 'text'" v-model="bindData[item.key]"
                                :readonly="item.readonly" :type="item.type" :placeholder="item.placeholder"
                                @change="handleFormChange" />
                            <!-- 按钮代码编辑 -->
                            <el-button size="small" :disabled="item.readonly" v-if="item.type === 'code'"
                                @click="showCode(item)">···</el-button>
                            <!-- 数字、不存在key2 -->
                            <el-input-number class="flex-left" v-model="bindData[item.key]"
                                v-if="item.type === 'number' && !item.key2" :readonly="item.readonly" :min="item.min"
                                :max="item.max" controls-position="right" :precision="item.precision"
                                :placeholder="item.placeholder" @change="handleFormChange" />
                            <!-- 数字、存在key2 -->
                            <el-input-number class="flex-left" v-model="bindData[item.key][item.key2]"
                                v-if="item.type === 'number' && item.key2" :readonly="item.readonly" :min="item.min"
                                :max="item.max" controls-position="right" :precision="item.precision"
                                :placeholder="item.placeholder" @change="handleFormChange" />
                            <!-- 颜色 -->
                            <el-color-picker :disabled="item.readonly" class="flex-left" v-model="bindData[item.key]"
                                :predefine="predefineColors" show-alpha v-if="item.type === 'color'"
                                @change="handleFormChange" />

                            <!-- 多行文本 -->
                            <el-input class="flex-left" v-if="item.type == 'textarea'" type="textarea"
                                v-model="bindData[item.key]" :readonly="item.readonly" :type="item.type"
                                :placeholder="item.placeholder" @change="handleFormChange" />

                            <!-- 下拉框 -->
                            <el-select class="flex-left" v-if="item.type == 'select'" v-model="bindData[item.key]"
                                :disabled="item.readonly" :placeholder="item.placeholder" @change="handleFormChange">
                                <template v-if="Array.isArray(item.options)">
                                    <el-option v-for="(option, index) in item.options" :key="index"
                                        :label="option.label" :value="option.value"></el-option>
                                </template>
                            </el-select>
                            <!-- 开关 -->
                            <el-switch class="flex-left" :disabled="item.readonly" v-if="item.type === 'switch'"
                                v-model="bindData[item.key]" @change="handleFormChange" />
                            <!-- 滑块 -->
                            <el-slider class="flex-left" :disabled="item.readonly" v-if="item.type === 'slider'"
                                v-model="bindData[item.key]" :min="item.min" :max="item.max" :step="item.step"
                                @change="handleFormChange" />

                            <span class="handle-icons">
                                <el-icon class="pointer hover" title="链接" @click="handleLink(item, index)">
                                    <el-icon-link />
                                </el-icon>
                                <el-icon class="pointer mrl-10 hover" title="编辑" @click="handleEdit(item, index)">
                                    <el-icon-edit />
                                </el-icon>
                                <el-popconfirm title="确定要删除?" cancel-button-text="取消" confirm-button-text="确定"
                                    @confirm="handleFormDelete(item)">
                                    <template #reference>
                                        <el-icon class="pointer hover" title="删除">
                                            <el-icon-delete />
                                        </el-icon>
                                    </template>
                                </el-popconfirm>
                            </span>
                        </div>
                    </el-form-item>
                    <template v-if="item.dataIds">
                        <el-form-item class="mb-10 flex-between form-item-box">
                            <div class="bind-data-items" :title="item.dataIds.map((it) => it.dataId).join()">
                                {{ item.dataIds.map((it) => it.dataId).join() }}
                            </div>
                            <el-popconfirm title="确定取消绑定?" cancel-button-text="取消" confirm-button-text="确定"
                                @confirm="handleDeleteDataBind(item)">
                                <template #reference>
                                    <el-icon class="handle-icons pointer hover" title="取消绑定">
                                        <el-icon-delete />
                                    </el-icon>
                                </template>
                            </el-popconfirm>
                        </el-form-item>
                    </template>
                </template>
                <div class="flex-center" v-if="bindData.form && bindData.form.length == 0">
                    暂无数据，<el-button @click="handleAdd" :icon="Plus" type="primary" link>添加</el-button>
                </div>
                <el-button v-else class="full" :icon="Plus" @click="handleAdd">添加</el-button>
            </el-collapse-item>
        </el-collapse>
    </el-form>
    <!-- 代码 -->
    <EditDialog title="配置" v-model="echartsConfig" v-model:visible="visible" @done="done" />
    <!-- 添加数据 -->
    <el-dialog append-to-body draggable destroy-on-close title="添加数据" v-model="visibleAdd" width="400px">
        <el-form ref="ruleForm" :rules="rules" :model="addData" label-width="80px">
            <el-form-item label="显示名称" prop="name">
                <el-input v-model="addData.name" placeholder="请输入显示名称" />
            </el-form-item>
            <el-form-item label="属性" prop="key">
                <el-input v-model="addData.key" placeholder="请输入属性" />
            </el-form-item>
            <el-form-item label="禁止编辑" prop="readonly">
                <el-switch v-model="addData.readonly" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
                <el-select v-model="addData.type" placeholder="请选择类型" @change="handleTypeChange">
                    <el-option label="文本" value="text" />
                    <el-option label="数字" value="number" />
                    <el-option label="颜色" value="color" />
                    <el-option label="多行文本" value="textarea" />
                    <el-option label="下拉框" value="select" />
                    <el-option label="开关" value="switch" />
                    <el-option label="Json" value="code" />
                    <el-option label="滑块" value="slider" />
                </el-select>
            </el-form-item>
            <el-form-item label="提示文字">
                <el-input v-model="addData.placeholder" placeholder="请输入提示文字" />
            </el-form-item>
        </el-form>
        <!-- 滑块、数组 -->
        <el-form label-width="80px" :model="numberForm" v-if="addData.type == 'number' || addData.type == 'slider'">
            <el-form-item label="最小值">
                <el-input type="number" v-model="numberForm.min" placeholder="请输入最小值" />
            </el-form-item>
            <el-form-item label="最大值">
                <el-input type="number" v-model="numberForm.max" placeholder="请输入最大值" />
            </el-form-item>
            <el-form-item label="步长">
                <el-input type="number" v-model="numberForm.step" placeholder="请输入步长"></el-input>
            </el-form-item>
            <el-form-item label="精度" v-if="addData.type == 'number'">
                <el-input type="number" v-model="numberForm.precision" placeholder="请输入精度"></el-input>
            </el-form-item>
        </el-form>
        <!-- 下拉框 -->
        <el-form label-width="80px" :model="selectForm" v-if="addData.type == 'select'">
            <template v-for="item in selectForm.options">
                <el-form-item label="选项名">
                    <el-input type="text" v-model="item.label" placeholder="请输入选项名" />
                </el-form-item>
                <el-form-item label="选项值">
                    <el-input type="text" v-model="item.value" placeholder="请输入选项值" />
                </el-form-item>
            </template>
            <el-form-item>
                <el-button type="primary" @click="addSelectOption">新增选项</el-button>
                <el-button type="danger" @click="deleteSelectOption"
                    :disabled="selectForm.options.length == 0">删除选项</el-button>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="close">取 消</el-button>
            <el-button type="primary" @click="save">确 定</el-button>
        </template>
    </el-dialog>
    <!-- 绑定数据弹框 -->
    <BindDataDialog v-model="dataVisible" :show-checkbox="selectForm.multiple" :select="selectForm.dataIds"
        @update="handleUpdate" />
</template>

<script setup>
import { reactive, ref, unref, onMounted, onUnmounted } from 'vue';
import { Plus } from '@element-plus/icons-vue'
import { deepClone } from '@meta2d/core'
import BindDataDialog from './BindDataDialog.vue'
/** 绑定数据 */
const bindData = ref({ form: [] })
const tags = ref()
// charts配置
const echartsConfig = ref({})
// 代码弹框
const visible = ref(false)
// 预设颜色
const predefineColors = reactive([
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577'
])
// 代码code修改，charts类型
const echartsKey = ref("echarts")
// 修改数据弹框显示
const visibleAdd = ref(false)
// 修改数据form表单
const addData = ref({ name: '', key: '', type: 'text', placeholder: '' })
// 数字、滑块form
const numberForm = ref({})
// 下拉框表单
const selectForm = ref({
    options: []
})
// 修改数据ref
const ruleForm = ref()
// 是否是修改
const dataEditFlag = ref(false)
// 修改的数据索引
const dataEditIndex = ref(0)
// 表单验证
const rules = reactive({
    name: [
        { required: true, message: '不能为空', trigger: 'blur' },
    ],
})
const dataVisible = ref(false)


/** 代码回调 */
function done(data) {
    bindData.value[echartsKey.value] = JSON.parse(data)
    meta2d.setValue(deepClone(unref(bindData)))
    meta2d.render()
}

/** 显示代码 */
function showCode(item) {
    echartsKey.value = item.key
    echartsConfig.value = JSON.stringify(bindData.value[item.key] || {})
    visible.value = true
}

/** 选中回调 */
function active(args) {
    bindData.value = []
    if (args.length) {
        let data = args[0]
        data.tags = data.tags || []
        data.form = data.form || []
        // 防御：修复表格图元被破坏的 styles/data 结构
        if (data.name === 'table2') {
            if (data.styles !== undefined && !Array.isArray(data.styles)) {
                console.warn('[DataBind] Fixing corrupted styles for table2 pen', data.id)
                data.styles = []
            }
            if (data.data !== undefined && !Array.isArray(data.data)) {
                console.warn('[DataBind] Fixing corrupted data for table2 pen', data.id)
                data.data = [[]]
            }
        }
        bindData.value = data
    }
}

onMounted(() => {
    meta2d.on('active', active)
})

onUnmounted(() => {
    meta2d.off('active', active)
})

/** 删除tags */
function handleCloseTag(index) {
    if (bindData.value.tags) {
        bindData.value.tags.splice(index, 1)
    }
    meta2d.setValue({
        id: bindData.value.id,
        tags: deepClone(bindData.value.tags)
    })
    meta2d.render()
}

/** 添加tags */
function addTags() {
    if (tags.value) {
        if (bindData.value.tags) {
            bindData.value.tags.push(tags.value)
        } else {
            bindData.value.tags = [tags.value]
        }
        tags.value = ''
        meta2d.setValue({
            id: bindData.value.id,
            tags: deepClone(bindData.value.tags)
        })
        meta2d.render()
    }
}

/** 添加数据 */
function handleAdd() {
    dataEditFlag.value = false
    addData.value = {
        name: '',
        key: '',
        type: 'text',
        placeholder: ''
    }
    visibleAdd.value = true
}
/** 编辑数据 */
function handleEdit(item, index) {
    dataEditFlag.value = true
    dataEditIndex.value = index
    let data = deepClone(item)
    addData.value = data
    numberForm.value = data
    selectForm.value = { options: data.options || [] }
    visibleAdd.value = true
}


/** 数据编辑弹框关闭 */
function close() {
    visibleAdd.value = false
    ruleForm.value.resetFields()
}

/** 类型改变 */
function handleTypeChange() {
    numberForm.value = {
        max: "",
        min: "",
        step: "",
        precision: ""
    }
    selectForm.value = { options: [] }
    selectForm.value.options = []
}
/** 添加选项 */
function addSelectOption() {
    selectForm.value.options.push({
        label: '',
        value: ''
    })
}

/** 删除选项 */
function deleteSelectOption() {
    selectForm.value.options.pop()
}

/** 添加数据保存 */
function save() {
    ruleForm.value.validate(valid => {
        if (!valid) return false
        let data = JSON.parse(JSON.stringify(unref(addData)))
        /** 数字类型、滑块类型 */
        if (data.type == 'number' || data.type == 'slider') {
            let { max, min, step, precision } = unref(numberForm)
            Object.assign(data, { max: +max, min: +min, step: +step, precision: +precision })
        }
        /** 下拉框类型 */
        if (data.type == 'select') {
            let { options } = unref(selectForm)
            options = deepClone(options || [])
            Object.assign(data, { options })
        }
        /** Json代码 */
        if (data.type == 'code') {
            data.language = 'json'
        }
        // 滑块
        if (data.type == 'slider' && !bindData.value[data.key]) {
            bindData.value[data.key] = Number(data.min) || 0
        }
        if (dataEditFlag.value) {
            /** 修改 */
            bindData.value.form.splice(dataEditIndex.value, 1, data)
        } else {
            /** 新增 */
            bindData.value.form.push(data)
        }
        meta2d.setValue({
            id: bindData.value.id,
            form: deepClone(bindData.value.form)
        })
        meta2d.render()
        visibleAdd.value = false
    })
}

/** 删除绑定数据 */
function handleDeleteDataBind(item) {
    let newForm = bindData.value.form.filter(it => {
        if (it.key == item.key) {
            it.dataIds = []
        }
        return it
    })
    meta2d.setValue({
        id: bindData.value.id,
        form: deepClone(newForm)
    })
    meta2d.render()
    // 刷新 bindDatas 映射，确保消息处理能识别最新的绑定关系
    meta2d.initBindDatas()
    active(meta2d.store.active)
}
/** 删除form */
function handleFormDelete(index) {
    bindData.value.form.splice(index, 1)
    meta2d.setValue({
        id: bindData.value.id,
        form: deepClone(bindData.value.form)
    })
    meta2d.render()
}
/** 数据改变事件 */
function handleFormChange() {
    meta2d.setValue({
        id: bindData.value.id,
        form: deepClone(bindData.value.form)
    })
    meta2d.render()
}

/** 绑定变量 */
function handleLink(item, index) {
    dataEditIndex.value = index
    selectForm.value = deepClone(item)
    dataVisible.value = true
}
/** 更新变量 */
function handleUpdate(item) {
    bindData.value.form[dataEditIndex.value].dataIds = item || []
    // 只更新 form 属性，避免触发表格/echarts 等组件的完整重初始化
    meta2d.setValue({
        id: bindData.value.id,
        form: deepClone(bindData.value.form)
    })
    meta2d.render()
    // 刷新 bindDatas 映射，确保消息处理能识别最新的绑定关系
    meta2d.initBindDatas()
}

</script>

<style scoped>
.p10 {
    padding: 10px;
}

.mb0 {
    margin-bottom: 0;
}

.mtb-5 {
    margin: 5px 5px 5px 0;
}

.mb-10 {
    margin-bottom: 10px;
}

.full {
    width: 100%;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pointer {
    cursor: pointer;
    font-size: 16px;
}

.hover:hover {
    color: #1890ff;
}

.bind-data-items {
    width: calc(100% - 30px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.handle-icons {
    display: none;
}

.form-item-box {
    width: 100%;
}

.form-item-box:hover .handle-icons {
    display: block;
}

.flex-left {
    width: 120px;
}

.mrl-10 {
    margin-right: 10px;
    margin-left: 10px;
}

.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>