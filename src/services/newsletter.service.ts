import { supabase } from "@/lib/supabase";
import { clone, delay } from "./base.service";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
  active: boolean;
}

const initialSubscribers: NewsletterSubscriber[] = [
  {
    id: "sub-1",
    email: "cristiano@exemplo.com",
    source: "Rodapé da Home",
    createdAt: "2026-08-01T14:20:00.000Z",
    active: true,
  },
  {
    id: "sub-2",
    email: "mariana.silva@email.com",
    source: "Rodapé da Home",
    createdAt: "2026-07-28T09:15:00.000Z",
    active: true,
  },
  {
    id: "sub-3",
    email: "lucas.gamer@gmail.com",
    source: "Pop-up Promocional",
    createdAt: "2026-07-15T18:40:00.000Z",
    active: true,
  },
  {
    id: "sub-4",
    email: "bea.oliveira@outlook.com",
    source: "Rodapé da Home",
    createdAt: "2026-07-02T11:05:00.000Z",
    active: true,
  },
  {
    id: "sub-5",
    email: "pedro.setup@gmail.com",
    source: "Pop-up Promocional",
    createdAt: "2026-06-20T16:30:00.000Z",
    active: true,
  },
];

let localSubscribersStore: NewsletterSubscriber[] = clone(initialSubscribers);

export const NewsletterService = {
  async listAll(): Promise<NewsletterSubscriber[]> {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const fetched: NewsletterSubscriber[] = data.map((item) => ({
          id: item.id,
          email: item.email,
          source: item.source || "Rodapé da Home",
          createdAt: item.created_at || new Date().toISOString(),
          active: item.active ?? true,
        }));
        localSubscribersStore = fetched;
        return localSubscribersStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar inscritos de newsletter do Supabase:", err);
    }
    return delay(clone(localSubscribersStore));
  },

  async subscribe(email: string, source = "Rodapé da Home"): Promise<NewsletterSubscriber> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = localSubscribersStore.find((s) => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      return existing;
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      source,
      createdAt: new Date().toISOString(),
      active: true,
    };

    localSubscribersStore.unshift(newSub);

    try {
      await supabase.from("newsletter_subscribers").insert({
        id: newSub.id,
        email: newSub.email,
        source: newSub.source,
        created_at: newSub.createdAt,
        active: newSub.active,
      });
    } catch {
      // Fallback
    }

    return delay(clone(newSub));
  },

  async delete(id: string): Promise<boolean> {
    try {
      await supabase.from("newsletter_subscribers").delete().eq("id", id);
    } catch {
      // Fallback
    }
    localSubscribersStore = localSubscribersStore.filter((s) => s.id !== id);
    return delay(true);
  },
};
