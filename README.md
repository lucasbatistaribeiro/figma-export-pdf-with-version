# Exportar PDF com Versão

> Plugin do Figma para exportar uma ou várias telas em **PDF** já com **nome padronizado, data e versão** no nome do arquivo.

Uma forma rápida de exportar telas em PDF nomeando os arquivos de maneira consistente — incluindo a data da exportação e o número da versão — direto do Figma, sem renomear nada à mão. Dá para exportar **um PDF por tela** ou juntar tudo em **um único PDF multipágina**.

<p align="center">
  <img src="assets/screenshot.png" alt="Interface do plugin Exportar PDF com Versão" width="380" />
</p>

---

## ✨ O que ele faz

Ao exportar, o plugin monta automaticamente um nome de arquivo no formato:

```
NomeDoArquivo (layout)-DD.MM.AAAA-v.X.Y.pdf
```

Exemplo real:

```
Home (desktop)-18.06.2026-v.1.0.pdf
```

Cada parte do nome é montada a partir dos campos da interface:

| Parte | Origem | Exemplo |
|-------|--------|---------|
| **Nome do arquivo** | Campo editável (ou nome do documento do Figma) | `Home` |
| **Layout** *(opcional)* | Checkbox — detecta `(desktop)` ou `(mobile)` pela largura do frame | `(desktop)` |
| **Data** | Data atual, formato `DD.MM.AAAA` | `18.06.2026` |
| **Versão** | Campo de versão, normalizado para `X.Y` | `v.1.0` |

## 🖼️ Exportando várias telas

Selecione quantas telas quiser e escolha o modo de exportação:

### Arquivos separados — 1 PDF por tela

Gera um PDF por tela selecionada, todos com a mesma data e versão. Com **mais de uma** tela, o nome do frame entra no arquivo:

```
Projeto-Home (desktop)-18.06.2026-v.1.0.pdf
Projeto-Login (mobile)-18.06.2026-v.1.0.pdf
```

Com apenas **uma** tela selecionada, o nome segue o formato original (sem o nome do frame). O sufixo de layout é calculado por tela, então cada arquivo recebe `(desktop)` ou `(mobile)` conforme a própria largura.

### PDF único — 1 página por tela

Gera **um só arquivo** com uma página por tela, na ordem mostrada na lista (use as setas ▲▼ para reordenar):

```
Projeto (desktop+mobile)-18.06.2026-v.1.0.pdf
```

Quando as telas têm larguras mistas, o sufixo de layout vira `(desktop+mobile)`.

## 🎯 Recursos

- **Exportação em lote** — exporta todas as telas selecionadas de uma vez, como arquivos separados ou como um PDF único multipágina.
- **Lista ordenável** — mostra as telas selecionadas com dimensões; no modo *PDF único* a ordem da lista define a ordem das páginas.
- **Versão padronizada** — o campo aceita só números e ponto, e é normalizado para o formato `0.0` (ex.: `1` vira `1.0`).
- **Nome editável** — por padrão usa o nome do documento do Figma, com link rápido para restaurá-lo (*"usar nome do Figma"*).
- **Sufixo de layout automático** — marcando a opção *Layout*, o plugin acrescenta `(desktop)` ou `(mobile)` com base na largura do frame (≥ 400px = desktop).
- **Pré-visualização ao vivo** — o campo *Nome final* mostra exatamente como os arquivos serão salvos, atualizando em tempo real.
- **Nomes sem colisão** — nomes de arquivo repetidos no mesmo lote recebem sufixo numérico automático, e caracteres inválidos (`/ \ : * ? " < > |`) são trocados por `-`.
- **Progresso** — o botão mostra `Exportando 3/8 — Nome da tela` durante o lote.
- **Tema nativo** — segue automaticamente o tema claro/escuro do Figma (`themeColors`).

## 📦 Instalação (modo desenvolvimento)

Como o plugin ainda não está publicado na Figma Community, você o roda localmente:

1. Clone ou baixe este repositório:
   ```bash
   git clone https://github.com/lucasbatistaribeiro/figma-export-pdf-with-version.git
   ```
2. No **Figma Desktop**, vá em **Menu → Plugins → Development → Import plugin from manifest…**
3. Selecione o arquivo [`manifest.json`](manifest.json) deste repositório.
4. Pronto — o plugin aparecerá em **Plugins → Development → Exportar PDF com Versão**.

> O Figma Desktop é necessário para importar plugins em modo de desenvolvimento.

## 🚀 Como usar

1. Selecione **uma ou mais telas** no canvas.
2. Rode o plugin (**Plugins → Development → Exportar PDF com Versão**).
3. Ajuste os campos:
   - **Como exportar** — *Arquivos separados* ou *PDF único*
   - **Versão** — ex.: `1.0`
   - **Nome do arquivo** — editável (ou use o nome do Figma)
   - **Layout** — marque para adicionar `(desktop)`/`(mobile)`
4. Confira a lista de telas (e a ordem, no modo *PDF único*) e o **Nome final** na pré-visualização.
5. Clique em **Exportar** — os downloads começam automaticamente com os nomes montados.

> Ao exportar vários arquivos, o navegador pode pedir permissão para "baixar vários arquivos". Aceite uma vez e os downloads seguintes passam direto.

## 🗂️ Estrutura do projeto

```
.
├── manifest.json     # Configuração do plugin (nome, id, entrypoints)
├── code.js           # Lógica no contexto do Figma (exporta o frame em PDF)
├── ui.html           # Interface + lógica de nomeação e download
├── assets/
│   └── screenshot.png
└── README.md
```

## 🛠️ Como funciona

O plugin é dividido em dois contextos, como toda extensão do Figma:

- **[`code.js`](code.js)** roda no sandbox do Figma. Ele lê a seleção atual, exporta as telas com `exportAsync({ format: "PDF" })` e envia os bytes para a UI. Também escuta `selectionchange` para manter a interface sincronizada.
- **[`ui.html`](ui.html)** é a interface (iframe). Ela monta os nomes dos arquivos, mostra a pré-visualização e, ao receber os bytes de cada PDF, cria um `Blob` e dispara o download no navegador — em fila, com um pequeno intervalo entre arquivos para o navegador não descartar downloads simultâneos.

A comunicação entre os dois é feita via `postMessage` (`init`, `info`, `export`, `progress`, `download`, `finished`, `error`).

### Como o PDF único é gerado

A API de plugins do Figma exporta **um nó por vez**, e não existe função para juntar PDFs. Para produzir um arquivo multipágina, o plugin usa o mesmo caminho do *Export Frames to PDF* nativo:

1. cria uma **página temporária** (`[export-pdf] temporário`);
2. coloca uma **cópia** de cada tela selecionada nessa página, empilhada de cima para baixo na ordem definida na UI (a ordem das páginas do PDF segue a posição no canvas);
3. exporta a **página inteira** com `page.exportAsync({ format: "PDF" })` — cada frame de nível superior vira uma página;
4. **remove a página temporária** (em `finally`, mesmo se a exportação falhar).

As telas originais não são movidas nem alteradas — só clonadas. A criação/remoção da página temporária aparece no histórico de desfazer (`Ctrl/Cmd+Z`).

O plugin **não acessa a rede** (`networkAccess: ["none"]`) — tudo acontece localmente.

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
