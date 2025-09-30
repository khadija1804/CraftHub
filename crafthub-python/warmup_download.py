from huggingface_hub import snapshot_download
for repo in [
    "Helsinki-NLP/opus-mt-fr-en",
    # ajoute ces lignes plus tard si tu veux d’autres paires :
    # "Helsinki-NLP/opus-mt-en-fr",
    # "Helsinki-NLP/opus-mt-fr-ar",
]:
    print("↓ Téléchargement:", repo)
    snapshot_download(repo_id=repo)
    print("✓ OK:", repo)
print("✅ Téléchargements terminés.")