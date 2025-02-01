# Introduction 
Generative Manim is an artificial intelligence system that helps create mathematical animations from text using large language models (LLMs) like GPT-4 and Claude. Instead of requiring programming skills, users only need to describe their ideas in natural language, and the system will automatically convert them into Manim code to create animated videos. We also provide a friendly and easy-to-use web interface, making the process of creating, previewing, and exporting videos straightforward.
# How to run
## Prerequisites
You need to install [manim](https://www.manim.community/) on your local computer. Then expose the following environment variables 
```
OPENAI_API_KEY = Your OPENAI_API_KEY
ANTHROPIC_API_KEY = Your ANTHROPIC_API_KEY
```

## Run
First you need to install uv package manager, then move to the api folder
```
uv init
uv add -r requirement.txt
```
After that you can run the project with uv run run.py 
Then you move to the fe folder, make sure that nodejs and yarn have been installed on your machine
```
yarn run dev
```
the frontend should be running now.
