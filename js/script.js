let db = JSON.parse(localStorage.getItem('LIGA_2026')) || { equipos: [], jugadores: [], fixture: [] };

const save = () => { try { localStorage.setItem('LIGA_2026', JSON.stringify(db)); } catch (e) { alert("¡Memoria llena!"); } };

let tempImgJugador = "https://placeholder.com";

async function comprimirImagen(base64, maxWidth = 300) {
    return new Promise(resolve => {
        const img = new Image(); img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas'); const scale = maxWidth / img.width;
            canvas.width = maxWidth; canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
    });
}

function calcularRating(j) {
    let media = 60 + (j.goles * 0.5) + (j.pj * 0.2) + ((j.mvps || 0) * 2.0);
    media -= ((j.amarillas || 0) * 0.5) + ((j.rojas || 0) * 2.0);
    return Math.min(99, Math.max(10, Math.round(media)));
}

window.showSec = function(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('sec-' + id); if(target) target.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); if(btn) btn.classList.add('active');
    if(id === 'fama') renderFama(); if(id === 'fixture') renderFixture(); updateSelects();
};

function updateSelects() {
    const options = db.equipos.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('');
    ['regEqSelect', 'resE1', 'resE2'].forEach(id => {
        const el = document.getElementById(id); if(el) { const val = el.value; el.innerHTML = '<option disabled selected>Seleccionar...</option>' + options; if(val) el.value = val; }
    });
}

window.previewImage = async function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = async (e) => { tempImgJugador = await comprimirImagen(e.target.result); document.getElementById('preImg').src = tempImgJugador; updatePreview(); };
        reader.readAsDataURL(input.files[0]);
    }
};

window.updatePreview = function() {
    const ci = document.getElementById('regCI').value.trim();
    document.getElementById('preNom').innerText = document.getElementById('regNom').value.toUpperCase() || "JUGADOR";
    document.getElementById('prePos').innerText = document.getElementById('regPos').value;
    document.getElementById('prePie').innerText = document.getElementById('regPierna').value;
    const j = db.jugadores.find(x => x.ci === ci);
    if(j) { document.getElementById('preGoles').innerText = j.goles; document.getElementById('prePJ').innerText = j.pj; document.getElementById('preMedia').innerText = calcularRating(j); }
    const eq = db.equipos.find(e => e.nombre === document.getElementById('regEqSelect').value);
    if(eq) { const logo = document.getElementById('preLogoEq'); logo.src = eq.logo; logo.style.display = "block"; }
};

window.savePlayer = function() {
    const ci = document.getElementById('regCI').value.trim(); const nom = document.getElementById('regNom').value.trim().toUpperCase();
    const eq = document.getElementById('regEqSelect').value; if(!ci || !nom || eq === "Seleccionar...") return alert("Datos incompletos");
    let exist = db.jugadores.find(j => j.ci === ci);
    if(exist) { if(!exist.equipos.includes(eq)) { exist.equipos.push(eq); save(); alert("Vinculado"); } else { alert("Ya registrado"); } }
    else { db.jugadores.push({ id: Date.now(), ci, nombre: nom, posicion: document.getElementById('regPos').value, pierna: document.getElementById('regPierna').value, equipos: [eq], goles: 0, pj: 0, amarillas: 0, rojas: 0, mvps: 0, foto: tempImgJugador }); save(); alert("Jugador Creado"); }
};

window.addEq = async function() {
    const nom = document.getElementById('adNom').value.trim(); const fileInput = document.getElementById('adLog');
    if(!nom || !fileInput.files[0]) return alert("Faltan datos");
    const reader = new FileReader(); reader.onload = async (e) => {
        const logo = await comprimirImagen(e.target.result, 150);
        db.equipos.push({ nombre: nom, dia: document.getElementById('adDia').value, logo, pj:0, v:0, e:0, p:0, gf:0, gc:0, pts:0, vallasInvictas: 0 });
        save(); alert("Equipo Creado"); updateSelects();
    }; reader.readAsDataURL(fileInput.files[0]);
};

window.generarFixtureAuto = function() {
    const dia = document.getElementById('fixDiaGen').value; const horaInicio = document.getElementById('fixHoraInicio').value;
    const duracion = parseInt(document.getElementById('fixDuracion').value);
    let equipos = db.equipos.filter(e => e.dia === dia).map(e => e.nombre);
    if (equipos.length < 2) return alert("Necesitas más equipos");
    if (equipos.length % 2 !== 0) equipos.push("DESCANSA");
    const numE = equipos.length; let fixtures = [];
    for (let r = 0; r < numE - 1; r++) {
        let fechaH = new Date(`2026-01-01T${horaInicio}:00`);
        for (let p = 0; p < numE / 2; p++) {
            const local = equipos[p], visitante = equipos[numE - 1 - p];
            if (local !== "DESCANSA" && visitante !== "DESCANSA") { fixtures.push({ dia, fecha: `Fecha ${r + 1}`, hora: fechaH.toTimeString().substring(0, 5), local, visitante }); fechaH.setMinutes(fechaH.getMinutes() + duracion); }
        }
        equipos.splice(1, 0, equipos.pop());
    }
    db.fixture = db.fixture.filter(f => f.dia !== dia); db.fixture.push(...fixtures); save(); alert("Fixture Generado");
};

