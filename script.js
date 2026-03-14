let currentLang = 'fr';
let content = {};
function toggleTheme() { document.documentElement.classList.toggle('dark'); }
async function init() {
    try {
        const res = await fetch(`data/${currentLang}.json?v=${Date.now()}`);
        content = await res.json();
        render();
        handleRouting();
    } catch (e) { console.error(e); }
}
function render() {
    const d = content;
    ['name','role','sidebar_bio','hero_title','work_title','path_title'].forEach(id => {
        const el = document.getElementById(id); if(el && d[id]) el.innerText = d[id];
    });
    if(d.projects) document.getElementById('projects-container').innerHTML = d.projects.map(p => `<div class="bento-card"><h3>${p.name}</h3><span class="badge-blue">${p.tag}</span></div>`).join('');
    if(d.experiences) document.getElementById('experience-grid').innerHTML = d.experiences.map(e => `<div class="bento-card"><h4>${e.role}</h4><p>${e.company}</p></div>`).join('');
}
function handleRouting() {
    const hash = window.location.hash || '#home';
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + hash.substring(1));
    if(target) target.classList.add('active');
}
window.addEventListener('hashchange', handleRouting);
init();
