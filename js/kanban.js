const Kanban = {
  currentProyectoId: null,

  init() {
    this.boardEl = document.getElementById('kanbanBoard');
    this.nameEl = document.getElementById('kanbanProyectoName');
    this.prevBtn = document.getElementById('kanbanPrev');
    this.nextBtn = document.getElementById('kanbanNext');

    this.prevBtn.addEventListener('click', () => this._navigate(-1));
    this.nextBtn.addEventListener('click', () => this._navigate(1));

    document.addEventListener('data:change', () => {
      if (document.getElementById('viewKanban').classList.contains('app-view--active')) {
        this.render();
      }
    });
  },

  render() {
    const proyectos = Store.getCollection('proyectos');
    if (proyectos.length === 0) {
      this.boardEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📂</div><div class="empty-state__text">Crea un proyecto primero</div></div>';
      this.nameEl.textContent = 'Sin proyectos';
      return;
    }

    if (!this.currentProyectoId || !proyectos.find((p) => p.id === this.currentProyectoId)) {
      this.currentProyectoId = proyectos[0].id;
    }

    const proyecto = proyectos.find((p) => p.id === this.currentProyectoId);
    this.nameEl.textContent = proyecto ? proyecto.nombre : '—';

    const tareas = Store.getCollection('tareas').filter((t) => t.idProyecto === this.currentProyectoId);
    const miembros = Store.getCollection('miembros');
    const miembroMap = Object.fromEntries(miembros.map((m) => [m.id, m]));

    const estados = Models.getEstados();
    this.boardEl.innerHTML = '';

    estados.forEach((estado) => {
      const colTareas = tareas.filter((t) => t.estado === estado.id);
      const col = this._createColumn(estado, colTareas, miembroMap);
      this.boardEl.appendChild(col);
    });
  },

  _createColumn(estado, tareas, miembroMap) {
    const col = document.createElement('div');
    col.className = `kanban-column${tareas.length === 0 ? ' kanban-column--empty' : ''}`;
    col.dataset.estado = estado.id;

    const header = document.createElement('div');
    header.className = `kanban-column__header kanban-column__header--${estado.id}`;
    header.innerHTML = `<span>${estado.nombre}</span><span class="kanban-column__count">${tareas.length}</span>`;
    col.appendChild(header);

    const body = document.createElement('div');
    body.className = 'kanban-column__body';
    body.dataset.estado = estado.id;

    body.addEventListener('dragover', this._onDragOver.bind(this));
    body.addEventListener('dragleave', this._onDragLeave.bind(this));
    body.addEventListener('drop', this._onDrop.bind(this));

    tareas.forEach((tarea) => {
      const card = this._createCard(tarea, miembroMap);
      body.appendChild(card);
    });

    col.appendChild(body);
    return col;
  },

  _createCard(tarea, miembroMap) {
    const miembro = miembroMap[tarea.idMiembro];
    const prioridadClass = `task-card__badge--${tarea.prioridad || 'media'}`;
    const prioridadLabel = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' };
    const prioridadColors = { baja: '#27ae60', media: '#f1c40f', alta: '#e67e22', critica: '#e74c3c' };

    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.id = tarea.id;
    card.style.borderLeftColor = prioridadColors[tarea.prioridad] || '#b2bec3';

    card.innerHTML = `
      <div class="task-card__title">${Utils.escapeHtml(tarea.titulo)}</div>
      ${tarea.descripcion ? `<div class="task-card__meta">${Utils.escapeHtml(tarea.descripcion)}</div>` : ''}
      <div class="task-card__meta">
        ${miembro ? `<span class="task-card__member">👤 ${Utils.escapeHtml(miembro.nombre)}</span>` : '<span class="task-card__member" style="color:#b2bec3">Sin asignar</span>'}
        <span class="task-card__dates">${tarea.fechaInicio ? `Inicio: ${Utils.formatDateShort(tarea.fechaInicio)}` : ''}${tarea.fechaLimite ? ` · Límite: ${Utils.formatDateShort(tarea.fechaLimite)}` : ''}</span>
      </div>
      <div class="task-card__footer">
        <div class="task-card__badges">
          <span class="task-card__badge ${prioridadClass}">${prioridadLabel[tarea.prioridad] || 'Media'}</span>
        </div>
        <div class="task-card__actions">
          ${this._getMoveButtons(tarea)}
          <button class="task-card__action" data-action="edit" data-id="${tarea.id}" title="Editar">✏️</button>
          <button class="task-card__action" data-action="delete" data-id="${tarea.id}" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;

    card.addEventListener('dragstart', this._onDragStart.bind(this));
    card.addEventListener('dragend', this._onDragEnd.bind(this));

    card.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'edit') {
          document.dispatchEvent(new CustomEvent('task:edit', { detail: { id } }));
        } else if (action === 'delete') {
          this._deleteTask(id);
        } else if (action === 'move') {
          const targetEstado = btn.dataset.target;
          Store.updateInCollection('tareas', id, { estado: targetEstado, fechaActualizacion: Utils.getNowISO() });
          document.dispatchEvent(new CustomEvent('data:change'));
        }
      });
    });

    return card;
  },

  _getMoveButtons(tarea) {
    const estados = Models.getEstados();
    const idx = estados.findIndex((e) => e.id === tarea.estado);
    let html = '';
    if (idx > 0) {
      html += `<button class="task-card__action" data-action="move" data-target="${estados[idx - 1].id}" data-id="${tarea.id}" title="Mover a ${estados[idx - 1].nombre}">◀</button>`;
    }
    if (idx < estados.length - 1) {
      html += `<button class="task-card__action" data-action="move" data-target="${estados[idx + 1].id}" data-id="${tarea.id}" title="Mover a ${estados[idx + 1].nombre}">▶</button>`;
    }
    return html;
  },

  _deleteTask(id) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    Store.removeFromCollection('tareas', id);
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _navigate(direction) {
    const proyectos = Store.getCollection('proyectos');
    if (proyectos.length === 0) return;
    const idx = proyectos.findIndex((p) => p.id === this.currentProyectoId);
    let newIdx = idx + direction;
    if (newIdx < 0) newIdx = proyectos.length - 1;
    if (newIdx >= proyectos.length) newIdx = 0;
    this.currentProyectoId = proyectos[newIdx].id;
    this.render();
  },

  _onDragStart(e) {
    e.target.classList.add('task-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  },

  _onDragEnd(e) { e.target.classList.remove('task-card--dragging'); },
  _onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('kanban-column__body--drag-over'); },
  _onDragLeave(e) { e.currentTarget.classList.remove('kanban-column__body--drag-over'); },

  _onDrop(e) {
    e.preventDefault();
    const body = e.currentTarget;
    body.classList.remove('kanban-column__body--drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    const targetEstado = body.dataset.estado;
    if (taskId && targetEstado) {
      Store.updateInCollection('tareas', taskId, { estado: targetEstado, fechaActualizacion: Utils.getNowISO() });
      document.dispatchEvent(new CustomEvent('data:change'));
    }
  },
};
