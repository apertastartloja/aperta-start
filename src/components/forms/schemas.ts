import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema.extend({
  name: z.string().min(3, "Informe seu nome completo"),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});
export type NewsletterValues = z.infer<typeof newsletterSchema>;

export const addressSchema = z.object({
  label: z.string().min(2, "Informe um apelido"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().min(3, "Informe o logradouro"),
  number: z.string().min(1, "Informe o número"),
  complement: z.string().optional(),
  district: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z.string().length(2, "UF com 2 letras"),
});
export type AddressValues = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;
