import { chargerDonneesVendeurs } from './data.js';
// AJOUTEZ JUSTE 'export' ICI
export async function initialiserApp() {
    const dataBrute = await chargerDonneesVendeurs();
    // ... tout le reste de votre code reste identique ...
let tousLesProduits = [];
let toutesLesBoutiques = [];
let boutiqueSelectionnee = null;
const NUMERO_NETIQUI = "243998159146";
const LOGO_NETIQUI = "netiqui_logo.png";

// --- STATS ---
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

// --- INITIALISATION PRINCIPALE ---
async function initialiserApp() {
    const dataBrute = await chargerDonneesVendeurs();
    const maintenant = new Date();

    // 1. Filtrage des boutiques actives
    toutesLesBoutiques = dataBrute.filter(b => {
        if (!b.affichage || !b.affichage.date_fin) return false;
        const dateFinApp = new Date(b.affichage.date_fin);
        return maintenant < dateFinApp;
    });

    // 2. Traitement des données et Badges
    toutesLesBoutiques.forEach(b => {
        b.capital = b.produits.reduce((sum, p) => sum + (parseFloat(p.prix_num) || 0), 0);
        const dateFinBadge = b.affichage?.badge_fin ? new Date(b.affichage.badge_fin) : null;
        const aUnBadgeActif = dateFinBadge ? maintenant < dateFinBadge : false;
        b.badgeType = aUnBadgeActif ? (b.affichage.type_badge || 'bleu') : null;
        b.isVerifie = aUnBadgeActif;
    });

    // 3. Tri
    toutesLesBoutiques.sort((a, b) => {
        if (a.badgeType === 'or' && b.badgeType !== 'or') return -1;
        if (a.badgeType !== 'or' && b.badgeType === 'or') return 1;
        if (a.badgeType === 'bleu' && !b.badgeType) return -1;
        if (!a.badgeType && b.badgeType === 'bleu') return 1;
        return b.capital - a.capital;
    });

    // 4. Mise à plat des produits
    const tempProducts = toutesLesBoutiques.flatMap(b =>
        b.produits.map(p => ({
            ...p,
            storeName: b.infos.nom,
            storeLogo: b.infos.logo,
            storeIsVerifie: b.isVerifie,
            storeBadgeType: b.badgeType,
            storeTel: b.infos.telephone,
            storeDesc: b.infos.description_courte,
            storeSpec: b.infos.specialite,
            storeAddr: b.infos.adresse || "Goma,Nord-Kivu, RDC",
            imgList: p.images || (p.image ? [p.image] : [])
        }))
    );

    const setUnique = new Set();
    tousLesProduits = tempProducts.filter(p => {
        const identifier = `${p.nom}-${p.storeName}`.toLowerCase().trim();
        if (setUnique.has(identifier)) return false;
        setUnique.add(identifier);
        return true;
    });

    const displayCount = document.getElementById('total-articles-display');
    if(displayCount) displayCount.innerText = `+${tousLesProduits.length} Articles à Goma`;

    mettreAJourStatsHeader();
    activerNavigation();
    setupSearch();

    // --- LECTURE DU LIEN PARTAGÉ (Vendeur et Produit) ---
    const params = new URLSearchParams(window.location.search);
    const nomBoutiqueLien = params.get('v');
    const nomProduitLien = params.get('p');

    if (nomBoutiqueLien) {
        const boutiqueTrouvee = toutesLesBoutiques.find(b => b.infos.nom === nomBoutiqueLien);

        if (boutiqueTrouvee) {
            boutiqueSelectionnee = boutiqueTrouvee;

            // On navigue d'abord vers le profil du vendeur
            naviguerVers('profil');

            // --- VÉRIFICATION DU PRODUIT (p=...) ---
            if (nomProduitLien) {
                const idxProduit = tousLesProduits.findIndex(item =>
                    item.nom.toLowerCase().trim() === nomProduitLien.toLowerCase().trim() &&
                    item.storeName === nomBoutiqueLien
                );

                if (idxProduit !== -1) {
                    // On ouvre la modale par-dessus le profil
                    window.ouvrirModaleProduit(idxProduit);
                }
            }

            // Nettoyage de l'URL pour éviter les réouvertures au rafraîchissement
            window.history.replaceState({}, document.title, window.location.pathname);
            return; // On arrête ici, le travail est fait
        }
    }

    // --- CHARGEMENT NORMAL (Si pas de lien vendeur valide) ---
    naviguerVers('home');
}
// --- RENDU PRODUITS ---
function renderProductCard(p) {
    const globalIdx = tousLesProduits.findIndex(item => item.nom === p.nom && item.storeName === p.storeName);
    const imgSrc = (p.imgList && p.imgList.length > 0) ? p.imgList[0] : (p.image || '');
    const badgeColor = p.storeBadgeType === 'or' ? 'var(--gold)' : '#0ea5e9';
    const badgeIcon = p.storeBadgeType === 'or' ? 'fa-crown' : 'fa-circle-check';

    return `
        <div class="product-card" onclick="window.ouvrirModaleProduit(${globalIdx})">
            <div class="gb-skeleton" style="background: #f0f0f0; height:150px;">
                <img src="${imgSrc}" class="product-img" onload="this.classList.add('loaded'); this.parentElement.style.background='none';" style="opacity:0; transition:0.3s; width:100%; height:150px; object-fit:cover;">
            </div>
            <div style="padding:10px;">
                <span style="font-size:9px; background:#f0f0f0; padding:2px 5px; border-radius:4px; color:#666;">${p.categorie}</span>
                <h3 style="font-size:12px; margin:5px 0; height:34px; overflow:hidden;">${p.nom}</h3>
                <p class="price" style="color:var(--gold); font-weight:700;">${p.prix_num} USD</p>
                <div style="display:flex; align-items:center; gap:4px; margin-top:5px;">
                    <small style="font-size:10px; color:#888;">${p.storeName}</small>
                    ${p.storeIsVerifie ? `<i class="fa-solid ${badgeIcon}" style="color:${badgeColor}; font-size:10px;"></i>` : ''}
                </div>
            </div>
        </div>`;
}

// --- NAVIGATION ---
function naviguerVers(pageId) {
    const render = document.getElementById('main-render');
    if (!render) return;
    render.innerHTML = "";
    window.scrollTo(0, 0);

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if (n.dataset.page === pageId) n.classList.add('active');
    });

    switch (pageId) {
        case 'home':
            const boutiquesBoostees = toutesLesBoutiques.filter(b => b.badgeType);
            render.innerHTML = `
                <div class="section-label" style="margin: 15px 15px 5px;"><i class="fa-solid fa-bolt" style="color:var(--gold);"></i> Boutiques à la une</div>
                <div class="stories-bar" style="display:flex; gap:12px; overflow-x:auto; padding:10px 15px; background:#fff; scrollbar-width:none;">
                    ${boutiquesBoostees.map(b => renderStoryItem(b)).join('')}
                </div>
                <div class="categories" id="categories-container"></div>
                <section class="section-container">
                    <div class="section-header"><h2><i class="fa-solid fa-ranking-star" style="color:var(--gold);"></i> Classement Capital</h2></div>
                    <div class="grid-stores" id="boutiques-container"></div>
                </section>
                <section class="section-container">
                    <div class="section-header"><h2><i class="fa-solid fa-fire" style="color:#ff4500;"></i> Bonnes Affaires</h2></div>
                    <div class="grid-products">
                        ${tousLesProduits.filter(p => p.prix_num <= 20).slice(0, 700).map(p => renderProductCard(p)).join('')}
                    </div>
                </section>`;
            genererCategories();
            afficherBoutiquesPopulaires();
            break;

        case 'stores':
            render.innerHTML = `
                <div class="section-header"><h2><i class="fa-solid fa-shop"></i> Annuaire Vendeurs</h2></div>
                <div class="list-vertical">
                    ${toutesLesBoutiques.map(b => {
                const bColor = b.badgeType === 'or' ? 'var(--gold)' : '#0ea5e9';
                const bIcon = b.badgeType === 'or' ? 'fa-crown' : 'fa-certificate';
                return `
                        <div class="store-item-large" onclick="window.selectionnerBoutique('${b.infos.nom}')">
                            <img src="${b.infos.logo}" class="mini-logo" style="border: 2px solid ${b.badgeType ? bColor : '#eee'}">
                            <div class="store-info">
                                <h3 style="font-size:14px;">${b.infos.nom} ${b.isVerifie ? `<i class="fa-solid ${bIcon}" style="color:${bColor};"></i>` : ''}</h3>
                                <p style="font-size:11px; color:gray;"><i class="fa-solid fa-tags"></i> ${b.infos.specialite}</p>
                            </div>
                            <i class="fa-solid fa-circle-chevron-right" style="color:var(--gold); margin-left:auto; font-size:20px;"></i>
                        </div>`;
            }).join('')}
                </div>`;
            break;

        case 'biens':
            render.innerHTML = `<div class="section-header"><h2><i class="fa-solid fa-layer-group"></i> Catalogue Complet</h2></div><div class="grid-products">${tousLesProduits.map(p => renderProductCard(p)).join('')}</div>`;
            break;

        case 'vendre':
            renderVendre(render);
            break;

        case 'profil':
            renderProfil(render);
            break;
    }
}

