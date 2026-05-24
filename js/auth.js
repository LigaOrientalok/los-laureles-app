// Sistema de Autenticación con Email

let usuarioActual = null;

// Inicializar autenticación
async function inicializarAuth() {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    usuarioActual = session?.user || null;
    
    if (usuarioActual) {
      let userData;
      try {
        const { data } = await _supabase.from('usuarios').select('rol').eq('email', usuarioActual.email).maybeSingle();
        userData = data;
      } catch(e) { userData = null; }
      if (!userData) {
        await _supabase.from('usuarios').upsert({
          id: usuarioActual.id, email: usuarioActual.email, rol: 'usuario', estado: 'pendiente', fecha_registro: new Date().toISOString()
        });
        userData = { rol: 'usuario' };
      }
      window.esAdmin = (userData?.rol === 'admin');
      window.usuarioData = userData;
      mostrarPanelAdmin();
    } else {
      mostrarPanelLogin();
    }
  } catch (e) {
    console.error('Error en auth:', e);
    const app = document.getElementById('app');
    if (app) app.innerHTML = `
      <div style="min-height:100vh; display:flex; justify-content:center; align-items:center; background:#0b0e14; color:white; font-family:sans-serif;">
        <div style="text-align:center; padding:20px;">
          <div style="font-size:3rem; margin-bottom:20px;">⚠️</div>
          <h2 style="color:#ef4444; margin-bottom:10px;">Error de autenticación</h2>
          <p style="color:#b0bcc4;">${e.message}</p>
          <button onclick="location.reload()" style="margin-top:20px; padding:12px 30px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-size:1rem;">Reintentar</button>
        </div>
      </div>
    `;
  }
}

