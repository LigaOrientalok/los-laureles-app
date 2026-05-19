// Sistema de Exportación de Datos

async function exportarJSON(torneoId) {
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
}

async function exportarCSV(torneoId) {
  const equipos = await db.getEquipos(torneoId);
  const jugadores = await db.getJugadores(torneoId);

  let csv = 'TABLA DE POSICIONES\n\n';
  csv += 'Pos,Equipo,PJ,V,E,P,GF,GC,DF,PTS\n';
  
  const equiposOrdenados = [...equipos].sort((a, b) => b.pts - a.pts);
  equiposOrdenados.forEach((e, i) => {
    csv += `${i + 1},${e.nombre},${e.pj},${e.v},${e.e},${e.p},${e.gf},${e.gc},${e.gf - e.gc},${e.pts}\n`;
  });

  csv += '\n\nJUGADORES\n\n';
  csv += 'CI,Nombre,Posición,Goles,PJ,MVP,Amarillas,Rojas\n';
  
  jugadores.forEach(j => {
    csv += `${j.ci},${j.nombre},${j.posicion},${j.goles},${j.pj},${j.mvps || 0},${j.amarillas || 0},${j.rojas || 0}\n`;
  });

  descargarArchivo(csv, `liga-oriental-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

async function exportarPDF(torneoId) {
  const torneo = await db.getTorneo(torneoId);
  const equipos = await db.getEquipos(torneoId);
  const jugadores = await db.getJugadores(torneoId);

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
      <h1>🏆 LIGA ORIENTAL - ${torneo.nombre}</h1>
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
        <td>${e.nombre}</td>
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
        <td>${j.nombre}</td>
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
  alert('✅ Respaldo completado');
}