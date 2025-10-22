import {
  WFSCapabilities,
  WFSServiceInfo,
  WFSProvider,
  WFSOperation,
  WFSOperationMethod,
  WFSOperationParameters,
  WFSFeatureType,
  WFSBoundingBox,
  WFSEndpoints,
  WFSValidation,
  WFSError,
  WFSServiceData,
  WFSFeatureTypeData,
} from "../types";
import { getElementText } from "./xmlUtils";

/**
 * Normalize CRS/SRS identifiers to EPSG:XXXX format
 */
function normalizeCRS(crs: string | undefined): string | undefined {
  if (!crs) return undefined;

  // Handle URN format: urn:ogc:def:crs:EPSG::4326
  const urnMatch = crs.match(/urn:ogc:def:crs:EPSG::(\d+)/);
  if (urnMatch) return `EPSG:${urnMatch[1]}`;

  // Handle URN format without double colon: urn:ogc:def:crs:EPSG:6.0:4326
  const urnMatch2 = crs.match(/urn:ogc:def:crs:EPSG:[^:]+:(\d+)/);
  if (urnMatch2) return `EPSG:${urnMatch2[1]}`;

  // Handle http format: http://www.opengis.net/def/crs/EPSG/0/4326
  const httpMatch = crs.match(/opengis\.net\/def\/crs\/EPSG\/\d+\/(\d+)/);
  if (httpMatch) return `EPSG:${httpMatch[1]}`;

  // Already in EPSG:XXXX format or other format
  return crs;
}

/**
 * Check if a CRS is EPSG:4326
 */
function isEPSG4326(crs: string | undefined): boolean {
  if (!crs) return false;
  const normalized = normalizeCRS(crs);
  return (
    normalized === "EPSG:4326" || crs.includes("4326") || crs.includes("CRS84")
  );
}

/**
 * Check if a CRS is EPSG:3857
 */
function isEPSG3857(crs: string | undefined): boolean {
  if (!crs) return false;
  const normalized = normalizeCRS(crs);
  return normalized === "EPSG:3857" || crs.includes("3857");
}

/**
 * Parse WFS GetCapabilities document to comprehensive WFSCapabilities object
 */
