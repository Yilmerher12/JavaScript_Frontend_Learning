// ==========================================
// 1. VARIABLES (CAPTURA DE ELEMENTOS en el DOM)

const urlAPI = "http://localhost:3000/usuarios";

const btnAbrir = document.getElementById("botonAbrirModal");
const btnCancelar = document.getElementById("botonCancelarModal");
const modal = document.getElementById("ventanaModal");
const formulario = document.getElementById("formularioUsuario");
const tituloForm = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("botonGuardar");
const tabla = document.getElementById("cuerpoTabla");
const filtroRol = document.getElementById("filtroRol");

const inputDoc = document.getElementById("documento");
const inputNom = document.getElementById("nombre");
const inputApe = document.getElementById("apellido");
const inputEdad = document.getElementById("edad");
const inputTel = document.getElementById("telefono");
const inputEmail = document.getElementById("email");
const inputRol = document.getElementById("rol");
const inputPass = document.getElementById("contrasena");
const seccionResidente = document.getElementById("seccion-residente");
const seccionAcopio = document.getElementById("seccion-acopio");

//Para saber si estamos editando o creando
let idEdicion = null;

//Reglas de validación Regex
const patrones = {
    documento: /^\d{8,10}$/,
    telefono: /^\d{10}$/,
    soloLetras: /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,20}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};



// 2. FUNCIONES DE LÓGICA

//Valida cada campo y pone los colores rojo o verde
function validarCampo(input, regex, mensajeError) {
    const spanError = document.getElementById(`error-${input.id}`);
    const esValido = regex.test(input.value);

    if (esValido) {
        input.classList.remove("campo-error");
        input.classList.add("campo-exito");
        if (spanError) spanError.textContent = "";
    } else {
        input.classList.remove("campo-exito");
        input.classList.add("campo-error");
        if (spanError) spanError.textContent = mensajeError;
    }
    revisarBoton();
}

//Activa o desactiva el botón de guardar
function revisarBoton() {
    const todoBien = (
        patrones.documento.test(inputDoc.value) &&
        patrones.soloLetras.test(inputNom.value) &&
        patrones.soloLetras.test(inputApe.value) &&
        patrones.telefono.test(inputTel.value) &&
        patrones.email.test(inputEmail.value) &&
        inputEdad.value >= 18 &&
        inputPass.value.length >= 6
    );
    btnGuardar.disabled = !todoBien;
}

//Carga los datos de la API en la tabla
async function cargarTabla(datosFiltrados = null) {
    try {
        let datos;
        if (datosFiltrados) {
            datos = datosFiltrados;
        } else {
            const res = await fetch(urlAPI);
            datos = await res.json();
        }

        tabla.innerHTML = "";
        datos.forEach(u => {
            tabla.innerHTML += `
                <tr>
                    <td>${u.documento}</td>
                    <td>${u.nombre} ${u.apellido}</td>
                    <td>${u.rol}</td>
                    <td>${u.edad} años</td>
                    <td>${u.email}</td>
                    <td>${new Date(u.registro).toLocaleDateString()}</td>
                    <td>
                        <i class="fa-solid fa-pencil icono-accion" style="color: green" data-id="${u.id}" data-accion="editar"></i>
                        <i class="fa-solid fa-trash icono-accion" style="color: red" data-id="${u.id}" data-accion="borrar"></i>
                    </td>
                </tr>
            `;
        });
    } catch (e) { console.error(e); }
}

//Mira si el documento ya está registrado
async function esDuplicado(doc) {
    const res = await fetch(`${urlAPI}?documento=${doc}`);
    const registros = await res.json();
    return registros.length > 0;
}

