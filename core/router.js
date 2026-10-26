import { state } from './state.js';
import { mettreAJourStatsHeader, deconnecterApresTimeout, nettoyerUrlBarre } from './utils.js';
import { obtenirVendeurs, obtenirAnnonces } from './data.js';
import { genererEcranAccueil } from '../views/accueil.js';
import { genererEcranBoutiques } from '../views/boutiques.js';
import { genererEcranVendre } from '../views/vendre.js';
import { genererEcranAnnoncesEtNews } from '../views/biens.js';
import { genererEcranProfil } from '../views/profil.js';
import { afficherAlerteQuitterStylisee } from './modals.js';

export function naviguerVersPage(pageId) {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
    });

    if (pageId !== 'home') {
        const input = document.getElementById('main-search');
        if (input) input.value = '';
    }

    switch (pageId) {
        case 'home': genererEcranAccueil(state.tousLesProduits); break;
        case 'stores': genererEcranBoutiques(state.toutesLesBoutiques); break;
        case 'vendre': genererEcranVendre(); break;
        case 'biens': genererEcranAnnoncesEtNews(); break;
        case 'profil': genererEcranProfil(); break;
    }
    window.scrollTo(0, 0);
}

export async function initialiserApp() {
    const mainRender = document.getElementById('main-render');
    if (mainRender) {
        mainRender.innerHTML = `
            <div style="text-align:center;padding:40px;color:#5f6368;font-size:14px;">
                <i class="fa-solid fa-spinner fa-spin" style="color:#0046ad;margin-right:8px;"></i>Synchronisation locale sécurisée...
            </div>`;
    }

    try {
        const charge = Promise.all([obtenirVendeurs(), obtenirAnnonces()]);
        const [vendeurs, annonces] = await Promise.race([charge, deconnecterApresTimeout(6000)]);

        state.toutesLesBoutiques = vendeurs;
        state.toutesLesAnnonces = annonces;
        state.tousLesProduits = [];

        state.toutesLesBoutiques.forEach(b => {
            if (b.articles && Array.isArray(b.articles)) {
                b.articles.forEach(a => {
                    state.tousLesProduits.push({
                        ...a,
                        imageNom: a.image || "",
                        boutiqueNom: b.nom,
                        boutiqueId: b.id_boutique,
                        boutiqueTel: b.telephone,
                        badgeType: b.badge?.type !== undefined ? b.badge.type : (b.badgeType || "")
                    });
                });
            }
        });

        mettreAJourStatsHeader();
        const disp = document.getElementById('total-articles-display');
        if (disp) disp.innerText = `${state.tousLesProduits.length} articles disponibles à Goma`;

        // Interception URL propre
        const segments = window.location.pathname.split('/').filter(s => s.length > 0);
        const idxB = segments.indexOf('Boutique');
        const idxA = segments.indexOf('Article');
        const idxN = segments.indexOf('Annonce');

        if (idxN !== -1 && segments[idxN + 1]) {
            const idAnnonce = segments[idxN + 1];
            state.articlesBonnesAffairesActuels = state.toutesLesAnnonces;
            naviguerVersPage('biens');
            const i = state.toutesLesAnnonces.findIndex(a => a.id_annonce === idAnnonce);
            if (i !== -1) {
                setTimeout(() => {
                    if (typeof window.ouvrirApercuProduit === 'function')
                        window.ouvrirApercuProduit(i, `img-annonce-shared-${idAnnonce}`, { preventDefault: () => { } });
                }, 150);
            }
            nettoyerUrlBarre();
        } else if (idxA !== -1 && segments[idxA + 2]) {
            const idArticle = segments[idxA + 2];
            state.articlesBonnesAffairesActuels = state.tousLesProduits;
            naviguerVersPage('home');
            const i = state.tousLesProduits.findIndex(p => p.id_article === idArticle);
            if (i !== -1) {
                setTimeout(() => {
                    if (typeof window.ouvrirApercuProduit === 'function')
                        window.ouvrirApercuProduit(i, `img-produit-shared-${idArticle}`, { preventDefault: () => { } });
                }, 150);
            }
            nettoyerUrlBarre();
        } else if (idxB !== -1 && segments[idxB + 1]) {
            const idB = segments[idxB + 1];
            if (typeof window.ouvrirProfilVendeur === 'function') {
                setTimeout(() => window.ouvrirProfilVendeur(idB), 150);
            } else {
                naviguerVersPage('home');
            }
            nettoyerUrlBarre();
        } else {
            naviguerVersPage('home');
        }
    } catch (erreur) {
        console.error("[router] Échec synchronisation :", erreur);
        if (mainRender) {
            mainRender.innerHTML = `
                <div style="text-align:center;padding:40px 20px;color:#d93025;background:#fce8e6;border-radius:12px;margin:10px;border:1px solid #fad2cf;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:30px;margin-bottom:12px;"></i>
                    <h4 style="font-size:15px;font-weight:700;margin:0 0 6px 0;">Le serveur local ne répond pas</h4>
                    <p style="font-size:12px;margin:0 0 14px 0;color:#5f6368;">La base de données a mis trop de temps à s'initialiser.</p>
                    <button onclick="location.reload()" style="background:#d93025;color:#fff;border:none;padding:8px 16px;border-radius:16px;font-size:12px;font-weight:500;cursor:pointer;">
                        <i class="fa-solid fa-rotate"></i> Réessayer
                    </button>
                </div>`;
        }
    }
}


window.addEventListener('popstate', () => {
    const c = document.getElementById('search-dropdown-container');
    if (c) { window.fermerFenetreRecherche(); window.history.pushState({ site: 'gobuznes' }, ''); return; }
    afficherAlerteQuitterStylisee();
});
window.history.pushState({ site: 'gobuznes' }, '');

window.naviguerVersPage = naviguerVersPage;
window.stateRef = state;