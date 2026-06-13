// Botão fixo para voltar ao topo da página.
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    const botao = document.getElementById("botao-voltar-topo");
    if (!botao) {
      return;
    }

    const limite = 380;

    // Mostra o botão só depois que a pessoa rolar a página.
    function atualizarVisibilidadeBotaoTopo() {
      const y = window.scrollY || document.documentElement.scrollTop;
      botao.hidden = y < limite;
    }

    window.addEventListener("scroll", atualizarVisibilidadeBotaoTopo, {
      passive: true
    });
    atualizarVisibilidadeBotaoTopo();

    botao.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });
})();
