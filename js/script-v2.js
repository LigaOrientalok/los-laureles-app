// Script Principal actualizado con Supabase

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%2330363d' width='150' height='150'/%3E%3Ctext fill='%238b949e' font-family='sans-serif' font-size='14' text-anchor='middle' x='75' y='85'%3ESin Foto%3C/text%3E%3C/svg%3E";
let tempImgJugador = DEFAULT_AVATAR;

// Inicialización (se llama desde mostrarApp)

window.showSec = function(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('sec-' + id);
  if(target) target.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  
  if(id === 'fama') renderFama();
  if(id === 'fixture') renderFixtureActual();
  if(id === 'stats') renderEstadisticasAvanzadas(torneoActual, '');
};

async function comprimirImagen(base64, maxWidth = 300) {
  return new Promise(resolve => {
    const img = new Image(); img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
}

window.previewImage = async function(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      tempImgJugador = await comprimirImagen(e.target.result);
      const preImg = document.getElementById('preImg');
      if (preImg) preImg.src = tempImgJugador;
      updatePreview();
    };
    reader.readAsDataURL(input.files[0]);
  }
};

window.updatePreview = async function() {
  const preNom = document.getElementById('preNom');
  const prePos = document.getElementById('prePos');
  const prePie = document.getElementById('prePie');
  const preGoles = document.getElementById('preGoles');
  const prePJ = document.getElementById('prePJ');
  const preMedia = document.getElementById('preMedia');
  const preLogoEq = document.getElementById('preLogoEq');
  const regNom = document.getElementById('regNom');
  const regPos = document.getElementById('regPos');
  const regPierna = document.getElementById('regPierna');
  const regCI = document.getElementById('regCI');
  const regEqSelect = document.getElementById('regEqSelect');

  if (preNom && regNom) preNom.innerText = regNom.value.toUpperCase() || "JUGADOR";
  if (prePos && regPos) prePos.innerText = regPos.value;
  if (prePie && regPierna) prePie.innerText = regPierna.value;
  if (preGoles) preGoles.innerText = '0';
  if (prePJ) prePJ.innerText = '0';
  if (preMedia) preMedia.innerText = '60';

  if (!torneoActual || !regCI) return;
  
  const ci = regCI.value.trim();
  if (ci) {
    const jugadores = await db.getJugadores(torneoActual);
    const j = jugadores.find(x => x.ci === ci);
    if (j) {
      if (preGoles) preGoles.innerText = j.goles;
      if (prePJ) prePJ.innerText = j.pj;
      if (preMedia) preMedia.innerText = calcularRating(j);
    }
  }
  
  const equipoId = regEqSelect ? parseInt(regEqSelect.value) : null;
  if (equipoId && preLogoEq) {
    const equipos = await db.getEquipos(torneoActual);
    const eq = equipos.find(e => e.id === equipoId);
    if (eq && eq.logo) {
      preLogoEq.src = eq.logo;
      preLogoEq.style.display = "block";
    }
  }
};

window.savePlayer = async function(btn) {
  if (!torneoActual) return mostrarErrorUsuario('Selecciona un torneo');
  
  const ci = document.getElementById('regCI').value.trim();
  const nom = document.getElementById('regNom').value.trim().toUpperCase();
  const equipoId = parseInt(document.getElementById('regEqSelect').value);

  if(!ci || !nom || !equipoId) return mostrarErrorUsuario("Datos incompletos");

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando...'; }
  try {
    const jugadores = await db.getJugadores(torneoActual);
    let exist = jugadores.find(j => j.ci === ci);
    
    if(exist) {
      const equiposJugador = await db.getEquiposJugador(exist.id);
      if(!equiposJugador.includes(equipoId)) {
        await db.vincularJugadorEquipo(exist.id, equipoId);
        mostrarErrorUsuario("✅ Vinculado");
      } else {
        mostrarErrorUsuario("Ya registrado");
      }
    } else {
      const nuevoJugador = await db.createJugador(
        torneoActual,
        ci,
        nom,
        document.getElementById('regPos').value,
        document.getElementById('regPierna').value,
        tempImgJugador
      );
      if(nuevoJugador) {
        await db.vincularJugadorEquipo(nuevoJugador.id, equipoId);
        mostrarErrorUsuario("✅ Jugador Creado");
      }
    }
    updatePreview();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'VINCULAR / CREAR FICHA'; }
  }
};

window.addEq = async function(btn) {
  if (!torneoActual) return mostrarErrorUsuario('Selecciona un torneo');
  
  const nom = document.getElementById('adNom').value.trim();
  const fileInput = document.getElementById('adLog');
  
  if(!nom || !fileInput.files[0]) return mostrarErrorUsuario("Faltan datos");
  
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Creando...'; }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const logo = await comprimirImagen(e.target.result, 150);
    const equipo = await db.createEquipo(torneoActual, nom, document.getElementById('adDia').value, logo);
    if(equipo) {
      mostrarErrorUsuario("✅ Equipo Creado");
      await updateSelects();
    }
    if (btn) { btn.disabled = false; btn.textContent = '➕ Agregar'; }
  };
  reader.readAsDataURL(fileInput.files[0]);
};

window.generarFixtureAuto = async function(btn) {
  if (!torneoActual) return mostrarErrorUsuario('Selecciona un torneo');
  
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generando...'; }
  try {
    const dia = document.getElementById('fixDiaGen').value;
    const horaInicio = document.getElementById('fixHoraInicio').value;
    const duracion = parseInt(document.getElementById('fixDuracion').value);
    
    const equipos = await db.getEquipos(torneoActual);
    let equiposDia = equipos.filter(e => e.dia_semana === dia).map(e => e.nombre);
    
    if (equiposDia.length < 2) return mostrarErrorUsuario("Necesitas más equipos");
    if (equiposDia.length % 2 !== 0) equiposDia.push("DESCANSA");
    
    const numE = equiposDia.length;
    for (let r = 0; r < numE - 1; r++) {
      let fechaH = new Date(`${new Date().getFullYear()}-01-01T${horaInicio}:00`);
      for (let p = 0; p < numE / 2; p++) {
        const local = equiposDia[p];
        const visitante = equiposDia[numE - 1 - p];
        if (local !== "DESCANSA" && visitante !== "DESCANSA") {
          const localEq = equipos.find(e => e.nombre === local);
          const visitanteEq = equipos.find(e => e.nombre === visitante);
          if(localEq && visitanteEq) {
            await db.createFixture(
              torneoActual, dia, `Fecha ${r + 1}`,
              fechaH.toTimeString().substring(0, 5),
              localEq.id, visitanteEq.id
            );
          }
          fechaH.setMinutes(fechaH.getMinutes() + duracion);
        }
      }
      equiposDia.splice(1, 0, equiposDia.pop());
    }
    
    mostrarErrorUsuario("✅ Fixture Generado");
    await renderFixtureActual();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Generar Fixture'; }
  }
};

