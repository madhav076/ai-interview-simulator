# AI Interview Simulator Backend Foundation

This module contains a simple FastAPI backend foundation for the AI Interview Simulator.

## What is included

- FastAPI app setup
- CORS enabled for local development
- Root endpoint at `/`
- Health endpoint at `/health`
- Sample interview endpoint at `/interview`
- Sample interview start endpoint at `/interview/start`
- Beginner-friendly route organization using `APIRouter`

No database, authentication, AI, JWT, SQLAlchemy, or Docker has been added yet.

## Folder structure

```text
03_Backend_Foundation/
├── app/
│   ├── main.py
│   ├── routes/
│   │   ├── health.py
│   │   └── interview.py
│   ├── config.py
│   └── __init__.py
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

## Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

## Endpoints

### Root

```text
GET /
```

Response:

```json
{
  "message": "AI Interview Simulator Backend Running"
}
```

### Health

```text
GET /health
```

Response:

```json
{
  "status": "OK"
}
```

### Interview

```text
GET /interview
```

Response:

```json
{
  "title": "AI Interview",
  "status": "Ready"
}
```

### Start Interview

```text
POST /interview/start
```

Request:

```json
{
  "role": "Frontend Developer"
}
```

Response:

```json
{
  "message": "Interview Started",
  "role": "Frontend Developer"
}
```
