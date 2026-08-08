import { supabase } from "@/lib/supabase";
import { mockCurrentUser, mockUsers, mockWishlist } from "@/mocks";
import type { User, Wishlist } from "@/types";
import { NotFoundError, clone, delay } from "./base.service";

let session: User | null = null;
let wishlist: Wishlist = clone(mockWishlist);
let localUsersStore: User[] = clone(mockUsers);

export interface Credentials {
  email: string;
  password: string;
}

export const UserService = {
  async fetchFromSupabase(): Promise<User[] | null> {
    try {
      // Check Supabase auth users / profiles table
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data && data.length > 0) {
        const fetched: User[] = data.map((item) => ({
          id: item.id,
          name: item.name || item.full_name || "Cliente sem nome",
          email: item.email || "",
          phone: item.phone || undefined,
          avatar: item.avatar_url || undefined,
          addresses: item.addresses || [],
          createdAt: item.created_at || new Date().toISOString(),
        }));

        const existingIds = new Set(fetched.map((u) => u.id));
        const missingLocal = localUsersStore.filter((u) => !existingIds.has(u.id));
        localUsersStore = [...fetched, ...missingLocal];
        return localUsersStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar clientes do Supabase, utilizando estado local:", err);
    }
    return localUsersStore;
  },

  async listAll(query: { search?: string } = {}): Promise<User[]> {
    await this.fetchFromSupabase();
    let items = clone(localUsersStore);

    if (query.search?.trim()) {
      const term = query.search.toLowerCase().trim();
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.phone && u.phone.toLowerCase().includes(term)) ||
          u.addresses.some(
            (a) =>
              a.city.toLowerCase().includes(term) ||
              a.state.toLowerCase().includes(term)
          )
      );
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return delay(items);
  },

  async getById(id: string): Promise<User> {
    await this.fetchFromSupabase();
    const user = localUsersStore.find((u) => u.id === id);
    if (!user) throw new NotFoundError("Cliente", id);
    return delay(clone(user));
  },

  async create(input: Omit<User, "id" | "createdAt">): Promise<User> {
    const newId = `usr-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newUser: User = {
      ...input,
      id: newId,
      createdAt,
    };

    localUsersStore = [newUser, ...localUsersStore];
    return delay(clone(newUser));
  },

  async update(id: string, patch: Partial<User>): Promise<User> {
    const idx = localUsersStore.findIndex((u) => u.id === id);
    if (idx < 0) throw new NotFoundError("Cliente", id);

    const updated: User = {
      ...localUsersStore[idx]!,
      ...patch,
    };

    localUsersStore[idx] = updated;
    return delay(clone(updated));
  },

  async delete(id: string): Promise<boolean> {
    localUsersStore = localUsersStore.filter((u) => u.id !== id);
    return delay(true);
  },

  async getSession(): Promise<User | null> {
    return delay(session ? clone(session) : null, 80);
  },

  async signIn({ email }: Credentials): Promise<User> {
    session = { ...clone(mockCurrentUser), email };
    return delay(clone(session));
  },

  async signUp(input: { name: string; email: string; password: string }): Promise<User> {
    session = { ...clone(mockCurrentUser), name: input.name, email: input.email };
    return delay(clone(session));
  },

  async signOut(): Promise<null> {
    session = null;
    return delay(null, 80);
  },

  async updateProfile(patch: Partial<Pick<User, "name" | "phone" | "avatar">>): Promise<User> {
    session = { ...clone(session ?? mockCurrentUser), ...patch };
    return delay(clone(session));
  },
};

export const WishlistService = {
  async get(): Promise<Wishlist> {
    return delay(clone(wishlist));
  },

  async toggle(productId: string): Promise<Wishlist> {
    const exists = wishlist.items.some((i) => i.productId === productId);
    wishlist = {
      ...wishlist,
      items: exists
        ? wishlist.items.filter((i) => i.productId !== productId)
        : [
            ...wishlist.items,
            {
              id: `wi-${Math.random().toString(36).slice(2, 10)}`,
              productId,
              addedAt: new Date().toISOString(),
            },
          ],
    };
    return delay(clone(wishlist));
  },

  async clear(): Promise<Wishlist> {
    wishlist = { ...wishlist, items: [] };
    return delay(clone(wishlist));
  },
};
