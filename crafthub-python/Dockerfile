FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir flask flask-cors requests python-dotenv

COPY . .
EXPOSE 5011
CMD ["python", "app.py"]
