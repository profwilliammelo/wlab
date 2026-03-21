# PRD — Prof. William Melo — Site Pessoal e Acadêmico

**Versão:** 2.0
**Data:** 2026-03-21
**Status:** Produção

---

## VERSÃO EM LINGUAGEM NATURAL

### O que é este projeto?

Este é o site pessoal e acadêmico do Prof. William Melo (W-Black), pesquisador, professor e artista do Rio de Janeiro que une ciência da educação, equidade racial e cultura Hip Hop. O site é uma vitrine viva: apresenta quem ele é, o que produziu, o caminho que percorreu e o impacto que causou.

### Para quem é?

- **Pesquisadores e acadêmicos** que queiram conhecer sua produção científica e dados sobre equidade racial na educação
- **Professores e gestores** interessados em seus projetos práticos de impacto educacional
- **Jornalistas e parceiros institucionais** que buscam suas publicações, trajetória e contato
- **Comunidade Hip Hop e movimentos sociais** que acompanham sua produção artística e cultural
- **Estudantes** que possam se inspirar no seu percurso — do Morro dos Macacos ao doutorado
- **William Melo** — que gerencia tudo sozinho pelo painel admin

### O que o site faz hoje (estado completo)

#### Página principal (pública)
1. **Hero** — foto, nome (William Melo / W-Black), bio resumida, botões de ação (WhatsApp, e-mail)
2. **Sobre** — trajetória acadêmica, doutorado em Educação, linhas de pesquisa
3. **Linha do Tempo** — percurso de vida interativo, do Morro dos Macacos ao doutorado
4. **Carrossel de fotos** — galeria visual com Swiper
5. **Projetos & Iniciativas** — lista de projetos com 3 modos de visualização
6. **Bibliografia & Publicações** — lista de publicações com 3 modos de visualização
7. **Depoimentos** — citações de pessoas que trabalharam com ele
8. **Contato** — WhatsApp e e-mail diretos
9. **Rodapé** — links e créditos

#### Página de detalhe (por projeto ou publicação)
- **Imagem de destaque** — visual capa/thumbnail no topo
- **Informações completas** — título, tipo, status, ano, público-alvo, versão
- **Botão de acesso externo** — link para o projeto/publicação original
- **Conteúdo incorporado (embed)** — qualquer HTML pode ser incorporado em caixa isolada: YouTube, mapas, dashboards, jogos, formulários, iframes — tudo definido diretamente no banco de dados

#### Três modos de visualização para projetos e bibliografia
- **Cards** — visual com imagem e resumo (modo padrão)
- **Galeria** — grid visual com imagem de destaque em destaque, badge de tipo e status
- **Tabela** — linhas e colunas para consulta técnica, com link direto e indicadores visuais

#### Modo Exu — Painel Administrativo
Um painel secreto e protegido, acessível apenas ao administrador (e-mail definido no banco de dados). Permite:
- Ver, criar, editar e excluir **Projetos**, **Bibliografia**, **Depoimentos** e **Configurações do site**
- Definir **imagem de destaque** e **código embed** de qualquer item
- Controlar quais depoimentos aparecem no site (campo "Visível")
- Visualizar o **Log de Auditoria** — histórico imutável de todas as alterações feitas no banco
- Todas as ações são registradas automaticamente pelo banco de dados — impossível falsificar ou apagar

#### Segurança (o que protege o site)
- Login real com e-mail e senha via Supabase
- O banco de dados verifica se o e-mail logado é realmente admin — mesmo quem descobrir a API não consegue escrever nada
- Embeds HTML ficam em caixas totalmente isoladas — código malicioso dentro de um embed não consegue acessar o site em volta
- Todos os links externos têm proteção contra sequestro de janela
- O site usa HTTPS forçado e cabeçalhos de segurança que impedem vários tipos de ataque conhecidos
- Histórico completo de quem mudou o quê e quando, direto no painel admin

---

