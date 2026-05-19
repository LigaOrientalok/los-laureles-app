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
    `<option value="${t.id}" ${t.id === torneoActual ? 'selected' : ''}>${t.nombre}</option>`
  ).join('');

  selectTorneo.addEventListener('change', async (e) => {
    torneoActual = parseInt(e.target.value);
    await recargarDatos();
  });
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
  const options = equipos.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

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
      <td style="text-align:left"><img src="${e.logo}" class="mini-logo-table" style="width:28px; height:28px; border-radius:50%; margin-right:8px;">${e.nombre}</td>
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

  const fixture = await db.getFixture(torneoActual);
  const cont = document.getElementById('cont-fixture');
  if (!cont) return;

  const grupos = fixture.reduce((acc, m) => {
    const k = `${m.dia_semana} - ${m.fecha}`;
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  cont.innerHTML = Object.keys(grupos).map(titulo => `
    <div style="margin-bottom:20px">
      <h3>${titulo}</h3>
      ${grupos[titulo].map(m => `
        <div class="fixture-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#0d1117; border-radius:8px; margin-bottom:10px; border-left:4px solid #eab308;">
          <span>${m.hora}</span>
          <div style="flex:1; text-align:right">Equipo ${m.equipo_local_id}</div>
          <div style="margin:0 10px; font-size:10px">VS</div>
          <div style="flex:1">Equipo ${m.equipo_visitante_id}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}