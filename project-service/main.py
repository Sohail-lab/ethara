from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database import engine, Base
from routes import projects, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Project Service", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(tasks.router)


@app.get("/health")
def health():
    return {"status": "ok"}
