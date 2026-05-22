import { LINE_STYLE_TEMPLATES, DASH_ARRAYS, LINE_TYPE_TEMPLATES } from '../styleTemplates'

/** 样式配置 */
export const styleConfig = {
  title: '样式',
  labelWidth: 100,
  multiShow: true,
  children: [
    {
      title: '线条样式',
      type: 'dropdown',
      multiShow: true,
      prop: 'dash',
      option: {
        placeholder: '线条样式',
        list: LINE_STYLE_TEMPLATES
      },
      bindProp: null,
      event: 'command',
      func: null
    },
    {
      title: '连线类型',
      type: 'dropdown',
      multiShow: true,
      prop: 'lineName',
      option: {
        placeholder: '线条样式',
        hidden: null,
        list: LINE_TYPE_TEMPLATES
      },
      bindProp: null,
      event: 'command',
      func: null
    },
    {
      title: '连接样式',
      type: 'select',
      multiShow: true,
      option: {
        placeholder: '连接样式',
        list: [
          { label: '默认', value: 'miter' },
          { label: '圆形', value: 'round' },
          { label: '斜角', value: 'bevel' }
        ]
      },
      prop: 'lineJoin',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '末端样式',
      type: 'select',
      multiShow: true,
      option: {
        placeholder: '末端样式',
        list: [
          { label: '默认', value: 'butt' },
          { label: '圆形', value: 'round' },
          { label: '方形', value: 'square' }
        ]
      },
      prop: 'lineCap',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: "平滑度",
      multiShow: true,
      type: 'number',
      prop: 'lineSmooth',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: "推荐1-3",
      },
      func: null
    },
    {
      title: "线渐变",
      type: 'select',
      multiShow: true,
      bindProp: null,
      prop: 'strokeType',
      event: 'change',
      option: {
        placeholder: "请选择",
        list: [
          { label: '无', value: 0 },
          { label: '线性渐变', value: 1 },
        ]
      },
      func: null
    },
    {
      title: '线性渐变颜色',
      type: 'color',
      multiShow: true,
      prop: 'lineGradientColors',
      bindProp: null,
      event: 'change',
      option: {
        hidden: null,
        useType: 'gradient'
      },
      func: null
    },
    {
      title: '颜色',
      type: 'color',
      multiShow: true,
      prop: 'color',
      bindProp: null,
      event: 'change',
      option: {
        hidden: null,
      },
      func: null
    },
    {
      title: '浮动颜色',
      type: 'color',
      multiShow: true,
      prop: 'hoverColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '选中颜色',
      type: 'color',
      multiShow: true,
      prop: 'activeColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '线条宽度',
      type: 'number',
      multiShow: true,
      prop: 'lineWidth',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: "背景渐变",
      type: 'select',
      multiShow: true,
      bindProp: null,
      prop: 'bkType',
      event: 'change',
      option: {
        placeholder: "请选择",
        list: [
          { label: '纯色', value: 0 },
          { label: '线性渐变', value: 1 },
          { label: '径向渐变', value: 2 },
        ]
      },
      func: null
    },
    {
      title: '背景渐变颜色',
      type: 'color',
      multiShow: true,
      prop: 'gradientColors',
      bindProp: null,
      event: 'change',
      option: {
        hidden: null,
        useType: 'gradient'
      },
      func: null
    },
    {
      title: '背景颜色',
      type: 'color',
      multiShow: true,
      prop: 'background',
      bindProp: null,
      event: 'change',
      option: {
        hidden: null
      },
      func: null
    },
    {
      title: '渐变半径',
      type: 'number',
      multiShow: true,
      prop: 'gradientRadius',
      bindProp: null,
      event: 'change',
      option: {
        hidden: null,
        min: 0,
        step: 0.1
      },
      func: null
    },
    {
      title: '浮动背景颜色',
      type: 'color',
      multiShow: true,
      prop: 'hoverBackground',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '选中背景颜色',
      type: 'color',
      multiShow: true,
      prop: 'activeBackground',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '透明度',
      type: 'number',
      multiShow: true,
      prop: 'globalAlpha',
      bindProp: null,
      option: {
        min: 0,
        step: 0.1,
        max: 1
      },
      event: 'change',
      func: null
    },
    {
      title: '锚点颜色',
      type: 'color',
      prop: 'anchorColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '锚点半径',
      type: 'number',
      prop: 'anchorRadius',
      bindProp: null,
      option: {
        min: 0,
        step: 1,
        max: 10
      },
      event: 'change',
      func: null
    },
    {
      title: '阴影颜色',
      type: 'color',
      prop: 'shadowColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '阴影模糊',
      type: 'number',
      prop: 'shadowBlur',
      bindProp: null,
      option: {
        min: 0,
        step: 1,
        max: Infinity
      },
      event: 'change',
      func: null
    },
    {
      title: '阴影x偏移',
      type: 'number',
      prop: 'shadowOffsetX',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '阴影y偏移',
      type: 'number',
      prop: 'shadowOffsetY',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '文字阴影',
      type: 'switch',
      prop: 'textHasShadow',
      bindProp: null,
      event: 'change',
      func: null
    }
  ]
}
