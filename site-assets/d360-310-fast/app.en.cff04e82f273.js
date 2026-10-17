'use strict';
globalThis.D360_ASSETS={"poster": "assets/04.png", "single": "assets/06.png", "multi": "assets/08.png", "logos": "assets/festival-logos.svg", "footer": "assets/footer-location.svg", "logosPng": "assets/festival-logos.svg", "footerPng": "assets/footer-location.svg"};
document.body.innerHTML="\n<header class=\"topbar\"><div class=\"brand\"><button id=\"brandHome\" aria-label=\"Back to language selection\"><b>Design 360 Festival</b></button></div><div class=\"topnote\">360 DESIGN FESTIVAL · 2026.11.26—11.29</div><div class=\"toplinks\"><span id=\"saveState\" class=\"small desktop\">Your choices become your poster.</span><button class=\"link\" id=\"helpBtn\">Instructions</button></div></header>\n<main class=\"workspace\"><section class=\"stage\" aria-label=\"Poster canvas\"><div class=\"stagebar\"><span id=\"stageLabel\">01 / THE FIRST SELECTION</span><div class=\"row\"><button id=\"zoomBtn\" title=\"Change preview size\">Enlarge</button><button id=\"toControls\" class=\"hidden\">Edit selected square</button></div></div><div class=\"poster-shell\" id=\"posterShell\"><canvas id=\"poster\" width=\"1160\" height=\"1793\" aria-label=\"Design 360 poster preview\"></canvas><div class=\"hotspots\" id=\"hotspots\"></div></div><div class=\"stagefoot\"><span id=\"canvasHint\">Click squares to make your selection.</span><span>HANGZHOU, CHINA</span></div></section><aside class=\"panel\" id=\"panel\" aria-label=\"Poster controls\"><div class=\"eyebrow\">SELECT ALL SQUARES WITH DESIGN</div><h1>Find design.</h1><p class=\"lead\">Start with a selection.<br>Select the three squares containing design / 设计节.</p><div class=\"counterline\"><div class=\"count\" id=\"initialCount\">0 <span>/ 3</span></div><span class=\"small\">YOUR SELECTION</span></div><button class=\"primary\" id=\"initialConfirm\" style=\"width:100%\" disabled>Confirm selection →</button><div class=\"section\"><p class=\"small\">Then create a question with text, images or colors and invite friends to answer.</p></div></aside></main>\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\"></div><dialog id=\"dialog\"><div id=\"dialogHead\"><button class=\"close\" aria-label=\"Close\">×</button></div><div id=\"dialogBody\"></div></dialog><input type=\"file\" id=\"fileInput\" accept=\"image/png,image/jpeg,image/webp\" multiple>\n<script id=\"embedded-question\" type=\"application/json\">null</script>\n";
'use strict';
const UI_LANGUAGE='en';
'use strict';
const HOST=location.origin;
const REF={poster:globalThis.D360_ASSETS.poster,single:globalThis.D360_ASSETS.single,multi:globalThis.D360_ASSETS.multi};
const $=id=>document.getElementById(id), W=1160,H=1793,G={x:24,y:305,w:1112,h:1100};
const images=new Map();const assets={};let state,stage='entry',step=1,selected=0,picks=new Set(),entryPicks=new Set(),historyStack=[],redoStack=[],swapFrom=null,picking=false,saveTimer,toastTimer,uploadMode='multi',isGuest=false,questionId=null;
const clone=x=>JSON.parse(JSON.stringify(x));const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);const blank=()=>({id:uid(),type:'text',text:'',bg:'#f8f8f8',colorApplied:false,fg:'#000000',size:1,align:'left',locked:false,zoom:1,px:.5,py:.5});
function newState(){return {v:1,topic:'design',cols:3,rows:3,cells:Array.from({length:9},blank),shelf:[],line:'auto',lineWidth:5,precision:0,mode:'open',answer:[],whole:null,gray:false};}
state=newState();
function img(src){if(!images.has(src)){const i=new Image();i.onload=()=>draw();i.onerror=()=>toast('An image could not be loaded. Upload it again.','error');i.src=src;images.set(src,i);}return images.get(src);}
// Routine feedback is brief; entry hints and errors keep their reading time.
function hideToast(immediate=false){
  clearTimeout(toastTimer);
  const el=$('toast');
  el.classList.toggle('dismissed',immediate);
  el.classList.remove('show');
}
function toast(t,kind='info'){
  const el=$('toast');
  clearTimeout(toastTimer);
  el.classList.remove('dismissed');
  el.dataset.kind=kind;
  el.textContent=typeof t==='string'?t.replace(/。(?=\s*$)/u,''):t;
  el.classList.add('show');
  toastTimer=setTimeout(()=>hideToast(),kind==='info'?1500:3400);
}
// Remove old feedback before the next action, without consuming that action.
document.addEventListener('pointerdown',()=>{
  if($('toast')?.dataset.kind==='info')hideToast(true);
},true);
let textLines,draw,hits,cellClick;
function cover(ctx,im,x,y,w,h,z=1,px=.5,py=.5,rect=null){if(!im.complete||!im.naturalWidth)return;let r=rect||{x:0,y:0,w:im.naturalWidth,h:im.naturalHeight};const a=w/h;let sw=r.w,sh=r.h;if(sw/sh>a)sw=sh*a;else sh=sw/a;sw/=z;sh/=z;const sx=r.x+(r.w-sw)*px,sy=r.y+(r.h-sh)*py;ctx.drawImage(im,sx,sy,sw,sh,x,y,w,h);}
function check(ctx,x,y,sz,lineWidth=5){ctx.save();ctx.beginPath();ctx.arc(x+sz/2,y+sz/2,sz/2-2,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=lineWidth;ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz*.21,y+sz*.59);ctx.lineTo(x+sz*.41,y+sz*.78);ctx.lineTo(x+sz*.77,y+sz*.22);ctx.lineWidth=6;ctx.stroke();ctx.restore();}
function entryState(){const s=newState();s.entryArtwork=true;['des\nign','360','设计\n节','360','des\nign','fest\nival','202\n6','11.\n26-','11.\n29'].forEach((t,i)=>Object.assign(s.cells[i],{text:t,type:isNumeric(t)?'number':'text',align:isHeroNumber(t)?'left':isNumeric(t)?'center':'left',size:1}));return s;}
function topicTypography(ctx,topic){const chinese=/[\u3400-\u9fff]/.test(topic),family=chinese?'"D360Chinese", "Microsoft YaHei", sans-serif':'"D360Bold", Arial, sans-serif',weight=chinese?400:700;let size=72;while(size>30){ctx.font=`${weight} ${size}px ${family}`;ctx.letterSpacing='-2px';if(ctx.measureText(topic||'________________').width<1020)break;size-=2;}return {size,width:topic?ctx.measureText(topic).width:220,underlineY:Math.round(130+size)};}
function drawTo(ctx,s,marks){ctx.fillStyle='#f8f8f8';ctx.fillRect(0,0,W,H);ctx.fillStyle='#000';ctx.textAlign='left';ctx.textBaseline='top';ctx.letterSpacing='-2px';ctx.font='700 72px "D360Bold", Arial, sans-serif';ctx.fillText('Select all squares with',23,43);ctx.letterSpacing='0px';const right=1110,y=53;ctx.textAlign='right';ctx.font='700 72px "D360Bold", Arial, sans-serif';ctx.fillText(String(s.rows),right,y);const rowWidth=ctx.measureText(String(s.rows)).width;ctx.font='400 72px "D360Roman", Arial, sans-serif';ctx.fillText('x',right-rowWidth,y);const xWidth=ctx.measureText('x').width;ctx.font='700 72px "D360Bold", Arial, sans-serif';ctx.fillText(String(s.cols),right-rowWidth-xWidth,y);ctx.textAlign='left';const topicMetrics=topicTypography(ctx,s.topic);ctx.fillText(s.topic||'',23,130);ctx.fillRect(23,topicMetrics.underlineY,Math.max(100,topicMetrics.width+4),3);ctx.letterSpacing='0px';
const cw=G.w/s.cols,ch=G.h/s.rows;for(let i=0;i<s.cells.length;i++){const c=s.cells[i],x=G.x+i%s.cols*cw,y=G.y+Math.floor(i/s.cols)*ch;ctx.save();ctx.beginPath();ctx.rect(x,y,cw,ch);ctx.clip();ctx.fillStyle='#f8f8f8';ctx.fillRect(x,y,cw,ch);if(c.asset){const src=assets[c.asset];if(src){ctx.filter=s.gray?'grayscale(1)':'none';cover(ctx,img(src),x,y,cw,ch,c.zoom,c.px,c.py,c.rect);ctx.filter='none';}}if(hasColorFill(c)){ctx.fillStyle=c.bg;ctx.fillRect(x,y,cw,ch);}if(c.text.trim()){ctx.fillStyle=c.fg;textLines(ctx,c.text,x,y,cw,ch,c.type,c.size,c.type==='number'?'center':c.align);}ctx.restore();}
let visual=s.cells.some(c=>c.asset||hasColorFill(c));ctx.strokeStyle=s.line==='auto'?(visual?'#fff':'#000'):s.line;ctx.lineWidth=s.lineWidth;ctx.beginPath();for(let c=1;c<s.cols;c++){ctx.moveTo(G.x+c*cw,G.y);ctx.lineTo(G.x+c*cw,G.y+G.h);}for(let r=1;r<s.rows;r++){ctx.moveTo(G.x,G.y+r*ch);ctx.lineTo(G.x+G.w,G.y+r*ch);}ctx.stroke();for(const i of marks||[]){if(i>=0&&i<s.cells.length)check(ctx,G.x+i%s.cols*cw+2,G.y+Math.floor(i/s.cols)*ch+2,Math.min(cw,ch)*.265,s.lineWidth);}
const foot=img(REF.poster);if(foot.complete&&foot.naturalWidth)ctx.drawImage(foot,0,1509,1165,206,22,1513,1116,198);else{ctx.fillStyle='#000';ctx.font='700 64px Arial';ctx.fillText('360 Design Festival',23,1518);ctx.fillText('2026.11.26–11.29',23,1590);}}
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const on=(id,fn,event='click')=>{const el=$(id);if(el)el.addEventListener(event,fn);};
const topics=['design','humans','objects','words','images','art','beauty','value','meaning','emotion','memory','truth','freedom','life','love','lucky number'];
let questionLoadError='';
let editTab='text',draft=null,shareCache=null,entryErrors=0,suppressSave=false;
function historySnapshot(){return {state:clone(state),selected};}
function restoreHistory(snapshot){state=snapshot.state;selected=Math.min(snapshot.selected,state.cells.length-1);}
function checkpoint(){historyStack.push(historySnapshot());if(historyStack.length>30)historyStack.shift();redoStack=[];}
function commit(fn,repaint=true){checkpoint();fn();if(step<4)state.answer=[];shareCache=null;draw();hits();scheduleSave();if(repaint)renderPanel();}
function undo(){if(!historyStack.length)return;redoStack.push(historySnapshot());restoreHistory(historyStack.pop());shareCache=null;render();scheduleSave();}
function redo(){if(!redoStack.length)return;historyStack.push(historySnapshot());restoreHistory(redoStack.pop());shareCache=null;render();scheduleSave();}
function scheduleSave(){if(isGuest||stage==='entry'||suppressSave)return;clearTimeout(saveTimer);$('saveState').textContent='Saving draft…';saveTimer=setTimeout(saveDraft,500);}
function bundle(includeShelf=true){const s=clone(state);if(!includeShelf)s.shelf=[];const used=new Set([...s.cells,...s.shelf].map(c=>c.asset).filter(Boolean));if(s.whole)used.add(s.whole.asset);return {state:s,assets:Object.fromEntries([...used].map(k=>[k,assets[k]]).filter(x=>x[1]))};}
function db(){return new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error('no indexeddb'));const r=indexedDB.open('design360-select-studio-v310',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function saveDraft(){const data=bundle();try{const d=await db();await new Promise((res,rej)=>{const t=d.transaction('drafts','readwrite');t.objectStore('drafts').put(data,'current');t.oncomplete=res;t.onerror=()=>rej(t.error);});d.close();$('saveState').textContent='Draft saved on this device';}catch{try{localStorage.setItem('design360-v310-draft',JSON.stringify(data));$('saveState').textContent='Draft saved on this device';}catch{$('saveState').textContent='Draft could not be saved. Keep this page open.';}}}
async function loadDraft(){try{const d=await db();const v=await new Promise((res,rej)=>{const r=d.transaction('drafts').objectStore('drafts').get('current');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});d.close();if(v)return v;}catch{}try{return JSON.parse(localStorage.getItem('design360-v310-draft')||'null');}catch{return null;}}
function modal(html){
 const body=$('dialogBody'),head=$('dialogHead');
 body.innerHTML=html;head.querySelector('h2')?.remove();
 const title=body.querySelector('h2');if(title){title.id='dialogTitle';head.prepend(title);$('dialog').setAttribute('aria-labelledby','dialogTitle');}
 $('dialog').classList.toggle('album-preview',!!body.querySelector('.save-poster'));
 if(!$('dialog').classList.contains('album-preview'))$('dialog').style.removeProperty('height');
 if(!$('dialog').open)$('dialog').showModal();
}
function confirmAction(title,text,fn){modal(`<h2>${title}</h2><p class="lead">${text}</p><div class="twocol"><button id="cancelModal">Cancel</button><button class="primary" id="confirmModal">Confirm</button></div>`);on('cancelModal',()=>$('dialog').close());on('confirmModal',()=>{$('dialog').close();fn();});}
function scrollPanel(){if(matchMedia('(max-width:720px)').matches)$('panel').scrollIntoView({behavior:'smooth',block:'start'});else $('panel').scrollTop=0;}
function go(n){if(n>1&&!state.topic.trim())return toast('Enter a topic first.');stage='edit';step=n;swapFrom=null;picking=false;$('posterShell').classList.remove('picking');render();scrollPanel();}
function render(){draw();hits();renderPanel();}
let renderPanel,updateDock,shareSettings,publishQuestion,showShare;
function breakWhole(){if(state.whole)state.whole.split=true;}
function setColor(v,repaint=true){commit(()=>{state.cells[selected].bg=v.toLowerCase();if(editTab==='color'){breakWhole();Object.assign(state.cells[selected],{type:'color',text:'',asset:undefined,rect:undefined});}},repaint);if(!repaint){if($('colorValue'))$('colorValue').textContent=v.toUpperCase();if($('hexColor'))$('hexColor').value=v;}}
function resizeGrid(cols,rows){if(cols===state.cols&&rows===state.rows)return;const apply=()=>commit(()=>{const n=cols*rows;if(n<state.cells.length)state.shelf.unshift(...state.cells.splice(n));while(state.cells.length<n)state.cells.push(blank());state.cols=cols;state.rows=rows;selected=Math.min(selected,n-1);if(state.whole&&!state.whole.split)updateSlices();});if(cols*rows<state.cells.length&&state.cells.slice(cols*rows).some(c=>c.text||c.asset||c.bg!=='#f8f8f8'))confirmAction('Change the grid?','Content that no longer fits will be moved to the holding area.',apply);else apply();}
function swapCells(a,b){if(a===b)return;if(state.cells[a].locked||state.cells[b].locked)return toast('Unlock this square before swapping it.');if(state.whole&&!state.whole.split)return toast('Enable rearrangement in the image panel first.');commit(()=>{[state.cells[a],state.cells[b]]=[state.cells[b],state.cells[a]];});}
async function loadImage(src){const previous=images.get(src);if(previous?.complete&&!previous.naturalWidth)images.delete(src);const i=img(src);if(i.complete&&i.naturalWidth)return i;return new Promise((resolve,reject)=>{const cleanup=()=>{clearTimeout(timer);i.removeEventListener('load',loaded);i.removeEventListener('error',failed);};const loaded=()=>{cleanup();resolve(i);};const failed=()=>{cleanup();images.delete(src);reject(Error('Could not load the image. Check your connection and try again.'));};const timer=setTimeout(failed,30000);i.addEventListener('load',loaded,{once:true});i.addEventListener('error',failed,{once:true});});}
function imageData(im,rect,max=1100){const c=document.createElement('canvas'),r=rect||{x:0,y:0,w:im.naturalWidth,h:im.naturalHeight};const scale=Math.min(1,max/Math.max(r.w,r.h));c.width=Math.round(r.w*scale);c.height=Math.round(r.h*scale);c.getContext('2d').drawImage(im,r.x,r.y,r.w,r.h,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.86);}
function imageAsset(im,rect,max=1100){const id=uid();assets[id]=imageData(im,rect,max);img(assets[id]);return id;}
function chooseFiles(mode){uploadMode=mode;$('fileInput').multiple=mode==='multi';$('fileInput').value='';$('fileInput').click();}
async function readFile(file,mode=uploadMode){if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw Error('Upload a JPG, PNG, WebP or GIF image.');if(file.size>25*1024*1024)throw Error('Each image must be smaller than 25 MB.');const url=URL.createObjectURL(file);try{const im=await loadImage(url);const id=imageAsset(im,null,mode==='whole'?1800:1000);await loadImage(assets[id]);return id;}finally{images.delete(url);URL.revokeObjectURL(url);}}
async function upload(files){const list=[...files].slice(0,36);if(!list.length)return;$('panel').classList.add('busy');try{const ids=[];for(const f of list)ids.push(await readFile(f));commit(()=>{if(uploadMode==='whole'){if(state.cells.some(c=>c.text||c.asset||c.bg!=='#f8f8f8'))state.shelf.push(...state.cells);state.whole={asset:ids[0],px:.5,py:.5,zoom:1,split:false};updateSlices();}else if(uploadMode==='replace'){breakWhole();Object.assign(state.cells[selected],{type:'image',asset:ids[0],text:'',rect:undefined,zoom:1,px:.5,py:.5});}else{breakWhole();let slots=state.cells.map((c,i)=>i).filter(i=>!state.cells[i].locked&&!state.cells[i].text&&!state.cells[i].asset&&state.cells[i].bg==='#f8f8f8');for(const id of ids){const c=Object.assign(blank(),{type:'image',asset:id});if(slots.length)state.cells[slots.shift()]=c;else state.shelf.push(c);}}});editTab='image';render();toast(ids.length+' images added'+(state.shelf.length?'; extra content is in the holding area.':'。'));}catch(e){toast(e.message||'Could not read the image. Please try again.');}finally{$('panel').classList.remove('busy');}}
function updateSlices(preserveColor=true){const a=state.whole;if(!a)return;const im=img(assets[a.asset]);if(!im.naturalWidth)return;let sw=im.naturalWidth,sh=im.naturalHeight;if(sw/sh>G.w/G.h)sw=sh*G.w/G.h;else sh=sw/(G.w/G.h);sw/=a.zoom;sh/=a.zoom;const sx=(im.naturalWidth-sw)*a.px,sy=(im.naturalHeight-sh)*a.py,previous=state.cells;state.cells=Array.from({length:state.cols*state.rows},(_,i)=>{const old=previous[i]||blank();if(old.asset&&!old.rect)return old;const cell=Object.assign(blank(),{id:old.id,type:old.text.trim()?(isNumeric(old.text)?'number':'text'):'slice',text:old.text,fg:!preserveColor&&old.text.trim()&&old.fg==='#000000'?'#ffffff':old.fg,size:old.size,align:old.align,locked:old.locked,textInk:old.textInk,asset:a.asset,rect:{x:sx+i%state.cols*sw/state.cols,y:sy+Math.floor(i/state.cols)*sh/state.rows,w:sw/state.cols,h:sh/state.rows}});if(preserveColor&&hasColorFill(old)){cell.bg=old.bg;cell.colorApplied=true;}if(typeof automaticallyFilled==="function"&&automaticallyFilled(old))cell.autoFill=autoSignature(cell);return cell;});}
async function loadTemplate(type){const apply=async()=>{try{let prepared=[];if(type==='single'||type==='multi'){const im=await loadImage(type==='single'?REF.single:REF.multi);if(type==='single')prepared=[imageAsset(im,{x:26,y:306,w:1098,h:1085},1500)];else for(let r=0;r<3;r++)for(let c=0;c<3;c++)prepared.push(imageAsset(im,{x:30+c*364,y:307+r*362,w:358,h:357},600));}await Promise.all(prepared.map(id=>loadImage(assets[id])));commit(()=>{state=newState();if(type==='text')state=entryState();if(type==='number'){state.topic='lucky number';[1,6,13,66,0,7,8,91,11].forEach((n,i)=>Object.assign(state.cells[i],{type:'number',text:String(n),align:'center'}));}if(type==='color'){state.topic='design';state.cols=2;state.rows=2;state.cells=['#f8f8f8','#ff0000','#00ae00','#1000ff'].map(bg=>Object.assign(blank(),{type:'color',bg,colorApplied:true}));}if(type==='single'){state.topic='love';state.whole={asset:prepared[0],px:.5,py:.5,zoom:1,split:false};updateSlices();}if(type==='multi'){state.topic='freedom';prepared.forEach((id,i)=>Object.assign(state.cells[i],{type:'image',asset:id}));}selected=0;editTab=type==='number'?'number':type==='color'?'color':type==='single'||type==='multi'?'image':'text';});}catch{toast('Example images could not be loaded. Upload your own images.');}};if(state.cells.some(c=>c.text||c.asset||c.bg!=='#f8f8f8'))confirmAction('Use this example?','This example will replace the current poster. You can undo this.',apply);else await apply();}
function validQuestion(){if(!state.topic.trim()){toast('Enter a topic.');return false;}if(!state.cells.some(c=>c.text||c.asset||c.bg!=='#f8f8f8')){toast('Fill at least one square.');return false;}if(state.mode==='exact'&&!state.answer.length){toast('Select at least one square as the answer.');return false;}return true;}
function startAnswer(){if(!validQuestion())return;stage='answer';picks.clear();render();scrollPanel();}
function submitAnswer(){if(!picks.size)return;if(state.mode==='exact'&&(picks.size!==state.answer.length||!state.answer.every(i=>picks.has(i)))){modal('<h2>Take another look?</h2><p class="lead">Your selection does not match the answer set by the creator yet.</p><div class="twocol"><button id="retry">Try again</button><button id="reveal">Show the creator’s answer</button></div>');on('retry',()=>$('dialog').close());on('reveal',()=>{picks=new Set(state.answer);$('dialog').close();stage='result';render();toast('Showing the answer set by the creator.');});return;}stage='result';render();scrollPanel();}
function makeCopy(){isGuest=false;questionId=null;state.mode='open';state.answer=[];picks.clear();go(3);scheduleSave();toast('Editable copy created. The original question is unchanged.');}
async function posterPNGBlob(marks=true){const snapshot=clone(state),selection=new Set(marks?picks:[]),exportAssets=Object.values(bundle(false).assets);const fontReady=document.fonts?Promise.all([document.fonts.load('700 72px D360Bold'),document.fonts.load('400 72px D360Medium'),document.fonts.load('400 72px D360Roman'),document.fonts.load('400 72px D360Chinese','设计节'+snapshot.topic+snapshot.cells.map(c=>c.text).join(''))]):Promise.resolve();await Promise.all([fontReady,...exportAssets.map(loadImage)]);const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const ctx=c.getContext('2d');ctx.scale(2,2);drawTo(ctx,snapshot,selection,'en');return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Export failed. Please try again.')),'image/png'));}
async function exportPNG(marks=true){try{const b=await posterPNGBlob(marks);download(b,`Design360-${safeName(state.topic)}.png`,'image/png');toast('High-resolution poster saved: 2320 × 3586.');}catch{toast('Images are still loading. Please try again shortly.');}}
function safeName(s){return String(s).replace(/[\\/:*?"<>|]/g,'_').slice(0,35)||'poster';}
function download(data,name,type){const blob=data instanceof Blob?data:new Blob([data],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function questionURL(id){const base=location.protocol==='http:'||location.protocol==='https:'?new URL(location.href):new URL(HOST+'/');base.search='';base.hash='';base.searchParams.set('q',id);return base.href;}
async function fetchQuestion(id){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);try{const r=await fetch(HOST+'/api/questions/'+id,{signal:controller.signal});if(!r.ok)throw Error('Question unavailable. Check the link or try again later.');return await r.json();}catch(e){if(e.name==='AbortError')throw Error('Opening the question timed out. Check your connection and try again.');throw e;}finally{clearTimeout(timer);}}
function sanitizeBundle(data){if(!data||!data.state||!data.assets)throw Error('Not a valid Design360 project.');const s=data.state;if(s.v!==1||!Number.isInteger(s.cols)||!Number.isInteger(s.rows)||s.cols<2||s.cols>6||s.rows<2||s.rows>6||!Array.isArray(s.cells)||s.cells.length!==s.cols*s.rows)throw Error('Invalid grid data.');if(typeof s.topic!=='string'||s.topic.length>36)throw Error('Invalid topic data.');const a={};for(const [id,src] of Object.entries(data.assets)){if(!/^[\w-]{1,80}$/.test(id)||typeof src!=='string'||src.length>5000000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src))throw Error('Invalid image data.');a[id]=src;}const finite=(n,d,min,max)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):d;const color=(v,f)=>/^#[0-9a-f]{6}$/i.test(v)?v:f;const cell=c=>{if(!c||!['text','number','image','slice','color'].includes(c.type))throw Error('Invalid square data.');if(c.asset&&!a[c.asset])throw Error('An image is missing.');let rect=c.rect;if(rect&&(!['x','y','w','h'].every(k=>Number.isFinite(rect[k]))||rect.w<=0||rect.h<=0||rect.x<0||rect.y<0||rect.w>20000||rect.h>20000))throw Error('Invalid crop data.');return {id:uid(),type:c.type,text:String(c.text||'').slice(0,120),bg:color(c.bg,'#f8f8f8'),fg:color(c.fg,'#000000'),size:finite(c.size,1,.35,1.7),align:c.align==='center'?'center':'left',locked:!!c.locked,asset:c.asset,zoom:finite(c.zoom,1,1,3),px:finite(c.px,.5,0,1),py:finite(c.py,.5,0,1),rect:rect?{x:rect.x,y:rect.y,w:rect.w,h:rect.h}:undefined};};const clean=newState();Object.assign(clean,{topic:s.topic,cols:s.cols,rows:s.rows,cells:s.cells.map(cell),shelf:Array.isArray(s.shelf)?s.shelf.slice(0,72).map(cell):[],line:['auto','#000000','#ffffff'].includes(s.line)?s.line:'auto',lineWidth:finite(s.lineWidth,4,2,10),precision:s.precision===1?1:0,mode:s.mode==='exact'?'exact':'open',answer:Array.isArray(s.answer)?[...new Set(s.answer.filter(i=>Number.isInteger(i)&&i>=0&&i<s.cells.length))]:[],gray:!!s.gray,whole:s.whole&&a[s.whole.asset]?{asset:s.whole.asset,px:finite(s.whole.px,.5,0,1),py:finite(s.whole.py,.5,0,1),zoom:finite(s.whole.zoom,1,1,3),split:!!s.whole.split}:null});return {state:clean,assets:a};}
function applyBundle(data){const d=sanitizeBundle(data);state=d.state;Object.assign(assets,d.assets);Object.values(d.assets).forEach(img);historyStack=[];redoStack=[];selected=0;}
async function init(){on('zoomBtn',()=>{$('posterShell').classList.toggle('large');$('zoomBtn').textContent=$('posterShell').classList.contains('large')?'Fit to screen':'Enlarge';});on('toControls',scrollPanel);$('dialog').querySelector('.close').onclick=()=>$('dialog').close();on('fileInput',e=>upload(e.target.files),'change');on('poster',e=>{if(!picking)return;const r=$('poster').getBoundingClientRect();const d=$('poster').getContext('2d').getImageData(Math.min(W-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*W))),Math.min(H-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*H))),1,1).data;picking=false;$('posterShell').classList.remove('picking');setColor('#'+[...d].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join(''));toast('Color sampled.');});document.addEventListener('keydown',e=>{if(e.key==='Escape'){picking=false;swapFrom=null;$('posterShell').classList.remove('picking');}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&stage==='edit'){e.preventDefault();e.shiftKey?redo():undo();}});
let embedded;try{embedded=JSON.parse($('embedded-question').textContent);}catch{}const q=new URLSearchParams(location.search).get('q');if(embedded||q){stage='answer';isGuest=true;$('panel').innerHTML='<div class="eyebrow">A QUESTION FOR YOU</div><h1>Opening question…</h1>';try{let data=embedded;if(q&&!embedded){if(!/^[a-f0-9-]{36}$/.test(q))throw Error('Invalid question link.');data=await fetchQuestion(q);questionId=q;}applyBundle(data);await Promise.all(Object.values(data.assets).map(loadImage));picks.clear();render();$('saveState').textContent='Everyone answers independently';}catch(e){questionLoadError=e.message||'Check your connection and try again.';stage='error';$('panel').innerHTML=`<h1>Could not open the question.</h1><p class="lead">${esc(e.message)}</p><button id="retryLoad">Try again</button><button id="ownQuestion">Create my own question</button>`;on('retryLoad',()=>location.reload());on('ownQuestion',()=>{isGuest=false;state=newState();go(1);});draw();}return;}
render();draft=await loadDraft();if(draft){try{sanitizeBundle(draft);}catch{draft=null;}if(stage==='entry')renderPanel();}registerTools();}
function registerTools(){if(!document.modelContext?.registerTool)return;try{document.modelContext.registerTool({name:'read_poster_state',description:'Read the current poster topic, grid and content types without changing the poster.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({stage,step,topic:state.topic,cols:state.cols,rows:state.rows,cells:state.cells.map((c,i)=>({index:i+1,type:c.type,text:c.text,color:c.bg})),selected:[...picks]})});document.modelContext.registerTool({name:'configure_poster_topic',description:'Set the poster topic while editing, without creating a link or publishing.',inputSchema:{type:'object',properties:{topic:{type:'string',minLength:1,maxLength:36}},required:['topic'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(stage!=='edit'||typeof input?.topic!=='string'||!input.topic.trim()||input.topic.length>36)throw Error('Enter a topic of 1–36 characters while editing.');commit(()=>state.topic=input.topic.trim());return {topic:state.topic};}});}catch{}}

// Version 1.1: inline poster editing, with the existing portable storage format.
let editorOpen=false,posterMenu=null,inlineIndex=null,inlineSession=null,uploadBusy=false;
const simpleColors=['#f8f8f8','#000000','#ff0000','#00ae00','#1000ff','#ffdb00','#fa7eb8','#5939c6'];
const isNumeric=t=>/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(String(t).trim()) && Number.isFinite(Number(t)) && Math.abs(Number(t))<=999999999;
function posterNumberLines(text){
 const value=String(text).trim().replace(/\r/g,'').replace(/[–—]/g,'-');
 if(value==='360')return ['360'];
 if(value==='2026'||value==='202\n6')return ['202','6'];
 if(/^11\.(?:\n)?26\s*-\s*$/.test(value))return ['11.','26 -'];
 if(value==='11.29'||value==='11.\n29')return ['11.','29'];
 if(/^11\.26\s*-\s*11\.29$/.test(value))return ['11.26 -','11.29'];
 return null;
}
const isHeroNumber=t=>!!posterNumberLines(t);
function textLayout(ctx,t,w,h,kind,size=1){
 ctx.textBaseline='alphabetic';
 const posterLines=posterNumberLines(t),heroNumber=!!posterLines,numeric=kind==='number'&&!heroNumber,chinese=/[\u3400-\u9fff]/.test(t),weight=400,fontFamily=chinese?'"D360Chinese", "Microsoft YaHei", sans-serif':'"D360Medium", Arial, sans-serif';
 const fitTracking=chinese?-.04:-.015,tracking=chinese?-.06:numeric?-.025:heroNumber?-.04:-.065;
 let fs=(numeric?Math.min(h*.32,w*.5):heroNumber?Math.min(w*.56,h*.60):Math.min(w*.62,h*.60))*size;
 const wrap=spacing=>{ctx.font=`${weight} ${fs}px ${fontFamily}`;ctx.letterSpacing=`${fs*spacing}px`;if(numeric)return [String(t)];const lines=[];for(const p of posterLines||String(t).split('\n')){let l='';for(const ch of p){if(l&&ctx.measureText(l+ch).width>w-16){lines.push(l);l=ch;}else l+=ch;}lines.push(l);}return lines;};
 let lines,ascent,descent,advance,total;
 do{lines=wrap(fitTracking);const m=ctx.measureText(lines.join('')||'H');ascent=m.actualBoundingBoxAscent||fs*.75;descent=m.actualBoundingBoxDescent||0;advance=chinese?Math.max(fs*.979,ascent+descent+fs*.015):fs*.75;total=ascent+descent+(lines.length-1)*advance;
 if(total<=h-16&&lines.every(l=>ctx.measureText(l).width<=w-16))break;fs*=.96;}while(fs>6);
 lines=wrap(tracking);
 const finalMetrics=ctx.measureText(lines.join('')||'H');ascent=finalMetrics.actualBoundingBoxAscent||fs*.75;descent=finalMetrics.actualBoundingBoxDescent||0;advance=chinese?Math.max(fs*.979,ascent+descent+fs*.015):fs*.75;total=ascent+descent+(lines.length-1)*advance;
 return {fs,weight,fontFamily,tracking,numeric,heroNumber,lines,ascent,descent,advance,total};
}
textLines=function(ctx,t,x,y,w,h,kind,size=1,align='left'){
 const m=textLayout(ctx,t,w,h,kind,size),center=!!m.symbol;ctx.textAlign=center?'center':'left';ctx.textBaseline='alphabetic';
 let yy=center?y+(h-m.total)/2+m.ascent:y+m.insetY+m.ascent;
 for(const line of m.lines){const bounds=ctx.measureText(line);const optical=center?(bounds.actualBoundingBoxLeft-bounds.actualBoundingBoxRight)/2:0;ctx.fillText(line,center?x+w/2+optical:x+m.insetX,yy);yy+=m.advance;}
};
commit=function(fn,repaint=true){checkpoint();fn();if(step<4)state.answer=[];shareCache=null;draw();scheduleSave();if(repaint){hits();renderPanel();}else updateDock();};
scrollPanel=function(){};
function leaveQuestion(){isGuest=false;questionId=null;shareCache=null;questionLoadError='';const embedded=$('embedded-question');if(embedded)embedded.textContent='null';if(window.history?.replaceState){const url=new URL(location.href);url.searchParams.delete('q');window.history.replaceState(null,'',url.href);}}
go=function(n){finishInline();if(!isGuest)leaveQuestion();stage='edit';step=n===4?4:3;posterMenu=null;editorOpen=n===3;inlineIndex=null;swapFrom=null;picking=false;$('posterShell').classList.remove('picking');render();if(n===1)window.scrollTo({top:0,behavior:'smooth'});};
function finishInline(){
 if(inlineIndex!==null){const c=state.cells[inlineIndex];if(c&&isNumeric(c.text)&&!isHeroNumber(c.text)){c.type='number';c.text=String(Number(Number(c.text).toFixed(1)));c.align='left';}inlineIndex=null;inlineSession=null;}
 const el=$('inlineText');if(el)el.remove();document.body.classList.remove('inline-active');draw();scheduleSave();
}
function inputValue(value){const c=state.cells[selected],wasEmpty=!c.text.trim();if(!inlineSession){checkpoint();inlineSession=c.id;}c.text=value.slice(0,120);c.type=isNumeric(c.text)?'number':'text';if(wasEmpty&&c.text.trim()&&c.asset&&!hasColorFill(c))c.fg='#ffffff';if(c.type==='number')c.align='left';else c.align='left';state.answer=[];shareCache=null;draw();scheduleSave();updateDock();}
function pos(el,x,y,w,h){el.style.left=x/W*100+'%';el.style.top=y/H*100+'%';el.style.width=w/W*100+'%';el.style.height=h/H*100+'%';}
function showInline(focus=false){
 if(stage!=='edit'||step!==3||!editorOpen||editTab!=='text'||posterMenu)return;
 const c=state.cells[selected];
 let el=$('inlineText');if(!el){el=document.createElement('textarea');el.id='inlineText';el.className='inline-text';el.maxLength=120;el.spellcheck=false;el.setAttribute('aria-label',`Edit square ${selected+1}`);el.value=c.text;$('posterShell').append(el);
 el.addEventListener('input',()=>{inputValue(el.value);if($('cellText'))$('cellText').value=el.value;styleInline();});
 el.addEventListener('blur',()=>{setTimeout(()=>{if($('inlineText')===el&&document.activeElement!==el&&document.activeElement!==$('cellText')){if(mobileLayout()&&!(inlineInteractionTarget instanceof Element&&inlineInteractionTarget.closest('#panel,#mobileDock')))finishMobileText();else{finishInline();hits();}}},0);});}
 inlineIndex=selected;styleInline();draw();document.body.classList.add('inline-active');
 if(focus){el.focus({preventScroll:true});el.setSelectionRange(el.value.length,el.value.length);setTimeout(()=>ensureCellVisible(),180);}
}
function styleInline(){const el=$('inlineText');if(!el)return;const c=state.cells[selected],cw=G.w/state.cols,ch=G.h/state.rows,scale=$('posterShell').getBoundingClientRect().width/W,m=textLayout($('poster').getContext('2d'),c.text,cw,ch,c.type,c.size);
 pos(el,G.x+selected%state.cols*cw,G.y+Math.floor(selected/state.cols)*ch,cw,ch);
 const top=m.symbol?(ch-m.advance)/2:m.insetY+(m.ascent+m.descent-m.advance)/2;
 el.style.fontSize=m.fs*scale+'px';el.style.fontWeight=m.weight;el.style.fontFamily=m.fontFamily;el.style.letterSpacing=m.fs*m.tracking*scale+'px';el.style.lineHeight=m.advance*scale+'px';el.style.padding=`${Math.max(0,top)*scale}px ${14*scale}px 0 ${m.insetX*scale}px`;el.style.color=effectiveTextColor(state,c);el.style.textAlign=m.symbol?'center':'left';
}
function ensureCellVisible(){if(mobileLayout()){mobileEnsureCell();return;}const el=$('inlineText');if(!el)return;const rect=el.getBoundingClientRect(),vp=window.visualViewport,bottom=(vp?vp.height+vp.offsetTop:innerHeight)-($('panel').offsetHeight||0)-76;
 if(rect.bottom>bottom)window.scrollBy({top:rect.bottom-bottom+12,behavior:'smooth'});else if(rect.top<58)window.scrollBy({top:rect.top-68,behavior:'smooth'});
}
function toggleMenu(kind){finishInline();editorOpen=false;posterMenu=posterMenu===kind?null:kind;render();}
hits=function(){const s=stage==='entry'?entryState():state,h=$('hotspots');h.replaceChildren();h.style.visibility=stage==='edit'&&posterMenu==='topic'&&(guidePhase==='content'||!mobileLayout())?'hidden':'';$('posterShell').querySelectorAll('.poster-menu,.dimension-menu,.poster-control').forEach(e=>e.remove());
 s.cells.forEach((c,i)=>{const b=document.createElement('button');b.className='cell-hit'+(stage==='edit'&&step===3&&editorOpen&&selected===i&&['image','slice','color'].includes(c.type)?' editing':'');pos(b,G.x+i%s.cols*G.w/s.cols,G.y+Math.floor(i/s.cols)*G.h/s.rows,G.w/s.cols,G.h/s.rows);b.setAttribute('aria-label',`Square ${i+1}: ${c.text.trim()?c.text:c.asset?'images':hasColorFill(c)?'colors':'Empty'}`);b.setAttribute('aria-pressed',String(stage==='entry'?entryPicks.has(i):stage==='answer'||stage==='result'?picks.has(i):step===4?state.answer.includes(i):editorOpen&&selected===i));b.disabled=stage==='result';b.onclick=()=>cellClick(i);h.append(b);});
 if(stage!=='edit'||step!==3)return;
 const control=(label,x,y,w,ht,fn)=>{const b=document.createElement('button');b.className='poster-control';b.setAttribute('aria-label',label);pos(b,x,y,w,ht);b.onclick=fn;$('posterShell').append(b);return b;};
 const ctx=$('poster').getContext('2d'),topicMetrics=topicTypography(ctx,state.topic),tw=Math.min(1020,Math.max(220,topicMetrics.width+4));ctx.letterSpacing='0px';
 control('Choose topic: '+state.topic,23,119,tw,100,()=>toggleMenu('topic'));
 control(`Grid size: ${s.cols} × ${s.rows}`,943,45,172,87,()=>toggleMenu('size'));
 if(posterMenu==='topic'){const menu=document.createElement('div');menu.className='poster-menu';menu.setAttribute('aria-label','Topics');menu.innerHTML=topics.map(t=>`<button data-word="${esc(t)}">${esc(t)}</button>`).join('')+'<div class="topic-custom"><input id="customTopic" maxlength="36" aria-label="Custom topic" placeholder="Custom…"><button id="applyTopic">Apply</button></div>';menu.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{posterMenu=null;commit(()=>state.topic=b.dataset.word);});$('posterShell').append(menu);on('applyTopic',()=>{const value=$('customTopic').value.trim();if(!value)return;posterMenu=null;commit(()=>state.topic=value);});on('customTopic',e=>{if(e.key==='Enter')$('applyTopic').click();},'keydown');}
 else if(posterMenu==='size'){const menu=document.createElement('div');menu.className='dimension-menu';menu.style.left='88.5%';menu.innerHTML=[2,3,4,5,6].map(n=>`<button aria-label="Set grid to ${n} × ${n}" data-n="${n}">${n}</button>`).join('');menu.querySelectorAll('button').forEach(b=>b.onclick=()=>{posterMenu=null;resizeGrid(+b.dataset.n);render();});$('posterShell').append(menu);}
};
cellClick=function(i){
 if(stage==='entry'){entryPicks.has(i)?entryPicks.delete(i):entryPicks.add(i);render();return;}
 if(stage==='result'||stage==='error')return;
 if(stage==='answer'){picks.has(i)?picks.delete(i):picks.add(i);render();return;}
 if(step===4){if(state.mode==='exact')commit(()=>{const a=new Set(state.answer);a.has(i)?a.delete(i):a.add(i);state.answer=[...a];});return;}
 finishInline();posterMenu=null;selected=i;editorOpen=true;const c=state.cells[i];editTab=c.asset?'image':c.type==='color'?'color':'text';render();if(editTab==='text')showInline(true);
};
resizeGrid=function(size){const cols=+size,rows=cols;if(cols===state.cols&&rows===state.rows)return;finishInline();commit(()=>{const n=cols*rows;if(n<state.cells.length)state.shelf.unshift(...state.cells.splice(n));while(state.cells.length<n)state.cells.push(state.shelf.shift()||blank());state.cols=cols;state.rows=rows;selected=Math.min(selected,n-1);if(state.whole&&!state.whole.split)updateSlices();});};
setColor=function(v,repaint=true){finishInline();commit(()=>{const c=state.cells[selected];c.bg=v.toLowerCase();if(c.asset){breakWhole();Object.assign(c,{type:'color',text:'',asset:undefined,rect:undefined});}else if(!c.text)c.type='color';},repaint);};
function fillRandomColors(){finishInline();commit(()=>{state.whole=null;state.cells.forEach(c=>Object.assign(c,{type:'color',text:'',asset:undefined,rect:undefined,bg:simpleColors[Math.floor(Math.random()*simpleColors.length)]}));});}
function fillRandomNumbers(){finishInline();commit(()=>{state.cells.forEach(c=>{Object.assign(c,{type:'number',text:randomPosterNumber(),align:'center'});c.fg=c.asset&&!hasColorFill(c)?'#ffffff':contrastText(c.bg);});});}
function fillImages(ids){state.whole=null;state.cells=state.cells.map((_,i)=>Object.assign(blank(),{type:'image',asset:ids[i%ids.length]}));state.shelf=ids.slice(state.cells.length).map(id=>Object.assign(blank(),{type:'image',asset:id}));}
function editorMarkup(){const c=state.cells[selected];let body=`<div class="editor-head"><span>${ordinal(selected+1)} Square</span><button id="closeEditor" aria-label="Close editing tools">×</button></div><div class="tabs">${[['text','texts'],['image','images'],['color','colors']].map(([k,t])=>`<button data-tab="${k}" class="${editTab===k?'active':''}">${t}</button>`).join('')}</div>`;
 if(editTab==='text')body+=`<textarea id="cellText" aria-label="Text input" maxlength="120" placeholder="Enter text or numbers">${esc(c.text)}</textarea><div class="tool-actions"><button id="randomNumbers">Random number</button><button id="clearCell">Clear this square</button></div><label class="field font-adjust"><span>Text size</span><input id="fontSize" aria-label="Text size" type="range" min="0.35" max="1.7" step="0.05" value="${c.size}"></label>`;
 if(editTab==='image'){body+=`<div class="tool-actions"><button id="wholeImage" ${uploadBusy?'disabled':''}>${uploadBusy?'Loading…':'Upload one image'}</button><button id="multiImages" ${uploadBusy?'disabled':''}>Upload multiple</button></div>`;if(c.asset){const a=state.whole&&!state.whole.split?state.whole:c;body+=`<details><summary>Adjust image</summary>${[['cropZoom','Zoom',1,3,.05,a.zoom],['cropX','Horizontal position',0,1,.01,a.px],['cropY','Vertical position',0,1,.01,a.py]].map(([id,l,min,max,st,v])=>`<label class="field"><span>${l}</span><input id="${id}" aria-label="${l}" type="range" min="${min}" max="${max}" step="${st}" value="${v}"></label>`).join('')}${state.whole?.split?'<button id="restoreImage">Restore image</button>':''}</details>`;}}
 if(editTab==='color')body+=`<div class="tool-actions"><button id="randomAllColors">Random color</button><button id="canvasPick">${picking?'Cancel color picker':'Pick from poster'}</button></div><div class="palette">${simpleColors.map((v,i)=>`<button class="swatch" data-color="${v}" aria-label="${['White','Black','Red','Green','Blue','Yellow','Pink','Purple'][i]} color" aria-pressed="${c.bg===v}" style="background:${v}"></button>`).join('')}</div><label class="custom-color"><input type="color" id="bgColor" aria-label="Custom color" value="${c.bg}">Custom color</label>`;
 return body;
}
function bindSimpleEditor(){on('closeEditor',()=>{finishInline();editorOpen=false;render();});$('panel').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{finishInline();editTab=b.dataset.tab;render();if(editTab==='text')showInline(true);});
 on('cellText',e=>{inputValue(e.target.value);if($('inlineText')){$('inlineText').value=e.target.value;styleInline();}},'input');on('cellText',e=>{const c=state.cells[selected];if(isNumeric(c.text)){c.text=String(Number(Number(c.text).toFixed(1)));e.target.value=c.text;}finishInline();inlineSession=null;hits();},'change');
 on('randomNumbers',fillRandomNumbers);on('clearCell',()=>{finishInline();commit(()=>{breakWhole();state.cells[selected]=Object.assign(blank(),{bg:state.cells[selected].bg});});});
 on('fontSize',e=>{commit(()=>state.cells[selected].size=+e.target.value,false);styleInline();},'input');on('wholeImage',()=>chooseFiles('whole'));on('multiImages',()=>chooseFiles('multi'));on('randomAllColors',fillRandomColors);on('bgColor',e=>setColor(e.target.value,false),'input');on('bgColor',()=>renderPanel(),'change');$('panel').querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>setColor(b.dataset.color));
 on('canvasPick',()=>{finishInline();picking=!picking;$('posterShell').classList.toggle('picking',picking);renderPanel();if(picking){toast('Click the poster to sample a color.');$('posterShell').scrollIntoView({behavior:'smooth',block:'start'});}});
 for(const [id,key] of [['cropZoom','zoom'],['cropX','px'],['cropY','py']])on(id,e=>commit(()=>{if(state.cells[selected].rect&&state.whole&&!state.whole.split){state.whole[key]=+e.target.value;updateSlices();}else state.cells[selected][key]=+e.target.value;},false),'input');on('restoreImage',()=>commit(()=>{state.whole.split=false;updateSlices();}));
}
function previewMarkup(){return `<div class="stack"><button class="primary" id="blankExport">Save poster</button><button id="shareSettings">Share question</button><button id="backEdit">Continue editing</button></div>`;}
renderPanel=function(){const p=$('panel');p.className='panel';document.body.dataset.stage=stage;document.body.classList.toggle('has-editor',stage==='edit'&&step===3&&editorOpen&&!posterMenu);$('posterShell').classList.toggle('clean-preview',stage==='edit'&&step===4&&state.mode!=='exact');
 if(stage==='entry'){p.classList.add('entry-panel');p.innerHTML=`<h1>Find design.</h1><p class="lead">Select the three squares containing design / 设计节.</p><div class="count" id="initialCount">${entryPicks.size} <span>/ 3</span></div><button class="primary" id="initialConfirm" ${entryPicks.size===3?'':'disabled'}>Confirm selection →</button>${entryErrors?'<p class="small">Look again: top left, top right and center.</p>':''}`;on('initialConfirm',()=>{if(entryPicks.size===3&&[0,2,4].every(i=>entryPicks.has(i))){state=newState();historyStack=[];redoStack=[];go(1);scheduleSave();}else{entryErrors++;renderPanel();}});}
 else if(stage==='edit'&&step===3){if(editorOpen&&!posterMenu){p.classList.add('editor-panel');p.innerHTML=editorMarkup();bindSimpleEditor();}else p.innerHTML='';}
 else if(stage==='edit'){p.classList.add('preview-panel');p.innerHTML=previewMarkup();on('blankExport',()=>exportPNG(false));on('shareSettings',shareSettings);on('backEdit',()=>go(1));}
 else if(stage==='answer'){p.innerHTML=`<h1>What is your answer?</h1><p class="lead">Select the squares that make you think of “${esc(state.topic)}”.</p><div class="tool-actions"><button id="clearPicks">Choose again</button><button class="primary" id="submitAnswer" ${picks.size?'':'disabled'}>Confirm selection</button></div>`;on('clearPicks',()=>{picks.clear();render();});on('submitAnswer',submitAnswer);}
 else{p.innerHTML=`<div class="stack"><button class="primary" id="exportPNG">Save poster</button><button id="answerAgain">Choose again</button><button id="copyCreate">Create my own</button></div>`;on('exportPNG',()=>exportPNG(true));on('answerAgain',()=>{stage='answer';render();});on('copyCreate',()=>isGuest?makeCopy():go(1));}
 updateDock();
};
function moreMenu(){
  finishInline();
  if(isGuest){
    modal('<h2>More</h2><div class="stack"><button id="guestCreate">Create my own</button></div>');
    on('guestCreate',()=>{$('dialog').close();startFresh();});
    return;
  }
  modal(`<h2>More</h2><div class="stack">${draft?'<button id="resumeDraft">Resume draft</button>':''}<button id="resetPoster">New poster</button></div>`);
  on('resumeDraft',()=>{$('dialog').close();isGuest=false;applyBundle(draft);go(1);});
  on('resetPoster',()=>{$('dialog').close();resetContent(true);});
}
const legacyApplyBundle=applyBundle;applyBundle=function(data){legacyApplyBundle(data);state.cells.concat(state.shelf).forEach(c=>c.locked=false);};
async function bootSimple(){await init();document.title='Design 360 Festival';
 document.addEventListener('pointerdown',e=>{if(posterMenu&&!(mobileLayout()&&guidePhase!=='content')&&!e.target.closest('.poster-menu,.dimension-menu,.poster-control')){posterMenu=null;render();}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(mobileLayout()&&guidePhase!=='content')return;if(mobileTyping()){finishMobileText();return;}finishInline();posterMenu=null;editorOpen=false;render();}});
 let viewportBaseline=0;
 const focusedControl=()=>{if(mobileLayout())return;const el=document.activeElement;if(!el||!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))return;const vp=window.visualViewport,top=vp?vp.offsetTop:0,bottom=top+(vp?vp.height:innerHeight),rect=el.getBoundingClientRect();if(rect.top<top+18||rect.bottom>bottom-18)el.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});};
 initMobileViewport();
 const viewport=()=>{if(mobileLayout())return;const vp=window.visualViewport,visibleHeight=vp?vp.height:innerHeight,active=document.activeElement,isKeyboardTarget=!!active&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);if(!isKeyboardTarget)viewportBaseline=visibleHeight;else if(!viewportBaseline)viewportBaseline=visibleHeight;const keyboardGap=isKeyboardTarget&&viewportBaseline-visibleHeight>120?viewportBaseline-visibleHeight:0;document.documentElement.style.setProperty('--keyboard',keyboardGap+'px');document.documentElement.style.setProperty('--editor-bottom',keyboardGap?'0px':'63px');document.body.classList.toggle('keyboard-open',keyboardGap>0);styleInline();};window.addEventListener('resize',viewport);document.addEventListener('focusin',()=>setTimeout(()=>{viewport();focusedControl();},220));document.addEventListener('focusout',()=>setTimeout(viewport,120));if(window.visualViewport){visualViewport.addEventListener('resize',()=>{viewport();setTimeout(()=>{ensureCellVisible();focusedControl();},80);});visualViewport.addEventListener('scroll',viewport);}viewport();
}

