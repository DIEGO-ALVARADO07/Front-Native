// src/js/menu.js

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Cargar HTML del menú lateral
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    const html = await fetch("../pages/menu.html").then(res => res.text());
    menuContainer.innerHTML = html;

    // Consumir API de menú según el usuario logueado
    try {
        const response = await fetch(`https://localhost:7008/api/RolFormPermission/menu/${user.id}`);
        if (!response.ok) throw new Error("No se pudo obtener el menú");

        const estructura = await response.json();
        localStorage.setItem("estructuraPermisos", JSON.stringify(estructura));

        renderizarMenu(estructura);
    } catch (err) {
        console.error("Error al cargar el menú:", err);
    }
});

// Construcción del menú lateral
function renderizarMenu(estructura) {
    if (!estructura || estructura.length === 0) return;

    const rol = estructura[0].rol;
    const modulos = estructura[0].moduleForm;

    document.getElementById("menu-rol").textContent = rol;

    const contenedor = document.getElementById("menu-content");
    contenedor.innerHTML = "";

    modulos.forEach(modulo => {
        const moduloDiv = document.createElement("div");

        const titulo = document.createElement("h3");
        titulo.textContent = modulo.name;
        titulo.className = "text-lg font-semibold border-b border-blue-400 pb-1";
        moduloDiv.appendChild(titulo);

        const lista = document.createElement("ul");
        lista.className = "ml-2 mt-2 space-y-1";

        modulo.form.forEach(formulario => {
            const item = document.createElement("li");
            const link = document.createElement("a");

            link.href = `../pages/${formulario.path}`;
            link.textContent = formulario.name; // nombre del formulario
            link.className = "block hover:text-cyan-300 transition";

            item.appendChild(link);
            lista.appendChild(item);
        });

        moduloDiv.appendChild(lista);
        contenedor.appendChild(moduloDiv);
    });
}