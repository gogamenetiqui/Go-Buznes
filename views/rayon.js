import { state } from '../core/state.js';
import { chargerImageBoutiqueOuArticle } from '../core/data.js';
import { genererEcranBoutiques } from './boutiques.js';

export function filtrerArticlesParBoutique(idBoutique) {
    if (!idBoutique) return;

    const boutiqueCible = state.toutesLesBoutiques.find(b => b.id_boutique === idBoutique);
    const nomBoutique = boutiqueCible ? boutiqueCible.nom : "Boutique";
    const articlesFiltres = state.tousLesProduits.filter(p => p.boutiqueId === idBoutique);

    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    let html = `
        <div style="display:flex;flex-direction:column;gap:16px;width:100%;">
            <div style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 2px rgba(0,0,0,0.05);position:relative;">
                <button onclick="window.genererEcranBoutiques(window.stateRef.toutesLesBoutiques)"
                    style="position:absolute;top:12px;right:12px;background:#f1f3f4;border:none;width:28px;height:28px;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;">
                    <i class="fa-solid fa-arrow-left" style="font-size:12px;"></i>
                </button>
                <div style="width:50px;height:50px;border-radius:50%;background:#f1f3f4;overflow:hidden;border:2px solid #0046ad;flex-shrink:0;">
                    <img id="rayon-logo-${idBoutique}" src="" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div>
                    <h2 style="font-size:16px;font-weight:800;color:#1c1e21;margin:0 0 2px 0;">${nomBoutique}</h2>
                    <span style="font-size:11px;color:#0046ad;background:#e8f0fe;padding:2px 8px;border-radius:6px;font-weight:700;">
                        ${articlesFiltres.length} article${articlesFiltres.length > 1 ? 's' : ''} disponible${articlesFiltres.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>
            <div id="grid-rayon-boutique" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">`;

    if (articlesFiltres.length === 0) {
        html += `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#5f6368;font-size:13px;">
            <i class="fa-solid fa-box-open" style="font-size:30px;display:block;margin-bottom:10px;opacity:0.4;"></i>
            Cette boutique n'a aucun article exposé.
        </div>`;
    } else {
        articlesFiltres.forEach((prod, index) => {
            const id = `img-rayon-${idBoutique}-${index}`;
            html += `
                <div style="background:#fff;border:1px solid #dadce0;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                    <div style="position:relative;width:100%;aspect-ratio:1/1;background:#f1f3f4;">
                        <img id="${id}" src="" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;">
                    </div>
                    <div style="padding:8px;display:flex;flex-direction:column;gap:4px;justify-content:space-between;flex:1;">
                        <h3 style="font-size:12px;font-weight:600;margin:0;color:#1c1e21;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.designation}</h3>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                            <span style="font-size:12px;font-weight:700;color:#0046ad;flex:1;">${prod.prix} ${prod.devise || 'USD'}</span>
                            <button onclick="window.ouvrirApercuProduitDuRayon(${index}, '${id}', '${idBoutique}', event)"
                                style="background:#e8f0fe;color:#0046ad;border:none;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;">Info</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    html += `</div></div>`;
    mainRender.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const logo = boutiqueCible?.logo_entreprise || `logo_${idBoutique.toLowerCase()}.jpg`;
    chargerImageBoutiqueOuArticle(idBoutique, logo, `rayon-logo-${idBoutique}`);

    articlesFiltres.forEach((prod, index) => {
        const id = `img-rayon-${idBoutique}-${index}`;
        const nomImg = prod.image || prod.imageNom || "";
        chargerImageBoutiqueOuArticle(idBoutique, nomImg, id);
    });

    state.articlesDuRayonActuel = articlesFiltres;
}

window.filtrerArticlesParBoutique = filtrerArticlesParBoutique;