// Public browser configuration. These values are intended for client-side use.
// Database security is enforced by Supabase Row Level Security policies.
const SUPABASE_URL = "https://fvlbleczdoelqupyetoc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wf820cwtjtXzntQLGmnpOg_KhIN7MrW";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const fields = ["name","race","character_class","gender","age","height","image_url","appearance","personality","biography","relationships","notes"];
let characters = [];

const statusEl = $("connection-status");
const grid = $("character-grid");
const search = $("search");
const dialog = $("character-dialog");
const detailDialog = $("detail-dialog");

function value(id){ return $(id).value.trim(); }
function safeText(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function validImage(url){ try { const u=new URL(url); return ["http:","https:"].includes(u.protocol); } catch { return false; } }
function showNotice(message, error=false){ $("notice").textContent=message; $("notice").classList.toggle("error",error); }

async function loadCharacters(){
  statusEl.textContent = "Загрузка каталога…";
  const {data,error} = await db.from("characters").select("*").order("name",{ascending:true});
  if(error){
    statusEl.textContent = "Не удалось подключиться к базе";
    showNotice("Ошибка загрузки: "+error.message,true);
    return;
  }
  characters = data || [];
  statusEl.textContent = "Общая база подключена";
  showNotice("");
  render();
}
function render(){
  const q=search.value.trim().toLocaleLowerCase("ru");
  const filtered=characters.filter(c=>fields.some(k=>String(c[k]??"").toLocaleLowerCase("ru").includes(q)));
  grid.innerHTML="";
  $("empty-state").hidden=filtered.length!==0;
  for(const c of filtered){
    const card=document.createElement("article");
    card.className="character-card";
    const img=validImage(c.image_url)?`<img src="${safeText(c.image_url)}" alt="${safeText(c.name)}" loading="lazy" referrerpolicy="no-referrer">`:`<span class="image-placeholder">✦</span>`;
    const meta=[c.race,c.character_class].filter(Boolean).map(safeText).join(" · ");
    card.innerHTML=`<div class="card-image">${img}</div><div class="card-body"><h3>${safeText(c.name)}</h3><div class="card-meta">${meta||"Персонаж"}</div><div class="card-actions"><button class="secondary edit">Изменить</button></div></div>`;
    card.addEventListener("click",e=>{ if(e.target.closest(".edit")){e.stopPropagation();openForm(c);}else openDetails(c); });
    grid.appendChild(card);
  }
}
function openForm(c=null){
  $("character-form").reset();
  $("character-id").value=c?.id||"";
  $("form-title").textContent=c?"Редактировать персонажа":"Новый персонаж";
  $("form-eyebrow").textContent=c?"ИЗМЕНЕНИЕ ЗАПИСИ":"НОВАЯ ЗАПИСЬ";
  $("form-error").textContent="";
  const map={"name":"name","race":"race","character-class":"character_class","gender":"gender","age":"age","height":"height","image-url":"image_url","appearance":"appearance","personality":"personality","biography":"biography","relationships":"relationships","notes":"notes"};
  for(const [id,key] of Object.entries(map)) $(id).value=c?.[key]??"";
  dialog.showModal();
}
function openDetails(c){
  const image=validImage(c.image_url)?`<img src="${safeText(c.image_url)}" alt="${safeText(c.name)}" referrerpolicy="no-referrer">`:`<div class="card-image"><span class="image-placeholder">✦</span></div>`;
  const facts=[c.race&&`Раса: ${safeText(c.race)}`,c.character_class&&`Роль: ${safeText(c.character_class)}`,c.gender&&`Пол: ${safeText(c.gender)}`,c.age&&`Возраст: ${safeText(c.age)}`,c.height&&`Рост: ${safeText(c.height)}`].filter(Boolean).join("<br>");
  const sections=[["Внешность",c.appearance],["Характер",c.personality],["Биография",c.biography],["Отношения",c.relationships],["Особые заметки",c.notes]].filter(x=>x[1]);
  $("detail-content").innerHTML=`<div class="detail-hero">${image}<div><p class="eyebrow">ПЕРСОНАЖ</p><h2>${safeText(c.name)}</h2><div class="detail-facts">${facts}</div><div class="card-actions"><button class="primary" id="detail-edit">Редактировать</button></div></div></div>${sections.map(([h,t])=>`<section class="detail-section"><h3>${h}</h3><p>${safeText(t)}</p></section>`).join("")}`;
  $("detail-edit").addEventListener("click",()=>{detailDialog.close();openForm(c);});
  detailDialog.showModal();
}
$("add-character").addEventListener("click",()=>openForm());
$("close-dialog").addEventListener("click",()=>dialog.close());
$("cancel-dialog").addEventListener("click",()=>dialog.close());
$("close-detail").addEventListener("click",()=>detailDialog.close());
detailDialog.addEventListener("click", e => {
  if (e.target === detailDialog) {
    detailDialog.close();
  }
});
search.addEventListener("input",render);

$("character-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=$("character-id").value;
  const record={
    name:value("name"),race:value("race"),character_class:value("character-class"),
    gender:value("gender"),age:value("age"),height:value("height"),image_url:value("image-url"),
    appearance:value("appearance"),personality:value("personality"),biography:value("biography"),
    relationships:value("relationships"),notes:value("notes")
  };
  if(record.image_url&&!validImage(record.image_url)){ $("form-error").textContent="Укажи корректную ссылку, начинающуюся с http:// или https://.";return; }
  $("save-character").disabled=true;
  $("save-character").textContent="Сохранение…";
  $("form-error").textContent="";
  const result=id
    ? await db.from("characters").update(record).eq("id",id)
    : await db.from("characters").insert(record);
  $("save-character").disabled=false;
  $("save-character").textContent="Сохранить";
  if(result.error){ $("form-error").textContent="Не удалось сохранить: "+result.error.message;return; }
  dialog.close();
  showNotice(id?"Изменения сохранены.":"Персонаж добавлен.");
  await loadCharacters();
});

// Первоначальная загрузка персонажей
loadCharacters();

// Живое обновление при изменениях в общей базе
db.channel("characters-live")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "characters"
    },
    () => {
      // Загружаем каталог
loadCharacters();

// Отправляем информацию о посетителе
async function sendPresence() {
  const { error } = await db.functions.invoke(
    "track-visitor",
    { body: {} }
  );

  if (error) {
    console.warn("Ошибка отслеживания:", error.message);
  }
}

// Первый сигнал
sendPresence();

// Повторяем каждые 30 секунд
setInterval(sendPresence, 30000);
    }
  )
  .subscribe((status) => {
    console.log("Realtime status:", status);
  });
