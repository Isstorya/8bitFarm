// Ресурсы
let money = 100;
let energy = 10;
let day = 1;
let wheatSeeds = 5, carrotSeeds = 3, cornSeeds = 2;
let farmGrid = [];
const gridWidth = 200;
const gridHeight = 50;
const viewWidth = 30;
const viewHeight = 20;
let selectedTool = 'hoe';
let playerPos = { x: 0, y: 0 };
let viewOffset = { x: 0, y: 0 };

// Культуры
const crops = {
  wheat: { time: 5, profit: 20, cost: 5 },
  carrot: { time: 7, profit: 30, cost: 10 },
  corn: { time: 10, profit: 50, cost: 15 }
};

// Создание полного поля с травой и камнями
for (let i = 0; i < gridWidth * gridHeight; i++) {
  const isStone = Math.random() < 0.1; // 10% шанс на камень
  farmGrid.push({
    state: isStone ? 'stone' : 'empty', // Камень или трава
    type: null,
    growthTime: 0,
    buildable: !isStone // 90% клеток можно застраивать
  });
}

// Создание видимой области
const gridElement = document.getElementById('farm-grid');
for (let i = 0; i < viewWidth * viewHeight; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.viewIndex = i;
  gridElement.appendChild(cell);
}

// Добавление персонажа
const player = document.createElement('div');
player.classList.add('player');
gridElement.appendChild(player);

// Обновление UI
function updateUI() {
  document.getElementById('money').textContent = money;
  document.getElementById('energy').textContent = energy;
  document.getElementById('day').textContent = day;
  document.getElementById('wheat-seeds').textContent = wheatSeeds;
  document.getElementById('carrot-seeds').textContent = carrotSeeds;
  document.getElementById('corn-seeds').textContent = cornSeeds;
  updateView();
}

// Обновление видимой области
function updateView() {
  const cellSize = 26;
  viewOffset.x = Math.max(0, Math.min(playerPos.x - Math.floor(viewWidth / 2), gridWidth - viewWidth));
  viewOffset.y = Math.max(0, Math.min(playerPos.y - Math.floor(viewHeight / 2), gridHeight - viewHeight));

  for (let vy = 0; vy < viewHeight; vy++) {
    for (let vx = 0; vx < viewWidth; vx++) {
      const viewIndex = vy * viewWidth + vx;
      const gridX = viewOffset.x + vx;
      const gridY = viewOffset.y + vy;
      const gridIndex = gridY * gridWidth + gridX;
      const cellElement = document.querySelector(`.cell[data-view-index="${viewIndex}"]`);
      cellElement.className = 'cell';
      if (farmGrid[gridIndex].state !== 'empty') {
        cellElement.classList.add(farmGrid[gridIndex].state);
      }
    }
  }

  const playerX = (playerPos.x - viewOffset.x) * cellSize + 5;
  const playerY = (playerPos.y - viewOffset.y) * cellSize + 5;
  player.style.left = `${playerX}px`;
  player.style.top = `${playerY}px`;
}

// Передвижение персонажа
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      if (playerPos.y > 0) playerPos.y--;
      break;
    case 's':
    case 'ArrowDown':
      if (playerPos.y < gridHeight - 1) playerPos.y++;
      break;
    case 'a':
    case 'ArrowLeft':
      if (playerPos.x > 0) playerPos.x--;
      break;
    case 'd':
    case 'ArrowRight':
      if (playerPos.x < gridWidth - 1) playerPos.x++;
      break;
    case ' ':
      handleAction();
      break;
    case 'Enter':
      endDay();
      break;
  }
  updateUI();
});

// Действие на текущей клетке
function handleAction() {
  if (energy <= 0) return;

  const index = playerPos.y * gridWidth + playerPos.x;
  const cell = farmGrid[index];

  if (selectedTool === 'hoe' && cell.state === 'empty' && cell.buildable) {
    tillSoil(index);
  } else if (selectedTool.startsWith('plant-') && cell.state === 'tilled') {
    plantSeed(index, selectedTool.split('-')[1]);
  } else if (selectedTool === 'water' && (cell.state === 'seed' || cell.state === 'growing')) {
    waterPlant(index);
  } else if (cell.state === 'ready') {
    harvest(index);
  }
}

// Обработка земли (создание грядки)
function tillSoil(index) {
  farmGrid[index].state = 'tilled';
  energy--;
  updateUI();
}

// Посадка семян
function plantSeed(index, type) {
  const crop = crops[type];
  let seeds = eval(`${type}Seeds`);
  if (seeds > 0 && money >= crop.cost) {
    seeds--;
    money -= crop.cost;
    farmGrid[index].state = 'seed';
    farmGrid[index].type = type;
    farmGrid[index].growthTime = crop.time;
    energy--;
    updateUI();
    growPlant(index);
  }
}

// Полив
function waterPlant(index) {
  farmGrid[index].growthTime = Math.max(1, farmGrid[index].growthTime - 2);
  energy--;
  updateUI();
}

// Рост
function growPlant(index) {
  const cell = farmGrid[index];
  const interval = setInterval(() => {
    cell.growthTime--;
    if (cell.growthTime <= Math.floor(crops[cell.type].time / 2) && cell.state === 'seed') {
      cell.state = 'growing';
      updateUI();
    } else if (cell.growthTime <= 0 && cell.state === 'growing') {
      cell.state = 'ready';
      updateUI();
      clearInterval(interval);
    }
  }, 1000);
}

// Сбор урожая
function harvest(index) {
  const crop = farmGrid[index].type;
  money += crops[crop].profit;
  farmGrid[index].state = 'empty';
  farmGrid[index].type = null;
  updateUI();
}

// Завершение дня
function endDay() {
  day++;
  energy = 10;
  updateUI();
}

// Завершение дня по нажатию кнопки
document.getElementById('end-day').addEventListener('click', endDay);

// Выбор инструмента
document.getElementById('tool-hoe').addEventListener('click', () => selectedTool = 'hoe');
document.getElementById('tool-water').addEventListener('click', () => selectedTool = 'water');
document.getElementById('plant-wheat').addEventListener('click', () => selectedTool = 'plant-wheat');
document.getElementById('plant-carrot').addEventListener('click', () => selectedTool = 'plant-carrot');
document.getElementById('plant-corn').addEventListener('click', () => selectedTool = 'plant-corn');

// Инициализация
updateUI();