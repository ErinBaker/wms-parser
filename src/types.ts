export interface StyleData {
  name: string;
  title?: string;
  legendUrl?: string;
}

export interface LayerData {
  name: string;
  title?: string;
  abstract?: string;
  styles: StyleData[];
  onlineResource?: string;
}

export interface ServiceData {
  name: string;
  title: string;
  abstract?: string;
  keywords?: string[];
  contact?: {
    person?: string;
    organization?: string;
    position?: string;
    address?: {
      type?: string;
      street?: string;
      city?: string;
      state?: string;
      postCode?: string;
      country?: string;
    };
    phone?: string;
    fax?: string;
    email?: string;
  };
  fees?: string;
  accessConstraints?: string;
}

export interface WFSFeatureTypeData {
  name: string;
  title?: string;
  abstract?: string;
  keywords?: string[];
  defaultSRS?: string;
  otherSRS?: string[];
  outputFormats?: string[];
  supportsGeoJSON: boolean;
  supportsEPSG4326: boolean;
}

export interface WFSServiceData {
  name: string;
  title: string;
  abstract?: string;
  keywords?: string[];
  contact?: {
    person?: string;
    organization?: string;
    position?: string;
    address?: {
      type?: string;
      street?: string;
      city?: string;
      state?: string;
      postCode?: string;
      country?: string;
    };
    phone?: string;
    fax?: string;
    email?: string;
  };
  fees?: string;
  accessConstraints?: string;
  providerName?: string;
  providerSite?: string;
}

// Comprehensive WFS GetCapabilities types matching JSON schema
export interface WFSBoundingBox {
  lowerCorner: [number, number];
  upperCorner: [number, number];
}

export interface WFSFeatureTypeSchema {
  namespaceURI?: string;
  elementName?: string;
}

export interface WFSFeatureType {
  name: string;
  title: string;
  abstract?: string;
  defaultCRS: string;
  otherCRS?: string[];
  wgs84BoundingBox?: WFSBoundingBox;
  metadataURL?: string;
  outputFormats?: string[];
  schema?: WFSFeatureTypeSchema;
}

export interface WFSOperationMethod {
  type: "GET" | "POST";
  url: string;
}

export interface WFSOperationParameters {
  outputFormats?: string[];
  resultType?: string[];
  srsNames?: string[];
  countSupported?: boolean;
  [key: string]: string[] | boolean | undefined;
}

export interface WFSOperation {
  name: string;
  methods: WFSOperationMethod[];
  parameters?: WFSOperationParameters;
}

export interface WFSServiceInfo {
  type: "WFS";
  title: string;
  abstract?: string;
  keywords?: string[];
  versions: string[];
  fees?: string;
  accessConstraints?: string;
}

export interface WFSProvider {
  name: string;
  site?: string;
  contact?: {
    individualName?: string;
    positionName?: string;
    phone?: string;
    email?: string;
  };
}

export interface WFSEndpoints {
  base?: string;
  getFeature?: string;
  describeFeatureType?: string;
}

export interface WFSValidation {
  supportsEPSG3857?: boolean;
  supportsEPSG4326?: boolean;
}

export interface WFSError {
  code: string;
  message: string;
  hint?: string;
}

export interface WFSCapabilities {
  service: WFSServiceInfo;
  provider: WFSProvider;
  operations: WFSOperation[];
  featureTypes: WFSFeatureType[];
  endpoints?: WFSEndpoints;
  validation?: WFSValidation;
  errors?: WFSError[];
}
