import { chargerImageAnnonce } from '../core/data.js';

export function construireHtmlAnnonceNetiqui(annonce, emplacement) {
    let imagesHtml = '';
    if (annonce.images && annonce.images.length > 0) {
        imagesHtml += `<div style="width:100%;display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;margin-bottom:10px;" class="hide-scrollbar">`;
        annonce.images.forEach((_, i) => {
            const id = `img-pub-${emplacement}-${annonce.id_annonce}-${i}`;
            imagesHtml += `<div style="flex:0 0 100%;width:100%;aspect-ratio:1/1;border-radius:8px;overflow:hidden;scroll-snap-align:start;background:#f1f3f4;">
                <img id="${id}" src="" alt="Image Pub" style="width:100%;height:100%;object-fit:cover;"></div>`;
        });
        imagesHtml += `</div>`;
    }

    return `
        <div style="background:#fff;border:1px solid var(--border-light);border-radius:12px;padding:14px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;">
            ${imagesHtml}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <h3 onclick="if(typeof window.executerClicAnnonceur === 'function') window.executerClicAnnonceur('${annonce.type_lien}', '${annonce.cible_lien}')"
                    style="font-size:13px;font-weight:700;color:var(--logo-blue);cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                    <i class="fa-solid fa-bullhorn" style="font-size:11px;color:var(--text-muted);"></i> ${annonce.annonceur}
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px;opacity:0.6;"></i>
                </h3>
                <span style="font-size:10px;color:#9aa0a6;text-transform:uppercase;font-weight:700;letter-spacing:0.3px;">Sponsorisé</span>
            </div>
            <p style="font-size:12px;color:var(--text-body);line-height:1.4;white-space:pre-line;margin:0 0 10px 0;">${annonce.description}</p>
            <div style="border-top:1px solid #f1f3f4;padding-top:8px;display:flex;justify-content:flex-end;">
                <button onclick="if(typeof window.partagerContenuDirect === 'function') window.partagerContenuDirect('annonce', '${annonce.id_annonce}', '${encodeURIComponent(annonce.annonceur)}')"
                        style="background:#f1f3f4;border:none;padding:6px 12px;border-radius:16px;font-size:11px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:4px;">
                    <i class="fa-solid fa-share-nodes"></i> Partager
                </button>
            </div>
        </div>`;
}

export function declencherImagesAnnonceNetiqui(annonce, emplacement) {
    if (annonce.images && annonce.images.length > 0) {
        annonce.images.forEach((nomImg, i) => {
            const id = `img-pub-${emplacement}-${annonce.id_annonce}-${i}`;
            if (typeof chargerImageAnnonce === 'function') chargerImageAnnonce(annonce.id_annonce, nomImg, id);
        });
    }
}

window.construireHtmlAnnonceNetiqui = construireHtmlAnnonceNetiqui;
window.declencherImagesAnnonceNetiqui = declencherImagesAnnonceNetiqui;