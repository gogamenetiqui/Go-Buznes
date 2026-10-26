import { state } from '../core/state.js';
import { chargerImageBoutiqueOuArticle } from '../core/data.js';
import { afficherGbAlerte, afficherGbConfirmation } from '../core/modals.js';

export function genererEcranProfil() {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    const tous = [...state.tousLesProduits].sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
    const afficher = tous.slice(0, state.limiteArticlesAffichage);

    let html = `
        <div style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 1px 2px rgba(0,0,0,0.05);text-align:center;">
            <div style="width:50px;height:50px;background:#e8f0fe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">
                <i class="fa-solid fa-tags" style="font-size:20px;color:#0046ad;"></i>
            </div>
            <h3 style="font-size:16px;font-weight:700;margin:0 0 2px 0;">Les Meilleures Offres</h3>
            <p style="font-size:12px;color:#5f6368;margin:0;">Affichage de ${afficher.length} sur ${tous.length} articles à Goma</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;">`;

    if (afficher.length === 0) {
        html += `<div style="grid-column:span 2;text-align:center;padding:30px;color:#5f6368;font-size:12px;">Aucun article disponible.</div>`;
    } else {
        afficher.forEach((prod, index) => {
            const id = `img-catalogue-global-${prod.boutiqueId || 'shop'}-${index}`;
            let icone = '';
            if (prod.badgeType === 'or') icone = `<i class="fa-solid fa-crown" style="color:#d4af37;margin-left:2px;"></i>`;
            if (prod.badgeType === 'bleu') icone = `<i class="fa-solid fa-circle-check" style="color:#0046ad;margin-left:2px;"></i>`;

            html += `
                <div style="background:#fff;border:1px solid var(--border-light);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow-sm);position:relative;">
                    <div style="position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:#f1f3f4;">
                        <img id="${id}" src="" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.2s;">
                    </div>
                    <div style="padding:8px;display:flex;flex-direction:column;gap:4px;justify-content:space-between;flex:1;">
                        <div>
                            <h3 style="font-size:12px;font-weight:600;margin:0;color:var(--text-body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.designation}</h3>
                            <p style="font-size:10px;color:var(--text-muted);margin:1px 0 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.boutiqueNom || 'Boutique'} ${icone}</p>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:4px;">
                            <span style="font-size:12px;font-weight:700;color:var(--logo-blue);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${prod.prix} ${prod.devise || 'USD'}</span>
                            <button onclick="if(typeof window.ouvrirDiscussionWhatsApp === 'function') window.ouvrirDiscussionWhatsApp('${prod.boutiqueTel || ''}', '${encodeURIComponent(prod.designation)}', '${prod.prix}');"
                                style="background:#e8f0fe;color:#0046ad;border:none;padding:5px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:2px;white-space:nowrap;">
                                <i class="fa-brands fa-whatsapp"></i> Prendre
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    }

    html += `</div>`;

    if (tous.length > state.limiteArticlesAffichage) {
        html += `<div style="text-align:center;margin-bottom:20px;">
            <button onclick="window.chargerPlusDArticlesProfil()" style="background:#0046ad;color:#fff;border:none;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-plus"></i> Afficher 100 articles de plus
            </button>
        </div>`;
    }

    html += `
        <div style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            <h4 style="font-size:14px;font-weight:700;color:#1c1e21;margin:0 0 10px 0;">Une suggestion ? Écrivez à Netiqui</h4>
            <textarea id="input-suggestion" placeholder="Aidez-nous à améliorer Go Buznes..." style="width:100%;height:80px;padding:10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;resize:none;margin-bottom:10px;box-sizing:border-box;font-family:inherit;"></textarea>
            <button onclick="window.confirmerSuggestion()" style="background:#f1f3f4;color:#1c1e21;border:none;width:100%;height:36px;border-radius:18px;font-weight:500;font-size:13px;cursor:pointer;">Envoyer l'idée</button>
        </div>`;

    mainRender.innerHTML = html;
    state.articlesProfilActuels = afficher;

    afficher.forEach((prod, index) => {
        const id = `img-catalogue-global-${prod.boutiqueId || 'shop'}-${index}`;
        const nomImg = prod.image || prod.imageNom || "";
        chargerImageBoutiqueOuArticle(prod.boutiqueId, nomImg, id);
    });
}

export function chargerPlusDArticlesProfil() {
    state.limiteArticlesAffichage += 100;
    genererEcranProfil();
}

export function confirmerSuggestion() {
    const txt = document.getElementById('input-suggestion').value.trim();
    if (!txt) { afficherGbAlerte("Veuillez écrire un texte."); return; }
    afficherGbConfirmation("Confirmez-vous l'envoi de cette idée à l'équipe Netiqui ?", () => {
        const msg = `💡 *SUGGESTION UTILISATEUR GO BUZNES*\n\n"${txt}"`;
        window.open(`https://wa.me/${state.NUMERO_NETIQUI}?text=${encodeURIComponent(msg)}`, '_blank');
        document.getElementById('input-suggestion').value = '';
    });
}

window.genererEcranProfil = genererEcranProfil;
window.chargerPlusDArticlesProfil = chargerPlusDArticlesProfil;
window.confirmerSuggestion = confirmerSuggestion;