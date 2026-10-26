import { VaultStream } from './vault-stream.js';

const cacheImagesLocales = new Map();

export async function recupererImageOuSquelette(imageNom, cheminGbz, elementId) {
    if (!imageNom) return;

    if (cacheImagesLocales.has(imageNom)) {
        configurerImageFinie(elementId, cacheImagesLocales.get(imageNom));
        return;
    }

    appliquerSqueletteAttente(elementId);

    try {
        const urlsrcImage = await VaultStream.extraireFichierImage(cheminGbz, imageNom);
        
        if (urlsrcImage) {
            const verificateurImage = new Image();
            verificateurImage.src = urlsrcImage;
            
            verificateurImage.onload = () => {
                cacheImagesLocales.set(imageNom, urlsrcImage);
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
                
                shimmer.innerHTML = `
                    <div class="shimmer-text" style="
                        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        font-size: 15px;
                        font-weight: 800;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        background: linear-gradient(90deg, #2596e2 25%, #ffffff 50%, #0099ff 75%);
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