// 1.2: one text renderer, direct manipulation, editable palettes.
const defaultPalette=['#000000','#ff0000','#00ae00','#1000ff','#ffe000','#f578b9','#8aebff'],retryCopy=['Select the three squares containing design / 设计节','Look closely for design / 设计节','Hint: top left, top right and center'];
function entryHint(){return retryCopy[Math.min(Math.max(entryErrors-1,0),retryCopy.length-1)];}
function rebind(id,fn){const old=$(id);if(!old)return;const el=old.cloneNode(true);old.replaceWith(el);el.addEventListener('click',fn);}
const makeBlankState=newState;newState=function(){return {...makeBlankState(),palette:[...defaultPalette]};};
const cleanPalette=v=>Array.isArray(v)&&v.length?v.filter(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)).slice(0,9).map(c=>c.toLowerCase()):[];
function palette(){if(!state.palette?.length)state.palette=[...defaultPalette];return state.palette;}
const sanitizeV1=sanitizeBundle;sanitizeBundle=function(data){const clean=sanitizeV1(data),p=cleanPalette(data?.state?.palette);clean.state.palette=p.length?p:[...defaultPalette];return clean;};
function resetContent(all=false){finishInline();commit(()=>{if(all){const p=[...palette()];state=newState();state.palette=p;selected=0;}else{state.cells=Array.from({length:state.cols*state.rows},blank);state.shelf=[];state.whole=null;state.answer=[];}picks.clear();});stage='edit';step=3;editorOpen=false;posterMenu=null;render();toast(all?'Poster reset. You can undo this.':'Content cleared. You can undo this.');}
function clearCurrent(){finishInline();commit(()=>{breakWhole();state.cells[selected]=blank();});editTab='text';render();toast('Square cleared. You can undo this.');}
function clearMenu(){finishInline();modal('<h2>Clear</h2><div class="stack"><button id="clearOne">Clear this square</button><button id="clearAll">Clear all content</button><button id="resetAll">Reset poster · design / 3×3</button></div>');on('clearOne',()=>{$('dialog').close();clearCurrent();});on('clearAll',()=>{$('dialog').close();resetContent(false);});on('resetAll',()=>{$('dialog').close();resetContent(true);});}
function startFresh(){finishInline();const p=[...palette()];isGuest=false;questionId=null;shareCache=null;state=newState();state.palette=p;picks.clear();historyStack=[];redoStack=[];selected=0;go(1);scheduleSave();}
makeCopy=startFresh;
function editPalette(){modal(`<h2>Edit palette</h2><div class="palette-editor-list">${palette().map((c,i)=>`<div class="palette-editor-row"><input type="color" aria-label="Palette color ${i+1}" data-palette="${i}" value="${c}"><button data-remove-color="${i}" ${palette().length===1?'disabled':''}>Remove</button></div>`).join('')}</div><div class="tool-actions"><button id="addPalette" ${palette().length>=6?'disabled':''}>Add color</button><button id="resetPalette">Reset palette</button><button class="primary" id="finishPalette">Done</button></div>`);
 $('dialogBody').querySelectorAll('[data-palette]').forEach(el=>el.onchange=()=>{commit(()=>palette()[+el.dataset.palette]=el.value.toLowerCase());});
 $('dialogBody').querySelectorAll('[data-remove-color]').forEach(el=>el.onclick=()=>{if(palette().length<=1)return;commit(()=>palette().splice(+el.dataset.removeColor,1));editPalette();});
 on('addPalette',()=>{if(palette().length>=6)return;commit(()=>palette().push('#d5c4a5'));editPalette();});on('resetPalette',()=>{commit(()=>state.palette=[...defaultPalette]);editPalette();});on('finishPalette',()=>{$('dialog').close();renderPanel();});
}
fillRandomColors=function(){finishInline();commit(()=>{const p=palette();state.cells.forEach(c=>colorCell(c,p[Math.floor(Math.random()*p.length)]));});};
const oldEditorMarkup=editorMarkup;editorMarkup=function(){let body=oldEditorMarkup();if(editTab==='color'){const c=state.cells[selected];body=body.replace(/<div class="palette">[\s\S]*?<\/div>/,`<div class="palette">${palette().map((v,i)=>`<button class="swatch" data-color="${v}" aria-label="Palette color ${i+1} ${v}" aria-pressed="${c.bg===v}" style="background:${v}"></button>`).join('')}</div>`);body+='<div class="palette-tools"><span></span><button class="link" id="editPalette">Edit palette</button></div>';}
 body=body.replace('<button id="clearCell">Clear this square</button>','');return body+'<button class="clear-current" id="clearCurrent">Clear this square</button>';};
const oldBindSimple=bindSimpleEditor;bindSimpleEditor=function(){oldBindSimple();on('editPalette',editPalette);on('clearCurrent',clearCurrent);};
const renderPanelV11=renderPanel;renderPanel=function(){renderPanelV11();if(stage==='entry'){const p=$('panel').querySelector('.small');if(p)p.textContent=entryErrors?entryHint():'';rebind('initialConfirm',()=>{if(entryPicks.size===3&&[0,2,4].every(i=>entryPicks.has(i))){state=newState();historyStack=[];redoStack=[];go(1);scheduleSave();}else{entryErrors++;renderPanel();toast(entryHint(),'entry');}});}if(stage==='result')rebind('copyCreate',startFresh);};
const oldMore=moreMenu;moreMenu=function(){oldMore();if(isGuest)return;if(stage!=='edit')return;const label=document.createElement('label');label.className='field';label.style.marginTop='16px';label.innerHTML=`<span>Grid lines</span><select id="gridLine"><option value="auto" ${state.line==='auto'?'selected':''}>Automatic</option><option value="#000000" ${state.line==='#000000'?'selected':''}>Black</option><option value="#ffffff" ${state.line==='#ffffff'?'selected':''}>White</option></select>`;$('dialogBody').append(label);on('gridLine',e=>commit(()=>state.line=e.target.value),'change');};
// Sample the displayed cell backgrounds and images near grid boundaries, never the poster margins.
let luminanceCanvas=null,lineCache={key:'',color:'#000000'};
function chooseLineColor(samples){return samples.length&&samples.reduce((a,b)=>a+b,0)/samples.length<145?'#ffffff':'#000000';}
function autoGridLine(s){const key=JSON.stringify([s.cols,s.rows,s.gray,s.cells.map(c=>[c.bg,c.colorApplied,c.asset,c.rect,c.zoom,c.px,c.py,c.asset?images.get(assets[c.asset])?.complete:false])]);if(lineCache.key===key)return lineCache.color;
 if(!luminanceCanvas){luminanceCanvas=document.createElement('canvas');luminanceCanvas.width=120;luminanceCanvas.height=120;}const cx=luminanceCanvas.getContext('2d',{willReadFrequently:true}),cw=120/s.cols,ch=120/s.rows;cx.clearRect(0,0,120,120);
 s.cells.forEach((c,i)=>{const x=i%s.cols*cw,y=Math.floor(i/s.cols)*ch;cx.save();cx.beginPath();cx.rect(x,y,cw,ch);cx.clip();cx.fillStyle='#f8f8f8';cx.fillRect(x,y,cw,ch);if(c.asset&&assets[c.asset]){cx.filter=s.gray?'grayscale(1)':'none';cover(cx,img(assets[c.asset]),x,y,cw,ch,c.zoom,c.px,c.py,c.rect);cx.filter='none';}if(hasColorFill(c)){cx.fillStyle=c.bg;cx.fillRect(x,y,cw,ch);}cx.restore();});
 const data=cx.getImageData(0,0,120,120).data,samples=[];const sample=(x,y)=>{const k=(Math.max(0,Math.min(119,Math.round(y)))*120+Math.max(0,Math.min(119,Math.round(x))))*4;const linear=v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;};samples.push(255*(.2126*linear(data[k])+.7152*linear(data[k+1])+.0722*linear(data[k+2])));};
 for(let x=1;x<s.cols;x++)for(let y=2;y<120;y+=4){sample(x*cw-2,y);sample(x*cw+2,y);}for(let y=1;y<s.rows;y++)for(let x=2;x<120;x+=4){sample(x,y*ch-2);sample(x,y*ch+2);}lineCache={key,color:chooseLineColor(samples)};return lineCache.color;
}
const drawToV11=drawTo;drawTo=function(ctx,s,marks){drawToV11(ctx,s.line==='auto'?{...s,line:autoGridLine(s)}:s,marks);};
const applyBundleV12=applyBundle;applyBundle=function(data){lineCache.key='';applyBundleV12(data);};
// Text never switches renderer while editing. The transparent input only receives keyboard/IME events.
draw=function(){const ctx=$('poster').getContext('2d'),s=stage==='entry'?entryState():state;drawTo(ctx,s,stage==='entry'?entryPicks:stage==='answer'||stage==='result'?picks:stage==='edit'&&step===4&&state.mode==='exact'?new Set(state.answer):new Set());drawCaret(ctx);};
function editingLines(c){const ctx=$('poster').getContext('2d'),w=G.w/state.cols,h=G.h/state.rows,m=textLayout(ctx,c.text,w,h,c.type,c.size);ctx.textAlign=m.numeric?'center':'left';const lines=[];let at=0;
 m.lines.forEach((text,i)=>{const bounds=ctx.measureText(text),baseX=G.x+selected%state.cols*w,baseY=G.y+Math.floor(selected/state.cols)*h;let x=baseX+m.insetX;if(m.numeric)x=baseX+w/2+(bounds.actualBoundingBoxLeft-bounds.actualBoundingBoxRight)/2-ctx.measureText(text).width/2;lines.push({text,start:at,end:at+text.length,x,y:baseY+(m.numeric?(h-m.total)/2:m.insetY)+m.ascent+i*m.advance});at+=text.length;if(c.text[at]==='\n')at++;});return {m,lines};
}
function drawCaret(ctx){const el=$('inlineText');if(stage!=='edit'||inlineIndex===null||!el||document.activeElement!==el)return;const c=state.cells[selected],{m,lines}=editingLines(c),start=el.selectionStart,end=el.selectionEnd;ctx.save();ctx.font=`${m.weight} ${m.fs}px ${m.fontFamily}`;ctx.letterSpacing=`${m.fs*m.tracking}px`;ctx.textAlign='left';const cw=G.w/state.cols,ch=G.h/state.rows;ctx.beginPath();ctx.rect(G.x+selected%state.cols*cw,G.y+Math.floor(selected/state.cols)*ch,cw,ch);ctx.clip();
 ctx.fillStyle=effectiveTextColor(state,c);
 if(start!==end){ctx.globalAlpha=.2;for(const l of lines){const a=Math.max(start,l.start),b=Math.min(end,l.end);if(b>a)ctx.fillRect(l.x+ctx.measureText(l.text.slice(0,a-l.start)).width,l.y-m.ascent,ctx.measureText(l.text.slice(a-l.start,b-l.start)).width,m.ascent+m.descent+4);}}
 else{const line=lines.find((l,i)=>start>=l.start&&(start<l.end||i===lines.length-1||start===l.end&&c.text[start]==='\n'))||lines.at(-1);if(line){const x=line.x+ctx.measureText(line.text.slice(0,Math.max(0,start-line.start))).width;ctx.fillRect(x,line.y-m.ascent,Math.max(2,W/$('posterShell').getBoundingClientRect().width),m.ascent+m.descent+5);}}ctx.restore();
}
const showInlineV11=showInline;showInline=function(focus=false){showInlineV11(focus);const el=$('inlineText');if(!el||el.dataset.refined)return;el.dataset.refined='true';el.addEventListener('select',draw);el.addEventListener('keyup',draw);el.addEventListener('compositionend',draw);el.addEventListener('focus',draw);
 const caretAt=e=>{const rect=$('posterShell').getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*W,y=(e.clientY-rect.top)/rect.height*H,{m,lines}=editingLines(state.cells[selected]);const l=lines.reduce((best,l)=>Math.abs(y-(l.y-m.ascent/2))<Math.abs(y-(best.y-m.ascent/2))?l:best,lines[0]);const cx=$('poster').getContext('2d');let pos=0,best=Infinity;for(let i=0;i<=l.text.length;i++){const distance=Math.abs(x-l.x-cx.measureText(l.text.slice(0,i)).width);if(distance<best){pos=l.start+i;best=distance;}}return pos;};
 let selectionAnchor=null;
 el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();selectionAnchor=caretAt(e);el.focus({preventScroll:true});el.setSelectionRange(selectionAnchor,selectionAnchor);el.setPointerCapture(e.pointerId);draw();});
 el.addEventListener('pointermove',e=>{if(selectionAnchor===null||!e.buttons)return;e.preventDefault();const pos=caretAt(e);el.setSelectionRange(Math.min(pos,selectionAnchor),Math.max(pos,selectionAnchor),pos<selectionAnchor?'backward':'forward');draw();});
 el.addEventListener('pointerup',()=>selectionAnchor=null);el.addEventListener('pointercancel',()=>selectionAnchor=null);draw();
};
// Header hit targets use exactly the same measured glyph positions as the poster renderer.
function gridGeometry(s){const ctx=$('poster').getContext('2d');ctx.letterSpacing='0px';ctx.font='700 72px "D360Bold", Arial, sans-serif';const col=ctx.measureText(String(s.cols)).width,row=ctx.measureText(String(s.rows)).width;ctx.font='400 72px "D360Roman", Arial, sans-serif';const cross=ctx.measureText('x').width,start=1110-col-cross-row;return {col:start+col/2,row:start+col+cross+row/2,divider:start+col+cross/2};}
const hitsV11=hits;hits=function(){hitsV11();if(stage!=='edit'||step!==3)return;const geo=gridGeometry(state),scale=$('posterShell').getBoundingClientRect().width/W,min=44/scale;
 const controls=[...$('posterShell').querySelectorAll('.poster-control')],size=controls.find(e=>e.getAttribute('aria-label').startsWith('Grid size'));
 const sizeLeft=Math.max(900,geo.col-min/2);if(size)pos(size,sizeLeft,35,1140-sizeLeft,Math.max(100,min));
 const menu=$('posterShell').querySelector('.dimension-menu');if(menu){menu.style.left=(geo.divider/W*100)+'%';menu.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-current',String(+b.dataset.n===state.cols));b.style.fontSize=72*scale+'px';});}
 $('hotspots').querySelectorAll('.cell-hit').forEach((b,i)=>{
   b.dataset.cell=i;
   b.classList.toggle('focused',editorOpen&&!posterMenu&&editTab!=='text'&&i===selected);
   b.classList.toggle('movable',filledCell(state.cells[i]));
   if(filledCell(state.cells[i]))b.title='Press and hold to swap squares; on desktop, drag or use Alt + arrow keys';
   b.onkeydown=e=>{
     if(!e.altKey||!filledCell(state.cells[i])||inlineIndex!==null||editorOpen&&editTab==='text')return;
     const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-state.cols,ArrowDown:state.cols}[e.key];
     if(delta===undefined)return;
     const to=i+delta;
     if(to<0||to>=state.cells.length||Math.abs(delta)===1&&Math.floor(to/state.cols)!==Math.floor(i/state.cols))return;
     e.preventDefault();swapDirect(i,to);
     $('hotspots').querySelector(`[data-cell="${to}"]`)?.focus({preventScroll:true});
   };
 });
};
function swapDirect(a,b){if(a===b||a<0||b<0||a>=state.cells.length||b>=state.cells.length)return;finishInline();commit(()=>{if(state.whole)state.whole.split=true;[state.cells[a],state.cells[b]]=[state.cells[b],state.cells[a]];selected=b;});}
const HOLD_TO_MOVE_MS=450,DRAG_SLOP=8;
const moveHandSVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 11.8V5.7a1.4 1.4 0 0 1 2.8 0v4.5-6.5a1.4 1.4 0 0 1 2.8 0v6.5-5.8a1.4 1.4 0 0 1 2.8 0v5.9-4.4a1.4 1.4 0 0 1 2.8 0v8.4c0 4.2-2.6 6.7-6.5 6.7H9.8c-2 0-3.4-.7-4.5-2.3l-3.2-4.4a1.6 1.6 0 0 1 2.6-1.9l1.7 2.2"/></svg>';
let gesture=null,suppressClickUntil=0;
function cellAt(x,y){const r=$('posterShell').getBoundingClientRect(),px=(x-r.left)/r.width*W,py=(y-r.top)/r.height*H;if(px<G.x||px>=G.x+G.w||py<G.y||py>=G.y+G.h)return -1;return Math.floor((py-G.y)/G.h*state.rows)*state.cols+Math.floor((px-G.x)/G.w*state.cols);}
function beginDrag(){
 const g=gesture;
 if(!g||g.active||stage!=='edit'||step!==3||inlineIndex!==null)return;
 clearTimeout(g.timer);g.active=true;g.target=g.from;
 selected=g.from;editorOpen=false;posterMenu=null;
 document.body.classList.add('minimal-idle','cell-dragging');
 // Keep the original hit element alive so pointer capture is not lost.
 renderPanel();draw();
 $('hotspots').querySelectorAll('.focused').forEach(b=>b.classList.remove('focused'));
 try{g.hit.setPointerCapture(g.pointer);}catch{}
 const cw=G.w/state.cols,ch=G.h/state.rows,r=$('posterShell').getBoundingClientRect();
 const ghost=document.createElement('canvas');ghost.className='drag-ghost';ghost.width=cw;ghost.height=ch;
 ghost.getContext('2d').drawImage($('poster'),G.x+g.from%state.cols*cw,G.y+Math.floor(g.from/state.cols)*ch,cw,ch,0,0,cw,ch);
 g.left=r.left+(G.x+g.from%state.cols*cw)*r.width/W;
 g.top=r.top+(G.y+Math.floor(g.from/state.cols)*ch)*r.height/H;
 ghost.style.width=r.width*cw/W+'px';ghost.style.height=r.height*ch/H+'px';
 document.body.append(ghost);g.ghost=ghost;
 const hand=document.createElement('span');hand.className='drag-indicator';hand.setAttribute('aria-hidden','true');hand.innerHTML=moveHandSVG;
 document.body.append(hand);g.hand=hand;
 moveDrag(g.x,g.y);
}
function moveDrag(x,y){
 const g=gesture;if(!g?.active)return;
 g.ghost.style.left=g.left+x-g.startX+'px';g.ghost.style.top=g.top+y-g.startY-6+'px';
 g.hand.style.left=Math.max(4,Math.min(innerWidth-34,x+16))+'px';g.hand.style.top=Math.max(4,y-46)+'px';
 g.target=cellAt(x,y);
 $('hotspots').querySelectorAll('.cell-hit').forEach((b,i)=>b.classList.toggle('drop-target',i===g.target&&i!==g.from));
}
function endDrag(cancel=false){
 const g=gesture;if(!g)return;
 clearTimeout(g.timer);gesture=null;
 g.ghost?.remove();g.hand?.remove();document.body.classList.remove('cell-dragging');
 try{if(g.hit.hasPointerCapture(g.pointer))g.hit.releasePointerCapture(g.pointer);}catch{}
 $('hotspots').querySelectorAll('.drop-target').forEach(b=>b.classList.remove('drop-target'));
 if(g.active){
   suppressClickUntil=Date.now()+500;
   if(!cancel&&g.target>=0&&g.target!==g.from)swapDirect(g.from,g.target);
   render();
 }
}
function bindDrag(){
 document.addEventListener('pointerdown',e=>{
   if(gesture){if(e.pointerId!==gesture.pointer)endDrag(true);return;}
   if(stage!=='edit'||step!==3||guidePhase!=='content'||posterMenu||picking||e.button!==0||e.isPrimary===false||inlineIndex!==null||editorOpen&&editTab==='text')return;
   const hit=e.target.closest('[data-cell]');if(!hit||hit.disabled)return;
   const from=+hit.dataset.cell;if(!filledCell(state.cells[from]))return;
   gesture={from,hit,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,pointer:e.pointerId,active:false,target:-1,kind:e.pointerType};
   if(e.pointerType!=='mouse')gesture.timer=setTimeout(beginDrag,HOLD_TO_MOVE_MS);
 });
 document.addEventListener('pointermove',e=>{
   const g=gesture;if(!g||g.pointer!==e.pointerId)return;
   g.x=e.clientX;g.y=e.clientY;
   if(!g.active&&Math.hypot(g.x-g.startX,g.y-g.startY)>DRAG_SLOP){
     if(g.kind!=='mouse'){endDrag(true);return;}
     beginDrag();
   }
   if(g.active){e.preventDefault();moveDrag(g.x,g.y);}
 });
 document.addEventListener('pointerup',e=>{if(gesture?.pointer===e.pointerId){if(gesture.active)moveDrag(e.clientX,e.clientY);endDrag(false);}});
 document.addEventListener('pointercancel',e=>{if(gesture?.pointer===e.pointerId)endDrag(true);});
 // Cancel native scrolling only after the hold has activated a drag.
 document.addEventListener('touchmove',e=>{if(gesture?.active&&e.cancelable)e.preventDefault();},{passive:false});
 document.addEventListener('contextmenu',e=>{if(gesture)e.preventDefault();});
 document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil&&e.target.closest('#posterShell')){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')endDrag(true);});
 window.addEventListener('blur',()=>endDrag(true));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)endDrag(true);});
}
async function bootRefined(){await bootSimple();document.title='Design 360 Festival';const brand=document.querySelector('.brand b');if(brand)brand.textContent='Design 360 Festival';$('helpBtn').onclick=()=>{modal('<h2>Design 360 Festival</h2><p class="lead">Click the topic or top-right numbers to adjust your poster.<br>Click to edit a square; drag to swap squares.<br>On mobile, hold a square until the hand appears, then drag. On desktop, drag directly.<br>Clear and reset can both be undone.<br>Edit the palette and generate random color combinations.</p><button id="helpMore">More / Project files</button>');on('helpMore',moreMenu);};bindDrag();document.addEventListener('selectionchange',()=>{if(document.activeElement===$('inlineText'))draw();});}

