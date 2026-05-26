// =====================================================================
// SISTEMA DE MISIONES, XP Y NIVELES — 50 misiones por posición
// =====================================================================

const XP_PER_LEVEL = 80;

function calcularXP(j) {
  let xp = 0;
  xp += (j.goles || 0) * 10;
  xp += (j.pj || 0) * 5;
  xp += (j.mvps || 0) * 25;
  xp += (j.vallas_invictas || 0) * 15;
  xp += (j.hattricks || 0) * 40;
  xp += (j.dobletes || 0) * 20;
  xp += (j.pokers || 0) * 80;
  xp += (j.matches_con_gol || 0) * 5;
  xp += (j.wins || 0) * 8;
  xp += (j.clean_wins || 0) * 10;
  xp += (j.brace_mvp || 0) * 30;
  xp += (j.hattrick_mvp || 0) * 50;
  xp += (j.poker_mvp || 0) * 100;
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

function getFrameClass(nivel, esCampeon) {
  if (esCampeon) return 'frame-campeon';
  if (nivel >= 12) return 'frame-diamante';
  if (nivel >= 9) return 'frame-oro';
  if (nivel >= 6) return 'frame-plata';
  if (nivel >= 3) return 'frame-bronce';
  return '';
}

// --- 75 MISSION DEFINITIONS (25 general + 25 field + 25 por) ---

const MISIONES = [
  // ==================== GENERAL (25) ====================
  { id: 'first_match', label: 'Primer Partido', icon: '📋', xp: 10, tipo: 'general',
    check: (j, ctx) => (j.pj || 0) >= 1 },
  { id: 'ten_matches', label: '10 Partidos', icon: '📋📋', xp: 40, tipo: 'general',
    check: (j, ctx) => (j.pj || 0) >= 10 },
  { id: 'twenty_matches', label: '20 Partidos', icon: '📋📋📋', xp: 80, tipo: 'general',
    check: (j, ctx) => (j.pj || 0) >= 20 },
  { id: 'thirty_matches', label: '30 Partidos', icon: '📋📋📋📋', xp: 120, tipo: 'general',
    check: (j, ctx) => (j.pj || 0) >= 30 },
  { id: 'fifty_matches', label: '50 Partidos', icon: '📋📋📋📋📋', xp: 180, tipo: 'general',
    check: (j, ctx) => (j.pj || 0) >= 50 },
  { id: 'first_mvp', label: 'Primer MVP', icon: '🏆', xp: 30, tipo: 'general',
    check: (j, ctx) => (j.mvps || 0) >= 1 },
  { id: 'five_mvps', label: '5 MVPs', icon: '🏆🏆', xp: 80, tipo: 'general',
    check: (j, ctx) => (j.mvps || 0) >= 5 },
  { id: 'ten_mvps', label: '10 MVPs', icon: '🏆🏆🏆', xp: 150, tipo: 'general',
    check: (j, ctx) => (j.mvps || 0) >= 10 },
  { id: 'twenty_mvps', label: '20 MVPs', icon: '🏆🏆🏆🏆', xp: 250, tipo: 'general',
    check: (j, ctx) => (j.mvps || 0) >= 20 },
  { id: 'never_red', label: 'Nunca Expulsado', icon: '🟡', xp: 30, tipo: 'general',
    check: (j, ctx) => (j.rojas || 0) === 0 },
  { id: 'fair_play_10', label: 'Fair Play (10 PJ sin rojas)', icon: '🟢', xp: 50, tipo: 'general',
    check: (j, ctx) => (j.rojas || 0) === 0 && (j.pj || 0) >= 10 },
  { id: 'perfect', label: 'Juego Perfecto', icon: '💎', xp: 40, tipo: 'general',
    check: (j, ctx) => (j.goles || 0) > ((j.amarillas || 0) + (j.rojas || 0)) },
  { id: 'no_cards_3', label: '3 Partidos sin Tarjeta', icon: '🟢🟢🟢', xp: 35, tipo: 'general',
    check: (j, ctx) => ctx?.rachaSinTarjeta3 === true },
  { id: 'no_cards_5', label: '5 Partidos sin Tarjeta', icon: '🟢🟢🟢🟢🟢', xp: 60, tipo: 'general',
    check: (j, ctx) => (ctx?.rachaSinTarjetaMax || 0) >= 5 },
  { id: 'no_cards_10', label: '10 Partidos sin Tarjeta', icon: '✨🟢✨', xp: 120, tipo: 'general',
    check: (j, ctx) => (ctx?.rachaSinTarjetaMax || 0) >= 10 },
  { id: 'two_teams', label: 'Dos Equipos', icon: '🔄', xp: 40, tipo: 'general',
    check: (j, ctx) => (j.equipos?.length || 0) >= 2 },
  { id: 'five_wins', label: '5 Victorias', icon: '🏅', xp: 60, tipo: 'general',
    check: (j, ctx) => (ctx?.wins || 0) >= 5 },
  { id: 'ten_wins', label: '10 Victorias', icon: '🏅🏅', xp: 120, tipo: 'general',
    check: (j, ctx) => (ctx?.wins || 0) >= 10 },
  { id: 'hundred_club', label: 'Club 90 (Rating)', icon: '💯', xp: 80, tipo: 'general',
    check: (j, ctx) => calcularRating(j) >= 90 },
  { id: 'debut_goal', label: 'Gol en el Debut', icon: '⚽✨', xp: 30, tipo: 'general',
    check: (j, ctx) => ctx?.debutGoal === true },
  { id: 'profile_complete', label: 'Perfil Completo', icon: '📸', xp: 15, tipo: 'general',
    check: (j, ctx) => j.foto && j.foto !== DEFAULT_AVATAR },
  { id: 'champion', label: 'Campeón', icon: '🏆', xp: 150, tipo: 'general',
    check: (j, ctx) => ctx?.esCampeon === true },
  { id: 'top_scorer', label: 'Goleador del Torneo', icon: '⚽👑', xp: 120, tipo: 'general',
    check: (j, ctx) => ctx?.esGoleador === true },
  { id: 'legend', label: 'Leyenda', icon: '👑', xp: 200, tipo: 'general',
    check: (j, ctx) => calcularNivel(calcularXP(j)) >= 10 },
  { id: 'super_legend', label: 'Super Leyenda', icon: '👑👑', xp: 400, tipo: 'general',
    check: (j, ctx) => calcularNivel(calcularXP(j)) >= 15 },

  // ==================== FIELD (25) ====================
  { id: 'first_goal', label: 'Primer Gol', icon: '⚽', xp: 20, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) >= 1 },
  { id: 'five_goals', label: '5 Goles', icon: '⚽⚽', xp: 50, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) >= 5 },
  { id: 'ten_goals', label: '10 Goles', icon: '⚽⚽⚽', xp: 100, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) >= 10 },
  { id: 'twenty_goals', label: '20 Goles', icon: '⚽⚽⚽⚽', xp: 180, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) >= 20 },
  { id: 'thirty_goals', label: '30 Goles', icon: '⚽⚽⚽⚽⚽', xp: 280, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) >= 30 },
  { id: 'doblete', label: 'Doblete', icon: '⚽⚽', xp: 30, tipo: 'field',
    check: (j, ctx) => (j.dobletes || 0) >= 1 },
  { id: 'three_dobletes', label: '3 Dobletes', icon: '⚽⚽⚽⚽⚽⚽', xp: 60, tipo: 'field',
    check: (j, ctx) => (j.dobletes || 0) >= 3 },
  { id: 'ten_dobletes', label: '10 Dobletes', icon: '⚽⚽💥', xp: 120, tipo: 'field',
    check: (j, ctx) => (j.dobletes || 0) >= 10 },
  { id: 'hat_trick', label: 'Hat Trick', icon: '🎩', xp: 60, tipo: 'field',
    check: (j, ctx) => (j.hattricks || 0) >= 1 },
  { id: 'five_hattricks', label: '5 Hat Tricks', icon: '🎩🎩🎩', xp: 200, tipo: 'field',
    check: (j, ctx) => (j.hattricks || 0) >= 5 },
  { id: 'poker', label: 'Póker', icon: '🎩🎩', xp: 100, tipo: 'field',
    check: (j, ctx) => (j.pokers || 0) >= 1 },
  { id: 'two_pokers', label: '2 Póker', icon: '🎩🎩🎩🎩', xp: 200, tipo: 'field',
    check: (j, ctx) => (j.pokers || 0) >= 2 },
  { id: 'goal_per_game', label: 'Promedio Gol (1+ por partido)', icon: '📊', xp: 80, tipo: 'field',
    check: (j, ctx) => (j.pj || 0) > 0 && (j.goles || 0) >= (j.pj || 0) },
  { id: 'super_gpg', label: 'Super Promedio (1.5+ por partido)', icon: '📊📊', xp: 150, tipo: 'field',
    check: (j, ctx) => (j.pj || 0) >= 2 && (j.goles || 0) >= (j.pj || 0) * 1.5 },
  { id: 'prolific_20', label: 'Prolífico (G+M ≥ 20)', icon: '💪', xp: 80, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) + (j.mvps || 0) >= 20 },
  { id: 'prolific_40', label: 'Super Prolífico (G+M ≥ 40)', icon: '💪💪', xp: 180, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) + (j.mvps || 0) >= 40 },
  { id: 'double_digit', label: 'Doble Dígito', icon: '🔟', xp: 100, tipo: 'field',
    check: (j, ctx) => (j.goles || 0) >= 10 && (j.mvps || 0) >= 5 },
  { id: 'five_scored', label: 'Gol en 5 Partidos', icon: '⚽📅', xp: 60, tipo: 'field',
    check: (j, ctx) => (ctx?.matchesConGol || 0) >= 5 },
  { id: 'ten_scored', label: 'Gol en 10 Partidos', icon: '⚽📅📅', xp: 120, tipo: 'field',
    check: (j, ctx) => (ctx?.matchesConGol || 0) >= 10 },
  { id: 'golden_match', label: 'Partido Dorado (Gol + MVP)', icon: '🏆⚽', xp: 40, tipo: 'field',
    check: (j, ctx) => (ctx?.goldenMatch || 0) >= 1 },
  { id: 'brace_mvp', label: 'Doblete MVP', icon: '🏆⚽⚽', xp: 60, tipo: 'field',
    check: (j, ctx) => (ctx?.braceMVP || 0) >= 1 },
  { id: 'hattrick_mvp', label: 'Hat Trick MVP', icon: '🏆🎩', xp: 100, tipo: 'field',
    check: (j, ctx) => (ctx?.hattrickMVP || 0) >= 1 },
  { id: 'poker_mvp', label: 'Póker MVP', icon: '🏆🎩🎩', xp: 200, tipo: 'field',
    check: (j, ctx) => (ctx?.pokerMVP || 0) >= 1 },
  { id: 'five_win_goals', label: '5 Goles en Victorias', icon: '⚽🏅', xp: 60, tipo: 'field',
    check: (j, ctx) => (ctx?.winGoals || 0) >= 5 },
  { id: 'ten_win_goals', label: '10 Goles en Victorias', icon: '⚽🏅🏅', xp: 120, tipo: 'field',
    check: (j, ctx) => (ctx?.winGoals || 0) >= 10 },

  // ==================== GOALKEEPER (25) ====================
  { id: 'first_clean', label: 'Valla Invicta', icon: '🧤', xp: 30, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) >= 1 },
  { id: 'five_clean', label: '5 Vallas Invictas', icon: '🧤🧤', xp: 90, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) >= 5 },
  { id: 'ten_clean', label: '10 Vallas Invictas', icon: '🧤🧤🧤', xp: 160, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) >= 10 },
  { id: 'twenty_clean', label: '20 Vallas Invictas', icon: '🧤🧤🧤🧤', xp: 260, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) >= 20 },
  { id: 'thirty_clean', label: '30 Vallas Invictas', icon: '🧤🧤🧤🧤🧤', xp: 380, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) >= 30 },
  { id: 'clean_debut', label: 'Debut Invicto', icon: '🧤✨', xp: 25, tipo: 'por',
    check: (j, ctx) => ctx?.vallaInvictaDebut === true },
  { id: 'clean_streak_3', label: '3 Vallas Consecutivas', icon: '🧤🧤🧤', xp: 80, tipo: 'por',
    check: (j, ctx) => ctx?.vallasConsecutivas3 === true },
  { id: 'clean_streak_5', label: '5 Vallas Consecutivas', icon: '🧤🧤🧤🧤🧤', xp: 140, tipo: 'por',
    check: (j, ctx) => (ctx?.maxCleanStreak || 0) >= 5 },
  { id: 'clean_streak_10', label: '10 Vallas Consecutivas', icon: '🔟🧤', xp: 280, tipo: 'por',
    check: (j, ctx) => (ctx?.maxCleanStreak || 0) >= 10 },
  { id: 'por_mvp', label: 'Portero MVP', icon: '🧤🏆', xp: 50, tipo: 'por',
    check: (j, ctx) => (j.mvps || 0) >= 1 },
  { id: 'penalty_hero', label: 'Héroe (5 MVPs)', icon: '🙌', xp: 120, tipo: 'por',
    check: (j, ctx) => (j.mvps || 0) >= 5 },
  { id: 'goalie_golden', label: 'Actuación Dorada (MVP + VI)', icon: '🧤🏆✨', xp: 60, tipo: 'por',
    check: (j, ctx) => (ctx?.cleanMVP || 0) >= 1 },
  { id: 'goalie_diamond', label: '5 Actuaciones Doradas', icon: '💎🧤', xp: 160, tipo: 'por',
    check: (j, ctx) => (ctx?.cleanMVP || 0) >= 5 },
  { id: 'goalie_goal', label: 'Portero Goleador', icon: '🧤⚽', xp: 100, tipo: 'por',
    check: (j, ctx) => (j.goles || 0) >= 1 },
  { id: 'iron_wall', label: 'Muro (-1 gol x partido)', icon: '🧱', xp: 100, tipo: 'por',
    check: (j, ctx) => (j.pj || 0) >= 3 && (ctx?.gcTotal || 0) / (j.pj || 1) < 1 },
  { id: 'iron_wall_05', label: 'Fortaleza (-0.5 gol x partido)', icon: '🏰', xp: 200, tipo: 'por',
    check: (j, ctx) => (j.pj || 0) >= 5 && (ctx?.gcTotal || 0) / (j.pj || 1) < 0.5 },
  { id: 'goalie_wall', label: 'VI > Goles Recibidos', icon: '🧤🧱', xp: 80, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) > (ctx?.gcTotal || 0) - (j.vallas_invictas || 0) },
  { id: 'lowest_ga', label: 'Menos Vencido del Torneo', icon: '🧤👑', xp: 100, tipo: 'por',
    check: (j, ctx) => ctx?.menosVencido === true },
  { id: 'goalie_five_wins', label: '5 Victorias', icon: '🧤🏅', xp: 60, tipo: 'por',
    check: (j, ctx) => (ctx?.wins || 0) >= 5 },
  { id: 'goalie_ten_wins', label: '10 Victorias', icon: '🧤🏅🏅', xp: 120, tipo: 'por',
    check: (j, ctx) => (ctx?.wins || 0) >= 10 },
  { id: 'goalie_prolific', label: 'Prolífico (VI + V ≥ 15)', icon: '🧤💪', xp: 80, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) + (ctx?.wins || 0) >= 15 },
  { id: 'goalie_super_prolific', label: 'Super Prolífico (VI + V ≥ 30)', icon: '🧤💪💪', xp: 180, tipo: 'por',
    check: (j, ctx) => (j.vallas_invictas || 0) + (ctx?.wins || 0) >= 30 },
  { id: 'goalie_mvp_plus', label: 'Portero MVP+ (MVPs ≥ 5)', icon: '🧤🏆🏆', xp: 100, tipo: 'por',
    check: (j, ctx) => (j.mvps || 0) >= 5 },
  { id: 'goalie_iron_5', label: '5 Partidos sin Recibir Gol', icon: '🧤0️⃣', xp: 60, tipo: 'por',
    check: (j, ctx) => (ctx?.gcTotal || 0) === 0 && (j.pj || 0) >= 5 },
];

