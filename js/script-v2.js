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

window.savePlayer = async function() {
  if (!torneoActual) return alert('Selecciona un torneo');
  
  const ci = document.getElementById('regCI').value.trim();
  const nom = document.getElementById('regNom').value.trim().toUpperCase();
  const equipoId = parseInt(document.getElementById('regEqSelect').value);
  
  if(!ci || !nom || !equipoId) return alert("Datos incompletos");
  
  const jugadores = await db.getJugadores(torneoActual);
  let exist = jugadores.find(j => j.ci === ci);
  
  if(exist) {
    const equiposJugador = await db.getEquiposJugador(exist.id);
    if(!equiposJugador.includes(equipoId)) {
      await db.vincularJugadorEquipo(exist.id, equipoId);
      alert("✅ Vinculado");
    } else {
      alert("Ya registrado");
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
      alert("✅ Jugador Creado");
    }
  }
  
  updatePreview();
};

window.addEq = async function() {
  if (!torneoActual) return alert('Selecciona un torneo');
  
  const nom = document.getElementById('adNom').value.trim();
  const fileInput = document.getElementById('adLog');
  
  if(!nom || !fileInput.files[0]) return alert("Faltan datos");
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    const logo = await comprimirImagen(e.target.result, 150);
    const equipo = await db.createEquipo(
      torneoActual,
      nom,
      document.getElementById('adDia').value,
      logo
    );
    if(equipo) {
      alert("✅ Equipo Creado");
      await updateSelects();
    }
  };
  reader.readAsDataURL(fileInput.files[0]);
};

window.generarFixtureAuto = async function() {
  if (!torneoActual) return alert('Selecciona un torneo');
  
  const dia = document.getElementById('fixDiaGen').value;
  const horaInicio = document.getElementById('fixHoraInicio').value;
  const duracion = parseInt(document.getElementById('fixDuracion').value);
  
  const equipos = await db.getEquipos(torneoActual);
  let equiposDia = equipos.filter(e => e.dia_semana === dia).map(e => e.nombre);
  
  if (equiposDia.length < 2) return alert("Necesitas más equipos");
  if (equiposDia.length % 2 !== 0) equiposDia.push("DESCANSA");
  
  const numE = equiposDia.length;
  for (let r = 0; r < numE - 1; r++) {
    let fechaH = new Date(`2026-01-01T${horaInicio}:00`);
    for (let p = 0; p < numE / 2; p++) {
      const local = equiposDia[p];
      const visitante = equiposDia[numE - 1 - p];
      if (local !== "DESCANSA" && visitante !== "DESCANSA") {
        const localEq = equipos.find(e => e.nombre === local);
        const visitanteEq = equipos.find(e => e.nombre === visitante);
        if(localEq && visitanteEq) {
          await db.createFixture(
            torneoActual,
            dia,
            `Fecha ${r + 1}`,
            fechaH.toTimeString().substring(0, 5),
            localEq.id,
            visitanteEq.id
          );
        }
        fechaH.setMinutes(fechaH.getMinutes() + duracion);
      }
    }
    equiposDia.splice(1, 0, equiposDia.pop());
  }
  
  alert("✅ Fixture Generado");
  await renderFixtureActual();
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
  
  const n = document.getElementById('resG' + (lado === 'E1' ? '1' : '2')).value;
  const equipoId = parseInt(document.getElementById('res' + (lado === 'E1' ? '1' : '2')).value);
  
  const jugadores = await db.getJugadores(torneoActual);
  const jugsDel = jugadores.filter(j => j.equipos?.includes(equipoId));
  
  document.getElementById('contGoles' + lado).innerHTML = Array.from({length: n}, () => 
    `<select class="sel-gol-${lado}" style="width:100%; padding:8px; margin:5px 0;">${jugsDel.map(j => `<option value="${j.id}">${j.nombre}</option>`).join('')}</select>`
  ).join('');
};

