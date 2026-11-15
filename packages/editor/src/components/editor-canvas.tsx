import { useEffect, useRef } from 'react'
import { mountRenderer } from '../three/scene'

export default function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const controller = new AbortController()
    let cleanup: (() => void) | undefined

    void mountRenderer(container, controller.signal)
      .then((dispose) => {
        cleanup = dispose
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Could not mount renderer:', error)
        }
      })

    return () => {
      controller.abort()
      cleanup?.()
    }
  }, [])

  return <div ref={containerRef} className="scene" />
}
