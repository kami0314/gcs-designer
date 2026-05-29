import { onUnmounted } from 'vue'
import mitt from 'mitt'

const emitter = mitt()

const customEmit = (eventName: string) => {
    emitter.emit(eventName)
}

const customOn = (eventName: string, callback: () => void) => {
    emitter.on(eventName, () => callback())
}

export const useEventbus = () => {
    const listeners: Array<{ event: string; callback: () => void }> = []

    const on = (eventName: string, callback: () => void) => {
        const handler = () => callback()
        emitter.on(eventName, handler)
        listeners.push({ event: eventName, callback: handler })
    }

    const emit = (eventName: string) => {
        emitter.emit(eventName)
    }

    onUnmounted(() => {
        // 只清理当前组件注册的监听器
        listeners.forEach(({ event, callback }) => {
            emitter.off(event, callback)
        })
        listeners.length = 0
    })

    return {
        customEmit: emit,
        customOn: on
    }
}
