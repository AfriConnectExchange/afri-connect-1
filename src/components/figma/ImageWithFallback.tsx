"use client";
import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, ...props }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  const imageSrc = error && fallbackSrc ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      onError={handleError}
      width={props.width || 300}
      height={props.height || 200}
    />
  );
};
