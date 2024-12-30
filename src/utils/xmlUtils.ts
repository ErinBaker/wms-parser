export function hasEPSG3857CRS(element: Element): boolean {
  // Check current element's CRS
  const crsElements = element.getElementsByTagName('CRS');
  const hasDirectCRS = Array.from(crsElements).some(
    (crs) => crs.textContent === 'EPSG:3857'
  );
  
  if (hasDirectCRS) return true;
  
  // Check parent Layer elements
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'Layer') {
      const parentCRS = parent.getElementsByTagName('CRS');
      if (Array.from(parentCRS).some((crs) => crs.textContent === 'EPSG:3857')) {
        return true;
      }
    }
    parent = parent.parentElement;
  }
  
  return false;
}

export function getElementText(parent: Element, tagName: string): string {
  const element = parent.getElementsByTagName(tagName)[0];
  return element ? element.textContent?.trim() || '' : '';
}

export function parseOnlineResource(layerElement: Element): string | undefined {
  const dcpTypeElement = layerElement.getElementsByTagName('DCPType')[0];
  if (!dcpTypeElement) return undefined;

  const onlineResourceElement = dcpTypeElement.getElementsByTagName('OnlineResource')[0];
  if (!onlineResourceElement) return undefined;

  return onlineResourceElement.getAttribute('xlink:href') || undefined;
}

export function parseXMLDocument(xmlText: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlText, 'text/xml');
}

export function checkXMLParseError(xmlDoc: Document): string | null {
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  return parseError ? parseError.textContent || 'Invalid XML document' : null;
}