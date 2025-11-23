import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 md:p-8 dark:bg-gray-950">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Social Media Content Analyzer</h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Upload your images or PDFs to extract text and get AI-powered engagement suggestions.
          </p>
        </div>
       
      </div>
    </main>
  )
}

