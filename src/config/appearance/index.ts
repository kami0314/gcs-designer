import { positionConfig } from './positionConfig'
import { styleConfig } from './styleConfig'
import { textConfig } from './textConfig'
import { imageConfig } from './imageConfig'
import { iconConfig } from './iconConfig'
import { disableConfig } from './disableConfig'
import { LINE_STYLE_TEMPLATES, DASH_ARRAYS } from '../styleTemplates'

/** 将所有配置项组合成完整的 map 数组 */
export function createAppearanceMap(m: any, activePen: any, multiPen: any, updateFunc: any, callbacks: any) {
  // 创建配置的深拷贝以避免污染原始配置
  const position = JSON.parse(JSON.stringify(positionConfig))
  const style = JSON.parse(JSON.stringify(styleConfig))
  const text = JSON.parse(JSON.stringify(textConfig))
  const image = JSON.parse(JSON.stringify(imageConfig))
  const icon = JSON.parse(JSON.stringify(iconConfig))
  const disable = JSON.parse(JSON.stringify(disableConfig))

  // 为位置配置注入运行时函数
  position.children.forEach((child: any) => {
    child.bindProp = m
    if (child.prop === 'x' || child.prop === 'y') {
      child.func = (value: any) => {
        meta2d.setValue({
          id: activePen.target.id,
          [child.prop]: value
        })
        meta2d.canvas.calcActiveRect()
        mergeProps(m, activePen.target)
        meta2d.render()
      }
    } else if (child.prop === 'width' || child.prop === 'height') {
      child.func = (value: any) => {
        if (activePen.target.ratio) {
          const ratioProp = child.prop === 'width' ? 'height' : 'width'
          const ratioValue = child.prop === 'width' 
            ? (value / activePen.target.width) * activePen.target.height
            : (value / activePen.target.height) * activePen.target.width
          meta2d.setValue({
            id: activePen.target.id,
            [child.prop]: value,
            [ratioProp]: ratioValue
          })
        } else {
          meta2d.setValue({
            id: activePen.target.id,
            [child.prop]: value
          })
        }
        mergeProps(m, activePen.target)
      }
    } else if (child.prop === 'showChild') {
      child.option.hidden = computed(() => {
        return !(Array.isArray(m.children) && m.children.length > 0)
      })
      child.func = updateFunc('showChild')
    } else {
      child.func = updateFunc(child.prop)
    }
  })

  // 为样式配置注入运行时函数
  style.children.forEach((child: any) => {
    child.bindProp = m
    if (child.prop === 'dash') {
      child.func = (value: any) => {
        if (multiPen.value) {
          for (const i of activePen.target) {
            meta2d.setValue({
              id: i.id,
              lineDash: DASH_ARRAYS[value],
              dash: value
            })
          }
          meta2d.render()
        } else {
          activePen.target.dash = value
          meta2d.setValue({
            id: activePen.target.id,
            lineDash: DASH_ARRAYS[value],
            dash: value
          })
        }
      }
    } else if (child.prop === 'lineName') {
      child.option.hidden = computed(() => {
        return activePen.target.type != 1
      })
      child.func = (value: any) => {
        m.lineName = value
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meta2d.updateLineType((meta2d.store as any).active?.[0], value)
      }
    } else if (child.prop === 'lineGradientColors' || child.prop === 'color') {
      child.option.hidden = computed(() => {
        return child.prop === 'lineGradientColors' ? !m.strokeType : !!m.strokeType
      })
      child.func = updateFunc(child.prop)
    } else if (child.prop === 'gradientColors' || child.prop === 'background') {
      child.option.hidden = computed(() => {
        return child.prop === 'gradientColors' ? !m.bkType : !!m.bkType
      })
      child.func = updateFunc(child.prop)
    } else if (child.prop === 'gradientRadius') {
      child.option.hidden = computed(() => {
        return m.bkType != 2
      })
      child.func = updateFunc(child.prop)
    } else {
      child.func = updateFunc(child.prop)
    }
  })

  // 为文字配置注入运行时函数
  text.children.forEach((child: any) => {
    child.bindProp = m
    if (child.prop === 'decorationDash' || child.prop === 'strickoutDash') {
      child.option.list = LINE_STYLE_TEMPLATES
      child.func = (value: any) => {
        const dashKey = child.prop === 'decorationDash' ? 'textDecorationDash' : 'textStrickoutDash'
        if (multiPen.value) {
          for (const i of activePen.target) {
            meta2d.setValue({
              id: i.id,
              [dashKey]: DASH_ARRAYS[value],
              [child.prop]: value
            })
          }
          meta2d.render()
        } else {
          activePen.target[child.prop] = value
          meta2d.setValue({
            id: activePen.target.id,
            [dashKey]: DASH_ARRAYS[value],
            [child.prop]: value
          })
        }
      }
    } else {
      child.func = updateFunc(child.prop)
    }
  })

  // 为图片配置注入运行时函数
  image.children.forEach((child: any) => {
    child.bindProp = m
    if (child.type === 'image') {
      child.for = Math.random()
      child.func = (file: any) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function () {
          const fileUrl = reader.result
          m[child.prop] = fileUrl
          updateFunc(child.prop)(fileUrl)
        }
      }
    } else {
      child.func = updateFunc(child.prop)
    }
  })

  // 为字体图标配置注入运行时函数
  icon.children.forEach((child: any) => {
    child.bindProp = m
    if (child.prop === 'iconClass') {
      child.deleteFunc = () => {
        m['iconClass'] = undefined
        updateFunc('icon')()
        updateFunc('iconClass')()
      }
      child.func = () => {
        updateFunc("iconFamily")("ticon")
        // 调用外部传入的回调函数
        if (callbacks && callbacks.openIconDrawer) {
          callbacks.openIconDrawer('iconClass')
        }
      }
    } else {
      child.func = updateFunc(child.prop)
    }
  })

  // 为禁止配置注入运行时函数
  disable.children.forEach((child: any) => {
    child.bindProp = m
    child.func = updateFunc(child.prop)
  })

  return [position, style, text, image, icon, disable]
}

// 导入缺失的函数
import { mergeProps } from '@/config/utils'
import { computed } from 'vue'