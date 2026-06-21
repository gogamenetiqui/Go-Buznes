import { obtenirVendeurs, chargerImageBoutiqueOuArticle, obtenirAnnonces, chargerImageAnnonce } from './data.js';

// Variables d'état globales de l'application cliente
let tousLesProduits = [];
let toutesLesBoutiques = [];
let toutesLesAnnonces = []; // Stockage global des annonces valides
const NUMERO_NETIQUI = "243998159146";

/**
 * Recense et met à jour dynamiquement les statistiques de l'en-tête (Header)
 */
function mettreAJourStatsHeader() {
    const totalVendeurs = toutesLesBoutiques.length;
    const totalGold = toutesLesBoutiques.filter(b => b.badgeType === 'or').length;
    const totalBlue = toutesLesBoutiques.filter(b => b.badgeType === 'bleu').length;
    const totalNone = toutesLesBoutiques.filter(b => !b.badgeType).length;

    if (document.getElementById('count-total')) document.getElementById('count-total').innerText = totalVendeurs;
    if (document.getElementById('count-gold'))  document.getElementById('count-gold').innerText = totalGold;
    if (document.getElementById('count-blue'))  document.getElementById('count-blue').innerText = totalBlue;
    if (document.getElementById('count-none'))  document.getElementById('count-none').innerText = totalNone;
}

/**
 * Fonction utilitaire de course (Timeout) pour surveiller la réactivité de data.js
 */
function deconnecterApresTimeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms));
}

/**
 * Initialisation au démarrage de la page index.html (Version avec Interception d'URL Propres)
 */
