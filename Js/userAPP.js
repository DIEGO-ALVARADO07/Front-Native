/**
 * app.js - Lógica de la aplicación para gestión de usuarios
 */

// DOM Elements
const userForm = document.getElementById('user-form');
const userId = document.getElementById('user-id');
const userName = document.getElementById('user-name');
const userCompany = document.getElementById('user-company');
const userNameRol = document.getElementById('user-rol');
const userPassword = document.getElementById('user-password');
const saveUserButton = document.getElementById('save-user');
const passwordHelp = document.getElementById('password-help');
const usersTableBody = document.getElementById('users-table-body');
const usersTable = document.getElementById('users-table');
const loadingSpinner = document.getElementById('loading-spinner');
const noUsersMessage = document.getElementById('no-users');
const alertContainer = document.getElementById('alert-container');
const confirmDeleteButton = document.getElementById('confirm-delete');
const userModal = new bootstrap.Modal(document.getElementById('userModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

// Variables globales
let userToDelete = null;
let isEditMode = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
saveUserButton.addEventListener('click', handleSaveUser);
confirmDeleteButton.addEventListener('click', handleConfirmDelete);

/**
 * Inicializa la aplicación
 */
function initApp() {
    loadUsers();
    setupEventListeners();
}

/*
    * Muestra u oculta la barra lateral
*/

function toggleSidebar() {
    const sidebar = document.getElementById("mySidebar");
    sidebar.style.left = (sidebar.style.left === "0px") ? "-250px" : "0px";
}

/**
 * Configura los escuchadores de eventos adicionales
 */
function setupEventListeners() {
    // Limpiar formulario al cerrar el modal
    document.getElementById('userModal').addEventListener('hidden.bs.modal', resetForm);
    
    // Configurar modal para nuevo usuario
    document.getElementById('btn-new-user').addEventListener('click', () => {
        resetForm();
        document.getElementById('userModalLabel').textContent = 'Nuevo Usuario';
        isEditMode = false;
        passwordHelp.classList.add('d-none');
    });
}

/**
 * Carga la lista de usuarios desde la API
 */

const userApi = new APIClient('User');
userApi.getAll().then(users => console.log(users));
async function loadUsers() {
    try {
        showLoading(true);
        const users = await userApi.getAll();
        renderUsersTable(users);
    } catch (error) {
        showAlert('Error al cargar los usuarios: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

/**
 * Renderiza la tabla de usuarios
 * @param {Array} users - Lista de usuarios
 */
function renderUsersTable(users) {
    console.log(users.nameRol);
    
    usersTableBody.innerHTML = '';
    if (!users || users.length === 0) {
        usersTable.classList.add('d-none');
        noUsersMessage.classList.remove('d-none');
        return;
    }

    usersTable.classList.remove('d-none');
    noUsersMessage.classList.add('d-none');
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td></td>
            <td>${escapeHtml(user.userName || '')}</td>
            <td>${escapeHtml(user.namePerson|| '')}</td>
            <td>${escapeHtml(user.nameCompany || '')}</td>
            <td>${'*'.repeat(user.password?.length)}</td>
            <td><span class="badge bg-${getRoleBadgeColor(user.nameRol)}">${escapeHtml(user.nameRol || '')}</span></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-info edit-user" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-danger delete-user" data-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    
    // Añadir event listeners a los botones
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', () => handleEditUser(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', () => handleDeleteUser(button.dataset.id));
    });
}

/**
 * Maneja el click en el botón de editar
 * @param {string} id - ID del usuario a editar
 */
async function handleEditUser(id) {
    try {
        showLoading(true);
        
        const user = await userApi.getById(id);
        
        // Rellenar el formulario
        userId.value = user.id;
        userName.value = user.name || '';
        userCompany.value = user.company || '';
        userNameRol.value = user.nameRol || '';
        userPassword.value = ''; // No mostrar la contraseña actual
        
        // Configurar el modal
        document.getElementById('userModalLabel').textContent = 'Editar Usuario';
        isEditMode = true;
        passwordHelp.classList.remove('d-none');
        
        // Mostrar el modal
        userModal.show();
    } catch (error) {
        showAlert('Error al cargar el usuario: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

/**
 * Maneja el click en el botón de eliminar
 * @param {string} id - ID del usuario a eliminar
 */
function handleDeleteUser(id) {
    userToDelete = id;
    deleteModal.show();
}

/**
 * Confirma la eliminación del usuario
 */
async function handleConfirmDelete() {
    if (!userToDelete) return;
    
    try {
        confirmDeleteButton.disabled = true;
        confirmDeleteButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Eliminando...';
        
        // Esta función no está disponible en el controlador compartido,
        // pero la incluimos para completar la funcionalidad
        await userApi.deleteUser(userToDelete);
        
        deleteModal.hide();
        showAlert('Usuario eliminado correctamente', 'success');
        loadUsers();
    } catch (error) {
        showAlert('Error al eliminar el usuario: ' + error.message, 'danger');
    } finally {
        confirmDeleteButton.disabled = false;
        confirmDeleteButton.innerHTML = 'Eliminar';
        userToDelete = null;
    }
}

/**
 * Maneja el guardado de un usuario (creación o actualización)
 */
async function handleSaveUser() {
    if (!userForm.checkValidity()) {
        userForm.reportValidity();
        return;
    }
    
    try {
        saveUserButton.disabled = true;
        saveUserButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        const userData = {
            name: userName.value.trim(),
            email: userEmail.value.trim(),
            role: userRole.value
        };
        
        // Añadir contraseña solo si se ha introducido
        if (userPassword.value) {
            userData.password = userPassword.value;
        }
        
        if (isEditMode) {
            // Añadir ID para actualización
            userData.id = parseInt(userId.value);
            
            // La actualización no está disponible en el controlador compartido,
            // pero la incluimos para completar la funcionalidad
            await userApi.updateUser(userData.id, userData);
            showAlert('Usuario actualizado correctamente', 'success');
        } else {
            await userApi.createUser(userData);
            showAlert('Usuario creado correctamente', 'success');
        }
        
        userModal.hide();
        loadUsers();
    } catch (error) {
        showAlert('Error al guardar el usuario: ' + error.message, 'danger');
    } finally {
        saveUserButton.disabled = false;
        saveUserButton.innerHTML = 'Guardar';
    }
}

/**
 * Restablece el formulario
 */
function resetForm() {
    userForm.reset();
    userId.value = '';
    isEditMode = false;
}

/**
 * Muestra u oculta el indicador de carga
 * @param {boolean} show - Indica si mostrar u ocultar
 */
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

/**
 * Muestra una alerta en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta (success, danger, warning, info)
 */
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
}

/**
 * Obtiene el color para la insignia del rol
 * @param {string} nameRol - Rol del usuario
 * @returns {string} - Clase de color de Bootstrap
 */
function getRoleBadgeColor(nameRol) {
    switch (nameRol?.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'user':
            return 'primary';
        case 'guest':
            return 'secondary';
        default:
            return 'info';
    }
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
}
