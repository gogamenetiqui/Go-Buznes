import { state } from '../core/state.js';
import { chargerImageBoutiqueOuArticle } from '../core/data.js';
import { ouvrirApercuProduit } from '../components/productModal.js';

export function initialiserRechercheAutonome() {
    const inputSearch = document.getElementById('main-search');
    if (!inputSearch) return;

    const clone = inputSearch.cloneNode(true);
    inputSearch.parentNode.replaceChild(clone, inputSearch);

    clone.addEventListener('focus', () => {
        if (clone.value.toLowerCase().trim() === '') rendreFenetreRecherche([], true);
    });

    clone.addEventListener('input', (e) => {
        const terme = e.target.value.toLowerCase().trim();
        if (terme === '') { rendreFenetreRecherche([], true); return; }

        const filtres = state.tousLesProduits.filter(p =>
            (p.designation || '').toLowerCase().includes(terme) ||
            (p.boutiqueNom || '').toLowerCase().includes(terme)
        );

        if (filtres.length > 0 && !state.historiqueRecherche.includes(terme) && terme.length > 2) {
            state.historiqueRecherche.unshift(terme);
            if (state.historiqueRecherche.length > 5) state.historiqueRecherche.pop();
        }

        rendreFenetreRecherche(filtres, false, terme);
    });

    document.addEventListener('click', (e) => {
        const conteneur = document.getElementById('search-dropdown-container');
        if (conteneur && !conteneur.contains(e.target) && e.target !== clone) fermerFenetreRecherche();
    });
}

export function rendreFenetreRecherche(resultats, afficherHistorique = false, terme = '') {
    const input = document.getElementById('main-search');
    if (!input) return;

    let conteneur = document.getElementById('search-dropdown-container');
    if (!conteneur) {
        conteneur = document.createElement('div');
        conteneur.id = 'search-dropdown-container';
        conteneur.style = `position:absolute;top:${input.offsetTop + input.offsetHeight + 6}px;left:${input.offsetLeft}px;width:${input.offsetWidth}px;max-height:280px;background:#fff;border:1px solid #dadce0;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.12);z-index:9999;overflow-y:auto;box-sizing:border-box;padding:10px;display:flex;flex-direction:column;gap:8px;`;
        input.parentNode.appendChild(conteneur);
    }

    let html = '';

    if (afficherHistorique) {
        if (state.historiqueRecherche.length === 0) {
            html = `<div style="font-size:11px;color:#5f6368;padding:6px;text-align:center;">Aucune recherche récente.</div>`;
        } else {
            html = `<div style="font-size:11px;font-weight:700;color:#5f6368;text-transform:uppercase;padding-bottom:2px;">Recherches récentes</div><div style="display:flex;flex-wrap:wrap;gap:6px;padding:4px 0;">`;
            state.historiqueRecherche.forEach(h => {
                html += `<span onclick="document.getElementById('main-search').value='${h}';document.getElementById('main-search').dispatchEvent(new Event('input'));"
                    style="font-size:11px;background:#f1f3f4;color:#1c1e21;padding:4px 10px;border-radius:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-weight:500;">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size:9px;color:#5f6368;"></i> ${h}</span>`;
            });
            html += `</div>`;
        }
        conteneur.innerHTML = html;
        return;
    }

    html = `<div style="font-size:11px;font-weight:700;color:#5f6368;text-transform:uppercase;border-bottom:1px solid #f1f3f4;padding-bottom:4px;">Suggestions (${resultats.length})</div>`;

    if (resultats.length === 0) {
        html += `<div style="font-size:12px;color:#5f6368;text-align:center;padding:12px;">Aucun résultat pour "${terme}"</div>`;
    } else {
        const max = resultats.slice(0, 5);
        state.stockRechercheIsole = max;
        max.forEach((prod, index) => {
            const id = `img-search-dropdown-${prod.boutiqueId || 'shop'}-${index}`;
            html += `
                <div onclick="window.ouvrirApercuDepuisDropdown(${index}, '${id}', event)"
                     style="display:flex;align-items:center;gap:10px;padding:6px;border-radius:8px;cursor:pointer;border-bottom:1px solid #f8f9fa;">
                    <div style="width:36px;height:36px;border-radius:6px;background:#f1f3f4;overflow:hidden;flex-shrink:0;">
                        <img id="${id}" src="" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;">
                    </div>
                    <div style="flex:1;overflow:hidden;">
                        <h4 style="font-size:12px;font-weight:600;margin:0;color:#1c1e21;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.designation}</h4>
                        <span style="font-size:10px;color:#5f6368;">${prod.boutiqueNom || 'Boutique'}</span>
                    </div>
                    <div style="font-size:11px;font-weight:700;color:#0046ad;white-space:nowrap;">${prod.prix} ${prod.devise || 'USD'}</div>
                </div>`;
        });
    }

    conteneur.innerHTML = html;

    if (resultats.length > 0) {
        resultats.slice(0, 5).forEach((prod, index) => {
            const id = `img-search-dropdown-${prod.boutiqueId || 'shop'}-${index}`;
            const nomImage = prod.image || prod.imageNom || "";
            if (typeof chargerImageBoutiqueOuArticle === 'function') chargerImageBoutiqueOuArticle(prod.boutiqueId, nomImage, id);
        });
    }
}

export function fermerFenetreRecherche() {
    const c = document.getElementById('search-dropdown-container');
    if (c) c.remove();
}

export function ouvrirApercuDepuisDropdown(indexLocal, originImgId, event) {
    if (!state.stockRechercheIsole[indexLocal]) return;
    const sauvegarde = state.articlesBonnesAffairesActuels;
    state.articlesBonnesAffairesActuels = state.stockRechercheIsole;
    if (typeof ouvrirApercuProduit === 'function') ouvrirApercuProduit(indexLocal, originImgId, event);
    setTimeout(() => fermerFenetreRecherche(), 50);
    setTimeout(() => { state.articlesBonnesAffairesActuels = sauvegarde; }, 200);
}

window.initialiserRechercheAutonome = initialiserRechercheAutonome;
window.rendreFenetreRecherche = rendreFenetreRecherche;
window.fermerFenetreRecherche = fermerFenetreRecherche;
window.ouvrirApercuDepuisDropdown = ouvrirApercuDepuisDropdown;