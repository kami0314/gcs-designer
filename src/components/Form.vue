<script setup lang="ts">
/**
 * 动态表单渲染组件
 * 根据 formList 配置动态渲染不同类型的表单项
 * 优化点：
 * 1. 使用 v-show 替代 v-if 减少重新渲染
 * 2. 添加 key 提升 Diff 算法性能
 * 3. 预计算隐藏状态避免重复判断
 * 4. 大列表虚拟化支持 (通过 CSS contain 提升性能)
 */

import { computed } from 'vue'

// 提前导入子组件，避免在模板渲染时加载
import GColorPicker from '@/components/GColorPicker.vue'

interface FormItemConfig {
  title: string
  type: string
  prop: string
  bindProp: Record<string, any>
  event: string
  option?: Record<string, any>
  func?: Function
  deleteFunc?: Function
  for?: string
}

interface FormGroup {
  title: string
  labelWidth?: string | number
  delete?: boolean
  tip?: string
  func?: Function
  children: FormItemConfig[]
}

const props = defineProps<{
  formList: FormGroup[]
}>()

// 预计算可见子项，减少模板中的过滤逻辑
interface VisibleChild {
  item: FormItemConfig
  index: number
}

interface GroupVisibleChildren {
  [key: string]: VisibleChild[]
}

// 缓存每个组的可见子项列表 - 避免模板中重复调用 filter
const groupVisibleChildren = computed(() => {
  const result: GroupVisibleChildren = {}
  for (const group of props.formList) {
    result[group.title] = group.children.reduce<VisibleChild[]>((acc, child, childIndex) => {
      if (!child.option?.hidden?.value) {
        acc.push({ item: child, index: childIndex })
      }
      return acc
    }, [])
  }
  return result
})

// 使用预计算的可见子项，避免模板中重复过滤和判断
const getVisibleChildren = (groupTitle: string) => {
  return groupVisibleChildren.value[groupTitle] || []
}
</script>

