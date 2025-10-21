from flask import Flask, render_template, request, jsonify
import requests
app = Flask(__name__)
# URL base da API
API_BASE_URL = "https://api.frankfurter.app"
@app.route('/')
def index():
    """Renderiza a página inicial."""
    return render_template('index.html')
@app.route('/currencies')
def get_currencies():
    """Busca a lista de moedas disponíveis na API."""
    try:
        response = requests.get(f"{API_BASE_URL}/currencies")
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Não foi possível buscar a lista de moedas.'}), 500
@app.route('/convert', methods=['POST'])
def convert():
    """Recebe os dados, consulta a nova API e retorna o valor convertido."""
    try:
        data = request.json
        amount = float(data.get('amount'))
        from_currency = data.get('from_currency').upper()
        to_currency = data.get('to_currency').upper()
        if from_currency == to_currency:
            return jsonify({'converted_amount': amount})
        params = {
            'amount': amount,
            'from': from_currency,
            'to': to_currency,
        }
        response = requests.get(f"{API_BASE_URL}/latest", params=params)
        if response.status_code != 200:
            try:
                error_data = response.json()
                error_message = error_data.get('message', 'A API retornou um erro inesperado.')
                return jsonify({'error': error_message}), response.status_code
            except ValueError:
                return jsonify({'error': f'Erro HTTP {response.status_code} da API.'}), response.status_code
        result = response.json()
        if 'rates' in result and to_currency in result['rates']:
            converted_amount = result['rates'][to_currency]
            return jsonify({'converted_amount': converted_amount})
        else:
            return jsonify({'error': 'Resposta inesperada da API.'}), 400
    except requests.exceptions.RequestException:
        return jsonify({'error': 'Erro de conexão com a API externa.'}), 500
    except (ValueError, TypeError):
        return jsonify({'error': 'O valor informado é inválido.'}), 400
    except Exception:
        return jsonify({'error': 'Ocorreu um erro inesperado no servidor.'}), 500
if __name__ == '__main__':
    app.run(debug=True)
