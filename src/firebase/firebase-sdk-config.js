const firebaseConfig = {
  apiKey: "AIzaSyCk5aT6e3I7kDIgPNZ_kmAUkjnjGGvgGGA",
  authDomain: "ak-gold-works.firebaseapp.com",
  projectId: "ak-gold-works",
  storageBucket: "ak-gold-works.firebasestorage.app",
  messagingSenderId: "846501138288",
  appId: "1:846501138288:web:633dd0986a3576aa7fc9b5",
  measurementId: "G-H1D6SNNLCF"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
