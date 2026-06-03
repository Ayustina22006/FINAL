const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

registerForm?.addEventListener("submit", async e => {
  e.preventDefault();

  registerError.textContent = "";

  const btn = registerForm.querySelector("button");
  btn.disabled = true;

  const name = registerForm.name.value.trim();
  const email = registerForm.email.value.trim();
  const password = registerForm.password.value.trim();

  if (password.length < 6) {
    registerError.textContent = "Password minimal 6 karakter";
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch("api/register.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const result = await res.json();

    if (result.status === "success") {
      alert("Registrasi berhasil!");
      window.location.href = "login.php";
    } else {
      registerError.textContent = result.message;
    }

  } catch {
    registerError.textContent = "Server error";
  }

  btn.disabled = false;
});