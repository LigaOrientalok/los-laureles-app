# Liga Oriental - Los Laureles App

**Aplicación Web para Gestión de Liga de Fútbol**

## 📋 Descripción

Liga Oriental es una aplicación web completa para gestionar ligas de fútbol amateur, permitiendo:

- 📝 Registro y gestión de jugadores
- ⚽ Creación de equipos
- 📅 Generación automática de fixtures/calendarios
- 📊 Carga de resultados y estadísticas
- 🏆 Rankings de goleadores y mejores jugadores
- 🎖️ Hall de la fama
- 💾 Almacenamiento local de datos

## 🚀 Características Principales

### 1. Registro de Jugadores
- Ingreso de cédula de identidad
- Datos personales (nombre, posición, pierna)
- Asignación a equipos
- Carga de foto de perfil
- Vista previa con estadísticas en tiempo real

### 2. Gestión de Equipos
- Crear nuevos equipos
- Asignar días de juego
- Cargar logo del equipo
- Tablillas de posiciones por día

### 3. Sistema de Fixtures
- Generación automática de calendario
- Configuración de horarios
- Gestión de duración de partidos
- Visualización clara de enfrentamientos

### 4. Carga de Resultados
- Ingreso de goles con asignación a jugadores
- Sistema de tarjetas (amarillas y rojas)
- Selección de MVP
- Actualización automática de estadísticas

### 5. Estadísticas
- Top goleadores
- Vallas invictas por equipo
- Ratings dinámicos de jugadores
- Histórico de desempeño

### 6. Hall de la Fama
- Ranking de jugadores por MVPs
- Cartas EA Sports estilo
- Estadísticas destacadas

## 🛠️ Tecnología Utilizada

- **HTML5**: Estructura
- **CSS3**: Diseño responsivo con variables CSS
- **JavaScript Vanilla**: Lógica de negocio
- **LocalStorage**: Persistencia de datos
- **Canvas**: Compresión de imágenes

## 📱 Responsive Design

- Adaptado para desktop
- Interfaz móvil amigable
- Menú de navegación flexible
- Tablas escalables

## 💾 Almacenamiento

Todos los datos se guardan localmente en el navegador mediante `localStorage` con la clave `LIGA_2026`.

**Estructura de datos:**
```json
{
  "equipos": [{ nombre, dia, logo, estadísticas }],
  "jugadores": [{ id, ci, nombre, posición, equipos, estadísticas }],
  "fixture": [{ dia, fecha, hora, local, visitante }]
}
```

## 🎨 Diseño

- Tema oscuro profesional
- Colores principales: Amarillo (#eab308) y Gris
- Animaciones suaves
- Interfaz intuitiva

## 📸 Características de Interfaz

- Cartas de jugador estilo EA Sports
- Podios interactivos
- Tablas de posiciones
- Grillas de estadísticas
- Fichas de jugadores

## 🔐 Panel Administrativo

Acceso a funciones avanzadas:
- Crear equipos y jugadores
- Cargar resultados
- Generar fixtures
- Gestionar y eliminar datos
- Búsqueda avanzada de jugadores

## 📝 Notas de Desarrollo

- Las imágenes se comprimen automáticamente al cargarlas
- El rating se calcula dinámicamente según desempeño
- Los datos persisten en sesiones
- Validación de datos completos antes de guardar

## 📄 Licencia

Desarrollado para Liga Oriental 2026

---

**Desarrollado con ❤️ para los amantes del fútbol**