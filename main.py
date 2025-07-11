# main.py

from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

# 1. Create your FastAPI application instance
app = FastAPI(
    title="My Simple Portfolio API",
    description="A basic FastAPI backend for a portfolio or simple site.",
    version="0.1.0",
)

# --- CORS Middleware Configuration ---
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://*.onrender.com", # Allow Render's default domains
    "https://jagadishpokharel58.com.np", # Your custom domain
    "https://www.jagadishpokharel58.com.np", 
    # If you still need to open index.html directly from your file system (e.g., file:///path/to/index.html)
    # and it makes requests before FastAPI serves it, you might need "null" here.
    # But now that FastAPI serves it, it's generally not needed.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware)

# --- Serve Static Files ---
# CORRECTED: Directory is "static" relative to main.py
# This tells FastAPI to serve files from the 'static' directory
# located directly inside your FAST/ project folder.
# Access them via http://127.0.0.1:8000/static/css/style.css, etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Define a Pydantic model for data you expect in requests
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None



if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))  # Render sets $PORT
    uvicorn.run(app, host="0.0.0.0", port=port)
# --- Path Operations (API Endpoints) ---

# CORRECTED: Root endpoint to serve your index.html from the 'templates' folder
# When a user goes to http://127.0.0.1:8000/, this will return your main HTML page.
@app.head("/", response_class=HTMLResponse)  # Add this

@app.get("/", response_class=HTMLResponse)
async def read_index():
    """
    Serves the main index.html file for the portfolio frontend.
    """
    # Ensure the path to index.html is correct relative to where main.py is run
    return FileResponse("templates/index.html")


# Existing API endpoints (from your previous main.py)

@app.get("/api/profile")
async def get_profile():
    """
    Returns static profile data. In a real app, this would come from a DB.
    """
    return {
        "name": "Jaggu",
        "bio": "An eager and dedicated Computer Science engineering student specializing in Machine Learning, data-driven solutions, and Python-based web technologies. I focus on developing robust and efficient applications, from scalable ML models to intuitive user interfaces. I'm constantly seeking new challenges and expanding my knowledge in the evolving fields of AI and software engineering.",
        "imageUrl": "/static/profile.png",
        "socials": [
            {"platform": "LinkedIn", "url": "https://linkedin.com/in/jagadish-pokharel", "icon": "linkedin"},
            {"platform": "GitHub", "url": "https://github.com/jagadish-pokharel", "icon": "github"}
        ],
        "email": "jagupok@gmail.com"
    }

@app.get("/api/skills")
async def get_skills():
    """
    Returns a static list of skills. In a real app, this would come from a DB.
    """
    return [
            "Python (Proficient)", "JavaScript", "HTML/CSS",
            "Django", "Flask", "Scikit-learn", "Pandas", "NumPy",
            "Collaborative Filtering", "NLP", "Recommendation Systems",
            "Git", "GitHub", "VS Code", "Jupyter Notebook", "SQL", "SQLite", "Latex",
            "Cloud Computing", "AI applications", "Cybersecurity"
    ]


@app.get("/hello/{name}")
async def say_hello(name: str):
    """
    Greets a specific name provided in the URL path.
    """
    return {"message": f"Hello, {name}!"}

@app.get("/items/")
async def read_items(skip: int = 0, limit: int = 10):
    """
    Retrieves a list of projects from Jagadish's resume.
    """
    # Projects extracted and summarized from your resume
    fake_items_db = [
        {
            "item_name": "Book Recommendation System",
            "description": "Developed using Hybrid techniques, implementing user-based and item-based filtering approaches. Processed datasets with over 1,000,000 book entries.",
            "technologies": ["Python", "Machine Learning", "Collaborative Filtering"]
        },
        {
            "item_name": "Text Summarization API",
            "description": "Integrated LLM API for concise text summaries and built a Flask-based web interface for text input and display. Reduced average reading time by 70% for lengthy documents and implemented caching to improve response times.",
            "technologies": ["Python", "Flask", "LLM API", "NLP", "Caching"]
        },
        {
            "item_name": "Personal Portfolio Website",
            "description": "Developed using Django with user authentication. Designed a responsive layout with blog functionality and implemented security measures including HTTPS.",
            "technologies": ["Django", "Python", "HTML/CSS", "JavaScript", "User Authentication", "HTTPS"]
        },
        {
            "item_name": "Library Management System (SQL Database)",
            "description": "Designed and implemented a comprehensive database system for library operations, including a normalized relational database schema with 10+ tables (Books, Members, Loans, etc.).",
            "technologies": ["SQL", "Database Systems", "SQLite"]
        },
        {
            "item_name": "Language Detection",
            "description": "Designed and implemented a comprehensive language detection system using NLTK and scikit-learn. Processed datasets with over 1,000,000 text entries.",
            "technologies": ["Python", "NLTK", "scikit-learn"]  
        },
        {
            "item_name":"QA bot",
            "description": "Developed a question-answering bot using LLMs, capable of answering questions based on a provided context. Implemented a Flask-based web interface for user interaction.",
            "technologies": ["Python", "streamlit", "BERT", "Natural Language Processing"]
        },


    ]
    return fake_items_db[skip : skip + limit]

@app.post("/create-item/")
async def create_item(item: Item):
    """
    Receives an Item object in the request body and returns it.
    Demonstrates data validation and serialization.
    """
    # In a real app, you'd save this item to a database
    return {"message": "Item received!", "item": item}

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    """
    Updates an existing item by ID.
    Combines path parameters with a request body.
    """
    return {"message": f"Item {item_id} updated", "item_name": item.name}
