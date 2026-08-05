// ===== Plugin: Exportar PDF com Versão =====
// Roda no contexto do Figma (sem acesso ao DOM).
// A exportação dos bytes e o download são feitos pela UI (ui.html).

figma.showUI(__html__, { width: 400, height: 700, themeColors: true });

// Página temporária usada para gerar o PDF único (multipágina) sem compressão.
const TEMP_PAGE_NAME = "[export-pdf] temporário";
// Espaço entre as telas na página temporária.
const GAP = 200;
// Nós que não podem ser colocados dentro de um frame.
const NO_WRAP = ["SECTION"];
// Limite de escala da API de export.
const MAX_SCALE = 4;
// Tetos do bitmap ao rasterizar, para não estourar o canvas da UI nem a memória.
const MAX_RASTER_SIDE = 8000;
const MAX_RASTER_AREA = 40e6;

function canExport(node) {
  return typeof node.exportAsync === "function";
}

// Envia para a UI o estado atual: nome do documento e o que está selecionado.
function sendInfo() {
  const selection = figma.currentPage.selection;
  const nodes = selection.filter(canExport).map((n) => ({
    id: n.id,
    name: n.name,
    type: n.type,
    // largura usada para o sufixo de layout
    width: typeof n.width === "number" ? Math.round(n.width) : null,
    height: typeof n.height === "number" ? Math.round(n.height) : null,
  }));

  figma.ui.postMessage({
    type: "info",
    docName: figma.root.name,
    selectionCount: selection.length,
    nodes,
  });
}

function progress(purpose, done, total, label) {
  figma.ui.postMessage({ type: "progress", purpose, done, total, label });
}

// Resolve ids em nós exportáveis, preservando a ordem recebida da UI.
async function resolveNodes(ids) {
  const nodes = [];
  for (const id of ids) {
    const node = await figma.getNodeByIdAsync(id);
    if (node && !node.removed && canExport(node)) nodes.push(node);
  }
  return nodes;
}

function noExportableSelection() {
  figma.ui.postMessage({
    type: "error",
    message: "Nenhuma das telas selecionadas pôde ser exportada.",
  });
}

// ---- Modo 1: um PDF por tela (vários arquivos) ----
async function exportSeparate(items) {
  const total = items.length;
  let done = 0;

  for (const item of items) {
    const node = await figma.getNodeByIdAsync(item.id);
    if (!node || node.removed || !canExport(node)) continue;

    progress("export", done, total, node.name);
    const bytes = await node.exportAsync({ format: "PDF" });
    done++;

    figma.ui.postMessage({
      type: "download",
      bytes,
      fileName: item.fileName,
      done,
      total,
    });
  }

  if (done === 0) {
    noExportableSelection();
    return;
  }

  figma.ui.postMessage({ type: "finished", mode: "separate", total: done });
}

// ---- Modo 2: PDF único com uma página por tela ----
// A API do Figma exporta um nó por vez. Para gerar um PDF multipágina vetorial,
// o plugin cria uma página temporária, empilha uma cópia de cada tela nela (a
// ordem do PDF segue a posição no canvas, de cima para baixo) e exporta a página
// inteira. A página temporária é sempre removida no final.
async function exportSingle(ids, fileName) {
  const nodes = await resolveNodes(ids);

  if (nodes.length === 0) {
    noExportableSelection();
    return;
  }

  const total = nodes.length;
  let tempPage = null;

  try {
    progress("export", 0, total, "Montando páginas…");
    tempPage = figma.createPage();
    tempPage.name = TEMP_PAGE_NAME;

    let y = 0;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const clone = node.clone();

      if (NO_WRAP.indexOf(clone.type) !== -1) {
        // Sections não podem ficar dentro de um frame.
        tempPage.appendChild(clone);
        clone.x = 0;
        clone.y = y;
        y += (clone.height || 1) + GAP;
      } else {
        // Cada tela entra em um frame de nível superior -> uma página no PDF.
        const w = Math.max(1, Math.round(clone.width || 1));
        const h = Math.max(1, Math.round(clone.height || 1));

        const wrapper = figma.createFrame();
        wrapper.name = node.name;
        wrapper.resize(w, h);
        wrapper.fills = [];
        wrapper.clipsContent = false;

        tempPage.appendChild(wrapper);
        wrapper.appendChild(clone);
        clone.x = 0;
        clone.y = 0;
        wrapper.x = 0;
        wrapper.y = y;
        y += h + GAP;
      }

      progress("export", i + 1, total, node.name);
    }

    await tempPage.loadAsync();
    const bytes = await tempPage.exportAsync({ format: "PDF" });

    figma.ui.postMessage({
      type: "download",
      bytes,
      fileName,
      done: 1,
      total: 1,
    });
    figma.ui.postMessage({ type: "finished", mode: "single", total });
  } finally {
    if (tempPage && !tempPage.removed) {
      try {
        tempPage.remove();
      } catch (e) {
        figma.ui.postMessage({
          type: "error",
          message:
            'Não foi possível remover a página temporária "' +
            TEMP_PAGE_NAME +
            '". Apague-a manualmente.',
        });
      }
    }
  }
}

