<script setup lang="ts">
import Form from '../Form.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { globalConfigProps } from '@/config/defaultConfig'
import { getData, saveDevicesData, parseDevicesJson, type DataTree } from '@/api/data'
import { Upload, View, EditPen } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

let m = reactive(globalConfigProps)

/** 初始化属性配置 */
function loadOptionsFromMeta2d(options, target) {
  for (let i in target) {
    if (target[i]) continue
    target[i] = options[i] || target[i]
  }
}

onMounted(() => {
  init()
  loadDeviceData()
})

function init() {
  const options = meta2d.getOptions()
  loadOptionsFromMeta2d(options, m)
  for (let p in m) {
    meta2d.setOptions({
      [p]: m[p]
    })
  }
  meta2d.render()
}

/** 设置属性 */
function setOptionFunc(prop) {
  return (value) => {
    meta2d.setOptions({
      [prop]: value
    })
    meta2d.render()
  }
}

// ==================== 设备设置 ====================

const deviceData = ref<DataTree[]>([])
const deviceJsonText = ref('')
const showEditor = ref(false)
const showPreview = ref(false)
const uploadRef = ref()

const treeProps = {
  label: 'name',
  children: 'children'
}

async function loadDeviceData() {
  try {
    deviceData.value = await getData()
    deviceJsonText.value = JSON.stringify(deviceData.value, null, 2)
  } catch (err) {
    console.error('Failed to load device data:', err)
    ElMessage.error('加载设备数据失败')
  }
}

/** 保存编辑后的设备JSON */
async function handleSaveJson() {
  try {
    const data = parseDevicesJson(deviceJsonText.value)
    if (!data) {
      ElMessage.error('JSON格式不正确')
      return
    }
    const success = await saveDevicesData(data)
    if (success) {
      ElMessage.success('设备数据保存成功')
      deviceData.value = data
      showEditor.value = false
    } else {
      ElMessage.error('保存设备数据失败')
    }
  } catch (err) {
    ElMessage.error('保存失败: ' + (err as Error).message)
  }
}

/** 处理文件上传 */
async function handleFileChange(uploadFile) {
  const file = uploadFile.raw
  if (!file) return
  try {
    const text = await file.text()
    const data = parseDevicesJson(text)
    if (data) {
      const success = await saveDevicesData(data)
      if (success) {
        ElMessage.success('设备数据上传成功')
        deviceData.value = data
        deviceJsonText.value = JSON.stringify(data, null, 2)
      } else {
        ElMessage.error('保存设备数据失败')
      }
    } else {
      ElMessage.error('文件格式不正确，请上传有效的设备JSON')
    }
  } catch (err) {
    ElMessage.error('读取文件失败')
  }
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const map = computed(() => {
  return [
    {
      title: '画笔', //显示名
      labelWidth: 105,
      children: [
        {
          title: '默认颜色',
          type: 'color',
          prop: 'color',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('color')
        },
        {
          title: '选中颜色',
          type: 'color',
          prop: 'activeColor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('activeColor')
        },
        {
          title: 'hover颜色',
          type: 'color',
          prop: 'hoverColor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('hoverColor')
        },
        {
          title: 'hover背景颜色',
          type: 'color',
          prop: 'hoverBackground',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('hoverBackground')
        }
      ]
    },
    {
      title: '锚点', //显示名
      labelWidth: 100,
      children: [
        {
          title: '锚点颜色',
          type: 'color',
          prop: 'anchorColor',
          event: 'change',
          bindProp: m, // 绑定的属性
          func: setOptionFunc('anchorColor')
        },
        {
          title: '锚点半径',
          type: 'number',
          prop: 'anchorRadius',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('anchorRadius')
        },
        {
          title: '锚点背景颜色',
          type: 'color',
          prop: 'anchorBackground',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('anchorBackground')
        }
      ]
    },
    {
      title: '辅助线', //显示名
      labelWidth: 100,
      children: [
        {
          title: '锚点颜色',
          type: 'color',
          prop: 'dockColor',
          event: 'change',
          bindProp: m, // 绑定的属性
          func: setOptionFunc('dockColor')
        },
        {
          title: '框选颜色',
          type: 'color',
          prop: 'dragColor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('dragColor')
        },
        {
          title: '连线动画颜色',
          type: 'color',
          prop: 'animateColor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('animateColor')
        }
      ]
    },
    {
      title: '文字', //显示名
      children: [
        {
          title: '文字颜色',
          type: 'color',
          prop: 'textColor',
          event: 'change',
          bindProp: m, // 绑定的属性
          func: setOptionFunc('textColor')
        },
        {
          title: '字体',
          type: 'input',
          prop: 'fontFamily',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('fontFamily')
        },
        {
          title: '文字大小',
          type: 'number',
          prop: 'fontSize',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('fontSize')
        },
        {
          title: '文字行高',
          type: 'number',
          prop: 'lineHeight',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('lineHeight')
        },
        {
          title: '文字水平对齐方式',
          type: 'select',
          prop: 'textAlign',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            placeholder: '请选择水平对齐方式',
            list: [
              { value: 'left', label: '左对齐' },
              { value: 'center', label: '居中对齐' },
              { value: 'right', label: '右对齐' }
            ]
          },
          func: setOptionFunc('textAlign')
        },
        {
          title: '文字垂直对齐方式',
          type: 'select',
          prop: 'textBaseline',
          option: {
            placeholder: '请选择垂直对齐方式',
            list: [
              { value: 'top', label: '顶部对齐' },
              { value: 'middle', label: '居中对齐' },
              { value: 'bottom', label: '底部对齐' }
            ]
          },
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('textBaseline')
        }
      ]
    },
    {
      title: '鼠标样式', //显示名
      labelWidth: 100,
      children: [
        {
          title: '旋转控制点的',
          type: 'input',
          prop: 'rotateCursor',
          event: 'change',
          bindProp: m, // 绑定的属性
          func: setOptionFunc('rotateCursor')
        },
        {
          title: 'hover样式',
          type: 'input',
          prop: 'hoverCursor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('hoverCursor')
        }
      ]
    },
    {
      title: '禁止', //显示名
      children: [
        {
          title: '禁用双击弹出输入框',
          type: 'switch',
          prop: 'disableInput',
          event: 'change',
          bindProp: m, // 绑定的属性
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableInput')
        },
        {
          title: '禁止旋转',
          type: 'switch',
          prop: 'disableRotate',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableRotate')
        },
        {
          title: '禁止显示锚点',
          type: 'switch',
          prop: 'disableAnchor',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableAnchor')
        },
        {
          title: '禁止存在两端关联缺少的连线',
          type: 'switch',
          prop: 'disableEmptyLine',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableEmptyLine')
        },
        {
          title: '禁止存在关联重复的连线',
          type: 'switch',
          prop: 'disableRepeatLine',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableRepeatLine')
        },
        {
          title: '禁止画布缩放',
          type: 'switch',
          prop: 'disableScale',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableScale')
        },
        {
          title: '禁止辅助线',
          type: 'switch',
          prop: 'disableDockLine',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableDockLine')
        },
        {
          title: '禁止画布移动',
          type: 'switch',
          prop: 'disableTranslate',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            labelWidth: 200
          },
          func: setOptionFunc('disableTranslate')
        }
      ]
    },
    {
      title: '画布设置', //显示名
      children: [
        {
          title: '画布最小缩放比例',
          type: 'number',
          prop: 'minScale',
          event: 'change',
          bindProp: m, // 绑定的属性
          func: setOptionFunc('minScale')
        },
        {
          title: '画布最大缩放比例',
          type: 'number',
          prop: 'maxScale',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('maxScale')
        }
      ]
    },
    {
      title: '其他设置', //显示名
      children: [
        {
          title: '自动选中节点锚点',
          type: 'switch',
          prop: 'autoAnchor',
          event: 'change',
          bindProp: m, // 绑定的属性
          func: setOptionFunc('autoAnchor')
        },
        {
          title: '绘画帧时长',
          type: 'number',
          prop: 'interval',
          option: {
            min: 1
          },
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('interval')
        },
        {
          title: '动画帧时长',
          type: 'number',
          prop: 'animateInterval',
          option: {
            min: 1
          },
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('animateInterval')
        },
        {
          title: '文字是否选择',
          type: 'switch',
          prop: 'textRotate',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('textRotate')
        },
        {
          title: '文字是否镜像',
          type: 'switch',
          prop: 'textFlip',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: setOptionFunc('textFlip')
        }
      ]
    }
  ]
})
</script>

