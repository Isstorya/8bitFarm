// Инициализация ресурсов
let money = 50;
let wheatSeeds = 5;
let farmGrid = [];
const gridSize = 4;

// Создание игрового поля
const gridElement = document.getElementById("farm-grid");
for (let i = 0; i < gridSize * gridSize; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  cell.addEventListener("click", handleCellClick);
  gridElement.appendChild(cell);
  farmGrid.push({ state: "empty", growthTime: 0 });
}

// Обновление интерфейса
function updateUI() {
  document.getElementById("money").textContent = money;
  document.getElementById("wheat-seeds").textContent = wheatSeeds;
}

// Обработка клика по клетке
function handleCellClick(event) {
  const index = event.target.dataset.index;
  const cell = farmGrid[index];

  if (cell.state === "empty" && wheatSeeds > 0) {
    plantSeed(index);
  } else if (cell.state === "ready") {
    harvest(index);
  }
}

// Посадка семени
function plantSeed(index) {
  if (wheatSeeds <= 0) return;
  wheatSeeds--;
  farmGrid[index].state = "seed";
  farmGrid[index].growthTime = 5; // 5 секунд роста
  updateCell(index);
  updateUI();
  growPlant(index);
}

// Рост растения
function growPlant(index) {
  const cell = farmGrid[index];
  const cellElement = document.querySelector(`.cell[data-index="${index}"]`);

  const growthInterval = setInterval(() => {
    cell.growthTime--;
    if (cell.growthTime <= 3 && cell.state === "seed") {
      cell.state = "growing";
      updateCell(index);
    } else if (cell.growthTime <= 0 && cell.state === "growing") {
      cell.state = "ready";
      updateCell(index);
      clearInterval(growthInterval);
    }
  }, 1000);
}

// Сбор урожая
function harvest(index) {
  farmGrid[index].state = "empty";
  farmGrid[index].growthTime = 0;
  money += 20; // Доход с урожая
  updateCell(index);
  updateUI();
}

// Обновление стиля клетки
function updateCell(index) {
  const cellElement = document.querySelector(`.cell[data-index="${index}"]`);
  cellElement.className = "cell"; // Сброс классов
  if (farmGrid[index].state !== "empty") {
    cellElement.classList.add(farmGrid[index].state);
  }
}

// Покупка семян
document.getElementById("buy-seeds").addEventListener("click", () => {
  if (money >= 10) {
    money -= 10;
    wheatSeeds += 1;
    updateUI();
  }
});

// Инициализация
updateUI();
