import sys
sys.tracebacklimit = 1
from fastapi import FastAPI
from routes.user import user
from routes.career import career
from routes.payment import payment
from routes.message import message
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles 

api_escu = FastAPI()

api_escu.mount("/static", StaticFiles(directory="static"), name="static")
api_escu.include_router(user)
api_escu.include_router(career)
api_escu.include_router(payment)
api_escu.include_router(message)

api_escu.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# uvicorn app:api_escu --reload