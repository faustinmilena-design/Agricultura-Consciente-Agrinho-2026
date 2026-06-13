// Gráfico, flash-cards, simulação do futuro e bloco de resultado.

// Cria um cartão que vira quando clica (flash-card de prioridade).
function criarCartaoResultado(indice, categoria, tituloFrente, conteudoVerso) {
  const cartao = document.createElement("article");
  const classeAnimacao =
    indice % 2 === 0 ? "flash-card-entrada-esq" : "flash-card-entrada-dir";
  cartao.className = `flash-card ${classeAnimacao}`;

  cartao.innerHTML = `
 <div class="miolo-flash-card">
 <div class="face-flash-card frente-flash-card">
 <span class="categoria-flash-card">${categoria}</span>
 <h4 class="titulo-flash-card-area">${tituloFrente}</h4>
 <span class="dica-virar-flash-card">Clique para revelar</span>
 </div>
 <div class="face-flash-card verso-flash-card">
 <div class="texto-verso-flash-card">${conteudoVerso}</div>
 </div>
 </div>
 `;

  let respostaVisivel = false;

  // Vira o cartão: frente ou verso.
  function virarCartao() {
    respostaVisivel = !respostaVisivel;
    cartao.classList.toggle("flash-card-ativo", respostaVisivel);
    cartao.setAttribute("aria-expanded", respostaVisivel ? "true" : "false");
    atualizarProgressoFlash();
  }

  cartao.addEventListener("click", virarCartao);
  cartao.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" && evento.key !== " ") {
      return;
    }
    evento.preventDefault();
    virarCartao();
  });

  cartao.setAttribute("tabindex", "0");
  cartao.setAttribute("role", "button");
  cartao.setAttribute("aria-expanded", "false");

  return cartao;
}

// Monta o HTML do verso do flash-card com nota e próximo passo.
function montarHtmlVersoDimensao(item, ordemPrioridade) {
  return `
 <p class="flash-card-nota">Prioridade ${ordemPrioridade} · Nota ${item.valor}/5</p>
 <p>${item.niveis[String(item.valor)] || ""}</p>
 <p class="flash-card-destaque">Próximo passo: ${item.recomendacao}</p>
 `;
}

// Atualiza o texto "Flash-cards abertos: 2 de 3".
function atualizarProgressoFlash() {
  const progresso = document.querySelector("#progresso-flash-card");
  if (!progresso || !elementos.containerFlashCard) {
    return;
  }
  const total = elementos.containerFlashCard.querySelectorAll(".flash-card").length;
  const revelados = elementos.containerFlashCard.querySelectorAll(
    '.flash-card[aria-expanded="true"]'
  ).length;
  progresso.textContent = `Flash-cards abertos: ${revelados} de ${total}.`;
}

// Mostra os 3 flash-cards das áreas com nota mais baixa.
function renderizarFlashResultado(valoresPorDimensao) {
  if (!elementos.containerFlashCard) {
    return;
  }

  elementos.containerFlashCard.innerHTML = "";
  const prioridades = [...valoresPorDimensao].sort((a, b) => a.valor - b.valor);

  prioridades.slice(0, 3).forEach((item, indice) => {
    const cartao = criarCartaoResultado(
      indice, `Prioridade ${indice + 1}`, item.titulo, montarHtmlVersoDimensao(item, indice + 1)
    );
    elementos.containerFlashCard.appendChild(cartao);
  });

  elementos.containerFlashCard.hidden = false;
  const progresso = document.querySelector("#progresso-flash-card");
  if (progresso) {
    progresso.hidden = false;
  }
  atualizarProgressoFlash();
}

// Desenha o gráfico de barras: nota de hoje x meta 5.
function renderizarGrafico(valoresPorDimensao) {
  if (!elementos.grafico) {
    return;
  }

  elementos.grafico.hidden = false;
  elementos.grafico.innerHTML = "";

  const legenda = document.createElement("p");
  legenda.className = "grafico-legenda";
  legenda.textContent =
    "Azul: onde você está hoje · Verde: meta de equilíbrio sustentável (nota 5 em cada área)";
  elementos.grafico.appendChild(legenda);

  const grade = document.createElement("div");
  grade.className = "grafico-grade";
  grade.setAttribute("role", "img");
  grade.setAttribute(
    "aria-label", "Gráfico comparando sua nota atual com a meta sustentável em cada área"
  );

  valoresPorDimensao.forEach((item) => {
    const coluna = document.createElement("div");
    coluna.className = "grafico-coluna";

    const escalaUsuario = Math.round((item.valor / 5) * 20) * 5;
    const barraUsuario = document.createElement("div");
    barraUsuario.className = `grafico-barra grafico-barra-usuario grafico-escala-${escalaUsuario}`;
    barraUsuario.setAttribute(
      "aria-label", `Hoje em ${item.titulo}: ${item.valor} de 5`
    );

    const barraMeta = document.createElement("div");
    barraMeta.className = "grafico-barra grafico-barra-meta grafico-escala-100";
    barraMeta.setAttribute(
      "aria-label", `Meta sustentável em ${item.titulo}: 5 de 5`
    );

    const trilho = document.createElement("div");
    trilho.className = "grafico-trilho";
    trilho.append(barraUsuario, barraMeta);

    const legendaPar = document.createElement("div");
    legendaPar.className = "grafico-par-legenda";
    legendaPar.innerHTML = "<span>Hoje</span><span>Meta</span>";

    const rotulo = document.createElement("span");
    rotulo.className = "grafico-rotulo";
    rotulo.textContent = item.titulo;

    const valor = document.createElement("span");
    valor.className = "grafico-valor";
    valor.textContent = `${item.valor}/5`;

    coluna.append(trilho, legendaPar, valor, rotulo);
    grade.appendChild(coluna);
  });

  elementos.grafico.appendChild(grade);

  if (elementos.notaReferencia && configuracao.meta) {
    elementos.notaReferencia.textContent = configuracao.meta.notaReferencia;
  }
}

