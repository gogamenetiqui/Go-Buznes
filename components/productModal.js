import { state } from '../core/state.js';
import { chargerImageBoutiqueOuArticle } from '../core/data.js';

function construireModale(prod, srcImageOrigine, boutiqueComplete, suffixe) {
    const nomLogoAttendu = boutiqueComplete.logo_entreprise || (prod.boutiqueId ? `logo_${prod.boutiqueId.toLowerCase()}.jpg` : "");
    const domLogoId = `modal-logo-${suffixe}-${prod.boutiqueId || 'shop'}`;
    const idModale = `product-preview-modal-${suffixe}`;

    const ancienne = document.getElementById('product-preview-modal');
    if (ancienne) ancienne.remove();

    const overlay = document.createElement('div');
    overlay.id = 'product-preview-modal';
    overlay.style = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);`;

    overlay.innerHTML = `
        <div style="background:#fff;width:100%;max-width:360px;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3);position:relative;display:flex;flex-direction:column;">
            <button onclick="document.getElementById('product-preview-modal').remove()"
                style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.9);border:none;width:32px;height:32px;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;z-index:100;box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                <i class="fa-solid fa-xmark" style="font-size:16px;"></i>
            </button>
            <div style="width:100%;aspect-ratio:1/1;background:#f1f3f4;overflow:hidden;">
                <img src="${srcImageOrigine}" alt="${prod.designation}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
                <div>
                    <span style="font-size:18px;font-weight:700;color:#0046ad;display:block;margin-bottom:4px;">${prod.prix} ${prod.devise || 'USD'}</span>
                    <h2 style="font-size:14px;font-weight:600;color:#1c1e21;margin:0;line-height:1.4;">${prod.designation}</h2>
                </div>
                <div style="display:flex;gap:10px;">
                    <button onclick="if(typeof window.ouvrirDiscussionWhatsApp === 'function') window.ouvrirDiscussionWhatsApp('${prod.boutiqueTel || boutiqueComplete.telephone || ''}', '${encodeURIComponent(prod.designation)}', '${prod.prix}')"
                        style="flex:1;background:#25D366;color:#fff;border:none;height:40px;border-radius:8px;font-size:12px;font-weight:700;display:flex;justify-content:center;align-items:center;gap:6px;cursor:pointer;">
                        <i class="fa-brands fa-whatsapp" style="font-size:16px;"></i> WhatsApp
                    </button>
                    <button onclick="if(typeof window.partagerContenuDirect === 'function') window.partagerContenuDirect('produit', '${prod.id_article}', '${encodeURIComponent(prod.designation)}', '${prod.prix}', '${prod.boutiqueId}')"
                        style="background:#f1f3f4;border:none;width:40px;height:40px;border-radius:8px;display:flex;justify-content:center;align-items:center;cursor:pointer;">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
                <div style="border-top:1px solid #dadce0;margin:4px 0;"></div>
                <div onclick="document.getElementById('product-preview-modal').remove(); if(typeof window.filtrerArticlesParBoutique === 'function') window.filtrerArticlesParBoutique('${prod.boutiqueId}');"
                    style="display:flex;align-items:center;justify-content:space-between;background:#f8f9fa;padding:10px;border-radius:8px;cursor:pointer;border:1px solid #dadce0;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:34px;height:34px;border-radius:50%;background:#fff;border:1px solid #dadce0;overflow:hidden;">
                            <img id="${domLogoId}" src="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;opacity:0;transition:opacity 0.2s;">
                        </div>
                        <div>
                            <h4 style="font-size:12px;font-weight:700;color:#1c1e21;margin:0;">${prod.boutiqueNom || boutiqueComplete.nom || 'Boutique'}</h4>
                            <span style="font-size:10px;color:#0046ad;font-weight:600;">Visiter le Vendeur <i class="fa-solid fa-chevron-right" style="font-size:8px;"></i></span>
                        </div>
                    </div>
                    <i class="fa-solid fa-store" style="color:#5f6368;"></i>
                </div>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    if (prod.boutiqueId && nomLogoAttendu && typeof chargerImageBoutiqueOuArticle === 'function') {
        chargerImageBoutiqueOuArticle(prod.boutiqueId, nomLogoAttendu, domLogoId);
    }
}

export function ouvrirApercuProduit(indexLocal, originImgId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const prod = state.articlesBonnesAffairesActuels[indexLocal];
    if (!prod) return;
    const srcImageOrigine = document.getElementById(originImgId)?.src || '';
    const boutiqueComplete = state.toutesLesBoutiques.find(b => b.id_boutique === prod.boutiqueId) || {};
    construireModale(prod, srcImageOrigine, boutiqueComplete, 'deal');
}

export function ouvrirApercuProduitProfil(indexLocal, originImgId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const prod = state.articlesProfilActuels[indexLocal];
    if (!prod) return;
    const srcImageOrigine = document.getElementById(originImgId)?.src || '';
    const boutiqueComplete = state.toutesLesBoutiques.find(b => b.id_boutique === prod.boutiqueId) || {};
    construireModale(prod, srcImageOrigine, boutiqueComplete, 'profil');
}

export function ouvrirApercuProduitDuRayon(indexLocal, originImgId, idBoutique, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const prod = state.articlesDuRayonActuel[indexLocal];
    if (!prod) return;
    const srcImageOrigine = document.getElementById(originImgId)?.src || '';
    const boutiqueComplete = state.toutesLesBoutiques.find(b => b.id_boutique === idBoutique) || {};
    construireModale(prod, srcImageOrigine, boutiqueComplete, 'rayon');
}

window.ouvrirApercuProduit = ouvrirApercuProduit;
window.ouvrirApercuProduitProfil = ouvrirApercuProduitProfil;
window.ouvrirApercuProduitDuRayon = ouvrirApercuProduitDuRayon;