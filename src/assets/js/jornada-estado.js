// Guarda os dados da jornada e funções que calculam pontuação (sem montar telas).
const JSON_URL = "./src/assets/data/jornada-dados.json";

const elementos = {
  formulario: document.querySelector("#formulario-avaliacao"),
  grafico: document.querySelector("#grafico-areas"),
  valorPontuacao: document.querySelector("#valor-pontuacao"),
  faixaPontuacao: document.querySelector("#faixa-pontuacao"),
  narrativaResultado: document.querySelector("#narrativa-resultado"),
  perfilResultado: document.querySelector("#perfil-resultado"),
  containerFlashCard: document.querySelector("#container-flash-card"),
  comparadorResultadoWrap: document.querySelector("#comparador-resultado-wrap"),
  comparadorResultadoTitulo: document.querySelector("#comparador-resultado-titulo"),
  comparadorResultadoIntro: document.querySelector("#comparador-resultado-intro"),
  comparadorImagemFuturo: document.querySelector("#comparador-imagem-futuro"),
  comparadorLegendaFuturo: document.querySelector("#comparador-legenda-futuro"),
  notaReferencia: document.querySelector("#nota-referencia-grafico"),
  comparadorEducativo: document.querySelector("#comparador-educativo"),
  comparadorEducativoRange: document.querySelector("#comparador-educativo-range"),
  tituloAvaliacao: document.querySelector("#titulo-avaliacao"),
  introAvaliacao: document.querySelector("#intro-avaliacao"),
  tituloResultado: document.querySelector("#titulo-resultado"),
  introResultado: document.querySelector("#intro-resultado"),
  perfilSelecionadoMsg: document.querySelector("#perfil-selecionado-msg")
};

let configuracao = null;
let tipoUsuario = null;
let resultadoPublicado = false;

// Pega a lista de áreas (água, solo etc.) do perfil que está ativo agora.
function obterDimensoesAtivas() {
  if (!configuracao) {
    return [];
  }
  return tipoUsuario === "consumidor" ?
    configuracao.dimensoesConsumidor :
    configuracao.dimensoesProdutor;
}

// Pega os dados do perfil produtor ou consumidor que vem do arquivo de textos.
function obterPerfilAtivo() {
  if (!configuracao) {
    return null;
  }
  return tipoUsuario === "consumidor" ?
    configuracao.perfilConsumidor :
    configuracao.perfilProdutor;
}

// Carrega os textos e perguntas do jornada-dados.js (ou do JSON se tiver servidor).
async function carregarConfiguracao() {
  if (window.JORNADA_DADOS) {
    configuracao = window.JORNADA_DADOS;
    return;
  }

  try {
    const resposta = await fetch(JSON_URL);
    if (!resposta.ok) {
      throw new Error("JSON indisponivel");
    }
    configuracao = await resposta.json();
  } catch (erro) {
    console.warn("Fetch do JSON falhou; use jornada-dados.js:", erro.message);
    throw erro;
  }
}

// Soma as notas de 0 a 5 e transforma em pontuação de 0 a 100.
function calcularPontuacao(valores) {
  const dimensoes = obterDimensoesAtivas();
  const total = valores.reduce((soma, valor) => soma + valor, 0);
  const maximo = dimensoes.length * 5;
  return Math.round((total / maximo) * 100);
}

// Descobre em qual faixa a pessoa cai (ex.: Rumo ao equilíbrio) pela pontuação.
function obterFaixa(pontuacao) {
  const ordenadas = [...configuracao.faixas].sort((a, b) => a.max - b.max);
  return ordenadas.find((faixa) => pontuacao <= faixa.max) || ordenadas[ordenadas.length - 1];
}

// Escolhe o texto certo da faixa para produtor ou consumidor.
function narrativaDaFaixa(faixa) {
  if (tipoUsuario === "consumidor") {
    return faixa.narrativaConsumidor || faixa.narrativaProdutor || "";
  }
  return faixa.narrativaProdutor || faixa.narrativaConsumidor || "";
}

