import React from 'react';
import { WFSCapabilities } from '../types';
import { Info, Layers, Server, MapPin, CheckCircle2, Globe, ExternalLink } from 'lucide-react';

interface WFSCapabilitiesDisplayProps {
  capabilities: WFSCapabilities;
}

export default function WFSCapabilitiesDisplay({ capabilities }: WFSCapabilitiesDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Service Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">{capabilities.service.title}</h2>
        </div>

        {capabilities.service.abstract && (
          <p className="text-gray-600 mb-4">{capabilities.service.abstract}</p>
        )}

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Service Type:</span>{' '}
            <code className="px-2 py-1 bg-gray-100 rounded">{capabilities.service.type}</code>
          </div>

          {capabilities.service.versions.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Versions:</span>{' '}
              {capabilities.service.versions.map((v, i) => (
                <code key={i} className="px-2 py-1 bg-gray-100 rounded ml-1">{v}</code>
              ))}
            </div>
          )}

          {capabilities.service.keywords && capabilities.service.keywords.length > 0 && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Keywords:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {capabilities.service.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Provider Information */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Provider</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{capabilities.provider.name}</p>
            {capabilities.provider.site && (
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <a href={capabilities.provider.site} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {capabilities.provider.site}
                </a>
              </p>
            )}
            {capabilities.provider.contact && (
              <div className="mt-2 space-y-1">
                {capabilities.provider.contact.individualName && (
                  <p>{capabilities.provider.contact.individualName}</p>
                )}
                {capabilities.provider.contact.positionName && (
                  <p className="text-gray-500">{capabilities.provider.contact.positionName}</p>
                )}
                {capabilities.provider.contact.email && (
                  <p className="text-blue-600">{capabilities.provider.contact.email}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validation Status */}
        {capabilities.validation && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Support Status</h3>
            <div className="flex gap-4 text-sm">
              {capabilities.validation.supportsEPSG4326 && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>EPSG:4326 Supported</span>
                </div>
              )}
              {capabilities.validation.supportsEPSG3857 && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>EPSG:3857 Supported</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Operations */}
      {capabilities.operations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Operations ({capabilities.operations.length})</h2>
          </div>

          <div className="space-y-4">
            {capabilities.operations.map((op, index) => (
              <div key={index} className="border-l-4 border-purple-200 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">{op.name}</h3>

                <div className="space-y-2 text-sm">
                  {op.methods.map((method, mIndex) => (
                    <div key={mIndex} className="flex items-start gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded font-bold text-xs">
                        {method.type}
                      </code>
                      <code className="px-2 py-1 bg-gray-50 rounded text-xs flex-1 break-all">
                        {method.url}
                      </code>
                    </div>
                  ))}

                  {op.parameters && (
                    <div className="mt-2 space-y-1">
                      {op.parameters.outputFormats && (
                        <div>
                          <span className="font-medium text-gray-700">Output Formats:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {op.parameters.outputFormats.map((format, i) => (
                              <code
                                key={i}
                                className={`px-2 py-0.5 rounded text-xs ${
                                  format.toLowerCase().includes('json')
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {format}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}

                      {op.parameters.srsNames && (
                        <div>
                          <span className="font-medium text-gray-700">SRS Names:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {op.parameters.srsNames.map((srs, i) => (
                              <code key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                {srs}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Types */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Compatible Feature Types ({capabilities.featureTypes.length})
          </h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          The following layers support both GeoJSON output format and EPSG:4326 coordinate system:
        </p>

        <div className="space-y-4">
          {capabilities.featureTypes.map((ft, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {ft.title}
              </h3>

              {ft.abstract && (
                <p className="text-gray-600 mb-3 text-sm">{ft.abstract}</p>
              )}

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>{' '}
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs">{ft.name}</code>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Default CRS:</span>{' '}
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs">{ft.defaultCRS}</code>
                </div>

                {ft.otherCRS && ft.otherCRS.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Other CRS:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ft.otherCRS.map((crs, i) => (
                        <code key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {crs}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {ft.wgs84BoundingBox && (
                  <div>
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Bounding Box (WGS84):
                    </span>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Lower Corner:</span>
                        <code className="ml-1 font-mono">
                          {ft.wgs84BoundingBox.lowerCorner.join(', ')}
                        </code>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Upper Corner:</span>
                        <code className="ml-1 font-mono">
                          {ft.wgs84BoundingBox.upperCorner.join(', ')}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {ft.metadataURL && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Metadata:</span>
                    <a
                      href={ft.metadataURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Metadata
                    </a>
                  </div>
                )}

                {ft.outputFormats && ft.outputFormats.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Output Formats:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ft.outputFormats.map((format, i) => (
                        <code
                          key={i}
                          className={`px-2 py-0.5 rounded text-xs ${
                            format.toLowerCase().includes('json')
                              ? 'bg-green-100 text-green-800 font-semibold'
                              : 'bg-gray-100'
                          }`}
                        >
                          {format}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>GeoJSON Ready</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>EPSG:4326 Compatible</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints */}
      {capabilities.endpoints && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Service Endpoints</h2>
          <div className="space-y-2 text-sm">
            {capabilities.endpoints.base && (
              <div>
                <span className="font-medium text-gray-700">Base URL:</span>
                <code className="block mt-1 px-3 py-2 bg-gray-50 rounded text-xs break-all">
                  {capabilities.endpoints.base}
                </code>
              </div>
            )}
            {capabilities.endpoints.getFeature && (
              <div>
                <span className="font-medium text-gray-700">GetFeature:</span>
                <code className="block mt-1 px-3 py-2 bg-gray-50 rounded text-xs break-all">
                  {capabilities.endpoints.getFeature}
                </code>
              </div>
            )}
            {capabilities.endpoints.describeFeatureType && (
              <div>
                <span className="font-medium text-gray-700">DescribeFeatureType:</span>
                <code className="block mt-1 px-3 py-2 bg-gray-50 rounded text-xs break-all">
                  {capabilities.endpoints.describeFeatureType}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {capabilities.errors && capabilities.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-3">Parsing Warnings</h2>
          <div className="space-y-2">
            {capabilities.errors.map((error, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-red-700">{error.code}:</span>{' '}
                <span className="text-red-600">{error.message}</span>
                {error.hint && (
                  <p className="text-red-500 text-xs mt-1 ml-4">{error.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