window.filtrarEquiposPorDia = async function() {
  if (!torneoActual) return;
  
  const dia = document.getElementById('resDiaFiltro').value;
  const equipos = await db.getEquipos(torneoActual);
  const equiposDia = equipos.filter(e => e.dia_semana === dia);
  
  const opt = equiposDia.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  document.getElementById('resE1').innerHTML = '<option disabled selected>Local</option>' + opt;
  document.getElementById('resE2').innerHTML = '<option disabled selected>Visitante</option>' + opt;
};

window.generarInputsGoles = async function(lado) {
  if (!torneoActual) return;
  
  const n = parseInt(document.getElementById('resG' + (lado === 'E1' ? '1' : '2')).value) || 0;
  const resEl = document.getElementById('res' + (lado === 'E1' ? 'E1' : 'E2'));
  if (!resEl) return;
  const equipoId = parseInt(resEl.value);
  
  const jugadores = await db.getJugadores(torneoActual);
  const jugsDel = jugadores.filter(j => j.equipos?.includes(equipoId));
  
  document.getElementById('contGoles' + lado).innerHTML = Array.from({length: n}, () => 
    `<select class="sel-gol-${lado}" style="width:100%; padding:8px; margin:5px 0;">${jugsDel.map(j => `<option value="${j.id}">${escapeHtml(j.nombre)}</option>`).join('')}</select>`
  ).join('');
};

window.agregarInputTarjeta = async function(lado) {
  if (!torneoActual) return;
  
  const resEl = document.getElementById('res' + (lado === 'E1' ? 'E1' : 'E2'));
  if (!resEl) return;
  const equipoId = parseInt(resEl.value);
  const jugadores = await db.getJugadores(torneoActual);
  const jugsDel = jugadores.filter(j => j.equipos?.includes(equipoId));
  
  const div = document.createElement('div');
  div.style = "display:flex; gap:5px; margin-top:5px";
  div.innerHTML = `
    <select class="sel-card-j-${lado}" style="flex:1; padding:8px;">${jugsDel.map(j => `<option value="${j.id}">${escapeHtml(j.nombre)}</option>`).join('')}</select>
    <select class="sel-card-t-${lado}" style="flex:0.3; padding:8px;">
      <option value="A">🟨</option>
      <option value="R">🟥</option>
    </select>
    <button onclick="this.parentElement.remove()" style="background:red; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:4px;">X</button>
  `;
  document.getElementById('contCards' + lado).appendChild(div);
};

window.actualizarListasJugadores = async function() {
  if (!torneoActual) return;
  
  const e1Id = parseInt(document.getElementById('resE1').value);
  const e2Id = parseInt(document.getElementById('resE2').value);
  
  const jugadores = await db.getJugadores(torneoActual);
  const jugs = jugadores.filter(j => j.equipos?.includes(e1Id) || j.equipos?.includes(e2Id));
  
  document.getElementById('resMVP').innerHTML = jugs.map(j => `<option value="${j.id}">${escapeHtml(j.nombre)}</option>`).join('');
};

window.cargarResultadoGlobal = async function() {
  if (!torneoActual) return;
  
  const e1Id = parseInt(document.getElementById('resE1').value);
  const e2Id = parseInt(document.getElementById('resE2').value);
  const g1 = parseInt(document.getElementById('resG1').value) || 0;
  const g2 = parseInt(document.getElementById('resG2').value) || 0;
  const mvpId = parseInt(document.getElementById('resMVP').value);
  
  const [equipos, jugadores, fixture] = await Promise.all([
    db.getEquipos(torneoActual),
    db.getJugadores(torneoActual),
    db.getFixture(torneoActual)
  ]);
  
  const e1 = equipos.find(x => x.id === e1Id);
  const e2 = equipos.find(x => x.id === e2Id);
  if(!e1 || !e2) return mostrarErrorUsuario("Selecciona equipos");
  
  // Find matching fixture or use hidden field
  let fiId = parseInt(document.getElementById('resFiId')?.value);
  if (!fiId) {
    const match = fixture.find(m => m.equipo_local_id === e1Id && m.equipo_visitante_id === e2Id);
    if (match) fiId = match.id;
  }
  
  // Create the resultado record
  const resultado = await db.createResultado(torneoActual, fiId || null, e1Id, e2Id, g1, g2, mvpId || null);
  if (!resultado) return mostrarErrorUsuario('Error al guardar el resultado');
  const resId = resultado.id;
  
  // Update team stats (sequentially to avoid race conditions)
  const newE1 = { ...e1, pj: e1.pj + 1, gf: e1.gf + g1, gc: e1.gc + g2 };
  const newE2 = { ...e2, pj: e2.pj + 1, gf: e2.gf + g2, gc: e2.gc + g1 };
  
  if(g1 > g2) {
    newE1.v = e1.v + 1; newE1.pts = e1.pts + 3; newE2.p = e2.p + 1;
  } else if(g2 > g1) {
    newE2.v = e2.v + 1; newE2.pts = e2.pts + 3; newE1.p = e1.p + 1;
  } else {
    newE1.e = e1.e + 1; newE2.e = e2.e + 1;
    newE1.pts = e1.pts + 1; newE2.pts = e2.pts + 1;
  }
  
  if(g2 === 0) newE1.vallas_invictas = e1.vallas_invictas + 1;
  if(g1 === 0) newE2.vallas_invictas = e2.vallas_invictas + 1;
  
  await db.updateEquipo(e1.id, newE1);
  await db.updateEquipo(e2.id, newE2);
  
  // Register goals
  const golSelectors = document.querySelectorAll('.sel-gol-E1, .sel-gol-E2');
  const goalPromises = [];
  golSelectors.forEach((s) => {
    const jugadorId = parseInt(s.value);
    const jugador = jugadores.find(x => x.id === jugadorId);
    if (!jugador) return;
    const equipoId = s.classList.contains('sel-gol-E1') ? e1Id : e2Id;
    goalPromises.push(
      db.createGol(resId, jugadorId, equipoId, null)
        .then(() => db.updateJugador(jugadorId, { goles: (jugador.goles || 0) + 1, pj: (jugador.pj || 0) + 1 }))
    );
  });
  await Promise.all(goalPromises);
  
  // Register cards
  const cardPromises = [];
  ['E1', 'E2'].forEach((lado) => {
    const jS = document.querySelectorAll(`.sel-card-j-${lado}`);
    const tS = document.querySelectorAll(`.sel-card-t-${lado}`);
    const equipoId = lado === 'E1' ? e1Id : e2Id;
    jS.forEach((s, i) => {
      const jugadorId = parseInt(s.value);
      const jugador = jugadores.find(x => x.id === jugadorId);
      if (!jugador) return;
      const tipo = tS[i]?.value || 'A';
      cardPromises.push(
        db.createTarjeta(resId, jugadorId, equipoId, tipo, null)
          .then(() => db.updateJugador(jugadorId, { [tipo === 'A' ? 'amarillas' : 'rojas']: (jugador[tipo === 'A' ? 'amarillas' : 'rojas'] || 0) + 1 }))
      );
    });
  });
  await Promise.all(cardPromises);
  
  // MVP
  if (mvpId) {
    const jugador = jugadores.find(x => x.id === mvpId);
    if (jugador) {
      await db.updateJugador(mvpId, { mvps: (jugador.mvps || 0) + 1 });
    }
  }
  
  mostrarErrorUsuario("✅ ¡Resultado guardado!");
  await recargarDatos();
  verificarNotificaciones();
};

