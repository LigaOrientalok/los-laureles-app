// =====================================================================
// SISTEMA DE MISIONES, XP Y NIVELES
// =====================================================================

const XP_PER_LEVEL = 80;

function calcularXP(j) {
  let xp = 0;
  xp += (j.goles || 0) * 10;
  xp += (j.pj || 0) * 5;
  xp += (j.mvps || 0) * 25;
  xp += Math.max(0, (j.goles || 0) - (j.pj || 0)) * 5;
  xp += (j.vallas_invictas || 0) * 15;
  xp += (j.hattricks || 0) * 40;
  return xp;
}

function calcularNivel(xp) {
  return Math.floor(Math.sqrt(xp / XP_PER_LEVEL)) + 1;
}

function xpParaSiguienteNivel(nivel) {
  return XP_PER_LEVEL * (nivel * nivel);
}

function calcularRatingConNivel(j) {
  const xp = j.xp || calcularXP(j);
  const nivel = j.nivel || calcularNivel(xp);
  let media = 60 + (j.goles * 0.5) + (j.pj * 0.2) + ((j.mvps || 0) * 2.0);
  media -= ((j.amarillas || 0) * 0.5) + ((j.rojas || 0) * 2.0);
  media += nivel * 0.5;
  return Math.min(99, Math.max(10, Math.round(media)));
}

function getNivelColor(nivel) {
  if (nivel >= 12) return '#8b5cf6';
  if (nivel >= 9) return '#eab308';
  if (nivel >= 6) return '#94a3b8';
  if (nivel >= 3) return '#cd7f32';
  return '#8b949e';
}

function getNivelLabel(nivel) {
  if (nivel >= 12) return 'LEYENDA';
  if (nivel >= 9) return 'ORO';
  if (nivel >= 6) return 'PLATA';
  if (nivel >= 3) return 'BRONCE';
  return 'PRINCIPIANTE';
}

function getFrameClass(nivel) {
  if (nivel >= 12) return 'frame-diamante';
  if (nivel >= 9) return 'frame-oro';
  if (nivel >= 6) return 'frame-plata';
  if (nivel >= 3) return 'frame-bronce';
  return '';
}

// --- MISSION DEFINITIONS ---

const MISIONES = [
  // GENERAL
  { id: 'first_match', label: 'Primer Partido', icon: '📋', xp: 10, tipo: 'general',
    check: j => (j.pj || 0) >= 1 },
  { id: 'ten_matches', label: '10 Partidos', icon: '📋📋', xp: 40, tipo: 'general',
    check: j => (j.pj || 0) >= 10 },
  { id: 'twenty_matches', label: '20 Partidos', icon: '📋📋📋', xp: 80, tipo: 'general',
    check: j => (j.pj || 0) >= 20 },
  { id: 'first_mvp', label: 'Primer MVP', icon: '🏆', xp: 30, tipo: 'general',
    check: j => (j.mvps || 0) >= 1 },
  { id: 'five_mvps', label: '5 MVPs', icon: '🏆🏆', xp: 80, tipo: 'general',
    check: j => (j.mvps || 0) >= 5 },
  { id: 'ten_mvps', label: '10 MVPs', icon: '🏆🏆🏆', xp: 150, tipo: 'general',
    check: j => (j.mvps || 0) >= 10 },
  { id: 'legend', label: 'Leyenda', icon: '👑', xp: 200, tipo: 'general',
    check: j => calcularNivel(calcularXP(j)) >= 10 },

  // FIELD PLAYER (no porteros)
  { id: 'first_goal', label: 'Primer Gol', icon: '⚽', xp: 20, tipo: 'field',
    check: j => (j.goles || 0) >= 1 },
  { id: 'five_goals', label: '5 Goles', icon: '⚽⚽', xp: 50, tipo: 'field',
    check: j => (j.goles || 0) >= 5 },
  { id: 'ten_goals', label: '10 Goles', icon: '⚽⚽⚽', xp: 100, tipo: 'field',
    check: j => (j.goles || 0) >= 10 },
  { id: 'hat_trick', label: 'Hat Trick', icon: '🎩', xp: 60, tipo: 'field',
    check: j => (j.hattricks || 0) >= 1 },
  { id: 'five_hattricks', label: '5 Hat Tricks', icon: '🎩🎩', xp: 200, tipo: 'field',
    check: j => (j.hattricks || 0) >= 5 },

  // GOALKEEPER
  { id: 'first_clean', label: 'Valla Invicta', icon: '🧤', xp: 30, tipo: 'por',
    check: j => (j.vallas_invictas || 0) >= 1 },
  { id: 'five_clean', label: '5 Vallas Invictas', icon: '🧤🧤', xp: 90, tipo: 'por',
    check: j => (j.vallas_invictas || 0) >= 5 },
  { id: 'ten_clean', label: '10 Vallas Invictas', icon: '🧤🧤🧤', xp: 160, tipo: 'por',
    check: j => (j.vallas_invictas || 0) >= 10 },
  { id: 'por_mvp', label: 'Portero MVP', icon: '🧤🏆', xp: 50, tipo: 'por',
    check: j => (j.mvps || 0) >= 1 },
  { id: 'penalty_hero', label: 'Héroe (5 MVPs)', icon: '🙌', xp: 120, tipo: 'por',
    check: j => (j.mvps || 0) >= 5 },
];

