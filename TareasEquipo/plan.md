# TareasEquipo — Documento de Planeación

## 1. Descripción

Aplicación web SPA para que un Jefe de Proyecto asigne tareas a su equipo, organizadas por proyectos, con seguimiento de avance mediante dashboard y Kanban. Desarrollada con HTML5, CSS3 vanilla y JavaScript. Datos persistidos en localStorage.

## 2. Estructura del proyecto

```
/TareasEquipo/
  index.html          # Shell SPA
  plan.md             # Documento de planeación
  css/
    reset.css         # Normalización de estilos
    variables.css     # CSS custom properties
    layout.css        # Header, tabs, dashboard grid, kanban
    components.css    # Botones, cards, formularios, modales
    responsive.css    # Media queries, dark mode, print
  js/
    app.js            # Inicialización, navegación, eventos globales
    store.js          # Capa de persistencia (localStorage)
    models.js         # Fábricas de datos y valores por defecto
    dashboard.js      # Dashboard con progreso por proyecto
    kanban.js         # Kanban por proyecto con drag & drop y navegación
    taskForm.js       # CRUD de tareas (modal)
    config.js         # CRUD de proyectos y miembros
    utils.js          # Utilidades: UUID, formato fechas
```

## 3. Modelo de datos

### Proyecto (`localStorage.proyectos`)
```json
{
  "id": "uuid",
  "nombre": "string",
  "descripcion": "string",
  "fechaCreacion": "ISO 8601"
}
```

### Miembro (`localStorage.miembros`)
```json
{
  "id": "uuid",
  "nombre": "string",
  "rol": "string",
  "fechaCreacion": "ISO 8601"
}
```

### Tarea (`localStorage.tareas`)
```json
{
  "id": "uuid",
  "titulo": "string (max 150)",
  "descripcion": "string (max 500)",
  "idProyecto": "uuid",
  "idMiembro": "uuid",
  "estado": "pendiente | en-progreso | completado",
  "prioridad": "baja | media | alta | critica",
  "fechaInicio": "YYYY-MM-DD",
  "fechaLimite": "YYYY-MM-DD",
  "fechaCreacion": "ISO 8601",
  "fechaActualizacion": "ISO 8601"
}
```

## 4. Funcionalidades (Historias de Usuario)

| ID | Historia |
|----|----------|
| HU01 | Como jefe, quiero crear proyectos con nombre y descripción |
| HU02 | Como jefe, quiero registrar miembros del equipo con nombre y rol |
| HU03 | Como jefe, quiero crear/editar tareas con título, descripción, fechas, prioridad, asignadas a un miembro en un proyecto |
| HU04 | Como jefe, quiero eliminar tareas |
| HU05 | Como jefe, quiero ver el dashboard con progreso (completadas/total) de cada proyecto |
| HU06 | Como jefe, quiero navegar entre proyectos con flechas ◀ ▶ y ver Kanban por proyecto |
| HU07 | Como jefe, quiero mover tareas entre columnas con drag & drop o botones |
| HU08 | Como jefe, quiero gestionar proyectos y miembros (CRUD) |
| HU09 | Los datos persisten al recargar la página |
| HU10 | Interfaz responsive adaptable a cualquier dispositivo |

## 5. Prioridades

| Prioridad | Color | Badge |
|-----------|-------|-------|
| Crítica | `#e74c3c` | 🔴 |
| Alta | `#e67e22` | 🟠 |
| Media | `#f1c40f` | 🟡 |
| Baja | `#27ae60` | 🟢 |

## 6. Vistas

- **Dashboard**: Cards resumen (proyectos, tareas, miembros) + grid de proyectos con barra de progreso y conteo de tareas por estado
- **Kanban**: Selector de proyecto con flechas ◀ ▶ + 3 columnas (Pendiente, En Progreso, Completado) con drag & drop
- **Configuración**: Modal con tabs para CRUD de proyectos y miembros

## 7. Diseño UI

- Paleta: Header `#2c3e50`, fondo `#f0f2f5`, accent `#3498db`
- Dashboard: Cards con barra de progreso HTML nativa
- Kanban: Columnas con cabeceras de colores, tarjetas con borde izquierdo según prioridad
- Responsive: 3 columnas en desktop, apilado en móvil
- Dark mode: Soporte automático
