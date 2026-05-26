// Equipos e Historial de Torneos

// ==========================================
// TEAM BROWSER
// ==========================================

window.renderEquipos = async function() {
  if (!torneoActual) return;

  const cont = document.getElementById('equipos-content');
  if (!cont) return;

  const equipos = await db.getEquipos(torneoActual);

  if (equipos.length === 0) {
    cont.innerHTML = '<p style="color:#8b949e; text-align:center; padding:40px; grid-column:1/-1;">No hay equipos en este torneo</p>';
    return;
  }

  cont.innerHTML = equipos.map(e => {
    const dif = (e.gf || 0) - (e.gc || 0);
    return `
      <div class="equipo-card" onclick="mostrarDetalleEquipo(${e.id})">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <img src="${e.logo || ''}" class="equipo-card-logo" onerror="this.style.display='none'">
          <div>
            <div class="equipo-card-nombre">${escapeHtml(e.nombre)}</div>
            <div class="equipo-card-dia">${escapeHtml(e.dia_semana)}</div>
          </div>
        </div>
        <div class="equipo-card-stats">
          <div class="eq-stat"><span class="eq-stat-val" style="color:#3b82f6;">${e.pts || 0}</span><span class="eq-stat-label">PTS</span></div>
          <div class="eq-stat"><span class="eq-stat-val">${e.pj || 0}</span><span class="eq-stat-label">PJ</span></div>
          <div class="eq-stat"><span class="eq-stat-val" style="color:#22c55e">${e.v || 0}</span><span class="eq-stat-label">V</span></div>
          <div class="eq-stat"><span class="eq-stat-val" style="color:#eab308">${e.e || 0}</span><span class="eq-stat-label">E</span></div>
          <div class="eq-stat"><span class="eq-stat-val" style="color:#ef4444">${e.p || 0}</span><span class="eq-stat-label">P</span></div>
          <div class="eq-stat"><span class="eq-stat-val" style="color:${dif >= 0 ? '#22c55e' : '#ef4444'}">${dif >= 0 ? '+' : ''}${dif}</span><span class="eq-stat-label">DF</span></div>
        </div>
      </div>
    `;
  }).join('');
};

// ==========================================
// TOURNAMENT HISTORY
// ==========================================

window.renderHistorial = async function() {
  const cont = document.getElementById('historial-content');
  if (!cont) return;

  cont.innerHTML = '<p style="color:#8b949e; text-align:center; padding:40px; grid-column:1/-1;">Cargando historial...</p>';

  const torneos = await db.getTorneos();

  if (torneos.length === 0) {
    cont.innerHTML = '<p style="color:#8b949e; text-align:center; padding:40px; grid-column:1/-1;">No hay torneos registrados</p>';
    return;
  }

  const historial = await Promise.all(torneos.slice().reverse().map(async (t) => {
    const [equipos, jugadores] = await Promise.all([
      db.getEquipos(t.id),
      db.getJugadores(t.id)
    ]);

    let champion = null;
    if (equipos.length > 0) {
      const sorted = [...equipos].sort((a, b) => (b.pts || 0) - (a.pts || 0) || ((b.gf || 0) - (b.gc || 0)) - ((a.gf || 0) - (a.gc || 0)));
      if (sorted[0]?.pj > 0) champion = sorted[0];
    }

    const topScorer = [...jugadores].sort((a, b) => (b.goles || 0) - (a.goles || 0))[0];
    const topMvp = [...jugadores].sort((a, b) => (b.mvps || 0) - (a.mvps || 0))[0];

    return {
      ...t,
      equiposCount: equipos.length,
      jugadoresCount: jugadores.length,
      champion: champion ? { nombre: champion.nombre, logo: champion.logo, pts: champion.pts } : null,
      topScorer: topScorer ? { nombre: topScorer.nombre, goles: topScorer.goles } : null,
      topMvp: topMvp ? { nombre: topMvp.nombre, mvps: topMvp.mvps } : null
    };
  }));

  cont.innerHTML = historial.map(t => `
    <div class="historial-card">
      <div class="historial-header">
        <h3 style="color:#eab308; margin:0; font-size:1rem;">${escapeHtml(t.nombre)}</h3>
        ${t.descripcion ? `<p style="color:#8b949e; margin:4px 0 0; font-size:0.8rem;">${escapeHtml(t.descripcion)}</p>` : ''}
      </div>
      <div class="historial-body">
        <div class="historial-row">
          <span class="historial-label">📋 Equipos</span>
          <span class="historial-value">${t.equiposCount}</span>
        </div>
        <div class="historial-row">
          <span class="historial-label">👤 Jugadores</span>
          <span class="historial-value">${t.jugadoresCount}</span>
        </div>
        ${t.champion ? `
          <div class="historial-row historial-champion">
            <span class="historial-label">🏆 Campeón</span>
            <span class="historial-value" style="color:#eab308; font-weight:bold;">
              ${t.champion.logo ? `<img src="${t.champion.logo}" style="width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-right:4px;">` : ''}
              ${escapeHtml(t.champion.nombre)} (${t.champion.pts} pts)
            </span>
          </div>
        ` : '<div class="historial-row"><span class="historial-label">🏆 Campeón</span><span class="historial-value" style="color:#8b949e;">—</span></div>'}
        ${t.topScorer && t.topScorer.goles > 0 ? `
          <div class="historial-row">
            <span class="historial-label">⚽ Goleador</span>
            <span class="historial-value" style="color:#22c55e;">${escapeHtml(t.topScorer.nombre)} (${t.topScorer.goles})</span>
          </div>
        ` : ''}
        ${t.topMvp && t.topMvp.mvps > 0 ? `
          <div class="historial-row">
            <span class="historial-label">⭐ MVP</span>
            <span class="historial-value" style="color:#f97316;">${escapeHtml(t.topMvp.nombre)} (${t.topMvp.mvps})</span>
          </div>
        ` : ''}
      </div>
      <button onclick="cargarTorneoHistorial(${t.id})" class="btn-mini" style="background:#3b82f6; color:white; width:100%; margin-top:10px;">📂 Ver Torneo</button>
    </div>
  `).join('');
};

window.cargarTorneoHistorial = async function(torneoId) {
  const selectTorneo = document.getElementById('select-torneo');
  if (selectTorneo) {
    selectTorneo.value = torneoId;
    torneoActual = torneoId;
    await recargarDatos();
    const tablasBtn = document.querySelector('.nav-btn[onclick*="tablas"]');
    if (tablasBtn) showSec('tablas', tablasBtn);
  }
};