// Escolhe qual foto de cenário futuro usar conforme a pontuação do produtor.
function obterCenarioFuturoPorPontuacao(pontuacao) {
  const faixas = configuracao.cenariosCampo?.faixasPorScore;
  if (!faixas?.length) {
    return null;
  }
  const ordenadas = [...faixas].sort((a, b) => a.max - b.max);
  return ordenadas.find((item) => pontuacao <= item.max) || ordenadas[ordenadas.length - 1];
}

// Atualiza a simulação do futuro da propriedade (só perfil produtor).
function atualizarComparadorResultado(pontuacao, faixa) {
  if (!elementos.comparadorResultadoWrap) {
    return;
  }
  elementos.comparadorResultadoWrap.hidden = tipoUsuario !== "produtor";
  if (tipoUsuario !== "produtor") {
    return;
  }

  const cenarios = configuracao.cenariosCampo || {};
  const cenarioVisual = obterCenarioFuturoPorPontuacao(pontuacao);

  if (elementos.comparadorResultadoTitulo && cenarios.titulo) {
    elementos.comparadorResultadoTitulo.textContent = cenarios.titulo;
  }
  if (elementos.comparadorResultadoIntro) {
    elementos.comparadorResultadoIntro.textContent =
      cenarios.intro ||
      "Simulação educativa: se o ritmo atual continuar, o campo pode tender a este cenário.";
  }

  elementos.comparadorResultadoWrap.classList.remove(
    "simulacao-alerta", "simulacao-melhora-lenta", "simulacao-promissor", "simulacao-sustentavel"
  );

  if (!cenarioVisual) {
    return;
  }

  elementos.comparadorResultadoWrap.classList.add(`simulacao-${cenarioVisual.id}`);

  if (elementos.comparadorImagemFuturo && cenarioVisual.imagem) {
    elementos.comparadorImagemFuturo.src = cenarioVisual.imagem;
    elementos.comparadorImagemFuturo.alt =
      cenarioVisual.altImagem || "Simulação do futuro da propriedade";
  }

  if (elementos.comparadorLegendaFuturo) {
    elementos.comparadorLegendaFuturo.innerHTML = `
 <p class="comparador-legenda-score">${formatarResumoPontuacao(pontuacao, faixa)}</p>
 `;
  }
}

// Preenche toda a área de resultado: pontuação, gráfico, práticas e comparador.
function renderizarResultado(perfil, valoresPorDimensao, pontuacao, faixa) {
  const textosUi = configuracao.textosUi;

  if (elementos.tituloResultado) {
    elementos.tituloResultado.textContent =
      tipoUsuario === "consumidor" ?
      textosUi.tituloResultadoConsumidor :
      textosUi.tituloResultadoProdutor;
  }
  if (elementos.introResultado) {
    elementos.introResultado.textContent =
      tipoUsuario === "consumidor" ?
      textosUi.introResultadoConsumidor :
      textosUi.introResultadoProdutor;
  }

  if (elementos.valorPontuacao) {
    elementos.valorPontuacao.textContent = `${pontuacao}/100`;
  }
  if (elementos.faixaPontuacao) {
    elementos.faixaPontuacao.textContent = faixa.titulo;
  }
  if (elementos.narrativaResultado) {
    elementos.narrativaResultado.textContent = narrativaDaFaixa(faixa);
    elementos.narrativaResultado.hidden = false;
  }
  if (elementos.perfilResultado) {
    const partes = [];
    if (perfil.nome) {
      partes.push(
        tipoUsuario === "consumidor" ?
        `Olá, ${perfil.nome}.` :
        `Produtor(a): ${perfil.nome}.`
      );
    }
    if (tipoUsuario === "produtor" && perfil.propriedade) {
      partes.push(`Propriedade: ${perfil.propriedade}.`);
    }
    if (perfil.textoCultivo) {
      partes.push(perfil.textoCultivo);
    }
    if (perfil.textoContexto) {
      partes.push(perfil.textoContexto);
    }
    elementos.perfilResultado.textContent = partes.join(" ");
  }

  renderizarGrafico(valoresPorDimensao);
  atualizarSecaoPraticas(valoresPorDimensao);
  atualizarComparadorResultado(pontuacao, faixa);
}
