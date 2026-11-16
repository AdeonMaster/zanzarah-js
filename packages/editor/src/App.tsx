import { faEraser, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { faGripHorizontal } from '@fortawesome/free-solid-svg-icons/faGripHorizontal'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLayoutEffect, useRef, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownToggle,
} from './components/dropdown'
import EditorCanvas from './components/editor-canvas'
import { useLogger } from './hooks/use-logger'
import { loadScene } from './three/scene'

const HorizontalPanelResizeHandle = () => (
  <Separator className="flex items-center text-xs">
    <FontAwesomeIcon icon={faGripVertical} />
  </Separator>
)
const VerticalPanelResizeHandle = () => (
  <Separator className="flex justify-center text-xs">
    <FontAwesomeIcon icon={faGripHorizontal} />
  </Separator>
)

const getEntryTypeClassName = (type: number) => {
  switch (type) {
    case 1:
      return 'text-amber-800'
    case 2:
      return 'text-red-800'
    default:
      return ''
  }
}

const App = () => {
  const { entries, clear } = useLogger()
  const [isSceneLoading, setSceneLoading] = useState(false)

  const handleLoadScene = () => {
    setSceneLoading(true)

    loadScene().then(() => {
      setSceneLoading(false)
    })
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = scrollRef.current

    if (element) {
      element.scrollTop = element.scrollHeight
    }
  }, [entries])

  const handleConsoleClear = () => {
    clear()
  }

  return (
    <div
      className="theme flex flex-col w-full h-full p-2 pt-0"
      data-theme="dark"
    >
      <div className="header flex items-center">
        <Dropdown toggle={<DropdownToggle>Scene</DropdownToggle>}>
          <DropdownItem onClick={handleLoadScene} disabled={isSceneLoading}>
            Load
          </DropdownItem>
        </Dropdown>

        {/* <Dropdown toggle={<DropdownToggle>Options</DropdownToggle>}>
          <DropdownItem onClick={() => console.log('Edit')}>
            Edit
          </DropdownItem>

          <Dropdown toggle={<DropdownToggle>Export ▸</DropdownToggle>}>
            <DropdownItem onClick={() => console.log('Export PNG')}>
              PNG
            </DropdownItem>

            <Dropdown toggle={<DropdownToggle>More formats ▸</DropdownToggle>}>
              <DropdownItem onClick={() => console.log('Export SVG')}>
                SVG
              </DropdownItem>

              <DropdownItem onClick={() => console.log('Export PDF')}>
                PDF
              </DropdownItem>
            </Dropdown>
          </Dropdown>

          <DropdownDivider />
          <DropdownItem disabled>Delete</DropdownItem>
        </Dropdown> */}
      </div>

      <Group orientation="horizontal">
        <Panel className="card rounded" minSize={150} defaultSize={250}></Panel>
        <HorizontalPanelResizeHandle />
        <Panel>
          <Group orientation="vertical">
            <Panel className="card rounded">
              <div className="relative w-full h-full flex flex-col">
                <div className="w-full h-full flex flex-col">
                  <div className="flex shrink-0 p-1 justify-end">
                    <Dropdown
                      toggle={
                        <DropdownToggle>
                          <FontAwesomeIcon icon={faLayerGroup} />
                        </DropdownToggle>
                      }
                    >
                      <DropdownItem>Level 0</DropdownItem>
                      <DropdownItem>Level 1</DropdownItem>
                      <DropdownItem>Level 2</DropdownItem>
                    </Dropdown>
                  </div>
                  <EditorCanvas className="w-full h-full" />
                </div>
                {isSceneLoading && (
                  <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
                    <span>Loading..</span>
                  </div>
                )}
              </div>
            </Panel>
            <VerticalPanelResizeHandle />
            <Panel className="card2 rounded" minSize={150} defaultSize={150}>
              <div className="flex flex-col h-full">
                <div className="flex shrink-0 p-1 justify-end">
                  <button
                    className="cursor-default hover:bg-[#454646] p-1 rounded h-[24px] w-[24px] flex items-center justify-center disabled:opacity-8"
                    onClick={handleConsoleClear}
                    disabled={isSceneLoading}
                    title="Clear"
                  >
                    <FontAwesomeIcon icon={faEraser} size="xs" />
                  </button>
                </div>
                <div ref={scrollRef} className="overflow-x-auto p-2">
                  {entries.map((entry) => (
                    <p
                      key={entry.id}
                      className={`text-xs ${getEntryTypeClassName(entry.type)}`}
                    >
                      {entry.message}
                    </p>
                  ))}
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
        <HorizontalPanelResizeHandle />
        <Panel className="card rounded" minSize={150} defaultSize={250}></Panel>
      </Group>
    </div>
  )
}

export default App

//  <div className="w-full">
//         <EditorCanvas />
//       </div>
//       <div className="w-[300px]"></div>
