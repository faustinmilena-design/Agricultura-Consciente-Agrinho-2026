// Arquivo que liga tudo quando a página abre.

// Confere se o arquivo de dados veio completo (perfis e dimensões).
function validarConfiguracao() {
  return (
    configuracao &&
    configuracao.perfilProdutor &&
    configuracao.perfilConsumidor &&
    configuracao.dimensoesProdutor?.length &&
    configuracao.dimensoesConsumidor?.length
  );
}

// Carrega os dados e liga perfil, comparador e práticas.
async function iniciar() {
  try {
    await carregarConfiguracao();
  } catch (erro) {
    console.error(erro);
    alert(
      "Não foi possível carregar os dados. Confira se o arquivo src/assets/data/jornada-dados.js existe e recarregue a página (F5)."
    );
    return;
  }

  if (!validarConfiguracao()) {
    alert("Dados da jornada incompletos. Verifique jornada-dados.js.");
    return;
  }

  configurarEscolhaPerfil();
  configurarComparadorEducativo();
  prepararSecaoPraticas();
}

iniciar();
