# Manual de Utilização e Documentação Técnica — PoliCloud (IPPLN)

O **PoliCloud** é a plataforma de Intranet Escolar do **Instituto Politécnico Pascoal Luvualu do Namibe (IPPLN)**. O sistema oferece controlo de acessos por perfil (RBAC), gestão pedagógica de materiais, mural de avisos da turma, calendário de exames, comunicados oficiais e um painel de administração completo.

---

## 1. Resultado do Teste de Validação

> **Estado dos Ficheiros & Sintaxe JavaScript**: Todos os ficheiros do projeto (`sb.js`, `js/login.js`, `js/dashboard-aluno.js`, `js/dashboard-professor.js`, `js/noticias.js`, `js/mural.js`, `js/cloud.js`, `js/admin.js`) foram verificados com o compilador Node.js. **Sintaxe 100% válida e sem erros.**

### Resumo do Teste Funcional:
1. **Conexão ao Supabase (`sb.js`)**: O cliente `@supabase/supabase-js` liga-se com sucesso ao projeto real `https://qdvodepwatjnoczgfjgv.supabase.co`.
2. **Autenticação & Proteção de Rotas (`requireAuth`)**: Cada página valida o estado da sessão e redireciona automaticamente para `login.html` caso o utilizador não tenha o perfil (role) autorizado ou esteja desativado (`is_active = false`).
3. **Fluxo RPC "Criar Conta" em `admin.html`**:
   - Guarda a sessão do administrador (`getSession()`).
   - Regista o utilizador em `auth.users` via `signUp()`.
   - Executa a função PostgreSQL `admin_create_user_profile` enviando os parâmetros correspondentes.
   - Restaura obrigatoriamente a sessão do admin (`setSession()`).
   - Notifica via `toast()` e regista em `activity_log`.
4. **Desativar/Reativar Contas**: Atualiza diretamente a tabela `profiles` via `.update({ is_active: novoEstado })` sem chamadas desnecessárias a RPC ou Auth.

---

## 2. Como Iniciar a Aplicação Localmente

Para rodar a aplicação no seu ambiente local:

```bash
# 1. Instalar as dependências do projeto (caso ainda não estejam instaladas)
npm install

# 2. Iniciar o servidor de desenvolvimento Vite
npm run dev
```

A aplicação ficará disponível no navegador em `http://localhost:3000`.

---

## 3. Perfis de Utilizador & Permissões

O PoliCloud possui 3 perfis de utilizador com diferentes níveis de acesso:

| Perfil | Nível de Acesso | Páginas Permitidas |
| :--- | :--- | :--- |
| **Aluno** | Leitura dos materiais da sua turma/curso, envio de ficheiros para a sua turma, leitura de notícias e mural da turma. | `dashboard-aluno.html`, `noticias.html`, `mural.html`, `cloud.html` |
| **Professor** | Leitura e publicação no mural da turma, agendamento de eventos no calendário, upload de materiais para qualquer turma/curso. | `dashboard-professor.html`, `noticias.html`, `mural.html`, `cloud.html` |
| **Administrador** | Acesso total, incluindo gestão de utilizadores (criar/desativar), publicação de notícias oficiais, monitorização de serviços e auditoria. | `admin.html`, `dashboard-aluno.html`, `dashboard-professor.html`, `noticias.html`, `mural.html`, `cloud.html` |

---

## 4. Guia Passo a Passo de Utilização

### 4.1. Iniciar Sessão (Login)
1. Aceda a `login.html`.
2. Introduza o email institucional (ex.: `aluno@ippln.ao` ou `professor@ippln.ao`) e a palavra-passe.
3. Ao clicar em **Entrar na Intranet**, o sistema valida as credenciais no Supabase Auth e verifica na tabela `profiles` se a conta possui `is_active = true`.
4. É feito o redirecionamento automático para o dashboard correspondente ao seu perfil:
   - Administrador → `/admin.html`
   - Professor → `/dashboard-professor.html`
   - Aluno → `/dashboard-aluno.html`

---

### 4.2. Painel de Administração (`admin.html`)

#### **Como Criar Uma Nova Conta (Aluno ou Professor)**:
1. No menu lateral ou no topo do painel admin, clique em **Criar Utilizador**.
2. Selecione o tipo de conta: **Aluno** ou **Professor**.
3. Preencha os campos:
   - **Nome Completo**
   - **Email Institucional**
   - **Palavra-passe Inicial** (mínimo 6 caracteres)
   - Se for **Aluno**, selecione o **Curso**, a **Classe** (10ª a 13ª) e a **Turma** (A ou B).
4. Clique em **Criar Conta**.
5. O sistema executa o fluxo em 5 passos:
   - Preserva a sessão do administrador.
   - Regista as credenciais de login no Supabase Auth.
   - Executa a função `admin_create_user_profile` no banco de dados para gravar o perfil em `profiles` com `is_active = true`.
   - Restaura a sessão do administrador para que ele continue logado como Admin.
   - Atualiza a lista no ecrã e exibe a mensagem de sucesso: *"Conta criada com sucesso."*.

