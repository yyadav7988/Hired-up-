document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 DEMO MODE ACTIVE");

    // ================= FORCE IDE =================
    const ideBtn = Array.from(document.querySelectorAll("button"))
        .find(b => b.innerText && b.innerText.toLowerCase().includes("ide"));

    if (ideBtn) {
        ideBtn.onclick = () => {
            const code = prompt("Enter Code:", "print('Hello World')");
            if (code !== null) {
                alert("Output:\nHello World\n✅ Execution Successful");
            }
        };
        console.log("✅ IDE wired");
    } else {
        console.log("❌ IDE button not found");
    }

    // ================= FORCE APTITUDE =================
    const aptBtn = Array.from(document.querySelectorAll("button"))
        .find(b => b.innerText && b.innerText.toLowerCase().includes("aptitude"));

    if (aptBtn) {
        aptBtn.onclick = () => {
            let score = 0;

            const q1 = prompt("2 + 2 = ?");
            if (q1 === "4") score++;

            const q2 = prompt("5 * 3 = ?");
            if (q2 === "15") score++;

            alert("Score: " + score + "/2 🎯");
        };
        console.log("✅ Aptitude wired");
    } else {
        console.log("❌ Aptitude button not found");
    }

});
