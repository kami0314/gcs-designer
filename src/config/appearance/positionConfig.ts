/** 位置与大小配置 */
export const positionConfig = {
  title: '位置与大小',
  multiShow: false,
  line: false,
  labelWidth: 100,
  children: [
    {
      title: 'x',
      type: 'number',
      prop: 'x',
      option: {
        placeholder: 'px'
      },
      bindProp: null, // 运行时设置
      event: 'change',
      func: null // 运行时设置
    },
    {
      title: 'y',
      type: 'number',
      prop: 'y',
      option: {
        placeholder: 'px'
      },
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '宽度',
      type: 'number',
      prop: 'width',
      bindProp: null,
      option: {
        min: 0
      },
      event: 'change',
      func: null
    },
    {
      title: '高度',
      type: 'number',
      prop: 'height',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '锁定宽高比',
      type: 'switch',
      prop: 'ratio',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '圆角',
      type: 'number',
      prop: 'borderRadius',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: '<1为比例',
        min: 0
      },
      func: null
    },
    {
      title: '旋转',
      type: 'number',
      prop: 'rotate',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: '角度'
      },
      func: null
    },
    {
      title: '内边距上',
      type: 'number',
      prop: 'paddingTop',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: 'px'
      },
      func: null
    },
    {
      title: '内边距下',
      type: 'number',
      prop: 'paddingBottom',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: 'px'
      },
      func: null
    },
    {
      title: '内边距左',
      type: 'number',
      prop: 'paddingLeft',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: 'px'
      },
      func: null
    },
    {
      title: '内边距右',
      type: 'number',
      prop: 'paddingRight',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: 'px'
      },
      func: null
    },
    {
      title: '进度',
      type: 'number',
      prop: 'progress',
      bindProp: null,
      event: 'change',
      option: {
        tip: '百分比，0.1表示10%',
        placeholder: '',
        min: 0,
        step: 0.1,
        max: 1
      },
      func: null
    },
    {
      title: '进度颜色',
      type: 'color',
      prop: 'progressColor',
      bindProp: null,
      event: 'change',
      option: {
        defaultColor: "#1890ff"
      },
      func: null
    },
    {
      title: '垂直进度',
      type: 'switch',
      prop: 'verticalProgress',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '反向进度',
      type: 'switch',
      prop: 'reverseProgress',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '水平翻转',
      type: 'switch',
      prop: 'flipX',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '垂直翻转',
      type: 'switch',
      prop: 'flipY',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '状态',
      type: 'select',
      prop: 'showChild',
      bindProp: null,
      event: 'change',
      option: {
        list: [
          { label: "状态1", value: '0' },
          { label: "状态2", value: '1' },
        ],
        placeholder: "请选择状态",
        hidden: null // 运行时设置
      },
      func: null
    },
  ]
}