<template>
  <div class="globalProps">
    <Form :form-list="map"></Form>

    <!-- 设备设置 -->
    <el-collapse>
      <el-collapse-item  class="device-header" title="设备设置">
      <!-- 操作按钮区 -->
      <div class="device-toolbar">
        <el-upload
          ref="uploadRef"
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept=".json"
        >
          <el-button type="primary" :icon="Upload">上传设备JSON</el-button>
        </el-upload>
        <el-button type="primary" :icon="EditPen" @click="showEditor = true">
          在线编辑JSON
        </el-button>
        <el-button type="info" :icon="View" @click="showPreview = !showPreview">
          {{ showPreview ? '关闭设备预览' : '预览设备属性' }}
        </el-button>
      </div>

      <!-- JSON 编辑器弹窗 -->
      <el-dialog v-model="showEditor" title="在线编辑设备JSON" class="device-dialog" append-to-body>
        <el-input
          v-model="deviceJsonText"
          type="textarea"
          :rows="20"
          placeholder="请输入设备JSON数据..."
        />
        <template #footer>
          <el-button @click="showEditor = false">取消</el-button>
          <el-button type="primary" @click="handleSaveJson">保存</el-button>
        </template>
      </el-dialog>

      <!-- 设备属性预览 -->
      <div v-if="showPreview" class="device-preview">
        <el-tree-v2
          :data="deviceData"
          :props="treeProps"
          :height="250"
          empty-text="暂无设备数据"
        >
          <template #default="{ node }">
            <span>{{ node.label }}-{{ node.key }}</span>
          </template>
        </el-tree-v2>
      </div>
      </el-collapse-item>


     
    </el-collapse>
  </div>
</template>

<style scoped>

.device-header {
  margin-top: -1px;
}

.device-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  align-items: flex-start;
  width: 100%;
}
.device-toolbar :deep(.el-upload),
.device-toolbar :deep(.el-button) {
    width: 100% !important;
    display: flex !important;
    justify-content: center;
    margin-left: 0 !important;
    padding-left: 0 !important;
}


.device-preview {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}
</style>