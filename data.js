import { VaultStream } from './vault-stream.js';
import { PostStream } from './post-stream.js'; 
import { recupererImageOuSquelette } from './shadow-cache.js';

const CLE_SECRETE = "NetiquiGoBuznesGoma2026SecurityKeyStrict";

// Tables de correspondance internes pour shadow-cache
const cartographieBoutiquesGbz = new Map();
const cartographieAnnoncesGbz = new Map();

function dechiffrer(contenuChiffre) {
    try {
        const chaineXOR = atob(contenuChiffre.trim());
        let brute = '';
        for (let i = 0; i < chaineXOR.length; i++) {
            brute += String.fromCharCode(chaineXOR.charCodeAt(i) ^ CLE_SECRETE.charCodeAt(i % CLE_SECRETE.length));
        }
        return JSON.parse(decodeURIComponent(escape(brute)));
    } catch (e) {
        return null;
    }
}

/* ==========================================================================
   SECTION 1 : BOUTIQUES & ARTICLES (Sécurisée contre l'expiration des badges)
   ========================================================================== */

export async function obtenirVendeurs() {
    try {
        const indexTexte = await VaultStream.extraireFichier('data/vendeurs/index_vendeurs.json');
        if (!indexTexte) return JSON.parse(localStorage.getItem('gb_cache') || '[]');

        const listeChemins = JSON.parse(indexTexte);
        let boutiquesValides = [];
        const aujourdhui = new Date();
        
        cartographieBoutiquesGbz.clear();

        for (const chemin of listeChemins) {
            const texteCrypté = await VaultStream.extraireFichier(chemin);
            if (!texteCrypté) continue;

            let boutique = dechiffrer(texteCrypté);
            if (!boutique) continue;

            // --- STRATÉGIE DE GESTION STRICTE DES BADGES EXPIRÉS ---
            if (boutique.badge && boutique.badge.expire_le && aujourdhui > new Date(boutique.badge.expire_le)) {
                // Le badge a expiré : on nettoie toutes les propriétés pour forcer le statut Standard
                boutique.badgeType = ""; 
                if (boutique.badge) {
                    boutique.badge.type = ""; // Écrase le badge d'origine pour toute l'application
                }
            } else {
                // Le badge est toujours valide ou n'existe pas
                boutique.badgeType = boutique.badge?.type || "";
            }

            // --- 🌟 RÉTROCOMPATIBILITÉ ET SÉCURISATION DES ID ARTICLES ---
            if (boutique.articles && Array.isArray(boutique.articles)) {
                boutique.articles.forEach((article, index) => {
                    // Si l'article n'a pas d'ID (ancien format), on lui en génère un à la volée de manière stable
                    if (!article.id_article) {
                        const idNettoye = article.designation.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                        article.id_article = `${idNettoye}_fallback_${index}`;
                    }
                });
            }

            if (boutique.id_boutique) {
                cartographieBoutiquesGbz.set(boutique.id_boutique, chemin);
            }

            boutiquesValides.push(boutique);
        }

        localStorage.setItem('gb_cache', JSON.stringify(boutiquesValides));
        return boutiquesValides;
    } catch (e) {
        return JSON.parse(localStorage.getItem('gb_cache') || '[]');
    }
}

export function chargerImageBoutiqueOuArticle(boutiqueId, imageNom, elementId) {
    const cheminGbz = cartographieBoutiquesGbz.get(boutiqueId);
    if (cheminGbz && imageNom && elementId) {
        recupererImageOuSquelette(imageNom, cheminGbz, elementId);
    }
}

/* ==========================================================================
   SECTION 2 : POSTS, PUBS & ANNONCES
   ========================================================================== */

/**
 * Charge, déchiffre et filtre toutes les annonces actives à la date du jour
 */
export async function obtenirAnnonces() {
    try {
        const indexTexte = await PostStream.extraireFichierAnnonce('data/adpost/index_annonces.json');
        if (!indexTexte) return JSON.parse(localStorage.getItem('gb_annonces_cache') || '[]');

        const listeCheminsAnnonces = JSON.parse(indexTexte);
        let annoncesValides = [];
        const aujourdhui = new Date();

        cartographieAnnoncesGbz.clear();

        for (const chemin of listeCheminsAnnonces) {
            const texteCrypte = await PostStream.extraireFichierAnnonce(chemin);
            if (!texteCrypte) continue;

            let annonce = dechiffrer(texteCrypte);
            if (!annonce) continue;

            const dateDebut = new Date(annonce.date_debut);
            const dateFin = new Date(annonce.date_fin);

            if (aujourdhui >= dateDebut && aujourdhui <= dateFin) {
                if (annonce.id_annonce) {
                    cartographieAnnoncesGbz.set(annonce.id_annonce, chemin);
                }
                annoncesValides.push(annonce);
            }
        }

        localStorage.setItem('gb_annonces_cache', JSON.stringify(annoncesValides));
        return annoncesValides;
    } catch (e) {
        console.error("[data.js] Erreur lors du chargement des annonces :", e);
        return JSON.parse(localStorage.getItem('gb_annonces_cache') || '[]');
    }
}

export function chargerImageAnnonce(annonceId, imageNom, elementId) {
    const cheminGbz = cartographieAnnoncesGbz.get(annonceId);
    if (cheminGbz && imageNom && elementId) {
        recupererImageOuSquelette(imageNom, cheminGbz, elementId);
    }
}