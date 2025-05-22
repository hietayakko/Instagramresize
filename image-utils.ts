import imageCompression from "browser-image-compression"
import JSZip from "jszip"

interface ProcessImageOptions {
  targetWidth: number
  targetHeight: number
  paddingColor: string
  quality: number
  highResolution: boolean
}

/**
 * Process an image by resizing it to fit within the target dimensions
 * and adding padding to maintain the target aspect ratio
 */
export async function processImage(file: File, options: ProcessImageOptions): Promise<Blob> {
  // First compress the image to reduce memory usage during processing
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 10,
    useWebWorker: true,
    maxWidthOrHeight: 4000, // Reasonable limit for browser processing
  })

  // Create an image element to load the compressed file
  const img = new Image()
  img.crossOrigin = "anonymous"

  // Convert the compressed file to a data URL
  const imageUrl = URL.createObjectURL(compressedFile)

  // Wait for the image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })

  // Clean up the object URL
  URL.revokeObjectURL(imageUrl)

  // Calculate the output dimensions
  let outputWidth = options.targetWidth
  let outputHeight = options.targetHeight

  // Double the resolution if high resolution is enabled
  if (options.highResolution) {
    outputWidth *= 2
    outputHeight *= 2
  }

  // Create a canvas element for the output image
  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Fill the canvas with the padding color
  ctx.fillStyle = options.paddingColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Calculate the scaling factor to fit the image within the target dimensions
  // while maintaining its aspect ratio
  const sourceAspect = img.width / img.height
  const targetAspect = options.targetWidth / options.targetHeight

  let scaledWidth, scaledHeight, x, y

  if (sourceAspect > targetAspect) {
    // Image is wider than target aspect ratio
    scaledWidth = outputWidth
    scaledHeight = outputWidth / sourceAspect
    x = 0
    y = (outputHeight - scaledHeight) / 2
  } else {
    // Image is taller than target aspect ratio
    scaledHeight = outputHeight
    scaledWidth = outputHeight * sourceAspect
    x = (outputWidth - scaledWidth) / 2
    y = 0
  }

  // Draw the image on the canvas with the calculated dimensions and position
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

  // Convert the canvas to a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert canvas to blob"))
        }
      },
      "image/jpeg",
      options.quality,
    )
  })
}

/**
 * Create a ZIP file containing all processed images
 */
export async function createZipFile(images: Array<{ processedBlob: Blob; name: string }>): Promise<Blob> {
  const zip = new JSZip()

  // Add each image to the ZIP file
  images.forEach((image) => {
    zip.file(image.name, image.processedBlob)
  })

  // Generate the ZIP file
  return zip.generateAsync({ type: "blob" })
}

/**
 * Convert a HEIC/HEIF image to JPEG format
 * Note: This function requires the heic2any library
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (file.type === "image/heic" || file.type === "image/heif") {
    try {
      // Dynamically import the heic2any library
      const heic2any = (await import("heic2any")).default

      const jpegBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      })

      // Create a new File object from the JPEG blob
      return new File(
        [jpegBlob instanceof Blob ? jpegBlob : jpegBlob[0]],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        { type: "image/jpeg" },
      )
    } catch (error) {
      console.error("Error converting HEIC to JPEG:", error)
      throw new Error("Failed to convert HEIC image to JPEG")
    }
  }

  // If not a HEIC/HEIF file, return the original file
  return file
}
