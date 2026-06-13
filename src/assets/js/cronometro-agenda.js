// Relógio que conta quanto falta até 1 de janeiro de 2030 (Agenda 2030).
(function() {
  const DATA_AGENDA_2030 = new Date("2030-01-01T00:00:00");
  const IDS = {
    dias: "cronometro-agenda-dias",
    horas: "cronometro-agenda-horas",
    minutos: "cronometro-agenda-minutos",
    segundos: "cronometro-agenda-segundos",
    mensagem: "cronometro-agenda-mensagem"
  };

  // Garante que o número mostrado no relógio nunca fica negativo.
  function limitarPositivo(valor) {
    return valor >= 0 ? valor : 0;
  }

  // Calcula dias, horas, minutos e segundos e coloca na tela.
  function atualizarCronometro() {
    const agora = new Date();
    const diferenca = DATA_AGENDA_2030 - agora;

    const elDias = document.getElementById(IDS.dias);
    const elHoras = document.getElementById(IDS.horas);
    const elMinutos = document.getElementById(IDS.minutos);
    const elSegundos = document.getElementById(IDS.segundos);
    const elMensagem = document.getElementById(IDS.mensagem);

    if (!elDias || !elHoras || !elMinutos || !elSegundos) {
      return;
    }

    if (diferenca <= 0) {
      elDias.textContent = "0";
      elHoras.textContent = "0";
      elMinutos.textContent = "0";
      elSegundos.textContent = "0";
      if (elMensagem) {
        elMensagem.innerHTML =
          "Marco de 2030 alcançado, siga contribuindo com os <strong>ODS</strong> no dia a dia.";
      }
      return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / 1000 / 60) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);

    elDias.textContent = String(limitarPositivo(dias));
    elHoras.textContent = String(limitarPositivo(horas));
    elMinutos.textContent = String(limitarPositivo(minutos));
    elSegundos.textContent = String(limitarPositivo(segundos));

    if (elMensagem) {
      elMensagem.innerHTML = "Marco da ONU: <strong>1 de janeiro de 2030</strong>";
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    atualizarCronometro();
    setInterval(atualizarCronometro, 1000);
  });
})();
