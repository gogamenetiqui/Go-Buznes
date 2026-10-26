import { state } from '../core/state.js';
import { chargerImageBoutiqueOuArticle } from '../core/data.js';

export function genererEcranBoutiques(listeBoutiques) {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    state.listeBoutiquesOriginale = listeBoutiques || [];
    const produitsSource = state.tousLesProduits;

    const classees = [...state.listeBoutiquesOriginale].map(s => ({
        ...s,
        nbArticles: produitsSource.filter(p => p.boutiqueId === s.id_boutique).length
    })).sort((a, b) => b.nbArticles - a.nbArticles);

    const top3 = classees.slice(0, 3);

    let html = `
        <div style="background:linear-gradient(135deg,#0046ad,#002d72);border-radius:16px;padding:16px;margin-bottom:16px;color:#fff;box-shadow:0 4px 15px rgba(0,70,173,0.15);">
            <h4 style="font-size:13px;font-weight:700;text-transform:uppercase;margin:0 0 14px 0;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;color:#fff;">
                <i class="fa-solid fa-trophy" style="color:#ffd700;"></i> Les Plus Grands Catalogues
            </h4>
            <div style="display:flex;justify-content:space-around;align-items:flex-end;padding-top:10px;">`;

    [1, 0, 2].forEach(posIdx => {
        const s = top3[posIdx];
        if (!s) return;
        const id = `img-podium-${s.id_boutique}-${posIdx}`;
        const h = posIdx === 0 ? '75px' : (posIdx === 1 ? '60px' : '50px');
        const sz = posIdx === 0 ? '54px' : '44px';
        const couronne = posIdx === 0 ? `<i class="fa-solid fa-crown" style="color:#ffd700;font-size:14px;position:absolute;top:-14px;left:50%;transform:translateX(-50%);"></i>` : '';
        const med = posIdx === 0 ? '#ffd700' : (posIdx === 1 ? '#c0c0c0' : '#cd7f32');

        html += `
            <div onclick="window.ouvrirProfilBoutique('${s.id_boutique}', '${id}')" style="display:flex;flex-direction:column;align-items:center;width:30%;cursor:pointer;position:relative;">
                ${couronne}
                <div style="width:${sz};height:${sz};border-radius:50%;border:3px solid ${med};background:#fff;overflow:hidden;box-shadow:0 4px 8px rgba(0,0,0,0.2);">
                    <img id="${id}" src="" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;">
                </div>
                <span style="font-size:11px;font-weight:700;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;text-align:center;">${s.nom}</span>
                <div style="background:rgba(255,255,255,0.15);border-radius:6px 6px 0 0;width:100%;height:${h};margin-top:6px;display:flex;flex-direction:column;justify-content:center;align-items:center;border:1px solid rgba(255,255,255,0.1);">
                    <span style="font-size:16px;font-weight:900;color:${med};">#${posIdx + 1}</span>
                    <span style="font-size:10px;font-weight:600;opacity:0.9;">${s.nbArticles} art.</span>
                </div>
            </div>`;
    });

    html += `</div></div>
        <div style="display:flex;flex-direction:column;gap:12px;width:100%;margin-bottom:16px;">
            <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;" class="hide-scrollbar">
                <button onclick="window.filtrerBoutiquesParBadge('tous', this)" style="background:#0046ad;color:#fff;border:none;padding:8px 16px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Toutes les boutiques</button>
                <button onclick="window.filtrerBoutiquesParBadge('or', this)" style="background:#fff;color:#d4af37;border:1px solid #fadd8d;padding:8px 16px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;"><i class="fa-solid fa-crown"></i> Certifiées Or</button>
                <button onclick="window.filtrerBoutiquesParBadge('bleu', this)" style="background:#fff;color:#0046ad;border:1px solid #c2e7ff;padding:8px 16px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;"><i class="fa-solid fa-circle-check"></i> Vérifiées</button>
            </div>
        </div>
        <div id="stores-list-container" style="display:flex;flex-direction:column;gap:12px;width:100%;"></div>`;

    mainRender.innerHTML = html;

    rendreListeBoutiquesFiltree(state.listeBoutiquesOriginale);

    top3.forEach((s, i) => {
        const logo = s.logo_entreprise || `logo_${s.id_boutique.toLowerCase()}.jpg`;
        chargerImageBoutiqueOuArticle(s.id_boutique, logo, `img-podium-${s.id_boutique}-${i}`);
    });
}

