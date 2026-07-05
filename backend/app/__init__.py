from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from app.config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.routes.health import health_bp
    app.register_blueprint(health_bp)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.files import files_bp
    app.register_blueprint(files_bp)

    from app.routes.ai import ai_bp
    app.register_blueprint(ai_bp)

    with app.app_context():
        from app import models
        db.create_all()

    return app