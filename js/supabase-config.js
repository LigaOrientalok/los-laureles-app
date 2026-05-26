// Configuración Supabase
const SUPABASE_URL = 'https://cmbajolccgeoosdvwcxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtYmFqb2xjY2dlb29zZHZ3Y3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTE4NjYsImV4cCI6MjA5Mzg2Nzg2Nn0.QJ65XTUZ6HU4RVcs7NhbY9d06gnewljGN6Cw42A24-Q';

// Cliente Supabase
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Notificaciones para el usuario
function mostrarToast(mensaje, tipo) {
  const existing = document.getElementById('toast-notif');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast-notif';
  const bgColor = tipo === 'success' ? '#22c55e' : tipo === 'warning' ? '#f97316' : '#ef4444';
  toast.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:${bgColor};color:white;padding:16px 24px;border-radius:8px;font-family:sans-serif;font-size:0.9rem;box-shadow:0 8px 30px rgba(0,0,0,0.5);max-width:400px;animation:slideIn 0.3s ease;`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 5000);
}
function mostrarErrorUsuario(mensaje) {
  const isSuccess = mensaje.includes('✅') || mensaje.includes('🗑️') || mensaje.toLowerCase().includes('correcto') || mensaje.toLowerCase().includes('guardado');
  mostrarToast(mensaje, isSuccess ? 'success' : 'error');
}

// Debounce helper
function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
const debouncedUpdatePreview = debounce(() => {
  if (typeof updatePreview === 'function') updatePreview();
}, 300);

// Loading state helper
async function conLoading(btnSelector, textoAlternativo, fn) {
  const btn = typeof btnSelector === 'string' ? document.querySelector(btnSelector) : btnSelector;
  if (!btn) return fn();
  const original = btn.textContent || btn.innerText;
  const disabled = btn.disabled;
  btn.disabled = true;
  btn.textContent = textoAlternativo || '⏳ Procesando...';
  try {
    return await fn();
  } finally {
    btn.disabled = disabled;
    btn.textContent = original;
  }
}

// Server-side permission guards (defense-in-depth, RLS is the real protection)
async function soloAdmin() {
  const user = (await _supabase.auth.getUser()).data?.user;
  if (!user) throw new Error('No autenticado');
  const { data } = await _supabase.from('usuarios').select('rol').eq('id', user.id).maybeSingle();
  if (data?.rol !== 'admin') throw new Error('Acceso denegado: se requiere admin');
}

// Sanitize image src — only allow data URIs and http/https URLs
function sanitizarImgSrc(src) {
  if (!src) return '';
  if (src.startsWith('data:image/')) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return '';
}

// Funciones de utilidad
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const db = {
  _handleError(context, error) {
    if (error) {
      console.error(context, error);
      mostrarErrorUsuario(`Error: ${error.message || 'Error de conexión con Supabase'}`);
    }
    return error;
  },

  async getTorneos() {
    const { data, error } = await _supabase.from('torneos').select('*');
    this._handleError('Error fetching torneos:', error);
    return data || [];
  },

  async getTorneo(id) {
    const { data, error } = await _supabase.from('torneos').select('*').eq('id', id).single();
    this._handleError('Error fetching torneo:', error);
    return data;
  },

  async createTorneo(nombre, descripcion) {
    const { data, error } = await _supabase.from('torneos').insert([{ nombre, descripcion }]).select();
    this._handleError('Error creating torneo:', error);
    return data?.[0];
  },

  async updateTorneo(id, updates) {
    const { data, error } = await _supabase.from('torneos').update(updates).eq('id', id).select();
    this._handleError('Error updating torneo:', error);
    return data?.[0];
  },

  async deleteTorneo(id) {
    const { data: eqs } = await _supabase.from('equipos').select('id').eq('torneo_id', id);
    const eqIds = eqs?.map(e => e.id) || [0];
    await this._deleteAllResultsByEquipos(eqIds);
    await _supabase.from('jugador_equipo').delete().in('equipo_id', eqIds);
    await _supabase.from('equipos').delete().eq('torneo_id', id);
    const { error } = await _supabase.from('torneos').delete().eq('id', id);
    this._handleError('Error deleting torneo:', error);
  },

  async _deleteAllResultsByEquipos(equipoIds) {
    const { data: res } = await _supabase.from('resultados').select('id').in('equipo_local_id', equipoIds);
    const resIds = res?.map(r => r.id) || [0];
    await _supabase.from('goles').delete().in('resultado_id', resIds);
    await _supabase.from('tarjetas').delete().in('resultado_id', resIds);
    await _supabase.from('resultados').delete().in('id', resIds);
    await _supabase.from('fixture').delete().in('equipo_local_id', equipoIds);
  },

  async getEquipos(torneoId) {
    const { data, error } = await _supabase.from('equipos').select('*').eq('torneo_id', torneoId);
    this._handleError('Error fetching equipos:', error);
    if (data) data.forEach(e => { e.logo = sanitizarImgSrc(e.logo); });
    return data || [];
  },

  async createEquipo(torneoId, nombre, dia, logo) {
    const { data, error } = await _supabase.from('equipos').insert([{ torneo_id: torneoId, nombre, dia_semana: dia, logo }]).select();
    this._handleError('Error creating equipo:', error);
    return data?.[0];
  },

  async updateEquipo(id, updates) {
    const { data, error } = await _supabase.from('equipos').update(updates).eq('id', id).select();
    this._handleError('Error updating equipo:', error);
    return data?.[0];
  },

  async deleteEquipo(id) {
    await this._deleteAllResultsByEquipos([id]);
    await _supabase.from('jugador_equipo').delete().eq('equipo_id', id);
    const { error } = await _supabase.from('equipos').delete().eq('id', id);
    this._handleError('Error deleting equipo:', error);
  },

  async getJugadores(torneoId) {
    const { data: jugadores, error } = await _supabase.from('jugadores').select('*').eq('torneo_id', torneoId);
    if (error) { this._handleError('Error fetching jugadores:', error); return []; }
    // Only fetch vinculaciones for equipos in this torneo
    const { data: equipos } = await _supabase.from('equipos').select('id').eq('torneo_id', torneoId);
    const equipoIds = equipos?.map(e => e.id) || [];
    if (equipoIds.length > 0) {
      const { data: vinculos } = await _supabase.from('jugador_equipo').select('*').in('equipo_id', equipoIds);
      if (vinculos) {
        jugadores.forEach(j => {
          j.equipos = vinculos.filter(v => v.jugador_id === j.id).map(v => v.equipo_id);
        });
      }
    }
    if (jugadores) jugadores.forEach(j => { j.foto = sanitizarImgSrc(j.foto); });
    return jugadores;
  },

  async createJugador(torneoId, ci, nombre, posicion, pierna, foto) {
    const { data, error } = await _supabase.from('jugadores').insert([{ torneo_id: torneoId, ci, nombre, posicion, pierna, foto }]).select();
    this._handleError('Error creating jugador:', error);
    return data?.[0];
  },

  async updateJugador(id, updates) {
    const { data, error } = await _supabase.from('jugadores').update(updates).eq('id', id).select();
    this._handleError('Error updating jugador:', error);
    return data?.[0];
  },

  async deleteJugador(id) {
    await _supabase.from('jugador_equipo').delete().eq('jugador_id', id);
    const { error } = await _supabase.from('jugadores').delete().eq('id', id);
    this._handleError('Error deleting jugador:', error);
  },

  async vincularJugadorEquipo(jugadorId, equipoId) {
    const { data, error } = await _supabase.from('jugador_equipo').insert([{ jugador_id: jugadorId, equipo_id: equipoId }]).select();
    this._handleError('Error vinculando jugador:', error);
    return data?.[0];
  },

  async getEquiposJugador(jugadorId) {
    const { data, error } = await _supabase.from('jugador_equipo').select('equipo_id').eq('jugador_id', jugadorId);
    this._handleError('Error fetching equipos del jugador:', error);
    return data?.map(e => e.equipo_id) || [];
  },

  async getFixture(torneoId) {
    const { data, error } = await _supabase.from('fixture').select('*').eq('torneo_id', torneoId);
    this._handleError('Error fetching fixture:', error);
    return data || [];
  },

  async createFixture(torneoId, dia, fecha, hora, localId, visitanteId) {
    const { data, error } = await _supabase.from('fixture').insert([{ torneo_id: torneoId, dia_semana: dia, fecha, hora, equipo_local_id: localId, equipo_visitante_id: visitanteId }]).select();
    this._handleError('Error creating fixture:', error);
    return data?.[0];
  },

  async deleteFixture(id) {
    const { error } = await _supabase.from('fixture').delete().eq('id', id);
    this._handleError('Error deleting fixture:', error);
  },

  async createResultado(torneoId, fixtureId, localId, visitanteId, golesLocal, golesVisitante, mvpId) {
    const { data, error } = await _supabase.from('resultados').insert([{
      torneo_id: torneoId,
      fixture_id: fixtureId,
      equipo_local_id: localId,
      equipo_visitante_id: visitanteId,
      goles_local: golesLocal,
      goles_visitante: golesVisitante,
      mvp_id: mvpId,
      estado: 'finalizado'
    }]).select();
    this._handleError('Error creating resultado:', error);
    return data?.[0];
  },

  async getResultados(torneoId) {
    const { data, error } = await _supabase.from('resultados').select('*').eq('torneo_id', torneoId);
    this._handleError('Error fetching resultados:', error);
    return data || [];
  },

  async createGol(resultadoId, jugadorId, equipoId, minuto) {
    const { data, error } = await _supabase.from('goles').insert([{ resultado_id: resultadoId, jugador_id: jugadorId, equipo_id: equipoId, minuto }]).select();
    this._handleError('Error creating gol:', error);
    return data?.[0];
  },

  async getGoles(resultadoId) {
    const { data, error } = await _supabase.from('goles').select('*').eq('resultado_id', resultadoId);
    this._handleError('Error fetching goles:', error);
    return data || [];
  },

  async updateResultado(id, updates) {
    const { data, error } = await _supabase.from('resultados').update(updates).eq('id', id).select();
    this._handleError('Error updating resultado:', error);
    return data?.[0];
  },

  async deleteResultado(id) {
    const { error } = await _supabase.from('resultados').delete().eq('id', id);
    this._handleError('Error deleting resultado:', error);
  },

  async deleteGolesByResultado(resultadoId) {
    const { error } = await _supabase.from('goles').delete().eq('resultado_id', resultadoId);
    this._handleError('Error deleting goles:', error);
  },

  async deleteTarjetasByResultado(resultadoId) {
    const { error } = await _supabase.from('tarjetas').delete().eq('resultado_id', resultadoId);
    this._handleError('Error deleting tarjetas:', error);
  },

  async createTarjeta(resultadoId, jugadorId, equipoId, tipo, minuto) {
    const { data, error } = await _supabase.from('tarjetas').insert([{ resultado_id: resultadoId, jugador_id: jugadorId, equipo_id: equipoId, tipo, minuto }]).select();
    this._handleError('Error creating tarjeta:', error);
    return data?.[0];
  },

  async getTarjetas(resultadoId) {
    const { data, error } = await _supabase.from('tarjetas').select('*').eq('resultado_id', resultadoId);
    this._handleError('Error fetching tarjetas:', error);
    return data || [];
  }
};
