export const PostStream = {

    async extraireFichierAnnonce(cheminFichier) {
        try {

            const reponse = await fetch(`${cheminFichier}?_ts=${Date.now()}`);
            if (!reponse.ok) return null;
            return await reponse.text();
        } catch (erreur) {
            console.error(`[PostStream] Impossible de lire : ${cheminFichier}`, /erreur/);
            return null;
        }
    }
};