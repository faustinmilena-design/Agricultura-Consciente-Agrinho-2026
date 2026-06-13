// Menu hambúrguer do cabeçalho no celular.

// Abre ou fecha a lista de links do menu.
function definirMenuAberto(aberto) {
  if (!listaNavegacao || !btnMenuCabecalho) {
    return;
  }
  listaNavegacao.classList.toggle("lista-navegacao-aberta", aberto);
  btnMenuCabecalho.setAttribute("aria-expanded", aberto ? "true" : "false");
}

const listaNavegacao = document.getElementById("lista-navegacao");
const btnMenuCabecalho = document.getElementById("btn-menu-cabecalho");

if (btnMenuCabecalho && listaNavegacao) {
  btnMenuCabecalho.addEventListener("click", (evento) => {
    evento.stopPropagation();
    definirMenuAberto(!listaNavegacao.classList.contains("lista-navegacao-aberta"));
  });

  listaNavegacao.querySelectorAll(".link-navegacao").forEach((link) => {
    link.addEventListener("click", () => definirMenuAberto(false));
  });

  document.addEventListener("click", (evento) => {
    if (
      !evento.target.closest(".cabecalho-site") &&
      listaNavegacao.classList.contains("lista-navegacao-aberta")
    ) {
      definirMenuAberto(false);
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && listaNavegacao.classList.contains("lista-navegacao-aberta")) {
      definirMenuAberto(false);
      btnMenuCabecalho.focus();
    }
  });
}
