// Sistema de Autenticación con Google OAuth + Email

let usuarioActual = null;
let usuarioData = null;

// Inicializar autenticación
async function inicializarAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  usuarioActual = session?.user || null;
  
  if (usuarioActual) {
    // Obtener datos del usuario
    const { data, error } = await _supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuarioActual.id)
      .single();
    
    usuarioData = data;
    window.esAdmin = (usuarioData?.rol === 'admin');
    
    // Si está aprobado o es admin
    if (usuarioData?.estado === 'aprobado' || usuarioData?.rol === 'admin') {
      window.location.href = 'index-v2.html';
    } else {
      mostrarPanelEnEspera();
    }
  } else {
    mostrarPanelLogin();
  }
}

// Panel de Login mejorado
function mostrarPanelLogin() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div style="min-height:100vh; background:linear-gradient(135deg, #0b0e14 0%, #161b22 100%); display:flex; justify-content:center; align-items:center; padding:20px;">
      <div style="background:#161b22; border:2px solid #eab308; border-radius:16px; padding:50px 40px; width:100%; max-width:450px; box-shadow:0 20px 60px rgba(0,0,0,0.9);">
        <h1 style="text-align:center; color:#eab308; margin-bottom:10px; font-size:2rem;">🔐</h1>
        <h2 style="text-align:center; color:#ffffff; margin-bottom:30px; font-size:1.8rem;">LIGA ORIENTAL</h2>
        <p style="text-align:center; color:#b0bcc4; margin-bottom:40px; font-size:0.95rem;">Acceso a tu cuenta</p>
        
        <div id="formLogin">
          <div style="margin-bottom:20px;">
            <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:8px; font-size:0.85rem; text-transform:uppercase;">Email:</label>
            <input type="email" id="loginEmail" placeholder="tu@email.com" style="width:100%; padding:12px; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:white; box-sizing:border-box; font-size:1rem;">
          </div>
          
          <div style="margin-bottom:25px;">
            <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:8px; font-size:0.85rem; text-transform:uppercase;">Contraseña:</label>
            <input type="password" id="loginPassword" placeholder="Contraseña segura" style="width:100%; padding:12px; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:white; box-sizing:border-box; font-size:1rem;">
          </div>
          
          <button onclick="loginUsuario()" style="width:100%; padding:14px; background:#eab308; color:black; font-weight:900; border:none; border-radius:8px; cursor:pointer; font-size:1rem; text-transform:uppercase; margin-bottom:15px; transition:0.3s;" onmouseover="this.style.background='#d4a403'" onmouseout="this.style.background='#eab308'">Iniciar Sesión</button>
          
          <p style="text-align:center; margin-top:-5px;">
            <a href="#" onclick="resetPassword(); return false;" style="color:#3b82f6; font-size:0.85rem; text-decoration:none;">¿Olvidaste tu contraseña?</a>
          </p>
        </div>
        
        <div style="text-align:center; margin:25px 0;">
          <div style="display:flex; align-items:center; margin-bottom:20px;">
            <div style="flex:1; height:1px; background:#30363d;"></div>
            <span style="padding:0 15px; color:#b0bcc4; font-size:0.9rem;">O</span>
            <div style="flex:1; height:1px; background:#30363d;"></div>
          </div>
          
          <button onclick="loginConGoogle()" style="width:100%; padding:14px; background:white; color:black; font-weight:bold; border:none; border-radius:8px; cursor:pointer; font-size:1rem; display:flex; justify-content:center; align-items:center; gap:10px; transition:0.3s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>
        </div>
        
        <button onclick="mostrarFormRegistro()" style="width:100%; padding:14px; background:#3b82f6; color:white; font-weight:900; border:none; border-radius:8px; cursor:pointer; font-size:0.95rem; text-transform:uppercase; transition:0.3s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Crear Nueva Cuenta</button>
        
        <div id="mensajeError" style="display:none; margin-top:15px; padding:12px; background:#ef4444; color:white; border-radius:6px; text-align:center; font-size:0.9rem;"></div>
      </div>
    </div>
  `;
}

// Formulario de registro
function mostrarFormRegistro() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div style="min-height:100vh; background:linear-gradient(135deg, #0b0e14 0%, #161b22 100%); display:flex; justify-content:center; align-items:center; padding:20px;">
      <div style="background:#161b22; border:2px solid #22c55e; border-radius:16px; padding:50px 40px; width:100%; max-width:450px; box-shadow:0 20px 60px rgba(0,0,0,0.9);">
        <h2 style="text-align:center; color:#22c55e; margin-bottom:30px; font-size:1.6rem;">Crear Cuenta</h2>
        
        <div style="margin-bottom:20px;">
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:8px; font-size:0.85rem; text-transform:uppercase;">Email:</label>
          <input type="email" id="regEmail" placeholder="tu@email.com" style="width:100%; padding:12px; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:white; box-sizing:border-box;">
        </div>
        
        <div style="margin-bottom:20px;">
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:8px; font-size:0.85rem; text-transform:uppercase;">Contraseña:</label>
          <input type="password" id="regPassword" placeholder="Mínimo 6 caracteres" style="width:100%; padding:12px; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:white; box-sizing:border-box;">
        </div>
        
        <div style="margin-bottom:25px;">
          <label style="color:#eab308; font-weight:bold; display:block; margin-bottom:8px; font-size:0.85rem; text-transform:uppercase;">Confirmar Contraseña:</label>
          <input type="password" id="regPassword2" placeholder="Repite tu contraseña" style="width:100%; padding:12px; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:white; box-sizing:border-box;">
        </div>
        
        <button onclick="registrarUsuario()" style="width:100%; padding:14px; background:#22c55e; color:white; font-weight:900; border:none; border-radius:8px; cursor:pointer; font-size:1rem; text-transform:uppercase; margin-bottom:10px;" onmouseover="this.style.background='#16a34a'" onmouseout="this.style.background='#22c55e'">Registrarse</button>
        
        <button onclick="inicializarAuth()" style="width:100%; padding:14px; background:#30363d; color:white; font-weight:900; border:none; border-radius:8px; cursor:pointer; font-size:1rem; text-transform:uppercase;" onmouseover="this.style.background='#3d444d'" onmouseout="this.style.background='#30363d'">Volver</button>
        
        <div id="mensajeErrorReg" style="display:none; margin-top:15px; padding:12px; background:#ef4444; color:white; border-radius:6px; text-align:center;"></div>
      </div>
    </div>
  `;
}

