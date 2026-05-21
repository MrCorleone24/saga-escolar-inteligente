# Plano de Integração Supabase - EduBrasil

Este documento detalha a arquitetura necessária para integrar o backend do projeto EduBrasil com o Supabase, permitindo persistência de dados e funcionalidades em tempo real (como o sistema de salas de aula e chat).

## 1. Configuração do Projeto
**URL do Projeto:** `https://aozrzgrcyecnbwsbuueq.supabase.co`
**Public Key:** `sb_publishable_scbB-EG5RcDKCN3MU2XTgQ_L43pCJ-q`

## 2. Esquema de Banco de Dados (Tabelas)

### 2.1 Usuários e Perfis (`profiles`)
Estende o `auth.users` do Supabase para armazenar dados específicos da plataforma.
- `id`: uuid (primary key, references auth.users)
- `name`: text
- `role`: text (aluno, professor, admin)
- `xp`: integer (default 0)
- `level`: integer (default 1)
- `avatar_url`: text

### 2.2 Planejamento e Aulas (`lessons`)
- `id`: uuid (primary key)
- `title`: text
- `subject`: text
- `teacher_id`: uuid (references profiles)
- `date`: date
- `type`: text (interativa, caderno, video, mista)
- `content`: jsonb (dados da aula, lousa, etc.)

### 2.3 Caderno Digital (`notebook_entries`)
- `id`: uuid (primary key)
- `student_id`: uuid (references profiles)
- `lesson_id`: uuid (references lessons)
- `subject`: text
- `title`: text
- `content`: text
- `photo_url`: text
- `status`: text (rascunho, enviado, corrigido, confirmado)
- `grade`: text
- `teacher_note`: text
- `versions`: jsonb (histórico de feedbacks)

### 2.4 Salas Virtuais e Reuniões (`meeting_rooms`)
- `id`: uuid (primary key)
- `title`: text
- `subject`: text
- `teacher_id`: uuid (references profiles)
- `status`: text (active, scheduled, ended)
- `created_at`: timestamp

### 2.5 Chat e Mensagens (`messages`)
- `id`: uuid (primary key)
- `room_id`: uuid (references meeting_rooms)
- `user_id`: uuid (references profiles)
- `content`: text
- `time`: timestamp

## 3. Funcionalidades em Tempo Real (Supabase Realtime)

O Supabase Realtime será essencial para:
1. **Chat das Salas:** Inscrição no canal `room_id` para receber novas mensagens instantaneamente.
2. **Status dos Participantes:** Notificar quando um aluno levanta a mão ou altera status de microfone/câmera.
3. **Lousa Digital:** Sincronização de traços do canvas entre professor e alunos.
4. **Notificações:** Avisar alunos de novas correções e professores de novas entregas.

## 4. Próximos Passos de Implementação

1. **Instalação:** `npm install @supabase/supabase-js`.
2. **Inicialização:** Criar `src/lib/supabase.ts`.
3. **Migração:** Criar as tabelas via painel do Supabase ou SQL Editor.
4. **Auth:** Substituir o sistema de login mockado pelo `supabase.auth`.
5. **Realtime:** Implementar hooks customizados para escutar mudanças nas tabelas de mensagens e salas.

---
*Plataforma desenvolvida para o Ensino Fundamental 1-7 ano.*
