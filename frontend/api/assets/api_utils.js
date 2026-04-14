const BASE_URL = "https://hired-up-2p1x.onrender.com";

export async function apiRequest(endpoint, method = "GET", body = null) {

    console.log("MOCK API:", endpoint);

    // LOGIN
    if (endpoint.includes("/login")) {
        return { success: true, token: "demo-token" };
    }

    // PROBLEMS (IDE)
    if (endpoint.includes("/problems")) {
        return [
            {
                id: 1,
                title: "Print Hello World",
                description: "Write code to print Hello World",
                starterCode: "print('Hello World')"
            },
            {
                id: 2,
                title: "Add Two Numbers",
                description: "Return sum of two numbers",
                starterCode: "a = 2\nb = 3\nprint(a + b)"
            }
        ];
    }

    // CODE EXECUTION
    if (endpoint.includes("/execute")) {
        return {
            output: "Hello World\nExecution Successful ✅",
            status: "success"
        };
    }

    // APTITUDE QUESTIONS
    if (endpoint.includes("/aptitude")) {
        return [
            {
                question: "2 + 2 = ?",
                options: ["3", "4", "5", "6"],
                answer: "4"
            },
            {
                question: "5 * 3 = ?",
                options: ["10", "15", "20", "25"],
                answer: "15"
            }
        ];
    }

    return { success: true };
}