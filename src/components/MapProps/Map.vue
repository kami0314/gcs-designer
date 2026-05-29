<script setup lang="ts">
import Form from '../Form.vue'
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { mapProps } from '@/config/defaultConfig'
import { requestRender } from '@/utils/render'

interface MapConfig {
  fileName: string
  color: string
  penBackground: string
  background: string
  bkImage: string
  rule: boolean
  ruleColor: string
  grid: boolean
  gridColor: string
  gridSize: number
  gridRotate: number
  autoAlignGrid: boolean
}

let m = reactive<MapConfig>(mapProps)

function loadOptionsFromMeta2d(options: Record<string, any>, target: MapConfig) {
  for (let i in target) {
    target[i as keyof MapConfig] = options[i] || target[i as keyof MapConfig]
  }
}

const onOpened = () => {
  const options = meta2d.data()
  loadOptionsFromMeta2d(meta2d.getOptions(), m)
  loadOptionsFromMeta2d(options, m)
}

onMounted(() => {
  meta2d.on('opened', onOpened)
  // 初始化
  const options = meta2d.getOptions()
  loadOptionsFromMeta2d(options, m)
  meta2d.fileName = m.fileName
})

onUnmounted(() => {
  meta2d.off('opened', onOpened)
})

const map = computed(() => {
  return [
    {
      title: '文件', //显示名
      labelWidth: 80,
      children: [
        {
          title: '文件名',
          type: 'input',
          option: {
            type: 'text',
            placeholder: '请输入文件名'
          },
          prop: 'fileName',
          bindProp: m, // 绑定的属性
          event: 'change',
          func: function arg1(value) {
            meta2d.store.options.fileName = value
          }
        }
      ]
    },
    {
      title: '画布', //显示名
      labelWidth: 100,
      children: [
        {
          title: '默认颜色',
          type: 'color',
          prop: 'color',
          event: 'change',
          bindProp: m, // 绑定的属性
          func(value) {
            meta2d.setOptions({
              color: value
            })
            requestRender(meta2d)
          }
        },
        {
          title: '画笔填充颜色',
          type: 'color',
          prop: 'penBackground',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.store.data.penBackground = value
            requestRender(meta2d)
          }
        },
        {
          title: '背景颜色',
          type: 'color',
          prop: 'background',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.setBackgroundColor(value)
            requestRender(meta2d)
          }
        },
        {
          title: '背景图片',
          type: 'image',
          prop: 'bkImage',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            accept: 'image/*',
          },
          for: Math.random(), // 随机id
          func(file) {
            // let fileUrl = URL.createObjectURL(file) // 创建文件引用 转换为blob
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function () {
              const fileUrl = reader.result
              m.bkImage = fileUrl
              meta2d.setBackgroundImage(fileUrl)
              requestRender(meta2d)
            }
          }
        },
        {
          title: '背景图片地址',
          type: 'input',
          prop: 'bkImage',
          bindProp: m,
          event: 'change',
          option: {
            type: 'text',
            placeholder: '请输入背景图片地址'
          },
          func(value) {
            meta2d.setBackgroundImage(value)
            requestRender(meta2d)
          }
        },
        {
          title: '标尺',
          type: 'switch',
          prop: 'rule',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.setRule({
              rule: value
            })
            requestRender(meta2d)
          }
        },
        {
          title: '标尺颜色',
          type: 'color',
          prop: 'ruleColor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.setRule({
              ruleColor: value
            })
            requestRender(meta2d)
          }
        },
        {
          title: '网格',
          type: 'switch',
          prop: 'grid',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.setGrid({
              grid: value
            })
            requestRender(meta2d)
          }
        },
        {
          title: '网格自动对齐',
          type: 'switch',
          prop: 'autoAlignGrid',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.store.options.autoAlignGrid = value
            requestRender(meta2d)
          }
        },
        {
          title: '网格颜色',
          type: 'color',
          prop: 'gridColor',
          bindProp: m, // 绑定的属性
          event: 'change',
          func(value) {
            meta2d.setGrid({
              gridColor: value
            })
            requestRender(meta2d)
          }
        },
        {
          title: '网格大小',
          type: 'number',
          prop: 'gridSize',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            min: 1,
            max: 100
          },
          func(value) {
            meta2d.setGrid({
              gridSize: +value
            })
            requestRender(meta2d)
          }
        },
        {
          title: '网格角度',
          type: 'number',
          prop: 'gridRotate',
          bindProp: m, // 绑定的属性
          event: 'change',
          option: {
            min: -Infinity,
            max: Infinity
          },
          func(value) {
            meta2d.setGrid({
              gridRotate: +value
            })
            requestRender(meta2d)
          }
        }
      ]
    }
  ]
})
</script>

<template>
  <div class="mapProps">
    <Form :form-list="map"></Form>
  </div>
</template>

<style scoped></style>