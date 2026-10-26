const CONFIG_SOUTIEN = {
    airtel: {
        nom: "Airtel Money",
        numero: "+243 998 159 146",
        numeroBrut: "243998159146",
        beneficiaire: "Netiqui Studio",
        operateur: "Airtel RDC"
    },
    orange: {
        nom: "Orange Money",
        numero: "+243 808 644 859",
        numeroBrut: "243808644859",
        beneficiaire: "Netiqui Studio",
        operateur: "Orange RDC"
    },
    afrimoney: {
        nom: "Afrimoney",
        numero: "+243 906 783 863",
        numeroBrut: "243906783863",
        beneficiaire: "Netiqui Studio",
        operateur: "Africell RDC"
    },

    whatsapp: "243998159146",

    signal: {
        numero: "+243 998 159 146",
        numeroBrut: "243998159146"
    }
};

const PALIERS_SOUTIEN = [
    { id: "cafe", emoji: "☕", nom: "Café", prix: 1, message: "Un petit café pour l'équipe" },
    { id: "boost", emoji: "🚀", nom: "Boost", prix: 5, message: "Booste le développement" },
    { id: "partenaire", emoji: "💎", nom: "Partenaire", prix: 20, message: "Deviens partenaire officiel" },
    { id: "sponsor", emoji: "👑", nom: "Sponsor", prix: 50, message: "Sponsor majeur du projet" }
];


let palierSelectionne = null;
let montantPersonnalise = null;
let moyenPaiement = null;

window.ouvrirModaleSoutien = function () {
    if (document.getElementById('soutenir-overlay')) return;

    palierSelectionne = null;
    montantPersonnalise = null;
    moyenPaiement = null;

    const overlay = document.createElement('div');
    overlay.id = 'soutenir-overlay';
    overlay.className = 'soutenir-overlay';

    overlay.innerHTML = `
        <div class="soutenir-box" role="dialog" aria-label="Soutenir Go Buznes">
            <div class="soutenir-header">
                <div class="soutenir-header-top">
                    <div class="soutenir-icon-main">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <button class="soutenir-close" onclick="fermerModaleSoutien()" aria-label="Fermer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <h2>Soutenir Go Buznes</h2>
                <p>Chaque contribution finance l'hébergement, le développement et les nouvelles fonctionnalités pour la communauté Go Buznes.</p>
            </div>

            <div class="soutenir-body">

                <div>
                    <div class="soutenir-section-title">
                        <i class="fa-solid fa-gift"></i> Choisir un palier de soutien
                    </div>
                    <div class="soutenir-paliers" id="soutenir-paliers">
                        ${PALIERS_SOUTIEN.map(p => `
                            <button class="soutenir-palier" data-palier="${p.id}" data-prix="${p.prix}">
                                <span class="soutenir-palier-emoji">${p.emoji}</span>
                                <span class="soutenir-palier-nom">${p.nom}</span>
                                <span class="soutenir-palier-prix">${p.prix}$</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <div class="soutenir-section-title">
                        <i class="fa-solid fa-pen"></i> Ou montant libre
                    </div>
                    <div class="soutenir-custom">
                        <input type="number" id="soutenir-custom-input" class="soutenir-custom-input"
                               placeholder="Ex: 3, 10, 100..." min="1" step="1">
                        <select id="soutenir-devise" class="soutenir-devise">
                            <option value="USD">USD $</option>
                            <option value="CDF">CDF FC</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div class="soutenir-section-title">
                        <i class="fa-solid fa-credit-card"></i> Moyen de paiement
                    </div>
                    <div class="soutenir-moyens" id="soutenir-moyens">
                        <button class="soutenir-moyen" data-moyen="airtel">
                            <div class="soutenir-moyen-icon airtel"><i class="fa-solid fa-mobile-screen"></i></div>
                            <div class="soutenir-moyen-info">
                                <span class="soutenir-moyen-nom">Airtel Money</span>
                                <span class="soutenir-moyen-sub">Airtel RDC</span>
                            </div>
                        </button>
                        <button class="soutenir-moyen" data-moyen="orange">
                            <div class="soutenir-moyen-icon orange"><i class="fa-solid fa-mobile-screen"></i></div>
                            <div class="soutenir-moyen-info">
                                <span class="soutenir-moyen-nom">Orange Money</span>
                                <span class="soutenir-moyen-sub">Orange RDC</span>
                            </div>
                        </button>
                        <button class="soutenir-moyen" data-moyen="afrimoney">
                            <div class="soutenir-moyen-icon afrimoney"><i class="fa-solid fa-mobile-screen"></i></div>
                            <div class="soutenir-moyen-info">
                                <span class="soutenir-moyen-nom">Afrimoney</span>
                                <span class="soutenir-moyen-sub">Africell RDC</span>
                            </div>
                        </button>
                        <button class="soutenir-moyen" data-moyen="autre">
                            <div class="soutenir-moyen-icon autre"><i class="fa-solid fa-globe"></i></div>
                            <div class="soutenir-moyen-info">
                                <span class="soutenir-moyen-nom">Autre</span>
                                <span class="soutenir-moyen-sub">Nous contacter</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div id="soutenir-instructions-zone"></div>

                <div class="soutenir-impact">
                    <i class="fa-solid fa-circle-info"></i>
                    <div>
                        <strong>Où va ton soutien ?</strong><br>
                        60% — Hébergement et Stockages<br>
                        30% — Développement de nouvelles fonctionnalités<br>
                        10% — Support et modération
                    </div>
                </div>

                <div class="soutenir-actions">
                    <div class="soutenir-send-grid">
                        <button class="soutenir-btn soutenir-btn-wa" onclick="validerSoutien('whatsapp')">
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="soutenir-btn soutenir-btn-signal" onclick="validerSoutien('signal')">
                            <i class="fa-solid fa-comment-dots"></i> Signal
                        </button>
                    </div>
                    <button class="soutenir-btn soutenir-btn-secondary" onclick="fermerModaleSoutien()">
                        Plus tard
                    </button>
                </div>
            </div>

            <div class="soutenir-footer">
                Merci à tous les soutiens de <strong>Go Buznes</strong> 💙<br>
                Chaque contribution compte, peu importe le montant.
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.soutenir-palier').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('.soutenir-palier').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            palierSelectionne = {
                id: btn.dataset.palier,
                prix: parseFloat(btn.dataset.prix)
            };
            montantPersonnalise = null;
            const input = document.getElementById('soutenir-custom-input');
            if (input) input.value = '';
            rafraichirInstructions();
        });
    });

    const customInput = document.getElementById('soutenir-custom-input');
    if (customInput) {
        customInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val > 0) {
                montantPersonnalise = val;
                palierSelectionne = null;
                overlay.querySelectorAll('.soutenir-palier').forEach(b => b.classList.remove('active'));
            } else {
                montantPersonnalise = null;
            }
            rafraichirInstructions();
        });
    }

    overlay.querySelectorAll('.soutenir-moyen').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('.soutenir-moyen').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            moyenPaiement = btn.dataset.moyen;
            rafraichirInstructions();
        });
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fermerModaleSoutien();
    });
};

