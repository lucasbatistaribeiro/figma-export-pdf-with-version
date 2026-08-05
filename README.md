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

Selecione quantas telas quiser e escolha o modo de exportação. O seletor **Como exportar** só aparece a partir de **duas telas selecionadas** — com uma só, os dois modos gerariam exatamente o mesmo arquivo. A escolha fica guardada: se a seleção diminuir para uma tela e voltar a crescer, o modo escolhido continua lá.

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

## 🗜️ Compressão

O PDF vetorial do Figma é ótimo em qualidade, mas pesado — especialmente com imagens embutidas. O campo **Compressão** troca qualidade por tamanho:

| Opção | Resolução | Qualidade JPEG |
|-------|-----------|----------------|
| **Nenhuma** | vetorial (sem rasterizar) | — |
| **Leve** | 144 DPI | 92% |
| **Média** | 108 DPI | 82% |
| **Máxima** | 72 DPI | 65% |
| **Personalizada** | 36–288 DPI | 30–100% |

Com qualquer opção diferente de *Nenhuma*, as telas são rasterizadas e embutidas como JPEG. **O texto deixa de ser selecionável** — é a troca em jogo. A redução costuma ficar entre 80% e 95% em telas com imagens.

### Prévia do tamanho final

Clique em **calcular tamanhos** para ver, antes de exportar, quanto cada arquivo vai pesar:

```
Telas selecionadas — 3 tela(s)              recalcular
1  Home                        1,8 MB  89 KB
2  Login                       410 KB  64 KB
3  Dashboard                   3,0 MB  105 KB
Total: 5,1 MB → 258 KB (−95%)
```

Os valores são **medidos, não estimados**: o plugin realmente exporta e monta os arquivos para calcular. Os nomes na pré-visualização também passam a mostrar o tamanho de cada um.

Duas observações:

- No modo *PDF único* **sem** compressão o total aparece com `≈`, porque o tamanho real só é conhecido depois da exportação (o Figma compartilha fontes entre as páginas). Com compressão, o número é exato.
- Depois de calcular, exportar é instantâneo — os bitmaps ficam em cache e são reaproveitados. As medições do PDF vetorial (a parte lenta) sobrevivem à troca de preset de compressão.

## 🎯 Recursos

- **Exportação em lote** — exporta todas as telas selecionadas de uma vez, como arquivos separados ou como um PDF único multipágina.
- **Compressão opcional** — 3 presets + modo personalizado (resolução e qualidade JPEG), com aviso claro de que o texto deixa de ser selecionável.
- **Prévia de tamanho medida** — mostra o peso final de cada arquivo e o total antes/depois, com o percentual de redução.
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
   - **Como exportar** — *Arquivos separados* ou *PDF único* (aparece com 2+ telas)
   - **Versão** — ex.: `1.0`
   - **Nome do arquivo** — editável (ou use o nome do Figma)
   - **Layout** — marque para adicionar `(desktop)`/`(mobile)`
   - **Compressão** — deixe em *Nenhuma* para PDF vetorial, ou escolha um preset
4. Confira a lista de telas (e a ordem, no modo *PDF único*) e o **Nome final** na pré-visualização.
5. *(Opcional)* Clique em **calcular tamanhos** para ver o peso de cada arquivo antes de exportar.
6. Clique em **Exportar** — os downloads começam automaticamente com os nomes montados.

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

### Como a compressão é feita

A API de plugins do Figma **não expõe qualidade nem compressão** no export de PDF (`ExportSettingsPDF` só aceita o formato), e plugins não podem carregar bibliotecas externas. O caminho é montar o PDF na mão:

1. `code.js` exporta cada tela em **PNG** na escala escolhida (`constraint: { type: "SCALE" }`), limitando o bitmap a 8000 px por lado e 40 MP de área;
2. `ui.html` decodifica o PNG num `<canvas>`, achata sobre branco (JPEG não tem transparência) e reencoda com `canvas.toBlob("image/jpeg", qualidade)`;
3. `buildImagePdf()` escreve um PDF mínimo com o JPEG embutido **cru**, via filtro `DCTDecode` — o formato aceita os bytes do JPEG sem reencodar, então não há perda extra;
4. o `MediaBox` de cada página usa o tamanho do frame em pontos, independente da escala do bitmap — é isso que define o DPI (`72 × escala`).

Com compressão ligada, o **PDF único não precisa da página temporária**: o multipágina é montado direto a partir dos bitmaps, sem tocar no documento.

O tamanho reportado na prévia é o tamanho real do arquivo montado, byte a byte — não uma estimativa.

O plugin **não acessa a rede** (`networkAccess: ["none"]`) — tudo acontece localmente.

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
