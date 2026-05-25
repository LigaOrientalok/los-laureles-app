// =====================================================================
// SISTEMA DE MISIONES, XP Y NIVELES
// =====================================================================

// XP thresholds per level
const XP_PER_LEVEL = 80;

function calcularXP(j) {
  let xp = 0;
  xp += (j.goles || 0) * 10;
  xp += (j.pj || 0) * 5;
  xp += (j.mvps || 0) * 25;
  xp += Math.max(0, (j.goles || 0) - (j.pj || 0)) * 5; // hat trick bonus
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

const MISIONES = [
  { id: 'first_goal', label: 'Primer Gol', icon: '⚽', check: j => (j.goles || 0) >= 1, xp: 20 },
  { id: 'five_goals', label: '5 Goles', icon: '⚽⚽', check: j => (j.goles || 0) >= 5, xp: 50 },
  { id: 'ten_goals', label: '10 Goles', icon: '⚽⚽⚽', check: j => (j.goles || 0) >= 10, xp: 100 },
  { id: 'first_match', label: 'Primer Partido', icon: '📋', check: j => (j.pj || 0) >= 1, xp: 10 },
  { id: 'ten_matches', label: '10 Partidos', icon: '📋📋', check: j => (j.pj || 0) >= 10, xp: 40 },
  { id: 'twenty_matches', label: '20 Partidos', icon: '📋📋📋', check: j => (j.pj || 0) >= 20, xp: 80 },
  { id: 'first_mvp', label: 'Primer MVP', icon: '🏆', check: j => (j.mvps || 0) >= 1, xp: 30 },
  { id: 'five_mvps', label: '5 MVPs', icon: '🏆🏆', check: j => (j.mvps || 0) >= 5, xp: 80 },
  { id: 'hat_trick', label: 'Hat Trick', icon: '🎩', check: j => (j.goles || 0) >= 3, xp: 60 },
  { id: 'legend', label: 'Leyenda', icon: '👑', check: j => calcularNivel(calcularXP(j)) >= 10, xp: 200 },
];

function misionesCompletadas(j) {
  const xp = calcularXP(j);
  const nivel = calcularNivel(xp);
  return MISIONES.map(m => ({
    ...m,
    completada: m.check(j),
  }));
}

function xpDeMisiones(j) {
  return MISIONES.filter(m => m.check(j)).reduce((sum, m) => sum + m.xp, 0);
}
