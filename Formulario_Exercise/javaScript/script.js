const btnEnviar = document.getElementById("btnEnviar");
const inputAge = document.getElementById("userAge");
const text = document.getElementById("changeText");

btnEnviar.addEventListener("click", function(){
    
    if(Number(inputAge.value) >= 18){
        inputAge.classList.remove("borde-rojo"); //limpiar
        inputAge.classList.add("borde-verde")

        text.textContent = `Tu puedes entrar a la discoteca`
        text.classList.remove("error");
    }else{
        inputAge.classList.remove("borde-verde"); 
        inputAge.classList.add("borde-rojo")
        text.classList.add("error")
        text.textContent= `Error: Estas ingresando una edad no valida`
    }

})