window.agregarInputTarjeta = async function(lado) {
  if (!torneoActual) return;
  
  const equipoId = parseInt(document.getElementById('res' + (lado === 'E1' ? '1' : '2')).value);
  const jugadores = await db.getJugadores(torneoActual);
  const jugsDel = jugadores.filter(j => j.equipos?.includes(equipoId));
  
  const div = document.createElement('div');
  div.style = "display:flex; gap:5px; margin-top:5px";
  div.innerHTML = `
    <select class="sel-card-j-${lado}" style="flex:1; padding:8px;">${jugsDel.map(j => `<option value="${j.id}">${j.nombre}</option>`).join('')}</select>
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
  
  document.getElementById('resMVP').innerHTML = jugs.map(j => `<option value="${j.id}">${j.nombre}</option>`).join('');
};

window.cargarResultadoGlobal = async function() {
  if (!torneoActual) return;
  
  const e1Id = parseInt(document.getElementById('resE1').value);
  const e2Id = parseInt(document.getElementById('resE2').value);
  const g1 = parseInt(document.getElementById('resG1').value) || 0;
  const g2 = parseInt(document.getElementById('resG2').value) || 0;
  
  const e1 = await db.getEquipos(torneoActual).then(e => e.find(x => x.id === e1Id));
  const e2 = await db.getEquipos(torneoActual).then(e => e.find(x => x.id === e2Id));
  
  if(!e1 || !e2) return alert("Selecciona equipos");
  
  // Actualizar estadísticas de equipos
  const newE1 = { ...e1, pj: e1.pj + 1, gf: e1.gf + g1, gc: e1.gc + g2 };
  const newE2 = { ...e2, pj: e2.pj + 1, gf: e2.gf + g2, gc: e2.gc + g1 };
  
  if(g1 > g2) {
    newE1.v = e1.v + 1;
    newE1.pts = e1.pts + 3;
    newE2.p = e2.p + 1;
  } else if(g2 > g1) {
    newE2.v = e2.v + 1;
    newE2.pts = e2.pts + 3;
    newE1.p = e1.p + 1;
  } else {
    newE1.e = e1.e + 1;
    newE2.e = e2.e + 1;
    newE1.pts = e1.pts + 1;
    newE2.pts = e2.pts + 1;
  }
  
  if(g2 === 0) newE1.vallas_invictas = e1.vallas_invictas + 1;
  if(g1 === 0) newE2.vallas_invictas = e2.vallas_invictas + 1;
  
  await db.updateEquipo(e1.id, newE1);
  await db.updateEquipo(e2.id, newE2);
  
  // Registrar goles
  document.querySelectorAll('.sel-gol-E1, .sel-gol-E2').forEach(async (s) => {
    const jugadorId = parseInt(s.value);
    const jugador = await db.getJugadores(torneoActual).then(j => j.find(x => x.id === jugadorId));
    if(jugador) {
      const updatedJ = { ...jugador, goles: jugador.goles + 1, pj: jugador.pj + 1 };
      await db.updateJugador(jugadorId, updatedJ);
    }
  });
  
  // Registrar tarjetas
  ['E1', 'E2'].forEach(async (lado) => {
    const jS = document.querySelectorAll(`.sel-card-j-${lado}`);
    const tS = document.querySelectorAll(`.sel-card-t-${lado}`);
    
    jS.forEach(async (s, i) => {
      const jugadorId = parseInt(s.value);
      const jugador = await db.getJugadores(torneoActual).then(j => j.find(x => x.id === jugadorId));
      if(jugador) {
        const updatedJ = { ...jugador };
        if(tS[i].value === 'A') {
          updatedJ.amarillas = jugador.amarillas + 1;
        } else {
          updatedJ.rojas = jugador.rojas + 1;
        }
        await db.updateJugador(jugadorId, updatedJ);
      }
    });
  });
  
  // MVP
  const mvpId = parseInt(document.getElementById('resMVP').value);
  if(mvpId) {
    const jugador = await db.getJugadores(torneoActual).then(j => j.find(x => x.id === mvpId));
    if(jugador) {
      const updatedJ = { ...jugador, mvps: jugador.mvps + 1 };
      await db.updateJugador(mvpId, updatedJ);
    }
  }
  
  alert("✅ ¡Guardado!");
  await recargarDatos();
};

window.renderFama = async function() {
  if (!torneoActual) return;
  
  const jugadores = await db.getJugadores(torneoActual);
  const cracks = [...jugadores].sort((a, b) => b.mvps - a.mvps || b.goles - a.goles).slice(0, 12);
  
  document.getElementById('renderFama').innerHTML = cracks.map(j => `
    <div class="ficha-ea">
      <div class="card-badge">
        <div class="rating">${calcularRating(j)}</div>
        <div class="pos">${j.posicion}</div>
      </div>
      <img src="${j.foto}" class="perfil-ea">
      <div class="info-jugador-ea">
        <h3>${j.nombre}</h3>
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
// ✅ FUNCIONES DE ADMIN PARA FIXTURE
window.eliminarPartido = async function(id) {
  if (!confirm('¿Eliminar este partido del fixture?')) return;
  const { error } = await _supabase.from('fixture').delete().eq('id', id);
  if (error) return alert('Error al eliminar: ' + error.message);
  alert('🗑️ Partido eliminado');
  renderFixtureActual();
};

window.cargarResultadoDeFixture = async function(fixtureId) {
  const fixture = await db.getFixture(torneoActual);
  const match = fixture.find(m => m.id === fixtureId);
  if (!match) return alert('Partido no encontrado');

  // Switch to fixture tab and fill the form
  showSec('fixture', document.querySelector('[onclick*="fixture"]'));
  
  await new Promise(r => setTimeout(r, 200)); // wait for DOM to update
  
  document.getElementById('resDiaFiltro').value = match.dia_semana;
  await filtrarEquiposPorDia();
  
  await new Promise(r => setTimeout(r, 100));
  
  document.getElementById('resE1').value = match.equipo_local_id;
  document.getElementById('resE2').value = match.equipo_visitante_id;
  await actualizarListasJugadores();
  
  document.getElementById('resG1').value = 0;
  document.getElementById('resG2').value = 0;
  document.getElementById('contGolesE1').innerHTML = '';
  document.getElementById('contGolesE2').innerHTML = '';
  document.getElementById('contCardsE1').innerHTML = '';
  document.getElementById('contCardsE2').innerHTML = '';
  
  alert('✅ Partido cargado. Completá el resultado y guardá.');
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
            alert("🔒 Tenés que iniciar sesión para acceder al ADMIN");
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
        alert("🔒 Error de conexión. Intentalo de nuevo.");
    }
}