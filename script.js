let currentLang = localStorage.getItem('lang') || 'fr';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

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

function runScramble(id) {
    const el = document.getElementById(id); if (!el) return;
    const text = el.getAttribute('data-text') || el.innerText;
    el.innerHTML = '';
    const words = text.split(' ');
    let tCount = 0;
    words.forEach(w => {
        const wSpan = document.createElement('span'); wSpan.className = 'word inline-block mr-2';
        [...w].forEach(c => {
            const s = document.createElement('span'); s.innerText = c; s.className = 'opacity-0 inline-block';
            wSpan.appendChild(s);
            setTimeout(() => {
                let count = 0;
                const itv = setInterval(() => {
                    s.innerText = scChars[Math.floor(Math.random() * scChars.length)];
                    s.classList.replace('opacity-0', 'opacity-100');
                    if (count >= 5) { s.innerText = c; clearInterval(itv); }
                    count++;
                }, 40);
            }, tCount * 25);
            tCount++;
        });
        el.appendChild(wSpan);
        tCount++;
    });
}

function render() {
    const d = content;
    const ids = ['status','status_mobile','name','role','sidebar_bio','sidebar_skills_title','sidebar_hobbies_title','btn_contact','btn_cv','hero_title','work_title','path_title','bio','work_sub','path_sub','impact_val','impact_label','max_budget_val','max_budget_label','widget_title_stats','widget_title_focus','current_focus','loc_nav','lang-btn'];
    
    ids.forEach(id => {
        const el = document.getElementById(id);
        let key = id.replace('_mobile', '').replace('-btn', '_btn');
        if (id === 'loc_nav') key = 'loc_val';
        if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    if(d.sidebar_skills) document.getElementById('sidebar-skills').innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">${s}</span>`).join('');
    if(d.sidebar_hobbies) document.getElementById('sidebar-hobbies').innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue">${h}</span>`).join('');
    
    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="bento-card group relative overflow-hidden aspect-[4/3] p-0">
                <img src="${p.img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700">
                <div class="absolute inset-0 bg-black/60 flex flex-col justify-end p-8 text-white">
                    <h3 class="text-3xl font-black uppercase mb-2">${p.name}</h3>
                    <p class="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity mb-4">${p.desc}</p>
                    <div class="flex justify-between items-center">
                        <span class="badge-blue !bg-white/10 !text-white !border-transparent">${p.tag}</span>
                        <span class="text-2xl font-black">${p.val}</span>
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
    const titleMap = { '#home': 'hero_title', '#projects': 'work_title', '#experience': 'path_title' };
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageMap[hash]);
    if(target) {
        target.classList.add('active');
        if(titleMap[hash]) runScramble(titleMap[hash]);
    }
    document.querySelectorAll(`.nav-link`).forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
}

async function toggleLang() { 
    currentLang = (currentLang === 'fr') ? 'en' : 'fr'; 
    localStorage.setItem('lang', currentLang); 
    await init(); 
}

window.addEventListener('hashchange', handleRouting);
window.onload = init;
