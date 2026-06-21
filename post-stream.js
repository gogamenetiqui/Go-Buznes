// post-stream.js - Gestionnaire de flux pour les annonces/posts uniquement

export const PostStream = {
    /**
     * Lit un fichier (JSON ou .gbz crypté) depuis le dossier adpost
     * Compatible avec un serveur web, GitHub ou le dossier assets de l'APK
     */
    async extraireFichierAnnonce(cheminFichier) {
        try {
            // Ajoute un paramètre anti-cache pour le temps réel
            const reponse = await fetch(`${cheminFichier}?_ts=${Date.now()}`);
            if (!reponse.ok) return null;
            return await reponse.text();
        } catch (erreur) {
            console.error(`[PostStream] Impossible de lire : ${cheminFichier}`, /erreur/);
            return null;
        }
    }
};