window.fermerModaleSoutien = function () {
    const overlay = document.getElementById('soutenir-overlay');
    if (overlay) overlay.remove();
};

function rafraichirInstructions() {
    const zone = document.getElementById('soutenir-instructions-zone');
    if (!zone) return;

    const montant = montantPersonnalise || (palierSelectionne ? palierSelectionne.prix : null);
    const devise = document.getElementById('soutenir-devise')?.value || 'USD';
    const deviseSymbole = devise === 'CDF' ? 'FC' : '$';

    if (!moyenPaiement) {
        zone.innerHTML = `
            <div class="soutenir-instructions" style="text-align:center; padding:20px;">
                <i class="fa-solid fa-hand-point-up" style="font-size:22px; color:#0046ad; opacity:0.5;"></i>
                <p style="margin:8px 0 0 0; font-size:12.5px; color:#5f6368;">
                    Sélectionne d'abord un moyen de paiement pour voir les instructions.
                </p>
            </div>
        `;
        return;
    }

    if (['airtel', 'orange', 'afrimoney'].includes(moyenPaiement)) {
        const conf = CONFIG_SOUTIEN[moyenPaiement];
        const codeUSSD = {
            airtel: "*501#",
            orange: "*144#",
            afrimoney: "*111#"
        }[moyenPaiement];

        zone.innerHTML = `
            <div class="soutenir-instructions">
                <div class="soutenir-section-title" style="margin-bottom:4px;">
                    <i class="fa-solid fa-list-ol"></i> Payer via ${conf.nom}
                </div>

                <div class="soutenir-instruction-step">
                    <div class="soutenir-instruction-num">1</div>
                    <div class="soutenir-instruction-text">
                        Compose <strong>${codeUSSD}</strong> ou ouvre l'app <strong>${conf.nom}</strong>.
                    </div>
                </div>

                <div class="soutenir-instruction-step">
                    <div class="soutenir-instruction-num">2</div>
                    <div class="soutenir-instruction-text">
                        Choisis <strong>Transfert d'argent</strong> puis envoie au numéro :
                    </div>
                </div>

                <button class="soutenir-copy-block" onclick="copierTexteSoutien('${conf.numeroBrut}', this)">
                    <div class="soutenir-copy-content">
                        <span class="soutenir-copy-label">Numéro ${conf.nom}</span>
                        <span class="soutenir-copy-value">${conf.numero}</span>
                    </div>
                    <div class="soutenir-copy-icon"><i class="fa-solid fa-copy"></i></div>
                </button>

                <div class="soutenir-instruction-step">
                    <div class="soutenir-instruction-num">3</div>
                    <div class="soutenir-instruction-text">
                        Montant : <strong>${montant ? montant + ' ' + deviseSymbole : '___'}</strong>
                        puis valide avec ton code PIN.
                    </div>
                </div>

                <div class="soutenir-instruction-step">
                    <div class="soutenir-instruction-num">4</div>
                    <div class="soutenir-instruction-text">
                        Clique sur <strong>WhatsApp</strong> ou <strong>Signal</strong> en bas pour nous envoyer la capture de confirmation.
                    </div>
                </div>
            </div>
        `;
        return;
    }

    zone.innerHTML = `
        <div class="soutenir-instructions">
            <div class="soutenir-section-title" style="margin-bottom:4px;">
                <i class="fa-solid fa-globe"></i> Autre moyen
            </div>
            <p style="font-size:12.5px; color:#1c1e21; margin:0; line-height:1.55;">
                Pour tout autre moyen (virement bancaire, partenariat, matériel), contacte-nous directement sur WhatsApp ou Signal — on trouvera une solution ensemble.
            </p>
        </div>
    `;
}

