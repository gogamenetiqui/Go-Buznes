import { state } from '../core/state.js';
import { chargerImageBoutiqueOuArticle } from '../core/data.js';
import { construireHtmlAnnonceNetiqui, declencherImagesAnnonceNetiqui } from '../components/annonceCard.js';

export function genererEcranAccueil(listeProduits) {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    if (state.intervalleBonnesAffaires) { clearInterval(state.intervalleBonnesAffaires); state.intervalleBonnesAffaires = null; }

    const produitsSource = state.tousLesProduits;
    const boutiquesSource = state.toutesLesBoutiques;
    const annoncesSource = state.toutesLesAnnonces;

    if (produitsSource.length === 0 && boutiquesSource.length === 0) {
        mainRender.innerHTML = `<div style="text-align:center;padding:50px 20px;color:#5f6368;"><i class="fa-solid fa-box-open" style="font-size:40px;color:#dadce0;margin-bottom:15px;display:block;"></i>Aucun contenu disponible.</div>`;
        return;
    }

    mainRender.innerHTML = `<div id="home-wrapper" style="display:flex;flex-direction:column;gap:24px;width:100%;"></div>`;
    const wrapper = document.getElementById('home-wrapper');

    const stories = boutiquesSource.filter(b => (b.badge?.type || b.badgeType) === 'or' || (b.badge?.type || b.badgeType) === 'bleu')
        .sort((a, b) => {
            const a1 = a.badge?.type || a.badgeType, b1 = b.badge?.type || b.badgeType;
            if (a1 === 'or' && b1 !== 'or') return -1;
            if (a1 !== 'or' && b1 === 'or') return 1;
            return 0;
        });

    if (stories.length > 0) {
        let html = `<div style="width:100%;"><h4 style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px;">Boutiques Vedettes</h4><div style="display:flex;gap:14px;overflow-x:auto;padding:4px 2px;scroll-behavior:smooth;" class="hide-scrollbar">`;
        stories.forEach((s, idx) => {
            const badge = s.badge?.type || s.badgeType;
            const border = badge === 'or' ? '3px solid #d4af37' : '3px solid #0046ad';
            html += `<div onclick="if(typeof window.filtrerArticlesParBoutique === 'function') window.filtrerArticlesParBoutique('${s.id_boutique}')" style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex-shrink:0;width:68px;text-align:center;">
                <div style="width:58px;height:58px;border-radius:50%;${border};padding:2px;background:#fff;overflow:hidden;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                    <img id="story-logo-${s.id_boutique}-${idx}" src="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;opacity:0;transition:opacity 0.2s;">
                </div>
                <span style="font-size:11px;font-weight:500;color:var(--text-body);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;">${s.nom}</span>
            </div>`;
        });
        html += `</div></div>`;
        wrapper.insertAdjacentHTML('beforeend', html);
        stories.forEach((s, idx) => {
            if (s.logo_entreprise) chargerImageBoutiqueOuArticle(s.id_boutique, s.logo_entreprise, `story-logo-${s.id_boutique}-${idx}`);
        });
    }

    const top3 = boutiquesSource.map(b => {
        const arts = produitsSource.filter(p => p.boutiqueId === b.id_boutique);
        const cap = arts.reduce((t, a) => t + (parseFloat(a.prix) || 0), 0);
        return { ...b, capitalTotal: cap };
    }).sort((a, b) => b.capitalTotal - a.capitalTotal).slice(0, 3);

    if (top3.length > 0) {
        let html = `<div style="width:100%;"><h4 style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;letter-spacing:0.5px;"><i class="fa-solid fa-trophy" style="color:#d4af37;"></i> Les 3 Plus Suivies</h4><div style="display:flex;gap:14px;overflow-x:auto;padding:4px 2px;" class="hide-scrollbar">`;
        top3.forEach((s, i) => {
            const bg = ['#d4af37', '#b5b7bb', '#cd7f32'][i];
            html += `<div onclick="if(typeof window.filtrerArticlesParBoutique === 'function') window.filtrerArticlesParBoutique('${s.id_boutique}')" style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex-shrink:0;width:76px;text-align:center;position:relative;">
                <div style="position:absolute;top:-2px;right:4px;background:${bg};color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:2px solid #fff;z-index:10;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${i + 1}</div>
                <div style="width:62px;height:62px;border-radius:50%;padding:2px;background:#fff;border:1px solid var(--border-light);overflow:hidden;box-shadow:var(--shadow-sm);">
                    <img id="top-cap-logo-${s.id_boutique}-${i}" src="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;opacity:0;transition:opacity 0.2s;">
                </div>
                <span style="font-size:11px;font-weight:600;color:var(--text-main);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;">${s.nom}</span>
                <span style="font-size:9px;color:var(--text-muted);font-weight:500;">Tendance 🔥</span>
            </div>`;
        });
        html += `</div></div>`;
        wrapper.insertAdjacentHTML('beforeend', html);
        top3.forEach((s, i) => {
            if (s.logo_entreprise) chargerImageBoutiqueOuArticle(s.id_boutique, s.logo_entreprise, `top-cap-logo-${s.id_boutique}-${i}`);
        });
    }

    let annonceHaut = null, annonceBas = null;
    if (annoncesSource.length > 0) {
        const shuffled = [...annoncesSource].sort(() => 0.5 - Math.random());
        annonceHaut = shuffled[0];
        if (shuffled.length > 1) annonceBas = shuffled[1];
    }

    if (annonceHaut) {
        wrapper.insertAdjacentHTML('beforeend', `<div style="width:100%;">${construireHtmlAnnonceNetiqui(annonceHaut, 'haut')}</div>`);
        declencherImagesAnnonceNetiqui(annonceHaut, 'haut');
    }

    wrapper.insertAdjacentHTML('beforeend', `
        <div style="width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h4 style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">
                    <i class="fa-solid fa-tags" style="color:#d93025;"></i> Bonnes Affaires (≤ 20$)
                </h4>
                <span style="font-size:10px;color:var(--logo-blue);background:var(--logo-blue-light);padding:2px 8px;border-radius:10px;font-weight:500;"><i class="fa-solid fa-rotate"></i> Auto-mix</span>
            </div>
            <div id="grid-bonnes-affaires" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div>
        </div>`);

    rafraichirSectionBonnesAffaires();
    state.intervalleBonnesAffaires = setInterval(rafraichirSectionBonnesAffaires, 120000);

    if (annonceBas) {
        wrapper.insertAdjacentHTML('beforeend', `<div style="width:100%;">${construireHtmlAnnonceNetiqui(annonceBas, 'bas')}</div>`);
        declencherImagesAnnonceNetiqui(annonceBas, 'bas');
    }
}

