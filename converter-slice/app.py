from flask import Flask, render_template, request, jsonify
import requests
import time
import datetime

app = Flask(__name__, template_folder="templates", static_folder="static")

_rates_cache = {
    "base": None,
    "timestamp": 0,
    "ttl": 60, 
    "data": {}
}

_symbols_cache = {
    "timestamp": 0,
    "ttl": 3600,
    "data": {}
}
EXCHANGE_API_BASE = "https://api.frankfurter.app"

def fetch_rates_from_api(base="USD"):
    url = f"{EXCHANGE_API_BASE}/latest"
    params = {"from": base}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_rates(base="USD"):
    now = time.time()
    if _rates_cache["base"] == base and (now - _rates_cache["timestamp"]) < _rates_cache["ttl"]:
        return _rates_cache["data"]
    try:
        data = fetch_rates_from_api(base)
        reformatted_data = {
            "base": data.get("base", base),
            "date": data.get("date"),
            "rates": data.get("rates", {})
        }
        _rates_cache.update({
            "base": base,
            "timestamp": now,
            "data": reformatted_data
        })
        return reformatted_data
    except Exception as e:
        if _rates_cache["data"]:
            return _rates_cache["data"]
        raise e
def fetch_symbols_from_api():
    url = f"{EXCHANGE_API_BASE}/currencies" 
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    symbols_dict = {k: {"description": v} for k, v in data.items()}
    return {"symbols": symbols_dict}


def get_symbols():
    now = time.time()
    if (now - _symbols_cache["timestamp"]) < _symbols_cache["ttl"] and _symbols_cache["data"]:
        return _symbols_cache["data"]
    try:
        data = fetch_symbols_from_api()
        symbols = data.get("symbols", {})
        _symbols_cache.update({"timestamp": now, "data": symbols})
        return symbols
    except Exception:
        if _rates_cache["data"]:
            rates = _rates_cache["data"].get("rates", {})
            base = _rates_cache["data"].get("base", "USD")
            symbols = {base: {"description": base}}
            symbols.update({k: {"description": k} for k in rates.keys()})
            return symbols
        return {}
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/convert")
def convert_page():
    return render_template("convert.html")


@app.route("/valores")
def valores_page():
    return render_template("valores.html")

@app.route("/api/symbols")
def api_symbols():
    try:
        symbols = get_symbols()
        items = [{"code": k, "description": v.get("description", "")} for k, v in symbols.items()]
        items.sort(key=lambda x: x["code"])
        return jsonify({"success": True, "symbols": items})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/rates")
def api_rates():
    base = request.args.get("base", "USD").upper()
    try:
        data = get_rates(base)
        return jsonify({
            "success": True,
            "base": data.get("base", base),
            "date": data.get("date"),
            "rates": data.get("rates", {})
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@app.route("/api/convert", methods=["GET", "POST"])
def api_convert():
    params = request.get_json(silent=True) or request.args.to_dict()
    try:
        amount = float(params.get("amount", 1))
        _from = params.get("from") or params.get("base") or params.get("from_currency")
        _to = params.get("to") or params.get("target") or params.get("to_currency")
        if not _from or not _to:
            return jsonify({"success": False, "error": "Parâmetros 'from' e 'to' são obrigatórios."}), 400
        _from = _from.upper()
        _to = _to.upper()
        if _from == _to:
            return jsonify({
                "success": True,
                "query": {"from": _from, "to": _to, "amount": amount},
                "result": amount,
                "info": {"rate": 1}
            })
        url = f"{EXCHANGE_API_BASE}/latest"
        api_params = {"from": _from, "to": _to, "amount": amount}
        resp = requests.get(url, params=api_params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        result_rate = data.get("rates", {}).get(_to)
        if result_rate is None:
            return jsonify({"success": False, "error": "Moeda de destino não encontrada na resposta da API."}), 500

        return jsonify({
            "success": True,
            "query": {"from": _from, "to": _to, "amount": amount},
            "result": result_rate,
            "info": {"rate": result_rate / amount if amount != 0 else 0}
        })
    except ValueError:
        return jsonify({"success": False, "error": "Valor inválido para 'amount'."}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@app.route("/api/history")
def api_history():
    try:
        _from = request.args.get("from").upper()
        _to = request.args.get("to").upper()
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=30)
        
        url = f"{EXCHANGE_API_BASE}/{start_date}..{end_date}"
        params = {"from": _from, "to": _to}
        
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        rates = data.get("rates", {})
        labels = sorted(rates.keys())
        chart_data = [rates[date].get(_to) for date in labels]
        
        return jsonify({"success": True, "labels": labels, "data": chart_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)