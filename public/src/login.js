const url = "http://localhost:8000";
const form = document.querySelector("form");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("name"); // Add the username input element
const roomInput = document.getElementById("room"); // Add the room input element

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  fetch(`${url}/user/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.message === "Login Successfull") {
        const username = data.user.username; // Set the username as data.user.username
        const room = "chatroom"; // Set the room as "chatroom" for everyone

        emailInput.value = "";
        passwordInput.value = "";
        usernameInput.value = ""; // Clear the username input
        roomInput.value = ""; // Clear the room input

        const nextUrl = `chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(room)}`;
        window.location.href = nextUrl; // Redirect to the chat.html page with the username and room in the URL
      } else {
        emailInput.value = "";
        passwordInput.value = "";
        usernameInput.value = ""; // Clear the username input
        roomInput.value = ""; // Clear the room input
        Swal.fire({
          position: "center",
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