function renderStoryItem(b) {
    const col = b.badgeType === 'or' ? 'var(--gold)' : '#0ea5e9';
    return `
        <div onclick="window.selectionnerBoutique('${b.infos.nom}')" style="text-align:center; min-width:65px; cursor:pointer;">
            <div style="width:62px; height:62px; border-radius:50%; border:2.5px solid ${col}; padding:2px; position:relative; background:white;">
                <img src="${b.infos.logo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                <i class="fa-solid ${b.badgeType === 'or' ? 'fa-crown' : 'fa-circle-check'}" style="position:absolute; bottom:-2px; right:-2px; background:white; border-radius:50%; font-size:12px; color:${col}; padding:1px;"></i>
            </div>
            <p style="font-size:9px; margin-top:6px; font-weight:700; color:#333;">${b.infos.nom.split(' ')[0]}</p>
        </div>`;
}

function renderVendre(container) {
    const maintenant = new Date();
    const jour = maintenant.getDay();
    const heure = maintenant.getHours();
    const estSabbat = (jour === 5 && heure >= 17) || (jour === 6);

    if (estSabbat) {
        container.innerHTML = `<div style="height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; text-align: center;">
            <div style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border-radius: 40px; padding: 40px 20px; width: 90%; box-shadow: 20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff; border: 1px solid rgba(255,255,255,0.4); animation: floating 3s ease-in-out infinite;">
                <div style="font-size: 60px; margin-bottom: 20px;">🕯️</div>
                <h1 style="font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #1e3a8a, var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bon Sabbat</h1>
                <p style="font-size: 14px; color: #64748b; font-weight: 600;">L'équipe Netiqui | Go Buznes se repose pour sanctifier ce jour sacré.</p>
                <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Retour Dimanche à 08:00</div>
            </div>
        </div>`;
        return;
    }

    container.innerHTML = `
        <div class="vendre-container" style="background: #f8fafc; padding-bottom: 60px;">
            <div class="vendre-hero" style="background: linear-gradient(180deg, #000 0%, #1e3a8a 100%); padding: 40px 20px 60px; text-align: center; border-radius: 0 0 40px 40px;">
                <div style="width: 75px; height: 75px; background: rgba(255,255,255,0.1); border-radius: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border: 1px solid rgba(255,255,255,0.2);">
                    <img src="${LOGO_NETIQUI}" style="width: 45px; height: 45px; object-fit: contain;">
                </div>
                <h2 style="color:white; font-size: 22px; font-weight: 800;">Netiqui | Go Buznes</h2>
            </div>
            <div style="padding: 0 20px; margin-top: -30px;">
                <div style="background: white; border-radius: 20px; padding: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px;">
                    <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></div>
                    <span style="font-size: 11px; font-weight: 800; color: #1e293b; text-transform: uppercase;">Support Ouvert : Dimanche - Vendredi 17h</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                    <div onclick="window.envoyerDemandeService('inscription')" style="background: white; padding: 22px 10px; border-radius: 25px; text-align: center;"><i class="fa-solid fa-store" style="font-size: 22px; color: #000; margin-bottom: 8px; display: block;"></i><span style="font-size: 11px; font-weight: 800;">OUVRIR SHOP</span></div>
                    <div onclick="window.envoyerDemandeService('badge_or')" style="background: white; padding: 22px 10px; border-radius: 25px; text-align: center;"><i class="fa-solid fa-crown" style="font-size: 22px; color: var(--gold); margin-bottom: 8px; display: block;"></i><span style="font-size: 11px; font-weight: 800;">PROMO OR</span></div>
                    <div onclick="window.envoyerDemandeService('verifie')" style="background: white; padding: 22px 10px; border-radius: 25px; text-align: center;"><i class="fa-solid fa-certificate" style="font-size: 22px; color: #0ea5e9; margin-bottom: 8px; display: block;"></i><span style="font-size: 11px; font-weight: 800;">CERTIFIER</span></div>
                    <div onclick="window.envoyerDemandeService('remerciement')" style="background: #f0fdf4; padding: 22px 10px; border-radius: 25px; text-align: center;"><i class="fa-solid fa-heart" style="font-size: 22px; color: #22c55e; margin-bottom: 8px; display: block;"></i><span style="font-size: 11px; font-weight: 800; color: #166534;">MERCI</span></div>
                </div>
                <div style="background: #000; border-radius: 30px; padding: 25px; color: white;">
                    <textarea id="input-suggestion" placeholder="Une question ?" style="width:100%; border:none; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 15px; color: white; height:70px; resize:none;"></textarea>
                    <button onclick="window.soumettreSuggestion()" style="width:100%; background: white; color: black; border:none; padding: 15px; border-radius: 12px; font-weight: 800; margin-top:10px;">ENVOYER</button>
                    <div onclick="window.envoyerDemandeService('plainte')" style="margin-top: 20px; text-align: center; font-size: 10px; color: #fca5a5; text-decoration: underline; cursor: pointer;">REPORT D'INCIDENT</div>
                </div>
            </div>
        </div>`;
}