function misionesParaPosicion(posicion) {
  if (posicion === 'POR') {
    return MISIONES.filter(m => m.tipo === 'general' || m.tipo === 'por');
  }
  return MISIONES.filter(m => m.tipo === 'general' || m.tipo === 'field');
}

const DEFAULT_AVATAR_MISSIONS = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%2330363d' width='150' height='150'/%3E%3Ctext fill='%238b949e' font-family='sans-serif' font-size='14' text-anchor='middle' x='75' y='85'%3ESin Foto%3C/text%3E%3C/svg%3E";

// --- FETCH EXTRA STATS ---

async function computeExtraStats(jugador, torneoId, preloaded) {
  if (!torneoId) return {};

  try {
    const resultados = preloaded?.resultados || await db.getResultados(torneoId);
    const fixture = preloaded?.fixture || await db.getFixture(torneoId);
    const resIds = resultados.length > 0 ? resultados.map(r => r.id) : [0];
    const allGolesResp = preloaded?.allGoles !== undefined
      ? { data: preloaded.allGoles }
      : await _supabase.from('goles').select('*').in('resultado_id', resIds);
    const allTarjetasResp = preloaded?.allTarjetas !== undefined
      ? { data: preloaded.allTarjetas }
      : await _supabase.from('tarjetas').select('*').in('resultado_id', resIds);
    const allGoles = allGolesResp?.data || [];
    const allTarjetas = allTarjetasResp?.data || [];
    const equipoIds = jugador.equipos || [];

    let vallasInvictas = 0;
    let hattricks = 0;
    let dobletes = 0;
    let pokers = 0;
    let rachaSinTarjeta3 = false;
    let vallaInvictaDebut = false;
    let vallasConsecutivas3 = false;
    let maxCleanStreak = 0;
    let rachaSinTarjetaMax = 0;
    let debutGoal = false;
    let matchesConGol = new Set();
    let goldenMatch = 0;
    let braceMVP = 0;
    let hattrickMVP = 0;
    let pokerMVP = 0;
    let gcTotal = 0;
    let cleanMVP = 0;

    const matchCards = {};
    for (const t of allTarjetas.filter(t => t.jugador_id === jugador.id)) {
      if (!matchCards[t.resultado_id]) matchCards[t.resultado_id] = { ama: 0, roj: 0 };
      if (t.tipo === 'R') matchCards[t.resultado_id].roj++;
      else matchCards[t.resultado_id].ama++;
    }

    const matchGoles = {};
    for (const g of allGoles.filter(g => g.jugador_id === jugador.id)) {
      matchGoles[g.resultado_id] = (matchGoles[g.resultado_id] || 0) + 1;
    }

    const matchEntries = [];
    for (const r of resultados) {
      const f = fixture.find(x => x.id === r.fixture_id);
      const golesEnMatch = matchGoles[r.id] || 0;
      const cards = matchCards[r.id] || { ama: 0, roj: 0 };
      const jugEsLocal = equipoIds.includes(r.equipo_local_id);
      const jugEsVisit = equipoIds.includes(r.equipo_visitante_id);

      if (jugEsLocal || jugEsVisit || golesEnMatch > 0 || cards.ama > 0 || cards.roj > 0) {
        matchEntries.push({
          resultado_id: r.id,
          goles: golesEnMatch,
          tarjetas: cards,
          golesRecibidos: jugEsLocal ? r.goles_visitante : jugEsVisit ? r.goles_local : null,
          fecha: f?.fecha || '',
          hora: f?.hora || '',
          esLocal: jugEsLocal,
          esVisit: jugEsVisit,
          ganaron: jugEsLocal ? r.goles_local > r.goles_visitante : jugEsVisit ? r.goles_visitante > r.goles_local : false,
          resultado: r,
        });
      }

      // Double/Poker/Hat trick counts
      if (golesEnMatch >= 4) pokers++;
      else if (golesEnMatch >= 3) hattricks++;
      else if (golesEnMatch >= 2) dobletes++;

      // Clean sheet & gc
      if (jugEsLocal || jugEsVisit) {
        const gRecibidos = jugEsLocal ? r.goles_visitante : r.goles_local;
        gcTotal += gRecibidos;
        if (gRecibidos === 0) vallasInvictas++;
      }

      // Goals in result
      if (golesEnMatch > 0) matchesConGol.add(r.id);

      // Combined achievements
      if (golesEnMatch >= 1 && r.mvp_id === jugador.id) goldenMatch++;
      if (golesEnMatch >= 2 && r.mvp_id === jugador.id) braceMVP++;
      if (golesEnMatch >= 3 && r.mvp_id === jugador.id) hattrickMVP++;
      if (golesEnMatch >= 4 && r.mvp_id === jugador.id) pokerMVP++;

      // Clean + MVP
      if (golesEnMatch === 0 && (jugEsLocal || jugEsVisit) &&
          (jugEsLocal ? r.goles_visitante : r.goles_local) === 0 && r.mvp_id === jugador.id) {
        cleanMVP++;
      }
    }

    matchEntries.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora || '').localeCompare(b.hora || ''));

    // Consecutive clean sheets
    let rachaClean = 0;
    for (const m of matchEntries) {
      if (m.golesRecibidos === 0) {
        rachaClean++;
        if (rachaClean >= 3) vallasConsecutivas3 = true;
        maxCleanStreak = Math.max(maxCleanStreak, rachaClean);
      } else {
        rachaClean = 0;
      }
    }

    if (matchEntries.length > 0 && matchEntries[0].golesRecibidos === 0) {
      vallaInvictaDebut = true;
    }

    // Debut goal
    if (matchEntries.length > 0 && matchEntries[0].goles > 0) {
      debutGoal = true;
    }

    // Consecutive matches without card
    let rachaSinCard = 0;
    for (const m of matchEntries) {
      if (m.tarjetas.ama === 0 && m.tarjetas.roj === 0) {
        rachaSinCard++;
        if (rachaSinCard >= 3) rachaSinTarjeta3 = true;
        rachaSinTarjetaMax = Math.max(rachaSinTarjetaMax, rachaSinCard);
      } else {
        rachaSinCard = 0;
      }
    }

    return {
      vallas_invictas: vallasInvictas,
      hattricks: Math.max(0, hattricks - pokers),
      dobletes: Math.max(0, dobletes - hattricks - pokers),
      pokers,
      rachaSinTarjeta3,
      vallaInvictaDebut,
      vallasConsecutivas3,
      maxCleanStreak,
      rachaSinTarjetaMax,
      debutGoal,
      matches_con_gol: matchesConGol.size,
      goldenMatch,
      braceMVP,
      hattrickMVP,
      pokerMVP,
      gcTotal,
      cleanMVP,
      matchEntries,
    };
  } catch {
    return {};
  }
}