## VERSÃO TÉCNICA

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 7 |
| Estilização | Tailwind CSS 3 + PostCSS |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Autenticação | Supabase Auth — email/password com JWT |
| Hosting | Vercel (static SPA + edge cache) |
| Icons | Lucide React |
| Carousel | Swiper.js |

### Arquitetura

```
SPA — Single Page Application
├── Client-side routing via window.history.pushState()
├── Supabase JS SDK — queries diretas ao banco
├── React Context — tema (dark/light) e autenticação (session + isAdmin)
├── RLS (Row Level Security) — camada de autorização no banco
└── Vercel — servindo build estático com headers de segurança
```

**Rotas do cliente:**

| Rota | Componente | Proteção |
|---|---|---|
| `/` | `Home` | Pública |
| `#games` | `GamesGallery` | Pública |
| `#item-{type}-{id}` | `ItemDetailPage` | Pública |
| `/exu` | `ExuMode` | Admin only (session + is_admin()) |

### Banco de Dados — Schema Completo

#### `projects`
```sql
id                UUID PK DEFAULT gen_random_uuid()
title             TEXT NOT NULL
summary           TEXT
year              TEXT
status            TEXT  -- 'Ativo' | 'Concluído' | 'Em pausa' | 'Cancelado'
type              TEXT  -- 'Plataforma' | 'Dashboard' | 'Estudo' | 'Jogo' | 'Mapa' | ...
access_link       TEXT
target_audience   TEXT
version           TEXT
is_featured       BOOLEAN DEFAULT false
featured_image_url TEXT
embed_code        TEXT  -- HTML sandboxado, max 100KB
created_at        TIMESTAMPTZ DEFAULT now()
```

#### `bibliography`
```sql
id                UUID PK DEFAULT gen_random_uuid()
title             TEXT NOT NULL
link              TEXT
year              TEXT
type              TEXT  -- 'Texto' | 'Participação em livro' | 'Cultura hiphop' | 'Mesa/Seminário' | 'Vídeo' | 'Outro'
featured_image_url TEXT
embed_code        TEXT  -- HTML sandboxado, max 100KB
created_at        TIMESTAMPTZ DEFAULT now()
```

#### `testimonials`
```sql
id         UUID PK DEFAULT gen_random_uuid()
content    TEXT
name       TEXT
role       TEXT
image_url  TEXT
active     BOOLEAN DEFAULT true  -- somente active=true aparece no site
created_at TIMESTAMPTZ DEFAULT now()
```

#### `admin_settings`
```sql
id         UUID PK DEFAULT gen_random_uuid()
key        TEXT UNIQUE NOT NULL  -- 'admin_email' | 'site_name' | 'site_description'
value      TEXT
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

#### `audit_log` (somente leitura — preenchida por triggers)
```sql
id           UUID PK DEFAULT gen_random_uuid()
table_name   TEXT NOT NULL
operation    TEXT NOT NULL  -- 'INSERT' | 'UPDATE' | 'DELETE'
record_id    UUID
old_data     JSONB
new_data     JSONB
user_email   TEXT
user_id      UUID
created_at   TIMESTAMPTZ DEFAULT now()
```

### Políticas RLS

| Tabela | Anon (público) | Authenticated + is_admin() |
|---|---|---|
| `projects` | SELECT | ALL (INSERT/UPDATE/DELETE/SELECT) |
| `bibliography` | SELECT | ALL |
| `testimonials` | SELECT onde active=true | ALL |
| `admin_settings` | — (bloqueado) | ALL |
| `audit_log` | — (bloqueado) | SELECT |

`is_admin()` — função SQL `SECURITY DEFINER STABLE` que verifica `LOWER(value) = LOWER(auth.jwt() ->> 'email')` em `admin_settings WHERE key = 'admin_email'`. Comparação case-insensitive garante robustez.

### Módulos do Frontend

```
src/
├── App.jsx                       — roteador principal (SPA)
├── main.jsx                      — entry point React
├── context/
│   ├── ThemeContext.jsx           — dark/light mode (localStorage)
│   └── AuthContext.jsx            — session + isAdmin state
├── lib/
│   └── supabaseClient.js          — instância do SDK Supabase
├── utils/
│   └── exportToCSV.js             — exportação CSV de projetos/bibliografia
└── components/
    ├── Home.jsx                   — página principal
    ├── Header.jsx                 — navbar com login e botão Exu
    ├── Footer.jsx
    ├── LoginModal.jsx             — modal de login (email+senha)
    ├── AboutSection.jsx
    ├── TimelineSection.jsx
    ├── CarouselSection.jsx        — Swiper
    ├── ProjectsSection.jsx        — cards / galeria / tabela + CSV
    ├── ProjectCard.jsx            — card com imagem de destaque
    ├── BibliographySection.jsx    — cards / galeria / tabela + CSV
    ├── BiblioCard.jsx             — card com imagem de destaque
    ├── ItemDetailPage.jsx         — detalhe com SafeEmbed sandboxado
    ├── GamesGallery.jsx           — galeria de jogos educativos
    └── ExuMode/
        ├── index.jsx              — guard de rota (session + isAdmin)
        ├── ExuLogin.jsx           — form de login (usado standalone)
        ├── ExuDashboard.jsx       — painel admin completo
        └── ExuTableEditor.jsx     — CRUD + read-only para audit_log
