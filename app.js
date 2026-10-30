const BASE_URL = 'https://api.fifa.com/api/v3';
const URL_PARTIDOS = BASE_URL + '/calendar/matches?idCompetition=17&idSeason=285023&idGroup=289275&language=es';

const statusEl = document.getElementById('status');
const matchesEl = document.getElementById('matches');
const reloadButton = document.getElementById('reloadButton');

// La API regresa los textos dentro de un arreglo, esto saca el texto
function texto(valor) {
  if (Array.isArray(valor)) {
    return valor[0].Description;
  }
  return valor;
}

async function obtenerPartidosMexico() {
  statusEl.textContent = 'Cargando partidos...';
  matchesEl.innerHTML = '';

  try {
    //partidos del Grupo A
    const response = await fetch(URL_PARTIDOS);
    if (!response.ok) throw new Error('HTTP Error: ' + response.status);
    const data = await response.json();

    //partidos mex
    const partidos = data.Results.filter(function (match) {
      return match.Home.IdCountry === 'MEX' || match.Away.IdCountry === 'MEX';
    });

    //  timeline y armar la tarjeta
    for (const match of partidos) {
      const res = await fetch(BASE_URL + '/timelines/' + match.IdMatch + '?language=es');
      const timeline = await res.json();

      let goles = '';
      let amarillas = '';
      let rojas = '';

      for (const evento of timeline.Event) {
        const linea = '<li>' + evento.MatchMinute + ' - ' + texto(evento.EventDescription) + '</li>';
        if (evento.Type === 0) goles += linea;
        if (evento.Type === 2) amarillas += linea;
        if (evento.Type === 3) rojas += linea;
      }

      const fecha = new Date(match.Date);

      matchesEl.innerHTML += `
        <article class="match-card">
          <div class="match-top">
            <span class="group">Grupo A</span>
            <span>${fecha.toLocaleDateString('es-MX')}</span>
          </div>

          <div class="scoreboard">
            <div class="team">${texto(match.Home.TeamName)}</div>
            <div class="score">${match.Home.Score ?? 0} - ${match.Away.Score ?? 0}</div>
            <div class="team">${texto(match.Away.TeamName)}</div>
          </div>

          <div class="details">
            <div>Horario: ${fecha.toLocaleTimeString('es-MX')}</div>
            <div>Estadio: ${texto(match.Stadium.Name)}</div>
          </div>

          <div class="events">
            <h3>Goles</h3>
            <ul>${goles || '<li>Ninguno</li>'}</ul>
            <h3>Tarjetas amarillas</h3>
            <ul>${amarillas || '<li>Ninguna</li>'}</ul>
            <h3>Tarjetas rojas</h3>
            <ul>${rojas || '<li>Ninguna</li>'}</ul>
          </div>
        </article>
      `;
    }

    statusEl.textContent = 'Partidos de México: ' + partidos.length;
  } catch (error) {
    statusEl.textContent = 'Error: ' + error.message;
  }
}

reloadButton.addEventListener('click', obtenerPartidosMexico);
obtenerPartidosMexico();