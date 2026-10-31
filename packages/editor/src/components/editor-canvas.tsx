import { useEffect, useRef } from 'react'
import { mountScene } from '../scene'

export default function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let cleanup: (() => void) | undefined

    void mountScene(container).then((dispose) => {
      if (disposed) {
        dispose()
      } else {
        cleanup = dispose
      }
    })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [])

  return <div ref={containerRef} className="scene" />
}
