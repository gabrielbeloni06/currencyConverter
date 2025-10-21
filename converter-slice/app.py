from flask import Flask, render_template, request, jsonify
import requests
app = Flask(__name__)
API_URL = "https://api.exchangerate.host/latest"

@app.route('/')
def index():
    """Renderiza a página inicial."""
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    """Recebe os dados do formulário, consulta a API e retorna o valor convertido."""
    try:
        data = request.json
        amount = float(data.get('amount'))
        from_currency = data.get('from_currency').upper()
        to_currency = data.get('to_currency').upper()
        params = {
            'base': from_currency,
            'symbols': to_currency,
            'amount': amount
        }
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        result = response.json()
        if result.get('success') and to_currency in result.get('rates', {}):
            rate = result['rates'][to_currency]
            converted_amount = amount * rate
            return jsonify({'converted_amount': converted_amount})
        else:
            error_message = result.get('error', {}).get('info', 'Moeda de destino inválida ou não encontrada.')
            return jsonify({'error': error_message}), 400

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erro ao conectar com a API: {e}'}), 500
    except (ValueError, TypeError):
        return jsonify({'error': 'O valor informado é inválido.'}), 400
    except Exception as e:
        return jsonify({'error': f'Ocorreu um erro inesperado: {e}'}), 500
if __name__ == '__main__':
    app.run(debug=True)
