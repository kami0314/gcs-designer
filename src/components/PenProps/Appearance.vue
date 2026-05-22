<script setup lang="ts">
import Form from '../Form.vue'
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { appearanceProps } from '@/config/defaultConfig'
import { mergeProps } from '@/config/utils'
import { deepClone, getFromAnchor, getToAnchor } from '@meta2d/core'
import IconDrawer from '@/components/icon/IconDrawer.vue'
import { createAppearanceMap } from '@/config/appearance'

let showIconDrawer = ref(false)
/** pen图标改变 */
let penProp = ''
const iconChange = (val: any) => {
  updateFunc('icon')(val.value)
  updateFunc('iconClass')(val.icon)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(m as any)[penProp] = val.icon
}

// 记录是否有选中多个图元
const multiPen = ref(false)
const defaultConfig = deepClone(appearanceProps) //深拷贝保存默认配置
let m = reactive(appearanceProps) // 响应式数据源
let activePen = reactive({ target: {} as any })
let otherProps = reactive({ props: [] as any[] })

// 更新属性方法
function updateFunc(prop: string) {
  return (value: any) => {
    if (multiPen.value) {
      for (const i of activePen.target) {
        meta2d.setValue(
          {
            id: i.id,
            [prop]: value
          },
          { render: false }
        )
      }
      meta2d.render()
    } else {
      meta2d.setValue({
        id: activePen.target.id,
        [prop]: value
      })
    }
  }
}

function active(args: any[]) {
  // 只修改一个
  if (args.length >= 1) {
    multiPen.value = args.length > 1
    if (multiPen.value) {
      // 批量修改
      activePen.target = reactive(args)
      // 以最后一个图元信息为主
      for (let i of activePen.target) {
        mergeProps(m, i)
      }
    } else {
      // 修改一个
      let fromAnchor = getFromAnchor(args[0])
      let toAnchor = getToAnchor(args[0])
      args[0].startX = fromAnchor.x
      args[0].startY = fromAnchor.y
      args[0].endX = toAnchor.x
      args[0].endY = toAnchor.y
      activePen.target = reactive(args[0])


      otherProps.props = []
      if (activePen.target.props) {
        let otherProp: any = {
          title: '其他',
          children: [] as any[]
        }
        activePen.target.props.forEach((prop: any) => {
          otherProp.children.push({
            title: prop.title,
            type: prop.type,
            prop: prop.prop,
            bindProp: m,
            event: prop.event,
            func: updateFunc(prop.prop)
          })
        })
        otherProps.props.push(otherProp)
      }
      mergeProps(m, defaultConfig)
      mergeProps(m, activePen.target)
      const penRect = meta2d.getPenRect(toRaw(activePen.target))
      Object.assign(m, penRect)
    }
  }
}

onUnmounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.off('active' as any, active as any)
})

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta2d.on('active' as any, active as any)
  // 更新数据  合并多个事件
  meta2d.on('update', () => {
    meta2d.emit('editPen')
  })
  meta2d.on('resizePens', () => {
    meta2d.emit('editPen')
  })
  meta2d.on('rotatePens', () => {
    meta2d.emit('editPen')
  })
  meta2d.on('valueUpdate', () => {
    meta2d.emit('editPen')
  })
  meta2d.on('editPen', () => {
    if (multiPen.value) {
      // 若有多个图元，则设置以最后一个图元为主
      for (let i of activePen.target) {
        mergeProps(m, i)
      }
    } else {
      mergeProps(m, activePen.target)
    }
  })
})

/** 自定义属性配置（外部传入的 props） */
const customProps = computed(() => {
  if (activePen.target?.props?.length > 0) {
    const otherProp: any = {
      title: '自定义属性',
      labelWidth: 100,
      multiShow: false,
      children: [] as any[]
    }
    activePen.target.props.forEach((prop: any) => {
      otherProp.children.push({
        title: prop.title,
        type: prop.type,
        prop: prop.prop,
        bindProp: m,
        event: prop.event,
        func: updateFunc(prop.prop)
      })
    })
    return [otherProp]
  }
  return []
})

// 使用配置工厂函数生成表单配置
// 传入运行时依赖（m, activePen, multiPen, updateFunc）以及回调函数
const appearanceMap = createAppearanceMap(m, activePen, multiPen, updateFunc, {
  // 打开图标选择器抽屉
  openIconDrawer: (prop: string) => {
    penProp = prop
    showIconDrawer.value = true
  }
})

// 计算展示字段列表 - 使用纯函数避免副作用
// 添加缓存和性能优化
let showMap = computed(() => {
  // 多选情况：只显示支持批量修改的属性
  if (multiPen.value) {
    return appearanceMap
      .filter((group) => group.multiShow)
      .map((group) => ({
        ...group,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: (group as any).children.filter((item: any) => item.multiShow)
      }))
  }

  // 单选情况：合并默认配置和自定义属性
  const otherPropsValue = otherProps?.props
  if (otherPropsValue) {
    const data = appearanceMap.concat(otherPropsValue)
    
    // 根据节点类型过滤（type === 1 表示连线）
    // 提前计算 isLine 避免重复判断
    const isLine = activePen.target?.type === 1
    return data.filter((group) => {
      // line === undefined 表示都显示
      // line === true 表示只显示连线相关
      // line === false 表示只显示非连线相关
      return group.line === undefined || group.line === isLine
    })
  }

  // 默认返回空数组
  return []
})
</script>

<template>
  <div class="appearanceProps">
    <Form :form-list="showMap"></Form>
  </div>

  <IconDrawer v-model="showIconDrawer" @change="iconChange" />
</template>

<style scoped></style>