// 1.3: compact controls and explicit completion rules.
const toolbarIcons={"Undo": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogIzEzMTMxMzsKICAgICAgfQoKICAgICAgLmNscy0yIHsKICAgICAgICBmaWxsOiBub25lOwogICAgICAgIHN0cm9rZTogIzEzMTMxMzsKICAgICAgICBzdHJva2UtbWl0ZXJsaW1pdDogMTA7CiAgICAgICAgc3Ryb2tlLXdpZHRoOiAyLjVweDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTEuODUsNC45NGwtNS45Niw0LjM4Yy0uNC4yOS0uNC44OSwwLDEuMTlsNS45Niw0LjM4Yy40OS4zNiwxLjE3LDAsMS4xNy0uNTlWNS41NGMwLS42LS42OS0uOTUtMS4xNy0uNTlaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTMuMDIsOS45MWg0Ljc1YzQuNzgsMCw4LjY1LDMuODcsOC42NSw4LjY1cy0zLjg3LDguNjUtOC42NSw4LjY1aC01LjE4Ii8+Cjwvc3ZnPg==", "Clear": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgc3Ryb2tlLXdpZHRoOiAyLjIzcHg7CiAgICAgIH0KCiAgICAgIC5jbHMtMSwgLmNscy0yIHsKICAgICAgICBmaWxsOiBub25lOwogICAgICAgIHN0cm9rZTogIzEzMTMxMzsKICAgICAgICBzdHJva2UtbWl0ZXJsaW1pdDogMTA7CiAgICAgIH0KCiAgICAgIC5jbHMtMiB7CiAgICAgICAgc3Ryb2tlLXdpZHRoOiAyLjgxcHg7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnPgogICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjQuOTcsMjQuNDVjLTIuMjQsMi4zMi01LjM5LDMuNzctOC44OCwzLjc3LTYuODIsMC0xMi4zNS01LjUzLTEyLjM1LTEyLjM1LDAtMS4zOS4yMy0yLjcyLjY1LTMuOTciLz4KICAgIDxwb2x5bGluZSBjbGFzcz0iY2xzLTIiIHBvaW50cz0iLTEuOTUgMTcuMjkgNC4yOCAxMS40MSAxMC4xNiAxNy42NSIvPgogIDwvZz4KICA8Zz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTcuMzMsNy4zNGMyLjMtMi4yNyw1LjQ4LTMuNjQsOC45Ny0zLjU1LDYuODIuMTYsMTIuMjEsNS44MiwxMi4wNSwxMi42NC0uMDMsMS4zOS0uMjksMi43Mi0uNzUsMy45NSIvPgogICAgPHBvbHlsaW5lIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIzMy45NSAxNC44NiAyNy44NyAyMC44OSAyMS44NCAxNC44Ii8+CiAgPC9nPgo8L3N2Zz4=", "More": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogIzEzMTMxMzsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPGNpcmNsZSBjbGFzcz0iY2xzLTEiIGN4PSIzLjg4IiBjeT0iMTYiIHI9IjMuODgiLz4KICA8Y2lyY2xlIGNsYXNzPSJjbHMtMSIgY3g9IjE2IiBjeT0iMTUuOTkiIHI9IjMuODgiLz4KICA8Y2lyY2xlIGNsYXNzPSJjbHMtMSIgY3g9IjI4LjE0IiBjeT0iMTYuMDIiIHI9IjMuODYiLz4KPC9zdmc+", "Back to edit": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgc3Ryb2tlLWxpbmVqb2luOiByb3VuZDsKICAgICAgICBzdHJva2Utd2lkdGg6IDIuMDZweDsKICAgICAgfQoKICAgICAgLmNscy0xLCAuY2xzLTIgewogICAgICAgIGZpbGw6IG5vbmU7CiAgICAgICAgc3Ryb2tlOiAjMTMxMzEzOwogICAgICB9CgogICAgICAuY2xzLTIgewogICAgICAgIHN0cm9rZS1taXRlcmxpbWl0OiAxMDsKICAgICAgICBzdHJva2Utd2lkdGg6IDIuNXB4OwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yNi40MSwxNS4yNHYxMS42MWMwLDIuMDUtMS42NiwzLjcxLTMuNzEsMy43MUg1LjI3Yy0yLjA1LDAtMy43MS0xLjY2LTMuNzEtMy43MVY5LjU3YzAtMi4wNSwxLjY2LTMuNzEsMy43MS0zLjcxaDExLjc2Ii8+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjE2Ljk3IDE5Ljc3IDExLjg1IDIwLjQ5IDEyLjU3IDE1LjM3IDI2LjUxIDEuNDMgMzAuOTEgNS44MyAxNi45NyAxOS43NyIvPgo8L3N2Zz4=", "Share link": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogIzAyMDIwMjsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTcuODQsMzAuNTlsLTQuNDgtMTEuMTJjLS4xNS0uMzgtLjQ1LS42OC0uODMtLjgzTDEuNDEsMTQuMTZjLTEuMjYtLjUxLTEuMjUtMi4zLjAyLTIuNzlMMjkuNDkuNTdjMS4yMS0uNDcsMi40LjcyLDEuOTMsMS45M2wtMTAuOCwyOC4wNmMtLjQ5LDEuMjctMi4yOCwxLjI4LTIuNzkuMDJaIi8+Cjwvc3ZnPg=="};
function iconButton(id,label,icon,disabled=false){return `<button id="${id}" class="icon-action" ${disabled?'disabled':''}><img src="${toolbarIcons[icon]}" alt=""><span>${label}</span></button>`;}
function filledCell(c){return !!(c.text.trim()||c.asset||hasColorFill(c));}
function completeGrid(){return state.cells.every(filledCell);}
let finishPoster;
validQuestion=function(){if(!state.cells.some(filledCell)){toast('Add content to at least one square.');return false;}if(!state.topic.trim()){toast('Enter a topic.');return false;}if(state.mode==='exact'&&!state.answer.length){toast('Select at least one square as the answer.');return false;}return true;};
function randomOneNumber(){finishInline();commit(()=>{const c=state.cells[selected];Object.assign(c,{type:'number',text:randomPosterNumber(),align:'center'});c.fg=c.asset&&!hasColorFill(c)?'#ffffff':contrastText(c.bg);});}
function colorCell(c,value){c.bg=value;c.colorApplied=true;if(c.text.trim())c.fg=contrastText(value);if(!c.text.trim()&&!c.asset)c.type='color';}
setColor=function(value,repaint=true){finishInline();commit(()=>colorCell(state.cells[selected],value.toLowerCase()),repaint);};
function randomOneColor(){setColor(palette()[Math.floor(Math.random()*palette().length)]);}
fillRandomColors=function(){finishInline();commit(()=>{const p=palette();state.cells.forEach(c=>colorCell(c,p[Math.floor(Math.random()*p.length)]));});};
fillImages=function(ids){const empty=state.cells.map((c,i)=>filledCell(c)?-1:i).filter(i=>i>=0);for(let i=empty.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[empty[i],empty[j]]=[empty[j],empty[i]];}ids.slice(0,empty.length).forEach((id,k)=>state.cells[empty[k]]=Object.assign(blank(),{type:'image',asset:id}));return Math.min(ids.length,empty.length);};
upload=async function(files){const list=selectFilesForUpload(files);if(!list.length||uploadBusy)return;finishInline();const mode=uploadMode;uploadBusy=true;renderPanel();try{const ids=[];for(const f of list)ids.push(await readFile(f,mode));commit(()=>{if(mode==='whole'){state.whole={asset:ids[0],px:.5,py:.5,zoom:1,split:false};updateSlices(true);}else fillImages(ids);});editTab='image';editorOpen=!(mobileLayout()&&completeGrid());if(!editorOpen){document.body.classList.add('minimal-idle');posterMenu=null;}render();toast(mode==='whole'?'Background added. Your existing content is preserved.':`${ids.length} images added to the grid.`);}catch(e){toast(e.message||'Could not read the image. Please try again.','error');}finally{uploadBusy=false;renderPanel();}};
const markupV12=editorMarkup;editorMarkup=function(){let body=markupV12().replace('<button class="clear-current" id="clearCurrent">Clear this square</button>','');body=body.replace('<button id="randomNumbers">Random number</button>','<button id="randomOneNumber">Random number</button><button id="randomNumbers">Randomize all numbers</button>');if(editTab==='color'){body=body.slice(0,body.indexOf('<div class="tool-actions">'))+`<div class="tool-actions"><button id="randomOneColor">Random color</button><button id="randomAllColors">Randomize all colors</button></div><div class="color-board"><div class="palette">${palette().map((v,i)=>`<button class="swatch" data-color="${v}" aria-label="Palette color ${i+1} ${v}" aria-pressed="${state.cells[selected].bg===v}" style="background:${v}"></button>`).join('')}</div><div class="palette-bottom"><label class="custom-color"><input type="color" id="bgColor" aria-label="Custom color" value="${state.cells[selected].bg}">Custom color</label><button class="link" id="editPalette">Edit palette</button></div></div>`;}return body;};
const bindV12=bindSimpleEditor;bindSimpleEditor=function(){bindV12();on('randomOneNumber',randomOneNumber);on('randomOneColor',randomOneColor);bindSizeReset();};
previewMarkup=function(){return '<div class="stack"><button class="primary" id="blankExport">Save poster</button></div>';};
function completionControl(){let wrap=$('completionControl');if(!wrap){wrap=document.createElement('div');wrap.id='completionControl';}let right=$('rightControls');if(!right){right=document.createElement('div');right.id='rightControls';$('panel').before(right);right.append($('panel'));}const desktop=matchMedia('(min-width:721px)').matches,target=desktop?right:$('posterShell').parentElement;if(wrap.parentElement!==target)target.append(wrap);right.classList.toggle('editing-tools',stage==='edit'&&step===3&&editorOpen&&!posterMenu);const visible=stage==='edit'&&step===3;wrap.hidden=!visible;if(visible){const count=state.cells.filter(filledCell).length;wrap.innerHTML=`<button class="pill" id="finishPoster" ${count===state.cells.length?'':'disabled'}>${count===state.cells.length?'Select your answer':`Filled ${count} / ${state.cells.length}`}</button>`;on('finishPoster',finishPoster);}}
function resetCellSize(){const i=selected;finishInline();if(state.cells[i].size!==1)commit(()=>state.cells[i].size=1);else render();toast('Default text size restored.');}
function bindSizeReset(){const slider=$('fontSize');if(!slider)return;slider.title='Double-click the slider thumb to reset text size';let touchTap=null;const nearThumb=e=>{const r=slider.getBoundingClientRect(),t=(Number(slider.value)-Number(slider.min))/(Number(slider.max)-Number(slider.min)),x=r.left+8+t*(r.width-16);return Math.abs(e.clientX-x)<=22;};slider.addEventListener('dblclick',e=>{if(nearThumb(e)){e.preventDefault();resetCellSize();}});slider.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;const now=Date.now();if(touchTap&&now-touchTap.time<350&&Math.hypot(e.clientX-touchTap.x,e.clientY-touchTap.y)<22&&nearThumb(e)){e.preventDefault();touchTap=null;resetCellSize();}else touchTap=nearThumb(e)?{time:now,x:e.clientX,y:e.clientY}:null;});}

// One toolbar renderer avoids rebuilding obsolete toolbars on every edit.
updateDock=function(){
  let d=$('mobileDock');
  if(!d){d=document.createElement('div');d.id='mobileDock';document.body.append(d);}
  d.classList.toggle('entry-dock',stage==='entry');
  if(stage==='entry'){
    d.innerHTML=`<button class="pill" id="dockConfirm" ${entryPicks.size===3?'':'disabled'}>${entryPicks.size===3?'Confirm selection':entryPicks.size>3?'Select 3 squares':`Select ${entryPicks.size} / 3`}</button>`;
    on('dockConfirm',()=>$('initialConfirm').click());
  }else if(stage==='edit'&&step===3){
    d.innerHTML=iconButton('dockUndo','Undo','Undo',!historyStack.length)+'<span class="dock-empty-slot" aria-hidden="true"></span><span class="dock-spacer"></span>'+iconButton('dockClear','Clear','Clear')+iconButton('more','More','More');
    on('dockUndo',()=>{finishInline();undo();});on('dockClear',clearMenu);on('more',moreMenu);
  }else if(stage==='edit'){
    d.innerHTML=iconButton('dockBack','Back to edit','Back to edit')+'<span class="dock-spacer"></span>'+iconButton('dockShare','Share link','Share link');
    on('dockBack',()=>go(1));on('dockShare',shareSettings);
  }else if(stage==='result'){
    d.innerHTML=(isGuest?'':iconButton('dockBack','Back to edit','Back to edit'))+'<span class="dock-spacer"></span>'+iconButton('more','More','More');
    on('dockBack',()=>go(1));on('more',moreMenu);
  }else if(stage==='answer'){
    d.innerHTML=(isGuest?'':iconButton('dockBack','Back to edit','Back to edit'))+`<span class="answer-count" aria-live="polite">${picks.size} / ${state.cells.length} selected</span><span class="dock-spacer"></span><button class="primary" id="dockAnswer" ${picks.size?'':'disabled'}>Confirm selection</button>`;
    on('dockBack',()=>go(1));on('dockAnswer',submitAnswer);
  }else d.innerHTML='';
  completionControl();
};
const paletteV12=editPalette;editPalette=function(){paletteV12();$('resetPalette').textContent='Default palette';const add=$('addPalette');add.textContent='＋';add.setAttribute('aria-label','Add color');add.classList.add('palette-add');$('dialogBody').querySelector('.palette-editor-list').append(add);$('dialog').classList.add('compact-palette');};
async function bootPolished(){await bootRefined();const refreshFonts=()=>refreshTextFontsFast310();if('requestIdleCallback'in window)requestIdleCallback(refreshFonts,{timeout:2500});else setTimeout(refreshFonts,0);$('dialog').addEventListener('close',()=>$('dialog').classList.remove('compact-palette'));matchMedia('(min-width:721px)').addEventListener('change',completionControl);$('helpBtn').onclick=()=>modal('<h2 class="help-title">Design 360 Festival</h2><p class="lead help-copy">Mix and match text, images and colors to create your own poster.</p><p class="lead help-copy">How it works:<br>1. Tap the underline beneath the title at the top left to choose a topic.<br>2. Tap the numbers at the top right to set the grid size.<br>3. Tap any square to add content.<br>4. On mobile, press and hold a square, then drag it to move it.<br>5. Save and share your poster. Set your own question and answer,<br>then share it with friends to answer.</p>');render();}

// 1.5: the creator answers before exporting; guests start with empty picks.
let confirmedPosterSignature='',resultActionsShown=false;
function posterSignature(){const {answer,mode,palette,shelf,...poster}=state;return JSON.stringify(poster);}
finishPoster=function(){finishInline();if(!state.cells.some(filledCell)){toast('Add content to at least one square.');return;}if(!state.topic.trim()){toast('Enter a topic.');return;}picks=new Set(confirmedPosterSignature===posterSignature()?state.answer:[]);editorOpen=false;posterMenu=null;stage='answer';render();};
const goV14=go;go=function(n){if(n===4&&!isGuest)return finishPoster();return goV14(n);};
const submitV14=submitAnswer;submitAnswer=function(){if(!picks.size)return;if(isGuest)return submitV14();state.answer=[...picks].sort((a,b)=>a-b);confirmedPosterSignature=posterSignature();shareCache=null;stage='result';scheduleSave();render();};
startAnswer=function(){if(isGuest){picks.clear();stage='answer';render();}else finishPoster();};
const panelV14=renderPanel;renderPanel=function(){if(stage==='error'){document.body.dataset.stage='error';const p=$('panel');p.className='panel';p.innerHTML=`<h1>Could not open the question</h1><p class="lead">${esc(questionLoadError)}</p><div class="stack"><button id="retryLoad">Try again</button><button id="ownQuestion">Create my own</button></div>`;on('retryLoad',()=>location.reload());on('ownQuestion',startFresh);return;}panelV14();if(stage==='answer'){resultActionsShown=false;$('panel').innerHTML=`<h1>${isGuest?'Select your answer':'Set your answer'}</h1><p class="lead">Select the squares that make you think of “${esc(state.topic)}”.</p>${isGuest&&state.mode==='exact'?'<p class="small">Find every square that matches the question.</p>':''}<div class="tool-actions answer-actions"><button id="clearPicks">Clear selection</button><button class="primary" id="submitAnswer" ${picks.size?'':'disabled'}>Confirm selection</button></div>`;on('clearPicks',()=>{picks.clear();render();});on('submitAnswer',submitAnswer);}else if(stage==='result'){const roleAction=isGuest?'<button id="copyCreate">Create my own</button>':phoneSaveMode()?'':'<button id="inviteAnswer">Invite to answer</button>';$('panel').innerHTML=`<div class="stack result-actions"><button class="primary" id="exportPNG">${phoneSaveMode()?'Save & share':'Save poster'}</button>${roleAction}<button id="answerAgain">Choose again</button></div>`;on('exportPNG',()=>exportPNG(true));on('answerAgain',()=>{stage='answer';render();});on('inviteAnswer',shareSettings);on('copyCreate',startFresh);if(!resultActionsShown){resultActionsShown=true;requestAnimationFrame(()=>{if(matchMedia('(max-width:720px)').matches)$('panel').querySelector('.result-actions')?.scrollIntoView({block:'nearest',inline:'nearest'});});}}else resultActionsShown=false;updateDock();};

function phoneSaveMode(){return matchMedia('(max-width:720px)').matches||navigator.maxTouchPoints>0;}
let savePreviewURL='';
function releaseSavePreview(){if(savePreviewURL){URL.revokeObjectURL(savePreviewURL);savePreviewURL='';}}
function openAlbumPreview(blob,name){releaseSavePreview();savePreviewURL=URL.createObjectURL(blob);const file=typeof File==='function'?new File([blob],name,{type:'image/png'}):null;let canShare=false;try{canShare=!!file&&!!navigator.canShare&&navigator.canShare({files:[file]});}catch{}modal(`<div class="save-poster"><h2>Press and hold to save or share</h2><img id="albumPoster" src="${savePreviewURL}" alt="Your poster. Press and hold to save."><p class="small">If “Save image” does not appear, use the image menu and choose Save.</p><div class="save-actions">${canShare?'<button id="sharePosterFile">Share poster image</button>':''}${!isGuest?'<button id="inviteAfterSave">Invite friends to answer</button>':''}</div></div>`);syncSaveViewport();const clean=()=>releaseSavePreview();$('dialog').addEventListener('close',clean,{once:true});on('sharePosterFile',async()=>{try{await navigator.share({title:'Design 360 Festival',files:[file]});}catch(e){if(e.name!=='AbortError')toast('Sharing is unavailable. Press and hold the poster to save it.');}});on('inviteAfterSave',()=>{releaseSavePreview();shareSettings();});toast('Press and hold the poster, then choose “Save image”.');}
const exportPNGV15=exportPNG;exportPNG=async function(marks=true){if(!phoneSaveMode())return exportPNGV15(marks);try{const blob=await posterPNGBlob(marks);openAlbumPreview(blob,`Design360-${safeName(state.topic)}.png`);}catch{toast('Images are still loading. Please try again shortly.');}};

// Version 1.6 adds its authenticated safety layer before boot.

// Use the visible webview height when mobile browser controls expand or collapse.
function syncSaveViewport(){
  const dialog=$('dialog');if(!dialog?.classList.contains('album-preview'))return;
  const viewport=window.visualViewport;
  dialog.style.setProperty('--save-viewport-height',(viewport?.height||innerHeight)+'px');
  dialog.style.setProperty('--save-viewport-top',(viewport?.offsetTop||0)+'px');
  const width=dialog.getBoundingClientRect().width,available=viewport?.height||innerHeight;
  dialog.style.height=Math.min(900,available-24,(width-32)*H/W+184)+'px';
}
window.addEventListener('resize',syncSaveViewport);
window.visualViewport?.addEventListener('resize',syncSaveViewport);
window.visualViewport?.addEventListener('scroll',syncSaveViewport);

// Guide first-time creators through the poster controls without drawing hints into exports.
let guidePhase='content';
const guideRenderBase=render;
render=function(){guideRenderBase();renderGuide();};

function renderGuide(){ $('guideTip')?.remove(); }

const guideGoBase=go;
go=function(n){
  const firstCreation=stage==='entry'&&n===1&&!isGuest;
  if(firstCreation)guidePhase='topic';
  guideGoBase(n);
  if(firstCreation)toggleMenu('topic');
};

const guideHitsBase=hits;
hits=function(){
  guideHitsBase();
  mobileSetupMenu();
  if(stage!=='edit'||step!==3||guidePhase==='content')return;
  const topic=guidePhase==='topic';
  $('posterShell').querySelectorAll('.cell-hit').forEach(button=>button.disabled=true);
  $('posterShell').querySelectorAll('.poster-control').forEach(button=>{
    const label=button.getAttribute('aria-label')||'';
    button.disabled=topic?!label.startsWith('Choose topic'):!label.startsWith('Grid size');
  });
  if(topic){
    $('posterShell').querySelectorAll('.poster-menu [data-word]').forEach(button=>{
      const select=button.onclick;
      button.onclick=()=>{select();guidePhase='content';posterMenu=null;render();};
    });
    const custom=$('applyTopic'),input=$('customTopic');
    if(custom&&input)custom.addEventListener('click',()=>{if(!input.value.trim())return;guidePhase='content';posterMenu=null;render();});
  }
};

const guideResizeBase=resizeGrid;
resizeGrid=function(size){
  if(guidePhase==='topic')return;
  const selecting=stage==='edit'&&guidePhase==='grid';
  guideResizeBase(size);
  if(selecting){guidePhase='content';editorOpen=false;document.body.classList.add('minimal-idle');render();toast('Tap a square to add text, images or colors');}
};

const guideCellClickBase=cellClick;
cellClick=function(index){
  if(stage==='edit'&&guidePhase!=='content'){toast(guidePhase==='topic'?'Choose a topic first':'Choose a grid size first');return;}
  return guideCellClickBase(index);
};

const guideStartFreshBase=startFresh;
startFresh=function(){guidePhase='topic';guideStartFreshBase();toggleMenu('topic');};
const guideResetContentBase=resetContent;
resetContent=function(all=false){guideResetContentBase(all);if(all){guidePhase='topic';toggleMenu('topic');}};

function mobileSetupMenu(){
  $('posterShell').querySelector('.setup-shade')?.remove();
  const menu=$('posterShell').querySelector('.poster-menu,.dimension-menu');
  if(!menu)return;
  const topic=posterMenu==='topic',required=guidePhase!=='content';

  menu.classList.add('setup-menu');
  const shade=document.createElement('div');shade.className='setup-shade';
  $('posterShell').append(shade);
  if(!required)shade.onclick=()=>{posterMenu=null;render();};
  menu.setAttribute('role','dialog');menu.setAttribute('aria-label',topic?'Choose a topic':'Choose a grid');
  const options=document.createElement('div');options.className='setup-options';
  [...menu.children].filter(el=>el.tagName==='BUTTON').forEach(button=>{
    if(topic)button.setAttribute('aria-current',String(button.dataset.word===state.topic));
    else {button.textContent=`${button.dataset.n} × ${button.dataset.n}`;button.setAttribute('aria-current',String(+button.dataset.n===state.cols));}
    options.append(button);
  });
  menu.prepend(options);
  const heading=document.createElement('div');heading.className='setup-heading';
  heading.innerHTML=`<span>${topic?'Choose a topic':'Choose a grid'}</span>${required?topic?'':'<button id="setupBack">Back</button>':'<button id="setupClose">Done</button>'}`;
  menu.prepend(heading);
  on('setupBack',()=>{guidePhase='topic';posterMenu='topic';render();});
  on('setupClose',()=>{posterMenu=null;render();});
}

// Keep the three content types equally visible before starting a new cell.
const interactionCellClickBase=cellClick;
let inlineInteractionTarget=null;
document.addEventListener('pointerdown',event=>{
  inlineInteractionTarget=event.target;
  // Keep the current editor alive until the target cell receives this same tap.
  if(stage==='edit'&&inlineIndex!==null&&event.target instanceof Element&&event.target.closest('.cell-hit'))event.preventDefault();
},true);
cellClick=function(index){
  if(stage!=='edit'||step!==3||guidePhase!=='content')return interactionCellClickBase(index);
  finishInline();
  posterMenu=null;
  selected=index;
  editorOpen=true;
  const cell=state.cells[index];
  editTab=cell.text.trim()?'text':hasColorFill(cell)?'color':'choice';
  document.body.classList.remove('minimal-idle');
  render();
  if(cell.text.trim())showInline(true);
};

const interactionEditorMarkupBase=editorMarkup;
editorMarkup=function(){
  let body=interactionEditorMarkupBase();
  if(editTab==='choice')return body+'<p class="content-choice-hint">Select text, images, or colors.</p>';
  if(editTab==='image'){
    const free=state.cells.filter(cell=>!filledCell(cell)).length;
    if(!free)body=body.replace(/(<button id="multiImages")([^>]*)(>)/,'$1$2 disabled$3');
    const actionsEnd=body.indexOf('</div>',body.indexOf('<div class="tool-actions">'));
    if(actionsEnd>=0)body=body.slice(0,actionsEnd+6)+`<p class="image-capacity-hint">${free?`Use one image across the grid, or add up to ${free} images to empty squares.`:'The grid is full. Clear squares to add multiple images.'}</p>`+body.slice(actionsEnd+6);
  }
  return body;
};

function selectFilesForUpload(files){
  const list=[...files];
  const free=state.cells.filter(cell=>!filledCell(cell)).length;
  if(uploadMode==='multi'&&!free){toast('Clear a square before adding images.');return [];}
  if(uploadMode==='multi'&&list.length>free){toast(`${free} empty squares: using the first ${free} images; skipping the remaining ${list.length-free}.`);return list.slice(0,free);}
  if(uploadMode==='whole'&&list.length!==1){toast('Choose one image for the full grid.');return [];}
  return list;
}

const interactionToggleMenuBase=toggleMenu;
toggleMenu=function(kind){document.body.classList.remove('minimal-idle');return interactionToggleMenuBase(kind);};
const interactionGoBase=go;
go=function(stepNumber){document.body.classList.remove('minimal-idle');return interactionGoBase(stepNumber);};

document.addEventListener('pointerdown',event=>{
  if(stage!=='edit'||step!==3||guidePhase!=='content'||picking)return;
  const target=event.target;
  if(!(target instanceof Element)||target.closest('.cell-hit,.poster-control,.poster-menu,.dimension-menu,#mobileDock,#dialog,#completionControl,.guide-tip,.inline-text,button,input,textarea,select,label,a,summary'))return;
  if(!editorOpen&&!posterMenu&&document.body.classList.contains('minimal-idle'))return;
  if(mobileTyping()){finishMobileText();return;}
  finishInline();
  editorOpen=false;
  posterMenu=null;
  document.body.classList.add('minimal-idle');
  render();
});

// Completion guidance is handled by flow.js after editing finishes.

// A cell may contain an image, an intentional solid fill, and text at once.
// Older drafts did not distinguish a chosen white fill from the blank canvas.
function hasColorFill(cell){
  if(typeof cell.colorApplied==='boolean')return cell.colorApplied;
  return !cell.asset&&String(cell.bg||'').toLowerCase()!=='#f8f8f8';
}
function contrastText(color){
  const hex=String(color||'#f8f8f8').slice(1);
  const brightness=.2126*parseInt(hex.slice(0,2),16)+.7152*parseInt(hex.slice(2,4),16)+.0722*parseInt(hex.slice(4,6),16);
  return brightness<145?'#ffffff':'#000000';
}

const sanitizeLayersBase=sanitizeBundle;
sanitizeBundle=function(data){
  const clean=sanitizeLayersBase(data);
  for(const [index,cell] of clean.state.cells.entries()){
    const source=data.state.cells[index];
    cell.colorApplied=typeof source.colorApplied==='boolean'
      ?source.colorApplied:!source.asset&&String(source.bg||'').toLowerCase()!=='#f8f8f8';
  }
  for(const [index,cell] of clean.state.shelf.entries()){
    const source=data.state.shelf?.[index];
    cell.colorApplied=typeof source?.colorApplied==='boolean'
      ?source.colorApplied:!!source&&!source.asset&&String(source.bg||'').toLowerCase()!=='#f8f8f8';
  }
  return clean;
};

const editorLayersBase=editorMarkup;
editorMarkup=function(){
  let html=editorLayersBase();
  const cell=state.cells[selected];
  if(editTab==='text'&&cell.asset&&!hasColorFill(cell)){
    const sizeControl=html.match(/<label class="field font-adjust">[\s\S]*?<\/label>/)?.[0];
    if(sizeControl){
      const colorControl=`<div class="overlay-text-color"><span>Text color</span><div class="overlay-text-options"><button data-text-color="#000000" ${effectiveTextColor(state,cell)==='#000000'?'class="active"':''}>Black</button><button data-text-color="#ffffff" ${effectiveTextColor(state,cell)==='#ffffff'?'class="active"':''}>White</button></div></div>`;
      html=html.replace(sizeControl,`<div class="text-adjust-row">${sizeControl}${colorControl}</div>`);
    }
  }
  if(editTab==='color'&&cell.asset&&hasColorFill(cell)){
    html=html.replace(
      '<button class="link" id="editPalette">Edit palette</button></div></div>',
      '<button class="link" id="editPalette">Edit palette</button><button class="restore-photo" id="restorePhoto">Show image</button></div></div>'
    );
  }
  return html;
};

const bindLayersBase=bindSimpleEditor;
bindSimpleEditor=function(){
  bindLayersBase();
  $('panel').querySelectorAll('[data-text-color]').forEach(button=>button.onclick=()=>{
    finishInline();
    commit(()=>state.cells[selected].fg=button.dataset.textColor);
  });
  on('restorePhoto',()=>{
    finishInline();
    commit(()=>{
      const cell=state.cells[selected];
      cell.colorApplied=false;
      cell.bg='#f8f8f8';
      cell.type=cell.text.trim()?(isNumeric(cell.text)?'number':'text'):'image';
      if(cell.text.trim())cell.fg='#ffffff';
    });
    editTab=state.cells[selected].text.trim()?'text':'image';
    render();
  });
};

// Mobile editing uses the poster itself as the input surface.
function mobileLayout(){return typeof matchMedia==='function'&&matchMedia('(max-width:720px)').matches;}
let firstTextSettingsShown=false,manualTextCell=null;
let mobileRestHeight=0,mobileRestWidth=0,mobileViewportTimer=null,mobileWasNarrow=mobileLayout();
function mobileTyping(){return mobileLayout()&&inlineIndex!==null&&document.activeElement===$('inlineText');}
function mobileCellScroll(rect,top,bottom){
  if(rect.height>bottom-top)return rect.top<top||rect.top>bottom-40?rect.top-top:0;
  return rect.top<top?rect.top-top:rect.bottom>bottom?rect.bottom-bottom:0;
}
function mobileEnsureCell(){
  if(!mobileTyping())return;
  const vp=window.visualViewport,top=(vp?.offsetTop||0)+12;
  const dock=document.body.classList.contains('keyboard-open')?0:($('mobileDock')?.getBoundingClientRect().height||60);
  const bottom=(vp?.offsetTop||0)+(vp?.height||innerHeight)-48-dock;
  const delta=mobileCellScroll($('inlineText').getBoundingClientRect(),top,bottom);
  if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:'instant'});
}
function mobileFitPoster(){
  if(!mobileLayout()||mobileTyping()||document.body.classList.contains('keyboard-open'))return;
  const shell=$('posterShell');if(!shell)return;
  const height=mobileRestHeight||window.visualViewport?.height||innerHeight;
  // Fit the title and complete grid; the footer remains available by scrolling.
  const width=Math.max(180,(height-80)*W/(G.y+G.h));
  shell.style.setProperty('--mobile-poster-width',width+'px');
}
function finishMobileText(skipIntroduction=false){
  if(!mobileLayout())return;
  const cell=inlineIndex===null?null:state.cells[inlineIndex];
  const switchingCell=skipIntroduction===true;
  const reveal=!firstTextSettingsShown&&cell?.id===manualTextCell&&!!cell.text.trim()&&!switchingCell;
  if(reveal)firstTextSettingsShown=true;
  manualTextCell=null;
  // Replace the keyboard with the settings in this render, without scrolling.
  finishInline();editorOpen=reveal;posterMenu=null;
  if(reveal)editTab='text';
  document.body.classList.toggle('minimal-idle',!reveal);render();
}
function mobileInputBar(){
  let bar=$('mobileInputBar');
  if(!bar){
    bar=document.createElement('div');bar.id='mobileInputBar';
    bar.innerHTML='<span></span><button id="mobileTextSettings">Text settings</button><button id="mobileTextDone">Done</button>';
    document.body.append(bar);
    // Keep focus until the click so blur cannot dismiss the settings action first.
    bar.onpointerdown=e=>e.preventDefault();
    on('mobileTextDone',finishMobileText);
    on('mobileTextSettings',()=>{if(manualTextCell&&state.cells[selected]?.text.trim())firstTextSettingsShown=true;manualTextCell=null;finishInline();editorOpen=true;editTab='text';render();});
  }
  const visible=mobileTyping();
  if(bar.hidden===visible)bar.hidden=!visible;
  if(visible){
    const label=bar.querySelector('span'),value=`${ordinal(selected+1)} Square`;
    if(label.textContent!==value)label.textContent=value;
  }
}
function mobileViewport(){
  if(!mobileLayout()){
    document.body.classList.remove('keyboard-open','mobile-typing','mobile-menu-open');
    document.documentElement.style.setProperty('--keyboard','0px');
    clearTimeout(mobileViewportTimer);mobileRestHeight=0;mobileRestWidth=0;
    mobileFitPoster();return;
  }
  const wasKeyboardOpen=document.body.classList.contains('keyboard-open');
  const vp=window.visualViewport,height=vp?.height||innerHeight,width=innerWidth;
  const active=document.activeElement,input=active&&/^(INPUT|TEXTAREA)$/.test(active.tagName);
  const rotated=mobileRestWidth&&Math.abs(width-mobileRestWidth)>80;
  if(!mobileRestHeight||rotated){mobileRestHeight=Math.max(height,document.documentElement.clientHeight);mobileRestWidth=width;}
  const keyboard=mobileRestHeight-height>120&&(input||document.body.classList.contains('keyboard-open'));
  // Keyboard closing reports intermediate heights; never fit the poster to those frames.
  if(!keyboard&&!input){mobileRestHeight=Math.max(mobileRestHeight,height);mobileRestWidth=width;}
  document.body.classList.toggle('keyboard-open',keyboard);
  document.documentElement.style.setProperty('--keyboard',keyboard?Math.max(0,innerHeight-height-(vp?.offsetTop||0))+'px':'0px');
  document.documentElement.style.setProperty('--mobile-input-top',((vp?.offsetTop||0)+height-42-(keyboard?0:($('mobileDock')?.getBoundingClientRect().height||60)))+'px');
  document.documentElement.style.setProperty('--mobile-visible-height',height+'px');
  document.body.classList.toggle('mobile-typing',mobileTyping());
  mobileFitPoster();styleInline();mobileInputBar();
  clearTimeout(mobileViewportTimer);
  mobileViewportTimer=setTimeout(mobileEnsureCell,80);
  if(wasKeyboardOpen&&!keyboard&&mobileTyping())queueMicrotask(()=>{if(mobileTyping()&&!document.body.classList.contains('keyboard-open'))finishMobileText();});
}
function initMobileViewport(){
  window.addEventListener('resize',()=>{
    const narrow=mobileLayout();
    if(narrow!==mobileWasNarrow){mobileWasNarrow=narrow;render();}
    mobileViewport();
  });
  window.visualViewport?.addEventListener('resize',mobileViewport);
  window.visualViewport?.addEventListener('scroll',mobileViewport);
  document.addEventListener('focusin',()=>{if(mobileLayout())mobileViewport();});
  document.addEventListener('focusout',()=>setTimeout(mobileViewport,120));
  mobileViewport();
}
const mobileShowInlineBase=showInline;
showInline=function(focus=false){
  if(mobileLayout()&&focus)document.body.classList.add('mobile-typing');
  mobileShowInlineBase(focus);
  if(mobileLayout()){mobileViewport();mobileEnsureCell();}
};
const mobileFinishInlineBase=finishInline;
finishInline=function(){
  mobileFinishInlineBase();
  document.body.classList.remove('mobile-typing');
  const bar=$('mobileInputBar');if(bar)bar.hidden=true;
};
const mobileEditorMarkupBase=editorMarkup;
editorMarkup=function(){
  const html=mobileEditorMarkupBase();
  return mobileLayout()&&editTab==='text'?html.replace(/<textarea id="cellText"[\s\S]*?<\/textarea>/,''):html;
};
const mobileRenderBase=render;
render=function(){
  mobileRenderBase();
  document.body.classList.toggle('mobile-menu-open',mobileLayout()&&stage==='edit'&&!!posterMenu);
  document.body.classList.toggle('mobile-typing',mobileTyping());
  mobileFitPoster();
};