async function initialiserApp() {
    const mainRender = document.getElementById('main-render');
    if (mainRender) {
        mainRender.innerHTML = `
            <div id="sync-loader" style="text-align:center; padding:40px; color:#5f6368; font-size:14px;">
                <i class="fa-solid fa-spinner fa-spin" style="color:#0046ad; margin-right:8px;"></i>Synchronisation locale sécurisée...
            </div>`;
    }

    try {
        // Enveloppe de sécurité : si data.js met plus de 6 secondes à répondre, on lève une alerte
        const chargeDonnees = Promise.all([obtenirVendeurs(), obtenirAnnonces()]);
        const [vendeursRecupere, annoncesRecuperees] = await Promise.race([chargeDonnees, deconnecterApresTimeout(6000)]);
        
        toutesLesBoutiques = vendeursRecupere;
        toutesLesAnnonces = annoncesRecuperees;
        tousLesProduits = [];

        // Remplissage du stock global des produits avec héritage dynamique du badge mis à jour
        toutesLesBoutiques.forEach(boutique => {
            if (boutique.articles && Array.isArray(boutique.articles)) {
                boutique.articles.forEach(article => {
                    tousLesProduits.push({
                        ...article,
                        imageNom: article.image || "", 
                        boutiqueNom: boutique.nom,
                        boutiqueId: boutique.id_boutique,
                        boutiqueTel: boutique.telephone,
                        badgeType: boutique.badge?.type !== undefined ? boutique.badge.type : (boutique.badgeType || "")
                    });
                });
            }
        });

        mettreAJourStatsHeader();
        if (document.getElementById('total-articles-display')) {
            document.getElementById('total-articles-display').innerText = `${tousLesProduits.length} articles disponibles à Goma`;
        }

        // --- 🚀 INTERCEPTION INTELLIGENTE DU CHEMIN D'URL ---
        const cheminActuel = window.location.pathname; // Récupère par ex: "/Go-Buznes/Article/12/45"
        
        // Découpage du chemin en segments propres
        const segments = cheminActuel.split('/').filter(s => s.length > 0);
        
        // On cherche les mots-clés dans les segments pour savoir quoi ouvrir
        const indexBoutique = segments.indexOf('Boutique');
        const indexArticle = segments.indexOf('Article');
        const indexAnnonce = segments.indexOf('Annonce');

        if (indexAnnonce !== -1 && segments[indexAnnonce + 1]) {
            // ----------------------------------------------------
            // CAS 1 : INTERCEPTION D'UNE ANNONCE (/Annonce/id_annonce)
            // ----------------------------------------------------
            const idAnnoncePartagee = segments[indexAnnonce + 1];
            window.articlesBonnesAffairesActuels = toutesLesAnnonces;
            naviguerVersPage('biens');

            const indexAnnonceTab = toutesLesAnnonces.findIndex(a => a.id_annonce === idAnnoncePartagee);
            if (indexAnnonceTab !== -1) {
                setTimeout(() => {
                    const domIdCible = `img-annonce-shared-${idAnnoncePartagee}`;
                    if (typeof window.ouvrirApercuProduit === 'function') {
                        window.ouvrirApercuProduit(indexAnnonceTab, domIdCible, { preventDefault: () => {} });
                    }
                }, 150);
            }
            nettoyerUrlBarre();

        } else if (indexArticle !== -1 && segments[indexArticle + 2]) {
            // ----------------------------------------------------
            // CAS 2 : INTERCEPTION D'UN ARTICLE (/Article/id_boutique/id_article)
            // ----------------------------------------------------
            const idBoutiqueAssociee = segments[indexArticle + 1];
            const idArticlePartage = segments[indexArticle + 2];
            
            // On configure la pile globale sur tous les produits pour l'affichage
            window.articlesBonnesAffairesActuels = tousLesProduits;
            naviguerVersPage('home'); // Ou ta page spécifique de boutique/produits

            const indexProduitTab = tousLesProduits.findIndex(p => p.id_article === idArticlePartage);
            if (indexProduitTab !== -1) {
                setTimeout(() => {
                    const domIdCible = `img-produit-shared-${idArticlePartage}`;
                    if (typeof window.ouvrirApercuProduit === 'function') {
                        window.ouvrirApercuProduit(indexProduitTab, domIdCible, { preventDefault: () => {} });
                    }
                }, 150);
            }
            nettoyerUrlBarre();

        } else if (indexBoutique !== -1 && segments[indexBoutique + 1]) {
            // ----------------------------------------------------
            // CAS 3 : INTERCEPTION D'UNE BOUTIQUE (/Boutique/id_boutique)
            // ----------------------------------------------------
            const idBoutiqueCible = segments[indexBoutique + 1];
            
            // Logique pour ouvrir directement le profil du vendeur
            if (typeof window.ouvrirProfilVendeur === 'function') {
                setTimeout(() => {
                    window.ouvrirProfilVendeur(idBoutiqueCible);
                }, 150);
            } else {
                naviguerVersPage('home');
            }
            nettoyerUrlBarre();

        } else {
            // Aucun chemin spécial détecté, chargement normal de l'accueil
            naviguerVersPage('home');
        }

    } catch (erreur) {
        console.error("[app.js] Échec critique de synchronisation :", erreur);
        if (mainRender) {
            mainRender.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#d93025; background:#fce8e6; border-radius:12px; margin:10px; border:1px solid #fad2cf;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:30px; margin-bottom:12px;"></i>
                    <h4 style="font-size:15px; font-weight:700; margin:0 0 6px 0;">Le serveur local ne répond pas</h4>
                    <p style="font-size:12px; margin:0 0 14px 0; color:#5f6368;">La base de données déchiffrée a mis trop de temps à s'initialiser.</p>
                    <button onclick="location.reload()" style="background:#d93025; color:#fff; border:none; padding:8px 16px; border-radius:16px; font-size:12px; font-weight:500; cursor:pointer;"><i class="fa-solid fa-rotate"></i> Réessayer</button>
                </div>`;
        }
    }
}

/**
 * Fonction utilitaire interne pour nettoyer l'URL proprement sans laisser de traces de dossiers
 */
function nettoyerUrlBarre() {
    // Redirige visuellement l'utilisateur vers la racine propre, ex: https://.../Go-Buznes/
    const cheminBase = window.location.pathname.split('/Boutique')[0].split('/Article')[0].split('/Annonce')[0];
    window.history.replaceState({}, document.title, cheminBase);
}

/**
 * Gestionnaire de navigation inter-écrans (SPA)
 */
function naviguerVersPage(pageId) {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.getAttribute('data-page') === pageId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (pageId !== 'home') {
        const inputSearch = document.getElementById('main-search');
        if (inputSearch) inputSearch.value = '';
    }

    switch (pageId) {
        case 'home':
            genererEcranAccueil(tousLesProduits);
            break;
        case 'stores':
            genererEcranBoutiques(toutesLesBoutiques);
            break;
        case 'vendre':
            genererEcranVendre();
            break;
        case 'biens':
            genererEcranAnnoncesEtNews();
            break;
        case 'profil':
            genererEcranProfil();
            break;
    }
    
    window.scrollTo(0, 0);
}

/* ==========================================================================
   SYSTEME DE MODALS PERSONNALISÉES (GB ALERT & CONFIRM)
   ========================================================================== */

/**
 * Affiche une alerte stylisée personnalisée au centre
 */
window.afficherGbAlerte = function(message) {
    // Nettoyer toute ancienne modale existante
    const ancienneModale = document.getElementById('gb-modal-container');
    if (ancienneModale) ancienneModale.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gb-modal-container';
    overlay.className = 'gb-overlay';
    overlay.innerHTML = `
        <div class="gb-alert-box">
            <div class="gb-alert-logo">GB</div>
            <p class="gb-alert-text">${message}</p>
            <div class="gb-alert-actions">
                <button class="gb-alert-btn gb-alert-btn-primary" onclick="document.getElementById('gb-modal-container').remove()">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
};

/**
 * Affiche une demande de confirmation stylisée au centre
 */
window.afficherGbConfirmation = function(message, callbackAction) {
    const ancienneModale = document.getElementById('gb-modal-container');
    if (ancienneModale) ancienneModale.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gb-modal-container';
    overlay.className = 'gb-overlay';
    overlay.innerHTML = `
        <div class="gb-alert-box">
            <div class="gb-alert-logo">GB</div>
            <p class="gb-alert-text">${message}</p>
            <div class="gb-alert-actions">
                <button class="gb-alert-btn gb-alert-btn-secondary" id="gb-btn-cancel">Annuler</button>
                <button class="gb-alert-btn gb-alert-btn-primary" id="gb-btn-confirm">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('gb-btn-cancel').onclick = () => overlay.remove();
    document.getElementById('gb-btn-confirm').onclick = () => {
        overlay.remove();
        callbackAction();
    };
};

/* ==========================================================================
   GÉNÉRATEURS DE VUES (Rendu HTML Dynamique)
   ========================================================================== */

// ==========================================================================
// VARIABLES GLOBALES DE CONTRÔLE
// ==========================================================================
if (typeof intervalleBonnesAffaires === 'undefined') window.intervalleBonnesAffaires = null;
if (typeof articlesBonnesAffairesActuels === 'undefined') window.articlesBonnesAffairesActuels = [];

// ==========================================================================
// 🏠 VUE 1 : ACCUEIL MULTI-SECTIONS (Stories + Top 3 + Pubs + Bonnes Affaires)
// ==========================================================================
function genererEcranAccueil(listeProduits) {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    // Sécurité Timer
    if (window.intervalleBonnesAffaires) {
        clearInterval(window.intervalleBonnesAffaires);
        window.intervalleBonnesAffaires = null;
    }

    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];
    const boutiquesSource = (typeof toutesLesBoutiques !== 'undefined') ? toutesLesBoutiques : [];
    const annoncesSource = (typeof toutesLesAnnonces !== 'undefined') ? toutesLesAnnonces : [];

    if (produitsSource.length === 0 && boutiquesSource.length === 0) {
        mainRender.innerHTML = `<div style="text-align:center; padding:50px 20px; color:#5f6368;"><i class="fa-solid fa-box-open" style="font-size:40px; color:#dadce0; margin-bottom:15px; display:block;"></i>Aucun contenu disponible.</div>`;
        return;
    }

    mainRender.innerHTML = `<div id="home-wrapper" style="display:flex; flex-direction:column; gap:24px; width:100%;"></div>`;
    const homeWrapper = document.getElementById('home-wrapper');

    // --------------------------------------------------------------------------
    // 1. STORIES HORIZONTALES
    // --------------------------------------------------------------------------
    const boutiquesStories = boutiquesSource
        .filter(b => {
            const badge = b.badge?.type || b.badgeType;
            return badge === 'or' || badge === 'bleu';
        })
        .sort((a, b) => {
            const badgeA = a.badge?.type || a.badgeType;
            const badgeB = b.badge?.type || b.badgeType;
            if (badgeA === 'or' && badgeB !== 'or') return -1;
            if (badgeA !== 'or' && badgeB === 'or') return 1;
            return 0;
        });

    if (boutiquesStories.length > 0) {
        let storiesHtml = `
            <div style="width:100%;">
                <h4 style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">Boutiques Vedettes</h4>
                <div style="display:flex; gap:14px; overflow-x:auto; padding:4px 2px; scroll-behavior:smooth;" class="hide-scrollbar">
        `;

        boutiquesStories.forEach((store, idx) => {
            const badge = store.badge?.type || store.badgeType;
            const borderStyle = badge === 'or' ? '3px solid #d4af37' : '3px solid #0046ad';
            const storyLogoId = `story-logo-${store.id_boutique}-${idx}`;

            storiesHtml += `
                <div onclick="if(typeof filtrerArticlesParBoutique === 'function') filtrerArticlesParBoutique('${store.id_boutique}')" style="display:flex; flex-direction:column; align-items:center; cursor:pointer; flex-shrink:0; width:68px; text-align:center;">
                    <div style="width:58px; height:58px; border-radius:50%; ${borderStyle}; padding:2px; background:#fff; overflow:hidden; position:relative; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                        <img id="${storyLogoId}" src="" alt="${store.nom}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; opacity:0; transition:opacity 0.2s;">
                    </div>
                    <span style="font-size:11px; font-weight:500; color:var(--text-body); margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${store.nom}</span>
                </div>
            `;
        });

        storiesHtml += `</div></div>`;
        homeWrapper.insertAdjacentHTML('beforeend', storiesHtml);

        boutiquesStories.forEach((store, idx) => {
            const storyLogoId = `story-logo-${store.id_boutique}-${idx}`;
            if (store.logo_entreprise && typeof chargerImageBoutiqueOuArticle === 'function') {
                chargerImageBoutiqueOuArticle(store.id_boutique, store.logo_entreprise, storyLogoId);
            }
        });
    }

    // --------------------------------------------------------------------------
    // 2. CLASSEMENT TOP 3 CAPITAL
    // --------------------------------------------------------------------------
    const boutiquesAvecCapital = boutiquesSource.map(boutique => {
        const articlesBoutique = produitsSource.filter(p => p.boutiqueId === boutique.id_boutique);
        const sommeCapital = articlesBoutique.reduce((total, art) => total + (parseFloat(art.prix) || 0), 0);
        return { ...boutique, capitalTotal: sommeCapital };
    })
    .sort((a, b) => b.capitalTotal - a.capitalTotal)
    .slice(0, 3);

    if (boutiquesAvecCapital.length > 0) {
        let capitalHtml = `
            <div style="width:100%;">
                <h4 style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.5px;"><i class="fa-solid fa-trophy" style="color:#d4af37;"></i> Les 3 Plus Suivies</h4>
                <div style="display:flex; gap:14px; overflow-x:auto; padding:4px 2px; scroll-behavior:smooth;" class="hide-scrollbar">
        `;

        boutiquesAvecCapital.forEach((store, index) => {
            const topLogoId = `top-cap-logo-${store.id_boutique}-${index}`;
            let bgBadge = ['#d4af37', '#b5b7bb', '#cd7f32'][index];

            capitalHtml += `
                <div onclick="if(typeof filtrerArticlesParBoutique === 'function') filtrerArticlesParBoutique('${store.id_boutique}')" style="display:flex; flex-direction:column; align-items:center; cursor:pointer; flex-shrink:0; width:76px; text-align:center; position:relative;">
                    <div style="position:absolute; top:-2px; right:4px; background:${bgBadge}; color:#fff; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; border:2px solid #fff; z-index:10; box-shadow:0 2px 4px rgba(0,0,0,0.15);">
                        ${index + 1}
                    </div>
                    <div style="width:62px; height:62px; border-radius:50%; padding:2px; background:#fff; border:1px solid var(--border-light); overflow:hidden; position:relative; box-shadow:var(--shadow-sm);">
                        <img id="${topLogoId}" src="" alt="${store.nom}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; opacity:0; transition:opacity 0.2s;">
                    </div>
                    <span style="font-size:11px; font-weight:600; color:var(--text-main); margin-top:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${store.nom}</span>
                    <span style="font-size:9px; color:var(--text-muted); font-weight:500;">Tendance 🔥</span>
                </div>
            `;
        });

        capitalHtml += `</div></div>`;
        homeWrapper.insertAdjacentHTML('beforeend', capitalHtml);

        boutiquesAvecCapital.forEach((store, index) => {
            const topLogoId = `top-cap-logo-${store.id_boutique}-${index}`;
            if (store.logo_entreprise && typeof chargerImageBoutiqueOuArticle === 'function') {
                chargerImageBoutiqueOuArticle(store.id_boutique, store.logo_entreprise, topLogoId);
            }
        });
    }

    // Extraction et traitement des annonces (Haut et Bas)
    let uniqueAnnonceHaut = null;
    let uniqueAnnonceBas = null;
    if (annoncesSource.length > 0) {
        const annoncesMelangees = [...annoncesSource].sort(() => 0.5 - Math.random());
        uniqueAnnonceHaut = annoncesMelangees[0];
        if (annoncesMelangees.length > 1) uniqueAnnonceBas = annoncesMelangees[1];
    }

    // Injection de l'annonce du HAUT
    if (uniqueAnnonceHaut) {
        homeWrapper.insertAdjacentHTML('beforeend', `<div style="width:100%;">${window.construireHtmlAnnonceNetiqui(uniqueAnnonceHaut, 'haut')}</div>`);
        window.declencherImagesAnnonceNetiqui(uniqueAnnonceHaut, 'haut');
    }

    // --------------------------------------------------------------------------
    // 3. SECTION GRILLE : BONNES AFFAIRES (≤ 20$)
    // --------------------------------------------------------------------------
    let bonnesAffairesContainerHtml = `
        <div style="width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;"><i class="fa-solid fa-tags" style="color:#d93025;"></i> Bonnes Affaires (≤ 20$)</h4>
                <span id="timer-badge" style="font-size:10px; color:var(--logo-blue); background:var(--logo-blue-light); padding:2px 8px; border-radius:10px; font-weight:500;"><i class="fa-solid fa-rotate"></i> Auto-mix</span>
            </div>
            <div id="grid-bonnes-affaires" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;"></div>
        </div>
    `;
    homeWrapper.insertAdjacentHTML('beforeend', bonnesAffairesContainerHtml);

    rafraichirSectionBonnesAffaires();

    window.intervalleBonnesAffaires = setInterval(() => {
        rafraichirSectionBonnesAffaires();
    }, 120000);

    // Injection de l'annonce du BAS
    if (uniqueAnnonceBas) {
        homeWrapper.insertAdjacentHTML('beforeend', `<div style="width:100%;">${window.construireHtmlAnnonceNetiqui(uniqueAnnonceBas, 'bas')}</div>`);
        window.declencherImagesAnnonceNetiqui(uniqueAnnonceBas, 'bas');
    }
}

/**
 * Filtre et remplit la grille
 */
function rafraichirSectionBonnesAffaires() {
    const grille = document.getElementById('grid-bonnes-affaires');
    if (!grille) return;

    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];
    const filtrés = produitsSource.filter(p => (parseFloat(p.prix) || 0) <= 20);

    if (filtrés.length === 0) {
        grille.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">Aucun article à moins de 20 USD en ce moment.</div>`;
        return;
    }

    window.articlesBonnesAffairesActuels = filtrés.sort(() => 0.5 - Math.random()).slice(0, 20);
    let html = '';

    window.articlesBonnesAffairesActuels.forEach((prod, index) => {
        let iconeBadge = '';
        if (prod.badgeType === 'or') iconeBadge = `<i class="fa-solid fa-crown" style="color:#d4af37; margin-left:2px;"></i>`;
        if (prod.badgeType === 'bleu') iconeBadge = `<i class="fa-solid fa-circle-check" style="color:#0046ad; margin-left:2px;"></i>`;

        const domId = `img-deal-${prod.boutiqueId || 'shop'}-${index}`;

        html += `
            <div style="background:#fff; border:1px solid var(--border-light); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; box-shadow:var(--shadow-sm); position:relative;">
                <div style="position:relative; width:100%; aspect-ratio:1/1; overflow:hidden; background:#f1f3f4;">
                    <img id="${domId}" src="" alt="${prod.designation}" style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.2s;">
                    <span style="position:absolute; top:6px; left:6px; background:#d93025; color:#fff; font-size:9px; font-weight:700; padding:2px 5px; border-radius:4px; z-index:2;">-20$</span>
                </div>
                <div style="padding:8px; display:flex; flex-direction:column; gap:4px; justify-content:space-between; flex:1;">
                    <div>
                        <h3 style="font-size:12px; font-weight:600; margin:0; color:var(--text-body); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.designation}</h3>
                        <p style="font-size:10px; color:var(--text-muted); margin:1px 0 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${prod.boutiqueNom || 'Boutique'} ${iconeBadge}
                        </p>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                        <span style="font-size:12px; font-weight:700; color:var(--logo-blue); flex:1;">${prod.prix} ${prod.devise || 'USD'}</span>
                        <button onclick="window.ouvrirApercuProduit(${index}, '${domId}', event)" style="background:#e8f0fe; color:#0046ad; border:none; padding:5px 10px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; z-index:10;">
                            <i class="fa-solid fa-circle-info"></i> Info
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    grille.innerHTML = html;

    window.articlesBonnesAffairesActuels.forEach((prod, index) => {
        const domId = `img-deal-${prod.boutiqueId || 'shop'}-${index}`;
        const nomImageCorrect = prod.image || prod.imageNom || "";
        if (typeof chargerImageBoutiqueOuArticle === 'function') {
            chargerImageBoutiqueOuArticle(prod.boutiqueId, nomImageCorrect, domId);
        }
    });
}

// ==========================================================================
// 💥 LOGIQUE BLINDÉE LOGO ET ANNONCES SUR L'OBJET WINDOW
// ==========================================================================

window.ouvrirApercuProduit = function(indexLocal, originImgId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const prod = window.articlesBonnesAffairesActuels[indexLocal];
    if (!prod) return;

    const srcImageOrigine = document.getElementById(originImgId)?.src || '';
    const boutiquesSource = (typeof toutesLesBoutiques !== 'undefined') ? toutesLesBoutiques : [];
    const boutiqueComplete = boutiquesSource.find(b => b.id_boutique === prod.boutiqueId) || {};
    
    // Détermination dynamique et exacte du logo créé par l'admin : logo_[id].jpg
    const nomLogoAttendu = boutiqueComplete.logo_entreprise || (prod.boutiqueId ? `logo_${prod.boutiqueId.toLowerCase()}.jpg` : "");
    const domLogoModalId = `modal-logo-${prod.boutiqueId || 'shop'}`;

    const ancienneModale = document.getElementById('product-preview-modal');
    if (ancienneModale) ancienneModale.remove();

    const overlay = document.createElement('div');
    overlay.id = 'product-preview-modal';
    overlay.style = `
        position:fixed; top:0; left:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.75); z-index:99999; display:flex; 
        align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px);
    `;

    overlay.innerHTML = `
        <div style="background:#fff; width:100%; max-width:360px; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.3); position:relative; display:flex; flex-direction:column;">
            <button onclick="document.getElementById('product-preview-modal').remove()" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.9); border:none; width:32px; height:32px; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:100; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                <i class="fa-solid fa-xmark" style="font-size:16px;"></i>
            </button>
            <div style="width:100%; aspect-ratio:1/1; background:#f1f3f4; overflow:hidden;">
                <img src="${srcImageOrigine}" alt="${prod.designation}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding:16px; display:flex; flex-direction:column; gap:12px;">
                <div>
                    <span style="font-size:18px; font-weight:700; color:#0046ad; display:block; margin-bottom:4px;">${prod.prix} ${prod.devise || 'USD'}</span>
                    <h2 style="font-size:14px; font-weight:600; color:#1c1e21; margin:0; line-height:1.4;">${prod.designation}</h2>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="if(typeof ouvrirDiscussionWhatsApp === 'function') ouvrirDiscussionWhatsApp('${prod.boutiqueTel || boutiqueComplete.telephone || ''}', '${encodeURIComponent(prod.designation)}', '${prod.prix}')" style="flex:1; background:#25D366; color:#fff; border:none; height:40px; border-radius:8px; font-size:12px; font-weight:700; display:flex; justify-content:center; align-items:center; gap:6px; cursor:pointer;">
                        <i class="fa-brands fa-whatsapp" style="font-size:16px;"></i> WhatsApp
                    </button>
                    <button onclick="if(typeof partagerContenuDirect === 'function') partagerContenuDirect('produit', '${prod.id_article}', '${encodeURIComponent(prod.designation)}', '${prod.prix}', '${prod.boutiqueId}')" style="background:#f1f3f4; border:none; width:40px; height:40px; border-radius:8px; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
                <div style="border-top:1px solid #dadce0; margin:4px 0;"></div>
                
                <div onclick="document.getElementById('product-preview-modal').remove(); if(typeof filtrerArticlesParBoutique === 'function') filtrerArticlesParBoutique('${prod.boutiqueId}');" style="display:flex; align-items:center; justify-content:space-between; background:#f8f9fa; padding:10px; border-radius:8px; cursor:pointer; border:1px solid #dadce0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:#fff; border:1px solid #dadce0; overflow:hidden;">
                            <img id="${domLogoModalId}" src="" style="width:100%; height:100%; object-fit:cover; border-radius:50%; opacity:0; transition:opacity 0.2s;">
                        </div>
                        <div>
                            <h4 style="font-size:12px; font-weight:700; color:#1c1e21; margin:0;">${prod.boutiqueNom || boutiqueComplete.nom || 'Boutique'}</h4>
                            <span style="font-size:10px; color:#0046ad; font-weight:600;">Visiter le Vendeur <i class="fa-solid fa-chevron-right" style="font-size:8px;"></i></span>
                        </div>
                    </div>
                    <i class="fa-solid fa-store" style="color:#5f6368;"></i>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Chargement instantané et dynamique du vrai logo
    if (prod.boutiqueId && nomLogoAttendu && typeof chargerImageBoutiqueOuArticle === 'function') {
        chargerImageBoutiqueOuArticle(prod.boutiqueId, nomLogoAttendu, domLogoModalId);
    }
};

