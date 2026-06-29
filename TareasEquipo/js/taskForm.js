const TaskForm = {
  _editingId: null,

  init() {
    this.overlay = document.getElementById('taskFormOverlay');
    this.form = document.getElementById('taskForm');
    this.titleEl = document.getElementById('taskFormTitle');
    this.submitBtn = document.getElementById('taskFormSubmit');

    document.getElementById('btnNuevaTarea').addEventListener('click', () => this.open());
    document.getElementById('taskFormCancel').addEventListener('click', () => this.close());
    document.getElementById('taskFormCancel2').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._save();
    });

    document.addEventListener('task:edit', (e) => {
      const tarea = Store.getById('tareas', e.detail.id);
      if (tarea) this.open(tarea);
    });
  },

  open(tarea) {
    this._editingId = tarea ? tarea.id : null;
    this.titleEl.textContent = tarea ? 'Editar Tarea' : 'Nueva Tarea';
    this.submitBtn.textContent = tarea ? 'Guardar Cambios' : 'Crear Tarea';

    this._populateSelects();
    this._populateProyectos();
    this._populateMiembros();

    document.getElementById('taskTitulo').value = tarea ? tarea.titulo : '';
    document.getElementById('taskDescripcion').value = tarea ? tarea.descripcion : '';
    document.getElementById('taskProyecto').value = tarea ? tarea.idProyecto : (Kanban.currentProyectoId || '');
    document.getElementById('taskMiembro').value = tarea ? tarea.idMiembro : '';
    document.getElementById('taskEstado').value = tarea ? tarea.estado : 'pendiente';
    document.getElementById('taskPrioridad').value = tarea ? tarea.prioridad : 'media';
    document.getElementById('taskFechaInicio').value = tarea ? tarea.fechaInicio : '';
    document.getElementById('taskFechaLimite').value = tarea ? tarea.fechaLimite : '';

    this.overlay.classList.add('modal-overlay--open');
    document.getElementById('taskTitulo').focus();
  },

  close() {
    this.overlay.classList.remove('modal-overlay--open');
    this._editingId = null;
    this.form.reset();
  },

  _populateSelects() {
    const estados = Models.getEstados();
    const select = document.getElementById('taskEstado');
    select.innerHTML = estados.map((e) => `<option value="${e.id}">${e.nombre}</option>`).join('');

    const prioridades = ['baja', 'media', 'alta', 'critica'];
    const prioridadSelect = document.getElementById('taskPrioridad');
    const prioridadLabels = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' };
    prioridadSelect.innerHTML = prioridades.map((p) => `<option value="${p}">${prioridadLabels[p]}</option>`).join('');
  },

  _populateProyectos() {
    const select = document.getElementById('taskProyecto');
    const proyectos = Store.getCollection('proyectos');
    select.innerHTML = '<option value="">Seleccionar proyecto</option>';
    proyectos.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nombre;
      select.appendChild(opt);
    });
  },

  _populateMiembros() {
    const select = document.getElementById('taskMiembro');
    const miembros = Store.getCollection('miembros');
    select.innerHTML = '<option value="">Sin asignar</option>';
    miembros.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.nombre}${m.rol ? ` (${m.rol})` : ''}`;
      select.appendChild(opt);
    });
  },

  _save() {
    const titulo = document.getElementById('taskTitulo').value.trim();
    const descripcion = document.getElementById('taskDescripcion').value.trim();
    const idProyecto = document.getElementById('taskProyecto').value;
    const idMiembro = document.getElementById('taskMiembro').value;
    const estado = document.getElementById('taskEstado').value;
    const prioridad = document.getElementById('taskPrioridad').value;
    const fechaInicio = document.getElementById('taskFechaInicio').value;
    const fechaLimite = document.getElementById('taskFechaLimite').value;

    if (!titulo) { alert('El título es obligatorio.'); return; }
    if (!idProyecto) { alert('Selecciona un proyecto.'); return; }

    if (this._editingId) {
      Store.updateInCollection('tareas', this._editingId, {
        titulo, descripcion, idProyecto, idMiembro, estado, prioridad, fechaInicio, fechaLimite,
        fechaActualizacion: Utils.getNowISO(),
      });
    } else {
      const tarea = Models.crearTarea({
        titulo, descripcion, idProyecto, idMiembro, estado, prioridad, fechaInicio, fechaLimite,
      });
      Store.addToCollection('tareas', tarea);
    }

    this.close();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
};
