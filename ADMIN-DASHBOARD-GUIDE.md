# 📄 Guía del Dashboard de Administrador

## 🔍 Qué es el Dashboard

Es un **panel de control** donde el admin (tú) puedes:
- 📄 Ver todos los usuarios registrados
- ✅ Aprobar/Rechazar solicitudes
- 🔐 Asignar roles y permisos
- ❌ Eliminar usuarios
- 📈 Ver estadísticas de usuarios

---

## 📊 Estadísticas Principales

Al abrir el dashboard ves **4 números clave**:

```
[Total Usuarios] [Aprobados] [Pendientes] [Rechazados]
     25              18           5            2
```

---

## 📄 Tabla de Usuarios

### **Columnas:**

| Columna | Qué significa |
|---------|---------------|
| **Email** | Correo del usuario |
| **Nombre** | Nombre completo (si proporcionó) |
| **Rol** | Su permiso en la app (Usuario/Arbitro/Admin) |
| **Estado** | Aprobado/Pendiente/Rechazado |
| **Acciones** | Botón para eliminar |

---

## 🔠 Cómo Administrar Usuarios

### **1. Aprobar una Solicitud**

1. Busca el usuario en la tabla
2. En la columna **Estado**, selecciona **"Aprobado"**
3. Haz clic en actualizar
4. ✅ El usuario recibirá acceso

### **2. Asignar un Rol**

1. En la columna **Rol**, haz clic en el dropdown
2. Elige:
   - **Usuario** (solo ver)
   - **Arbitro** (cargar resultados)
   - **Admin** (control total)
3. Los cambios se guardan automáticamente

### **3. Rechazar a un Usuario**

1. En la columna **Estado**, selecciona **"Rechazado"**
2. El usuario NO podrá acceder
3. Puede intentar registrarse de nuevo

### **4. Eliminar Usuario**

1. Haz clic en el botón **"Eliminar"** rojo
2. Confirma la acción
3. ❌ El usuario se elimina completamente

---

## 🔑 Roles Explicados

### **📔 Usuario**
```
Permisos:
- Ver tablas de posiciones
- Ver goles y estadísticas
- Ver hall de la fama

NO puede:
- Crear equipos
- Cargar resultados
- Modificar datos
```

### **🔻 Árbitro**
```
Permisos:
- Todo lo de Usuario +
- Cargar resultados de partidos
- Asignar goles
- Poner tarjetas

NO puede:
- Crear torneos
- Gestionar usuarios
```

### **🔐 Admin**
```
Permisos:
- ACCESO TOTAL
- Crear torneos
- Gestionar usuarios
- Cargar resultados
- Exportar datos
- Eliminar información
```

---

## 📆 Flujo de Aprobación

```
1. Usuario se registra con Google
   │
   └── Estado: PENDIENTE
   │
2. Admin ve en Dashboard
   │
   └── Revisa email
   │
3. Admin elige:
   │
   ├─ Aprobar → Usuario puede entrar
   │
   ├─ Rechazar → Usuario bloqueado
   │
   └─ Asignar Rol → Usuario accede según permisos
```

---

## 🔍 Casos de Uso

### **Caso 1: Nuevo Arbitro se Registra**
1. Ves email del árbitro en "Pendientes"
2. Le cambias estado a "Aprobado"
3. Le asignas rol "Arbitro"
4. ✅ Puede cargar resultados

### **Caso 2: Amigo quiere Solo Ver Partidos**
1. Se registra
2. Lo apruebas
3. Le dejas rol "Usuario"
4. ✅ Solo ve, no modifica nada

### **Caso 3: Usuario Spam o Malintencionado**
1. Lo rechazas o eliminas
2. ❌ Bloqueado completamente

---

## 📈 Auditoría y Historial

Cada acción se registra:
- ✅ Quién aprobó
- ✅ Cuándo aprobó
- ✅ Qué rol asignó
- ✅ Cambios posteriores

Todo está guardado en Supabase para referencia futura.

---

## ⚠️ Tips de Seguridad

1. ✅ **Revisa emails antes de aprobar** - Verifica que sea alguien conocido
2. ✅ **No des Admin a desconocidos** - Solo personal de confianza
3. ✅ **Elimina usuarios inactivos** - Mantén la lista limpia
4. ✅ **Cambios a Arbitro para árbitros** - No Usuario
5. ✅ **Respaldos regulares** - Exporta datos cada mes

---

## 🌐 Acceder al Dashboard

```
https://tu-dominio/index-auth-google.html
── Login con tu email
── Ve a: 📄 USUARIOS
── ¡Comienza a administrar!
```

---

**¿Pregunta? Contacta al soporte de Supabase o revisa los logs** 📄