async function computePlayerContext(jugador, torneoId, preloaded) {
  const ctx = { esCampeon: false, esGoleador: false, menosVencido: false, wins: 0, winGoals: 0, cleanWins: 0 };

  if (!torneoId) return ctx;

  try {
    const equipos = preloaded?.equipos || await db.getEquipos(torneoId);
    const jugadores = preloaded?.jugadores || await db.getJugadores(torneoId);
    const matchEntries = jugador.matchEntries || [];
    const equipoIds = jugador.equipos || [];

    // Champion
    if (equipos.length > 0 && equipoIds.length > 0) {
      const maxPts = Math.max(...equipos.filter(e => e.pj > 0).map(e => e.pts || 0));
      const championTeams = equipos.filter(e => (e.pts || 0) === maxPts && e.pj > 0);
      ctx.esCampeon = championTeams.some(ct => equipoIds.includes(ct.id));
    }

    // Top scorer
    if (jugadores.length > 0) {
      const maxGoles = Math.max(...jugadores.map(j => j.goles || 0));
      ctx.esGoleador = maxGoles > 0 && (jugador.goles || 0) === maxGoles;
    }

    // Lowest GA among POR
    if (jugador.posicion === 'POR') {
      const porJugadores = jugadores.filter(j => j.posicion === 'POR' && j.pj > 0);
      if (porJugadores.length > 0) {
        const ratios = porJugadores.map(j => ({ id: j.id, ratio: (j.gcTotal || 0) / j.pj }));
        const minRatio = Math.min(...ratios.map(x => x.ratio));
        ctx.menosVencido = ratios.find(x => x.id === jugador.id)?.ratio === minRatio;
      }
    }

    // Wins & winGoals
    for (const m of matchEntries) {
      if (m.ganaron) {
        ctx.wins++;
        if (m.goles > 0) ctx.winGoals++;
        if (m.golesRecibidos === 0) ctx.cleanWins++;
      }
    }

    return ctx;
  } catch {
    return ctx;
  }
}

