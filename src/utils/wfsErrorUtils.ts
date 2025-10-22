export function validateWFSServiceResponse(service: any, featureTypes: any[]): string | null {
  if (!service) {
    return 'No service information found in the WFS GetCapabilities document';
  }

  if (featureTypes.length === 0) {
    return 'No feature types found that support both GeoJSON output format and EPSG:4326 coordinate system';
  }

  return null;
}

export function checkWFSException(xmlDoc: Document): string | null {
  // Check for OWS Exception (WFS 2.x)
  const owsException = xmlDoc.getElementsByTagName('ows:Exception')[0];
  if (owsException) {
    const code = owsException.getAttribute('exceptionCode');
    const text = owsException.getElementsByTagName('ows:ExceptionText')[0]?.textContent?.trim();
    return `WFS Exception${code ? ` (${code})` : ''}: ${text || 'Unknown error'}`;
  }

  // Check for ServiceException (WFS 1.x)
  const serviceException = xmlDoc.getElementsByTagName('ServiceException')[0];
  if (serviceException) {
    const code = serviceException.getAttribute('code');
    const message = serviceException.textContent?.trim();
    return `WFS Service Exception${code ? ` (${code})` : ''}: ${message || 'Unknown error'}`;
  }

  // Check for ExceptionReport
  const exceptionReport = xmlDoc.getElementsByTagName('ExceptionReport')[0] ||
                         xmlDoc.getElementsByTagName('ows:ExceptionReport')[0];
  if (exceptionReport) {
    const exceptions = exceptionReport.getElementsByTagName('Exception') ||
                      exceptionReport.getElementsByTagName('ows:Exception');
    if (exceptions.length > 0) {
      const firstException = exceptions[0];
      const code = firstException.getAttribute('exceptionCode');
      const textElements = firstException.getElementsByTagName('ExceptionText') ||
                          firstException.getElementsByTagName('ows:ExceptionText');
      const text = textElements.length > 0 ? textElements[0].textContent?.trim() : undefined;
      return `WFS Exception${code ? ` (${code})` : ''}: ${text || 'Unknown error'}`;
    }
  }

  return null;
}

export function isWFSCapabilitiesDocument(xmlDoc: Document): boolean {
  // Check for WFS_Capabilities root element
  const wfsCapabilities = xmlDoc.getElementsByTagName('WFS_Capabilities')[0] ||
                         xmlDoc.getElementsByTagName('wfs:WFS_Capabilities')[0];

  return !!wfsCapabilities;
}
