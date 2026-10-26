const MODE_TEST_LOCAL = true;

export const VaultStream = {

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


    async extraireFichierImage(cheminGbz, imageNom) {
        const cheminDirectImage = `data/images/${imageNom}`;

        console.log(`[VaultStream] Tentative d'accès à l'image : ${cheminDirectImage}`);

        return cheminDirectImage;
    }
};