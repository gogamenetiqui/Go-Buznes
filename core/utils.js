import { state } from './state.js';

export function deconnecterApresTimeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms));
}

export function mettreAJourStatsHeader() {
    const totalVendeurs = state.toutesLesBoutiques.length;
    const totalGold = state.toutesLesBoutiques.filter(b => b.badgeType === 'or').length;
    const totalBlue = state.toutesLesBoutiques.filter(b => b.badgeType === 'bleu').length;
    const totalNone = state.toutesLesBoutiques.filter(b => !b.badgeType).length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('count-total', totalVendeurs);
    set('count-gold', totalGold);
    set('count-blue', totalBlue);
    set('count-none', totalNone);
}

export function nettoyerUrlBarre() {
    const cheminBase = window.location.pathname.split('/Boutique')[0].split('/Article')[0].split('/Annonce')[0];
    window.history.replaceState({}, document.title, cheminBase);
}

window.enregistrerEtapeHistorique = function () {
    window.history.pushState({ site: 'gobuznes' }, '');
};