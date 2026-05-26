// Sistema de Exportación de Datos

function csvEscape(val) {
  const s = String(val || '');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function exportarJSON(torneoId) {
  const btn = document.querySelector('[onclick*="exportarJSON"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Exportando...'; }
  try {
    const torneo = await db.getTorneo(torneoId);
    const equipos = await db.getEquipos(torneoId);
    const jugadores = await db.getJugadores(torneoId);
    const fixture = await db.getFixture(torneoId);
    const resultados = await db.getResultados(torneoId);

    const datos = {
      torneo,
      equipos,
      jugadores,
      fixture,
      resultados,
      fecha_exportacion: new Date().toISOString()
    };

    const json = JSON.stringify(datos, null, 2);
    descargarArchivo(json, `liga-oriental-${torneo.nombre}-${new Date().getTime()}.json`, 'application/json');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📄 JSON'; }
  }
}

async function exportarCSV(torneoId) {
  const btn = document.querySelector('[onclick*="exportarCSV"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Exportando...'; }
  try {
    const equipos = await db.getEquipos(torneoId);
    const jugadores = await db.getJugadores(torneoId);

    let csv = 'TABLA DE POSICIONES\n\n';
    csv += 'Pos,Equipo,PJ,V,E,P,GF,GC,DF,PTS\n';

    const equiposOrdenados = [...equipos].sort((a, b) => b.pts - a.pts);
    equiposOrdenados.forEach((e, i) => {
      csv += `${i + 1},${csvEscape(e.nombre)},${e.pj},${e.v},${e.e},${e.p},${e.gf},${e.gc},${e.gf - e.gc},${e.pts}\n`;
    });

    csv += '\n\nJUGADORES\n\n';
    csv += 'CI,Nombre,Posición,Goles,PJ,MVP,Amarillas,Rojas\n';

    jugadores.forEach(j => {
      csv += `${csvEscape(j.ci)},${csvEscape(j.nombre)},${j.posicion},${j.goles},${j.pj},${j.mvps || 0},${j.amarillas || 0},${j.rojas || 0}\n`;
    });

    descargarArchivo(csv, `liga-oriental-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📊 CSV'; }
  }
}

async function exportarPDF(torneoId) {
  const btn = document.querySelector('[onclick*="exportarPDF"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Exportando...'; }
  try {
    const torneo = await db.getTorneo(torneoId);
    const equipos = await db.getEquipos(torneoId);
    const jugadores = await db.getJugadores(torneoId);

    const eNombre = e => escapeHtml(e.nombre);
    const jNombre = j => escapeHtml(j.nombre);

    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #eab308; border-bottom: 3px solid #eab308; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
          th { background: #eab308; color: black; font-weight: bold; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>🏆 LIGA ORIENTAL - ${escapeHtml(torneo.nombre)}</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>

        <h2>📊 Tabla de Posiciones</h2>
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>V</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>GC</th>
              <th>DF</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
    `;

    const equiposOrdenados = [...equipos].sort((a, b) => b.pts - a.pts);
    equiposOrdenados.forEach((e, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${eNombre(e)}</td>
          <td>${e.pj}</td>
          <td>${e.v}</td>
          <td>${e.e}</td>
          <td>${e.p}</td>
          <td>${e.gf}</td>
          <td>${e.gc}</td>
          <td>${e.gf - e.gc}</td>
          <td><strong>${e.pts}</strong></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>

        <h2>⚽ Top Goleadores</h2>
        <table>
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Goles</th>
              <th>PJ</th>
              <th>MVP</th>
            </tr>
          </thead>
          <tbody>
    `;

    const goleadores = [...jugadores].sort((a, b) => b.goles - a.goles).slice(0, 10);
    goleadores.forEach(j => {
      html += `
        <tr>
          <td>${jNombre(j)}</td>
          <td>${j.goles}</td>
          <td>${j.pj}</td>
          <td>${j.mvps || 0}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>

        <p style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          Documento generado automáticamente - Liga Oriental 2026
        </p>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1000);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📑 PDF'; }
  }
}

function descargarArchivo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  link.click();
  URL.revokeObjectURL(url);
}

async function respaldarDatos() {
  const btn = document.querySelector('[onclick*="respaldarDatos"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Respaldando...'; }
  try {
    const torneos = await db.getTorneos();
    let datosCompletos = { torneos: [], fecha_respaldo: new Date().toISOString() };

    for (const t of torneos) {
      datosCompletos.torneos.push({
        torneo: t,
        equipos: await db.getEquipos(t.id),
        jugadores: await db.getJugadores(t.id),
        fixture: await db.getFixture(t.id),
        resultados: await db.getResultados(t.id)
      });
    }

    const json = JSON.stringify(datosCompletos, null, 2);
    descargarArchivo(json, `respaldo-liga-oriental-${new Date().getTime()}.json`, 'application/json');
    mostrarToast('Respaldo completado', 'success');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Respaldo'; }
  }
}

// Recompute all stats from raw data
async function recomputarEstadisticas(torneoId) {
  if (!confirm('¿Recomputar todas las estadísticas desde cero? Esto sobreescribirá los datos actuales.')) return;
  mostrarToast('Recomputando estadísticas...', 'success');

  const [equipos, jugadores, fixture, resultados, goles, tarjetas] = await Promise.all([
    db.getEquipos(torneoId),
    db.getJugadores(torneoId),
    db.getFixture(torneoId),
    db.getResultados(torneoId),
    _supabase.from('goles').select('*'),
    _supabase.from('tarjetas').select('*')
  ]);
  const allGoles = goles?.data || [];
  const allTarjetas = tarjetas?.data || [];

  // Build running totals in memory
  const eqStats = {};
  for (const eq of equipos) eqStats[eq.id] = { pj: 0, v: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, vallas_invictas: 0 };
  const jStats = {};
  for (const j of jugadores) jStats[j.id] = { goles: 0, pj: 0, mvps: 0, amarillas: 0, rojas: 0 };

  for (const res of resultados) {
    const e1s = eqStats[res.equipo_local_id];
    const e2s = eqStats[res.equipo_visitante_id];
    if (!e1s || !e2s) continue;

    e1s.pj++; e1s.gf += res.goles_local; e1s.gc += res.goles_visitante;
    e2s.pj++; e2s.gf += res.goles_visitante; e2s.gc += res.goles_local;

    if (res.goles_local > res.goles_visitante) {
      e1s.v++; e1s.pts += 3; e2s.p++;
    } else if (res.goles_visitante > res.goles_local) {
      e2s.v++; e2s.pts += 3; e1s.p++;
    } else {
      e1s.e++; e2s.e++; e1s.pts++; e2s.pts++;
    }
    if (res.goles_visitante === 0) e1s.vallas_invictas++;
    if (res.goles_local === 0) e2s.vallas_invictas++;

    const resGoles = allGoles.filter(g => g.resultado_id === res.id);
    const playersThisMatch = new Set();

    for (const g of resGoles) {
      if (!jStats[g.jugador_id]) continue;
      jStats[g.jugador_id].goles++;
      playersThisMatch.add(g.jugador_id);
    }
    for (const pid of playersThisMatch) jStats[pid].pj++;

    const resTarjetas = allTarjetas.filter(t => t.resultado_id === res.id);
    for (const t of resTarjetas) {
      if (!jStats[t.jugador_id]) continue;
      if (t.tipo === 'A') jStats[t.jugador_id].amarillas++;
      else jStats[t.jugador_id].rojas++;
    }

    if (res.mvp_id && jStats[res.mvp_id]) jStats[res.mvp_id].mvps++;
  }

  // Batch write all updates
  for (const [id, s] of Object.entries(eqStats)) await db.updateEquipo(parseInt(id), s);
  for (const [id, s] of Object.entries(jStats)) await db.updateJugador(parseInt(id), s);

  mostrarToast('Estadísticas recalculadas desde cero', 'success');
}
