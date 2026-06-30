const Config = {
  _editingProyectoId: null,
  _editingMiembroId: null,

  init() {
    document.getElementById('btnConfig').addEventListener('click', () => this.open());
    document.getElementById('configCancel').addEventListener('click', () => this.close());
    document.getElementById('configCancel2').addEventListener('click', () => this.close());
    document.getElementById('configOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('configOverlay')) this.close();
    });

    document.querySelectorAll('.config-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.config-tab').forEach((t) => t.classList.remove('config-tab--active'));
        tab.classList.add('config-tab--active');
        document.querySelectorAll('.config-panel').forEach((p) => p.classList.remove('config-panel--active'));
        document.getElementById(tab.dataset.panel).classList.add('config-panel--active');
      });
    });

    this._initProyectoForm();
    this._initMiembroForm();
  },

  open() {
    document.getElementById('configOverlay').classList.add('modal-overlay--open');
    this._renderProyectos();
    this._renderMiembros();
  },

  close() {
    document.getElementById('configOverlay').classList.remove('modal-overlay--open');
    this._resetForms();
  },

  _resetForms() {
    this._editingProyectoId = null;
    this._editingMiembroId = null;
    document.getElementById('proyectoForm').reset();
    document.getElementById('miembroForm').reset();
    document.getElementById('proyectoFormSubmit').textContent = 'Agregar';
    document.getElementById('miembroFormSubmit').textContent = 'Agregar';
  },

  _initProyectoForm() {
    const form = document.getElementById('proyectoForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('proyNombre').value.trim();
      const descripcion = document.getElementById('proyDescripcion').value.trim();
      if (!nombre) { alert('El nombre del proyecto es obligatorio.'); return; }

      if (this._editingProyectoId) {
        Store.updateInCollection('proyectos', this._editingProyectoId, { nombre, descripcion });
      } else {
        Store.addToCollection('proyectos', Models.crearProyecto({ nombre, descripcion }));
      }

      form.reset();
      this._editingProyectoId = null;
      document.getElementById('proyectoFormSubmit').textContent = 'Agregar';
      this._renderProyectos();
      document.dispatchEvent(new CustomEvent('data:change'));
    });
  },

  _initMiembroForm() {
    const form = document.getElementById('miembroForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('miemNombre').value.trim();
      const rol = document.getElementById('miemRol').value.trim();
      if (!nombre) { alert('El nombre del miembro es obligatorio.'); return; }

      if (this._editingMiembroId) {
        Store.updateInCollection('miembros', this._editingMiembroId, { nombre, rol });
      } else {
        Store.addToCollection('miembros', Models.crearMiembro({ nombre, rol }));
      }

      form.reset();
      this._editingMiembroId = null;
      document.getElementById('miembroFormSubmit').textContent = 'Agregar';
      this._renderMiembros();
      document.dispatchEvent(new CustomEvent('data:change'));
    });
  },

  _renderProyectos() {
    const container = document.getElementById('proyectosList');
    const proyectos = Store.getCollection('proyectos');
    if (proyectos.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__text">No hay proyectos</div></div>';
      return;
    }
    container.innerHTML = proyectos.map((p) => `
      <div class="config-item">
        <div class="config-item__info">
          <div class="config-item__name">${Utils.escapeHtml(p.nombre)}</div>
          <div class="config-item__meta">${Utils.escapeHtml(p.descripcion || 'Sin descripción')}</div>
        </div>
        <div class="config-item__actions">
          <button class="btn btn--sm btn--secondary" data-proy-edit="${p.id}">Editar</button>
          <button class="btn btn--sm btn--danger" data-proy-delete="${p.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-proy-edit]').forEach((btn) => {
      btn.addEventListener('click', () => this._editProyecto(btn.dataset.proyEdit));
    });
    container.querySelectorAll('[data-proy-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._deleteProyecto(btn.dataset.proyDelete));
    });
  },

  _renderMiembros() {
    const container = document.getElementById('miembrosList');
    const miembros = Store.getCollection('miembros');
    if (miembros.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__text">No hay miembros</div></div>';
      return;
    }
    container.innerHTML = miembros.map((m) => `
      <div class="config-item">
        <div class="config-item__info">
          <div class="config-item__name">${Utils.escapeHtml(m.nombre)}</div>
          <div class="config-item__meta">${Utils.escapeHtml(m.rol || 'Sin rol')}</div>
        </div>
        <div class="config-item__actions">
          <button class="btn btn--sm btn--secondary" data-miem-edit="${m.id}">Editar</button>
          <button class="btn btn--sm btn--danger" data-miem-delete="${m.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-miem-edit]').forEach((btn) => {
      btn.addEventListener('click', () => this._editMiembro(btn.dataset.miemEdit));
    });
    container.querySelectorAll('[data-miem-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._deleteMiembro(btn.dataset.miemDelete));
    });
  },

  _editProyecto(id) { this._genericEdit('proyectos', id, '_editingProyectoId', 'proyNombre', 'proyDescripcion', 'proyectoFormSubmit', 'Actualizar'); },
  _editMiembro(id) { this._genericEdit('miembros', id, '_editingMiembroId', 'miemNombre', 'miemRol', 'miembroFormSubmit', 'Actualizar'); },

  _genericEdit(collection, id, editingField, nameFieldId, extraFieldId, submitId, btnText) {
    const item = Store.getById(collection, id);
    if (!item) return;
    this[editingField] = id;
    document.getElementById(nameFieldId).value = item.nombre;
    if (document.getElementById(extraFieldId)) document.getElementById(extraFieldId).value = item.rol || item.descripcion || '';
    document.getElementById(submitId).textContent = btnText;
  },

  _deleteProyecto(id) {
    if (!confirm('¿Eliminar este proyecto? Las tareas asociadas perderán la referencia.')) return;
    Store.removeFromCollection('proyectos', id);
    this._renderProyectos();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _deleteMiembro(id) {
    if (!confirm('¿Eliminar este miembro? Las tareas asignadas perderán la referencia.')) return;
    Store.removeFromCollection('miembros', id);
    this._renderMiembros();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
};
