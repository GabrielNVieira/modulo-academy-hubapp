# 🚀 Guia de Deploy Automático - Vercel

Este guia mostra como configurar deploy automático do módulo Academy para o Vercel.

## Opção 1: Integração Vercel (Recomendada) ⭐

### Vantagens:
- ✅ Configuração em 5 minutos
- ✅ Deploy automático em todos os commits
- ✅ Preview deployments para PRs
- ✅ Rollback com 1 clique
- ✅ Domínio customizado gratuito

### Passo a Passo:

1. **Acesse o Vercel**
   - Vá para https://vercel.com
   - Faça login com sua conta GitHub

2. **Importe o Projeto**
   - Clique em "Add New" → "Project"
   - Selecione o repositório: `GabrielNVieira/modulo-academy-hubapp`
   - Autorize o acesso se solicitado

3. **Configure o Build**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Variáveis de Ambiente** (opcional)
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build (1-2 minutos)
   - Seu site estará no ar! 🎉

### Como Funciona:

**Deploy Automático em Produção:**
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# ✅ Deploy automático inicia imediatamente!
```

**Preview Deployments:**
```bash
git checkout -b feature/nova-feature
git push origin feature/nova-feature
# ✅ Cria um preview deployment com URL única
```

**Pull Requests:**
- Cada PR recebe um deploy de preview
- URL única compartilhável
- Atualiza automaticamente a cada commit

---

## Opção 2: GitHub Actions + Vercel CLI

### Pré-requisitos:

1. **Instalar Vercel CLI localmente:**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login no Vercel:**
   ```bash
   vercel login
   ```

3. **Linkar o projeto:**
   ```bash
   cd modulo-academy-hubapp-main
   vercel link
   ```
   - Selecione seu scope/organização
   - Confirme ou crie um novo projeto

4. **Obter os tokens necessários:**
   ```bash
   # Token de autenticação
   # Vá para: https://vercel.com/account/tokens
   # Crie um novo token e copie

   # IDs do projeto
   cat .vercel/project.json
   # Copie: projectId e orgId
   ```

### Configurar GitHub Secrets:

1. Vá para o repositório no GitHub
2. Settings → Secrets and variables → Actions
3. Adicione os seguintes secrets:

   ```
   VERCEL_TOKEN=seu_token_aqui
   VERCEL_ORG_ID=seu_org_id_aqui
   VERCEL_PROJECT_ID=seu_project_id_aqui
   ```

### Workflow já está configurado!

O arquivo `.github/workflows/deploy.yml` já foi criado e irá:
- ✅ Rodar em todo push para `main`
- ✅ Rodar em todo pull request
- ✅ Fazer build do projeto
- ✅ Deploy automático para Vercel

---

## 📊 Comparação das Opções

| Recurso | Opção 1 (Vercel) | Opção 2 (GitHub Actions) |
|---------|------------------|--------------------------|
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Tempo de setup** | 5 minutos | 15-20 minutos |
| **Deploy automático** | ✅ Sim | ✅ Sim |
| **Preview deployments** | ✅ Sim | ✅ Sim |
| **Controle** | Médio | Alto |
| **Logs** | Interface Vercel | GitHub Actions |

---

## 🎯 Recomendação

**Use a Opção 1 (Integração Vercel)** se você quer:
- Setup rápido e fácil
- Interface amigável
- Zero configuração manual

**Use a Opção 2 (GitHub Actions)** se você precisa:
- Controle total do pipeline
- Customizações específicas
- Integrar com outros workflows

---

## 🔗 URLs Úteis

- Dashboard Vercel: https://vercel.com/dashboard
- Documentação: https://vercel.com/docs
- Criar Token: https://vercel.com/account/tokens
- Status: https://vercel-status.com

---

## 🆘 Troubleshooting

### Build falha com erro de memória
```json
// vercel.json
{
  "builds": [{
    "src": "package.json",
    "use": "@vercel/static-build",
    "config": {
      "maxLambdaSize": "50mb"
    }
  }]
}
```

### Variáveis de ambiente não estão sendo aplicadas
- Certifique-se de adicionar o prefixo `VITE_` nas variáveis
- Redeploy após adicionar novas variáveis

### Deploy está lento
- Verifique o tamanho do bundle: `npm run build`
- Considere code splitting adicional

---

## ✅ Checklist de Deploy

- [ ] Repositório commitado e pushado para GitHub
- [ ] Vercel conectado ao repositório
- [ ] Build settings configurados
- [ ] Variáveis de ambiente adicionadas (se necessário)
- [ ] Primeiro deploy bem-sucedido
- [ ] URL de produção funcionando
- [ ] Teste de deploy automático (novo commit)

---

**Pronto!** Agora todo commit em `main` irá automaticamente para produção! 🎉
