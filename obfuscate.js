const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const CLE_SECRETE = "NetiquiGoBuznesGoma2026SecurityKeyStrict";

// ==========================================================================
// PARTIE 1 : FONCTION DE DÉCHIFFREMENT COMPATIBLE NODE.JS
// ==========================================================================
function dechiffrerDonnees(contenuChiffre) {
    try {
        const chaineXOR = Buffer.from(contenuChiffre.trim(), 'base64').toString('binary');
        let brute = '';
        for (let i = 0; i < chaineXOR.length; i++) {
            brute += String.fromCharCode(chaineXOR.charCodeAt(i) ^ CLE_SECRETE.charCodeAt(i % CLE_SECRETE.length));
        }
        return JSON.parse(decodeURIComponent(unescape(brute)));
    } catch (e) {
        return null;
    }
}

// Outil pour générer un fichier HTML minimaliste avec les métadonnées pour les robots
function genererFichierMeta(dossierCible, titre, description, image) {
    fs.mkdirSync(dossierCible, { recursive: true });
    
    const htmlMeta = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${titre}</title>
    <meta property="og:title" content="${titre}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="website" />
    <script>window.location.href = "../../../index.html";</script>
</head>
<body>
    <p>Redirection vers Go Buznes...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(dossierCible, 'index.html'), htmlMeta, 'utf8');
}

// ==========================================================================
// PARTIE 2 : GÉNÉRATION AUTOMATIQUE DES DOSSIERS DE PARTAGE
// ==========================================================================
console.log("🚀 Étape 1 : Génération des métadonnées pour les partages...");

