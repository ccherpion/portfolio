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
    
    const currentHeight = el.offsetHeight;
    if (currentHeight > 0) el.style.minHeight = currentHeight + 'px';
    
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
                    s.innerText = scChars[Math.floor(Math.random() * scChars.length)]; 
                    s.style.opacity = '1';
                    s.style.transform = 'translateY(0)';
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
    const pageMap = { '#home': 'page-home', '#projects': 'page-projects', '#experience': 'page-experience', '#dashboards': 'page-dashboards' };
    const subMap = { '#home': 'bio', '#projects': 'work_sub', '#experience': 'path_sub', '#dashboards': 'dash_sub' };
    
    const pageSubtitles = {
        '#home': ['expertise_title', 'stack_title'],
        '#projects': ['projects_list_title'],
        '#experience': ['exp_list_title', 'edu_title', 'cert_title'],
        '#dashboards': [] 
    };

    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const targetView = document.getElementById(pageMap[hash]);
    if(targetView) {
        targetView.classList.add('active');
        
        const subEl = document.getElementById(subMap[hash]);
        if(subEl) { subEl.style.visibility = 'hidden'; subEl.style.opacity = '0'; }
        
        setTimeout(() => {
            runScramble(subMap[hash], 10);
        }, 100);
        
        if(pageSubtitles[hash]) {
            pageSubtitles[hash].forEach((id, i) => {
                const el = document.getElementById(id);
                if(el) { el.style.visibility = 'hidden'; el.style.opacity = '0'; }
                setTimeout(() => runScramble(id, 20), 400 + (i * 150));
            });
        }
        
        targetView.querySelectorAll('.reveal-block').forEach((b, i) => { b.style.animationDelay = `${350 + (i * 120)}ms`; });
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
            const timeStr = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' CET';
            const el = document.getElementById('live-time');
            const elMob = document.getElementById('live-time-mobile');
            if(el) el.innerText = timeStr;
            if(elMob) elMob.innerText = timeStr;
        }, 1000);
    } catch (e) { console.error("Error loading JSON:", e); }
}

