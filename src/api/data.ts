/**
 * 设备数据管理模块
 * Electron 环境下读写用户数据目录的 devices.json
 * Web 环境下使用 localStorage
 */

export interface DataTree {
    id: string,
    name: string,
    children: DataTree[]
}

// 内置默认设备数据
const defaultDevices: DataTree[] = [
    {
        id: 'd',
        name: '测试监测',
        children: [
            {
                id: 'd-1-b',
                name: '温度传感器',
                children: [
                    { id: 'd-1-b-001', name: '温度', children: [] },
                    { id: 'd-1-b-002', name: '湿度', children: [] }
                ]
            }
        ]
    },
    {
        id: 'system',
        name: '系统设备',
        children: [
            {
                id: 'system.pump',
                name: '水泵',
                children: [
                    { id: 'system.pump.1', name: '1#水泵', children: [] },
                    { id: 'system.pump.2', name: '2#水泵', children: [] },
                    { id: 'system.pump.3', name: '3#水泵', children: [] }
                ]
            },
            {
                id: 'system.fan',
                name: '风机',
                children: [
                    { id: 'system.fan.1', name: '1#风机', children: [] },
                    { id: 'system.fan.2', name: '2#风机', children: [] }
                ]
            },
            {
                id: 'system.valve',
                name: '阀门',
                children: [
                    { id: 'system.valve.1', name: '进水阀', children: [] },
                    { id: 'system.valve.2', name: '出水阀', children: [] },
                    { id: 'system.valve.3', name: '旁通阀', children: [] }
                ]
            }
        ]
    },
    {
        id: 'env',
        name: '环境监测',
        children: [
            {
                id: 'env.temp',
                name: '温度传感器',
                children: [
                    { id: 'env.temp.1', name: '车间温度', children: [] },
                    { id: 'env.temp.2', name: '水箱温度', children: [] }
                ]
            },
            {
                id: 'env.pressure',
                name: '压力传感器',
                children: [
                    { id: 'env.pressure.1', name: '进水压力', children: [] },
                    { id: 'env.pressure.2', name: '出水压力', children: [] }
                ]
            }
        ]
    }
    
]

const DEVICES_FILE = 'devices.json'
const DEVICES_STORAGE_KEY = 'meta2d_devices_data'

/**
 * 获取设备数据
 */
export async function getData(): Promise<DataTree[]> {
    // Electron 环境下优先读取用户数据目录
    if (window.electronAPI?.readJson) {
        try {
            const result = await window.electronAPI.readJson(DEVICES_FILE)
            if (result.success && result.data) {
                return result.data as DataTree[]
            }
        } catch (err) {
            console.warn('Read devices.json failed:', err)
        }
    }

    // Web 环境下读取 localStorage
    try {
        const stored = localStorage.getItem(DEVICES_STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored) as DataTree[]
        }
    } catch (err) {
        console.warn('Read devices from localStorage failed:', err)
    }

    // 返回默认数据
    return JSON.parse(JSON.stringify(defaultDevices))
}

/**
 * 保存设备数据
 */
export async function saveDevicesData(data: DataTree[]): Promise<boolean> {
    // Electron 环境下写入用户数据目录
    if (window.electronAPI?.writeJson) {
        try {
            const result = await window.electronAPI.writeJson(DEVICES_FILE, data)
            return result.success
        } catch (err) {
            console.error('Write devices.json failed:', err)
            return false
        }
    }

    // Web 环境下写入 localStorage
    try {
        localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(data))
        return true
    } catch (err) {
        console.error('Write devices to localStorage failed:', err)
        return false
    }
}

/**
 * 解析并验证上传的设备 JSON 文件
 */
export function parseDevicesJson(jsonText: string): DataTree[] | null {
    try {
        const data = JSON.parse(jsonText)
        if (Array.isArray(data) && data.length > 0) {
            // 简单验证结构
            const isValid = data.every((item: any) =>
                item.id && item.name && Array.isArray(item.children)
            )
            if (isValid) {
                return data as DataTree[]
            }
        }
        // 也支持直接是对象的情况（非数组根）
        if (data.id && data.name && Array.isArray(data.children)) {
            return [data as DataTree]
        }
    } catch (err) {
        console.error('Parse devices JSON failed:', err)
    }
    return null
}