import { state } from '../core/state.js';

export function genererEcranVendre() {
    const mainRender = document.getElementById('main-render');
    if (!mainRender) return;

    mainRender.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px;width:100%;box-sizing:border-box;">
            <div style="background:#fff;border:1px solid #dadce0;border-radius:14px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="width:60px;height:60px;background:#e8f0fe;border-radius:50%;display:flex;justify-content:center;align-items:center;margin:0 auto 12px auto;">
                    <i class="fa-solid fa-comments" style="font-size:26px;color:#0046ad;"></i>
                </div>
                <h2 style="font-size:18px;font-weight:800;margin:0 0 6px 0;color:#1c1e21;">Centre de Contact Netiqui</h2>
                <p style="font-size:12px;color:#5f6368;margin:0;line-height:1.4;">Acheteurs, Vendeurs, Commissaires ou Partenaires... Contactez l'équipe de gestion <strong>Go Buznes</strong> en un clic.</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                <div onclick="window.basculerFormulaireNetiqui('boutique')" class="action-card-netiqui" style="background:#fff;border:2px solid #0046ad;border-radius:12px;padding:14px;text-align:center;cursor:pointer;">
                    <i class="fa-solid fa-store" style="font-size:20px;color:#0046ad;margin-bottom:6px;"></i>
                    <h4 style="font-size:12px;font-weight:700;margin:0;color:#1c1e21;">Créer ma Boutique</h4>
                </div>
                <div onclick="window.basculerFormulaireNetiqui('article')" class="action-card-netiqui" style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:14px;text-align:center;cursor:pointer;">
                    <i class="fa-solid fa-box-open" style="font-size:20px;color:#25D366;margin-bottom:6px;"></i>
                    <h4 style="font-size:12px;font-weight:700;margin:0;color:#1c1e21;">Ajouter un Article</h4>
                </div>
                <div onclick="window.basculerFormulaireNetiqui('signalement')" class="action-card-netiqui" style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:14px;text-align:center;cursor:pointer;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:20px;color:#d93025;margin-bottom:6px;"></i>
                    <h4 style="font-size:12px;font-weight:700;margin:0;color:#1c1e21;">Signaler un Problème</h4>
                </div>
                <div onclick="window.basculerFormulaireNetiqui('avis')" class="action-card-netiqui" style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:14px;text-align:center;cursor:pointer;">
                    <i class="fa-solid fa-lightbulb" style="font-size:20px;color:#f8a100;margin-bottom:6px;"></i>
                    <h4 style="font-size:12px;font-weight:700;margin:0;color:#1c1e21;">Avis & Suggestions</h4>
                </div>
            </div>
            <div id="netiqui-form-container" style="background:#fff;border:1px solid #dadce0;border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.05);"></div>
        </div>`;
    window.basculerFormulaireNetiqui('boutique');
}

export function basculerFormulaireNetiqui(type) {
    const c = document.getElementById('netiqui-form-container');
    if (!c) return;

    const cartes = document.querySelectorAll('.action-card-netiqui');
    cartes.forEach(card => card.style.border = '1px solid #dadce0');
    const map = { boutique: 'fa-store', article: 'fa-box-open', signalement: 'fa-triangle-exclamation', avis: 'fa-lightbulb' };
    cartes.forEach(card => { if (card.querySelector('.' + map[type])) card.style.border = '2px solid #0046ad'; });

    const forms = {
        boutique: `<h3 style="font-size:14px;font-weight:700;color:#0046ad;margin:0 0 12px 0;"><i class="fa-solid fa-store"></i> Demande d'ouverture de vitrine</h3>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <input type="text" id="netiqui-shop-name" placeholder="Nom du commerce" style="width:100%;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                <input type="text" id="netiqui-shop-address" placeholder="Adresse à Goma" style="width:100%;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                <input type="tel" id="netiqui-shop-tel" placeholder="Téléphone WhatsApp" style="width:100%;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                <button onclick="window.soumettreFormulaireNetiqui('boutique')" style="background:#0046ad;color:#fff;border:none;height:40px;border-radius:20px;font-size:13px;font-weight:700;margin-top:6px;cursor:pointer;">Envoyer la demande</button>
            </div>`,
        article: `<h3 style="font-size:14px;font-weight:700;color:#25D366;margin:0 0 12px 0;"><i class="fa-solid fa-box-open"></i> Soumettre un article</h3>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <input type="text" id="netiqui-prod-name" placeholder="Désignation" style="width:100%;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                <div style="display:flex;gap:8px;">
                    <input type="number" id="netiqui-prod-price" placeholder="Prix" style="flex:2;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                    <select id="netiqui-prod-devise" style="flex:1;height:38px;border:1px solid #dadce0;border-radius:8px;padding:0 4px;font-size:13px;outline:none;">
                        <option value="USD">USD</option><option value="FC">FC</option>
                    </select>
                </div>
                <input type="text" id="netiqui-prod-shop" placeholder="Nom de votre boutique" style="width:100%;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                <button onclick="window.soumettreFormulaireNetiqui('article')" style="background:#25D366;color:#fff;border:none;height:40px;border-radius:20px;font-size:13px;font-weight:700;margin-top:6px;cursor:pointer;">Soumettre via WhatsApp</button>
            </div>`,
        signalement: `<h3 style="font-size:14px;font-weight:700;color:#d93025;margin:0 0 12px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Signaler un abus</h3>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <select id="netiqui-report-reason" style="width:100%;height:38px;border:1px solid #dadce0;border-radius:8px;padding:0 8px;font-size:13px;outline:none;">
                    <option>Boutique suspecte / Fraude</option>
                    <option>Prix abusif ou mensonger</option>
                    <option>Comportement suspect d'un utilisateur</option>
                    <option>Autre problème technique</option>
                </select>
                <textarea id="netiqui-report-details" placeholder="Détails..." style="width:100%;height:70px;padding:8px 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;resize:none;box-sizing:border-box;font-family:inherit;"></textarea>
                <button onclick="window.soumettreFormulaireNetiqui('signalement')" style="background:#d93025;color:#fff;border:none;height:40px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;">Envoyer l'alerte</button>
            </div>`,
        avis: `<h3 style="font-size:14px;font-weight:700;color:#f8a100;margin:0 0 12px 0;"><i class="fa-solid fa-lightbulb"></i> Remarques & Avis</h3>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <input type="text" id="netiqui-feedback-role" placeholder="Votre rôle (client, vendeur...)" style="width:100%;height:38px;padding:0 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;box-sizing:border-box;">
                <textarea id="netiqui-feedback-text" placeholder="Votre message..." style="width:100%;height:70px;padding:8px 10px;border:1px solid #dadce0;border-radius:8px;outline:none;font-size:13px;resize:none;box-sizing:border-box;font-family:inherit;"></textarea>
                <button onclick="window.soumettreFormulaireNetiqui('avis')" style="background:#f8a100;color:#fff;border:none;height:40px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;">Partager mon idée</button>
            </div>`
    };
    c.innerHTML = forms[type];
}

export function soumettreFormulaireNetiqui(type) {
    const num = "+243998159146";
    let msg = "";

    if (type === 'boutique') {
        const nom = document.getElementById('netiqui-shop-name').value.trim();
        const adr = document.getElementById('netiqui-shop-address').value.trim();
        const tel = document.getElementById('netiqui-shop-tel').value.trim();
        if (!nom || !adr) { alert("Veuillez remplir le nom et l'adresse."); return; }
        msg = `🏪 *DEMANDE DE CRÉATION DE BOUTIQUE (Netiqui)*\n\n• *Nom* : ${nom}\n• *Adresse* : ${adr}\n• *Téléphone* : ${tel || 'Non spécifié'}\n\nMerci de valider ma vitrine sur Go Buznes !`;
    } else if (type === 'article') {
        const d = document.getElementById('netiqui-prod-name').value.trim();
        const p = document.getElementById('netiqui-prod-price').value.trim();
        const dev = document.getElementById('netiqui-prod-devise').value;
        const s = document.getElementById('netiqui-prod-shop').value.trim();
        if (!d || !p) { alert("Veuillez renseigner le nom et le prix."); return; }
        msg = `📦 *SOUMISSION NOUVEL ARTICLE*\n\n• *Article* : ${d}\n• *Prix* : ${p} ${dev}\n• *Boutique* : ${s || 'Non spécifiée'}\n\n_(Je vais joindre la photo)_`;
    } else if (type === 'signalement') {
        const r = document.getElementById('netiqui-report-reason').value;
        const d = document.getElementById('netiqui-report-details').value.trim();
        if (!d) { alert("Veuillez décrire la situation."); return; }
        msg = `⚠️ *ALERTE / SIGNALEMENT*\n\n• *Motif* : ${r}\n• *Détails* : ${d}`;
    } else if (type === 'avis') {
        const r = document.getElementById('netiqui-feedback-role').value.trim();
        const t = document.getElementById('netiqui-feedback-text').value.trim();
        if (!t) { alert("Le message ne peut pas être vide."); return; }
        msg = `💡 *AVIS & SUGGESTION*\n\n• *Profil* : ${r || 'Client/Visiteur'}\n• *Message* : ${t}`;
    }

    window.open(`https://wa.me/${num.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
}

window.genererEcranVendre = genererEcranVendre;
window.basculerFormulaireNetiqui = basculerFormulaireNetiqui;
window.soumettreFormulaireNetiqui = soumettreFormulaireNetiqui;