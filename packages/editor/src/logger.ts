export type LoggerEntry = {
  type: number
  message: string
  timestamp: number
  args: readonly unknown[]
}

export class Logger {
  private entries: LoggerEntry[] = []
  private listeners = new Set<() => void>()

  private notify() {
    for (const listener of this.listeners) listener()
  }

  private _log(type: number, ...args: unknown[]) {
    this.entries = [
      ...this.entries,
      {
        type,
        message: args.map((msg) => String(msg)).join(' '),
        timestamp: Date.now(),
        args,
      },
    ]

    this.notify()
  }

  getEntries = (): readonly LoggerEntry[] => this.entries

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  clear = () => {
    this.entries = []
    this.notify()
  }

  log = (...args: unknown[]) => {
    this._log(0, ...args)
    console.log(...args)
  }
  warn = (...args: unknown[]) => {
    this._log(1, ...args)
    console.warn(...args)
  }
  error = (...args: unknown[]) => {
    this._log(2, ...args)
    console.error(...args)
  }
}

const logger = new Logger()

export const getLogger = () => logger
