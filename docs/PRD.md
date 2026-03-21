# PRD — Prof. William Melo — Site Pessoal e Acadêmico

---

## VERSÃO EM LINGUAGEM NATURAL

### O que é este projeto?

Este é o site pessoal e acadêmico do Prof. William Melo (W-Black), um pesquisador, professor e artista do Rio de Janeiro que une ciência, educação e cultura Hip Hop. O site funciona como um portfólio vivo: mostra os projetos que ele desenvolveu, as publicações que escreveu, a trajetória que percorreu e os depoimentos de quem cruzou o seu caminho.

### Para quem é?

- **Pesquisadores e acadêmicos** que queiram conhecer seu trabalho científico
- **Professores e gestores** interessados nos seus projetos de impacto educacional
- **Jornalistas e parceiros institucionais** que buscam suas publicações e trajetória
- **Comunidade Hip Hop e movimentos sociais** que acompanham sua produção artística e cultural
- **Estudantes** que possam se inspirar no seu percurso

### O que o site faz hoje?

1. **Apresenta William Melo** com foto, bio resumida e botões de ação
2. **Conta sua trajetória** em uma linha do tempo interativa (do Morro dos Macacos até o doutorado)
3. **Exibe projetos** em modo lista ou tabela, com destaque para os mais importantes
4. **Mostra a bibliografia** — artigos, livros, vídeos e participações
5. **Galeria de fotos** em carrossel
6. **Depoimentos** de pessoas que trabalharam com ele
7. **Contato** direto via WhatsApp e e-mail

### O que vai ser adicionado?

#### Conteúdo rico em cada referência
Cada projeto e cada publicação poderá ter:
- Uma **imagem de destaque** (thumbnail ou capa visual)
- Um **embed HTML** — para incorporar vídeos do YouTube, mapas, dashboards interativos, jogos, ou qualquer conteúdo externo direto na página do item

#### Três modos de visualização
As listas de projetos e de bibliografia vão ter três modos:
- **Lista simples** — texto compacto, como hoje
- **Tabela** — linhas e colunas para leitura técnica
- **Galeria** — visual com imagem de destaque em destaque, como um portfólio visual

#### Modo Exu — Painel Administrativo
Um painel secreto e protegido por login, acessível apenas para o e-mail administrador (definido no banco de dados). Nele:
- É possível **ver e editar** todos os dados do banco diretamente: projetos, bibliografia, depoimentos, configurações do site
- Criar novos itens, editar existentes, excluir registros
- Definir imagem de destaque e embed HTML de cada item
- O e-mail admin é configurado no próprio banco de dados — nenhuma senha fixa no código

### O que garante a segurança?

- Login real via Supabase (e-mail + senha)
- O sistema verifica no banco de dados se o e-mail logado é realmente admin
- Os embeds HTML são renderizados em caixas isoladas (sandboxed) — um código malicioso dentro de um embed não consegue acessar o site em volta
- Políticas de banco de dados (RLS) garantem que ninguém não autorizado consiga alterar dados, mesmo que tente diretamente pela API
- Dados sensíveis nunca ficam visíveis no código-fonte público

---

## VERSÃO TÉCNICA

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 7 |
| Estilização | Tailwind CSS 3 + PostCSS |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| Autenticação | Supabase Auth (email/password) |
| Hosting | Vercel / Netlify (static build) |
| Icons | Lucide React |
| Carousel | Swiper.js |

### Arquitetura

```
SPA (Single Page Application)
├── Client-side routing via window.history.pushState()
├── Supabase JS SDK para queries diretas ao banco
├── React Context para tema (dark/light) e autenticação
└── RLS (Row Level Security) como camada de autorização
```

### Banco de Dados — Schema Completo

#### `projects`
```sql
id                UUID PK
title             TEXT NOT NULL
summary           TEXT
year              TEXT
status            TEXT
type              TEXT
access_link       TEXT
target_audience   TEXT
version           TEXT
is_featured       BOOLEAN DEFAULT false
featured_image_url TEXT          -- NOVO
embed_code        TEXT           -- NOVO (HTML sandboxado)
created_at        TIMESTAMPTZ
```

