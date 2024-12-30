import React from 'react';
import { LayerData } from '../types';
import { Map, Link } from 'lucide-react';
import LayerLegend from './LayerLegend';

interface LayerListProps {
  layers: LayerData[];
}

export default function LayerList({ layers }: LayerListProps) {
  if (layers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Map className="w-5 h-5" />
        Found EPSG:3857 layers ({layers.length})
      </h2>
      
      <div className="grid gap-6">
        {layers.map((layer, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="grid md:grid-cols-[1fr,300px] gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {layer.title || layer.name}
                </h3>
                
                {layer.abstract && (
                  <p className="text-gray-600 mb-4">{layer.abstract}</p>
                )}

                <div className="space-y-4">
                  <div className="grid gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>{' '}
                      {layer.name}
                    </div>
                    {layer.onlineResource && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 flex items-center gap-1">
                          <Link className="w-4 h-4" />
                          Service URL:
                        </span>{' '}
                        <a
                          href={layer.onlineResource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {layer.onlineResource}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {layer.styles?.[0]?.legendUrl && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Legend:</h4>
                  <LayerLegend 
                    url={layer.styles[0].legendUrl} 
                    layerName={layer.title || layer.name}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}