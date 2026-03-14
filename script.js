let currentLang = localStorage.getItem('lang') || 'fr';
let content = {};

function toggleTheme() { document.documentElement.classList.toggle('dark'); }

async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${Date.now()}`);
        content = await res.json();
        render();
        handleRouting();
    } catch (e) { console.error("Load error:", e); }
}

function render() {
    const d = content;
    // Remplissage des textes simples
    ['name','role','sidebar_bio','hero_title','work_title','path_title'].forEach(id => {
        const el = document.getElementById(id);
        if(el && d[id]) el.innerText = d[id];
    });
    
    document.getElementById('lang-btn').innerText = d.lang_btn;

    // Projets
    if(d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="bento-card group relative overflow-hidden aspect-[4/3] p-0">
                <img src="${p.img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all">
                <div class="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-white">
                    <h3 class="text-xl font-bold uppercase">${p.name}</h3>
                    <div class="flex justify-between items-center mt-2">
                        <span class="badge-blue">${p.tag}</span>
                        <span class="font-bold">${p.val}</span>
                    </div>
                </div>
            </div>`).join('');
    }

    // Expériences
    if(d.experiences) {
        document.getElementById('experience-grid').innerHTML = d.experiences.map(e => `
            <div class="bento-card">
                <div class="flex justify-between items-start mb-4">
                    <div class="badge-blue"><i class="${e.icon}"></i></div>
                    <span class="text-[10px] text-gray-400 font-bold uppercase">${e.date}</span>
                </div>
                <h4 class="text-lg font-bold uppercase">${e.role}</h4>
                <p class="text-blue-600 text-[10px] font-bold uppercase">${e.company}</p>
                <p class="text-gray-500 text-sm mt-4">${e.desc}</p>
            </div>`).join('');
    }
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    const pageMap = { '#home': 'page-home', '#projects': 'page-projects', '#experience': 'page-experience' };
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageMap[hash]);
    if(target) target.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
}

async function toggleLang() {
    currentLang = (currentLang === 'fr') ? 'en' : 'fr';
    localStorage.setItem('lang', currentLang);
    await init();
}

window.addEventListener('hashchange', handleRouting);
init();