// Original page 2 glyph positions; preserve the individually adjusted f/i stem alignment.
const ENTRY_GLYPHS=[{"text": "3", "x": 549.7129, "y": 592.9318, "size": 260.2227, "font": "D360Medium"}, {"text": "6", "x": 682.6867, "y": 592.9318, "size": 260.2227, "font": "D360Medium"}, {"text": "0", "x": 815.660499, "y": 592.9318, "size": 260.2227, "font": "D360Medium"}, {"text": " ", "x": 960.344321, "y": 592.9318, "size": 260.2227, "font": "D360Medium"}, {"text": "设", "x": 1021.4565, "y": 584.1836, "size": 229.9642, "font": "D360Chinese"}, {"text": "计", "x": 1237.392884, "y": 584.1836, "size": 229.9642, "font": "D360Chinese"}, {"text": "节", "x": 1021.4565, "y": 809.318552, "size": 229.9642, "font": "D360Chinese"}, {"text": "d", "x": 67.0192, "y": 592.9319, "size": 260.2227, "font": "D360Medium"}, {"text": "e", "x": 210.401908, "y": 592.9319, "size": 260.2227, "font": "D360Medium"}, {"text": "s", "x": 339.472367, "y": 592.9319, "size": 260.2227, "font": "D360Medium"}, {"text": "i", "x": 67.0192, "y": 788.359148, "size": 260.2227, "font": "D360Medium"}, {"text": "g", "x": 114.119509, "y": 788.359148, "size": 260.2227, "font": "D360Medium"}, {"text": "n", "x": 252.818208, "y": 788.359148, "size": 260.2227, "font": "D360Medium"}, {"text": " ", "x": 386.572676, "y": 788.359148, "size": 260.2227, "font": "D360Medium"}, {"text": "3", "x": 67.0193, "y": 1071.0463, "size": 260.2227, "font": "D360Medium"}, {"text": "6", "x": 199.9931, "y": 1071.0463, "size": 260.2227, "font": "D360Medium"}, {"text": "0", "x": 332.966899, "y": 1071.0463, "size": 260.2227, "font": "D360Medium"}, {"text": "d", "x": 546.609736, "y": 1071.0463, "size": 260.2227, "font": "D360Medium"}, {"text": "e", "x": 693.895784, "y": 1071.0463, "size": 260.2227, "font": "D360Medium"}, {"text": "s", "x": 826.869584, "y": 1071.0463, "size": 260.2227, "font": "D360Medium"}, {"text": "i", "x": 546.609736, "y": 1266.473548, "size": 260.2227, "font": "D360Medium"}, {"text": "g", "x": 597.613385, "y": 1266.473548, "size": 260.2227, "font": "D360Medium"}, {"text": "n", "x": 740.215425, "y": 1266.473548, "size": 260.2227, "font": "D360Medium"}, {"text": " ", "x": 877.873233, "y": 1266.473548, "size": 260.2227, "font": "D360Medium"}, {"text": "f", "x": 1028.021731, "y": 1069.484964, "size": 260.2227, "font": "D360Medium"}, {"text": "e", "x": 1098.28186, "y": 1069.484964, "size": 260.2227, "font": "D360Medium"}, {"text": "s", "x": 1231.25566, "y": 1069.484964, "size": 260.2227, "font": "D360Medium"}, {"text": "t", "x": 1354.60122, "y": 1069.484964, "size": 260.2227, "font": "D360Medium"}, {"text": " ", "x": 1028.021731, "y": 1264.912211, "size": 260.2227, "font": "D360Medium"}, {"text": "i", "x": 1036.60908, "y": 1264.912211, "size": 260.2227, "font": "D360Medium"}, {"text": "v", "x": 1087.612729, "y": 1264.912211, "size": 260.2227, "font": "D360Medium"}, {"text": "a", "x": 1210.958289, "y": 1264.912211, "size": 260.2227, "font": "D360Medium"}, {"text": "l", "x": 1343.932089, "y": 1264.912211, "size": 260.2227, "font": "D360Medium"}, {"text": "2", "x": 67.0192, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "0", "x": 196.089659, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "2", "x": 325.160118, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "6", "x": 67.0192, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}, {"text": "1", "x": 546.609636, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "1", "x": 675.680095, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": ".", "x": 804.750554, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "2", "x": 546.609636, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}, {"text": "6", "x": 675.680095, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}, {"text": " ", "x": 804.750554, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}, {"text": "-", "x": 861.479103, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}, {"text": "1", "x": 1023.0774, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "1", "x": 1152.147859, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": ".", "x": 1281.218318, "y": 1549.5214, "size": 260.2227, "font": "D360Medium"}, {"text": "2", "x": 1023.0774, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}, {"text": "9", "x": 1152.147859, "y": 1744.948648, "size": 260.2227, "font": "D360Medium"}];
function drawEntryGlyphs(ctx,index){
 const r=DESIGN_SCALE,cw=G.w/3,ch=G.h/3;
 ctx.save();ctx.textAlign="left";ctx.textBaseline="alphabetic";ctx.letterSpacing="0px";
 for(const glyph of ENTRY_GLYPHS){const col=Math.min(2,Math.max(0,Math.floor((glyph.x*r-G.x)/cw))),row=Math.min(2,Math.max(0,Math.floor((glyph.y*r-G.y)/ch)));if(row*3+col!==index)continue;ctx.font=`400 ${glyph.size*r}px "${glyph.font}"`;ctx.fillText(glyph.text,glyph.x*r,glyph.y*r);}
 ctx.restore();
}

