// Gestión de Múltiples Torneos

let torneoActual = null;

async function inicializarTorneos() {
  const torneos = await db.getTorneos();
  if (torneos.length > 0) {
    torneoActual = torneos[0].id;
    renderizarSelectorTorneos(torneos);
  }
}

function renderizarSelectorTorneos(torneos) {
  const selectTorneo = document.getElementById('select-torneo');
  if (!selectTorneo) return;

  selectTorneo.innerHTML = torneos.map(t => 
    `<option value="${t.id}" ${t.id === torneoActual ? 'selected' : ''}>${escapeHtml(t.nombre)}</option>`
  ).join('');

  selectTorneo.onchange = async (e) => {
    torneoActual = parseInt(e.target.value);
    await recargarDatos();
  };
}

async function crearNuevoTorneo() {
  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'torneo-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:16px; padding:30px; max-width:400px; width:90%; position:relative;">
      <button onclick="this.closest('#torneo-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <h2 style="color:#eab308; text-align:center; margin:0 0 20px 0;">➕ Nuevo Torneo</h2>
      <label class="label-accent">Nombre:</label>
      <input type="text" id="new-torneo-name" placeholder="Ej: Torneo Apertura 2026" style="margin-bottom:15px;">
      <label class="label-accent">Descripción (opcional):</label>
      <input type="text" id="new-torneo-desc" placeholder="Ej: Torneo de verano" style="margin-bottom:20px;">
      <button onclick="guardarNuevoTorneo()" style="width:100%; padding:14px; background:#eab308; color:black; font-weight:bold; border:none; border-radius:6px; cursor:pointer; font-size:1rem;">Crear Torneo</button>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('new-torneo-name')?.focus(), 100);
}

async function guardarNuevoTorneo() {
  const nombre = document.getElementById('new-torneo-name')?.value?.trim();
  if (!nombre) return mostrarErrorUsuario('El nombre es obligatorio');
  const descripcion = document.getElementById('new-torneo-desc')?.value?.trim();

  const btn = document.querySelector('#torneo-overlay button:last-child');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Creando...'; }

  const torneo = await db.createTorneo(nombre, descripcion);
  if (torneo) {
    torneoActual = torneo.id;
    await inicializarTorneos();
    mostrarToast(`Torneo "${nombre}" creado`, 'success');
    document.getElementById('torneo-overlay')?.remove();
  } else {
    if (btn) { btn.disabled = false; btn.textContent = 'Crear Torneo'; }
  }
}

async function recargarDatos() {
  if (!torneoActual) return;
  
  try {
    await updateSelects();
    await renderTablaActual();
    await renderFixtureActual();
  } catch (e) {
    console.error('Error recargando datos:', e);
  }
}

async function updateSelects() {
  if (!torneoActual) return;

  const equipos = await db.getEquipos(torneoActual);
  const options = equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');

  ['regEqSelect', 'resE1', 'resE2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const val = el.value;
      el.innerHTML = '<option disabled selected>Seleccionar...</option>' + options;
      if (val) el.value = val;
    }
  });
}

async function renderTablaActual() {
  if (!torneoActual) return;
  
  const dia = document.getElementById('selectDiaTablas')?.value;
  if (!dia) return;

  const equipos = await db.getEquipos(torneoActual);
  const filtrados = equipos
    .filter(e => e.dia_semana === dia)
    .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));

  const tbody = document.getElementById('bodyPos');
  if (!tbody) return;

  tbody.innerHTML = filtrados.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="text-align:left">
        <img src="${e.logo}" class="mini-logo-table" style="width:28px; height:28px; border-radius:50%; margin-right:8px;">
        <a href="#" onclick="mostrarDetalleEquipo(${e.id}); return false;" style="color:white; text-decoration:none; font-weight:600;" onmouseover="this.style.color='#eab308'" onmouseout="this.style.color='white'">${escapeHtml(e.nombre)}</a>
      </td>
      <td>${e.pj}</td>
      <td>${e.v}</td>
      <td>${e.e}</td>
      <td>${e.p}</td>
      <td>${e.gf}</td>
      <td>${e.gc}</td>
      <td>${e.gf - e.gc}</td>
      <td><b>${e.pts}</b></td>
    </tr>
  `).join('');
}

async function renderFixtureActual() {
  if (!torneoActual) return;

  const [fixture, equipos, resultados] = await Promise.all([
    db.getFixture(torneoActual),
    db.getEquipos(torneoActual),
    db.getResultados(torneoActual)
  ]);
  const cont = document.getElementById('cont-fixture');
  if (!cont) return;

  const resPorFixture = {};
  resultados.forEach(r => { if (r.fixture_id) resPorFixture[r.fixture_id] = r; });

  const getEqName = (id) => {
    const eq = equipos.find(e => e.id === id);
    return eq ? escapeHtml(eq.nombre) : `Equipo ${id}`;
  };

  const grupos = fixture.reduce((acc, m) => {
    const k = `${escapeHtml(m.dia_semana)} - ${escapeHtml(m.fecha)}`;
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  const admin = window.esAdmin === true;

  cont.innerHTML = Object.keys(grupos).map(titulo => `
    <div style="margin-bottom:20px">
      <h3>${titulo}</h3>
      ${grupos[titulo].map(m => {
        const res = resPorFixture[m.id];
        return `
        <div class="fixture-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#0d1117; border-radius:8px; margin-bottom:10px; border-left:4px solid ${res ? '#22c55e' : '#eab308'};">
          <span style="font-weight:600; color:#eab308; min-width:50px;">${m.hora}</span>
          <div style="flex:1; text-align:right; font-weight:600;">${getEqName(m.equipo_local_id)}</div>
          <div style="margin:0 15px; font-size:0.9rem; font-weight:700; color:${res ? '#22c55e' : '#8b949e'};">
            ${res ? `${res.goles_local} - ${res.goles_visitante}` : 'VS'}
          </div>
          <div style="flex:1; font-weight:600;">${getEqName(m.equipo_visitante_id)}</div>
          ${admin ? `
            <div style="display:flex; gap:5px; margin-left:10px;">
              ${res ? `
                <button onclick="cargarEdicionResultado(${m.id})" class="btn-mini" style="background:#3b82f6; color:white; padding:4px 10px; font-size:0.75rem;">✏️ Editar</button>
                <button onclick="eliminarResultado(${m.id})" class="btn-mini" style="background:#ef4444; color:white; padding:4px 10px; font-size:0.75rem;">🗑️ Resultado</button>
              ` : `
                <button onclick="cargarResultadoDeFixture(${m.id})" class="btn-mini" style="background:#22c55e; color:white; padding:4px 10px; font-size:0.75rem;">⚽ Resultado</button>
                <button onclick="eliminarPartido(${m.id})" class="btn-mini" style="background:#ef4444; color:white; padding:4px 10px; font-size:0.75rem;">🗑️</button>
              `}
            </div>
          ` : ''}
        </div>`;
      }).join('')}
    </div>
  `).join('');
}