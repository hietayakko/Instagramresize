"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, ImageIcon, X, FileArchiveIcon as ZipIcon } from "lucide-react"
import { processImage, createZipFile } from "@/lib/image-utils"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import ImagePreview from "@/components/image-preview"
import ColorPicker from "@/components/color-picker"
import { useMobile } from "@/hooks/use-mobile"

interface ProcessedImage {
  id: string
  originalFile: File
  processedBlob: Blob
  previewUrl: string
  name: string
}

export default function ImageResizer() {
  const [files, setFiles] = useState<File[]>([])
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [paddingColor, setPaddingColor] = useState("#ffffff")
  const [highResolution, setHighResolution] = useState(false)
  const [compressionLevel, setCompressionLevel] = useState(90)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 30) {
        toast({
          title: "ファイル数が多すぎます",
          description: "一度にアップロードできるのは最大30枚までです。",
          variant: "destructive",
        })
        return
      }

      const validFiles = acceptedFiles.filter(
        (file) =>
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/heic" ||
          file.type === "image/heif",
      )

      if (validFiles.length !== acceptedFiles.length) {
        toast({
          title: "無効なファイル形式",
          description: "JPG、PNG、HEICのみ対応しています。",
          variant: "destructive",
        })
      }

      setFiles((prevFiles) => [...prevFiles, ...validFiles])
    },
    [toast],
  )

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/heic": [],
      "image/heif": [],
    },
    maxFiles: 30,
    noClick: true, // クリックイベントを無効化し、カスタム処理を使用
  })

  const handleProcess = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setProcessedImages([])

    const processed: ProcessedImage[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i]
        const processedBlob = await processImage(file, {
          targetWidth: 1080,
          targetHeight: 1350,
          paddingColor,
          quality: compressionLevel / 100,
          highResolution,
        })

        const previewUrl = URL.createObjectURL(processedBlob)

        processed.push({
          id: `${file.name}-${Date.now()}`,
          originalFile: file,
          processedBlob,
          previewUrl,
          name: file.name.replace(/\.[^/.]+$/, "") + "_resized.jpg",
        })

        setProgress(Math.round(((i + 1) / files.length) * 100))
      } catch (error) {
        console.error("画像処理エラー:", error)
        toast({
          title: "処理エラー",
          description: `${files[i].name}の処理に失敗しました`,
          variant: "destructive",
        })
      }
    }

    setProcessedImages(processed)
    setIsProcessing(false)

    toast({
      title: "処理完了",
      description: `${processed.length}枚の画像を処理しました`,
    })
  }

  const handleDownloadAll = async () => {
    if (processedImages.length === 0) return

    try {
      const zipBlob = await createZipFile(processedImages)
      const downloadUrl = URL.createObjectURL(zipBlob)

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = "instagram_resized_images.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(downloadUrl)

      toast({
        title: "ダウンロード開始",
        description: "ZIPファイルをダウンロードしています",
      })
    } catch (error) {
      console.error("ZIPファイル作成エラー:", error)
      toast({
        title: "ダウンロードエラー",
        description: "ZIPファイルの作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleDownloadSingle = (image: ProcessedImage) => {
    const link = document.createElement("a")
    link.href = image.previewUrl
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleRemoveAllFiles = () => {
    setFiles([])
    setProcessedImages([])
    // Clean up object URLs
    processedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">アップロード</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
          <TabsTrigger value="results" disabled={processedImages.length === 0}>
            結果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onDrop(Array.from(e.target.files))
                }
              }}
              accept="image/jpeg,image/png,image/heic,image/heif"
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <h3 className="font-medium text-lg">画像をドラッグ＆ドロップ</h3>
              <p className="text-sm text-muted-foreground">またはクリックしてファイルを選択（JPG、PNG、HEIC）</p>
              <p className="text-xs text-muted-foreground mt-2">最大30枚、端末上で処理されます</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                ファイルを選択
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{files.length}枚のファイルを選択中</h3>
                <Button variant="ghost" size="sm" onClick={handleRemoveAllFiles}>
                  すべて削除
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {files.map((file, index) => (
                  <Card key={`${file.name}-${index}`} className="overflow-hidden">
                    <div className="aspect-square relative bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs truncate" title={file.name}>
                        {file.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || files.length === 0}
                  className="w-full sm:w-auto text-base py-6"
                  size={isMobile ? "lg" : "default"}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中 ({progress}%)
                    </>
                  ) : (
                    "画像をリサイズする"
                  )}
                </Button>
              </div>

              {isProcessing && <Progress value={progress} className="h-2" />}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="padding-color">余白の色</Label>
                <ColorPicker color={paddingColor} onChange={setPaddingColor} id="padding-color" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compression">JPEG画質: {compressionLevel}%</Label>
                </div>
                <Slider
                  id="compression"
                  min={10}
                  max={100}
                  step={1}
                  value={[compressionLevel]}
                  onValueChange={(value) => setCompressionLevel(value[0])}
                  className="py-4"
                />
              </div>

              <div className="flex items-center space-x-2 py-2">
                <Switch
                  id="high-resolution"
                  checked={highResolution}
                  onCheckedChange={setHighResolution}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="high-resolution" className="text-base">
                  高解像度（2160×2700px）
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {processedImages.length > 0 && (
            <>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-medium">{processedImages.length}枚の画像を処理しました</h3>
                <Button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2"
                  size={isMobile ? "lg" : "default"}
                >
                  <ZipIcon className="h-4 w-4" />
                  すべてダウンロード（ZIP）
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {processedImages.map((image) => (
                  <ImagePreview key={image.id} image={image} onDownload={() => handleDownloadSingle(image)} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
