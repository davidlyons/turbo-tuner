import { Button } from '@/components/ui/button'
// import { FiDownload } from 'react-icons/fi'

export const DownloadButton = ({ text }: { text: string }) => {
  const file = new Blob([text], { type: 'text/plain' })

  // console.log(text)

  return (
    <div className="flex flex-wrap gap-2">
      {/* https://ui.shadcn.com/docs/components/button#link */}
      <Button asChild>
        <a
          // @ts-ignore
          download="turbo-tuner-settings-web.txt"
          target="_blank"
          rel="noreferrer"
          href={URL.createObjectURL(file)}
          className="w-full"
        >
          {/* <FiDownload className="mr-2 h-5 w-5" /> */}
          Download
        </a>
      </Button>
    </div>
  )
}
