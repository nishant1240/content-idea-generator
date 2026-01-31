from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from groq import Groq
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
client = Groq(api_key=GROQ_API_KEY)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_ideas():
    try:
        data = request.json
        niche = data.get('niche')
        content_type = data.get('content_type')
        platform = data.get('platform')
        tone = data.get('tone')
        
        # Create enhanced prompt for AI
        prompt = f"""Generate 5 creative and unique content ideas for {platform} about {niche}.

Content Type: {content_type}
Tone: {tone}

For each idea, provide:
1. A catchy, specific title
2. A brief description of what the content would cover

Format each idea as:
1. [Title]
[Description]

2. [Title]
[Description]

...and so on.

Make the ideas actionable, engaging, and tailored to the platform and tone."""
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.8,
        )
        
        result = chat_completion.choices[0].message.content
        
        return jsonify({
            'success': True,
            'ideas': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)