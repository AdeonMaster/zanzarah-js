import { useEffect, useState } from 'react'
import { getLogger, type Logger } from '../logger'

export const useLogger = (logger: Logger = getLogger()) => {
  const [entries, setEntries] = useState(logger.getEntries)

  useEffect(() => {
    const update = () => setEntries(logger.getEntries())
    const unsubscribe = logger.subscribe(update)

    // Catch logs written between rendering and subscribing.
    update()

    return unsubscribe
  }, [logger])

  return {
    entries,
    log: logger.log,
    warn: logger.warn,
    error: logger.error,
    clear: logger.clear,
  }
}
