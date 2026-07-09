const AUTH_KEY = "akg-auth";
const loginForm = document.getElementById("loginForm");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const errorMessage = document.getElementById("errorMessage");
const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const entryForm = document.getElementById("entryForm");
const entryAmount = document.getElementById("entryAmount");
const entryLabel = document.getElementById("entryLabel");
const entryList = document.getElementById("entryList");
const chips = document.querySelectorAll(".chip");

let selectedType = "AYA";
let currentUser = null;
let entries = [];

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch (error) {
    return null;
  }
}

function saveAuth(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ username: user.username, userId: user.id }));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

function showDashboard(username) {
  userName.textContent = username;
  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

function showLogin() {
  loginForm.reset();
  errorMessage.textContent = "";
  entryForm.reset();
  selectedType = "AYA";
  updateChipSelection();
  dashboard.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

async function validateUser(username, password) {
  try {
    const snapshot = await window.db.collection("users").where("username", "==", username).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (String(userData.password) === String(password)) {
      return { id: userDoc.id, ...userData };
    }

    return null;
  } catch (error) {
    console.error(error);
    errorMessage.textContent = "Could not connect to Firestore.";
    return null;
  }
}

async function loadEntriesForUser(userId) {
  try {
    const snapshot = await window.db.collection("entries").get();
    entries = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((entry) => String(entry.userId) === String(userId));
    entries.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    renderEntries();
  } catch (error) {
    console.error(error);
    entryList.innerHTML = '<tr><td colspan="4" class="entry-empty">Unable to load entries.</td></tr>';
    errorMessage.textContent = "Unable to load entries.";
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  errorMessage.textContent = "Checking credentials...";

  const user = await validateUser(username, password);
  if (user) {
    currentUser = user;
    saveAuth(user);
    errorMessage.textContent = "";
    showDashboard(user.username);
    await loadEntriesForUser(user.id);
    return;
  }

  errorMessage.textContent = "Invalid username or password.";
});

logoutButton.addEventListener("click", () => {
  clearAuth();
  currentUser = null;
  entries = [];
  renderEntries();
  showLogin();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    selectedType = chip.dataset.type;
    updateChipSelection();
  });
});

function updateChipSelection() {
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.type === selectedType);
  });
}

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const amount = parseFloat(entryAmount.value);
  if (Number.isNaN(amount)) {
    return;
  }

  const label = entryLabel.value || "No label";

  try {
    await window.db.collection("entries").add({
      amount: amount.toFixed(2),
      type: selectedType,
      label,
      createdAt: new Date(),
      userId: currentUser.id
    });

    await loadEntriesForUser(currentUser.id);
    entryForm.reset();
    selectedType = "AYA";
    updateChipSelection();
    entryAmount.focus();
  } catch (error) {
    console.error(error);
    errorMessage.textContent = "Could not save entry.";
  }
});

function renderEntries() {
  if (!entries.length) {
    entryList.innerHTML = '<tr><td colspan="4" class="entry-empty">No entries yet.</td></tr>';
    return;
  }

  entryList.innerHTML = entries
    .map((entry) => {
      const timestamp = entry.createdAt?.toDate
        ? entry.createdAt.toDate().toLocaleString()
        : "—";
      const typeClass = String(entry.type || "").toLowerCase();

      return `
        <tr class="entry-row ${typeClass}">
          <td>${entry.type}</td>
          <td>${entry.amount} g</td>
          <td>${entry.label || "—"}</td>
          <td>${timestamp}</td>
        </tr>
      `;
    })
    .join("");
}

async function initializeSession() {
  const savedAuth = loadAuth();
  if (savedAuth && savedAuth.userId && savedAuth.username) {
    currentUser = { id: savedAuth.userId, username: savedAuth.username };
    showDashboard(savedAuth.username);
    await loadEntriesForUser(savedAuth.userId);
  } else {
    clearAuth();
    showLogin();
  }
}

initializeSession();
renderEntries();
updateChipSelection();
