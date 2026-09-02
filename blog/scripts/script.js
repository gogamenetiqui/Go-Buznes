// --- 0. IMPORT ET INITIALISATION DE LA CONFIGURATION ---
async function ensureConfigLoaded() {
    //CONFIG
    if (typeof CONFIG === 'undefined') {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'config.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (err) {
            console.error("Erreur critique : Impossible de charger la config", err);
        }
    }
}

// Lancement global au chargement du document
document.addEventListener("DOMContentLoaded", async () => {
    // 1. S'assure que CONFIG est chargé avant d'exécuter la suite
    await ensureConfigLoaded();

    // 2. Rendu synchrone de l'interface
    renderHeader();
    renderFooter();
    renderBreadcrumb();
    renderSidebarInfo();
    renderSidebarAppWidget();
    renderCtaBanner();
    renderArticlePromos();
    
    // 3. Scan asynchrone des articles & Widgets dépendants
    await scanArticlesMetadata();
    renderMoreArticlesWidget();
    setupSearchEngine();
    bindDownloadButtons();
});


/* --- 1. HEADER --- */
function renderHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
        <header>
            <div class="container header-content">
                <a href="https://gogamenetiqui.github.io/Go-Buznes/" class="logo">
                    <span class="logo-icon"><img src="assets/gobuznes_b.png" style="width:100%; height:100%"/></span>
                    <span>Go Buznes</span>
                </a>
                
                <ul class="nav-links">
                    <li><a href="https://gogamenetiqui.github.io/Go-Buznes/">Accueil</a></li>
                </ul>

                <div class="header-actions">
                    <button class="btn-blue btn-download-app btn-sm" style="padding: 6px 14px; font-size: 0.82rem;">
                        <i class="fa-solid fa-download"></i> L'App
                    </button>
                    <button class="icon-btn" id="open-search-btn" title="Rechercher des articles">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
            </div>
        </header>

        <div id="search-modal" class="search-modal" style="display: none;">
            <div class="search-modal-content">
                <div class="search-header">
                    <input type="text" id="search-input" placeholder="Rechercher un article, une ville, une astuce..." autocomplete="off">
                    <button id="close-search-btn" class="icon-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div id="search-results" class="search-results-list">
                    <p class="search-placeholder">Tapez au moins 2 caractères pour rechercher...</p>
                </div>
            </div>
        </div>
    `;
}

/* --- 2. FOOTER --- */
function renderFooter() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer>
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-logo-desc">
                        <a href="https://gogamenetiqui.github.io/Go-Buznes/" class="logo">
                            <span class="logo-icon"><img src="assets/gobuznes_b.png" style="width:100%; height:100%"/></i></span>
                            <span>Go Buznes</span>
                        </a>
                        <p>Go Buznes est la marketplace qui connecte les boutiques, les services et les clients partout en RDC.</p>
                        <div class="social-links">
                            <a href="${CONFIG.socials.tiktok}" target="_blank" class="social-link" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                            <a href="${CONFIG.socials.instagram}" target="_blank" class="social-link" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                            <a href="${CONFIG.socials.threads}" target="_blank" class="social-link" title="Threads"><img src="icons/threads.svg"><i class="fa-brands fa-threads"></i></a>
                            <a href="${CONFIG.socials.facebook}" target="_blank" class="social-link" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        </div>
                    </div>

                    <div class="footer-column">
                        <h4>Navigation</h4>
                        <ul>
                            <li><a href="https://gogamenetiqui.github.io/Go-Buznes/">Accueil</a></li>
                        </ul>
                    </div>

                    <div class="footer-column">
                        <h4>Informations</h4>
                        <ul>
                            <li><a href="politique_et_conditions_signalement.html">Politique et conditions de signalement</a></li>
                            <li><a href="conditions_generales_utilisation.html">Conditions Générales d'utilisation</a></li>
                            <li><a href="politique_de_confidentialite.html">Politique de confidentialité</a></li>
                            <li><a href="mentions_legales.html">Mentions légales</a></li>
                        </ul>
                    </div>

                    <div class="footer-column">
                        <h4>Aide</h4>
                        <ul>
                            
                        </ul>
                    </div>

                    <div class="footer-column">
                        <h4>Contact Netiqui</h4>
                        <ul class="contact-list">
                            <li><i class="fa-regular fa-envelope"></i> contact.netiqui@gmail.com </li>
                            <li><i class="fa-solid fa-phone"></i> +243 998 159 146</li>
                            <li><i class="fa-solid fa-location-dot"></i> Goma, RDC</li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div>© 2026 Go Buznes. Tous droits réservés.</div>
                    <div>Développé avec <i class="fa-solid fa-heart" style="color: red;"></i> par <strong>Netiqui</strong></div>
                </div>
            </div>
        </footer>
    `;
}

