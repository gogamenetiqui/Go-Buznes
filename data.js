import { Carrefour } from './github-bridge.js';
import { ImageLoader } from './image-loader.js';

export async function chargerDonneesVendeurs() {
    const res = await Carrefour.fetchPrivateFile('data/vendeurs_index.json');
    if (!res) return [];

    const liste = await res.json();
    let vendeurs = [];

    for (const path of liste) {
        const vRes = await Carrefour.fetchPrivateFile(path);
        if (vRes) vendeurs.push(await vRes.json());
    }

    // Lancer la ronde de sécurité pour les images manquantes
    if (!window.scannerActif) {
        setInterval(scannerEtReparerSilencieusement, 3000);
        window.scannerActif = true;
    }

    return vendeurs;
}

async function scannerEtReparerSilencieusement() {
    if (!navigator.onLine) return;

    const imgs = document.querySelectorAll('img');
    imgs.forEach(async (img) => {
        // Si l'image est cassée (naturalWidth === 0) ou n'a pas encore de source valide
        if (img.naturalWidth === 0 || img.src.includes('undefined')) {
            // On récupère le nom du fichier à partir de la fin de l'URL ou de l'attribut alt
            const currentSrc = img.getAttribute('src') || "";
            const fileName = currentSrc.split('/').pop().trim();

            if (fileName && fileName.includes('.')) {
                const data = await ImageLoader.getImage(fileName);
                if (data && img.src !== data) {
                    img.src = data;
                    img.style.opacity = "1";
                    if (img.parentElement) img.parentElement.style.background = "none";
                }
            }
        }
    });
}