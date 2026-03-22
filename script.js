const app = document.getElementById("app");
const overlay = document.getElementById("transitionOverlay");

const imagePaths = [
  "images/back.png",
  "images/pic1.jpg",
  "images/pic2.jpg",
  "images/pic3.jpg",
  "images/pic4.jpg",
  "images/pic_ok.jpg",
  "images/pic_nok.jpg"
];

const persuasionSteps = [
  {
    text: "Ei Clau, non mi rembra una scelta appropriata! Sei sicura di non accettare?",
    hint: "(Se cambi idea, premi NO)",
    acceptOnYes: false,
    image: "images/pic1.jpg",
    resistance: 8
  },
  {
    text: "Non è che hai sbagliato tasto?",
    hint: "(Capita! Premi SÌ!)",
    acceptOnYes: true,
    image: "images/pic2.jpg",
    resistance: 31
  },
  {
    text: "Realizzeremo tutti i nostri progetti! Cambia idea dai 🙂",
    hint: "(Se cambi idea, premi SÌ)",
    acceptOnYes: true,
    image: "images/pic3.jpg",
    resistance: 56
  },
  {
    text: "Ultima chance… sicurissima? OOOHH",
    hint: "(Se cambi idea, premi NO)",
    acceptOnYes: false,
    image: "images/pic4.jpg",
    resistance: 82
  }
];

const state = {
  route: "start",
  persuasionIndex: 0,
  finalText: "Yeppaaa\n\nGiovedì sera sei a cena fuori con me 🙂",
  finalImage: "images/pic_ok.jpg"
};

let loadingTimeouts = [];

function preloadImages(paths) {
  paths.forEach((path) => {
    const img = new Image();
    img.src = path;
  });
}

function clearLoadingTimeouts() {
  loadingTimeouts.forEach((id) => clearTimeout(id));
  loadingTimeouts = [];
}

function setRoute(route) {
  clearLoadingTimeouts();
  state.route = route;
  render();
}

function navigateWithFade(route) {
  clearLoadingTimeouts();

  if (!overlay) {
    state.route = route;
    render();
    return;
  }

  overlay.classList.add("active");

  setTimeout(() => {
    state.route = route;
    render();

    setTimeout(() => {
      overlay.classList.remove("active");
    }, 50);
  }, 260);
}

function closePage() {
  window.close();

  setTimeout(() => {
    navigateWithFade("start");
  }, 150);
}

function backgroundScreen(image, content) {
  return `
    <div class="screen" style="background-image: url('${image}')">
      <div class="overlay"></div>
      ${content}
      <div class="footer">© Travvix</div>
    </div>
  `;
}

function startPersuasion() {
  state.persuasionIndex = 0;
  navigateWithFade("persuade");
}

function nextPersuasion() {
  if (state.persuasionIndex >= persuasionSteps.length - 1) {
    navigateWithFade("not_funny");
  } else {
    state.persuasionIndex += 1;
    render();
  }
}

function startLoading() {
  navigateWithFade("loading");
}

function handlePersuadeYes() {
  const step = persuasionSteps[state.persuasionIndex];

  if (step.acceptOnYes) {
    startLoading();
  } else {
    nextPersuasion();
  }
}

function handlePersuadeNo() {
  const step = persuasionSteps[state.persuasionIndex];

  if (!step.acceptOnYes) {
    startLoading();
  } else {
    nextPersuasion();
  }
}

function runLoadingSequence() {
  const text = document.getElementById("loadingText");
  const bar = document.getElementById("progressBar");

  if (!text || !bar) return;

  const steps = [
    { message: "Loading...", value: 0, delay: 850 },
    { message: "Verifica compatibilità...", value: 28, delay: 950 },
    { message: "Analizzando il livello di simpy...", value: 58, delay: 950 },
    { message: "Che fortunella sei...", value: 86, delay: 950 },
    { message: "Esito: approved ✅", value: 100, delay: 700 }
  ];

  let currentDelay = 0;

  steps.forEach((step) => {
    const timeoutId = setTimeout(() => {
      text.textContent = step.message;
      bar.style.width = `${step.value}%`;
    }, currentDelay);

    loadingTimeouts.push(timeoutId);
    currentDelay += step.delay;
  });

  const finalTimeout = setTimeout(() => {
    navigateWithFade("final");
  }, currentDelay);

  loadingTimeouts.push(finalTimeout);
}