// Mostrar panel de login
function mostrarPanelLogin() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div style="min-height:100vh; background:#0b0e14; display:flex; justify-content:center; align-items:center; padding:20px;">
      <div style="background:#161b22; border:2px solid #eab308; border-radius:12px; padding:40px; width:100%; max-width:400px; box-shadow:0 15px 50px rgba(0,0,0,0.8);">
        <h1 style="text-align:center; color:#eab308; margin-bottom:30px;">🔐 LIGA ORIENTAL</h1>
        
        <div id="formLogin">
          <h2 style="color:#ffffff; text-align:center; font-size:1.3rem; margin-bottom:30px;">Iniciar Sesión</h2>
          
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:5px; font-size:0.8rem; text-transform:uppercase;">Email:</label>
          <input type="email" id="loginEmail" placeholder="tu@email.com" style="width:100%; padding:12px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:15px; box-sizing:border-box;">
          
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:5px; font-size:0.8rem; text-transform:uppercase;">Contraseña:</label>
          <input type="password" id="loginPassword" placeholder="Contraseña segura" style="width:100%; padding:12px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:20px; box-sizing:border-box;">
          
          <button onclick="loginUsuario(this)" style="width:100%; padding:14px; background:#eab308; color:black; font-weight:900; border:none; border-radius:6px; cursor:pointer; font-size:1rem; text-transform:uppercase; margin-bottom:10px;">Iniciar Sesión</button>
          
          <p style="text-align:center; margin:10px 0;">
            <a href="#" onclick="resetPassword(); return false;" style="color:#3b82f6; font-size:0.85rem; text-decoration:none;">¿Olvidaste tu contraseña?</a>
          </p>
          
          <button onclick="mostrarFormRegistro()" style="width:100%; padding:14px; background:#3b82f6; color:white; font-weight:900; border:none; border-radius:6px; cursor:pointer; font-size:1rem; text-transform:uppercase;">Crear Nueva Cuenta</button>
        </div>
        
        <div id="formRegistro" style="display:none;">
          <h2 style="color:#ffffff; text-align:center; font-size:1.3rem; margin-bottom:30px;">Registro</h2>
          
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:5px; font-size:0.8rem; text-transform:uppercase;">Email:</label>
          <input type="email" id="regEmail" placeholder="tu@email.com" style="width:100%; padding:12px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:15px; box-sizing:border-box;">
          
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:5px; font-size:0.8rem; text-transform:uppercase;">Contraseña:</label>
          <input type="password" id="regPassword" placeholder="Mínimo 6 caracteres" style="width:100%; padding:12px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:15px; box-sizing:border-box;">
          
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:5px; font-size:0.8rem; text-transform:uppercase;">Confirmar Contraseña:</label>
          <input type="password" id="regPassword2" placeholder="Repite tu contraseña" style="width:100%; padding:12px; border-radius:6px; border:1px solid #30363d; background:#0d1117; color:white; margin-bottom:20px; box-sizing:border-box;">
          
          <button onclick="registrarUsuario(this)" style="width:100%; padding:14px; background:#22c55e; color:white; font-weight:900; border:none; border-radius:6px; cursor:pointer; font-size:1rem; text-transform:uppercase; margin-bottom:10px;">Registrarse</button>
          
          <button onclick="mostrarFormLogin()" style="width:100%; padding:14px; background:#30363d; color:white; font-weight:900; border:none; border-radius:6px; cursor:pointer; font-size:1rem; text-transform:uppercase;">Volver</button>
        </div>
        
        <div id="mensajeError" style="display:none; margin-top:15px; padding:12px; background:#ef4444; color:white; border-radius:6px; text-align:center;"></div>
      </div>
    </div>
  `;
}

// Cambiar a formulario de registro
function mostrarFormRegistro() {
  document.getElementById('formLogin').style.display = 'none';
  document.getElementById('formRegistro').style.display = 'block';
  document.getElementById('mensajeError').style.display = 'none';
}

// Cambiar a formulario de login
function mostrarFormLogin() {
  document.getElementById('formRegistro').style.display = 'none';
  document.getElementById('formLogin').style.display = 'block';
  document.getElementById('mensajeError').style.display = 'none';
}

// Registrar usuario
async function registrarUsuario(btn) {
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;
  const errorDiv = document.getElementById('mensajeError');
  
  if (!email || !password || !password2) {
    mostrarError('Todos los campos son requeridos');
    return;
  }
  
  if (password.length < 6) {
    mostrarError('La contraseña debe tener mínimo 6 caracteres');
    return;
  }
  
  if (password !== password2) {
    mostrarError('Las contraseñas no coinciden');
    return;
  }
  
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrando...'; }
  try {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      mostrarError(error.message);
      return;
    }
    
    if (data?.user) {
      await _supabase.from('usuarios').upsert({
        id: data.user.id, email: data.user.email, rol: 'usuario', estado: 'pendiente', fecha_registro: new Date().toISOString()
      });
    }
    
    mostrarError('✅ Cuenta creada. Revisa tu email para confirmar. Luego inicia sesión.');
    setTimeout(() => mostrarFormLogin(), 2000);
  } catch (e) {
    mostrarError('Error al registrar: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Registrarse'; }
  }
}

// Iniciar sesión
async function loginUsuario(btn) {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('mensajeError');
  
  if (!email || !password) {
    mostrarError('Email y contraseña requeridos');
    return;
  }
  
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Ingresando...'; }
  try {
    const { data, error } = await _supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      mostrarError('Email o contraseña incorrectos');
    } else {
      usuarioActual = data.user;
      await _supabase.from('usuarios').upsert({
        id: data.user.id, email: data.user.email, rol: 'usuario', estado: 'pendiente', fecha_registro: new Date().toISOString()
      });
      mostrarErrorUsuario('✅ ¡Bienvenido!');
      setTimeout(() => location.reload(), 1500);
    }
  } catch (e) {
    mostrarError('Error al iniciar sesión: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Iniciar Sesión'; }
  }
}

// Reset password
async function resetPassword() {
  const email = document.getElementById('loginEmail')?.value.trim();
  if (!email) {
    mostrarError('Ingresá tu email primero');
    return;
  }
  const { error } = await _supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) {
    mostrarError('Error: ' + error.message);
  } else {
    mostrarError('📧 Revisá tu email para restablecer la contraseña');
  }
}

// Cerrar sesión
async function logoutUsuario() {
  const { error } = await _supabase.auth.signOut();
  if (error) {
    mostrarErrorUsuario('Error al cerrar sesión');
  } else {
    usuarioActual = null;
    location.reload();
  }
}

// Mostrar error
function mostrarError(mensaje) {
  const errorDiv = document.getElementById('mensajeError');
  if (!errorDiv) return;
  errorDiv.textContent = mensaje;
  errorDiv.style.display = 'block';
}

// Mostrar panel admin (la aplicación completa)
function mostrarPanelAdmin() {
  if (typeof mostrarApp === "function") {
    mostrarApp();
  }
}