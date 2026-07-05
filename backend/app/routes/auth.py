from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User, Note, Quiz, Flashcard, UploadedFile

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are all required'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email already exists'}), 409

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Account created successfully',
        'user': new_user.to_dict()
    }), 201


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200
    

@auth_bp.route('/api/auth/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()

    notes_count = Note.query.filter_by(user_id=user_id).count()
    quizzes_count = Quiz.query.filter_by(user_id=user_id).count()
    flashcards_count = Flashcard.query.filter_by(user_id=user_id).count()
    files_count = UploadedFile.query.filter_by(user_id=user_id).count()

    return jsonify({
        'notes': notes_count,
        'quizzes': quizzes_count,
        'flashcards': flashcards_count,
        'files': files_count
    }), 200
