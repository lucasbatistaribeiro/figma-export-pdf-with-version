// ===== Plugin: Exportar PDF com Versão =====
// Roda no contexto do Figma (sem acesso ao DOM).
// A exportação dos bytes e o download são feitos pela UI (ui.html).

figma.showUI(__html__, { width: 340, height: 480, themeColors: true });

// Envia para a UI o estado atual: nome do documento e o que está selecionado.
function sendInfo() {
  const selection = figma.currentPage.selection;
  const first = selection.length > 0 ? selection[0] : null;
  figma.ui.postMessage({
    type: "info",
    docName: figma.root.name,
    count: selection.length,
    selectionName: first ? first.name : null,
    // largura do frame selecionado, usada para o sufixo de layout
    selectionWidth: first && typeof first.width === "number" ? first.width : null,
  });
}

// Mensagens vindas da UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "init") {
    sendInfo();
    return;
  }

  if (msg.type === "export") {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: "error",
        message: "Selecione um frame na tela antes de exportar.",
      });
      return;
    }

    // Exporta o primeiro item selecionado.
    const node = selection[0];

    if (typeof node.exportAsync !== "function") {
      figma.ui.postMessage({
        type: "error",
        message: "O elemento selecionado não pode ser exportado.",
      });
      return;
    }

    try {
      const bytes = await node.exportAsync({ format: "PDF" });
      // O nome final é montado na UI (nome editável + sufixo de layout + data + versão).
      const fileName = msg.fileName || `${figma.root.name}.pdf`;

      figma.ui.postMessage({
        type: "download",
        // Uint8Array é transferido para a UI sem problema
        bytes,
        fileName,
      });
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