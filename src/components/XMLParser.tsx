import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { parseLayerData, parseServiceInfo } from '../utils/xmlParser';
import { parseErrorResponse, validateServiceResponse, checkServiceException } from '../utils/errorUtils';
import { parseXMLDocument, checkXMLParseError } from '../utils/xmlUtils';
import { validateURL } from '../utils/urlUtils';
import { LayerData, ServiceData } from '../types';
import LayerList from './LayerList';
import ServiceInfo from './ServiceInfo';
import ErrorMessage from './ErrorMessage';

export default function XMLParser() {
  const [url, setUrl] = useState('');
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted. URL:', url);

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
    console.log('Fetching URL...');
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      setError(`Failed to fetch document. Server responded with status: ${response.status}`);
      return;
    }

    const xmlText = await response.text();
    console.log('Fetched XML Text:', xmlText);

    const xmlDoc = parseXMLDocument(xmlText);
    const parseError = checkXMLParseError(xmlDoc);
    if (parseError) {
      console.error('XML Parsing Error:', parseError);
      setError(parseError);
      return;
    }

    const serviceException = checkServiceException(xmlDoc);
    if (serviceException) {
      console.error('Service Exception Found:', serviceException);
      setError(serviceException);
      return;
    }

    const service = parseServiceInfo(xmlDoc);
    const parsedLayers = parseLayerData(xmlDoc);

    const validationError = validateServiceResponse(service, parsedLayers);
    if (validationError) {
      console.error('Validation Error:', validationError);
      setError(validationError);
      return;
    }

    console.log('Parsed Service Info:', service);
    console.log('Parsed Layers:', parsedLayers);

    setServiceInfo(service);
    setLayers(parsedLayers);
  } catch (err) {
    console.error('Error during handleSubmit:', err);
    setError('Failed to fetch document. Please check the URL and try again.');
  } finally {
    setLoading(false);
    console.log('Loading complete.');
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">WMS Layer Parser</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="Enter HTTPS URL"
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
                Parse XML
              </>
            )}
          </button>
        </div>
      </form>

      {error && <ErrorMessage message={error} />}
      {serviceInfo && <ServiceInfo service={serviceInfo} />}
      <LayerList layers={layers} />
    </div>
  );
}