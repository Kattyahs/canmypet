export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png']

const MAX_SIDE = 1024
const QUALITY = 0.85

export async function resizeImage(file, maxSide = MAX_SIDE) {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    context.fillStyle = '#FFFFFF'
    context.fillRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))), 'image/jpeg', QUALITY)
    })
}