// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
  language: 'id' | 'en';
}

// Template types
export type TemplateCategory = 'wedding' | 'greeting' | 'gift';
export type PriceTier = 'basic' | 'premium' | 'exclusive';

export interface TemplateColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TemplateField {
  id: string;
  type: 'text' | 'textarea' | 'photo' | 'audio' | 'color' | 'font' | 'date' | 'select';
  label: { id: string; en: string };
  placeholder?: { id: string; en: string };
  required: boolean;
  maxLength?: number;
  options?: { value: string; label: { id: string; en: string } }[];
}

export interface Template {
  id: string;
  name: { id: string; en: string };
  description: { id: string; en: string };
  category: TemplateCategory;
  tier: PriceTier;
  price: number;
  originalPrice?: number;
  discount?: number;
  previewImage: string;
  colorSchemes: TemplateColorScheme[];
  fields: TemplateField[];
  features: { id: string; en: string }[];
}

// Site (user-created micro-site)
export type SiteStatus = 'draft' | 'pending_payment' | 'published';

export interface SiteCustomization {
  // Allow any JSON-serializable value per field (strings, nested records for fieldFonts, etc.)
  [fieldId: string]: string | string[] | number | Record<string, string> | null | undefined;
}

export interface QRCodeConfig {
  shape: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'heart' | 'star' | 'diamond' | 'circle';
  foreground: string;
  background: string;
  cornerColor: string;
  logo?: string;
}

export interface Site {
  id: string;
  userId: string;
  templateId: string;
  slug: string;
  customization: SiteCustomization;
  colorScheme: TemplateColorScheme;
  font: string;
  qrConfig: QRCodeConfig;
  status: SiteStatus;
  views: number;
  createdAt: string;
  publishedAt?: string;
}

// Payment
export type PaymentMethod = 'qris' | 'bank_transfer' | 'ewallet' | 'credit_card';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'expired' | 'failed';

export interface Payment {
  id: string;
  siteId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

// i18n
export type Language = 'id' | 'en';
export interface LocalizedString {
  id: string;
  en: string;
}

// Toast
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
