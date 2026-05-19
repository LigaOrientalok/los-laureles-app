# Liga Oriental - Guía de Autenticación

## 🔐 Sistema de Autenticación Implementado

La aplicación ahora cuenta con un sistema seguro de autenticación basado en **Supabase Authentication**.

---

## 🚀 Cómo Usar

### **1. Abre la aplicación autenticada:**
```
https://tu-repositorio/index-auth.html
```

### **2. Primera vez - Crear Cuenta:**

1. Haz clic en **"Crear Nueva Cuenta"**
2. Ingresa tu **email** (ej: bolso2340@gmail.com)
3. Crea una **contraseña** (mínimo 6 caracteres)
4. Confirma la contraseña
5. Haz clic en **"Registrarse"**

✅ **Revisa tu email** - Supabase te enviará un link de confirmación

### **3. Confirmar Email:**

1. Abre el email que recibiste de Supabase
2. Haz clic en **"Confirm your email"** o similar
3. Vuelve a la aplicación

### **4. Iniciar Sesión:**

1. Usa tu **email** y **contraseña**
2. ¡Acceso a la aplicación completa!

---

## 🎯 Tipos de Acceso

### **👤 ADMIN (Tú - Protegido)**
```
URL: index-auth.html
Requiere: Email + Contraseña
Acceso: TOTAL (crear, editar, eliminar, exportar)
Permitidos: Solo usuarios autenticados
```

### **👥 ESPECTADORES (Público - Sin Protección)**

**Opción 1 - Interfaz Administrativa (Sin login):**
```
URL: index-v2.html
Requiere: NADA
Acceso: Total (pero sin protección)
```

**Opción 2 - Panel Público (Recomendado):**
```
URL: public.html
Requiere: NADA
Acceso: Solo lectura (tablas, gráficos, jugadores)
Protección: Los datos se actualizan cada 30 segundos
```

---

## 🔒 Características de Seguridad

✅ **Autenticación Supabase**
- Email verificado requerido
- Contraseña encriptada
- Recuperación por email
- Sesión persistente

✅ **Acceso Controlado**
- Solo admin puede modificar datos
- Espectadores solo ven información
- Cierre de sesión disponible
- Tokens seguros

✅ **Datos Seguros**
- Base de datos en la nube (Supabase)
- Respaldos automáticos
- Conexión HTTPS encriptada
- Row Level Security (RLS) activado

---

## 📱 Comparativa de Interfaces

| Aspecto | Admin (Auth) | Admin (V2) | Público |
|--------|-----------|-----------|----------|
| **URL** | index-auth.html | index-v2.html | public.html |
| **Login** | ✅ Requerido | ❌ No | ❌ No |
| **Crear** | ✅ Sí | ✅ Sí | ❌ No |
| **Editar** | ✅ Sí | ✅ Sí | ❌ No |
| **Ver** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Gráficos** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Exportar** | ✅ Sí | ✅ Sí | ❌ No |

---

## 🔑 Gestión de Cuenta

### **Cambiar Contraseña**

1. Inicia sesión en la aplicación
2. Ve a tu email de registro
3. En Supabase: Account → Change Password
4. Supabase te enviará un email de recuperación

### **Recuperar Acceso**

Si olvidas tu contraseña:
1. En el login de index-auth.html
2. Busca opción "¿Olvidaste tu contraseña?" (próxima versión)
3. Supabase te enviará un email de recuperación
4. Crea una nueva contraseña

### **Múltiples Administradores**

¿Otros usuarios necesitan acceso admin?
1. Pueden registrarse con sus propios emails
2. Verifican su email
3. Acceden a la app
4. (Próximamente) Control de permisos por usuario

---

## 🌐 Configuración en Supabase

### **Verificación de Email Habilitada:**
```
Supabase Dashboard → Authentication → Providers → Email
✅ Confirm email (habilitado)
✅ Require email verification (habilitado)
```

### **Políticas de Seguridad (RLS):**
```
Base de Datos → Tables
Row Level Security (RLS) → ENABLED
- Lectura: Pública para espectadores
- Escritura: Solo usuarios autenticados
- Admin: Control total
```

---

## 💡 Tips de Seguridad

1. ✅ Usa una **contraseña fuerte**
   - Mínimo 8 caracteres
   - Números, letras mayúsculas/minúsculas, símbolos
   - No uses datos personales

2. ✅ **No compartas tu contraseña**
   - Ni siquiera con otros admins
   - Cada uno crea su propia cuenta

3. ✅ **Guarda tu email de recuperación**
   - Supabase lo enviará ahí
   - Úsalo solo en emergencias

4. ✅ **Haz respaldos periódicos**
   - Usa el botón "Respaldo" en admin
   - Descarga JSON regularmente

5. ✅ **Cierra sesión en dispositivos públicos**
   - Botón rojo "Cerrar Sesión" en header
   - No dejes la sesión activa

---

## 🐛 Solucionar Problemas

### **"Email no confirmado"**
```
✓ Revisa la bandeja de entrada (spam también)
✓ Haz clic en el link de confirmación
✓ Espera 5 minutos e intenta de nuevo
✓ Solicita reenvío de email (próximamente)
```

### **"Contraseña incorrecta"**
```
✓ Verifica mayúsculas/minúsculas (es case-sensitive)
✓ Revisa que no tengas Caps Lock activo
✓ Usa "Recuperar contraseña" si la olvidaste
```

### **"No recibo el email de confirmación"**
```
✓ Revisa carpeta de SPAM
✓ Agrega noreply@supabase.io a contactos
✓ Aguarda 5-10 minutos
✓ Intenta registrarte con otro email
✓ Revisa la conexión a internet
```

### **"No puedo iniciar sesión"**
```
✓ Confirma que tu email está verificado
✓ Verifica que tu cuenta existe
✓ Intenta con email en minúsculas
✓ Limpia cache del navegador (Ctrl+Shift+Del)
✓ Intenta en navegador privado
```

---

## 📊 Archivos del Sistema

**Autenticación:**
- `js/auth.js` - Lógica de login/registro
- `index-auth.html` - App protegida

**Público:**
- `public.html` - Panel para espectadores
- `index-v2.html` - Admin sin login

**Datos:**
- `js/supabase-config.js` - Configuración BD
- `js/tournaments.js` - Gestión de torneos
- `js/stats.js` - Gráficos y estadísticas
- `js/export.js` - Exportación de datos

---

## ✅ Checklist de Uso

- ✅ Crear cuenta con tu email
- ✅ Confirmar email desde Supabase
- ✅ Iniciar sesión en index-auth.html
- ✅ Crear primer torneo
- ✅ Agregar equipos
- ✅ Registrar jugadores
- ✅ Generar fixture
- ✅ Cargar resultados
- ✅ Ver gráficos y estadísticas
- ✅ Exportar datos
- ✅ Compartir URL pública (public.html)
- ✅ Cerrar sesión cuando termines

---

**¿Necesitas ayuda?** 📧
Contacta al soporte o revisa la documentación técnica en el repositorio.

**Desarrollado con seguridad 🔐 para Liga Oriental 2026**