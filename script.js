const lists = document.querySelectorAll(".list");
const addCardBtn = document.getElementById("addCardBtn");
const newCardInput = document.getElementById("newCardInput");
const prioritySelect = document.getElementById("prioritySelect");
const filterList = document.getElementById("filterList");
const filterPriority = document.getElementById("filterPriority");
const darkModeToggle = document.getElementById("darkModeToggle");
const exportJSON = document.getElementById("exportJSON");

let draggedCard = null;

// Load saved tasks
window.addEventListener("load", () => {
  const savedTasks = JSON.parse(localStorage.getItem("kanbanTasks") || "[]");
  savedTasks.forEach(task => createCard(task.text, task.priority, task.listId, false));
  const darkMode = localStorage.getItem("darkMode");
  if(darkMode==="true") document.body.classList.add("dark-mode");
  applyFilters();
});

// Save tasks
function saveTasks(){
  const tasks=[];
  lists.forEach(list=>{
    list.querySelectorAll(".card").forEach(card=>{
      tasks.push({ text:card.querySelector(".text").textContent, priority:card.dataset.priority, listId:list.id });
    });
  });
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Create card
function createCard(text, priority, listId, save=true){
  const card=document.createElement("div");
  card.className=`card ${priority}`;
  card.draggable=true;
  card.dataset.priority=priority;
  card.style.display="flex";
  card.innerHTML=`<span class="text">${text}</span>
    <div class="actions">
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    </div>`;
  enableDrag(card);
  const parentList=document.getElementById(listId);
  if(parentList) parentList.appendChild(card);

  // Edit
  card.querySelector(".editBtn").addEventListener("click",()=>{
    const newText=prompt("Edit task:",card.querySelector(".text").textContent);
    if(newText){ card.querySelector(".text").textContent=newText; saveTasks(); applyFilters(); }
  });
  // Delete
  card.querySelector(".deleteBtn").addEventListener("click",()=>{ card.remove(); saveTasks(); });

  if(save) { saveTasks(); applyFilters(); }
}

// Drag & Drop
function enableDrag(card){
  card.addEventListener("dragstart",()=>{
    draggedCard=card;
    setTimeout(()=>card.style.display="none",0);
  });
  card.addEventListener("dragend",()=>{
    card.style.display="flex";
    draggedCard=null;
    saveTasks();
  });
}

lists.forEach(list=>{
  list.addEventListener("dragover", e=>e.preventDefault());
  list.addEventListener("dragenter", e=>{ e.preventDefault(); list.classList.add("over"); });
  list.addEventListener("dragleave", ()=>list.classList.remove("over"));
  list.addEventListener("drop", ()=>{
    if(draggedCard) list.appendChild(draggedCard);
    list.classList.remove("over");
    saveTasks();
    applyFilters();
  });
});

// Add new card
addCardBtn.addEventListener("click",()=>{
  const text=newCardInput.value.trim();
  if(!text) return;
  createCard(text,prioritySelect.value,"list1");
  newCardInput.value="";
});

// Enter key adds card
newCardInput.addEventListener("keydown", e=>{ if(e.key==="Enter") addCardBtn.click(); });

// Filters
function applyFilters(){
  const listFilter=filterList.value;
  const priorityFilter=filterPriority.value;
  lists.forEach(list=>{
    list.querySelectorAll(".card").forEach(card=>{
      card.style.display="flex";
      if(listFilter!=="all" && list.id!==listFilter) card.style.display="none";
      if(priorityFilter!=="all" && card.dataset.priority!==priorityFilter) card.style.display="none";
    });
  });
}
filterList.addEventListener("change",applyFilters);
filterPriority.addEventListener("change",applyFilters);

// Dark Mode
darkModeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode",document.body.classList.contains("dark-mode"));
});

// Export JSON
exportJSON.addEventListener("click",()=>{
  const data=localStorage.getItem("kanbanTasks");
  const blob=new Blob([data],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="kanban_tasks.json"; a.click(); 
  URL.revokeObjectURL(url);
});
