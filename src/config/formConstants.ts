/**
 * Form.vue 的表单类型常量映射
 * 用于统一管理表单组件类型，方便扩展和维护
 */

/** 表单渲染类型枚举 */
export const FormItemType = {
  INPUT: 'input',
  FILE: 'file',
  IMAGE: 'image',
  BUTTON: 'button',
  NUMBER: 'number',
  SELECT: 'select',
  DROPDOWN: 'dropdown',
  COLOR: 'color',
  SWITCH: 'switch',
  SLIDER: 'slider',
  ICON: 'icon',
  LINK: 'link',
  CODE: 'code',
  EXTEND: 'extend',
} as const

export type FormItemType = (typeof FormItemType)[keyof typeof FormItemType]

/** 文本对齐选项 */
export const TEXT_ALIGN_OPTIONS = [
  { label: '左对齐', value: 'left' },
  { label: '居中对齐', value: 'center' },
  { label: '右对齐', value: 'right' }
]

/** 垂直对齐选项 */
export const TEXT_BASELINE_OPTIONS = [
  { label: '顶部对齐', value: 'top' },
  { label: '居中对齐', value: 'middle' },
  { label: '底部对齐', value: 'bottom' }
]

/** 连线类型选项 */
export const LINE_JOIN_OPTIONS = [
  { label: '默认', value: 'miter' },
  { label: '圆形', value: 'round' },
  { label: '斜角', value: 'bevel' }
]

/** 末端样式选项 */
export const LINE_CAP_OPTIONS = [
  { label: '默认', value: 'butt' },
  { label: '圆形', value: 'round' },
  { label: '方形', value: 'square' }
]

/** 图标对齐选项 */
export const ICON_ALIGN_OPTIONS = [
  { label: '居中', value: 'center' },
  { label: '左', value: 'left' },
  { label: '右', value: 'right' },
  { label: '上', value: 'top' },
  { label: '下', value: 'bottom' },
  { label: '左上', value: 'left-top' },
  { label: '左下', value: 'left-bottom' },
  { label: '右上', value: 'right-top' },
  { label: '右下', value: 'right-bottom' },
]