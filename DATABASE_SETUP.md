# PostgreSQL Database Setup - Academy Module

Este guia explica como configurar o PostgreSQL para o módulo Academy do Hub.App.

## Visão Geral

O módulo Academy suporta dois modos de operação:
- **Modo Mock (Desenvolvimento)**: Usa dados mockados em memória/localStorage
- **Modo PostgreSQL (Produção)**: Usa banco de dados PostgreSQL via Supabase

## Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Node.js 18+ e npm/yarn instalados

## Passo 1: Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Crie uma nova organização (se necessário)
3. Crie um novo projeto:
   - Nome: `academy-hubapp` (ou nome de sua preferência)
   - Database Password: Crie uma senha forte e salve em local seguro
   - Region: Escolha a região mais próxima
   - Clique em "Create new project"
4. Aguarde a criação do projeto (1-2 minutos)

## Passo 2: Executar Migrations SQL

Após o projeto estar pronto, execute as migrations na ordem:

### 2.1. Acessar SQL Editor

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New query**

### 2.2. Executar Migration 001 - Schema

1. Abra o arquivo `migrations/001_schema.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Verifique se apareceu "Success. No rows returned"

### 2.3. Executar Migration 002 - RLS Policies

1. Abra o arquivo `migrations/002_rls_policies.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor (nova query)
4. Clique em **Run**
5. Verifique se apareceu "Success"

### 2.4. Executar Migration 003 - Seed Data (Opcional)

1. Abra o arquivo `migrations/003_seed.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor (nova query)
4. Clique em **Run**
5. Verifique se apareceu "Success"

> **Nota**: O seed data inclui dados de exemplo (cursos, missões, badges). Você pode pular este passo se preferir começar com banco vazio.

## Passo 3: Configurar Variáveis de Ambiente

### 3.1. Obter Credenciais do Supabase

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon/public key**: Uma chave longa começando com `eyJ...`

### 3.2. Criar arquivo .env

1. Na raiz do projeto, copie o `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_USE_MOCK_DATA=false
   ```

3. **IMPORTANTE**: Nunca commite o arquivo `.env` para o Git!

## Passo 4: Instalar Dependências

As dependências necessárias já estão no `package.json`. Execute:

```bash
npm install
```

## Passo 5: Testar Conexão

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra o console do navegador (F12)
3. Procure por mensagens como:
   ```
   ✅ [Academy] Supabase client initialized
   📊 [Academy] Carregando progresso do PostgreSQL...
   ```

4. Se aparecer erro, verifique:
   - As credenciais no `.env` estão corretas?
   - As migrations foram executadas com sucesso?
   - O projeto Supabase está ativo?

## Estrutura do Banco de Dados

O banco de dados possui 12 tabelas principais:

### Tabelas de Conteúdo
- `academy_courses` - Cursos disponíveis
- `academy_lessons` - Lições de cada curso
- `academy_questions` - Perguntas de quiz
- `academy_missions` - Missões práticas
- `academy_badges` - Badges/conquistas
- `academy_levels` - Níveis de progressão

### Tabelas de Progresso
- `academy_user_progress` - Progresso geral do usuário
- `academy_course_progress` - Progresso em cursos
- `academy_lesson_progress` - Progresso em lições
- `academy_mission_progress` - Progresso em missões
- `academy_user_badges` - Badges conquistados
- `academy_xp_history` - Histórico de ganho de XP

## Segurança (RLS - Row-Level Security)

O banco usa **Row-Level Security** para garantir multi-tenancy:

- Cada tabela tem políticas RLS habilitadas
- Usuários só veem dados do seu `tenant_id`
- Usuários só veem seu próprio progresso (`user_id`)
- As políticas são configuradas automaticamente

### Importante para Integração com Hub.App

O contexto de sessão é configurado automaticamente pelo módulo:

```typescript
// Isso é feito automaticamente nos hooks
await setSessionContext(tenantId, userId);
```

Não é necessário configurar manualmente.

## Alternando Entre Mock e PostgreSQL

### Usar PostgreSQL (Produção)
```env
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### Usar Mock (Desenvolvimento Local)
```env
VITE_USE_MOCK_DATA=true
# OU simplesmente não configure as variáveis Supabase
```

## Arquitetura de Dados

### Repositories (src/services/)

O acesso ao banco é feito através de repositories:

- `progressRepository` - Gerencia progresso do usuário
- `courseRepository` - Gerencia cursos e lições
- `missionRepository` - Gerencia missões
- `badgeRepository` - Gerencia badges

### Hooks Atualizados

Os hooks foram atualizados para usar PostgreSQL quando disponível:

- `useProgress()` - Carrega e atualiza progresso
- `useMissions()` - Carrega e gerencia missões

Ambos fazem fallback automático para mocks se:
- `VITE_USE_MOCK_DATA=true`
- Supabase não está configurado
- Ocorre erro ao conectar

## Monitoramento e Logs

O módulo adiciona logs no console para facilitar debug:

```
✅ [Academy] Supabase client initialized
📊 [Academy] Carregando progresso do PostgreSQL...
💫 [Academy] Adicionando 50 XP via PostgreSQL...
🎯 [Academy] Completando missão via PostgreSQL...
```

Em caso de erro, você verá:
```
❌ [Academy] Erro ao carregar progresso: [mensagem do erro]
📊 [Academy] Fallback para dados mockados após erro
```

## Troubleshooting

### Erro: "Supabase not configured"

**Causa**: Variáveis de ambiente não configuradas ou incorretas

**Solução**:
1. Verifique se o arquivo `.env` existe
2. Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
3. Reinicie o servidor (`npm run dev`)

### Erro: "permission denied for table academy_courses"

**Causa**: Policies RLS não configuradas corretamente

**Solução**:
1. Execute novamente a migration `002_rls_policies.sql`
2. Verifique se as policies foram criadas em **Database** > **Policies** no Supabase

### Erro: "Token expirado"

**Causa**: Sessão do Hub.App expirou

**Solução**:
- O módulo já trata isso automaticamente solicitando novo token ao Hub
- Se persistir, faça logout e login novamente no Hub.App

### Dados não aparecem após migrations

**Causa**: Seed data não foi executado ou `tenant_id` não coincide

**Solução**:
1. Execute a migration `003_seed.sql`
2. Ou crie dados manualmente via SQL Editor
3. Certifique-se de usar o mesmo `tenant_id` do seu contexto Hub

## Backup e Restore

### Fazer Backup

No painel Supabase:
1. Vá em **Database** > **Backups**
2. Clique em **Start a backup**
3. Aguarde conclusão

### Restore de Backup

1. Vá em **Database** > **Backups**
2. Encontre o backup desejado
3. Clique em **Restore**

## Próximos Passos

1. ✅ Configurar PostgreSQL
2. ✅ Executar migrations
3. ✅ Configurar variáveis de ambiente
4. ✅ Testar integração
5. 📝 Criar conteúdo personalizado (cursos, missões)
6. 🚀 Deploy em produção

## Suporte

- Documentação Supabase: https://supabase.com/docs
- Issues do projeto: Reporte bugs e sugestões
- Logs: Sempre verifique o console do navegador primeiro