window.construireHtmlAnnonceNetiqui = function(annonce, emplacement) {
    let imagesAnnonceHtml = '';
    if (annonce.images && annonce.images.length > 0) {
        imagesAnnonceHtml += `<div style="width:100%; display:flex; gap:8px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:6px; margin-bottom:10px;" class="hide-scrollbar">`;
        annonce.images.forEach((nomImg, index) => {
            const domImgId = `img-pub-${emplacement}-${annonce.id_annonce}-${index}`;
            imagesAnnonceHtml += `
                <div style="flex:0 0 100%; width:100%; aspect-ratio:1/1; border-radius:8px; overflow:hidden; scroll-snap-align:start; background:#f1f3f4;">
                    <img id="${domImgId}" src="" alt="Image Pub" style="width:100%; height:100%; object-fit:cover;">
                </div>`;
        });
        imagesAnnonceHtml += `</div>`;
    }

    return `
        <div style="background:#fff; border:1px solid var(--border-light); border-radius:12px; padding:14px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">
            ${imagesAnnonceHtml}
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h3 onclick="if(typeof executerClicAnnonceur === 'function') executerClicAnnonceur('${annonce.type_lien}', '${annonce.cible_lien}')" 
                    style="font-size:13px; font-weight:700; color:var(--logo-blue); cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                    <i class="fa-solid fa-bullhorn" style="font-size:11px; color:var(--text-muted);"></i> ${annonce.annonceur}
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px; opacity:0.6;"></i>
                </h3>
                <span style="font-size:10px; color:#9aa0a6; text-transform:uppercase; font-weight:700; letter-spacing:0.3px;">Sponsorisé</span>
            </div>
            <p style="font-size:12px; color:var(--text-body); line-height:1.4; white-space:pre-line; margin:0 0 10px 0;">${annonce.description}</p>
            <div style="border-top:1px solid #f1f3f4; padding-top:8px; display:flex; justify-content:flex-end;">
                <button onclick="if(typeof partagerContenuDirect === 'function') partagerContenuDirect('annonce', '${annonce.id_annonce}', '${encodeURIComponent(annonce.annonceur)}')" 
                        style="background:#f1f3f4; border:none; padding:6px 12px; border-radius:16px; font-size:11px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    <i class="fa-solid fa-share-nodes"></i> Partager
                </button>
            </div>
        </div>
    `;
};

window.declencherImagesAnnonceNetiqui = function(annonce, emplacement) {
    if (annonce.images && annonce.images.length > 0) {
        annonce.images.forEach((nomImg, index) => {
            const domImgId = `img-pub-${emplacement}-${annonce.id_annonce}-${index}`;
            if (typeof chargerImageAnnonce === 'function') {
                chargerImageAnnonce(annonce.id_annonce, nomImg, domImgId);
            }
        });
    }
};


// ==========================================================================
// 🏪 VUE 2 : LISTE DES BOUTIQUES (Version Podiums & Badges - Sans Recherche)
// ==========================================================================
function genererEcranBoutiques(listeBoutiques) {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    // Sauvegarde de la liste pour les filtres dynamiques globaux
    window.listeBoutiquesOriginale = listeBoutiques || [];
    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];

    // --------------------------------------------------------------------------
    // 🏆 LOGIQUE DU PODIUM : CLASSEMENT TOP 3 PAR NOMBRE D'ARTICLES
    // --------------------------------------------------------------------------
    const boutiquesClassees = [...window.listeBoutiquesOriginale].map(store => {
        const nbArticles = produitsSource.filter(p => p.boutiqueId === store.id_boutique).length;
        return { ...store, nbArticles };
    }).sort((a, b) => b.nbArticles - a.nbArticles);

    const top3 = boutiquesClassees.slice(0, 3);

    let htmlEntete = `
        <div style="background: linear-gradient(135deg, #0046ad, #002d72); border-radius:16px; padding:16px; margin-bottom:16px; color:#fff; box-shadow:0 4px 15px rgba(0,70,173,0.15);">
            <h4 style="font-size:13px; font-weight:700; text-transform:uppercase; margin:0 0 14px 0; letter-spacing:0.5px; display:flex; align-items:center; gap:6px; color:#fff;">
                <i class="fa-solid fa-trophy" style="color:#ffd700;"></i> Les Plus Grands Catalogues
            </h4>
            <div style="display:flex; justify-content:space-around; align-items:flex-end; padding-top:10px;">
    `;

    // Rendu graphique du Podium
    const ordresPodium = [1, 0, 2]; // Ordre visuel standard : 2ème (gauche), 1er (centre), 3ème (droite)
    ordresPodium.forEach(positionIdx => {
        const store = top3[positionIdx];
        if (store) {
            const uniquePodiumLogoId = `img-podium-${store.id_boutique}-${positionIdx}`;
            const hauteurPodium = positionIdx === 0 ? '75px' : (positionIdx === 1 ? '60px' : '50px');
            const tailleLogo = positionIdx === 0 ? '54px' : '44px';
            const couronne = positionIdx === 0 ? `<i class="fa-solid fa-crown" style="color:#ffd700; font-size:14px; position:absolute; top:-14px; left:50%; transform:translateX(-50%);"></i>` : '';
            const couleurMedaille = positionIdx === 0 ? '#ffd700' : (positionIdx === 1 ? '#c0c0c0' : '#cd7f32');

            htmlEntete += `
                <div onclick="window.ouvrirProfilBoutique('${store.id_boutique}', '${uniquePodiumLogoId}')" style="display:flex; flex-direction:column; align-items:center; width:30%; cursor:pointer; position:relative;">
                    ${couronne}
                    <div style="width:${tailleLogo}; height:${tailleLogo}; border-radius:50%; border:3px solid ${couleurMedaille}; background:#fff; overflow:hidden; position:relative; box-shadow:0 4px 8px rgba(0,0,0,0.2);">
                        <img id="${uniquePodiumLogoId}" src="" alt="Top Logo" style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.2s;">
                    </div>
                    <span style="font-size:11px; font-weight:700; margin-top:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center;">${store.nom}</span>
                    
                    <div style="background:rgba(255,255,255,0.15); border-radius:6px 6px 0 0; width:100%; height:${hauteurPodium}; margin-top:6px; display:flex; flex-direction:column; justify-content:center; align-items:center; border:1px solid rgba(255,255,255,0.1);">
                        <span style="font-size:16px; font-weight:900; color:${couleurMedaille};">#${positionIdx + 1}</span>
                        <span style="font-size:10px; font-weight:600; opacity:0.9;">${store.nbArticles} art.</span>
                    </div>
                </div>
            `;
        }
    });

    htmlEntete += `
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; width:100%; margin-bottom:16px;">
            <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;" class="hide-scrollbar">
                <button onclick="window.filtrerBoutiquesParBadge('tous', this)" style="background:#0046ad; color:#fff; border:none; padding:8px 16px; border-radius:16px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; box-shadow:0 1px 3px rgba(0,0,0,0.05);">Toutes les boutiques</button>
                <button onclick="window.filtrerBoutiquesParBadge('or', this)" style="background:#fff; color:#d4af37; border:1px solid #fadd8d; padding:8px 16px; border-radius:16px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;"><i class="fa-solid fa-crown"></i> Certifiées Or</button>
                <button onclick="window.filtrerBoutiquesParBadge('bleu', this)" style="background:#fff; color:#0046ad; border:1px solid #c2e7ff; padding:8px 16px; border-radius:16px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;"><i class="fa-solid fa-circle-check"></i> Vérifiées</button>
            </div>
        </div>

        <div id="stores-list-container" style="display:flex; flex-direction:column; gap:12px; width:100%;"></div>
    `;

    mainRender.innerHTML = htmlEntete;
    
    // Rendu initial de la liste complète en bas du podium
    window.rendreListeBoutiquesFiltree(window.listeBoutiquesOriginale);

    // Déclenchement asynchrone spécifique pour les images des logos du Podium
    top3.forEach((store, index) => {
        const uniquePodiumLogoId = `img-podium-${store.id_boutique}-${index}`;
        const logoCorrect = store.logo_entreprise || `logo_${store.id_boutique.toLowerCase()}.jpg`;
        if (typeof chargerImageBoutiqueOuArticle === 'function') {
            chargerImageBoutiqueOuArticle(store.id_boutique, logoCorrect, uniquePodiumLogoId);
        }
    });
}

// ==========================================================================
// 💥 ACTIONS & LOGIQUES SUR L'OBJET GLOBAL WINDOW
// ==========================================================================

/**
 * Génère le rendu HTML des cartes de boutiques filtrées
 */
window.rendreListeBoutiquesFiltree = function(listeAffiche) {
    const conteneur = document.getElementById('stores-list-container');
    if (!conteneur) return;

    if (listeAffiche.length === 0) {
        conteneur.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#5f6368; font-size:13px;">Aucune boutique dans cette catégorie.</div>`;
        return;
    }

    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];
    let htmlCartes = '';

    listeAffiche.forEach((store, index) => {
        let styleBadge = 'background:#f1f3f4; color:#5f6368;';
        let texteBadge = '<i class="fa-solid fa-store" style="margin-right:2px;"></i> Standard';
        
        const typeDuBadge = store.badge?.type || store.badgeType;
        if (typeDuBadge === 'or') {
            styleBadge = 'background:#fef7e0; color:#d4af37; border:1px solid #fadd8d;';
            texteBadge = '<i class="fa-solid fa-crown" style="margin-right:2px;"></i> Or';
        } else if (typeDuBadge === 'bleu') {
            styleBadge = 'background:#e8f0fe; color:#0046ad; border:1px solid #c2e7ff;';
            texteBadge = '<i class="fa-solid fa-circle-check" style="margin-right:2px;"></i> Vérifié';
        }

        const nbArticles = produitsSource.filter(p => p.boutiqueId === store.id_boutique).length;
        const uniqueLogoId = `img-logo-${store.id_boutique}-${index}`;

        htmlCartes += `
            <div onclick="window.ouvrirProfilBoutique('${store.id_boutique}', '${uniqueLogoId}')" style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.05); gap:8px; cursor:pointer;">
                <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
                    <div style="width:52px; height:52px; border-radius:50%; background:#f1f3f4; overflow:hidden; position:relative; flex-shrink:0; border:1px solid #e8f0fe;">
                        <img id="${uniqueLogoId}" src="" alt="Logo" style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.2s;">
                    </div>
                    <div style="overflow:hidden;">
                        <h3 style="font-size:14px; font-weight:700; color:#1c1e21; margin:0 0 2px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${store.nom}</h3>
                        <p style="font-size:11px; color:#5f6368; margin:0 0 4px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            <i class="fa-solid fa-location-dot" style="font-size:10px; margin-right:3px; color:#d93025;"></i> ${store.adresse || 'Goma'}
                        </p>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:9px; font-weight:600; padding:2px 6px; border-radius:10px; ${styleBadge}">${texteBadge}</span>
                            <span style="font-size:10px; color:#0046ad; font-weight:700; background:#e8f0fe; padding:1px 6px; border-radius:6px;">${nbArticles} art.</span>
                        </div>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;" onclick="event.stopPropagation();">
                    <button onclick="window.partagerProfilBoutique('${store.id_boutique}', '${encodeURIComponent(store.nom)}')" style="width:32px; height:32px; border-radius:50%; background:#e8f0fe; color:#0046ad; border:none; display:flex; justify-content:center; align-items:center; cursor:pointer; font-size:11px;">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                    <button onclick="if(typeof window.filtrerArticlesParBoutique === 'function') { window.filtrerArticlesParBoutique('${store.id_boutique}'); }" style="background:#0046ad; border:none; color:#fff; font-size:12px; font-weight:700; padding:8px 14px; border-radius:18px; cursor:pointer;">
                        Rayon
                    </button>
                </div>
            </div>
        `;
    });

    conteneur.innerHTML = htmlCartes;

    // Chargement asynchrone sécurisé des images de la liste générale
    listeAffiche.forEach((store, index) => {
        const uniqueLogoId = `img-logo-${store.id_boutique}-${index}`;
        const logoCorrect = store.logo_entreprise || `logo_${store.id_boutique.toLowerCase()}.jpg`;
        if (typeof chargerImageBoutiqueOuArticle === 'function') {
            chargerImageBoutiqueOuArticle(store.id_boutique, logoCorrect, uniqueLogoId);
        }
    });
};