window.renderFixture = function() {
    const cont = document.getElementById('cont-fixture'); if (!cont) return;
    const grupos = db.fixture.reduce((acc, m) => { const k = `${m.dia} - ${m.fecha}`; if (!acc[k]) acc[k] = []; acc[k].push(m); return acc; }, {});
    cont.innerHTML = Object.keys(grupos).map(titulo => `<div style="margin-bottom:20px"><h3>${titulo}</h3>${grupos[titulo].map(m => `<div class="fixture-item"><span>${m.hora}</span><div style="flex:1; text-align:right">${m.local}</div><div style="margin:0 10px; font-size:10px">VS</div><div style="flex:1">${m.visitante}</div></div>`).join('')}</div>`).join('');
};

window.filtrarEquiposPorDia = function() {
    const dia = document.getElementById('resDiaFiltro').value;
    const opt = db.equipos.filter(e => e.dia === dia).map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('');
    document.getElementById('resE1').innerHTML = '<option disabled selected>Local</option>' + opt;
    document.getElementById('resE2').innerHTML = '<option disabled selected>Visitante</option>' + opt;
};

window.generarInputsGoles = function(lado) {
    const n = document.getElementById('resG' + (lado === 'E1' ? '1' : '2')).value;
    const eq = document.getElementById('res' + (lado === 'E1' ? '1' : '2')).value;
    const jugs = db.jugadores.filter(j => j.equipos.includes(eq));
    document.getElementById('contGoles' + lado).innerHTML = Array.from({length: n}, () => `<select class="sel-gol-${lado}">${jugs.map(j => `<option value="${j.id}">${j.nombre}</option>`).join('')}</select>`).join('');
};

window.agregarInputTarjeta = function(lado) {
    const eq = document.getElementById('res' + (lado === 'E1' ? '1' : '2')).value;
    const jugs = db.jugadores.filter(j => j.equipos.includes(eq));
    const div = document.createElement('div'); div.style = "display:flex; gap:5px; margin-top:5px";
    div.innerHTML = `<select class="sel-card-j-${lado}">${jugs.map(j => `<option value="${j.id}">${j.nombre}</option>`).join('')}</select><select class="sel-card-t-${lado}"><option value="A">🟨</option><option value="R">🟥</option></select><button onclick="this.parentElement.remove()" style="background:red; color:white; border:none; padding:2px 5px">X</button>`;
    document.getElementById('contCards' + lado).appendChild(div);
};

window.actualizarListasJugadores = function() {
    const e1 = document.getElementById('resE1').value, e2 = document.getElementById('resE2').value;
    const jugs = db.jugadores.filter(j => j.equipos.includes(e1) || j.equipos.includes(e2));
    document.getElementById('resMVP').innerHTML = jugs.map(j => `<option value="${j.id}">${j.nombre}</option>`).join('');
};

window.cargarResultadoGlobal = function() {
    const e1n = document.getElementById('resE1').value, e2n = document.getElementById('resE2').value;
    const g1 = parseInt(document.getElementById('resG1').value) || 0, g2 = parseInt(document.getElementById('resG2').value) || 0;
    let e1 = db.equipos.find(e => e.nombre === e1n), e2 = db.equipos.find(e => e.nombre === e2n);
    if(!e1 || !e2) return alert("Selecciona equipos");
    e1.pj++; e2.pj++; e1.gf += g1; e1.gc += g2; e2.gf += g2; e2.gc += g1;
    if(g1 > g2) { e1.v++; e1.pts += 3; e2.p++; } else if(g2 > g1) { e2.v++; e2.pts += 3; e1.p++; } else { e1.e++; e2.e++; e1.pts += 1; e2.pts += 1; }
    if (g2 === 0) e1.vallasInvictas++; if (g1 === 0) e2.vallasInvictas++;
    document.querySelectorAll('.sel-gol-E1, .sel-gol-E2').forEach(s => { let j = db.jugadores.find(x => x.id == s.value); if(j) { j.goles++; j.pj++; } });
    ['E1', 'E2'].forEach(lado => { const jS = document.querySelectorAll(`.sel-card-j-${lado}`), tS = document.querySelectorAll(`.sel-card-t-${lado}`); jS.forEach((s, i) => { let j = db.jugadores.find(x => x.id == s.value); if(j) tS[i].value === 'A' ? j.amarillas++ : j.rojas++; }); });
    let mvp = db.jugadores.find(x => x.id == document.getElementById('resMVP').value); if(mvp) mvp.mvps++; save(); alert("¡Guardado!");
};

