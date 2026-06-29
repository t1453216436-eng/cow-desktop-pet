const state = { hunger: 0.35, energy: 0.75, affection: 0.55, sleeping: false, lastAction: "刚刚搬进你的手机桌面" };
const cow = document.querySelector(".cow");
const sleepMark = document.querySelector("#sleepMark");
const moodBadge = document.querySelector("#moodBadge");
const speech = document.querySelector("#speech");
const lastAction = document.querySelector("#lastAction");
const hungerMeter = document.querySelector("#hungerMeter");
const energyMeter = document.querySelector("#energyMeter");
const affectionMeter = document.querySelector("#affectionMeter");
const cowButton = document.querySelector("#cowButton");
const clamp = (value) => Math.min(1, Math.max(0, value));

function mood() {
  if (state.sleeping || state.energy < 0.25) return { key: "sleepy", title: "犯困", line: "眼皮有点重，想小睡。" };
  if (state.hunger > 0.7) return { key: "hungry", title: "饿了", line: "想吃一口新鲜牧草。" };
  if (state.affection > 0.72) return { key: "happy", title: "开心", line: "哞！今天也很喜欢你。" };
  return { key: "playful", title: "想玩", line: "快摸摸我的脑袋。" };
}
function save() { localStorage.setItem("cow-pet-state", JSON.stringify(state)); }
function load() { const raw = localStorage.getItem("cow-pet-state"); if (!raw) return; try { Object.assign(state, JSON.parse(raw)); } catch { localStorage.removeItem("cow-pet-state"); } }
function hop() { cow.classList.remove("hop"); window.requestAnimationFrame(() => cow.classList.add("hop")); }
function render() {
  const currentMood = mood();
  cow.classList.toggle("sleeping", state.sleeping);
  cow.classList.toggle("hungry", currentMood.key === "hungry");
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
function feed() { state.hunger = clamp(state.hunger - 0.28); state.energy = clamp(state.energy + 0.08); state.affection = clamp(state.affection + 0.05); state.sleeping = false; state.lastAction = "吃了一把牧草"; hop(); render(); }
function petHead() { state.affection = clamp(state.affection + 0.14); state.energy = clamp(state.energy - 0.04); state.sleeping = false; state.lastAction = "被摸摸头了"; hop(); render(); }
function nap() { state.sleeping = true; state.energy = clamp(state.energy + 0.22); state.hunger = clamp(state.hunger + 0.08); state.lastAction = "睡了一个软乎乎的小觉"; render(); }
function clean() { state.affection = clamp(state.affection + 0.08); state.hunger = clamp(state.hunger + 0.04); state.sleeping = false; state.lastAction = "毛毛变干净了"; hop(); render(); }
function tick() {
  if (state.sleeping) { state.energy = clamp(state.energy + 0.015); state.hunger = clamp(state.hunger + 0.01); if (state.energy > 0.95) { state.sleeping = false; state.lastAction = "睡醒啦"; hop(); } }
  else { state.hunger = clamp(state.hunger + 0.008); state.energy = clamp(state.energy - 0.006); state.affection = clamp(state.affection - 0.002); }
  render();
}
document.querySelector(".actions").addEventListener("click", (event) => { const button = event.target.closest("button"); if (!button) return; const action = button.dataset.action; if (action === "feed") feed(); if (action === "pet") petHead(); if (action === "nap") nap(); if (action === "clean") clean(); });
cowButton.addEventListener("click", petHead);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
load(); render(); setInterval(tick, 4000);
