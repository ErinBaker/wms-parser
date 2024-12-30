import React, { useState } from 'react';

interface LayerLegendProps {
  url: string;
  layerName: string;
}

export default function LayerLegend({ url, layerName }: LayerLegendProps) {
  const [hasError, setHasError] = useState(false);

  const handleImageError = async () => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      // Check if response contains ServiceException with AccessDenied
      if (text.includes('<ServiceException code="AccessDenied">')) {
        setHasError(true);
      }
    } catch (error) {
      setHasError(true);
    }
  };

  if (hasError) {
    return <p className="text-gray-600 italic">No legend available for this layer</p>;
  }

  return (
    <img 
      src={url}
      alt={`Legend for ${layerName}`}
      onError={handleImageError}
      className="max-w-full h-auto border border-gray-200 rounded"
    />
  );
}