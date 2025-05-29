// ../src/js/nav.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("nav.html") // ajusta la ruta si es necesario
      .then(res => res.text())
      .then(html => {
        document.getElementById("navbar").innerHTML = html;
  
        // Lógica de usuario
        const usernameSpan = document.getElementById("username");
        const user = JSON.parse(localStorage.getItem("user"));
        if (usernameSpan && user?.username) {
          usernameSpan.textContent = user.username;
        }
  
        // Cerrar sesión
        const logoutBtn = document.getElementById("logout");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
          });
        }
      });
  });
  