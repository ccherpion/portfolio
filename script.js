let currentLang = localStorage.getItem('lang') || 'fr';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";

// Fonction Thème corrigée
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log("Thème switché :", isDark ? "Sombre" : "Clair");
}

// Appliquer le thème au chargement
if (localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${Date.now()}`);
        content = await res.json();
        render();
        handleRouting();
    } catch (e) { console.error("Erreur Init:", e); }
}

function render() {
    const d = content;
    // Mapping des IDs
    const ids = ['name','role','status','status_mobile','sidebar_bio','btn_contact','btn_cv','hero_title','work_title','path_title','bio','work_sub','path_sub','impact_val','impact_label','max_budget_val','max_budget_label','current_focus','loc_nav','lang-btn'];
    
    ids.forEach(id => {
        const el = document.getElementById(id);
        const key = id.replace('_mobile', '').replace('-btn', '_btn').replace('loc_nav', 'loc_val');
        if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    if(d.sidebar_skills) document.getElementById('sidebar-skills').innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">${s}</span>`).join('');
    if(d.sidebar_hobbies) document.getElementById('sidebar-hobbies').innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue">${h}</span>`).join('');
    
    if (d.stack) {
        document.getElementById('stack-grid').innerHTML = d.stack.map(s => `
            <div class="bento-card">
                <h4 class="text-sm font-bold uppercase mb-4 text-blue-600 font-tech">${s.category}</h4>
                <div class="grid grid-cols-2 gap-4">
                    ${s.items.map(item => `<div class="flex items-center gap-2"><img src="${item.logo}" class="w-5 h-5 dark:invert grayscale opacity-70"><span class="text-[11px] font-bold uppercase font-tech">${item.name}</span></div>`).join('')}
                </div>
            </div>`).join('');
    }

    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="bento-card group relative overflow-hidden aspect-[4/3] p-0">
                <img src="${p.img}" class="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0">
                <div class="absolute inset-0 bg-black/60 flex flex-col justify-end p-8 text-white">
                    <h3 class="text-3xl font-black uppercase mb-2">${p.name}</h3>
                    <div class="flex justify-between items-center"><span class="badge-blue !bg-white/10 !text-white !border-transparent">${p.tag}</span><span class="text-2xl font-black font-tech">${p.val}</span></div>
                </div>
            </div>`).join('');
    }

    if (d.experiences) {
        document.getElementById('experience-grid').innerHTML = d.experiences.map(exp => `
            <div class="bento-card min-h-[200px]">
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
        // Révélation des cartes avec l'index 'i' corrigé
        target.querySelectorAll('.bento-card').forEach((c, i) => {
            c.classList.remove('reveal-active');
            setTimeout(() => c.classList.add('reveal-active'), 100 + (i * 100));
        });
    }
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
}

async function toggleLang() { 
    currentLang = (currentLang === 'fr') ? 'en' : 'fr'; 
    localStorage.setItem('lang', currentLang); 
    await init(); 
}

window.addEventListener('hashchange', handleRouting);
init();
