FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_SYSTEM_PYTHON=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml .
COPY shared/ ./shared/
COPY services/auth-service/ ./services/auth-service/

RUN uv sync --package auth-service --no-dev \
    && uv cache clean

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_SYSTEM_PYTHON=1

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12

EXPOSE 8001
ENTRYPOINT ["uv", "run"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
