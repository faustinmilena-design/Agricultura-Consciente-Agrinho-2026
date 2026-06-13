// Escolha entre perfil produtor rural ou morador da cidade.

// Deixa visualmente marcado qual cartão de perfil está selecionado.
function atualizarBotoesPerfilAtivos(tipo) {
  document.querySelectorAll("[data-perfil]").forEach((botao) => {
    const ativo = botao.dataset.perfil === tipo;
    botao.classList.toggle("cartao-escolha-perfil-ativo", ativo);
    botao.setAttribute("aria-pressed", ativo ? "true" : "false");
  });
}

// Quando clica em produtor ou consumidor, monta o formulário certo.
function selecionarPerfil(tipo) {
  const textosUi = configuracao?.textosUi || {};
  if (!configuracao) {
    alert(textosUi.erroDadosNaoCarregados || "Os dados da jornada ainda não carregaram. Recarregue a página (F5).");
    return;
  }

  if (tipo !== "produtor" && tipo !== "consumidor") {
    return;
  }

  tipoUsuario = tipo;
  resultadoPublicado = false;
  limparResultadoPublicado();
  atualizarBotoesPerfilAtivos(tipo);

  if (elementos.perfilSelecionadoMsg) {
    elementos.perfilSelecionadoMsg.hidden = false;
    elementos.perfilSelecionadoMsg.textContent =
      tipo === "produtor" ?
      textosUi.mensagemPerfilProdutor || "Perfil produtor rural selecionado. Autoavaliação liberada abaixo." :
      textosUi.mensagemPerfilConsumidor || "Perfil morador da cidade selecionado. Autoavaliação liberada abaixo.";
  }

  if (typeof atualizarTextosSecaoPraticas === "function") {
    atualizarTextosSecaoPraticas();
  }
  montarFormulario();

  if (elementos.formulario) {
    elementos.formulario.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// Escuta clique nos cartões de escolha de perfil.
function configurarEscolhaPerfil() {
  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-perfil]");
    if (!botao) {
      return;
    }
    selecionarPerfil(botao.dataset.perfil);
  });
}
