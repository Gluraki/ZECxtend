FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_SYSTEM_PYTHON=1

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml .
COPY shared/ ./shared/
COPY services/user-service/ ./services/user-service/

RUN uv sync --package user-service --no-dev

EXPOSE 8001

ENTRYPOINT ["uv", "run"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
