// Diz qual campo de nome usar: produtor ou consumidor.
function obterIdCampoNome() {
  return tipoUsuario === "consumidor" ? "nomeConsumidor" : "nomeProdutor";
}

// Vê se a pessoa já digitou o nome (obrigatório antes das notas).
function temNomePreenchido() {
  const campo = document.getElementById(obterIdCampoNome());
  return Boolean(campo && campo.value.trim());
}

// Só libera as pilulas 0–5 depois que o nome estiver preenchido.
function aplicarDesbloqueioDimensoes() {
  const liberado = temNomePreenchido();
  const fieldset = elementos.formulario?.querySelector(".fieldset-dimensoes");
  const avisoInicio = document.querySelector("#aviso-nome-inicio");

  if (fieldset) {
    fieldset.classList.toggle("fieldset-dimensoes-bloqueado", !liberado);
    fieldset.setAttribute("aria-disabled", liberado ? "false" : "true");
    fieldset.querySelectorAll(".pilula-nota").forEach((pilula) => {
      pilula.disabled = !liberado;
    });
  }
  if (avisoInicio) {
    avisoInicio.hidden = liberado;
  }
}

// Quando a pessoa digita o nome, atualiza bloqueio e tenta mostrar resultado.
function vincularCampoNome(controle) {
  const aoAtualizar = () => {
    aplicarDesbloqueioDimensoes();
    verificarResultadoPronto();
  };
  controle.addEventListener("input", aoAtualizar);
  controle.addEventListener("change", aoAtualizar);
  controle.addEventListener("blur", aoAtualizar);
}

// Troca o texto de dica quando o consumidor muda o contexto (casa, feira etc.).
function atualizarDicaContextoConsumidor(valor) {
  const alvo = document.querySelector("#dica-contexto-consumidor");
  if (!alvo || !configuracao?.perfilConsumidor?.textosPorContexto) {
    return;
  }
  alvo.textContent = configuracao.perfilConsumidor.textosPorContexto[valor] || "";
}

// Escuta mudanças no select de contexto do consumidor.
function vincularContextoConsumidor(controle) {
  const aoAtualizar = () => {
    atualizarDicaContextoConsumidor(controle.value);
    verificarResultadoPronto();
  };
  controle.addEventListener("change", aoAtualizar);
  controle.addEventListener("input", aoAtualizar);
  atualizarDicaContextoConsumidor(controle.value);
}

