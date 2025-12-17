// Type definitions for the Globassets API

export type PropertyType = 'HouseForRent' | 'HouseForSale' | 'Flatshare' | 'Land' | 'Shop';
export type ListerRole = 'landlord' | 'realtor' | null;
export type AccountRole = 'personal' | 'company';

export interface PropertyImage {
  id: string;
  key?: string;
  url?: string;
  presigned_url?: string;
  view_image_url?: string;
  is_cover: boolean;
  property_obj: string;
}

export interface OwnerInfo {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  role: AccountRole;
}

export interface State {
  id: string;
  name: string;
  capital_name?: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
}

export interface RoomType {
  id: string;
  name: string;
}

export interface PropertyFeature {
  id: string;
  name: string;
  code?: string;
}

export interface BaseProperty {
  id: string;
  name?: string;
  address: string;
  phone?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  state: State;
  region: Region;
  images: PropertyImage[];
  owner: OwnerInfo;
  is_verified: boolean;
  lister_role: ListerRole;
  created_at: string;
  updated_at: string;
}

export interface HouseForRent extends BaseProperty {
  property_type: 'HouseForRent';
  room_type: RoomType;
  features: PropertyFeature[];
  initial_rent?: string;
  rent: string;
  rent_breakdown?: string;
}

export interface HouseForSale extends BaseProperty {
  property_type: 'HouseForSale';
  room_type: RoomType;
  features: PropertyFeature[];
  price: string;
}

export interface Flatshare extends BaseProperty {
  property_type: 'Flatshare';
  room_type: RoomType;
  features: PropertyFeature[];
  rent: string;
  shared_rent: string;
  conditions?: string;
  social_media_handle?: string;
}

export interface Land extends BaseProperty {
  property_type: 'Land';
  price: string;
}

export interface Shop extends BaseProperty {
  property_type: 'Shop';
  rent: string;
}

export type Property = HouseForRent | HouseForSale | Flatshare | Land | Shop;

export interface DashboardStats {
  total_properties: number;
  active_listings: number;
  verified_properties: number;
  pending_verification: number;
  total_views?: number;
  properties_by_type: {
    houses_for_rent: number;
    houses_for_sale: number;
    lands: number;
    flatshares: number;
    shops: number;
  };
}

export interface DashboardData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name?: string;
    role: AccountRole;
  };
  stats: DashboardStats;
  recent_properties: Property[];
  quick_actions: {
    can_upload: boolean;
    allowed_property_types: string[];
  };
}

export interface PropertyFormData {
  property_type: PropertyType;
  lister_role?: ListerRole;
  name?: string;
  address: string;
  state_id: string;
  region_id: string;
  room_type_id?: string;
  feature_ids?: string[];
  price?: string;
  rent?: string;
  initial_rent?: string;
  shared_rent?: string;
  size?: string;
  rent_breakdown?: string;
  conditions?: string;
  social_media_handle?: string;
}

export interface PersonalProfile {
  id: string;
  created_at: string;
  updated_at: string;
  gender?: string;
  bio?: string;
  address?: string;
  date_of_birth?: string;
  picture_key?: string;
  view_image_url?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  user: string;
  state?: string;
}

export interface CompanyProfile {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  description?: string;
  website?: string;
  address?: string;
  logo_key?: string;
  view_image_url?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  user: string;
}

export interface PersonalProfileFormData {
  gender?: string;
  bio?: string;
  address?: string;
  date_of_birth?: string;
  picture_key?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  state?: string;
}

export interface CompanyProfileFormData {
  company_name: string;
  description?: string;
  website?: string;
  address?: string;
  logo_key?: string;
  facebook_url?: string;
  x_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
}
