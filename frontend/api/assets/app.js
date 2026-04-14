window.addEventListener("load", function () {

    console.log("🔥 FORCE DEMO MODE");

    // ================= LOGIN =================
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    const loginBtn = Array.from(document.querySelectorAll("button"))
        .find(b => b.innerText.toLowerCase().includes("log"));

    if (loginBtn) {
        loginBtn.onclick = function (e) {
            e.preventDefault();

            const email = emailInput?.value;
            const password = passwordInput?.value;

            if (!email || !password) {
                alert("Enter email & password");
                return;
            }

            localStorage.setItem("user", JSON.stringify({
                name: "Demo User",
                email: email,
                token: "demo-token"
            }));

            alert("Login success 🚀");

            window.location.href = "index.html";
        };

        console.log("✅ LOGIN FIXED");
    } else {
        console.log("❌ LOGIN BUTTON NOT FOUND");
    }

});

window.launchIDE = function() {
    window.location.href = "/frontend/api/assets/ide.html";
};
