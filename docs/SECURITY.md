# Análise de Segurança — Prof. William Melo Site

**Data:** 2026-03-21
**Revisor:** Análise técnica full-stack + perspectiva ofensiva (red team)

---

## VERSÃO EM LINGUAGEM NATURAL

### O que um hacker poderia tentar?

Pensando como alguém mal-intencionado que quisesse causar dano a este site, as principais tentativas seriam:

1. **Injetar código malicioso nos embeds** — Se os embeds HTML fossem renderizados diretamente na página sem proteção, um código poderia roubar dados do visitante ou redirecionar para sites falsos. **Mitigação aplicada:** todos os embeds são renderizados em iframes com sandbox rigoroso — o código dentro do embed fica completamente isolado da página externa.

2. **Tentar editar dados sem ser admin** — Alguém poderia tentar chamar a API do Supabase diretamente pelo navegador para criar, editar ou deletar projetos. **Mitigação aplicada:** políticas de banco de dados (RLS) bloqueiam qualquer escrita que não venha de uma sessão autenticada com o e-mail admin. Mesmo que a pessoa descubra as chaves públicas da API, ela não consegue escrever nada.

3. **Tentar roubar a sessão do admin** — Se o token de sessão fosse armazenado de forma insegura ou a sessão nunca expirasse. **Mitigação:** Supabase usa tokens JWT com expiração, o logout destrói a sessão, e o token não é exposto em URLs.

4. **Tentar acessar o painel admin por URL** — Simplesmente digitando a rota `/exu` no navegador. **Mitigação:** o sistema verifica a sessão e o e-mail admin antes de exibir qualquer conteúdo do painel. Sem login válido do e-mail admin, o painel nem renderiza.

5. **Injetar scripts nos campos de texto (XSS)** — Digitar `<script>alert('xss')</script>` nos campos de título ou descrição e esperar que execute no navegador de quem visita. **Mitigação:** o React por padrão escapa todo HTML ao renderizar strings — nenhum script em campos de texto vai executar.

6. **Atacar por força bruta a senha do admin** — Tentar muitas senhas diferentes no login. **Mitigação:** o Supabase possui rate limiting nativo em tentativas de login.

7. **Vazar e-mail ou dados do admin** — A chave `anon` do Supabase é pública por design, mas as políticas RLS garantem que dados sensíveis (como o e-mail admin) só sejam lidos por quem já está autenticado como admin.

### O que foi corrigido nesta versão?

- Links externos agora sempre têm `rel="noopener noreferrer"` para evitar que páginas abertas controlem a original
- Embeds HTML em sandbox — sem exceções
- Validação no frontend antes de enviar dados ao banco
- Todas as escritas exigem autenticação verificada

---

## VERSÃO TÉCNICA

### Modelo de Ameaças (STRIDE)

| Ameaça | Risco | Mitigação |
|---|---|---|
| **Spoofing** — Falsificar identidade admin | Alto | Supabase Auth JWT + verificação `is_admin()` via RLS |
| **Tampering** — Alterar dados do banco | Alto | RLS: writes exigem `is_admin() = true` |
| **Repudiation** — Negar ações realizadas | Baixo | `created_at`/`updated_at` auditáveis |
| **Information Disclosure** — Vazar dados admin | Médio | `admin_settings` sem policy pública; `is_admin()` SECURITY DEFINER |
| **Denial of Service** | Baixo | Supabase rate limiting; site estático serve edge cache |
| **Elevation of Privilege** | Alto | JWT claims não manipuláveis pelo client; RLS server-side |

---

### OWASP Top 10 — Análise por Item

#### A01 — Broken Access Control
- **Status: MITIGADO**
- RLS habilitado em todas as tabelas
- Função `is_admin()` com `SECURITY DEFINER` verifica email no banco
- Client nunca recebe `service_role` key
- Rota `/exu` redireciona para login sem sessão válida

