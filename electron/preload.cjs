const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 文件对话框
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),

  // 平台信息
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),

  // 用户数据目录文件读写
  readFile: (fileName) => ipcRenderer.invoke('fs:readFile', fileName),
  writeFile: (fileName, data) => ipcRenderer.invoke('fs:writeFile', fileName, data),
  readJson: (fileName) => ipcRenderer.invoke('fs:readJson', fileName),
  writeJson: (fileName, data) => ipcRenderer.invoke('fs:writeJson', fileName, data),
  writeFileAbsolute: (filePath, data) => ipcRenderer.invoke('fs:writeFileAbsolute', filePath, data),
  readFileAbsolute: (filePath) => ipcRenderer.invoke('fs:readFileAbsolute', filePath),
  deleteFile: (fileName) => ipcRenderer.invoke('fs:deleteFile', fileName),
  getUserDataPath: () => ipcRenderer.invoke('fs:getUserDataPath'),

  // 菜单事件监听
  onMenuAction: (callback) => {
    ipcRenderer.removeAllListeners('menu:action')
    ipcRenderer.on('menu:action', (_event, action) => callback(action))
  },

  // 环境判断
  isElectron: true,
})
