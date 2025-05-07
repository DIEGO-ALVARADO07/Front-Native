const API_BASE_URL = 'https://localhost:7090/api';

/**
 * Clase genérica para interactuar con diferentes endpoints de la API
 */
class APIClient {
    constructor(userApi) {
        this.entity = userApi; // Ejemplo: 'user', 'person', etc.
        this.baseUrl = `${API_BASE_URL}/${this.entity}`;
    }

    async getAll() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error al obtener ${this.entity}s:`, error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            if (response.status === 404) {
                throw new Error(`${this.entity} no encontrado`);
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error al obtener ${this.entity} ${id}:`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear');
            }
            return await response.json();
        } catch (error) {
            console.error(`Error al crear ${this.entity}:`, error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar');
            }
            return await response.json();
        } catch (error) {
            console.error(`Error al actualizar ${this.entity} ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar');
            }
            return true;
        } catch (error) {
            console.error(`Error al eliminar ${this.entity} ${id}:`, error);
            throw error;
        }
    }
}
