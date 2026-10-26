import { state } from '../core/state.js';

export function partagerContenuDirect(type, idElement, metadataNom, optionnelPrix, idBoutique = "0") {
    const nomNettoye = decodeURIComponent(metadataNom);
    const baseUri = "https://gogamenetiqui.github.io/Go-Buznes";
    let textePartage = '';

    if (type === 'produit') {
        let boutiqueIdValide = idBoutique;
        if ((boutiqueIdValide === "0" || !boutiqueIdValide) && window.boutiqueActuelleId) {
            boutiqueIdValide = window.boutiqueActuelleId;
        }
        const lien = `${baseUri}/Article/${boutiqueIdValide}/${idElement}`;
        textePartage = `🔥 *Disponible sur Go Buznes !*\n\n👉 *${nomNettoye}*\n💰 Prix : *${optionnelPrix} USD*\n\nDécouvre cet article complet ici :\n🔗 ${lien}`;
    } else {
        const lien = `${baseUri}/Annonce/${idElement}`;
        textePartage = `📢 *Pub de ${nomNettoye} via Go Buznes !*\n\nConsultez l'affiche et le descriptif complet via ce lien direct :\n🔗 ${lien}`;
    }

    if (navigator.share) {
        navigator.share({ title: 'Partage Go Buznes', text: textePartage }).catch(err => console.log("Partage annulé", err));
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(textePartage)}`, '_blank');
    }
}

export function partagerProfilBoutique(idBoutique, nomBoutique) {
    const nomDecode = decodeURIComponent(nomBoutique);
    const baseUri = "https://gogamenetiqui.github.io/Go-Buznes";
    const urlPartage = `${baseUri}/Boutique/${idBoutique}`;
    const textePartage = `🏪 *Découvrez la boutique "${nomDecode}" sur Go Buznes !*\n\nConsultez l'ensemble de leurs articles et vitrine via ce lien direct :\n🔗 ${urlPartage}`;

    if (navigator.share) {
        navigator.share({ title: `Profil de ${nomDecode}`, text: textePartage }).catch(err => console.log("Partage annulé", err));
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(textePartage)}`, '_blank');
        if (navigator.clipboard) navigator.clipboard.writeText(urlPartage).catch(() => {});
    }
}

export function executerClicAnnonceur(typeLien, cibleLien) {
    if (!cibleLien) return;
    if (typeLien === 'interne') {
        const existe = state.toutesLesBoutiques.some(b => b.id_boutique === cibleLien);
        if (existe) window.filtrerArticlesParBoutique(cibleLien);
        else window.afficherGbAlerte(`La boutique '${cibleLien}' n'est pas disponible en local.`);
    } else {
        window.open(cibleLien, '_blank');
    }
}

window.partagerContenuDirect = partagerContenuDirect;
window.partagerProfilBoutique = partagerProfilBoutique;
window.executerClicAnnonceur = executerClicAnnonceur;