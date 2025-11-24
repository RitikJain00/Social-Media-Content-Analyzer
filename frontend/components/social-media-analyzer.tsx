"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Sparkles, Copy, RefreshCw, CheckCircle, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error"

interface AnalysisResult {
  extractedText: string
  suggestions: {
    hooks: string[]
    hashtags: string[]
    callToAction: string[]
  }
}

export function SocialMediaAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<AnalysisStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload an image (JPEG, PNG, WEBP) or PDF file.")
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("File size must be less than 5MB.")
      return false
    }
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        if (droppedFile.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(droppedFile))
        } else {
          setPreviewUrl(null)
        }
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
        if (selectedFile.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(selectedFile))
        } else {
          setPreviewUrl(null)
        }
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
    setStatus("idle")
    setResult(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setStatus("uploading")
    setProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(uploadInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      

      clearInterval(uploadInterval)
      setProgress(100)

      if (!response.ok) throw new Error("Analysis failed")

      setStatus("analyzing")

      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const data = await response.json()
      setResult(data)
      setStatus("complete")
    } catch (err) {
      setError("An error occurred during analysis. Please try again.")
      setStatus("error")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="w-full shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Content Analysis
        </CardTitle>
        <CardDescription>Upload your content to automatically generate engaging captions and hashtags.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!file && (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or PDF (MAX. 5MB)</p>
            </div>
            <input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleChange}
              accept="image/*,application/pdf"
            />
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/10 flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}

        {file && status !== "complete" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-4 overflow-hidden">
                {previewUrl ? (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border bg-background">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={status === "uploading" || status === "analyzing"}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>

            {(status === "uploading" || status === "analyzing") && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{status === "uploading" ? "Uploading file..." : "Analyzing content..."}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {status === "complete" && result && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-lg dark:bg-green-900/20 dark:text-green-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Analysis Complete</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900/40"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                New Analysis
              </Button>
            </div>

            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="suggestions">Engagement Suggestions</TabsTrigger>
                <TabsTrigger value="text">Extracted Text</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4 space-y-4">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={result.extractedText}
                    className="min-h-[300px] bg-muted/50 font-mono text-sm resize-none p-4"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard(result.extractedText)}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy text</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Viral Hooks
                    </h3>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                      <ul className="space-y-3">
                        {result.suggestions.hooks.map((hook, i) => (
                          <li
                            key={i}
                            className="text-sm bg-muted/50 p-2 rounded relative group cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => copyToClipboard(hook)}
                          >
                            "{hook}"
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <FileIcon className="h-3 w-3 text-primary" />
                      Call to Actions
                    </h3>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                      <ul className="space-y-3">
                        {result.suggestions.callToAction.map((cta, i) => (
                          <li
                            key={i}
                            className="text-sm bg-muted/50 p-2 rounded relative group cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => copyToClipboard(cta)}
                          >
                            {cta}
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Recommended Hashtags</h3>
                  <div className="flex flex-wrap gap-2 p-4 border rounded-md bg-muted/30">
                    {result.suggestions.hashtags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => copyToClipboard(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      {file && status === "idle" && (
        <CardFooter>
          <Button className="w-full" onClick={handleAnalyze} size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze Content
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
