import { Meta2d, PenType, PrevNextType } from "@meta2d/core"
import type { Rect, Pen, Point } from '@meta2d/core'
import { parseSvg } from "@meta2d/svg";

import { ElMessage } from "element-plus"
import 'element-plus/theme-chalk/el-message.css'

import { reactive } from "vue"

export const menu = reactive({
    left: [
        {
            key: "file",
            name: "文件",
            icon: "l-folder",
            children: [
                {
                    name: "新建项目文件",
                    action: "newFile"
                },
                {
                    name: "打开项目文件",
                    action: "openFile"
                },
                {
                    name: "导入素材文件",
                    action: "loadFile"
                }
            ]
        },
        {
            key: "save",
            name: "保存为",
            icon: "l-save",
            children: [
                {
                    name: "保存项目文件",
                    action: "saveJson"
                },
                {
                    name: "导出项目json",
                    action: "exportJson"
                },
                {
                    name: "导出项目svg",
                    action: "saveSvg"
                },
                {
                    name: "导出项目png",
                    action: "savePng"
                }
            ]

        },
        {
            key: "edit",
            name: "编辑",
            icon: "l-gongyong--bianji",
            children: [
                {
                    name: "添加/删除锚点(Shift+A)",
                    action: "toggleAnchorMode"
                },
                {
                    name: "添加手柄(Shift+H)",
                    action: "addAnchorHand"
                },
                {
                    name: "删除手柄(Shift+D)",
                    action: "removeAnchorHand"
                },
                {
                    name: "切换手柄类型(Shift)",
                    action: "switchAnchorHandType"
                }
            ]

        },
        {
            key: "magnifier",
            name: "放大镜",
            icon: "l-fangdajing",
            action: "openMagnifier",
            active: false
        },
        {
            key: "map",
            name: "鹰眼地图",
            icon: "l-ditu",
            action: "openMap",
            active: false
        },
        {
            key: "pen",
            name: "钢笔",
            icon: "l-curve",
            action: "usePen",
            active: false
        },
        {
            key: "pencil",
            name: "铅笔",
            icon: "l-qianbi",
            action: "usePencil",
            active: false
        }
    ],
    right: [
        {
            key: "undo",
            name: "撤销",
            icon: "l-cexiao",
            action: "undo",
            active: false
        },
        {
            key: "redo",
            name: "重做",
            icon: "l-chongzuo",
            action: "redo",
            active: false
        },
        {
            key: "start",
            name: "起点",
            icon: "l-line",
            children: [
                {
                    name: "",
                    icon: "l-line",
                    action: "start",
                    value: "",
                },
                {
                    name: "",
                    icon: "l-from-triangle",
                    action: "start",
                    value: "triangle",
                },
                {
                    name: "",
                    icon: "l-from-diamond",
                    action: "start",
                    value: "diamond",
                },
                {
                    name: "",
                    icon: "l-from-circle",
                    action: "start",
                    value: "circle",
                },
                {
                    name: "",
                    icon: "l-from-lineDown",
                    action: "start",
                    value: "lineDown",
                },
                {
                    name: "",
                    icon: "l-from-lineUp",
                    action: "start",
                    value: "lineUp",
                },
                {
                    name: "",
                    icon: "l-from-triangleSolid",
                    action: "start",
                    value: "triangleSolid",
                },
                {
                    name: "",
                    icon: "l-from-diamondSolid",
                    action: "start",
                    value: "diamondSolid",
                },
                {
                    name: "",
                    icon: "l-from-circleSolid",
                    action: "start",
                    value: "circleSolid",
                },
                {
                    name: "",
                    icon: "l-from-line",
                    action: "start",
                    value: "line",
                },

            ]
        },
        {
            key: "end",
            name: "终点",
            icon: "l-line",
            children: [
                {
                    name: "",
                    icon: "l-line",
                    action: "end",
                    value: "",
                },
                {
                    name: "",
                    icon: "l-to-triangle",
                    action: "end",
                    value: "triangle",
                },
                {
                    name: "",
                    icon: "l-to-diamond",
                    action: "end",
                    value: "diamond",
                },
                {
                    name: "",
                    icon: "l-to-circle",
                    action: "end",
                    value: "circle",
                },
                {
                    name: "",
                    icon: "l-to-lineDown",
                    action: "end",
                    value: "lineDown",
                },
                {
                    name: "",
                    icon: "l-to-lineUp",
                    action: "end",
                    value: "lineUp",
                },
                {
                    name: "",
                    icon: "l-to-triangleSolid",
                    action: "end",
                    value: "triangleSolid",
                },
                {
                    name: "",
                    icon: "l-to-diamondSolid",
                    action: "end",
                    value: "diamondSolid",
                },
                {
                    name: "",
                    icon: "l-to-circleSolid",
                    action: "end",
                    value: "circleSolid",
                },
                {
                    name: "",
                    icon: "l-to-line",
                    action: "end",
                    value: "line",
                },

            ]
        },
        {
            key: "line",
            name: "连线",
            icon: "l-line",
            children: [{
                name: "",
                icon: "l-line",
                action: "line",
                value: "line"
            }, {
                name: "",
                icon: "l-curve2",
                action: "line",
                value: "curve"
            }, {
                name: "",
                icon: "l-polyline",
                action: "line",
                value: "polyline"
            }, {
                name: "",
                icon: "l-mind",
                action: "line",
                value: "mind"
            }]
        },
        {
            key: "manual",
            name: "手动锚点",
            icon: "l-maodian",
            action: "manual",
            active: false
        }
    ]
})

