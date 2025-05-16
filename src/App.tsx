import { TunerForm } from './TunerForm'

function App() {
  return (
    <>
      <div className="py-14">
        <div className="container">
          <h1 className="mb-10 text-3xl">Turbo Tuner Settings</h1>

          <div className="max-w-xs">
            <TunerForm />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
