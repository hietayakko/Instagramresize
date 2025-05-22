import type { Metadata } from "next"
import dynamic from "next/dynamic"

// ImageResizerコンポーネントを動的にインポート
const ImageResizer = dynamic(() => import("@/components/image-resizer"), {
  ssr: false,
  loading: () => <p className="text-center py-10">読み込み中...</p>,
})

export const metadata: Metadata = {
  title: "Instagram画像リサイザー",
  description: "Instagramの4:5比率に画像をリサイズし、カスタム余白を追加できます",
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold">Instagram画像リサイザー</h1>
          <p className="text-muted-foreground">
            Instagramの4:5比率（1080×1350px）に画像をリサイズし、カスタム余白を追加できます
          </p>
        </div>
        <ImageResizer />
      </div>
    </main>
  )
}
