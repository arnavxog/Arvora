'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const audio=$('#audio');
let tracks=[],current=-1,lyrics=[],deferredInstall=null,toastTimer=null,searchTimer=null;
let favorites=new Set(JSON.parse(localStorage.getItem('arvora-favs')||'[]'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function show(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===view+'View'));$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{show(b.dataset.view);renderAll()}));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));
function row(t,i){return `<div class="track-row"><div class="track-art">${t.art?`<img loading="lazy" decoding="async" src="${esc(t.art)}" alt="">`:'♫'}</div><div class="track-info"><b>${esc(t.title)}</b><small>${esc(t.artist||'Unknown artist')} · ${t.duration?time(t.duration):'Audio'}</small></div><button class="row-play" data-play="${i}" aria-label="Play ${esc(t.title)}">▶</button><button class="like-btn" data-like="${i}" aria-label="Like ${esc(t.title)}">${favorites.has(t.id)?'♥':'♡'}</button></div>`}
function bindRows(){$$('[data-play]').forEach(b=>b.onclick=()=>play(+b.dataset.play));$$('[data-like]').forEach(b=>b.onclick=()=>toggleLike(+b.dataset.like))}
function renderAll(){const rows=tracks.map(row).join('');$('#recentList').innerHTML=rows||empty('Your music will appear here.','Add audio files to start listening.');$('#localList').innerHTML=tracks.filter(t=>t.local).map((t)=>row(t,tracks.indexOf(t))).join('')||empty('No local tracks yet.','Choose files from your device.');$('#favoritesList').innerHTML=tracks.filter(t=>favorites.has(t.id)).map(t=>row(t,tracks.indexOf(t))).join('')||empty('No favourites yet.','Tap ♡ on a track to save it here.');$('#trackCount').textContent=`${tracks.length} tracks`;bindRows();updatePlayer()}
function empty(a,b){return `<div class="empty-state">${a}<br><small>${b}</small></div>`}
function addTracks(list){tracks.push(...list);renderAll();if(current<0&&tracks.length)play(0);toast(`${list.length} track${list.length===1?'':'s'} added`)}
function toggleLike(i){const t=tracks[i];if(!t)return;favorites.has(t.id)?favorites.delete(t.id):favorites.add(t.id);try{localStorage.setItem('arvora-favs',JSON.stringify([...favorites]))}catch{}renderAll()}
function play(i){if(i<0||i>=tracks.length)return;current=i;audio.src=tracks[i].url;audio.load();audio.play().catch(()=>toast('Playback could not start. Tap play to try again.'));updatePlayer();renderAll()}
function updatePlayer(){const t=tracks[current];if(!t)return;$('#playerTitle').textContent=t.title;$('#playerArtist').textContent=t.artist||'Unknown artist';$('#miniArt').textContent=t.title[0]?.toUpperCase()||'A';$('#lyricsTitle').textContent=t.title;$('#lyricsArtist').textContent=t.artist||'Unknown artist';$('#lyricsArt').textContent=t.title[0]?.toUpperCase()||'A';$('#playerLike').textContent=favorites.has(t.id)?'♥':'♡'}
$('#playerLike').onclick=()=>{if(current>=0)toggleLike(current)};
$('#playBtn').onclick=()=>{if(!audio.src&&tracks.length){play(0);return}if(audio.paused)audio.play().catch(()=>toast('Choose a track first.'));else audio.pause()};
audio.onplay=()=>$('#playBtn').textContent='Ⅱ';audio.onpause=()=>$('#playBtn').textContent='▶';
audio.ontimeupdate=()=>{if(audio.duration){$('#seekBar').value=audio.currentTime/audio.duration*1000;$('#currentTime').textContent=time(audio.currentTime);highlightLyric()}};
audio.onloadedmetadata=()=>$('#duration').textContent=time(audio.duration);
audio.onended=()=>play((current+1)%tracks.length);
$('#seekBar').oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*e.target.value/1000};
$('#volumeBar').oninput=e=>audio.volume=+e.target.value;
$('#volumeBtn').onclick=()=>{audio.muted=!audio.muted;$('#volumeBtn').style.color=audio.muted?'#b7a4ff':''};
audio.volume=.8;
$('#nextBtn').onclick=()=>tracks.length&&play((current+1)%tracks.length);
$('#prevBtn').onclick=()=>tracks.length&&play((current-1+tracks.length)%tracks.length);
$('#lyricsBtn').onclick=()=>show('lyrics');$('#lyricsQuick').onclick=()=>show('lyrics');
$('#themeBtn').onclick=()=>document.body.classList.toggle('soft-mode');
$('#browseBtn').onclick=$('#chooseFilesBtn').onclick=()=>$('#fileInput').click();
$('#fileInput').onchange=e=>{const list=[...e.target.files].filter(f=>f.type.startsWith('audio/')||/\.flac$/i.test(f.name));if(!list.length){toast('No supported audio files selected.');return}addTracks(list.map(f=>({id:`local-${Date.now()}-${Math.random()}`,title:f.name.replace(/\.[^.]+$/,''),artist:'On this device',url:URL.createObjectURL(f),duration:0,local:true})));e.target.value=''};
function parseLrc(txt){return txt.split(/\r?\n/).flatMap(line=>{const tags=[...line.matchAll(/\[(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)],lyric=line.replace(/\[[^\]]+\]/g,'').trim();return tags.map(x=>({time:+x[1]*60 + +x[2] + +(x[3]||0)/1000,text:lyric}))}).filter(x=>x.text).sort((a,b)=>a.time-b.time)}
function renderLyrics(){$('#lyricsLines').innerHTML=lyrics.length?lyrics.map((l,i)=>`<p data-lyric="${i}">${esc(l.text)}</p>`).join(''):'<p class="lyric-muted">No synced lyrics loaded. Load an .LRC file to follow along.</p>'}
let lastLyric=-1;
function highlightLyric(){if(!lyrics.length)return;let idx=-1;for(let i=0;i<lyrics.length;i++){if(audio.currentTime>=lyrics[i].time)idx=i;else break}if(idx===lastLyric)return;lastLyric=idx;$$('[data-lyric]').forEach((p,i)=>{p.classList.toggle('current',i===idx);p.classList.toggle('past',i<idx)});const active=$(`[data-lyric="${idx}"]`);if(active)active.scrollIntoView({block:'center',behavior:'smooth'})}
$('#loadLrcBtn').onclick=()=>$('#lrcInput').click();
$('#lrcInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;lyrics=parseLrc(await f.text());lastLyric=-1;renderLyrics();highlightLyric();toast(`${lyrics.length} lyric lines loaded`);e.target.value=''};
async function searchCatalog(q){const box=$('#searchResults');box.innerHTML=empty('Searching music catalog…','Looking for available previews.');try{const r=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=20`,{mode:'cors'});if(!r.ok)throw Error('Catalog request failed');const data=await r.json();if(!data.results.length){box.innerHTML=empty('No matching previews found.','Try another artist or song.');return}box.innerHTML=data.results.map((x,i)=>`<div class="track-row"><div class="track-art"><img loading="lazy" decoding="async" src="${esc(x.artworkUrl100||'')}" alt=""></div><div class="track-info"><b>${esc(x.trackName)}</b><small>${esc(x.artistName)} · ${esc(x.collectionName||'')}</small></div><button class="row-play" data-preview="${i}" aria-label="Play preview">▶</button><span class="muted">Preview</span></div>`).join('');$$('[data-preview]').forEach(b=>b.onclick=()=>{const x=data.results[+b.dataset.preview];if(!x.previewUrl){toast('No preview is available for this track.');return}const id=`preview-${x.trackId}`;let i=tracks.findIndex(z=>z.id===id);if(i<0){tracks.push({id,title:x.trackName,artist:x.artistName,url:x.previewUrl,art:x.artworkUrl100,local:false});i=tracks.length-1}play(i)})}catch{box.innerHTML=empty('Catalog search is unavailable.','Check your connection or add local music.')}} 
$('#searchForm').onsubmit=e=>{e.preventDefault();const q=$('#searchInput').value.trim();if(q)searchCatalog(q)};
$('#searchInput').addEventListener('input',()=>{clearTimeout(searchTimer);const q=$('#searchInput').value.trim();if(q.length>=3)searchTimer=setTimeout(()=>searchCatalog(q),650)});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{if(!deferredInstall){toast('Use your browser menu and choose Install app / Add to Home Screen.');return}deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#installBtn').hidden=true};
window.addEventListener('appinstalled',()=>toast('ARVORA installed successfully'));
function updateConnection(){const el=$('#connectionStatus');el.textContent=navigator.onLine?'YOUR PERSONAL SOUNDSPACE':'OFFLINE MODE · LOCAL MUSIC AVAILABLE';el.classList.toggle('offline',!navigator.onLine)}
window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);updateConnection();
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();$('#playBtn').click()}if(e.key.toLowerCase()==='l')show('lyrics')});
renderAll();renderLyrics();
