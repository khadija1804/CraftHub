#!/usr/bin/env python3
"""
Service de génération SEO avec IA réelle (OpenRouter + rotation de modèles gratuits) + fallback local
"""

import os
import re
import json
import time
import random
import logging
from typing import List, Dict, Optional

import requests
from dotenv import load_dotenv
load_dotenv()  # charge .env depuis /app au démarrage

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealAISEOGenerator:
    """Générateur de descriptions SEO avec IA distante (OpenRouter) + fallback local"""

    def __init__(self):
        self.is_loaded = False
        self.model = None
        self.tokenizer = None
        self.load_model()

    # ---------------------------------------------------------------------
    # Init
    # ---------------------------------------------------------------------
    def load_model(self):
        """Prépare le backend IA (API distante)"""
        try:
            logger.info("🔄 Chargement du modèle IA...")
            # Rien à charger localement : on appelle l'API OpenRouter à la demande
            self.is_loaded = True
            logger.info("✅ Modèle IA prêt (API OpenRouter + fallback)")
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement du modèle: {e}")
            self.is_loaded = False

    # ---------------------------------------------------------------------
    # Configuration modèles (rotation)
    # ---------------------------------------------------------------------
    def _candidate_models(self) -> list:
        """
        Liste ordonnée des modèles à essayer.
        Peut être définie via SEO_MODELS dans .env (CSV).
        """
        env = os.getenv("SEO_MODELS")
        if env:
            return [m.strip() for m in env.split(",") if m.strip()]

        # Défaut : plusieurs gratuits efficaces listés sur OpenRouter
        return [
            "deepseek/deepseek-r1:free",
            "zhipu/glm-4.5-air:free",
            "shisa-ai/shisa-v2-llama3.3-70b:free",
            "nvidia/nemotron-nano-9b-v2:free",
            "mistralai/mistral-small-3.2:free",
        ]

    # ---------------------------------------------------------------------
    # Public
    # ---------------------------------------------------------------------
    def generate_seo_description(self, keywords: List[str], contexte: Dict) -> str:
        """
        Génère une description SEO via OpenRouter si la clé est présente.
        - Rotation automatique sur plusieurs modèles gratuits en cas de 429 / indisponibilité.
        - Deux tentatives rapides / modèle.
        - Fallback local si tout échoue.
        """
        api_key = os.getenv("SEOGeneration") or os.getenv("OPENROUTER_API_KEY")
        if api_key:
            logger.info("🤖 OpenRouter activé (clé détectée)")
            models = self._candidate_models()

            temperature = float(os.getenv("SEO_TEMPERATURE", "0.6"))
            top_p = float(os.getenv("SEO_TOP_P", "0.9"))
            max_tokens = int(os.getenv("SEO_MAX_TOKENS", "500"))
            timeout_sec = int(os.getenv("SEO_TIMEOUT_SEC", "40"))

            for model in models:
                for attempt, delay in enumerate([0.0, 1.0], start=1):  # 2 essais / modèle
                    if delay:
                        time.sleep(delay)
                    logger.info(f"🧪 Essai {attempt}/2 sur modèle: {model}")
                    html = self._generate_with_openrouter(
                        keywords=keywords,
                        contexte=contexte,
                        api_key=api_key,
                        model=model,
                        temperature=temperature,
                        top_p=top_p,
                        max_tokens=max_tokens,
                        request_timeout_sec=timeout_sec,
                    )
                    if html:
                        logger.info(f"✅ Réponse obtenue via {model}")
                        return html
                    logger.warning(f"⏭️ Échec avec {model}, on essaie le suivant...")

            logger.warning("⚠️ Tous les modèles gratuits ont échoué → fallback local.")
        else:
            logger.info("🔐 Aucune clé OpenRouter détectée → fallback local.")

        # Fallback local
        return self._generate_varied_description(keywords, contexte)

    # ---------------------------------------------------------------------
    # Remote (OpenRouter)
    # ---------------------------------------------------------------------
    def _generate_with_openrouter(
        self,
        *,
        keywords: List[str],
        contexte: Dict,
        api_key: str,
        model: str,
        temperature: float,
        top_p: float,
        max_tokens: int,
        request_timeout_sec: int,
    ) -> Optional[str]:
        """
        Appelle l'API OpenAI-compatible (OpenRouter) pour générer un HTML SEO détaillé.
        Retourne du HTML ou None en cas d'erreur/non-200.
        """
        base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

        nom = (contexte or {}).get("nom", "Produit artisanal")
        categorie = (contexte or {}).get("categorie", "Artisanat")
        prix = (contexte or {}).get("prix", 0)
        mots_cles = ", ".join([k for k in (keywords or []) if k])

        # 🎯 Prompts enrichis pour un rendu moins minimaliste
        system_prompt = (
            "Tu es un expert SEO e-commerce et rédacteur d’artisanat haut de gamme. "
            "Rédige des descriptions naturelles, immersives et inspirantes. "
            "Le texte doit être vivant, concret, évoquer les matériaux, les sensations et l’usage réel. "
            "Intègre les mots-clés subtilement (sans bourrage). "
            "Structure strictement en HTML sémantique (<h3>, <h4>, <p>, <ul>, <li>) et ne renvoie QUE le HTML."
        )
        user_prompt = f"""
Contexte:
- Nom: {nom}
- Catégorie: {categorie}
- Prix: {prix}€
- Mots-clés: {mots_cles}

Contraintes:
- 180–250 mots (pas moins)
- Style fluide, narratif et émotionnel
- Ton chaleureux, artisanal et authentique
- Déduis le type d’objet depuis le nom/mots-clés (ex. bougie/sac/chapeau…)
- Détaille matière/fabrication, usage concret, bénéfices ressentis
- HTML sémantique: <h3> (titre), <h4> “Pourquoi l’adopter ?”, <p> (paragraphes), <ul>/<li> (3–5 atouts)
- Intégrer les mots-clés naturellement (zéro répétition gratuite)
- Terminer par un CTA doux en <p><em>…</em></p>
- Retourne UNIQUEMENT le HTML (aucun texte hors balises)
""".strip()

        payload = {
            "model": model,
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Recommandé par OpenRouter (facultatif)
            "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost"),
            "X-Title": os.getenv("OPENROUTER_APP_NAME", "crafthub-ai"),
        }

        url = f"{base_url}/chat/completions"
        start_ts = time.time()
        try:
            resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=request_timeout_sec)
            latency_ms = int((time.time() - start_ts) * 1000)
            logger.info(f"🌐 OpenRouter chat/completions status={resp.status_code} latencyMs={latency_ms}")

            if resp.status_code == 200:
                data = resp.json()
                choice = (data.get("choices") or [{}])[0]
                message = choice.get("message") or {}
                content = (message.get("content") or "").strip()
                if not content:
                    return None

                # Supprime d'éventuels ```html ... ``` autour du HTML
                content = re.sub(r"^```(?:html)?\s*|\s*```$", "", content, flags=re.IGNORECASE).strip()
                return self._sanitize_html_allowlist(content)

            # Log utile si non 200 (429 rate limit fréquent sur les modèles :free)
            txt = ""
            try:
                txt = resp.text[:300]
            except Exception:
                pass
            logger.warning(f"Réponse non 200 ({resp.status_code}): {txt}")
            return None

        except Exception as e:
            logger.error(f"Exception appel OpenRouter: {e}")
            return None

    # ---------------------------------------------------------------------
    # Sanitize HTML minimal
    # ---------------------------------------------------------------------
    def _sanitize_html_allowlist(self, html: str) -> str:
        """
        Nettoyage simple: conserve quelques balises autorisées, supprime le reste.
        Remplacer par une lib dédiée si besoin (bleach, etc.).
        """
        if not html:
            return ""
        allowed = {"h3", "h4", "p", "ul", "li", "strong", "em"}

        def repl(m):
            tag = m.group(1).lower()
            return m.group(0) if tag in allowed else ""

        # retire toute balise non listée
        html = re.sub(r"</?([a-zA-Z0-9]+)[^>]*>", repl, html)
        return html

    # ---------------------------------------------------------------------
    # Fallback local (templates)
    # ---------------------------------------------------------------------
    def _generate_varied_description(self, keywords: List[str], contexte: Dict) -> str:
        """Génération variée via templates (secours si IA distante indispo)"""
        nom = contexte.get('nom', 'Produit artisanal')
        categorie = contexte.get('categorie', 'Artisanat')
        prix = contexte.get('prix', 0)

        category_templates = {
            'Mode, accessoires & bijoux': {
                'intros': [
                    f"Plongez dans l'univers de l'élégance avec ce {nom.lower()}",
                    f"Découvrez cette pièce d'exception qui sublime votre style",
                    f"Ce {nom.lower()} raconte une histoire d'artisanat et de passion",
                    f"Une création unique qui révèle votre personnalité",
                    f"Ce bijou/accessoire transforme votre look en œuvre d'art",
                ],
                'descriptions': [
                    "Chaque détail a été pensé pour vous offrir une expérience sensorielle unique",
                    "L'artisan a consacré des heures à peaufiner chaque courbe et chaque finition",
                    "Cette création respire l'authenticité et le savoir-faire traditionnel",
                    "Un travail minutieux qui révèle la beauté naturelle des matériaux",
                    "Une pièce qui témoigne de l'excellence de l'artisanat français",
                ],
            },
            'Décoration & maison': {
                'intros': [
                    f"Transformez votre intérieur avec ce {nom.lower()}",
                    f"Cette pièce décorative apporte une touche d'authenticité à votre maison",
                    f"Un objet d'art qui sublime votre espace de vie",
                    f"Cette création artisanale réchauffe votre foyer",
                    f"Un élément décoratif unique qui raconte une histoire",
                ],
                'descriptions': [
                    "Chaque pièce est façonnée avec amour et attention aux détails",
                    "L'artisan a choisi des matériaux nobles pour cette création",
                    "Cette décoration apporte une âme à votre intérieur",
                    "Un objet unique qui témoigne du savoir-faire artisanal",
                    "Cette création transforme votre espace en lieu de vie chaleureux",
                ],
            },
            'Art & artisanat': {
                'intros': [
                    f"Une œuvre d'art unique créée par un artisan passionné",
                    f"Ce {nom.lower()} témoigne de la créativité et du talent",
                    f"Une création artistique qui éveille les sens",
                    f"Cet objet d'art raconte une histoire d'inspiration",
                    f"Une pièce unique qui révèle l'âme de l'artisan",
                ],
                'descriptions': [
                    "Chaque coup de pinceau, chaque geste révèle la passion de l'artisan",
                    "Cette création artistique évoque des émotions profondes",
                    "L'artisan a mis tout son cœur dans cette œuvre unique",
                    "Une pièce qui témoigne de l'inspiration et de la créativité",
                    "Cette œuvre d'art transforme l'ordinaire en extraordinaire",
                ],
            },
        }

        templates = category_templates.get(categorie, category_templates['Art & artisanat'])

        parts = []
        parts.append(f'<h3>✨ {nom}</h3>')
        parts.append(f'<p><strong>Catégorie :</strong> {categorie}</p>')
        parts.append(f'<p><strong>Prix :</strong> {prix}€</p>')

        intro = random.choice(templates['intros'])
        parts.append('<h4>🎨 Description Artisanale</h4>')
        parts.append(f'<p>{intro}. Chaque pièce est <strong>unique</strong> et reflète l\'attention portée aux détails.</p>')

        desc = random.choice(templates['descriptions'])
        kw_text = self._integrate_keywords_variedly(keywords, desc)
        parts.append(f'<p>{kw_text}</p>')

        quality_phrases = [
            "Chaque pièce est unique et reflète l'attention portée aux détails",
            "L'artisanat de qualité supérieure se ressent dans chaque finition",
            "Une création qui allie tradition et modernité",
            "Le savoir-faire artisanal français à son meilleur",
            "Une pièce qui témoigne de l'excellence et de la passion",
            "Chaque détail révèle l'amour du métier de l'artisan",
            "Une création qui honore les traditions artisanales",
            "Le talent de l'artisan se révèle dans chaque courbe",
        ]
        parts.append(f'<p>{random.choice(quality_phrases)}</p>')

        parts.append('<h4>🔍 Mots-clés SEO intégrés :</h4>')
        parts.append('<ul>')
        for k in (keywords or []):
            parts.append(f'<li><strong>{k}</strong></li>')
        parts.append('</ul>')

        characteristics = [
            "Fait main avec passion",
            "Matériaux de qualité supérieure",
            "Finitions soignées et durables",
            "Design unique et original",
            "Respect de l'environnement",
            "Techniques artisanales traditionnelles",
            "Création personnalisable",
            "Garantie de satisfaction",
            "Emballage écologique",
            "Livraison soignée",
        ]
        parts.append('<h4>🌟 Caractéristiques</h4>')
        parts.append('<ul>')
        for c in random.sample(characteristics, 4):
            parts.append(f'<li>✅ <strong>{c}</strong></li>')
        parts.append('</ul>')

        cta = random.choice([
            "Parfait pour offrir ou pour vous faire plaisir !",
            "Une création qui vous accompagnera longtemps !",
            "Transformez votre quotidien avec cette pièce unique !",
        ])
        parts.append(f'<p><em>{cta}</em></p>')

        return "\n".join(parts)

    # ---------------------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------------------
    def _integrate_keywords_variedly(self, keywords: List[str], text: str) -> str:
        """Intègre les mots-clés naturellement dans une phrase de transition."""
        primary = keywords[0] if len(keywords) >= 1 else "artisanat"
        secondary = keywords[1] if len(keywords) >= 2 else "qualité"
        top_two = ", ".join(keywords[:2]) if keywords else "artisanat, qualité"
        all_joined = ", ".join(keywords) if keywords else "artisanat, qualité"

        variants = [
            f"{text} Cette création met en valeur {top_two}.",
            f"{text} Les {primary} et {secondary} se marient harmonieusement.",
            f"{text} Les mots-clés clés : {all_joined}.",
            f"{text} Elle célèbre l’{primary} et le savoir-faire authentique.",
        ]
        return random.choice(variants)

    def _convert_to_html(self, raw: str) -> str:
        """
        Utilitaire (optionnel) pour convertir un texte brut en HTML simple.
        Non utilisé quand l'API renvoie déjà du HTML.
        """
        raw = raw.strip()
        raw = re.sub(r"\n{3,}", "\n\n", raw)
        parts = [f"<p>{blk.strip()}</p>" for blk in raw.split("\n\n") if blk.strip()]
        return "\n".join(parts)


# Instance globale utilisée par app.py
real_ai_generator = RealAISEOGenerator()