/**
 * Ouvre la modale de profil complet d'un vendeur
 */
window.ouvrirProfilBoutique = function(idBoutique, sourceLogoId) {
    const boutiquesSource = (typeof toutesLesBoutiques !== 'undefined') ? toutesLesBoutiques : [];
    const store = boutiquesSource.find(b => b.id_boutique === idBoutique);
    if (!store) return;

    const srcLogoOrigine = document.getElementById(sourceLogoId)?.src || '';
    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];
    const nbArticles = produitsSource.filter(p => p.boutiqueId === idBoutique).length;

    const ancienneModale = document.getElementById('shop-profile-modal');
    if (ancienneModale) ancienneModale.remove();

    const overlay = document.createElement('div');
    overlay.id = 'shop-profile-modal';
    overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px);`;

    overlay.innerHTML = `
        <div style="background:#fff; width:100%; max-width:350px; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.3); position:relative; display:flex; flex-direction:column; padding:20px; box-sizing:border-box; text-align:center;">
            <button onclick="document.getElementById('shop-profile-modal').remove()" style="position:absolute; top:12px; right:12px; background:#f1f3f4; border:none; width:30px; height:30px; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div style="width:80px; height:80px; border-radius:50%; background:#f1f3f4; margin:10px auto; overflow:hidden; border:2px solid #0046ad;">
                <img src="${srcLogoOrigine}" style="width:100%; height:100%; object-fit:cover;">
            </div>

            <h2 style="font-size:18px; font-weight:800; color:#1c1e21; margin:6px 0 2px 0;">${store.nom}</h2>
            <p style="font-size:12px; color:#5f6368; margin:0 0 12px 0;"><i class="fa-solid fa-location-dot" style="color:#d93025;"></i> ${store.adresse || 'Goma'}</p>

            <div style="display:flex; justify-content:center; gap:16px; margin-bottom:16px; background:#f8f9fa; padding:10px; border-radius:8px;">
                <div>
                    <span style="font-size:14px; font-weight:700; color:#0046ad; display:block;">${nbArticles}</span>
                    <span style="font-size:10px; color:#5f6368;">Articles en ligne</span>
                </div>
                <div style="border-left:1px solid #dadce0;"></div>
                <div>
                    <span style="font-size:14px; font-weight:700; color:#25D366; display:block;"><i class="fa-brands fa-whatsapp"></i></span>
                    <span style="font-size:10px; color:#5f6368;">Disponible</span>
                </div>
            </div>

            <p style="font-size:12px; color:#1c1e21; line-height:1.5; margin:0 0 20px 0; font-style:italic;">
                "${store.description || 'Bienvenue dans notre boutique. Découvrez nos articles de qualité aux meilleurs prix directement sur notre rayon.'}"
            </p>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <button onclick="document.getElementById('shop-profile-modal').remove(); if(typeof window.filtrerArticlesParBoutique === 'function') window.filtrerArticlesParBoutique('${store.id_boutique}');" style="background:#0046ad; color:#fff; border:none; height:40px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px;">
                    <i class="fa-solid fa-bag-shopping"></i> Voir tous les articles
                </button>
                <a href="tel:${store.telephone}" style="background:#25D366; color:#fff; border:none; height:40px; border-radius:8px; font-size:13px; font-weight:700; text-decoration:none; display:flex; justify-content:center; align-items:center; gap:8px;">
                    <i class="fa-solid fa-phone"></i> Appeler le vendeur
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
};

/**
 * 1. Gère le partage propre du profil du vendeur (Dossier virtuel Boutique/)
 */
window.partagerProfilBoutique = function(idBoutique, nomBoutique) {
    const nomDecode = decodeURIComponent(nomBoutique);
    
    // Structure propre : base/Boutique/id_boutique
    const baseUri = "https://gogamenetiqui.github.io/Go-Buznes";
    const urlPartage = `${baseUri}/Boutique/${idBoutique}`;
    
    const textePartage = `🏪 *Découvrez la boutique "${nomDecode}" sur Go Buznes !*\n\nConsultez l'ensemble de leurs articles et vitrines disponibles à Goma via ce lien direct :\n🔗 ${urlPartage}`;

    if (navigator.share) {
        navigator.share({
            title: `Profil de ${nomDecode}`,
            text: textePartage
        }).catch(err => console.log("Partage annulé", err));
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(textePartage)}`, '_blank');
        if (navigator.clipboard) { navigator.clipboard.writeText(urlPartage).catch(() => {}); }
    }
};

/**
 * Filtrage par boutons rapides (Badges)
 */
window.filtrerBoutiquesParBadge = function(typeBadge, boutonClique) {
    const boutons = boutonClique.parentNode.querySelectorAll('button');
    boutons.forEach(btn => {
        btn.style.background = '#fff';
        btn.style.color = btn.querySelector('.fa-crown') ? '#d4af37' : (btn.querySelector('.fa-circle-check') ? '#0046ad' : '#1c1e21');
        btn.style.border = '1px solid #dadce0';
    });

    boutonClique.style.background = '#0046ad';
    boutonClique.style.color = '#fff';
    boutonClique.style.border = 'none';

    if (typeBadge === 'tous') {
        window.rendreListeBoutiquesFiltree(window.listeBoutiquesOriginale);
    } else {
        const listeFiltree = window.listeBoutiquesOriginale.filter(store => {
            return (store.badge?.type || store.badgeType) === typeBadge;
        });
        window.rendreListeBoutiquesFiltree(listeFiltree);
    }
};

// ==========================================================================
// ➕ VUE 3 : CONTACT, ENREGISTREMENT & SUPPORT (Go Buznes | Netiqui)
// ==========================================================================
function genererEcranVendre() {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    // Structure principale avec sélecteur de requêtes et formulaires dynamiques
    mainRender.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px; width:100%; box-sizing:border-box;">
            
            <div style="background:#fff; border:1px solid #dadce0; border-radius:14px; padding:20px; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="width:60px; height:60px; background:#e8f0fe; border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 12px auto;">
                    <i class="fa-solid fa-comments" style="font-size:26px; color:#0046ad;"></i>
                </div>
                <h2 style="font-size:18px; font-weight:800; margin:0 0 6px 0; color:#1c1e21;">Centre de Contact Netiqui</h2>
                <p style="font-size:12px; color:#5f6368; margin:0; line-height:1.4;">
                    Acheteurs, Vendedores, Commissaires ou Partenaires... Contactez l'équipe de gestion **Go Buznes** en un clic.
                </p>
            </div>

            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
                
                <div onclick="window.basculerFormulaireNetiqui('boutique')" class="action-card-netiqui" style="background:#fff; border:2px solid #0046ad; border-radius:12px; padding:14px; text-align:center; cursor:pointer; transition: transform 0.2s;">
                    <i class="fa-solid fa-store" style="font-size:20px; color:#0046ad; margin-bottom:6px;"></i>
                    <h4 style="font-size:12px; font-weight:700; margin:0; color:#1c1e21;">Créer ma Boutique</h4>
                </div>

                <div onclick="window.basculerFormulaireNetiqui('article')" class="action-card-netiqui" style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:14px; text-align:center; cursor:pointer;">
                    <i class="fa-solid fa-box-open" style="font-size:20px; color:#25D366; margin-bottom:6px;"></i>
                    <h4 style="font-size:12px; font-weight:700; margin:0; color:#1c1e21;">Ajouter un Article</h4>
                </div>

                <div onclick="window.basculerFormulaireNetiqui('signalement')" class="action-card-netiqui" style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:14px; text-align:center; cursor:pointer;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:20px; color:#d93025; margin-bottom:6px;"></i>
                    <h4 style="font-size:12px; font-weight:700; margin:0; color:#1c1e21;">Signaler un Problème</h4>
                </div>

                <div onclick="window.basculerFormulaireNetiqui('avis')" class="action-card-netiqui" style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:14px; text-align:center; cursor:pointer;">
                    <i class="fa-solid fa-lightbulb" style="font-size:20px; color:#f8a100; margin-bottom:6px;"></i>
                    <h4 style="font-size:12px; font-weight:700; margin:0; color:#1c1e21;">Avis & Suggestions</h4>
                </div>

            </div>

            <div id="netiqui-form-container" style="background:#fff; border:1px solid #dadce0; border-radius:14px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                </div>

        </div>
    `;

    // Charger le premier formulaire par défaut
    window.basculerFormulaireNetiqui('boutique');
}

// ==========================================================================
// 💥 LOGIQUE INTERNE WINDOW POUR LE HUB DE CONTACT
// ==========================================================================

/**
 * Alterne dynamiquement entre les différents formulaires selon la tuile cliquée
 */
