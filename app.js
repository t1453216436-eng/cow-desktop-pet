const DEFAULT_STATE = { hunger: 0.35, energy: 0.75, affection: 0.55, sleeping: false, lastAction: "刚刚搬进你的手机桌面", lastUpdated: Date.now() };
const state = { ...DEFAULT_STATE };
const cowModel = document.querySelector("#cowModel");
const cowLane = document.querySelector("#cowLane");
const cowStage = document.querySelector("#cowButton");
const modelLayer = document.querySelector("#modelLayer");
const cowCanvas = document.querySelector("#cowCanvas");
const sleepMark = document.querySelector("#sleepMark");
const moodBadge = document.querySelector("#moodBadge");
const speech = document.querySelector("#speech");
const lastAction = document.querySelector("#lastAction");
const hungerMeter = document.querySelector("#hungerMeter");
const energyMeter = document.querySelector("#energyMeter");
const affectionMeter = document.querySelector("#affectionMeter");
const clamp = (value) => Math.min(1, Math.max(0, value));
const motion = { x: 24, direction: 1, speed: 14, behavior: "walk", grazeUntil: 0, nextGrazeAt: Date.now() + 9000, lastMotionAt: 0 };
const modelState = { enabled: false, ready: false, scene: null, camera: null, renderer: null, mixer: null, model: null, clock: null, actions: {}, currentAction: null, direction: 1, x: 0 };

