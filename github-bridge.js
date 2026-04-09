const USERNAME = "gogamenetiqui";
const REPO = "Go-Buznes";
const DOUZE_HEURES = 12 * 60 * 60 * 1000;

export const Carrefour = {
    fetchPrivateFile: async (path) => {
        const cacheKey = `data_${path.replace(/\//g, '_')}`;
        const cached = localStorage.getItem(cacheKey);

        // Si on a un cache de moins de 12h, on le rend mais on ne bloque pas l'UI
        if (cached) {
            const { data, ts } = JSON.parse(cached);
            if (Date.now() - ts < DOUZE_HEURES) {
                // LANCEMENT SILENCIEUX de la mise à jour en arrière-plan
                Carrefour.syncBackground(path, cacheKey);
                return { json: async () => data };
            }
        }

        // Sinon, on fait le chargement classique (bloquant car nécessaire)
        return await Carrefour.forceFetch(path, cacheKey);
    },

    forceFetch: async (path, cacheKey) => {
        try {
            const url = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${path}?t=${Date.now()}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const result = await response.json();
            const content = JSON.parse(decodeURIComponent(escape(atob(result.content))));

            localStorage.setItem(cacheKey, JSON.stringify({ data: content, ts: Date.now() }));
            return { json: async () => content };
        } catch (e) { return null; }
    },

    // La magie : met à jour le cache sans que l'utilisateur ne voie de chargement
    syncBackground: async (path, cacheKey) => {
        if (!navigator.onLine) return;
        const url = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${path}?t=${Date.now()}`;
        try {
            const res = await fetch(url);
            const result = await res.json();
            const content = JSON.parse(decodeURIComponent(escape(atob(result.content))));
            localStorage.setItem(cacheKey, JSON.stringify({ data: content, ts: Date.now() }));
            console.log(`☁️ Sync arrière-plan réussie : ${path}`);
        } catch (e) { /* Discret */ }
    }
};