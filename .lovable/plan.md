
# Plataforma Escolar - Expansao Completa (Ensino Fundamental 1-7 ano)

## Resumo

Expansao massiva da plataforma com foco no Ensino Fundamental (1 ao 7 ano), criando um ecossistema funcional de aulas interativas, lousa digital com canvas real, caderno digital do aluno, sistema de presenca gamificado e check-in de leitura. Tudo com dados simulados (mock) ja que nao ha backend conectado.

---

## 1. Lousa Digital Funcional

**Arquivo:** `src/pages/Lousa.tsx` (reescrever)
**Novo componente:** `src/components/lousa/CanvasBoard.tsx`

- Canvas HTML5 real com suporte a:
  - Desenho livre (caneta com cores e espessura ajustavel)
  - Ferramenta de texto (clicar e digitar)
  - Borracha
  - Formas geometricas (retangulo, circulo, linha)
  - Painel de emojis (grid com categorias: rostos, maos, animais, escola, natureza)
  - Stickers animados (estrela pulsante, coracao, fogos, medalha - usando framer-motion sobre o canvas)
  - Desfazer/refazer (undo/redo com historico de estados)
- Exportar como PDF usando a API nativa do canvas (toDataURL) + jsPDF ou window.print()
- Barra de ferramentas moderna na parte superior
- Paleta de cores expandida
- Zoom e pan no canvas

---

## 2. Area do Professor - Planejamento Completo

### 2a. Planejamento Semanal Completo
**Arquivo:** `src/pages/Planejamento.tsx` (reescrever)
**Novos componentes:**
- `src/components/planejamento/WeeklyPlanGrid.tsx` - Grade semanal (Seg-Sex) x horarios
- `src/components/planejamento/LessonPlanForm.tsx` - Formulario de criacao de aula
- `src/components/planejamento/LessonCard.tsx` - Card de aula na grade

Funcionalidades:
- Selecao de ano escolar (1 ao 7 ano)
- Grade semanal visual com todas as materias do fundamental brasileiro (Portugues, Matematica, Ciencias, Historia, Geografia, Ingles, Ed. Fisica, Artes, Ensino Religioso)
- Criar aula manualmente ou com agente IA (botao "Gerar com IA")
- Tipos de aula: Interativa, Caderno, Mista (ambos)
- Cada aula tem: titulo, objetivos BNCC, instrucoes claras para o aluno ("Leia e escreva no caderno", "Leia e digite ao lado"), materiais, duracao
- Opcao de aula por video YouTube (campo de URL do video)
- Opcao de aula de documentario com atividade (teste, interpretacao, prova)
- Visualizacao por dia, semana, mes

### 2b. Criacao de Aula com Detalhes
**Novo arquivo:** `src/pages/CriarAula.tsx`
**Nova rota:** `/criar-aula`

Formulario completo:
- Selecionar ano (1-7), materia, tipo (interativa/caderno/mista)
- Conteudo da aula: editor de texto rico (textarea com formatacao basica)
- Instrucoes para o aluno (campo dedicado com exemplos: "Leia o texto abaixo e copie no caderno")
- Upload de imagens de apoio
- Link de video YouTube (com preview embed)
- Gerar automaticamente com IA (prompt para o agente)
- Atividades vinculadas: exercicios, teste, prova, pesquisa
- Preview da aula como o aluno vera

### 2c. Caderno Digital do Aluno (visao professor)
**Novo arquivo:** `src/pages/CadernoAlunos.tsx`
**Nova rota:** `/caderno-alunos`

- Lista de alunos com filtro por turma/materia
- Ver caderno digital de cada aluno (entradas por data e materia)
- Opcao de editar, comentar e corrigir entradas
- Ver fotos de caderno fisico enviadas pelo aluno
- Indicador de status (corrigido, pendente, devolvido)

---

## 3. Area do Aluno - Aulas e Caderno

### 3a. Pagina de Aula Individual
**Novo arquivo:** `src/pages/AulaView.tsx`
**Nova rota:** `/aula/:id`

Layout inteligente que se adapta ao tipo:
- **Aula Interativa:** Conteudo a esquerda, area de digitacao (caderno digital) a direita
  - Texto para leitura com destaque
  - Area de digitacao com campo de data, materia, separado por secoes
  - Exercicios interativos inline (multipla escolha, completar, arrastar)
  - Testes e provas com timer opcional
- **Aula de Caderno:** Conteudo e instrucoes claras ("Leia e escreva no caderno")
  - Botao de upload de foto do caderno (camera/galeria)
  - Preview da foto enviada
  - Status: enviado, corrigido, devolvido
- **Aula Mista:** Ambas opcoes disponiveis
- **Aula por Video:** Player YouTube embed + atividade abaixo
- **Aula Documentario:** Video + atividade especifica (teste, interpretacao, prova)

### 3b. Caderno Digital do Aluno
**Novo arquivo:** `src/pages/MeuCaderno.tsx`
**Nova rota:** `/meu-caderno`
**Novo nav item** no DashboardLayout para role aluno