function setViewportHeight() { document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`); }
function timePeriod(date = new Date()) { const hour = date.getHours(); if (hour >= 5 && hour < 9) return { key: "morning", label: "清晨" }; if (hour >= 9 && hour < 17) return { key: "day", label: "白天" }; if (hour >= 17 && hour < 20) return { key: "evening", label: "傍晚" }; return { key: "night", label: "夜晚" }; }
function applyElapsedTime(now = Date.now()) { const last = Number(state.lastUpdated) || now; const elapsedHours = Math.min(Math.max((now - last) / 3600000, 0), 12); if (elapsedHours <= 0) return; const period = timePeriod(new Date(now)).key; const naturalFeedingWindow = period === "morning" || period === "day" || period === "evening"; const hungerRate = naturalFeedingWindow ? 0.018 : 0.012; const energyRate = state.sleeping ? 0.16 : (period === "night" ? -0.006 : -0.01); state.hunger = clamp(state.hunger + hungerRate * elapsedHours); state.energy = clamp(state.energy + energyRate * elapsedHours); state.affection = clamp(state.affection - 0.003 * elapsedHours); if (state.sleeping && state.energy > 0.92) { state.sleeping = false; state.lastAction = "睡醒后继续散步"; } state.lastUpdated = now; }
function mood() { if (state.sleeping || state.energy < 0.22) return { key: "sleepy", title: "犯困", line: "趴在草地上打小盹。" }; if (state.hunger > 0.72) return { key: "hungry", title: "饿了", line: "牛习惯少量多次吃草，现在想慢慢采食。" }; if (state.affection > 0.72) return { key: "happy", title: "开心", line: "哞！今天也很喜欢你。" }; return { key: "playful", title: "想玩", line: modelState.ready ? "用 3D 模型在草地上活动。" : "在草地上自然地漫步。" }; }
function save() { localStorage.setItem("cow-pet-state", JSON.stringify(state)); }
function load() { const raw = localStorage.getItem("cow-pet-state"); if (!raw) return; try { Object.assign(state, JSON.parse(raw)); } catch { localStorage.removeItem("cow-pet-state"); } }
function render() { applyElapsedTime(); const currentMood = mood(); document.body.dataset.time = timePeriod().key; cowStage.classList.toggle("is-sleeping", state.sleeping); sleepMark.classList.toggle("visible", state.sleeping); moodBadge.textContent = currentMood.title; speech.textContent = currentMood.line; lastAction.textContent = state.lastAction; hungerMeter.value = 1 - state.hunger; energyMeter.value = state.energy; affectionMeter.value = state.affection; document.title = `奶牛桌宠 · ${currentMood.title}`; save(); }
function touchNow() { state.lastUpdated = Date.now(); }
function feed() { applyElapsedTime(); state.hunger = clamp(state.hunger - 0.18); state.energy = clamp(state.energy + 0.04); state.affection = clamp(state.affection + 0.025); state.sleeping = false; motion.behavior = "graze"; motion.grazeUntil = Date.now() + 7000; state.lastAction = "慢慢吃了一小把牧草"; touchNow(); render(); }
function petHead() { applyElapsedTime(); state.affection = clamp(state.affection + 0.08); state.energy = clamp(state.energy - 0.015); state.sleeping = false; state.lastAction = "被摸摸头了"; touchNow(); render(); }
function nap() { applyElapsedTime(); state.sleeping = true; state.energy = clamp(state.energy + 0.08); state.hunger = clamp(state.hunger + 0.025); state.lastAction = "趴在草地上睡着了"; touchNow(); render(); }
function clean() { applyElapsedTime(); state.affection = clamp(state.affection + 0.045); state.hunger = clamp(state.hunger + 0.015); state.sleeping = false; state.lastAction = "毛毛变干净了"; touchNow(); render(); }
function updateCowMotion(now) { const stageWidth = cowStage.clientWidth; const cowWidth = cowLane.offsetWidth || 300; const minX = 4; const maxX = Math.max(minX, stageWidth - cowWidth - 4); if (state.sleeping) { cowLane.classList.remove("is-grazing"); cowLane.style.setProperty("--cow-x", `${motion.x}px`); cowLane.style.setProperty("--cow-dir", motion.direction); motion.lastMotionAt = now; return; } if (motion.behavior === "graze" || now > motion.nextGrazeAt || state.hunger > 0.68) { motion.behavior = "graze"; if (!motion.grazeUntil || motion.grazeUntil < now) motion.grazeUntil = now + (state.hunger > 0.68 ? 8000 : 5200); cowLane.classList.add("is-grazing"); if (now > motion.grazeUntil) { motion.behavior = "walk"; motion.nextGrazeAt = now + 12000 + Math.random() * 11000; motion.grazeUntil = 0; } } else { cowLane.classList.remove("is-grazing"); const dt = motion.lastMotionAt ? Math.min((now - motion.lastMotionAt) / 1000, 0.08) : 0; motion.x += motion.direction * motion.speed * dt; if (motion.x >= maxX) { motion.x = maxX; motion.direction = -1; motion.nextGrazeAt = Math.min(motion.nextGrazeAt, now + 1600); } if (motion.x <= minX) { motion.x = minX; motion.direction = 1; motion.nextGrazeAt = Math.min(motion.nextGrazeAt, now + 1600); } } motion.lastMotionAt = now; cowLane.style.setProperty("--cow-x", `${motion.x}px`); cowLane.style.setProperty("--cow-dir", motion.direction); }

async function initModel() {
  try {
    const response = await fetch("assets/models/cow.glb", { cache: "no-store" });
    if (!response.ok) return;
    const [THREE, loaderModule] = await Promise.all([
      import("three"),
      import("https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/GLTFLoader.js")
    ]);
    const url = URL.createObjectURL(await response.blob());
    modelState.clock = new THREE.Clock();
    modelState.scene = new THREE.Scene();
    modelState.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    modelState.camera.position.set(0, 1.15, 6.2);
    modelState.renderer = new THREE.WebGLRenderer({ canvas: cowCanvas, alpha: true, antialias: true });
    modelState.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    modelState.renderer.outputColorSpace = THREE.SRGBColorSpace;
    modelState.scene.add(new THREE.HemisphereLight(0xffffff, 0x5a6b45, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(3, 4, 5);
    modelState.scene.add(key);
    const loader = new loaderModule.GLTFLoader();
    const gltf = await loader.loadAsync(url);
    URL.revokeObjectURL(url);
    modelState.model = gltf.scene;
    modelState.model.traverse((child) => { if (child.isMesh) { child.castShadow = false; child.frustumCulled = false; } });
    const box = new THREE.Box3().setFromObject(modelState.model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 2.45 / Math.max(size.x, size.y, size.z);
    modelState.model.scale.setScalar(scale);
    modelState.model.position.set(-center.x * scale, -box.min.y * scale - 1.12, -center.z * scale);
    modelState.scene.add(modelState.model);
    modelState.mixer = new THREE.AnimationMixer(modelState.model);
    gltf.animations.forEach((clip) => { modelState.actions[clip.name.toLowerCase()] = modelState.mixer.clipAction(clip); });
    modelState.ready = true;
    document.body.classList.add("model-ready");
    resizeModel();
  } catch (error) {
    console.info("3D model not loaded; using articulated fallback.", error); document.body.classList.add("model-failed");
  }
}
function resizeModel() { if (!modelState.renderer || !modelLayer) return; const rect = modelLayer.getBoundingClientRect(); const width = Math.max(1, rect.width); const height = Math.max(1, rect.height); modelState.renderer.setSize(width, height, false); modelState.camera.aspect = width / height; modelState.camera.updateProjectionMatrix(); }
function findAction(names) { const entries = Object.entries(modelState.actions); for (const name of names) { const key = name.toLowerCase(); const exact = modelState.actions[key]; if (exact) return exact; const fuzzy = entries.find(([actionName]) => actionName.includes(key)); if (fuzzy) return fuzzy[1]; } return entries[0]?.[1]; }
function playModelAction(kind) { if (!modelState.ready || !modelState.mixer) return; const action = kind === "sleep" ? findAction(["sleep", "idle"]) : kind === "graze" ? findAction(["graze", "eat", "eating", "idle"]) : findAction(["walk", "walking", "run", "idle"]); if (!action || action === modelState.currentAction) return; action.reset().fadeIn(0.25).play(); if (modelState.currentAction) modelState.currentAction.fadeOut(0.25); modelState.currentAction = action; }
function updateModel(now) { if (!modelState.ready) return; const stageWidth = cowStage.clientWidth; const min = -1.35; const max = 1.35; const dt = modelState.clock.getDelta(); if (state.sleeping) { playModelAction("sleep"); } else if (motion.behavior === "graze" || state.hunger > 0.68) { playModelAction("graze"); } else { playModelAction("walk"); modelState.x += modelState.direction * dt * 0.22; if (modelState.x > max) { modelState.x = max; modelState.direction = -1; } if (modelState.x < min) { modelState.x = min; modelState.direction = 1; } }
  if (modelState.model) { modelState.model.position.x = modelState.x; modelState.model.rotation.y = modelState.direction > 0 ? Math.PI / 2 : -Math.PI / 2; }
  modelState.mixer?.update(dt);
  modelState.renderer.render(modelState.scene, modelState.camera);
}
function loop(now) { updateCowMotion(now); updateModel(now); requestAnimationFrame(loop); }
document.querySelector(".actions").addEventListener("click", (event) => { const button = event.target.closest("button"); if (!button) return; const action = button.dataset.action; if (action === "feed") feed(); if (action === "pet") petHead(); if (action === "nap") nap(); if (action === "clean") clean(); });
cowStage.addEventListener("click", petHead);
window.addEventListener("resize", () => { setViewportHeight(); resizeModel(); });
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
setViewportHeight(); load(); render(); initModel(); requestAnimationFrame(loop); setInterval(render, 60000);



