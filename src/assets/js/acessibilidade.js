// Menu flutuante de acessibilidade: fonte, alto contraste e modo escuro (salva no navegador).
document.addEventListener("DOMContentLoaded", function() {
  const botaoAcessibilidade = document.getElementById("botao-acessibilidade");
  const opcoesAcessibilidade = document.getElementById("opcoes-acessibilidade");
  const aumentaFonte = document.getElementById("aumentar-fonte");
  const diminuiFonte = document.getElementById("diminuir-fonte");
  const alternaContraste = document.getElementById("alterna-contraste");
  const alternaModoEscuro = document.getElementById("alterna-modo-escuro");
  const resetAcessibilidade = document.getElementById("reset-acessibilidade");
  const metaTheme = document.getElementById("meta-theme-color");

  const STORAGE_TEMA = "agrinhoTemaVisual";
  const ICONE_FAB_PADRAO = "./src/assets/images/icones/acessibilidade.png";
  const ICONE_FAB_ALTO_CONTRASTE = "./src/assets/images/icones/acessibilidade-alto-contraste.png";

  if (!botaoAcessibilidade || !opcoesAcessibilidade) {
    return;
  }

  const iconeFab = botaoAcessibilidade.querySelector(".icone-acessibilidade-img");
  const iconeBotaoContraste = alternaContraste ?
    alternaContraste.querySelector(".icone-opcao-img") :
    null;

  let tamanhoAtualFonte = 1;
  let contrasteAtivo = false;

  // Troca o ícone do botão quando está em alto contraste.
  function atualizarIconesTemaAcessibilidade() {
    const emAltoContraste = document.body.classList.contains("alto-contraste");
    if (iconeFab) {
      iconeFab.src = emAltoContraste ? ICONE_FAB_ALTO_CONTRASTE : ICONE_FAB_PADRAO;
    }
    if (iconeBotaoContraste) {
      iconeBotaoContraste.src = emAltoContraste ? ICONE_FAB_ALTO_CONTRASTE : ICONE_FAB_PADRAO;
    }
  }

  // Cor da barra do celular no tema claro.
  function definirMetaClaro() {
    if (metaTheme) {
      metaTheme.setAttribute("content", "#f6f4ee");
    }
  }

  // Cor da barra do celular no tema escuro.
  function definirMetaEscuro() {
    if (metaTheme) {
      metaTheme.setAttribute("content", "#0e1814");
    }
  }

  // Salva no navegador se está em contraste ou modo escuro.
  function persistirTemaVisual() {
    try {
      if (document.body.classList.contains("alto-contraste")) {
        localStorage.setItem(STORAGE_TEMA, "contraste");
      } else if (document.body.classList.contains("modo-escuro")) {
        localStorage.setItem(STORAGE_TEMA, "escuro");
      } else {
        localStorage.removeItem(STORAGE_TEMA);
      }
    } catch (erro) {
      // modo privado sem storage
    }
  }

  // Liga ou desliga o modo alto contraste na página.
  function aplicarAltoContraste(ativo) {
    contrasteAtivo = ativo;
    document.body.classList.toggle("alto-contraste", ativo);
    if (ativo) {
      document.body.classList.remove("modo-escuro");
      definirMetaClaro();
      if (alternaModoEscuro) {
        alternaModoEscuro.setAttribute("aria-pressed", "false");
      }
    }
    if (alternaContraste) {
      alternaContraste.setAttribute("aria-pressed", ativo ? "true" : "false");
    }
    atualizarIconesTemaAcessibilidade();
    persistirTemaVisual();
  }

  // Liga ou desliga o modo escuro na página.
  function aplicarModoEscuro(ativo) {
    document.body.classList.toggle("modo-escuro", ativo);
    if (ativo) {
      document.body.classList.remove("alto-contraste");
      contrasteAtivo = false;
      if (alternaContraste) {
        alternaContraste.setAttribute("aria-pressed", "false");
      }
      definirMetaEscuro();
    } else if (!document.body.classList.contains("alto-contraste")) {
      definirMetaClaro();
    }
    if (alternaModoEscuro) {
      alternaModoEscuro.setAttribute("aria-pressed", ativo ? "true" : "false");
    }
    atualizarIconesTemaAcessibilidade();
    persistirTemaVisual();
  }

  // Quando abre o site, aplica o tema que estava salvo antes.
  function restaurarTemaSalvo() {
    try {
      const tema = localStorage.getItem(STORAGE_TEMA);
      if (tema === "contraste") {
        contrasteAtivo = true;
        document.body.classList.add("alto-contraste");
        if (alternaContraste) {
          alternaContraste.setAttribute("aria-pressed", "true");
        }
        if (alternaModoEscuro) {
          alternaModoEscuro.setAttribute("aria-pressed", "false");
        }
        definirMetaClaro();
      } else if (tema === "escuro") {
        document.body.classList.add("modo-escuro");
        if (alternaModoEscuro) {
          alternaModoEscuro.setAttribute("aria-pressed", "true");
        }
        if (alternaContraste) {
          alternaContraste.setAttribute("aria-pressed", "false");
        }
        definirMetaEscuro();
      }
    } catch (erro) {
      // leitura inicial
    }
    atualizarIconesTemaAcessibilidade();
  }

  restaurarTemaSalvo();

  // Abre ou fecha o menu com A+, contraste etc.
  function definirMenuAcessibilidadeAberto(aberto) {
    opcoesAcessibilidade.classList.toggle("ativo", aberto);
    botaoAcessibilidade.classList.toggle("rotacionado", aberto);
    botaoAcessibilidade.setAttribute("aria-expanded", aberto ? "true" : "false");
  }

  botaoAcessibilidade.addEventListener("click", function(evento) {
    evento.stopPropagation();
    const aberto = !opcoesAcessibilidade.classList.contains("ativo");
    definirMenuAcessibilidadeAberto(aberto);
  });

  if (aumentaFonte) {
    aumentaFonte.addEventListener("click", function() {
      if (tamanhoAtualFonte < 1.2) {
        tamanhoAtualFonte += 0.1;
        document.documentElement.style.fontSize = `${tamanhoAtualFonte}rem`;
      }
    });
  }

  if (diminuiFonte) {
    diminuiFonte.addEventListener("click", function() {
      if (tamanhoAtualFonte > 0.8) {
        tamanhoAtualFonte -= 0.1;
        document.documentElement.style.fontSize = `${tamanhoAtualFonte}rem`;
      }
    });
  }

  if (alternaContraste) {
    alternaContraste.addEventListener("click", function() {
      aplicarAltoContraste(!contrasteAtivo);
    });
  }

  if (alternaModoEscuro) {
    alternaModoEscuro.addEventListener("click", function() {
      aplicarModoEscuro(!document.body.classList.contains("modo-escuro"));
    });
  }

  if (resetAcessibilidade) {
    resetAcessibilidade.addEventListener("click", function() {
      tamanhoAtualFonte = 1;
      document.documentElement.style.fontSize = "";
      contrasteAtivo = false;
      document.body.classList.remove("alto-contraste", "modo-escuro");
      if (alternaContraste) {
        alternaContraste.setAttribute("aria-pressed", "false");
      }
      if (alternaModoEscuro) {
        alternaModoEscuro.setAttribute("aria-pressed", "false");
      }
      persistirTemaVisual();
      definirMetaClaro();
      atualizarIconesTemaAcessibilidade();
      definirMenuAcessibilidadeAberto(false);
    });
  }

  document.addEventListener("click", function(evento) {
    if (
      !evento.target.closest(".menu-acessibilidade") &&
      opcoesAcessibilidade.classList.contains("ativo")
    ) {
      definirMenuAcessibilidadeAberto(false);
    }
  });

  document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape" && opcoesAcessibilidade.classList.contains("ativo")) {
      definirMenuAcessibilidadeAberto(false);
      botaoAcessibilidade.focus();
    }
  });
});