window.basculerFormulaireNetiqui = function(typeFormulaire) {
    const conteneurForm = document.getElementById('netiqui-form-container');
    if (!conteneurForm) return;

    // Mise à jour visuelle des bordures des cartes/tuiles
    const cartes = document.querySelectorAll('.action-card-netiqui');
    cartes.forEach(c => c.style.border = '1px solid #dadce0');
    
    // On remet la bordure active sur la bonne carte selon l'icône interne
    let iconeClasse = '';
    if (typeFormulaire === 'boutique') iconeClasse = 'fa-store';
    if (typeFormulaire === 'article') iconeClasse = 'fa-box-open';
    if (typeFormulaire === 'signalement') iconeClasse = 'fa-triangle-exclamation';
    if (typeFormulaire === 'avis') iconeClasse = 'fa-lightbulb';

    cartes.forEach(c => {
        if (c.querySelector(`.${iconeClasse}`)) {
            c.style.border = '2px solid #0046ad';
        }
    });

    // Génération du contenu HTML du formulaire sélectionné
    let htmlForm = '';

    if (typeFormulaire === 'boutique') {
        htmlForm = `
            <h3 style="font-size:14px; font-weight:700; color:#0046ad; margin:0 0 12px 0;"><i class="fa-solid fa-store"></i> Demande d'ouverture de vitrine</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Nom du commerce / Activité</label>
                    <input type="text" id="netiqui-shop-name" placeholder="Ex: Étoile Mode Goma" style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Adresse Physique ou Quartier (Goma)</label>
                    <input type="text" id="netiqui-shop-address" placeholder="Ex: Virunga, Rte de l'aéroport" style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Numéro Téléphone (WhatsApp)</label>
                    <input type="tel" id="netiqui-shop-tel" placeholder="Ex: +243..." style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                </div>
                <button onclick="window.soumettreFormulaireNetiqui('boutique')" style="background:#0046ad; color:#fff; border:none; height:40px; border-radius:20px; font-size:13px; font-weight:700; margin-top:6px; cursor:pointer;">
                    Envoyer la demande à la gestion
                </button>
            </div>
        `;
    } 
    else if (typeFormulaire === 'article') {
        htmlForm = `
            <h3 style="font-size:14px; font-weight:700; color:#25D366; margin:0 0 12px 0;"><i class="fa-solid fa-box-open"></i> Soumettre un nouvel article</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Désignation du produit</label>
                    <input type="text" id="netiqui-prod-name" placeholder="Ex: Chaussures Jordan Retro" style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                </div>
                <div style="display:flex; gap:8px;">
                    <div style="flex:2;">
                        <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Prix demandé</label>
                        <input type="number" id="netiqui-prod-price" placeholder="Ex: 45" style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Devise</label>
                        <select id="netiqui-prod-devise" style="width:100%; height:38px; border:1px solid #dadce0; border-radius:8px; padding:0 4px; font-size:13px; outline:none;">
                            <option value="USD">USD</option>
                            <option value="FC">FC</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Nom de votre Boutique existante</label>
                    <input type="text" id="netiqui-prod-shop" placeholder="Ex: Ma Boutique sur Netiqui" style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                </div>
                <p style="font-size:11px; color:#5f6368; margin:0; font-style:italic;">Note : La photo du produit sera directement partagée lors de la validation WhatsApp avec le gestionnaire.</p>
                <button onclick="window.soumettreFormulaireNetiqui('article')" style="background:#25D366; color:#fff; border:none; height:40px; border-radius:20px; font-size:13px; font-weight:700; margin-top:6px; cursor:pointer;">
                    Soumettre l'article via WhatsApp
                </button>
            </div>
        `;
    } 
    else if (typeFormulaire === 'signalement') {
        htmlForm = `
            <h3 style="font-size:14px; font-weight:700; color:#d93025; margin:0 0 12px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Signaler un abus, article ou fraude</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Sujet du signalement</label>
                    <select id="netiqui-report-reason" style="width:100%; height:38px; border:1px solid #dadce0; border-radius:8px; padding:0 8px; font-size:13px; outline:none;">
                        <option value="Boutique suspecte / Fraude">Boutique suspecte / Fraude</option>
                        <option value="Prix abusif ou mensonger">Prix abusif ou mensonger</option>
                        <option value="Comportement d'un agent / commissionnaire">Comportement suspect d'un utilisateur</option>
                        <option value="Autre anomalie technique">Autre problème technique</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Description détaillée de la situation</label>
                    <textarea id="netiqui-report-details" placeholder="Expliquez-nous brièvement la situation pour une intervention rapide..." style="width:100%; height:70px; padding:8px 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; font-family:inherit; box-sizing:border-box; resize:none;"></textarea>
                </div>
                <button onclick="window.soumettreFormulaireNetiqui('signalement')" style="background:#d93025; color:#fff; border:none; height:40px; border-radius:20px; font-size:13px; font-weight:700; margin-top:6px; cursor:pointer;">
                    Envoyer l'alerte de sécurité
                </button>
            </div>
        `;
    } 
    else if (typeFormulaire === 'avis') {
        htmlForm = `
            <h3 style="font-size:14px; font-weight:700; color:#f8a100; margin:0 0 12px 0;"><i class="fa-solid fa-lightbulb"></i> Remarques, Suggestions & Avis</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Votre Rôle sur Go Buznes</label>
                    <input type="text" id="netiqui-feedback-role" placeholder="Ex: Acheteur régulier, Vendeur au Marché Central, etc." style="width:100%; height:38px; padding:0 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; box-sizing:border-box;">
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px; color:#1c1e21;">Votre idée / remarque pour améliorer la plateforme</label>
                    <textarea id="netiqui-feedback-text" placeholder="Écrivez votre message ou idée ici..." style="width:100%; height:70px; padding:8px 10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; font-family:inherit; box-sizing:border-box; resize:none;"></textarea>
                </div>
                <button onclick="window.soumettreFormulaireNetiqui('avis')" style="background:#f8a100; color:#fff; border:none; height:40px; border-radius:20px; font-size:13px; font-weight:700; margin-top:6px; cursor:pointer;">
                    Partager mon idée avec Netiqui
                </button>
            </div>
        `;
    }

    conteneurForm.innerHTML = htmlForm;
};

/**
 * Traite les données saisies et redirige de façon sécurisée vers l'équipe de gestion
 */
window.soumettreFormulaireNetiqui = function(typeFormulaire) {
    // Numéro officiel de gestion Go Buznes | Netiqui à remplacer par le tien si besoin
    const numeroGestion = "+243976663953"; 
    let messageWhatsApp = "";

    if (typeFormulaire === 'boutique') {
        const nom = document.getElementById('netiqui-shop-name').value.trim();
        const adresse = document.getElementById('netiqui-shop-address').value.trim();
        const tel = document.getElementById('netiqui-shop-tel').value.trim();

        if (!nom || !adresse) { alert("Veuillez remplir le nom et l'adresse de la boutique."); return; }
        
        messageWhatsApp = `🏪 *DEMANDE DE CRÉATION DE BOUTIQUE (Netiqui)*\n\n` +
                          `• *Nom du commerce* : ${nom}\n` +
                          `• *Adresse à Goma* : ${adresse}\n` +
                          `• *Téléphone vendeur* : ${tel || 'Non spécifié'}\n\n` +
                          `Merci de valider ma vitrine sur Go Buznes !`;
    } 
    else if (typeFormulaire === 'article') {
        const designation = document.getElementById('netiqui-prod-name').value.trim();
        const prix = document.getElementById('netiqui-prod-price').value.trim();
        const devese = document.getElementById('netiqui-prod-devise').value;
        const boutique = document.getElementById('netiqui-prod-shop').value.trim();

        if (!designation || !prix) { alert("Veuillez renseigner le nom de l'article et son prix."); return; }

        messageWhatsApp = `📦 *SOUUMISSION NOUVEL ARTICLE (Netiqui)*\n\n` +
                          `• *Article* : ${designation}\n` +
                          `• *Prix proposé* : ${prix} ${devese}\n` +
                          `• *Boutique parente* : ${boutique || 'Non spécifiée'}\n\n` +
                          `_(Je vais joindre la photo à ce message)_`;
    } 
    else if (typeFormulaire === 'signalement') {
        const raison = document.getElementById('netiqui-report-reason').value;
        const details = document.getElementById('netiqui-report-details').value.trim();

        if (!details) { alert("Veuillez décrire la situation pour notre équipe."); return; }

        messageWhatsApp = `⚠️ *ALERTE / SIGNALEMENT GO BUZNES*\n\n` +
                          `• *Motif* : ${raison}\n` +
                          `• *Détails de l'anomalie* : ${details}`;
    } 
    else if (typeFormulaire === 'avis') {
        const role = document.getElementById('netiqui-feedback-role').value.trim();
        const texte = document.getElementById('netiqui-feedback-text').value.trim();

        if (!texte) { alert("Le message de suggestion ne peut pas être vide."); return; }

        messageWhatsApp = `💡 *AVIS & SUGGESTION D'UTILISATEUR*\n\n` +
                          `• *Profil utilisateur* : ${role || 'Client/Visiteur'}\n` +
                          `• *Message* : ${texte}`;
    }

    // Envoi sécurisé vers l'API WhatsApp
    const urlFinal = `https://wa.me/${numeroGestion.replace('+', '')}?text=${encodeURIComponent(messageWhatsApp)}`;
    window.open(urlFinal, '_blank');
};


// ==========================================================================
// 📦 VUE 4 : COMPTE POST / PUB / ANNONCES (Format Carré & Compte à Rebours)
// ==========================================================================
function genererEcranAnnoncesEtNews() {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    const listeAnnoncesSource = (typeof toutesLesAnnonces !== 'undefined') ? toutesLesAnnonces : [];

    if (listeAnnoncesSource.length === 0) {
        mainRender.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#5f6368;">
                <i class="fa-solid fa-bullhorn" style="font-size:44px; color:#dadce0; margin-bottom:12px;"></i>
                <h3 style="font-size:16px; font-weight:500; margin:0 0 6px 0; color:#1c1e21;">Actualités & Offres</h3>
                <p style="font-size:13px; margin:0;">Aucune annonce publicitaire ou information active pour le moment à Goma.</p>
            </div>`;
        return;
    }

    // --- ALGORITHME DE TRI PAR DATE DE FIN (EXPIRATION) ---
    const annoncesTriees = [...listeAnnoncesSource].sort((a, b) => {
        const dateA = a.date_fin ? new Date(a.date_fin) : new Date("2099-12-31");
        const dateB = b.date_fin ? new Date(b.date_fin) : new Date("2099-12-31");
        return dateA - dateB;
    });

    let html = `<div style="display:flex; flex-direction:column; gap:20px; width:100%; box-sizing:border-box;">`;

    annoncesTriees.forEach((annonce) => {
        const idUniqueAnnonce = annonce.id_annonce;
        
        // --- CONTENEUR D'IMAGES AU FORMAT CARRÉ STRICT ---
        let conteneurImagesHtml = '';
        if (annonce.images && annonce.images.length > 0) {
            conteneurImagesHtml += `
                <div style="width:100%; aspect-ratio:1/1; display:flex; gap:8px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:6px; margin-bottom:10px; border-radius:12px;" class="hide-scrollbar">`;
            
            annonce.images.forEach((nomImg, imgIndex) => {
                const domImageId = `img-post-${idUniqueAnnonce}-${imgIndex}`;
                conteneurImagesHtml += `
                    <div style="flex:0 0 100%; width:100%; height:100%; scroll-snap-align:start; background:#f1f3f4; border-radius:12px; overflow:hidden; position:relative;">
                        <img id="${domImageId}" src="" alt="Image ${imgIndex + 1}" style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.2s;">
                    </div>`;
            });
            
            conteneurImagesHtml += `</div>`;
        }

        // Préparation de l'emplacement du compte à rebours s'il y a une date de fin
        let badgeTexteHtml = "";
        if (annonce.date_fin) {
            badgeTexteHtml = `
                <span data-countdown="${annonce.date_fin}" 
                      style="font-size:11px; font-weight:700; font-family:monospace, monospace; padding:4px 10px; border-radius:12px; background:#fce8e6; color:#d93025; border:1px solid #fad2cf; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">
                    <i class="fa-solid fa-clock"></i> Calcul...
                </span>`;
        } else {
            badgeTexteHtml = `
                <span style="font-size:11px; padding:4px 10px; border-radius:12px; background:#e8f0fe; color:#0046ad; white-space:nowrap;">
                    <i class="fa-regular fa-calendar"></i> Actif
                </span>`;
        }

        html += `
            <div style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.04); display:flex; flex-direction:column;">
                
                ${conteneurImagesHtml}
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px;">
                    <h3 onclick="if(typeof executerClicAnnonceur === 'function') { executerClicAnnonceur('${annonce.type_lien}', '${annonce.cible_lien}'); }" 
                        style="font-size:14px; font-weight:700; color:#0046ad; cursor:pointer; display:inline-flex; align-items:center; gap:4px; margin:0;">
                        <i class="fa-solid fa-bullhorn" style="font-size:11px; color:#5f6368;"></i> ${annonce.annonceur}
                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px; opacity:0.6;"></i>
                    </h3>
                    
                    ${badgeTexteHtml}
                </div>

                <p style="font-size:13px; color:#1c1e21; line-height:1.5; white-space:pre-line; margin-bottom:12px; flex:1;">${annonce.description}</p>
                
                <div style="border-top:1px solid #f1f3f4; padding-top:10px; display:flex; justify-content:flex-end;">
                    <button onclick="if(typeof partagerContenuDirect === 'function') { partagerContenuDirect('annonce', '${idUniqueAnnonce}', '${encodeURIComponent(annonce.annonceur)}'); }" 
                            style="background:#f1f3f4; color:#1c1e21; border:none; padding:8px 16px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <i class="fa-solid fa-share-nodes"></i> Partager l'annonce
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    mainRender.innerHTML = html;

    // --- CHARGEMENT ASYNCHRONE DES IMAGES ---
    annoncesTriees.forEach((annonce) => {
        if (annonce.images && annonce.images.length > 0) {
            annonce.images.forEach((nomImg, imgIndex) => {
                const domImageId = `img-post-${annonce.id_annonce}-${imgIndex}`;
                if (typeof chargerImageAnnonce === 'function') {
                    chargerImageAnnonce(annonce.id_annonce, nomImg, domImageId);
                }
            });
        }
    });

    // --- LANCEMENT DU COMPTE À REBOURS EN TEMPS RÉEL ---
    window.initialiserComptesAReboursNetiqui();
}

