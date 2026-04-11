// ==========================================
//las direcciones de la API
const urlUsuarios = "http://localhost:3000/usuarios";
const urlConjuntos = "http://localhost:3000/conjuntos";

//variable para guardar los datos del usuario que entro
let sesionActiva = null; 

//variable para ver si el id residente ya existe
let idEdicionResidente = null; 

// ==========================================
// Captura de elementos nodos del DOM de la pagina para usarlo en el js
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
//listener para cuando termine de cargar todo vea si hay alguna sesión abierta 
//si lo esta lo refirecciona al dashboard 
window.addEventListener("load", () => {
    const sesionGuardada = localStorage.getItem("verdeApp_sesion");
    if (sesionGuardada) {
        entrarAlDashboard(JSON.parse(sesionGuardada));
    }
});

// ==========================================
//las validaciones reGex para los campos en el formulario 
const patrones = {
    nombre: /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,20}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    clave: /^.{6,}$/,
    direccion: /^.{10,50}$/,
    ubicacion: /^[a-zA-Z0-9\s]{1,10}$/
};

//funcion para cerrar modales
function cerrarModales() {
    //display 'none' lod oculta
    modalRegistro.style.display = "none";
    modalLogin.style.display = "none";
    modalResidente.style.display = "none";
    idEdicionResidente = null;
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('campo-error', 'campo-exito'));
}

//funcion que valida campo de los formularios y/o modales
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

//toma lo que el usuario ingreso y lo testea con el ".test"
//si el adminOk y el resideneOk son true todos no pasa nada
//pero si el residente no es Ok el botón de guarda se deshabilita
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
//funcion para entrsr al dashboard, pero no crea cosas sino que las mueve
function entrarAlDashboard(admin) {
    //guarda todo el admin y cierra modales
    sesionActiva = admin;
    localStorage.setItem("verdeApp_sesion", JSON.stringify(admin));
    cerrarModales();

    // esconde la pagina de bienvenida y muestra el dashboard 
    seccionLobby.style.display = "none";
    vistaDashboard.style.display = "block";

    //poner info del usuario y el conjunto como texto
    document.getElementById("txtSaludo").textContent = `Panel de ${admin.nombre} ${admin.apellido}`;
    document.getElementById("txtInfoConjunto").textContent = `Conjunto: ${admin.conjunto} | Sede: ${admin.direccion}`;

    //eliminar o reemplazar el botón de inicio de sesion con el de cerrar sesion
    menuNavegacion.innerHTML = `<li><button class="btn-salir" id="btnCerrarSesion">Cerrar Sesión</button></li>`;

    //si alguien presiona el boton de borrsr sesion, se elimina o borra la interfaz actual
    document.getElementById("btnCerrarSesion").onclick = () => {
        localStorage.removeItem("verdeApp_sesion");
        location.reload();
    };

    //cargar la tabla de los residentes 
    cargarMatrizResidentes();
}

// ==========================================
//se activa cuando se presiona el boton enviar enviar
formLogin.onsubmit = async (e) => {
    e.preventDefault();//cancelar lo que hace el navegador
    try {
        const r = await fetch(urlUsuarios);
        const usuarios = await r.json();
        const admin = usuarios.find(u => u.email === loginEmail.value && u.pass === loginPass.value && u.rol === "ADMINISTRADOR");

        //condicionales con funcion a las credenciales ingresadas
        if (admin) {
            Swal.fire("Acceso Exitoso", `Bienvenido`, "success");
            entrarAlDashboard(admin);
        } else {
            Swal.fire("Error", "Credenciales inválidas", "error");
        }
    } catch (err) { console.error(err); }
};

// no tengo ni la mas minima idea de lo que es esto
formRegistroAdmin.onsubmit = async (e) => {
    e.preventDefault();

    //empaca el nuevo admin con todos sus datos 
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

            //enviar el conjunto 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoAdmin.conjunto, direccion: nuevoAdmin.direccion })
        });
        const res = await fetch(urlUsuarios, {
            //enviar el usuario administrador 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoAdmin)
        });
        //si todo esta bien, dsme la ventana y muestra el dasboard
        if (res.ok) {
            const adminCreado = await res.json();
            Swal.fire("¡Éxito!", "Cuenta creada", "success");
            entrarAlDashboard(adminCreado);
        }
        //si atrapa un error lo guarda en la consola
    } catch (err) { console.error(err); }
};

//tampoco aqui
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

//menos aquí 
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

//no entiendo que hace esto
// es una funcion? por que usa lo de window? que vergas hace?
window.eliminarResidente = async (id) => {
    const confirm = await Swal.fire({ title: "¿Eliminar?", icon: "warning", showCancelButton: true });
    if (confirm.isConfirmed) {
        await fetch(`${urlUsuarios}/${id}`, { method: "DELETE" });
        cargarMatrizResidentes();
    }
};

//no entiendo el uso de window, por que no document?
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
//entiendo poco aqui, pero sigo sonando chino.
//se crean los listeners para las funciones, pero no entiendo esa sintaxis y de donde sale todo eso
document.getElementById("btnAbrirRegistro").onclick = () => { formRegistroAdmin.reset(); modalRegistro.style.display = "flex"; };
document.getElementById("btnAbrirLogin").onclick = () => { formLogin.reset(); modalLogin.style.display = "flex"; };
document.getElementById("btnNuevoResidente").onclick = () => { idEdicionResidente = null; formResidente.reset(); tituloModalRes.textContent = "Nuevo Residente"; modalResidente.style.display = "flex"; };

//supongo que son las validaciones de cada tipo de input, pero no se de que trata o de donde sale todo eso
regNombre.oninput = (e) => validarCampo(e.target, patrones.nombre, "Mínimo 3 letras");
regApellido.oninput = (e) => validarCampo(e.target, patrones.nombre, "Mínimo 3 letras");
regEmail.oninput = (e) => validarCampo(e.target, patrones.email, "Email inválido");
regPass.oninput = (e) => validarCampo(e.target, patrones.clave, "Mínimo 6 caracteres");
regDireccion.oninput = (e) => validarCampo(e.target, patrones.direccion, "Dirección muy corta");
regConjunto.oninput = verificarEstadoBotones;

//no se que es eso
resNombre.oninput = (e) => validarCampo(e.target, patrones.nombre, "Inválido");
resApellido.oninput = (e) => validarCampo(e.target, patrones.nombre, "Inválido");
resEmail.oninput = (e) => validarCampo(e.target, patrones.email, "Inválido");
resTorre.oninput = (e) => validarCampo(e.target, patrones.ubicacion, "Inválido");
resApto.oninput = (e) => validarCampo(e.target, patrones.ubicacion, "Inválido");
