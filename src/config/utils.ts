export function mergeProps(target: any, resource: any) {
    let cachedRect: any = null
    for (const i in target) {
        if (['width', 'height', 'x', 'y'].includes(i)) {
            if (!cachedRect) {
                cachedRect = meta2d.getPenRect(resource)
            }
            target[i] = cachedRect[i]
            continue
        }
        if (resource[i]) {
            target[i] = resource[i]
        } else {
            target[i] = resource.calculative?.[i]
        }
        if (!target[i]) {
            switch (typeof target[i]) {
                case "string":
                    target[i] = ""
                    break
                case "number":
                    target[i] = 0
                    break
                case "boolean":
                    target[i] = false
                    break
            }
        }
    }
}
