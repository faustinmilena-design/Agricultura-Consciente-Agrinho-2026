// Monta os cards de sugestões na seção Práticas, com base nas notas da autoavaliação.

const ORDEM_PRATICAS_POR_GRUPO = {
  casa: ["feira", "hortaTerraco", "desperdicio", "separacao", "compostagem"],
  campo: ["captacao", "silagem", "compostagem"]
};

// Diz se a prática é de casa (cidade) ou campo conforme o perfil.
function obterGrupoPratica(item) {
  if (tipoUsuario === "consumidor" && item.grupoConsumidor) {
    return item.grupoConsumidor;
  }
  return item.grupo;
}

// Pega só o grupo de práticas do perfil ativo (casa ou campo).
function obterGruposPraticasAtivos() {
  const alvo = tipoUsuario === "consumidor" ? "casa" : "campo";
  return (configuracao?.gruposPraticas || []).filter((grupo) => grupo.id === alvo);
}

// Busca títulos e avisos da seção Práticas no arquivo de dados.
function obterTextosSecaoPraticas() {
  const chave = tipoUsuario === "consumidor" ? "consumidor" : "produtor";
  const textos = configuracao?.secaoPraticas?.[chave] || {};
  const padrao = configuracao?.secaoPraticas?.produtor || {};
  return {
    titulo: textos.titulo || padrao.titulo || "Sugestões para você",
    intro: textos.intro ||
      padrao.intro ||
      "Depois da autoavaliação, aparecem ideias para as áreas com notas mais baixas.",
    avisoPendente: textos.avisoPendente ||
      padrao.avisoPendente ||
      "Escolha um perfil, preencha o formulário e revele os cartões do resultado para ver suas sugestões personalizadas.",
    avisoVazio: textos.avisoVazio ||
      padrao.avisoVazio ||
      "Suas prioridades estão nos cartões acima. Revise as recomendações de cada área."
  };
}

// Atualiza título e intro da seção Práticas na página.
function atualizarTextosSecaoPraticas() {
  const textos = obterTextosSecaoPraticas();
  const titulo = document.querySelector("#titulo-praticas");
  const intro = document.querySelector("#intro-praticas");
  const avisoPendente = document.querySelector("#aviso-praticas-pendente");

  if (titulo) {
    titulo.textContent = textos.titulo;
  }
  if (intro) {
    intro.textContent = textos.intro;
  }
  if (avisoPendente && avisoPendente.hidden) {
    avisoPendente.textContent = textos.avisoPendente;
  }
}

// Monta a lista de IDs das práticas ligadas às 3 piores notas.
function coletarIdsPraticasSugeridas(valoresPorDimensao) {
  const ordenadas = [...valoresPorDimensao].sort((a, b) => a.valor - b.valor);
  const ids = new Set();

  ordenadas.slice(0, 3).forEach((item) => {
    item.praticas.forEach((id) => ids.add(id));
  });

  if (ids.size === 0) {
    for (const item of ordenadas) {
      item.praticas.forEach((id) => ids.add(id));
      if (ids.size > 0) {
        break;
      }
    }
  }

  return ids;
}

// Verifica se a prática aparece para produtor, consumidor ou todos.
function praticaVisivelParaPerfil(publico) {
  const lista = Array.isArray(publico) ? publico : [];
  if (tipoUsuario === "produtor") {
    return lista.includes("produtor") || lista.includes("todos");
  }
  return lista.includes("consumidor") || lista.includes("todos");
}

// Cria um card com foto, título e texto de uma prática.
function criarCardConteudo({
  id,
  imagem,
  alt,
  titulo,
  texto
}) {
  const cartao = document.createElement("article");
  cartao.className = "card-conteudo";
  if (id) {
    cartao.dataset.praticaId = id;
  }

  cartao.innerHTML = `
 <div class="card-conteudo-midia">
 <img src="${imagem}" alt="" loading="lazy" decoding="async">
 </div>
 <h3></h3>
 <p></p>
 `;
  cartao.querySelector("img").alt = alt;
  cartao.querySelector("h3").textContent = titulo;
  cartao.querySelector("p").textContent = texto;
  return cartao;
}

// Mostra ou esconde os avisos "faça a avaliação" ou "nenhuma prática extra".
function atualizarAvisosPraticas(mostrarPendente, mostrarVazio) {
  const textos = obterTextosSecaoPraticas();
  const avisoPendente = document.querySelector("#aviso-praticas-pendente");
  const avisoVazio = document.querySelector("#aviso-praticas-vazio");
  if (avisoPendente) {
    avisoPendente.hidden = !mostrarPendente;
    if (mostrarPendente) {
      avisoPendente.textContent = textos.avisoPendente;
    }
  }
  if (avisoVazio) {
    avisoVazio.hidden = !mostrarVazio;
    if (mostrarVazio) {
      avisoVazio.textContent = textos.avisoVazio;
    }
  }
}

// Estado inicial da seção Práticas antes de ter resultado.
function prepararSecaoPraticas() {
  const montagem = document.querySelector("#praticas-grupos-mount");
  if (montagem) {
    montagem.innerHTML = "";
    montagem.hidden = true;
  }
  atualizarTextosSecaoPraticas();
  atualizarAvisosPraticas(true, false);
}

// Depois do resultado, monta os cards de práticas personalizados.
function atualizarSecaoPraticas(valoresPorDimensao) {
  const montagem = document.querySelector("#praticas-grupos-mount");
  if (!montagem || !configuracao?.praticasCatalogo) {
    return;
  }

  atualizarTextosSecaoPraticas();

  const ids = coletarIdsPraticasSugeridas(valoresPorDimensao);
  const catalogo = configuracao.praticasCatalogo;
  const grade = document.createElement("div");
  grade.className = "grade-cards";
  let totalCards = 0;

  const blocos = obterGruposPraticasAtivos()
    .map((grupo) => {
      const ordem = ORDEM_PRATICAS_POR_GRUPO[grupo.id] || [];
      const idsDoGrupo = ordem.filter((praticaId) => {
        if (!ids.has(praticaId)) {
          return false;
        }
        const item = catalogo[praticaId];
        return (
          item &&
          obterGrupoPratica(item) === grupo.id &&
          praticaVisivelParaPerfil(item.publico)
        );
      });
      return {
        grupo,
        idsDoGrupo
      };
    })
    .filter((bloco) => bloco.idsDoGrupo.length > 0);

  const compactarSubtitulos =
    blocos.length > 1 && blocos.every((bloco) => bloco.idsDoGrupo.length === 1);

  blocos.forEach(({
    grupo,
    idsDoGrupo
  }) => {
    if (!compactarSubtitulos) {
      const subtitulo = document.createElement("h3");
      subtitulo.className = "subtitulo-secao";
      subtitulo.textContent = grupo.titulo;
      grade.appendChild(subtitulo);
      if (grupo.intro) {
        const introGrupo = document.createElement("p");
        introGrupo.className = "intro-grupo-praticas";
        introGrupo.textContent = grupo.intro;
        grade.appendChild(introGrupo);
      }
    }

    idsDoGrupo.forEach((praticaId) => {
      const dados = catalogo[praticaId];
      grade.appendChild(
        criarCardConteudo({
          id: praticaId,
          imagem: dados.imagem,
          alt: dados.alt,
          titulo: dados.titulo,
          texto: dados.texto
        })
      );
      totalCards += 1;
    });
  });

  montagem.innerHTML = "";
  if (totalCards > 0) {
    montagem.appendChild(grade);
  }
  montagem.hidden = totalCards === 0;
  atualizarAvisosPraticas(false, totalCards === 0);
}