// 1.6: protected release. Editing stays local; publication and exports require
// a server session, review and an immutable server copy of the final image.
const AGREEMENT_VERSION='2026-09-29-draft';
const AGREEMENT_TEXT="Design 360 Festival · Visual Creation Tool\nUser-Created Content: Disclaimer and Responsibility Agreement\n\n1. Nature of the Service and the Company's Role\n\nThis tool is a visual design creation tool provided by San Liu Ling Design Co., Ltd. (the \"Company\") for the Design360 Design Festival. When users create with this tool, the Company provides only technical means, including templates, editing functions and generation capabilities. The Company does not participate in conceiving, editing or determining user-created content, has no ownership or control over that content, and is not its publisher or distributor.\n\n2. Responsibility for User Content\n\nYou independently assume all legal responsibility for all content you create with this tool, including text, images, color combinations, graphic elements and all other elements. You represent and warrant that your content does not violate applicable laws or regulations; infringe any third party's intellectual property, portrait, reputation, privacy or other lawful rights; involve state secrets or trade secrets; or contain material that could adversely affect national security or the public interest.\n\n3. Prohibited Content\n\nYou must not use this tool to create or generate information that:\n• Opposes the fundamental principles established by the Constitution;\n• Endangers national unity, sovereignty or territorial integrity;\n• Discloses state secrets, endangers national security, or harms national honor or interests;\n• Incites ethnic hatred or discrimination, or undermines ethnic unity;\n• Undermines national religious policies or promotes cults or feudal superstitions;\n• Spreads rumors, disrupts public order or undermines social stability;\n• Disseminates obscenity, pornography, gambling, violence, homicide or terrorism, or incites crime;\n• Insults or defames others, or infringes their lawful rights; or\n• Contains other material prohibited by laws or administrative regulations.\n\n4. Responsibility for Distribution\n\nIf you distribute your creations through screenshots, downloads, screen recordings, further editing or any other means, including posting to social media, messaging services or other third-party platforms, you independently assume all legal responsibility arising from that distribution. The Company does not participate in and cannot control your distribution outside the platform, and assumes no review, management or joint liability for content you distribute independently.\n\n5. Brand Association and Non-Endorsement\n\nContent created by users represents their personal creative expression only. It does not represent the Company's position, views or official opinions. The Company has not edited, reviewed or endorsed that content. Brand marks appearing in a creation are inherent elements of the event template and do not constitute sponsorship, approval, authorization or endorsement of the content by the Company.\n\n6. The Platform's (Tool's) Right to Take Action\n\nThe Company has the right, but not the obligation, to carry out necessary compliance monitoring and content review of your use of this tool. If you are suspected of using it to create unlawful or non-compliant content, the Company may, without prior notice, restrict functions, terminate services, withhold display of or delete related content, preserve relevant records, and report to the competent authorities. The Company's exercise of these rights does not constitute an infringement of your rights or give rise to liability to you.\n\n7. User Indemnification and Disclaimer\n\nIf your breach of this statement or applicable laws or regulations causes the Company to face a third-party claim, administrative penalty, litigation, arbitration or other legal proceeding, you shall bear full liability for compensation, including damages, fines, legal fees, litigation costs and other reasonable expenses paid by the Company. Upon receiving notice from a third party, the Company may immediately delete or block related content without incurring liability to you.\n\n8. Intellectual Property Ownership and License\n\nCopyright in derivative creations you make using this tool belongs to you. You grant the Company a worldwide, non-exclusive, royalty-free right to use, reproduce, modify, display and distribute content you submit for event operations, display, publicity and promotion. Intellectual property rights in the original templates, brand marks, design elements and other materials supplied by this tool belong to the Company or the relevant rights holders. They may not be used outside this tool without authorization.\n\n9. Labeling of AI-Generated Content\n\nContent generated by AI within this tool will carry explicit and implicit labels in accordance with the Measures for Labeling AI-Generated and Synthetic Content. When redistributing such content, you must preserve the relevant labels and must not remove, alter or otherwise conceal them.\n\n10. Acceptance and Effective Date\n\nBefore using this tool, you must confirm the following by selecting the checkbox:\n\n\"I have read and agree to the terms above, and understand that I independently bear legal responsibility for the content I create and for its distribution.\"\n\nThis agreement takes effect on the date you confirm it. The Company will prominently notify you of revisions; material changes require your renewed confirmation.\n";
const PRIVACY_TEXT='To trace submitted creations, after your confirmation the server obtains your WeChat OpenID for this official account and records the agreement version, acceptance time, poster ID, review result and final image. Public posters display only the poster ID, never the OpenID. Only authorized administrators can retrieve records by poster ID. Before launch, the organizer must confirm retention periods, deletion procedures, contact details and the complete privacy policy.';
let sessionCache=null,traceId='';
async function saveAuthContext(){const value={question:bundle(),selection:[...picks],stage,step,isGuest,questionId,created:Date.now()};try{const database=await db();await new Promise((resolve,reject)=>{const tx=database.transaction('drafts','readwrite');tx.objectStore('drafts').put(value,'pending-auth');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});database.close();}catch{try{sessionStorage.setItem('d360-pending-auth',JSON.stringify(value));}catch{throw Error('Could not save your poster temporarily. Keep this page open and try signing in again.');}}}
async function restoreAuthContext(){let value=null;try{const database=await db();value=await new Promise((resolve,reject)=>{const tx=database.transaction('drafts','readwrite'),store=tx.objectStore('drafts'),request=store.get('pending-auth');request.onsuccess=()=>{store.delete('pending-auth');resolve(request.result);};request.onerror=()=>reject(request.error);});database.close();}catch{}if(!value){try{value=JSON.parse(sessionStorage.getItem('d360-pending-auth')||'null');sessionStorage.removeItem('d360-pending-auth');}catch{}}if(!value||Date.now()-value.created>1800000)return;applyBundle(value.question);picks=new Set(value.selection);isGuest=!!value.isGuest;questionId=value.questionId||null;stage=['entry','edit','answer','result'].includes(value.stage)?value.stage:'edit';step=value.step===4?4:3;editorOpen=stage==='edit'&&step===3;confirmedPosterSignature=!isGuest&&stage==='result'?posterSignature():'';render();}
async function api(path,options={}){const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});const type=r.headers.get('content-type')||'';const value=type.includes('json')?await r.json():null;if(!r.ok)throw Error(value?.error||`Service unavailable (${r.status})`);return value;}
async function currentSession(){try{sessionCache=await api('/api/session');}catch{sessionCache={configured:false,authenticated:false};}return sessionCache;}
function inWeChat(){return /MicroMessenger/i.test(navigator.userAgent);}
function agreementDialog(){modal(`<h2>User agreement & privacy</h2><div class="agreement-scroll"><h3>User content responsibility agreement</h3><div class="agreement-text">${esc(AGREEMENT_TEXT)}</div><h3>Account information & poster IDs</h3><p>${esc(PRIVACY_TEXT)}</p></div><button id="agreeClose">Back to sign in</button>`);on('agreeClose',()=>{requireIdentity().catch(()=>{});});}
function requireIdentity(){return new Promise(async(resolve,reject)=>{const s=await currentSession();if(s.authenticated&&s.consentVersion===AGREEMENT_VERSION){resolve(s);return;}if(!s.configured){modal('<h2>Sign-in is not available yet</h2><p class="lead">WeChat sign-in and content review are not configured yet. Please return when the service opens.</p>');reject(Error('Service is not configured'));return;}
modal(`<h2>Confirm your WeChat account</h2><p class="lead">Before you begin, confirm your account and read the agreement and privacy notice. Public images show only a poster ID.</p><label class="consent-line"><input id="consentCheck" type="checkbox"><span>I have read and agree to the <a href="#" id="readTerms">User Content Agreement and Privacy Notice</a></span></label><button id="loginWeChat" class="primary" style="width:100%" disabled>Agree & continue with WeChat</button><p class="small">A WeChat OpenID identifies an account; it is not legal identity verification.</p>`);
on('readTerms',e=>{e.preventDefault();agreementDialog();});on('consentCheck',e=>{$('loginWeChat').disabled=!e.target.checked;},'change');on('loginWeChat',async()=>{if(!$('consentCheck')?.checked)return;if(!inWeChat()){toast('Open this page in WeChat to sign in.');return;}try{await saveAuthContext();const value=await api('/api/auth/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consentVersion:AGREEMENT_VERSION,returnPath:location.pathname+location.search})});location.assign(value.url);}catch(e){toast(e.message,'error');}});reject(Error('Waiting for WeChat sign-in'));});}
function bytesToDataURL(blob){return new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=()=>reject(Error('Could not read the image'));f.readAsDataURL(blob);});}
async function moderationFileImage(file,mode=uploadMode){if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw Error('Upload a JPG, PNG, WebP or GIF image.');if(file.size>25*1024*1024)throw Error('Each image must be smaller than 25 MB.');const url=URL.createObjectURL(file);try{return imageData(await loadImage(url),null,mode==='whole'?1800:1000);}finally{images.delete(url);URL.revokeObjectURL(url);}}
const drawV15=drawTo;drawTo=function(ctx,s,marks){drawV15(ctx,s,marks);if(traceId){ctx.save();ctx.fillStyle='#b4b4b4';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='400 12px "D360Roman", Arial, sans-serif';ctx.fillText(`Poster ID ${traceId}`,777,1694);ctx.restore();}};
let uploadPending=false;
const uploadV15=upload;upload=async function(files){if(uploadPending||uploadBusy)return;const mode=uploadMode,list=selectFilesForUpload(files);if(!list.length)return;uploadPending=true;try{await requireIdentity();if(uploadMode!==mode)throw Error('Upload mode changed. Choose your images again.');for(const file of list){const image=await moderationFileImage(file,mode);await api('/api/moderate/image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image})});}if(uploadMode!==mode)throw Error('Upload mode changed. Choose your images again.');return await uploadV15(list);}catch(e){if(e.message!=='Waiting for WeChat sign-in'&&e.message!=='Service is not configured')toast(e.message,'error');}finally{uploadPending=false;}};
function answerModeDescription(){return state.mode==='exact'?'Friends must select exactly the same squares as you.':'Friends can choose freely. There are no right or wrong answers.';}
shareSettings=function(){if(!isGuest&&(stage!=='result'||confirmedPosterSignature!==posterSignature()||!state.answer.length)){toast('Select and confirm your answer first.');return;}modal(`<h2>Invite to answer</h2><label class="field"><span>Answer mode</span><select id="answerMode" aria-describedby="answerModeDescription"><option value="open" ${state.mode==='open'?'selected':''}>No correct answer</option><option value="exact" ${state.mode==='exact'?'selected':''}>Use my selection as the answer key</option></select></label><p class="small answer-mode-description" id="answerModeDescription">${answerModeDescription()}</p><button class="primary" id="publish" style="width:100%">Create question link</button>`);on('answerMode',e=>{state.mode=e.target.value;$('answerModeDescription').textContent=answerModeDescription();shareCache=null;scheduleSave();},'change');on('publish',publishQuestion);};
showShare=function(url){modal(`<h2>Invite to answer</h2><p class="lead">Your question has been reviewed and a link created. Friends can answer independently.</p><label class="field"><span>Question link</span><input id="shareURL" type="url" value="${esc(url)}" readonly></label><div class="twocol"><button class="primary" id="copyLink">Copy link</button><button id="openQuestion">Open question</button></div>`);on('copyLink',async()=>{try{await navigator.clipboard.writeText(url);toast('Link copied.');}catch{$('shareURL').select();toast('Copy the selected link.');}});on('openQuestion',()=>window.open(url,'_blank','noopener'));};
publishQuestion=async function(){if(!validQuestion())return;if(isGuest&&questionId)return showShare(questionURL(questionId));if(shareCache)return showShare(shareCache);try{await requireIdentity();const value=await api('/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(bundle(false))});shareCache=questionURL(value.id);showShare(shareCache);}catch(e){if(e.message!=='Waiting for WeChat sign-in'&&e.message!=='Service is not configured')toast(e.message,'error');}};
exportPNG=async function(marks=true){if(stage!=='result'||!picks.size){toast('Complete your answer first.');return;}try{await requireIdentity();traceId='';const preview=await posterPNGBlob(marks);const reserve=await api('/api/posters',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:bundle(false),selection:[...picks],image:await bytesToDataURL(preview)})});traceId=reserve.id;const finalImage=await posterPNGBlob(marks);traceId='';const done=await api(`/api/posters/${reserve.id}/finalize`,{method:'POST',headers:{'Content-Type':'image/png'},body:finalImage});const response=await fetch(done.url,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('The poster was created, but its image could not be retrieved.');const approved=await response.blob();if(phoneSaveMode())openAlbumPreview(approved,`Design360-${reserve.id}.png`);else download(approved,`Design360-${reserve.id}.png`,'image/png');}catch(e){traceId='';if(e.message!=='Waiting for WeChat sign-in'&&e.message!=='Service is not configured')toast(e.message,'error');}};
let entryGate=null,entryGateBusy=false;
function closeEntryGate(){
  const layer=entryGate;if(!layer)return;
  layer.blocked?.forEach(([element,wasInert])=>{element.inert=wasInert;});
  layer.remove();entryGate=null;document.body.classList.remove('entry-locked');
  document.querySelector('#hotspots button:not(:disabled)')?.focus({preventScroll:true});
}
function showEntryLogin(){
  if(!entryGate)return;
  entryGate.innerHTML='<div class="language-card entry-login-card"><h1>Sign in to start</h1><p>Confirm your account and agreement to start answering and creating.</p><button class="primary" id="entryLogin">Continue to sign in</button><button class="link" id="entryLanguage">Back to language selection</button></div>';
  entryGate.querySelector('#entryLogin').onclick=enterWebsite;
  entryGate.querySelector('#entryLanguage').onclick=()=>{if(entryGateBusy)return;sessionStorage.removeItem('d360-language-v25');showEntryLanguages();};
}
function showEntryLanguages(){
  if(!entryGate)return;
  entryGate.innerHTML='<div class="language-card"><button class="primary" id="chooseEnglish">English</button><button id="chooseChinese" disabled aria-label="Chinese version coming later">中文</button></div>';
  entryGate.querySelector('#chooseEnglish').onclick=()=>{sessionStorage.setItem('d360-language-v25','en');showEntryLogin();enterWebsite();};
  entryGate.querySelector('#chooseEnglish').focus({preventScroll:true});
}
async function enterWebsite(){
  if(entryGateBusy||!entryGate)return;
  entryGateBusy=true;
  entryGate.querySelectorAll('button').forEach(button=>{button.disabled=true;});
  try{
    let user=await currentSession();
    if(!user?.authenticated||user.consentVersion!==AGREEMENT_VERSION)user=await requireIdentity();
    if(user?.authenticated&&user.consentVersion===AGREEMENT_VERSION)closeEntryGate();
  }catch(error){
    if(!['Waiting for WeChat sign-in','Service is not configured'].includes(error.message))toast(error.message||'Sign-in unavailable. Please try again.','error');
  }finally{
    entryGateBusy=false;
    entryGate?.querySelectorAll('button').forEach(button=>{button.disabled=false;});
    if(entryGate&&!$('dialog').open)entryGate.querySelector('#entryLogin')?.focus({preventScroll:true});
  }
}
function languageLanding(){
  if(entryGate)return;
  const layer=document.createElement('div');layer.className='language-gate';
  layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Language selection and sign-in');
  layer.blocked=[...document.querySelectorAll('header,main,#mobileDock,#previewBanner')].map(element=>[element,element.inert]);
  layer.blocked.forEach(([element])=>{element.inert=true;});
  document.body.classList.add('entry-locked');document.body.append(layer);entryGate=layer;
  if(sessionStorage.getItem('d360-language-v25')){showEntryLogin();enterWebsite();}else showEntryLanguages();
}
async function bootSafety(){document.addEventListener('click',event=>{if(event.target?.id!=='dockConfirm'||stage!=='entry')return;event.preventDefault();event.stopImmediatePropagation();if(entryPicks.size!==3)return;if([0,2,4].every(i=>entryPicks.has(i))){state=newState();historyStack=[];redoStack=[];go(1);scheduleSave();}else{entryErrors++;renderPanel();toast(entryHint(),'entry');}},true);languageLanding();const auth=new URLSearchParams(location.search).get('auth');if(auth==='ok'){const url=new URL(location.href);url.searchParams.delete('auth');history.replaceState(null,'',url);await restoreAuthContext();}}


// Offline interaction preview. No real identity, moderation, or publication occurs.
let previewAuthenticated=false;
let previewLoginResolve=null;
let previewLoginPending=null;
let previewQuestion=null;
let previewCreator=null;
let previewSequence=0;

currentSession=async function(){return {configured:true,authenticated:previewAuthenticated,consentVersion:previewAuthenticated?AGREEMENT_VERSION:null};};

function previewLogin(){
  modal(`<h2>WeChat sign-in</h2><label class="consent-line"><input id="previewConsent" type="checkbox"><span>I have read and agree to the <a href="#" id="previewReadTerms">User Content Agreement and Privacy Notice</a></span></label><button id="previewLogin" class="primary" style="width:100%" disabled>Sign in & continue</button>`);
  $('dialog').addEventListener('close',()=>settlePreviewLogin(null),{once:true});
  on('previewReadTerms',e=>{e.preventDefault();modal(`<h2>User agreement & privacy</h2><div class="agreement-scroll"><h3>User content responsibility agreement</h3><div class="agreement-text">${esc(AGREEMENT_TEXT)}</div><h3>Account information & poster IDs</h3><p>${esc(PRIVACY_TEXT)}</p></div><button id="previewTermsBack">Back to sign in</button>`);on('previewTermsBack',previewLogin);});
  on('previewConsent',e=>{$('previewLogin').disabled=!e.target.checked;},'change');
  on('previewLogin',()=>{if(!$('previewConsent')?.checked)return;previewAuthenticated=true;settlePreviewLogin(currentSession());$('dialog').close();toast('Signed in.');});
}

function settlePreviewLogin(value){const done=previewLoginResolve;previewLoginResolve=null;previewLoginPending=null;done?.(value);}
requireIdentity=function(){if(previewAuthenticated)return currentSession();if(previewLoginPending)return previewLoginPending;previewLoginPending=new Promise(resolve=>{previewLoginResolve=resolve;previewLogin();});return previewLoginPending;};

function previewModeration(){
  const choice=$('previewReview')?.value||'pass';
  if(choice!=='pass'){modal('<h2>Content not approved</h2><p class="lead">Edit the text or images and try again.</p>');return false;}
  return true;
}

upload=async function(files){
  if(uploadPending||uploadBusy)return;
  const mode=uploadMode;
  const list=selectFilesForUpload(files||[]);
  if(!list.length)return;
  uploadPending=true;
  try{
    if(!await requireIdentity())return;
    if(uploadMode!==mode){toast('Upload mode changed. Choose your images again.');return;}
    if(!previewModeration())return;
    return await uploadV15(list);
  }finally{uploadPending=false;}
};

function previewGuest(){
  if(!previewQuestion)return;
  previewCreator={question:bundle(),selection:[...picks],stage,step};
  applyBundle(previewQuestion);
  isGuest=true;questionId='preview-only';picks.clear();stage='answer';
  $('dialog').close();render();scrollPanel();previewBanner();
  toast('Choose your answer.');
}

function previewReturnCreator(){
  if(!previewCreator)return;
  applyBundle(previewCreator.question);picks=new Set(previewCreator.selection);
  isGuest=false;questionId=null;stage=previewCreator.stage;step=previewCreator.step;
  previewCreator=null;render();previewBanner();
}

showShare=function(){
  modal('<h2>Sharing preview</h2><p class="lead">Try answering and saving the poster as a friend.</p><p class="small">Preview only. No shareable link will be created.</p><button class="primary" id="previewOpenGuest" style="width:100%">Preview as a friend</button>');
  on('previewOpenGuest',previewGuest);
};

publishQuestion=async function(){
  if(!validQuestion())return;
  if(isGuest&&previewQuestion)return showShare();
  if(!await requireIdentity())return;
  if(!previewModeration())return;
  previewQuestion=bundle(false);shareCache='preview-only';showShare();
};

exportPNG=async function(marks=true){
  if(!state.cells.some(filledCell)){toast('Add content to at least one square.');return;}
  if(!await requireIdentity())return;
  if(!previewModeration())return;
  try{
    previewSequence++;
    traceId=`DEMO-${String(previewSequence).padStart(4,'0')}`;
    const image=await posterPNGBlob(marks),name=`Design360-${traceId}.png`;
    traceId='';
    if(phoneSaveMode())openAlbumPreview(image,name);else download(image,name,'image/png');
    toast('Poster saved.');
  }catch(e){traceId='';toast(e.message||'Could not generate the image. Please try again.','error');}
};

function previewBanner(){
  let banner=$('previewBanner');
  if(!banner){banner=document.createElement('div');banner.id='previewBanner';banner.className='preview-banner';document.body.prepend(banner);if(entryGate){entryGate.blocked.push([banner,banner.inert]);banner.inert=true;}}
  banner.innerHTML=`<div class="preview-actions"><label>Review simulation <select id="previewReview"><option value="pass">Pass</option><option value="block">Block</option></select></label>${previewCreator?'<button id="previewBack">Back to creator</button>':''}<button id="previewLanguage">Language</button></div>`;
  on('previewBack',previewReturnCreator);
  on('previewLanguage',()=>{sessionStorage.removeItem('d360-language-v25');languageLanding();});
}



// Clearly distinguish the local demonstration from live link creation.
const shareSettingsWithLink=shareSettings;
shareSettings=function(){
 shareSettingsWithLink();const button=$('publish');if(!button)return;
 button.textContent='Preview sharing';
 const note=document.createElement('p');note.className='small share-preview-note';note.textContent='Preview only. No shareable link will be created.';button.after(note);
};

// 2.2: artwork geometry measured from UI新文件2.pdf, pages 1 and 2.
// Page 7 is an asset sheet, never an interaction layout.
const DESIGN_SCALE=W/1559.06;
const festivalLogos=img(globalThis.D360_ASSETS.logos);
const footerLocation=img(globalThis.D360_ASSETS.footer);
const festivalLogosPng=img(globalThis.D360_ASSETS.logosPng);
const footerLocationPng=img(globalThis.D360_ASSETS.footerPng);
async function prepareDesignArtwork(redraw=true){
  const fontRequests=[
    document.fonts.load('700 100px D360Bold'),
    document.fonts.load('400 100px D360Medium'),
    document.fonts.load('400 100px D360Roman'),
    document.fonts.load('400 100px D360Chinese','设计节人类')
  ];
  await Promise.all([...fontRequests,loadImage(globalThis.D360_ASSETS.logosPng),loadImage(globalThis.D360_ASSETS.footerPng)]);
  await document.fonts.ready;
  if(redraw)render();
}
function ordinal(n){const t=n%100;return n+(t>=11&&t<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));}
function syncDesignGrid(s){
  const two=s.cols===2&&s.rows===2;
  Object.assign(G,{x:(two?54.05:56.69)*DESIGN_SCALE,y:(two?418.66:382)*DESIGN_SCALE,w:(two?1455.11:1445.15)*DESIGN_SCALE,h:(two?1452.52:1452.97)*DESIGN_SCALE});
}
function designFont(ctx,size,family='D360Bold',tracking=-.04){
  ctx.font=`${family==='D360Bold'?700:400} ${size}px "${family}", Arial, sans-serif`;
  ctx.letterSpacing=`${size*tracking}px`;
}
// One geometry source for canvas text, underline, hit target and topic menu.
function posterHeading(ctx,language){
  const text=language==='zh'?'请选择包含以下内容的方格':'Select all squares with';
  const family=language==='zh'?'D360Chinese':'D360Bold';
  let size=100.2934*DESIGN_SCALE;
  do{designFont(ctx,size,family);if(ctx.measureText(text).width<=1063*DESIGN_SCALE)break;size-=1;}while(size>36);
  return {text,size,bounds:ctx.measureText(text),baseline:145.9214*DESIGN_SCALE};
}
topicTypography=function(ctx,topic,language=UI_LANGUAGE){
  const heading=posterHeading(ctx,language),chinese=/[\u3400-\u9fff]/.test(topic);
  const family=chinese?'D360Chinese':'D360Bold';
  let size=100.2934*DESIGN_SCALE;
  do{designFont(ctx,size,family);if(ctx.measureText(topic||'________').width<=G.w)break;size-=2;}while(size>26);
  const bounds=ctx.measureText(topic||'design');
  const gap=(language==='zh'?(chinese?28:20):12)*DESIGN_SCALE;
  const baseline=heading.baseline+Math.max(0,heading.bounds.actualBoundingBoxDescent)+gap+bounds.actualBoundingBoxAscent;
  const underlineY=baseline+Math.max(0,bounds.actualBoundingBoxDescent)+10*DESIGN_SCALE;
  return {size,width:topic?bounds.width:220,baseline,underlineY,bounds};
};

gridGeometry=function(s){
  const ctx=$('poster').getContext('2d');designFont(ctx,100.2934*DESIGN_SCALE,'D360Bold',0);
  const col=ctx.measureText(String(s.cols)).width,row=ctx.measureText(String(s.rows)).width;
  designFont(ctx,100.2934*DESIGN_SCALE,'D360Roman',0);
  const cross=ctx.measureText('x').width;
  const end=1472.535*DESIGN_SCALE,start=end-col-cross-row;
  return {col:start+col/2,row:end-row/2,divider:start+col+cross/2};
};

textLayout=function(ctx,t,w,h,kind,size=1){
  const posterLines=posterNumberLines(t),heroNumber=!!posterLines,numeric=false,symbol=/^[\p{P}\p{S}\s]+$/u.test(String(t).trim())&&!!String(t).trim();
  const chinese=/[\u3400-\u9fff]/.test(t),fontFamily=chinese?'"D360Chinese", sans-serif':'"D360Medium", Arial, sans-serif',weight=400;
  // PDF: 393.168 pt / 727.555 pt for 2x2; 260.223 / 481.717 for 3x3.
  const ratio=state.cols===2?.5404:.5402,tracking=chinese?-.04:-.052;
  let fs=(numeric?Math.min(h*.32,w*.5):w*(chinese?.4774:ratio))*size;
  let lines,ascent,descent,advance,total;
  const inset=Math.max(6,Math.min(w,h)*.022);
  const wrap=()=>{
    ctx.font=`${weight} ${fs}px ${fontFamily}`;ctx.letterSpacing=`${fs*tracking}px`;
    if(numeric)return [String(t)];
    const result=[];
    for(const paragraph of posterLines||String(t).split('\n')){
      let line='';
      for(const ch of paragraph){if(line&&ctx.measureText(line+ch).width>w-2*inset){result.push(line);line=ch;}else line+=ch;}
      result.push(line);
    }
    // The cover uses deliberate two-line words. Avoid a lone trailing letter.
    if(result.length===2&&!/\s/.test(String(t))&&!posterLines&&!symbol){
      const chars=Array.from(String(t));let best=null;
      for(let cut=2;cut<=chars.length-2;cut++){
        const a=chars.slice(0,cut).join(''),b=chars.slice(cut).join('');
        const aw=ctx.measureText(a).width,bw=ctx.measureText(b).width;
        if(aw>w-2*inset||bw>w-2*inset)continue;
        const score=Math.abs(aw-bw)+Math.abs(cut-(chars.length-cut))*fs*.35;
        if(!best||score<best.score)best={a,b,score};
      }
      if(best)return [best.a,best.b];
    }
    return result;
  };
  do{
    lines=wrap();const m=ctx.measureText(lines.join('')||'H');
    ascent=m.actualBoundingBoxAscent||fs*.73;descent=m.actualBoundingBoxDescent||0;
    advance=fs*(chinese?.98:.751);total=ascent+descent+(lines.length-1)*advance;
    if(total<=h-2*inset&&lines.every(line=>ctx.measureText(line).width<=w-2*inset))break;
    fs*=.96;
  }while(fs>6);
  const bearing=Math.max(0,...lines.map(line=>ctx.measureText(line).actualBoundingBoxLeft));
  return {fs,weight,fontFamily,tracking,numeric,symbol,heroNumber,lines,ascent,descent,advance,total,insetX:inset+bearing,insetY:inset};
};

function drawDesignDots(ctx,x,y,w,h){
  // 24 dots across, inset by 3.5%: a visible gap remains beside every grid line.
  const inset=Math.min(w,h)*.035;
  const stepX=(w-2*inset)/(23+.469),stepY=(h-2*inset)/(23+.469),r=Math.min(stepX,stepY)*.2345;
  ctx.save();ctx.fillStyle='#000';
  ctx.beginPath();
  for(let row=0;row<24;row++)for(let col=0;col<24;col++){
    const xx=x+inset+r+col*stepX,yy=y+inset+r+row*stepY;
    ctx.moveTo(xx+r,yy);ctx.arc(xx,yy,r,0,Math.PI*2);
  }
  ctx.fill();ctx.restore();
}
drawTo=function(ctx,s,marks,language=UI_LANGUAGE){
  syncDesignGrid(s);const r=DESIGN_SCALE;
  ctx.save();ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#000';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const heading=posterHeading(ctx,language);
  ctx.fillText(heading.text,56.693*r+heading.bounds.actualBoundingBoxLeft,heading.baseline);
  ctx.textAlign='right';designFont(ctx,100.2934*r,'D360Bold',0);
  const rowWidth=ctx.measureText(String(s.rows)).width;
  ctx.fillText(String(s.rows),1472.535*r,145.9214*r);
  designFont(ctx,100.2934*r,'D360Roman',0);
  const crossWidth=ctx.measureText('x').width;
  ctx.fillText('x',1472.535*r-rowWidth,145.9214*r);
  designFont(ctx,100.2934*r,'D360Bold',0);
  ctx.fillText(String(s.cols),1472.535*r-rowWidth-crossWidth,145.9214*r);ctx.textAlign='left';
  const topic=topicTypography(ctx,s.topic,language);ctx.fillText(s.topic||'',56.693*r+topic.bounds.actualBoundingBoxLeft,topic.baseline);
  ctx.fillRect(56.693*r,topic.underlineY,Math.max(100,topic.width),5.013*r);
  const cw=G.w/s.cols,ch=G.h/s.rows,selection=new Set(marks||[]);
  // The whole image is a background layer even underneath cleared or newly
  // added foreground squares. Cell colors and independent images cover it.
  if(s.whole&&!s.whole.split&&assets[s.whole.asset]){
    ctx.save();ctx.filter=s.gray?'grayscale(1)':'none';
    cover(ctx,img(assets[s.whole.asset]),G.x,G.y,G.w,G.h,s.whole.zoom,s.whole.px,s.whole.py);
    ctx.restore();
  }
  for(let i=0;i<s.cells.length;i++){
    const c=s.cells[i],x=G.x+i%s.cols*cw,y=G.y+Math.floor(i/s.cols)*ch;
    ctx.save();ctx.beginPath();ctx.rect(x,y,cw,ch);ctx.clip();
    if(c.asset&&assets[c.asset]){ctx.filter=s.gray?'grayscale(1)':'none';cover(ctx,img(assets[c.asset]),x,y,cw,ch,c.zoom,c.px,c.py,c.rect);ctx.filter='none';}
    if(i===0&&ctx.canvas===$('poster')&&showEmptyGridHint(s)){ctx.fillStyle='#f3f3f3';ctx.fillRect(x,y,cw,ch);}
    if(hasColorFill(c)){ctx.fillStyle=c.bg;ctx.fillRect(x,y,cw,ch);}
    if(selection.has(i))drawDesignDots(ctx,x,y,cw,ch);
    if(c.text.trim()){ctx.fillStyle=effectiveTextColor(s,c);if(stage==='entry'&&s.entryArtwork&&s.cols===3&&s.rows===3)drawEntryGlyphs(ctx,i);else textLines(ctx,c.text,x,y,cw,ch,c.type,c.size,c.align);}
    ctx.restore();
  }
  const line=s.line==='auto'?autoGridLine(s):s.line;
  ctx.strokeStyle=line;ctx.lineWidth=(s.cols===2?11:7.07)*r*(s.lineWidth/5);
  ctx.beginPath();
  for(let col=1;col<s.cols;col++){ctx.moveTo(G.x+col*cw,G.y);ctx.lineTo(G.x+col*cw,G.y+G.h);}
  for(let row=1;row<s.rows;row++){ctx.moveTo(G.x,G.y+row*ch);ctx.lineTo(G.x+G.w,G.y+row*ch);}
  ctx.stroke();
  for(const i of selection)if(i>=0&&i<s.cells.length)check(ctx,G.x+i%s.cols*cw,G.y+Math.floor(i/s.cols)*ch,Math.min(cw,ch)*.265,Math.min(cw,ch)*.013);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle='#000';
  designFont(ctx,100.2934*r,'D360Bold',-.043);
  if(language==='zh'){
    // Match each bundled face's declared weight; never synthesize bold CJK glyphs.
    const titleX=57.596*r,titleY=2076.9705*r,prefix='Design 360 ';
    ctx.fillText(prefix,titleX,titleY);
    const prefixWidth=ctx.measureText(prefix).width;
    designFont(ctx,100.2934*r,'D360Chinese',-.043);
    ctx.fillText('设计节',titleX+prefixWidth,titleY);
  }else ctx.fillText('360 Design Festival',57.596*r,2076.9705*r);
  designFont(ctx,100.2934*r,'D360Bold',-.043);
  ctx.fillText('2026.11.26-11.29',57.596*r,2177.5648*r);
  const logosReady=festivalLogos.complete&&festivalLogos.naturalWidth?festivalLogos:festivalLogosPng;
  if(logosReady.complete&&logosReady.naturalWidth)ctx.drawImage(logosReady,1038*r,1996*r,438*r,196*r);
  designFont(ctx,23.4397*r,'D360Roman',-.02);
  ctx.fillText(`ID: ${traceId||''}`,58.758*r,2350.809*r);
  ctx.fillText('Link: www.design360.com/360D',58.758*r,2375.679*r);
  const addressReady=footerLocation.complete&&footerLocation.naturalWidth?footerLocation:footerLocationPng;
  if(addressReady.complete&&addressReady.naturalWidth)ctx.drawImage(addressReady,866*r,2327*r,520*r,66*r);
  ctx.restore();
};
const designHitsBase=hits;
hits=function(){
  syncDesignGrid(stage==='entry'?entryState():state);designHitsBase();
  const controls=[...$('posterShell').querySelectorAll('.poster-control')];
  const topic=controls.find(b=>b.getAttribute('aria-label')?.startsWith('Choose topic'));
  if(topic){const m=topicTypography($('poster').getContext('2d'),state.topic);pos(topic,56.693*DESIGN_SCALE,m.baseline-m.bounds.actualBoundingBoxAscent,Math.max(230,m.width),m.underlineY-m.baseline+m.bounds.actualBoundingBoxAscent+12*DESIGN_SCALE);}
  layoutTopicMenu();
};

// The drawing function is also used for exports; preload exact fonts and SVG logos.
const designPNGBase=posterPNGBlob;
posterPNGBlob=async function(marks=true){await prepareDesignArtwork(false);return designPNGBase(marks);};

const designEditorBase=editorMarkup;
editorMarkup=function(){
  let html=designEditorBase();
  if(!html.includes('content-choice-hint'))html+='<p class="content-choice-hint">Select text, images, or colors.</p>';
  return html;
};
const designPanelBase=renderPanel;
renderPanel=function(){
  designPanelBase();
  document.querySelectorAll('input[type="range"]').forEach(setSliderTrack);
};
function setSliderTrack(slider){const p=(Number(slider.value)-Number(slider.min))/(Number(slider.max)-Number(slider.min))*100;slider.style.setProperty('--range-fill',p+'%');}
document.addEventListener('input',event=>{if(event.target.matches('input[type="range"]'))setSliderTrack(event.target);});

// Both language choices use the same activation feedback before entering.
showEntryLanguages=function(){
  if(!entryGate)return;
  entryGate.innerHTML='<div class="language-card language-selection"><button id="chooseEnglish" aria-pressed="false">english</button><button id="chooseChinese" aria-pressed="false">中文</button></div>';
  let pending=false;
  for(const [id,language] of [['chooseEnglish','en'],['chooseChinese','zh']]){
    const button=entryGate.querySelector('#'+id);
    button.onclick=()=>{
      if(pending)return;pending=true;
      button.dataset.pending='true';button.setAttribute('aria-pressed','true');button.classList.add('selected-language');
      setTimeout(()=>{
        sessionStorage.setItem('d360-language-v25',language);
        if(language!==UI_LANGUAGE){location.reload();return;}
        showEntryLogin();enterWebsite();
      },120);
    };
  }
  // Entry stays unfocused until the user chooses a language.
};
previewBanner=function(){
  $('previewBanner')?.remove();
  if(!previewCreator)return;
  const banner=document.createElement('div');banner.id='previewBanner';banner.className='preview-banner';
  banner.innerHTML='<button id="previewBack">Back to my poster</button>';
  document.body.prepend(banner);on('previewBack',previewReturnCreator);
};
document.documentElement.lang=UI_LANGUAGE==='zh'?'zh-CN':'en';

// No fill is a separate action, never a random palette color.
function isWhiteColor(color){return /^#[0-9a-f]{6}$/i.test(color)&&[1,3,5].every(i=>parseInt(color.slice(i,i+2),16)>=248);}
function randomColorPool(){const usable=palette().filter(color=>!isWhiteColor(color));return usable.length?usable:defaultPalette.filter(color=>!isWhiteColor(color));}
randomOneColor=function(){const colors=randomColorPool();setColor(colors[Math.floor(Math.random()*colors.length)]);};
fillRandomColors=function(){finishInline();commit(()=>{const colors=randomColorPool();state.cells.forEach(cell=>colorCell(cell,colors[Math.floor(Math.random()*colors.length)]));});};
function clearColorFill(){
  finishInline();commit(()=>{const cell=state.cells[selected];cell.colorApplied=false;cell.bg='#f8f8f8';
    cell.type=cell.text.trim()?(isNumeric(cell.text)?'number':'text'):cell.asset?(cell.rect?'slice':'image'):'text';
    if(cell.text.trim())cell.fg=cell.asset?'#ffffff':'#000000';
  });
}
const noFillEditorBase=editorMarkup;
editorMarkup=function(){
  let html=noFillEditorBase();if(editTab!=='color')return html;
  const empty=!hasColorFill(state.cells[selected]);
  html=html.replace('<div class="palette">',`<div class="palette"><button id="noColor" class="swatch no-color" aria-label="No color" title="No color" aria-pressed="${empty}"></button>`);
  if(empty)html=html.replace('id="bgColor"','id="bgColor" data-empty-fill="true"');
  return html;
};
const noFillBindBase=bindSimpleEditor;
bindSimpleEditor=function(){noFillBindBase();on('noColor',clearColorFill);on('bgColor',event=>event.target.removeAttribute('data-empty-fill'),'input');};

// Match 03.png: 64.5px advance for a 60px font; 44px from rule to first ink.
function layoutTopicMenu(){
  const shell=$('posterShell'),menu=shell?.querySelector('.poster-menu:not(.setup-menu)');
  if(!menu)return;
  const ctx=$('poster').getContext('2d'),scale=shell.getBoundingClientRect().width/W,r=DESIGN_SCALE;
  const metrics=topicTypography(ctx,state.topic),fontSize=100.2934*r;
  designFont(ctx,fontSize,'D360Bold');
  const first=menu.querySelector('[data-word]'),sample=ctx.measureText(first?.textContent||'humans');
  const lineHeight=fontSize*1.075;
  const ascent=sample.fontBoundingBoxAscent||fontSize*.95,descent=sample.fontBoundingBoxDescent||fontSize*.25;
  const inkTop=(lineHeight-ascent-descent)/2+ascent-sample.actualBoundingBoxAscent;
  const top=metrics.underlineY+5.013*r+fontSize*(44/60)-inkTop;
  menu.style.left=(56.693*r/W*100)+'%';menu.style.right=((W-G.x-G.w)/W*100)+'%';
  menu.style.top=(top/H*100)+'%';menu.style.height=((1996*r-48*r-top)/H*100)+'%';
  menu.style.setProperty('--topic-list-size',(fontSize*scale)+'px');
  menu.querySelectorAll('[data-word]').forEach(button=>{
    const bounds=ctx.measureText(button.textContent);
    button.style.transform=`translateX(${bounds.actualBoundingBoxLeft*scale}px)`;
  });
}
window.addEventListener('resize',()=>requestAnimationFrame(layoutTopicMenu));

// 2.5.1: compact controls and a single custom/no-fill entry.
const compactEditorBase=editorMarkup;
editorMarkup=function(){
  let html=compactEditorBase();
  if(/tool-actions|font-adjust|color-board/.test(html))html=html.replace(/<p class="content-choice-hint">[\s\S]*?<\/p>/,'');
  if(editTab!=='color')return html;
  html=html.replace(/<div class="palette-bottom">[\s\S]*?<\/div>/,'<button class="link palette-edit-inline" id="editPalette">Edit palette</button>');
  return html;
};
function openCustomColor(){
  finishInline();
  const index=selected,cell=state.cells[index],value=/^#[0-9a-f]{6}$/i.test(cell.bg)?cell.bg:'#000000';
  modal(`<h2>Custom color</h2><input class="custom-color-strip" id="customCellColor" type="color" aria-label="Custom color" value="${value}"><div class="custom-picker-actions"><button id="removeCellColor">Remove color</button><button class="primary" id="finishCustomColor">Done</button></div>`);
  const dialog=$('dialog');
  let frame=0,pending=null,changed=false;
  // Continuous native-picker input only changes the canvas once per frame.
  // Keep DOM, hit targets, persistence and history work out of the drag loop.
  const preview=()=>{
    frame=0;if(pending===null)return;
    colorCell(state.cells[index],pending);pending=null;draw();
  };
  const finish=()=>{
    if(frame){cancelAnimationFrame(frame);frame=0;}
    preview();if(!changed)return;
    changed=false;hits();renderPanel();scheduleSave();
  };
  on('customCellColor',event=>{
    const next=event.target.value.toLowerCase();
    if(next===(pending??state.cells[index].bg)&&hasColorFill(state.cells[index]))return;
    if(!changed){checkpoint();changed=true;if(step<4)state.answer=[];shareCache=null;}
    pending=next;if(!frame)frame=requestAnimationFrame(preview);
  },'input');
  on('customCellColor',finish,'change');
  on('removeCellColor',()=>{finish();clearColorFill();dialog.close();});
  on('finishCustomColor',()=>{finish();dialog.close();});
  dialog.addEventListener('close',finish,{once:true});
}
const compactBindBase=bindSimpleEditor;
bindSimpleEditor=function(){
  compactBindBase();const original=$('noColor');if(!original)return;
  // Replace the legacy clear-on-click listener with the combined picker entry.
  const entry=original.cloneNode(true);original.replaceWith(entry);
  const cell=state.cells[selected],filled=hasColorFill(cell);
  entry.onclick=openCustomColor;
  entry.setAttribute('aria-label','Custom color');entry.title='Custom color';
  entry.setAttribute('aria-haspopup','dialog');
  entry.classList.toggle('no-color',!filled);
  entry.style.background=filled?cell.bg:'#fff';
  entry.setAttribute('aria-pressed',String(!filled||!palette().includes(cell.bg)));
};
const compactDockBase=updateDock;
updateDock=function(){
  compactDockBase();if(stage!=='answer')return;
  const dock=$('mobileDock'),button=document.createElement('button');button.id='dockClearPicks';button.textContent='Clear selection';
  button.onclick=()=>{picks.clear();render();};
  dock.insertBefore(button,$('dockAnswer'));
  if(mobileLayout()){
    const back=$('dockBack');if(back)back.setAttribute('aria-label',back.textContent);
    dock.querySelector('.answer-count')?.remove();
    fitAnswerDock();requestAnimationFrame(fitAnswerDock);document.fonts.ready.then(fitAnswerDock);
  }
};

function fitAnswerDock(){
  const dock=$('mobileDock');if(stage!=='answer'||!mobileLayout()||!dock)return;
  dock.querySelector('.answer-count')?.remove();
  dock.classList.remove('dock-snug','dock-tight');
  const crowded=()=>dock.scrollWidth>dock.clientWidth;
  if(crowded())dock.classList.add('dock-snug');
  if(crowded())dock.classList.add('dock-tight');
}
window.addEventListener('resize',()=>requestAnimationFrame(fitAnswerDock));

// 2.5.4: introduce text tools once, then reveal the next step without repeated scrolling.
const guidedInputValueBase=inputValue;
inputValue=function(value){
  if(mobileLayout()&&inlineIndex!==null&&String(value).trim())manualTextCell=state.cells[inlineIndex]?.id;
  return guidedInputValueBase(value);
};
let completionWasFull=null,completionRevealPending=false,completionRevealTimer=0;
function resetCreationGuidance(){
  firstTextSettingsShown=false;manualTextCell=null;completionWasFull=null;completionRevealPending=false;
  clearTimeout(completionRevealTimer);
}
const guidedFreshBase=startFresh;
startFresh=function(){resetCreationGuidance();return guidedFreshBase();};
const guidedGoBase=go;
go=function(n){if(stage==='entry'&&n===1)resetCreationGuidance();return guidedGoBase(n);};
function scheduleCompletionReveal(){
  clearTimeout(completionRevealTimer);
  if(!completionRevealPending||!mobileLayout())return;
  completionRevealTimer=setTimeout(revealCompletion,100);
}
function revealCompletion(){
  if(!completionRevealPending||!mobileLayout()||stage!=='edit'||step!==3||guidePhase!=='content'||
     !completeGrid()||editorOpen||posterMenu||inlineIndex!==null||document.body.classList.contains('keyboard-open')||$('dialog')?.open||gesture?.active)return;
  const button=$('finishPoster');if(!button||button.disabled)return;
  const viewport=window.visualViewport,top=(viewport?.offsetTop||0)+12;
  const viewportBottom=(viewport?.offsetTop||0)+(viewport?.height||innerHeight);
  const dock=$('mobileDock'),dockTop=dock?.getBoundingClientRect().top||viewportBottom;
  const bottom=Math.min(viewportBottom,dockTop)-12;
  const rect=button.getBoundingClientRect();
  const delta=rect.bottom>bottom?rect.bottom-bottom:rect.top<top?rect.top-top:0;
  completionRevealPending=false;
  if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
const guidedCompletionBase=completionControl;
completionControl=function(){
  guidedCompletionBase();
  if(stage!=='edit'||step!==3||guidePhase!=='content')return;
  const full=completeGrid();
  if(completionWasFull===false&&full)completionRevealPending=true;
  if(!full)completionRevealPending=false;
  completionWasFull=full;scheduleCompletionReveal();
};
window.visualViewport?.addEventListener('resize',scheduleCompletionReveal);
$('dialog').addEventListener('close',scheduleCompletionReveal);

const guidedResetBase=resetContent;
resetContent=function(all=false){if(all)resetCreationGuidance();return guidedResetBase(all);};

/* Delegation also covers controls that are rebuilt when editing a poster. */
(()=>{
 const excluded='.cell-hit,.poster-control,.swatch,[data-word],.icon-action,.close,#closeEditor';
 let press=null;
 function prepare(target){
  const button=target instanceof Element?target.closest('button'):null;
  if(!button||button.matches(excluded)||button.disabled||button.getAttribute('aria-disabled')==='true')return null;
  const css=getComputedStyle(button);
  // Plain text, artwork hit areas and toolbar icons keep their existing feedback.
  const clear=css.backgroundColor==='transparent'||/rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(css.backgroundColor);
  if(clear&&css.backgroundImage==='none')return null;
  if(button.closest('.language-selection')||button.offsetWidth>=300)button.style.setProperty('--press-scale','.99');
  else button.style.removeProperty('--press-scale');
  button.classList.add('ui-motion');
  return button;
 }
 function release(){if(press)press.button.classList.remove('is-pressed');press=null;}
 document.addEventListener('pointerover',e=>prepare(e.target),{passive:true});
 document.addEventListener('focusin',e=>prepare(e.target));
 document.addEventListener('pointerdown',e=>{
  release();if(!e.isPrimary||e.button!==0)return;
  const button=prepare(e.target);if(!button)return;
  press={button,id:e.pointerId,x:e.clientX,y:e.clientY};button.classList.add('is-pressed');
 },{capture:true,passive:true});
 document.addEventListener('pointermove',e=>{
  if(!press||press.id!==e.pointerId)return;
  const box=press.button.getBoundingClientRect();
  if(Math.hypot(e.clientX-press.x,e.clientY-press.y)>8||e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)release();
 },{passive:true});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>{
  if(press&&press.id===e.pointerId)release();
 },{capture:true,passive:true});
 document.addEventListener('keydown',e=>{
  if(e.repeat||!['Enter',' '].includes(e.key))return;
  const button=prepare(e.target);if(!button)return;
  release();press={button,key:e.key};button.classList.add('is-pressed');
 },true);
 document.addEventListener('keyup',e=>{if(press?.key===e.key)release();},true);
 document.addEventListener('focusout',release);
 window.addEventListener('blur',release);
 window.addEventListener('pagehide',release);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
})();

const updateDockBeforeQuietHints=updateDock;
updateDock=function(){
 updateDockBeforeQuietHints();
 if(stage!=='entry'&&$('toast')?.dataset.kind==='entry')hideToast(true);
};

// 2.5.9: contextual creation guidance, safe bulk filling and a full entry preview.
const journeyCopy = UI_LANGUAGE === 'zh' ? {
 loading:'正在准备海报…', failed:'海报暂时未能加载，请Try again。', retry:'重新加载',
 entryTitle:'第一步 · 体验选格', entryBody:'点击包含「design」或「设计节」的 3 个格子。',
 entryNext:'开始创作', createTitle:'第二步 · 制作海报',
 topicBody:'选一个词作为海报的内容主题。', topicLabel:'这个词指向你想表达的海报内容。',
 content:topic=>`围绕「${topic}」，点击格子添加texts、images或colors。`,
 add:'＋ 点击添加', filled:(n,total)=>`已添加 ${n} / ${total} 格 · 可保留Empty`,
 fill:'填满Empty格', done:'Done创作', fillTitle:'填满Empty格',
 fillBody:'只填充Empty格，保留已有内容。整次操作可以一步Undo。',
 colors:'Random color', numbers:'Random number', filledMessage:n=>`已补齐 ${n} 个Empty格，可Undo。`,
 empty:'Add content to at least one square.', complete:'所有格子已有内容。',
 save:'Save poster', invite:'Invite friends to answer', doneBody:'直接Save poster，或设置题目邀请朋友作答。',
 shareTitle:'Invite friends to answer', mode:'Answer mode', open:'No correct answer', exact:'Use my selection as the answer key',
 openBody:'Friends can choose freely. There are no right or wrong answers.', exactBody:'Friends must select exactly the same squares as you.',
 setAnswer:'Set your answer', previewShare:'Preview sharing',
 previewNote:'Preview only. No shareable link will be created.',
 answerTitle:'第三步 · Set your answer', answerBody:topic=>`选出代表「${topic}」的格子，再Confirm答案。`,
 custom:'Custom color', palette:'Edit palette', whole:'添加整张底图', imageHint:'底图放在已有内容下方；多张images填入Empty格。'
} : {
 loading:'Preparing your poster…', failed:'The poster could not load. Please try again.', retry:'Reload',
 entryTitle:'Step 1 · Try selecting squares', entryBody:'Tap the 3 squares containing “design” or “设计节”.',
 entryNext:'Start creating', createTitle:'Step 2 · Create your poster',
 topicBody:'Choose a word as the theme of your poster.', topicLabel:'This word describes what your poster is about.',
 content:topic=>`Explore “${topic}”. Tap a square to add text, images or colors.`,
 add:'＋ Add content', filled:(n,total)=>`${n} / ${total} squares filled · Blanks are welcome`,
 fill:'Fill empty squares', done:'Finish creating', fillTitle:'Fill empty squares',
 fillBody:'Fill only empty squares. Keep your existing content and undo the whole fill in one step.',
 colors:'Random colors', numbers:'Random numbers', filledMessage:n=>`Filled ${n} empty squares. You can undo this.`,
 empty:'Add content to at least one square.', complete:'All squares already have content.',
 save:'Save poster', invite:'Invite friends to answer', doneBody:'Save your poster, or set up a question for friends to answer.',
 shareTitle:'Invite friends to answer', mode:'Answer mode', open:'No correct answer', exact:'Use my selection as the answer key',
 openBody:'Friends can choose freely. There are no right or wrong answers.', exactBody:'Friends must select exactly the same squares as you.',
 setAnswer:'Set the answer', previewShare:'Preview sharing',
 previewNote:'Preview only. No shareable link will be created.',
 answerTitle:'Step 3 · Set your answer', answerBody:topic=>`Select the squares that represent “${topic}”, then confirm.`,
 custom:'Custom color', palette:'Edit palette', whole:'Add a background image', imageHint:'The background sits below your content. Multiple images fill empty squares.'
};

function beginJourneyLoading(){
 document.body.classList.add('artwork-loading');
 const el=document.createElement('div');el.id='journeyLoading';el.setAttribute('role','status');el.textContent=journeyCopy.loading;document.body.append(el);
}
function finishJourneyLoading(){
 document.body.classList.remove('artwork-loading');$('journeyLoading')?.remove();renderJourney();fitJourneyPoster();
}
function failJourneyLoading(error){
 console.error('Preview boot failed',error);
 const el=$('journeyLoading');if(!el)return;
 el.innerHTML=`<p>${journeyCopy.failed}</p><button id="reloadJourney">${journeyCopy.retry}</button>`;
 on('reloadJourney',()=>location.reload());
}

let journeyFitFrame=0;
function scheduleJourneyFit(){cancelAnimationFrame(journeyFitFrame);journeyFitFrame=requestAnimationFrame(fitJourneyPoster);}
function fitJourneyPoster(){
 const shell=$('posterShell');if(!shell)return;
 const overview=stage==='entry'||mobileLayout()&&stage==='edit';
 document.body.classList.toggle('journey-overview',overview);
 if(!overview){layoutTopicMenu();styleInline();return;}
 if(stage==='edit'&&(editorOpen||posterMenu)){layoutTopicMenu();styleInline();return;}
 if(mobileTyping()||document.body.classList.contains('keyboard-open'))return;
 const viewport=window.visualViewport;
 // Zoomed views and the software keyboard must not repeatedly rescale the artwork.
 if(viewport&&viewport.scale>1.05)return;
 const height=viewport?.height||innerHeight;
 const topbar=document.querySelector('.topbar')?.offsetHeight||60;
 const guide=$('journeyGuide');const guideHeight=guide&&!guide.hidden?guide.offsetHeight+12:0;
 const dock=$('mobileDock');const dockHeight=dock&&getComputedStyle(dock).display!=='none'?dock.offsetHeight:0;
 const completion=$('completionControl');
 const completionHeight=mobileLayout()&&completion&&!completion.hidden&&getComputedStyle(completion).display!=='none'?completion.offsetHeight:0;
 const available=Math.max(160,height-topbar-guideHeight-dockHeight-completionHeight-28);
 shell.style.setProperty('--overview-poster-width',(available*W/H)+'px');
 document.documentElement.style.setProperty('--journey-dock-height',dockHeight+'px');
 document.documentElement.style.setProperty('--journey-completion-height',completionHeight+'px');
 layoutTopicMenu();
}
// Leave the artwork at a stable size while typing or opening tools.
mobileFitPoster=scheduleJourneyFit;
window.addEventListener('resize',scheduleJourneyFit);
window.visualViewport?.addEventListener('resize',scheduleJourneyFit);

function renderJourney(){
 const shell=$('posterShell');if(!shell)return;
 let guide=$('journeyGuide');if(!guide){guide=document.createElement('div');guide.id='journeyGuide';guide.className='journey-guide';shell.before(guide);}
 const show=stage==='edit'&&(!posterMenu||guidePhase==='topic');
 guide.hidden=!show;
 if(show){
  const body=guidePhase==='topic'?journeyCopy.topicBody:journeyCopy.content(state.topic);
  guide.innerHTML=`<strong>${journeyCopy.createTitle}</strong><span>${esc(body)}</span>`;
 }
 const empty=stage==='edit'&&guidePhase==='content'&&!state.cells.some(filledCell)&&!posterMenu&&!editorOpen;
 shell.querySelectorAll('.cell-hit').forEach((button,index)=>{
  button.classList.toggle('first-empty-square',empty&&index===0);
  if(empty&&index===0){button.dataset.emptyLabel=journeyCopy.add;button.setAttribute('aria-label',journeyCopy.add);}
 });
 const menu=shell.querySelector('.poster-menu');
 if(menu&&!menu.querySelector('.topic-explanation')){
  const note=document.createElement('p');note.className='topic-explanation';note.textContent=journeyCopy.topicLabel;
  // The initial chooser explains the theme before any editing begins.
  if(menu.classList.contains('setup-menu'))menu.querySelector('.setup-heading')?.after(note);
 }
 scheduleJourneyFit();
}

const journeyTopicLayoutBase=layoutTopicMenu;
layoutTopicMenu=function(){
 const menu=$('posterShell')?.querySelector('.poster-menu:not(.setup-menu)');
 if(menu&&!menu.querySelector('.topic-options-scroll')){
  const list=document.createElement('div');list.className='topic-options-scroll';
  [...menu.children].filter(el=>el.matches('button[data-word]')).forEach(el=>list.append(el));
  menu.prepend(list);
 }
 journeyTopicLayoutBase();
 // Cover antialiased grid-line ends without moving the text alignment.
 if(menu)menu.style.right=`calc(${(W-G.x-G.w)/W*100}% - 2px)`;
};

completionControl=function(){
 let wrap=$('completionControl');if(!wrap){wrap=document.createElement('div');wrap.id='completionControl';}
 let right=$('rightControls');if(!right){right=document.createElement('div');right.id='rightControls';$('panel').before(right);right.append($('panel'));}
 const desktop=!mobileLayout(),target=desktop?right:$('posterShell').parentElement;
 if(wrap.parentElement!==target)target.append(wrap);
 right.classList.toggle('editing-tools',stage==='edit'&&editorOpen&&!posterMenu);
 const visible=stage==='edit'&&step===3&&guidePhase==='content'&&!posterMenu&&(!mobileLayout()||!editorOpen);
 wrap.hidden=!visible;
 if(visible){
  const count=state.cells.filter(filledCell).length;
  wrap.innerHTML=`<p class="creation-progress">${journeyCopy.filled(count,state.cells.length)}</p><div class="creation-actions"><button id="quickFill" ${count===state.cells.length?'disabled':''}>${journeyCopy.fill}</button><button class="primary" id="finishCreation" ${count?'':'disabled'}>${journeyCopy.done}</button></div>`;
  on('quickFill',openQuickFill);on('finishCreation',finishCreation);
 }
};

const journeyDockBase=updateDock;
updateDock=function(){
 journeyDockBase();
 const dock=$('mobileDock');
 if(stage==='entry'&&dock){
  const hint=document.createElement('div');hint.id='entryStepHint';hint.className='journey-guide';
  hint.innerHTML=`<strong>${journeyCopy.entryTitle}</strong><span>${journeyCopy.entryBody}</span>`;
  dock.prepend(hint);if(entryPicks.size===3)$('dockConfirm').textContent=journeyCopy.entryNext;
 }
 renderJourney();
};

function openQuickFill(){
 finishInline();
 modal(`<h2>${journeyCopy.fillTitle}</h2><p class="lead">${journeyCopy.fillBody}</p><div class="twocol"><button id="fillEmptyColors">${journeyCopy.colors}</button><button id="fillEmptyNumbers">${journeyCopy.numbers}</button></div>`);
 on('fillEmptyColors',()=>fillEmptySquares('color'));on('fillEmptyNumbers',()=>fillEmptySquares('number'));
}
function fillEmptySquares(kind){
 const empty=state.cells.filter(cell=>!filledCell(cell)&&!cell.locked);
 if(!empty.length){toast(journeyCopy.complete);return;}
 finishInline();
 commit(()=>{const colors=randomColorPool();for(const cell of empty){
  if(kind==='color')colorCell(cell,colors[Math.floor(Math.random()*colors.length)]);
  else Object.assign(cell,{type:'number',text:randomPosterNumber(),align:'center',fg:'#000000'});
 }});
 $('dialog').close();editorOpen=false;posterMenu=null;render();toast(journeyCopy.filledMessage(empty.length));
}
function finishCreation(){
 if(!state.cells.some(filledCell)){toast(journeyCopy.empty);return;}
 finishInline();editorOpen=false;render();
 modal(`<h2>${journeyCopy.done}</h2><p class="lead">${journeyCopy.doneBody}</p><div class="stack"><button class="primary" id="saveOnlyPoster">${journeyCopy.save}</button><button id="inviteFromCreation">${journeyCopy.invite}</button></div>`);
 on('saveOnlyPoster',()=>exportPNG(false));on('inviteFromCreation',shareSettings);
}

let shareAfterAnswer=false;
const journeyGoBase=go;
go=function(n){shareAfterAnswer=false;return journeyGoBase(n);};
function needsAnswerKey(){return state.mode==='exact'&&(!state.answer.length||confirmedPosterSignature!==posterSignature());}
shareSettings=function(){
 if(!state.cells.some(filledCell)){toast(journeyCopy.empty);return;}
 finishInline();
 modal(`<h2>${journeyCopy.shareTitle}</h2><label class="field"><span>${journeyCopy.mode}</span><select id="answerMode" aria-describedby="answerModeDescription"><option value="open" ${state.mode==='open'?'selected':''}>${journeyCopy.open}</option><option value="exact" ${state.mode==='exact'?'selected':''}>${journeyCopy.exact}</option></select></label><p class="small answer-mode-description" id="answerModeDescription"></p><button id="publish" class="primary" style="width:100%"></button><p class="small share-preview-note">${journeyCopy.previewNote}</p>`);
 const sync=()=>{$('answerModeDescription').textContent=state.mode==='exact'?journeyCopy.exactBody:journeyCopy.openBody;$('publish').textContent=needsAnswerKey()?journeyCopy.setAnswer:journeyCopy.previewShare;};
 sync();on('answerMode',event=>{state.mode=event.target.value;shareCache=null;scheduleSave();sync();},'change');
 on('publish',()=>{
  if(needsAnswerKey()){shareAfterAnswer=true;$('dialog').close();finishPoster();}
  else publishQuestion();
 });
};
const journeySubmitBase=submitAnswer;
submitAnswer=function(){
 const pending=shareAfterAnswer&&!isGuest;journeySubmitBase();
 if(pending&&stage==='result'){shareAfterAnswer=false;shareSettings();}
};
const journeyPanelBase=renderPanel;
renderPanel=function(){
 journeyPanelBase();
 if(stage==='answer'&&!isGuest){
  const heading=$('panel').querySelector('h1'),body=$('panel').querySelector('.lead');
  if(heading)heading.textContent=journeyCopy.answerTitle;
  if(body)body.textContent=journeyCopy.answerBody(state.topic);
 }
};

const journeyEditorBase=editorMarkup;
editorMarkup=function(){
 let html=journeyEditorBase();
 if(editTab==='image'){
  html=html.replace(/(<button id="wholeImage"[^>]*>)[\s\S]*?(<\/button>)/,`$1${journeyCopy.whole}$2`);
  html=html.replace(/<p class="image-capacity-hint">[\s\S]*?<\/p>/,`<p class="image-capacity-hint">${journeyCopy.imageHint}</p>`);
 }
 if(editTab!=='color')return html;
 const at=html.indexOf('<div class="color-board">');if(at<0)return html;
 const cell=state.cells[selected];
 return html.slice(0,at)+`<div class="color-board"><div class="palette-heading"><button id="customPaletteColor">${journeyCopy.custom}</button><button id="editPalette" class="palette-edit-inline">${journeyCopy.palette}</button></div><div class="palette" style="--color-count:${palette().length}">${palette().map((color,i)=>`<button class="swatch" data-color="${color}" aria-label="${i+1}: ${color}" aria-pressed="${hasColorFill(cell)&&cell.bg===color}" style="background:${color}"></button>`).join('')}</div></div>`;
};
const journeyBindBase=bindSimpleEditor;
bindSimpleEditor=function(){journeyBindBase();on('customPaletteColor',openCustomColor);};

const journeyCloseGateBase=closeEntryGate;
closeEntryGate=function(){journeyCloseGateBase();hideToast(true);renderJourney();};
// Persistent stage guidance supersedes the old one-off completion scroll.
scheduleCompletionReveal=function(){};
revealCompletion=function(){};

// 3.1 preview: one workspace, consistent typography and explicit image placement.
const workCopy=UI_LANGUAGE==='zh'?{
 topicTitle:'你想做一张关于什么的海报？',
 topicHelp:'选一个词，用texts、images或colors表达它。',
 entryAnswer:'Hint: top left, top right and center',
 createHint:'点击格子，添加texts、images或colors。',
 quick:'快速填充',words:'随机texts',colors:'随机配 color',close:'收起',
 quickHelp:'更换文案，保留字号和样式；每次变化都可Undo。',
 noTargets:'没有可更新的格子。',
 changed:(kind,n)=>`已更新 ${n} 格${kind==='color'?'配 color':'texts'}，可以继续换一组。`,
 upload:'＋ 上传images',reading:'正在读取images…',
 imageHelp:'单张可铺满网格或放入当前格；多张依次填入Empty格。',
 placement:'这张images放在哪里？', across:'填充多格', acrossHelp:'一张images铺满整个网格', one:'填充单格', oneHelp:'放入当前选中的格子', cancel:'Cancel', ink:'images上的texts', auto:'Automatic', black:'Black字', white:'White字',
 backgroundAdded:'Background added. Your existing content is preserved.',
 imageAdded:(n,extra)=>`已按顺序添加 ${n} 张images${extra?`，另 ${extra} 张未使用`:''}。`,
 imageNoSpace:'没有可放images的Empty格；请先清空需要替换的格子。',
 imageChanged:'海报已更改，请Choose againimages。',cellImageAdded:'images已放入当前格，可Undo。',
 crop:'Adjust image',zoom:'Zoom',horizontal:'Horizontal position',vertical:'Vertical position'
}:{
 topicTitle:'What would you like your poster to be about?',
 topicHelp:'Choose a word and express it with text, images or colors.',
 entryAnswer:'Correct squares: top left, top right and center',
 createHint:'Tap a square to add text, images or colors.',
 quick:'Quick fill',words:'Random text',colors:'Random colors',close:'Close',
 quickHelp:'Try new text while keeping your type sizes and styling. Every change can be undone.',
 noTargets:'No squares available to update.',
 changed:(kind,n)=>`Updated ${n} squares. Try another ${kind==='color'?'color':'text'} variation.`,
 upload:'＋ Upload images',reading:'Reading images…',
 imageHelp:'Use one image across the grid or in one square. Multiple images fill empty squares in order.',
 placement:'Where should this image go?', across:'Fill the grid', acrossHelp:'One image across the whole grid', one:'Fill one square', oneHelp:'Use the selected square', cancel:'Cancel', ink:'Text on images', auto:'Auto', black:'Black', white:'White',
 backgroundAdded:'Background added. Your existing content is preserved.',
 imageAdded:(n,extra)=>`Added ${n} images in grid order.${extra?` ${extra} images were not used.`:''}`,
 imageNoSpace:'No empty squares for images. Clear the squares you want to replace first.',
 imageChanged:'The poster changed. Please select your images again.',cellImageAdded:'Image added to this square. You can undo this.',
 crop:'Adjust crop',zoom:'Zoom',horizontal:'Horizontal',vertical:'Vertical'
};
const topicMeanings={design:'设计',humans:'人类',objects:'物品',words:'texts',images:'图像',art:'艺术',beauty:'美',value:'价值',meaning:'意义',emotion:'情感',memory:'记忆',truth:'真实',freedom:'自由',life:'生活',love:'爱','lucky number':'幸运数字'};
let quickFillOpen=false,quickFillMessage='',uploadMessage='',pendingImagePlacement=null,uploadTargetId=null;

entryHint=function(){return entryErrors>=3?workCopy.entryAnswer:journeyCopy.entryBody;};
const workspaceToastBase=toast;
toast=function(message,kind){
 if(stage==='entry'&&kind==='entry'){hideToast(true);renderJourney();return;}
 return workspaceToastBase(message,kind);
};

// Stable allocations are shared by all tool states. Opening a menu never resizes the paper.
fitJourneyPoster=function(){
 const shell=$('posterShell');if(!shell)return;
 const overview=stage==='entry'||stage==='edit';
 document.body.classList.toggle('journey-overview',overview);document.body.classList.add('paper-workspace');
 if(!overview){layoutTopicMenu();styleInline();return;}
 const viewport=window.visualViewport;
 if(mobileTyping()||document.body.classList.contains('keyboard-open')||(viewport&&viewport.scale>1.05))return;
 const css=getComputedStyle(document.documentElement),height=viewport?.height||innerHeight;
 const stageBox=shell.closest('.stage').getBoundingClientRect();
 document.documentElement.style.setProperty('--work-stage-left',stageBox.x+'px');
 document.documentElement.style.setProperty('--work-stage-width',stageBox.width+'px');
 const header=document.querySelector('.topbar')?.offsetHeight||52,banner=$('previewBanner')?.offsetHeight||0;
 const tools=parseFloat(css.getPropertyValue('--work-tools-height')),dockHeight=stage==='entry'?80:parseFloat(css.getPropertyValue('--work-dock-height'));
 const guideHeight=$('workspaceGuide')?.offsetHeight||76;
 const available=Math.max(150,height-header-banner-guideHeight-(stage==='entry'?dockHeight:tools+dockHeight)-24);
 shell.style.setProperty('--overview-poster-width',(available*W/H)+'px');
 $('workspaceGuide')?.style.setProperty('--overview-poster-width',(available*W/H)+'px');
 document.documentElement.style.setProperty('--journey-dock-height',dockHeight+'px');
 layoutTopicMenu();styleInline();
};
function showEmptyGridHint(s){return stage==='edit'&&step===3&&guidePhase==='content'&&!s.cells.some(filledCell)&&!posterMenu&&!editorOpen;}
let lastHintPulse=0;
renderJourney=function(){
 $('journeyGuide')?.remove();$('entryStepHint')?.remove();
 const shell=$('posterShell');if(!shell)return;
 let guide=$('workspaceGuide');
 if(!guide){guide=document.createElement('div');guide.id='workspaceGuide';guide.setAttribute('role','status');guide.setAttribute('aria-live','polite');shell.before(guide);}
 guide.hidden=stage!=='entry'&&!(stage==='edit'&&step===3);
 if(!guide.hidden){
  const title=stage==='entry'?journeyCopy.entryTitle:journeyCopy.createTitle;
  const hint=stage==='entry'?entryHint():quickFillOpen?quickFillMessage||workCopy.quickHelp:guidePhase==='topic'?workCopy.topicHelp:editorOpen&&editTab==='image'&&uploadMessage?uploadMessage:workCopy.createHint;
  const pulse=stage==='entry'&&entryErrors>0&&entryErrors<3;
  const body=pulse?esc(hint).replace(/design|设计节/g,word=>`<span class="hint-keyword">${word}</span>`):esc(hint);
  const count=stage==='edit'?state.cells.filter(filledCell).length:0;
  const progress=stage==='edit'?`<span class="workspace-count" aria-label="${journeyCopy.filled(count,state.cells.length)}" title="${journeyCopy.filled(count,state.cells.length)}">${editorOpen?(UI_LANGUAGE==='zh'?`方格 ${selected+1}`:`Square ${selected+1}`):`${count} / ${state.cells.length}`}</span>`:'';
  const html=`<div class="workspace-step-row"><span class="workspace-step">${title}</span>${progress}</div><span class="workspace-instruction">${body}</span>`;
  if(guide.dataset.contentKey!==html){guide.innerHTML=html;guide.dataset.contentKey=html;}
  if(pulse&&lastHintPulse!==entryErrors){
   lastHintPulse=entryErrors;
   guide.querySelectorAll('.hint-keyword').forEach(el=>{el.classList.remove('hint-pulse');void el.offsetWidth;el.classList.add('hint-pulse');});
  }
  if(stage!=='entry'||!entryErrors)lastHintPulse=0;
 }
 shell.querySelectorAll('.cell-hit').forEach((button,index)=>{
  const empty=showEmptyGridHint(state)&&index===0;button.classList.toggle('first-empty-square',empty);
  if(empty){button.dataset.emptyLabel=journeyCopy.add;button.setAttribute('aria-label',journeyCopy.add);}
 });
 const menu=shell.querySelector('.poster-menu.setup-menu');
 if(menu&&!menu.dataset.workExplained){
  menu.dataset.workExplained='true';const title=menu.querySelector('.setup-heading>span');if(title)title.textContent=workCopy.topicTitle;
  const note=document.createElement('p');note.className='topic-explanation';note.textContent=workCopy.topicHelp;menu.querySelector('.setup-heading')?.after(note);
 }
 scheduleJourneyFit();
};
completionControl=function(){
 let wrap=$('completionControl');if(!wrap){wrap=document.createElement('section');wrap.id='completionControl';document.body.append(wrap);}
 if(wrap.parentElement!==document.body)document.body.append(wrap);
 const visible=stage==='edit'&&step===3;wrap.hidden=!visible;wrap.classList.toggle('quick-fill-tools',quickFillOpen);
 if(!visible)return;
 const count=state.cells.filter(filledCell).length,ready=guidePhase==='content'&&!posterMenu;
 wrap.innerHTML=`<div class="workspace-tools-inner"><div class="creation-actions">${quickFillOpen?`<button id="fillEmptyWords">${workCopy.words}</button><button id="fillEmptyColors">${workCopy.colors}</button><button id="closeQuickFill">${workCopy.close}</button>`:`<button id="quickFill" ${ready?'':'disabled'}>${workCopy.quick}</button><button class="primary" id="finishCreation" ${ready&&count?'':'disabled'}>${journeyCopy.done}</button>`}</div></div>`;
 on('quickFill',openQuickFill);on('finishCreation',finishCreation);on('fillEmptyColors',()=>fillEmptySquares('color'));on('fillEmptyWords',()=>fillEmptySquares('text'));
 on('closeQuickFill',()=>{quickFillOpen=false;quickFillMessage='';render();});
};

// Text and color ownership are independent of typography, images and cropping.
// Markers travel with undo, drafts and moved squares.
function foregroundFilled(cell){return !!(cell.text.trim()||hasColorFill(cell)||(cell.asset&&!cell.rect));}
function automaticallyFilled(cell){
 return !!cell.autoText&&cell.autoText===cell.text||!!cell.autoColor&&hasColorFill(cell)&&cell.autoColor===cell.bg;
}
function quickTargets(kind='text'){
 return state.cells.filter(cell=>!cell.locked&&(!foregroundFilled(cell)||automaticallyFilled(cell)||kind==='text'&&!!cell.text.trim()));
}
const workspaceSanitizeBase=sanitizeBundle;
sanitizeBundle=function(data){
 const clean=workspaceSanitizeBase(data);
 clean.state.imageInk=['auto','black','white'].includes(data.state.imageInk)?data.state.imageInk:'auto';
 for(const key of ['cells','shelf'])clean.state[key].forEach((cell,index)=>{
  const source=data.state[key]?.[index];
  if(['#000000','#ffffff'].includes(source?.textInk))cell.textInk=source.textInk;
  let legacy=null;
  if(typeof source?.autoFill==='string'&&source.autoFill.length<2048){try{const value=JSON.parse(source.autoFill);if(Array.isArray(value))legacy=value;}catch{}}
  if(cell.text&&(source?.autoText===cell.text||legacy?.[0]===cell.text))cell.autoText=cell.text;
  if(hasColorFill(cell)&&(source?.autoColor===cell.bg||legacy?.[2]===cell.bg&&legacy?.[3]===true))cell.autoColor=cell.bg;
 });
 return clean;
};
openQuickFill=function(){
 finishInline();editorOpen=false;posterMenu=null;quickFillOpen=true;quickFillMessage='';
 render();
};
function shuffled(values){const list=[...values];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
const themeWords={
 design:[['designer','layout','shape','studio','pattern','poster','rhythm','balance','letter','colour'],['设计师','构图','字体','造型','版式','创意']],
 humans:[['people','teacher','parent','artist','friend','dancer','singer','writer','doctor','child','woman','family'],['男人','女人','孩子','设计师','艺术家','朋友']],
 objects:[['chair','bottle','notebook','table','mirror','basket','pencil','vessel','clock','candle'],['椅子','杯子','书','灯','钥匙','桌子']],
 words:[['hello','story','letter','voice','poetry','phrase','script','dialogue','chapter','writing'],['你好','故事','诗','字母','名字','语言']],
 images:[['photo','portrait','picture','pixel','frame','camera','collage','capture','vision','shadow'],['照片','肖像','画面','像素','镜头','相机']],
 art:[['artist','painting','sculpture','gallery','colour','brush','canvas','mural','drawing','exhibit'],['艺术家','绘画','雕塑','画廊','墨','画笔']],
 beauty:[['bloom','grace','harmony','light','flower','elegance','texture','radiance','wonder','delight'],['花朵','优雅','和谐','光','绽放','美丽']],
 value:[['worth','caring','trust','giving','craft','respect','quality','kindness','effort','purpose'],['价值','关怀','时间','信任','给予','匠心']],
 meaning:[['purpose','reason','concept','symbol','story','intent','message','insight','context','belief'],['目的','为什么','想法','符号','故事','理由']],
 emotion:[['delight','sadness','feeling','hopeful','anger','peace','wonder','warmth','sorrow','passion'],['喜悦','悲伤','害怕','希望','愤怒','平静']],
 memory:[['childhood','yesterday','remember','diary','moment','keepsake','echoes','archive','reunion','recall'],['童年','家','昨天','记得','日记','往事']],
 truth:[['honest','proof','evidence','sincere','reality','clarity','factual','witness','verify','belief'],['事实','诚实','真实','证据','真相','真诚']],
 freedom:[['choice','flight','wings','horizon','liberty','wander','explore','release','beyond','journey'],['开放','飞翔','选择','天空','旷野','翅膀']],
 life:[['growth','breathe','birth','seedling','alive','everyday','nature','living','seasons','garden'],['生长','呼吸','诞生','种子','生命','日常']],
 love:[['heart','together','caring','embrace','beloved','tender','affection','devotion','warmth','dearest'],['心','一起','亲吻','关爱','亲爱的','拥抱']],
 'lucky number':[['7','8','13','66','88','360'],['7','8','13','66','88','360']]
};
function topicWordSet(topic){
 const raw=String(topic).trim(),key=raw.toLowerCase();
 const alias={human:'humans',people:'humans',object:'objects',word:'words',image:'images','人':'humans','人物':'humans','幸运数字':'lucky number'};
 const translated=Object.keys(topicMeanings).find(k=>topicMeanings[k]===raw);
 const name=alias[key]||translated||key;
 return {name,words:themeWords[name]?.[/[\u3400-\u9fff]/.test(raw)?1:0]||[raw]};
}
// Give three- and four-digit values enough weight to fill the poster rhythmically.
function randomPosterNumber(){
 const roll=Math.random(),digits=roll<.15?1:roll<.35?2:roll<.65?3:4;
 const lower=digits===1?0:10**(digits-1),upper=10**digits;
 return String(lower+Math.floor(Math.random()*(upper-lower)));
}
function wordVariation(count,retained=[]){
 if(!count)return [];
 const theme=topicWordSet(state.topic),symbols=['+','=','?','!','&','/','%','×'];
 const key=value=>String(value).trim().toLowerCase(),used=new Map();
 for(const value of retained){const k=key(value);if(k)used.set(k,(used.get(k)||0)+1);}
 const remember=value=>{const k=key(value);used.set(k,(used.get(k)||0)+1);return value;};
 const unique=values=>[...new Map(values.map(value=>[key(value),value])).values()];
 const words=unique(uniformWordPool(theme.words));
 const neutral=unique(uniformWordPool((/[\u3400-\u9fff]/.test(state.topic)?['石头','云朵','金属','电梯','窗户','杯子','河流','山谷','森林','沙滩']:['stone','cloud','metal','window','bottle','river','valley','forest','marble','silver','ocean','planet']).filter(value=>!theme.words.some(word=>key(word)===key(value)))));
 // Only large grids may reuse a word, after the available alternatives have been used.
 const take=(pool,repeat=false)=>{
  let choices=pool.filter(value=>!used.has(key(value)));
  if(!choices.length&&repeat&&state.cells.length>16)choices=pool.filter(value=>used.get(key(value))<2);
  return choices.length?remember(choices[Math.floor(Math.random()*choices.length)]):null;
 };
 const number=()=>{
  for(let attempt=0;attempt<20;attempt++){const value=randomPosterNumber();if(!used.has(key(value)))return remember(value);}
  for(let value=0;value<10000;value++)if(!used.has(String(value)))return remember(String(value));
 };
 let symbolSlots=Math.max(0,Math.max(1,Math.floor(state.cells.length/4))-retained.filter(value=>/^[\p{P}\p{S}]+$/u.test(key(value))).length);
 const symbol=()=>{if(!symbolSlots)return null;const value=take(symbols);if(value!==null)symbolSlots--;return value;};
 const related=count===1?1:Math.min(count-1,8,1+Math.floor(Math.random()*Math.max(1,Math.ceil(count/4))));
 const targets=new Set(shuffled(Array.from({length:count},(_,i)=>i)).slice(0,related));
 return Array.from({length:count},(_,i)=>{
  if(targets.has(i))return theme.name==='lucky number'?number():take(words,true)??number();
  if(Math.random()<.25){const value=symbol();if(value!==null)return value;}
  if(theme.name==='words'||theme.name!=='lucky number'&&Math.random()<.5)return number();
  return take(neutral,true)??number();
 });
}
fillEmptySquares=function(kind){
 finishInline();
 const targets=quickTargets(kind);if(!targets.length){quickFillMessage=workCopy.noTargets;renderPanel();return;}
 let words;if(kind!=='color'){
  const targetSet=new Set(targets),retained=state.cells.filter(cell=>!targetSet.has(cell)).map(cell=>cell.text);
  let unchanged=Infinity;
  for(let attempt=0;attempt<5;attempt++){
   const variation=wordVariation(targets.length,retained),same=variation.filter((word,i)=>word===targets[i].text).length;
   if(same<unchanged){words=variation;unchanged=same;}if(!unchanged)break;
  }
 }
 commit(()=>{
  const pool=randomColorPool();
  targets.forEach((cell,index)=>{
   if(kind==='color'){
    const different=pool.filter(color=>color!==cell.bg),choices=different.length?different:pool;
    colorCell(cell,choices[Math.floor(Math.random()*choices.length)]);
    cell.autoColor=cell.bg;
   }else{
    cell.text=words[index];cell.type=isNumeric(cell.text)?'number':'text';
    cell.autoText=cell.text;
   }
   delete cell.autoFill;
  });
 });
 quickFillMessage=workCopy.changed(kind,targets.length);renderPanel();renderJourney();
 $(kind==='color'?'fillEmptyColors':'fillEmptyWords')?.focus({preventScroll:true});
};

const workspaceGoBase=go;
go=function(n){if(stage==='entry'&&n===1)entryErrors=0;quickFillOpen=false;quickFillMessage='';return workspaceGoBase(n);};
const workspaceCellBase=cellClick;
cellClick=function(index){quickFillOpen=false;quickFillMessage='';pendingImagePlacement=null;uploadMessage='';return workspaceCellBase(index);};
const workspaceMenuBase=toggleMenu;
toggleMenu=function(kind){quickFillOpen=false;quickFillMessage='';return workspaceMenuBase(kind);};
const workspaceFinishBase=finishCreation;
finishCreation=function(){quickFillOpen=false;return workspaceFinishBase();};
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&quickFillOpen){quickFillOpen=false;quickFillMessage='';render();}});

// Background slices do not consume foreground image slots. The DOM FileList
// order maps directly to row-major grid positions; no shuffle occurs here.
function imageSlots(){return state.cells.map((cell,index)=>!cell.locked&&!foregroundFilled(cell)?index:-1).filter(index=>index>=0);}
fillImages=function(ids){
 const slots=imageSlots();ids.slice(0,slots.length).forEach((id,k)=>{
  const old=state.cells[slots[k]];
  state.cells[slots[k]]=Object.assign(blank(),{id:old.id,type:'image',asset:id});
 });
 return Math.min(ids.length,slots.length);
};
chooseFiles=function(mode='auto'){
 finishInline();uploadMode=mode;uploadTargetId=state.cells[selected]?.id;
 $('fileInput').multiple=mode==='auto'||mode==='multi';$('fileInput').value='';$('fileInput').click();
};
function applyImagePlacement(mode,placement){
 const {ids,targetId,originalState,dimensions,total}=placement;
 if(state!==originalState||`${state.cols}x${state.rows}`!==dimensions||stage!=='edit'){pendingImagePlacement=null;uploadMessage=workCopy.imageChanged;renderPanel();return;}
 const index=state.cells.findIndex(cell=>cell.id===targetId);
 if(mode==='replace'&&(index<0||state.cells[index].locked))return;
 let used=0;pendingImagePlacement=null;
 commit(()=>{
  if(mode==='whole'){state.whole={asset:ids[0],px:.5,py:.5,zoom:1,split:false};state.imageInk='auto';updateSlices(true);used=1;}
  else if(mode==='replace'){
   const old=state.cells[index];state.cells[index]=Object.assign(blank(),{id:old.id,type:'image',asset:ids[0],text:old.text,size:old.size,align:old.align});selected=index;used=1;
  }else used=fillImages(ids);
 });
 uploadMessage=mode==='whole'?workCopy.backgroundAdded:mode==='replace'?workCopy.cellImageAdded:workCopy.imageAdded(used,total-used);
 editTab='image';editorOpen=true;posterMenu=null;quickFillOpen=false;render();
}
upload=async function(files){
 const all=[...files];if(!all.length||uploadPending||uploadBusy)return;
 const mode=uploadMode==='auto'?(all.length===1?'choose':'multi'):uploadMode;
 const capacity=mode==='multi'?imageSlots().length:1;
 if(!capacity){uploadMessage=workCopy.imageNoSpace;renderPanel();return;}
 const originalState=state,dimensions=`${state.cols}x${state.rows}`,targetId=uploadTargetId||state.cells[selected]?.id;
 uploadPending=true;uploadBusy=true;uploadMessage='';pendingImagePlacement=null;renderPanel();
 try{
  if(!await requireIdentity()||!previewModeration())return;
  const ids=[];for(const file of all.slice(0,capacity))ids.push(await readFile(file,mode==='choose'?'whole':mode));
  if(state!==originalState||`${state.cols}x${state.rows}`!==dimensions||stage!=='edit')throw Error(workCopy.imageChanged);
  const placement={ids,targetId,originalState,dimensions,total:all.length};
  applyImagePlacement(mode==='choose'?'whole':mode,placement);
 }catch(error){uploadMessage=error.message||workCopy.imageChanged;}
 finally{uploadPending=false;uploadBusy=false;renderPanel();}
};

const workspaceEditorBase=editorMarkup;
editorMarkup=function(){
 let html=workspaceEditorBase();
 html=html.replace(/<button id="(?:randomOneNumber|randomNumbers|randomOneColor|randomAllColors)"[^>]*>[\s\S]*?<\/button>/g,'').replace(/<div class="tool-actions">\s*<\/div>/g,'');
 if(editTab!=='image')return html;
 const actions=html.indexOf('<div class="tool-actions">');if(actions>=0)html=html.slice(0,actions);
 const cell=state.cells[selected];
 if(pendingImagePlacement){
  html=`<div class="image-placement"><div class="placement-heading"><p>${workCopy.placement}</p><button class="placement-cancel" id="cancelPlacement" aria-label="${workCopy.cancel}">×</button></div><div class="placement-options"><button id="placeAcross"><span>${workCopy.across}</span><small>${workCopy.acrossHelp}</small></button><button id="placeSingle" ${cell.locked?'disabled':''}><span>${workCopy.one}</span><small>${workCopy.oneHelp}</small></button></div></div>`;
  return html;
 }
 html+=`<div class="tool-actions image-upload-action"><button id="uploadImages" ${uploadBusy?'disabled':''}>${uploadBusy?workCopy.reading:workCopy.upload}</button></div>`;
 if(!cell.asset&&!state.whole)html+=`<p class="image-capacity-hint">${workCopy.imageHelp}</p>`;
 if(cell.asset||state.whole){
  html+=`<div class="image-ink"><span>${workCopy.ink}</span><div>${[['auto',workCopy.auto],['black',workCopy.black],['white',workCopy.white]].map(([key,label])=>`<button data-image-ink="${key}" aria-pressed="${(state.imageInk||'auto')===key}">${label}</button>`).join('')}</div></div>`;
 }
 if(cell.asset){
  const a=cell.rect&&state.whole&&!state.whole.split?state.whole:cell;
  html+=`<details><summary>${workCopy.crop}</summary>${[['cropZoom',workCopy.zoom,1,3,.05,a.zoom],['cropX',workCopy.horizontal,0,1,.01,a.px],['cropY',workCopy.vertical,0,1,.01,a.py]].map(([id,label,min,max,step,value])=>`<label class="field"><span>${label}</span><input id="${id}" aria-label="${label}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`).join('')}</details>`;
 }
 return html;
};
const workspaceBindBase=bindSimpleEditor;
bindSimpleEditor=function(){
 workspaceBindBase();on('uploadImages',()=>chooseFiles('auto'));
 on('placeAcross',()=>applyImagePlacement('whole',pendingImagePlacement));on('placeSingle',()=>applyImagePlacement('replace',pendingImagePlacement));
 on('cancelPlacement',()=>{pendingImagePlacement=null;renderPanel();});
 const close=$('closeEditor');if(close)close.addEventListener('click',()=>{pendingImagePlacement=null;});
 $('panel').querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{pendingImagePlacement=null;}));
 $('panel').querySelectorAll('[data-image-ink]').forEach(button=>button.onclick=()=>commit(()=>{state.imageInk=button.dataset.imageInk;state.cells.forEach(cell=>delete cell.textInk);}));
 $('panel').querySelectorAll('[data-text-color]').forEach(button=>button.onclick=()=>{finishInline();commit(()=>{state.cells[selected].textInk=button.dataset.textColor;state.cells[selected].fg=button.dataset.textColor;});});
};

// Image ink is derived from the displayed crop. Rendering never changes the document.
const imageInkCache=new Map();
const linearChannel=Array.from({length:256},(_,v)=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
function relativeLight(r,g,b){return .2126*linearChannel[r]+.7152*linearChannel[g]+.0722*linearChannel[b];}
function brighterInk(light){return (1.05/(light+.05))>((light+.05)/.05)?'#ffffff':'#000000';}
contrastText=function(color){const h=String(color||'#ffffff').slice(1);return brighterInk(relativeLight(parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)));};
function imageInk(s,placement,whole=false){
 const source=assets[placement.asset];if(!source)return '#000000';
 const picture=img(source);if(!picture.complete||!picture.naturalWidth)return '#000000';
 const mask=whole?s.cells.map(c=>hasColorFill(c)||!!(c.asset&&!c.rect)):null;
 const key=JSON.stringify([placement.asset,placement.zoom,placement.px,placement.py,placement.rect||null,s.gray,whole,s.cols,s.rows,mask]);
 if(imageInkCache.has(key))return imageInkCache.get(key);
 const sample=document.createElement('canvas');sample.width=96;sample.height=Math.round(96*(G.h/G.w)*(whole?1:s.cols/s.rows));
 const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#ffffff';ctx.fillRect(0,0,sample.width,sample.height);
 ctx.filter=s.gray?'grayscale(1)':'none';cover(ctx,picture,0,0,sample.width,sample.height,placement.zoom,placement.px,placement.py,placement.rect);
 const pixels=ctx.getImageData(0,0,sample.width,sample.height).data;let white=0,total=0;
 for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){
  if(mask&&mask[Math.min(s.rows-1,Math.floor(y/sample.height*s.rows))*s.cols+Math.min(s.cols-1,Math.floor(x/sample.width*s.cols))])continue;
  const i=(y*sample.width+x)*4;white+=brighterInk(relativeLight(pixels[i],pixels[i+1],pixels[i+2]))==='#ffffff'?1:0;total++;
 }
 const ink=total&&white>total/2?'#ffffff':'#000000';
 if(imageInkCache.size>128)imageInkCache.clear();imageInkCache.set(key,ink);return ink;
}
function effectiveTextColor(s,cell){
 if(cell.textInk==='#000000'||cell.textInk==='#ffffff')return cell.textInk;
 if(hasColorFill(cell))return contrastText(cell.bg);
 const background=s.whole&&!s.whole.split?s.whole:null;
 if(!cell.asset&&!background)return cell.fg||'#000000';
 if(s.imageInk==='white')return '#ffffff';if(s.imageInk==='black')return '#000000';
 if(background&&(!cell.asset||cell.rect))return imageInk(s,background,true);
 return cell.asset?imageInk(s,cell):cell.fg||'#000000';
}
function uniformWordPool(words){
 const ctx=$('poster').getContext('2d'),w=G.w/state.cols,h=G.h/state.rows;
 const fits=word=>{
  const m=textLayout(ctx,word,w,h,isNumeric(word)?'number':'text',1);
  const canonical=w*(/[\u3400-\u9fff]/.test(word)?.4774:state.cols===2?.5404:.5402);
  return Math.abs(m.fs-canonical)<.01;
 };
 const pool=words.filter(fits);if(pool.length)return pool;
 // Only generated suggestions can be abbreviated; hand-entered content is untouched.
 let word=String(words[0]||'?');while(word.length>1&&!fits(word+'…'))word=word.slice(0,-1);
 return [fits(word+'…')?word+'…':word];
}

// 2.7: concise guidance, compact phone layout and a single-row shortcut palette.
const ui270=(zh,en)=>UI_LANGUAGE==='zh'?zh:en;
function icon270(id,label,kind,disabled=false){const paths={undo:'<path d="M9 7 4 11l5 4M4 11h9a5 5 0 1 1 0 10"/>',clear:'<path d="m4 17 9-12 7 6-7 10H8l-4-4Zm4-5 7 6M13 21h8"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',back:'<path d="m11 5-7 7 7 7M4 12h16"/>'};return `<button id="${id}" class="icon-action" ${disabled?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[kind]}</svg><span>${label}</span></button>`;}
document.body.classList.add('layout270','paper-workspace');
function invalidate270(){state.answer=[];confirmedPosterSignature='';shareCache=null;scheduleSave();}
function closeTools270(){finishInline();pendingImagePlacement=null;editorOpen=false;quickFillOpen=false;render();}
function backToEdit270(){finishInline();stage='edit';step=3;guidePhase='content';editorOpen=false;posterMenu=null;quickFillOpen=false;render();}
finishCreation=function(){quickFillOpen=false;finishPoster();};
let restoreWorkScroll270=false;
finishMobileText=function(){finishInline();editorOpen=true;editTab='text';posterMenu=null;restoreWorkScroll270=true;render();setTimeout(()=>{mobileViewport();scheduleJourneyFit();},180);};
mobileInputBar=function(){$('mobileInputBar')?.remove();};
mobileEnsureCell=function(){if(!mobileTyping())return;const vp=window.visualViewport,top=(vp?.offsetTop||0)+workspaceTop270(),dock=document.body.classList.contains('keyboard-open')?0:($('mobileDock')?.getBoundingClientRect().height||56),bottom=(vp?.offsetTop||0)+(vp?.height||innerHeight)-48-dock;const delta=mobileCellScroll($('inlineText').getBoundingClientRect(),top,bottom);if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:'instant'});};
ensureCellVisible=function(){
 if(mobileLayout()){mobileEnsureCell();return;}
 const el=$('inlineText');if(!el||document.activeElement!==el)return;
 const vp=window.visualViewport,rect=el.getBoundingClientRect(),top=(vp?.offsetTop||0)+workspaceTop270();
 let bottom=(vp?.offsetTop||0)+(vp?.height||innerHeight)-12;
 const dock=$('mobileDock')?.getBoundingClientRect(),panel=$('panel')?.getBoundingClientRect();
 if(dock?.height)bottom=Math.min(bottom,dock.top-12);
 // A side panel does not cover the poster; only overlapping tools reduce its visible area.
 if(panel?.height&&panel.left<rect.right&&panel.right>rect.left)bottom=Math.min(bottom,panel.top-12);
 const delta=mobileCellScroll(rect,top,bottom);
 if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:'smooth'});
};

function syncEditCorners270(){
 $('hotspots')?.querySelectorAll('.cell-hit').forEach((button,i)=>button.classList.toggle('focused',stage==='edit'&&editorOpen&&!posterMenu&&i===selected&&!state.cells[i]?.text.trim()));
}
const hits270=hits;
hits=function(){hits270();syncEditCorners270();};
const journey270=renderJourney;
let entryHintCount270=0,entryHintDeadline270=0,entryHintTimer270=null,lastFitWidth270=0;
entryHint=function(){return entryErrors>=3?ui270('请选择左上、右上和中间的3个格子','Choose the top-left, top-right and center squares'):ui270('点击包含「design」和「设计节」的3个格子','Tap 3 “design” / “设计节” squares');};
function entryHintVisible270(){
 if(stage!=='entry'||entryErrors===0){
  clearTimeout(entryHintTimer270);entryHintTimer270=null;entryHintCount270=0;entryHintDeadline270=0;return false;
 }
 if(entryErrors!==entryHintCount270){
  clearTimeout(entryHintTimer270);entryHintCount270=entryErrors;entryHintDeadline270=Date.now()+4000;
  entryHintTimer270=setTimeout(()=>{if(stage==='entry'&&Date.now()>=entryHintDeadline270)$('screenPrompt').hidden=true;},4000);
 }
 return Date.now()<entryHintDeadline270;
}
renderJourney=function(){
 journey270();
 const guide=$('workspaceGuide');if(!guide)return;
 guide.hidden=!['entry','edit','answer','result'].includes(stage);
 let hint=stage==='entry'?entryHint():stage==='answer'?ui270(`第三步：选择代表「${state.topic}」的格子。`,`Step 3: Select squares that represent “${state.topic}”.`):stage==='result'?ui270('海报已完成，可以保存或分享。','Your poster is ready to save or share.'):guidePhase==='topic'?workCopy.topicHelp:ui270('第二步：点击格子，添加文字、图片或颜色。','Step 2: Add text, images or colors to a square.');
 if(stage==='entry')hint=ui270('第一步：','Step 1: ')+hint;
 const number=stage==='entry'?1:stage==='edit'?2:3;
 guide.innerHTML=`<strong>${number} / 3</strong><span>${esc(hint)}</span>`;
 if(stage==='entry'&&entryErrors>0&&entryErrors<3){guide.lastElementChild.innerHTML=esc(hint).replace(/design|设计节/g,w=>`<span class="hint-keyword hint-pulse">${w}</span>`);}
 let prompt=$('screenPrompt');if(!prompt){prompt=document.createElement('div');prompt.id='screenPrompt';prompt.setAttribute('role','status');document.body.append(prompt);}
 const entryVisible=entryHintVisible270();
 prompt.hidden=!(stage==='answer'||entryVisible);
 prompt.textContent=stage==='entry'?entryHint():ui270(`已选择 ${picks.size} 格 · 至少选择 1 格`,`Selected ${picks.size} · Choose at least 1 square`);
 const promptParent=stage==='entry'?$('posterShell'):document.body;
 if(prompt.parentElement!==promptParent)promptParent.append(prompt);
 syncEditCorners270();
 document.body.classList.toggle('has-editor',stage==='edit'&&editorOpen&&!posterMenu);
 scheduleJourneyFit();
};
function workspaceTop270(){
 const css=getComputedStyle(document.documentElement),gap=parseFloat(css.getPropertyValue('--work-guide-gap'))||0;
 return ($('workspaceGuide')?.getBoundingClientRect().bottom||92)+gap;
}
function fitEntryHints270(){
 if(stage!=='entry')return;
 for(const el of [$('workspaceGuide')?.lastElementChild,$('screenPrompt')]){
  if(!el||el.hidden)continue;
  el.style.fontSize='13px';el.style.letterSpacing='-.1px';
  const css=getComputedStyle(el),available=el.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
  if(available<=0)continue;
  const range=document.createRange();range.selectNodeContents(el);
  const natural=range.getBoundingClientRect().width;
  // Measure the full text (including highlighted words), so no character is clipped.
  if(natural>available)el.style.fontSize=(Math.floor(13*available/natural*20)/20)+'px';
 }
}
function wideWorkspace270(paperWidth){
 // Reserve the same space on either side so the paper itself remains centered.
 return ['edit','answer','result'].includes(stage)&&matchMedia('(min-width:1100px) and (min-aspect-ratio:6/5)').matches&&innerWidth>=paperWidth+2*(340+24+16);
}
function positionFeedback270(){
 const shell=$('posterShell');if(!shell)return;
 const paper=shell.getBoundingClientRect(),root=document.documentElement;
 const viewport=window.visualViewport,height=viewport?.height||innerHeight,offset=viewport?.offsetTop||0;
 const dock=$('mobileDock'),dockHeight=dock?.getBoundingClientRect().height||56;
 const bottom=Math.min(Math.max(dockHeight+8,innerHeight-paper.bottom+16),Math.max(dockHeight+8,innerHeight-offset-120));
 root.style.setProperty('--poster-center270',(paper.left+paper.width/2)+'px');
 root.style.setProperty('--poster-right270',paper.right+'px');
 root.style.setProperty('--poster-tools-width270',Math.max(480,paper.width)+'px');
 root.style.setProperty('--poster-feedback-width270',Math.max(180,Math.min(paper.width-32,innerWidth-40))+'px');
 root.style.setProperty('--poster-toast-bottom270',Math.max(bottom,innerHeight-offset-height+16)+'px');
 const prompt=$('screenPrompt');
 if(stage==='answer'&&prompt&&!prompt.hidden&&document.body.classList.contains('wide-workspace')){
  root.style.setProperty('--answer-actions-top270',(prompt.getBoundingClientRect().bottom+12)+'px');
 }
}
let feedbackFrame270=0;
window.addEventListener('scroll',()=>{cancelAnimationFrame(feedbackFrame270);feedbackFrame270=requestAnimationFrame(positionFeedback270);},{passive:true});
fitJourneyPoster=function(){
 const shell=$('posterShell');if(!shell)return;
 document.body.classList.add('journey-overview','paper-workspace');
 const editing=stage==='edit'&&editorOpen&&!posterMenu;
 document.body.classList.toggle('has-editor',editing);
 const vp=window.visualViewport,widthChanged=lastFitWidth270!==innerWidth;
 if(vp?.scale>1.05||!widthChanged&&(mobileTyping()||document.body.classList.contains('keyboard-open'))){positionFeedback270();return;}
 lastFitWidth270=innerWidth;
 if(restoreWorkScroll270){restoreWorkScroll270=false;window.scrollTo({top:0,behavior:'instant'});}
 const height=vp?.height||innerHeight;
 const css=getComputedStyle(document.documentElement);
 const top=workspaceTop270();
 document.documentElement.style.setProperty('--work-top',top+'px');
 // The rendered dock already includes the safe-area inset; reserve it only once.
 const dockHeight=$('mobileDock')?.getBoundingClientRect().height||56;
 const actionHeight=parseFloat(css.getPropertyValue('--work-action-height'))||68;
 const paperGap=parseFloat(css.getPropertyValue('--work-paper-gap'))||16;
 const minWidth=['edit','answer','result'].includes(stage)?Math.max(210,state.cols*38*W/G.w):210;
 const wideWidth=Math.min(700,Math.max(minWidth,(height-top-dockHeight-paperGap)*W/H));
 const wide=wideWorkspace270(wideWidth);
 document.body.classList.toggle('wide-workspace',wide);
 syncPalette270();
 const panelHeight=editing||stage==='result'?$('panel').getBoundingClientRect().height:0;
 // Every wide stage shares the same paper size; its controls occupy the rail.
 const bottom=wide?dockHeight:editing||stage==='result'?panelHeight+dockHeight:stage==='entry'?dockHeight:dockHeight+actionHeight;
 document.documentElement.style.setProperty('--reserved270',bottom+'px');
 const availableW=Math.min(700,Math.min(innerWidth,1200)-32);
 const availableH=Math.max(120,height-top-bottom-paperGap);
 const minPaper=Math.min(availableW,minWidth);
 const width=Math.min(availableW,Math.max(minPaper,availableH*W/H));
 document.documentElement.style.setProperty('--paper-width270',width+'px');
 shell.style.setProperty('--overview-poster-width',width+'px');
 fitEntryHints270();
 positionFeedback270();
 document.body.classList.toggle('paper-scroll270',width*H/W>availableH+1);
 layoutTopicMenu();styleInline();
};
completionControl=function(){
 let wrap=$('completionControl');if(!wrap){wrap=document.createElement('section');wrap.id='completionControl';document.body.append(wrap);}
 if(wrap.parentElement!==document.body)document.body.append(wrap);
 wrap.hidden=!(stage==='edit'&&step===3&&!editorOpen&&!posterMenu);
 if(wrap.hidden)return;
 wrap.classList.toggle('quick-fill-tools',quickFillOpen);
 wrap.innerHTML=`<div class="workspace-tools-inner"><div class="creation-actions">${quickFillOpen?`<button id="fillEmptyWords">${workCopy.words}</button><button id="fillEmptyColors">${workCopy.colors}</button><button id="closeQuickFill">${workCopy.close}</button>`:`<button id="quickFill">${workCopy.quick}</button><button id="finishCreation" class="primary" ${state.cells.some(filledCell)?'':'disabled'}>${ui270('设置答案','Set answer')}</button>`}</div></div>`;
 on('quickFill',openQuickFill);on('finishCreation',finishCreation);on('fillEmptyWords',()=>fillEmptySquares('text'));on('fillEmptyColors',()=>fillEmptySquares('color'));on('closeQuickFill',()=>{quickFillOpen=false;render();});
};
updateDock=function(){
 let d=$('mobileDock');if(!d){d=document.createElement('div');d.id='mobileDock';document.body.append(d);}
 d.classList.toggle('entry-dock',stage==='entry');
 if(stage==='entry'){
  d.innerHTML=`<button id="dockConfirm" class="primary pill" ${entryPicks.size===3?'':'disabled'}>${entryPicks.size===3?ui270('确认选择','Confirm selection'):ui270(`请选择 ${entryPicks.size} / 3`,`Select ${entryPicks.size} / 3`)}</button>`;
  on('dockConfirm',()=>$('initialConfirm')?.click());
 }else if(stage==='edit'){
  d.innerHTML=icon270('dockUndo',ui270('撤回','Undo'),'undo',!historyStack.length)+icon270('dockClear',ui270('清除','Clear'),'clear')+icon270('more',ui270('更多','More'),'more');
  on('dockUndo',()=>{finishInline();pendingImagePlacement=null;undo();});on('dockClear',clearMenu);on('more',moreMenu);
 }else if(stage==='answer'){
  d.innerHTML=`<div class="answer-actions270">${!isGuest?`<button id="dockBack">${ui270('返回编辑','Back to edit')}</button>`:''}<button class="primary" id="dockAnswer" ${picks.size&&!exportBusy270?'':'disabled'}>${exportBusy270?ui270('正在生成…','Creating…'):isGuest?ui270('完成','Finish'):ui270('完成创作','Finish creation')}</button></div>`;
  on('dockBack',backToEdit270);on('dockAnswer',submitAnswer);
 }else if(stage==='result'){
  d.innerHTML=(isGuest?'':icon270('dockBack',ui270('返回编辑','Back to edit'),'back'))+icon270('more',ui270('更多','More'),'more');
  on('dockBack',backToEdit270);on('more',moreMenu);
 }else d.innerHTML='';
 d.classList.toggle('has-preview-return',!!previewCreator);
 if(previewCreator){
  d.insertAdjacentHTML('afterbegin',icon270('previewBack',ui270('返回我的海报','My poster'),'back'));
  $('previewBack').setAttribute('aria-label',ui270('返回我的海报','Back to my poster'));
  $('previewBack').title=ui270('返回我的海报','Back to my poster');
  on('previewBack',previewReturnCreator);
 }
 completionControl();renderJourney();
};
previewBanner=function(){$('previewBanner')?.remove();updateDock();};

// Empty palettes are intentional. Palette edits do not alter painted squares.
palette=function(){if(!Array.isArray(state.palette))state.palette=[...defaultPalette];return state.palette;};
randomColorPool=function(){return [...palette()];};
// Cache a sample for the editing session. Rendering and selecting cells never reshuffle it.
let paletteSampleKey270=null,paletteSampleIndices270=[];
function visiblePalette270(){
 const colors=palette(),key=JSON.stringify(colors);
 if(key!==paletteSampleKey270){
  const unique=colors.map((value,index)=>({value,index})).filter((item,index,all)=>all.findIndex(other=>other.value===item.value)===index);
  const indices=unique.map(item=>item.index);
  paletteSampleIndices270=indices.length<=6?indices:shuffled(indices).slice(0,6).sort((a,b)=>a-b);
  paletteSampleKey270=key;
 }
 const indices=[...paletteSampleIndices270],cell=state.cells[selected];
 const active=hasColorFill(cell)?colors.indexOf(cell.bg):-1;
 if(active>=0&&!indices.includes(active)){indices[indices.length-1]=active;indices.sort((a,b)=>a-b);}
 return indices.map(index=>({value:colors[index],index}));
}
function syncPalette270(){
 const row=$('panel')?.querySelector('.palette-row270');if(!row)return;
 const width=row.clientWidth-16,gap=8;
 // Always retain No fill and Edit palette. Smaller panels show fewer shortcuts.
 const capacity=Math.max(3,Math.min(6,Math.floor((width+gap)/(44+gap))-2));
 const items=[...row.querySelectorAll('.palette-item270')].filter(item=>item.querySelector('[data-color]'));
 const shown=items.slice(0,capacity),active=items.find(item=>item.querySelector('[aria-pressed=true]'));
 if(active&&!shown.includes(active))shown[shown.length-1]=active;
 items.forEach(item=>item.hidden=!shown.includes(item));
 const columns=shown.length+2;
 row.style.setProperty('--palette-columns270',columns);
 row.style.setProperty('--palette-width270',Math.min(64,(width-gap*(columns-1))/columns)+'px');
}
const fill270=fillEmptySquares;
fillEmptySquares=function(kind){if(kind==='color'&&!palette().length){toast(ui270('色板为空，请先添加一种颜色。','Add a color to the empty palette first.'));editPalette();return;}fill270(kind);if(quickFillMessage)toast(quickFillMessage);};
function paletteChange270(fn){checkpoint();fn();scheduleSave();renderPanel();}
editPalette=function(){
 const p=palette();
 modal(`<h2>${ui270('编辑色板','Edit palette')}</h2><div class="palette-edit270">${p.map((v,i)=>`<div class="palette-edit-item270"><input type="color" data-palette-index="${i}" aria-label="${ui270('编辑颜色','Edit color')} ${i+1}" value="${v}"><button data-palette-delete="${i}" aria-label="${ui270('删除颜色','Delete color')} ${i+1}">${ui270('删除','Delete')}</button></div>`).join('')}<label class="palette-add270" aria-disabled="${p.length>=9}" title="${p.length>=9?ui270('最多保存 9 色','Maximum 9 colors'):ui270('添加颜色','Add color')}"><span aria-hidden="true">＋</span><input id="newPaletteColor" type="color" value="#ed3833" aria-label="${ui270('添加颜色','Add color')}" ${p.length>=9?'disabled':''}></label></div><div class="tool-actions"><button id="resetPalette">${ui270('默认色板','Default palette')}</button><button id="finishPalette" class="primary">${ui270('完成','Done')}</button></div>`);
 $('dialogBody').querySelectorAll('[data-palette-index]').forEach(input=>input.onchange=()=>{paletteChange270(()=>state.palette[+input.dataset.paletteIndex]=input.value);});
 $('dialogBody').querySelectorAll('[data-palette-delete]').forEach(b=>b.onclick=()=>{paletteChange270(()=>palette().splice(+b.dataset.paletteDelete,1));editPalette();});
 on('newPaletteColor',e=>{if(palette().length>=9)return;paletteChange270(()=>palette().push(e.target.value));editPalette();},'change');
 on('resetPalette',()=>{paletteChange270(()=>state.palette=[...defaultPalette]);editPalette();});on('finishPalette',()=>{$('dialog').close();renderPanel();});
};

function cropValues270(o){return {zoom:o?.zoom||1,px:o?.px??.5,py:o?.py??.5,imageInk:o?.imageInk||'auto'};}
function imageFields270(c){return {asset:c.asset,rect:c.rect?clone(c.rect):undefined,...cropValues270(c)};}
function putImageFields270(c,fields={}){delete c.asset;delete c.rect;delete c.imageInk;Object.assign(c,{zoom:1,px:.5,py:.5},fields);c.type=c.text.trim()?(isNumeric(c.text)?'number':'text'):c.asset?(c.rect?'slice':'image'):hasColorFill(c)?'color':'text';}
function activeImage270(){const c=state.cells[selected];return c?.asset&&!c.rect?{object:c,mode:'single',asset:c.asset}:state.whole&&!state.whole.split?{object:state.whole,mode:'whole',asset:state.whole.asset}:c?.asset?{object:c,mode:'single',asset:c.asset}:null;}
function rememberImage270(active){
 state.imageLayouts??={};let record=state.imageLayouts[active.asset];
 if(!record)record=state.imageLayouts[active.asset]={targetId:state.cells[selected].id,single:cropValues270(active.mode==='single'?active.object:null),whole:cropValues270(active.mode==='whole'?active.object:null),underlay:{},previousWhole:active.mode==='single'&&state.whole?clone(state.whole):null};
 if(active.mode==='single')record.targetId=active.object.id;
 record[active.mode]=cropValues270(active.object);return record;
}
function changePlacement270(mode){
 const active=activeImage270();if(!active||active.mode===mode)return;
 finishInline();commit(()=>{
  const record=rememberImage270(active);let target=state.cells.find(c=>c.id===record.targetId)||state.cells[selected];record.targetId=target.id;
  if(mode==='whole'){
   // Remove only this foreground image; preserve text, fills and other photographs.
   if(target.asset===active.asset&&!target.rect)putImageFields270(target,record.underlay);
   record.previousWhole=state.whole?clone(state.whole):null;
   state.whole={asset:active.asset,split:false,...record.whole};updateSlices(true);
  }else{
   if(state.whole?.asset===active.asset){
    state.cells.forEach(c=>{if(c.rect&&c.asset===active.asset)putImageFields270(c);});
    state.whole=record.previousWhole?clone(record.previousWhole):null;if(state.whole&&!state.whole.split)updateSlices(true);
   }
   target=state.cells.find(c=>c.id===record.targetId)||state.cells[selected];
   record.underlay=imageFields270(target);putImageFields270(target,{asset:active.asset,...record.single});
  }
  selected=Math.max(0,state.cells.findIndex(c=>c.id===record.targetId));
 });render();
}
applyImagePlacement=function(mode,placement){
 if(!placement)return;
 const {ids,targetId,originalState,dimensions,total}=placement;
 if(state!==originalState||`${state.cols}x${state.rows}`!==dimensions||stage!=='edit'){pendingImagePlacement=null;toast(workCopy.imageChanged);renderPanel();return;}
 const index=state.cells.findIndex(c=>c.id===targetId);if(index<0||state.cells[index].locked)return;
 let used=0;pendingImagePlacement=null;
 commit(()=>{
  if(mode==='whole'||mode==='replace'){
   selected=index;state.imageLayouts??={};
   state.imageLayouts[ids[0]]={targetId,single:cropValues270(),whole:cropValues270(),underlay:imageFields270(state.cells[index]),previousWhole:state.whole?clone(state.whole):null};
   if(mode==='whole'){state.whole={asset:ids[0],split:false,...cropValues270()};updateSlices(true);}
   else putImageFields270(state.cells[index],{asset:ids[0],...cropValues270()});
   used=1;
  }else used=fillImages(ids);
 });
 editTab='image';editorOpen=true;posterMenu=null;quickFillOpen=false;render();toast(mode==='whole'?workCopy.backgroundAdded:mode==='replace'?workCopy.cellImageAdded:workCopy.imageAdded(used,total-used));
};
function imagePlacement270(s,c){
 const whole=s.whole&&!s.whole.split?s.whole:null;
 return c.asset&&!c.rect?c:whole||c;
}
function hasManualInk270(s,c){
 if(['#000000','#ffffff'].includes(c.textInk))return true;
 const object=imagePlacement270(s,c);
 return !hasColorFill(c)&&!!object.asset&&['black','white'].includes(object.imageInk);
}
function localTextInk270(s,c){
 if(['#000000','#ffffff'].includes(c.textInk))return c.textInk;
 if(hasColorFill(c))return contrastText(c.bg);
 const whole=s.whole&&!s.whole.split?s.whole:null,object=c.asset&&!c.rect?c:whole||c;
 if(!object.asset)return c.fg||'#000000';
 const ink=object.imageInk||'auto';if(ink==='black')return '#000000';if(ink==='white')return '#ffffff';
 return object===whole&&c.asset&&c.rect?imageInk(s,c):imageInk(s,object,object===whole);
}
function resolvedTextInks270(s){
 const inks=new Map(),visible=s.cells.filter(c=>c.text.trim());
 let black=0,white=0;
 for(const cell of visible){const ink=localTextInk270(s,cell);inks.set(cell,ink);if(ink==='#000000')black++;else if(ink==='#ffffff')white++;}
 const majority=Math.max(black,white),minority=Math.min(black,white);
 if(minority>=1&&minority<=2&&majority/visible.length>=.75){
  const common=black>white?'#000000':'#ffffff';
  for(const cell of visible)if(!hasManualInk270(s,cell))inks.set(cell,common);
 }
 return inks;
}
// Resolve once per canvas pass; the inline editor uses the same rules without
// mutating saved colors. Image/crop/fill changes are evaluated on the next draw.
let inkPass270=null;
effectiveTextColor=function(s,c){
 const inks=inkPass270?.state===s?inkPass270.inks:resolvedTextInks270(s);
 return inks.get(c)||localTextInk270(s,c);
};
const drawInk270=drawTo;
drawTo=function(ctx,s,marks,language=UI_LANGUAGE){
 syncDesignGrid(s);
 const previous=inkPass270;inkPass270={state:s,inks:resolvedTextInks270(s)};
 try{return drawInk270(ctx,s,marks,language);}finally{inkPass270=previous;}
};

editorMarkup=function(){
 const c=state.cells[selected],a=activeImage270();
 const close=`<button id="closeEditor" aria-label="${ui270('收起编辑工具','Close editing tools')}">×</button>`;
 if(editTab==='image'&&a){
  return `<div class="editor-head image-head270"><span>${ui270('这张图片如何放置？','How should this image be placed?')}</span>${close}</div><div class="tool-body270 image-tools270"><div class="placement270">${[['whole',ui270('铺满网格','Fill the grid')],['single',ui270('填充单格','One square')]].map(([key,label])=>`<button data-placement="${key}" aria-pressed="${a.mode===key}">${label}</button>`).join('')}</div><div class="image-settings270"><div><span class="tool-label270">${ui270('文字设计','Text style')}</span><div class="ink270">${[['auto',ui270('自动','Auto')],['black',ui270('黑字','Black')],['white',ui270('白字','White')]].map(([key,label])=>`<button data-image-ink="${key}" aria-pressed="${(a.object.imageInk||'auto')===key}">${label}</button>`).join('')}</div></div><div><span class="tool-label270">${ui270('调整构图','Composition')}</span><div class="zoom270"><output id="zoomOutput">${Math.round((a.object.zoom||1)*100)}%</output><button id="zoomOut" aria-label="${ui270('缩小图片','Zoom out')}" ${(a.object.zoom||1)<=1?'disabled':''}>−</button><button id="zoomIn" aria-label="${ui270('放大图片','Zoom in')}" ${(a.object.zoom||1)>=3?'disabled':''}>＋</button><button id="resetCrop">${ui270('重置','Reset')}</button></div></div></div></div>`;
 }
 let html=`<div class="editor-head"><span>${ui270(`方格 ${selected+1}`,`Square ${selected+1}`)}</span>${close}</div><div class="tabs" role="tablist">${[['text',ui270('文字','Text')],['image',ui270('图片','Image')],['color',ui270('颜色','Color')]].map(([k,t])=>`<button role="tab" aria-selected="${editTab===k}" data-tab="${k}" class="${editTab===k?'active':''}">${t}</button>`).join('')}</div><div class="tool-body270">`;
 if(editTab==='text')html+=`<div class="range270"><label for="fontSize">${ui270('文字大小','Type size')}</label><div class="size-controls270"><input id="fontSize" aria-label="${ui270('文字大小','Type size')}" type="range" min=".35" max="1.7" step=".05" value="${c.size}"><button id="resetTypeSize" aria-label="${ui270('重置文字大小为 100%','Reset type size to 100%')}">${ui270('重置','Reset')}</button></div></div>`;
 if(editTab==='color')html+=`<span class="tool-label270">${ui270('颜色选择','Colors')}</span><div class="palette-row270"><div class="palette-item270"><button id="noColor" class="swatch no-color" aria-label="${ui270('无色','No fill')}" aria-pressed="${!hasColorFill(c)}"></button></div>${visiblePalette270().map(({value:v,index:i})=>`<div class="palette-item270"><button class="swatch" data-color="${v}" aria-label="${ui270('颜色','Color')} ${i+1} ${v}" style="background:${v}" aria-pressed="${hasColorFill(c)&&c.bg===v}"></button><button class="delete-color270" data-remove="${i}" aria-label="${ui270('从色板删除颜色','Remove palette color')} ${i+1}"><span aria-hidden="true">×</span></button></div>`).join('')}<button id="addColor270" aria-label="${ui270('添加或编辑色板','Add or edit palette')}">＋</button></div>`;
 if(editTab==='image')html+=`<button id="uploadImages" class="upload270" ${uploadBusy?'disabled':''}>${uploadBusy?workCopy.reading:workCopy.upload}</button>`;
 return html+'</div>';
};
function rangeGesture270(id,apply,after){
 const slider=$(id);if(!slider)return;let started=false;
 slider.oninput=()=>{if(!started){finishInline();checkpoint();started=true;}apply(+slider.value);invalidate270();draw();styleInline();setSliderTrack(slider);};
 const finish=()=>{if(!started)return;started=false;scheduleSave();after?.();updateDock();};
 slider.onchange=finish;slider.onblur=finish;
}
function changeZoom270(value){
 commit(()=>{const a=activeImage270();if(!a)return;Object.assign(a.object,{zoom:Math.max(1,Math.min(3,Math.round(value*100)/100)),px:.5,py:.5});rememberImage270(a);if(a.mode==='whole')updateSlices(true);});
}
bindSimpleEditor=function(){
 on('closeEditor',closeTools270);
 $('panel').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{finishInline();pendingImagePlacement=null;editTab=b.dataset.tab;render();if(editTab==='text')showInline(true);});
 rangeGesture270('fontSize',v=>{state.cells[selected].size=v;});
 on('resetTypeSize',()=>{finishInline();if(state.cells[selected].size!==1)commit(()=>state.cells[selected].size=1);else renderPanel();});
 on('noColor',clearColorFill);on('addColor270',editPalette);
 $('panel').querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>setColor(b.dataset.color));
 $('panel').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>paletteChange270(()=>palette().splice(+b.dataset.remove,1)));
 on('uploadImages',()=>chooseFiles('auto'));
 $('panel').querySelectorAll('[data-placement]').forEach(b=>b.onclick=()=>changePlacement270(b.dataset.placement));
 $('panel').querySelectorAll('[data-image-ink]').forEach(b=>b.onclick=()=>commit(()=>{const a=activeImage270();if(!a)return;a.object.imageInk=b.dataset.imageInk;if(a.mode==='single')delete a.object.textInk;rememberImage270(a);}));
 on('zoomOut',()=>changeZoom270((activeImage270()?.object.zoom||1)-.1));
 on('zoomIn',()=>changeZoom270((activeImage270()?.object.zoom||1)+.1));
 on('resetCrop',()=>changeZoom270(1));
};

