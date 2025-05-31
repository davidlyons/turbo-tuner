import { TunerForm } from '@/TunerForm'

function App() {
  return (
    <>
      <div className="py-19">
        <div className="mx-auto px-4 md:max-w-4xl">
          <TunerForm />

          <div className="text-center">
            <a
              href="https://github.com/davidlyons/turbo-tuner"
              className="right-4 bottom-4 inline-block p-4 opacity-50 transition-opacity hover:opacity-100 lg:absolute"
            >
              <img className="inline size-6" src="https://cdn.simpleicons.org/github/white" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
