"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface PhotoUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function PhotoUpload({ value, onChange, disabled }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Create a preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    await uploadFile(file)
  }, [])

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      // For demonstration, we'll use a placeholder approach
      // In a real app, you'd upload to Cloudinary, AWS S3, or similar service

      // Option 1: Cloudinary upload (requires CLOUDINARY_CLOUD_NAME, etc.)
      // const formData = new FormData()
      // formData.append('file', file)
      // formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      // const response = await fetch(
      //   `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      //   {
      //     method: 'POST',
      //     body: formData,
      //   }
      // )

      // if (response.ok) {
      //   const data = await response.json()
      //   onChange(data.secure_url)
      // }

      // Option 2: For demo purposes, we'll simulate an upload delay
      // and return a placeholder URL. Replace this with actual upload logic.

      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload delay

      // In a real implementation, you'd get the URL from your cloud storage
      // For now, we'll use a placeholder that shows the upload worked
      const mockUrl = `https://picsum.photos/400/300?random=${Date.now()}`
      onChange(mockUrl)

    } catch (error) {
      console.error('Upload failed:', error)
      // Reset preview on error
      setPreview(value || null)
      alert('Upload failed. Please try again or use a direct URL.')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: disabled || uploading
  })

  const handleRemove = () => {
    setPreview(null)
    onChange("")
  }

  const handleUrlInput = (url: string) => {
    setPreview(url)
    onChange(url)
  }

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      {preview && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <Image
                src={preview}
                alt="Memory photo"
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                onError={() => setPreview(null)}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {!preview && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPEG, PNG, GIF, WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Alternative: Direct URL Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>Or enter image URL directly</span>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={value || ""}
            onChange={(e) => handleUrlInput(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || uploading}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          You can also upload photos to Imgur, Cloudinary, or any image hosting service and paste the URL here
        </p>
      </div>
    </div>
  )
}
