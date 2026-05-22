/** 线条样式 SVG 模板 */
export const LINE_STYLE_TEMPLATES = [
  {
    label: '直线',
    template:
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">\n' +
      '                  <g fill="none" stroke="black" stroke-width="1">\n' +
      '                    <path d="M0 9 l85 0"></path>\n' +
      '                  </g>\n' +
      '                </svg>',
    value: 0
  },
  {
    label: '虚线',
    template:
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">\n' +
      '                  <g fill="none" stroke="black" stroke-width="1">\n' +
      '                    <path stroke-dasharray="5 5" d="M0 9 l85 0"></path>\n' +
      '                  </g>\n' +
      '                </svg>',
    value: 1
  },
  {
    label: '虚线（大）',
    template:
      `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;">
                  <g fill="none" stroke="black" stroke-width="1">
                    <path stroke-dasharray="10 10" d="M0 9 l85 0"></path>
                  </g>
                </svg>`,
    value: 2
  },
  {
    label: '点横线',
    template:
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">\n' +
      '                  <g fill="none" stroke="black" stroke-width="1">\n' +
      '                    <path stroke-dasharray="10 10 2 10" d="M0 9 l85 0"></path>\n' +
      '                  </g>\n' +
      '                </svg>',
    value: 3
  }
]

/** 线条样式对应的 dash 数组 */
export const DASH_ARRAYS = [
  [0, 0],
  [5, 5],
  [10, 10],
  [10, 10, 2, 10]
]

/** 连线类型 SVG 模板 */
export const LINE_TYPE_TEMPLATES = [
  {
    label: '脑图',
    template: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;">
                  <g fill="none" stroke="black" stroke-width="1">
                    <path d="M0 9 a100,50 0 0,1 85,0"></path>
                  </g>
                </svg>`,
    value: 'curve'
  },
  {
    label: '线段',
    template: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;">
                  <g fill="none" stroke="black" stroke-width="1">
                    <path d="M0 4 l40 0 l0 12 l40 0"></path>
                  </g>
                </svg>`,
    value: 'polyline'
  },
  {
    label: '直线',
    template:
      `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;">
                  <g fill="none" stroke="black" stroke-width="1">
                    <path d="M0 9 l85 0"></path>
                  </g>
                </svg>`,
    value: 'line'
  }
]
