import fs from 'node:fs'; const d=JSON.parse(fs.readFileSync(process.argv[2]));
console.log(d.seo);
for(const s of d.sections){ if(['footer','nav'].includes(s.tag)&&!process.argv[3]) {console.log('##',s.tag,s.name,'(skipped)');continue;}
 console.log(`## ${s.tag} "${s.name}" y=${s.box.y} h=${s.box.h}`);
 for(const it of s.items){const p=it.framerPath.slice(-2).join('>'); const b=`${it.box.w}x${it.box.h}@${it.box.x},${it.box.y}`;
  if(it.kind==='richtext') for(const bl of it.blocks) console.log(`  T[${it.name||''}] ${bl.tag}: ${bl.text.replace(/\n/g,'⏎').slice(0,160)} {${bl.font.family.split(',')[0]} ${bl.font.size} ${bl.font.weight}} (${p})`);
  else if(it.kind==='text') console.log(`  t ${it.tag}: ${it.text.slice(0,120)} (${p})`);
  else if(it.kind==='image') console.log(`  IMG ${b} ${it.src.split('?')[0].split('/').pop()} fit=${it.objectFit} alt="${it.alt}" href=${it.href||''} (${p})`);
  else if(it.kind==='link') console.log(`  A ${it.href} "${it.text.slice(0,60)}" ${it.target} (${p})`);
  else if(it.kind==='svg') console.log(`  SVG ${b} ${it.name} (${p})`);
  else console.log(' ',it.kind, JSON.stringify({...it,framerPath:undefined,box:undefined}).slice(0,250));
 }}
