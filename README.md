# Aperta Start Foundation

Você é um Desenvolvedor Front-end Sênior e Product Designer especializado em React, Vite, Tailwind CSS, shadcn/ui e projetos escaláveis.

Vamos desenvolver um e-commerce chamado Aperta Start.

IMPORTANTE

Este projeto será desenvolvido em várias etapas.

Em cada novo prompt você deverá apenas evoluir o projeto.

Nunca refatore componentes existentes sem necessidade.

Nunca altere identidade visual aprovada.

Sempre reutilize componentes.

Todo o projeto deverá seguir um Design System único.

Não crie páginas ainda.

Nesta etapa vamos apenas preparar toda a estrutura do projeto.

Objetivo

Criar toda a base do projeto para que posteriormente possamos desenvolver as telas.

Ainda NÃO iremos conectar ao Supabase.

Toda a aplicação utilizará dados mockados.

Entretanto toda a arquitetura deve ser preparada para que posteriormente seja muito simples substituir os mocks por consultas ao Supabase.

Stack

Utilizar:

 React

 Vite

 TypeScript

 Tailwind CSS

 shadcn/ui

 Lucide Icons

 React Router

 React Hook Form

 Zod

 TanStack Query

 Sonner

 Embla Carousel

 clsx

 tailwind-merge

Estrutura de pastas

Organizar o projeto utilizando uma arquitetura limpa.

Exemplo:

src/

assets/

components/

components/ui

components/layout

components/product

components/common

components/forms

components/home

hooks/

contexts/

lib/

services/

mocks/

types/

pages/

styles/

utils/

constants/


Separar tudo por responsabilidade.

Arquitetura

Não utilizar lógica diretamente nas páginas.

Toda lógica deve ficar em:

hooks

services

utils

contexts

As páginas devem apenas montar componentes.

Dados

Criar toda estrutura de dados mockados.

Exemplo:

Categorias

Produtos

Coleções

Kits

Banners

Depoimentos

Usuários

Pedidos

Wishlist

Carrinho

Todos esses dados deverão ficar em arquivos separados.

Preparação para Supabase

Criar a estrutura pensando em substituir facilmente os mocks futuramente.

Exemplo:

ProductService

CategoryService

OrderService

UserService

CartService

Inicialmente todos utilizando dados mockados.

Nenhuma conexão deverá ser criada.

Tema

Criar um Theme Provider.

Toda cor deverá ser centralizada.

Não utilizar HEX espalhado pelo projeto.

Utilizar Tokens.

Exemplo:

Primary

Secondary

Accent

Warning

Success

Danger

Muted

Border

Background

Foreground

Card


Tipografia

Utilizar Manrope.

Criar escala tipográfica.

Exemplo:

Display

H1

H2

H3

H4

Body

Small

Caption

Button

Espaçamento

Criar um sistema consistente.

Utilizar escala baseada em múltiplos de 4.

Bordas

Centralizar os valores.

Exemplo:

Small

Medium

Large

XL

Sombras

Criar níveis.

Light

Medium

Large

Hover

Componentes Base

Criar apenas os componentes reutilizáveis.

Ainda sem montar páginas.

Criar:

Button

Input

Textarea

Select

Checkbox

Radio

Switch

Badge

Card

Price

Rating

Breadcrumb

Pagination

Tooltip

Modal

Drawer

Accordion

Tabs

Toast

Skeleton

Loading

Avatar

Divider

Empty State

Section Title

Container

Componentes Layout

Criar apenas a estrutura.

Header

TopBar

Navigation

Mega Menu

Footer

Newsletter

Search

Search Suggestions

Mini Cart

Mobile Menu

Category Menu

Componentes Produto

Product Card

Product Grid

Product Carousel

Product Badge

Product Price

Product Installments

Product Actions

Wishlist Button

Add To Cart Button

Quantity Selector

Hooks

Preparar hooks:

useCart

useWishlist

useProducts

useCategories

useOrders

useSearch

useAuth

Todos utilizando dados mockados.

Responsividade

Desktop First.

Posteriormente iremos adaptar Mobile.

Performance

Preparar componentes reutilizáveis.

Evitar duplicação.

Separar responsabilidades.

Componentes desacoplados.

Boas práticas

Utilizar TypeScript corretamente.

Tipagem forte.

Código limpo.

Componentes pequenos.

Alta reutilização.

NÃO FAZER

Não criar nenhuma página.

Não criar Home.

Não criar Loja.

Não criar Produto.

Não criar Carrinho.

Não criar Checkout.

Não criar Minha Conta.

Não criar nenhuma tela.

Nesta etapa quero apenas a fundação completa do projeto para que possamos construir todas as páginas posteriormente.

Resultado esperado

Ao final desta etapa o projeto deverá estar completamente preparado para receber as próximas telas.

Toda a arquitetura deverá ser escalável, reutilizável e preparada para futura integração com o Supabase, mantendo por enquanto apenas dados mockados.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2bd356c6-daf3-45b7-a45e-9f222dae15fd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
