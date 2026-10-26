const INFO_APP_VERSION = "1.0.0.4";
const LIEN_APP_PARTAGE = "https://gogamenetiqui.github.io/Go-Buznes/";

const RESEAUX_GO_BUZNES = {
    facebook:  { url: "https://www.facebook.com/GoBuznes",           label: "Page Facebook",  sub: "Go Buznes officiel",   icon: "fa-facebook",  color: "facebook" },
    instagram: { url: "https://www.instagram.com/gobuznes",          label: "Instagram",      sub: "Actus & nouveautés",   icon: "fa-instagram", color: "instagram" },
    threads:   { url: "https://www.threads.net/@gobuznes",           label: "Threads",        sub: "Fil d'actu",           icon: "fa-threads",   color: "threads" },
    tiktok:    { url: "https://www.tiktok.com/@gobuznes",            label: "TikTok",         sub: "Vidéos courtes",       icon: "fa-tiktok",    color: "tiktok" }
};

const COMMUNAUTES_GO_BUZNES = {
    waChannel: { url: "https://whatsapp.com/channel/0029VauiJG6CcW4tCOaTAU2e", label: "Chaîne WhatsApp", sub: "Annonces officielles",  icon: "fa-bullhorn", color: "whatsapp" },
    waGroup:   { url: "https://chat.whatsapp.com/J8dWZJFOuBF20FRIRGZU6d",     label: "Groupe WhatsApp", sub: "Discussion communauté", icon: "fa-users",    color: "whatsapp" },
    telegram:  { url: "https://t.me/gobuznes",                                 label: "Canal Telegram",  sub: "Alternative messagerie", icon: "fa-telegram", color: "telegram" },
    youtube:   { url: "https://www.youtube.com/@gobuznes",                            label: "Chaîne YouTube", sub: "Vidéos & Apprentissage", icon: "fa-youtube", color: "youtube"}
};

const RESEAUX_NETIQUI = {
    facebook:  { url: "https://www.facebook.com/Netiqui",            label: "Page Facebook", sub: "Studio Netiqui",       icon: "fa-facebook",  color: "facebook" },
    instagram: { url: "https://www.instagram.com/netiquiofficial",   label: "Instagram",     sub: "@netiquiofficial",     icon: "fa-instagram", color: "instagram" },
    threads:   { url: "https://www.threads.net/@netiquiofficial",    label: "Threads",       sub: "@netiquiofficial",     icon: "fa-threads",   color: "threads" },
    github:    { url: "https://github.com/netiquiofficial",            label: "GitHub",        sub: "Code source & projets", icon: "fa-github",   color: "github" }
};

const COMMUNAUTES_NETIQUI = {
    fbGroup:     { url: "https://www.facebook.com/groups/netiqui",         label: "Groupe Facebook",     sub: "Entraide développeurs", icon: "fa-users",    color: "group" },
    waCommunity: { url: "https://chat.whatsapp.com/netiquicommunity",      label: "Communauté WhatsApp", sub: "Support & échanges",   icon: "fa-comments", color: "community" },
    blog:        { url: "https://netiqui.blogspot.com",                    label: "Blog Netiqui",        sub: "Tutos & articles",     icon: "fa-newspaper",color: "blog" }
};

const SUPPORT = {
    whatsapp: { url: "https://wa.me/243998159146",                                  label: "WhatsApp Direct",         sub: "Réponse rapide",           icon: "fa-whatsapp",  color: "whatsapp" },
    email:    { url: "mailto:contact.netiqui@gmail.com",                            label: "Envoyer un Email",        sub: "contact.netiqui@gmail.com",icon: "fa-envelope",  color: "email" },
    blog:     { url: "https://netiqui.blogspot.com/search?q=Go+Buznes",             label: "Documentation officielle",sub: "Guides & articles",        icon: "fa-newspaper", color: "blog" }
};

document.addEventListener('DOMContentLoaded', () => {
    const btnInfo = document.getElementById('btn-info-app');
    if (btnInfo) {
        btnInfo.addEventListener('click', ouvrirModaleAPropos);
    } else {
        console.warn('[info_app] Bouton #btn-info-app introuvable dans le DOM.');
    }
});

