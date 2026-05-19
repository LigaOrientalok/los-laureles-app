// Sistema de Estadísticas con Gráficos

let chartGoleadores = null;
let chartEquipos = null;
let chartEvolucion = null;

async function renderEstadisticasAvanzadas(torneoId, dia) {
  const jugadores = await db.getJugadores(torneoId);
  const equipos = await db.getEquipos(torneoId);
  const resultados = await db.getResultados(torneoId);

  // Filtrar por día si es necesario
  const jugsDia = dia ? jugadores.filter(j => {
    const eqs = equipos.filter(e => e.dia_semana === dia).map(e => e.id);
    return j.equipos?.some(eId => eqs.includes(eId));
  }) : jugadores;

  const equiposDia = dia ? equipos.filter(e => e.dia_semana === dia) : equipos;

  // Top Goleadores
  const goleadores = [...jugsDia].sort((a, b) => b.goles - a.goles).slice(0, 10);
  renderGraficoGoleadores(goleadores);

  // Ranking de Equipos
  renderGraficoEquipos(equiposDia);

  // Evolución de puntos
  renderGraficoEvolucion(equiposDia);

  // Tabla de estadísticas
  renderTablaEstadisticas(goleadores);
}

function renderGraficoGoleadores(goleadores) {
  const ctx = document.getElementById('chart-goleadores');
  if (!ctx) return;

  if (chartGoleadores) chartGoleadores.destroy();

  chartGoleadores = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: goleadores.map(j => j.nombre),
      datasets: [{
        label: 'Goles',
        data: goleadores.map(j => j.goles),
        backgroundColor: '#eab308',
        borderColor: '#b8860b',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      },
      scales: {
        y: { ticks: { color: '#ffffff' }, grid: { color: '#30363d' } },
        x: { ticks: { color: '#ffffff' }, grid: { color: '#30363d' } }
      }
    }
  });
}

function renderGraficoEquipos(equipos) {
  const ctx = document.getElementById('chart-equipos');
  if (!ctx) return;

  if (chartEquipos) chartEquipos.destroy();

  const equiposOrdenados = [...equipos].sort((a, b) => b.pts - a.pts);

  chartEquipos = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: equiposOrdenados.map(e => e.nombre),
      datasets: [{
        data: equiposOrdenados.map(e => e.pts),
        backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#ec4899'],
        borderColor: '#161b22',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      }
    }
  });
}

function renderGraficoEvolucion(equipos) {
  const ctx = document.getElementById('chart-evolucion');
  if (!ctx) return;

  if (chartEvolucion) chartEvolucion.destroy();

  chartEvolucion = new Chart(ctx, {
    type: 'line',
    data: {
      labels: equipos.map(e => e.nombre),
      datasets: [{
        label: 'Puntos',
        data: equipos.map(e => e.pts),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }, {
        label: 'Goles a Favor',
        data: equipos.map(e => e.gf),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }, {
        label: 'Goles en Contra',
        data: equipos.map(e => e.gc),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      },
      scales: {
        y: { ticks: { color: '#ffffff' }, grid: { color: '#30363d' } },
        x: { ticks: { color: '#ffffff' }, grid: { color: '#30363d' } }
      }
    }
  });
}

function renderTablaEstadisticas(jugadores) {
  const cont = document.getElementById('tabla-stats-avanzadas');
  if (!cont) return;

  cont.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#30363d;">
          <th style="padding:10px; text-align:left; color:#eab308;">Jugador</th>
          <th style="padding:10px; text-align:center; color:#eab308;">⚽ Goles</th>
          <th style="padding:10px; text-align:center; color:#eab308;">🏃 PJ</th>
          <th style="padding:10px; text-align:center; color:#eab308;">⭐ MVP</th>
          <th style="padding:10px; text-align:center; color:#eab308;">🟨 Amarillas</th>
          <th style="padding:10px; text-align:center; color:#eab308;">🟥 Rojas</th>
          <th style="padding:10px; text-align:center; color:#eab308;">Rating</th>
        </tr>
      </thead>
      <tbody>
        ${jugadores.map((j, i) => `
          <tr style="border-bottom:1px solid #30363d; ${i % 2 ? 'background:rgba(0,0,0,0.2);' : ''}">
            <td style="padding:10px;">${j.nombre}</td>
            <td style="padding:10px; text-align:center;">${j.goles}</td>
            <td style="padding:10px; text-align:center;">${j.pj}</td>
            <td style="padding:10px; text-align:center;">${j.mvps || 0}</td>
            <td style="padding:10px; text-align:center;">${j.amarillas || 0}</td>
            <td style="padding:10px; text-align:center;">${j.rojas || 0}</td>
            <td style="padding:10px; text-align:center; font-weight:bold; color:#eab308;">${calcularRating(j)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function calcularRating(j) {
  let media = 60 + (j.goles * 0.5) + (j.pj * 0.2) + ((j.mvps || 0) * 2.0);
  media -= ((j.amarillas || 0) * 0.5) + ((j.rojas || 0) * 2.0);
  return Math.min(99, Math.max(10, Math.round(media)));
}