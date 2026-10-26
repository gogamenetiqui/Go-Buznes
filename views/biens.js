import { state } from '../core/state.js';
import { chargerImageAnnonce } from '../core/data.js';

export function genererEcranAnnoncesEtNews() {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    if (state.toutesLesAnnonces.length === 0) {
        mainRender.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#5f6368;">
            <i class="fa-solid fa-bullhorn" style="font-size:44px;color:#dadce0;margin-bottom:12px;"></i>
            <h3 style="font-size:16px;font-weight:500;margin:0 0 6px 0;color:#1c1e21;">Actualités & Offres</h3>
            <p style="font-size:13px;margin:0;">Aucune annonce active pour le moment.</p>
        </div>`;
        return;
    }

    const triees = [...state.toutesLesAnnonces].sort((a, b) => {
        const da = a.date_fin ? new Date(a.date_fin) : new Date("2099-12-31");
        const db = b.date_fin ? new Date(b.date_fin) : new Date("2099-12-31");
        return da - db;
    });

    let html = `<div style="display:flex;flex-direction:column;gap:20px;width:100%;box-sizing:border-box;">`;

    triees.forEach((a) => {
        const idUnique = a.id_annonce;
        let imgHtml = '';
        if (a.images && a.images.length > 0) {
            imgHtml = `<div style="width:100%;aspect-ratio:1/1;display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;margin-bottom:10px;border-radius:12px;" class="hide-scrollbar">`;
            a.images.forEach((_, i) => {
                const id = `img-post-${idUnique}-${i}`;
                imgHtml += `<div style="flex:0 0 100%;width:100%;height:100%;scroll-snap-align:start;background:#f1f3f4;border-radius:12px;overflow:hidden;position:relative;">
                    <img id="${id}" src="" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;"></div>`;
            });
            imgHtml += `</div>`;
        }

        let badge = a.date_fin
            ? `<span data-countdown="${a.date_fin}" style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;background:#fce8e6;color:#d93025;border:1px solid #fad2cf;white-space:nowrap;"><i class="fa-solid fa-clock"></i> Calcul...</span>`
            : `<span style="font-size:11px;padding:4px 10px;border-radius:12px;background:#e8f0fe;color:#0046ad;white-space:nowrap;"><i class="fa-regular fa-calendar"></i> Actif</span>`;

        html += `
            <div style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
                ${imgHtml}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;">
                    <h3 onclick="if(typeof window.executerClicAnnonceur === 'function') window.executerClicAnnonceur('${a.type_lien}', '${a.cible_lien}');"
                        style="font-size:14px;font-weight:700;color:#0046ad;cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin:0;">
                        <i class="fa-solid fa-bullhorn" style="font-size:11px;color:#5f6368;"></i> ${a.annonceur}
                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;opacity:0.6;"></i>
                    </h3>
                    ${badge}
                </div>
                <p style="font-size:13px;color:#1c1e21;line-height:1.5;white-space:pre-line;margin-bottom:12px;flex:1;">${a.description}</p>
                <div style="border-top:1px solid #f1f3f4;padding-top:10px;display:flex;justify-content:flex-end;">
                    <button onclick="if(typeof window.partagerContenuDirect === 'function') window.partagerContenuDirect('annonce', '${idUnique}', '${encodeURIComponent(a.annonceur)}');"
                        style="background:#f1f3f4;color:#1c1e21;border:none;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;">
                        <i class="fa-solid fa-share-nodes"></i> Partager l'annonce
                    </button>
                </div>
            </div>`;
    });

    html += `</div>`;
    mainRender.innerHTML = html;

    triees.forEach(a => {
        if (a.images && a.images.length > 0) {
            a.images.forEach((nomImg, i) => {
                const id = `img-post-${a.id_annonce}-${i}`;
                if (typeof chargerImageAnnonce === 'function') chargerImageAnnonce(a.id_annonce, nomImg, id);
            });
        }
    });

    initialiserComptesAReboursNetiqui();
}

export function initialiserComptesAReboursNetiqui() {
    if (state.netiquiCountdownInterval) clearInterval(state.netiquiCountdownInterval);

    function actualiser() {
        const balises = document.querySelectorAll('[data-countdown]');
        if (balises.length === 0) { clearInterval(state.netiquiCountdownInterval); return; }
        const now = Date.now();
        balises.forEach(b => {
            const cible = new Date(b.getAttribute('data-countdown')).getTime();
            const d = cible - now;
            if (d < 0) {
                b.style.background = "#f1f3f4";
                b.style.color = "#5f6368";
                b.style.border = "1px solid #dadce0";
                b.innerHTML = `<i class="fa-solid fa-hourglass-end"></i> Expiré`;
            } else {
                const j = Math.floor(d / (1000 * 60 * 60 * 24));
                const h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((d % (1000 * 60)) / 1000);
                const pad = n => n < 10 ? '0' + n : n;
                b.innerHTML = `<i class="fa-solid fa-stopwatch font-pulse"></i> ${j > 0 ? j + 'j ' : ''}${pad(h)}h ${pad(m)}m ${pad(s)}s`;
            }
        });
    }

    actualiser();
    state.netiquiCountdownInterval = setInterval(actualiser, 1000);
}

window.genererEcranAnnoncesEtNews = genererEcranAnnoncesEtNews;
window.initialiserComptesAReboursNetiqui = initialiserComptesAReboursNetiqui;