window.renderTabla = function(dia) {
    const filtrados = db.equipos.filter(e => e.dia === dia).sort((a,b) => b.pts - a.pts || (b.gf-b.gc) - (a.gf-a.gc));
    document.getElementById('bodyPos').innerHTML = filtrados.map((e, i) => `<tr><td>${i+1}</td><td style="text-align:left"><img src="${e.logo}" class="mini-logo-table">${e.nombre}</td><td>${e.pj}</td><td>${e.v}</td><td>${e.e}</td><td>${e.p}</td><td>${e.gf}</td><td>${e.gc}</td><td>${e.gf-e.gc}</td><td><b>${e.pts}</b></td></tr>`).join('');
};

window.renderEstadisticas = function(dia) {
    const cont = document.getElementById('lista-goleadores'); if(!cont) return;
    const jugsDia = db.jugadores.filter(j => j.equipos.some(en => db.equipos.find(e => e.nombre === en && e.dia === dia)));
    if (jugsDia.length === 0) { cont.innerHTML = "<p style='text-align:center; padding:20px;'>Sin datos.</p>"; return; }
    const goleadores = [...jugsDia].sort((a,b) => b.goles - a.goles).slice(0, 10), top3 = goleadores.slice(0, 3);
    const eqInvictos = db.equipos.filter(e => e.dia === dia).sort((a,b) => b.vallasInvictas - a.vallasInvictas).slice(0, 5);
    cont.innerHTML = `<div class="podio-container">${top3[1] ? `<div class="podio-item p2"><img src="${top3[1].foto}"><span>2°</span><p>${top3[1].nombre}</p></div>`:''}${top3[0] ? `<div class="podio-item p1"><img src="${top3[0].foto}"><span>1°</span><p>${top3[0].nombre}</p></div>`:''}${top3[2] ? `<div class="podio-item p3"><img src="${top3[2].foto}"><span>3°</span><p>${top3[2].nombre}</p></div>`:''}</div><div class="stats-grid-pro"><div class="stat-column"><h4>⚽ TOP GOLEADORES</h4><table class="tabla-mini">${goleadores.map((j,i) => `<tr><td>${i+1}</td><td>${j.nombre}</td><td class="stat-val">${j.goles}</td></tr>`).join('')}</table></div><div class="stat-column"><h4>🧤 MÁS VALLAS INVICTAS</h4><table class="tabla-mini">${eqInvictos.map(e => `<tr><td>${e.nombre}</td><td class="stat-val">${e.vallasInvictas}</td></tr>`).join('')}</table></div></div>`;
};

window.renderGestionJugadores = function(val = "") {
    const cont = document.getElementById('lista-gestion'); if(!cont) return;
    const filtrados = db.jugadores.filter(j => j.nombre.toLowerCase().includes(val.toLowerCase()) || j.ci.toString().includes(val));
    cont.innerHTML = filtrados.map(j => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #333"><span>${j.nombre} (CI: ${j.ci})</span><button onclick="eliminarJugador(${j.id})" style="background:red; color:white; border:none; padding:4px; cursor:pointer">Eliminar</button></div>`).join('');
};

window.renderGestionEquipos = function(dia) {
    const cont = document.getElementById('lista-gestion'); if(!cont) return;
    const filtrados = db.equipos.filter(e => e.dia === dia);
    cont.innerHTML = filtrados.map(e => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #333"><span>${e.nombre}</span><button onclick="eliminarEquipo('${e.nombre}')" style="background:red; color:white; border:none; padding:4px; cursor:pointer">Eliminar</button></div>`).join('');
};

window.eliminarJugador = function(id) { if(confirm("¿Eliminar?")) { db.jugadores = db.jugadores.filter(j => j.id !== id); save(); renderGestionJugadores(""); } };
window.eliminarEquipo = function(nom) { if(confirm(`¿Eliminar ${nom}?`)) { db.equipos = db.equipos.filter(e => e.nombre !== nom); save(); renderGestionEquipos(""); } };
window.renderFama = function() {
    const cracks = [...db.jugadores].sort((a,b) => b.mvps - a.mvps || b.goles - a.goles).slice(0, 12);
    document.getElementById('renderFama').innerHTML = cracks.map(j => `<div class="ficha-ea"><div class="card-badge"><div class="rating">${calcularRating(j)}</div><div class="pos">${j.posicion}</div></div><img src="${j.foto}" class="perfil-ea"><div class="info-jugador-ea"><h3>${j.nombre}</h3><div class="stats-ea"><span>⚽ ${j.goles}</span><span>⭐ ${j.mvps}</span></div></div></div>`).join('');
};

window.descargarCaptura = function(id) { html2canvas(document.getElementById(id)).then(canvas => { const link = document.createElement('a'); link.download = 'captura.png'; link.href = canvas.toDataURL(); link.click(); }); };

document.addEventListener('DOMContentLoaded', () => { updateSelects(); });