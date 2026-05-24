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
  const nombre = prompt('Nombre del nuevo torneo:');
  if (!nombre) return;

  const descripcion = prompt('Descripción (opcional):');
  const torneo = await db.createTorneo(nombre, descripcion);
  
  if (torneo) {
    torneoActual = torneo.id;
    await inicializarTorneos();
    alert(`✅ Torneo "${nombre}" creado`);
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