// ==========================================================================
// ⏱️ MOTEUR DE COMPTE À REBOURS NETIQUI (Temps Réel)
// ==========================================================================
window.initialiserComptesAReboursNetiqui = function() {
    // Si un intervalle précédent tourne encore sur la fenêtre globale, on l'efface pour éviter les conflits
    if (window.netiquiCountdownInterval) {
        clearInterval(window.netiquiCountdownInterval);
    }

    function actualiserChrono() {
        const balises = document.querySelectorAll('[data-countdown]');
        if (balises.length === 0) {
            clearInterval(window.netiquiCountdownInterval);
            return;
        }

        const maintenant = new Date().getTime();

        balises.forEach(badge => {
            const dateFinCible = new Date(badge.getAttribute('data-countdown')).getTime();
            const distance = dateFinCible - maintenant;

            if (distance < 0) {
                badge.style.background = "#f1f3f4";
                badge.style.color = "#5f6368";
                badge.style.border = "1px solid #dadce0";
                badge.innerHTML = `<i class="fa-solid fa-hourglass-end"></i> Expiré`;
            } else {
                // Calculs mathématiques pour les jours, heures, minutes et secondes
                const jours = Math.floor(distance / (1000 * 60 * 60 * 24));
                const heures = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const secondes = Math.floor((distance % (1000 * 60)) / 1000);

                // Formatage à deux chiffres (ex: 05 au lieu de 5)
                const strJours = jours > 0 ? `${jours}j ` : "";
                const strHeures = heures < 10 ? `0${heures}` : heures;
                const strMinutes = minutes < 10 ? `0${minutes}` : minutes;
                const strSecondes = secondes < 10 ? `0${secondes}` : secondes;

                badge.innerHTML = `<i class="fa-solid fa-stopwatch font-pulse"></i> ${strJours}${strHeures}h ${strMinutes}m ${strSecondes}s`;
            }
        });
    }

    // Premier appel direct puis rafraîchissement toutes les 1 seconde
    actualiserChrono();
    window.netiquiCountdownInterval = setInterval(actualiserChrono, 1000);
};


// Variable globale pour suivre le nombre d'articles actuellement affichés
let limiteArticlesAffichage = 100;

// ==========================================================================
// 👤 VUE 5 : MÉGA CATALOGUE GLOBAL (Méthode calquée sur Vue 1 - 2 Colonnes)
// ==========================================================================
function genererEcranProfil() {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    // 1. Récupération directe depuis la source globale unifiée comme en Vue 1
    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];

    // On fait une copie du tableau pour pouvoir le trier sans casser le reste
    let tousLesArticles = [...produitsSource];

    // 2. Trier strictement du moins cher au plus cher
    tousLesArticles.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));

    // Découper la liste pour n'afficher que le bloc autorisé (100 par 100)
    const articlesAfficher = tousLesArticles.slice(0, limiteArticlesAffichage);

    // En-tête du catalogue
    let html = `
        <div style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 1px 2px rgba(0,0,0,0.05); text-align:center;">
            <div style="width:50px; height:50px; background:#e8f0fe; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
                <i class="fa-solid fa-tags" style="font-size:20px; color:#0046ad;"></i>
            </div>
            <h3 style="font-size:16px; font-weight:700; margin:0 0 2px 0;">Les Meilleures Offres</h3>
            <p style="font-size:12px; color:#5f6368; margin:0;">Affichage de ${articlesAfficher.length} sur ${tousLesArticles.length} articles à Goma</p>
        </div>
    `;

    // 3. Grille à 2 colonnes identique à celle des Bonnes Affaires
    html += `<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">`;

    if (articlesAfficher.length === 0) {
        html += `
            <div style="grid-column: span 2; text-align:center; padding:30px; color:#5f6368; font-size:12px;">
                Aucun article disponible pour le moment.
            </div>`;
    } else {
        articlesAfficher.forEach((prod, index) => {
            // Utilisation exacte de la structure d'ID de la Vue 1 pour éviter tout conflit
            const domId = `img-catalogue-global-${prod.boutiqueId || 'shop'}-${index}`;
            
            let iconeBadge = '';
            if (prod.badgeType === 'or') iconeBadge = `<i class="fa-solid fa-crown" style="color:#d4af37; margin-left:2px;"></i>`;
            if (prod.badgeType === 'bleu') iconeBadge = `<i class="fa-solid fa-circle-check" style="color:#0046ad; margin-left:2px;"></i>`;

            html += `
                <div style="background:#fff; border:1px solid var(--border-light); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; box-shadow:var(--shadow-sm); position:relative;">
                    
                    <div style="position:relative; width:100%; aspect-ratio:1/1; overflow:hidden; background:#f1f3f4;">
                        <img id="${domId}" src="" alt="${prod.designation}" style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.2s;">
                    </div>

                    <div style="padding:8px; display:flex; flex-direction:column; gap:4px; justify-content:space-between; flex:1;">
                        <div>
                            <h3 style="font-size:12px; font-weight:600; margin:0; color:var(--text-body); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.designation}</h3>
                            <p style="font-size:10px; color:var(--text-muted); margin:1px 0 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${prod.boutiqueNom || 'Boutique'} ${iconeBadge}
                            </p>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; gap:4px;">
                            <span style="font-size:12px; font-weight:700; color:var(--logo-blue); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${prod.prix} ${prod.devise || 'USD'}
                            </span>
                            
                            <button onclick="if(typeof ouvrirDiscussionWhatsApp === 'function') { ouvrirDiscussionWhatsApp('${prod.boutiqueTel || ''}', '${encodeURIComponent(prod.designation)}', '${prod.prix}'); } else { window.ouvrirApercuProduitProfil(${index}, '${domId}', event); }" 
                                    style="background:#e8f0fe; color:#0046ad; border:none; padding:5px 8px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:2px; z-index:10; white-space:nowrap;">
                                <i class="fa-brands fa-whatsapp"></i> Prendre
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;

    // 4. Bouton de chargement progressif (+100)
    if (tousLesArticles.length > limiteArticlesAffichage) {
        html += `
            <div style="text-align:center; margin-bottom:20px;">
                <button onclick="chargerPlusDArticlesProfil()" style="background:#0046ad; color:#fff; border:none; padding:10px 20px; border-radius:20px; font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow:0 2px 5px rgba(0,70,173,0.2);">
                    <i class="fa-solid fa-plus"></i> Afficher 100 articles de plus
                </button>
            </div>
        `;
    }

    // Zone suggestion Netiqui conservée en bas
    html += `
        <div style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            <h4 style="font-size:14px; font-weight:700; color:#1c1e21; margin:0 0 10px 0;">Une suggestion ? Écrivez à Netiqui</h4>
            <textarea id="input-suggestion" placeholder="Aidez-nous à améliorer Go Buznes..." style="width:100%; height:80px; padding:10px; border:1px solid #dadce0; border-radius:8px; outline:none; font-size:13px; font-family:inherit; resize:none; margin-bottom:10px; box-sizing:border-box;"></textarea>
            <button onclick="confirmerSuggestion()" style="background:#f1f3f4; color:#1c1e21; border:none; width:100%; height:36px; border-radius:18px; font-weight:500; font-size:13px; cursor:pointer;">Envoyer l'idée</button>
        </div>
    `;

    mainRender.innerHTML = html;

    // Save articles temporairement sur window pour la modale d'info si besoin
    window.articlesProfilActuels = articlesAfficher;

    // ==========================================================================
    // 🖼️ EXTRACTION ET INJECTION DES IMAGES AVEC TA MÉTHODE EXACTE DE L'ACCUEIL
    // ==========================================================================
    articlesAfficher.forEach((prod, index) => {
        const domId = `img-catalogue-global-${prod.boutiqueId || 'shop'}-${index}`;
        const nomImageCorrect = prod.image || prod.imageNom || "";
        
        if (typeof chargerImageBoutiqueOuArticle === 'function') {
            chargerImageBoutiqueOuArticle(prod.boutiqueId, nomImageCorrect, domId);
        }
    });
}

// Fonction pour augmenter la pagination de 100 en 100
function chargerPlusDArticlesProfil() {
    limiteArticlesAffichage += 100;
    genererEcranProfil();
}

// Version modale d'aperçu dédiée à cet écran au cas où l'utilisateur clique sur "Prendre"
window.ouvrirApercuProduitProfil = function(indexLocal, originImgId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const prod = window.articlesProfilActuels[indexLocal];
    if (!prod) return;

    const srcImageOrigine = document.getElementById(originImgId)?.src || '';
    const boutiquesSource = (typeof toutesLesBoutiques !== 'undefined') ? toutesLesBoutiques : [];
    const boutiqueComplete = boutiquesSource.find(b => b.id_boutique === prod.boutiqueId) || {};
    
    const nomLogoAttendu = boutiqueComplete.logo_entreprise || (prod.boutiqueId ? `logo_${prod.boutiqueId.toLowerCase()}.jpg` : "");
    const domLogoModalId = `modal-logo-profil-${prod.boutiqueId || 'shop'}`;

    const ancienneModale = document.getElementById('product-preview-modal');
    if (ancienneModale) ancienneModale.remove();

    const overlay = document.createElement('div');
    overlay.id = 'product-preview-modal';
    overlay.style = `
        position:fixed; top:0; left:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.75); z-index:99999; display:flex; 
        align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px);
    `;

    overlay.innerHTML = `
        <div style="background:#fff; width:100%; max-width:360px; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.3); position:relative; display:flex; flex-direction:column;">
            <button onclick="document.getElementById('product-preview-modal').remove()" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.9); border:none; width:32px; height:32px; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:100; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                <i class="fa-solid fa-xmark" style="font-size:16px;"></i>
            </button>
            <div style="width:100%; aspect-ratio:1/1; background:#f1f3f4; overflow:hidden;">
                <img src="${srcImageOrigine}" alt="${prod.designation}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding:16px; display:flex; flex-direction:column; gap:12px;">
                <div>
                    <span style="font-size:18px; font-weight:700; color:#0046ad; display:block; margin-bottom:4px;">${prod.prix} ${prod.devise || 'USD'}</span>
                    <h2 style="font-size:14px; font-weight:600; color:#1c1e21; margin:0; line-height:1.4;">${prod.designation}</h2>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="if(typeof ouvrirDiscussionWhatsApp === 'function') ouvrirDiscussionWhatsApp('${prod.boutiqueTel || boutiqueComplete.telephone || ''}', '${encodeURIComponent(prod.designation)}', '${prod.prix}')" style="flex:1; background:#25D366; color:#fff; border:none; height:40px; border-radius:8px; font-size:12px; font-weight:700; display:flex; justify-content:center; align-items:center; gap:6px; cursor:pointer;">
                        <i class="fa-brands fa-whatsapp" style="font-size:16px;"></i> WhatsApp
                    </button>
                    <button onclick="if(typeof partagerContenuDirect === 'function') partagerContenuDirect('produit', '${prod.id_article}', '${encodeURIComponent(prod.designation)}', '${prod.prix}', '${prod.boutiqueId}')" style="background:#f1f3f4; border:none; width:40px; height:40px; border-radius:8px; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
                <div style="border-top:1px solid #dadce0; margin:4px 0;"></div>
                <div onclick="document.getElementById('product-preview-modal').remove(); if(typeof filtrerArticlesParBoutique === 'function') filtrerArticlesParBoutique('${prod.boutiqueId}');" style="display:flex; align-items:center; justify-content:space-between; background:#f8f9fa; padding:10px; border-radius:8px; cursor:pointer; border:1px solid #dadce0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:#fff; border:1px solid #dadce0; overflow:hidden;">
                            <img id="${domLogoModalId}" src="" style="width:100%; height:100%; object-fit:cover; border-radius:50%; opacity:0; transition:opacity 0.2s;">
                        </div>
                        <div>
                            <h4 style="font-size:12px; font-weight:700; color:#1c1e21; margin:0;">${prod.boutiqueNom || boutiqueComplete.nom || 'Boutique'}</h4>
                            <span style="font-size:10px; color:#0046ad; font-weight:600;">Visiter le Vendeur <i class="fa-solid fa-chevron-right" style="font-size:8px;"></i></span>
                        </div>
                    </div>
                    <i class="fa-solid fa-store" style="color:#5f6368;"></i>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    if (prod.boutiqueId && nomLogoAttendu && typeof chargerImageBoutiqueOuArticle === 'function') {
        chargerImageBoutiqueOuArticle(prod.boutiqueId, nomLogoAttendu, domLogoModalId);
    }
};

