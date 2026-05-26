// Buscador de Jugadores

window.renderBuscador = async function() {
  if (!torneoActual) return;

  const cont = document.getElementById('buscador-content');
  if (!cont) return;

  const [jugadores, equipos] = await Promise.all([
    db.getJugadores(torneoActual),
    db.getEquipos(torneoActual)
  ]);

  populateTeamFilter(equipos);

  const searchTerm = (document.getElementById('buscador-search')?.value || '').toLowerCase().trim();
  const posFilter = document.getElementById('buscador-pos')?.value || '';
  const eqFilter = document.getElementById('buscador-eq')?.value || '';

  let filtered = jugadores;
  if (searchTerm) filtered = filtered.filter(j => j.nombre.toLowerCase().includes(searchTerm));
  if (posFilter) filtered = filtered.filter(j => j.posicion === posFilter);
  if (eqFilter) filtered = filtered.filter(j => j.equipos?.includes(parseInt(eqFilter)));

  if (filtered.length === 0) {
    cont.innerHTML = '<p style="color:#8b949e; text-align:center; padding:40px; grid-column:1/-1;">No se encontraron jugadores</p>';
    return;
  }

  const posMap = { POR: 'POR', DFC: 'DFC', MC: 'MC', DEL: 'DEL' };
  const posColors = { POR: '#f97316', DFC: '#3b82f6', MC: '#22c55e', DEL: '#ef4444' };

  cont.innerHTML = filtered.map(j => {
    const eqs = (j.equipos || []).map(eId => equipos.find(e => e.id === eId)).filter(Boolean);
    const xp = typeof calcularXP === 'function' ? calcularXP(j) : 0;
    const nivel = typeof calcularNivel === 'function' ? calcularNivel(xp) : 1;
    const nivelColor = typeof getNivelColor === 'function' ? getNivelColor(nivel) : '#8b949e';
    const rating = typeof calcularRating === 'function' ? calcularRating(j) : 60;

    return `
      <div class="buscador-card" onclick="mostrarDetalleJugador(${j.id})">
        <div class="buscador-foto-wrap">
          <img src="${j.foto || DEFAULT_AVATAR}" class="buscador-foto" loading="lazy">
          <span class="buscador-nivel" style="background:${nivelColor};">Lv.${nivel}</span>
        </div>
        <div class="buscador-info">
          <div class="buscador-nombre">${escapeHtml(j.nombre)}</div>
          <div class="buscador-meta">
            <span class="buscador-pos" style="background:${posColors[j.posicion] || '#30363d'};">${posMap[j.posicion] || j.posicion}</span>
            ${eqs.map(eq => eq.logo ? `<img src="${eq.logo}" class="buscador-eq-logo" title="${escapeHtml(eq.nombre)}">` : '').join('')}
          </div>
        </div>
        <div class="buscador-stats">
          <div class="buscador-stat">
            <span class="buscador-stat-val">${j.goles || 0}</span>
            <span class="buscador-stat-label">⚽</span>
          </div>
          <div class="buscador-stat">
            <span class="buscador-stat-val">${j.mvps || 0}</span>
            <span class="buscador-stat-label">⭐</span>
          </div>
          <div class="buscador-stat">
            <span class="buscador-stat-val">${rating}</span>
            <span class="buscador-stat-label">📊</span>
          </div>
          <div class="buscador-stat">
            <span class="buscador-stat-val">${j.pj || 0}</span>
            <span class="buscador-stat-label">🏃</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

function populateTeamFilter(equipos) {
  const sel = document.getElementById('buscador-eq');
  if (!sel || sel.dataset.populated) return;
  sel.innerHTML = '<option value="">Todos los equipos</option>' +
    equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');
  sel.dataset.populated = '1';
}