// Monta o texto "Pontuação 48/100 · Rumo ao equilíbrio" para a tela.
function formatarResumoPontuacao(pontuacao, faixa) {
  const textosUi = configuracao?.textosUi || {};
  const rotulo = textosUi.rotuloPontuacao || "Pontuação";
  const titulo = faixa?.titulo || "";
  return titulo ? `${rotulo} ${pontuacao}/100 · ${titulo}` : `${rotulo} ${pontuacao}/100`;
}

// Lê na tela qual nota 0–5 foi marcada em cada área.
function lerValoresDimensoes() {
  return obterDimensoesAtivas().map((dimensao) => {
    const escala = document.querySelector(
      `.escala-pilulas[data-dimensao="${dimensao.id}"]`
    );
    const bruto = escala ? escala.dataset.valorSelecionado : "";
    const valor = Number.parseInt(bruto, 10);
    return {
      ...dimensao,
      valor: Number.isNaN(valor) ? null : valor
    };
  });
}

// Verifica se todas as áreas já têm uma nota escolhida.
function todasAreasPreenchidas() {
  return lerValoresDimensoes().every((item) => item.valor !== null);
}

// Limpa resultado, gráfico e flash-cards quando troca de perfil ou remonta o form.
function limparResultadoPublicado() {
  resultadoPublicado = false;
  if (elementos.containerFlashCard) {
    elementos.containerFlashCard.innerHTML = "";
    elementos.containerFlashCard.hidden = true;
  }
  const progresso = document.querySelector("#progresso-flash-card");
  if (progresso) {
    progresso.hidden = true;
    progresso.textContent = "";
  }
  if (elementos.grafico) {
    elementos.grafico.hidden = true;
    elementos.grafico.innerHTML = "";
  }
  if (elementos.valorPontuacao) {
    elementos.valorPontuacao.textContent = "--/100";
  }
  if (elementos.faixaPontuacao) {
    elementos.faixaPontuacao.textContent =
      configuracao?.textosUi?.aguardandoPontuacao || "Aguardando suas notas";
  }
  if (elementos.perfilResultado) {
    elementos.perfilResultado.textContent = "";
  }
  if (elementos.narrativaResultado) {
    elementos.narrativaResultado.textContent = "";
    elementos.narrativaResultado.hidden = true;
  }
  if (elementos.comparadorResultadoWrap) {
    elementos.comparadorResultadoWrap.hidden = true;
  }
  if (typeof prepararSecaoPraticas === "function") {
    prepararSecaoPraticas();
  }
}

// Lê nome e outros campos que a pessoa preencheu no formulário.
function lerPerfil() {
  const configuracaoDoPerfil = obterPerfilAtivo();
  const dados = {
    campos: {}
  };

  if (!configuracaoDoPerfil || !configuracaoDoPerfil.campos) {
    return {
      nome: ""
    };
  }

  configuracaoDoPerfil.campos.forEach((campo) => {
    const el = document.getElementById(campo.id);
    if (el) {
      dados.campos[campo.id] = el.value.trim();
    }
  });

  if (tipoUsuario === "consumidor") {
    const ctx = dados.campos.contextoConsumo || "interesse";
    return {
      nome: dados.campos.nomeConsumidor || "",
      contexto: ctx,
      textoContexto: configuracao.perfilConsumidor.textosPorContexto[ctx] || ""
    };
  }

  const cultivo = dados.campos.tipoCultivo || "mista";
  return {
    nome: dados.campos.nomeProdutor || "",
    propriedade: dados.campos.nomePropriedade || "",
    tipoCultivo: cultivo,
    tamanho: dados.campos.tamanhoPropriedade || "ate5",
    textoCultivo: configuracao.perfilProdutor.textosPorCultivo[cultivo] || ""
  };
}