function misionesCompletadas(j, posicion, ctx) {
  const lista = misionesParaPosicion(posicion);
  return lista.map(m => ({
    ...m,
    completada: m.check(j, ctx || {}),
  }));
}

function xpDeMisiones(j, posicion, ctx) {
  return misionesParaPosicion(posicion)
    .filter(m => m.check(j, ctx || {}))
    .reduce((sum, m) => sum + m.xp, 0);
}

async function computeMisionesForPlayer(jugadorId, torneoId) {
  const jugadores = await db.getJugadores(torneoId);
  const equipos = await db.getEquipos(torneoId);
  const resultados = await db.getResultados(torneoId);
  const fixture = await db.getFixture(torneoId);
  const resIds = resultados.length > 0 ? resultados.map(r => r.id) : [0];
  const [allGolesResp, allTarjetasResp] = await Promise.all([
    _supabase.from('goles').select('*').in('resultado_id', resIds),
    _supabase.from('tarjetas').select('*').in('resultado_id', resIds),
  ]);

  const j = jugadores.find(x => x.id === jugadorId);
  if (!j) return null;

  const preloaded = { equipos, jugadores, resultados, fixture, allGoles: allGolesResp?.data || [], allTarjetas: allTarjetasResp?.data || [] };
  const extra = await computeExtraStats(j, torneoId, preloaded);
  const enrichedJ = { ...j, ...extra };
  const ctx = await computePlayerContext(enrichedJ, torneoId, preloaded);

  const xp = calcularXP(enrichedJ);
  const nivel = calcularNivel(xp);
  const misiones = misionesCompletadas(enrichedJ, j.posicion, ctx);
  const completadas = misiones.filter(m => m.completada).length;
  const totalMisiones = misiones.length;

  return { jugador: enrichedJ, xp, nivel, misiones, completadas, totalMisiones, ctx };
}