/* --- 3. BREADCRUMB AUTOMATIQUE --- */
function renderBreadcrumb() {
    const breadcrumbContainer = document.getElementById('app-breadcrumb');
    if (!breadcrumbContainer) return;

    const articleTitle = getMetaContent('article-title') || document.title;
    breadcrumbContainer.className = 'breadcrumb';
    breadcrumbContainer.innerHTML = `
        <a href="https://gogamenetiqui.github.io/Go-Buznes/">Accueil</a> &gt; <a href="index.html">Blog</a> &gt; <span>${articleTitle}</span>
    `;
}

/* --- 4. SCAN DES METADONNÉES + CLASSEMENT PAR NEWS LA PLUS RÉCENTE --- */
async function scanArticlesMetadata() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    loadedArticlesIndex = [];

    for (const file of CONFIG.articleFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) continue;

            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const title = doc.querySelector('meta[name="article-title"]')?.content || doc.title;
            const image = doc.querySelector('meta[name="article-image"]')?.content || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80';
            const description = doc.querySelector('meta[name="article-description"]')?.content || '';
            const rawDate = doc.querySelector('meta[name="article-date"]')?.content || '1 Jan 2026';
            
            const timestamp = new Date(rawDate).getTime() || 0;

            loadedArticlesIndex.push({
                file,
                title,
                image,
                description,
                rawDate,
                timestamp,
                isCurrent: (file === currentPath)
            });
        } catch (err) {
            console.warn(`Scan échoué pour le fichier : ${file}`);
        }
    }

    loadedArticlesIndex.sort((a, b) => b.timestamp - a.timestamp);
}

/* --- 5. WIDGET "VOIR PLUS" --- */
function renderMoreArticlesWidget() {
    const targetContainer = document.getElementById('sidebar-more-articles-widget');
    if (!targetContainer) return;

    targetContainer.className = 'sidebar-widget';

    const filteredArticles = loadedArticlesIndex.filter(art => !art.isCurrent).slice(0, 10);

    if (filteredArticles.length === 0) {
        targetContainer.innerHTML = `<h3 class="widget-title">Voir plus</h3><p style="font-size:0.8rem; color: var(--text-muted);">Aucun autre article disponible.</p>`;
        return;
    }

    targetContainer.innerHTML = `
        <h3 class="widget-title">Voir plus <span style="font-size: 0.75rem; color: var(--primary-blue); float: right;">Le plus récent en haut</span></h3>
        <div class="recent-posts">
            ${filteredArticles.map(art => `
                <a href="${art.file}" class="recent-card">
                    <img src="${art.image}" alt="${art.title}" class="recent-img">
                    <div class="recent-info">
                        <h4>${art.title}</h4>
                        <p>${art.description}</p>
                        <span style="font-size:0.7rem; color: var(--primary-blue); font-weight:600;">${art.rawDate}</span>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
}

/* --- 6. MOTEUR DE RECHERCHE DYNAMIQUE --- */
function setupSearchEngine() {
    const openBtn = document.getElementById('open-search-btn');
    const closeBtn = document.getElementById('close-search-btn');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        input.value = '';
        resultsContainer.innerHTML = '<p class="search-placeholder">Tapez au moins 2 caractères pour rechercher...</p>';
    });

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            resultsContainer.innerHTML = '<p class="search-placeholder">Réalisez au moins 2 caractères pour rechercher...</p>';
            return;
        }

        const matches = loadedArticlesIndex.filter(art => 
            art.title.toLowerCase().includes(query) || 
            art.description.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<p class="search-placeholder">Aucun article trouvé pour votre recherche.</p>';
            return;
        }

        resultsContainer.innerHTML = matches.map(art => `
            <a href="${art.file}" class="search-result-item">
                <img src="${art.image}" alt="${art.title}">
                <div>
                    <h4>${art.title}</h4>
                    <p>${art.description}</p>
                </div>
            </a>
        `).join('');
    });
}

/* --- 7. INJECTION DES PROMOS DANS L'ARTICLE --- */
function renderArticlePromos() {
    const promoContainer = document.getElementById('dynamic-promo-box');
    if (!promoContainer || !CONFIG.promos || CONFIG.promos.length === 0) return;

    const selectedPromo = CONFIG.promos[Math.floor(Math.random() * CONFIG.promos.length)];

    promoContainer.className = 'callout-box';
    promoContainer.innerHTML = `
        <div class="callout-left">
            <div class="callout-icon"><i class="fa-solid ${selectedPromo.icon}"></i></div>
            <div>
                <h4>${selectedPromo.title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${selectedPromo.desc}</p>
            </div>
        </div>
        <button class="btn-blue btn-download-app">${selectedPromo.cta}</button>
    `;
}

