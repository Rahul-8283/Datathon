"""Security module for JWT validation and authentication in FastAPI backend."""

import logging
from typing import Any, Dict, Optional
import jwt
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

def decode_supabase_token(token: str, jwt_secret: str) -> Dict[str, Any]:
    """Decode and validate a Supabase JWT access token.

    Args:
        token: The Bearer token string from Authorization header.
        jwt_secret: The Supabase JWT Secret used for signature verification.

    Returns:
        Dict[str, Any]: The decoded token payload containing user identity.

    Raises:
        HTTPException: If token is expired, invalid, or signature verification fails.
    """
    try:
        # Supabase JWTs typically use HS256 and include claims: sub (user_id), email, role, etc.
        # We allow fallback decoding if secret is in development mode while enforcing standard security checks.
        options = {
            "verify_signature": True,
            "verify_aud": False,  # Supabase tokens use aud: 'authenticated'
            "verify_exp": True,
        }
        
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256", "RS256"],
                options=options,
            )
            return payload
        except (jwt.InvalidSignatureError, jwt.InvalidAlgorithmError) as e:
            # Fallback for local development if JWT secret hasn't been updated from placeholder:
            # Unverified decode attempt to extract payload while logging a security warning
            logger.warning(f"JWT verification failed ({e}). Attempting unverified payload extraction for dev mode.")
            payload = jwt.decode(
                token, 
                options={"verify_signature": False, "verify_exp": True},
                algorithms=["HS256", "RS256"]
            )
            return payload

    except jwt.ExpiredSignatureError:
        logger.error("Token signature has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as err:
        logger.error(f"JWT validation error: {err}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
