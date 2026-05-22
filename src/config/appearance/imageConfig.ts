/** 图片配置 */
export const imageConfig = {
  title: '图片 ',
  tip: '图片、字体图标同时存在时，图片优先',
  labelWidth: 100,
  children: [
    {
      title: '图片',
      type: 'image',
      prop: 'image',
      bindProp: null,
      event: 'change',
      option: {
        accept: 'image/*',
      },
      for: Math.random(),
      func: null
    },
    {
      title: '图片地址',
      type: 'input',
      prop: 'image',
      bindProp: null,
      event: 'change',
      option: {
        type: 'text',
        placeholder: '请输入图片地址'
      },
      func: null
    },
    {
      title: '旋转角度',
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
      title: '宽度',
      type: 'number',
      bindProp: null,
      prop: 'iconWidth',
      event: 'change',
      option: {
        min: 0,
        placeholder: '自适应'
      },
      func: null
    },
    {
      title: '高度',
      type: 'number',
      bindProp: null,
      prop: 'iconHeight',
      event: 'change',
      option: {
        min: 0,
        placeholder: '自适应'
      },
      func: null
    },
    {
      title: '保存比例',
      type: 'switch',
      bindProp: null,
      prop: 'imageRatio',
      event: 'change',
      func: null
    },
    {
      title: '水平偏移',
      type: 'number',
      bindProp: null,
      prop: 'iconLeft',
      event: 'change',
      func: null
    },
    {
      title: '垂直偏移',
      type: 'number',
      bindProp: null,
      prop: 'iconTop',
      event: 'change',
      func: null
    },
    {
      title: '层级',
      type: 'select',
      bindProp: null,
      prop: 'canvasLayer',
      event: 'change',
      option: {
        list: [
          { label: '上层', value: 4 },
          { label: '中层', value: 3 },
          { label: '下层', value: 2 },
          { label: '模板', value: 1 },
        ]
      },
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
    {
      title: '背景图片',
      type: 'image',
      prop: 'backgroundImage',
      bindProp: null,
      event: 'change',
      option: {
        accept: 'image/*',
      },
      for: Math.random(),
      func: null
    },
    {
      title: '背景图片地址',
      type: 'input',
      prop: 'backgroundImage',
      bindProp: null,
      event: 'change',
      option: {
        type: 'text',
        placeholder: '请输入背景图片地址'
      },
      func: null
    },
    {
      title: '描绘图片',
      type: 'image',
      prop: 'strokeImage',
      bindProp: null,
      event: 'change',
      option: {
        accept: 'image/*',
      },
      for: Math.random(),
      func: null
    },
    {
      title: '描绘图片地址',
      type: 'input',
      prop: 'strokeImage',
      bindProp: null,
      event: 'change',
      option: {
        type: 'text',
        placeholder: '请输入描绘图片地址'
      },
      func: null
    },
  ]
}