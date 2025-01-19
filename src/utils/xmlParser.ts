import { LayerData, ServiceData } from '../types';
import { parseStyles } from './styleParser';
import { hasEPSG3857CRS, getElementText, parseOnlineResource } from './xmlUtils';

export function parseServiceInfo(xmlDoc: Document): ServiceData | null {
  const serviceElement = xmlDoc.getElementsByTagName('Service')[0];
  if (!serviceElement) return null;

  const contact = parseContactInfo(serviceElement);

  return {
    name: getElementText(serviceElement, 'Name'),
    title: getElementText(serviceElement, 'Title'),
    abstract: getElementText(serviceElement, 'Abstract'),
    keywords: parseKeywords(serviceElement),
    contact,
    fees: getElementText(serviceElement, 'Fees'),
    accessConstraints: getElementText(serviceElement, 'AccessConstraints'),
  };
}

function parseKeywords(serviceElement: Element): string[] {
  const keywordList = serviceElement.getElementsByTagName('KeywordList')[0];
  if (!keywordList) return [];

  return Array.from(keywordList.getElementsByTagName('Keyword'))
    .map(keyword => keyword.textContent || '')
    .filter(keyword => keyword !== '');
}

function parseContactInfo(serviceElement: Element): ServiceData['contact'] | undefined {
  const contactInfo = serviceElement.getElementsByTagName('ContactInformation')[0];
  if (!contactInfo) return undefined;

  const personPrimary = contactInfo.getElementsByTagName('ContactPersonPrimary')[0];
  const address = contactInfo.getElementsByTagName('ContactAddress')[0];

  return {
    person: personPrimary ? getElementText(personPrimary, 'ContactPerson') : undefined,
    organization: personPrimary ? getElementText(personPrimary, 'ContactOrganization') : undefined,
    position: getElementText(contactInfo, 'ContactPosition'),
    address: address ? {
      type: getElementText(address, 'AddressType'),
      street: getElementText(address, 'Address'),
      city: getElementText(address, 'City'),
      state: getElementText(address, 'StateOrProvince'),
      postCode: getElementText(address, 'PostCode'),
      country: getElementText(address, 'Country'),
    } : undefined,
    phone: getElementText(contactInfo, 'ContactVoiceTelephone'),
    fax: getElementText(contactInfo, 'ContactFacsimileTelephone'),
    email: getElementText(contactInfo, 'ContactElectronicMailAddress'),
  };
}

export function parseLayerData(xmlDoc: Document): LayerData[] {
  const layers: LayerData[] = [];
  const layerElements = xmlDoc.getElementsByTagName('Layer');

  for (const layerElement of Array.from(layerElements)) {
    if (hasEPSG3857CRS(layerElement)) {
      const name = getElementText(layerElement, 'Name');
      if (name) {
        const layer: LayerData = {
          name,
          title: getElementText(layerElement, 'Title'),
          abstract: getElementText(layerElement, 'Abstract'),
          styles: parseStyles(layerElement),
          onlineResource: parseOnlineResource(layerElement),
        };
        layers.push(layer);
      }
    }
  }

  return layers;  
}