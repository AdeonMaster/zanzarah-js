import { faGripHorizontal } from '@fortawesome/free-solid-svg-icons/faGripHorizontal'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Group, Panel, Separator } from 'react-resizable-panels'
import EditorCanvas from './components/editor-canvas'
import { loadScene } from './three/scene'
import { useLogger } from './hooks/use-logger'
import { useLayoutEffect, useRef } from 'react'
import { faEraser } from '@fortawesome/free-solid-svg-icons'

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
  switch(type) {
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

  const handleLoadScene = () => {
    loadScene()
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
        <span
          className="text-sm cursor-default hover:bg-[#454646] p-1 rounded"
          onClick={handleLoadScene}
        >
          Load scene
        </span>
      </div>

      <Group orientation="horizontal">
        <Panel className="card rounded" minSize={150} defaultSize={250}></Panel>
        <HorizontalPanelResizeHandle />
        <Panel>
          <Group orientation="vertical">
            <Panel className="card rounded">
              <EditorCanvas />
            </Panel>
            <VerticalPanelResizeHandle />
            <Panel
              className="card2 rounded"
              minSize={150}
              defaultSize={150}
            > 
              <div className='flex flex-col h-full'>
                <div className='flex shrink-0 p-1 justify-end'>
                  <div className='cursor-default hover:bg-[#454646] p-1 rounded h-[24px] w-[24px] flex items-center justify-center' onClick={handleConsoleClear}>
                    <FontAwesomeIcon icon={faEraser} size="xs" />
                  </div>
                </div>
                <div ref={scrollRef} className='overflow-x-auto p-2'>
                  {entries.map((entry) => <p key={entry.timestamp} className={`text-xs ${getEntryTypeClassName(entry.type)}`}>{entry.message}</p>)}
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
        <HorizontalPanelResizeHandle />
        <Panel className="card rounded" minSize={150} defaultSize={250}>
        </Panel>
      </Group>
    </div>
  )
}

export default App

//  <div className="w-full">
//         <EditorCanvas />
//       </div>
//       <div className="w-[300px]"></div>
