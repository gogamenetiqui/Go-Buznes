import { VaultStream } from './vault-stream.js';

const cacheImagesLocales = new Map();

/**
 * Charge l'image de manière isolée sans bloquer les autres
 */
export async function recupererImageOuSquelette(imageNom, cheminGbz, elementId) {
    if (!imageNom) return;

    // 1. Si l'image est déjà dans le cache, on l'affiche directement
    if (cacheImagesLocales.has(imageNom)) {
        configurerImageFinie(elementId, cacheImagesLocales.get(imageNom));
        return;
    }

    // 2. Injection immédiate du texte "Go Buznes" qui brille en arrière-plan
    appliquerSqueletteAttente(elementId);

    // 3. Traitement asynchrone autonome
    try {
        const urlsrcImage = await VaultStream.extraireFichierImage(cheminGbz, imageNom);
        
        if (urlsrcImage) {
            // On pré-charge l'image en mémoire pour s'assurer qu'elle existe et éviter le clignotement
            const verificateurImage = new Image();
            verificateurImage.src = urlsrcImage;
            
            verificateurImage.onload = () => {
                cacheImagesLocales.set(imageNom, urlsrcImage);
                // Remplacement du texte de chargement par l'image physique
                configurerImageFinie(elementId, urlsrcImage);
            };

            verificateurImage.onerror = () => {
                console.warn(`L'image ${imageNom} est introuvable au chemin : ${urlsrcImage}`);
            };
        }
    } catch (error) {
        console.error(`Erreur sur l'élément ${elementId}:`, error);
    }
}

function appliquerSqueletteAttente(elementId) {
    setTimeout(() => {
        const img = document.getElementById(elementId);
        if (!img) return;

        const conteneur = img.parentElement;
        if (conteneur) {
            conteneur.style.position = 'relative';
            conteneur.style.overflow = 'hidden';
            
            let shimmer = conteneur.querySelector('.shimmer-overlay');
            if (!shimmer) {
                shimmer = document.createElement('div');
                shimmer.className = 'shimmer-overlay';
                shimmer.style.position = 'absolute';
                shimmer.style.top = '0';
                shimmer.style.left = '0';
                shimmer.style.width = '100%';
                shimmer.style.height = '100%';
                shimmer.style.backgroundColor = '#f1f3f4';
                shimmer.style.display = 'flex';
                shimmer.style.alignItems = 'center';
                shimmer.style.justifyContent = 'center';
                
                // Effet Shimmer haut de gamme passant au-dessus du texte "Go Buznes"
                shimmer.innerHTML = `
                    <div class="shimmer-text" style="
                        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        font-size: 15px;
                        font-weight: 800;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        background: linear-gradient(90deg, #bdc3c7 25%, #ffffff 50%, #bdc3c7 75%);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: balayageTexte 1.4s infinite linear;
                    ">Go Buznes</div>
                `;
                conteneur.appendChild(shimmer);
            }
        }
    }, 0);
}

function configurerImageFinie(elementId, srcUrl) {
    const img = document.getElementById(elementId);
    if (!img) return;

    img.src = srcUrl;
    img.style.opacity = '1';

    const conteneur = img.parentElement;
    if (conteneur) {
        const shimmer = conteneur.querySelector('.shimmer-overlay');
        if (shimmer) {
            shimmer.style.transition = 'opacity 0.2s ease';
            shimmer.style.opacity = '0';
            setTimeout(() => shimmer.remove(), 200);
        }
    }
}

// Injection globale de l'animation CSS si elle n'existe pas
if (!document.getElementById('shimmer-text-styles')) {
    const style = document.createElement('style');
    style.id = 'shimmer-text-styles';
    style.innerHTML = `
        @keyframes balayageTexte {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
    `;
    document.head.appendChild(style);
}