const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm?.addEventListener("submit", async e => {
  e.preventDefault();

  loginError.textContent = "";

  const btn = loginForm.querySelector("button");
  btn.disabled = true;

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();

  try {
    const res = await fetch("api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const result = await res.json();

    if (result.status === "success") {
      localStorage.setItem("user", JSON.stringify(result.user));
      window.location.href = "dashboard.php";
    } else {
      loginError.textContent = result.message;
    }

  } catch {
    loginError.textContent = "Server error";
  }

  btn.disabled = false;
});