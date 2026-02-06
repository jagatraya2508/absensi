const API_BASE = '/api';

// Helper to get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Helper for API requests
async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        ...options.headers,
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
    }

    return data;
}

// Auth API
export const authAPI = {
    login: (employee_id, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ employee_id, password }),
        }),

    register: (userData) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    getMe: () => request('/auth/me'),

    getUsers: () => request('/auth/users'),

    deleteUser: (id) =>
        request(`/auth/users/${id}`, { method: 'DELETE' }),

    updateUser: (id, userData) =>
        request(`/auth/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        }),
};

// Attendance API
export const attendanceAPI = {
    checkIn: (formData) =>
        request('/attendance/check-in', {
            method: 'POST',
            body: formData,
        }),

    checkOut: (formData) =>
        request('/attendance/check-out', {
            method: 'POST',
            body: formData,
        }),

    getToday: () => request('/attendance/today'),

    getHistory: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/attendance/history?${query}`);
    },

    delete: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
};

// Locations API
export const locationsAPI = {
    getAll: () => request('/locations'),

    getActive: () => request('/locations/active'),

    getById: (id) => request(`/locations/${id}`),

    create: (data) =>
        request('/locations', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        request(`/locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        request(`/locations/${id}`, { method: 'DELETE' }),
};

// Reports API
export const reportsAPI = {
    getDaily: (date) => {
        const query = date ? `?date=${date}` : '';
        return request(`/reports/daily${query}`);
    },

    getMonthly: (year, month) => {
        const params = new URLSearchParams();
        if (year) params.set('year', year);
        if (month) params.set('month', month);
        return request(`/reports/monthly?${params}`);
    },

    getEmployee: (id, startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        return request(`/reports/employee/${id}?${params}`);
    },
};

export default { authAPI, attendanceAPI, locationsAPI, reportsAPI };
