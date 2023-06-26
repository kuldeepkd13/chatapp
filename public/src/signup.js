const url = "http://localhost:8000";
const form = document.querySelector("form");

const usernameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  fetch(`${url}/user/register`, {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message === "Registration successful") {
    
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
    Swal.fire({
        position: "centre",
        icon: "success",
        title: "Check your mail and varification your account",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => {          
          window.location.href = "/public/login.html";
      }, 3500);
    } else {
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
      Swal.fire({
        position: "centre",
        icon: "error",
        title: `${data.message}`,
        showConfirmButton: false,
        timer: 2000,
      });
    }
      
    })
    .catch((err) => {
      console.log(err);
    });
});