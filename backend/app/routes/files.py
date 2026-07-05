import os
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models import UploadedFile

files_bp = Blueprint('files', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@files_bp.route('/api/files/upload', methods=['POST'])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    original_filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

    file.save(filepath)
    file_size = os.path.getsize(filepath)

    new_file = UploadedFile(
        user_id=user_id,
        original_filename=original_filename,
        stored_filename=unique_filename,
        file_size=file_size
    )
    db.session.add(new_file)
    db.session.commit()

    return jsonify({
        'message': 'File uploaded successfully',
        'file': new_file.to_dict()
    }), 201


@files_bp.route('/api/files', methods=['GET'])
@jwt_required()
def get_files():
    user_id = get_jwt_identity()
    files = UploadedFile.query.filter_by(user_id=user_id).order_by(UploadedFile.uploaded_at.desc()).all()

    return jsonify({
        'files': [f.to_dict() for f in files]
    }), 200