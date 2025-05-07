// Instancias de API
const personApi = new APIClient('Person');
const userApi = new APIClient('User');
const roleApi = new APIClient('Rol');
const companyApi = new APIClient('Company');

// Variable para almacenar el ID de la persona registrada
let registeredPersonId = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Referencias a elementos del DOM
    const personModal = document.getElementById('person-modal');
    const userModal = document.getElementById('user-modal');
    const personSubmitBtn = document.getElementById('person-submit-btn');
    const backToPersonBtn = document.getElementById('back-to-person-btn');
    const registerBtn = document.getElementById('register-submit-btn');
    const backBtn = document.getElementById('back-btn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationClose = document.getElementById('notification-close');

    // Cargar roles y compañías al inicio
    await populateRoleSelect();
    await populateCompanySelect();

    // Evento para continuar al formulario de usuario
    personSubmitBtn.addEventListener('click', async function() {
        try {
            // Obtener datos del formulario de persona
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const typeIdentification = parseInt(document.getElementById('typeIdentification').value);
            const numberIndification = document.getElementById('numberIndification').value.trim();

            // Validar campos obligatorios
            if (!firstName || !lastName || !email) {
                showNotification('Por favor, complete todos los campos obligatorios', 'error');
                return;
            }

            // Validar correo electrónico
            if (!isValidEmail(email)) {
                showNotification('Por favor, ingrese un correo electrónico válido', 'error');
                return;
            }

            // Cambiar estado del botón
            personSubmitBtn.disabled = true;
            personSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            // Crear objeto de persona
            const personData = {
                firstName,
                lastName,
                email,
                phoneNumber: phoneNumber || '',
                typeIdentification,
                numberIdentification: numberIndification,
                createAt: new Date().toISOString(),
                status: true
            };

            console.log("Datos de persona a enviar:", JSON.stringify(personData, null, 2));

            // Registrar la persona
            const newPerson = await personApi.create(personData);
            registeredPersonId = newPerson.id;

            // Mostrar mensaje de éxito
            showNotification('Información personal guardada correctamente', 'success');

            // Ocultar modal de persona y mostrar modal de usuario
            setTimeout(() => {
                personModal.style.display = 'none';
                userModal.style.display = 'block';
                userModal.style.animation = 'fadeIn 0.5s ease-out';
            }, 1000);

        } catch (error) {
            console.error("Error al registrar persona:", error);
            showNotification(error.message || 'Error al registrar información personal', 'error');
        } finally {
            // Restaurar botón
            personSubmitBtn.disabled = false;
            personSubmitBtn.innerHTML = 'Continuar';
        }
    });

    // Evento para volver al formulario de persona
    backToPersonBtn.addEventListener('click', function() {
        userModal.style.display = 'none';
        personModal.style.display = 'block';
        personModal.style.animation = 'fadeIn 0.5s ease-out';
    });

    // Evento para registrar usuario
    registerBtn.addEventListener('click', async function() {
        try {
            // Obtener datos del formulario de usuario
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const roleId = document.getElementById('role-select').value;
            const companyId = document.getElementById('company-select').value;
            const userTypeRadios = document.getElementsByName('userType');
            let isAdmin = false;
            
            for (const radio of userTypeRadios) {
                if (radio.checked) {
                    isAdmin = radio.value === 'admin';
                    break;
                }
            }

            // Validar campos obligatorios
            if (!username || !password || !confirmPassword || !roleId || !companyId) {
                showNotification('Por favor, complete todos los campos obligatorios', 'error');
                return;
            }

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }

            // Cambiar estado del botón
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

            // Crear objeto de usuario
            const userData = {
                userName: username,
                password: password,
                status: true,
                idPerson: registeredPersonId,
                idCompany: parseInt(companyId),
                idRol: parseInt(roleId),
                createAt: new Date().toISOString(),
                updateAt: null,
                deleteAt: null
            };

            console.log("Datos de usuario a enviar:", JSON.stringify(userData, null, 2));

            // Registrar el usuario
            await userApi.create(userData);

            // Mostrar mensaje de éxito
            showNotification('Usuario registrado correctamente', 'success');

            // Redireccionar al login después de unos segundos
            setTimeout(() => {
                window.location.href = 'Inicio-sesion.html';
            }, 2000);

        } catch (error) {
            console.error("Error al registrar usuario:", error);
            showNotification(error.message || 'Error al registrar usuario', 'error');
        } finally {
            // Restaurar botón
            registerBtn.disabled = false;
            registerBtn.innerHTML = 'Registrarse';
        }
    });

    // Evento para cancelar registro
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Evento para cerrar la notificación
    notificationClose.addEventListener('click', function() {
        closeNotification();
    });

    /**
     * Funciones auxiliares
     */

    // Cargar roles desde la API
    async function populateRoleSelect() {
        try {
            const roleSelect = document.getElementById('role-select');
            const roles = await roleApi.getAll();
            
            // Limpiar opciones actuales
            roleSelect.innerHTML = '<option value="">Seleccione un rol</option>';
            
            // Agregar cada rol como una opción
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.nameRol;
                roleSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar roles:", error);
            showNotification("Error al cargar roles", "error");
        }
    }

    // Cargar compañías desde la API
    async function populateCompanySelect() {
        try {
            const companySelect = document.getElementById('company-select');
            const companies = await companyApi.getAll();
            
            // Limpiar opciones actuales
            companySelect.innerHTML = '<option value="">Seleccione una compañía</option>';
            
            // Agregar cada compañía como una opción
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.nameCompany;
                companySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar compañías:", error);
            showNotification("Error al cargar compañías", "error");
        }
    }

    // Validar formato de correo electrónico
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Mostrar notificación
    function showNotification(message, type = 'info') {
        notification.className = `notification ${type} show`;
        notificationMessage.textContent = message;
        
        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            closeNotification();
        }, 5000);
    }

    // Cerrar notificación
    function closeNotification() {
        notification.classList.remove('show');
    }
});