export function parseWFSCapabilities(xmlDoc: Document): WFSCapabilities {
  const errors: WFSError[] = [];

  const service = parseServiceInfo(xmlDoc, errors);
  const provider = parseProviderInfo(xmlDoc);
  const operations = parseOperations(xmlDoc);
  const allFeatureTypes = parseAllFeatureTypes(xmlDoc, operations);
  const endpoints = parseEndpoints(operations);
  const validation = parseValidation(allFeatureTypes);

  // Filter feature types to only those supporting GeoJSON and EPSG:4326
  const filteredFeatureTypes = filterFeatureTypes(allFeatureTypes, operations);

  return {
    service,
    provider,
    operations,
    featureTypes: filteredFeatureTypes,
    endpoints,
    validation,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Parse service identification information
 */
function parseServiceInfo(
  xmlDoc: Document,
  errors: WFSError[],
): WFSServiceInfo {
  const serviceIdentification = xmlDoc.getElementsByTagName(
    "ows:ServiceIdentification",
  )[0];
  const serviceElement = xmlDoc.getElementsByTagName("Service")[0];
  const rootElement = xmlDoc.documentElement;

  // Get versions from root element attribute or version elements
  const versions: string[] = [];
  const versionAttr = rootElement.getAttribute("version");
  if (versionAttr) versions.push(versionAttr);

  // Also look for AcceptVersions or supported versions
  const versionElements = xmlDoc.getElementsByTagName("ows:Value");
  for (const elem of Array.from(versionElements)) {
    const parent = elem.parentElement;
    if (parent && parent.getAttribute("name") === "AcceptVersions") {
      const version = elem.textContent?.trim();
      if (version && !versions.includes(version)) versions.push(version);
    }
  }

  // Get title
  const title = serviceIdentification
    ? getElementText(serviceIdentification, "ows:Title")
    : getElementText(serviceElement, "Title") || "Web Feature Service";

  // Get keywords
  const keywords: string[] = [];
  if (serviceIdentification) {
    const keywordElements =
      serviceIdentification.getElementsByTagName("ows:Keyword");
    for (const keyword of Array.from(keywordElements)) {
      const text = keyword.textContent?.trim();
      if (text) keywords.push(text);
    }
  } else if (serviceElement) {
    const keywordList = serviceElement.getElementsByTagName("KeywordList")[0];
    if (keywordList) {
      const keywordElements = keywordList.getElementsByTagName("Keyword");
      for (const keyword of Array.from(keywordElements)) {
        const text = keyword.textContent?.trim();
        if (text) keywords.push(text);
      }
    }
  }

  return {
    type: "WFS",
    title,
    abstract: serviceIdentification
      ? getElementText(serviceIdentification, "ows:Abstract")
      : getElementText(serviceElement, "Abstract"),
    keywords: keywords.length > 0 ? keywords : undefined,
    versions: versions.length > 0 ? versions : ["2.0.0"],
    fees: serviceIdentification
      ? getElementText(serviceIdentification, "ows:Fees")
      : getElementText(serviceElement, "Fees"),
    accessConstraints: serviceIdentification
      ? getElementText(serviceIdentification, "ows:AccessConstraints")
      : getElementText(serviceElement, "AccessConstraints"),
  };
}

/**
 * Parse provider information
 */
function parseProviderInfo(xmlDoc: Document): WFSProvider {
  const serviceProvider = xmlDoc.getElementsByTagName("ows:ServiceProvider")[0];
  const serviceElement = xmlDoc.getElementsByTagName("Service")[0];

  if (serviceProvider) {
    const serviceContact =
      serviceProvider.getElementsByTagName("ows:ServiceContact")[0];
    const contactInfo =
      serviceContact?.getElementsByTagName("ows:ContactInfo")[0];
    const address = contactInfo?.getElementsByTagName("ows:Address")[0];

    return {
      name:
        getElementText(serviceProvider, "ows:ProviderName") ||
        "Unknown Provider",
      site: serviceProvider
        .getElementsByTagName("ows:ProviderSite")[0]
        ?.getAttribute("xlink:href"),
      contact: serviceContact
        ? {
            individualName: getElementText(
              serviceContact,
              "ows:IndividualName",
            ),
            positionName: getElementText(serviceContact, "ows:PositionName"),
            phone: contactInfo
              ? getElementText(contactInfo, "ows:Voice")
              : undefined,
            email: address
              ? getElementText(address, "ows:ElectronicMailAddress")
              : undefined,
          }
        : undefined,
    };
  }

  // Fall back to WFS 1.x format
  if (serviceElement) {
    const contactInfo =
      serviceElement.getElementsByTagName("ContactInformation")[0];
    const personPrimary = contactInfo?.getElementsByTagName(
      "ContactPersonPrimary",
    )[0];

    return {
      name: personPrimary
        ? getElementText(personPrimary, "ContactOrganization") ||
          "Unknown Provider"
        : "Unknown Provider",
      contact: contactInfo
        ? {
            individualName: personPrimary
              ? getElementText(personPrimary, "ContactPerson")
              : undefined,
            positionName: getElementText(contactInfo, "ContactPosition"),
            phone: getElementText(contactInfo, "ContactVoiceTelephone"),
            email: getElementText(contactInfo, "ContactElectronicMailAddress"),
          }
        : undefined,
    };
  }

  return { name: "Unknown Provider" };
}

/**
 * Parse operations metadata
 */
function parseOperations(xmlDoc: Document): WFSOperation[] {
  const operations: WFSOperation[] = [];

  // WFS 2.x: ows:OperationsMetadata
  const operationsMetadata = xmlDoc.getElementsByTagName(
    "ows:OperationsMetadata",
  )[0];
  if (operationsMetadata) {
    const operationElements =
      operationsMetadata.getElementsByTagName("ows:Operation");
    for (const opElement of Array.from(operationElements)) {
      const name = opElement.getAttribute("name");
      if (!name) continue;

      const methods: WFSOperationMethod[] = [];
      const dcpElements = opElement.getElementsByTagName("ows:DCP");

      for (const dcp of Array.from(dcpElements)) {
        const http = dcp.getElementsByTagName("ows:HTTP")[0];
        if (!http) continue;

        // GET methods
        const getElements = http.getElementsByTagName("ows:Get");
        for (const get of Array.from(getElements)) {
          const href = get.getAttribute("xlink:href");
          if (href) {
            methods.push({ type: "GET", url: href });
          }
        }

        // POST methods
        const postElements = http.getElementsByTagName("ows:Post");
        for (const post of Array.from(postElements)) {
          const href = post.getAttribute("xlink:href");
          if (href) {
            methods.push({ type: "POST", url: href });
          }
        }
      }

      // Parse parameters
      const parameters = parseOperationParameters(opElement);

      operations.push({
        name,
        methods,
        parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      });
    }
  }

  // WFS 1.x: Capability/Request
  const capability = xmlDoc.getElementsByTagName("Capability")[0];
  if (capability && operations.length === 0) {
    const request = capability.getElementsByTagName("Request")[0];
    if (request) {
      for (const opElement of Array.from(request.children)) {
        const name = opElement.tagName;
        const methods: WFSOperationMethod[] = [];

        const dcpType = opElement.getElementsByTagName("DCPType")[0];
        if (dcpType) {
          const http = dcpType.getElementsByTagName("HTTP")[0];
          if (http) {
            // GET
            const getElem = http.getElementsByTagName("Get")[0];
            if (getElem) {
              const onlineResource =
                getElem.getElementsByTagName("OnlineResource")[0];
              const href = onlineResource?.getAttribute("xlink:href");
              if (href) methods.push({ type: "GET", url: href });
            }

            // POST
            const postElem = http.getElementsByTagName("Post")[0];
            if (postElem) {
              const onlineResource =
                postElem.getElementsByTagName("OnlineResource")[0];
              const href = onlineResource?.getAttribute("xlink:href");
              if (href) methods.push({ type: "POST", url: href });
            }
          }
        }

        if (methods.length > 0) {
          operations.push({ name, methods });
        }
      }
    }
  }

  return operations;
}

/**
 * Parse operation parameters
 */
function parseOperationParameters(opElement: Element): WFSOperationParameters {
  const parameters: WFSOperationParameters = {};

  const paramElements = opElement.getElementsByTagName("ows:Parameter");
  for (const param of Array.from(paramElements)) {
    const name = param.getAttribute("name");
    if (!name) continue;

    const values: string[] = [];
    const valueElements = param.getElementsByTagName("ows:Value");
    for (const value of Array.from(valueElements)) {
      const text = value.textContent?.trim();
      if (text) values.push(text);
    }

    if (values.length > 0) {
      // Map common parameter names
      if (name === "outputFormat") {
        parameters.outputFormats = values;
      } else if (name === "resultType") {
        parameters.resultType = values;
      } else if (name === "srsName") {
        parameters.srsNames = values;
      } else {
        parameters[name] = values;
      }
    }
  }

  // Check for count/hits support
  const constraints = opElement.getElementsByTagName("ows:Constraint");
  for (const constraint of Array.from(constraints)) {
    const name = constraint.getAttribute("name");
    if (name === "CountDefault" || name === "ImplementsResultPaging") {
      parameters.countSupported = true;
    }
  }

  return parameters;
}

/**
 * Parse all feature types (before filtering)
 */
function parseAllFeatureTypes(
  xmlDoc: Document,
  operations: WFSOperation[],
): WFSFeatureType[] {
  const featureTypes: WFSFeatureType[] = [];

  // Get global output formats from GetFeature operation
  const getFeatureOp = operations.find((op) => op.name === "GetFeature");
  const globalOutputFormats = getFeatureOp?.parameters?.outputFormats || [];

  // Try both FeatureType (WFS 1.x) and wfs:FeatureType (WFS 2.x)
  const featureTypeElements = [
    ...Array.from(xmlDoc.getElementsByTagName("FeatureType")),
    ...Array.from(xmlDoc.getElementsByTagName("wfs:FeatureType")),
  ];

  for (const ftElement of featureTypeElements) {
    const name =
      getElementText(ftElement, "Name") ||
      getElementText(ftElement, "wfs:Name");
    const title =
      getElementText(ftElement, "Title") ||
      getElementText(ftElement, "wfs:Title");

    if (!name) continue;

    // Parse CRS/SRS
    const defaultCRS =
      getElementText(ftElement, "DefaultCRS") ||
      getElementText(ftElement, "wfs:DefaultCRS") ||
      getElementText(ftElement, "DefaultSRS") ||
      getElementText(ftElement, "SRS");

    if (!defaultCRS) continue;

    const normalizedDefaultCRS = normalizeCRS(defaultCRS) || defaultCRS;

    const otherCRS: string[] = [];
    const otherCRSElements = [
      ...Array.from(ftElement.getElementsByTagName("OtherCRS")),
      ...Array.from(ftElement.getElementsByTagName("wfs:OtherCRS")),
      ...Array.from(ftElement.getElementsByTagName("OtherSRS")),
    ];

    for (const elem of otherCRSElements) {
      const crs = elem.textContent?.trim();
      if (crs) {
        const normalized = normalizeCRS(crs) || crs;
        otherCRS.push(normalized);
      }
    }

    // Parse bounding box
    const wgs84BoundingBox = parseBoundingBox(ftElement);

    // Parse metadata URL
    const metadataURL = parseMetadataURL(ftElement);

    // Parse output formats (use global if not specified per feature type)
    const outputFormats =
      parseFeatureTypeOutputFormats(ftElement) || globalOutputFormats;

    // Parse schema info
    const schema = parseSchemaInfo(ftElement);

    featureTypes.push({
      name,
      title: title || name,
      abstract:
        getElementText(ftElement, "Abstract") ||
        getElementText(ftElement, "wfs:Abstract"),
      defaultCRS: normalizedDefaultCRS,
      otherCRS: otherCRS.length > 0 ? otherCRS : undefined,
      wgs84BoundingBox,
      metadataURL,
      outputFormats: outputFormats.length > 0 ? outputFormats : undefined,
      schema,
    });
  }

  return featureTypes;
}

/**
 * Parse WGS84 bounding box
 */
function parseBoundingBox(ftElement: Element): WFSBoundingBox | undefined {
  const bboxElement =
    ftElement.getElementsByTagName("ows:WGS84BoundingBox")[0] ||
    ftElement.getElementsByTagName("WGS84BoundingBox")[0] ||
    ftElement.getElementsByTagName("LatLongBoundingBox")[0];

  if (!bboxElement) return undefined;

  // OWS format (WFS 2.x)
  const lowerCornerText = getElementText(bboxElement, "ows:LowerCorner");
  const upperCornerText = getElementText(bboxElement, "ows:UpperCorner");

  if (lowerCornerText && upperCornerText) {
    const lower = lowerCornerText.split(/\s+/).map(Number);
    const upper = upperCornerText.split(/\s+/).map(Number);

    if (lower.length >= 2 && upper.length >= 2) {
      return {
        lowerCorner: [lower[0], lower[1]],
        upperCorner: [upper[0], upper[1]],
      };
    }
  }

  // WFS 1.x format (attributes)
  const minx = bboxElement.getAttribute("minx");
  const miny = bboxElement.getAttribute("miny");
  const maxx = bboxElement.getAttribute("maxx");
  const maxy = bboxElement.getAttribute("maxy");

  if (minx && miny && maxx && maxy) {
    return {
      lowerCorner: [parseFloat(minx), parseFloat(miny)],
      upperCorner: [parseFloat(maxx), parseFloat(maxy)],
    };
  }

  return undefined;
}

/**
 * Parse metadata URL
 */
function parseMetadataURL(ftElement: Element): string | undefined {
  const metadataElements = [
    ...Array.from(ftElement.getElementsByTagName("MetadataURL")),
    ...Array.from(ftElement.getElementsByTagName("ows:Metadata")),
  ];

  for (const elem of metadataElements) {
    const href = elem.getAttribute("xlink:href");
    if (href) return href;

    const onlineResource = elem.getElementsByTagName("OnlineResource")[0];
    if (onlineResource) {
      const href = onlineResource.getAttribute("xlink:href");
      if (href) return href;
    }
  }

  return undefined;
}

/**
 * Parse feature type specific output formats
 */
function parseFeatureTypeOutputFormats(ftElement: Element): string[] {
  const formats: string[] = [];

  const outputFormatsElement =
    ftElement.getElementsByTagName("OutputFormats")[0];
  if (outputFormatsElement) {
    const formatElements = outputFormatsElement.getElementsByTagName("Format");
    for (const format of Array.from(formatElements)) {
      const text = format.textContent?.trim();
      if (text) formats.push(text);
    }
  }

  return formats;
}

/**
 * Parse schema information
 */
function parseSchemaInfo(
  ftElement: Element,
): { namespaceURI?: string; elementName?: string } | undefined {
  const name =
    getElementText(ftElement, "Name") || getElementText(ftElement, "wfs:Name");
  if (!name) return undefined;

  // Extract namespace and element name from qualified name
  const parts = name.split(":");
  if (parts.length === 2) {
    return {
      elementName: parts[1],
      namespaceURI: undefined, // Would need to look up from XML namespaces
    };
  }

  return {
    elementName: name,
  };
}

/**
 * Parse endpoints from operations
 */
function parseEndpoints(operations: WFSOperation[]): WFSEndpoints {
  const endpoints: WFSEndpoints = {};

  // Find base URL from any operation
  const anyOp = operations.find((op) => op.methods.length > 0);
  if (anyOp && anyOp.methods[0]) {
    const url = anyOp.methods[0].url;
    // Remove query parameters to get base
    endpoints.base = url.split("?")[0];
  }

  // GetFeature endpoint
  const getFeatureOp = operations.find((op) => op.name === "GetFeature");
  if (getFeatureOp && getFeatureOp.methods[0]) {
    endpoints.getFeature = getFeatureOp.methods[0].url;
  }

  // DescribeFeatureType endpoint
  const describeOp = operations.find((op) => op.name === "DescribeFeatureType");
  if (describeOp && describeOp.methods[0]) {
    endpoints.describeFeatureType = describeOp.methods[0].url;
  }

  return endpoints;
}

/**
 * Parse validation flags
 */
function parseValidation(featureTypes: WFSFeatureType[]): WFSValidation {
  const allCRS = new Set<string>();

  for (const ft of featureTypes) {
    allCRS.add(ft.defaultCRS);
    if (ft.otherCRS) {
      ft.otherCRS.forEach((crs) => allCRS.add(crs));
    }
  }

  let supportsEPSG4326 = false;
  let supportsEPSG3857 = false;

  for (const crs of allCRS) {
    if (isEPSG4326(crs)) supportsEPSG4326 = true;
    if (isEPSG3857(crs)) supportsEPSG3857 = true;
  }

  return {
    supportsEPSG4326,
    supportsEPSG3857,
  };
}

/**
 * Filter feature types to only those supporting GeoJSON and EPSG:4326
 */
function filterFeatureTypes(
  featureTypes: WFSFeatureType[],
  operations: WFSOperation[],
): WFSFeatureType[] {
  // Get output formats from GetFeature operation
  const getFeatureOp = operations.find((op) => op.name === "GetFeature");
  const globalOutputFormats = getFeatureOp?.parameters?.outputFormats || [];

  // Check if GeoJSON is supported globally
  const supportsGeoJSONGlobally = globalOutputFormats.some(
    (format) =>
      format.toLowerCase().includes("geojson") ||
      format.toLowerCase().includes("json") ||
      format === "application/json",
  );

  return featureTypes.filter((ft) => {
    // Check EPSG:4326 support
    const allCRS = [ft.defaultCRS, ...(ft.otherCRS || [])];
    const supportsEPSG4326 = allCRS.some((crs) => isEPSG4326(crs));

    if (!supportsEPSG4326) return false;

    // Check GeoJSON support (either globally or per feature type)
    const outputFormats = ft.outputFormats || globalOutputFormats;
    const supportsGeoJSON = outputFormats.some(
      (format) =>
        format.toLowerCase().includes("geojson") ||
        format.toLowerCase().includes("json") ||
        format === "application/json",
    );

    return supportsGeoJSON;
  });
}

// Legacy compatibility functions for existing UI components
export function parseWFSServiceInfo(xmlDoc: Document): WFSServiceData | null {
  const capabilities = parseWFSCapabilities(xmlDoc);

  return {
    name: capabilities.service.type,
    title: capabilities.service.title,
    abstract: capabilities.service.abstract,
    keywords: capabilities.service.keywords,
    contact: capabilities.provider.contact
      ? {
          person: capabilities.provider.contact.individualName,
          organization: capabilities.provider.name,
          position: capabilities.provider.contact.positionName,
          phone: capabilities.provider.contact.phone,
          email: capabilities.provider.contact.email,
          address: undefined,
        }
      : undefined,
    fees: capabilities.service.fees,
    accessConstraints: capabilities.service.accessConstraints,
    providerName: capabilities.provider.name,
    providerSite: capabilities.provider.site,
  };
}

export function parseWFSFeatureTypes(xmlDoc: Document): WFSFeatureTypeData[] {
  const capabilities = parseWFSCapabilities(xmlDoc);

  return capabilities.featureTypes.map((ft) => {
    const allCRS = [ft.defaultCRS, ...(ft.otherCRS || [])];
    const outputFormats = ft.outputFormats || [];

    return {
      name: ft.name,
      title: ft.title,
      abstract: ft.abstract,
      keywords: undefined,
      defaultSRS: ft.defaultCRS,
      otherSRS: ft.otherCRS,
      outputFormats,
      supportsGeoJSON: outputFormats.some(
        (format) =>
          format.toLowerCase().includes("geojson") ||
          format.toLowerCase().includes("json") ||
          format === "application/json",
      ),
      supportsEPSG4326: allCRS.some((crs) => isEPSG4326(crs)),
    };
  });
}
