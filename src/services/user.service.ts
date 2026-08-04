import { mockCurrentUser, mockWishlist } from "@/mocks";
import type { User, Wishlist } from "@/types";
import { clone, delay } from "./base.service";

let session: User | null = null;
let wishlist: Wishlist = clone(mockWishlist);

export interface Credentials {
  email: string;
  password: string;
}

export const UserService = {
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
