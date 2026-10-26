export function ouvrirDiscussionWhatsApp(tel, designation, prix) {
    const texte = decodeURIComponent(designation);
    const msg = `Bonjour, je suis intéressé par l'article *${texte}* affiché au prix de *${prix} USD* sur *Go Buznes*. Est-il toujours disponible ?`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
}
window.ouvrirDiscussionWhatsApp = ouvrirDiscussionWhatsApp;