// ---- Rasterização (usada pela compressão e pela prévia de tamanho) ----
// A API não expõe qualidade/compressão no export de PDF. Para comprimir, o
// plugin exporta a tela em PNG numa escala escolhida e a UI reencoda em JPEG
// (canvas) antes de montar o PDF. Aqui só produzimos os bitmaps.

// Limita a escala pelos tetos de lado e de área do bitmap.
function effectiveScale(node, scale) {
  const w = Math.max(1, node.width || 1);
  const h = Math.max(1, node.height || 1);
  const limit = Math.min(
    MAX_RASTER_SIDE / w,
    MAX_RASTER_SIDE / h,
    Math.sqrt(MAX_RASTER_AREA / (w * h)),
    MAX_SCALE
  );
  return Math.max(0.05, Math.min(scale, limit));
}

// purpose: "measure" (prévia de tamanho) ou "export".
// scale: null = não rasteriza; wantNative: também mede o PDF vetorial.
async function rasterize(purpose, ids, scale, wantNative) {
  const nodes = await resolveNodes(ids);

  if (nodes.length === 0) {
    noExportableSelection();
    return;
  }

  const total = nodes.length;

  for (let i = 0; i < total; i++) {
    const node = nodes[i];
    progress(purpose, i, total, node.name);

    let nativeSize = null;
    if (wantNative) {
      const pdf = await node.exportAsync({ format: "PDF" });
      nativeSize = pdf.length;
    }

    let bytes = null;
    let usedScale = null;
    if (scale) {
      usedScale = effectiveScale(node, scale);
      bytes = await node.exportAsync({
        format: "PNG",
        constraint: { type: "SCALE", value: usedScale },
      });
    }

    figma.ui.postMessage({
      type: "raster",
      purpose,
      id: node.id,
      name: node.name,
      // tamanho da página no PDF, em pontos (independente da escala do bitmap)
      ptW: Math.max(1, Math.round(node.width || 1)),
      ptH: Math.max(1, Math.round(node.height || 1)),
      nativeSize,
      bytes,
      scale: usedScale,
      clamped: scale != null && usedScale < scale - 0.001,
      index: i + 1,
      total,
    });
  }

  figma.ui.postMessage({ type: "rasterDone", purpose, total });
}

// Mensagens vindas da UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "init") {
    sendInfo();
    return;
  }

  if (msg.type === "measure") {
    const ids = Array.isArray(msg.ids) ? msg.ids : [];
    if (ids.length === 0) return;
    try {
      await rasterize("measure", ids, msg.scale || null, msg.native !== false);
    } catch (e) {
      figma.ui.postMessage({
        type: "error",
        message: "Erro ao calcular tamanhos: " + e.message,
      });
    }
    return;
  }

  if (msg.type === "export") {
    const items = Array.isArray(msg.items) ? msg.items : [];

    if (items.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "Selecione uma ou mais telas antes de exportar.",
      });
      return;
    }

    try {
      if (msg.scale) {
        // Com compressão: a UI monta o PDF a partir dos bitmaps.
        await rasterize("export", items.map((i) => i.id), msg.scale, false);
      } else if (msg.mode === "single") {
        await exportSingle(
          items.map((i) => i.id),
          msg.fileName || figma.root.name + ".pdf"
        );
      } else {
        await exportSeparate(items);
      }
    } catch (e) {
      figma.ui.postMessage({
        type: "error",
        message: "Erro ao exportar: " + e.message,
      });
    }
  }
};

// Atualiza a UI sempre que a seleção mudar
figma.on("selectionchange", sendInfo);
