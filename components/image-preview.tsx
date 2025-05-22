"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ImagePreviewProps {
  image: {
    id: string
    previewUrl: string
    name: string
  }
  onDownload: () => void
}

export default function ImagePreview({ image, onDownload }: ImagePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/5] relative bg-muted">
        <img src={image.previewUrl || "/placeholder.svg"} alt={image.name} className="h-full w-full object-contain" />
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm truncate mr-2" title={image.name}>
            {image.name}
          </p>
          <Button size="icon" variant="ghost" onClick={onDownload} className="flex-shrink-0 h-9 w-9">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
