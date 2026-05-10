# 🔐 Guía de Autenticación con Google OAuth

## 🚀 Sistema Implementado

Ahora tu aplicación tiene **dos formas de autenticación**:

1. **Email + Contraseña** (Tradicional)
2. **Google OAuth** (Recomendado)

---

## 🔍 Cómo Funciona

### **Usuarios Nuevos:**

1. Entran a: `index-auth-google.html`
2. Eligen: **"Continuar con Google"**
3. Inician sesión con su cuenta Google
4. Supabase crea cuenta automáticamente
5. **Estado: PENDIENTE** (espera aprobación admin)
6. Admin aprueba/rechaza en el dashboard
7. Si es aprobado → Acceso completo

---

## 📄 Panel de Administración de Usuarios

### **Como Admin (tú):**

1. Entra a la app
2. En el menú verás: **📄 USUARIOS**
3. Accederás a:
   - **Lista de usuarios** registrados
   - **Aprobación/Rechazo** de cuentas
   - **Cambiar roles:**
     - 📔 Usuario (solo ver)
     - 🔻 Arbitro (cargar resultados)
     - 🔐 Admin (control total)
   - **Eliminar usuarios**

---

## 🎯 Roles de Usuario

### **🔐 Admin**
- Control total de la aplicación
- Gestionar usuarios
- Crear torneos
- Cargar resultados
- Ver estadísticas

### **🔻 Arbitro**
- Cargar resultados de partidos
- Asignar goles y tarjetas
- Ver estadísticas
- No puede crear torneos

### **📔 Usuario**
- Solo ver datos
- Acceso público
- Ver tablas y resultados
- Ver hall de la fama

---

## 📄 Estados de Cuenta

### **Pendiente** (⏳)
- Usuario registrado pero esperando aprobación
- No tiene acceso a la app
- Ve mensaje: "En espera de aprobación"

### **Aprobado** (✅)
- Admin aprobó la cuenta
- Acceso completo según su rol
- Puede usar la app

### **Rechazado** (❌)
- Admin rechazó la cuenta
- No tiene acceso
- Puede intentar registrarse de nuevo

---

## 🔁 Flujo Completo

```
┌───────────────────────┐
│      USUARIO NUEVO             │
│     (Se Registra)               │
└───────────────────────┘
                  │
                  ┃
              └─Google OAuth─┐
              │              │
              │   Confirmación │
              │   Automática   │
              └──────────┘
                  │
                  ┃ Estado: PENDIENTE
                  │
┌───────────────────────┐
│   ADMIN REVISA EN DASHBOARD   │
│     (Panel de Usuarios)        │
└───────────────────────┘
           │           │
          ┅         ┅
       Aprueba    Rechaza
           │           │
           ┃           ┃
      ✔ ACCESO    ❌ BLOQUEADO
```

---

## 🔠 Información de Cuenta Guardada

Automáticamente se guarda en Supabase:
- ✅ Email
- ✅ Nombre completo
- ✅ Foto de perfil
- ✅ Fecha de registro
- ✅ Fecha de aprobación
- ✅ Quién aprobó

---

## 🚰 Seguridad

✅ **Google OAuth Encriptado**
- Supabase maneja la seguridad
- Contraseñas encriptadas
- Tokens seguros

✅ **Acceso Controlado**
- Solo usuarios aprobados pueden entrar
- Roles definidos por admin
- Datos privados protegidos

✅ **Auditoría**
- Se registra quién aprobó cada usuario
- Fecha de aprobación guardada
- Historial disponible

---

## 🌐 URLs Principales

```
🔐 ADMIN CON GOOGLE:
https://tu-dominio/index-auth-google.html

📔 ESPECTADOR (Sin Login):
https://tu-dominio/public-mejorado.html

📄 DASHBOARD (Solo Admin):
https://tu-dominio/index-v2.html?admin=true
```

---

## 🚀 Cómo Empezar

### **Para Nuevos Usuarios:**
1. Abre `index-auth-google.html`
2. Haz clic "Continuar con Google"
3. Confirma tu cuenta Google
4. Espera aprobación del admin

### **Para Admin:**
1. Entra con tu cuenta (bolso2340@gmail.com)
2. Ve a **📄 USUARIOS**
3. Aprueba/Rechaza solicitudes
4. Asigna roles

---

**Preguntas? Revisa los logs de Supabase para más detalles** 📄