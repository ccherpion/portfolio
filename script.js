let currentLang = localStorage.getItem('lang') || 'fr';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#%*?+";

function toggleTheme() { document.documentElement.classList.toggle('dark'); }

async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${Date.now()}`);
        content = await res.json();
        render();
        handleRouting();
        setInterval(() => {
            const el = document.getElementById('live-time');
            if(el) el.innerText = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' CET';
        }, 1000);
    } catch (e) { console.error("Init Error:", e); }
}

// FONCTION SCRAMBLE AMÉLIORÉE (SÉCURISÉE)
function runScramble(id, speed = 25, delay = 0) {
    const el = document.getElementById(id); if (!el) return;
    const text = el.getAttribute('data-text') || el.innerText;
    if (!text || text === "...") return;
    
    setTimeout(() => {
        el.innerHTML = '';
        el.style.opacity = '1';
        const words = text.split(' ');
        let charIndex = 0;

        words.forEach(w => {
            const wSpan = document.createElement('span');
            wSpan.className = 'word';
            [...w].forEach(c => {
                const s = document.createElement('span');
                s.className = 'char';
                s.innerText = c;
                wSpan.appendChild(s);
                
                const currentIdx = charIndex;
                setTimeout(() => {
                    let count = 0;
                    const itv = setInterval(() => {
                        s.innerText = scChars[Math.floor(Math.random() * scChars.length)];
                        s.classList.add('visible');
                        if (count >= 5) {
                            s.innerText = c;
                            clearInterval(itv);
                        }
                        count++;
                    }, 30);
                }, currentIdx * speed);
                charIndex++;
            });
            el.appendChild(wSpan);
            charIndex++; // Espace virtuel
        });
    }, delay);
}

// RÉVÉLATION CASCADE DES BLOCS
function triggerReveal() {
    const activeView = document.querySelector('.page-view.active');
    if (!activeView) return;
    const cards = activeView.querySelectorAll('.bento-card');
    cards.forEach((card, index) => {
        card.classList.remove('reveal-active');
        setTimeout(() => {
            card.classList.add('reveal-active');
        }, 300 + (index * 100));
    });
}

function render() {
    const d = content;
    const ids = ['status','status_mobile','name','role','sidebar_bio','sidebar_skills_title','sidebar_hobbies_title','btn_contact','btn_cv','hero_title','work_title','path_title','bio','work_sub','path_sub','impact_val','impact_label','max_budget_val','max_budget_label','widget_title_stats','widget_title_focus','current_focus','loc_nav','lang-btn'];
    
    ids.forEach(id => {
        const el = document.getElementById(id);
        let key = id.replace('_mobile', '').replace('-btn', '_btn');
        if (id === 'loc_nav') key = 'loc_val';
        if(el && d[key]) { 
            el.innerText = d[key]; 
            el.setAttribute('data-text', d[key]); 
        }
    });

    if(d.sidebar_skills) document.getElementById('sidebar-skills').innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">${s}</span>`).join('');
    if(d.sidebar_hobbies) document.getElementById('sidebar-hobbies').innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue">${h}</span>`).join('');
    
    if (d.stack) {
        document.getElementById('stack-grid').innerHTML = d.stack.map(s => `
            <div class="bento-card">
                <h4 class="text-sm font-bold uppercase mb-4 text-blue-600 font-tech">${s.category}</h4>
                <div class="grid grid-cols-2 gap-4">
                    ${s.items.map(item => `<div class="flex items-center gap-2"><i class="fas fa-check text-[10px] opacity-30"></i><span class="text-[11px] font-bold uppercase font-tech">${item.name}</span></div>`).join('')}
                </div>
            </div>`).join('');
    }

    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="bento-card group relative overflow-hidden aspect-[4/3] p-0">
                <img src="${p.img}" class="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0">
                <div class="absolute inset-0 bg-black/60 flex flex-col justify-end p-8 text-white">
                    <h3 class="text-2xl font-black uppercase mb-1">${p.name}</h3>
                    <div class="flex justify-between items-center">
                        <span class="badge-blue !text-white !border-transparent !bg-white/20">${p.tag}</span>
                        <span class="text-xl font-black">${p.val}</span>
                    </div>
                </div>
            </div>`).join('');
    }

    if (d.experiences) {
        document.getElementById('experience-grid').innerHTML = d.experiences.map(exp => `
            <div class="bento-card min-h-[220px]">
                <div class="flex justify-between items-start mb-4">
                    <div class="badge-blue"><i class="${exp.icon}"></i></div>
                    <span class="text-[9px] font-bold text-gray-400 uppercase">${exp.date}</span>
                </div>
                <h4 class="text-lg font-bold uppercase mb-1">${exp.role}</h4>
                <p class="text-blue-600 text-[10px] font-black uppercase mb-4">${exp.company}</p>
                <p class="text-gray-500 dark:text-gray-400 text-[12px] leading-relaxed">${exp.desc}</p>
            </div>`).join('');
    }
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    const pageMap = { '#home': 'page-home', '#projects': 'page-projects', '#experience': 'page-experience' };
    
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageMap[hash]);
    
    if(target) {
        target.classList.add('active');
        
        // Orchestration des animations
        if (hash === '#home') {
            runScramble('hero_title', 20, 0);
            runScramble('bio', 10, 400);
        } else if (hash === '#projects') {
            runScramble('work_title', 20, 0);
            runScramble('work_sub', 10, 400);
        } else if (hash === '#experience') {
            runScramble('path_title', 20, 0);
            runScramble('path_sub', 10, 400);
        }
        
        triggerReveal();
    }
    
    document.querySelectorAll(`.nav-link`).forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
    window.scrollTo(0, 0);
}

async function toggleLang() { 
    currentLang = (currentLang === 'fr') ? 'en' : 'fr'; 
    localStorage.setItem('lang', currentLang); 
    await init(); 
}

window.addEventListener('hashchange', handleRouting);
init();
