import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { parseLayerData, parseServiceInfo } from "../utils/xmlParser";
import {
  parseErrorResponse,
  validateServiceResponse,
  checkServiceException,
} from "../utils/errorUtils";
import { parseXMLDocument, checkXMLParseError } from "../utils/xmlUtils";
import { validateURL } from "../utils/urlUtils";
import {
  parseWFSServiceInfo,
  parseWFSFeatureTypes,
  parseWFSCapabilities,
} from "../utils/wfsParser";
import {
  validateWFSServiceResponse,
  checkWFSException,
  isWFSCapabilitiesDocument,
} from "../utils/wfsErrorUtils";
import {
  LayerData,
  ServiceData,
  WFSServiceData,
  WFSFeatureTypeData,
  WFSCapabilities,
} from "../types";
import LayerList from "./LayerList";
import ServiceInfo from "./ServiceInfo";
import WFSServiceInfo from "./WFSServiceInfo";
import WFSFeatureTypeList from "./WFSFeatureTypeList";
import WFSCapabilitiesDisplay from "./WFSCapabilitiesDisplay";
import ErrorMessage from "./ErrorMessage";
export default function XMLParser() {
  const [url, setUrl] = useState("");
  const [wfsUrl, setWfsUrl] = useState("");
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceData | null>(null);
  const [wfsServiceInfo, setWfsServiceInfo] = useState<WFSServiceData | null>(
    null,
  );
  const [wfsFeatureTypes, setWfsFeatureTypes] = useState<WFSFeatureTypeData[]>(
    [],
  );
  const [wfsCapabilities, setWfsCapabilities] =
    useState<WFSCapabilities | null>(null);
  const [loading, setLoading] = useState(false);
  const [wfsLoading, setWfsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wfsError, setWfsError] = useState<string | null>(null);
  const [useDetailedView, setUseDetailedView] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. URL:", url);

    const urlError = validateURL(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setLoading(true);
    setError(null);
    setServiceInfo(null);
    setLayers([]);

    try {
      console.log("Fetching URL...");
      const response = await fetch(url);

      if (!response.ok) {
        console.error("Fetch failed:", response.status, response.statusText);
        setError(
          `Failed to fetch document. Server responded with status: ${response.status}`,
        );
        return;
      }

      const xmlText = await response.text();
      console.log("Fetched XML Text:", xmlText);

      const xmlDoc = parseXMLDocument(xmlText);
      const parseError = checkXMLParseError(xmlDoc);
      if (parseError) {
        console.error("XML Parsing Error:", parseError);
        setError(parseError);
        return;
      }

      const serviceException = checkServiceException(xmlDoc);
      if (serviceException) {
        console.error("Service Exception Found:", serviceException);
        setError(serviceException);
        return;
      }

      const service = parseServiceInfo(xmlDoc);
      const parsedLayers = parseLayerData(xmlDoc);

      const validationError = validateServiceResponse(service, parsedLayers);
      if (validationError) {
        console.error("Validation Error:", validationError);
        setError(validationError);
        return;
      }

      console.log("Parsed Service Info:", service);
      console.log("Parsed Layers:", parsedLayers);

      setServiceInfo(service);
      setLayers(parsedLayers);
    } catch (err) {
      console.error("Error during handleSubmit:", err);
      setError("Failed to fetch document. Please check the URL and try again.");
    } finally {
      setLoading(false);
      console.log("Loading complete.");
    }
  };

  const handleWFSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("WFS Form submitted. URL:", wfsUrl);

    const urlError = validateURL(wfsUrl);
    if (urlError) {
      setWfsError(urlError);
      return;
    }

    setWfsLoading(true);
    setWfsError(null);
    setWfsServiceInfo(null);
    setWfsFeatureTypes([]);
    setWfsCapabilities(null);

    try {
      console.log("Fetching WFS URL...");
      const response = await fetch(wfsUrl);

      if (!response.ok) {
        console.error("Fetch failed:", response.status, response.statusText);
        setWfsError(
          `Failed to fetch document. Server responded with status: ${response.status}`,
        );
        return;
      }

      const xmlText = await response.text();
      console.log("Fetched WFS XML Text:", xmlText);

      const xmlDoc = parseXMLDocument(xmlText);
      const parseError = checkXMLParseError(xmlDoc);
      if (parseError) {
        console.error("XML Parsing Error:", parseError);
        setWfsError(parseError);
        return;
      }

      if (!isWFSCapabilitiesDocument(xmlDoc)) {
        setWfsError(
          "This does not appear to be a valid WFS GetCapabilities document",
        );
        return;
      }

      const wfsException = checkWFSException(xmlDoc);
      if (wfsException) {
        console.error("WFS Exception Found:", wfsException);
        setWfsError(wfsException);
        return;
      }

      if (useDetailedView) {
        // Use comprehensive parser
        const capabilities = parseWFSCapabilities(xmlDoc);
        console.log("Parsed WFS Capabilities:", capabilities);

        if (capabilities.featureTypes.length === 0) {
          setWfsError(
            "No feature types found that support both GeoJSON output format and EPSG:4326 coordinate system",
          );
          return;
        }

        setWfsCapabilities(capabilities);
      } else {
        // Use legacy parser for simple view
        const service = parseWFSServiceInfo(xmlDoc);
        const parsedFeatureTypes = parseWFSFeatureTypes(xmlDoc);

        const validationError = validateWFSServiceResponse(
          service,
          parsedFeatureTypes,
        );
        if (validationError) {
          console.error("Validation Error:", validationError);
          setWfsError(validationError);
          return;
        }

        console.log("Parsed WFS Service Info:", service);
        console.log("Parsed WFS Feature Types:", parsedFeatureTypes);

        setWfsServiceInfo(service);
        setWfsFeatureTypes(parsedFeatureTypes);
      }
    } catch (err) {
      console.error("Error during WFS handleSubmit:", err);
      setWfsError(
        "Failed to fetch document. Please check the URL and try again.",
      );
    } finally {
      setWfsLoading(false);
      console.log("WFS Loading complete.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        WMS & WFS Parser
      </h1>

      <div className="space-y-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            WMS GetCapabilities
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="Enter WMS GetCapabilities HTTPS URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Parse WMS
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            WFS GetCapabilities
          </h2>
          <form onSubmit={handleWFSSubmit}>
            <div className="flex gap-2">
              <input
                type="url"
                value={wfsUrl}
                onChange={(e) => {
                  setWfsUrl(e.target.value);
                  setWfsError(null);
                }}
                placeholder="Enter WFS GetCapabilities HTTPS URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                disabled={wfsLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
              >
                {wfsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Parse WFS
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {serviceInfo && <ServiceInfo service={serviceInfo} />}
      <LayerList layers={layers} />

      {wfsError && <ErrorMessage message={wfsError} />}

      {/* WFS Results */}
      {useDetailedView && wfsCapabilities && (
        <WFSCapabilitiesDisplay capabilities={wfsCapabilities} />
      )}

      {!useDetailedView && wfsServiceInfo && (
        <>
          <WFSServiceInfo service={wfsServiceInfo} />
          <WFSFeatureTypeList featureTypes={wfsFeatureTypes} />
        </>
      )}
    </div>
  );
}