export function rendreListeBoutiquesFiltree(liste) {
    const conteneur = document.getElementById('stores-list-container');
    if (!conteneur) return;

    if (liste.length === 0) {
        conteneur.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#5f6368;font-size:13px;">Aucune boutique dans cette catégorie.</div>`;
        return;
    }

    let html = '';
    liste.forEach((store, index) => {
        let styleBadge = 'background:#f1f3f4;color:#5f6368;';
        let texteBadge = '<i class="fa-solid fa-store" style="margin-right:2px;"></i> Standard';
        const type = store.badge?.type || store.badgeType;
        if (type === 'or') { styleBadge = 'background:#fef7e0;color:#d4af37;border:1px solid #fadd8d;'; texteBadge = '<i class="fa-solid fa-crown" style="margin-right:2px;"></i> Or'; }
        else if (type === 'bleu') { styleBadge = 'background:#e8f0fe;color:#0046ad;border:1px solid #c2e7ff;'; texteBadge = '<i class="fa-solid fa-circle-check" style="margin-right:2px;"></i> Vérifié'; }

        const nb = state.tousLesProduits.filter(p => p.boutiqueId === store.id_boutique).length;
        const idLogo = `img-logo-${store.id_boutique}-${index}`;

        html += `
            <div onclick="window.ouvrirProfilBoutique('${store.id_boutique}', '${idLogo}')" style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 2px rgba(0,0,0,0.05);gap:8px;cursor:pointer;">
                <div style="display:flex;align-items:center;gap:12px;overflow:hidden;">
                    <div style="width:52px;height:52px;border-radius:50%;background:#f1f3f4;overflow:hidden;flex-shrink:0;border:1px solid #e8f0fe;">
                        <img id="${idLogo}" src="" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;">
                    </div>
                    <div style="overflow:hidden;">
                        <h3 style="font-size:14px;font-weight:700;color:#1c1e21;margin:0 0 2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${store.nom}</h3>
                        <p style="font-size:11px;color:#5f6368;margin:0 0 4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            <i class="fa-solid fa-location-dot" style="font-size:10px;margin-right:3px;color:#d93025;"></i> ${store.adresse || 'Goma'}
                        </p>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:9px;font-weight:600;padding:2px 6px;border-radius:10px;${styleBadge}">${texteBadge}</span>
                            <span style="font-size:10px;color:#0046ad;font-weight:700;background:#e8f0fe;padding:1px 6px;border-radius:6px;">${nb} art.</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;" onclick="event.stopPropagation();">
                    <button onclick="window.partagerProfilBoutique('${store.id_boutique}', '${encodeURIComponent(store.nom)}')" style="width:32px;height:32px;border-radius:50%;background:#e8f0fe;color:#0046ad;border:none;display:flex;justify-content:center;align-items:center;cursor:pointer;font-size:11px;">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                    <button onclick="if(typeof window.filtrerArticlesParBoutique === 'function') { window.filtrerArticlesParBoutique('${store.id_boutique}'); }" style="background:#0046ad;border:none;color:#fff;font-size:12px;font-weight:700;padding:8px 14px;border-radius:18px;cursor:pointer;">Rayon</button>
                </div>
            </div>`;
    });

    conteneur.innerHTML = html;

    liste.forEach((store, index) => {
        const idLogo = `img-logo-${store.id_boutique}-${index}`;
        const logo = store.logo_entreprise || `logo_${store.id_boutique.toLowerCase()}.jpg`;
        chargerImageBoutiqueOuArticle(store.id_boutique, logo, idLogo);
    });
}

