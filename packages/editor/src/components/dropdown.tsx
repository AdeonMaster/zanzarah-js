import {
  type ButtonHTMLAttributes,
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

type DropdownContextValue = {
  isOpen: boolean
  isNested: boolean
  menuId: string
  toggleRef: RefObject<HTMLButtonElement | null>
  toggle: () => void
  closeAll: () => void
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown() {
  const context = useContext(DropdownContext)

  if (!context) {
    throw new Error('Dropdown components must be inside a Dropdown')
  }

  return context
}

type DropdownProps = {
  toggle: ReactNode
  children: ReactNode
  className?: string
}

export function Dropdown({ toggle, children, className }: DropdownProps) {
  const parent = useContext(DropdownContext)
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const isNested = parent !== null

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  const closeAll = () => {
    setIsOpen(false)

    if (parent) {
      parent.closeAll()
    } else {
      toggleRef.current?.focus()
    }
  }

  const content = (
    <DropdownContext.Provider
      value={{
        isOpen,
        isNested,
        menuId,
        toggleRef,
        toggle: () => setIsOpen((previous) => !previous),
        closeAll,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: isNested ? 'block' : 'inline-block',
        }}
        onBlur={(event) => {
          // Close when keyboard focus leaves this dropdown.
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsOpen(false)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && isOpen) {
            event.preventDefault()
            event.stopPropagation()

            setIsOpen(false)
            toggleRef.current?.focus()
          }
        }}
      >
        {toggle}

        {isOpen && (
          <ul
            id={menuId}
            style={{
              position: 'absolute',
              top: isNested ? 0 : '100%',
              left: isNested ? '100%' : 0,
              zIndex: 2000,
              listStyle: 'none',
              minWidth: '160px',
            }}
            className="border-1 border-[#454646] card rounded text-sm p-1"
          >
            {children}
          </ul>
        )}
      </div>
    </DropdownContext.Provider>
  )

  // Keep nested dropdowns valid children of the parent's <ul>.
  return isNested ? <li>{content}</li> : content
}

type DropdownToggleProps = ButtonHTMLAttributes<HTMLButtonElement>

export function DropdownToggle({
  children,
  onClick,
  style,
  ...props
}: DropdownToggleProps) {
  const { isOpen, isNested, menuId, toggleRef, toggle } = useDropdown()

  return (
    <button
      {...props}
      ref={toggleRef}
      type="button"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      style={{
        display: 'block',
        width: isNested ? '100%' : undefined,
        textAlign: 'left',
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          toggle()
        }
      }}
      className="text-sm cursor-default hover:bg-[#454646] p-1 rounded disabled:opacity-8"
    >
      {children}
    </button>
  )
}

type DropdownItemProps = ButtonHTMLAttributes<HTMLButtonElement>

export function DropdownItem({
  children,
  onClick,
  style,
  className,
  ...props
}: DropdownItemProps) {
  const { closeAll } = useDropdown()

  return (
    <li className={className}>
      <button
        {...props}
        type="button"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          ...style,
        }}
        className="hover:bg-[#2A2D2E] rounded px-1 disabled:opacity-8"
        onClick={(event) => {
          onClick?.(event)

          if (!event.defaultPrevented) {
            closeAll()
          }
        }}
      >
        {children}
      </button>
    </li>
  )
}

export const DropdownDivider = () => <hr className="text-[#454646] my-1" />
