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
    name: "Cristiano Alves",
    email: "cristiano@exemplo.com",
    phone: "(11) 98765-4321",
    addresses: [
      {
        id: "adr-1",
        label: "Casa",
        street: "Av. Paulista",
        number: "1000",
        complement: "Apto 42",
        district: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
        isDefault: true,
      },
    ],
    createdAt: "2026-01-15T10:30:00.000Z",
  },
  {
    id: "usr-2",
    name: "Mariana Silva",
    email: "mariana.silva@email.com",
    phone: "(21) 99123-4567",
    addresses: [
      {
        id: "adr-2",
        label: "Trabalho",
        street: "Av. Rio Branco",
        number: "500",
        complement: "Sala 1201",
        district: "Centro",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "20040-002",
        isDefault: true,
      },
    ],
    createdAt: "2026-03-10T14:15:00.000Z",
  },
  {
    id: "usr-3",
    name: "Lucas Souza",
    email: "lucas.gamer@gmail.com",
    phone: "(31) 98877-6655",
    addresses: [
      {
        id: "adr-3",
        label: "Casa",
        street: "Rua das Flores",
        number: "123",
        district: "Savassi",
        city: "Belo Horizonte",
        state: "MG",
        zipCode: "30130-000",
        isDefault: true,
      },
    ],
    createdAt: "2026-04-05T09:20:00.000Z",
  },
  {
    id: "usr-4",
    name: "Beatriz Oliveira",
    email: "bea.oliveira@outlook.com",
    phone: "(41) 99888-1122",
    addresses: [
      {
        id: "adr-4",
        label: "Casa",
        street: "Rua XV de Novembro",
        number: "890",
        district: "Centro",
        city: "Curitiba",
        state: "PR",
        zipCode: "80020-310",
        isDefault: true,
      },
    ],
    createdAt: "2026-06-12T16:00:00.000Z",
  },
  {
    id: "usr-5",
    name: "Pedro Henrique",
    email: "pedro.setup@gmail.com",
    phone: "(51) 99777-3344",
    addresses: [
      {
        id: "adr-5",
        label: "Casa",
        street: "Av. Carlos Gomes",
        number: "400",
        district: "Bela Vista",
        city: "Porto Alegre",
        state: "RS",
        zipCode: "90480-000",
        isDefault: true,
      },
    ],
    createdAt: "2026-07-20T11:45:00.000Z",
  },
];

export const mockCurrentUser: User = mockUsers[0]!;