#### A02 — Cryptographic Failures
- **Status: MITIGADO**
- Comunicação via HTTPS (Supabase + Vercel)
- Senhas gerenciadas pelo Supabase (bcrypt internamente)
- Nenhum segredo exposto em variáveis `VITE_*` além de chaves públicas por design

#### A03 — Injection (SQL, HTML, JS)
- **Status: MITIGADO**
- SQL: Supabase SDK usa queries parametrizadas — zero SQL raw no client
- XSS em campos de texto: React escapa automaticamente em JSX
- HTML Injection via embed_code: renderizado via `<iframe sandbox>` sem `allow-same-origin`
- Sem `eval()` ou `innerHTML` direto no código de produção

```jsx
// SEGURO — embed isolado
<iframe
  srcDoc={item.embed_code}
  sandbox="allow-scripts allow-popups allow-forms"
  referrerPolicy="no-referrer"
/>

// NUNCA FAZER — seria vulnerável a XSS
<div dangerouslySetInnerHTML={{ __html: item.embed_code }} />
```

#### A04 — Insecure Design
- **Status: MITIGADO**
- Admin email armazenado no banco (não hardcoded)
- Separação clara entre dados públicos e administrativos
- Sem funções de debug expostas em produção

#### A05 — Security Misconfiguration
- **Status: PARCIALMENTE MITIGADO**
- Supabase anon key é pública por design (normal)
- Adicionar CSP headers via `vercel.json` ou `_headers` (ver abaixo)
- `.env` no `.gitignore`

**Headers de segurança recomendados (adicionar ao deploy):**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; frame-src *; connect-src 'self' https://*.supabase.co"
        }
      ]
    }
  ]
}
```

#### A06 — Vulnerable Components
- **Status: A MONITORAR**
- Dependências atuais em versões recentes (React 19, Supabase 2.87, Vite 7)
- Recomendação: rodar `npm audit` regularmente e configurar Dependabot

#### A07 — Identification and Authentication Failures
- **Status: MITIGADO**
- Autenticação delegada ao Supabase Auth (implementação auditada)
- Rate limiting nativo em `/auth/v1/token`
- Sessões com JWT expiráveis (padrão 1h access + refresh token)
- Logout explícito destrói sessão no servidor

#### A08 — Software and Data Integrity Failures
- **Status: MITIGADO**
- Sem deserialização insegura de dados externos
- Embeds HTML em sandbox impedem supply chain via embed

#### A09 — Security Logging and Monitoring
- **Status: BÁSICO**
- Supabase loga todas as chamadas de API
- Recomendação: configurar alertas no Supabase para operações de DELETE em massa

#### A10 — Server-Side Request Forgery (SSRF)
- **Status: N/A**
- Sem servidor próprio — frontend puro + Supabase BaaS
- Sem proxy de URLs no código

---

### Análise de Riscos Residuais

| Risco | Probabilidade | Impacto | Ação |
|---|---|---|---|
| Comprometimento da senha do admin | Baixa | Alto | Usar senha forte + verificar 2FA quando Supabase suportar |
| Abuse de embeds por admin desonestos | Muito baixa | Médio | Sandbox mitiga; o único admin é o proprietário do site |
| Supabase anon key encontrada em commits | Baixa | Baixo | Anon key é pública por design; girar se vazada com outras keys |
| Ataque de força bruta no login admin | Baixa | Alto | Rate limiting do Supabase cobre; considerar IP allowlist |

---

### Checklist de Deploy Seguro

- [ ] Variáveis de ambiente configuradas no painel do host (não no código)
- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY` **nunca** adicionada ao frontend
- [ ] RLS habilitado e políticas testadas no Supabase Dashboard
- [ ] Headers de segurança configurados (ver A05 acima)
- [ ] HTTPS forçado no domínio
- [ ] `npm audit` sem vulnerabilidades críticas
- [ ] Função `is_admin()` criada com `SECURITY DEFINER`
- [ ] Usuário admin criado no Supabase Auth (email + senha forte)
- [ ] Migration 002 aplicada no banco de produção