window.renderFama = async function() {
  if (!torneoActual) return;
  
  const [jugadores, equipos] = await Promise.all([
    db.getJugadores(torneoActual),
    db.getEquipos(torneoActual)
  ]);
  const cracks = [...jugadores].sort((a, b) => b.mvps - a.mvps || b.goles - a.goles).slice(0, 12);
  
  const logoEq = (j) => {
    const eqId = j.equipos?.[0];
    const eq = equipos.find(e => e.id === eqId);
    return eq?.logo || '';
  };

  document.getElementById('renderFama').innerHTML = cracks.map(j => `
    <div class="ficha-ea">
      <div class="card-badge">
        <div class="rating">${calcularRating(j)}</div>
        <div class="pos">${escapeHtml(j.posicion)}</div>
      </div>
      <img src="${j.foto}" class="perfil-ea">
      <img src="${logoEq(j)}" style="position:absolute;bottom:80px;right:10px;width:32px;height:32px;border-radius:50%;border:2px solid #eab308;background:#0d1117;object-fit:cover;" onerror="this.style.display='none'">
      <div class="info-jugador-ea">
        <h3>${escapeHtml(j.nombre)}</h3>
        <div class="stats-ea">
          <span>⚽ ${j.goles}</span>
          <span>⭐ ${j.mvps}</span>
        </div>
      </div>
    </div>
  `).join('');
};

