const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

// 抑制 Electron 安全警告（webSecurity: false 是本应用所需：加载本地 SVG + 跨域 API）
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const isDev = !app.isPackaged

let mainWindow = null

/**
 * 创建应用菜单（中文版）
 */
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建项目',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'newFile')
          }
        },
        {
          label: '打开项目',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'openFile')
          }
        },
        { type: 'separator' },
        {
          label: '保存项目',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'saveJson')
          }
        },
        {
          label: '导出为 JSON',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'exportJson')
          }
        },
        {
          label: '导出为 SVG',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'saveSvg')
          }
        },
        {
          label: '导出为 PNG',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'savePng')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'undo')
          }
        },
        {
          label: '重做',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+Z' : 'Ctrl+Shift+Z',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'redo')
          }
        },
        { type: 'separator' },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'cut')
          }
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'copy')
          }
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'paste')
          }
        },
        { type: 'separator' },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'selectAll')
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          role: 'reload'
        },
        { type: 'separator' },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'zoomIn')
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'zoomOut')
          }
        },
        { type: 'separator' },
        {
          label: '切换全屏',
          accelerator: 'F11',
          click: () => {
            mainWindow?.setFullScreen(!mainWindow.isFullScreen())
          }
        },
        { type: 'separator' },
        {
          label: '切换编辑/预览',
          accelerator: 'CmdOrCtrl+Y',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'toggleView')
          }
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '关闭窗口',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: '工业组态编辑器',
              detail: `版本: v${app.getVersion()}\n基于 Meta2d.js 构建`,
              buttons: ['确定']
            })
          }
        }
      ]
    }
  ]

  // macOS 特殊菜单
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: `关于 ${app.getName()}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: '工业组态编辑器',
              detail: `版本: v${app.getVersion()}\n基于 Meta2d.js 构建`,
              buttons: ['确定']
            })
          }
        },
        { type: 'separator' },
        {
          label: '隐藏',
          accelerator: 'Cmd+H',
          role: 'hide'
        },
        {
          label: '隐藏其他',
          accelerator: 'Cmd+Alt+H',
          role: 'hideOthers'
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Cmd+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // 允许本地文件和跨域请求（开发时用）
    },
    title: '工业组态v1.0.0',
    titleBarOverlay: {
      color: '#1e1e2e',
      symbolColor: '#e0e0e0',
      height: 40,
    },
    show: false
  })

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createMenu()  // 创建中文菜单
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC 通信：文件保存对话框
ipcMain.handle('dialog:saveFile', async (event, options) => {
  if (!mainWindow) return { canceled: true }
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

// IPC 通信：文件打开对话框
ipcMain.handle('dialog:openFile', async (event, options) => {
  if (!mainWindow) return { canceled: true }
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

// IPC 通信：获取平台信息
ipcMain.handle('app:getPlatform', () => {
  return process.platform
})

// ==================== 用户数据目录文件读写 ====================

const userDataDir = path.join(app.getPath('userData'), 'meta2d-data')

// 确保用户数据目录存在
function ensureUserDataDir() {
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true })
  }
}

/**
 * 读取用户数据目录下的文件
 */
ipcMain.handle('fs:readFile', async (event, fileName) => {
  ensureUserDataDir()
  const filePath = path.join(userDataDir, fileName)
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, exists: false, data: null, error: 'File not found' }
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return { success: true, exists: true, data, error: null }
  } catch (err) {
    return { success: false, exists: false, data: null, error: err.message }
  }
})

/**
 * 写入用户数据目录下的文件
 */
ipcMain.handle('fs:writeFile', async (event, fileName, data) => {
  ensureUserDataDir()
  const filePath = path.join(userDataDir, fileName)
  try {
    fs.writeFileSync(filePath, data, 'utf-8')
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

/**
 * 获取用户数据目录路径
 */
ipcMain.handle('fs:getUserDataPath', () => {
  ensureUserDataDir()
  return userDataDir
})

/**
 * 读取用户数据目录下的 JSON 文件
 */
ipcMain.handle('fs:readJson', async (event, fileName) => {
  ensureUserDataDir()
  const filePath = path.join(userDataDir, fileName)
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, exists: false, data: null, error: 'File not found' }
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    return { success: true, exists: true, data, error: null }
  } catch (err) {
    return { success: false, exists: false, data: null, error: err.message }
  }
})

/**
 * 写入用户数据目录下的 JSON 文件
 */
ipcMain.handle('fs:writeJson', async (event, fileName, data) => {
  ensureUserDataDir()
  const filePath = path.join(userDataDir, fileName)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

/**
 * 写入任意绝对路径的文件（用于导出功能）
 */
ipcMain.handle('fs:writeFileAbsolute', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf-8')
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

/**
 * 删除用户数据目录下的文件
 */
ipcMain.handle('fs:deleteFile', async (event, fileName) => {
  ensureUserDataDir()
  const filePath = path.join(userDataDir, fileName)
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return { success: true, error: null }
    }
    return { success: false, error: 'File not found' }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

/**
 * 读取任意路径的文件（用于打开文件功能）
 */
ipcMain.handle('fs:readFileAbsolute', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, exists: false, data: null, error: 'File not found' }
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return { success: true, exists: true, data, error: null }
  } catch (err) {
    return { success: false, exists: false, data: null, error: err.message }
  }
})