// Se nome e todas as notas estão ok, monta o resultado embaixo.
function verificarResultadoPronto() {
  aplicarDesbloqueioDimensoes();

  if (!temNomePreenchido() || !todasAreasPreenchidas()) {
    return;
  }

  const perfil = lerPerfil();
  if (!perfil.nome) {
    return;
  }

  const valoresPorDimensao = lerValoresDimensoes();
  const valores = valoresPorDimensao.map((item) => item.valor);
  const pontuacao = calcularPontuacao(valores);
  const faixa = obterFaixa(pontuacao);

  renderizarResultado(perfil, valoresPorDimensao, pontuacao, faixa);
  renderizarFlashResultado(valoresPorDimensao);

  if (!resultadoPublicado) {
    resultadoPublicado = true;
    const blocoResultado = document.querySelector("#resultado");
    if (blocoResultado) {
      blocoResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }
}

// Mostra na tela o que significa a nota 0–5 que a pessoa escolheu na área.
function atualizarDescricaoPilula(dimensaoId, valor) {
  const alvo = document.querySelector(`[data-nivel-label="${dimensaoId}"]`);
  const dimensao = obterDimensoesAtivas().find((item) => item.id === dimensaoId);
  if (alvo && dimensao) {
    alvo.textContent = dimensao.niveis[String(valor)] || "";
  }
}

// Marca a pilula clicada e tenta liberar o resultado.
function selecionarPilula(escala, dimensao, valor) {
  escala.dataset.valorSelecionado = String(valor);
  escala.querySelectorAll(".pilula-nota").forEach((pilula) => {
    const ativa = Number.parseInt(pilula.dataset.valor, 10) === valor;
    pilula.classList.toggle("pilula-nota-ativa", ativa);
    pilula.setAttribute("aria-pressed", ativa ? "true" : "false");
  });
  atualizarDescricaoPilula(dimensao.id, valor);
  verificarResultadoPronto();
}

// Cria o formulário na tela: nome, campos do perfil e botões 0 a 5.
function montarFormulario() {
  if (!elementos.formulario || !configuracao || !tipoUsuario) {
    return;
  }

  const configuracaoDoPerfil = obterPerfilAtivo();
  const dimensoes = obterDimensoesAtivas();
  const textosUi = configuracao.textosUi;

  elementos.formulario.hidden = false;
  elementos.formulario.innerHTML = "";

  if (elementos.tituloAvaliacao) {
    elementos.tituloAvaliacao.textContent =
      tipoUsuario === "consumidor" ?
      textosUi.tituloAvaliacaoConsumidor :
      textosUi.tituloAvaliacaoProdutor;
  }
  if (elementos.introAvaliacao) {
    elementos.introAvaliacao.textContent =
      tipoUsuario === "consumidor" ?
      textosUi.introAvaliacaoConsumidor :
      textosUi.introAvaliacaoProdutor;
  }

  const blocoPerfil = document.createElement("fieldset");
  blocoPerfil.className = "fieldset-perfil";
  const legendaPerfil = document.createElement("legend");
  legendaPerfil.textContent = configuracaoDoPerfil.titulo;
  blocoPerfil.appendChild(legendaPerfil);

  const idCampoNome = obterIdCampoNome();

  configuracaoDoPerfil.campos.forEach((campo) => {
    const label = document.createElement("label");
    label.setAttribute("for", campo.id);
    label.textContent = campo.rotulo + (campo.obrigatorio ? " *" : "");

    let controle;
    if (campo.tipo === "select") {
      controle = document.createElement("select");
      controle.id = campo.id;
      controle.name = campo.id;
      campo.opcoes.forEach((opcao) => {
        const item = document.createElement("option");
        item.value = opcao.valor;
        item.textContent = opcao.texto;
        controle.appendChild(item);
      });
    } else {
      controle = document.createElement("input");
      controle.type = "text";
      controle.id = campo.id;
      controle.name = campo.id;
      controle.placeholder = campo.placeholder || "";
      controle.autocomplete = "name";
      if (campo.obrigatorio) {
        controle.required = true;
      }
    }

    blocoPerfil.append(label, controle);
    if (campo.id === idCampoNome) {
      vincularCampoNome(controle);
    }
    if (tipoUsuario === "consumidor" && campo.id === "contextoConsumo") {
      vincularContextoConsumidor(controle);
    }
  });

  if (tipoUsuario === "consumidor") {
    const dicaContexto = document.createElement("p");
    dicaContexto.id = "dica-contexto-consumidor";
    dicaContexto.className = "dica-contexto-perfil";
    blocoPerfil.appendChild(dicaContexto);
    const selectContexto = document.getElementById("contextoConsumo");
    if (selectContexto) {
      atualizarDicaContextoConsumidor(selectContexto.value);
    }
  }

  const avisoNomeInicio = document.createElement("p");
  avisoNomeInicio.id = "aviso-nome-inicio";
  avisoNomeInicio.className = "aviso-nome-resultado";
  avisoNomeInicio.textContent =
    textosUi.avisoNomeInicio ||
    "Informe seu nome acima para liberar as notas de 0 a 5 em cada área.";

  elementos.formulario.appendChild(blocoPerfil);
  elementos.formulario.appendChild(avisoNomeInicio);

  const blocoDimensoes = document.createElement("fieldset");
  blocoDimensoes.className = "fieldset-dimensoes fieldset-dimensoes-bloqueado";
  blocoDimensoes.setAttribute("aria-disabled", "true");
  const legendaDim = document.createElement("legend");
  legendaDim.textContent =
    textosUi.legendaDimensoes ||
    "Marque de 0 a 5 em cada área, conforme a situação de hoje (0 = crítica · 5 = muito equilibrada).";
  blocoDimensoes.appendChild(legendaDim);

  dimensoes.forEach((dimensao) => {
    const cartao = document.createElement("article");
    cartao.className = "cartao-dimensao";

    const titulo = document.createElement("h3");
    titulo.textContent = dimensao.titulo;

    const pergunta = document.createElement("p");
    pergunta.className = "pergunta-dimensao";
    pergunta.textContent = dimensao.pergunta;

    const rotuloEscala = document.createElement("p");
    rotuloEscala.className = "rotulo-escala-pilulas";
    rotuloEscala.textContent = textosUi.rotuloEscalaPilulas || "Sua nota hoje (0 a 5):";

    const escala = document.createElement("div");
    escala.className = "escala-pilulas";
    escala.dataset.dimensao = dimensao.id;
    escala.setAttribute("role", "group");
    escala.setAttribute("aria-label", `Nota para ${dimensao.titulo}`);

    for (let nota = 0; nota <= 5; nota += 1) {
      const pilula = document.createElement("button");
      pilula.type = "button";
      pilula.className = "pilula-nota";
      pilula.dataset.valor = String(nota);
      pilula.textContent = String(nota);
      pilula.setAttribute("aria-pressed", "false");
      pilula.addEventListener("click", () => {
        selecionarPilula(escala, dimensao, nota);
      });
      escala.appendChild(pilula);
    }

    const nivelTexto = document.createElement("p");
    nivelTexto.className = "nivel-dimensao-descricao";
    nivelTexto.dataset.nivelLabel = dimensao.id;
    nivelTexto.textContent =
      textosUi.nivelPlaceholderDimensao ||
      "Selecione uma nota para ver o que ela significa nesta área hoje.";

    cartao.append(titulo, pergunta, rotuloEscala, escala, nivelTexto);
    blocoDimensoes.appendChild(cartao);
  });

  elementos.formulario.appendChild(blocoDimensoes);

  const nota = document.createElement("p");
  nota.className = "nota-formulario";
  nota.textContent =
    textosUi.notaRodapeFormulario ||
    "Primeiro o nome; depois todas as áreas marcadas. O resultado aparece abaixo. Vire cada cartão para revelar. Os dados ficam apenas no seu navegador.";

  elementos.formulario.appendChild(nota);
  limparResultadoPublicado();
  aplicarDesbloqueioDimensoes();

  const campoNome = document.getElementById(idCampoNome);
  if (campoNome) {
    campoNome.focus();
  }
}