/* ==========================================================================
   PASSERELLES INTERACTIVES & INTERVENTIONS GLOBALISÉES
   ========================================================================== */

window.executerClicAnnonceur = function(typeLien, cibleLien) {
    if (!cibleLien) return;

    if (typeLien === 'interne') {
        const boutiqueExiste = toutesLesBoutiques.some(b => b.id_boutique === cibleLien);
        if (boutiqueExiste) {
            window.filtrerArticlesParBoutique(cibleLien);
        } else {
            window.afficherGbAlerte(`La boutique '${cibleLien}' n'est pas disponible en local.`);
        }
    } else {
        window.open(cibleLien, '_blank');
    }
};

/**
 * 2 et 3. Partage des articles et des annonces (Dossiers virtuels Article/ et Annonce/)
 */
window.partagerContenuDirect = function(type, idElement, metadataNom, optionnelPrix, idBoutique = "0") {
    const nomNettoye = decodeURIComponent(metadataNom);
    let textePartage = '';
    const baseUri = "https://gogamenetiqui.github.io/Go-Buznes";
    
    if (type === 'produit') {
        // --- 🌟 SÉCURITÉ DE L'ID BOUTIQUE ---
        // Si l'idBoutique reçu est "0" ou non défini, on essaie de récupérer dynamiquement l'id de la boutique active globale (si disponible dans ton app)
        let boutiqueIdValide = idBoutique;
        if ((boutiqueIdValide === "0" || !boutiqueIdValide) && window.boutiqueActuelleId) {
            boutiqueIdValide = window.boutiqueActuelleId;
        }

        // Structure propre et définitive : base/Article/id_boutique/id_article
        const lienProduit = `${baseUri}/Article/${boutiqueIdValide}/${idElement}`;
        textePartage = `🔥 *Regarde ce que j'ai trouvé sur Go Buznes !*\n\n👉 *${nomNettoye}*\n💰 Prix : *${optionnelPrix} USD*\n\nDécouvre cet article complet ici :\n🔗 ${lienProduit}`;
    } else {
        // Structure propre : base/Annonce/id_annonce
        const lienAnnonce = `${baseUri}/Annonce/${idElement}`;
        textePartage = `📢 *Annonce Importante de ${nomNettoye} via Go Buznes Goma !*\n\nConsultez l'affiche et le descriptif complet via ce lien direct :\n🔗 ${lienAnnonce}`;
    }

    if (navigator.share) {
        navigator.share({
            title: 'Partage Go Buznes',
            text: textePartage
        }).catch(err => console.log("Partage annulé", err));
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(textePartage)}`, '_blank');
    }
};


window.filtrerArticlesParBoutique = function(shopId) {
    const produitsFiltres = tousLesProduits.filter(p => p.boutiqueId === shopId);
    naviguerVersPage('home');
    genererEcranAccueil(produitsFiltres);
};

window.ouvrirDiscussionWhatsApp = function(tel, designation, prix) {
    const texte = decodeURIComponent(designation);
    const msg = `Bonjour, je suis intéressé par l'article *${texte}* affiché au prix de *${prix} USD* sur l'application *Go Buznes*. Est-il toujours disponible ?`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Interceptions de soumissions avec confirmation visuelle GB centrale
window.confirmerDemandeVitrine = function() {
    const nom = document.getElementById('form-shop-name').value.trim();
    const adr = document.getElementById('form-shop-address').value.trim();
    
    if (!nom || !adr) { 
        window.afficherGbAlerte("Veuillez remplir toutes les cases."); 
        return; 
    }
    
    window.afficherGbConfirmation("Voulez-vous soumettre votre demande de vitrine à Netiqui ?", () => {
        const msg = `🚀 *DEMANDE DE VITRINE GO BUZNES*\n\nJe souhaite ajouter ma boutique sur la plateforme.\nNom : *${nom}*\nAdresse : *${adr}*`;
        window.open(`https://wa.me/${NUMERO_NETIQUI}?text=${encodeURIComponent(msg)}`, '_blank');
    });
};

window.confirmerSuggestion = function() {
    const text = document.getElementById('input-suggestion').value.trim();
    
    if (!text) { 
        window.afficherGbAlerte("Veuillez écrire un texte."); 
        return; 
    }
    
    window.afficherGbConfirmation("Confirmez-vous l'envoi de cette idée à l'équipe Netiqui ?", () => {
        const msg = `💡 *SUGGESTION UTILISATEUR GO BUZNES*\n\n"${text}"`;
        window.open(`https://wa.me/${NUMERO_NETIQUI}?text=${encodeURIComponent(msg)}`, '_blank');
        document.getElementById('input-suggestion').value = '';
    });
};

// Variable globale pour stocker l'historique dans la session de l'application
if (typeof window.historiqueRecherche === 'undefined') window.historiqueRecherche = [];

// ==========================================================================
// 🚀 ÉCOUTEUR PRINCIPAL (Chargement ordonné de l'application)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestion native et prioritaire des onglets de navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            window.fermerFenetreRecherche();
            naviguerVersPage(tab.getAttribute('data-page'));
        });
    });

    // 2. Initialisation principale de ton application en premier
    initialiserApp();

    // 3. Initialisation de la recherche en tout dernier pour ne rien bloquer
    if (typeof window.initialiserRechercheAutonome === 'function') {
        window.initialiserRechercheAutonome();
    }
});

// Variable globale pour stocker l'historique dans la session de l'application
if (typeof window.historiqueRecherche === 'undefined') window.historiqueRecherche = [];

// ==========================================================================
// 🔍 MODULE DE RECHERCHE AUTONOME (Version Fix Image Modale)
// ==========================================================================
window.initialiserRechercheAutonome = function() {
    const inputSearch = document.getElementById('main-search');
    if (!inputSearch) return;

    const cloneInput = inputSearch.cloneNode(true);
    inputSearch.parentNode.replaceChild(cloneInput, inputSearch);

    cloneInput.addEventListener('focus', () => {
        if (cloneInput.value.toLowerCase().trim() === '') {
            window.rendreFenetreRecherche([], true);
        }
    });

    cloneInput.addEventListener('input', (e) => {
        const terme = e.target.value.toLowerCase().trim();
        
        if (terme === '') {
            window.rendreFenetreRecherche([], true);
            return;
        }

        const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];
        const produitsFiltres = produitsSource.filter(p => 
            (p.designation || '').toLowerCase().includes(terme) || 
            (p.boutiqueNom || '').toLowerCase().includes(terme)
        );

        if (produitsFiltres.length > 0 && !window.historiqueRecherche.includes(terme) && terme.length > 2) {
            window.historiqueRecherche.unshift(terme);
            if (window.historiqueRecherche.length > 5) window.historiqueRecherche.pop();
        }

        window.rendreFenetreRecherche(produitsFiltres, false, terme);
    });

    document.addEventListener('click', (e) => {
        const conteneurRecherche = document.getElementById('search-dropdown-container');
        if (conteneurRecherche && !conteneurRecherche.contains(e.target) && e.target !== cloneInput) {
            window.fermerFenetreRecherche();
        }
    });
};

/**
 * Rendu graphique du Dropdown (Format liste compacte)
 */
window.rendreFenetreRecherche = function(resultats, afficherHistorique = false, terme = '') {
    const inputSearch = document.getElementById('main-search');
    if (!inputSearch) return;

    let conteneur = document.getElementById('search-dropdown-container');
    
    if (!conteneur) {
        conteneur = document.createElement('div');
        conteneur.id = 'search-dropdown-container';
        conteneur.style = `
            position: absolute; top: ${inputSearch.offsetTop + inputSearch.offsetHeight + 6}px; 
            left: ${inputSearch.offsetLeft}px; width: ${inputSearch.offsetWidth}px; 
            max-height: 280px; background: #fff; border: 1px solid #dadce0; border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.12); z-index: 9999; overflow-y: auto; 
            box-sizing: border-box; padding: 10px; display: flex; flex-direction: column; gap: 8px;
        `;
        inputSearch.parentNode.appendChild(conteneur);
    }

    let html = '';

    if (afficherHistorique) {
        if (window.historiqueRecherche.length === 0) {
            html = `<div style="font-size: 11px; color: #5f6368; padding: 6px; text-align: center;">Aucune recherche récente.</div>`;
        } else {
            html = `<div style="font-size: 11px; font-weight: 700; color: #5f6368; text-transform: uppercase; padding-bottom: 2px;">Recherches récentes</div>`;
            html += `<div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 0;">`;
            window.historiqueRecherche.forEach(h => {
                html += `
                    <span onclick="document.getElementById('main-search').value='${h}'; document.getElementById('main-search').dispatchEvent(new Event('input'));" 
                          style="font-size: 11px; background: #f1f3f4; color: #1c1e21; padding: 4px 10px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 500;">
                        <i class="fa-solid fa-clock-rotate-left" style="font-size: 9px; color: #5f6368;"></i> ${h}
                    </span>`;
            });
            html += `</div>`;
        }
        conteneur.innerHTML = html;
        return;
    }

    html = `<div style="font-size: 11px; font-weight: 700; color: #5f6368; text-transform: uppercase; border-bottom: 1px solid #f1f3f4; padding-bottom: 4px;">Suggestions (${resultats.length})</div>`;

    if (resultats.length === 0) {
        html += `<div style="font-size: 12px; color: #5f6368; text-align: center; padding: 12px;">Aucun résultat pour "${terme}"</div>`;
    } else {
        const maxSuggestions = resultats.slice(0, 5);
        window.stockRechercheIsole = maxSuggestions;

        maxSuggestions.forEach((prod, index) => {
            const domId = `img-search-dropdown-${prod.boutiqueId || 'shop'}-${index}`;
            
            html += `
                <div onclick="window.ouvrirApercuDepuisDropdown(${index}, '${domId}', event)" 
                     style="display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 8px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid #f8f9fa;">
                    
                    <div style="width: 36px; height: 36px; border-radius: 6px; background: #f1f3f4; overflow: hidden; flex-shrink: 0;">
                        <img id="${domId}" src="" alt="" style="width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.2s;">
                    </div>

                    <div style="flex: 1; overflow: hidden;">
                        <h4 style="font-size: 12px; font-weight: 600; margin: 0; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prod.designation}</h4>
                        <span style="font-size: 10px; color: #5f6368;">${prod.boutiqueNom || 'Boutique'}</span>
                    </div>

                    <div style="font-size: 11px; font-weight: 700; color: #0046ad; white-space: nowrap;">
                        ${prod.prix} ${prod.devise || 'USD'}
                    </div>
                </div>
            `;
        });
    }

    conteneur.innerHTML = html;

    if (resultats.length > 0) {
        resultats.slice(0, 5).forEach((prod, index) => {
            const domId = `img-search-dropdown-${prod.boutiqueId || 'shop'}-${index}`;
            const nomImageCorrect = prod.image || prod.imageNom || "";
            if (typeof chargerImageBoutiqueOuArticle === 'function') {
                chargerImageBoutiqueOuArticle(prod.boutiqueId, nomImageCorrect, domId);
            }
        });
    }
};

/**
 * Ferme proprement le dropdown
 */
window.fermerFenetreRecherche = function() {
    const conteneur = document.getElementById('search-dropdown-container');
    if (conteneur) conteneur.remove();
};

/**
 * Passerelle ultra-sécurisée et synchronisée pour les images
 */
window.ouvrirApercuDepuisDropdown = function(indexLocal, originImgId, event) {
    if (!window.stockRechercheIsole || !window.stockRechercheIsole[indexLocal]) return;
    
    // 1. Sauvegarde de secours du fil d'actualité de l'accueil
    const sauvegardeSecoursAccueil = window.articlesBonnesAffairesActuels;
    
    // 2. Assigner les résultats de recherche à la variable globale lue par ta modale
    window.articlesBonnesAffairesActuels = window.stockRechercheIsole;
    
    // 3. Déclencher d'abord l'ouverture de ta modale native PENDANT que l'image existe encore
    if (typeof window.ouvrirApercuProduit === 'function') {
        window.ouvrirApercuProduit(indexLocal, originImgId, event);
    }
    
    // 4. FERMETURE DIFFÉRÉE : On attend 50ms pour laisser à ta fonction native le temps 
    // de cloner/lire la balise image avant de supprimer le conteneur de recherche du DOM.
    setTimeout(() => {
        window.fermerFenetreRecherche();
    }, 50);
    
    // 5. Restauration propre de la mémoire de l'accueil
    setTimeout(() => {
        window.articlesBonnesAffairesActuels = sauvegardeSecoursAccueil;
    }, 200);
};

