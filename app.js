import './core/modals.js';
import './core/router.js';
import './services/partage.js';
import './services/whatsapp.js';
import './services/recherche.js';
import './components/productModal.js';
import './components/annonceCard.js';
import './views/accueil.js';
import './views/boutiques.js';
import './views/vendre.js';
import './views/biens.js';
import './views/profil.js';
import './views/rayon.js';

import { initialiserApp } from './core/router.js';
import { fermerFenetreRecherche, initialiserRechercheAutonome } from './services/recherche.js';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            fermerFenetreRecherche();
            window.naviguerVersPage(tab.getAttribute('data-page'));
        });
    });

    initialiserApp();

    if (typeof initialiserRechercheAutonome === 'function') {
        initialiserRechercheAutonome();
    }
});