// --- Génération pour les Boutiques et Articles ---
const cheminIndexVendeurs = path.join(__dirname, 'data/vendeurs/index_vendeurs.json');
if (fs.existsSync(cheminIndexVendeurs)) {
    try {
        const listeVendeurs = JSON.parse(fs.readFileSync(cheminIndexVendeurs, 'utf8'));
        listeVendeurs.forEach(cheminGbz => {
            const pleinChemin = path.join(__dirname, cheminGbz);
            if (fs.existsSync(pleinChemin)) {
                const crypte = fs.readFileSync(pleinChemin, 'utf8');
                const boutique = dechiffrerDonnees(crypte);
                
                if (boutique && boutique.id_boutique) {
                    // 1. Créer le dossier méta pour la Boutique
                    const dossierBoutique = path.join(__dirname, 'Boutique', boutique.id_boutique);
                    
                    // 🌟 MULTI-SCAN LOGO : Supporte 'logo' ou 'logo_entreprise'
                    let nomLogo = boutique.logo || boutique.logo_entreprise || "";
                    let urlLogoComplete = "";
                    
                    if (nomLogo) {
                        if (nomLogo.startsWith('http')) {
                            urlLogoComplete = nomLogo;
                        } else {
                            urlLogoComplete = `https://gogamenetiqui.github.io/Go-Buznes/data/images/${nomLogo}`;
                        }
                    } else {
                        // Fallback ultime si aucun logo n'est déclaré : construction dynamique du nom standard
                        urlLogoComplete = `https://gogamenetiqui.github.io/Go-Buznes/data/images/logo_${boutique.id_boutique.toLowerCase()}.jpg`;
                    }

                    genererFichierMeta(
                        dossierBoutique, 
                        `🏪 Boutique ${boutique.nom}`, 
                        `Découvrez la vitrine officielle de ${boutique.nom} sur Go Buznes Goma.`, 
                        urlLogoComplete
                    );

                    // 2. Créer les dossiers méta pour chaque Article de la boutique
                    if (boutique.articles && Array.isArray(boutique.articles)) {
                        boutique.articles.forEach((article, index) => {
                            
                            let idArticleValide = article.id_article;
                            if (!idArticleValide) {
                                const fallbackId = article.designation.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                                idArticleValide = `${fallbackId}_fallback_${index}`;
                            }

                            const dossierArticle = path.join(__dirname, 'Article', boutique.id_boutique, idArticleValide);
                            
                            let urlImageComplete = article.image;
                            if (urlImageComplete && !urlImageComplete.startsWith('http')) {
                                urlImageComplete = `https://gogamenetiqui.github.io/Go-Buznes/data/images/${article.image}`;
                            } else if (!urlImageComplete) {
                                urlImageComplete = urlLogoComplete;
                            }

                            genererFichierMeta(
                                dossierArticle, 
                                `🔥 ${article.designation} - ${article.prix} USD`, 
                                `Découvrez cet article sur la vitrine de ${boutique.nom} via Go Buznes Goma.`, 
                                urlImageComplete
                            );
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.log("⚠️ Erreur lors de la génération méta vendeurs :", e.message);
    }
}

// --- Génération pour les Annonces ---
const cheminIndexAnnonces = path.join(__dirname, 'data/adpost/index_annonces.json');
if (fs.existsSync(cheminIndexAnnonces)) {
    try {
        const listeAnnonces = JSON.parse(fs.readFileSync(cheminIndexAnnonces, 'utf8'));
        listeAnnonces.forEach(cheminGbz => {
            const pleinChemin = path.join(__dirname, cheminGbz);
            if (fs.existsSync(pleinChemin)) {
                const crypte = fs.readFileSync(pleinChemin, 'utf8');
                const annonce = dechiffrerDonnees(crypte);
                
                if (annonce && annonce.id_annonce) {
                    const dossierAnnonce = path.join(__dirname, 'Annonce', annonce.id_annonce);
                    
                    // 🌟 MULTI-SCAN ANNONCES : Cherche 'image', 'affiche' ou 'image_url'
                    let nomImageAnnonce = annonce.image || annonce.affiche || annonce.image_url || "";
                    let urlAnnonceImage = "";

                    if (nomImageAnnonce) {
                        if (nomImageAnnonce.startsWith('http')) {
                            urlAnnonceImage = nomImageAnnonce;
                        } else {
                            urlAnnonceImage = `https://gogamenetiqui.github.io/Go-Buznes/data/images/${nomImageAnnonce}`;
                        }
                    } else {
                        // Fallback si aucune image d'annonce : utilise un visuel par défaut
                        urlAnnonceImage = `https://gogamenetiqui.github.io/Go-Buznes/assets/default-preview.jpg`;
                    }

                    genererFichierMeta(
                        dossierAnnonce, 
                        `📢 Annonce - ${annonce.titre || "Go Buznes"}`, 
                        annonce.description || "Consultez cette annonce importante sur Go Buznes Goma.", 
                        urlAnnonceImage
                    );
                }
            }
        });
    } catch (e) {
        console.log("⚠️ Erreur lors de la génération méta annonces :", e.message);
    }
}

// ==========================================================================
// PARTIE 3 : OBFUSCATION ET SÉCURISATION DES FICHIERS JS LISIBLES
// ==========================================================================
console.log("🔒 Étape 2 : Sécurisation et obfuscation des scripts...");

const fichiers = fs.readdirSync(__dirname);
const fichiersJS = fichiers.filter(fichier => 
    fichier.endsWith('.js') && 
    fichier !== 'obfuscate.js'
);

fichiersJS.forEach(fichier => {
    const cheminFichier = path.join(__dirname, fichier);
    const codeOrigine = fs.readFileSync(cheminFichier, 'utf8');
    
    console.log(`  -> Chiffrement de sécurité : ${fichier}`);
    
    const resultatObfuscation = JavaScriptObfuscator.obfuscate(codeOrigine, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true,
        simplify: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        selfDefending: true,
        debugProtection: true,
        debugProtectionInterval: 4000
    });
    
    fs.writeFileSync(cheminFichier, resultatObfuscation.getObfuscatedCode(), 'utf8');
});

console.log("✅ Système automatisé exécuté avec succès ! Tout est prêt.");
