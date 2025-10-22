import { WFSFeatureTypeData } from "../types";
import { Layers, CheckCircle2 } from "lucide-react";

interface WFSFeatureTypeListProps {
  featureTypes: WFSFeatureTypeData[];
}

export default function WFSFeatureTypeList({
  featureTypes,
}: WFSFeatureTypeListProps) {
  if (featureTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Layers className="w-5 h-5" />
        Feature Types Supporting GeoJSON & EPSG:4326 ({featureTypes.length})
      </h2>

      <div className="grid gap-6">
        {featureTypes.map((featureType, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {featureType.title || featureType.name}
              </h3>

              {featureType.abstract && (
                <p className="text-gray-600 mb-4">{featureType.abstract}</p>
              )}

              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Name:</span>{" "}
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {featureType.name}
                  </code>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">GeoJSON Supported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">EPSG:4326 Supported</span>
                  </div>
                </div>

                {featureType.defaultSRS && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">
                      Default SRS:
                    </span>{" "}
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {featureType.defaultSRS}
                    </code>
                  </div>
                )}

                {featureType.otherSRS && featureType.otherSRS.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">
                      Other SRS:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {featureType.otherSRS.map((srs, idx) => (
                        <code
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {srs}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {featureType.outputFormats &&
                  featureType.outputFormats.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Output Formats:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {featureType.outputFormats.map((format, idx) => (
                          <code
                            key={idx}
                            className={`px-2 py-1 rounded text-xs ${
                              format.toLowerCase().includes("json")
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100"
                            }`}
                          >
                            {format}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                {featureType.keywords && featureType.keywords.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Keywords:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {featureType.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p className="mb-1">
                  <span className="font-medium">Feature Name:</span>{" "}
                  <code className="bg-gray-50 px-1 py-0.5 rounded">
                    {featureType.name}
                  </code>
                </p>
                <p>
                  This layer supports GeoJSON format and EPSG:4326 coordinate
                  system, making it compatible with web mapping applications.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
