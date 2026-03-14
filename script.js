let currentLang = localStorage.getItem('lang') || 'fr';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";

function toggleTheme() { 
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Restore theme
if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');

async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${Date.now()}`);
        content = await res.json();
        render();
        handleRouting();
    } catch (e) { console.error("Init Error:", e); }
}

function render() {
    const d = content;
    const ids = ['name','role','status','status_mobile','sidebar_bio','btn_contact','btn_cv','hero_title','work_title','path_title','bio','work_sub','path_sub','impact_val','impact_label','max_budget_val','max_budget_label','current_focus','loc_nav','lang-btn'];
    
    ids.forEach(id => {
        const el = document.getElementById(id);
        const key = id.replace('_mobile', '').replace('-btn', '_btn').replace('loc_nav', 'loc_val');
        if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    // Render Stack with Logos
    if (d.stack) {
        document.getElementById('stack-grid').innerHTML = d.stack.map(s => `
            <div class="bento-card">
                <h4 class="text-sm font-bold uppercase mb-4 text-blue-500 font-tech">${s.category}</h4>
                <div class="grid grid-cols-2 gap-4">
                    ${s.items.map(item => `
                        <div class="flex items-center gap-2">
                            <img src="${item.logo}" class="w-5 h-5 opacity-80 dark:invert">
                            <span class="text-[11px] font-bold uppercase font-tech">${item.name}</span>
                        </div>`).join('')}
                </div>
            </div>`).join('');
    }

    // Render Projects
    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="bento-card group relative overflow-hidden aspect-[4/3] p-0">
                <img src="${p.img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700">
                <div class="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-white">
                    <h3 class="text-2xl font-black uppercase mb-1">${p.name}</h3>
                    <div class="flex justify-between items-center"><span class="badge-blue !bg-white/20 !text-white !border-transparent">${p.tag}</span><span class="text-xl font-bold font-tech">${p.val}</span></div>
                </div>
            </div>`).join('');
    }

    // Render Path
    if (d.experiences) {
        document.getElementById('experience-grid').innerHTML = d.experiences.map(exp => `
            <div class="bento-card min-h-[180px]">
                <div class="flex justify-between items-start mb-4">
                    <div class="badge-blue"><i class="${exp.icon}"></i></div>
                    <span class="text-[9px] font-bold text-gray-400 uppercase">${exp.date}</span>
                </div>
                <h4 class="text-lg font-bold uppercase mb-1">${exp.role}</h4>
                <p class="text-blue-600 text-[10px] font-black uppercase mb-3">${exp.company}</p>
                <p class="text-gray-500 text-[12px] leading-relaxed">${exp.desc}</p>
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
        const titleId = hash === '#home' ? 'hero_title' : (hash === '#projects' ? 'work_title' : 'path_title');
        runScramble(titleId, 25);
        
        const activeView = document.querySelector('.page-view.active');
        activeView.querySelectorAll('.bento-card').forEach((c, i) => {
            setTimeout(() => c.classList.add('reveal-active'), 200 + (i * 100));
        });
    }
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
}

function runScramble(id, speed) {
    const el = document.getElementById(id); if (!el) return;
    const text = el.getAttribute('data-text') || el.innerText;
    el.innerHTML = '';
    text.split(' ').forEach(w => {
        const wSpan = document.createElement('span'); wSpan.className = 'word';
        [...w].forEach((c, i) => {
            const s = document.createElement('span'); s.className = 'char'; s.innerText = c;
            wSpan.appendChild(s);
            setTimeout(() => {
                let cnt = 0; const itv = setInterval(() => {
                    s.innerText = scChars[Math.floor(Math.random() * scChars.length)]; s.classList.add('visible');
                    if (cnt >= 5) { s.innerText = c; clearInterval(itv); } cnt++;
                }, 30);
            }, i * speed);
        });
        el.appendChild(wSpan);
    });
}

async function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; localStorage.setItem('lang', currentLang); init(); }
window.addEventListener('hashchange', handleRouting);
init();
