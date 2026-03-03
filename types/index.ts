import { Id, TableNames } from 'convex/_generated/dataModel';

export interface ConvexBaseModel<T extends TableNames> {
  _id: Id<T>;
  _creationTime: string;
}

export interface ScanItem {
  id: string;
  imageUri: string;
  name: string;
  price: number;
  date: string;
  confidence?: string;
}

export interface SearchResultItem {
  id: string;
  name: string;
  estimatedPrice: number;
  imageUri?: string | null;
}

export interface ScanSection {
  title: string;
  data: ScanItem[];
}

export interface ExchangeRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

export interface ExchangeRateStoredRecord {
  exchangeRateResponse: ExchangeRateResponse;
  expiresAt: number;
}

export interface ReverseGeocodeResult {
  place_id: string;
  licence: string;
  lat: string;
  lon: string;
  display_name: string;
  osm_id: string;
  osm_type: string;
  address?: {
    road?: string;
    bar?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    village?: string;
    city?: string;
    state_district?: string;
    suburb?: string;
  };
  boundingbox: string[];
}

export interface LocationData {
  result: ReverseGeocodeResult;
  latitude: number;
  longitude: number;
  savedAt: number;
}

export interface Plan extends ConvexBaseModel<'plans'> {
  planTitle: string;
  slug: string;
  price: number;
  requestAllocations: number;
}

export interface Subscription extends ConvexBaseModel<'subscription'> {
  referenceId: string;
  planId: Id<'plans'>;
  userId: Id<'users'>;
  expiresAt: number;
}