function misionesParaPosicion(posicion) {
  if (posicion === 'POR') {
    return MISIONES.filter(m => m.tipo === 'general' || m.tipo === 'por');
  }
  return MISIONES.filter(m => m.tipo === 'general' || m.tipo === 'field');
}

function misionesCompletadas(j, posicion) {
  const lista = misionesParaPosicion(posicion);
  return lista.map(m => ({
    ...m,
    completada: m.check(j),
  }));
}

function xpDeMisiones(j, posicion) {
  return misionesParaPosicion(posicion)
    .filter(m => m.check(j))
    .reduce((sum, m) => sum + m.xp, 0);
}

// --- FETCH EXTRA STATS (vallas_invictas, hattricks) ---

async function computeExtraStats(jugador, torneoId) {
  if (!torneoId) return { vallas_invictas: 0, hattricks: 0 };

  try {
    const [equipos, resultados, allGolesResp] = await Promise.all([
      db.getEquipos(torneoId),
      db.getResultados(torneoId),
      _supabase.from('goles').select('*').in('resultado_id',
        resultados.length > 0 ? resultados.map(r => r.id) : [0]),
    ]);
    const allGoles = allGolesResp?.data || [];
    const equipoIds = jugador.equipos || [];

    let vallasInvictas = 0;
    let hattricks = 0;
    const golesPorResultado = {};

    for (const g of allGoles.filter(g => g.jugador_id === jugador.id)) {
      golesPorResultado[g.resultado_id] = (golesPorResultado[g.resultado_id] || 0) + 1;
      if (golesPorResultado[g.resultado_id] >= 3) hattricks++;
    }

    for (const r of resultados) {
      const eqLocal = equipos.find(e => e.id === r.equipo_local_id);
      const eqVisit = equipos.find(e => e.id === r.equipo_visitante_id);
      const jugEsLocal = equipoIds.includes(r.equipo_local_id);
      const jugEsVisit = equipoIds.includes(r.equipo_visitante_id);

      if (jugEsLocal || jugEsVisit) {
        const golesRecibidos = jugEsLocal ? r.goles_visitante : r.goles_local;
        if (golesRecibidos === 0) vallasInvictas++;
      }
    }

    return { vallas_invictas: vallasInvictas, hattricks };
  } catch {
    return { vallas_invictas: 0, hattricks: 0 };
  }
}

async function computeMisionesForPlayer(jugadorId, torneoId) {
  const jugadores = await db.getJugadores(torneoId);
  const j = jugadores.find(x => x.id === jugadorId);
  if (!j) return null;

  const extra = await computeExtraStats(j, torneoId);
  const enrichedJ = { ...j, ...extra };

  const xp = calcularXP(enrichedJ);
  const nivel = calcularNivel(xp);
  const misiones = misionesCompletadas(enrichedJ, j.posicion);
  const completadas = misiones.filter(m => m.completada).length;
  const totalMisiones = misiones.length;
  const totalXpMisiones = xpDeMisiones(enrichedJ, j.posicion);

  return { jugador: enrichedJ, xp, nivel, misiones, completadas, totalMisiones, totalXpMisiones };
}

// --- MISIONES PAGE / MODAL ---

