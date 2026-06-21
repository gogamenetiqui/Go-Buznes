document.addEventListener('DOMContentLoaded', () => {
    const btnInfo = document.getElementById('btn-info-app');
    if (btnInfo) {
        btnInfo.addEventListener('click', ouvrirModaleAPropos);
    }
});

function ouvrirModaleAPropos() {
    // Éviter d'ouvrir plusieurs modales en même temps
    if (document.getElementById('info-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'info-modal-overlay';
    overlay.className = 'info-modal-overlay';

    // Contenu HTML Structuré de la modale d'information
    overlay.innerHTML = `
        <div class="info-modal-box">
            <div class="info-modal-header">
                <h2>À propos de Go Buznes</h2>
                <button class="info-modal-close" onclick="fermerModaleAPropos()">&times;</button>
            </div>
            
            <div class="info-modal-body">
                <div>
                    <div class="info-section-title">Nos Réseaux Sociaux</div>
                    <div class="info-link-grid">
                        <a href="https://www.tiktok.com/@netiquiofficial" target="_blank" class="info-btn-link"><i class="fa-brands fa-tiktok"></i> TikTok</a>
                        <a href="https://www.instagram.com/netiquiofficial" target="_blank" class="info-btn-link"><i class="fa-brands fa-instagram" style="color: #e1306c;"></i> Instagram</a>
                        <a href="https://www.threads.net/@netiquiofficial" target="_blank" class="info-btn-link"><i class="fa-brands fa-threads"></i> Threads</a>
                        <a href="https://www.facebook.com/GoBuznes" target="_blank" class="info-btn-link"><i class="fa-brands fa-facebook" style="color: #1877f2;"></i> Facebook</a>
                    </div>
                </div>

                <div>
                    <div class="info-section-title">Communauté WhatsApp</div>
                    <div class="info-link-grid">
                        <a href="https://whatsapp.com/channel/0029VauiJG6CcW4tCOaTAU2e" target="_blank" class="info-btn-link wa-chain">
                            <i class="fa-solid fa-bullhorn" style="color: #128c7e;"></i> Chaîne Netiqui
                        </a>
                        <a href="https://chat.whatsapp.com/J8dWZJFOuBF20FRIRGZU6d" target="_blank" class="info-btn-link wa-group">
                            <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> Groupe Actif
                        </a>
                    </div>
                </div>

                <div>
                    <div class="info-section-title">Aide &amp; Retours (Feedback)</div>
                    <div class="info-link-grid">
                        <a href="https://wa.me/243998159146" target="_blank" class="info-btn-link">
                            <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> WhatsApp Dev
                        </a>
                        <a href="mailto:contact.netiqui@gmail.com" class="info-btn-link">
                            <i class="fa-solid fa-envelope" style="color: #ea4335;"></i> Par Email
                        </a>
                    </div>
                </div>

                <div>
                    <div class="info-section-title">Centre de ressources</div>
                    <a href="#" onclick="lireDocumentationDynamique(event)" class="info-btn-link blog-doc" style="justify-content: center; font-weight: 700;">
                        <i class="fa-solid fa-book"></i> Lire notre documentation officielle
                    </a>
                </div>
            </div>

            <div class="info-modal-footer">
                <strong>Go Buznes</strong> v1.0.0.2<br>
                <span>&copy; 2026 Netiqui. Tous droits réservés.</span><br>
                <span style="font-size: 10px; color: #9aa0a6; display:block; margin-top:4px;">Mentions Légales : L'utilisation de cette application implique le respect de la propriété intellectuelle de Netiqui et de ses partenaires affiliés.</span>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fermer en cliquant à l'extérieur de la boîte
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fermerModaleAPropos();
    });
}

// Fonction globale de fermeture
window.fermerModaleAPropos = function() {
    const overlay = document.getElementById('info-modal-overlay');
    if (overlay) overlay.remove();
};

/**
 * 4. Recherche automatisée des articles contenant "Go Buznes" sur ton Blogger principal
 */
window.lireDocumentationDynamique = function(event) {
    event.preventDefault();
    // Utilisation du paramètre natif de recherche de Blogger (?q=...) pour filtrer directement votre contenu
    const urlBlogDoc = "https://netiqui.blogspot.com/search?q=Go+Buznes";
    window.open(urlBlogDoc, '_blank');
};