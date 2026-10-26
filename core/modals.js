export function afficherGbAlerte(message) {
    const ancienne = document.getElementById('gb-modal-container');
    if (ancienne) ancienne.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gb-modal-container';
    overlay.className = 'gb-overlay';
    overlay.innerHTML = `
        <div class="gb-alert-box">
            <div class="gb-alert-logo">GB</div>
            <p class="gb-alert-text">${message}</p>
            <div class="gb-alert-actions">
                <button class="gb-alert-btn gb-alert-btn-primary" onclick="document.getElementById('gb-modal-container').remove()">OK</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

export function afficherGbConfirmation(message, callbackAction) {
    const ancienne = document.getElementById('gb-modal-container');
    if (ancienne) ancienne.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gb-modal-container';
    overlay.className = 'gb-overlay';
    overlay.innerHTML = `
        <div class="gb-alert-box">
            <div class="gb-alert-logo">GB</div>
            <p class="gb-alert-text">${message}</p>
            <div class="gb-alert-actions">
                <button class="gb-alert-btn gb-alert-btn-secondary" id="gb-btn-cancel">Annuler</button>
                <button class="gb-alert-btn gb-alert-btn-primary" id="gb-btn-confirm">Confirmer</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    document.getElementById('gb-btn-cancel').onclick = () => overlay.remove();
    document.getElementById('gb-btn-confirm').onclick = () => { overlay.remove(); callbackAction(); };
}

export function afficherAlerteQuitterStylisee() {
    if (document.getElementById('gb-alert-quitter-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gb-alert-quitter-overlay';
    overlay.style = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;`;
    overlay.innerHTML = `
        <div style="background:#fff;width:100%;max-width:320px;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.15);box-sizing:border-box;text-align:center;">
            <div class="gb-alert-text">Voulez-vous vraiment quitter l'application Go Buznes ?</div>
            <div class="gb-alert-actions">
                <button class="gb-alert-btn gb-alert-btn-secondary" id="btn-alerte-annuler">Annuler</button>
                <button class="gb-alert-btn gb-alert-btn-primary" id="btn-alerte-quitter">Quitter</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    document.getElementById('btn-alerte-annuler').addEventListener('click', () => {
        overlay.remove();
        window.history.pushState({ site: 'gobuznes' }, '');
    });
    document.getElementById('btn-alerte-quitter').addEventListener('click', () => {
        overlay.remove();
        if (navigator.app && navigator.app.exitApp) navigator.app.exitApp();
        else window.location.href = "about:blank";
    });
}

window.afficherGbAlerte = afficherGbAlerte;
window.afficherGbConfirmation = afficherGbConfirmation;
window.afficherAlerteQuitterStylisee = afficherAlerteQuitterStylisee;