/* --- 8. WIDGET SIDEBAR : INFOS ARTICLE --- */
function renderSidebarInfo() {
    const infoContainer = document.getElementById('sidebar-info-widget');
    if (!infoContainer) return;

    const date = getMetaContent('article-date') || 'Récent';
    const author = getMetaContent('article-author') || 'Netiqui Rédac';
    const category = getMetaContent('article-category') || 'Actualités';
    const readtime = getMetaContent('article-readtime') || '5 min';

    infoContainer.className = 'sidebar-widget';
    infoContainer.innerHTML = `
        <h3 class="widget-title">Informations</h3>
        <ul class="info-list">
            <li class="info-item">
                <i class="fa-regular fa-calendar info-icon"></i>
                <div class="info-text"><label>Publié le</label><span>${date}</span></div>
            </li>
            <li class="info-item">
                <i class="fa-regular fa-user info-icon"></i>
                <div class="info-text"><label>Auteur</label><span>${author}</span></div>
            </li>
            <li class="info-item">
                <i class="fa-regular fa-folder info-icon"></i>
                <div class="info-text"><label>Catégorie</label><span>${category}</span></div>
            </li>
            <li class="info-item">
                <i class="fa-regular fa-clock info-icon"></i>
                <div class="info-text"><label>Temps de lecture estimé</label><span>${readtime}</span></div>
            </li>
        </ul>
        <div class="share-buttons">
            <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: auto; align-self: center;">Partager :</span>
            <button class="share-btn" onclick="shareArticle('facebook')"><i class="fa-brands fa-facebook-f"></i></button>
            <button class="share-btn" onclick="shareArticle('whatsapp')"><i class="fa-brands fa-whatsapp"></i></button>
            <button class="share-btn" onclick="shareArticle('twitter')"><i class="fa-brands fa-x-twitter fa-x"></i></button>
            <button class="share-btn" onclick="shareArticle('link')"><i class="fa-solid fa-link"></i></button>
        </div>
    `;
}

/* --- 9. WIDGET SIDEBAR : STORE --- */
function renderSidebarAppWidget() {
    const appContainer = document.getElementById('sidebar-app-widget');
    if (!appContainer) return;

    appContainer.className = 'app-widget';
    appContainer.innerHTML = `
        <h3>Emportez Go Buznes partout avec vous !</h3>
        <p>Votre buznes dans votre poche.</p>
        <div class="store-btns">
            <a href="${CONFIG.playStoreUrl}" target="_blank" class="store-btn">
                <i class="fa-brands fa-google-play fa-xl"></i>
                <div>
                    <div style="font-size: 0.6rem; text-transform: uppercase;">Disponible sur</div>
                    <strong>Adroid</strong>
                </div>
            </a>
            <a href="${CONFIG.appStoreUrl}" target="_blank" class="store-btn">
                <i class="fa-brands fa-apple fa-xl"></i>
                <div>
                    <div style="font-size: 0.6rem; text-transform: uppercase;">Disponible dans</div>
                    <strong>iOS</strong>
                </div>
            </a>
        </div>
    `;
}

/* --- 10. BANNIÈRE SECTION CONCEPTEUR --- */
function renderCtaBanner() {
    const ctaContainer = document.getElementById('app-cta-banner');
    if (!ctaContainer || !CONFIG.developer) return;

    const dev = CONFIG.developer;

    ctaContainer.className = 'cta-section';
    ctaContainer.innerHTML = `
        <div class="cta-left" style="display: flex; align-items: center; gap: 20px;">
            <img src="${dev.photo}" alt="${dev.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-blue); flex-shrink: 0;">
            <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--primary-blue); letter-spacing: 0.5px;">Conçu & Développé par</span>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 2px 0;">${dev.name}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;">${dev.bio}</p>
                
                <div class="cta-features" style="gap: 12px; font-size: 0.78rem;">
                    ${dev.skills.map(skill => `<div class="cta-feature-item"><i class="fa-solid fa-code" style="color: var(--primary-blue);"></i> ${skill}</div>`).join('')}
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <a href="${dev.contacts.whatsapp}" target="_blank" class="btn-blue" style="background: #25D366; color: white; border: none; font-size: 0.85rem; padding: 10px 16px; border-radius: var(--radius-md); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
                <i class="fa-brands fa-whatsapp fa-lg"></i> Me contacter
            </a>
            <a href="${dev.contacts.email}" class="btn-blue" style="background: white; color: var(--text-dark); border: 1px solid var(--border-color); font-size: 0.85rem; padding: 10px 16px; border-radius: var(--radius-md); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
                <i class="fa-regular fa-envelope fa-lg"></i> Email
            </a>
        </div>
    `;
}

/* --- 11. PARTAGE DE L'ARTICLE --- */
function shareArticle(platform) {
    const currentUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(getMetaContent('article-title') || document.title);

    let shareUrl = "";

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
            window.open(shareUrl, '_blank');
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${title}%20${currentUrl}`;
            window.open(shareUrl, '_blank');
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${currentUrl}`;
            window.open(shareUrl, '_blank');
            break;
        case 'link':
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("Lien exact de cet article copié dans votre presse-papier !");
            }).catch(() => {
                alert("Impossible de copier le lien.");
            });
            break;
    }
}

/* --- UTILITAIRES --- */
function getMetaContent(name) {
    const element = document.querySelector(`meta[name="${name}"]`);
    return element ? element.getAttribute('content') : null;
}

function bindDownloadButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-download-app')) {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                window.open(CONFIG.appStoreUrl, '_blank');
            } else {
                window.open(CONFIG.playStoreUrl, '_blank');
            }
        }
    });
}