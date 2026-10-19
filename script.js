// buat bikin variabel untuk menampung elemen-elemen HTML yang dibutuhkan (buat ngambil dari index.html pokoknya)
const todoForm = document.querySelector("#todo-form"); // buat nampilin form inputan tugas html id line 30 di script.js line 86 addeventlistener nya
const todoInput = document.querySelector("#todo-input"); // buat nampilin inputan tugas html id line 39
const todoList = document.querySelector("#todo-list"); // buat nampilin list tugas html id line 103
const totalCount = document.querySelector("#total-count"); // buat nampilin jumlah total tugas html id line 60
const completedCount = document.querySelector("#completed-count"); // buat nampilin jumlah tugas yang sudah selesai html line id 69
const emptyMessage = document.querySelector("#empty-message"); // buat nampilin pesan kosong ketika tidak ada tugas html id line 105
const formMessage = document.querySelector("#form-message"); // buat nampilin pesan error atau berhasil html id line 49, perintanhya di script.js line 55
const clearAllButton = document.querySelector("#clear-all"); // buat ngapus semua tugas html id line 83
const filterButtons = document.querySelectorAll(".filter-btn"); // karena make . bukan # yang dicari itu class bukan id jadi di html yang di ambil itu di index.html class = "filter-btn" line 92,95,98 sama kaya di JS Movie kemarin
const storageKey = "todo-list-app-tasks"; // id penyimpanan task di storage browser

let tasks = loadTasks(); // function load nya ada di line 28, yang ini buat perintah ngambil
let currentFilter = "all";


function saveTasks() { // buat simpen tasknya ke local browser storage (?) 
    try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Gagal menyimpan data tugas:", error);
        showMessage("Data gagal disimpan di browser.", true);
        return false;
    }
}

function loadTasks() { // codingan buat ambil key id dari browser nya
    try {
        const savedTasks = localStorage.getItem(storageKey);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Gagal membaca data tugas:", error);
        return [];
    }
}

function createTaskId() { // buat bikin id biar bisa disimpen di storage browser
    return Date.now().toString() +
        Math.random().toString(36).slice(2);
}

function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.className = isError
        ? "small mt-2 text-danger"
        : "small mt-2 text-success";
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "small mt-2";
}

function addTask(title) {
    const newTask = {
        id: createTaskId(), // ambil function dari line 54 ngebikin nya 
        title: title,
        completed: false
    };

    tasks.unshift(newTask);
    saveTasks();

    currentFilter = "all";
    updateFilterButtons();
    renderTasks();
}

todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = todoInput.value.trim(); // ada di html nya dimana kalo masukkin di kolom ... itu = input

    if (title === "") { // memberi tahu gak boleh kosong
        showMessage("Nama tugas tidak boleh kosong.", true);
        todoInput.focus();
        return;
    }

    if (title.length > 50) { // memberi tahu kalo gak boleh lewatin lebih dari 50 karakter, bisa di ubah sesuka hati berapa banyak karakternya
        showMessage("Nama tugas maksimal 50 karakter.", true);
        return;
    }

    addTask(title);
    todoInput.value = "";
    clearMessage();  
    todoInput.focus();
});

function renderTasks() {
    todoList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed; // buat check ada tugas yang aktif atau tidak
        }

        if (currentFilter === "completed") {
            return task.completed; // buat check ada tugas yang sudah selesai atau tidak
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "list-group-item todo-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input"); // checkbox buat tugas selesai atau belum
        checkbox.type = "checkbox";
        checkbox.className = "todo-check";
        checkbox.checked = task.completed;
        checkbox.dataset.action = "toggle";
        checkbox.dataset.id = task.id;
        checkbox.setAttribute(
            "aria-label",
            "Tandai " + task.title + " sebagai selesai"
        );

        const content = document.createElement("div");
        content.className = "todo-content";

        const title = document.createElement("span");
        title.className = "todo-title";
        title.textContent = task.title;

        const status = document.createElement("span");
        status.className = task.completed
            ? "badge text-bg-success todo-status"
            : "badge text-bg-secondary todo-status";

        status.textContent = task.completed // jika sudah selesai atau belum nya
            ? "Selesai"
            : "Belum selesai";

        content.append(title, status);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger btn-sm todo-delete";
        deleteButton.textContent = "Hapus";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = task.id;
        deleteButton.setAttribute(
            "aria-label",
            "Hapus tugas " + task.title
        );

        item.append(checkbox, content, deleteButton);
        todoList.appendChild(item);
    });

    totalCount.textContent = tasks.length;

    completedCount.textContent = tasks.filter(
        task => task.completed
    ).length;

    if (filteredTasks.length === 0) { // ini sampe line 192 akan tampil kalo udah input tugas, kalo belom ada di ketiga filter akan tertulis "belum ada tugas"
        emptyMessage.hidden = false;

        if (tasks.length === 0) {
            emptyMessage.textContent =
                "Belum ada tugas.";
        } else if (currentFilter === "active") {
            emptyMessage.textContent =
                "Tidak ada tugas aktif."; // kalo di filter "aktif" kosong
        } else if (currentFilter === "completed") {
            emptyMessage.textContent =
                "Belum ada tugas yang selesai."; // kalo di filter "selesai" kosong
        }
    } else {
        emptyMessage.hidden = true;
    }

    clearAllButton.disabled = tasks.length === 0;
}

todoList.addEventListener("change", function (event) {
    if (!event.target.matches('[data-action="toggle"]')) {
        return;
    }

    const taskId = event.target.dataset.id;

    const task = tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    task.completed = event.target.checked;

    saveTasks();
    renderTasks();
});

todoList.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(
        '[data-action="delete"]'
    );

    if (!deleteButton || !todoList.contains(deleteButton)) {
        return;
    }

    const taskId = deleteButton.dataset.id;

    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();
});

function updateFilterButtons() {
    filterButtons.forEach(button => {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("btn-primary", isActive);
        button.classList.toggle("btn-outline-primary", !isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        updateFilterButtons();
        renderTasks();
    });
});

clearAllButton.addEventListener("click", function () { // buat hapus semua tugas yang ada baik selesai maupun tidak
    if (tasks.length === 0) {
        return;
    }

    const confirmation = window.confirm(
        "Apakah kamu yakin ingin menghapus semua tugas?"
    );

    if (!confirmation) {
        return;
    }

    tasks = [];

    saveTasks();
    renderTasks();
    showMessage("Semua tugas berhasil dihapus.");
});

updateFilterButtons();
renderTasks();