import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes.video_rendering import video_rendering_bp
from routes.chat_generation import chat_generation_bp


def create_app():
    app = Flask(__name__, static_folder="public", static_url_path="/public")

    load_dotenv()

    app.register_blueprint(video_rendering_bp)
    app.register_blueprint(chat_generation_bp)

    CORS(app)

    @app.route("/")
    def hello_world():
        return "Generative Manim Processor"

    @app.route("/openapi.yaml")
    def openapi():
        return send_from_directory(app.static_folder, "openapi.yaml")

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=False, host="0.0.0.0", port=port)
