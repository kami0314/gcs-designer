/** 禁止配置 */
export const disableConfig = {
  title: '禁止',
  labelWidth: 100,
  multiShow: false,
  children: [
    {
      title: '禁止输入',
      type: 'switch',
      prop: 'disableInput',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '禁止旋转',
      type: 'switch',
      prop: 'disableRotate',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '禁止缩放',
      type: 'switch',
      prop: 'disableSize',
      bindProp: null,
      event: 'change',
      func: null
    },
    {
      title: '禁止锚点',
      type: 'switch',
      prop: 'disableAnchor',
      bindProp: null,
      event: 'change',
      func: null
    }
  ]
}