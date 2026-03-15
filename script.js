let currentLang = localStorage.getItem('lang') || 'en';
let content = {};
const scChars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function runScramble(id, speed = 25) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.getAttribute('data-text') || el.innerText;
    el.setAttribute('data-text', text);
    el.innerHTML = '';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    
    const words = text.split(' ');
    let cTotal = 0;
    words.forEach((w, wordIndex) => {
        const wSpan = document.createElement('span');
        wSpan.className = 'word';
        [...w].forEach(c => {
            const s = document.createElement('span');
            s.className = 'char';
            s.innerText = c;
            wSpan.appendChild(s);
            let count = 0;
            const max = 3 + Math.floor(Math.random() * 4);
            setTimeout(() => {
                const itv = setInterval(() => {
                    s.innerText = scChars[Math.floor(Math.random() * scChars.length)];
                    s.style.opacity = '1';
                    if (count >= max) { s.innerText = c; clearInterval(itv); }
                    count++;
                }, 40);
            }, cTotal * speed);
            cTotal++;
        });
        el.appendChild(wSpan);
        // Ajout d'un espace réel pour éviter que les mots ne fusionnent
        if (wordIndex < words.length - 1) { el.appendChild(document.createTextNode(' ')); }
        cTotal++;
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
        // Déclenchement de l'animation CSS via la classe active
        targetView.classList.add('active');
        
        const targets = [titleMap[hash], subMap[hash]];
        targets.forEach(t => { 
            const e = document.getElementById(t);
            if(e) { e.style.visibility = 'hidden'; e.style.opacity = '0'; }
        });

        // Retardateur pour synchroniser le scramble avec le fondu de page
        setTimeout(() => {
            runScramble(titleMap[hash], 20);
            setTimeout(() => runScramble(subMap[hash], 5), 150);
        }, 300);

        const blocks = targetView.querySelectorAll('.reveal-block');
        blocks.forEach((b, i) => { b.style.animationDelay = `${500 + (i * 100)}ms`; });
    }
    document.querySelectorAll(`a[href="${hash}"]`).forEach(l => l.classList.add('active'));
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', handleRouting);

async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${new Date().getTime()}`);
        content = await res.json();
        render();
        handleRouting();
        setInterval(() => {
            const el = document.getElementById('live-time');
            if(el) el.innerText = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' CET';
        }, 1000);
    } catch (e) { console.error(e); }
}

function render() {
    const d = content;
    const ids = ['nav_home', 'nav_work', 'nav_exp', 'nav_home_mobile', 'nav_work_mobile', 'nav_exp_mobile', 'status', 'status_mobile', 'name', 'role', 'sidebar_bio', 'sidebar_skills_title', 'sidebar_hobbies_title', 'hero_title', 'work_title', 'path_title', 'bio', 'work_sub', 'path_sub', 'loc_nav', 'stack_title', 'edu_title', 'widget_title_stats', 'impact_val', 'impact_label', 'max_budget_val', 'max_budget_label', 'widget_title_focus', 'current_focus', 'btn_contact', 'btn_cv'];
    
    ids.forEach(id => {
        let key = id.replace('_mobile', '');
        if (id === 'loc_nav') key = 'loc_val';
        const el = document.getElementById(id);
        if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    document.getElementById('lang-btn').innerText = d.lang_btn;
    if(d.sidebar_skills) document.getElementById('sidebar-skills').innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-50 dark:bg-[#252529] text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100 dark:border-darkBorder font-tech uppercase">${s}</span>`).join('');
    if(d.sidebar_hobbies) document.getElementById('sidebar-hobbies').innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue text-[10px] font-bold px-3 py-1.5 rounded-full font-tech uppercase">${h}</span>`).join('');
    
    if (d.stack) {
        document.getElementById('stack-grid').innerHTML = d.stack.map(category => `
            <div class="reveal-block space-y-4">
                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-tech px-2">// ${category.category}</h4>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                    ${category.items.map(item => `
                        <div class="tech-card rounded-xl p-4 transition-all">
                            <span class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase font-tech text-center leading-none mb-2">${item.name}</span>
                            <img src="${item.logo}" class="tech-logo" alt="${item.name}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    if (d.projects) {
        document.getElementById('projects-container').innerHTML = d.projects.map(p => `
            <div class="reveal-block framer-card group relative rounded-3xl overflow-hidden aspect-[4/3] border border-gray-200 dark:border-darkBorder">
                <img src="${p.img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700">
                <div class="project-gradient absolute inset-0 flex flex-col justify-end p-8 text-white"><div class="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500"><h3 class="text-3xl font-black font-tech uppercase mb-3">${p.name}</h3><p class="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2 mb-4">${p.desc}</p><div class="flex justify-between items-center"><span class="badge-blue !bg-white/10 !text-white !border-white/20 text-[10px] font-bold px-4 py-2 rounded-full font-tech uppercase shadow-lg">${p.tag}</span><span class="text-2xl font-black font-tech">${p.val}</span></div></div></div>
            </div>
        `).join('');
    }
    // ... Reste du rendu (experiences, education)
}

async function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; localStorage.setItem('lang', currentLang); init(); }
init();