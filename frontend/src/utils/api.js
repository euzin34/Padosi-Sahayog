// API base URL - change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * API utility for making requests to the backend
 */
class API {
    /**
     * Make a request to the backend
     */
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get Firebase ID token for authenticated requests
     */
    static async getAuthHeader(user) {
        if (!user) return {};

        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    // Auth endpoints
    static async register(email, password, displayName, phoneNumber) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, displayName, phoneNumber })
        });
    }

    static async login(user, latitude, longitude) {
        const authHeader = await this.getAuthHeader(user);
        return this.request('/auth/login', {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({ latitude, longitude })
        });
    }

    static async getProfile(user) {
        const authHeader = await this.getAuthHeader(user);
        return this.request('/auth/profile', {
            method: 'GET',
            headers: authHeader
        });
    }

    static async updateProfile(user, profileData) {
        const authHeader = await this.getAuthHeader(user);
        return this.request('/auth/profile', {
            method: 'PUT',
            headers: authHeader,
            body: JSON.stringify(profileData)
        });
    }

    // Task endpoints
    static async createTask(user, taskData) {
        const authHeader = await this.getAuthHeader(user);
        return this.request('/tasks', {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify(taskData)
        });
    }

    static async getAllTasks(page = 1, limit = 10, category = null, status = 'active') {
        const params = new URLSearchParams({ page, limit, status });
        if (category) params.append('category', category);

        return this.request(`/tasks?${params.toString()}`);
    }

    static async getTaskById(id) {
        return this.request(`/tasks/${id}`);
    }

    static async updateTask(user, id, taskData) {
        const authHeader = await this.getAuthHeader(user);
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            headers: authHeader,
            body: JSON.stringify(taskData)
        });
    }

    static async deleteTask(user, id) {
        const authHeader = await this.getAuthHeader(user);
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
            headers: authHeader
        });
    }

    // Nearby tasks endpoint
    static async getNearbyTasks(latitude, longitude, options = {}, user = null) {
        const { limit = 10, page = 1, category = null, unit = 'km' } = options;

        const params = new URLSearchParams({
            limit: limit.toString(),
            page: page.toString(),
            unit
        });

        // Add coordinates if provided (optional if user is authenticated)
        if (latitude !== undefined && longitude !== undefined) {
            params.append('latitude', latitude.toString());
            params.append('longitude', longitude.toString());
        }

        if (category) params.append('category', category);

        // Add authentication header if user is provided
        const headers = user ? await this.getAuthHeader(user) : {};

        return this.request(`/tasks/nearby?${params.toString()}`, {
            headers
        });
    }
}

export default API;