// Procesa el guardado POST o la actualización PUT
async function guardarUsuario(e) {
    e.preventDefault();

    if (!idEdicion && await esDuplicado(inputDoc.value)) {
        return Swal.fire("Error", "Este documento ya existe", "error");
    }

    const usuario = {
        documento: inputDoc.value,
        nombre: inputNom.value,
        apellido: inputApe.value,
        edad: parseInt(inputEdad.value),
        telefono: inputTel.value,
        email: inputEmail.value,
        rol: inputRol.value,
        contrasena: inputPass.value,
        registro: idEdicion ? undefined : new Date().toISOString()
    };

    if (idEdicion) delete usuario.registro;

    await fetch(idEdicion ? `${urlAPI}/${idEdicion}` : urlAPI, {
        method: idEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    cerrarModal();
    cargarTabla();
    Swal.fire("Éxito", "Proceso completado", "success");
}

//El filtro por rol
async function filtrar() {
    const res = await fetch(urlAPI);
    const todos = await res.json();
    const seleccion = filtroRol.value;

    if (seleccion === "TODOS") {
        cargarTabla(todos);
    } else {
        const filtrados = todos.filter(u => u.rol === seleccion);
        cargarTabla(filtrados);
    }
}

//Maneja los clics en los iconos de la tabla
async function accionesTabla(evento) {
    const id = evento.target.dataset.id;
    const accion = evento.target.dataset.accion;

    //Si no se hizo clic en un icono, salimos
    if (!id) return;

    //Cuando se hace clic en el boton de borrar
    if (accion === "borrar") {
        const confirmar = await Swal.fire({ title: "¿Borrar?", showCancelButton: true });
        if (confirmar.isConfirmed) {
            await fetch(`${urlAPI}/${id}`, { method: "DELETE" });
            cargarTabla();
        }
    }

    //Cuando se hace clic en el boton de editar
    if (accion === "editar") {
        const res = await fetch(`${urlAPI}/${id}`);
        const u = await res.json();
        
        inputDoc.value = u.documento;
        inputNom.value = u.nombre;
        inputApe.value = u.apellido;
        inputEdad.value = u.edad;
        inputTel.value = u.telefono;
        inputEmail.value = u.email;
        inputRol.value = u.rol;
        inputPass.value = u.contrasena;

        idEdicion = id;
        tituloForm.textContent = "Actualizar Usuario";
        btnGuardar.textContent = "Actualizar";
        abrirModal();
        
        [inputDoc, inputNom, inputApe, inputTel, inputEmail].forEach(i => i.classList.add("campo-exito"));
    }
}

//Abre el modal
function abrirModal() { 
    modal.style.display = "flex"; revisarBoton(); }

//Cierra el modal 
function cerrarModal() {
    modal.style.display = "none";
    formulario.reset();
    idEdicion = null;
    tituloForm.textContent = "Registrar Nuevo Usuario";
    btnGuardar.textContent = "Guardar";
    [inputDoc, inputNom, inputApe, inputEdad, inputTel, inputEmail, inputPass].forEach(i => {
        i.classList.remove("campo-error", "campo-exito");
        document.getElementById(`error-${i.id}`).textContent = "";
    });
}

//Cambiar los campos con base al rol, pero es un prototipo, no es la mejor forma de hacerlo
function cambiarCamposPorRol() {
    const rolSeleccionado = inputRol.value;

    // Primero ocultamos todo para "limpiar"
    seccionResidente.style.display = "none";
    seccionAcopio.style.display = "none";

    // Mostramos solo el que necesitamos
    if (rolSeleccionado === "RESIDENTE") {
        seccionResidente.style.display = "grid";
    } else if (rolSeleccionado === "PUNTO_ACOPIO") {
        seccionAcopio.style.display = "grid";
    }
}


//Los listeners con sus eventos y la funcion que ejecuta toda la logica
inputDoc.addEventListener("input", () => validarCampo(inputDoc, patrones.documento, "Use 8 o 10 números."));
inputNom.addEventListener("input", () => validarCampo(inputNom, patrones.soloLetras, "Use al menos 3 letras."));
inputApe.addEventListener("input", () => validarCampo(inputApe, patrones.soloLetras, "Use al menos 3 letras."));
inputTel.addEventListener("input", () => validarCampo(inputTel, patrones.telefono, "Use 10 números."));
inputEmail.addEventListener("input", () => validarCampo(inputEmail, patrones.email, "Correo inválido."));
inputEdad.addEventListener("input", revisarBoton);
inputPass.addEventListener("input", revisarBoton);
inputRol.addEventListener("change", cambiarCamposPorRol);

btnAbrir.addEventListener("click", abrirModal);
btnCancelar.addEventListener("click", cerrarModal);
formulario.addEventListener("submit", guardarUsuario);
tabla.addEventListener("click", accionesTabla);
filtroRol.addEventListener("change", filtrar);

document.addEventListener("DOMContentLoaded", () => cargarTabla());