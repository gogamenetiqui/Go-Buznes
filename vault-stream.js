// Mode test local activé
const MODE_TEST_LOCAL = true; 

export const VaultStream = {
    /**
     * Lit le chemin d'un fichier (texte, JSON ou nom d'image)
     */
    async extraireFichier(chemin) {
        const url = MODE_TEST_LOCAL 
            ? `./${chemin}?t=${Date.now()}` 
            : `https://api.github.com/repos/gogamenetiqui/Go-Buznes/contents/${chemin}?t=${Date.now()}`;
        
        try {
            const reponse = await fetch(url, { cache: "no-store" });
            if (!reponse.ok) {
                console.error(`Impossible d'accéder au chemin : ${chemin} (Statut: ${reponse.status})`);
                return null;
            }

            if (MODE_TEST_LOCAL) {
                return await reponse.text();
            } else {
                const data = await reponse.json();
                return decodeURIComponent(escape(atob(data.content.replace(/\s/g, '')))); 
            }
        } catch (e) {
            console.error("Erreur critique de flux sur :", chemin, e);
            return null;
        }
    },

    /**
     * Lit simplement la structure pour valider la présence de l'image
     */
    /**
     * Reconstruit le chemin direct vers le dossier centralisé des images
     */
    async extraireFichierImage(cheminGbz, imageNom) {
        // On force le script à pointer directement vers ton dossier global 'data/images/'
        const cheminDirectImage = `data/images/${imageNom}`;
        
        // Log de contrôle pour vérifier dans la console (F12) le chemin généré
        console.log(`[VaultStream] Tentative d'accès à l'image : ${cheminDirectImage}`);
        
        return cheminDirectImage;
    }
};