// --- MISIONES PAGE ---

window.mostrarMisiones = async function() {
  const jugadores = await db.getJugadores(torneoActual);

  const user = (await _supabase.auth.getSession()).data?.session?.user;
  if (!user) return mostrarErrorUsuario('Inicia sesión primero');

  const { data: userData } = await _supabase.from('usuarios').select('*').eq('id', user.id).maybeSingle();
  const userEmail = userData?.email || user.email;

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

    const { jugador, xp, nivel, misiones, completadas, totalMisiones, ctx } = result;
    const sigXp = xpParaSiguienteNivel(nivel);
    const antXp = xpParaSiguienteNivel(nivel - 1);
    const progreso = Math.min(100, ((xp - antXp) / (sigXp - antXp)) * 100);
    const nivelColor = getNivelColor(nivel);
    const nivelLabel = getNivelLabel(nivel);
    const posLabel = jugador.posicion === 'POR' ? '🧤 Portero' : '⚽ Jugador de campo';

    const badges = [];
    if (ctx?.esCampeon) badges.push('<span style="background:#eab308;color:black;padding:2px 8px;border-radius:10px;font-size:0.65rem;font-weight:bold;">👑 CAMPEÓN</span>');
    if (ctx?.esGoleador) badges.push('<span style="background:#22c55e;color:black;padding:2px 8px;border-radius:10px;font-size:0.65rem;font-weight:bold;">⚽ GOLEADOR</span>');
    if (ctx?.menosVencido) badges.push('<span style="background:#3b82f6;color:white;padding:2px 8px;border-radius:10px;font-size:0.65rem;font-weight:bold;">🧤 MENOS VENCIDO</span>');

    cont.innerHTML = `
      <div style="text-align:center; margin-bottom:15px;">
        <img src="${jugador.foto || DEFAULT_AVATAR_MISSIONS}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${ctx?.esCampeon ? '#eab308' : nivelColor};margin-bottom:10px;">
        <h3 style="color:#eab308; margin:5px 0;">${escapeHtml(jugador.nombre)}</h3>
        <span style="color:#8b949e; font-size:0.85rem;">${posLabel}</span>
        ${badges.length > 0 ? '<div style="display:flex;justify-content:center;gap:6px;margin-top:6px;">' + badges.join('') + '</div>' : ''}
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
              <span style="font-size:1.1rem; width:24px; text-align:center;">${m.icon}</span>
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
