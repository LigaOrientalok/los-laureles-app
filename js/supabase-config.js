// Configuración Supabase
const SUPABASE_URL = 'https://cmbajolccgeoosdvwcxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtYmFqb2xjY2dlb29zZHZ3Y3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTE4NjYsImV4cCI6MjA5Mzg2Nzg2Nn0.QJ65XTUZ6HU4RVcs7NhbY9d06gnewljGN6Cw42A24-Q';

// Cliente Supabase
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funciones de utilidad
const db = {
  async getTorneos() {
    const { data, error } = await _supabase.from('torneos').select('*');
    if (error) console.error('Error fetching torneos:', error);
    return data || [];
  },

  async getTorneo(id) {
    const { data, error } = await _supabase.from('torneos').select('*').eq('id', id).single();
    if (error) console.error('Error fetching torneo:', error);
    return data;
  },

  async createTorneo(nombre, descripcion) {
    const { data, error } = await _supabase.from('torneos').insert([{ nombre, descripcion }]).select();
    if (error) console.error('Error creating torneo:', error);
    return data?.[0];
  },

  async getEquipos(torneoId) {
    const { data, error } = await _supabase.from('equipos').select('*').eq('torneo_id', torneoId);
    if (error) console.error('Error fetching equipos:', error);
    return data || [];
  },

  async createEquipo(torneoId, nombre, dia, logo) {
    const { data, error } = await _supabase.from('equipos').insert([{ torneo_id: torneoId, nombre, dia_semana: dia, logo }]).select();
    if (error) console.error('Error creating equipo:', error);
    return data?.[0];
  },

  async updateEquipo(id, updates) {
    const { data, error } = await _supabase.from('equipos').update(updates).eq('id', id).select();
    if (error) console.error('Error updating equipo:', error);
    return data?.[0];
  },

  async deleteEquipo(id) {
    const { error } = await _supabase.from('equipos').delete().eq('id', id);
    if (error) console.error('Error deleting equipo:', error);
  },

  async getJugadores(torneoId) {
    const { data, error } = await _supabase.from('jugadores').select('*').eq('torneo_id', torneoId);
    if (error) console.error('Error fetching jugadores:', error);
    return data || [];
  },

  async createJugador(torneoId, ci, nombre, posicion, pierna, foto) {
    const { data, error } = await _supabase.from('jugadores').insert([{ torneo_id: torneoId, ci, nombre, posicion, pierna, foto }]).select();
    if (error) console.error('Error creating jugador:', error);
    return data?.[0];
  },

  async updateJugador(id, updates) {
    const { data, error } = await _supabase.from('jugadores').update(updates).eq('id', id).select();
    if (error) console.error('Error updating jugador:', error);
    return data?.[0];
  },

  async deleteJugador(id) {
    const { error } = await _supabase.from('jugadores').delete().eq('id', id);
    if (error) console.error('Error deleting jugador:', error);
  },

  async vincularJugadorEquipo(jugadorId, equipoId) {
    const { data, error } = await _supabase.from('jugador_equipo').insert([{ jugador_id: jugadorId, equipo_id: equipoId }]).select();
    if (error) console.error('Error vinculando jugador:', error);
    return data?.[0];
  },

  async getEquiposJugador(jugadorId) {
    const { data, error } = await _supabase.from('jugador_equipo').select('equipo_id').eq('jugador_id', jugadorId);
    if (error) console.error('Error fetching equipos del jugador:', error);
    return data?.map(e => e.equipo_id) || [];
  },

  async getFixture(torneoId) {
    const { data, error } = await _supabase.from('fixture').select('*').eq('torneo_id', torneoId);
    if (error) console.error('Error fetching fixture:', error);
    return data || [];
  },

  async createFixture(torneoId, dia, fecha, hora, localId, visitanteId) {
    const { data, error } = await _supabase.from('fixture').insert([{ torneo_id: torneoId, dia_semana: dia, fecha, hora, equipo_local_id: localId, equipo_visitante_id: visitanteId }]).select();
    if (error) console.error('Error creating fixture:', error);
    return data?.[0];
  },

  async deleteFixture(id) {
    const { error } = await _supabase.from('fixture').delete().eq('id', id);
    if (error) console.error('Error deleting fixture:', error);
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
    if (error) console.error('Error creating resultado:', error);
    return data?.[0];
  },

  async getResultados(torneoId) {
    const { data, error } = await _supabase.from('resultados').select('*').eq('torneo_id', torneoId);
    if (error) console.error('Error fetching resultados:', error);
    return data || [];
  },

  async createGol(resultadoId, jugadorId, equipoId, minuto) {
    const { data, error } = await _supabase.from('goles').insert([{ resultado_id: resultadoId, jugador_id: jugadorId, equipo_id: equipoId, minuto }]).select();
    if (error) console.error('Error creating gol:', error);
    return data?.[0];
  },

  async getGoles(resultadoId) {
    const { data, error } = await _supabase.from('goles').select('*').eq('resultado_id', resultadoId);
    if (error) console.error('Error fetching goles:', error);
    return data || [];
  },

  async createTarjeta(resultadoId, jugadorId, equipoId, tipo, minuto) {
    const { data, error } = await _supabase.from('tarjetas').insert([{ resultado_id: resultadoId, jugador_id: jugadorId, equipo_id: equipoId, tipo, minuto }]).select();
    if (error) console.error('Error creating tarjeta:', error);
    return data?.[0];
  },

  async getTarjetas(resultadoId) {
    const { data, error } = await _supabase.from('tarjetas').select('*').eq('resultado_id', resultadoId);
    if (error) console.error('Error fetching tarjetas:', error);
    return data || [];
  }
};
