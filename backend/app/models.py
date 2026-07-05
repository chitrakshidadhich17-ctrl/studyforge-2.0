import json
from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False, unique=True)
    file_size = db.Column(db.Integer, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='uploaded_files')

    def to_dict(self):
        return {
            'id': self.id,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at.isoformat()
        }

class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    source_filename = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='notes')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'source_filename': self.source_filename,
            'created_at': self.created_at.isoformat()
        }

class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
    questions_json = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='quizzes')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'difficulty': self.difficulty,
            'questions': json.loads(self.questions_json),
            'created_at': self.created_at.isoformat()
        }


class QuizResult(db.Model):
    __tablename__ = 'quiz_results'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='quiz_results')
    quiz = db.relationship('Quiz', backref='results')

    def to_dict(self):
        return {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'score': self.score,
            'total_questions': self.total_questions,
            'completed_at': self.completed_at.isoformat()
        }
    
class Flashcard(db.Model):
    __tablename__ = 'flashcards'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    source_filename = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='flashcards')

    def to_dict(self):
        return {
            'id': self.id,
            'topic': self.topic,
            'question': self.question,
            'answer': self.answer,
            'source_filename': self.source_filename,
            'created_at': self.created_at.isoformat()
        }