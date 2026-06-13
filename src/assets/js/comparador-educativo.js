// Comparador antes/depois: arrastar o controle move a linha entre as fotos.

// Quando move o range, atualiza onde corta as duas imagens.
function configurarComparadorEducativo() {
  const fotos = elementos.comparadorEducativo;
  const range = elementos.comparadorEducativoRange;
  if (!fotos || !range) {
    return;
  }

  range.addEventListener("input", () => {
    fotos.style.setProperty("--corte", `${range.value}%`);
  });
}