// Keep hidden placement crops/assets in the editable project and browser draft.
const bundle270=bundle;
bundle=function(includeShelf=true){
 const result=bundle270(includeShelf),s=result.state,layouts=s.imageLayouts||{},needed=new Set(Object.keys(result.assets)),kept={};
 for(const id of needed){const r=layouts[id];if(r){kept[id]=r;for(const a of [r.underlay?.asset,r.previousWhole?.asset])if(a&&assets[a]){needed.add(a);result.assets[a]=assets[a];}}}
 s.imageLayouts=kept;return result;
};
const sanitize270=sanitizeBundle;
sanitizeBundle=function(data){
 const clean=sanitize270(data),s=clean.state;
 if(Array.isArray(data.state.palette))s.palette=cleanPalette(data.state.palette);
 const validInk=v=>['auto','black','white'].includes(v)?v:'auto';
 const bounded=(v,d,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):d;
 const crop=o=>({zoom:bounded(o?.zoom,1,1,3),px:bounded(o?.px,.5,0,1),py:bounded(o?.py,.5,0,1),imageInk:validInk(o?.imageInk)});
 const picture=o=>o?.asset&&clean.assets[o.asset]?{asset:o.asset,...crop(o)}:{};
 for(const key of ['cells','shelf'])s[key].forEach((c,i)=>c.imageInk=validInk(data.state[key]?.[i]?.imageInk));
 if(s.whole)s.whole.imageInk=validInk(data.state.whole?.imageInk);
 s.imageLayouts={};
 for(const [id,r] of Object.entries(data.state.imageLayouts||{})){
  if(!clean.assets[id]||!r||typeof r!=='object')continue;
  const index=data.state.cells.findIndex(c=>c.id===r.targetId);if(index<0)continue;
  // A background slice is recreated from previousWhole rather than trusting a saved rectangle.
  const underlay=r.underlay?.rect?{}:picture(r.underlay);
  s.imageLayouts[id]={targetId:s.cells[index].id,single:crop(r.single),whole:crop(r.whole),underlay,previousWhole:r.previousWhole?.asset&&clean.assets[r.previousWhole.asset]?{...picture(r.previousWhole),split:!!r.previousWhole.split}:null};
 }
 return clean;
};
const slices270=updateSlices;
updateSlices=function(preserveColor=true){const inks=new Map(state.cells.map(c=>[c.id,c.imageInk]));slices270(preserveColor);state.cells.forEach(c=>{if(inks.has(c.id))c.imageInk=inks.get(c.id);});};
// Crop controls own image editing. Moving a square remains available after closing them.
const drag270=beginDrag;
beginDrag=function(){if(stage==='edit'&&editorOpen&&editTab==='image'){endDrag(true);return;}drag270();};
const panel270=renderPanel;
renderPanel=function(){panel270();document.body.classList.add('layout270');renderJourney();};
const helpBoot270=bootPolished;
bootPolished=async function(){await helpBoot270();$('helpBtn').onclick=()=>modal(`<h2>${ui270('操作步骤','Steps')}</h2><div class="help-copy270"><p>${ui270('选择主题词，组合文字、图片和颜色，<br>制作自己的海报。','Create with text, images and colors.')}</p><ol class="help-steps270">${ui270('<li>点击主题词选择主题，点击右上角的<br>数字调整网格数量。</li><li>点击方格添加内容，长按方格换位置。</li><li>点击「设置答案」，至少勾选一格，<br>再点击「完成创作」。</li><li>保存海报，或邀请朋友答题。</li>','<li>Choose a theme and grid size.</li><li>Tap to add. Hold to move.</li><li>Set answer, select at least one square,<br>then finish.</li><li>Save or invite friends.</li>')}</ol></div>`);};