// 分发执行事件函数  
export function dispatchFunc(act: string | undefined, data: any) {
    if (!act) return false
    menuFunc[act](data)
}

interface MenuFunc {
    [key: string]: (data: any) => void
}

declare let showOpenFilePicker: Function

const menuFunc: MenuFunc = {
    newFile() {
        // 清除本地缓存
        // 1. 清除 localStorage 中的 meta2dJSON
        localStorage.removeItem('meta2dJSON')
        
        // 2. 清除 Electron 用户数据目录中的 project.json
        if (window.electronAPI?.deleteFile) {
            window.electronAPI.deleteFile('project.json').then((result) => {
                if (result.success) {
                    ElMessage({ message: '已清除旧项目缓存', type: 'success' })
                }
            }).catch((err) => {
                console.warn('清除 project.json 失败:', err)
            })
        }
        
        // 3. 新建画布
        meta2d.open()
        ElMessage({ message: '已创建新画布', type: 'success' })
    },
    // 打开文件
    async openFile() {
        // Electron 环境：使用原生对话框
        if (window.electronAPI?.openFile) {
            try {
                const result = await window.electronAPI.openFile({
                    title: '打开项目文件',
                    filters: [
                        { name: 'JSON 文件', extensions: ['json'] },
                        { name: '所有文件', extensions: ['*'] }
                    ],
                    properties: ['openFile']
                })
                
                if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                    const filePath = result.filePaths[0]
                    // 通过 IPC 读取文件内容
                    const readResult = await window.electronAPI.readFileAbsolute(filePath)
                    if (readResult.success && readResult.data) {
                        const json = JSON.parse(readResult.data)
                        // 提取文件名（不使用 path 模块）
                        const fileName = filePath.split('/').pop()?.replace(/\.json$/i, '') || '未命名'
                        json.fileName = fileName
                        meta2d.open(json)
                        meta2d.emit('opened')
                        meta2d.emit("changePens")
                        ElMessage({ message: '项目已打开', type: 'success' })
                    }
                }
            } catch (err: any) {
                ElMessage({ message: '打开文件失败: ' + err.message, type: 'error' })
            }
            return
        }
        
        // Web 环境：使用 showOpenFilePicker API
        if (typeof showOpenFilePicker === 'undefined') {
            ElMessage({ message: '当前浏览器不支持文件选择，请使用 Chrome/Edge 或 Electron 应用', type: 'error' })
            return
        }
        
        const file = await showOpenFilePicker()
        if (!file) return false
        const fileHandle = file[0]
        const dataObj = await fileHandle.getFile()
        const data = await dataObj.text()
        if (data && dataObj.type === 'application/json') {
            const json = JSON.parse(data);
            json.fileName = fileHandle.name.split(".").shift()
            meta2d.open(json);
            meta2d.emit('opened')
            meta2d.emit("changePens")
        } else {
            ElMessage({ message: '只能打开json文件', type: "error" })
        }
    },
    // 加载素材文件
    async loadFile() {
        // Electron 环境：使用原生对话框
        if (window.electronAPI?.openFile) {
            try {
                const result = await window.electronAPI.openFile({
                    title: '导入素材文件',
                    filters: [
                        { name: 'SVG 文件', extensions: ['svg'] },
                        { name: '所有文件', extensions: ['*'] }
                    ],
                    properties: ['openFile']
                })
                
                if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                    const filePath = result.filePaths[0]
                    const readResult = await window.electronAPI.readFileAbsolute(filePath)
                    if (readResult.success && readResult.data) {
                        const pen = parseSvg(readResult.data)
                        meta2d.canvas.addCaches = pen
                        ElMessage({ message: '添加成功，请点击放置点', type: 'success' })
                    }
                }
            } catch (err: any) {
                ElMessage({ message: '导入文件失败: ' + err.message, type: 'error' })
            }
            return
        }
        
        // Web 环境：使用 showOpenFilePicker API
        if (typeof showOpenFilePicker === 'undefined') {
            ElMessage({ message: '当前浏览器不支持文件选择，请使用 Chrome/Edge 或 Electron 应用', type: 'error' })
            return
        }
        
        const file = await showOpenFilePicker()
        if (!file) return false
        const fileHandle = file[0]
        const dataObj = await fileHandle.getFile()
        const data = await dataObj.text()
        if (dataObj.type === 'image/svg+xml') {
            const pen = parseSvg(data)
            meta2d.canvas.addCaches = pen
            ElMessage({ message: '添加成功，请点击放置点', type: 'success' })
            return false
        }
        ElMessage({ message: '添加失败，暂且只支持svg文件', type: 'error' })
    },
    // 放大镜
    openMagnifier(item) {
        if (meta2d.canvas.magnifierCanvas.magnifier) { // 判断放大镜状态  
            meta2d.hideMagnifier() // 关闭放大镜  
        } else {
            meta2d.showMagnifier() // 打开放大镜  
        }
        item.active = !item.active
    },
    // 鹰眼
    openMap(item) {
        if (meta2d.map?.isShow) {
            meta2d.hideMap()  // 隐藏缩略图API
        } else {
            meta2d.showMap()  // 显示缩略图API
        }
        item.active = !item.active
    },
    // 钢笔
    usePen(item) {
        if (meta2d.canvas.drawingLineName) {  // 判断是否正在使用钢笔
            meta2d.drawLine()   // 参数为空 取消钢笔
            meta2d.finishPencil() // 绘画完成
            item.active = false
        } else {
            meta2d.drawLine('curve')  // 使用钢笔 线条属性为curve
            item.active = true
        }
    },
    // 铅笔
    usePencil(item) {
        if (meta2d.canvas.pencil) {
            meta2d.stopPencil()
            meta2d.finishPencil()
        } else {
            meta2d.drawingPencil()
        }
        item.active = !item.active
    },
    // 保存json
    async saveJson() {
        const jsonData = meta2d.data()
        const fileName = (meta2d.store.options as any).fileName || '未命名'
        ;(jsonData as any).fileName = fileName
        const json = JSON.stringify(jsonData)  // 序列化json对象

        // Electron 环境下保存到用户数据目录
        if (window.electronAPI?.writeFile) {
            try {
                const result = await window.electronAPI.writeFile('project.json', json)
                if (result.success) {
                    ElMessage({ message: '已保存到默认项目文件', type: 'success' })
                } else {
                    ElMessage({ message: '保存失败: ' + result.error, type: 'error' })
                }
            } catch (err: any) {
                ElMessage({ message: '保存失败: ' + err.message, type: 'error' })
            }
            return
        }

        const file = new Blob([json], { type: "application/json" }) // 创建文件对象，指定类型为json
        const link = URL.createObjectURL(file) // 创建Url指向内存中的文件对象
        const a = document.createElement('a')  // 创建a标签用于下载操作
        a.setAttribute("download", fileName)  // 设置download属性 第二个参数为文件名
        a.setAttribute("href", link)  // 设置a标签的数据来源
        a.click() // 点击，开始下载
    },
    // 导出json（选择路径保存）
    async exportJson() {
        const jsonData = meta2d.data()
        const fileName = ((meta2d.store.options as any).fileName || '未命名') + '.json'
        const json = JSON.stringify(jsonData, null, 2)

        // Electron 环境下弹出保存对话框
        if (window.electronAPI?.saveFile) {
            try {
                const result = await window.electronAPI.saveFile({
                    defaultPath: fileName,
                    filters: [
                        { name: 'JSON Files', extensions: ['json'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                })
                if (!result.canceled && result.filePath) {
                    const writeResult = await window.electronAPI.writeFileAbsolute(result.filePath, json)
                    if (writeResult.success) {
                        ElMessage({ message: '导出成功', type: 'success' })
                    } else {
                        ElMessage({ message: '导出失败: ' + writeResult.error, type: 'error' })
                    }
                }
            } catch (err: any) {
                ElMessage({ message: '导出失败: ' + err.message, type: 'error' })
            }
            return
        }

        // Web 环境下直接下载
        const file = new Blob([json], { type: 'application/json' })
        const link = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.setAttribute('download', fileName)
        a.setAttribute('href', link)
        a.click()
    },
    // 保存svg
    saveSvg() {
        downloadSvg()
    },
    // 保存png
    savePng() {
        const name = (meta2d.store.options as any).fileName
        meta2d.downloadPng(name)
    },
    // 撤销
    undo() {
        meta2d.undo()
    },
    // 重做
    redo() {
        meta2d.redo()
    },
    // 剪切
    cut() {
        meta2d.cut()
    },
    // 复制
    copy() {
        meta2d.copy()
    },
    // 粘贴
    paste() {
        meta2d.paste()
    },
    // 全选
    selectAll() {
        meta2d.store.data.pens.forEach((pen: any) => {
            if (!pen.parentId) {
                meta2d.active(pen)
            }
        })
        meta2d.render()
    },
    // 放大
    zoomIn() {
        const scale = meta2d.store.data.scale
        meta2d.scale(scale + 0.1)
    },
    // 缩小
    zoomOut() {
        const scale = meta2d.store.data.scale
        meta2d.scale(scale - 0.1)
    },
    // 适应画布
    zoomToFit() {
        meta2d.fitView()
    },
    // 终点
    end(item) {
        meta2d.store.data.toArrow = item.value
        if (meta2d.store.active) {
            meta2d.store.active.forEach((i) => {
                if (i.type === PenType.Line) {
                    i.toArrow = item.value
                }
            })
        }
        meta2d.render()
    },
    // 起点
    start(item) {
        meta2d.store.data.fromArrow = item.value

        if (meta2d.store.active) {
            meta2d.store.active.forEach((i) => {
                if (i.type === PenType.Line) {
                    i.fromArrow = item.value
                }
            })
        }
        meta2d.render()
    },
    // 连线
    line(item) {
        meta2d.store.options.drawingLineName = item.value  // 修改全局连线样式配置
        meta2d.canvas.drawingLineName && (meta2d.canvas.drawingLineName = item.value);  // 修改当前连线样式
        meta2d.store.active?.forEach((pen) => {  // 修改已激活图元的连线样式
            meta2d.updateLineType(pen, item.value);  // meta2d的修改函数
        });
        meta2d.render()
    },
    // 锚点
    manual(item) {
        meta2d.toggleAnchorMode()
        item.active = !item.active
    },
    // 添加/删除锚点
    toggleAnchorMode() {
        meta2d.toggleAnchorMode()
    },
    // 添加手柄
    addAnchorHand() {
        meta2d.addAnchorHand()
    },
    // 删除手柄
    removeAnchorHand() {
        meta2d.removeAnchorHand()
    },
    // 切换手柄类型
    switchAnchorHandType() {
        const activeAnchor: Point | undefined = meta2d.store.activeAnchor
        if (activeAnchor) {
            switch (activeAnchor.prevNextType) {
                case PrevNextType.Bilateral:
                    activeAnchor.prevNextType = PrevNextType.Free
                    break;
                case PrevNextType.Free:
                    activeAnchor.prevNextType = PrevNextType.Mirror
                    break;
                case PrevNextType.Mirror:
                    activeAnchor.prevNextType = PrevNextType.Bilateral
                    break;
                default:
                    activeAnchor.prevNextType = PrevNextType.Bilateral
            }
            meta2d.render()
        }
    }

}

/** 下载svg fn */
function downloadSvg() {
    const rect: Rect = meta2d.getRect();
    rect.x = rect.x || 0;
    rect.y = rect.y || 0;
    rect.width = rect.width || 0;
    rect.height = rect.height || 0;
    rect.x -= 10;
    rect.y -= 10;
    const ctx = new C2S(rect.width + 20, rect.height + 20);
    ctx.textBaseline = 'middle';
    for (const pen of meta2d.store.data.pens) {
        if (pen.visible == false || !isShowChild(pen, meta2d.store)) {
            continue;
        }
        meta2d.renderPenRaw(ctx, pen, rect);
    }

    let mySerializedSVG = ctx.getSerializedSvg();
    if (meta2d.store.data.background) {
        mySerializedSVG = mySerializedSVG.replace('{{bk}}', '');
        mySerializedSVG = mySerializedSVG.replace(
            '{{bkRect}}',
            `<rect x="0" y="0" width="100%" height="100%" fill="${meta2d.store.data.background}"></rect>`
        );
    } else {
        mySerializedSVG = mySerializedSVG.replace('{{bk}}', '');
        mySerializedSVG = mySerializedSVG.replace('{{bkRect}}', '');
    }
    mySerializedSVG = mySerializedSVG.replace(/--le5le--/g, '&#x');
    const urlObject = window.URL || window;
    const export_blob = new Blob([mySerializedSVG]);
    const url = urlObject.createObjectURL(export_blob);
    const a = document.createElement('a');
    a.setAttribute(
        'download',
        `${(meta2d.store.options as any).fileName || '未命名'}.svg`
    );
    a.setAttribute('href', url);
    const evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
    a.dispatchEvent(evt);
};

function isShowChild(pen: Pen, store: any) {
    let selfPen = pen;
    while (selfPen && selfPen.parentId) {
        const oldPen = selfPen;
        selfPen = store.pens[selfPen.parentId];
        const showChildIndex = selfPen?.calculative?.showChild;
        if (showChildIndex != undefined) {
            const showChildId = selfPen?.children ? selfPen?.children[showChildIndex] : undefined;
            if (showChildId !== oldPen.id) {
                return false;
            }
        }
    }
    return true;
}