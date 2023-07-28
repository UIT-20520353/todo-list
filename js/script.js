const root_form = document.getElementById("root-form");
const overlay = document.getElementById("overlay");
const btnAddItem = document.getElementById("add-item");
const btnClose = document.getElementById("close-form");
const formAddItem = document.getElementById("form-add-item");
const listBtnUpdate = document.getElementsByClassName("update");
const listBtnDelete = document.getElementsByClassName("delete");
const taskDetail = document.getElementById("item-detail");
const taskDueDate = document.getElementById("due-date");
const toast = document.getElementById("toast");
const toastProcess = document.getElementById("toast__process");
const toastContent = document.getElementById("toast__content");
const btnCloseToast = document.getElementById("toast__close");
const divTodo = document.querySelector(".todo ul");
const divDoing = document.querySelector(".doing ul");
const divDone = document.querySelector(".done ul");
let intervalId = -1;

const keyName = "tasks";

btnAddItem.addEventListener("click", openForm);

btnClose.addEventListener("click", closeForm);

btnCloseToast.addEventListener("click", closeToast);

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const tasks = getTasks();

    tasks.forEach((task) => {
      const li = getTaskHTML(task.detail, task.dueDate, task.id, task.status);

      switch (task.status) {
        case "doing":
          divDoing.appendChild(li);
          break;
        case "done":
          divDone.appendChild(li);
          break;
        default:
          divTodo.appendChild(li);
      }
    });

    setEventClick();
  },
  false
);

formAddItem.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!taskDetail.value || !taskDueDate.value) {
    showToast("Vui lòng nhập đầy đủ thông tin", "error");
    return;
  }

  const id = getGUID();
  const li = getTaskHTML(taskDetail.value, taskDueDate.value, id, "todo");

  divTodo.appendChild(li);

  addTasks({
    id,
    detail: taskDetail.value,
    dueDate: taskDueDate.value,
    status: "todo",
  });

  setEventClick();

  showToast("Thêm task thành công!", "success");
  closeForm();
});

function closeForm() {
  root_form.classList.add("hide");
  overlay.classList.add("hide");

  taskDetail.value = "";
  taskDueDate.setAttribute("value", "");
}

function openForm() {
  root_form.classList.remove("hide");
  overlay.classList.remove("hide");

  const date = new Date();
  const today = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  taskDueDate.setAttribute("min", today);
  taskDueDate.setAttribute("value", today);
}

function showToast(content, type) {
  clearInterval(intervalId);
  toastProcess.style.width = "100%";

  if (type === "error") toastProcess.style.backgroundColor = "red";
  else toastProcess.style.backgroundColor = "green";

  let width = 100;
  toastContent.textContent = content;
  toast.classList.remove("hide");
  intervalId = setInterval(() => {
    width -= 2;

    if (width < 0) {
      toast.classList.add("hide");
      clearInterval(intervalId);
    }

    toastProcess.style.width = `${width}%`;
  }, 100);
}

function closeToast() {
  clearInterval(intervalId);
  toastProcess.style.width = "100%";
  toast.classList.add("hide");
}

function addTasks(task) {
  const tasks = getTasks();
  tasks.push(task);
  window.localStorage.setItem(keyName, JSON.stringify(tasks));
}

function getTasks() {
  const result = JSON.parse(window.localStorage.getItem(keyName));
  return result || [];
}

function getGUID() {
  const randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const uniqid = randLetter + Date.now();
  return uniqid;
}

function getDateDisplay(dueDate) {
  const date = new Date(dueDate);
  return `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
}

function setEventClick() {
  for (let i = 0; i < listBtnUpdate.length; i++) {
    listBtnUpdate[i].onclick = function () {
      console.log(this.getAttribute("data-task-id"));
    };
    listBtnDelete[i].onclick = function () {
      let tasks = getTasks();
      tasks = tasks.filter(
        (task) => task.id !== this.getAttribute("data-task-id")
      );
      window.localStorage.setItem(keyName, JSON.stringify(tasks));
      const li = document.querySelector(
        `li[data-task-id="${this.getAttribute("data-task-id")}"]`
      );
      li.style.display = "none";
      showToast("Xóa task thành công", "success");
    };
  }
}

function getTaskHTML(detail, dueDate, id, status) {
  const li = document.createElement("li");
  li.classList.add("task");
  li.setAttribute("data-task-id", id);
  li.setAttribute("draggable", true);
  li.innerHTML = `<p class="task-detail">
          ${detail}
        </p>
        <p class="task-due-date">${getDateDisplay(dueDate)}</p>
        <div class="actions">
          <button class="update ${
            status === "done" && "hide"
          }" data-task-id="${id}">Cập nhật</button>
          <button class="delete" data-task-id="${id}">Xóa</button>
        </div>`;

  li.addEventListener("dragstart", function (event) {
    setTimeout(() => {
      this.classList.add("hide");
    }, 0);
  });
  li.addEventListener("dragend", function (event) {
    setTimeout(() => {
      const doingBoundingRect = divDoing.getBoundingClientRect();
      const todoBoundingRect = divTodo.getBoundingClientRect();
      const doneBoundingRect = divDone.getBoundingClientRect();

      if (
        event.clientX >= doingBoundingRect.x &&
        event.clientX <= doingBoundingRect.x + doingBoundingRect.width &&
        event.clientY >= doingBoundingRect.y &&
        event.clientY <= doingBoundingRect.y + doingBoundingRect.height
      ) {
        divDoing.appendChild(this);
        const btnUpdate = document.querySelector(
          `li[data-task-id="${this.getAttribute(
            "data-task-id"
          )}"] button.update`
        );
        btnUpdate.classList.remove("hide");
        updateStatus(this.getAttribute("data-task-id"), "doing");
      }

      if (
        event.clientX >= todoBoundingRect.x &&
        event.clientX <= todoBoundingRect.x + todoBoundingRect.width &&
        event.clientY >= todoBoundingRect.y &&
        event.clientY <= todoBoundingRect.y + todoBoundingRect.height
      ) {
        divTodo.appendChild(this);
        const btnUpdate = document.querySelector(
          `li[data-task-id="${this.getAttribute(
            "data-task-id"
          )}"] button.update`
        );
        btnUpdate.classList.remove("hide");
        updateStatus(this.getAttribute("data-task-id"), "todo");
      }

      if (
        event.clientX >= doneBoundingRect.x &&
        event.clientX <= doneBoundingRect.x + doneBoundingRect.width &&
        event.clientY >= doneBoundingRect.y &&
        event.clientY <= doneBoundingRect.y + doneBoundingRect.height
      ) {
        divDone.appendChild(this);
        const btnUpdate = document.querySelector(
          `li[data-task-id="${this.getAttribute(
            "data-task-id"
          )}"] button.update`
        );
        btnUpdate.classList.add("hide");
        updateStatus(this.getAttribute("data-task-id"), "done");
      }
      this.classList.remove("hide");
    }, 0);
  });

  return li;
}

function updateStatus(id, status) {
  let tasks = getTasks();
  tasks = tasks.map((task) => {
    if (task.id === id)
      return {
        ...task,
        status,
      };
    else return task;
  });

  window.localStorage.setItem(keyName, JSON.stringify(tasks));
}
