// ==========================================
// 1. CONFIGURACIÓN Y DIRECCIONES (API)
// ==========================================
const urlUsuarios = "http://localhost:3000/usuarios";
const urlConjuntos = "http://localhost:3000/conjuntos";

let sesionActiva = null; 
let idEdicionResidente = null; 

// ==========================================
// 2. CAPTURA DE NODOS (DOM)
// ==========================================
const seccionLobby = document.getElementById("seccion-lobby");
const vistaDashboard = document.getElementById("vista-dashboard");
const menuNavegacion = document.getElementById("menu-navegacion");
const tablaMatriz = document.getElementById("cuerpoMatriz");

const modalRegistro = document.getElementById("modalRegistro");
const modalLogin = document.getElementById("modalLogin");
const modalResidente = document.getElementById("modalResidente");

const formRegistroAdmin = document.getElementById("formRegistroAdmin");
const formLogin = document.getElementById("formLogin");
const formResidente = document.getElementById("formResidente");

const btnGuardarAdmin = document.getElementById("btnGuardarAdmin");
const btnGuardarResidente = document.getElementById("btnGuardarResidente");

// ==========================================
// 3. PERSISTENCIA Y CARGA INICIAL
// ==========================================
window.addEventListener("load", () => {
    const sesionGuardada = localStorage.getItem("verdeApp_sesion");
    if (sesionGuardada) {
        entrarAlDashboard(JSON.parse(sesionGuardada));
    }
});

// ==========================================
// 4. VALIDACIONES
// ==========================================
const patrones = {
    nombre: /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,20}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    clave: /^.{6,}$/,
    direccion: /^.{10,50}$/,
    ubicacion: /^[a-zA-Z0-9\s]{1,10}$/
};

function cerrarModales() {
    modalRegistro.style.display = "none";
    modalLogin.style.display = "none";
    modalResidente.style.display = "none";
    idEdicionResidente = null;
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('campo-error', 'campo-exito'));
}

function validarCampo(input, regex, mensaje) {
    const spanError = document.getElementById(`error-${input.id}`);
    const esValido = regex.test(input.value);
    if (esValido) {
        input.classList.remove("campo-error");
        input.classList.add("campo-exito");
        if (spanError) spanError.textContent = "";
    } else {
        input.classList.remove("campo-exito");
        input.classList.add("campo-error");
        if (spanError) spanError.textContent = mensaje;
    }
    verificarEstadoBotones();
}

function verificarEstadoBotones() {
    const adminOk = (
        patrones.nombre.test(document.getElementById("regNombre").value) &&
        patrones.nombre.test(document.getElementById("regApellido").value) &&
        patrones.email.test(document.getElementById("regEmail").value) &&
        patrones.clave.test(document.getElementById("regPass").value) &&
        document.getElementById("regConjunto").value.length >= 4 &&
        patrones.direccion.test(document.getElementById("regDireccion").value)
    );
    btnGuardarAdmin.disabled = !adminOk;

    const residenteOk = (
        patrones.nombre.test(document.getElementById("resNombre").value) &&
        patrones.nombre.test(document.getElementById("resApellido").value) &&
        patrones.email.test(document.getElementById("resEmail").value) &&
        patrones.ubicacion.test(document.getElementById("resTorre").value) &&
        patrones.ubicacion.test(document.getElementById("resApto").value)
    );
    btnGuardarResidente.disabled = !residenteOk;
}

// ==========================================
// 5. NAVEGACIÓN
// ==========================================
function entrarAlDashboard(admin) {
    sesionActiva = admin;
    localStorage.setItem("verdeApp_sesion", JSON.stringify(admin));
    cerrarModales();

    seccionLobby.style.display = "none";
    vistaDashboard.style.display = "block";

    document.getElementById("txtSaludo").textContent = `Panel de ${admin.nombre} ${admin.apellido}`;
    document.getElementById("txtInfoConjunto").textContent = `Conjunto: ${admin.conjunto} | Sede: ${admin.direccion}`;

    menuNavegacion.innerHTML = `<li><button class="btn-salir" id="btnCerrarSesion">Cerrar Sesión</button></li>`;
    
    document.getElementById("btnCerrarSesion").onclick = () => {
        localStorage.removeItem("verdeApp_sesion");
        location.reload();
    };

    cargarMatrizResidentes();
}

// ==========================================
// 6. CRUD
// ==========================================

formLogin.onsubmit = async (e) => {
    e.preventDefault();
    try {
        const r = await fetch(urlUsuarios);
        const usuarios = await r.json();
        const admin = usuarios.find(u => u.email === loginEmail.value && u.pass === loginPass.value && u.rol === "ADMINISTRADOR");

        if (admin) {
            Swal.fire("Acceso Exitoso", `Bienvenido`, "success");
            entrarAlDashboard(admin);
        } else {
            Swal.fire("Error", "Credenciales inválidas", "error");
        }
    } catch (err) { console.error(err); }
};