export function rafraichirSectionBonnesAffaires() {
    const grille = document.getElementById('grid-bonnes-affaires');
    if (!grille) return;

    const filtres = state.tousLesProduits.filter(p => (parseFloat(p.prix) || 0) <= 20);
    if (filtres.length === 0) {
        grille.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:12px;">Aucun article à moins de 20 USD en ce moment.</div>`;
        return;
    }

    state.articlesBonnesAffairesActuels = filtres.sort(() => 0.5 - Math.random()).slice(0, 20);
    let html = '';

    state.articlesBonnesAffairesActuels.forEach((prod, index) => {
        let icone = '';
        if (prod.badgeType === 'or') icone = `<i class="fa-solid fa-crown" style="color:#d4af37;margin-left:2px;"></i>`;
        if (prod.badgeType === 'bleu') icone = `<i class="fa-solid fa-circle-check" style="color:#0046ad;margin-left:2px;"></i>`;

        const domId = `img-deal-${prod.boutiqueId || 'shop'}-${index}`;
        html += `
            <div style="background:#fff;border:1px solid var(--border-light);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow-sm);position:relative;">
                <div style="position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:#f1f3f4;">
                    <img id="${domId}" src="" alt="${prod.designation}" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;">
                    <span style="position:absolute;top:6px;left:6px;background:#d93025;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;z-index:2;">-20$</span>
                </div>
                <div style="padding:8px;display:flex;flex-direction:column;gap:4px;justify-content:space-between;flex:1;">
                    <div>
                        <h3 style="font-size:12px;font-weight:600;margin:0;color:var(--text-body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.designation}</h3>
                        <p style="font-size:10px;color:var(--text-muted);margin:1px 0 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.boutiqueNom || 'Boutique'} ${icone}</p>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                        <span style="font-size:12px;font-weight:700;color:var(--logo-blue);flex:1;">${prod.prix} ${prod.devise || 'USD'}</span>
                        <button onclick="window.ouvrirApercuProduit(${index}, '${domId}', event)"
                            style="background:#e8f0fe;color:#0046ad;border:none;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;z-index:10;">
                            <i class="fa-solid fa-circle-info"></i> Info
                        </button>
                    </div>
                </div>
            </div>`;
    });

    grille.innerHTML = html;

    state.articlesBonnesAffairesActuels.forEach((prod, index) => {
        const domId = `img-deal-${prod.boutiqueId || 'shop'}-${index}`;
        const nomImg = prod.image || prod.imageNom || "";
        if (typeof chargerImageBoutiqueOuArticle === 'function') chargerImageBoutiqueOuArticle(prod.boutiqueId, nomImg, domId);
    });
}

window.genererEcranAccueil = genererEcranAccueil;