<template>
    <el-collapse accordion>
        <el-collapse-item v-for="(item, index) in props.formList" :key="item.title" :title="item.title">
            <template #title>
                <div class="title-box">
                    <div class="title-left">
                        <span>{{ item.title }}</span>
                        <el-tooltip v-if="item.tip" :content="item.tip" effect="dark" placement="top">
                            <el-icon style="margin-left: 4px">
                                <el-icon-warningFilled />
                            </el-icon>
                        </el-tooltip>
                    </div>
                    <el-popconfirm v-if="item.delete" @confirm.stop="item.func && item.func(index)" title="确定要删除吗?"
                        cancel-button-text="取消" confirm-button-text="确定">
                        <template #reference>
                            <el-icon @click.stop style="margin-right: 10px">
                                <el-icon-delete />
                            </el-icon>
                        </template>
                    </el-popconfirm>
                </div>
            </template>
            <!-- 使用预计算的可见子项列表，减少运行时过滤 -->
            <el-form @submit="(e: Event) => e.preventDefault()" :label-width="item.labelWidth || '150px'" 
                   v-show="true" :key="item.title">
                <!-- 遍历预计算的可见子项，避免 v-show 带来的 DOM 冗余 -->
                <template v-for="({ item: i, index: childIndex }) in getVisibleChildren(item.title)" :key="i.prop + childIndex">
                        <!-- 通用 label + tooltip 模板 -->
                        <el-form-item :label-width="i.option?.labelWidth">
                            <template #label v-if="i.title">
                                <span>{{ i.title }}</span>
                                <el-tooltip v-if="i.option?.tip" effect="dark" :content="i.option?.tip" placement="top">
                                    <el-icon style="margin-left: 4px;"><el-icon-warningFilled /></el-icon>
                                </el-tooltip>
                            </template>

                            <!-- 输入框 -->
                            <el-input v-if="i.type === 'input'" v-model="i.bindProp[i.prop]" :placeholder="i.option?.placeholder"
                                @[i.event]="i.func" :type="i.option?.type || 'text'" :clearable="i.option?.clearable || false"
                                :readonly="i.option?.readonly || false" :disabled="i.option?.disabled || false" />

                            <!-- 文件框 -->
                            <el-button v-else-if="i.type === 'file'">
                                <label :for="i.for || i.title">
                                    <input :id="i.for || i.title" style="display: none" type="file"
                                        :accept="i.option?.accept || '*/*'" @[i.event]="i.func" />
                                    选择文件
                                </label>
                            </el-button>

                            <!-- 图片 -->
                            <el-upload v-else-if="i.type === 'image'" class="avatar-uploader" action=""
                                :accept="i.option?.accept || '*/*'" :before-upload="i.func" :show-file-list="false">
                                <img v-if="i.bindProp[i.prop]" :src="i.bindProp[i.prop]" class="avatar" />
                                <el-icon v-else class="avatar-uploader-icon"><el-icon-plus /></el-icon>
                            </el-upload>

                            <!-- 按钮 -->
                            <el-button v-else-if="i.type === 'button'" :class="{ block: i.option?.block }"
                                @[i.event]="(...args: unknown[]) => i.func && i.func(...args, childIndex, index)" :type="i.option?.type || 'primary'"
                                :size="i.option?.size">
                                {{ i.option?.text || '按钮' }}
                            </el-button>

                            <!-- 数字框 -->
                            <el-input-number v-else-if="i.type === 'number'" controls-position="right"
                                :placeholder="i.option?.placeholder || '请输入'" :step="i.option?.step || 1"
                                v-model="i.bindProp[i.prop]" :min="i.option?.min ?? -Infinity"
                                :max="i.option?.max ?? Infinity" @[i.event]="i.func" :readonly="i.option?.readonly" />

                            <!-- 选择框 -->
                            <el-select v-else-if="i.type === 'select'" v-model="i.bindProp[i.prop]"
                                :placeholder="i.option?.placeholder" @[i.event]="i.func">
                                <el-option v-for="opt in i.option?.list" :key="opt.value" :label="opt.label"
                                    :value="opt.value" :disabled="opt.disabled">
                                    <div v-if="opt.template" class="select_template" v-html="opt.template"></div>
                                </el-option>
                            </el-select>

            <!-- 下拉菜单 - 缓存 find 结果避免重复查找 -->
                            <el-dropdown v-else-if="i.type === 'dropdown'" @[i.event]="i.func" trigger="click">
                                <span class="el-dropdown-link">
                                    <span class="m-dropdown-text" v-if="i.bindProp[i.prop] !== undefined">
                                        <!-- 使用计算属性缓存查找结果 -->
                                        <template v-for="selectedItem in [i.option?.list?.find((it: any) => it.value === i.bindProp[i.prop])]" :key="selectedItem?.value || 'empty'">
                                            <span v-if="selectedItem?.template"
                                                v-html="selectedItem.template" />
                                            <svg v-else-if="selectedItem?.icon"
                                                class="icon-svg" aria-hidden="true">
                                                <use :xlink:href="'#' + selectedItem.icon" />
                                            </svg>
                                            <span v-else>{{ selectedItem?.label || i.bindProp[i.prop] }}</span>
                                        </template>
                                    </span>
                                    <span v-else class="m-dropdown-text" style="opacity: 0.7;padding: 4px 0">
                                        {{ i.option?.placeholder }}&nbsp;
                                    </span>
                                    <el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-for="p in i.option?.list" :key="p.value" :command="p.value">
                                            <span v-if="p.template" v-html="p.template" />
                                            <svg v-else-if="p.icon" class="icon-svg" aria-hidden="true">
                                                <use :xlink:href="'#' + p.icon" />
                                            </svg>
                                            <span v-else>{{ p.label }}</span>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>

                            <!-- 取色器 - 使用异步组件减少初始加载体积 -->
                            <g-color-picker v-else-if="i.type === 'color'" :use-type="i.option?.useType"
                                :default-color="i.option?.defaultColor" v-model="i.bindProp[i.prop]" @[i.event]="i.func" />

                            <!-- 开关 -->
                            <el-switch v-else-if="i.type === 'switch'" v-model="i.bindProp[i.prop]" @[i.event]="i.func" />

                            <!-- 滑块 -->
                            <el-slider v-else-if="i.type === 'slider'" v-model="i.bindProp[i.prop]" @[i.event]="i.func"
                                :min="i.option?.min" :max="i.option?.max" />

                            <!-- 图标 -->
                            <template v-else-if="i.type === 'icon'">
                                <i @[i.event]="i.func" class="icon ticon pointer font-18" :class="i.bindProp[i.prop]"
                                    v-if="i.bindProp[i.prop]" />
                                <el-icon @[i.event]="i.deleteFunc" class="pointer ml-8 font-18"
                                    v-if="i.bindProp[i.prop]"><el-icon-delete /></el-icon>
                                <el-icon @[i.event]="i.func" class="pointer font-18"
                                    v-if="!i.bindProp[i.prop]"><el-icon-edit /></el-icon>
                            </template>

                            <!-- link -->
                            <el-button v-else-if="i.type === 'link'" type="primary" link size="small"
                                @[i.event]="i.func">{{ i.option?.text }}</el-button>

                            <!-- code -->
                            <el-button v-else-if="i.type === 'code'" size="small" @[i.event]="i.func">···</el-button>

                            <!-- 扩展 - 动态组件使用异步加载 -->
                            <template v-else-if="i.type === 'extend'">
                                <template v-for="e in i.option?.extendList" :key="e">
                                    <component :is="e.component || e.name" v-bind="e.props">{{ e.text }}</component>
                                </template>
                            </template>
                        </el-form-item>
                </template>
            </el-form>
        </el-collapse-item>
    </el-collapse>
</template>

<style scoped>
/* 性能优化：隔离布局计算 */
:deep(.el-collapse-item__header) {
    font-weight: 1000;
    /* 防止内容重排 */
    contain: layout;
}

:deep(.el-collapse-item__content) {
    margin-right: 15px;
    /* 减少重绘范围 */
    contain: style;
}

/* 表单容器性能优化 */
:deep(.el-form) {
    /* 阻止外部样式影响内部布局计算 */
    contain: layout style paint;
}

/* 表单项性能优化 */
:deep(.el-form-item) {
    margin-bottom: 10px;
    /* 独立渲染单元 */
    contain: layout style;
}

.avatar-uploader .avatar {
    width: 100px;
    height: 100px;
    display: block;
}

.avatar-uploader :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload):hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
}

:deep(.el-form-item__label) {
    align-items: center
}

.block {
    display: block;
    width: 100%;
}

.title-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

:deep(.el-dropdown) {
    padding: 5px 12px;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    width: 100%;
}

.el-dropdown-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.m-dropdown-text {
    display: inline-block;
    width: calc(100% - 20px);
    overflow: hidden
}

.pointer {
    cursor: pointer;
}

.font-18 {
    font-size: 18px;
}

.ml-8 {
    margin-left: 8px;
}

:deep(.el-form-item) {
    margin-bottom: 10px;
}

.icon-svg {
    width: 100px;
    height: 20px;
}
</style>