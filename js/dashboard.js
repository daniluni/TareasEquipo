const Dashboard = {
  init() {
    this.totalProyectosEl = document.getElementById('totalProyectos');
    this.totalTareasEl = document.getElementById('totalTareas');
    this.totalMiembrosEl = document.getElementById('totalMiembros');
    this.projectsContainer = document.getElementById('projectsGrid');
  },

  render() {
    const proyectos = Store.getCollection('proyectos');
    const tareas = Store.getCollection('tareas');
    const miembros = Store.getCollection('miembros');

    this.totalProyectosEl.textContent = proyectos.length;
    this.totalTareasEl.textContent = tareas.length;
    this.totalMiembrosEl.textContent = miembros.length;

    if (proyectos.length === 0) {
      this.projectsContainer.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">📂</div><div class="empty-state__text">No hay proyectos aún. Créalos desde Configuración.</div></div>';
      return;
    }

    this.projectsContainer.innerHTML = proyectos.map((proyecto) => {
      const proyTareas = tareas.filter((t) => t.idProyecto === proyecto.id);
      const total = proyTareas.length;
      const completadas = proyTareas.filter((t) => t.estado === 'completado').length;
      const enProgreso = proyTareas.filter((t) => t.estado === 'en-progreso').length;
      const pendientes = proyTareas.filter((t) => t.estado === 'pendiente').length;
      const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

      return `
        <div class="project-card">
          <div class="project-card__title">${Utils.escapeHtml(proyecto.nombre)}</div>
          ${proyecto.descripcion ? `<div class="project-card__desc">${Utils.escapeHtml(proyecto.descripcion)}</div>` : ''}
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width:${porcentaje}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--font-size-sm)">
            <span style="font-weight:600">${porcentaje}% completo</span>
            <span style="color:var(--color-text-secondary)">${completadas}/${total} tareas</span>
          </div>
          <div class="project-card__stats">
            <span style="color:var(--color-critica)">⏳ ${pendientes} pendientes</span>
            <span style="color:var(--color-alta)">🔄 ${enProgreso} en curso</span>
            <span style="color:var(--color-success)">✅ ${completadas} completadas</span>
          </div>
        </div>
      `;
    }).join('');
  },
};
