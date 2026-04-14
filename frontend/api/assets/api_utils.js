const BASE_URL = "https://hired-up-2p1x.onrender.com";

export async function apiRequest(endpoint, method = "GET", body = null) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null
    });
    return res.json();
}