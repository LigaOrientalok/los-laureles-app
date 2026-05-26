// Dashboard de Administración de Usuarios

async function mostrarPanelAdmin() {
  const adminBtn = document.querySelector('.nav-btn.admin-btn') || document.querySelector('[onclick*="admin"]');
  if (adminBtn) {
    adminBtn.click();
  }
}

async function mostrarGestionUsuarios() {
  try { await soloAdmin(); } catch (e) { return mostrarErrorUsuario(e.message); }

  const cont = document.getElementById('admin-content');
  if (!cont) return;
  cont.innerHTML = '<p style="color:#b0bcc4;">Cargando usuarios...</p>';

  try {
    const { data: usuarios, error } = await _supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) {
      cont.innerHTML = '<p style="color:#ef4444;">Error: ' + error.message + '</p>';
      return;
    }

    const statsHtml = `
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:15px;">
        <div class="box" style="text-align:center; padding:10px;">
          <h3 style="color:#3b82f6; font-size:1.3rem; margin:0;">${usuarios.length}</h3>
          <p style="color:#b0bcc4; margin:5px 0 0; font-size:0.8rem;">Total</p>
        </div>
        <div class="box" style="text-align:center; padding:10px;">
          <h3 style="color:#22c55e; font-size:1.3rem; margin:0;">${usuarios.filter(u => u.estado === 'aprobado').length}</h3>
          <p style="color:#b0bcc4; margin:5px 0 0; font-size:0.8rem;">Aprobados</p>
        </div>
        <div class="box" style="text-align:center; padding:10px;">
          <h3 style="color:#f97316; font-size:1.3rem; margin:0;">${usuarios.filter(u => u.estado === 'pendiente').length}</h3>
          <p style="color:#b0bcc4; margin:5px 0 0; font-size:0.8rem;">Pendientes</p>
        </div>
      </div>`;

    cont.innerHTML = statsHtml + `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <thead><tr style="background:#30363d;">
            <th style="padding:8px; color:#eab308; text-align:left;">Email</th>
            <th style="padding:8px; color:#eab308; text-align:center;">Rol</th>
            <th style="padding:8px; color:#eab308; text-align:center;">Estado</th>
            <th style="padding:8px; color:#eab308; text-align:center;">Acciones</th>
          </tr></thead>
          <tbody>${usuarios.map(u => `
            <tr style="border-bottom:1px solid #30363d;">
              <td style="padding:8px;">${escapeHtml(u.email)}</td>
              <td style="padding:8px; text-align:center;">
                <select onchange="cambiarRol('${u.id}', this.value)" style="padding:4px; background:#0d1117; color:white; border:1px solid #30363d; border-radius:4px; font-size:0.8rem;">
                  <option value="usuario" ${u.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                  <option value="arbitro" ${u.rol === 'arbitro' ? 'selected' : ''}>Árbitro</option>
                  <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
              </td>
              <td style="padding:8px; text-align:center;">
                <select onchange="cambiarEstado('${u.id}', this.value)" style="padding:4px; background:#0d1117; color:white; border:1px solid #30363d; border-radius:4px; font-size:0.8rem;">
                  <option value="pendiente" ${u.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="aprobado" ${u.estado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
                  <option value="rechazado" ${u.estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                </select>
              </td>
              <td style="padding:8px; text-align:center;">
                <button onclick="eliminarUsuario(this.dataset.uid, this.dataset.uemail)" data-uid="${u.id}" data-uemail="${escapeHtml(u.email)}" style="background:#ef4444; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Eliminar</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } catch (e) {
    cont.innerHTML = '<p style="color:#ef4444;">Error de conexión</p>';
  }
}

// Cambiar rol de usuario
async function cambiarRol(usuarioId, nuevoRol) {
  try { await soloAdmin(); } catch (e) { return mostrarErrorUsuario(e.message); }
  const { error } = await _supabase
    .from('usuarios')
    .update({ rol: nuevoRol })
    .eq('id', usuarioId);
  
  if (error) {
    mostrarErrorUsuario('Error al cambiar rol');
  } else {
    mostrarErrorUsuario('✅ Rol actualizado');
    mostrarGestionUsuarios();
  }
}

// Cambiar estado de usuario
async function cambiarEstado(usuarioId, nuevoEstado) {
  try { await soloAdmin(); } catch (e) { return mostrarErrorUsuario(e.message); }
  const actualizacion = {
    estado: nuevoEstado,
    fecha_aprobacion: nuevoEstado === 'aprobado' ? new Date().toISOString() : null,
    aprobado_por: usuarioActual?.id
  };

  const { error } = await _supabase
    .from('usuarios')
    .update(actualizacion)
    .eq('id', usuarioId);
  
  if (error) {
    mostrarErrorUsuario('Error al cambiar estado');
  } else {
    mostrarErrorUsuario('✅ Estado actualizado');
    mostrarGestionUsuarios();
  }
}

// Eliminar usuario (también de auth.users vía RPC)
async function eliminarUsuario(usuarioId, email) {
  try { await soloAdmin(); } catch (e) { return mostrarErrorUsuario(e.message); }
  if (!confirm(`¿Eliminar usuario ${email}?`)) return;

  const { error } = await _supabase.rpc('eliminar_usuario_auth', { user_id: usuarioId });
  
  if (error) {
    mostrarErrorUsuario('Error al eliminar usuario: ' + error.message);
  } else {
    mostrarErrorUsuario('✅ Usuario eliminado (auth + público)');
    mostrarGestionUsuarios();
  }
}