// Links do rodapé (GitHub etc.): trata link vazio e abre externo em nova aba.

// Configura cada link de rede social do rodapé.
function configurarLinksRedeProvisorio() {
  document.querySelectorAll(".link-rede-provisorio").forEach((link) => {
    const href = (link.getAttribute("href") || "").trim();
    if (href === "#" || href === "") {
      link.addEventListener("click", (evento) => evento.preventDefault());
    } else if (href.startsWith("http")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

document.addEventListener("DOMContentLoaded", configurarLinksRedeProvisorio);
