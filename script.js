let currentLang = localStorage.getItem('lang') || 'fr';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#%*+";

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

function runScramble(id, speed = 25) {
    const el = document.getElementById(id); if (!el) return;
    const text = el.getAttribute('data-text') || el.innerText;
    if (!text || text === "...") return;
    el.innerHTML = ''; el.style.opacity = '1';
    let charIdx = 0;
    text.split(' ').forEach(w => {
        const wSpan = document.createElement('span'); wSpan.className = 'word';
        [...w].forEach(c => {
            const s = document.createElement('span'); s.className = 'char'; s.innerText = c;
            wSpan.appendChild(s);
            const currentIdx = charIdx;
            setTimeout(() => {
                let cnt = 0; const itv = setInterval(() => {
                    s.innerText = scChars[Math.floor(Math.random() * scChars.length)]; s.classList.add('visible');
                    if (cnt >= 5) { s.innerText = c; clearInterval(itv); } cnt++;
                }, 30);
            }, currentIdx * speed);
            charIdx++;
        });
        el.appendChild(wSpan); charIdx++;
    });
}

function triggerBento() {
    const view = document.querySelector('.page-view.active');
    if(!view) return;
    view.querySelectorAll('.bento-card').forEach((c, i) => {
        c.classList.remove('reveal-active');
        void c.offsetWidth;
        c.style.transitionDelay = `${350 + (i * 80)}ms`;
        c.classList.add('reveal-active');
    });
}

function render() {
    const d = content;
    const ids = ['status','status_mobile','name','role','sidebar_bio','sidebar_skills_title','sidebar_hobbies_title','btn_contact','btn_cv','hero_title','work_title','path_title','bio','work_sub','path_sub','impact_val','impact_label','max_budget_val','max_budget_label','widget_title_stats','widget_title_focus','current_focus','loc_nav'];
    
    ids.forEach(id => {
        let key = id.replace('_mobile', ''); if (id === 'loc_nav') key = 'loc_val';
        const el = document.getElementById(id);
        if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    if(d.sidebar_skills) document.getElementById('sidebar-skills').innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-50 dark:bg-darkBorder text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100 font-tech uppercase">${s}</span>`).join('');
    if(d.sidebar_hobbies) document.getElementById('sidebar-hobbies').innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue">${h}</span>`).join('');
    
    if (d.stack) {
        document.getElementById('stack-grid').innerHTML = d.stack.map(s => `<div class="bento-card bg-white dark:bg-[#1f1f22] border border-gray-100 p-6 rounded-2xl">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-darkBorder"><div class="w-10 h-10 rounded-lg badge-blue flex items-center justify-center shadow-sm"><i class="${s.icon} text-lg"></i></div><h4 class="text-sm font-bold uppercase font-tech">${s.category}</h4></div>
        <div class="grid grid-cols-2 gap-4">${s.items.map(item => `<div class="flex items-center gap-2"><img src="${item.logo}" class="w-6 h-6 grayscale opacity-40"><span class="text-[11px] font-bold font-tech uppercase text-gray-500">${item.name}</span></div>`).join('')}</div></div>`).join('');
    }
    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `<div class="bento-card group relative rounded-3xl overflow-hidden aspect-[4/3] border border-gray-100">
        <img src="${p.img}" class="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105">
        <div class="absolute inset-0 bg-black/50 flex flex-col justify-end p-8 text-white"><h3 class="text-3xl font-black uppercase mb-2 tracking-tighter">${p.name}</h3><p class="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity mb-4">${p.desc}</p><div class="flex justify-between items-center"><span class="badge-blue !bg-white/10 !text-white !border-transparent">${p.tag}</span><span class="text-2xl font-black font-tech">${p.val}</span></div></div></div>`).join('');
    }
    if (d.experiences) {
        document.getElementById('experience-grid').innerHTML = d.experiences.map(exp => `<div class="bento-card bg-white dark:bg-[#1f1f22] border border-gray-100 p-6 rounded-2xl flex flex-col justify-between min-h-[250px]">
        <div><div class="flex justify-between items-start mb-5"><div class="w-12 h-12 rounded-lg badge-blue flex items-center justify-center"><i class="${exp.icon} text-xl"></i></div><span class="text-[10px] font-bold text-gray-400 font-tech uppercase">${exp.date}</span></div><h4 class="text-lg font-bold uppercase leading-tight mb-2 tracking-tighter">${exp.role}</h4><p class="text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-4 opacity-80">${exp.company || ''}</p></div><p class="text-gray-500 dark:text-gray-400 text-[13px] font-medium leading-relaxed">${exp.desc}</p></div>`).join('');
    }
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    const pageMap = { '#home': 'page-home', '#projects': 'page-projects', '#experience': 'page-experience' };
    const titleMap = { '#home': 'hero_title', '#projects': 'work_title', '#experience': 'path_title' };
    const subMap = { '#home': 'bio', '#projects': 'work_sub', '#experience': 'path_sub' };

    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const target = document.getElementById(pageMap[hash]);
    if(target) {
        target.classList.add('active');
        if(titleMap[hash]) runScramble(titleMap[hash], 20);
        if(subMap[hash]) setTimeout(() => runScramble(subMap[hash], 5), 100);
        triggerBento();
    }
    document.querySelectorAll(`a[href="${hash}"]`).forEach(l => l.classList.add('active'));
    window.scrollTo(0, 0);
}

async function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; localStorage.setItem('lang', currentLang); init(); }
window.addEventListener('hashchange', handleRouting);
init();
