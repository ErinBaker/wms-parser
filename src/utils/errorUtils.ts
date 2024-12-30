import { parseXMLDocument } from './xmlUtils';

export async function parseErrorResponse(response: Response): Promise<string> {
  if (!response.ok) {
    return `HTTP Error: ${response.status} - ${response.statusText}`;
  }
  return '';
}

export function validateServiceResponse(service: any, layers: any[]): string | null {
  if (!service) {
    return 'No service information found in the XML document';
  }
  
  if (layers.length === 0) {
    return 'No layers with EPSG:3857 projection found';
  }
  
  return null;
}

export function checkServiceException(xmlDoc: Document): string | null {
  const serviceException = xmlDoc.getElementsByTagName('ServiceException')[0];
  if (serviceException) {
    const code = serviceException.getAttribute('code');
    const message = serviceException.textContent?.trim();
    return `Service Exception${code ? ` (${code})` : ''}: ${message}`;
  }
  return null;
}