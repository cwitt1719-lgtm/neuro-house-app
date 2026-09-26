const KEY = "neuro-house-v1";
const empty = () => ({
  home: { name: "", address: "", city: "", notes: "", landlord: "", hoa: "" },
  access: { keys: "", lockbox: "", garage: "", gate: "", spare: "", notes: "" },
  shutoffs: { water: "", gas: "", electric: "", breaker: "", valve: "", notes: "" },
  wifi: { network: "", password: "", router: "", guestNet: "", notes: "" },
  contacts: [],
  pets: { names: "", food: "", vet: "", meds: "", sitter: "", notes: "" },
  where: { breaker: "", waterHeater: "", fireExt: "", firstAid: "", spareKey: "", notes: "" },
  appliances: [],
  papers: []
});
let data = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
  renderTiles();
}
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("on");
  setTimeout(() => el.classList.remove("on"), 1800);
}
const SECTIONS = [
  { id: "home", title: "Home", hint: "Address and who owns the place.", color: "#22d3ee", filled: d => !!(d.home.name || d.home.address) },
  { id: "access", title: "Access", hint: "Keys, codes, garage, spare.", color: "#c084fc", filled: d => !!(d.access.keys || d.access.lockbox || d.access.garage) },
  { id: "shutoffs", title: "Shutoffs", hint: "Water, gas, electric, breaker.", color: "#f472b6", filled: d => !!(d.shutoffs.water || d.shutoffs.gas || d.shutoffs.electric) },
  { id: "wifi", title: "Wi-Fi", hint: "Network, password, router spot.", color: "#38bdf8", filled: d => !!(d.wifi.network || d.wifi.password) },
  { id: "contacts", title: "Call list", hint: "Plumber, HVAC, neighbor, landlord.", color: "#facc15", filled: d => d.contacts.length > 0 },
  { id: "pets", title: "Pets", hint: "Food, vet, who can take them.", color: "#34d399", filled: d => !!(d.pets.names || d.pets.vet) },
  { id: "where", title: "Where it is", hint: "Breaker, water heater, first aid.", color: "#a78bfa", filled: d => !!(d.where.breaker || d.where.fireExt || d.where.spareKey) },
  { id: "appliances", title: "Appliances", hint: "Make, model, warranty, who fixed it.", color: "#fb7185", filled: d => d.appliances.length > 0 },
  { id: "papers", title: "Papers", hint: "Lease, insurance — title and where it lives.", color: "#fb7185", filled: d => d.papers.length > 0 }
];
const pieceSvg = color => `<svg class="piece" viewBox="0 0 100 100"><use href="#piece" fill="${color}"/></svg>`;
function renderTiles() {
  document.getElementById("tiles").innerHTML = SECTIONS.map(s =>
    `<button class="tile ${s.filled(data) ? "" : "empty"}" data-open="${s.id}">${pieceSvg(s.color)}<h3>${s.title}</h3><span>${s.filled(data) ? "Has notes" : "Empty"}</span></button>`
  ).join("");
}
function show(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.toggle("on", el.id === id));
}
function field(name, label, value, extra = "") {
  const tag = extra.includes("rows") ? "textarea" : "input";
  const type = extra.includes("type=") ? "" : 'type="text"';
  if (tag === "input") {
    return `<label>${label}<input ${type} ${extra} data-f="${name}" value="${escAttr(value)}"></label>`;
  }
  return `<label>${label}<textarea ${extra} data-f="${name}">${esc(value)}</textarea></label>`;
}
function esc(s) {
  return String(s || "").replace(/[&<>]/g, c => ({ "&": "&", "<": "<", ">": ">" }[c]));
}
function escAttr(s) {
  return esc(s).replace(/"/g, """);
}
function bindFields(obj) {
  document.querySelectorAll("[data-f]").forEach(el => {
    el.addEventListener("input", () => {
      obj[el.dataset.f] = el.value;
      save();
    });
  });
}
function renderForm(obj, fields) {
  document.getElementById("editBody").innerHTML = `<div class="card">${fields.map(([n, l, extra]) => field(n, l, obj[n], extra || "")).join("")}</div>`;
  bindFields(obj);
}
function openSection(id) {
  const meta = SECTIONS.find(s => s.id === id);
  document.getElementById("editTitle").textContent = meta.title;
  document.getElementById("editHint").textContent = meta.hint;
  const map = {
    home: () => renderForm(data.home, [
      ["name", "What we call it"],
      ["address", "Street address"],
      ["city", "City / ZIP"],
      ["landlord", "Landlord / owner"],
      ["hoa", "HOA / notes"],
      ["notes", "Other", "rows=3"]
    ]),
    access: () => renderForm(data.access, [
      ["keys", "Keys / who has them", "rows=2"],
      ["lockbox", "Lockbox code"],
      ["garage", "Garage code"],
      ["gate", "Gate / door code"],
      ["spare", "Spare key location"],
      ["notes", "Notes", "rows=2"]
    ]),
    shutoffs: () => renderForm(data.shutoffs, [
      ["water", "Water shutoff", "rows=2"],
      ["gas", "Gas shutoff", "rows=2"],
      ["electric", "Electric / main", "rows=2"],
      ["breaker", "Breaker panel", "rows=2"],
      ["valve", "Main valve notes"],
      ["notes", "Notes", "rows=2"]
    ]),
    wifi: () => renderForm(data.wifi, [
      ["network", "Network name"],
      ["password", "Password"],
      ["guestNet", "Guest network"],
      ["router", "Router location"],
      ["notes", "Notes", "rows=2"]
    ]),
    contacts: renderContacts,
    pets: () => renderForm(data.pets, [
      ["names", "Pets"],
      ["food", "Food / schedule", "rows=2"],
      ["vet", "Vet"],
      ["meds", "Meds (notes only)", "rows=2"],
      ["sitter", "Who can take them"],
      ["notes", "Notes", "rows=2"]
    ]),
    where: () => renderForm(data.where, [
      ["breaker", "Breaker panel"],
      ["waterHeater", "Water heater"],
      ["fireExt", "Fire extinguisher"],
      ["firstAid", "First aid"],
      ["spareKey", "Spare key"],
      ["notes", "Other spots", "rows=2"]
    ]),
    appliances: renderAppliances,
    papers: renderPapers
  };
  map[id]();
  show("editor");
}
function renderContacts() {
  document.getElementById("editBody").innerHTML = `<button class="btn btn-qr" id="addContact">Add contact</button><div class="list" id="contactList"></div>`;
  document.getElementById("addContact").onclick = () => {
    data.contacts.push({ name: "", role: "", phone: "", notes: "" });
    save();
    paintContacts();
  };
  paintContacts();
}
function paintContacts() {
  const list = document.getElementById("contactList");
  if (!data.contacts.length) {
    list.innerHTML = `<p class="hint">No contacts yet.</p>`;
    return;
  }
  list.innerHTML = data.contacts.map((c, i) =>
    `<div class="card"><label>Name<input data-ci="${i}" data-k="name" value="${escAttr(c.name)}"></label><div class="row"><label>Role<input data-ci="${i}" data-k="role" value="${escAttr(c.role)}" placeholder="plumber, neighbor..."></label><label>Phone<input data-ci="${i}" data-k="phone" value="${escAttr(c.phone)}" type="tel"></label></div><label>Notes<textarea data-ci="${i}" data-k="notes" rows="2">${esc(c.notes)}</textarea></label><button class="btn btn-danger" data-del="${i}">Remove</button></div>`
  ).join("");
  list.querySelectorAll("[data-ci]").forEach(el => {
    el.addEventListener("input", () => {
      data.contacts[+el.dataset.ci][el.dataset.k] = el.value;
      save();
    });
  });
  list.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => {
      data.contacts.splice(+btn.dataset.del, 1);
      save();
      paintContacts();
    };
  });
}
function renderAppliances() {
  document.getElementById("editBody").innerHTML = `<button class="btn btn-qr" id="addApp">Add appliance</button><div class="list" id="appList"></div>`;
  document.getElementById("addApp").onclick = () => {
    data.appliances.push({ name: "", model: "", bought: "", warranty: "", service: "", notes: "" });
    save();
    paintAppliances();
  };
  paintAppliances();
}
function paintAppliances() {
  const list = document.getElementById("appList");
  if (!data.appliances.length) {
    list.innerHTML = `<p class="hint">No appliances yet.</p>`;
    return;
  }
  list.innerHTML = data.appliances.map((a, i) =>
    `<div class="card"><label>Name<input data-ai="${i}" data-k="name" value="${escAttr(a.name)}"></label><div class="row"><label>Model<input data-ai="${i}" data-k="model" value="${escAttr(a.model)}"></label><label>Bought<input data-ai="${i}" data-k="bought" value="${escAttr(a.bought)}"></label></div><label>Warranty<input data-ai="${i}" data-k="warranty" value="${escAttr(a.warranty)}"></label><label>Who serviced it<input data-ai="${i}" data-k="service" value="${escAttr(a.service)}"></label><label>Notes<textarea data-ai="${i}" data-k="notes" rows="2">${esc(a.notes)}</textarea></label><button class="btn btn-danger" data-adel="${i}">Remove</button></div>`
  ).join("");
  list.querySelectorAll("[data-ai]").forEach(el => {
    el.addEventListener("input", () => {
      data.appliances[+el.dataset.ai][el.dataset.k] = el.value;
      save();
    });
  });
  list.querySelectorAll("[data-adel]").forEach(btn => {
    btn.onclick = () => {
      data.appliances.splice(+btn.dataset.adel, 1);
      save();
      paintAppliances();
    };
  });
}
function renderPapers() {
  document.getElementById("editBody").innerHTML = `<p class="hint">Store titles and where the paper lives. Big files stay off the phone.</p><button class="btn btn-qr" id="addPaper">Add paper</button><div class="list" id="paperList"></div>`;
  document.getElementById("addPaper").onclick = () => {
    data.papers.push({ title: "", kind: "", where: "", notes: "" });
    save();
    paintPapers();
  };
  paintPapers();
}
function paintPapers() {
  const list = document.getElementById("paperList");
  if (!data.papers.length) {
    list.innerHTML = `<p class="hint">No papers yet.</p>`;
    return;
  }
  list.innerHTML = data.papers.map((p, i) =>
    `<div class="card"><label>Title<input data-pi="${i}" data-k="title" value="${escAttr(p.title)}"></label><div class="row"><label>Kind<input data-pi="${i}" data-k="kind" value="${escAttr(p.kind)}" placeholder="lease, insurance..."></label><label>Where it is<input data-pi="${i}" data-k="where" value="${escAttr(p.where)}"></label></div><label>Notes<textarea data-pi="${i}" data-k="notes" rows="2">${esc(p.notes)}</textarea></label><button class="btn btn-danger" data-pdel="${i}">Remove</button></div>`
  ).join("");
  list.querySelectorAll("[data-pi]").forEach(el => {
    el.addEventListener("input", () => {
      data.papers[+el.dataset.pi][el.dataset.k] = el.value;
      save();
    });
  });
  list.querySelectorAll("[data-pdel]").forEach(btn => {
    btn.onclick = () => {
      data.papers.splice(+btn.dataset.pdel, 1);
      save();
      paintPapers();
    };
  });
}
function cardText() {
  const phones = data.contacts.filter(c => c.phone).map(c => `${c.name || "Contact"}${c.role ? " (" + c.role + ")" : ""}: ${c.phone}`).join(" | ");
  return [
    "NEURO-HOUSE GUEST CARD",
    data.home.name ? `Home: ${data.home.name}` : null,
    data.home.address ? `Address: ${data.home.address}` : "Address: —",
    data.wifi.network ? `Wi-Fi: ${data.wifi.network}` : "Wi-Fi: —",
    data.wifi.password ? `Password: ${data.wifi.password}` : null,
    data.wifi.router ? `Router: ${data.wifi.router}` : null,
    `Water: ${data.shutoffs.water || "—"}`,
    `Gas: ${data.shutoffs.gas || "—"}`,
    `Electric: ${data.shutoffs.electric || "—"}`,
    `Breaker: ${data.where.breaker || data.shutoffs.breaker || "—"}`,
    `Phones: ${phones || "—"}`,
    data.pets.names ? `Pets: ${data.pets.names}` : null
  ].filter(Boolean).join("\n");
}
function makeQr() {
  const text = cardText();
  const box = document.getElementById("qrBox");
  box.innerHTML = "";
  document.getElementById("qrText").textContent = text;
  new QRCode(box, { text, width: 220, height: 220, colorDark: "#140824", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
  document.getElementById("qrModal").classList.add("on");
}
document.getElementById("tiles").addEventListener("click", e => {
  const btn = e.target.closest("[data-open]");
  if (btn) openSection(btn.dataset.open);
});
document.getElementById("backHome").onclick = () => {
  renderTiles();
  show("home");
};
document.getElementById("makeQr").onclick = makeQr;
document.getElementById("closeQr").onclick = () => document.getElementById("qrModal").classList.remove("on");
document.getElementById("qrModal").addEventListener("click", e => {
  if (e.target.id === "qrModal") e.target.classList.remove("on");
});
document.getElementById("copyCard").onclick = async () => {
  try {
    await navigator.clipboard.writeText(cardText());
    toast("Card copied");
  } catch {
    toast("Copy failed");
  }
};
document.getElementById("exportBtn").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = "neuro-house-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Backup saved");
};
document.getElementById("importBtn").onclick = () => document.getElementById("fileIn").click();
document.getElementById("fileIn").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      data = { ...empty(), ...JSON.parse(reader.result) };
      save();
      toast("Restored");
    } catch {
      toast("Bad backup file");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
};
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
renderTiles();
