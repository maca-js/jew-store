'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(0)

  const slides = images.map((src) => ({ src }))

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-brand-gray flex items-center justify-center">
        <span className="text-brand-muted font-sans text-sm">No image</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-brand-gray cursor-zoom-in"
        onClick={() => {
          setIndex(active)
          setOpen(true)
        }}
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-20 overflow-hidden flex-shrink-0 transition-opacity ${
                i === active ? 'opacity-100 ring-1 ring-brand-black' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
      />
    </div>
  )
}