#### **Como Desativar ou Reativar Uma Conta**:
1. Na lista de utilizadores da aba **Utilizadores**, localize o utilizador desejado.
2. Na coluna **Ações**, clique no botão **Desactivar** (ou **Reactivar**).
3. Confirme a caixa de diálogo do navegador.
4. O sistema executa uma atualização direta em `profiles` (`is_active = false` ou `true`), exibe a notificação Toast e atualiza o estado imediatamente.

---

### 4.3. Cloud de Ficheiros & Materiais Pedagógicos (`cloud.html`)

#### **Como Subir (Upload) Ficheiros**:
1. Aceda a `cloud.html`.
2. Clique no botão **Carregar Ficheiro**.
3. Selecione ou arraste o documento (formatos aceites: PDF, DOCX, DOC, PNG, JPG, JPEG, WEBP; tamanho máximo: 15 MB).
4. Selecione a **Disciplina**, o **Curso**, a **Classe** e a **Turma** de destino.
5. Clique em **Submeter Ficheiro**.
6. O ficheiro é enviado para o bucket `policloud` do Supabase Storage e os metadados são gravados na tabela `files`.
7. **Versionamento Automático**: Se enviar um ficheiro com o mesmo nome para a mesma turma, o PoliCloud atribui automaticamente uma nova versão (`v2`, `v3`, etc.) sem apagar os ficheiros anteriores.

#### **Como Descarregar Ficheiros com Segurança**:
1. Na lista de ficheiros, clique no botão **Descarregar**.
2. O sistema solicita ao Supabase Storage uma **Signed URL** temporária protegida por RLS.
3. Se um ficheiro tiver histórico de edições, clique no botão **Histórico de Versões** para visualizar e descarregar versões antigas (`v1`, `v2`).

---

### 4.4. Mural da Turma & Calendário de Provas (`mural.html`)

#### **Como Publicar um Aviso no Mural (Professores e Admin)**:
1. Aceda a `mural.html`.
2. Clique em **Publicar Recado**.
3. Escolha a **Turma** de destino (ou Geral para todas).
4. Escreva a mensagem e marque a opção **Fixar no topo** se for um aviso prioritário.
5. Clique em **Publicar no Mural**.

#### **Como Agendar Provas ou Entregas no Calendário**:
1. Na aba **Calendário Escolar**, clique em **Adicionar Evento**.
2. Preencha o **Título da Avaliação**, selecione a **Categoria** (Exame, Entrega de Trabalho, Reunião, Prática), a **Data** e a **Turma**.
3. Clique em **Registar Evento**.

---

### 4.5. Notícias Oficiais (`noticias.html`)
- Todos os utilizadores podem ler as notícias da escola e abrir comunicados em destaque.
- Apenas Administradores visualizam o painel de criação e podem publicar notícias oficiais com foto de capa.

---

## 5. Estrutura de Tabelas na Base de Dados Supabase

| Tabela | Colunas Principais | Descrição |
| :--- | :--- | :--- |
| `profiles` | `id`, `nome`, `email`, `role`, `curso`, `classe`, `turma`, `is_active`, `created_at` | Perfis dos utilizadores ligados ao Auth. |
| `files` | `id`, `name`, `file_url`, `storage_path`, `size`, `mime_type`, `disciplina`, `curso`, `classe`, `turma`, `version`, `uploader_id`, `uploader_name`, `created_at` | Ficheiros e apontamentos pedagógicos. |
| `news` | `id`, `title`, `subtitle`, `content`, `cover_image_url`, `pinned`, `created_at` | Notícias e comunicados da escola. |
| `mural_posts` | `id`, `author_id`, `author_name`, `content`, `turma`, `pinned`, `created_at` | Recados e avisos das turmas. |
| `calendar_events` | `id`, `title`, `description`, `category`, `event_date`, `turma`, `created_by`, `created_at` | Calendário de provas e exames. |
| `activity_log` | `id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `created_at` | Registos de auditoria de ações no sistema. |

---

## 6. Função RPC de Referência (`admin_create_user_profile`)

A função PostgreSQL configurada no Supabase para criação segura de perfis:

```sql
CREATE OR REPLACE FUNCTION admin_create_user_profile(
  user_id uuid,
  full_name text,
  user_email text,
  user_role text,
  user_curso text DEFAULT NULL,
  user_classe text DEFAULT NULL,
  user_turma text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    role,
    curso,
    classe,
    turma,
    is_active,
    created_at
  )
  VALUES (
    user_id,
    full_name,
    user_email,
    user_role,
    user_curso,
    user_classe,
    user_turma,
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    curso = EXCLUDED.curso,
    classe = EXCLUDED.classe,
    turma = EXCLUDED.turma,
    is_active = true;
END;
$$;
```
