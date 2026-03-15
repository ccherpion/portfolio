let currentLang = localStorage.getItem('lang') || 'en';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const bar = document.getElementById('progress-bar');
    if(bar) bar.style.width = (winScroll / height) * 100 + '%';
});

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function runScramble(id, speed = 25) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.getAttribute('data-text') || el.innerText;
    el.setAttribute('data-text', text);
    el.innerHTML = ''; el.style.visibility = 'visible'; el.style.opacity = '1';
    
    text.split(' ').forEach((w, wordIndex, words) => {
        const wSpan = document.createElement('span'); wSpan.className = 'word';
        [...w].forEach((c, cIndex) => {
            const s = document.createElement('span'); s.className = 'char'; s.innerText = c;
            wSpan.appendChild(s);
            let count = 0; const max = 3 + Math.floor(Math.random() * 4);
            setTimeout(() => {
                const itv = setInterval(() => {
                    s.innerText = scChars[Math.floor(Math.random() * scChars.length)]; s.style.opacity = '1';
                    if (count >= max) { s.innerText = c; clearInterval(itv); }
                    count++;
                }, 40);
            }, (wordIndex * 5 + cIndex) * speed);
        });
        el.appendChild(wSpan);
        if (wordIndex < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    const pageMap = { '#home': 'page-home', '#projects': 'page-projects', '#experience': 'page-experience' };
    const titleMap = { '#home': 'hero_title', '#projects': 'work_title', '#experience': 'path_title' };
    const subMap = { '#home': 'bio', '#projects': 'work_sub', '#experience': 'path_sub' };

    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const targetView = document.getElementById(pageMap[hash]);
    if(targetView) {
        targetView.classList.add('active');
        [titleMap[hash], subMap[hash]].forEach(t => { 
            const e = document.getElementById(t);
            if(e) { e.style.visibility = 'hidden'; e.style.opacity = '0'; }
        });
        setTimeout(() => {
            runScramble(titleMap[hash], 20); setTimeout(() => runScramble(subMap[hash], 5), 100);
        }, 50);
        targetView.querySelectorAll('.reveal-block').forEach((b, i) => { b.style.animationDelay = `${400 + (i * 50)}ms`; });
    }
    document.querySelectorAll(`a[href="${hash}"]`).forEach(l => l.classList.add('active'));
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', handleRouting);

async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${new Date().getTime()}`);
        content = await res.json();
        render(); handleRouting();
        setInterval(() => {
            const el = document.getElementById('live-time');
            if(el) el.innerText = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' CET';
        }, 1000);
    } catch (e) { console.error(e); }
}

function render() {
    const d = content;
    
    if (d.projects) {
        let total = 0;
        let maxVal = 0;
        d.projects.forEach(p => {
            let valStr = p.val.replace(/[^0-9.,kKmM]/g, '').replace(',', '.');
            let num = parseFloat(valStr.replace(/[kKmM]/g, ''));
            if (!isNaN(num)) {
                let multiplier = 1;
                if (valStr.toLowerCase().includes('k')) multiplier = 1000;
                else if (valStr.toLowerCase().includes('m')) multiplier = 1000000;
                let realVal = num * multiplier;
                total += realVal;
                if (realVal > maxVal) maxVal = realVal;
            }
        });
        if (total > 0) {
            let formatNum = (v) => v >= 1000000 ? (v / 1000000).toFixed(1).replace('.0', '') + 'M' : Math.round(v / 1000) + 'k';
            let formattedTotal = formatNum(total);
            let formattedMax = formatNum(maxVal);
            d.impact_val = currentLang === 'fr' ? `${formattedTotal}€+` : `€${formattedTotal}+`;
            d.max_budget_val = currentLang === 'fr' ? `${formattedMax}€+` : `€${formattedMax}+`;
        }
    }

    const ids = ['nav_home', 'nav_work', 'nav_exp', 'nav_home_mobile', 'nav_work_mobile', 'nav_exp_mobile', 'status', 'status_mobile', 'name', 'role', 'sidebar_bio', 'sidebar_skills_title', 'sidebar_hobbies_title', 'hero_title', 'work_title', 'path_title', 'bio', 'work_sub', 'path_sub', 'loc_nav', 'expertise_title', 'stack_title', 'edu_title', 'widget_title_stats', 'impact_val', 'impact_label', 'max_budget_val', 'max_budget_label', 'widget_title_focus', 'current_focus', 'btn_contact', 'btn_cv'];
    
    ids.forEach(id => {
        let key = id.replace('_mobile', ''); if (id === 'loc_nav') key = 'loc_val';
        const el = document.getElementById(id); if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    document.getElementById('lang-btn').innerText = d.lang_btn;
    if(d.sidebar_skills) document.getElementById('sidebar-skills').innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-50 dark:bg-[#333333] text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100 dark:border-darkBorder font-tech uppercase">${s}</span>`).join('');
    if(d.sidebar_hobbies) document.getElementById('sidebar-hobbies').innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue text-[10px] font-bold px-3 py-1.5 rounded-full font-tech uppercase">${h}</span>`).join('');
    
    if (d.expertise) {
        document.getElementById('expertise-grid').innerHTML = d.expertise.map(exp => `
            <div class="reveal-block hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg badge-blue flex items-center justify-center shrink-0"><i class="${exp.icon} text-lg"></i></div>
                <div><h4 class="text-sm font-bold uppercase font-tech text-gray-900 dark:text-white mb-1">${exp.name}</h4><p class="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">${exp.desc}</p></div>
            </div>
        `).join('');
    }

    if (d.stack) {
        document.getElementById('stack-grid').innerHTML = d.stack.map(category => `
            <div class="reveal-block space-y-3">
                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-tech px-2">// ${category.category}</h4>
                <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    ${category.items.map(item => `
                        <div class="tech-card hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder">
                            <span class="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase font-tech text-center leading-none">${item.name}</span>
                            <img src="${item.logo}" class="tech-logo" alt="${item.name}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="reveal-block hover-levitate group relative rounded-3xl overflow-hidden aspect-[4/3] border border-gray-200 dark:border-darkBorder">
                <img src="${p.img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700">
                <div class="project-gradient absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <div class="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 class="text-3xl font-black font-tech uppercase mb-3">${p.name}</h3>
                        <div class="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0"><p class="text-gray-200 text-xs leading-relaxed">${p.desc}</p></div>
                        <div class="flex justify-between items-center"><span class="badge-blue !bg-white/10 !text-white !border-white/20 text-[10px] font-bold px-4 py-2 rounded-full font-tech uppercase shadow-lg">${p.tag}</span><span class="text-2xl font-black font-tech">${p.val}</span></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (d.experiences) {
        document.getElementById('experience-grid').innerHTML = d.experiences.map(exp => `
            <div class="reveal-block hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex flex-col justify-between min-h-[250px]">
                <div><div class="flex justify-between items-start mb-5"><div class="w-12 h-12 rounded-lg badge-blue flex items-center justify-center shadow-sm"><i class="${exp.icon} text-xl"></i></div><span class="text-[10px] font-bold text-gray-400 font-tech uppercase">${exp.date}</span></div><h4 class="text-lg font-bold uppercase leading-tight mb-2 text-gray-900 dark:text-white">${exp.role}</h4><p class="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-4 opacity-80">${exp.company || ''}</p></div><p class="text-gray-600 dark:text-gray-400 text-[13px] font-medium leading-relaxed">${exp.desc}</p>
            </div>
        `).join('');
    }

    if (d.education) {
        document.getElementById('education-grid').innerHTML = d.education.map(edu => `
            <div class="reveal-block hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex flex-col justify-between min-h-[180px]">
                <div><div class="flex justify-between items-start mb-5"><div class="w-12 h-12 rounded-lg badge-blue flex items-center justify-center shadow-sm"><i class="${edu.icon} text-xl"></i></div><span class="text-[10px] font-bold text-gray-400 uppercase font-tech">${edu.date}</span></div><h4 class="text-base font-bold uppercase mb-1 text-gray-900 dark:text-white">${edu.degree}</h4><p class="text-gray-500 text-[11px] uppercase font-tech">${edu.school}</p></div>
            </div>
        `).join('');
    }
}
async function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; localStorage.setItem('lang', currentLang); init(); }
init();
