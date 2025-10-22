document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('conversion-form');
    const resultElement = document.getElementById('result');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('from_currency').value.toUpperCase();
        const toCurrency = document.getElementById('to_currency').value.toUpperCase();
        if (!amount || !fromCurrency || !toCurrency) {
            showResult('Preencha todos os campos.', 'error');
            return;
        }
        if (amount <= 0) {
            showResult('O valor deve ser maior que zero.', 'error');
            return;
        }
        const rates = {
            'USD': { 'BRL': 5.20, 'EUR': 0.85, 'GBP': 0.73 },
            'BRL': { 'USD': 0.19, 'EUR': 0.16, 'GBP': 0.14 },
            'EUR': { 'USD': 1.18, 'BRL': 6.10, 'GBP': 0.86 },
            'GBP': { 'USD': 1.37, 'BRL': 7.10, 'EUR': 1.16 }
        };
        let convertedAmount;
        if (fromCurrency === toCurrency) {
            convertedAmount = amount;
        } else if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
            convertedAmount = amount * rates[fromCurrency][toCurrency];
        } else {
            convertedAmount = amount * 1.0;
        }
        showResult(`${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`, 'success');
    });

    function showResult(message, type) {
        resultElement.textContent = message;
        resultElement.className = `result ${type}`;
        resultElement.style.animation = 'none';
        setTimeout(() => {
            resultElement.style.animation = '';
        }, 10);
    }
});
