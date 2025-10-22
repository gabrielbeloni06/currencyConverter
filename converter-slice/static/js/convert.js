document.addEventListener("DOMContentLoaded", () => {
  const fromSel = document.getElementById("from");
  const toSel = document.getElementById("to");
  const amountInput = document.getElementById("amount");
  const btn = document.getElementById("convertBtn");
  const resultDiv = document.getElementById("result");
  const swapBtn = document.getElementById("swapBtn"); // PASSO 1
  
  // PASSO 2: Spinners
  const symbolsSpinner = document.getElementById("loadingSymbols");
  const chartSpinner = document.getElementById("loadingChart");

  // PASSO 3: Variável do Gráfico
  let myChart = null;
  const ctx = document.getElementById('historyChart').getContext('2d');

  // PASSO 3: Função para carregar e desenhar o gráfico
  async function loadChart(from, to) {
    if (from === to) {
        // Não busca gráfico se as moedas são iguais
        if (myChart) myChart.destroy();
        return;
    }
    chartSpinner.style.display = 'flex'; // PASSO 2
    try {
      const res = await fetch(`/api/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro ao obter histórico");

      if (myChart) {
        myChart.destroy(); // Limpa o gráfico anterior
      }
      
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: `Taxa ${from} para ${to}`,
            data: data.data,
            borderColor: '#f7931a',
            backgroundColor: 'rgba(247, 147, 26, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                titleColor: '#f7931a',
                bodyColor: '#ffffff',
            }
          },
          scales: {
            x: {
              ticks: { color: '#e0e0e0' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
              ticks: { color: '#e0e0e0' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          }
        }
      });

    } catch (err) {
      console.error("Erro ao carregar gráfico:", err);
      // Pode adicionar uma mensagem de erro no lugar do gráfico se desejar
    } finally {
      chartSpinner.style.display = 'none'; // PASSO 2
    }
  }


  // Populando os menus
  async function loadCurrencies() {
    symbolsSpinner.style.display = 'flex'; // PASSO 2
    resultDiv.textContent = "";
    try {
      const res = await fetch(`/api/symbols`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro ao obter moedas");
      const codes = data.symbols.map(s => s.code).sort();
      [fromSel, toSel].forEach(sel => {
        sel.innerHTML = "";
        codes.forEach(code => {
          const opt = document.createElement("option");
          opt.value = code;
          opt.textContent = code;
          sel.appendChild(opt);
        });
      });
      // Padrões
      if (codes.includes("USD")) fromSel.value = "USD";
      if (codes.includes("BRL")) toSel.value = "BRL";
      
    } catch (err) {
      resultDiv.className = 'result error'; // PASSO 2
      resultDiv.textContent = "Não foi possível carregar as moedas: " + err.message;
    } finally {
      symbolsSpinner.style.display = 'none'; // PASSO 2
      // PASSO 3: Carrega o gráfico inicial
      if(fromSel.value && toSel.value) {
        loadChart(fromSel.value, toSel.value);
      }
    }
  }
  btn.addEventListener("click", async () => {
    resultDiv.className = 'result loading';
    resultDiv.innerHTML = '<div class="spinner-small"></div> Convertendo...';
    
    const amount = amountInput.value || "1";
    const from = fromSel.value;
    const to = toSel.value;
    
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, from, to })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro na conversão");
      
      resultDiv.className = 'result success';
      resultDiv.innerHTML = `<strong>${amount} ${from}</strong> = <strong>${Number(data.result).toLocaleString(undefined, {maximumFractionDigits: 8})} ${to}</strong>`;
      loadChart(from, to); 

    } catch (err) {
      resultDiv.className = 'result error'; 
      resultDiv.textContent = "Erro: " + err.message;
    }
  });
  swapBtn.addEventListener("click", () => {
    const fromVal = fromSel.value;
    const toVal = toSel.value;
    fromSel.value = toVal;
    toSel.value = fromVal;
    loadChart(fromSel.value, toSel.value);
  });
  fromSel.addEventListener("change", () => loadChart(fromSel.value, toSel.value));
  toSel.addEventListener("change", () => loadChart(fromSel.value, toSel.value));
  loadCurrencies();
});