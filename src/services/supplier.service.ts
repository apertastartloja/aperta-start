import { supabase } from "@/lib/supabase";
import { mockSuppliers } from "@/mocks/suppliers.mock";
import { ProductService } from "./product.service";
import type { Supplier, Product } from "@/types";
import { clone, delay } from "./base.service";

let localSuppliersStore: Supplier[] = clone(mockSuppliers);

export const SupplierService = {
  /**
   * Lists all suppliers from Supabase or local fallback
   */
  async listAll(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((s) => ({
          id: s.id,
          name: s.name,
          companyName: s.company_name,
          cpfCnpj: s.cpf_cnpj,
          contactName: s.contact_name,
          email: s.email,
          phone: s.phone,
          whatsapp: s.whatsapp,
          productCategories: s.product_categories || [],
          leadTimeDays: s.lead_time_days || 3,
          status: s.status || "active",
          notes: s.notes,
          createdAt: s.created_at || new Date().toISOString(),
          updatedAt: s.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase suppliers offline, usando dados locais:", err);
    }
    return delay(clone(localSuppliersStore));
  },

  /**
   * Get single supplier by ID
   */
  async getById(id: string): Promise<Supplier | null> {
    const list = await this.listAll();
    return list.find((s) => s.id === id) || null;
  },

  /**
   * Create a new supplier
   */
  async create(input: Omit<Supplier, "id" | "createdAt">): Promise<Supplier> {
    const newSupplier: Supplier = {
      ...input,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localSuppliersStore.unshift(newSupplier);

    try {
      await supabase.from("suppliers").insert({
        id: newSupplier.id,
        name: newSupplier.name,
        company_name: newSupplier.companyName,
        cpf_cnpj: newSupplier.cpfCnpj,
        contact_name: newSupplier.contactName,
        email: newSupplier.email,
        phone: newSupplier.phone,
        whatsapp: newSupplier.whatsapp,
        product_categories: newSupplier.productCategories,
        lead_time_days: newSupplier.leadTimeDays,
        status: newSupplier.status,
        notes: newSupplier.notes,
        created_at: newSupplier.createdAt,
      });
    } catch {
      // Fallback
    }

    return delay(clone(newSupplier));
  },

  /**
   * Update an existing supplier
   */
  async update(id: string, patch: Partial<Supplier>): Promise<Supplier> {
    const idx = localSuppliersStore.findIndex((s) => s.id === id);
    if (idx >= 0) {
      localSuppliersStore[idx] = {
        ...localSuppliersStore[idx]!,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      await supabase
        .from("suppliers")
        .update({
          name: patch.name,
          company_name: patch.companyName,
          cpf_cnpj: patch.cpfCnpj,
          contact_name: patch.contactName,
          email: patch.email,
          phone: patch.phone,
          whatsapp: patch.whatsapp,
          product_categories: patch.productCategories,
          lead_time_days: patch.leadTimeDays,
          status: patch.status,
          notes: patch.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch {
      // Fallback
    }

    return delay(clone(localSuppliersStore[idx]!));
  },

  /**
   * Delete a supplier
   */
  async delete(id: string): Promise<boolean> {
    localSuppliersStore = localSuppliersStore.filter((s) => s.id !== id);

    try {
      await supabase.from("suppliers").delete().eq("id", id);
    } catch {
      // Fallback
    }

    return delay(true);
  },

  /**
   * Get products linked to a specific supplier
   */
  async getSupplierProducts(supplierId: string): Promise<Product[]> {
    const res = await ProductService.list({ perPage: 1000, includeInactive: true });
    return res.data.filter((p: Product) => p.supplierId === supplierId);
  },
};
