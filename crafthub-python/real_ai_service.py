#!/usr/bin/env python3
"""
Service de génération SEO avec IA réelle
"""

import random
import logging
from typing import List, Dict, Optional
import os
import json
import time
import requests

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealAISEOGenerator:
    """Générateur de descriptions SEO avec IA réelle"""
    
    def __init__(self):
        self.is_loaded = False
        self.model = None
        self.tokenizer = None
        self.load_model()
    
    def load_model(self):
        """Charge le modèle IA"""
        try:
            logger.info("🔄 Chargement du modèle IA...")
            # Pour l'instant, on utilise la génération variée
            # TODO: Implémenter le vrai modèle IA quand les dépendances seront stables
            self.is_loaded = True
            logger.info("✅ Modèle IA chargé (mode varié)")
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement du modèle: {e}")
            self.is_loaded = False
    
    def generate_seo_description(self, keywords: List[str], contexte: Dict) -> str:
        """Génère une description SEO avec un vrai modèle IA si la clé est présente, sinon fallback varié."""
        try:
            api_key = os.getenv("SEOGeneration") or os.getenv("OPENROUTER_API_KEY")
            use_remote = bool(api_key)
            if use_remote:
                logger.info("🤖 DeepSeek via OpenRouter activé (clé détectée)")
                html = self._generate_with_deepseek_openrouter(
                    keywords=keywords,
                    contexte=contexte,
                    api_key=api_key,
                    model="deepseek/deepseek-r1:free",
                    temperature=float(os.getenv("SEO_TEMPERATURE", "0.6")),
                    top_p=float(os.getenv("SEO_TOP_P", "0.9")),
                    max_tokens=int(os.getenv("SEO_MAX_TOKENS", "400")),
                    request_timeout_sec=int(os.getenv("SEO_TIMEOUT_SEC", "30")),
                )
                if html:
                    return html
                logger.warning("⚠️ Fallback local: génération variée (échec appel DeepSeek)")
        except Exception as e:
            logger.error(f"❌ Erreur DeepSeek/OpenRouter: {e}")
            # Fallback en dessous

        logger.info("🎲 Génération locale variée (fallback)...")
        return self._generate_varied_description(keywords, contexte)

    def _generate_with_deepseek_openrouter(
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
        """Appelle l'API OpenAI-compatible (OpenRouter) pour générer un HTML SEO concis.

        Retourne du HTML ou None en cas d'erreur.
        """
        base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

        nom = (contexte or {}).get("nom", "Produit artisanal")
        categorie = (contexte or {}).get("categorie", "Artisanat")
        prix = (contexte or {}).get("prix", 0)
        mots_cles = ", ".join([k for k in (keywords or []) if k])

        system_prompt = (
            "Tu es un expert SEO e-commerce. Rends un HTML concis, sémantique et clair. "
            "Respecte strictement les contraintes et ne renvoie que le HTML."
        )
        user_prompt = f"""
Contexte:
- Nom: {nom}
- Catégorie: {categorie}
- Prix: {prix}€
- Mots-clés: {mots_cles}

Contraintes:
- 120–200 mots
- HTML sémantique: <h3>, <h4>, <p>, <ul>/<li>
- Intégrer les mots-clés naturellement (zéro bourrage)
- 3–5 bénéfices concrets
- CTA doux
- Retourne uniquement le HTML
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
        }

        url = f"{base_url}/chat/completions"
        start_ts = time.time()
        try:
            resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=request_timeout_sec)
            latency_ms = int((time.time() - start_ts) * 1000)
            logger.info(f"🌐 OpenRouter chat/completions status={resp.status_code} latencyMs={latency_ms}")
            if resp.status_code != 200:
                logger.warning(f"Réponse non 200: {resp.text[:200]}")
                return None

            data = resp.json()
            # Format OpenAI-like
            choice = (data.get("choices") or [{}])[0]
            message = choice.get("message") or {}
            content = (message.get("content") or "").strip()
            if not content:
                return None

            # Par sécurité: on garde seulement un sous-ensemble HTML simple
            return self._sanitize_html_allowlist(content)
        except Exception as e:
            logger.error(f"Exception appel OpenRouter: {e}")
            return None

    def _sanitize_html_allowlist(self, html: str) -> str:
        """Nettoyage simple: conserve quelques balises autorisées, supprime le reste grossièrement.

        NB: Ceci est un nettoyage minimal côté serveur. À compléter si besoin.
        """
        if not html:
            return ""
        allowed_tags = ["h3", "h4", "p", "ul", "li", "strong", "em"]

        # Suppression très basique des balises non autorisées
        # (Pour plus de robustesse, utiliser une lib d'assainissement HTML si nécessaire)
        import re

        def replace_tag(match):
            tag = match.group(1).lower()
            if tag in allowed_tags:
                return match.group(0)
            return ""  # retire la balise non autorisée

        # ouvre/ferme
        html = re.sub(r"</?([a-zA-Z0-9]+)[^>]*>", replace_tag, html)
        return html
    
    def _generate_varied_description(self, keywords: List[str], contexte: Dict) -> str:
        """Génère une description variée avec des templates intelligents"""
        nom = contexte.get('nom', 'Produit artisanal')
        categorie = contexte.get('categorie', 'Artisanat')
        prix = contexte.get('prix', 0)
        
        # Templates variés par catégorie
        category_templates = {
            'Mode, accessoires & bijoux': {
                'intros': [
                    f"Plongez dans l'univers de l'élégance avec ce {nom.lower()}",
                    f"Découvrez cette pièce d'exception qui sublime votre style",
                    f"Ce {nom.lower()} raconte une histoire d'artisanat et de passion",
                    f"Une création unique qui révèle votre personnalité",
                    f"Ce bijou/accessoire transforme votre look en œuvre d'art"
                ],
                'descriptions': [
                    "Chaque détail a été pensé pour vous offrir une expérience sensorielle unique",
                    "L'artisan a consacré des heures à peaufiner chaque courbe et chaque finition",
                    "Cette création respire l'authenticité et le savoir-faire traditionnel",
                    "Un travail minutieux qui révèle la beauté naturelle des matériaux",
                    "Une pièce qui témoigne de l'excellence de l'artisanat français"
                ]
            },
            'Décoration & maison': {
                'intros': [
                    f"Transformez votre intérieur avec ce {nom.lower()}",
                    f"Cette pièce décorative apporte une touche d'authenticité à votre maison",
                    f"Un objet d'art qui sublime votre espace de vie",
                    f"Cette création artisanale réchauffe votre foyer",
                    f"Un élément décoratif unique qui raconte une histoire"
                ],
                'descriptions': [
                    "Chaque pièce est façonnée avec amour et attention aux détails",
                    "L'artisan a choisi des matériaux nobles pour cette création",
                    "Cette décoration apporte une âme à votre intérieur",
                    "Un objet unique qui témoigne du savoir-faire artisanal",
                    "Cette création transforme votre espace en lieu de vie chaleureux"
                ]
            },
            'Art & artisanat': {
                'intros': [
                    f"Une œuvre d'art unique créée par un artisan passionné",
                    f"Ce {nom.lower()} témoigne de la créativité et du talent",
                    f"Une création artistique qui éveille les sens",
                    f"Cet objet d'art raconte une histoire d'inspiration",
                    f"Une pièce unique qui révèle l'âme de l'artisan"
                ],
                'descriptions': [
                    "Chaque coup de pinceau, chaque geste révèle la passion de l'artisan",
                    "Cette création artistique évoque des émotions profondes",
                    "L'artisan a mis tout son cœur dans cette œuvre unique",
                    "Une pièce qui témoigne de l'inspiration et de la créativité",
                    "Cette œuvre d'art transforme l'ordinaire en extraordinaire"
                ]
            }
        }
        
        templates = category_templates.get(categorie, category_templates['Mode, accessoires & bijoux'])
        
        description_parts = []
        description_parts.append(f'<h3>✨ {nom}</h3>')
        description_parts.append(f'<p><strong>Catégorie :</strong> {categorie}</p>')
        description_parts.append(f'<p><strong>Prix :</strong> {prix}€</p>')
        
        intro = random.choice(templates['intros'])
        description_parts.append(f'<h4>🎨 Description Artisanale</h4>')
        description_parts.append(f'<p>{intro}. Chaque pièce est <strong>unique</strong> et reflète l\'attention portée aux détails.</p>')
        
        description = random.choice(templates['descriptions'])
        keyword_integration = self._integrate_keywords_variedly(keywords, description)
        description_parts.append(f'<p>{keyword_integration}</p>')
        
        quality_phrases = [
            "Chaque pièce est unique et reflète l'attention portée aux détails",
            "L'artisanat de qualité supérieure se ressent dans chaque finition",
            "Une création qui allie tradition et modernité",
            "Le savoir-faire artisanal français à son meilleur",
            "Une pièce qui témoigne de l'excellence et de la passion",
            "Chaque détail révèle l'amour du métier de l'artisan",
            "Une création qui honore les traditions artisanales",
            "Le talent de l'artisan se révèle dans chaque courbe"
        ]
        quality_phrase = random.choice(quality_phrases)
        description_parts.append(f'<p>{quality_phrase}</p>')
        
        description_parts.append('<h4>🔍 Mots-clés SEO intégrés :</h4>')
        description_parts.append('<ul>')
        for keyword in keywords:
            description_parts.append(f'<li><strong>{keyword}</strong></li>')
        description_parts.append('</ul>')
        
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
            "Livraison soignée"
        ]
        
        description_parts.append('<h4>🌟 Caractéristiques</h4>')
        description_parts.append('<ul>')
        selected_chars = random.sample(characteristics, 4)
        for char in selected_chars:
            description_parts.append(f'<li>✅ <strong>{char}</strong></li>')
        description_parts.append('</ul>')
        
        ctas = [
            "Parfait pour offrir ou pour vous faire plaisir !",
            "Une pièce unique qui fera la différence dans votre collection !",
            "Découvrez l'artisanat français à son meilleur !",
            "Offrez-vous ou offrez un moment d'exception !",
            "Une création qui vous accompagnera longtemps !",
            "Transformez votre quotidien avec cette pièce unique !"
        ]
        cta = random.choice(ctas)
        description_parts.append(f'<p><em>{cta}</em></p>')
        
        return '\n'.join(description_parts)
    
    def _integrate_keywords_variedly(self, keywords: List[str], text: str) -> str:
        """Intègre les mots-clés de manière naturelle dans le texte"""
        # Intégration naturelle des mots-clés (robuste même si liste vide)
        primary = keywords[0] if len(keywords) >= 1 else "artisanat"
        secondary = keywords[1] if len(keywords) >= 2 else "qualité"
        top_two = ", ".join(keywords[:2]) if keywords else "artisanat, qualité"
        all_joined = ", ".join(keywords) if keywords else "artisanat, qualité"

        keyword_integrations = [
            f"Cette création met en valeur les {top_two} avec élégance",
            f"Les {primary} et {secondary} se marient parfaitement",
            f"Une pièce qui célèbre l'{primary} et l'artisanat",
            f"Les {all_joined} sont au cœur de cette création unique",
            f"Cette œuvre honore les {primary} et le savoir-faire traditionnel"
        ]
        return random.choice(keyword_integrations)
    
    def _convert_to_html(self, text: str) -> str:
        """Convertit le texte en HTML formaté"""
        # Conversion basique en HTML
        html = text.replace('\n\n', '</p><p>')
        html = f'<p>{html}</p>'
        return html

# Instance globale
real_ai_generator = RealAISEOGenerator()
