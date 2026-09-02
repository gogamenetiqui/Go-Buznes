const CONFIG = {
    playStoreUrl: "https://gogamenetiqui.github.io/Go-Buznes/blog/download.html",
    appStoreUrl: "https://gogamenetiqui.github.io/Go-Buznes/",
    
    // --- INFORMATIONS ---
    developer: {
        name: "Christian CM", 
        role: "Concepteur & Développeur Web / Mobile",
        photo: "assets/Christian_CM_20250625_101801_569~2.jpg",
        bio: "Conception de solutions numériques modernes, rapides et adaptées à tous.",
        skills: ["Web Design", "Apps Mobiles", "UI/UX", "SEO & Marketing"],
        contacts: {
            whatsapp: "https://wa.me/243998159146",
            email: "mailto:contact.netiqui@gmail.com",
            phone: "+243 998 159 146"
        }
    },

    socials: {
        tiktok: "https://tiktok.com/@gobuznes",
        instagram: "https://instagram.com/gobuznes",
        threads: "https://threads.net/@gobuznes",
        facebook: "https://facebook.com/gobuznes"
    },

    // Fichiers
    articleFiles: [
        '',
        'politique_de_confidentialite.html',
        'mentions_legales.html',
        'conditions_generales_utilisation.html',
        'politique_et_conditions_signalement.html',
        'le_marche_numerique_qui_change_le_nord-kivu.html'
    ],
    // Encarts
    promos: [
        {
            title: "Voulez-vous vendre 3x plus vite ?",
            desc: "Découvrez comment enregistrer votre boutique sur Go Buznes et toucher des milliers de clients locaux dès aujourd'hui.",
            cta: "Rejoindre la marketplace",
            icon: "fa-rocket"
        },
        {
            title: "Go Buznes votre marché en poche",
            desc: "Découvrer vos articles, des meilleurs offres et toutes les boutiques de la ville.",
            cta: "Retrouver dès maintenant",
            icon: "fa-regular fa-clock"
        }
    ]
};

// Index
let loadedArticlesIndex = [];