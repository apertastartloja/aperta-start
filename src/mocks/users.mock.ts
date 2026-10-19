import type { Address, User } from "@/types";

export const mockAddresses: Address[] = [];

export const mockUsers: User[] = [];

export const mockCurrentUser: User = {
  id: "usr-guest",
  name: "Cliente",
  email: "apertastart.loja@gmail.com",
  addresses: [],
  createdAt: new Date().toISOString(),
};
