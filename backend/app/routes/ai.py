import os
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pypdf import PdfReader
from anthropic import Anthropic
from app import db
from app.config import Config
from app.models import UploadedFile, Note, Quiz, QuizResult, Flashcard

ai_bp = Blueprint('ai', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

client = Anthropic(api_key=Config.ANTHROPIC_API_KEY)


def extract_pdf_text(filepath):
    reader = PdfReader(filepath)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    return text


@ai_bp.route('/api/ai/notes', methods=['POST'])
@jwt_required()
def generate_notes():
    user_id = get_jwt_identity()
    data = request.get_json()
    file_id = data.get('file_id')

    if not file_id:
        return jsonify({'error': 'file_id is required'}), 400

    uploaded_file = UploadedFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not uploaded_file:
        return jsonify({'error': 'File not found'}), 404

    filepath = os.path.join(UPLOAD_FOLDER, uploaded_file.stored_filename)

    try:
        pdf_text = extract_pdf_text(filepath)
    except Exception:
        return jsonify({'error': 'Could not read PDF content'}), 500

    if not pdf_text.strip():
        return jsonify({'error': 'No readable text found in this PDF'}), 400

    pdf_text = pdf_text[:15000]

    prompt = f"""You are a study assistant. Read the following study material and generate structured notes.

Format your response as clean Markdown with:
- A main heading for the overall topic
- Subheadings for each major section
- Bullet points for key points under each subheading
- A final "Important Concepts" section highlighting the most critical terms or ideas

Study material:
{pdf_text}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        notes_content = message.content[0].text
    except Exception as e:
        return jsonify({'error': 'AI generation failed', 'details': str(e)}), 500

    new_note = Note(
        user_id=user_id,
        title=f"Notes: {uploaded_file.original_filename}",
        content=notes_content,
        source_filename=uploaded_file.original_filename
    )
    db.session.add(new_note)
    db.session.commit()

    return jsonify({
        'note': new_note.to_dict()
    }), 201


@ai_bp.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    user_id = get_jwt_identity()
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()

    return jsonify({
        'notes': [n.to_dict() for n in notes]
    }), 200


@ai_bp.route('/api/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()

    if not note:
        return jsonify({'error': 'Note not found'}), 404

    db.session.delete(note)
    db.session.commit()

    return jsonify({'message': 'Note deleted'}), 200


@ai_bp.route('/api/ai/quiz', methods=['POST'])
@jwt_required()
def generate_quiz():
    user_id = get_jwt_identity()
    data = request.get_json()
    file_id = data.get('file_id')
    difficulty = data.get('difficulty', 'medium')
    num_questions = data.get('num_questions', 5)

    if difficulty not in ['easy', 'medium', 'hard']:
        return jsonify({'error': 'difficulty must be easy, medium, or hard'}), 400

    if not file_id:
        return jsonify({'error': 'file_id is required'}), 400

    uploaded_file = UploadedFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not uploaded_file:
        return jsonify({'error': 'File not found'}), 404

    filepath = os.path.join(UPLOAD_FOLDER, uploaded_file.stored_filename)

    try:
        pdf_text = extract_pdf_text(filepath)
    except Exception:
        return jsonify({'error': 'Could not read PDF content'}), 500

    if not pdf_text.strip():
        return jsonify({'error': 'No readable text found in this PDF'}), 400

    pdf_text = pdf_text[:15000]

    prompt = f"""You are a quiz generator. Based on the study material below, create exactly {num_questions} multiple choice questions at {difficulty} difficulty level.

Respond with ONLY valid JSON, no other text, in exactly this format:
{{
  "questions": [
    {{
      "question": "question text here",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": 0
    }}
  ]
}}

The "correct_answer" field must be the index (0-3) of the correct option in the "options" array.

Study material:
{pdf_text}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw_response = message.content[0].text.strip()

        if raw_response.startswith('```'):
            raw_response = raw_response.split('```')[1]
            if raw_response.startswith('json'):
                raw_response = raw_response[4:]
            raw_response = raw_response.strip()

        quiz_data = json.loads(raw_response)
    except json.JSONDecodeError:
        return jsonify({'error': 'AI returned invalid quiz format, please try again'}), 500
    except Exception as e:
        return jsonify({'error': 'AI generation failed', 'details': str(e)}), 500

    new_quiz = Quiz(
        user_id=user_id,
        title=f"Quiz: {uploaded_file.original_filename}",
        difficulty=difficulty,
        questions_json=json.dumps(quiz_data['questions'])
    )
    db.session.add(new_quiz)
    db.session.commit()

    return jsonify({'quiz': new_quiz.to_dict()}), 201


@ai_bp.route('/api/quizzes', methods=['GET'])
@jwt_required()
def get_quizzes():
    user_id = get_jwt_identity()
    quizzes = Quiz.query.filter_by(user_id=user_id).order_by(Quiz.created_at.desc()).all()

    return jsonify({'quizzes': [q.to_dict() for q in quizzes]}), 200


@ai_bp.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    answers = data.get('answers')

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()

    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    questions = json.loads(quiz.questions_json)

    score = 0
    for i, question in enumerate(questions):
        if i < len(answers) and answers[i] == question['correct_answer']:
            score += 1

    result = QuizResult(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=len(questions)
    )
    db.session.add(result)
    db.session.commit()

    return jsonify({'result': result.to_dict()}), 201

@ai_bp.route('/api/ai/flashcards', methods=['POST'])
@jwt_required()
def generate_flashcards():
    user_id = get_jwt_identity()
    data = request.get_json()
    file_id = data.get('file_id')
    num_cards = data.get('num_cards', 8)

    if not file_id:
        return jsonify({'error': 'file_id is required'}), 400

    uploaded_file = UploadedFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not uploaded_file:
        return jsonify({'error': 'File not found'}), 404

    filepath = os.path.join(UPLOAD_FOLDER, uploaded_file.stored_filename)

    try:
        pdf_text = extract_pdf_text(filepath)
    except Exception:
        return jsonify({'error': 'Could not read PDF content'}), 500

    if not pdf_text.strip():
        return jsonify({'error': 'No readable text found in this PDF'}), 400

    pdf_text = pdf_text[:15000]

    prompt = f"""You are a flashcard generator. Based on the study material below, create exactly {num_cards} flashcards for studying.

Respond with ONLY valid JSON, no other text, in exactly this format:
{{
  "topic": "brief topic name",
  "flashcards": [
    {{
      "question": "question or term on the front of the card",
      "answer": "answer or definition on the back of the card"
    }}
  ]
}}

Make each question concise and each answer clear but brief (1-3 sentences max).

Study material:
{pdf_text}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw_response = message.content[0].text.strip()

        if raw_response.startswith('```'):
            raw_response = raw_response.split('```')[1]
            if raw_response.startswith('json'):
                raw_response = raw_response[4:]
            raw_response = raw_response.strip()

        flashcard_data = json.loads(raw_response)

    except json.JSONDecodeError:
        return jsonify({'error': 'AI returned invalid format, please try again'}), 500
    except Exception as e:
        return jsonify({'error': 'AI generation failed', 'details': str(e)}), 500

    topic = flashcard_data.get('topic', uploaded_file.original_filename)
    saved_cards = []

    for card in flashcard_data.get('flashcards', []):
        new_card = Flashcard(
            user_id=user_id,
            topic=topic,
            question=card['question'],
            answer=card['answer'],
            source_filename=uploaded_file.original_filename
        )
        db.session.add(new_card)
        saved_cards.append(new_card)

    db.session.commit()

    return jsonify({
        'topic': topic,
        'flashcards': [c.to_dict() for c in saved_cards]
    }), 201


@ai_bp.route('/api/flashcards', methods=['GET'])
@jwt_required()
def get_flashcards():
    user_id = get_jwt_identity()
    cards = Flashcard.query.filter_by(user_id=user_id).order_by(Flashcard.created_at.desc()).all()

    return jsonify({'flashcards': [c.to_dict() for c in cards]}), 200


@ai_bp.route('/api/flashcards/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_flashcard(card_id):
    user_id = get_jwt_identity()
    card = Flashcard.query.filter_by(id=card_id, user_id=user_id).first()

    if not card:
        return jsonify({'error': 'Flashcard not found'}), 404

    db.session.delete(card)
    db.session.commit()

    return jsonify({'message': 'Flashcard deleted'}), 200

@ai_bp.route('/api/ai/summary', methods=['POST'])
@jwt_required()
def generate_summary():
    user_id = get_jwt_identity()
    data = request.get_json()
    file_id = data.get('file_id')
    summary_type = data.get('summary_type', 'medium')

    if summary_type not in ['short', 'medium', 'exam']:
        return jsonify({'error': 'summary_type must be short, medium, or exam'}), 400

    if not file_id:
        return jsonify({'error': 'file_id is required'}), 400

    uploaded_file = UploadedFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not uploaded_file:
        return jsonify({'error': 'File not found'}), 404

    filepath = os.path.join(UPLOAD_FOLDER, uploaded_file.stored_filename)

    try:
        pdf_text = extract_pdf_text(filepath)
    except Exception:
        return jsonify({'error': 'Could not read PDF content'}), 500

    if not pdf_text.strip():
        return jsonify({'error': 'No readable text found in this PDF'}), 400

    pdf_text = pdf_text[:15000]

    type_instructions = {
        'short': 'Write a SHORT summary in 3-5 sentences covering only the most essential points.',
        'medium': 'Write a MEDIUM summary in 2-3 paragraphs covering main ideas and key supporting points.',
        'exam': 'Write an EXAM-FOCUSED summary. Include: key definitions, important formulas or facts, likely exam topics, and critical concepts to memorize. Use bullet points and bold key terms.'
    }

    prompt = f"""You are a study assistant. Read the following study material and {type_instructions[summary_type]}

Format your response as clean Markdown.

Study material:
{pdf_text}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        summary_content = message.content[0].text
    except Exception as e:
        return jsonify({'error': 'AI generation failed', 'details': str(e)}), 500

    return jsonify({
        'summary': summary_content,
        'summary_type': summary_type,
        'source_file': uploaded_file.original_filename
    }), 200