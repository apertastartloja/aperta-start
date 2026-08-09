import { supabase } from "@/lib/supabase";
import { clone, delay } from "./base.service";

export interface StoreSettings {
  // Store info (CNPJ optional)
  storeName: string;
  corporateName?: string;
  cnpj?: string;
  stateRegistration?: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  pixKey?: string;

  // Tracking Pixels & Marketing
  metaPixelId?: string;
  googleAnalyticsId?: string;
  gtmId?: string;
  tiktokPixelId?: string;

  // Social Networks
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  whatsappLink?: string;

  // Preferences & Announcements
  topBarNotice: string;
  showLowStockAlert: boolean;
  enableLgpdNotice: boolean;
}

const defaultStoreSettings: StoreSettings = {
  storeName: "Aperta Start - Suportes & Decoração Gamer",
  corporateName: "",
  cnpj: "", // Optional / Em emissão
  stateRegistration: "",
  email: "contato@apertastart.com.br",
  phone: "(11) 98765-4321",
  whatsapp: "5511987654321",
  address: "Av. Paulista, 1000 - Bela Vista",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310-100",

  metaPixelId: "123456789012345",
  googleAnalyticsId: "G-APS1234567",
  gtmId: "GTM-APSTART",
  tiktokPixelId: "",

  instagram: "apertastart.oficial",
  tiktok: "@apertastart",
  youtube: "apertastart",
  facebook: "apertastartloja",
  whatsappLink: "https://wa.me/5511987654321",

  topBarNotice: "⚡ Frete Grátis para todo o Sudeste acima de R$ 199,00! Cupom: START10",
  showLowStockAlert: true,
  enableLgpdNotice: true,
};

const SETTINGS_LOCAL_KEY = "apertastart_store_settings";

function getLocalSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_LOCAL_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fallback
  }
  return clone(defaultStoreSettings);
}

function setLocalSettings(data: StoreSettings) {
  try {
    localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(data));
  } catch {
    // Fallback
  }
}

export const StoreSettingsService = {
  async getSettings(): Promise<StoreSettings> {
    try {
      const { data, error } = await supabase.from("store_settings").select("*").single();
      if (!error && data) {
        return {
          storeName: data.store_name || defaultStoreSettings.storeName,
          corporateName: data.corporate_name || "",
          cnpj: data.cnpj || "",
          stateRegistration: data.state_registration || "",
          email: data.email || defaultStoreSettings.email,
          phone: data.phone || defaultStoreSettings.phone,
          whatsapp: data.whatsapp || defaultStoreSettings.whatsapp,
          address: data.address || defaultStoreSettings.address,
          city: data.city || defaultStoreSettings.city,
          state: data.state || defaultStoreSettings.state,
          zipCode: data.zip_code || defaultStoreSettings.zipCode,
          pixKey: data.pix_key || getLocalSettings().pixKey || "",
          metaPixelId: data.meta_pixel_id || "",
          googleAnalyticsId: data.google_analytics_id || "",
          gtmId: data.gtm_id || "",
          tiktokPixelId: data.tiktok_pixel_id || "",
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
          youtube: data.youtube || "",
          facebook: data.facebook || "",
          whatsappLink: data.whatsapp_link || "",
          topBarNotice: data.top_bar_notice || defaultStoreSettings.topBarNotice,
          showLowStockAlert: data.show_low_stock_alert ?? true,
          enableLgpdNotice: data.enable_lgpd_notice ?? true,
        };
      }
    } catch {
      // Fallback to localStorage
    }
    return delay(getLocalSettings());
  },

  async updateSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = getLocalSettings();
    const updated: StoreSettings = { ...current, ...patch };

    // Try Supabase update
    try {
      await supabase.from("store_settings").upsert({
        id: "main",
        store_name: updated.storeName,
        corporate_name: updated.corporateName,
        cnpj: updated.cnpj,
        state_registration: updated.stateRegistration,
        email: updated.email,
        phone: updated.phone,
        whatsapp: updated.whatsapp,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        zip_code: updated.zipCode,
        meta_pixel_id: updated.metaPixelId,
        google_analytics_id: updated.googleAnalyticsId,
        gtm_id: updated.gtmId,
        tiktok_pixel_id: updated.tiktokPixelId,
        instagram: updated.instagram,
        tiktok: updated.tiktok,
        youtube: updated.youtube,
        facebook: updated.facebook,
        whatsapp_link: updated.whatsappLink,
        top_bar_notice: updated.topBarNotice,
        show_low_stock_alert: updated.showLowStockAlert,
        enable_lgpd_notice: updated.enableLgpdNotice,
      });
    } catch {
      // Fallback to local storage
    }

    setLocalSettings(updated);
    return delay(clone(updated));
  },
};