formRegistroAdmin.onsubmit = async (e) => {
    e.preventDefault();
    const nuevoAdmin = {
        nombre: regNombre.value,
        apellido: regApellido.value,
        email: regEmail.value,
        pass: regPass.value,
        conjunto: regConjunto.value,
        direccion: regDireccion.value,
        rol: "ADMINISTRADOR"
    };

    try {
        await fetch(urlConjuntos, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoAdmin.conjunto, direccion: nuevoAdmin.direccion })
        });
        const res = await fetch(urlUsuarios, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoAdmin)
        });
        if (res.ok) {
            const adminCreado = await res.json();
            Swal.fire("¡Éxito!", "Cuenta creada", "success");
            entrarAlDashboard(adminCreado);
        }
    } catch (err) { console.error(err); }
};

async function cargarMatrizResidentes() {
    try {
        const r = await fetch(urlUsuarios);
        const lista = await r.json();
        const filtrados = lista.filter(u => u.conjunto === sesionActiva.conjunto && u.rol === "RESIDENTE");
        
        tablaMatriz.innerHTML = filtrados.map(res => `
            <tr>
                <td>${res.nombre} ${res.apellido}</td>
                <td>${res.email}</td>
                <td>Torre ${res.torre} - Apto ${res.apto}</td>
                <td>
                    <i class="fa-solid fa-pen" style="color:#2ecc71; cursor:pointer; margin-right:15px" onclick="prepararEdicionResidente('${res.id}')"></i>
                    <i class="fa-solid fa-trash" style="color:#e74c3c; cursor:pointer" onclick="eliminarResidente('${res.id}')"></i>
                </td>
            </tr>
        `).join("");
    } catch (err) { console.error(err); }
}

formResidente.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        nombre: resNombre.value,
        apellido: resApellido.value,
        email: resEmail.value,
        torre: resTorre.value,
        apto: resApto.value,
        conjunto: sesionActiva.conjunto,
        rol: "RESIDENTE"
    };

    const url = idEdicionResidente ? `${urlUsuarios}/${idEdicionResidente}` : urlUsuarios;
    const metodo = idEdicionResidente ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            Swal.fire("Éxito", "Lista actualizada", "success");
            cerrarModales();
            cargarMatrizResidentes();
        }
    } catch (err) { console.error(err); }
};

window.eliminarResidente = async (id) => {
    const confirm = await Swal.fire({ title: "¿Eliminar?", icon: "warning", showCancelButton: true });
    if (confirm.isConfirmed) {
        await fetch(`${urlUsuarios}/${id}`, { method: "DELETE" });
        cargarMatrizResidentes();
    }
};

window.prepararEdicionResidente = async (id) => {
    const r = await (await fetch(`${urlUsuarios}/${id}`)).json();
    idEdicionResidente = id;
    resNombre.value = r.nombre;
    resApellido.value = r.apellido;
    resEmail.value = r.email;
    resTorre.value = r.torre;
    resApto.value = r.apto;
    tituloModalRes.textContent = "Editar Residente";
    modalResidente.style.display = "flex";
    verificarEstadoBotones();
};

// ==========================================
// 7. EVENTOS
// ==========================================
document.getElementById("btnAbrirRegistro").onclick = () => { formRegistroAdmin.reset(); modalRegistro.style.display = "flex"; };
document.getElementById("btnAbrirLogin").onclick = () => { formLogin.reset(); modalLogin.style.display = "flex"; };
document.getElementById("btnNuevoResidente").onclick = () => { idEdicionResidente = null; formResidente.reset(); tituloModalRes.textContent = "Nuevo Residente"; modalResidente.style.display = "flex"; };

regNombre.oninput = (e) => validarCampo(e.target, patrones.nombre, "Mínimo 3 letras");
regApellido.oninput = (e) => validarCampo(e.target, patrones.nombre, "Mínimo 3 letras");
regEmail.oninput = (e) => validarCampo(e.target, patrones.email, "Email inválido");
regPass.oninput = (e) => validarCampo(e.target, patrones.clave, "Mínimo 6 caracteres");
regDireccion.oninput = (e) => validarCampo(e.target, patrones.direccion, "Dirección muy corta");
regConjunto.oninput = verificarEstadoBotones;

resNombre.oninput = (e) => validarCampo(e.target, patrones.nombre, "Inválido");
resApellido.oninput = (e) => validarCampo(e.target, patrones.nombre, "Inválido");
resEmail.oninput = (e) => validarCampo(e.target, patrones.email, "Inválido");
resTorre.oninput = (e) => validarCampo(e.target, patrones.ubicacion, "Inválido");
resApto.oninput = (e) => validarCampo(e.target, patrones.ubicacion, "Inválido");