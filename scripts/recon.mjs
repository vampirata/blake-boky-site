import { chromium } from 'playwright';
const url = process.argv[2]; const w = +(process.argv[3]||1440);
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:w,height:900}});
await p.goto(url,{waitUntil:'networkidle'});
for(let y=0;y<30000;y+=500){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(120); if(y>await p.evaluate(()=>document.body.scrollHeight))break;}
await p.waitForLoadState('networkidle');
const out = await p.evaluate(()=>{
 const vis=e=>{let n=e; while(n&&n.nodeType===1){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return true;};
 const res=[]; const walk=(e,d)=>{ if(!vis(e))return; const nm=e.getAttribute('data-framer-name'); const ct=e.getAttribute('data-framer-component-type');
  const r=e.getBoundingClientRect(); const y=Math.round(r.top+scrollY);
  const sz=r.width>=1&&r.height>=1; if(ct==='RichTextContainer'){if(!sz)return;res.push(`${'  '.repeat(d)}TEXT[${nm||''}] y=${y} ${[...e.children].map(c=>c.tagName+':'+c.innerText.replace(/\n/g,'⏎')).join(' | ').slice(0,300)}`);return;}
  if(e.tagName==='IMG'){res.push(`${'  '.repeat(d)}IMG y=${y} ${Math.round(r.width)}x${Math.round(r.height)} ${e.currentSrc.slice(0,90)} alt=${e.alt}`);return;}
  if(['VIDEO','IFRAME','svg','FORM','INPUT','TEXTAREA','BUTTON','SELECT'].includes(e.tagName)){res.push(`${'  '.repeat(d)}${e.tagName} y=${y} ${e.getAttribute('src')||e.getAttribute('name')||''} ${e.getAttribute('placeholder')||''}`); if(e.tagName!=='FORM')return;}
  const bg=getComputedStyle(e).backgroundImage; 
  if(nm||e.tagName==='A'||bg!=='none') res.push(`${'  '.repeat(d)}<${e.tagName.toLowerCase()} name="${nm||''}" ${e.tagName==='A'?'href='+e.getAttribute('href'):''} ${bg!=='none'?'bg='+bg.slice(0,80):''} y=${y} h=${Math.round(r.height)}>`);
  for(const c of e.children) walk(c,d+1);};
 walk(document.getElementById('main')||document.body,0); return res.join('\n');});
console.log(out); await b.close();
