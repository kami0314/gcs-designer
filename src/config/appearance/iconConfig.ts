/** 字体图标配置 */
export const iconConfig = {
  title: '字体图标 ',
  tip: '图片、字体图标同时存在时，图片优先',
  labelWidth: 100,
  children: [
    {
      title: '字体图标',
      type: 'icon',
      prop: 'iconClass',
      bindProp: null,
      event: 'click',
      deleteFunc: null,
      func: null
    },
    {
      title: '图标大小',
      type: 'number',
      bindProp: null,
      prop: 'iconSize',
      event: 'change',
      option: {
        min: 0,
        placeholder: '请输入图标大小'
      },
      func: null
    },
    {
      title: '图标旋转',
      type: 'number',
      bindProp: null,
      prop: 'iconRotate',
      event: 'change',
      option: {
        min: 0,
        placeholder: '请输入图标旋转角度'
      },
      func: null
    },
    {
      title: '颜色',
      type: 'color',
      bindProp: null,
      prop: 'iconColor',
      event: 'change',
      func: null
    },
    {
      title: '对齐方式',
      type: 'select',
      bindProp: null,
      prop: 'iconAlign',
      event: 'change',
      option: {
        placeholder: '请选择',
        list: [
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
      },
      func: null
    },
  ]
}