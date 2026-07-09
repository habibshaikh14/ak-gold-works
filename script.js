const validCredentials = {
  habib: "akgoldworks",
  akhtar: "akgoldworks"
};

const loginForm = document.getElementById("loginForm");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const errorMessage = document.getElementById("errorMessage");
const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (validCredentials[username] && validCredentials[username] === password) {
    errorMessage.textContent = "";
    userName.textContent = username;
    loginCard.classList.add("hidden");
    dashboard.classList.remove("hidden");
    return;
  }

  errorMessage.textContent = "Invalid username or password.";
});

logoutButton.addEventListener("click", () => {
  loginForm.reset();
  errorMessage.textContent = "";
  dashboard.classList.add("hidden");
  loginCard.classList.remove("hidden");
});
