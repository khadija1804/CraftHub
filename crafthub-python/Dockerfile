# Dockerfile (pour python-ai-main)
FROM python:3.11-slim
WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir flask flask-cors

COPY . .


# Exposer le port sur lequel l'application Flask écoute
EXPOSE 5011

# Commande pour démarrer l'application
CMD ["python", "app.py"]