- Organizado por materia (tabs)
- Entradas por data (como um diario)
- Campo de texto para digitacao
- Opcao de selecionar data
- Upload de foto do caderno fisico
- Historico de todas as entradas
- Indicador de correcao do professor (nota, comentarios)

### 3c. Calendario Escolar do Aluno
**Novo arquivo:** `src/pages/CalendarioEscolar.tsx`
**Nova rota:** `/calendario`

- Visao de calendario mensal
- Cada dia mostra as aulas registradas
- Status de cada aula (concluida, pendente, atrasada)
- Check-in de presenca gamificado por dia
- Historico de presenca visual

---

## 4. Sistema de Presenca Gamificado

**Novo componente:** `src/components/presenca/CheckInPresenca.tsx`

Integrado na pagina de aula e no calendario:
- Botao de check-in animado (estilo "slide to check-in" ou botao grande com animacao)
- Ao fazer check-in: explosao de confetti/particulas, +XP, streak counter
- Opcao de tirar foto (simulated com input file accept="image/*" capture="user")
- Registro visual no calendario com emoji de status
- Streak de presenca (dias consecutivos) com badges especiais
- XP por presenca diaria (+10 XP), bonus por streak (+5 extra a cada 5 dias)

---

## 5. Check-in de Leitura

**Novo arquivo:** `src/pages/Leitura.tsx` (area aluno)
**Nova rota:** `/leitura`
**Novo nav item** no DashboardLayout

### Visao do Aluno:
- Lista de leituras atribuidas pelo professor
- Para cada leitura: titulo, autor, paginas, prazo
- Botao de check-in diario gamificado ("Li hoje!")
- Registro de paginas lidas, comentario opcional
- Barra de progresso do livro
- XP por cada check-in de leitura
- Badges especiais: "Leitor do Mes", "10 dias de leitura", etc.

### Visao do Professor:
**Novo arquivo:** `src/pages/GerenciarLeitura.tsx`
**Nova rota:** `/gerenciar-leitura`

- Criar atribuicoes de leitura por turma/aluno
- Ver dashboard de check-ins por aluno
- Aprovar/rejeitar check-ins
- Relatorio de leitura da turma

---

## 6. Atualizacoes de Navegacao

**Arquivo:** `src/components/DashboardLayout.tsx`

Novos itens de navegacao:
- Aluno: "Meu Caderno" (`/meu-caderno`), "Calendario" (`/calendario`), "Leitura" (`/leitura`)
- Professor: "Caderno dos Alunos" (`/caderno-alunos`), "Gerenciar Leitura" (`/gerenciar-leitura`)

**Arquivo:** `src/App.tsx`

Novas rotas: `/criar-aula`, `/aula/:id`, `/meu-caderno`, `/calendario`, `/leitura`, `/caderno-alunos`, `/gerenciar-leitura`

---

## 7. Dados Mock Realistas

Todos os dados serao mock (arrays de objetos) com conteudo educacional real e alinhado a BNCC para Ensino Fundamental:
- Aulas de Portugues: textos de leitura, caligrafia, interpretacao
- Matematica: problemas de adicao/subtracao ate algebra basica conforme o ano
- Ciencias: experimentos, ciclo da agua, corpo humano
- Historia: historia do Brasil, indigenas, colonizacao
- Conteudo progressivo por ano (1 ano = alfabetizacao, 7 ano = pre-adolescente)

---

## Arquivos Novos (total: ~12)

| Arquivo | Descricao |
|---------|-----------|
| `src/components/lousa/CanvasBoard.tsx` | Canvas de desenho funcional |
| `src/components/planejamento/WeeklyPlanGrid.tsx` | Grade semanal do professor |
| `src/components/planejamento/LessonPlanForm.tsx` | Formulario de aula |
| `src/components/presenca/CheckInPresenca.tsx` | Check-in gamificado |
| `src/pages/CriarAula.tsx` | Criacao de aula completa |
| `src/pages/AulaView.tsx` | Visualizacao de aula (aluno) |
| `src/pages/MeuCaderno.tsx` | Caderno digital do aluno |
| `src/pages/CalendarioEscolar.tsx` | Calendario escolar |
| `src/pages/Leitura.tsx` | Check-in de leitura (aluno) |
| `src/pages/CadernoAlunos.tsx` | Cadernos dos alunos (professor) |
| `src/pages/GerenciarLeitura.tsx` | Gerenciar leitura (professor) |

## Arquivos Modificados (total: ~4)

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Lousa.tsx` | Reescrita com canvas real |
| `src/pages/Planejamento.tsx` | Reescrita com grade semanal |
| `src/components/DashboardLayout.tsx` | Novos itens de navegacao |
| `src/App.tsx` | Novas rotas |

---

## Nota Tecnica

- Todos os dados sao mock/front-end apenas (sem backend)
- Canvas usa API nativa do HTML5 Canvas 2D
- Exportacao PDF via `canvas.toDataURL('image/png')` + criacao de link de download
- Upload de fotos simulado com `<input type="file" accept="image/*">`
- Videos YouTube via iframe embed
- Nenhuma dependencia nova necessaria (tudo com React, framer-motion, lucide-react, recharts ja instalados)