function calcularRating(j) {
  let media = 60 + (j.goles * 0.5) + (j.pj * 0.2) + ((j.mvps || 0) * 2.0);
  media -= ((j.amarillas || 0) * 0.5) + ((j.rojas || 0) * 2.0);
  return Math.min(99, Math.max(10, Math.round(media)));
}
// ✅ GESTION DE EQUIPOS
window.mostrarGestionEquipos = async function() {
  const cont = document.getElementById('admin-content');
  if (!cont) return;
  
  if (!torneoActual) {
    cont.innerHTML = '<p style="color:#f97316;">Seleccioná un torneo primero</p>';
    return;
  }

  const equipos = await db.getEquipos(torneoActual);
  const jugadores = await db.getJugadores(torneoActual);

  cont.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
      <!-- LEFT: Create Team -->
      <div class="box">
        <h3 style="color:#eab308; margin-bottom:15px;">➕ Nuevo Equipo</h3>
        <label class="label-accent">Nombre:</label>
        <input type="text" id="adNom" placeholder="Nombre del equipo" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px; box-sizing:border-box;">
        <label class="label-accent">Día:</label>
        <select id="adDia" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px;">
          <option>Lunes</option><option value="Miercoles">Miércoles</option><option>Jueves</option><option>Viernes</option><option value="Sabado">Sábado</option><option>Domingo</option>
        </select>
        <label class="label-accent">Logo:</label>
        <input type="file" id="adLog" accept="image/*" style="width:100%; margin-bottom:15px; color:white;">
        <button onclick="guardarEquipo()" class="btn-main" style="width:100%;">✅ CREAR EQUIPO</button>
      </div>

      <!-- RIGHT: Team List -->
      <div class="box">
        <h3 style="color:#eab308; margin-bottom:15px;">📋 Equipos</h3>
        ${equipos.length === 0 ? '<p style="color:#b0bcc4;">No hay equipos aún</p>' :
          equipos.map(eq => {
            const jugsEq = jugadores.filter(j => j.equipos?.includes(eq.id));
            return `
              <div style="background:#0d1117; border-radius:8px; padding:15px; margin-bottom:10px; border-left:4px solid #eab308;">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                  <img src="${eq.logo || ''}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; background:#30363d;" onerror="this.style.display='none'">
                  <div>
                    <strong style="color:white; font-size:1rem;">${escapeHtml(eq.nombre)}</strong>
                    <span style="color:#8b949e; font-size:0.8rem; display:block;">${escapeHtml(eq.dia_semana)} | PJ: ${eq.pj || 0} | PTS: ${eq.pts || 0}</span>
                  </div>
                  <button onclick="editarEquipo(${eq.id})" class="btn-mini" style="background:#3b82f6; color:white; padding:4px 8px; font-size:0.7rem;">✏️</button>
                  <button onclick="eliminarEquipoAdmin(${eq.id})" style="margin-left:auto; background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem;">🗑️</button>
                </div>
                ${jugsEq.length > 0 ? `
                  <div style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${jugsEq.map(j => `
                      <span style="background:#30363d; padding:2px 8px; border-radius:4px; font-size:0.8rem; color:#b0bcc4;">${escapeHtml(j.nombre)}</span>
                    `).join('')}
                  </div>
                ` : '<p style="color:#8b949e; font-size:0.8rem; margin:0;">Sin jugadores</p>'}
              </div>
            `;
          }).join('')
        }
      </div>
    </div>
  `;
};

window.guardarEquipo = async function() {
  const nom = document.getElementById('adNom').value.trim();
  const fileInput = document.getElementById('adLog');
  if (!nom || !fileInput.files[0]) return mostrarErrorUsuario('Completá nombre y logo');
  
  const btn = document.querySelector('[onclick*="guardarEquipo"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Creando...'; }
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const logo = await comprimirImagen(e.target.result, 150);
      const eq = await db.createEquipo(torneoActual, nom, document.getElementById('adDia').value, logo);
      if (eq) {
        mostrarErrorUsuario('✅ Equipo creado');
        await updateSelects();
        mostrarGestionEquipos();
      }
      if (btn) { btn.disabled = false; btn.textContent = '✅ CREAR EQUIPO'; }
    };
    reader.readAsDataURL(fileInput.files[0]);
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = '✅ CREAR EQUIPO'; }
  }
};

window.eliminarEquipoAdmin = async function(id) {
  if (!confirm('¿Eliminar este equipo?')) return;
  await db.deleteEquipo(id);
  mostrarErrorUsuario('🗑️ Eliminado');
  await updateSelects();
  mostrarGestionEquipos();
};

// ✅ FUNCIONES DE ADMIN PARA FIXTURE
window.eliminarPartido = async function(id) {
  if (!confirm('¿Eliminar este partido del fixture?')) return;
  const { error } = await _supabase.from('fixture').delete().eq('id', id);
  if (error) return mostrarErrorUsuario('Error al eliminar: ' + error.message);
  mostrarErrorUsuario('🗑️ Partido eliminado');
  renderFixtureActual();
};

window.cargarResultadoDeFixture = async function(fixtureId) {
  const fixture = await db.getFixture(torneoActual);
  const match = fixture.find(m => m.id === fixtureId);
  if (!match) return mostrarErrorUsuario('Partido no encontrado');

  // Switch to fixture tab and fill the form
  showSec('fixture', document.querySelector('[onclick*="fixture"]'));
  
  await new Promise(r => setTimeout(r, 200));
  
  document.getElementById('resDiaFiltro').value = match.dia_semana;
  await filtrarEquiposPorDia();
  await new Promise(r => setTimeout(r, 100));
  
  document.getElementById('resE1').value = match.equipo_local_id;
  document.getElementById('resE2').value = match.equipo_visitante_id;
  const fiField = document.getElementById('resFiId');
  if (fiField) fiField.value = fixtureId;
  await actualizarListasJugadores();
  
  document.getElementById('resG1').value = 0;
  document.getElementById('resG2').value = 0;
  document.getElementById('contGolesE1').innerHTML = '';
  document.getElementById('contGolesE2').innerHTML = '';
  document.getElementById('contCardsE1').innerHTML = '';
  document.getElementById('contCardsE2').innerHTML = '';
  
  mostrarErrorUsuario('✅ Partido cargado. Completá el resultado y guardá.');
};

// ✅ DETALLE DE EQUIPO
window.mostrarDetalleEquipo = async function(equipoId) {
  if (!torneoActual) return;
  
  const [equipos, jugadores] = await Promise.all([
    db.getEquipos(torneoActual),
    db.getJugadores(torneoActual)
  ]);
  const eq = equipos.find(e => e.id === equipoId);
  if (!eq) return;
  
  const jugsEq = jugadores.filter(j => j.equipos?.includes(eq.id));
  const overlay = document.getElementById('team-detail-overlay');
  if (overlay) overlay.remove();
  
  const div = document.createElement('div');
  div.id = 'team-detail-overlay';
  div.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;';
  div.onclick = (e) => { if (e.target === div) div.remove(); };
  
  div.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:12px; padding:30px; max-width:500px; width:90%; max-height:80vh; overflow-y:auto; position:relative;">
      <button onclick="this.closest('#team-detail-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${eq.logo || ''}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; background:#30363d; margin-bottom:10px;" onerror="this.style.display='none'">
        <h2 style="color:#eab308; margin:0;">${escapeHtml(eq.nombre)}</h2>
        <p style="color:#8b949e; margin:5px 0;">${escapeHtml(eq.dia_semana)}</p>
        <div style="display:flex; justify-content:center; gap:20px; margin:10px 0; color:#b0bcc4; font-size:0.9rem;">
          <span>PJ: <b style="color:white;">${eq.pj || 0}</b></span>
          <span>V: <b style="color:#22c55e;">${eq.v || 0}</b></span>
          <span>E: <b style="color:#eab308;">${eq.e || 0}</b></span>
          <span>P: <b style="color:#ef4444;">${eq.p || 0}</b></span>
          <span>PTS: <b style="color:#3b82f6;">${eq.pts || 0}</b></span>
        </div>
        <div style="display:flex; justify-content:center; gap:20px; color:#b0bcc4; font-size:0.9rem;">
          <span>GF: <b style="color:white;">${eq.gf || 0}</b></span>
          <span>GC: <b style="color:white;">${eq.gc || 0}</b></span>
          <span>DF: <b style="color:${(eq.gf || 0) - (eq.gc || 0) >= 0 ? '#22c55e' : '#ef4444'};">${(eq.gf || 0) - (eq.gc || 0)}</b></span>
          <span>🚫 VI: <b style="color:white;">${eq.vallas_invictas || 0}</b></span>
        </div>
      </div>
      <h3 style="color:#eab308; margin-bottom:10px;">Jugadores (${jugsEq.length})</h3>
      ${jugsEq.length === 0 ? '<p style="color:#8b949e;">Sin jugadores</p>' :
        jugsEq.map(j => `
          <div style="display:flex; align-items:center; gap:10px; padding:8px; background:#0d1117; border-radius:6px; margin-bottom:5px;">
            <img src="${j.foto || DEFAULT_AVATAR}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
            <div style="flex:1;">
              <strong style="color:white; font-size:0.9rem;">${escapeHtml(j.nombre)}</strong>
              <span style="color:#8b949e; font-size:0.75rem; margin-left:8px;">${escapeHtml(j.posicion || '')}</span>
            </div>
            <span style="color:#b0bcc4; font-size:0.8rem;">⚽ ${j.goles || 0}</span>
            <span style="color:#b0bcc4; font-size:0.8rem;">⭐ ${j.mvps || 0}</span>
          </div>
        `).join('')
      }
    </div>
  `;
  
  document.body.appendChild(div);
};

// ✅ CONTROL DE ACCESO ADMIN
async function accesoAdmin(btn) {
    if (window._sessionCached) {
        showSec('admin', btn);
        const el = document.getElementById('admin-email');
        if (el && window.usuarioActual) el.textContent = window.usuarioActual.email;
        return;
    }
    try {
        const { data: { session } } = await _supabase.auth.getSession();
        if (!session) {
            mostrarErrorUsuario("🔒 Tenés que iniciar sesión para acceder al ADMIN");
            inicializarAuth();
            return;
        }
        window._sessionCached = true;
        showSec('admin', btn);
        const el = document.getElementById('admin-email');
        if (el) el.textContent = session.user?.email || '';
    } catch (e) {
        if (window.usuarioActual) {
            showSec('admin', btn);
            const el = document.getElementById('admin-email');
            if (el && window.usuarioActual) el.textContent = window.usuarioActual.email;
            return;
        }
        mostrarErrorUsuario("🔒 Error de conexión. Intentalo de nuevo.");
    }
}

// =====================================================================
// STEP 1: ELIMINAR / EDITAR RESULTADOS
// =====================================================================

