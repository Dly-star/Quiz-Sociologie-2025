const firebaseConfig = {
  apiKey: "AIzaSyBEWZpjSBGg0Mqi5qrVxrdYAgEdh1bRvvo",
  authDomain: "evaluation-ce065.firebaseapp.com",
  projectId: "evaluation-ce065",
  storageBucket: "evaluation-ce065.firebasestorage.app",
  messagingSenderId: "43890339600",
  appId: "1:43890339600:web:6ef66e642b84e32ead7f95"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let selectedQuestions = [];
let currentIndex = 0;
let currentScore = 0;
let user = { nom: "", matricule: "" };

function startQuiz() {
  const n = document.getElementById("nom").value.trim();
  const m = document.getElementById("matricule").value.trim();
  
  if (!n || !m) return alert("Veuillez entrer votre nom et votre matricule");
  
  // ALERTE DE TEST 1
  if (typeof questions === 'undefined') {
    return alert("Erreur : Le fichier des questions n'est pas chargé !");
  }

  user.nom = n;
  user.matricule = m;
  
  try {
    selectedQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 20);
    currentIndex = 0;
    currentScore = 0;
    document.getElementById("login").style.display = "none";
    document.getElementById("quiz").style.display = "block";
    showQuestion();
  } catch (err) {
    alert("Erreur technique : " + err.message);
  }
}

function showQuestion() {
  const q = selectedQuestions[currentIndex];
  document.getElementById("question-number").innerText = `Question ${currentIndex + 1} / 20`;
  document.getElementById("question-text").innerText = q.question;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    optionsDiv.innerHTML += `<label class="option-label"><input type="checkbox" name="quiz-opt" value="${i}"> ${opt}</label>`;
  });
  document.getElementById("feedback").innerText = "";
  document.getElementById("correction").innerText = "";
  document.getElementById("btn-valider").style.display = "block";
}

async function submitAnswer() {
  const checkboxes = document.querySelectorAll("input[name='quiz-opt']:checked");
  const reponsesUtilisateurIndex = Array.from(checkboxes).map(cb => parseInt(cb.value));
  if (reponsesUtilisateurIndex.length === 0) return alert("Choisissez au moins une option");
  const q = selectedQuestions[currentIndex];
  const estCorrecte = JSON.stringify(reponsesUtilisateurIndex.sort()) === JSON.stringify(q.correct.sort());
  if (estCorrecte) currentScore++;
  document.getElementById("feedback").innerText = estCorrecte ? "Bonne réponse ✅" : "Mauvaise réponse ❌";
  document.getElementById("feedback").style.color = estCorrecte ? "green" : "red";
  document.getElementById("correction").innerText = "Réponse attendue : " + q.correct.map(i => q.options[i]).join(", ");
  document.getElementById("btn-valider").style.display = "none";
  await saveToFirebase(q.question, reponsesUtilisateurIndex.map(i => q.options[i]), q.correct.map(i => q.options[i]), estCorrecte);
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < selectedQuestions.length) showQuestion();
    else finishQuiz();
  }, 2500);
}

async function saveToFirebase(qText, uAns, cAns, isOk) {
  const scoreFinalTemp = Math.round((currentScore / 20) * 100);
  const docRef = db.collection("evaluations").doc(user.matricule);
  try {
      await docRef.set({
        nom: user.nom,
        matricule: user.matricule,
        scoreFinal: scoreFinalTemp,
        date: new Date().toLocaleString()
      }, { merge: true });
      await docRef.collection("reponses").add({
        question: qText,
        reponseUtilisateur: uAns,
        reponseCorrecte: cAns,
        resultat: isOk,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (e) { console.error("Erreur sauvegarde :", e); }
}

function finishQuiz() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("result").style.display = "block";
  const finalPercent = Math.round((currentScore / 20) * 100);
  document.getElementById("score-display").innerText = finalPercent + "%";
}

async function checkMyResults() {
  const m = document.getElementById("matricule").value.trim();
  if (!m) return alert("Entrez votre matricule pour voir vos résultats");
  const content = document.getElementById("review-content");
  document.getElementById("login").style.display = "none";
  document.getElementById("student-review").style.display = "block";
  content.innerHTML = "Chargement de vos résultats...";
  try {
    const doc = await db.collection("evaluations").doc(m).get();
    if (!doc.exists) {
        content.innerHTML = "<h3>Aucun résultat trouvé</h3>";
        return;
    }
    const d = doc.data();
    let html = `<h3>${d.nom} - ${d.scoreFinal}%</h3><hr>`;
    const snap = await db.collection("evaluations").doc(m).collection("reponses").orderBy("timestamp").get();
    snap.forEach(rDoc => {
      const r = rDoc.data();
      html += `<div style="padding:10px; border-bottom:1px solid #eee; background:${r.resultat ? '#f0fff0' : '#fff0f0'}">
            <p><b>${r.resultat ? '✅' : '❌'} ${r.question}</b></p>
            <p><small>Votre réponse: ${r.reponseUtilisateur.join(", ")}</small></p>
        </div>`;
    });
    content.innerHTML = html;
  } catch (e) { content.innerHTML = "Erreur de chargement."; }
}

function openAbout() { document.getElementById('about-modal').style.display = 'flex'; }
function closeAbout() { document.getElementById('about-modal').style.display = 'none'; }

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
                               }
  