function renderStartScreen() {
  app.innerHTML = backgroundScreen("images/back.png", `
    <div class="card">
      <h2>Ei, sei sola in questo momento?</h2>
      <div class="buttons">
        <button onclick="navigateWithFade('question')">Sì</button>
        <button onclick="closePage()">No</button>
      </div>
    </div>
  `);
}

function renderQuestionScreen() {
  app.innerHTML = backgroundScreen("images/back.png", `
    <div class="card">
      <p>La vita è troppo breve per sprecare del tempo insieme.<br></p>
      <h2>Vuoi ri-iniziare a frequentarsi?</h2>
      <div class="buttons">
        <button onclick="startLoading()">Sì</button>
        <button class="secondary" onclick="startPersuasion()">No</button>
        <button class="secondary" onclick="startPersuasion()">Forse</button>
      </div>
    </div>
  `);
}

function renderLoadingScreen() {
  app.innerHTML = backgroundScreen("images/back.png", `
    <div class="card">
      <h2>Sistema in elaborazione</h2>
      <p id="loadingText">Loading...</p>
      <div class="progress">
        <div class="progress-bar" id="progressBar"></div>
      </div>
      <p class="small-text">Non chiudere l'app, sto cucinando.</p>
    </div>
  `);

  runLoadingSequence();
}

function renderPersuadeScreen() {
  const step = persuasionSteps[state.persuasionIndex];

  app.innerHTML = backgroundScreen(step.image, `
    <div class="card">
      <p class="round-label">Round ${state.persuasionIndex + 1}/${persuasionSteps.length}</p>

      <div class="meter-wrap">
        <div class="meter-label">Antipatia: ${step.resistance}%</div>
        <div class="meter">
          <div class="meter-fill" style="width: ${step.resistance}%"></div>
        </div>
      </div>

      <h2>${step.text}</h2>
      <p>${step.hint}</p>

      <div class="buttons">
        <button class="secondary" onclick="handlePersuadeNo()">No</button>
        <button onclick="handlePersuadeYes()">Sì</button>
      </div>
    </div>
  `);
}

function renderFinalScreen() {
  app.innerHTML = backgroundScreen(state.finalImage, `
    <div class="card">
      <p class="success-label">Missione compiuta ✨</p>
      <h2 style="white-space: pre-line;">${state.finalText}</h2>
      <div class="buttons">
        <button onclick="closePage()">Chiudi</button>
      </div>
    </div>
  `);
}

function renderNotFunnyScreen() {
  app.innerHTML = backgroundScreen("images/frieren.jpg", `
    <div class="card">
      <h2>Non sei per niente simpy</h2>
      <p>Frieren non approva questa scelta.</p>
      <div class="buttons">
        <button onclick="closePage()">Close</button>
      </div>
    </div>
  `);
}

function renderNotInterestedScreen() {
  app.innerHTML = backgroundScreen("images/back.png", `
    <div class="card">
      <h2>Va bene dai 😌</h2>
      <p>Puoi chiudere la pagina oppure ripensarci.</p>
      <div class="buttons">
        <button onclick="navigateWithFade('start')">Torna indietro</button>
      </div>
    </div>
  `);
}

function render() {
  switch (state.route) {
    case "start":
      renderStartScreen();
      break;
    case "question":
      renderQuestionScreen();
      break;
    case "loading":
      renderLoadingScreen();
      break;
    case "persuade":
      renderPersuadeScreen();
      break;
    case "final":
      renderFinalScreen();
      break;
    case "not_funny":
      renderNotFunnyScreen();
      break;
    case "not_interested":
      renderNotInterestedScreen();
      break;
    default:
      renderStartScreen();
      break;
  }
}

preloadImages(imagePaths);
render();