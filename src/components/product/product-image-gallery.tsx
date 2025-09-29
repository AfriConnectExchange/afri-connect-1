
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-lg shadow-md bg-muted">
        <Image
          src={images[selectedImageIndex]}
          alt={productName}
          width={600}
          height={600}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image: string, index: number) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
              selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
            }`}
          >
            <Image
              src={image}
              alt={`${productName} ${index + 1}`}
              width={150}
              height={150}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
