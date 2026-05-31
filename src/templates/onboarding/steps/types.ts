export interface CreatedSummary {
  id: string;
  name: string;
  price: number;
}

export interface Variation {
  label: string;
  description: string;
  price: string;
  inclusions: string;
}

export interface BusinessProfileFormValues {
  businessName: string;
  tagline: string;
  email: string;
  phoneNumber: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
  whatsapp: string;
}

export interface PackageFormValues {
  name: string;
  description: string;
  pkgCatId: string;
  pkgEventCatId: string;
  flatPrice: string;
  pkgInclusions: string;
}