// --- MODALE PRODUIT ---
window.ouvrirModaleProduit = function (idx) {
    const p = tousLesProduits[idx];
    if (!p) return;

    let modale = document.getElementById('product-modal') || document.createElement('div');
    if (!modale.id) {
        modale.id = 'product-modal';
        modale.className = 'modal-overlay';
        document.body.appendChild(modale);
    }

    const imageAffichee = (p.imgList && p.imgList.length > 0) ? p.imgList[0] : (p.image || '');
    const telVendeur = (p.storeTel || "").replace(/\D/g, '');

    // Message Vendeur ultra-personnalisé avec identification de la source
    const msgVendeur = encodeURIComponent(
        `Bonjour *${p.storeName}*,\n\n` +
        `J'ai vu votre article *${p.nom}* (${p.prix_num} USD) sur l'application *Go Buznes* 🚀.\n` +
        `Est-il toujours disponible ?`
    );

    modale.innerHTML = `
        <div class="modal-content" style="max-width:400px; width:92%; border-radius:24px; background:white; position:relative; overflow:hidden;">
            <button onclick="document.getElementById('product-modal').style.display='none'" style="position:absolute; right:15px; top:15px; z-index:10; border-radius:50%; border:none; width:35px; height:35px; cursor:pointer; background:rgba(255,255,255,0.8); backdrop-filter:blur(5px);"><i class="fa-solid fa-xmark"></i></button>

            <div style="height:280px; padding:10px; display:flex; align-items:center; justify-content:center; background:#f8fafc;">
                <img src="${imageAffichee}" style="max-width:100%; max-height:100%; border-radius:12px; object-fit:contain;">
            </div>

            <div style="padding:20px;">
                <h2 style="font-size:20px; font-weight:800; margin:0; color:#1e293b;">${p.nom}</h2>
                <p style="font-size:24px; font-weight:900; color:var(--gold); margin:10px 0;">${p.prix_num} USD</p>

                <div onclick="document.getElementById('product-modal').style.display='none'; window.selectionnerBoutique('${p.storeName}')" style="display:flex; align-items:center; gap:12px; background:#f1f5f9; padding:12px; border-radius:16px; cursor:pointer; margin-bottom:20px;">
                    <img src="${p.storeLogo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid white;">
                    <div style="flex:1;">
                        <span style="font-weight:700; font-size:14px;">${p.storeName}</span><br>
                        <small style="color:#64748b;">Voir la boutique <i class="fa-solid fa-chevron-right" style="font-size:10px;"></i></small>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <button id="btn-share-product" style="background:#000; color:white; padding:12px; border-radius:16px; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <i class="fa-solid fa-share-nodes" style="font-size:18px;"></i>
                        <span style="font-size:10px; font-weight:700;">Partager</span>
                    </button>

                    <a href="https://wa.me/${telVendeur}?text=${msgVendeur}" target="_blank" style="background:#25D366; color:white; padding:12px; border-radius:16px; text-align:center; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i>
                        <span style="font-size:10px; font-weight:700;">Commander</span>
                    </a>
                </div>
            </div>
        </div>`;

    modale.style.display = 'flex';

    // Logique du bouton Partage Produit
    document.getElementById('btn-share-product').onclick = async () => {
        const lienProduit = `https://gogamenetiqui.github.io/Go-Buznes/?v=${encodeURIComponent(p.storeName)}&p=${encodeURIComponent(p.nom)}`;
        const textePartage = `Regarde ce que j'ai trouvé chez *${p.storeName}* sur Go Buznes ! 😍\n\n📦 *Article :* ${p.nom}\n💰 *Prix :* ${p.prix_num} USD\n\nLien : ${lienProduit}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: p.nom, text: textePartage });
            } catch (err) { console.log("Partage annulé"); }
        } else {
            await navigator.clipboard.writeText(textePartage);
            alert("Lien de l'article copié !");
        }
    };
};
// --- BOUTIQUE SELECTION ---
window.selectionnerBoutique = function (nom) {
    const shop = toutesLesBoutiques.find(b => b.infos.nom === nom);
    if (shop) {
        boutiqueSelectionnee = shop;
        if (document.getElementById('product-modal')) document.getElementById('product-modal').style.display = 'none';
        naviguerVers('profil');
    }
};

// --- PROFIL ---
function renderProfil(container) {
    // 1. État : Aucune boutique sélectionnée (Redirection vers Annuaire)
    if (!boutiqueSelectionnee) {
        container.innerHTML = `
            <div style="text-align:center; padding:80px 20px; background:#f8fafc; height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <div style="background:white; padding:40px; border-radius:30px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-store-slash" style="font-size:60px; color:#cbd5e1; margin-bottom:20px;"></i>
                    <h2 style="font-weight:800; color:#1e293b; margin-bottom:10px;">Boutique non choisie</h2>
                    <p style="color:#64748b; margin-bottom:25px; font-size:14px;">Veuillez sélectionner un vendeur dans l'annuaire pour voir ses articles.</p>
                    <button onclick="naviguerVers('stores')" style="background:var(--gold); color:white; padding:16px 32px; border-radius:16px; border:none; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:10px; margin: 0 auto;">
                        <i class="fa-solid fa-magnifying-glass"></i> Explorer l'annuaire
                    </button>
                </div>
            </div>`;
        return;
    }

    const b = boutiqueSelectionnee;
    const bColor = b.badgeType === 'or' ? 'var(--gold)' : (b.badgeType === 'bleu' ? '#0ea5e9' : '#cbd5e1');
    const bIcon = b.badgeType === 'or' ? 'fa-crown' : 'fa-circle-check';

    // 2. Message WhatsApp avec identification de la source (Go Buznes)
    const msgWhatsApp = encodeURIComponent(
        `Bonjour *${b.infos.nom}*,\n\n` +
        `J'ai trouvé votre numéro sur l'application *Go Buznes* 🚀.\n` +
        `Je suis intéressé par vos articles et j'aimerais avoir plus d'informations.`
    );

    container.innerHTML = `
        <div class="profile-header" style="padding:30px 20px; background:white; text-align:center; border-bottom: 1px solid #f1f5f9;">
            <div style="position:relative; width:110px; height:110px; margin: 0 auto 15px;">
                <img src="${b.infos.logo}" style="width:100%; height:100%; border-radius:50%; border:4px solid ${bColor}; object-fit:cover; background:#f8fafc;">
                ${b.isVerifie ? `<div style="position:absolute; bottom:5px; right:5px; background:white; width:25px; height:25px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);"><i class="fa-solid ${bIcon}" style="color:${bColor}; font-size:14px;"></i></div>` : ''}
            </div>

            <h2 style="font-size:24px; font-weight:900; color:#1e293b; margin-bottom:5px;">${b.infos.nom}</h2>

            <div style="display:flex; align-items:center; justify-content:center; gap:8px; color:#64748b; font-size:13px; margin-bottom:12px;">
                <i class="fa-solid fa-location-dot" style="color:#ef4444;"></i>
                <span>${b.infos.adresse || "Goma, Nord-Kivu, RDC"}</span>
            </div>

            <p style="color:#475569; font-size:14px; line-height:1.5; max-width:320px; margin:0 auto 22px;">
                ${b.infos.description_courte || "Bienvenue dans notre boutique officielle sur Go Buznes."}
            </p>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                <a href="tel:${b.infos.telephone}" style="display:flex; align-items:center; justify-content:center; gap:8px; background:#f1f5f9; color:#1e293b; padding:14px; border-radius:16px; text-decoration:none; font-weight:800; font-size:14px;">
                    <i class="fa-solid fa-phone"></i> Appeler
                </a>
                <a href="https://wa.me/${b.infos.telephone.replace(/\D/g,'')}?text=${msgWhatsApp}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:8px; background:#25D366; color:white; border:none; padding:14px; border-radius:16px; text-decoration:none; font-weight:800; font-size:14px;">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp
                </a>
            </div>

            <button id="btn-share-store" style="width:100%; background:#000; color:white; padding:14px; border-radius:16px; border:none; font-weight:800; font-size:14px; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer;">
                <i class="fa-solid fa-share-nodes"></i> Partager la boutique
            </button>
        </div>

        <div style="padding:20px 15px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px; color:#1e293b;">
                <i class="fa-solid fa-boxes-stacked" style="color:var(--gold); font-size:18px;"></i>
                <h3 style="font-size:16px; font-weight:800;">Articles Disponibles (${b.produits.length})</h3>
            </div>

            <div class="grid-products">
                ${b.produits.map(p => renderProductCard({
                    ...p,
                    storeName: b.infos.nom,
                    storeLogo: b.infos.logo,
                    storeIsVerifie: b.isVerifie,
                    storeBadgeType: b.badgeType,
                    storeTel: b.infos.telephone,
                    imgList: p.images || (p.image ? [p.image] : [])
                })).join('')}
            </div>
        </div>`;

    // 3. Script du bouton de Partage
    const btnShare = document.getElementById('btn-share-store');
    if (btnShare) {
        btnShare.onclick = async () => {
            const lienBoutique = `https://gogamenetiqui.github.io/Go-Buznes/?v=${encodeURIComponent(b.infos.nom)}`;
            const texteComplet = `Regarde la boutique *${b.infos.nom}* sur Go Buznes ! Ils ont de super articles. 🛍️✨\n\nLien : ${lienBoutique}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: b.infos.nom,
                        text: texteComplet
                    });
                } catch (err) {
                    console.log("Partage interrompu.");
                }
            } else {
                await navigator.clipboard.writeText(texteComplet);
                alert("Présentation et lien de la boutique copiés !");
            }
        };
    }
}

// --- UTILITAIRES ---
function genererCategories() {
    const cats = [...new Set(tousLesProduits.map(p => p.categorie))];
    const container = document.getElementById('categories-container');
    if (container) {
        container.innerHTML = `<div class="category-item" onclick="naviguerVers('home')"><div class="cat-icon" style="background:var(--gold); color:white;"><i class="fa-solid fa-border-all"></i></div><span>Tous</span></div>` +
            cats.map(cat => `<div class="category-item" onclick="window.filtrerParCategorie('${cat}')"><div class="cat-icon"><i class="fa-solid fa-tag"></i></div><span>${cat}</span></div>`).join('');
    }
}

window.filtrerParCategorie = function (cat) {
    const res = tousLesProduits.filter(p => p.categorie === cat);
    document.getElementById('main-render').innerHTML = `<div class="section-header" style="padding:10px 15px;"><h2><i class="fa-solid fa-tag"></i> ${cat}</h2></div><div class="grid-products">${res.map(p => renderProductCard(p)).join('')}</div>`;
};

function afficherBoutiquesPopulaires() {
    const container = document.getElementById('boutiques-container');
    if (container) {
        container.innerHTML = toutesLesBoutiques.slice(0, 6).map(b => `
            <div class="store-card" onclick="window.selectionnerBoutique('${b.infos.nom}')">
                <img src="${b.infos.logo}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">
                <p style="font-size:11px; font-weight:600; margin:5px 0;">${b.infos.nom}</p>
                <small style="color:var(--gold); font-weight:700;">${b.capital}$</small>
            </div>`).join('');
    }
}

function setupSearch() {
    document.getElementById('main-search')?.addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase().trim();
        if (t.length > 0) {
            const res = tousLesProduits.filter(p => p.nom.toLowerCase().includes(t) || p.storeName.toLowerCase().includes(t));
            document.getElementById('main-render').innerHTML = `<div class="section-header"><h2>Résultats pour "${t}"</h2></div><div class="grid-products">${res.map(p => renderProductCard(p)).join('')}</div>`;
        } else naviguerVers('home');
    });
}

function activerNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => naviguerVers(item.dataset.page);
    });
}

window.envoyerDemandeService = function(type, tel = NUMERO_NETIQUI, customMsg = "") {
    let message = customMsg;
    if (type === 'inscription') message = "✨ *INSCRIPTION BOUTIQUE*";
    else if (type === 'badge_or') message = "👑 *BADGE OR*";
    else if (type === 'verifie') message = "🛡️ *VÉRIFICATION*";
    else if (type === 'plainte') message = "⚠️ *SIGNALEMENT*";
    else if (type === 'remerciement') message = "❤️ *MERCI*";

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(message)}`, '_blank');
};

window.soumettreSuggestion = function() {
    const text = document.getElementById('input-suggestion').value;
    if (text.trim()) window.envoyerDemandeService('remerciement', NUMERO_NETIQUI, `💡 SUGGESTION : ${text}`);
};

// --- LANCEMENT UNIQUE ---
initialiserApp();