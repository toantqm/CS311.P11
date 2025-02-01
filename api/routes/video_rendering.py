from flask import Blueprint, jsonify, current_app, request, Response
import subprocess
import os
import re
import json
import sys
import traceback
import shutil
from typing import Union
import uuid
import time
import requests

video_rendering_bp = Blueprint("video_rendering", __name__)


USE_LOCAL_STORAGE = os.getenv("USE_LOCAL_STORAGE", "true") == "true"
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8080")


def move_to_public_folder(
    file_path: str, video_storage_file_name: str, base_url: Union[str, None] = None
) -> str:
    """
    Moves the video to the public folder and returns the URL.
    """
    public_folder = os.path.join(os.path.dirname(__file__), "public")
    os.makedirs(public_folder, exist_ok=True)

    new_file_name = f"{video_storage_file_name}.mp4"
    new_file_path = os.path.join(public_folder, new_file_name)

    shutil.move(file_path, new_file_path)

    url_base = base_url if base_url else BASE_URL
    video_url = f"{url_base.rstrip('/')}/public/{new_file_name}"
    return video_url


def get_frame_config(aspect_ratio):
    if aspect_ratio == "16:9":
        return (3840, 2160), 14.22
    elif aspect_ratio == "9:16":
        return (1080, 1920), 8.0
    elif aspect_ratio == "1:1":
        return (1080, 1080), 8.0
    else:
        return (3840, 2160), 14.22


@video_rendering_bp.route("/v1/video/rendering", methods=["POST"])
def render_video():
    code = request.json.get("code")
    file_name = request.json.get("file_name")
    file_class = request.json.get("file_class")

    user_id = request.json.get("user_id") or str(uuid.uuid4())
    project_name = request.json.get("project_name")
    iteration = request.json.get("iteration")

    aspect_ratio = request.json.get("aspect_ratio")
    stream = request.json.get("stream", False)

    video_storage_file_name = f"video-{user_id}-{project_name}-{iteration}"

    if not code:
        return jsonify(error="No code provided"), 400

    frame_size, frame_width = get_frame_config(aspect_ratio)

    modified_code = f"""
from manim import *
from math import *
config.frame_size = {frame_size}
config.frame_width = {frame_width}

{code}
    """

    file_name = f"scene_{os.urandom(2).hex()}.py"
    api_dir = os.path.dirname(os.path.dirname(__file__))
    public_dir = os.path.join(api_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    file_path = os.path.join(public_dir, file_name)

    with open(file_path, "w") as f:
        f.write(modified_code)

    def render_video():
        try:
            command_list = [
                "manim",
                file_path,
                file_class,
                "--format=mp4",
                "--media_dir",
                ".",
                "--custom_folders",
            ]

            process = subprocess.Popen(
                command_list,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.path.dirname(os.path.realpath(__file__)),
                text=True,
                bufsize=1,
            )
            current_animation = -1
            current_percentage = 0
            error_output = []
            in_error = False

            while True:
                output = process.stdout.readline()
                error = process.stderr.readline()

                if output == "" and error == "" and process.poll() is not None:
                    break

                if output:
                    print("STDOUT:", output.strip())
                if error:
                    print("STDERR:", error.strip())
                    error_output.append(error.strip())

                if "is not in the script" in error:
                    in_error = True
                    continue

                if "Traceback (most recent call last)" in error:
                    in_error = True
                    continue

                if in_error:
                    if error.strip() == "":
                        in_error = False
                        full_error = "\n".join(error_output)
                        yield f'{{"error": {json.dumps(full_error)}}}\n'
                        return
                    continue

                animation_match = re.search(r"Animation (\d+):", error)
                if animation_match:
                    new_animation = int(animation_match.group(1))
                    if new_animation != current_animation:
                        current_animation = new_animation
                        current_percentage = 0
                        yield f'{{"animationIndex": {current_animation}, "percentage": 0}}\n'

                percentage_match = re.search(r"(\d+)%", error)
                if percentage_match:
                    new_percentage = int(percentage_match.group(1))
                    if new_percentage != current_percentage:
                        current_percentage = new_percentage
                        yield f'{{"animationIndex": {current_animation}, "percentage": {current_percentage}}}\n'

            if process.returncode == 0:
                video_file_path = os.path.join(
                    os.path.dirname(os.path.realpath(__file__)),
                    f"{file_class or 'GenScene'}.mp4",
                )

                if not os.path.exists(video_file_path):
                    video_file_path = os.path.join(
                        os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
                        f"{file_class or 'GenScene'}.mp4",
                    )

                if os.path.exists(video_file_path):
                    print(f"Video file found at: {video_file_path}")
                else:
                    print(
                        f"Video file not found. Files in current directory: {os.listdir(os.path.dirname(video_file_path))}"
                    )
                    raise FileNotFoundError(
                        f"Video file not found at {video_file_path}"
                    )

                print(
                    f"Files in video file directory: {os.listdir(os.path.dirname(video_file_path))}"
                )

                base_url = (
                    request.host_url
                    if request and hasattr(request, "host_url")
                    else None
                )
                video_url = move_to_public_folder(
                    video_file_path, video_storage_file_name, base_url
                )
                print(f"Video URL: {video_url}")
                if stream:
                    yield f'{{ "video_url": "{video_url}" }}\n'
                    sys.stdout.flush()
                else:
                    yield {
                        "message": "Video generation completed",
                        "video_url": video_url,
                    }
            else:
                full_error = "\n".join(error_output)
                yield f'{{"error": {json.dumps(full_error)}}}\n'

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            traceback.print_exc()
            print(f"Files in current directory after error: {os.listdir('.')}")
            yield f'{{"error": "Unexpected error occurred: {str(e)}"}}\n'
        finally:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Removed temporary file: {file_path}")
                if os.path.exists(video_file_path):
                    os.remove(video_file_path)
                    print(f"Removed temporary video file: {video_file_path}")
            except Exception as e:
                print(f"Error removing temporary file {file_path}: {e}")

    if stream:
        return Response(render_video(), content_type="text/event-stream", status=207)
    else:
        video_url = None
        try:
            for result in render_video():
                print(f"Generated result: {result}")
                if isinstance(result, dict):
                    if "video_url" in result:
                        video_url = result["video_url"]
                    elif "error" in result:
                        raise Exception(result["error"])

            if video_url:
                return (
                    jsonify(
                        {
                            "message": "Video generation completed",
                            "video_url": video_url,
                        }
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {"message": "Video generation completed, but no URL was found"}
                    ),
                    200,
                )
        except StopIteration:
            if video_url:
                return (
                    jsonify(
                        {
                            "message": "Video generation completed",
                            "video_url": video_url,
                        }
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {"message": "Video generation completed, but no URL was found"}
                    ),
                    200,
                )
        except Exception as e:
            print(f"Error in non-streaming mode: {e}")
            return jsonify({"error": str(e)}), 500


def download_video(video_url):
    local_filename = video_url.split("/")[-1]
    response = requests.get(video_url)
    response.raise_for_status()
    with open(local_filename, "wb") as f:
        f.write(response.content)
    return local_filename
