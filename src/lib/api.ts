const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Convert body to JSON string if it's an object (but not FormData)
    let body = options.body;
    const isFormData = body instanceof FormData;
    if (body && typeof body === 'object' && !isFormData) {
        body = JSON.stringify(body);
    }

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            body,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Something went wrong');
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {};
        }

        const data = await response.json();
        return data;
    } catch (err: any) {
        throw err;
    }
};