// The answer screen remains the editable background of the save dialog.
let exportBusy270=false;
const guestSubmit270=submitAnswer;
submitAnswer=async function(){
 if(isGuest)return guestSubmit270();
 if(!picks.size||exportBusy270)return;
 finishInline();state.answer=[...picks].sort((a,b)=>a-b);
 confirmedPosterSignature=posterSignature();shareCache=null;shareAfterAnswer=false;
 scheduleSave();await exportPNG(true);
};
exportPNG=async function(marks=true){
 if(exportBusy270||!state.cells.some(filledCell))return;
 exportBusy270=true;updateDock();
 try{
  if(!await requireIdentity()||!previewModeration())return;
  previewSequence++;traceId=`DEMO-${String(previewSequence).padStart(4,'0')}`;
  const name=`Design360-${traceId}.png`,blob=await posterPNGBlob(marks);
  traceId='';openAlbumPreview(blob,name);
 }catch(error){toast(error.message||ui270('图片生成失败，请重试。','Could not create the image. Please try again.'),'error');}
 finally{traceId='';exportBusy270=false;updateDock();}
};
openAlbumPreview=function(blob,name){
 releaseSavePreview();savePreviewURL=URL.createObjectURL(blob);
 const file=typeof File==='function'?new File([blob],name,{type:'image/png'}):null;
 let canShare=false;try{canShare=!!file&&!!navigator.canShare&&navigator.canShare({files:[file]});}catch{}
 const mobile=phoneSaveMode();
 modal(`<div class="save-poster"><h2>${ui270('长按保存与分享海报','Save and share your poster')}</h2><img id="albumPoster" src="${savePreviewURL}" alt="${ui270('生成的海报，长按可保存','Your poster. Touch and hold to save.')}" draggable="false"><p class="small">${mobile?ui270('长按海报图片，可保存到相册。','Touch and hold the poster to save it.'):ui270('右键点击海报图片，可另存为图片。','Right-click the poster to save the image.')}</p><div class="save-actions"><button id="sharePosterFile">${canShare||mobile?ui270('分享海报图片','Share poster image'):ui270('保存海报图片','Save poster image')}</button>${!isGuest?`<button id="inviteAfterSave">${ui270('邀请朋友答题','Invite friends to answer')}</button>`:''}</div></div>`);
 syncSaveViewport();
 $('dialog').addEventListener('close',()=>{releaseSavePreview();if(!isGuest){stage='answer';editorOpen=false;posterMenu=null;render();}},{once:true});
 on('sharePosterFile',async()=>{
  if(!canShare){if(mobile)toast(ui270('请先长按保存图片，再从微信或其他应用分享。','Save the image first, then share it from your app.'));else download(blob,name,'image/png');return;}
  try{await navigator.share({title:'Design 360 Festival',files:[file]});}
  catch(error){if(error.name!=='AbortError')toast(ui270('请长按保存图片，再从其他应用分享。','Save the image first, then share it from your app.'));}
 });
 on('inviteAfterSave',()=>{releaseSavePreview();shareSettings();});
};
async function returnHome270(){
 finishInline();clearTimeout(saveTimer);
 if(stage!=='entry'&&!isGuest){
  await saveDraft();
  sessionStorage.setItem('d360-home-return-v270',JSON.stringify({stage,step,guidePhase,selected,editTab,picks:[...picks]}));
 }
 sessionStorage.removeItem('d360-language-v25');
 languageLanding();showEntryLanguages();
}
on('brandHome',returnHome270);
const homeClose270=closeEntryGate;
closeEntryGate=function(){sessionStorage.removeItem('d360-home-return-v270');homeClose270();};
const homeBoot270=bootPolished;
bootPolished=async function(){
 await homeBoot270();
 const saved=sessionStorage.getItem('d360-home-return-v270');if(!saved||!draft)return;
 try{
  const view=JSON.parse(saved);applyBundle(draft);stage=view.stage==='answer'?'answer':'edit';step=3;
  guidePhase=view.guidePhase==='topic'?'topic':'content';selected=Math.max(0,Math.min(state.cells.length-1,view.selected||0));
  picks=new Set((view.picks||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<state.cells.length));
  editTab=['text','image','color','choice'].includes(view.editTab)?view.editTab:'choice';editorOpen=false;render();
 }catch{sessionStorage.removeItem('d360-home-return-v270');}
};

// 2.8: a single creation journey. Flow choices survive content undo and drafts.
const ui280=(zh,en)=>UI_LANGUAGE==='zh'?zh:en;
const freshFlow280=()=>({phase:'topic',kind:null,method:null,visitedAnswer:false,returned:false,view:'edit',selection:[]});
const newStateBefore280=newState;
newState=function(){const s=newStateBefore280();s.mode='exact';s.flow280=freshFlow280();return s;};
function flow280(){return state.flow280??(state.flow280=freshFlow280());}
flow280();
let topicChoice280='',gridChoice280=null,composing280=false,uploadError280='',uploadTarget280=null;
let autoFrame280=0,caretVisible280=true,caretTime280=Date.now();
const methods280={text:['random','manual'],image:['whole','single'],color:['custom','random']};
const kindLabel280=kind=>({text:ui280('文字','Text'),image:ui280('图片','Image'),color:ui280('颜色','Color')})[kind];
function filled280(c){
 const kind=flow280().kind;
 return kind==='text'?!!String(c.text).trim():kind==='image'?!!c.asset&&!!assets[c.asset]:kind==='color'?hasColorFill(c):false;
}
function full280(){return !!flow280().kind&&state.cells.every(filled280);}
function count280(){return state.cells.filter(filled280).length;}
function batch280(){const f=flow280();return f.method==='random'||f.method==='whole';}
function invalidate280(){state.answer=[];flow280().selection=[];confirmedPosterSignature='';shareCache=null;}
posterSignature=function(){const {answer,mode,palette,shelf,flow280:flow,...poster}=state;return JSON.stringify(poster);};

const sanitizeBefore280=sanitizeBundle;
sanitizeBundle=function(data){
 const clean=sanitizeBefore280(data),source=data.state.flow280;
 if(source&&typeof source==='object'){
  const kind=['text','image','color'].includes(source.kind)?source.kind:null;
  const phase=['topic','grid','content'].includes(source.phase)?source.phase:'topic';
  clean.state.flow280={phase,kind:phase==='content'?kind:null,method:kind&&methods280[kind].includes(source.method)?source.method:null,
   visitedAnswer:!!source.visitedAnswer,returned:!!source.returned,view:['edit','answer','result'].includes(source.view)?source.view:'edit',
   selection:Array.isArray(source.selection)?[...new Set(source.selection.filter(i=>Number.isInteger(i)&&i>=0&&i<clean.state.cells.length))]:[]};
 }else clean.state.flow280=freshFlow280();
 return clean;
};
// A synchronous handoff covers a reload before the normal IndexedDB debounce.
// Draft images remain local and this cache belongs to this browser tab only.
const loadDraftBefore280=loadDraft;
loadDraft=async function(){
 try{const cached=JSON.parse(sessionStorage.getItem('d360-reload-v310')||'null');if(cached?.state?.flow280){sanitizeBundle(cached);return cached;}}catch{}
 return loadDraftBefore280();
};
window.addEventListener('pagehide',()=>{
 if(isGuest||stage==='entry')return;
 try{sessionStorage.setItem('d360-reload-v310',JSON.stringify(bundle()));}
 catch{sessionStorage.removeItem('d360-reload-v310');}
 saveDraft();
});
const restoreBefore280=restoreHistory;
restoreHistory=function(snapshot){
 const fixed=clone(flow280()),topic=state.topic,cols=state.cols,rows=state.rows;
 restoreBefore280(snapshot);
 state.flow280=fixed;state.topic=topic;state.cols=cols;state.rows=rows;
 invalidate280();
};
commit=function(fn,repaint=true){
 if(isGuest||stage!=='edit'||flow280().phase!=='content'||!flow280().kind)return;
 checkpoint();fn();invalidate280();draw();scheduleSave();
 if(repaint){hits();renderPanel();}else{updateDock();renderJourney();}
};
undo=function(){
 if(stage!=='edit'||!historyStack.length||uploadBusy)return;
 finishInline();redoStack.push(historySnapshot());restoreHistory(historyStack.pop());render();scheduleSave();
};
redo=function(){
 if(stage!=='edit'||!redoStack.length||uploadBusy)return;
 finishInline();historyStack.push(historySnapshot());restoreHistory(redoStack.pop());render();scheduleSave();
};

go=function(){
 finishInline();if(!isGuest)leaveQuestion();stage='edit';step=3;editorOpen=false;
 guidePhase=flow280().phase;posterMenu=guidePhase==='topic'?'topic':guidePhase==='grid'?'size':null;
 flow280().view='edit';render();scheduleSave();
};
startFresh=function(){
 finishInline();hideToast(true);leaveQuestion();previewCreator=null;previewQuestion=null;
 sessionStorage.removeItem('d360-reload-v310');
 state=newState();state.palette=[...defaultPalette];picks.clear();historyStack=[];redoStack=[];
 selected=0;topicChoice280='';gridChoice280=null;uploadError280='';resetCreationGuidance();
 go();window.scrollTo({top:0,behavior:'instant'});
};
function chooseKind280(kind){
 const f=flow280();if(f.phase!=='content'||f.kind)return;
 f.kind=kind;f.method=null;editTab=kind;editorOpen=true;historyStack=[];redoStack=[];
 render();scheduleSave();
}
function chooseMethod280(method){
 const f=flow280();if(!f.kind||f.method||!methods280[f.kind].includes(method))return;
 f.method=method;editorOpen=true;uploadError280='';render();scheduleSave();
 if(method==='random')randomize280();
 else if(f.kind==='image')chooseFiles(method);
 else if(f.kind==='text')showInline(true);
}
function randomize280(){
 const f=flow280();if(stage!=='edit'||f.method!=='random')return;
 finishInline();const colors=palette().length?palette():defaultPalette,numbers=f.kind==='text'?randomNumbers300(state.cells.length):null;
 commit(()=>{state.whole=null;state.shelf=[];state.cells=state.cells.map((c,i)=>{
  const cell=Object.assign(blank(),{id:c.id,size:c.size});
  if(f.kind==='text')Object.assign(cell,{type:'number',text:String(numbers[i]),align:'center'});
  else Object.assign(cell,{type:'color',bg:colors[Math.floor(Math.random()*colors.length)],colorApplied:true});
  return cell;
 });});
 editorOpen=true;render();
}

