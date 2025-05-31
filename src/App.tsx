import { TunerForm } from '@/TunerForm'
import { BookText } from 'lucide-react'
import GitHub from './github.svg?react'

function App() {
  return (
    <>
      <div className="py-12 md:py-19">
        <div className="mx-auto px-4 md:max-w-4xl">
          <TunerForm />

          <div className="right-4 bottom-4 text-center min-[1170px]:fixed">
            <a
              href="https://www.turbo-tuner.com/usb"
              className="inline-block p-4 opacity-50 transition-opacity hover:opacity-100"
              aria-label="USB Operation Doc"
            >
              <BookText className="size-6" />
            </a>
            <a
              href="https://github.com/davidlyons/turbo-tuner"
              className="inline-block p-4 opacity-50 transition-opacity hover:opacity-100"
              aria-label="GitHub Repo"
            >
              <GitHub className="size-6" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
