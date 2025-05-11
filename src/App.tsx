import { TunerForm } from './TunerForm'

function App() {
  return (
    <>
      <div className="py-14">
        <div className="container">
          <h1 className="mb-10 text-4xl">Turbo Tuner Settings</h1>

          <div className="md:w-1/2">
            <TunerForm />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
