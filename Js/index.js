// Integrando el modal con la API
document.addEventListener('DOMContentLoaded', async function() {
    // Instancia del cliente API para empresas
    const companyApi = new APIClient('Company');
    
    // Obtener elementos del DOM
    const companyModal = document.getElementById('companyModal');
    const modalCloseBtn = companyModal.querySelector('.btn-close');
    const cancelBtn = companyModal.querySelector('.btn-secondary');
    const saveBtn = document.getElementById('save-company');
    const companyForm = document.getElementById('company-form');


    // Elementos para mostrar notificaciones
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Función para inicializar el modal de Bootstrap
    function initModal() {
        // Verificar si Bootstrap está cargado
        if (typeof bootstrap !== 'undefined') {
            // Inicializar el modal con Bootstrap
            const bsModal = new bootstrap.Modal(companyModal);
            
            // Abrir modal al hacer clic en "Comienza Ahora"
            const startButtons = document.querySelectorAll('a[href="#companyModal"], button.btn-primary');
            startButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    if (button.getAttribute('href') === '#companyModal') {
                        e.preventDefault();
                    }
                    bsModal.show();
                });
            });
            
            // Event listeners para cerrar el modal
            if (modalCloseBtn) {
                modalCloseBtn.addEventListener('click', function() {
                    bsModal.hide();
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    bsModal.hide();
                });
            }
            
            // Manejar eventos de Bootstrap
            companyModal.addEventListener('hidden.bs.modal', function() {
                // Restablecer el formulario cuando se cierra el modal
                resetForm();
            });
        } else {
            // Fallback si Bootstrap no está disponible
            implementFallbackModal();
        }
    }
    
    // Implementación alternativa si Bootstrap no está disponible
    function implementFallbackModal() {
        // Clase para mostrar el modal
        function showModal() {
            companyModal.classList.remove('fade');
            companyModal.classList.add('show');
            companyModal.style.display = 'block';
            companyModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            
            // Crear backdrop si no existe
            let backdrop = document.querySelector('.modal-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.classList.add('modal-backdrop', 'fade', 'show');
                document.body.appendChild(backdrop);
            }
        }
        
        // Cerrar el modal
        function hideModal() {
            companyModal.classList.remove('show');
            companyModal.style.display = 'none';
            companyModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            
            // Eliminar backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
        
        // Abrir modal al hacer clic en "Comienza Ahora"
        const startButtons = document.querySelectorAll('a[href="#companyModal"], button.btn-primary');
        startButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (button.getAttribute('href') === '#companyModal') {
                    e.preventDefault();
                }
                showModal();
            });
        });
        
        // Event listeners para cerrar el modal
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', hideModal);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideModal);
        }
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Agregar evento para cerrar notificación
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Función para manejar errores de API
    function handleApiError(error) {
        console.error('Error de API:', error);
        showNotification(error.message || 'Ha ocurrido un error, intente nuevamente', 'error');
    }
    

// Manejar el envío del formulario y crear empresa
if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
        // Cambiar el estado del botón a "guardando"
        const originalButtonText = saveBtn.textContent;
        saveBtn.textContent = 'Guardando...';
        saveBtn.disabled = true;

        try {
            // Validar el formulario
            const isValid = validateForm();
            
            if (isValid) {
                // Preparar datos de la empresa para enviar a la API
                const formData = new FormData();

                // Añadir datos del formulario a FormData
                formData.append('name', document.getElementById('name-company').value);
                formData.append('nit', document.getElementById('nit').value);
                formData.append('phoneNumber', document.getElementById('phone-company').value);
                formData.append('email', document.getElementById('company-email').value);
                formData.append('description', document.getElementById('company-description').value);
                

                const companyData = {
                    nameCompany: document.getElementById('name-company').value,
                    nitCompany: parseInt(document.getElementById('nit').value),
                    phoneCompany: document.getElementById('phone-company').value,
                    emailCompany: document.getElementById('company-email').value,
                    description: document.getElementById('company-description').value,
                    createAt: new Date().toISOString(),
                    status: true
                };

                        // Enviar datos a la API
                        const response = await companyApi.create(companyData);

                       if (response) {
                            showNotification('¡Empresa creada correctamente!');
                            // Cerrar modal
                            if (typeof bootstrap !== 'undefined') {
                            const bsModal = bootstrap.Modal.getInstance(companyModal);
                            bsModal.hide();
                            } else {
                            const closeEvent = new Event('click');
                            modalCloseBtn.dispatchEvent(closeEvent);
                            }

                            
                            resetForm();
    
                            // Redireccionar después de un breve retraso (1.5 segundos)
                            setTimeout(function() {
                            window.location.href = './ConfirmacionEmpresa.html'; // Reemplaza con tu ruta
                            }, 1500);
                        } else {
                        showNotification('Error al crear la empresa', 'error');
                    }

            }
        } catch (error) {
            handleApiError(error);
        } finally {
            // Restaurar el estado del botón
            saveBtn.textContent = originalButtonText;
            saveBtn.disabled = false;
        }
    });
}

    // Función para validar el formulario
    function validateForm() {
        const requiredInputs = companyForm.querySelectorAll('[required]');
        let isValid = true;
        
        // Eliminar mensajes de error previos
        const errorMessages = companyForm.querySelectorAll('.invalid-feedback');
        errorMessages.forEach(el => el.remove());
        
        // Validar campos requeridos
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                markInvalid(input, 'Este campo es obligatorio');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });
        
        // Validaciones específicas
        
        // Validar NIT (solo números)
        const nitInput = document.getElementById('nit');
        if (nitInput.value && isNaN(nitInput.value)) {
            markInvalid(nitInput, 'El NIT debe contener solo números');
            isValid = false;
        }
        
        // Validar teléfono (formato básico)
        const phoneInput = document.getElementById('phone-company');
        if (phoneInput.value && !/^\d{7,15}$/.test(phoneInput.value.replace(/[\s-]/g, ''))) {
            markInvalid(phoneInput, 'Ingrese un número telefónico válido');
            isValid = false;
        }
        
        // Validar email empresarial
        const emailInput = document.getElementById('company-email');
        if (emailInput.value && !validateEmail(emailInput.value)) {
            markInvalid(emailInput, 'Ingrese un correo electrónico válido');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Función para marcar un campo como inválido y mostrar mensaje
    function markInvalid(input, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        
        // Crear mensaje de error
        const feedback = document.createElement('div');
        feedback.classList.add('invalid-feedback');
        feedback.textContent = message;
        
        // Insertar después del input
        input.parentNode.appendChild(feedback);
    }
    
    // Función para validar formato de email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Función para restablecer el formulario
    function resetForm() {
        companyForm.reset();
        
        // Eliminar clases de validación
        const inputs = companyForm.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
        
        // Eliminar mensajes de error
        const errorMessages = companyForm.querySelectorAll('.invalid-feedback');
        errorMessages.forEach(el => el.remove());
        
        // Establecer fecha y hora actual
        setCurrentDateTime();
    }
    
    // Establecer fecha y hora actual como valor predeterminado
    function setCurrentDateTime() {
        const dateTimeInput = document.getElementById('user-actually');
        if (dateTimeInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            dateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }
    
    // Inicializar
    initModal();
    setCurrentDateTime();
    console.log(await companyApi.getAll())
});