const BASE_URL = "https://hired-up-2p1x.onrender.com";

export async function apiRequest(endpoint, method = "GET", body = null) {
    console.log("API CALL:", endpoint);

    // 🔥 MOCK RESPONSES FOR DEMO
    if (endpoint.includes("/login")) {
        return { success: true, token: "demo-token-123" };
    }

    if (endpoint.includes("/problems")) {
        return [
            { id: 1, title: "Two Sum", difficulty: "Easy" },
            { id: 2, title: "Reverse String", difficulty: "Easy" }
        ];
    }

    if (endpoint.includes("/execute")) {
        return {
            output: "Hello World",
            status: "success"
        };
    }

    if (endpoint.includes("/jobs")) {
        return [
            { id: 1, title: "Frontend Developer", company: "Demo Corp" }
        ];
    }

    // default fallback
    return { success: true };
}