import { Group, Panel, Separator } from 'react-resizable-panels'
import EditorCanvas from './components/editor-canvas'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical'
import { faGripHorizontal } from '@fortawesome/free-solid-svg-icons/faGripHorizontal'

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

const App = () => {
  return (
    <div className="theme flex flex-col w-full h-full p-2 pt-0" data-theme="dark">
      <div className="header flex items-center">
        <span className="text-sm cursor-default hover:bg-[#454646] p-1 rounded">Scene</span>
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
            <Panel className="card rounded" minSize={150} defaultSize={150}></Panel>
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