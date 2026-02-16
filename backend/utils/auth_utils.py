from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

import logging
# This suppresses the legacy bug check that causes the crash
logging.getLogger("passlib").setLevel(logging.ERROR)

# Configuration for JWT
SECRET_KEY = "hello" # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 1. Force passlib to use the 'bcrypt' backend and ignore the wrap bug check
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__handle_long_passwords=True # This tells passlib not to worry about the 72-char limit check
)

def hash_password(password: str):
    # Truncate manually to 72 to satisfy the underlying C library
    return pwd_context.hash(password[:72])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password[:72], hashed_password)