export function ouvrirProfilBoutique(idBoutique, sourceLogoId) {
    const store = state.toutesLesBoutiques.find(b => b.id_boutique === idBoutique);
    if (!store) return;

    const srcLogo = document.getElementById(sourceLogoId)?.src || '';
    const nb = state.tousLesProduits.filter(p => p.boutiqueId === idBoutique).length;

    const ancienne = document.getElementById('shop-profile-modal');
    if (ancienne) ancienne.remove();

    const overlay = document.createElement('div');
    overlay.id = 'shop-profile-modal';
    overlay.style = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);`;

    overlay.innerHTML = `
        <div style="background:#fff;width:100%;max-width:350px;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3);position:relative;display:flex;flex-direction:column;padding:20px;box-sizing:border-box;text-align:center;">
            <button onclick="document.getElementById('shop-profile-modal').remove()" style="position:absolute;top:12px;right:12px;background:#f1f3f4;border:none;width:30px;height:30px;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div style="width:80px;height:80px;border-radius:50%;background:#f1f3f4;margin:10px auto;overflow:hidden;border:2px solid #0046ad;">
                <img src="${srcLogo}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <h2 style="font-size:18px;font-weight:800;color:#1c1e21;margin:6px 0 2px 0;">${store.nom}</h2>
            <p style="font-size:12px;color:#5f6368;margin:0 0 12px 0;"><i class="fa-solid fa-location-dot" style="color:#d93025;"></i> ${store.adresse || 'Goma'}</p>
            <div style="display:flex;justify-content:center;gap:16px;margin-bottom:16px;background:#f8f9fa;padding:10px;border-radius:8px;">
                <div>
                    <span style="font-size:14px;font-weight:700;color:#0046ad;display:block;">${nb}</span>
                    <span style="font-size:10px;color:#5f6368;">Articles en ligne</span>
                </div>
                <div style="border-left:1px solid #dadce0;"></div>
                <div>
                    <span style="font-size:14px;font-weight:700;color:#25D366;display:block;"><i class="fa-brands fa-whatsapp"></i></span>
                    <span style="font-size:10px;color:#5f6368;">Disponible</span>
                </div>
            </div>
            <p style="font-size:12px;color:#1c1e21;line-height:1.5;margin:0 0 20px 0;font-style:italic;">
                "${store.description || 'Bienvenue dans notre boutique. Découvrez nos articles de qualité aux meilleurs prix directement sur notre rayon.'}"
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button onclick="document.getElementById('shop-profile-modal').remove(); if(typeof window.filtrerArticlesParBoutique === 'function') window.filtrerArticlesParBoutique('${store.id_boutique}');" style="background:#0046ad;color:#fff;border:none;height:40px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;">
                    <i class="fa-solid fa-bag-shopping"></i> Voir tous les articles
                </button>
                <a href="tel:${store.telephone}" style="background:#25D366;color:#fff;border:none;height:40px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;display:flex;justify-content:center;align-items:center;gap:8px;">
                    <i class="fa-solid fa-phone"></i> Appeler le vendeur
                </a>
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

export function filtrerBoutiquesParBadge(typeBadge, boutonClique) {
    const boutons = boutonClique.parentNode.querySelectorAll('button');
    boutons.forEach(btn => {
        btn.style.background = '#fff';
        btn.style.color = btn.querySelector('.fa-crown') ? '#d4af37' : (btn.querySelector('.fa-circle-check') ? '#0046ad' : '#1c1e21');
        btn.style.border = '1px solid #dadce0';
    });
    boutonClique.style.background = '#0046ad';
    boutonClique.style.color = '#fff';
    boutonClique.style.border = 'none';

    if (typeBadge === 'tous') rendreListeBoutiquesFiltree(state.listeBoutiquesOriginale);
    else rendreListeBoutiquesFiltree(state.listeBoutiquesOriginale.filter(s => (s.badge?.type || s.badgeType) === typeBadge));
}

window.genererEcranBoutiques = genererEcranBoutiques;
window.rendreListeBoutiquesFiltree = rendreListeBoutiquesFiltree;
window.ouvrirProfilBoutique = ouvrirProfilBoutique;
window.filtrerBoutiquesParBadge = filtrerBoutiquesParBadge;