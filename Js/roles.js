const api = new APIClient('Rol');
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const rolesList = document.getElementById('roles-list');
    const addRoleBtn = document.getElementById('add-role-btn');
    const saveRolesBtn = document.getElementById('save-roles-btn');
    const backBtn = document.getElementById('back-btn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationClose = document.getElementById('notification-close');
    
    // Contador para asignar IDs únicos a los roles
    let roleCounter = 0;
    
    // Función para agregar un nuevo rol al formulario
    function addRoleForm() {
      const roleId = `role-${roleCounter++}`;
      const roleElement = document.createElement('div');
      roleElement.className = 'role-item';
      roleElement.id = roleId;
      
      roleElement.innerHTML = `
        <div class="role-header">
          <h3 class="role-title">Rol #${roleCounter}</h3>
          <button type="button" class="delete-role" data-role-id="${roleId}">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="form-group">
          <label for="${roleId}-name">Nombre del Rol</label>
          <input type="text" id="${roleId}-name" class="role-name" placeholder="Ej: Administrador, Vendedor, etc." required>
        </div>
        <div class="form-group">
          <label for="${roleId}-description">Descripción</label>
          <textarea id="${roleId}-description" class="role-description" placeholder="Describe las responsabilidades y permisos de este rol"></textarea>
        </div>
      `;
      
      rolesList.appendChild(roleElement);
      
      // Añadir evento para eliminar este rol
      const deleteBtn = roleElement.querySelector('.delete-role');
      deleteBtn.addEventListener('click', function() {
        const roleId = this.getAttribute('data-role-id');
        const roleElement = document.getElementById(roleId);
        
        // Animación de salida
        roleElement.style.opacity = '0';
        roleElement.style.transform = 'translateY(-10px)';
        roleElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          roleElement.remove();
          if (rolesList.children.length === 0) {
            // Si no hay roles, volvemos a mostrar el mensaje
            showNotification('No hay roles definidos. Agrega al menos uno.', 'info');
          }
        }, 300);
      });
      
      // Hacer scroll hasta el nuevo rol
      setTimeout(() => {
        roleElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
    
    // Agregar un rol por defecto al cargar la página
    addRoleForm();
    
    // Evento para agregar nuevo rol
    addRoleBtn.addEventListener('click', addRoleForm);
    
    // Evento para guardar todos los roles
    saveRolesBtn.addEventListener('click', async function() {
      try {
        const roleItems = document.querySelectorAll('.role-item');
        
        if (roleItems.length === 0) {
          showNotification('Debe agregar al menos un rol', 'error');
          return;
        }
        
        // Validar que todos los roles tengan nombre
        let isValid = true;
        
        roleItems.forEach(item => {
          const nameInput = item.querySelector('.role-name');
          if (!nameInput.value.trim()) {
            nameInput.style.borderColor = '#ef4444';
            isValid = false;
          } else {
            nameInput.style.borderColor = '#cbd5e1';
          }
        });
        
        if (!isValid) {
          showNotification('Todos los roles deben tener un nombre', 'error');
          return;
        }
        
        // Cambiar estado del botón
        saveRolesBtn.disabled = true;
        saveRolesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        // Procesar y guardar cada rol
        for (const item of roleItems) {
          // Recolectar datos del rol actual
          const rolesData = {
            nameRol: item.querySelector('.role-name').value.trim(),
            description: item.querySelector('.role-description').value.trim(),
            status: true,
            createAt: new Date().toISOString(),
            updateAt: null,
            deleteAt: null
          };
          
          // Llamar a la API para guardar el rol
          console.log("Rol a guardar:", JSON.stringify(rolesData, null, 2));
          await api.create(rolesData);
        }
        
        // Mostrar mensaje de éxito
        showNotification('Roles guardados correctamente', 'success');
        
        // Redireccionar al dashboard después de unos segundos
        setTimeout(() => {
          window.location.href = 'Registro.html';
        }, 2000);
        
      } catch (error) {
        console.error("Error al guardar roles:", error);
        showNotification(error.message || 'Error al guardar los roles', 'error');
      } finally {
        // Restaurar botón
        saveRolesBtn.disabled = false;
        saveRolesBtn.innerHTML = 'Guardar roles';
      }
    });
    
    // Evento para regresar
    backBtn.addEventListener('click', function() {
      window.history.back();
    });
    
    // Evento para cerrar la notificación
    notificationClose.addEventListener('click', function() {
      closeNotification();
    });
    
    /**
     * Muestra una notificación al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    function showNotification(message, type = 'info') {
      notification.className = `notification ${type} show`;
      notificationMessage.textContent = message;
      
      // Cerrar automáticamente después de 5 segundos
      setTimeout(() => {
        closeNotification();
      }, 5000);
    }
    
    /**
     * Cierra la notificación
     */
    function closeNotification() {
      notification.classList.remove('show');
    }
});