window.copierTexteSoutien = function (texte, bouton) {
    const feedback = () => {
        const icone = bouton.querySelector('.soutenir-copy-icon i');
        if (icone) {
            const original = icone.className;
            icone.className = 'fa-solid fa-check';
            setTimeout(() => { icone.className = original; }, 1400);
        }
        afficherToastSoutien("✅ Copié !");
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(texte).then(feedback).catch(() => fallbackCopy(texte, feedback));
    } else {
        fallbackCopy(texte, feedback);
    }
};

function fallbackCopy(texte, cb) {
    const ta = document.createElement('textarea');
    ta.value = texte;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); }
    catch { afficherToastSoutien("Copie impossible"); }
    ta.remove();
}


window.validerSoutien = function (canal) {
    const montant = montantPersonnalise || (palierSelectionne ? palierSelectionne.prix : null);
    const devise = document.getElementById('soutenir-devise')?.value || 'USD';

    if (!montant || montant <= 0) {
        afficherToastSoutien("⚠️ Choisis un palier ou saisis un montant");
        return;
    }
    if (!moyenPaiement) {
        afficherToastSoutien("⚠️ Choisis un moyen de paiement");
        return;
    }

    const nomsMoyens = {
        airtel: "Airtel Money",
        orange: "Orange Money",
        afrimoney: "Afrimoney",
        autre: "Autre moyen"
    };

    const palierInfo = palierSelectionne
        ? PALIERS_SOUTIEN.find(p => p.id === palierSelectionne.id)
        : null;

    const deviseSymbole = devise === 'CDF' ? 'FC' : '$';

    let msg = `💙 *SOUTIEN GO BUZNES*\n\n`;
    msg += `• *Montant* : ${montant} ${deviseSymbole}\n`;
    msg += `• *Moyen* : ${nomsMoyens[moyenPaiement]}\n`;
    if (palierInfo) {
        msg += `• *Palier* : ${palierInfo.emoji} ${palierInfo.nom}\n`;
    }
    msg += `\nJ'ai effectué (ou vais effectuer) le paiement. Voici ma preuve :\n\n`;
    msg += `_(Merci de joindre la capture d'écran à ce message)_`;

    if (canal === 'whatsapp') {
        const url = `https://wa.me/${CONFIG_SOUTIEN.whatsapp}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        setTimeout(() => {
            afficherToastSoutien("🙏 Merci pour ton soutien !");
            fermerModaleSoutien();
        }, 600);
    }
    
    else if (canal === 'signal') {
        
        const copier = () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(msg).catch(() => {});
            } else {
                const ta = document.createElement('textarea');
                ta.value = msg;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch {}
                ta.remove();
            }
            afficherToastSoutien("📋 Message copié — ouvre Signal et colle-le");

            setTimeout(() => {
                
                window.location.href = 'sgnl://';
                
                setTimeout(() => {
                    afficherToastSoutien("Signal non installé ? Envoie-nous un SMS au " + CONFIG_SOUTIEN.signal.numero);
                }, 1500);
            }, 700);
        };
        copier();

        setTimeout(() => fermerModaleSoutien(), 2600);
    }
};


let soutienToastTimeout = null;
function afficherToastSoutien(message) {
    let toast = document.getElementById('gb-toast-soutien');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'gb-toast-soutien';
        toast.className = 'gb-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add('show');
    clearTimeout(soutienToastTimeout);
    soutienToastTimeout = setTimeout(() => toast.classList.remove('show'), 2600);
} 