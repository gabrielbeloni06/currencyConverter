document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('currency-list');
    const currencies = {
        USD: { name: "Dólar Americano", flag: "🇺🇸" },
        BRL: { name: "Real Brasileiro", flag: "🇧🇷" },
        EUR: { name: "Euro", flag: "🇪🇺" },
        GBP: { name: "Libra Esterlina", flag: "🇬🇧" },
        JPY: { name: "Iene Japonês", flag: "🇯🇵" },
        CAD: { name: "Dólar Canadense", flag: "🇨🇦" },
        AUD: { name: "Dólar Australiano", flag: "🇦🇺" },
        CHF: { name: "Franco Suíço", flag: "🇨🇭" },
        CNY: { name: "Yuan Chinês", flag: "🇨🇳" },
        SEK: { name: "Coroa Sueca", flag: "🇸🇪" },
        NZD: { name: "Dólar Neozelandês", flag: "🇳🇿" },
        MXN: { name: "Peso Mexicano", flag: "🇲🇽" },
        SGD: { name: "Dólar de Singapura", flag: "🇸🇬" },
        HKD: { name: "Dólar de Hong Kong", flag: "🇭🇰" },
        NOK: { name: "Coroa Norueguesa", flag: "🇳🇴" },
        KRW: { name: "Won Sul-Coreano", flag: "🇰🇷" },
        TRY: { name: "Lira Turca", flag: "🇹🇷" },
        RUB: { name: "Rublo Russo", flag: "🇷🇺" },
        INR: { name: "Rúpia Indiana", flag: "🇮🇳" },
        ZAR: { name: "Rand Sul-Africano", flag: "🇿🇦" }
    };

    gridElement.innerHTML = '';
    let delay = 0;
    for (const [code, data] of Object.entries(currencies)) {
        const item = document.createElement('div');
        item.className = 'currency-item';
        item.style.animationDelay = `${delay}ms`;

        item.innerHTML = `
            <div class="currency-flag">${data.flag}</div>
            <div class="currency-code">${code}</div>
            <div class="currency-name">${data.name}</div>
        `;

        gridElement.appendChild(item);
        delay += 100;
    }
});
