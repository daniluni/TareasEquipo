const Models = {
  PRESET_MIEMBROS: [
    { nombre: 'Sofía Muñoz', rol: 'Diseñadora' },
    { nombre: 'Benjamín Soto', rol: 'Backend' },
    { nombre: 'Valentina Rojas', rol: 'Product Owner' },
    { nombre: 'Mateo González', rol: 'Frontend' },
    { nombre: 'Isabella Pérez', rol: 'QA' },
    { nombre: 'Sebastián López', rol: 'DevOps' },
  ],

  PRESET_PROYECTOS: [
    { nombre: 'Rediseño Web', descripcion: 'Migración del sitio corporativo a nueva plataforma' },
    { nombre: 'App Móvil', descripcion: 'Desarrollo de aplicación móvil para clientes' },
  ],

  PRESET_TAREAS: [
    { titulo: 'Diseñar prototipo landing page', descripcion: 'Figma con header, hero, features', idProyectoIdx: 0, idMiembroIdx: 0, estado: 'completado', prioridad: 'alta', fechaInicio: '2026-06-01', fechaLimite: '2026-06-10' },
    { titulo: 'Implementar API REST', descripcion: 'Endpoints de usuarios y productos', idProyectoIdx: 0, idMiembroIdx: 1, estado: 'en-progreso', prioridad: 'alta', fechaInicio: '2026-06-05', fechaLimite: '2026-06-20' },
    { titulo: 'Maquetar componentes UI', descripcion: 'Header, cards, formularios responsive', idProyectoIdx: 0, idMiembroIdx: 3, estado: 'pendiente', prioridad: 'media', fechaInicio: '2026-06-15', fechaLimite: '2026-06-25' },
    { titulo: 'Planificar sprint 1', descripcion: 'Reunión de planificación con el equipo', idProyectoIdx: 0, idMiembroIdx: 2, estado: 'completado', prioridad: 'media', fechaInicio: '2026-06-01', fechaLimite: '2026-06-02' },
    { titulo: 'Diseñar onboarding app', descripcion: 'Pantallas de registro y tutorial inicial', idProyectoIdx: 1, idMiembroIdx: 0, estado: 'completado', prioridad: 'alta', fechaInicio: '2026-06-03', fechaLimite: '2026-06-12' },
    { titulo: 'Configurar CI/CD', descripcion: 'GitHub Actions + deploy automático', idProyectoIdx: 1, idMiembroIdx: 5, estado: 'en-progreso', prioridad: 'alta', fechaInicio: '2026-06-05', fechaLimite: '2026-06-18' },
    { titulo: 'Escribir tests unitarios', descripcion: 'Cobertura mínima 80% módulo auth', idProyectoIdx: 1, idMiembroIdx: 4, estado: 'pendiente', prioridad: 'media', fechaInicio: '2026-06-15', fechaLimite: '2026-06-28' },
    { titulo: 'Documentar API', descripcion: 'Swagger/OpenAPI para desarrolladores externos', idProyectoIdx: 1, idMiembroIdx: 1, estado: 'pendiente', prioridad: 'baja', fechaInicio: '2026-06-20', fechaLimite: '2026-06-30' },
  ],

  initDefaults() {
    if (!Store.get('miembros')) {
      Store.set('miembros', this.PRESET_MIEMBROS.map((m) => this.crearMiembro(m)));
    }
    if (!Store.get('proyectos')) {
      Store.set('proyectos', this.PRESET_PROYECTOS.map((p) => this.crearProyecto(p)));
    }
    if (!Store.get('tareas')) {
      const miembros = Store.getCollection('miembros');
      const proyectos = Store.getCollection('proyectos');
      const tareas = this.PRESET_TAREAS.map((t) => this.crearTarea({
        ...t,
        idProyecto: (proyectos[t.idProyectoIdx] || {}).id || '',
        idMiembro: (miembros[t.idMiembroIdx] || {}).id || '',
      }));
      Store.set('tareas', tareas);
    }
  },

  crearProyecto(data) {
    return {
      id: Utils.uuid(),
      nombre: data.nombre.trim(),
      descripcion: (data.descripcion || '').trim(),
      fechaCreacion: Utils.getNowISO(),
    };
  },

  crearMiembro(data) {
    return {
      id: Utils.uuid(),
      nombre: data.nombre.trim(),
      rol: (data.rol || '').trim(),
      fechaCreacion: Utils.getNowISO(),
    };
  },

  crearTarea(data) {
    return {
      id: Utils.uuid(),
      titulo: data.titulo.trim(),
      descripcion: (data.descripcion || '').trim(),
      idProyecto: data.idProyecto,
      idMiembro: data.idMiembro || '',
      estado: data.estado || 'pendiente',
      prioridad: data.prioridad || 'media',
      fechaInicio: data.fechaInicio || '',
      fechaLimite: data.fechaLimite || '',
      fechaCreacion: Utils.getNowISO(),
      fechaActualizacion: Utils.getNowISO(),
    };
  },

  getEstados() {
    return [
      { id: 'pendiente', nombre: 'Pendiente' },
      { id: 'en-progreso', nombre: 'En Progreso' },
      { id: 'completado', nombre: 'Completado' },
    ];
  },
};
