import type { Meta2dClass } from '@meta2d/core'

declare global {
  interface Window {
    meta2d: Meta2dClass
  }
  
  const meta2d: Meta2dClass
}

export {}