#### `bibliography`
```sql
id                UUID PK
title             TEXT NOT NULL
link              TEXT
year              TEXT
type              TEXT
featured_image_url TEXT          -- NOVO
embed_code        TEXT           -- NOVO (HTML sandboxado)
created_at        TIMESTAMPTZ
```

#### `testimonials`
```sql
id         UUID PK
content    TEXT
name       TEXT
role       TEXT
image_url  TEXT
active     BOOLEAN DEFAULT true
created_at TIMESTAMPTZ
```

#### `admin_settings`
```sql
id         UUID PK
key        TEXT UNIQUE NOT NULL
value      TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Entradas padrão:
- `admin_email` → e-mail do administrador
- `site_name` → nome do site
- `site_description` → descrição curta

### Políticas RLS

| Tabela | Anon (público) | Authenticated + isAdmin() |
|---|---|---|
| projects | SELECT | SELECT, INSERT, UPDATE, DELETE |
| bibliography | SELECT | SELECT, INSERT, UPDATE, DELETE |
| testimonials | SELECT (active=true) | SELECT, INSERT, UPDATE, DELETE |
| admin_settings | — | SELECT, INSERT, UPDATE, DELETE |

`is_admin()` = função SQL com `SECURITY DEFINER` que verifica `auth.jwt() ->> 'email'` contra `admin_settings WHERE key = 'admin_email'`.

### Módulos Frontend Novos/Alterados

```
src/
├── context/
│   ├── ThemeContext.jsx      (existente)
│   └── AuthContext.jsx       (NOVO — session + isAdmin)
├── components/
│   ├── ProjectsSection.jsx   (atualizado — 3 view modes)
│   ├── BibliographySection.jsx (atualizado — 3 view modes)
│   ├── ProjectCard.jsx       (atualizado — imagem destaque)
│   ├── BiblioCard.jsx        (atualizado — imagem destaque)
│   ├── ItemDetailPage.jsx    (NOVO — detalhe com embed sandbox)
│   ├── Header.jsx            (atualizado — botão Exu oculto)
│   └── ExuMode/
│       ├── index.jsx         (NOVO — entry + proteção de rota)
│       ├── ExuLogin.jsx      (NOVO — form login Supabase auth)
│       └── ExuDashboard.jsx  (NOVO — CRUD completo de todas tabelas)
└── App.jsx                   (atualizado — novas rotas)
```

### Segurança de Embeds

Embeds HTML armazenados em `embed_code` são renderizados exclusivamente via:

```jsx
<iframe
  srcDoc={embed_code}
  sandbox="allow-scripts allow-popups allow-forms"
  referrerPolicy="no-referrer"
  className="w-full min-h-[300px]"
  title="Embedded Content"
/>
```

- Sem `allow-same-origin`: scripts do embed não acessam cookies, localStorage ou DOM do host
- Sem `allow-top-navigation`: não pode redirecionar o usuário
- `referrerPolicy="no-referrer"`: não vaza a URL do site para o destino do embed

### Variáveis de Ambiente

```
VITE_SUPABASE_URL=      # URL pública do projeto Supabase
VITE_SUPABASE_ANON_KEY= # Chave anon (segura para expor no frontend)
```

A chave `service_role` nunca é usada ou exposta no frontend.

### Requisitos Não-Funcionais

| Atributo | Meta |
|---|---|
| Performance | First Paint < 2s, LCP < 3s |
| Acessibilidade | WCAG AA — alt texts, roles ARIA, contraste adequado |
| Responsividade | Mobile-first (320px+) |
| Dark Mode | Persistido em localStorage |
| SEO | Meta tags OG, título e descrição dinâmicos |
| Segurança | OWASP Top 10 coberto para o perfil da aplicação |
