document.addEventListener("DOMContentLoaded", () => {
  const baseSelect = document.getElementById("baseSelect");
  const tbody = document.querySelector("#ratesTable tbody");
  let autoTimer = null;
  const REFRESH = 60 * 1000;
  const symbolsSpinner = document.getElementById("loadingSymbols");

  async function loadSymbolsOnce() {
    symbolsSpinner.style.display = 'flex';
    try {
      const res = await fetch('/api/symbols');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro ao obter símbolos");
      const codes = data.symbols.map(s => s.code).sort();
      baseSelect.innerHTML = "";
      codes.forEach(code => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = code;
        baseSelect.appendChild(opt);
      });
      baseSelect.value = "USD";
    } catch (err) {
      console.warn("Não foi possível carregar símbolos:", err);
      document.querySelector('.base-selector').style.display = 'none';
    } finally {
      symbolsSpinner.style.display = 'none';
    }
  }

  async function loadRates(base = "USD") {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align: center;"><div class="spinner-small" style="display: inline-block;"></div> Carregando taxas...</td></tr>`;
    try {
      const res = await fetch(`/api/rates?base=${encodeURIComponent(base)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro ao obter taxas");
      tbody.innerHTML = "";
      
      const entries = Object.entries(data.rates).sort((a, b) => a[0].localeCompare(b[0]));
      
      if (entries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align: center;">Não há taxas disponíveis para ${base}.</td></tr>`;
        return;
      }
      
      entries.forEach(([code, rate]) => {
        const tr = document.createElement("tr");
        const tdCode = document.createElement("td");
        tdCode.textContent = code;
        const tdRate = document.createElement("td");
        tdRate.textContent = Number(rate).toLocaleString(undefined, { maximumFractionDigits: 8 });
        tr.appendChild(tdCode);
        tr.appendChild(tdRate);
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #ef4444;">Erro ao carregar taxas: ${err.message}</td></tr>`;
    }
  }

  baseSelect.addEventListener("change", () => {
    if (autoTimer) clearInterval(autoTimer);
    loadRates(baseSelect.value);
    autoTimer = setInterval(() => loadRates(baseSelect.value), REFRESH);
  });
  loadSymbolsOnce().then(() => {
    loadRates(baseSelect.value || "USD");
    autoTimer = setInterval(() => loadRates(baseSelect.value || "USD"), REFRESH);
  });
});