// Registrar con email
async function registrarUsuario() {
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;
  
  if (!email || !password || !password2) {
    mostrarErrorReg('Todos los campos son requeridos');
    return;
  }
  
  if (password.length < 6) {
    mostrarErrorReg('La contraseña debe tener mínimo 6 caracteres');
    return;
  }
  
  if (password !== password2) {
    mostrarErrorReg('Las contraseñas no coinciden');
    return;
  }
  
  try {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      mostrarErrorReg(error.message);
    } else {
      mostrarErrorReg('✅ Cuenta creada. Revisa tu email para confirmar.');
      setTimeout(() => {
        inicializarAuth();
      }, 2000);
    }
  } catch (e) {
    mostrarErrorReg('Error: ' + e.message);
  }
}

// Login con email
async function loginUsuario() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    mostrarError('Email y contraseña requeridos');
    return;
  }
  
  try {
    const { data, error } = await _supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      mostrarError('Email o contraseña incorrectos');
    } else {
      usuarioActual = data.user;
      inicializarAuth();
    }
  } catch (e) {
    mostrarError('Error: ' + e.message);
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
    redirectTo: window.location.href
  });
  if (error) {
    mostrarError('Error: ' + error.message);
  } else {
    mostrarError('📧 Revisá tu email para restablecer la contraseña');
  }
}

// Login con Google
async function loginConGoogle() {
  try {
    const { data, error } = await _supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href
      }
    });
    
    if (error) {
      mostrarError('Error al conectar con Google');
    }
  } catch (e) {
    mostrarError('Error: ' + e.message);
  }
}

// Panel de espera de aprobación
function mostrarPanelEnEspera() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div style="min-height:100vh; background:linear-gradient(135deg, #0b0e14 0%, #161b22 100%); display:flex; justify-content:center; align-items:center; padding:20px;">
      <div style="background:#161b22; border:2px solid #f97316; border-radius:16px; padding:50px 40px; width:100%; max-width:500px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.9);">
        <h1 style="color:#f97316; margin-bottom:20px; font-size:3rem;">⏳</h1>
        <h2 style="color:#ffffff; margin-bottom:15px;">Acceso Pendiente</h2>
        <p style="color:#b0bcc4; font-size:1rem; margin-bottom:20px;">
Tu cuenta está en espera de aprobación del administrador.
        </p>
        <p style="color:#b0bcc4; font-size:0.95rem; margin-bottom:30px;">
Email: <strong style="color:#eab308;">${usuarioActual?.email}</strong>
        </p>
        <p style="color:#a0aab4; font-size:0.9rem; margin-bottom:30px;">
Recibirás un email cuando tu cuenta sea aprobada.
        </p>
        <button onclick="logoutUsuario()" style="padding:14px 30px; background:#ef4444; color:white; font-weight:900; border:none; border-radius:8px; cursor:pointer; font-size:1rem; text-transform:uppercase;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">← Cerrar Sesión</button>
      </div>
    </div>
  `;
}

// Cerrar sesión
async function logoutUsuario() {
  const { error } = await _supabase.auth.signOut();
  if (!error) {
    usuarioActual = null;
    usuarioData = null;
    inicializarAuth();
  }
}

// Mostrar error
function mostrarError(mensaje) {
  const errorDiv = document.getElementById('mensajeError');
  if (!errorDiv) return;
  errorDiv.textContent = mensaje;
  errorDiv.style.display = 'block';
}

function mostrarErrorReg(mensaje) {
  const errorDiv = document.getElementById('mensajeErrorReg');
  if (!errorDiv) return;
  errorDiv.textContent = mensaje;
  errorDiv.style.display = 'block';
}

// Inicializar
document.addEventListener('DOMContentLoaded', inicializarAuth);