// Estado
let bankroll = 0;
let initialBankroll = 0;
let bets = [];

// Referencias DOM

const bankrollInput = document.getElementById("bankrollInput");
const sportSelect = document.getElementById("sportSelect");
const descInput = document.getElementById("descInput");
const amountInput = document.getElementById("amountInput");
const oddInput = document.getElementById("oddInput");
const resultSelect = document.getElementById("resultSelect");
const betList = document.getElementById("betList");

// Estadísticas

const statBalance = document.getElementById("statBalance");
const statProfit = document.getElementById("statProfit");
const statWinRate = document.getElementById("statWinRate");
const statTotal = document.getElementById("statTotal");

// Establecer bankroll inicial

function setBankroll() {
  const value = parseFloat(bankrollInput.value);
  if (isNaN(value) || value <= 0) {
    alert("Ingresa un bankroll válido.");
    return;
  }
  bankroll = value;
  initialBankroll = value;
  bankrollInput.value = "";
  updateStats();
}

// Agregar apuesta

function addBet() {
  const sport = sportSelect.value;
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const odd = parseFloat(oddInput.value);
  const result = resultSelect.value;

  if (
    !sport ||
    !desc ||
    isNaN(amount) ||
    amount <= 0 ||
    isNaN(odd) ||
    odd < 1
  ) {
    alert("Por favor completa todos los campos correctamente.");
    return;
  }

  if (amount > bankroll && result !== "pending") {
    alert("No tienes suficiente bankroll para esta apuesta.");
    return;
  }

  const bet = { sport, desc, amount, odd, result, id: Date.now() };

  // Descontar del bankroll si no es pendiente
  if (result === "won") {
    bankroll += amount * (odd - 1);
  } else if (result === "lost") {
    bankroll -= amount;
  }

  bets.unshift(bet); // más reciente primero
  clearForm();
  renderBets();
  updateStats();
}

// Resolver apuesta pendiente

function resolveBet(id, result) {
  const bet = bets.find((b) => b.id === id);
  if (!bet || bet.result !== "pending") return;

  bet.result = result;

  if (result === "won") {
    bankroll += bet.amount * (bet.odd - 1);
  } else if (result === "lost") {
    bankroll -= bet.amount;
  }

  renderBets();
  updateStats();
}

// Eliminar apuesta

function removeBet(id) {
  const bet = bets.find((b) => b.id === id);
  if (!bet) return;

  // Revertir efecto en bankroll

  if (bet.result === "won") {
    bankroll -= bet.amount * (bet.odd - 1);
  } else if (bet.result === "lost") {
    bankroll += bet.amount;
  }

  bets = bets.filter((b) => b.id !== id);
  renderBets();
  updateStats();
}

// Renderizar historial
function renderBets() {
  if (bets.length === 0) {
    betList.innerHTML = '<p class="empty">Aún no hay apuestas registradas.</p>';
    return;
  }

  betList.innerHTML = bets
    .map((bet) => {
      // Calcular ganancia/pérdida
      let profitText = "";
      let profitClass = "";
      if (bet.result === "won") {
        const gain = bet.amount * (bet.odd - 1);
        profitText = `+S/ ${gain.toFixed(2)}`;
        profitClass = "positive";
      } else if (bet.result === "lost") {
        profitText = `-S/ ${bet.amount.toFixed(2)}`;
        profitClass = "negative";
      } else {
        profitText = "Pendiente";
      }

      // Botones para resolver pendientes
      const resolveButtons =
        bet.result === "pending"
          ? `
      <div>
        <button class="btn-resolve" onclick="resolveBet(${bet.id}, 'won')">✅ Ganada</button>
        <button class="btn-resolve" onclick="resolveBet(${bet.id}, 'lost')" style="color:#e74c3c; border-color:#e74c3c;">❌ Perdida</button>
      </div>
    `
          : "";

      return `
      <div class="bet-item ${bet.result}">
        <div class="bet-top">
          <div>
            <div class="bet-desc">${bet.desc}</div>
            <div class="bet-sport">${bet.sport}</div>
          </div>
          <div class="bet-right">
            <div class="bet-amount">S/ ${bet.amount.toFixed(2)}</div>
            <div class="bet-odd">Cuota: ${bet.odd}</div>
          </div>
        </div>
        <div class="bet-bottom">
          <span class="badge ${bet.result}">${
            bet.result === "won"
              ? "✅ Ganada"
              : bet.result === "lost"
                ? "❌ Perdida"
                : "⏳ Pendiente"
          }</span>
          <span class="bet-profit ${profitClass}">${profitText}</span>
          <button class="btn-sm" onclick="removeBet(${bet.id})">✕</button>
        </div>
        ${resolveButtons}
      </div>
    `;
    })
    .join("");
}

// Actualizar estadísticas

function updateStats() {
  const resolvedBets = bets.filter((b) => b.result !== "pending");
  const wonBets = bets.filter((b) => b.result === "won");
  const profit = bankroll - initialBankroll;
  const winRate =
    resolvedBets.length > 0
      ? Math.round((wonBets.length / resolvedBets.length) * 100)
      : 0;

  statBalance.textContent = `S/ ${bankroll.toFixed(2)}`;

  statProfit.textContent = `${profit >= 0 ? "+" : ""}S/ ${profit.toFixed(2)}`;
  statProfit.className =
    "stat-value " + (profit >= 0 ? "positive" : "negative");

  statWinRate.textContent = `${winRate}%`;
  statTotal.textContent = bets.length;
}

// Limpiar formulario

function clearForm() {
  sportSelect.value = "";
  descInput.value = "";
  amountInput.value = "";
  oddInput.value = "";
  resultSelect.value = "pending";
}
