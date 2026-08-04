import type { Address, User } from "@/types";

export const mockAddresses: Address[] = [
  {
    id: "adr-1",
    label: "Casa",
    street: "Rua das Oficinas",
    number: "230",
    complement: "Apto 42",
    district: "Vila Industrial",
    city: "São Paulo",
    state: "SP",
    zipCode: "03120-000",
    isDefault: true,
  },
  {
    id: "adr-2",
    label: "Obra",
    street: "Av. Construtores",
    number: "1500",
    district: "Centro",
    city: "Campinas",
    state: "SP",
    zipCode: "13010-100",
    isDefault: false,
  },
];

export const mockUsers: User[] = [
  {
    id: "usr-1",
    name: "Lucas Andrade",
    email: "lucas@apertastart.com.br",
    phone: "(11) 99999-1234",
    avatar: "/images/users/lucas.jpg",
    addresses: mockAddresses,
    createdAt: "2025-11-04T12:00:00.000Z",
  },
];

export const mockCurrentUser: User = mockUsers[0]!;
