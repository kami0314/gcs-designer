/** 文字配置 */
export const textConfig = {
  title: '文字',
  multiShow: true,
  labelWidth: 100,
  children: [
    {
      title: '字体名',
      type: 'select',
      multiShow: true,
      prop: 'fontFamily',
      option: {
        placeholder: '请选择字体',
        list: [
          { label: '宋体', value: '宋体' },
          { label: '黑体', value: '黑体' }
        ]
      },
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '字体大小',
      type: 'number',
      multiShow: true,
      prop: 'fontSize',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '字体颜色',
      type: 'color',
      multiShow: true,
      prop: 'textColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '浮动字体颜色',
      type: 'color',
      multiShow: true,
      prop: 'hoverTextColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '选中字体颜色',
      type: 'color',
      multiShow: true,
      prop: 'activeTextColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '文字背景颜色',
      type: 'color',
      multiShow: true,
      prop: 'textBackground',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: "倾斜",
      type: 'select',
      prop: 'fontStyle',
      multiShow: true,
      bindProp: null,
      event: 'change',
      option: {
        placeholder: '请选择',
        list: [
          { label: '正常', value: 'normal' },
          { label: '倾斜', value: 'italic' },
        ]
      },
      func: null,
    },
    {
      title: "加粗",
      type: 'select',
      prop: 'fontWeight',
      multiShow: true,
      bindProp: null,
      event: 'change',
      option: {
        placeholder: '请选择',
        list: [
          { label: '正常', value: 'normal' },
          { label: '加粗', value: 'bold' },
        ]
      },
      func: null,
    },
    {
      title: '水平对齐',
      type: 'select',
      multiShow: true,
      prop: 'textAlign',
      option: {
        placeholder: '请选择对齐方式',
        list: [
          { label: '左对齐', value: 'left' },
          { label: '居中对齐', value: 'center' },
          { label: '右对齐', value: 'right' }
        ]
      },
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '垂直对齐',
      type: 'select',
      multiShow: true,
      prop: 'textBaseline',
      option: {
        placeholder: '请选择对齐方式',
        list: [
          { label: '顶部对齐', value: 'top' },
          { label: '居中对齐', value: 'center' },
          { label: '底部对齐', value: 'bottom' }
        ]
      },
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '行高',
      type: 'number',
      multiShow: true,
      option: {
        step: 0.1,
        min: 0
      },
      prop: 'lineHeight',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '换行',
      type: 'select',
      multiShow: true,
      prop: 'whiteSpace',
      option: {
        placeholder: '请选择换行方式',
        list: [
          { label: '默认', value: 'break-word' },
          { label: '不换行', value: 'nowrap' },
          { label: '回车换行', value: 'pre-line' },
          { label: '永远换行', value: 'break-all' }
        ]
      },
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '文字宽度',
      type: 'number',
      multiShow: true,
      option: {
        min: 0
      },
      prop: 'textWidth',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '文字高度',
      type: 'number',
      multiShow: true,
      option: {
        min: 0
      },
      prop: 'textHeight',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '水平偏移',
      type: 'number',
      multiShow: true,
      prop: 'textLeft',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '垂直偏移',
      type: 'number',
      multiShow: true,
      prop: 'textTop',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '超出省略',
      type: 'switch',
      prop: 'ellipsis',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '隐藏文字',
      type: 'switch',
      prop: 'hiddenText',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '保留小数',
      type: 'number',
      prop: 'keepDecimal',
      bindProp: null,
      event: 'change',
      option: {
        placeholder: '保留小数位',
        min: 0,
        step: 1
      },
      func: null
    },
    {
      title: '下划线',
      type: 'switch',
      prop: 'textDecoration',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '下划线颜色',
      type: 'color',
      prop: 'textDecorationColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '下划线样式',
      type: 'dropdown',
      option: {
        placeholder: '线条样式',
        list: null // 运行时设置
      },
      bindProp: null,
      event: 'command',
      prop: 'decorationDash',
      func: null
    },
    {
      title: '删除线',
      type: 'switch',
      prop: 'textStrickout',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '删除线颜色',
      type: 'color',
      prop: 'textStrickoutColor',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '删除线样式',
      type: 'dropdown',
      option: {
        placeholder: '线条样式',
        list: null // 运行时设置
      },
      bindProp: null,
      event: 'command',
      prop: 'strickoutDash',
      func: null
    },
    {
      title: '文字内容',
      type: 'input',
      option: {
        type: 'textarea'
      },
      prop: 'text',
      bindProp: null,
      event: 'input',
      func: null
    }
  ]
}