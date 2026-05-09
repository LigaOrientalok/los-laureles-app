// Dashboard de Administración de Usuarios

async function mostrarPanelAdmin() {
  // Recargar página con la app completa
  location.href = 'index-v2.html?admin=true';
}

// Panel de gestión de usuarios
async function mostrarDashboardUsuarios() {
  if (!usuarioData || usuarioData.rol !== 'admin') {
    alert('No tienes permisos para acceder aqui');
    return;
  }

  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('fecha_registro', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  let html = `
    <div style="max-width:1200px; margin:0 auto; padding:20px;">
      <h2 style="color:#eab308; margin-bottom:20px;">📄 Gestión de Usuarios</h2>
      
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:15px; margin-bottom:30px;">
        <div class="box" style="text-align:center;">
          <h3 style="color:#3b82f6; font-size:1.5rem;">${usuarios.length}</h3>
          <p style="color:#b0bcc4; margin:0;">Total de Usuarios</p>
        </div>
        <div class="box" style="text-align:center;">
          <h3 style="color:#22c55e; font-size:1.5rem;">${usuarios.filter(u => u.estado === 'aprobado').length}</h3>
          <p style="color:#b0bcc4; margin:0;">Aprobados</p>
        </div>
        <div class="box" style="text-align:center;">
          <h3 style="color:#f97316; font-size:1.5rem;">${usuarios.filter(u => u.estado === 'pendiente').length}</h3>
          <p style="color:#b0bcc4; margin:0;">Pendientes</p>
        </div>
      </div>
      
      <div class="box" style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#30363d;">
              <th style="padding:12px; text-align:left; color:#eab308;">Email</th>
              <th style="padding:12px; text-align:left; color:#eab308;">Nombre</th>
              <th style="padding:12px; text-align:center; color:#eab308;">Rol</th>
              <th style="padding:12px; text-align:center; color:#eab308;">Estado</th>
              <th style="padding:12px; text-align:center; color:#eab308;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map(u => `
              <tr style="border-bottom:1px solid #30363d;">
                <td style="padding:12px;">${u.email}</td>
                <td style="padding:12px;">${u.nombre || '-'}</td>
                <td style="padding:12px; text-align:center;">
                  <select onchange="cambiarRol('${u.id}', this.value)" style="padding:6px; background:#0d1117; color:white; border:1px solid #30363d; border-radius:4px;">
                    <option value="usuario" ${u.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                    <option value="arbitro" ${u.rol === 'arbitro' ? 'selected' : ''}>Arbitro</option>
                    <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Admin</option>
                  </select>
                </td>
                <td style="padding:12px; text-align:center;">
                  <select onchange="cambiarEstado('${u.id}', this.value)" style="padding:6px; background:#0d1117; color:white; border:1px solid #30363d; border-radius:4px;">
                    <option value="pendiente" ${u.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="aprobado" ${u.estado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
                    <option value="rechazado" ${u.estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                  </select>
                </td>
                <td style="padding:12px; text-align:center;">
                  <button onclick="eliminarUsuario('${u.id}', '${u.email}')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return html;
}

// Cambiar rol de usuario
async function cambiarRol(usuarioId, nuevoRol) {
  const { error } = await supabase
    .from('usuarios')
    .update({ rol: nuevoRol })
    .eq('id', usuarioId);
  
  if (error) {
    alert('Error al cambiar rol');
  } else {
    alert('✅ Rol actualizado');
    mostrarDashboardUsuarios();
  }
}

// Cambiar estado de usuario
async function cambiarEstado(usuarioId, nuevoEstado) {
  const actualizacion = {
    estado: nuevoEstado,
    fecha_aprobacion: nuevoEstado === 'aprobado' ? new Date().toISOString() : null,
    aprobado_por: usuarioActual?.id
  };

  const { error } = await supabase
    .from('usuarios')
    .update(actualizacion)
    .eq('id', usuarioId);
  
  if (error) {
    alert('Error al cambiar estado');
  } else {
    alert('✅ Estado actualizado');
    mostrarDashboardUsuarios();
  }
}

// Eliminar usuario
async function eliminarUsuario(usuarioId, email) {
  if (!confirm(`¿Eliminar usuario ${email}?`)) return;

  // Eliminar de tabla usuarios (la tabla auth.users se elimina automáticamente por CASCADE)
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', usuarioId);
  
  if (error) {
    alert('Error al eliminar usuario');
  } else {
    alert('✅ Usuario eliminado');
    mostrarDashboardUsuarios();
  }
}

// Agregar boton de usuarios en el header
function agregarBotonUsuarios() {
  if (usuarioData?.rol === 'admin') {
    const nav = document.querySelector('.nav-main');
    if (nav) {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.innerHTML = '📄 USUARIOS';
      btn.onclick = async () => {
        const html = await mostrarDashboardUsuarios();
        if (html) {
          const mainContent = document.querySelector('main');
          if (mainContent) {
            mainContent.innerHTML = html;
          }
        }
      };
      nav.appendChild(btn);
    }
  }
}