```

### Segurança de Embeds HTML

Todo conteúdo em `embed_code` é renderizado exclusivamente via:

```jsx
<iframe
  srcDoc={code}
  sandbox="allow-scripts allow-popups allow-forms"
  referrerPolicy="no-referrer"
  title="Conteúdo incorporado"
  loading="lazy"
/>
```

**O que o sandbox bloqueia:**
- `allow-same-origin` ausente → scripts do embed não acessam cookies, localStorage ou DOM do host
- `allow-top-navigation` ausente → não pode redirecionar o usuário para outra URL
- `referrerPolicy="no-referrer"` → não vaza URL do site para destinos externos
- Limite de 100KB no banco via `CHECK (octet_length(embed_code) <= 102400)`

### Headers de Segurança (vercel.json)

| Header | Valor | Proteção |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Força HTTPS, previne downgrade |
| `X-Frame-Options` | `SAMEORIGIN` | Previne clickjacking |
| `X-Content-Type-Options` | `nosniff` | Previne MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Proteção legada XSS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla vazamento de URL |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Desativa APIs desnecessárias |
| `Content-Security-Policy` | Restringe scripts, styles, frames, connect | Defesa em profundidade |

### Variáveis de Ambiente

```
VITE_SUPABASE_URL=      # URL pública do projeto Supabase (segura para expor)
VITE_SUPABASE_ANON_KEY= # Chave anon pública (RLS protege os dados)
```

A `service_role` key **nunca** é usada ou exposta no frontend.

### Migrations

| Arquivo | Conteúdo |
|---|---|
| `supabase_schema.sql` | Schema inicial: projects, bibliography, RLS básico, seed data |
| `migrations/002_features_and_admin.sql` | embed_code, featured_image_url, testimonials, admin_settings, is_admin() |
| `migrations/003_security_hardening.sql` | audit_log, triggers de auditoria, is_admin() case-insensitive, constraints de tamanho |

### Requisitos Não-Funcionais

| Atributo | Meta |
|---|---|
| Performance | First Paint < 2s, LCP < 3s (site estático no edge da Vercel) |
| Acessibilidade | WCAG AA — alt texts, roles ARIA, contraste adequado |
| Responsividade | Mobile-first, 320px+ |
| Dark Mode | Persistido em localStorage via ThemeContext |
| SEO | Estrutura semântica HTML5; meta tags no index.html |
| Segurança | OWASP Top 10 coberto para o perfil da aplicação |
| Auditoria | Todas as escritas no banco registradas automaticamente em audit_log |