function renderSetup280(){
 let layer=$('setupLayer280');const f=flow280(),visible=stage==='edit'&&f.phase!=='content';
 if(!visible){layer?.remove();return;}
 if(layer?.dataset.phase===f.phase)return;
 layer?.remove();layer=document.createElement('div');layer.id='setupLayer280';layer.className='setup-layer280';layer.dataset.phase=f.phase;
 const topic=f.phase==='topic',title=topic?ui280('你想做一张关于什么的海报？','What would you like your poster to be about?'):ui280('选择网格数量','Choose your grid size');
 const words=topics.filter(w=>w!=='objects'&&w!=='images');
 layer.innerHTML=`<div class="setup-shade280"></div><section class="setup-card280" role="dialog" aria-modal="true" aria-labelledby="setupTitle280"><h2 id="setupTitle280">${title}</h2><p>${topic?ui280('选一个关键词，或输入自己的词。','Choose a keyword, or enter your own.'):ui280('选择几乘几的网格，确认后开始添加内容。','Choose a grid, then start adding content.')}</p><div class="setup-options280">${topic?words.map(w=>`<button data-topic280="${esc(w)}" aria-pressed="false">${esc(w)}</button>`).join(''):[2,3,4,5,6].map(n=>`<button data-grid280="${n}" aria-pressed="false">${n} × ${n}</button>`).join('')}</div><div class="setup-confirm280">${topic?`<input id="customTopic280" type="text" maxlength="36" aria-label="${ui280('自定义关键词','Custom keyword')}" placeholder="${ui280('自定义关键词…','Custom keyword…')}">`:'<span></span>'}<button id="setupConfirm280" class="primary" disabled>${ui280('确定','Confirm')}</button></div></section>`;
 document.body.append(layer);
 const sync=()=>{
  layer.querySelectorAll('[data-topic280]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic280===topicChoice280)));
  layer.querySelectorAll('[data-grid280]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.grid280===gridChoice280)));
  $('setupConfirm280').disabled=topic?!topicChoice280&&!$('customTopic280').value.trim():!gridChoice280;
 };
 layer.querySelectorAll('[data-topic280]').forEach(b=>b.onclick=()=>{topicChoice280=b.dataset.topic280;$('customTopic280').value='';sync();});
 layer.querySelectorAll('[data-grid280]').forEach(b=>b.onclick=()=>{gridChoice280=+b.dataset.grid280;sync();});
 on('customTopic280',()=>{topicChoice280='';sync();},'input');
 on('customTopic280',e=>{if(e.key==='Enter'&&!e.isComposing&&!$('setupConfirm280').disabled)$('setupConfirm280').click();},'keydown');
 on('setupConfirm280',()=>{
  if(topic){
   const word=topicChoice280||$('customTopic280').value.trim();if(!word)return;
   state.topic=word;f.phase='grid';gridChoice280=null;
  }else{
   if(!gridChoice280)return;
   state.cols=state.rows=gridChoice280;state.cells=Array.from({length:gridChoice280**2},blank);state.shelf=[];state.whole=null;
   f.phase='content';selected=0;
  }
  historyStack=[];redoStack=[];editorOpen=false;render();scheduleSave();
 });
 sync();
}
toggleMenu=function(){if(stage==='edit'&&flow280().phase!=='content')renderSetup280();};
resizeGrid=function(){}; // Grid choices are committed only by the setup confirmation.
hits=function(){
 const s=stage==='entry'?entryState():state,h=$('hotspots'),f=flow280();h.replaceChildren();h.style.visibility='';
 $('posterShell').querySelectorAll('.poster-menu,.dimension-menu,.poster-control,.setup-shade').forEach(e=>e.remove());
 s.cells.forEach((c,i)=>{
  const b=document.createElement('button');b.className='cell-hit';
  if(stage==='edit'&&editorOpen&&selected===i&&f.method!=='whole'){
   if(c.text.trim())b.classList.add('text-selected290');
   else if(inlineIndex===null)b.append(selectionCorners290());
  }
  pos(b,G.x+i%s.cols*G.w/s.cols,G.y+Math.floor(i/s.cols)*G.h/s.rows,G.w/s.cols,G.h/s.rows);
  b.setAttribute('aria-label',ui280(`第${i+1}格：${c.text.trim()?c.text:c.asset?'图片':hasColorFill(c)?'颜色':'空白'}`,`Square ${i+1}: ${c.text.trim()?c.text:c.asset?'image':hasColorFill(c)?'color':'empty'}`));
  b.setAttribute('aria-pressed',String(stage==='entry'?entryPicks.has(i):stage==='answer'||stage==='result'?picks.has(i):editorOpen&&selected===i));
  b.disabled=stage==='result'||stage==='error'||stage==='edit'&&(f.phase!=='content'||uploadBusy);
  b.onclick=()=>cellClick(i);h.append(b);
 });
 if(stage==='edit'&&editorOpen&&f.method==='whole'){
  const mark=selectionCorners290();mark.classList.add('whole-selection290');pos(mark,G.x,G.y,G.w,G.h);h.append(mark);
 }
 if(stage==='edit'&&f.phase==='content'&&!f.kind&&!editorOpen){const b=h.firstElementChild;b?.classList.add('first-empty-square');if(b)b.dataset.emptyLabel=ui280('＋ 点击添加','＋ Add content');}
};
cellClick=function(i){
 if(stage==='entry'){entryPicks.has(i)?entryPicks.delete(i):entryPicks.add(i);render();return;}
 if(stage==='answer'){picks.has(i)?picks.delete(i):picks.add(i);if(!isGuest){flow280().selection=[...picks];scheduleSave();}render();return;}
 const f=flow280();if(stage!=='edit'||f.phase!=='content'||uploadBusy)return;
 finishInline();selected=i;editorOpen=true;editTab=f.kind||'choice';uploadError280='';render();
 if(f.kind==='text'&&f.method==='manual')showInline(true);
 else if(f.kind==='image'&&f.method==='single'&&!state.cells[i].asset)chooseFiles('single');
};

function closeEditor280(){
 if(composing280||uploadBusy)return;
 finishInline();editorOpen=false;render();maybeAutoAnswer280();
}
closeTools270=closeEditor280;
finishMobileText=function(){closeEditor280();};
function maybeAutoAnswer280(){
 clearTimeout(autoFrame280);
 autoFrame280=setTimeout(()=>{
  const f=flow280();if(stage!=='edit'||f.phase!=='content'||f.visitedAnswer||batch280()||!full280()||composing280||inlineIndex!==null||$('dialog').open)return;
  if(f.kind!=='color'&&editorOpen)return;
  enterAnswer280();
 },0);
}
function enterAnswer280(){
 if(stage!=='edit'||!full280()||composing280)return;
 finishInline();const f=flow280();f.visitedAnswer=true;f.view='answer';f.selection=state.answer.length?[...state.answer]:[...f.selection];
 picks=new Set(f.selection);editorOpen=false;posterMenu=null;stage='answer';render();scheduleSave();
}
finishPoster=enterAnswer280;finishCreation=enterAnswer280;
backToEdit270=function(){
 finishInline();const f=flow280();f.returned=true;f.view='edit';stage='edit';step=3;editorOpen=false;posterMenu=null;render();scheduleSave();
};
completionControl=function(){
 let wrap=$('completionControl');if(!wrap){wrap=document.createElement('section');wrap.id='completionControl';document.body.append(wrap);}
 const f=flow280(),visible=stage==='edit'&&!editorOpen&&full280()&&(f.returned||batch280());wrap.hidden=!visible;
 if(!visible)return;
 if(batch280()){
  const use=f.returned?ui280('编辑完成','Done editing'):f.method==='whole'?ui280('使用这张图片','Use this image'):f.kind==='text'?ui280('使用这组数字','Use these numbers'):ui280('使用这组颜色','Use these colors');
  wrap.innerHTML=`<div class="workspace-tools-inner"><div class="creation-actions"><button id="reopenBatch280">${f.method==='random'?ui280('再随机一次','Randomize again'):ui280('调整图片','Adjust image')}</button><button class="primary" id="editDone280">${use}</button></div></div>`;
  on('reopenBatch280',()=>{editorOpen=true;if(f.method==='random')randomize280();else render();});
 }else wrap.innerHTML=`<div class="workspace-tools-inner"><button class="primary edit-done280" id="editDone280">${ui280('编辑完成','Done editing')}</button></div>`;
 on('editDone280',enterAnswer280);
};

inputValue=function(value){
 const f=flow280();if(f.kind!=='text'||f.method!=='manual'||stage!=='edit')return;
 if(!inlineSession){checkpoint();inlineSession=state.cells[selected].id;}
 Object.assign(state.cells[selected],{text:String(value).slice(0,120),type:isNumeric(value)?'number':'text',align:'left'});
 invalidate280();caretVisible280=true;caretTime280=Date.now();draw();hits();scheduleSave();updateDock();renderJourney();
};
finishInline=function(){
 inlineIndex=null;inlineSession=null;composing280=false;$('inlineText')?.remove();
 document.body.classList.remove('inline-active','mobile-typing');draw();scheduleSave();
};
showInline=function(focus=false){
 const f=flow280();if(stage!=='edit'||f.kind!=='text'||f.method!=='manual'||!editorOpen)return;
 let el=$('inlineText');
 if(el&&inlineIndex!==selected){finishInline();el=null;}
 if(!el){
  el=document.createElement('textarea');el.id='inlineText';el.className='inline-text';el.maxLength=120;el.spellcheck=false;el.enterKeyHint='done';
  el.setAttribute('aria-label',ui280(`输入第${selected+1}格文字`,`Enter text in square ${selected+1}`));el.value=state.cells[selected].text;
  $('posterShell').append(el);
  el.addEventListener('input',()=>{inputValue(el.value);styleInline();});
  el.addEventListener('compositionstart',()=>{composing280=true;});
  el.addEventListener('compositionend',()=>{composing280=false;inputValue(el.value);styleInline();});
  el.addEventListener('keydown',e=>{caretVisible280=true;caretTime280=Date.now();if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!composing280){e.preventDefault();closeEditor280();}});
  for(const event of ['select','keyup','click','focus'])el.addEventListener(event,()=>{caretVisible280=true;caretTime280=Date.now();draw();});
  el.addEventListener('blur',()=>setTimeout(()=>{
   if($('inlineText')!==el||document.activeElement===el||composing280)return;
   if(inlineInteractionTarget instanceof Element&&inlineInteractionTarget.closest('#panel,#mobileDock,.cell-hit'))return;
   closeEditor280();
  },0));
 }
 inlineIndex=selected;document.body.classList.add('inline-active');styleInline();draw();
 hits();
 if(focus){el.focus({preventScroll:true});el.setSelectionRange(el.value.length,el.value.length);setTimeout(ensureCellVisible,120);}
};
const drawCaretBefore280=drawCaret;
drawCaret=function(ctx){
 const el=$('inlineText');if(!el||document.activeElement!==el||!caretVisible280&&el.selectionStart===el.selectionEnd)return;
 if(state.cells[selected].text)return drawCaretBefore280(ctx);
 const cw=G.w/state.cols,ch=G.h/state.rows,{m,lines}=editingLines(state.cells[selected]);
 const line=lines[0],height=Math.min(ch*.65,Math.max(86,m.fs));
 ctx.save();ctx.fillStyle='#171717';ctx.fillRect(line.x,G.y+Math.floor(selected/state.cols)*ch+m.insetY,Math.max(2,2*W/$('posterShell').offsetWidth),height);ctx.restore();
};
setInterval(()=>{if(inlineIndex!==null&&document.activeElement===$('inlineText')&&Date.now()-caretTime280>450){caretVisible280=!caretVisible280;draw();}},500);
mobileInputBar=function(){$('mobileInputBar')?.remove();};

chooseFiles=function(mode){
 const f=flow280();if(stage!=='edit'||f.kind!=='image'||!['whole','single'].includes(f.method)||uploadBusy)return;
 finishInline();uploadMode=f.method;uploadTargetId=state.cells[selected].id;uploadTarget280={state,targetId:uploadTargetId,method:f.method};
 $('fileInput').multiple=false;$('fileInput').value='';$('fileInput').click();
};
upload=async function(files){
 const file=[...files||[]][0],target=uploadTarget280,f=flow280();
 if(!file||!target||uploadBusy||f.kind!=='image'||target.method!==f.method)return;
 uploadBusy=uploadPending=true;uploadError280='';render();
 try{
  if(!await requireIdentity()||!previewModeration())return;
  const id=await readFile(file,target.method);
  if(state!==target.state||stage!=='edit')throw Error(ui280('海报已更改，请重新上传。','The poster changed. Please upload again.'));
  const index=state.cells.findIndex(c=>c.id===target.targetId);if(index<0)return;
  selected=index;
  commit(()=>{
   if(target.method==='whole'){
    state.cells=state.cells.map(c=>Object.assign(blank(),{id:c.id}));
    state.whole={asset:id,split:false,zoom:1,px:.5,py:.5};updateSlices(true);
   }else state.cells[index]=Object.assign(blank(),{id:target.targetId,type:'image',asset:id});
  });
 }catch(error){uploadError280=error.message||ui280('图片读取失败，请重新上传。','Could not read this image. Try again.');}
 finally{uploadBusy=uploadPending=false;editorOpen=true;render();}
};
setColor=function(value){
 const f=flow280();if(f.kind!=='color'||f.method!=='custom'||!/^#[0-9a-f]{6}$/i.test(value))return;
 finishInline();commit(()=>{state.cells[selected]=Object.assign(blank(),{id:state.cells[selected].id,type:'color',bg:value.toLowerCase(),colorApplied:true});});
 maybeAutoAnswer280();
};

function imageTools280(){
 const a=activeImage270();if(!a)return '';
 return `<div class="crop-tools280"><div class="zoom270"><span>${ui280('缩放','Zoom')}</span><output id="zoomOutput">${Math.round((a.object.zoom||1)*100)}%</output><button id="zoomOut" aria-label="${ui280('缩小图片','Zoom out')}" ${(a.object.zoom||1)<=1?'disabled':''}>−</button><button id="zoomIn" aria-label="${ui280('放大图片','Zoom in')}" ${(a.object.zoom||1)>=3?'disabled':''}>＋</button><button id="resetCrop">${ui280('重置','Reset')}</button></div></div>`;
}
editorMarkup=function(){
 const f=flow280(),c=state.cells[selected];
 let html=`<div class="editor-head"><span>${f.method==='whole'?ui280('整张图片','Full-grid image'):`${f.kind?`${kindLabel280(f.kind)} · `:''}${ui280(`方格 ${selected+1}`,`Square ${selected+1}`)}`}</span><button id="closeEditor" class="close-editor280" aria-label="${ui280('关闭编辑面板','Close editing tools')}" title="${ui280('关闭编辑面板','Close editing tools')}" ${uploadBusy?'disabled':''}>×</button></div><div class="tool-body270 flow-tools280">`;
 if(!f.kind)return html+`<div class="flow-actions280 types280">${['image','text','color'].map(kind=>`<button data-kind280="${kind}">${kindLabel280(kind)}</button>`).join('')}</div></div>`;
 if(!f.method){
  const choices=f.kind==='text'?[['random',ui280('随机数字','Random numbers')],['manual',ui280('自行输入','Type your own')]]:f.kind==='image'?[['whole',ui280('上传单张填满','Upload one image across grid')],['single',ui280('上传单格图片','Upload image to one square')]]:[['random',ui280('随机颜色','Random colors')],['custom',ui280('自定义颜色','Custom colors')]];
  return html+`<div class="flow-actions280">${choices.map(([method,label])=>`<button data-method280="${method}">${label}</button>`).join('')}</div></div>`;
 }
 if(f.method==='random'){
  const use=f.returned?ui280('编辑完成','Done editing'):f.kind==='text'?ui280('使用这组数字','Use these numbers'):ui280('使用这组颜色','Use these colors');
  html+=`<div class="flow-actions280"><button id="randomAgain280">${ui280('再随机一次','Randomize again')}</button><button class="primary" id="useBatch280" ${full280()?'':'disabled'}>${use}</button></div>`;
 }
 if(f.kind==='text')html+=`<div class="range270"><label for="fontSize">${ui280('文字大小','Type size')}</label><div class="size-controls270"><input id="fontSize" aria-label="${ui280('文字大小','Type size')}" type="range" min=".35" max="1.7" step=".05" value="${c.size}"><button id="resetTypeSize">${ui280('重置','Reset')}</button></div></div>`;
 if(f.kind==='image'){
  html+=`<div class="flow-actions280"><button id="uploadImage280" ${uploadBusy?'disabled':''}>${uploadBusy?ui280('正在读取图片…','Reading image…'):f.method==='whole'?ui280(state.whole?'重新上传图片':'上传单张填满',state.whole?'Replace image':'Upload one image across grid'):ui280(c.asset?'替换此格图片':'上传单格图片',c.asset?'Replace this image':'Upload image to one square')}</button>${f.method==='whole'?`<button id="useBatch280" class="primary" ${full280()&&!uploadBusy?'':'disabled'}>${f.returned?ui280('编辑完成','Done editing'):ui280('使用这张图片','Use this image')}</button>`:''}</div>`;
  if(uploadError280)html+=`<p class="upload-error280" role="alert">${esc(uploadError280)}</p>`;
  html+=imageTools280();
 }
 if(f.kind==='color'&&f.method==='custom')html+=`<div class="palette280">${palette().slice(0,9).map((v,i)=>`<button class="swatch" data-color280="${v}" style="background:${v}" aria-label="${ui280('颜色','Color')} ${i+1} ${v}" aria-pressed="${hasColorFill(c)&&c.bg===v}"></button>`).join('')}<label class="custom-color280" title="${ui280('自选颜色','Choose a color')}"><span>＋</span><input id="customColor280" type="color" aria-label="${ui280('自选颜色','Choose a color')}" value="${c.bg}"></label><button id="editPalette280" aria-label="${ui280('编辑色板','Edit palette')}">…</button></div>`;
 if(f.returned&&!batch280()&&full280())html+=`<div class="flow-actions280"><button id="returnDone280" class="primary">${ui280('编辑完成','Done editing')}</button></div>`;
 return html+'</div>';
};
bindSimpleEditor=function(){
 on('closeEditor',closeEditor280);
 $('panel').querySelectorAll('[data-kind280]').forEach(b=>b.onclick=()=>chooseKind280(b.dataset.kind280));
 $('panel').querySelectorAll('[data-method280]').forEach(b=>b.onclick=()=>chooseMethod280(b.dataset.method280));
 on('randomAgain280',randomize280);on('useBatch280',enterAnswer280);
 on('returnDone280',enterAnswer280);
 rangeGesture270('fontSize',v=>{state.cells[selected].size=v;});
 on('resetTypeSize',()=>{finishInline();if(state.cells[selected].size!==1)commit(()=>state.cells[selected].size=1);});
 on('uploadImage280',()=>chooseFiles(flow280().method));
 on('zoomOut',()=>changeZoom270((activeImage270()?.object.zoom||1)-.1));
 on('zoomIn',()=>changeZoom270((activeImage270()?.object.zoom||1)+.1));on('resetCrop',()=>changeZoom270(1));
 $('panel').querySelectorAll('[data-color280]').forEach(b=>b.onclick=()=>setColor(b.dataset.color280));
 on('customColor280',e=>setColor(e.target.value),'change');on('editPalette280',editPalette);
};

clearCurrent=function(){
 finishInline();commit(()=>{if(state.whole&&!state.whole.split)state.whole.split=true;state.cells[selected]=Object.assign(blank(),{id:state.cells[selected].id});});render();
};
resetContent=function(all=false){
 if(all)return requestNew280();
 finishInline();commit(()=>{state.cells=state.cells.map(c=>Object.assign(blank(),{id:c.id}));state.whole=null;state.shelf=[];});editorOpen=false;render();
};
clearMenu=function(){
 if(!count280()||uploadBusy)return;
 finishInline();modal(`<h2>${ui280('清除','Clear')}</h2><div class="stack"><button id="clearOne" ${filled280(state.cells[selected])?'':'disabled'}>${ui280('清空此格','Clear this square')}</button><button id="clearAll">${ui280('清除全部内容','Clear all content')}</button></div>`);
 on('clearOne',()=>{$('dialog').close();clearCurrent();});on('clearAll',()=>{$('dialog').close();resetContent(false);});
};
function requestNew280(){
 const start=()=>{$('dialog').close();startFresh();};
 if(state.cells.some(filledCell))confirmAction(ui280('开始新海报？','Start a new poster?'),ui280('当前创作将被清空。','Your current creation will be cleared.'),start);
 else start();
}
moreMenu=function(){
 if(uploadBusy)return;finishInline();
 modal(`<h2>${ui280('更多','More')}</h2><div class="stack"><button id="newPoster280">${ui280('新海报','New poster')}</button></div>`);
 on('newPoster280',requestNew280);
};

renderPanel=function(){
 const p=$('panel');p.className='panel';p.innerHTML='';const f=flow280();
 document.body.dataset.stage=stage;document.body.dataset.kind=f.kind||'';document.body.dataset.method=f.method||'';
 document.body.classList.add('layout270','flow280','paper-workspace');document.body.classList.remove('minimal-idle');
 guidePhase=f.phase;posterMenu=stage==='edit'&&f.phase!=='content'?(f.phase==='topic'?'topic':'size'):null;
 document.body.classList.toggle('has-editor',stage==='edit'&&editorOpen&&f.phase==='content');
 if(stage==='entry'){
  p.innerHTML=`<button id="initialConfirm" ${entryPicks.size===3?'':'disabled'}>${ui280('开始创作','Start creating')}</button>`;
  on('initialConfirm',()=>{if(entryPicks.size===3&&[0,2,4].every(i=>entryPicks.has(i))){state=newState();historyStack=[];redoStack=[];go();}else{entryErrors++;render();}});
 }else if(stage==='edit'&&editorOpen&&f.phase==='content'){
  p.classList.add('editor-panel');p.innerHTML=editorMarkup();bindSimpleEditor();
 }else if(stage==='result'){
  p.classList.add('result-panel280');p.innerHTML=`<div class="result-actions"><button class="primary" id="exportPNG">${ui280('保存海报','Save poster')}</button>${isGuest?`<button id="copyCreate">${ui280('我也来创作','Create my own')}</button>`:`<button id="inviteAnswer">${ui280('邀请答题','Invite friends to answer')}</button>`}</div>`;
  on('exportPNG',()=>exportPNG(true));on('inviteAnswer',shareSettings);on('copyCreate',startFresh);
 }else if(stage==='error'){
  p.classList.add('editor-panel');p.innerHTML=`<p>${esc(questionLoadError)}</p><button id="retryLoad">${ui280('重试','Retry')}</button>`;on('retryLoad',()=>location.reload());
 }
 updateDock();renderJourney();renderSetup280();scheduleJourneyFit();
 document.querySelectorAll('input[type=range]').forEach(setSliderTrack);
};
updateDock=function(){
 let d=$('mobileDock');if(!d){d=document.createElement('div');d.id='mobileDock';document.body.append(d);}
 d.classList.toggle('entry-dock',stage==='entry');d.classList.toggle('has-preview-return',!!previewCreator);
 if(stage==='entry'){
  d.innerHTML=`<button id="dockConfirm" class="primary" ${entryPicks.size===3?'':'disabled'}>${entryPicks.size===3?ui280('开始创作','Start creating'):ui280(`请选择 ${entryPicks.size} / 3`,`Select ${entryPicks.size} / 3`)}</button>`;
  on('dockConfirm',()=>$('initialConfirm')?.click());
 }else if(stage==='edit'){
  const setup=flow280().phase!=='content';
  d.innerHTML=icon270('dockUndo',ui280('撤回','Undo'),'undo',setup||!historyStack.length||uploadBusy)+icon270('dockClear',ui280('清除','Clear'),'clear',setup||!count280()||uploadBusy)+icon270('more',ui280('更多','More'),'more',uploadBusy);
  on('dockUndo',undo);on('dockClear',clearMenu);on('more',moreMenu);
 }else if(stage==='answer'){
  d.innerHTML=`<div class="answer-actions270">${!isGuest?`<button id="dockBack">${ui280('返回编辑','Back to edit')}</button>`:''}<button class="primary" id="dockAnswer" ${!picks.size||exportBusy270?'disabled':''}>${exportBusy270?ui280('正在生成…','Creating…'):isGuest?ui280('完成','Finish'):ui280('完成创作','Finish creation')}</button></div>`;
  on('dockBack',backToEdit270);on('dockAnswer',submitAnswer);
 }else{
  d.innerHTML=icon270('more',ui280('更多','More'),'more');on('more',moreMenu);
 }
 if(previewCreator){d.insertAdjacentHTML('afterbegin',icon270('previewBack',ui280('返回我的海报','My poster'),'back'));on('previewBack',previewReturnCreator);}
 completionControl();
};
renderJourney=function(){
 let guide=$('workspaceGuide');if(!guide){guide=document.createElement('div');guide.id='workspaceGuide';guide.setAttribute('aria-live','polite');$('posterShell').before(guide);}
 const f=flow280();let hint='';
 if(stage==='entry')hint=ui280('第一步：','Step 1: ')+entryHint();
 else if(stage==='answer')hint=ui280(`选择代表「${state.topic}」的格子。`,`Select squares that represent “${state.topic}”.`);
 else if(stage==='result')hint=ui280('海报已完成，可以保存或分享。','Your poster is ready to save or share.');
 else if(f.phase==='topic')hint=ui280('选择关键词，点击确定继续。','Choose a keyword, then confirm.');
 else if(f.phase==='grid')hint=ui280('选择网格数量，点击确定继续。','Choose a grid size, then confirm.');
 else if(!f.kind)hint=ui280('点击格子，选择图片、文字或颜色。','Tap a square to choose images, text or colors.');
 else if(!f.method)hint=ui280('选择一种填充方式。','Choose how to fill your grid.');
 else if(batch280())hint=full280()?ui280(f.method==='random'?'可多次随机，满意后确认。':'调整图片，满意后确认。',f.method==='random'?'Randomize as often as you like, then confirm.':'Adjust your image, then confirm.'):ui280(f.method==='random'?'点击格子，重新随机生成内容。':'点击格子上传图片。',f.method==='random'?'Tap a square to randomize again.':'Tap a square to upload an image.');
 else hint=ui280(`已填写 ${count280()} / ${state.cells.length} 格${full280()?'，完成当前编辑后继续。':'，点击空白格继续。'}`,`${count280()} / ${state.cells.length} squares filled${full280()?'. Finish editing to continue.':'. Tap an empty square to continue.'}`);
 const number=stage==='entry'?1:stage==='edit'?2:3,html=`<strong>${number} / 3</strong><span>${esc(hint)}</span>`;
 if(guide.innerHTML!==html)guide.innerHTML=html;
 let prompt=$('screenPrompt');if(!prompt){prompt=document.createElement('div');prompt.id='screenPrompt';prompt.setAttribute('role','status');document.body.append(prompt);}
 prompt.hidden=stage!=='answer'&&stage!=='entry';prompt.textContent=stage==='entry'?entryHint():ui280(`已选择 ${picks.size} 格 · 至少选择 1 格`,`Selected ${picks.size} · Choose at least 1 square`);
 if(prompt.parentElement!==document.body)document.body.append(prompt);
};
fitJourneyPoster=function(){
 const shell=$('posterShell');if(!shell)return;
 const narrow=mobileLayout(),width=narrow?Math.min(320,innerWidth-32):Math.min(620,innerWidth-32,Math.max(320,(innerHeight-150)*W/H));
 const top=narrow?92:108,root=document.documentElement;
 document.body.classList.add('journey-overview','paper-workspace');
 root.style.setProperty('--work-top',top+'px');root.style.setProperty('--reserved270','240px');
 root.style.setProperty('--paper-width270',width+'px');shell.style.setProperty('--overview-poster-width',width+'px');
 document.body.classList.toggle('wide-workspace',!narrow&&innerWidth>=width+2*(340+24+16));
 fitEntryHints270();positionFeedback270();styleInline();
};
mobileFitPoster=scheduleJourneyFit;
render=function(){draw();hits();renderPanel();};

shareSettings=function(){
 if(!state.answer.length||confirmedPosterSignature!==posterSignature())return;
 modal(`<h2>${ui280('邀请答题','Invite friends to answer')}</h2><label class="field"><span>${ui280('答案方式','Answer mode')}</span><select id="answerMode"><option value="exact" ${state.mode==='exact'?'selected':''}>${ui280('使用我设置的答案','Use my selection as the answer key')}</option><option value="open" ${state.mode==='open'?'selected':''}>${ui280('自由选择','Choose freely')}</option></select></label><p class="small" id="answerModeDescription"></p><button class="primary" id="publish" style="width:100%">${ui280('预览分享流程','Preview sharing')}</button><p class="small">${ui280('当前为预览模式，不会生成真实分享链接。','Preview only. No shareable link will be created.')}</p>`);
 const sync=()=>{$('answerModeDescription').textContent=state.mode==='exact'?ui280('朋友需选中与你相同的全部格子。','Friends must select exactly the same squares as you.'):ui280('朋友可以自由选择，不判对错。','Friends can choose freely. There are no right or wrong answers.');};
 sync();on('answerMode',e=>{state.mode=e.target.value;shareCache=null;scheduleSave();sync();},'change');on('publish',publishQuestion);
};
submitAnswer=async function(){
 if(!picks.size||exportBusy270)return;
 if(isGuest){
  if(state.mode==='exact'&&(picks.size!==state.answer.length||!state.answer.every(i=>picks.has(i)))){
   modal(`<h2>${ui280('重新选择','Choose again')}</h2><p class="lead">${ui280('你的选择与出题者设置的答案还不一致。','Your selection does not match the answer key yet.')}</p><button class="primary" id="retry" style="width:100%">${ui280('继续选择','Keep choosing')}</button>`);on('retry',()=>$('dialog').close());return;
  }
  stage='result';render();return;
 }
 if(!full280())return;
 state.answer=[...picks].sort((a,b)=>a-b);flow280().selection=[...picks];flow280().view='result';
 confirmedPosterSignature=posterSignature();shareCache=null;stage='result';editorOpen=false;scheduleSave();render();await exportPNG(true);
};
openAlbumPreview=function(blob,name){
 releaseSavePreview();savePreviewURL=URL.createObjectURL(blob);
 const file=typeof File==='function'?new File([blob],name,{type:'image/png'}):null;
 let canShare=false;try{canShare=!!file&&!!navigator.canShare&&navigator.canShare({files:[file]});}catch{}
 modal(`<div class="save-poster"><h2>${ui280('保存与分享海报','Save and share your poster')}</h2><img id="albumPoster" src="${savePreviewURL}" alt="${ui280('完成的海报，长按可保存','Your completed poster. Touch and hold to save.')}" draggable="false"><p class="small">${phoneSaveMode()?ui280('长按海报图片，可保存到相册。','Touch and hold the poster to save it.'):ui280('右键点击海报图片，可另存为图片。','Right-click the poster to save the image.')}</p><div class="save-actions"><button id="sharePosterFile">${canShare?ui280('分享海报图片','Share poster image'):ui280('保存海报图片','Save poster image')}</button>${!isGuest?`<button id="inviteAfterSave">${ui280('邀请答题','Invite friends to answer')}</button>`:''}</div></div>`);
 syncSaveViewport();
 $('dialog').addEventListener('close',releaseSavePreview,{once:true});
 on('sharePosterFile',async()=>{if(canShare){try{await navigator.share({title:'360 Design Festival',files:[file]});}catch(error){if(error.name!=='AbortError')download(blob,name,'image/png');}}else if(phoneSaveMode())toast(ui280('长按海报图片即可保存。','Touch and hold the poster image to save.'));else download(blob,name,'image/png');});
 on('inviteAfterSave',shareSettings);
};

registerTools=function(){
 if(!document.modelContext?.registerTool)return;
 try{document.modelContext.registerTool({name:'read_poster_state',description:'Read the poster and current creation step.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({stage,flow:clone(flow280()),topic:state.topic,cols:state.cols,rows:state.rows,cells:clone(state.cells)})});}catch{}
};
function help280(){
 const steps=UI_LANGUAGE==='zh'?['选择关键词和网格，分别点击确定。','点击格子，选择一种内容类型和填充方式。','逐格填写至全部完成；随机和整图可反复调整，满意后确认。','勾选答案，再点击完成创作。','保存海报，或邀请朋友答题。']:['Choose a keyword and grid size. Confirm each choice.','Tap a square. Choose one content type and filling method.','Fill every square. Random results and full-grid images can be adjusted before confirming.','Select your answer squares, then finish creation.','Save your poster or invite friends to answer.'];
 modal(`<h2>${ui280('操作步骤','Steps')}</h2><div class="help-copy270"><ol class="help-steps270">${steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>`);
}
const bootBefore280=bootPolished;
bootPolished=async function(){
 await bootBefore280();
 if(draft?.state?.flow280&&!isGuest){
  applyBundle(draft);const f=flow280();stage=f.view;step=3;editorOpen=false;selected=0;
  if(stage!=='edit'&&!full280())stage='edit';picks=new Set(f.selection);
  confirmedPosterSignature=state.answer.length?posterSignature():'';
 }
 const brand=document.querySelector('.brand b');if(brand)brand.textContent='360 Design Festival';
 document.title='360 Design Festival · 3.1';$('helpBtn').onclick=help280;render();
};
const gateCloseBefore280=closeEntryGate;
closeEntryGate=function(){gateCloseBefore280();render();};
$('dialog').addEventListener('close',maybeAutoAnswer280);

// 2.9: clear editing feedback, a complete answer view, and a fresh home entry.
function selectionCorners290(){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.classList.add('selection-corners290');svg.setAttribute('viewBox','0 0 100 100');
 svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
 const path='M0 16V0H16 M84 0H100V16 M100 84V100H84 M16 100H0V84';
 for(const [color,width] of [['#fff',1.5],['#171717',.65]]){
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d',path);p.setAttribute('fill','none');p.setAttribute('stroke',color);
  p.setAttribute('stroke-width',width);p.setAttribute('vector-effect','non-scaling-stroke');svg.append(p);
 }
 return svg;
}

// Black is the default. White is reserved for completed, predominantly dark grids.
chooseLineColor=function(samples){
 if(!samples.length)return '#000000';
 const average=samples.reduce((a,b)=>a+b,0)/samples.length;
 const darkFraction=samples.filter(v=>v<32).length/samples.length;
 return average<25&&darkFraction>=.8?'#ffffff':'#000000';
};
const autoGridBefore290=autoGridLine;
autoGridLine=function(s){
 if(s.cells.some(c=>!String(c.text||'').trim()&&!hasColorFill(c)&&!(c.asset&&assets[c.asset])))return '#000000';
 if(s.cells.some(c=>c.asset&&!images.get(assets[c.asset])?.naturalWidth))return '#000000';
 return autoGridBefore290(s);
};

let fitView290='';
const fitBefore290=fitJourneyPoster;
fitJourneyPoster=function(){
 const answer=stage==='answer',view=answer?'answer':stage;
 document.body.classList.toggle('answer-fit290',answer);
 if(view!==fitView290){
  fitView290=view;window.scrollTo({top:0,left:0,behavior:'instant'});
  $('panel').scrollTop=0;
 }
 if(!answer){fitBefore290();return;}
 const shell=$('posterShell');if(!shell)return;
 document.body.classList.remove('wide-workspace');
 document.body.classList.add('journey-overview','paper-workspace');
 const root=document.documentElement,guide=$('workspaceGuide'),prompt=$('screenPrompt'),dock=$('mobileDock');
 const height=window.visualViewport?.height||innerHeight;
 const top=(guide?.getBoundingClientRect().bottom||84)+8;
 const controlsTop=Math.min(prompt?.getBoundingClientRect().top||height,dock?.getBoundingClientRect().top||height);
 const bottom=Math.max(0,innerHeight-controlsTop)+8;
 const available=Math.max(1,height-top-bottom-16);
 const width=Math.min(620,innerWidth-32,available*W/H);
 root.style.setProperty('--answer-top290',top+'px');root.style.setProperty('--answer-bottom290',bottom+'px');
 root.style.setProperty('--paper-width270',width+'px');shell.style.setProperty('--overview-poster-width',width+'px');
 fitEntryHints270();positionFeedback270();
};

// Drain any save already in flight before deleting the old creation.
let saveQueue290=Promise.resolve(),resettingHome290=false;
const saveBefore290=saveDraft;
saveDraft=function(){
 if(resettingHome290||stage==='entry'||isGuest||suppressSave)return Promise.resolve();
 const run=()=>saveBefore290();
 saveQueue290=saveQueue290.then(run,run);return saveQueue290;
};
async function clearSavedCreation290(){
 sessionStorage.removeItem('d360-reload-v310');sessionStorage.removeItem('d360-home-return-v270');
 localStorage.removeItem('design360-v310-draft');
 try{
  const d=await db();
  try{await new Promise((resolve,reject)=>{
   const tx=d.transaction('drafts','readwrite');tx.objectStore('drafts').delete('current');
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });}finally{d.close();}
 }catch{/* The in-memory draft and local fallback have still been cleared. */}
}
returnHome270=async function(){
 if(resettingHome290||uploadBusy)return;
 resettingHome290=true;suppressSave=true;
 finishInline();clearTimeout(saveTimer);clearTimeout(autoFrame280);hideToast(true);
 if($('dialog').open)$('dialog').close();releaseSavePreview();
 leaveQuestion();previewCreator=null;previewQuestion=null;shareCache=null;draft=null;
 state=newState();picks.clear();entryPicks.clear();historyStack=[];redoStack=[];
 selected=0;step=1;stage='entry';editorOpen=false;posterMenu=null;entryErrors=0;
 topicChoice280='';gridChoice280=null;uploadError280='';uploadTarget280=null;confirmedPosterSignature='';
 resetCreationGuidance();render();previewBanner();
 await saveQueue290.catch(()=>{});await clearSavedCreation290();
 for(const key of Object.keys(assets))delete assets[key];
 sessionStorage.removeItem('d360-language-v25');
 resettingHome290=false;suppressSave=false;
 languageLanding();showEntryLanguages();window.scrollTo({top:0,left:0,behavior:'instant'});
};
rebind('brandHome',returnHome270);

// 3.0: brief entry guidance, varied number lengths and explicit grid ink.
function randomNumbers300(count){
 const ones=Math.max(1,Math.round(count*.1)),twos=Math.max(1,Math.round(count*.15));
 const threes=Math.floor(count*.15),digits=[];
 for(const [length,n] of [[1,ones],[2,twos],[3,threes],[4,count-ones-twos-threes]])
  for(let i=0;i<n;i++)digits.push(length);
 const numbers=digits.map(length=>{
  const min=length===1?0:10**(length-1),max=10**length-1;
  return min+Math.floor(Math.random()*(max-min+1));
 });
 for(let i=numbers.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[numbers[i],numbers[j]]=[numbers[j],numbers[i]];}
 return numbers;
}

let entryKey300='',entryDeadline300=0,entryTimer300=null;
function resetEntryHint300(){
 clearTimeout(entryTimer300);entryTimer300=null;entryKey300='';entryDeadline300=0;
}
const renderJourneyBefore300=renderJourney;
renderJourney=function(){
 renderJourneyBefore300();
 if(stage!=='entry'||document.body.classList.contains('entry-locked')){
  resetEntryHint300();if(stage==='entry')$('screenPrompt').hidden=true;return;
 }
 const key=String(entryErrors);
 if(key!==entryKey300){
  resetEntryHint300();entryKey300=key;entryDeadline300=Date.now()+4000;
  entryTimer300=setTimeout(()=>{if(stage==='entry'&&entryKey300===key)$('screenPrompt').hidden=true;},4000);
 }
 $('screenPrompt').hidden=Date.now()>=entryDeadline300;
};
const closeGateBefore300=closeEntryGate;
closeEntryGate=function(){resetEntryHint300();closeGateBefore300();};

function setGridLine300(value){
 if(isGuest||stage!=='edit'||uploadBusy||!['auto','#000000','#ffffff'].includes(value)||state.line===value)return;
 finishInline();checkpoint();state.line=value;invalidate280();render();scheduleSave();
}
const moreMenuBefore300=moreMenu;
moreMenu=function(){
 if(uploadBusy)return;
 moreMenuBefore300();
 if(isGuest||stage!=='edit')return;
 $('dialogBody').insertAdjacentHTML('beforeend',`<label class="field" style="margin-top:16px"><span>${ui280('网格线','Grid lines')}</span><select id="gridLine"><option value="auto" ${state.line==='auto'?'selected':''}>${ui280('自动','Auto')}</option><option value="#000000" ${state.line==='#000000'?'selected':''}>${ui280('黑线','Black')}</option><option value="#ffffff" ${state.line==='#ffffff'?'selected':''}>${ui280('白线','White')}</option></select></label>`);
 on('gridLine',e=>setGridLine300(e.target.value),'change');
};

// Upgrade untouched six-color drafts once; later palette edits remain intentional.
const newStatePaletteBefore300=newState;
newState=function(){const s=newStatePaletteBefore300();s.paletteVersion300=1;return s;};
const sanitizePaletteBefore300=sanitizeBundle;
sanitizeBundle=function(data){
 const clean=sanitizePaletteBefore300(data),p=clean.state.palette;
 if(!data.state.paletteVersion300&&Array.isArray(p)&&p.length===6&&p.every((v,i)=>v===defaultPalette[i]))clean.state.palette=[...defaultPalette];
 clean.state.paletteVersion300=1;return clean;
};

// 3.1: the reference badge pops in, settles, and reveals the two check segments.
// This is live canvas feedback only. Export and saved documents remain static.
const selectionMotion310=new Map(),motionDuration310=420;
// Deliberate selection feedback always plays, including in embedded previews.
let selectionFrame310=0,motionState310=null,motionStage310='',motionGuest310=null;
const badgeKeys310=[[0,0],[100,1.08],[185,.975],[270,1.01],[420,1]];
function badgeScale310(elapsed){
 if(elapsed<=0)return 0;
 for(let i=1;i<badgeKeys310.length;i++){
  const [end,value]=badgeKeys310[i],[start,previous]=badgeKeys310[i-1];
  if(elapsed<=end){const t=(elapsed-start)/(end-start),ease=1-(1-t)**3;return previous+(value-previous)*ease;}
 }
 return 1;
}
// Show the first 20% immediately, then complete the remaining path in 200 ms.
function checkProgress310(elapsed){return .2+.8*Math.max(0,Math.min(1,elapsed/200));}
function checkPoints310(x,y,size,progress){
 const a={x:x+size*.21,y:y+size*.59},b={x:x+size*.41,y:y+size*.78},c={x:x+size*.77,y:y+size*.22};
 const short=Math.hypot(b.x-a.x,b.y-a.y),long=Math.hypot(c.x-b.x,c.y-b.y);
 const distance=(short+long)*Math.max(0,Math.min(1,progress));
 if(distance<=0)return [];
 if(distance<short){const t=distance/short;return [a,{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}];}
 const t=Math.min(1,(distance-short)/long);
 return [a,b,{x:b.x+(c.x-b.x)*t,y:b.y+(c.y-b.y)*t}];
}
function clearSelectionMotion310(){
 if(selectionFrame310)cancelAnimationFrame(selectionFrame310);
 selectionFrame310=0;selectionMotion310.clear();
}
function syncSelectionMotion310(){
 if(motionState310!==state||motionStage310!==stage||motionGuest310!==isGuest){
  clearSelectionMotion310();motionState310=state;motionStage310=stage;motionGuest310=isGuest;
 }
}
const drawBefore310=draw;
draw=function(){syncSelectionMotion310();drawBefore310();};
const checkBefore310=check;
check=function(ctx,x,y,size,lineWidth=5){
 // The same renderer serves offscreen PNG export: never export an in-between frame.
 if(ctx.canvas!==$('poster')||!selectionMotion310.size)return checkBefore310(ctx,x,y,size,lineWidth);
 const cols=stage==='entry'?3:state.cols,rows=stage==='entry'?3:state.rows;
 const col=Math.round((x-G.x)/(G.w/cols)),row=Math.round((y-G.y)/(G.h/rows));
 const index=row*cols+col,record=selectionMotion310.get(index);
 const selection=stage==='entry'?entryPicks:stage==='answer'?picks:null;
 if(!record||!selection?.has(index))return checkBefore310(ctx,x,y,size,lineWidth);
 const elapsed=performance.now()-record.start;
 if(elapsed>=motionDuration310)return checkBefore310(ctx,x,y,size,lineWidth);
 const scale=badgeScale310(elapsed);if(scale<=0)return;
 const centerX=x+size/2,centerY=y+size/2;
 ctx.save();ctx.translate(centerX,centerY);ctx.scale(scale,scale);ctx.translate(-centerX,-centerY);
 ctx.beginPath();ctx.arc(centerX,centerY,size/2-2,0,Math.PI*2);
 ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=lineWidth;ctx.stroke();
 const points=checkPoints310(x,y,size,checkProgress310(elapsed));
 if(points.length){
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.lineWidth=6;ctx.stroke();
 }
 ctx.restore();
};
function queueSelectionMotion310(){
 if(selectionFrame310||!selectionMotion310.size)return;
 selectionFrame310=requestAnimationFrame(tickSelectionMotion310);
}
function tickSelectionMotion310(now){
 selectionFrame310=0;syncSelectionMotion310();
 for(const [index,record] of selectionMotion310)if(now-record.start>=motionDuration310)selectionMotion310.delete(index);
 draw();queueSelectionMotion310();
}
const cellClickBefore310=cellClick;
cellClick=function(index){
 syncSelectionMotion310();
 const selection=stage==='entry'?entryPicks:stage==='answer'?picks:null;
 const count=stage==='entry'?9:state.cells.length;
 const selectable=!!selection&&Number.isInteger(index)&&index>=0&&index<count;
 const adding=selectable&&!selection.has(index);
 if(selectable){
  selectionMotion310.delete(index);
  if(adding&&!document.hidden)selectionMotion310.set(index,{start:performance.now()});
 }
 cellClickBefore310(index);
 syncSelectionMotion310();
 if(selectable&&!selection.has(index))selectionMotion310.delete(index);
 queueSelectionMotion310();
};
function finishSelectionMotion310(){clearSelectionMotion310();if($('poster'))draw();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)finishSelectionMotion310();});
window.addEventListener('pagehide',clearSelectionMotion310);

// The page is usable before network fonts or artwork have finished loading.
function bounded310(task, ms, fallback) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => fallback instanceof Error ? reject(fallback) : resolve(fallback), ms);
    Promise.resolve(task).then(value => { clearTimeout(timer); resolve(value); }, error => {
      clearTimeout(timer); reject(error);
    });
  });
}
const draftBeforeFast310 = loadDraft;
loadDraft = () => bounded310(draftBeforeFast310(), 600, null).catch(() => null);
// Canvas fonts update in place; font loading never holds the entry gate closed.
let fontTextFast310 = '';
function refreshTextFontsFast310() {
  if (!document.fonts) return Promise.resolve();
  const text = '设计节请选择包含以下内容的方格' + (state.topic || '') + state.cells.map(c => c.text || '').join('');
  if (text === fontTextFast310) return Promise.resolve();
  fontTextFast310 = text;
  return bounded310(document.fonts.load('400 72px D360Chinese', text), 12000, null)
    .then(() => { if (document.visibilityState !== 'hidden') render(); })
    .catch(() => { fontTextFast310 = ''; });
}
const renderBeforeFast310 = render;
render = function () {
  renderBeforeFast310();
  // Store the text before the asynchronous redraw to avoid recursive loads.
  refreshTextFontsFast310();
};
document.fonts?.addEventListener('loadingdone', () => {
  render(); scheduleJourneyFit();
});
// Exports still require the exact faces, with a bounded and retryable error.
prepareDesignArtwork = async function (redraw = true) {
  const text = '设计节请选择包含以下内容的方格' + (state.topic || '') + state.cells.map(c => c.text || '').join('');
  const fonts = document.fonts ? [
    document.fonts.load('700 72px D360Bold'),
    document.fonts.load('400 72px D360Medium'),
    document.fonts.load('400 72px D360Roman'),
    document.fonts.load('400 72px D360Chinese', text)
  ] : [];
  await bounded310(Promise.all([...fonts,
    loadImage(globalThis.D360_ASSETS.logos), loadImage(globalThis.D360_ASSETS.footer)
  ]), 12000, Error(UI_LANGUAGE === 'zh' ? '字体或图示加载较慢，请稍后再试保存。' : 'Fonts or artwork are still loading. Please try saving again.'));
  if (redraw) render();
};
beginJourneyLoading = function () {};
failJourneyLoading = function (error) {
  console.error('Application boot failed', error);
  document.body.classList.remove('artwork-loading');
  const el = document.createElement('div');
  el.id = 'journeyLoading';
  const message = document.createElement('p'); message.textContent = journeyCopy.failed;
  const retry = document.createElement('button'); retry.textContent = journeyCopy.retry;
  retry.onclick = () => location.reload(); el.append(message, retry); document.body.append(el);
};

bootPolished().then(async()=>{
  await bootSafety();previewBanner();finishJourneyLoading();document.title='360 Design Festival · 3.1';
  prepareDesignArtwork().catch(()=>{});
}).catch(failJourneyLoading);
