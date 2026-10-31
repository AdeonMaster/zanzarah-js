import EditorCanvas from './components/editor-canvas'

const App = () => {
  return (
    <div className="flex w-full h-full">
      <div className="w-full">
        <EditorCanvas />
      </div>
      <div className="w-[300px]"></div>
    </div>
  )
}

export default App