window.eliminarResultado = async function(partidoFixtureId) {
  if (!torneoActual) return;
  if (!confirm('¿Eliminar este resultado? Se revertirán todas las estadísticas.')) return;

  const [resultados, equipos, jugadores] = await Promise.all([
    db.getResultados(torneoActual),
    db.getEquipos(torneoActual),
    db.getJugadores(torneoActual)
  ]);

  const res = resultados.find(r => r.fixture_id === partidoFixtureId);
  if (!res) return mostrarErrorUsuario('Resultado no encontrado');

  const e1 = equipos.find(e => e.id === res.equipo_local_id);
  const e2 = equipos.find(e => e.id === res.equipo_visitante_id);
  if (!e1 || !e2) return mostrarErrorUsuario('Equipos no encontrados');

  // Revert team stats
  const revertE1 = { ...e1, pj: Math.max(0, e1.pj - 1), gf: Math.max(0, e1.gf - res.goles_local), gc: Math.max(0, e1.gc - res.goles_visitante) };
  const revertE2 = { ...e2, pj: Math.max(0, e2.pj - 1), gf: Math.max(0, e2.gf - res.goles_visitante), gc: Math.max(0, e2.gc - res.goles_local) };

  if (res.goles_local > res.goles_visitante) {
    revertE1.v = Math.max(0, e1.v - 1); revertE1.pts = Math.max(0, e1.pts - 3); revertE2.p = Math.max(0, e2.p - 1);
  } else if (res.goles_visitante > res.goles_local) {
    revertE2.v = Math.max(0, e2.v - 1); revertE2.pts = Math.max(0, e2.pts - 3); revertE1.p = Math.max(0, e1.p - 1);
  } else {
    revertE1.e = Math.max(0, e1.e - 1); revertE2.e = Math.max(0, e2.e - 1);
    revertE1.pts = Math.max(0, e1.pts - 1); revertE2.pts = Math.max(0, e2.pts - 1);
  }

  if (res.goles_visitante === 0) revertE1.vallas_invictas = Math.max(0, e1.vallas_invictas - 1);
  if (res.goles_local === 0) revertE2.vallas_invictas = Math.max(0, e2.vallas_invictas - 1);

  await db.updateEquipo(e1.id, revertE1);
  await db.updateEquipo(e2.id, revertE2);

  // Revert player stats from goles
  const [goles, tarjetas] = await Promise.all([
    db.getGoles(res.id),
    db.getTarjetas(res.id)
  ]);

  for (const gol of goles) {
    const j = jugadores.find(x => x.id === gol.jugador_id);
    if (j) {
      await db.updateJugador(j.id, { ...j, goles: Math.max(0, j.goles - 1), pj: Math.max(0, j.pj - 1) });
    }
  }

  for (const tarj of tarjetas) {
    const j = jugadores.find(x => x.id === tarj.jugador_id);
    if (j) {
      const upd = { ...j };
      upd[tarj.tipo === 'A' ? 'amarillas' : 'rojas'] = Math.max(0, (j[tarj.tipo === 'A' ? 'amarillas' : 'rojas'] || 0) - 1);
      await db.updateJugador(j.id, upd);
    }
  }

  // Revert MVP
  if (res.mvp_id) {
    const mvp = jugadores.find(x => x.id === res.mvp_id);
    if (mvp) {
      await db.updateJugador(mvp.id, { ...mvp, mvps: Math.max(0, mvp.mvps - 1) });
    }
  }

  // Delete goles, tarjetas, resultado
  await Promise.all([
    db.deleteGolesByResultado(res.id),
    db.deleteTarjetasByResultado(res.id)
  ]);
  await db.deleteResultado(res.id);

  mostrarErrorUsuario('🗑️ Resultado eliminado y estadísticas revertidas');
  await recargarDatos();
  renderFixtureActual();
};

window.cargarEdicionResultado = async function(fixtureId) {
  await cargarResultadoDeFixture(fixtureId);
  // Mark as edit mode so cargarResultadoGlobal knows to delete old result first
  const editFlag = document.getElementById('resEditMode');
  if (!editFlag) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.id = 'resEditMode';
    input.value = '1';
    document.getElementById('resMVP').parentElement.appendChild(input);
  } else {
    editFlag.value = '1';
  }
};

// Patch cargarResultadoGlobal to handle edit mode
const _cargarResultadoGlobalOriginal = window.cargarResultadoGlobal;
window.cargarResultadoGlobal = async function() {
  const editFlag = document.getElementById('resEditMode');
  const isEdit = editFlag?.value === '1';
  const fiId = parseInt(document.getElementById('resFiId')?.value);

  if (isEdit && fiId) {
    if (!confirm('¿Guardar cambios? Se reemplazará el resultado anterior.')) return;
    await eliminarResultado(fiId);
    if (editFlag) editFlag.value = '0';
  }

  const btn = document.querySelector('[onclick*="cargarResultadoGlobal"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando...'; }
  try {
    return await _cargarResultadoGlobalOriginal();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✅ GUARDAR RESULTADO'; }
  }
};

// =====================================================================
// STEP 2: EDITAR EQUIPOS Y JUGADORES
// =====================================================================

// --- EDITAR EQUIPO ---
window.editarEquipo = async function(id) {
  const equipos = await db.getEquipos(torneoActual);
  const eq = equipos.find(e => e.id === id);
  if (!eq) return;

  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'edit-team-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:12px; padding:30px; max-width:400px; width:90%; position:relative;">
      <button onclick="this.closest('#edit-team-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <h3 style="color:#eab308; margin-bottom:15px;">✏️ Editar Equipo</h3>
      <label class="label-accent">Nombre:</label>
      <input type="text" id="editEqNom" value="${escapeHtml(eq.nombre)}" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px; box-sizing:border-box;">
      <label class="label-accent">Día:</label>
      <select id="editEqDia" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px;">
        <option>Lunes</option><option value="Miercoles" ${eq.dia_semana === 'Miercoles' ? 'selected' : ''}>Miércoles</option><option>Jueves</option><option>Viernes</option><option value="Sabado" ${eq.dia_semana === 'Sabado' ? 'selected' : ''}>Sábado</option><option>Domingo</option>
      </select>
      <label class="label-accent">Logo (dejar vacío para mantener actual):</label>
      <input type="file" id="editEqLog" accept="image/*" style="width:100%; margin-bottom:15px; color:white;">
      <button onclick="guardarEdicionEquipo(${id})" class="btn-main">💾 GUARDAR</button>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.guardarEdicionEquipo = async function(id) {
  const nom = document.getElementById('editEqNom').value.trim();
  const dia = document.getElementById('editEqDia').value;
  const fileInput = document.getElementById('editEqLog');
  if (!nom) return mostrarErrorUsuario('El nombre es obligatorio');

  const updates = { nombre: nom, dia_semana: dia };
  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      updates.logo = await comprimirImagen(e.target.result, 150);
      await db.updateEquipo(id, updates);
      mostrarErrorUsuario('✅ Equipo actualizado');
      document.getElementById('edit-team-overlay')?.remove();
      mostrarGestionEquipos();
      await updateSelects();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    await db.updateEquipo(id, updates);
    mostrarErrorUsuario('✅ Equipo actualizado');
    document.getElementById('edit-team-overlay')?.remove();
    mostrarGestionEquipos();
    await updateSelects();
  }
};

