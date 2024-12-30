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