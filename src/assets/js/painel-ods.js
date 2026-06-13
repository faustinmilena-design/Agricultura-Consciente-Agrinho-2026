// Painel interativo das 17 ODS com textos da Jornada Agro Forte.

const DADOS_PAINEL_ODS = [{
  numero: 1,
  titulo: "Erradicação da Pobreza",
  descricao: "Renda no campo e acesso a tecnologia ajudam famílias produtoras a permanecer com dignidade na terra."
}, {
  numero: 2,
  titulo: "Fome Zero",
  nucleo: true,
  descricao: "Núcleo desta jornada: alimentos na mesa, agricultura familiar e menos desperdício no campo e na cidade."
}, {
  numero: 3,
  titulo: "Saúde e Bem-Estar",
  descricao: "Água limpa, alimentos seguros e menos agrotóxicos beneficiam quem produz e quem consome."
}, {
  numero: 4,
  titulo: "Educação de Qualidade",
  descricao: "Projetos como o Agrinho e a extensão rural levam conhecimento sobre agro sustentável à escola e à comunidade."
}, {
  numero: 5,
  titulo: "Igualdade de Gênero",
  descricao: "Mulheres no agro fortalecem gestão da propriedade, renda familiar e inovação no meio rural."
}, {
  numero: 6,
  titulo: "Água Potável",
  nucleo: true,
  descricao: "Núcleo desta jornada: a área Água da autoavaliação (captação, irrigação e uso consciente em casa)."
}, {
  numero: 7,
  titulo: "Energia Limpa",
  nucleo: true,
  descricao: "Núcleo desta jornada: energia na propriedade ou em casa (bombas, máquinas, luz e fontes renováveis)."
}, {
  numero: 8,
  titulo: "Trabalho Decente",
  descricao: "Condições seguras e justas em toda a cadeia do alimento, do plantio à feira e ao comércio."
}, {
  numero: 9,
  titulo: "Inovação e Infraestrutura",
  descricao: "Estradas, armazenagem e tecnologia acessível reduzem perdas e apoiam o pequeno produtor."
}, {
  numero: 10,
  titulo: "Redução das Desigualdades",
  descricao: "Fortalecer agricultura familiar e consumo local ajuda a distribuir renda nas regiões."
}, {
  numero: 11,
  titulo: "Cidades Sustentáveis",
  descricao: "Quem mora na cidade depende do campo para comer e pode consumir com mais consciência e menos resíduo."
}, {
  numero: 12,
  titulo: "Consumo Responsável",
  nucleo: true,
  descricao: "Núcleo desta jornada: resíduos, embalagens, feiras locais e hábitos de consumo que você pontuou em casa."
}, {
  numero: 13,
  titulo: "Ação Climática",
  destaqueCampo: true,
  descricao: "Destaque no campo: manejo, emissões e resiliência. O comparador de futuro da propriedade dialoga com este ODS."
}, {
  numero: 14,
  titulo: "Vida na Água",
  descricao: "Proteger rios, nascentes e margens evita que o manejo agrícola contamine a água do entorno."
}, {
  numero: 15,
  titulo: "Vida Terrestre",
  destaqueCampo: true,
  descricao: "Destaque no campo: solo, matas, corredores e biodiversidade, áreas avaliadas na jornada do produtor."
}, {
  numero: 16,
  titulo: "Paz e Justiça",
  descricao: "Regras claras sobre terra, água e mercado dão segurança para produzir e comercializar."
}, {
  numero: 17,
  titulo: "Parcerias",
  descricao: "Escola, produtores, cooperativas e poder público juntos aceleram um agro mais sustentável."
}];

const MAPA_COR_DESTAQUE_ODS = {
  2: "item-painel-ods--cor-2",
  6: "item-painel-ods--cor-6",
  7: "item-painel-ods--cor-7",
  12: "item-painel-ods--cor-12",
  13: "item-painel-ods--cor-13",
  15: "item-painel-ods--cor-15"
};

// Monta o caminho do arquivo de ícone da ODS (ods-01.svg etc.).
function obterCaminhoIconeOds(numero) {
  const doisDigitos = String(numero).padStart(2, "0");
  return `./src/assets/images/ods/ods-${doisDigitos}.svg`;
}

// Pega a classe CSS de cor de destaque de cada ODS.
function obterClasseCorOds(ods) {
  return MAPA_COR_DESTAQUE_ODS[ods.numero] || "";
}

// Junta as classes CSS do card (núcleo, destaque campo, cor).
function obterClassesItemOds(ods) {
  const classes = ["item-painel-ods", obterClasseCorOds(ods)].filter(Boolean);
  if (ods.nucleo) {
    classes.push("ods-nucleo-jornada");
  } else if (ods.destaqueCampo) {
    classes.push("ods-destaque-campo");
  }
  return classes.join(" ");
}

// Troca < e " por código seguro para não quebrar o HTML.
function escaparTextoHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Monta o HTML de um card da ODS na grade.
function montarItemPainelOds(ods) {
  const icone = obterCaminhoIconeOds(ods.numero);
  const titulo = `ODS ${ods.numero}, ${ods.titulo}`;
  const descricao = escaparTextoHtml(ods.descricao);

  return `
 <article
 class="${obterClassesItemOds(ods)}"
 tabindex="0"
 role="button"
 aria-label="${escaparTextoHtml(titulo)}. ${descricao}"
 data-ods="${ods.numero}"
 >
 <img class="imagem-painel-ods imagem-painel-ods-pb" src="${icone}" alt="" aria-hidden="true">
 <img class="imagem-painel-ods imagem-painel-ods-cor" src="${icone}" alt="${escaparTextoHtml(titulo)}">
 <div class="caixa-explicacao-painel-ods">${descricao}</div>
 </article>
 `;
}

// Clique ou teclado: abre a legenda; clicar de novo fecha.
function configurarInteracaoPainelOds(itens) {
  itens.forEach((item) => {
    item.addEventListener("click", () => {
      const jaAtivo = item.classList.contains("ativo");
      itens.forEach((outro) => outro.classList.remove("ativo"));
      if (!jaAtivo) {
        item.classList.add("ativo");
      }
    });

    item.addEventListener("keydown", (evento) => {
      if (evento.key !== "Enter" && evento.key !== " ") {
        return;
      }
      evento.preventDefault();
      item.click();
    });
  });
}

// Coloca os 17 cards na grade e liga os cliques.
function renderizarPainelOds() {
  const grade = document.getElementById("grade-painel-ods");
  if (!grade) {
    return;
  }

  grade.innerHTML = DADOS_PAINEL_ODS.map(montarItemPainelOds).join("");
  configurarInteracaoPainelOds(grade.querySelectorAll(".item-painel-ods"));
}

document.addEventListener("DOMContentLoaded", renderizarPainelOds);