// --- GESTIONAR JUGADORES ---
window.mostrarGestionJugadores = async function() {
  const cont = document.getElementById('admin-content');
  if (!cont) return;

  if (!torneoActual) {
    cont.innerHTML = '<p style="color:#f97316;">Seleccioná un torneo primero</p>';
    return;
  }

  const [jugadores, equipos] = await Promise.all([
    db.getJugadores(torneoActual),
    db.getEquipos(torneoActual)
  ]);

  cont.innerHTML = `
    <div style="overflow-x:auto;">
      <h3 style="color:#eab308; margin-bottom:15px;">📋 Gestión de Jugadores (${jugadores.length})</h3>
      ${jugadores.length === 0 ? '<p style="color:#8b949e;">No hay jugadores registrados</p>' : `
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <thead><tr style="background:#30363d;">
            <th style="padding:8px; color:#eab308;">Foto</th>
            <th style="padding:8px; color:#eab308; text-align:left;">Nombre</th>
            <th style="padding:8px; color:#eab308;">Pos</th>
            <th style="padding:8px; color:#eab308;">Equipo(s)</th>
            <th style="padding:8px; color:#eab308;">⚽</th>
            <th style="padding:8px; color:#eab308;">⭐</th>
            <th style="padding:8px; color:#eab308;">🏃</th>
            <th style="padding:8px; color:#eab308;">Rating</th>
            <th style="padding:8px; color:#eab308;">Acción</th>
          </tr></thead>
          <tbody>${jugadores.map(j => {
            const eqs = j.equipos?.map(eId => { const eq = equipos.find(e => e.id === eId); return eq ? escapeHtml(eq.nombre) : ''; }).filter(Boolean).join(', ') || '-';
            return `
              <tr style="border-bottom:1px solid #30363d;">
                <td style="padding:8px;"><img src="${j.foto || DEFAULT_AVATAR}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;"></td>
                <td style="padding:8px; text-align:left;"><a href="#" onclick="mostrarDetalleJugador(${j.id}); return false;" style="color:white;text-decoration:none;" onmouseover="this.style.color='#eab308'" onmouseout="this.style.color='white'">${escapeHtml(j.nombre)}</a></td>
                <td style="padding:8px;">${escapeHtml(j.posicion || '-')}</td>
                <td style="padding:8px; font-size:0.75rem;">${eqs}</td>
                <td style="padding:8px;">${j.goles || 0}</td>
                <td style="padding:8px;">${j.mvps || 0}</td>
                <td style="padding:8px;">${j.pj || 0}</td>
                <td style="padding:8px; font-weight:bold; color:#eab308;">${calcularRating(j)}</td>
                <td style="padding:8px;">
                  <button onclick="editarJugador(${j.id})" class="btn-mini" style="background:#3b82f6; color:white; padding:4px 8px; font-size:0.7rem;">✏️</button>
                  <button onclick="eliminarJugadorAdmin(${j.id})" class="btn-mini" style="background:#ef4444; color:white; padding:4px 8px; font-size:0.7rem;">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}</tbody>
        </table>
      `}
    </div>
  `;
};

// --- EDITAR JUGADOR ---
window.editarJugador = async function(id) {
  const [jugadores, equipos] = await Promise.all([
    db.getJugadores(torneoActual),
    db.getEquipos(torneoActual)
  ]);
  const j = jugadores.find(x => x.id === id);
  if (!j) return;

  const eqOpts = equipos.map(e =>
    `<option value="${e.id}" ${j.equipos?.includes(e.id) ? 'selected' : ''}>${escapeHtml(e.nombre)}</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'edit-player-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:12px; padding:30px; max-width:420px; width:90%; position:relative;">
      <button onclick="this.closest('#edit-player-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <h3 style="color:#eab308; margin-bottom:15px;">✏️ Editar Jugador</h3>
      <label class="label-accent">Nombre:</label>
      <input type="text" id="editJugNom" value="${escapeHtml(j.nombre)}" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px;">
      <div style="display:flex; gap:10px;">
        <div style="flex:1">
          <label class="label-accent">Posición:</label>
          <select id="editJugPos" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px;">
            <option value="POR" ${j.posicion === 'POR' ? 'selected' : ''}>Portero</option>
            <option value="DFC" ${j.posicion === 'DFC' ? 'selected' : ''}>Defensa</option>
            <option value="MC" ${j.posicion === 'MC' ? 'selected' : ''}>Mediocampista</option>
            <option value="DEL" ${j.posicion === 'DEL' ? 'selected' : ''}>Delantero</option>
          </select>
        </div>
        <div style="flex:1">
          <label class="label-accent">Pierna:</label>
          <select id="editJugPierna" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px;">
            <option value="R" ${j.pierna === 'R' ? 'selected' : ''}>Diestro</option>
            <option value="L" ${j.pierna === 'L' ? 'selected' : ''}>Zurdo</option>
          </select>
        </div>
      </div>
      <label class="label-accent">Equipo:</label>
      <select id="editJugEq" style="width:100%; padding:10px; border-radius:6px; background:#0d1117; color:white; border:1px solid #30363d; margin-bottom:10px;">
        <option value="">Sin equipo</option>
        ${eqOpts}
      </select>
      <label class="label-accent">Foto (dejar vacío para mantener):</label>
      <input type="file" id="editJugFoto" accept="image/*" style="width:100%; margin-bottom:15px; color:white;">
      <button onclick="guardarEdicionJugador(${id})" class="btn-main">💾 GUARDAR</button>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.guardarEdicionJugador = async function(id) {
  const nom = document.getElementById('editJugNom').value.trim().toUpperCase();
  const pos = document.getElementById('editJugPos').value;
  const pierna = document.getElementById('editJugPierna').value;
  const equipoId = parseInt(document.getElementById('editJugEq').value);
  const fileInput = document.getElementById('editJugFoto');

  if (!nom) return mostrarErrorUsuario('El nombre es obligatorio');

  const updates = { nombre: nom, posicion: pos, pierna: pierna };

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      updates.foto = await comprimirImagen(e.target.result);
      await db.updateJugador(id, updates);
      // Update team link
      const currentEquipos = await db.getEquiposJugador(id);
      if (equipoId) {
        if (!currentEquipos.includes(equipoId)) {
          if (currentEquipos.length > 0) {
            await _supabase.from('jugador_equipo').delete().eq('jugador_id', id);
          }
          await db.vincularJugadorEquipo(id, equipoId);
        }
      } else if (currentEquipos.length > 0) {
        await _supabase.from('jugador_equipo').delete().eq('jugador_id', id);
      }
      mostrarErrorUsuario('✅ Jugador actualizado');
      document.getElementById('edit-player-overlay')?.remove();
      mostrarGestionJugadores();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    await db.updateJugador(id, updates);
    const currentEquipos = await db.getEquiposJugador(id);
    if (equipoId) {
      if (!currentEquipos.includes(equipoId)) {
        if (currentEquipos.length > 0) {
          await _supabase.from('jugador_equipo').delete().eq('jugador_id', id);
        }
        await db.vincularJugadorEquipo(id, equipoId);
      }
    } else if (currentEquipos.length > 0) {
      await _supabase.from('jugador_equipo').delete().eq('jugador_id', id);
    }
    mostrarErrorUsuario('✅ Jugador actualizado');
    document.getElementById('edit-player-overlay')?.remove();
    mostrarGestionJugadores();
  }
};

// --- ELIMINAR JUGADOR ---
window.eliminarJugadorAdmin = async function(id) {
  const jugadores = await db.getJugadores(torneoActual);
  const j = jugadores.find(x => x.id === id);
  if (!j) return;
  if (!confirm(`¿Eliminar a ${j.nombre}?`)) return;

  // Delete team links first
  await _supabase.from('jugador_equipo').delete().eq('jugador_id', id);
  await db.deleteJugador(id);
  mostrarErrorUsuario('🗑️ Jugador eliminado');
  mostrarGestionJugadores();
};

// =====================================================================
// STEP 7: DETALLE DE JUGADOR (desde FAMA o lista)
// =====================================================================

window.mostrarDetalleJugador = async function(jugadorId) {
  const resultados = await db.getResultados(torneoActual);
  const resIds = resultados.length > 0 ? resultados.map(r => r.id) : [0];
  const [jugadores, equipos, fixture, allGolesResp, allTarjetasResp] = await Promise.all([
    db.getJugadores(torneoActual),
    db.getEquipos(torneoActual),
    db.getFixture(torneoActual),
    _supabase.from('goles').select('*').in('resultado_id', resIds),
    _supabase.from('tarjetas').select('*').in('resultado_id', resIds)
  ]);
  const allGoles = allGolesResp?.data || [];
  const allTarjetas = allTarjetasResp?.data || [];
  const j = jugadores.find(x => x.id === jugadorId);
  if (!j) return;

  const golesList = allGoles?.data?.filter(g => g.jugador_id === jugadorId) || [];
  const tarjetasList = allTarjetas?.data?.filter(t => t.jugador_id === jugadorId) || [];

  const partidosHist = [];
  for (const r of resultados) {
    const f = fixture.find(x => x.id === r.fixture_id);
    const golesJug = golesList.filter(g => g.resultado_id === r.id);
    const tarsJug = tarjetasList.filter(t => t.resultado_id === r.id);
    if (golesJug.length > 0 || tarsJug.length > 0 || r.mvp_id === jugadorId) {
      const eqLocal = equipos.find(e => e.id === r.equipo_local_id);
      const eqVisit = equipos.find(e => e.id === r.equipo_visitante_id);
      partidosHist.push({ fixture: f, resultado: r, local: eqLocal, visit: eqVisit, goles: golesJug, tarjetas: tarsJug });
    }
  }
  partidosHist.sort((a, b) => (a.fixture?.fecha || '').localeCompare(b.fixture?.fecha || '') || (a.fixture?.hora || '').localeCompare(b.fixture?.hora || ''));

  const equiposJug = j.equipos?.map(eId => equipos.find(e => e.id === eId)).filter(Boolean) || [];
  const posMap = { POR: 'Portero', DFC: 'Defensa', MC: 'Mediocampista', DEL: 'Delantero' };
  const pieMap = { R: 'Diestro', L: 'Zurdo' };

  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'player-detail-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:16px; padding:30px; max-width:520px; width:90%; max-height:90vh; overflow-y:auto; position:relative;">
      <button onclick="this.closest('#player-detail-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${j.foto || DEFAULT_AVATAR}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #eab308; margin-bottom:10px;">
        <h2 style="color:#eab308; margin:5px 0;">${escapeHtml(j.nombre)}</h2>
        <div style="display:flex; justify-content:center; gap:10px; margin:5px 0;">
          <span style="background:#3b82f6; padding:2px 12px; border-radius:4px; font-size:0.8rem;">${escapeHtml(posMap[j.posicion] || j.posicion)}</span>
          <span style="background:#30363d; padding:2px 12px; border-radius:4px; font-size:0.8rem;">${escapeHtml(pieMap[j.pierna] || j.pierna)}</span>
        </div>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:8px;">
          ${equiposJug.map(eq => `
            <div style="display:flex; align-items:center; gap:5px; background:#0d1117; padding:4px 12px; border-radius:20px; border:1px solid #30363d;">
              ${eq.logo ? `<img src="${eq.logo}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;">` : ''}
              <span style="font-size:0.8rem; color:#b0bcc4;">${escapeHtml(eq.nombre)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:20px;">
        <div style="background:#0d1117; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:bold; color:#22c55e;">${j.goles || 0}</div>
          <div style="font-size:0.7rem; color:#8b949e;">GOLES</div>
        </div>
        <div style="background:#0d1117; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:bold; color:#3b82f6;">${j.pj || 0}</div>
          <div style="font-size:0.7rem; color:#8b949e;">PARTIDOS</div>
        </div>
        <div style="background:#0d1117; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:bold; color:#eab308;">${calcularRating(j)}</div>
          <div style="font-size:0.7rem; color:#8b949e;">RATING</div>
        </div>
        <div style="background:#0d1117; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:bold; color:#f97316;">${j.mvps || 0}</div>
          <div style="font-size:0.7rem; color:#8b949e;">MVP</div>
        </div>
        <div style="background:#0d1117; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:bold; color:#eab308;">${j.amarillas || 0}</div>
          <div style="font-size:0.7rem; color:#8b949e;">AMARILLAS</div>
        </div>
        <div style="background:#0d1117; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:bold; color:#ef4444;">${j.rojas || 0}</div>
          <div style="font-size:0.7rem; color:#8b949e;">ROJAS</div>
        </div>
      </div>
      <div style="background:#0d1117; border-radius:8px; padding:15px; margin-bottom:15px;">
        <h4 style="color:#eab308; margin:0 0 10px 0;">📊 Estadísticas</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:0.85rem;">
          <span style="color:#8b949e;">Goles por partido:</span><span style="color:white; font-weight:bold; text-align:right;">${j.pj > 0 ? (j.goles / j.pj).toFixed(2) : '0.00'}</span>
          <span style="color:#8b949e;">MVP por partido:</span><span style="color:white; font-weight:bold; text-align:right;">${j.pj > 0 ? (j.mvps / j.pj).toFixed(2) : '0.00'}</span>
          <span style="color:#8b949e;">Efectividad:</span><span style="color:white; font-weight:bold; text-align:right;">${j.goles > 0 ? ((j.mvps / j.goles) * 100).toFixed(0) : '0'}% MVP</span>
        </div>
      </div>
      <div style="background:#0d1117; border-radius:8px; padding:15px;">
        <h4 style="color:#eab308; margin:0 0 10px 0;">📋 Historial de Partidos</h4>
        ${partidosHist.length === 0 ? '<p style="color:#8b949e;font-size:0.85rem;">Sin partidos registrados</p>' :
          partidosHist.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #30363d; gap:8px;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:0.8rem; color:#8b949e;">${escapeHtml(p.fixture?.fecha || p.fixture?.dia_semana || '—')}</div>
                <div style="font-size:0.85rem; color:white;">
                  <span style="color:${p.resultado.goles_local > p.resultado.goles_visitante ? '#22c55e' : '#b0bcc4'};">${escapeHtml(p.local?.nombre || '?')}</span>
                  <span style="color:#eab308; font-weight:bold; margin:0 4px;">${p.resultado.goles_local}-${p.resultado.goles_visitante}</span>
                  <span style="color:${p.resultado.goles_visitante > p.resultado.goles_local ? '#22c55e' : '#b0bcc4'};">${escapeHtml(p.visit?.nombre || '?')}</span>
                </div>
              </div>
              <div style="display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
                ${p.goles.map(g => `<span style="background:#22c55e22; color:#22c55e; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">⚽ ${g.minuto || ''}</span>`).join('')}
                ${p.tarjetas.map(t => `<span style="background:${t.tipo === 'R' ? '#ef444422' : '#f9731622'}; color:${t.tipo === 'R' ? '#ef4444' : '#f97316'}; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">${t.tipo === 'R' ? '🟥' : '🟨'} ${t.minuto || ''}</span>`).join('')}
                ${p.resultado.mvp_id === jugadorId ? '<span style="background:#eab30822; color:#eab308; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">🏆 MVP</span>' : ''}
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

// Patch renderFama to add click handler
const _renderFamaOriginal = window.renderFama;
window.renderFama = async function() {
  await _renderFamaOriginal();
  // Add click handlers to fama cards
  document.querySelectorAll('#renderFama .ficha-ea').forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.onclick = async () => {
      const jugadores = await db.getJugadores(torneoActual);
      const cracks = [...jugadores].sort((a, b) => b.mvps - a.mvps || b.goles - a.goles).slice(0, 12);
      if (cracks[i]) mostrarDetalleJugador(cracks[i].id);
    };
  });
};

window.mostrarPerfil = async function() {
  const user = (await _supabase.auth.getSession()).data?.session?.user;
  const { data: userData } = await _supabase.from('usuarios').select('*').eq('id', user?.id).maybeSingle();
  if (!user) return;

  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'profile-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const rolMap = { admin: 'Administrador', arbitro: 'Árbitro', usuario: 'Usuario' };
  const estadoColors = { aprobado: '#22c55e', pendiente: '#f97316', rechazado: '#ef4444' };

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:16px; padding:30px; max-width:400px; width:90%; position:relative;">
      <button onclick="this.closest('#profile-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <h2 style="color:#eab308; text-align:center; margin-bottom:20px;">👤 Mi Perfil</h2>
      <div style="background:#0d1117; border-radius:8px; padding:15px; margin-bottom:15px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.9rem;">
          <span style="color:#8b949e;">Email:</span><span style="color:white;">${escapeHtml(userData?.email || user.email)}</span>
          <span style="color:#8b949e;">Rol:</span><span style="color:#eab308; font-weight:bold;">${rolMap[userData?.rol] || userData?.rol || '—'}</span>
          <span style="color:#8b949e;">Estado:</span><span style="color:${estadoColors[userData?.estado] || '#8b949e'}; font-weight:bold;">${userData?.estado || '—'}</span>
        </div>
      </div>
      <div style="background:#0d1117; border-radius:8px; padding:15px;">
        <h4 style="color:#eab308; margin:0 0 10px 0;">🔑 Cambiar Contraseña</h4>
        <input type="password" id="new-pass-1" placeholder="Nueva contraseña (mín 6 caracteres)" style="width:100%; padding:10px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:8px; box-sizing:border-box;">
        <input type="password" id="new-pass-2" placeholder="Confirmar contraseña" style="width:100%; padding:10px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:10px; box-sizing:border-box;">
        <button onclick="cambiarPassword()" style="width:100%; padding:12px; background:#eab308; color:black; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">Actualizar Contraseña</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.cambiarPassword = async function() {
  const p1 = document.getElementById('new-pass-1')?.value;
  const p2 = document.getElementById('new-pass-2')?.value;
  if (!p1 || p1.length < 6) return mostrarErrorUsuario('La contraseña debe tener mínimo 6 caracteres');
  if (p1 !== p2) return mostrarErrorUsuario('Las contraseñas no coinciden');
  const { error } = await _supabase.auth.updateUser({ password: p1 });
  if (error) return mostrarErrorUsuario('Error: ' + error.message);
  mostrarErrorUsuario('✅ Contraseña actualizada');
  document.getElementById('new-pass-1').value = '';
  document.getElementById('new-pass-2').value = '';
};

// Notificaciones
window.verificarNotificaciones = async function() {
  const badge = document.getElementById('notif-badge');
  if (!badge || !torneoActual) return;
  const lastCount = parseInt(localStorage.getItem('notif_count_' + torneoActual) || '0');
  const resultados = await db.getResultados(torneoActual);
  const nuevas = resultados.length - lastCount;
  if (nuevas > 0) {
    badge.textContent = nuevas;
    badge.style.display = 'inline';
  }
};

window.mostrarNotificaciones = async function() {
  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'notif-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const resultados = await db.getResultados(torneoActual);
  const fixture = await db.getFixture(torneoActual);
  const equipos = await db.getEquipos(torneoActual);
  const recientes = resultados.slice(-5).reverse();
  const lastCount = parseInt(localStorage.getItem('notif_count_' + torneoActual) || '0');
  const badge = document.getElementById('notif-badge');
  if (badge) { badge.style.display = 'none'; badge.textContent = '0'; }
  localStorage.setItem('notif_count_' + torneoActual, String(resultados.length));

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:16px; padding:25px; max-width:420px; width:90%; max-height:80vh; overflow-y:auto; position:relative;">
      <button onclick="this.closest('#notif-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <h3 style="color:#eab308; margin:0 0 15px 0;">🔔 Últimos Resultados</h3>
      ${recientes.length === 0 ? '<p style="color:#8b949e;font-size:0.85rem;">Sin resultados registrados</p>' :
        recientes.map(r => {
          const f = fixture.find(x => x.id === r.fixture_id);
          const eqL = equipos.find(e => e.id === r.equipo_local_id);
          const eqV = equipos.find(e => e.id === r.equipo_visitante_id);
          return `
            <div style="padding:10px; border-bottom:1px solid #30363d;">
              <div style="font-size:0.75rem; color:#8b949e;">${escapeHtml(f?.fecha || f?.dia_semana || '—')}</div>
              <div style="font-size:0.9rem; color:white;">
                ${escapeHtml(eqL?.nombre || '?')} <b style="color:#eab308;">${r.goles_local}-${r.goles_visitante}</b> ${escapeHtml(eqV?.nombre || '?')}
              </div>
            </div>
          `;
        }).join('')
      }
    </div>
  `;
  document.body.appendChild(overlay);
};