window.mostrarMisiones = async function() {
  const jugadores = await db.getJugadores(torneoActual);
  const equipos = await db.getEquipos(torneoActual);

  // Get current user's linked players
  const user = (await _supabase.auth.getSession()).data?.session?.user;
  if (!user) return mostrarErrorUsuario('Inicia sesión primero');

  const { data: userData } = await _supabase.from('usuarios').select('*').eq('id', user.id).maybeSingle();
  const userEmail = userData?.email || user.email;

  // Find players with matching email (foto as email link) or just show all
  // For simplicity, show a selector of all players + auto-select if email matches player name
  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:1000;';
  overlay.id = 'misiones-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:#161b22; border:2px solid #eab308; border-radius:16px; padding:25px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; position:relative;">
      <button onclick="this.closest('#misiones-overlay').remove()" style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">✕</button>
      <h2 style="color:#eab308; text-align:center; margin:0 0 15px 0;">🎯 Misiones</h2>
      <label class="label-accent">Seleccioná un jugador:</label>
      <select id="misiones-select" onchange="cargarMisionesJugador(this.value)" style="margin-bottom:15px;">
        <option value="">— Elegir jugador —</option>
        ${jugadores.map(j => `<option value="${j.id}">${escapeHtml(j.nombre)} ${j.posicion === 'POR' ? '🧤' : '⚽'}</option>`).join('')}
      </select>
      <div id="misiones-content" style="text-align:center; color:#8b949e; padding:20px;">
        Seleccioná un jugador para ver sus misiones
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Auto-select if player name matches user email prefix
  const nameMatch = jugadores.find(j => userEmail.toLowerCase().includes(j.nombre.toLowerCase().split(' ')[0].toLowerCase()));
  if (nameMatch && jugadores.length > 0) {
    document.getElementById('misiones-select').value = nameMatch.id;
    await cargarMisionesJugador(nameMatch.id);
  }
};

window.cargarMisionesJugador = async function(jugadorId) {
  const cont = document.getElementById('misiones-content');
  if (!jugadorId || !cont) return;
  cont.innerHTML = '<p style="color:#8b949e;">Cargando...</p>';

  try {
    const result = await computeMisionesForPlayer(jugadorId, torneoActual);
    if (!result) { cont.innerHTML = '<p style="color:#ef4444;">Jugador no encontrado</p>'; return; }

    const { jugador, xp, nivel, misiones, completadas, totalMisiones } = result;
    const sigXp = xpParaSiguienteNivel(nivel);
    const antXp = xpParaSiguienteNivel(nivel - 1);
    const progreso = Math.min(100, ((xp - antXp) / (sigXp - antXp)) * 100);
    const nivelColor = getNivelColor(nivel);
    const nivelLabel = getNivelLabel(nivel);
    const posLabel = jugador.posicion === 'POR' ? '🧤 Portero' : '⚽ Jugador de campo';

    cont.innerHTML = `
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${jugador.foto || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%2230363d%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%228b949e%22 font-family=%22sans-serif%22 font-size=%2212%22 text-anchor=%22middle%22 x=%2250%22 y=%2255%22%3ESin%20Foto%3C/text%3E%3C/svg%3E'}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${nivelColor};margin-bottom:10px;">
        <h3 style="color:#eab308; margin:5px 0;">${escapeHtml(jugador.nombre)}</h3>
        <span style="color:#8b949e; font-size:0.85rem;">${posLabel}</span>
      </div>

      <div style="background:#0d1117; border-radius:8px; padding:15px; margin-bottom:15px; text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:8px;">
          <span style="font-size:2.5rem; font-weight:bold; color:${nivelColor};">${nivel}</span>
          <span style="background:${nivelColor}; color:black; padding:4px 16px; border-radius:20px; font-weight:bold; font-size:0.75rem;">${nivelLabel}</span>
        </div>
        <div style="background:#21262d; border-radius:10px; height:16px; overflow:hidden; margin-bottom:4px;">
          <div style="width:${progreso}%; height:100%; background:linear-gradient(90deg, ${nivelColor}, #eab308); border-radius:10px; transition:width 0.5s;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#8b949e;">
          <span>${xp} XP</span>
          <span>${sigXp} XP</span>
        </div>
      </div>

      <h4 style="color:#eab308; margin:0 0 10px 0;">🎯 Misiones (${completadas}/${totalMisiones})</h4>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${misiones.map(m => {
          const done = m.completada;
          return `
            <div style="display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; background:${done ? '#22c55e22' : '#0d1117'}; border:1px solid ${done ? '#22c55e44' : '#30363d'};">
              <span style="font-size:1.1rem;">${m.icon}</span>
              <div style="flex:1; min-width:0;">
                <div style="font-size:0.85rem; color:${done ? '#22c55e' : '#e0e0e0'}; font-weight:${done ? 'bold' : 'normal'};">${escapeHtml(m.label)}</div>
                <div style="font-size:0.65rem; color:#8b949e;">${m.xp} XP</div>
              </div>
              <span style="font-size:1rem;">
                ${done ? '✅' : '⏳'}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (e) {
    cont.innerHTML = '<p style="color:#ef4444;">Error al cargar misiones</p>';
  }
};
