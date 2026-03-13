let correctPassword = "ADSO2026";

const btnEnviar = document.querySelector("#btnIngresar");
const inputAge = document.getElementById("userAge");
const text = document.getElementById("textMesage");
const inputName = document.getElementById("userName");
const password= document.querySelector("#passwordAccount");

btnEnviar.addEventListener("click", function(){
    //Validaciones
    if(inputName.value === ""){
        inputName.classList.add("error-input");
        
        text.classList.add("alert-text");
        text.textContent = `Debes escribir un nombre valido`
        
        return;
    }

    inputName.classList.remove("error-input");
    text.classList.remove("alert-text")


    if(Number(inputAge.value) <= 17){
        inputAge.classList.add("error-input");
        
        text.classList.add("alert-text");
        text.textContent = `ERROR: No se permite menores de edad`
    
        return;
    }
    inputAge.classList.remove("error-input");
    text.classList.remove("alert-text")

    if(password.value != correctPassword){
        password.classList.add("error-input");
        
        text.classList.add("alert-text");
        text.textContent = `ERROR: La contrañsea no es la correcta`
        return;
    }

    password.classList.remove("error-input");
    text.classList.remove("alert-text")


    inputName.classList.add("input-exito");
    inputAge.classList.add("input-exito");
    password.classList.add("input-exito");

    // 2. Cambiamos el H1 (necesitas capturarlo arriba primero con un id)
    const titulo = document.querySelector("h1"); 
    titulo.textContent = `Agente ${inputName.value} Activado`;

    // 3. Deshabilitamos el botón para que no sigan dando clic
    btnEnviar.disabled = true;

    // 4. Mensaje final de éxito
    text.classList.remove("alert-text");
    text.textContent = "Acceso total concedido";

})