function ouvrirModaleAPropos() {
    if (document.getElementById('info-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'info-modal-overlay';
    overlay.className = 'info-modal-overlay';

    overlay.innerHTML = `
        <div class="info-modal-box" role="dialog" aria-label="À propos de Go Buznes">
            <div class="info-modal-header">
                <div class="info-brand">
                    <div class="info-brand-logo"><i class="fa-solid fa-bag-shopping"></i></div>
                    <div class="info-brand-text">
                        <h2>Go Buznes</h2>
                        <p>Le commerce connecté • Goma</p>
                    </div>
                </div>
                <button class="info-modal-close" onclick="fermerModaleAPropos()" aria-label="Fermer">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="info-tabs">
                <button class="info-tab active" data-tab="app">
                    <i class="fa-solid fa-store"></i> Go Buznes
                </button>
                <button class="info-tab" data-tab="studio">
                    <i class="fa-solid fa-code"></i> Netiqui
                </button>
                <button class="info-tab" data-tab="support">
                    <i class="fa-solid fa-headset"></i> Support
                </button>
                <button class="info-tab" data-tab="system">
                    <i class="fa-solid fa-circle-info"></i> À propos
                </button>
            </div>

            <div class="info-modal-body">
                ${renderPanelApp()}
                ${renderPanelStudio()}
                ${renderPanelSupport()}
                ${renderPanelSystem()}
            </div>

            <div class="info-modal-footer">
                <div class="info-footer-version" id="info-version-tap" title="Version de l'application">
                    v${INFO_APP_VERSION}
                </div>
                <div class="info-footer-actions">
                    <button class="info-footer-icon-btn" onclick="copierLienApp()" title="Copier le lien">
                        <i class="fa-solid fa-link"></i>
                    </button>
                    <button class="info-footer-icon-btn" onclick="partagerApplication()" title="Partager l'app">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                    <button class="info-footer-icon-btn" onclick="noterApplication()" title="Noter l'application">
                        <i class="fa-solid fa-star"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.info-tab').forEach(tab => {
        tab.addEventListener('click', () => activerOnglet(overlay, tab.dataset.tab));
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fermerModaleAPropos();
    });

    initialiserTapsVersionDev();
    rafraichirStatutSysteme();
}

window.fermerModaleAPropos = function () {
    const overlay = document.getElementById('info-modal-overlay');
    if (overlay) overlay.remove();
    compteurTapsVersion = 0;
};

function activerOnglet(overlay, tabId) {
    overlay.querySelectorAll('.info-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabId);
    });
    overlay.querySelectorAll('.info-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.panel === tabId);
    });
    const body = overlay.querySelector('.info-modal-body');
    if (body) body.scrollTop = 0;
}

function renderPanelApp() {
    return `
        <div class="info-panel active" data-panel="app">
        
            <button class="info-soutenir-banner" onclick="fermerModaleAPropos(); if(typeof window.ouvrirModaleSoutien === 'function') window.ouvrirModaleSoutien();">
                <div class="info-soutenir-icon">
                    <i class="fa-solid fa-heart"></i>
                </div>
                <div class="info-soutenir-text">
                    <h4>Soutenir Go Buznes</h4>
                    <p>Aide-nous à développer cette mrkpc locale</p>
                </div>
                <i class="fa-solid fa-chevron-right info-soutenir-arrow"></i>
            </button>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-share-nodes"></i> Réseaux sociaux Go Buznes</div>
                <div class="info-link-grid">
                    ${renderCarteReseau(RESEAUX_GO_BUZNES.facebook)}
                    ${renderCarteReseau(RESEAUX_GO_BUZNES.instagram)}
                    ${renderCarteReseau(RESEAUX_GO_BUZNES.threads)}
                    ${renderCarteReseau(RESEAUX_GO_BUZNES.tiktok)}
                </div>
            </div>

                 <div>
                <div class="info-section-title"><i class="fa-solid fa-users"></i> Communautés Go Buznes</div>
                <div class="info-link-grid">
                    ${renderCarteReseau(COMMUNAUTES_GO_BUZNES.waChannel)}
                    ${renderCarteReseau(COMMUNAUTES_GO_BUZNES.waGroup)}
                    ${renderCarteReseau(COMMUNAUTES_GO_BUZNES.telegram)}
                    ${renderCarteReseau(COMMUNAUTES_GO_BUZNES.youtube)}
                </div>
            </div>

            <div class="info-status-card">
                <div class="info-status-row">
                    <span><i class="fa-solid fa-bullhorn"></i> Chaîne WhatsApp</span>
                    <span class="ok">Recommandé</span>
                </div>
                <p style="margin:0; font-size:11.5px; color:#5f6368; line-height:1.5;">
                    Rejoins notre chaîne WhatsApp pour recevoir en priorité les nouveaux arrivages, les promos et les mises à jour importantes de Go Buznes.
                </p>
                <button class="info-action-btn success" onclick="window.open('${COMMUNAUTES_GO_BUZNES.waChannel.url}', '_blank')">
                    <i class="fa-brands fa-whatsapp"></i> Rejoindre la chaîne
                </button>
            </div>
        </div>
    `;
}

function renderPanelStudio() {
    
    const messageProjet = "Bonjour Netiqui, je souhaite discuter d'un projet d'application.";
    const urlProjet = "https://wa.me/243998159146?text=" + encodeURIComponent(messageProjet);

    return `
        <div class="info-panel" data-panel="studio">
            <div>
                <div class="info-section-title"><i class="fa-solid fa-rocket"></i> Suivre Netiqui </div>
                <div class="info-link-grid">
                    ${renderCarteReseau(RESEAUX_NETIQUI.facebook)}
                    ${renderCarteReseau(RESEAUX_NETIQUI.instagram)}
                    ${renderCarteReseau(RESEAUX_NETIQUI.threads)}
                    ${renderCarteReseau(RESEAUX_NETIQUI.github)}
                </div>
            </div>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-handshake"></i> Communauté développeurs</div>
                <div class="info-link-grid">
                    ${renderCarteReseau(COMMUNAUTES_NETIQUI.fbGroup)}
                    ${renderCarteReseau(COMMUNAUTES_NETIQUI.waCommunity)}
                </div>
            </div>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-book-open"></i> Ressources</div>
                <div class="info-link-grid single">
                    ${renderCarteReseau(COMMUNAUTES_NETIQUI.blog)}
                </div>
            </div>

            <div class="info-status-card">
                <div class="info-status-row">
                    <span><i class="fa-solid fa-code"></i> Studio</span>
                    <span>Netiqui</span>
                </div>
                <p style="margin:0; font-size:11.5px; color:#5f6368; line-height:1.5;">
                    Netiqui conçoit des applications web et mobiles élégantes, performantes et adaptées au contexte congolais. Pour un projet, contactez-nous.
                </p>
                <button class="info-action-btn primary" onclick="window.open('${SUPPORT.whatsapp.url}', '_blank')">
                    <i class="fa-solid fa-paper-plane"></i> Discuter d'un projet
                </button>
            </div>
        </div>
    `;
}

function renderPanelSupport() {
    return `
        <div class="info-panel" data-panel="support">
            <div>
                <div class="info-section-title"><i class="fa-solid fa-headset"></i> Nous contacter</div>
                <div class="info-link-grid single">
                    ${renderCarteReseau(SUPPORT.whatsapp)}
                    ${renderCarteReseau(SUPPORT.email)}
                </div>
            </div>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-book"></i> Documentation</div>
                <div class="info-link-grid single">
                    ${renderCarteReseau(SUPPORT.blog)}
                </div>
            </div>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-circle-question"></i> Actions rapides</div>
                <div class="info-action-row">
                    <button class="info-action-btn" onclick="ouvrirSignalement()">
                        <i class="fa-solid fa-triangle-exclamation" style="color:#d93025;"></i> Signaler
                    </button>
                    <button class="info-action-btn" onclick="ouvrirSuggestion()">
                        <i class="fa-solid fa-lightbulb" style="color:#f8a100;"></i> Suggérer
                    </button>
                </div>
                <button class="info-action-btn" style="margin-top:8px;" onclick="noterApplication()">
                    <i class="fa-solid fa-star" style="color:#f8a100;"></i> Noter l'application
                </button>
            </div>

            <div class="info-status-card">
                <div class="info-status-row">
                    <span><i class="fa-solid fa-clock"></i> Temps de réponse</span>
                    <span class="ok">~ 2h</span>
                </div>
                <div class="info-status-row">
                    <span><i class="fa-solid fa-globe"></i> Localisation</span>
                    <span>Goma, RDC</span>
                </div>
                <div class="info-status-row">
                    <span><i class="fa-solid fa-language"></i> Langues</span>
                    <span>FR / SW</span>
                </div>
            </div>
        </div>
    `;
}

function renderPanelSystem() {
    return `
        <div class="info-panel" data-panel="system">
            <div class="info-status-card" id="info-status-runtime">
                <div class="info-status-row">
                    <span><i class="fa-solid fa-shop"></i> Boutiques chargées</span>
                    <span id="stat-boutiques">—</span>
                </div>
                <div class="info-status-row">
                    <span><i class="fa-solid fa-box"></i> Articles disponibles</span>
                    <span id="stat-articles">—</span>
                </div>
                <div class="info-status-row">
                    <span><i class="fa-solid fa-bullhorn"></i> Annonces actives</span>
                    <span id="stat-annonces">—</span>
                </div>
                <div class="info-status-row">
                    <span><i class="fa-solid fa-wifi"></i> Connexion</span>
                    <span id="stat-connexion" class="${navigator.onLine ? 'ok' : 'bad'}">
                        ${navigator.onLine ? 'En ligne' : 'Hors-ligne'}
                    </span>
                </div>
            </div>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-code-branch"></i> Nouveautés de cette version</div>
                <div class="info-changelog">
                    <strong>Version ${INFO_APP_VERSION}</strong>
                    <ul>
                        <li>Correction d'une erreur de syntaxe dans les panneaux</li>
                        <li>Intégration du Mode Dév.</li>
                        <li>Nouvelle organisation modulaire du code</li>
                        <li>Onglets de navigation dans la modale À Propos</li>
                        <li>Statuts système en temps réel</li>
                        <li>Boutons de partage et note rapide</li>
                    </ul>
                </div>
            </div>

            <div>
                <div class="info-section-title"><i class="fa-solid fa-scale-balanced"></i> Mentions légales</div>
                <div class="info-legal">
                    <strong>Go Buznes</strong> © 2026 Netiqui.<br>
                    L'utilisation de cette application implique le respect de la propriété intellectuelle de Netiqui et de ses partenaires affiliés. Toute reproduction non autorisée est interdite.
                </div>
            </div>

            <div id="info-dev-panel" style="display:none;">
                <div class="info-section-title"><i class="fa-solid fa-bug"></i> Mode développeur</div>
                <div class="info-action-row">
                    <button class="info-action-btn" onclick="devViderCache()">
                        <i class="fa-solid fa-broom"></i> Vider le cache
                    </button>
                    <button class="info-action-btn" onclick="devForcerRefresh()">
                        <i class="fa-solid fa-rotate"></i> Recharger
                    </button>
                </div>
                <button class="info-action-btn" style="margin-top:8px;" onclick="devAfficherStats()">
                    <i class="fa-solid fa-chart-simple"></i> Console stats
                </button>
            </div>
        </div>
    `;
}

function renderCarteReseau(r) {
    return `
        <a href="${r.url}" target="_blank" rel="noopener" class="info-link-card">
            <div class="info-link-icon ${r.color}">
                <i class="fa-brands ${r.icon}"></i>
            </div>
            <div class="info-link-label">
                ${r.label}
                ${r.sub ? `<small>${r.sub}</small>` : ''}
            </div>
            <i class="fa-solid fa-chevron-right info-link-arrow"></i>
        </a>
    `;
}

window.copierLienApp = function () {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(LIEN_APP_PARTAGE)
            .then(() => afficherToast("Lien copié dans le presse-papiers"))
            .catch(() => afficherToast("Copie impossible"));
    } else {
        const ta = document.createElement('textarea');
        ta.value = LIEN_APP_PARTAGE;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); afficherToast("Lien copié"); }
        catch { afficherToast("Copie impossible"); }
        ta.remove();
    }
};

window.partagerApplication = function () {
    const texte = "🛍️ *Découvre Go Buznes !*\n\nLa mrkpc de commerce du Congo : boutiques locales, articles à prix imbattables et vendeurs vérifiés.\n\n🔗 " + LIEN_APP_PARTAGE;
    if (navigator.share) {
        navigator.share({ title: 'Go Buznes', text: texte }).catch(() => {});
    } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(texte), '_blank');
    }
};

window.noterApplication = function () {
    afficherToast("Merci ! La notation sera bientôt disponible 🙏");
};

window.ouvrirSignalement = function () {
    fermerModaleAPropos();
    const msg = "⚠️ *SIGNALEMENT GO BUZNES*\n\nDécrivez ici votre problème :\n\n";
    window.open("https://wa.me/243998159146?text=" + encodeURIComponent(msg), '_blank');
};

window.ouvrirSuggestion = function () {
    fermerModaleAPropos();
    const msg = "💡 *SUGGESTION POUR GO BUZNES*\n\nVotre idée :\n\n";
    window.open("https://wa.me/243998159146?text=" + encodeURIComponent(msg), '_blank');
};

function rafraichirStatutSysteme() {
    setTimeout(() => {
        try {
            const s = window.stateRef || window.state || {};
            const nbBoutiques = (s.toutesLesBoutiques || []).length;
            const nbArticles  = (s.tousLesProduits   || []).length;
            const nbAnnonces  = (s.toutesLesAnnonces || []).length;

            const set = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };
            set('stat-boutiques', nbBoutiques || '—');
            set('stat-articles',  nbArticles  || '—');
            set('stat-annonces',  nbAnnonces  || '—');

            const conn = document.getElementById('stat-connexion');
            if (conn) {
                conn.textContent = navigator.onLine ? 'En ligne' : 'Hors-ligne';
                conn.className = navigator.onLine ? 'ok' : 'bad';
            }
        } catch (e) {
            console.warn('[info_app] Statut indisponible :', e);
        }
    }, 50);
}

let compteurTapsVersion = 0;

function initialiserTapsVersionDev() {
    const btn = document.getElementById('info-version-tap');
    if (!btn) return;
    btn.addEventListener('click', () => {
        compteurTapsVersion++;
        if (compteurTapsVersion >= 7) {
            compteurTapsVersion = 0;
            const panel = document.getElementById('info-dev-panel');
            if (panel) {
                panel.style.display = 'block';
                const overlay = document.getElementById('info-modal-overlay');
                if (overlay) activerOnglet(overlay, 'system');
                afficherToast("🔓 Mode développeur activé");
            }
        } else if (compteurTapsVersion >= 4) {
            afficherToast("Encore " + (7 - compteurTapsVersion) + " clics...");
        }
    });
}

window.devViderCache = function () {
    try {
        localStorage.removeItem('gb_cache');
        localStorage.removeItem('gb_annonces_cache');
        afficherToast("✅ Cache local vidé");
    } catch { afficherToast("Erreur de vidage"); }
};

window.devForcerRefresh = function () {
    window.location.reload();
};

window.devAfficherStats = function () {
    const s = window.stateRef || {};
    console.log('=== STATS GO BUZNES ===');
    console.log('Boutiques :', (s.toutesLesBoutiques || []).length);
    console.log('Articles :',  (s.tousLesProduits   || []).length);
    console.log('Annonces :',  (s.toutesLesAnnonces || []).length);
    console.log('Cache local :', localStorage.getItem('gb_cache') ? 'présent' : 'vide');
    console.log('Cache annonces :', localStorage.getItem('gb_annonces_cache') ? 'présent' : 'vide');
    afficherToast("📊 Stats dans la console (F12)");
};

let toastTimeoutId = null;
function afficherToast(message) {
    let toast = document.getElementById('gb-toast-info');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'gb-toast-info';
        toast.className = 'gb-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + message;
    toast.classList.add('show');
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => toast.classList.remove('show'), 2200);
}