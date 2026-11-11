/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SubMillimeterDimensions {
  cheekboneWidth: string;
  jawlineWidth: string;
  faceLength: string;
  bridgeWidth: string;
}

export interface RecommendationProduct {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  priceAr: string;
  matchingExplanation: string;
  matchingExplanationAr: string;
  frameSvgType: "minimal-geometric" | "bold-rectangular" | "classic-aviator" | "editorial-round";
}

export interface BiometricAnalysisResult {
  interpupillaryDistance: number;
  faceShape: string;
  faceShapeAr: string;
  symmetry: number;
  pantoscopicAngle: number;
  surfaceArea: number;
  skinTone: string;
  skinToneAr: string;
  colorPalette: string;
  colorPaletteAr: string;
  styleProfile: string;
  styleProfileAr: string;
  clinicalAnalysis: string;
  subMillimeterDimensions: SubMillimeterDimensions;
  recommendations: RecommendationProduct[];
}

export interface LensUpgrades {
  highIndex: boolean; // 1.67 or 1.74
  blueLightCut: boolean;
  hydrophobicAntiGlare: boolean;
  photochromicTransitions: boolean;
}

export type LensTypeOption = "single_vision" | "progressive" | "reading" | "plano";
export type LensIndexOption = "standard_150" | "thin_160" | "ultrathin_167" | "featherweight_174";

export interface OrderBumpItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  priceUsd: number;
  priceSar: number;
  originalPriceUsd: number;
  originalPriceSar: number;
  icon: string;
}

export interface CheckoutCustomerData {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
  shippingSpeed: "express" | "vip_white_glove";
  paymentMethod: "card" | "apple_pay" | "tabby_installments" | "cod" | "mada";
  notes?: string;
}

export interface StoreLocation {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  hoursEn: string;
  hoursAr: string;
  mapUrl: string;
}

export interface InStoreReservationCustomer {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes?: string;
}

export interface InStoreReservation {
  reservationId: string;
  voucherCode: string;
  discountPercent: number;
  discountType: "percentage" | "fixed";
  createdAt: string;
  preferredDate: string;
  preferredTimeSlot: string;
  store: StoreLocation;
  customer: InStoreReservationCustomer;
  frame: {
    id: number | string;
    name: string;
    brand: string;
    priceUsd: number;
    priceSar: number;
    imageUrl?: string;
    shapeCategory?: string;
  };
  lensPreference: {
    type: LensTypeOption;
    index: LensIndexOption;
    interestedUpgrades: LensUpgrades;
    includeFreeEyeExam: boolean;
    includeCustomFitting: boolean;
  };
  prescription: {
    odSph: string;
    odCyl: string;
    odAxis: string;
    osSph: string;
    osCyl: string;
    osAxis: string;
    pd: string;
  };
  biometricSummary?: {
    faceShape: string;
    faceShapeAr: string;
    ipd: number;
    symmetry: number;
  };
  estimatedFrameTotalUsd: number;
  estimatedFrameTotalSar: number;
  discountSavingsUsd: number;
  discountSavingsSar: number;
  finalEstimatedTotalUsd: number;
  finalEstimatedTotalSar: number;
}

export interface ShopOwnerPromotionConfig {
  discountPercent: number; // e.g. 10%
  promoCode: string;
  shopNameEn: string;
  shopNameAr: string;
  bonusGiftEn: string;
  bonusGiftAr: string;
  voucherValidityDays: number;
}

export interface PlacedOrderSummary {

  orderId: string;
  orderDate: string;
  customer: CheckoutCustomerData;
  frame: {
    id: number | string;
    name: string;
    brand: string;
    priceUsd: number;
    priceSar: number;
    imageUrl?: string;
  };
  lensType: LensTypeOption;
  lensIndex: LensIndexOption;
  lensUpgrades: LensUpgrades;
  prescription: {
    odSph: string;
    odCyl: string;
    odAxis: string;
    osSph: string;
    osCyl: string;
    osAxis: string;
    pd: string;
  };
  selectedBumps: OrderBumpItem[];
  subtotalUsd: number;
  subtotalSar: number;
  discountUsd: number;
  discountSar: number;
  shippingUsd: number;
  shippingSar: number;
  totalUsd: number;
  totalSar: number;
  couponCodeApplied: string | null;
  biometricSummary?: {
    faceShape: string;
    faceShapeAr: string;
    ipd: number;
    symmetry: number;
  };
}