// ==========================================================================
// 🚀 FONCTION GLOBALE UNIQUE : VISITER / FILTRER PAR BOUTIQUE
// ==========================================================================
window.filtrerArticlesParBoutique = function(idBoutique) {
    if (!idBoutique) {
        console.error("Erreur Netiqui : ID Boutique manquant.");
        return;
    }

    // 1. Récupération des sources de données globales
    const produitsSource = (typeof tousLesProduits !== 'undefined') ? tousLesProduits : [];
    const boutiquesSource = (typeof toutesLesBoutiques !== 'undefined') ? toutesLesBoutiques : [];
    
    // 2. Trouver les infos de la boutique cible
    const boutiqueCible = boutiquesSource.find(b => b.id_boutique === idBoutique);
    const nomBoutique = boutiqueCible ? boutiqueCible.nom : "Boutique";

    // 3. Filtrer les articles correspondants
    const articlesFiltres = produitsSource.filter(p => p.boutiqueId === idBoutique);

    // 4. Cibler le conteneur principal de rendu
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    // 5. Gestion visuelle des onglets de ton app.js (Ajuste les IDs selon ton menu)
    // Exemple : Activer l'onglet "Rayon" ou "Articles" et éteindre les autres
    const onglets = document.querySelectorAll('.nav-tab, .footer-icon'); // Modifie la classe selon ton code
    onglets.forEach(tab => tab.classList.remove('active')); 
    
    // 6. Génération de l'écran du Rayon de la Boutique
    let htmlRayon = `
        <div style="display:flex; flex-direction:column; gap:16px; width:100%;">
            
            <div style="background:#fff; border:1px solid #dadce0; border-radius:12px; padding:16px; display:flex; align-items:center; gap:12px; box-shadow:0 1px 2px rgba(0,0,0,0.05); position:relative;">
                <button onclick="if(typeof genererEcranBoutiques === 'function') { genererEcranBoutiques(toutesLesBoutiques); } else { history.back(); }" 
                        style="position:absolute; top:12px; right:12px; background:#f1f3f4; border:none; width:28px; height:28px; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                    <i class="fa-solid fa-arrow-left" style="font-size:12px;"></i>
                </button>

                <div style="width:50px; height:50px; border-radius:50%; background:#f1f3f4; overflow:hidden; border:2px solid #0046ad; flex-shrink:0;">
                    <img id="rayon-logo-${idBoutique}" src="" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div>
                    <h2 style="font-size:16px; font-weight:800; color:#1c1e21; margin:0 0 2px 0;">${nomBoutique}</h2>
                    <span style="font-size:11px; color:#0046ad; background:#e8f0fe; padding:2px 8px; border-radius:6px; font-weight:700;">
                        ${articlesFiltres.length} article${articlesFiltres.length > 1 ? 's' : ''} disponible${articlesFiltres.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div id="grid-rayon-boutique" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
    `;

    if (articlesFiltres.length === 0) {
        htmlRayon += `
            <div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:#5f6368; font-size:13px;">
                <i class="fa-solid fa-box-open" style="font-size:30px; display:block; margin-bottom:10px; opacity:0.4;"></i>
                Cette boutique n'a aucun article exposé pour le moment.
            </div>
        `;
    } else {
        articlesFiltres.forEach((prod, index) => {
            const domId = `img-rayon-${idBoutique}-${index}`;
            
            // On utilise la même structure propre avec le bouton d'information qui marche à 100%
            htmlRayon += `
                <div style="background:#fff; border:1px solid #dadce0; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                    <div style="position:relative; width:100%; aspect-ratio:1/1; background:#f1f3f4;">
                        <img id="${domId}" src="" alt="${prod.designation}" style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.2s;">
                    </div>
                    <div style="padding:8px; display:flex; flex-direction:column; gap:4px; justify-content:space-between; flex:1;">
                        <div>
                            <h3 style="font-size:12px; font-weight:600; margin:0; color:#1c1e21; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.designation}</h3>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                            <span style="font-size:12px; font-weight:700; color:#0046ad; flex:1;">${prod.prix} ${prod.devise || 'USD'}</span>
                            
                            <button onclick="window.ouvrirApercuProduitDuRayon(${index}, '${domId}', '${idBoutique}', event)" 
                                    style="background:#e8f0fe; color:#0046ad; border:none; padding:5px 10px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">
                                Info
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    htmlRayon += `</div></div>`;
    mainRender.innerHTML = htmlRayon;

    // 7. Remonter automatiquement l'écran vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 8. Chargement du logo de l'en-tête du rayon
    const logoCorrect = boutiqueCible?.logo_entreprise || `logo_${idBoutique.toLowerCase()}.jpg`;
    if (typeof chargerImageBoutiqueOuArticle === 'function') {
        chargerImageBoutiqueOuArticle(idBoutique, logoCorrect, `rayon-logo-${idBoutique}`);
    }

    // 9. Chargement des images de la grille du rayon
    if (articlesFiltres.length > 0) {
        articlesFiltres.forEach((prod, index) => {
            const domId = `img-rayon-${idBoutique}-${index}`;
            const nomImageCorrect = prod.image || prod.imageNom || "";
            if (typeof chargerImageBoutiqueOuArticle === 'function') {
                chargerImageBoutiqueOuArticle(idBoutique, nomImageCorrect, domId);
            }
        });
    }

    // Sauvegarde locale temporaire pour la modale info dédiée au rayon
    window.articlesDuRayonActuel = articlesFiltres;
};

// ==========================================================================
// 💥 ADAPTATION DE LA MODALE INFO POUR LE RAYON UNIQUE
// ==========================================================================
window.ouvrirApercuProduitDuRayon = function(indexLocal, originImgId, idBoutique, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const prod = window.articlesDuRayonActuel[indexLocal];
    if (!prod) return;

    const srcImageOrigine = document.getElementById(originImgId)?.src || '';
    const boutiquesSource = (typeof toutesLesBoutiques !== 'undefined') ? toutesLesBoutiques : [];
    const boutiqueComplete = boutiquesSource.find(b => b.id_boutique === idBoutique) || {};
    const domLogoModalId = `modal-logo-rayon-${idBoutique}`;

    const ancienneModale = document.getElementById('product-preview-modal');
    if (ancienneModale) ancienneModale.remove();

    const overlay = document.createElement('div');
    overlay.id = 'product-preview-modal';
    overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px);`;

    overlay.innerHTML = `
        <div style="background:#fff; width:100%; max-width:360px; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.3); position:relative; display:flex; flex-direction:column;">
            <button onclick="document.getElementById('product-preview-modal').remove()" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.9); border:none; width:32px; height:32px; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:100;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div style="width:100%; aspect-ratio:1/1; background:#f1f3f4; overflow:hidden;">
                <img src="${srcImageOrigine}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding:16px; display:flex; flex-direction:column; gap:12px;">
                <div>
                    <span style="font-size:18px; font-weight:700; color:#0046ad; display:block; margin-bottom:4px;">${prod.prix} ${prod.devise || 'USD'}</span>
                    <h2 style="font-size:14px; font-weight:600; color:#1c1e21; margin:0; line-height:1.4;">${prod.designation}</h2>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="if(typeof ouvrirDiscussionWhatsApp === 'function') ouvrirDiscussionWhatsApp('${prod.boutiqueTel || boutiqueComplete.telephone || ''}', '${encodeURIComponent(prod.designation)}', '${prod.prix}')" style="flex:1; background:#25D366; color:#fff; border:none; height:40px; border-radius:8px; font-size:12px; font-weight:700; display:flex; justify-content:center; align-items:center; gap:6px; cursor:pointer;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </button>
                    <button onclick="if(typeof partagerContenuDirect === 'function') partagerContenuDirect('produit', '${prod.id_article}', '${encodeURIComponent(prod.designation)}', '${prod.prix}', '${idBoutique}')" style="background:#f1f3f4; border:none; width:40px; height:40px; border-radius:8px; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
                <div style="border-top:1px solid #dadce0; margin:4px 0;"></div>
                <div onclick="document.getElementById('product-preview-modal').remove();" style="display:flex; align-items:center; justify-content:space-between; background:#f8f9fa; padding:10px; border-radius:8px; border:1px solid #dadce0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:#fff; border:1px solid #dadce0; overflow:hidden;">
                            <img id="${domLogoModalId}" src="" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
                        </div>
                        <div>
                            <h4 style="font-size:12px; font-weight:700; color:#1c1e21; margin:0;">${prod.boutiqueNom || boutiqueComplete.nom || 'Boutique'}</h4>
                            <span style="font-size:10px; color:#5f6368;">Vous êtes dans son rayon</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-store" style="color:#0046ad;"></i>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const logoCorrect = boutiqueComplete.logo_entreprise || `logo_${idBoutique.toLowerCase()}.jpg`;
    if (typeof chargerImageBoutiqueOuArticle === 'function') {
        chargerImageBoutiqueOuArticle(idBoutique, logoCorrect, domLogoModalId);
    }
};

// ==========================================================================
// ↩️ SYSTÈME DE NAVIGATION RETOUR INTELLIGENT & MODALE QUITTER
// ==========================================================================
(function initialiserNavigationRetour() {
    // Étape 1 : Intercepter le bouton retour du navigateur / téléphone
    window.addEventListener('popstate', (evenement) => {
        // A. Si le dropdown de recherche est ouvert, le bouton retour le ferme en priorité
        const conteneurRecherche = document.getElementById('search-dropdown-container');
        if (conteneurRecherche) {
            window.fermerFenetreRecherche();
            window.history.pushState({ site: 'gobuznes' }, ''); // Réinitialise la pile
            return;
        }

        // B. Si une modale de produit (aperçu) est ouverte, le bouton retour la ferme
        const modaleProduit = document.getElementById('votre-id-modale-produit'); // Ajuste l'ID selon ton app
        if (modaleProduit && modaleProduit.style.display !== 'none') {
            // Appelle ta fonction native pour fermer la modale d'aperçu
            if (typeof window.fermerApercuProduit === 'function') {
                window.fermerApercuProduit();
            } else {
                modaleProduit.style.display = 'none';
            }
            window.history.pushState({ site: 'gobuznes' }, ''); // Réinitialise la pile
            return;
        }

        // C. Si l'utilisateur est au point mort (Accueil), on affiche ta modale personnalisée pour quitter
        afficherAlerteQuitterStylisee();
    });

    // On initialise une première étape pour pouvoir capturer le premier clic "Retour"
    window.history.pushState({ site: 'gobuznes' }, '');
})();

/**
 * Génère et affiche la boîte de confirmation stylisée avec tes classes CSS
 */
function afficherAlerteQuitterStylisee() {
    // Éviter les doublons
    if (document.getElementById('gb-alert-quitter-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gb-alert-quitter-overlay';
    // Style de l'arrière-plan de l'alerte
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.45); z-index: 10001;
        display: flex; align-items: center; justify-content: center; padding: 20px;
        box-sizing: border-box;
    `;

    // Boîte de dialogue interne utilisant exactement tes classes CSS
    overlay.innerHTML = `
        <div style="background: #ffffff; width: 100%; max-width: 320px; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); box-sizing: border-box; text-align: center;">
            <div class="gb-alert-text">Voulez-vous vraiment quitter l'application Go Buznes ?</div>
            <div class="gb-alert-actions">
                <button class="gb-alert-btn gb-alert-btn-secondary" id="btn-alerte-annuler">Annuler</button>
                <button class="gb-alert-btn gb-alert-btn-primary" id="btn-alerte-quitter">Quitter</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Action : Annuler
    document.getElementById('btn-alerte-annuler').addEventListener('click', () => {
        overlay.remove();
        // On remet un jeton dans l'historique pour que le bouton retour fonctionne au coup suivant
        window.history.pushState({ site: 'gobuznes' }, '');
    });

    // Action : Confirmer et Quitter
    document.getElementById('btn-alerte-quitter').addEventListener('click', () => {
        overlay.remove();
        if (navigator.app && navigator.app.exitApp) {
            navigator.app.exitApp(); // Fermeture propre sur Android/WebView Cordova
        } else {
            window.location.href = "about:blank"; // Redirection de secours
        }
    });
}

/**
 * AJOUT SÉCURITÉ : À appeler dans tes autres scripts chaque fois que l'utilisateur 
 * ouvre manuellement un écran ou un produit depuis un bouton de l'application.
 */
window.enregistrerEtapeHistorique = function() {
    window.history.pushState({ site: 'gobuznes' }, '');
};