function render() {
    const d = content;
    
    if (d.projects) {
        let total = 0; let maxVal = 0;
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
            d.impact_val = currentLang === 'fr' ? `${formatNum(total)}€+` : `€${formatNum(total)}+`;
            d.max_budget_val = currentLang === 'fr' ? `${formatNum(maxVal)}€+` : `€${formatNum(maxVal)}+`;
        }
    }

    const ids = ['loc_nav_mobile', 'nav_home', 'nav_work', 'nav_exp', 'nav_dash', 'nav_home_mobile', 'nav_work_mobile', 'nav_exp_mobile', 'nav_dash_mobile', 'status', 'status_mobile', 'name', 'role', 'sidebar_bio', 'sidebar_skills_title', 'sidebar_hobbies_title', 'badges_title', 'hero_title', 'work_title', 'path_title', 'dash_title', 'cert_title', 'bio', 'work_sub', 'path_sub', 'dash_sub', 'loc_nav', 'expertise_title', 'stack_title', 'projects_list_title', 'exp_list_title', 'edu_title', 'widget_title_stats', 'impact_val', 'impact_label', 'max_budget_val', 'max_budget_label', 'widget_title_focus', 'current_focus', 'btn_contact', 'btn_cv', 'btn_meeting'];
    
    ids.forEach(id => {
        let key = id.replace('_mobile', ''); if (key === 'loc_nav') key = 'loc_val';
        const el = document.getElementById(id); if(el && d[key]) { el.innerText = d[key]; el.setAttribute('data-text', d[key]); }
    });

    const langBtn = document.getElementById('lang-btn');
    if(langBtn) langBtn.innerText = d.lang_btn;

    const skillsEl = document.getElementById('sidebar-skills');
    if(skillsEl && d.sidebar_skills) skillsEl.innerHTML = d.sidebar_skills.map(s => `<span class="bg-gray-50 dark:bg-[#333333] text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100 dark:border-darkBorder font-tech uppercase">${s}</span>`).join('');
    
    const hobbiesEl = document.getElementById('sidebar-hobbies');
    if(hobbiesEl && d.sidebar_hobbies) hobbiesEl.innerHTML = d.sidebar_hobbies.map(h => `<span class="badge-blue text-[10px] font-bold px-3 py-1.5 rounded-full font-tech uppercase">${h}</span>`).join('');
    
    const badgesEl = document.getElementById('sidebar-badges');
    if (badgesEl && d.sidebar_badges) {
        badgesEl.innerHTML = d.sidebar_badges.map(b => `
            <div class="group relative flex justify-center items-center">
                <img src="${b.img}" alt="${b.name}" class="h-16 w-auto object-contain hover:scale-110 transition-transform duration-300 drop-shadow-md cursor-help">
                <div class="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap font-tech pointer-events-none z-50 shadow-lg">
                    ${b.name}
                </div>
            </div>
        `).join('');
    }

    if (d.expertise) {
        const el = document.getElementById('expertise-grid');
        if (el) el.innerHTML = d.expertise.map(exp => `
            <div class="reveal-block h-full">
                <div class="hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex items-start gap-4 h-full">
                    <div class="w-10 h-10 rounded-lg badge-blue flex items-center justify-center shrink-0"><i class="${exp.icon} text-lg"></i></div>
                    <div><h4 class="text-sm font-bold uppercase font-tech text-gray-900 dark:text-white mb-1">${exp.name}</h4><p class="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">${exp.desc}</p></div>
                </div>
            </div>
        `).join('');
    }

    if (d.stack) {
        const el = document.getElementById('stack-grid');
        if (el) el.innerHTML = d.stack.map(category => `
            <div class="reveal-block space-y-3">
                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-tech px-2">// ${category.category}</h4>
                <div class="flex flex-wrap gap-2">
                    ${category.items.map(item => `
                        <div class="hover-levitate flex items-center gap-2 px-3 py-2 bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-lg transition-all duration-300">
                            <img src="${item.logo}" class="w-4 h-4 object-contain" alt="${item.name}">
                            <span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase font-tech leading-none">${item.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    if (d.projects) {
        const el = document.getElementById('projects-container');
        if (el) el.innerHTML = d.projects.map(p => `
            <div class="reveal-block h-full">
                <div class="hover-levitate group relative rounded-3xl overflow-hidden aspect-[4/3] border border-gray-200 dark:border-darkBorder h-full">
                    <img src="${p.img}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700">
                    <div class="project-gradient absolute inset-0 flex flex-col justify-end p-8 text-white">
                        <div class="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 class="text-3xl font-black font-tech uppercase mb-3">${p.name}</h3>
                            <div class="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0"><p class="text-gray-200 text-xs leading-relaxed">${p.desc}</p></div>
                            <div class="flex justify-between items-center"><span class="badge-blue !bg-white/10 !text-white !border-white/20 text-[10px] font-bold px-4 py-2 rounded-full font-tech uppercase shadow-lg">${p.tag}</span><span class="text-2xl font-black font-tech">${p.val}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const expData = d.experiences || d.experience;
    if (expData) {
        const el = document.getElementById('experience-grid');
        if (el) el.innerHTML = expData.map(exp => `
            <div class="reveal-block h-full">
                <div class="hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex flex-col justify-between min-h-[250px] h-full shadow-sm">
                    <div>
                        <div class="flex justify-between items-start mb-5">
                            <div class="w-12 h-12 rounded-lg badge-blue flex items-center justify-center shadow-sm"><i class="${exp.icon} text-xl"></i></div>
                            <span class="text-[10px] font-bold text-gray-400 font-tech uppercase">${exp.date}</span>
                        </div>
                        <h4 class="text-lg font-bold uppercase leading-tight mb-2 text-gray-900 dark:text-white">${exp.role}</h4>
                        <p class="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-4 opacity-80">${exp.company || ''}</p>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 text-[13px] font-medium leading-relaxed">${exp.desc || ''}</p>
                </div>
            </div>
        `).join('');
    }

    if (d.education) {
        const el = document.getElementById('education-grid');
        if (el) el.innerHTML = d.education.map(edu => `
            <div class="reveal-block h-full">
                <div class="hover-levitate bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex flex-col justify-between min-h-[250px] h-full shadow-sm">
                    <div>
                        <div class="flex justify-between items-start mb-5">
                            <div class="w-12 h-12 rounded-lg badge-blue flex items-center justify-center shadow-sm"><i class="${edu.icon} text-xl"></i></div>
                            <span class="text-[10px] font-bold text-gray-400 font-tech uppercase">${edu.date}</span>
                        </div>
                        <h4 class="text-lg font-bold uppercase leading-tight mb-2 text-gray-900 dark:text-white">${edu.degree}</h4>
                        <p class="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-4 opacity-80">${edu.school || ''}</p>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 text-[13px] font-medium leading-relaxed">${edu.desc || ''}</p>
                </div>
            </div>
        `).join('');
    }

    if (d.certifications && d.certifications.length > 0) {
        const grouped = d.certifications.reduce((acc, cert) => {
            if (!acc[cert.issuer]) acc[cert.issuer] = [];
            acc[cert.issuer].push(cert);
            return acc;
        }, {});
        
        const el = document.getElementById('certifications-grid');
        if (el) el.innerHTML = Object.keys(grouped).map(issuer => {
            const count = grouped[issuer].length;
            let cardWidth = 'w-full';
            let innerGrid = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

            if (count === 1) { cardWidth = 'w-full md:w-[calc(50%-0.75rem)] xl:w-[calc(25%-1.125rem)]'; innerGrid = 'grid-cols-1'; }
            else if (count === 2) { cardWidth = 'w-full md:w-full xl:w-[calc(50%-0.75rem)]'; innerGrid = 'grid-cols-1 sm:grid-cols-2'; }
            else if (count === 3) { cardWidth = 'w-full md:w-full xl:w-[calc(75%-0.375rem)]'; innerGrid = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'; }

            let certsHtml = '';
            grouped[issuer].forEach(cert => {
                let iconOrBadge = '<i class="fas fa-file-alt text-gray-400 group-hover:text-blue-500 transition-colors text-[11px] shrink-0"></i>';
                if (cert.badge) {
                    iconOrBadge = '<img src="' + cert.badge + '" alt="Badge" class="w-6 h-6 object-contain shrink-0 rounded-sm shadow-sm border border-gray-100 dark:border-darkBorder bg-white">';
                }
                
                let externalIcon = cert.pdf ? '<i class="fas fa-external-link-alt text-[9px] text-gray-400 group-hover:text-blue-500 shrink-0 ml-2"></i>' : '';
                
                let inner = '<div class="flex items-center gap-2.5 overflow-hidden">' +
                                iconOrBadge +
                                '<div class="flex flex-col min-w-0">' +
                                    '<span class="text-[9.5px] font-bold text-gray-700 dark:text-gray-300 uppercase font-tech leading-tight truncate">' + cert.name + '</span>' +
                                    '<span class="text-[8.5px] text-gray-500 uppercase font-tech leading-none mt-0.5">' + cert.date + '</span>' +
                                '</div>' +
                            '</div>' + externalIcon;

                if (cert.pdf) {
                    certsHtml += '<a href="' + cert.pdf + '" target="_blank" rel="noopener noreferrer" class="group flex items-center justify-between p-2.5 rounded-lg bg-gray-50/70 dark:bg-[#333333]/70 hover:bg-white dark:hover:bg-[#404040] border border-transparent hover:border-gray-200 dark:hover:border-darkBorder shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full">' + inner + '</a>';
                } else {
                    certsHtml += '<div class="group flex items-center justify-between p-2.5 rounded-lg bg-gray-50/70 dark:bg-[#333333]/70 border border-transparent h-full">' + inner + '</div>';
                }
            });

            return '<div class="reveal-block ' + cardWidth + '">' +
                '<div class="bg-white/70 dark:bg-[#272727]/80 backdrop-blur-md border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col h-full">' +
                    '<h4 class="text-[13px] font-black uppercase text-gray-900 dark:text-white mb-4 flex items-center justify-between border-b border-gray-100 dark:border-darkBorder pb-2">' +
                        '<span class="flex items-center gap-2"><i class="fas fa-award text-blue-500 text-lg"></i> ' + issuer + '</span>' +
                        '<span class="text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50">' + count + '</span>' +
                    '</h4>' +
                    '<div class="grid ' + innerGrid + ' gap-2.5 flex-grow">' + certsHtml + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    if (d.dashboards_list) {
        const dashGrid = document.getElementById('dashboards-grid');
        if (dashGrid) {
            dashGrid.innerHTML = d.dashboards_list.map((dash, i) => `
                <div class="reveal-block w-full space-y-6">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-200 dark:border-darkBorder pb-6">
                        <div>
                            <h3 id="dash_title_dyn_${i}" class="text-[13px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] font-tech">${dash.title}</h3>
                            <p class="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed font-tech text-[11px]">${dash.desc}</p>
                        </div>
                        <a class="shrink-0 px-8 py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-400 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 whitespace-nowrap" href="${dash.link}" target="_blank">${dash.btn_text}</a>
                    </div>
                    
                    <div class="w-full h-[80vh] md:h-auto md:aspect-[16/10] xl:aspect-[16/9] rounded-3xl overflow-hidden border border-gray-200 dark:border-darkBorder shadow-2xl">
                        <iframe src="${dash.iframe_url}" class="w-full h-full border-none bg-[#0f172a]" title="${dash.title}"></iframe>
                    </div>
                </div>
            `).join('');

            d.dashboards_list.forEach((_, i) => {
                setTimeout(() => runScramble(`dash_title_dyn_${i}`, 20), 500 + (i * 150));
            });
        }
    }

    if (d.seo) {
        document.title = d.seo.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", d.seo.description);
    }
    
    const globalSubtitles = ['sidebar_skills_title', 'sidebar_hobbies_title', 'badges_title', 'widget_title_stats', 'widget_title_focus'];
    globalSubtitles.forEach((id, i) => {
        const subEl = document.getElementById(id);
        if(subEl) { subEl.style.visibility = 'hidden'; subEl.style.opacity = '0'; }
        setTimeout(() => runScramble(id, 20), 600 + (i * 150));
    });
}
async function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; localStorage.setItem('lang', currentLang); init(); }
init();