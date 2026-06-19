# Exportar PDF com Versão

> Plugin do Figma para exportar um frame em **PDF** já com **nome padronizado, data e versão** no nome do arquivo.

Uma forma rápida de exportar um frame em PDF nomeando o arquivo de maneira consistente — incluindo a data da exportação e o número da versão — direto do Figma, sem renomear nada à mão.

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

## 🎯 Recursos

- **Versão padronizada** — o campo aceita só números e ponto, e é normalizado para o formato `0.0` (ex.: `1` vira `1.0`).
- **Nome editável** — por padrão usa o nome do documento do Figma, com link rápido para restaurá-lo (*"usar nome do Figma"*).
- **Sufixo de layout automático** — marcando a opção *Layout*, o plugin acrescenta `(desktop)` ou `(mobile)` com base na largura do frame selecionado (≥ 400px = desktop).
- **Pré-visualização ao vivo** — o campo *Nome final* mostra exatamente como o arquivo será salvo, atualizando em tempo real.
- **Indicador de seleção** — mostra qual frame será exportado e bloqueia o botão quando nada está selecionado.
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

1. Selecione **um frame** na tela.
2. Rode o plugin (**Plugins → Development → Exportar PDF com Versão**).
3. Ajuste os campos:
   - **Versão** — ex.: `1.0`
   - **Nome do arquivo** — editável (ou use o nome do Figma)
   - **Layout** — marque para adicionar `(desktop)`/`(mobile)`
4. Confira o **Nome final** na pré-visualização.
5. Clique em **Exportar PDF** — o download começa automaticamente com o nome montado.

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

- **[`code.js`](code.js)** roda no sandbox do Figma. Ele lê a seleção atual, exporta o primeiro frame selecionado com `node.exportAsync({ format: "PDF" })` e envia os bytes para a UI. Também escuta `selectionchange` para manter a interface sincronizada.
- **[`ui.html`](ui.html)** é a interface (iframe). Ela monta o nome final do arquivo, mostra a pré-visualização e, ao receber os bytes do PDF, cria um `Blob` e dispara o download no navegador.

A comunicação entre os dois é feita via `postMessage` (`init`, `info`, `export`, `download`, `error`).

O plugin **não acessa a rede** (`networkAccess: ["none"]`) — tudo acontece localmente.

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
