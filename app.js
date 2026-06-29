const DEFAULT_STATE = { hunger: 0.35, energy: 0.75, affection: 0.55, sleeping: false, lastAction: "刚刚搬进你的手机桌面", lastUpdated: Date.now() };
const state = { ...DEFAULT_STATE };
const cow = document.querySelector(".cow");
const cowStage = document.querySelector("#cowButton");
const sleepMark = document.querySelector("#sleepMark");
const moodBadge = document.querySelector("#moodBadge");
const speech = document.querySelector("#speech");
const lastAction = document.querySelector("#lastAction");
const hungerMeter = document.querySelector("#hungerMeter");
const energyMeter = document.querySelector("#energyMeter");
const affectionMeter = document.querySelector("#affectionMeter");
const clamp = (value) => Math.min(1, Math.max(0, value));

function timePeriod(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return { key: "morning", label: "清晨" };
  if (hour >= 9 && hour < 17) return { key: "day", label: "白天" };
  if (hour >= 17 && hour < 20) return { key: "evening", label: "傍晚" };
  return { key: "night", label: "夜晚" };
}

function applyElapsedTime(now = Date.now()) {
  const last = Number(state.lastUpdated) || now;
  const elapsedHours = Math.min(Math.max((now - last) / 3600000, 0), 12);
  if (elapsedHours <= 0) return;

  const period = timePeriod(new Date(now)).key;
  const naturalFeedingWindow = period === "morning" || period === "day" || period === "evening";
  const hungerRate = naturalFeedingWindow ? 0.018 : 0.012;
  const energyRate = state.sleeping ? 0.16 : (period === "night" ? -0.006 : -0.01);
  const affectionRate = 0.003;

  state.hunger = clamp(state.hunger + hungerRate * elapsedHours);
  state.energy = clamp(state.energy + energyRate * elapsedHours);
  state.affection = clamp(state.affection - affectionRate * elapsedHours);

  if (state.sleeping && state.energy > 0.92) {
    state.sleeping = false;
    state.lastAction = "睡醒后继续散步";
  }

  state.lastUpdated = now;
}

function mood() {
  if (state.sleeping || state.energy < 0.22) return { key: "sleepy", title: "犯困", line: "趴在草地上打小盹。" };
  if (state.hunger > 0.72) return { key: "hungry", title: "饿了", line: "牛习惯少量多次吃草，现在想慢慢采食。" };
  if (state.affection > 0.72) return { key: "happy", title: "开心", line: "哞！今天也很喜欢你。" };
  return { key: "playful", title: "想玩", line: "在草地上慢慢走来走去。" };
}
function save() { localStorage.setItem("cow-pet-state", JSON.stringify(state)); }
function load() { const raw = localStorage.getItem("cow-pet-state"); if (!raw) return; try { Object.assign(state, JSON.parse(raw)); } catch { localStorage.removeItem("cow-pet-state"); } }
function hop() { cow.classList.remove("hop"); window.requestAnimationFrame(() => cow.classList.add("hop")); }
function render() {
  applyElapsedTime();
  const currentMood = mood();
  document.body.dataset.time = timePeriod().key;
  cow.classList.toggle("sleeping", state.sleeping);
  cow.classList.toggle("hungry", currentMood.key === "hungry");
  cowStage.classList.toggle("is-sleeping", state.sleeping);
  sleepMark.classList.toggle("visible", state.sleeping);
  moodBadge.textContent = currentMood.title;
  speech.textContent = currentMood.line;
  lastAction.textContent = state.lastAction;
  hungerMeter.value = 1 - state.hunger;
  energyMeter.value = state.energy;
  affectionMeter.value = state.affection;
  document.title = `奶牛桌宠 · ${currentMood.title}`;
  save();
}
function touchNow() { state.lastUpdated = Date.now(); }
function feed() { applyElapsedTime(); state.hunger = clamp(state.hunger - 0.18); state.energy = clamp(state.energy + 0.04); state.affection = clamp(state.affection + 0.025); state.sleeping = false; state.lastAction = "慢慢吃了一小把牧草"; touchNow(); hop(); render(); }
function petHead() { applyElapsedTime(); state.affection = clamp(state.affection + 0.08); state.energy = clamp(state.energy - 0.015); state.sleeping = false; state.lastAction = "被摸摸头了"; touchNow(); hop(); render(); }
function nap() { applyElapsedTime(); state.sleeping = true; state.energy = clamp(state.energy + 0.08); state.hunger = clamp(state.hunger + 0.025); state.lastAction = "趴在草地上睡着了"; touchNow(); render(); }
function clean() { applyElapsedTime(); state.affection = clamp(state.affection + 0.045); state.hunger = clamp(state.hunger + 0.015); state.sleeping = false; state.lastAction = "毛毛变干净了"; touchNow(); hop(); render(); }
document.querySelector(".actions").addEventListener("click", (event) => { const button = event.target.closest("button"); if (!button) return; const action = button.dataset.action; if (action === "feed") feed(); if (action === "pet") petHead(); if (action === "nap") nap(); if (action === "clean") clean(); });
cowStage.addEventListener("click", petHead);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
load(); render(); setInterval(render, 60000);
