const USERNAME = "gogamenetiqui";
const REPO = "Go-Buznes";
const DOUZE_HEURES = 12 * 60 * 60 * 1000;

export const ImageLoader = {
    getImage: async (path) => {
        if (!path) return "";
        const fileName = path.split('/').pop().trim();
        const cacheKey = `img_${fileName}`;
        const rawUrl = `https://raw.githubusercontent.com/${USERNAME}/${REPO}/main/images/${fileName}`;

        // 1. Vérifier le cache
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const { data, ts } = JSON.parse(cached);
                if (Date.now() - ts < DOUZE_HEURES) return data;
            } catch (e) { localStorage.removeItem(cacheKey); }
        }

        // 2. Si pas de cache ou expiré, on lance le téléchargement en tâche de fond
        // Mais on retourne l'URL directe pour que l'image s'affiche quand même !
        ImageLoader.telechargerEtStocker(fileName, cacheKey);
        return `${rawUrl}?t=${Date.now()}`;
    },

    telechargerEtStocker: async (fileName, cacheKey) => {
        if (!navigator.onLine) return;
        try {
            const url = `https://raw.githubusercontent.com/${USERNAME}/${REPO}/main/images/${fileName}`;
            const response = await fetch(url);
            if (!response.ok) return;

            const blob = await response.blob();
            const base64 = await new Promise(r => {
                const reader = new FileReader();
                reader.onloadend = () => r(reader.result);
                reader.readAsDataURL(blob);
            });

            localStorage.setItem(cacheKey, JSON.stringify({ data: base64, ts: Date.now() }));
        } catch (e) { /* Silencieux */ }
    }
};