const renderMap = new WeakMap<object, number>()

export function requestRender(meta2d: any) {
  if (renderMap.get(meta2d)) return
  renderMap.set(meta2d, requestAnimationFrame(() => {
    renderMap.delete(meta2d)
    meta2d.render()
  }))
}
