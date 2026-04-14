const BASE_URL = "https://hired-up-2p1x.onrender.com";

export async function apiRequest(endpoint, method = "GET", body = null) {
    try {
        const token = localStorage.getItem('hiredUpToken');
        const headers = {
            "Content-Type": "application/json"
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        console.error("API ERROR:", err);
        alert("Server error — backend not reachable");
        throw err;
    }
}