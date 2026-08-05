import { supabase } from "@/lib/supabase";

export const StorageService = {
  /**
   * Faz upload de uma imagem para o Supabase Storage (bucket 'products').
   * Se houver falha ou o bucket não existir, gera Data URL como fallback seguro.
   */
  async uploadProductImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn("Upload no Supabase Storage (bucket 'products') desativado ou sem permissão. Usando fallback Data URL.", error?.message);
      }
    } catch (err) {
      console.warn("Exceção ao subir arquivo para Supabase Storage:", err);
    }

    // Fallback: Converte arquivo em base64 Data URL para não travar a experiência do usuário
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },
};
