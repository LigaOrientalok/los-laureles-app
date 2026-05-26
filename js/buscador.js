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

// Floating search bar (siempre visible en el header)
let _floatSearchTimer = null;

window.initFloatingSearch = function() {
  if (document.getElementById('floating-search-input')) return;

  const wrap = document.createElement('div');
  wrap.id = 'floating-search-wrap';
  wrap.style.cssText = 'display:flex; gap:10px; justify-content:center; background:#161b22; padding:10px 16px; border-bottom:1px solid #21262d;';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'floating-search-input';
  input.placeholder = '🔍 Buscar jugador...';
  input.autocomplete = 'off';
  input.style.cssText = 'width:100%; max-width:400px; padding:10px 14px; border-radius:8px; background:#0d1117; color:white; border:1px solid #eab308; font-size:0.9rem; box-sizing:border-box;';
  wrap.appendChild(input);

  const dropdown = document.createElement('div');
  dropdown.id = 'floating-search-dropdown';
  dropdown.style.cssText = 'display:none; position:absolute; top:100%; left:50%; transform:translateX(-50%); width:min(100%,420px); background:#161b22; border:1px solid #30363d; border-radius:0 0 8px 8px; max-height:320px; overflow-y:auto; z-index:200; box-shadow:0 8px 30px rgba(0,0,0,0.5);';
  wrap.appendChild(dropdown);

  const header = document.querySelector('header');
  if (header && header.parentNode) {
    header.parentNode.insertBefore(wrap, header.nextSibling);
  } else {
    document.getElementById('app')?.appendChild(wrap);
  }

  input.addEventListener('input', function() {
    clearTimeout(_floatSearchTimer);
    _floatSearchTimer = setTimeout(() => buscarFlotante(this.value), 200);
  });

  input.addEventListener('focus', function() {
    if (this.value.trim()) buscarFlotante(this.value);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarDropdownFlotante();
    if (e.key === 'Enter' && this.value.trim()) {
      const first = dropdown.querySelector('.float-result');
      if (first) first.click();
    }
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#floating-search-wrap')) cerrarDropdownFlotante();
  });
};

async function buscarFlotante(text) {
  const dropdown = document.getElementById('floating-search-dropdown');
  if (!dropdown) return;
  const term = text.trim().toLowerCase();
  if (!term || !torneoActual) { dropdown.style.display = 'none'; return; }

  try {
    const jugadores = await db.getJugadores(torneoActual);
    const equipos = await db.getEquipos(torneoActual);
    const matches = jugadores.filter(j => j.nombre.toLowerCase().includes(term)).slice(0, 8);

    if (matches.length === 0) {
      dropdown.innerHTML = '<div style="padding:12px;color:#8b949e;text-align:center;font-size:0.85rem;">Sin resultados</div>';
      dropdown.style.display = 'block';
      return;
    }

    const posColors = { POR: '#f97316', DFC: '#3b82f6', MC: '#22c55e', DEL: '#ef4444' };
    const posMap = { POR: 'POR', DFC: 'DFC', MC: 'MC', DEL: 'DEL' };

    dropdown.innerHTML = matches.map(j => {
      const eqs = (j.equipos || []).map(eId => equipos.find(e => e.id === eId)).filter(Boolean);
      return `
        <div class="float-result" onclick="mostrarDetalleJugador(${j.id}); cerrarDropdownFlotante();">
          <img src="${j.foto || DEFAULT_AVATAR}" class="float-result-foto" onerror="this.src='${DEFAULT_AVATAR}'">
          <div style="flex:1;min-width:0;">
            <div class="float-result-nombre">${escapeHtml(j.nombre)}</div>
            <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
              <span style="background:${posColors[j.posicion] || '#30363d'};padding:1px 8px;border-radius:3px;font-size:0.6rem;font-weight:bold;color:white;">${posMap[j.posicion] || j.posicion}</span>
              ${eqs.map(eq => eq.logo ? `<img src="${eq.logo}" style="width:14px;height:14px;border-radius:50%;object-fit:cover;">` : '').join('')}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;font-size:0.75rem;color:#8b949e;">
            <div>⚽ ${j.goles || 0}</div>
            <div>⭐ ${j.mvps || 0}</div>
          </div>
        </div>
      `;
    }).join('');
    dropdown.style.display = 'block';
  } catch (e) {
    dropdown.style.display = 'none';
  }
}

window.cerrarDropdownFlotante = function() {
  const dropdown = document.getElementById('floating-search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
};

function populateTeamFilter(equipos) {
  const sel = document.getElementById('buscador-eq');
  if (!sel || sel.dataset.populated) return;
  sel.innerHTML = '<option value="">Todos los equipos</option>' +
    equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');
  sel.dataset.populated = '1';
}
