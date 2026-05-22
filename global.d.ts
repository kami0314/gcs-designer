import { Meta2d } from '@meta2d/core'

interface ElectronAPI {
  saveFile: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>
  openFile: (options?: any) => Promise<{ canceled: boolean; filePaths?: string[] }>
  getPlatform: () => Promise<string>
  readFile: (fileName: string) => Promise<{ success: boolean; exists: boolean; data: string | null; error: string | null }>
  writeFile: (fileName: string, data: string) => Promise<{ success: boolean; error: string | null }>
  readJson: (fileName: string) => Promise<{ success: boolean; exists: boolean; data: any; error: string | null }>
  writeJson: (fileName: string, data: any) => Promise<{ success: boolean; error: string | null }>
  writeFileAbsolute: (filePath: string, data: string) => Promise<{ success: boolean; error: string | null }>
  readFileAbsolute: (filePath: string) => Promise<{ success: boolean; exists: boolean; data: string | null; error: string | null }>
  deleteFile: (fileName: string) => Promise<{ success: boolean; error: string | null }>
  getUserDataPath: () => Promise<string>
  onMenuAction: (callback: (action: string) => void) => void
  isElectron: boolean
}

declare global {
    var meta2d: Meta2d;
    var C2S: any;
    interface Window {
      electronAPI?: ElectronAPI;
    }
}