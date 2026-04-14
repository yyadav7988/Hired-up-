document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 DEMO MODE FULLY ACTIVE");

    // ================= LOGIN =================
    const loginBtn = document.querySelector("button");

    if (loginBtn && loginBtn.innerText.toLowerCase().includes("log")) {
        loginBtn.onclick = (e) => {
            e.preventDefault();

            const email = document.querySelector('input[type="email"]')?.value;
            const password = document.querySelector('input[type="password"]')?.value;

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            localStorage.setItem("user", JSON.stringify({
                name: "Demo User",
                email: email,
                token: "demo-token"
            }));

            alert("Login successful 🚀");
            window.location.href = "index.html";
        };

        console.log("✅ Login wired");
    }

    // ================= IDE =================
    const ideBtn = Array.from(document.querySelectorAll("button"))
        .find(btn => btn.innerText.toLowerCase().includes("ide"));

    if (ideBtn) {
        ideBtn.onclick = () => {

            const code = prompt("Write your code:", "print('Hello World')");

            if (code !== null) {
                alert("Running...\n\nOutput:\nHello World\n✅ Success");
            }
        };

        console.log("✅ IDE wired");
    }

    // ================= APTITUDE =================
    const aptBtn = Array.from(document.querySelectorAll("button"))
        .find(btn => btn.innerText.toLowerCase().includes("aptitude"));

    if (aptBtn) {
        aptBtn.onclick = () => {

            let score = 0;

            const q1 = prompt("2 + 2 = ?");
            if (q1 === "4") score++;

            const q2 = prompt("5 * 3 = ?");
            if (q2 === "15") score++;

            alert(`Score: ${score}/2 🎯`);
        };

        console.log("✅ Aptitude wired");
    }

});
