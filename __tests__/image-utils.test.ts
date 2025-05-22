import { processImage, createZipFile } from "@/lib/image-utils"
import jest from "jest"

// Mock browser-image-compression
jest.mock("browser-image-compression", () => {
  return jest.fn().mockImplementation((file) => Promise.resolve(file))
})

// Mock JSZip
jest.mock("jszip", () => {
  return jest.fn().mockImplementation(() => {
    return {
      file: jest.fn(),
      generateAsync: jest.fn().mockResolvedValue(new Blob(["test-zip-content"])),
    }
  })
})

describe("Image Utils", () => {
  beforeAll(() => {
    // Mock canvas and context
    const mockContext = {
      fillRect: jest.fn(),
      fillStyle: "",
      drawImage: jest.fn(),
    }

    const mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      width: 0,
      height: 0,
      toBlob: jest.fn().mockImplementation((callback) => callback(new Blob(["test"]))),
    }

    global.document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === "canvas") return mockCanvas
      return document.createElement(tag)
    })

    // Mock Image
    global.Image = jest.fn().mockImplementation(() => {
      return {
        onload: null,
        onerror: null,
        src: "",
        width: 800,
        height: 600,
        crossOrigin: "",
      }
    })

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue("blob:test")
    global.URL.revokeObjectURL = jest.fn()
  })

  it("should process an image", async () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" })

    const result = await processImage(file, {
      targetWidth: 1080,
      targetHeight: 1350,
      paddingColor: "#ffffff",
      quality: 0.9,
      highResolution: false,
    })

    expect(result).toBeInstanceOf(Blob)
  })

  it("should create a ZIP file", async () => {
    const images = [
      { processedBlob: new Blob(["test1"]), name: "test1.jpg" },
      { processedBlob: new Blob(["test2"]), name: "test2.jpg" },
    ]

    const result = await createZipFile(images)

    expect(result).toBeInstanceOf(Blob)
  })
})
