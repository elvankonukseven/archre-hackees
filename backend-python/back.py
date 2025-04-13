import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from dotenv import load_dotenv
from rag.rag_v1 import run_rag_pipeline, run_rag_writeup
import tempfile
# from rag.report_generator import generate_report_content



# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

# Config AWS
s3 = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

# Route basique
@app.route('/upload', methods=['GET'])
def check_backend():
    return 'Backend opérationnel. Mais upload direct vers S3 depuis le front :)'

# Route upload vers S3
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier'}), 400

    file = request.files['file']
    bucket_name = os.getenv('S3_BUCKET_NAME')

    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            file.filename,
            ExtraArgs={'ContentType': file.content_type}
        )
        file_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{file.filename}"
        return jsonify({'url': file_url})

    except Exception as e:
        print(e)
        return jsonify({'error': 'Erreur upload S3'}), 500

# Route message simple
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({'error': 'Pas de message envoyé'}), 400

    try:
        print(f"Message reçu du front : {message}")

        response = run_rag_pipeline("/Users/flaviawallenhorst/Desktop/dev/reassurance/archre-hackees/data/submissions/florida", message)

        print(f"Réponse générée : {response}")

        return jsonify({'reply': response}), 200

    except Exception as e:
        print("Erreur dans /chat :", e)  # Très important
        return jsonify({'error': 'Erreur côté backend'}), 500

@app.route('/report', methods=['GET'])
def generate_report():
    try:
        report_content = run_rag_writeup()
        return jsonify({'report': report_content}), 200
    except Exception as e:
        print("Erreur dans /report :", e)
        return jsonify({'error': 'Erreur côté backend'}), 500

# app = Flask(__name__)

# @app.route('/upload', methods=['POST'])
# def upload_files():
#     uploaded_files = request.files.getlist("files")
#     temp_paths = []

#     for file in uploaded_files:
#         temp_path = os.path.join(tempfile.gettempdir(), file.filename)
#         file.save(temp_path)
#         temp_paths.append(temp_path)

#     # Ici tu appelles ta fonction existante
#     for path in temp_paths:
#         response = run_rag_pipeline(path)

#     return 'Files processed', 200

# app.run(port=5000)

if __name__ == '__main__':
    app.run(port=4000, debug=True)