/**
 * Convert any image File to WebP using canvas.
 * Falls back to original file if WebP export is unsupported.
 */
export async function convertToWebp(
  file: File,
  quality = 0.85,
  maxDimension = 1600
): Promise<File> {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image must be under 15MB')
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.webp'),
            { type: 'image/webp' }
          )
          resolve(webpFile)
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')) }
    img.src = objectUrl
  })
}

export async function convertToWebpThumb(file: File): Promise<File> {
  return convertToWebp(file, 0.8, 600)
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}
