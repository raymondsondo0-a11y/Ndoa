(()=>{'use strict';
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const booking=document.querySelector('#bookingForm')||document.querySelector('#contactForm');
if(booking)booking.addEventListener('submit',e=>{e.preventDefault();const r=document.querySelector('#result');if(r){r.hidden=false;r.textContent='Your details are filled in, but this website has no online delivery connection configured yet. Contact the business directly; your appointment is not confirmed.'}});
const form=document.querySelector('#campaignForm'); if(!form)return;
const $=s=>document.querySelector(s);
let data=[];try{data=JSON.parse(localStorage.getItem('ndoa_campaigns')||'[]');if(!Array.isArray(data))data=[]}catch(e){data=[]}
const today=new Date();today.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
$('#startDate').min=iso(today);$('#startDate').value=iso(today);
let month=new Date(today.getFullYear(),today.getMonth(),1);
const typeNames={carScanner:'Car scanner / computer diagnostics',carRepair:'Car repair / garage',carSales:'Cars for sale / car dealer',hotel:'Hotel / lodge / restaurant',fashion:'Clothes / fashion / beauty',electronics:'Electronics / phones / computers',realEstate:'Houses / rentals / real estate',education:'School / training / tuition',tourism:'Tourism / trips / transport',other:'Other business or service'};
const mediaByType={carScanner:['Facebook','TikTok','YouTube'],carRepair:['Facebook','TikTok','YouTube'],carSales:['Facebook','TikTok','YouTube'],hotel:['Facebook','TikTok','YouTube'],fashion:['TikTok','Facebook','YouTube'],electronics:['Facebook','TikTok','YouTube'],realEstate:['Facebook','YouTube','TikTok'],education:['YouTube','Facebook','TikTok'],tourism:['TikTok','Facebook','YouTube'],other:['Facebook','TikTok','YouTube']};
const imageByType={carScanner:'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=85',carRepair:'https://images.unsplash.com/photo-1632823471565-1ecdf5c6f1b4?auto=format&fit=crop&w=1000&q=85',carSales:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85',hotel:'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',fashion:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',electronics:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=85',realEstate:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',education:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=85',tourism:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',other:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85'};
const creativeByType={carScanner:'Film a short real clip of the scanner connected to a car; explain the warning/fault it can help investigate and invite drivers to book a scan.',carRepair:'Show a real repair or diagnostic check, explain the customer benefit and invite people to request a quote.',carSales:'Use clear car photos/video, price, key specifications, condition and a direct enquiry action.',hotel:'Show attractive real photos/video, location, experience or offer and a simple booking/contact action.',fashion:'Use a vertical video or carousel showing the product, price, sizes/colours and ordering method.',electronics:'Demonstrate the product working, list specifications, price and how customers can order.',realEstate:'Show property photos/video, area, price/rent, main features and a viewing/contact action.',education:'Highlight the course, outcome, intake dates and how to register.',tourism:'Show the experience, trip date, inclusions and how to reserve a place.',other:'Show the product/service in use, explain one clear benefit and include one direct call to action.'};
const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const money=n=>new Intl.NumberFormat('en-TZ',{maximumFractionDigits:0}).format(Number(n)||0);
const mediaTimes={'Facebook':'19:00','TikTok':'19:30','YouTube':'18:00','WhatsApp Status':'07:30'};
function recommendation(){
 const type=$('#businessType').value,preferred=$('#preferredMedia').value,media=preferred==='auto'?mediaByType[type][0]:preferred;
 const d=$('#startDate').value?new Date($('#startDate').value+'T12:00:00'):new Date();
 const offer=$('#offer').value.trim(),business=$('#businessName').value.trim(),budget=$('#budget').value;
 $('#recWhat').textContent=(business||typeNames[type])+' — '+(offer||typeNames[type]);
 $('#recMedia').textContent=preferred==='auto'?'Weekly mix: Facebook, TikTok and YouTube; organic WhatsApp/content on other days':media;
 $('#recDate').textContent=dayNames[d.getDay()]+', '+d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
 $('#recTime').textContent=(mediaTimes[media]||'18:30')+' EAT (UTC+3)';
 $('#recBudget').textContent=budget!==''?'TZS '+money(budget)+' monthly total':'Enter your monthly budget';
 $('#recCreative').textContent=creativeByType[type];
 $('#recSummary').textContent='Plan one practical task for every day Monday–Sunday. Paid promotions rotate between Facebook, TikTok and YouTube; organic tasks fill the other days. The full monthly budget you enter is divided across planned paid promotion dates.';
 const offerText=$('#offer').value.trim();
 const photoTerms=({carScanner:'car diagnostics mechanic workshop',carRepair:'auto repair garage mechanic',carSales:'modern car dealership',hotel:'beautiful hotel interior',fashion:'fashion clothing boutique',electronics:'electronics computer technology',realEstate:'modern house real estate',education:'students classroom learning',tourism:'Tanzania safari travel landscape',other:'small business product marketing'})[type]||'business marketing';
 const keywords=(photoTerms+' '+offerText).toLowerCase().replace(/[^a-z0-9\\s-]/g,' ').split(/\\s+/).filter(w=>w.length>2).slice(0,8).join(',');
 const dynamicPhoto='https://loremflickr.com/1600/900/'+encodeURIComponent(keywords||photoTerms);
 const hero=document.querySelector('.planner-intro');
 // Slow, gentle cross-fade slideshow across the full page and the planner hero.
 if(hero && !document.body.dataset.raymondSlideshow){
  const photos=[
   'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1632823471565-1ecdf5c6f1b4?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=90',
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=90'
  ];
  document.body.dataset.raymondSlideshow='active';
  const makeLayer=(className)=>{
   const layer=document.createElement('div');
   layer.className=className;
   layer.setAttribute('aria-hidden','true');
   layer.style.cssText='position:fixed;inset:0;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0;transition:opacity 3.5s ease-in-out;will-change:opacity;';
   return layer;
  };
  const pageA=makeLayer('raymond-page-bg raymond-bg-a');
  const pageB=makeLayer('raymond-page-bg raymond-bg-b');
  pageA.style.zIndex='-2';pageB.style.zIndex='-2';
  document.body.prepend(pageB);document.body.prepend(pageA);
  const heroA=makeLayer('raymond-hero-bg raymond-hero-a');
  const heroB=makeLayer('raymond-hero-bg raymond-hero-b');
  heroA.style.cssText+='position:absolute;inset:0;z-index:0;border-radius:inherit;';
  heroB.style.cssText+='position:absolute;inset:0;z-index:0;border-radius:inherit;';
  hero.style.position='relative';hero.style.isolation='isolate';hero.style.overflow='hidden';
  hero.prepend(heroB);hero.prepend(heroA);
  Array.from(hero.children).forEach(el=>{
   if(el!==heroA&&el!==heroB){el.style.position='relative';el.style.zIndex='1';}
  });
  document.body.style.backgroundColor='transparent';
  let index=0,showA=true;
  const firstImage=new Image();
  firstImage.onload=()=>{pageA.style.backgroundImage='linear-gradient(120deg,rgba(4,12,22,.38),rgba(5,17,29,.16)),url("'+photos[0]+'")';pageA.style.opacity='1';heroA.style.backgroundImage='linear-gradient(100deg,rgba(4,12,22,.32),rgba(5,17,29,.10)),url("'+photos[0]+'")';heroA.style.opacity='1';};
  firstImage.src=photos[0];
  photos.slice(1).forEach(src=>{const img=new Image();img.src=src;});
  window.setInterval(()=>{
   index=(index+1)%photos.length;
   const next=new Image();
   next.onload=()=>{
    const pageFront=showA?pageB:pageA,pageBack=showA?pageA:pageB;
    const heroFront=showA?heroB:heroA,heroBack=showA?heroA:heroB;
    const image='linear-gradient(120deg,rgba(4,12,22,.38),rgba(5,17,29,.16)),url("'+photos[index]+'")';
    pageFront.style.backgroundImage=image;heroFront.style.backgroundImage='linear-gradient(100deg,rgba(4,12,22,.32),rgba(5,17,29,.10)),url("'+photos[index]+'")';
    pageFront.style.opacity='1';heroFront.style.opacity='1';pageBack.style.opacity='0';heroBack.style.opacity='0';showA=!showA;
   };
   next.src=photos[index];
  },9000);
 }
 const image=$('#recImage');if(image){image.src=dynamicPhoto;image.alt='Online image selected for '+typeNames[type]+': '+(offerText||typeNames[type]);image.onerror=()=>{image.onerror=null;image.src=imageByType[type]||imageByType.other;};}
 const caption=$('#recImageCaption');if(caption)caption.textContent='Image direction personalised to '+(offerText||typeNames[type])+'. If the online image service is unavailable, a matching business image will be shown.';

 return {type,media,date:iso(d),time:mediaTimes[media]||'18:30',creative:creativeByType[type]};
}
form.querySelectorAll('input,select,textarea').forEach(el=>{el.addEventListener('input',recommendation);el.addEventListener('change',recommendation)});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const weekly=[
 {day:1,media:'Facebook',time:'19:00',paid:true,topic:'Problem / service awareness'},
 {day:2,media:'TikTok',time:'19:30',paid:true,topic:'Short demonstration video'},
 {day:3,media:'Instagram + WhatsApp Status',time:'12:30',paid:false,topic:'Tips / educational post'},
 {day:4,media:'Facebook',time:'19:00',paid:false,topic:'FAQ and customer trust'},
 {day:5,media:'Facebook',time:'19:00',paid:true,topic:'Offer / lead generation'},
 {day:6,media:'YouTube Shorts',time:'18:00',paid:true,topic:'Useful video / demonstration'},
 {day:0,media:'WhatsApp Status',time:'18:00',paid:false,topic:'Weekly recap and next-week prompt'}
];
function dailyCreative(type,weekday,business,offer){
 const name=business||typeNames[type],service=offer||typeNames[type];
 const templates={
 carScanner:[
  ['Facebook','Create a Facebook post explaining 3 warning signs that mean a driver should get a computer diagnosis. Use a real scanner/car photo, mention '+service+', add your location and a Call/WhatsApp action.'],
  ['TikTok','Film a 20–35 second vertical video: show the scanner connecting to a car, the live diagnostic process and one safe, simple explanation of what a fault code means. End: “Book a car scan with '+name+'.”'],
  ['Instagram + WhatsApp Status','Publish a simple “Did you know?” tip about why a check-engine light should be investigated. Use 3 slides: symptom, why scanning helps, how to book '+service+'.'],
  ['Facebook','Post an FAQ: “What happens during computer diagnosis?” Show the steps (connect scanner, read codes, explain findings) and clarify that a code helps diagnosis but does not always identify a failed part by itself. Invite questions.'],
  ['Facebook','Create a lead-generation offer for '+service+'. State what is included, service area and booking contact. Use a clear real photo; promote the post within the planned budget.'],
  ['YouTube Shorts','Publish a 30–60 second educational video showing a car diagnostic scan: problem/symptom, scanner connection, code-reading screen with private details hidden, and the next recommended step. Add location and booking details.'],
  ['WhatsApp Status','Share this week’s diagnostic tip or a short before/after workflow clip (with customer permission). Ask viewers to message to book; review enquiries and plan next week’s topic.']
 ],
 carRepair:[
  ['Facebook','Post a real garage photo and explain one common symptom your garage repairs. State service area and how to request an estimate.'],
  ['TikTok','Film a short safe workshop clip showing a repair process, tools and the customer benefit. Add captions and a booking call-to-action.'],
  ['Instagram + WhatsApp Status','Share a maintenance tip carousel: symptom, possible causes and when to seek a mechanic.'],
  ['Facebook','Answer a common repair FAQ and show the inspection process; avoid promising a diagnosis before inspection.'],
  ['Facebook','Promote one specific service or inspection offer, with clear inclusions, location and contact details.'],
  ['YouTube Shorts','Publish a short educational clip about a common vehicle symptom and how a mechanic investigates it.'],
  ['WhatsApp Status','Recap services available and invite people to book; review messages and prepare next week’s content.']
 ],
 carSales:[
  ['Facebook','Post a high-quality vehicle photo set with make/model, year, mileage, condition, price and contact details.'],
  ['TikTok','Film a vertical walk-around: exterior, interior, dashboard and key features. State the model and invite serious enquiries.'],
  ['Instagram + WhatsApp Status','Share a buying tip or feature highlight for this vehicle; include the price and enquiry method.'],
  ['Facebook','Post answers to common buyer questions: ownership documents, inspection, condition and viewing arrangements.'],
  ['Facebook','Promote the featured vehicle with accurate details and a viewing/inspection call-to-action.'],
  ['YouTube Shorts','Create a concise vehicle walk-around video with key specifications and contact details.'],
  ['WhatsApp Status','Share availability update and viewing hours; track genuine enquiries and prepare next vehicle feature.']
 ]};
 const fallback=[
  ['Facebook','Publish a helpful post about '+service+'. Explain one customer problem, the benefit, location and a clear call-to-action.'],
  ['TikTok','Film a 20–35 second vertical demonstration of '+service+'. Show the process/product, add captions and invite viewers to contact '+name+'.'],
  ['Instagram + WhatsApp Status','Share 3 quick tips about '+service+' using a photo or short carousel. End with how to enquire.'],
  ['Facebook','Answer a frequently asked customer question about '+service+'. Use a real image and invite questions in comments.'],
  ['Facebook','Promote a specific offer for '+service+'. State what is included, who it helps, location and contact details.'],
  ['YouTube Shorts','Publish a short tutorial, product demonstration or customer-benefit video about '+service+'. Add a title and contact details.'],
  ['WhatsApp Status','Share a weekly recap, customer FAQ or behind-the-scenes content. Review enquiries and choose next week’s topic.']
 ];
 const row=(templates[type]||fallback)[weekday===0?6:weekday-1];
 return {media:row[0],task:row[1],topic:row[1]};
}
function buildMonthlyPlan(start,budget,type,business,offer,notes,goal){
 const first=new Date(start+'T12:00:00'),last=new Date(first.getFullYear(),first.getMonth()+1,0,12),days=[];
 for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)){const base=weekly[d.getDay()],specific=dailyCreative(type,d.getDay(),business,offer);const item={...base,media:specific.media,task:specific.task,topic:specific.topic};days.push({...item,date:iso(d),businessType:type,businessName:business,offer,audience:'',goal,notes,creative:specific.task,status:'Planned'});}
 const paid=days.filter(x=>x.paid),base=paid.length?Math.floor(budget/paid.length):0,extra=budget-base*paid.length;let n=0;
 days.forEach(x=>{x.totalBudget=budget;x.budget=x.paid?(base+(n++===0?extra:0)):0;x.planId='plan-'+Date.now();x.id=x.planId+'-'+x.date;x.frequency='Daily Monday–Sunday monthly plan';});
 return days;
}
function drawList(){
 const list=$('#campaignList');
 list.innerHTML=data.length?data.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(c=>'<article class="saved-campaign"><div><h4>'+esc(c.businessName||c.name||'Untitled campaign')+' · '+esc(c.date||'')+'</h4><p><strong>Task:</strong> '+esc(c.task||c.offer||c.name||'Promote product/service')+'</p><p>📣 '+esc(c.media||c.platform||'Media not selected')+' · ⏰ '+esc(c.time||'18:30')+' EAT</p><p>💰 '+(c.paid?'Paid promotion budget: TZS '+money(c.budget):'Organic task: TZS 0 planned')+'</p><p>'+esc(c.creative||c.notes||'')+'</p><span class="tag">'+esc(c.status||'Planned')+'</span></div><div><button class="btn-danger-soft" type="button" data-delete="'+esc(c.id)+'">Delete plan</button></div></article>').join(''):'<p class="empty-state">No plans saved yet. Fill the form and save a monthly plan.</p>';
}
function drawCalendar(){
 const cal=$('#calendar'),y=month.getFullYear(),mo=month.getMonth(),start=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
 $('#monthLabel').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})+' — Daily content calendar';
 const monthData=data.filter(c=>(c.date||'').slice(0,7)===y+'-'+String(mo+1).padStart(2,'0'));
 let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>'<div class="calhead">'+x+'</div>').join('');
 for(let i=0;i<start;i++)h+='<div class="calcell cal-empty"></div>';
 for(let day=1;day<=days;day++){
  const key=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),items=monthData.filter(c=>c.date===key);
  h+='<div class="calcell'+(items.length?' has-plan':'')+'"><b class="cal-date">'+day+'</b>'+items.map(c=>'<article class="calendar-task"><span class="calendar-platform">'+esc(c.media||'Task')+'</span><span class="calendar-time">'+esc(c.time||'')+' EAT</span><p>'+esc(c.task||c.offer||'Daily marketing task')+'</p><small class="calendar-budget">'+(c.paid?'Ad budget: TZS '+money(c.budget):'Organic: TZS 0')+'</small></article>').join('')+'</div>';
 }
 cal.innerHTML=h;
 const note=$('#calendarHint');if(note)note.textContent=monthData.length?'This calendar shows '+monthData.length+' daily tasks. Select any date card to read the post/video idea and its platform.':'Create a schedule to display your detailed daily marketing calendar here.';
}
function persist(){try{localStorage.setItem('ndoa_campaigns',JSON.stringify(data));drawList();drawCalendar();return true}catch(e){$('#plannerFeedback').textContent='Browser storage is unavailable or full. Export your plans or enable site storage and try again.';return false}}
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const f=Object.fromEntries(new FormData(form).entries()),budget=Number(f.budget);
 if(!Number.isFinite(budget)||budget<0){$('#plannerFeedback').textContent='Enter a valid monthly budget in TZS.';return}
 const plan=buildMonthlyPlan(f.startDate,budget,f.businessType,f.businessName,f.offer,f.notes,f.goal);month=new Date(f.startDate+'T12:00:00');
 plan.forEach(x=>{x.audience=f.audience;x.preferredMedia=f.preferredMedia});
 data.push(...plan);
 if(persist()){const calPanel=$('#calendar')?.closest('.planner-panel');if(calPanel){calPanel.hidden=false;calPanel.scrollIntoView({behavior:'smooth',block:'start'});}$('#plannerFeedback').textContent='Created a detailed calendar for '+plan.length+' days. Every date now has a specific post/video idea, platform, time and budget. Paid budget TZS '+money(budget)+' is split across paid promotion dates; organic tasks cost TZS 0 in planned ad spend.';drawCalendar();}
});
$('#campaignList').addEventListener('click',e=>{const b=e.target.closest('[data-delete]');if(b){const item=data.find(c=>c.id===b.dataset.delete);if(item&&item.planId)data=data.filter(c=>c.planId!==item.planId);else data=data.filter(c=>c.id!==b.dataset.delete);persist();$('#plannerFeedback').textContent='Entire monthly plan deleted.'}});
$('#prevMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);drawCalendar()});
$('#nextMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);drawCalendar()});
$('#resetPlanner').addEventListener('click',()=>{form.reset();$('#startDate').value=iso(today);$('#plannerFeedback').textContent='Form cleared. Choose your business and budget to generate a new weekly plan.';recommendation()});
const downloadCsv=$('#downloadCsv');
if(downloadCsv)downloadCsv.addEventListener('click',()=>{
 if(!data.length){$('#plannerFeedback').textContent='Create a schedule first, then download the full schedule.';return;}
 const latestId=data[data.length-1].planId;
 const items=data.filter(x=>x.planId===latestId).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const fields=[['Date','Day','Business','Offer','Platform','Time EAT','Detailed task','Paid promotion','Budget TZS','Status']];
 items.forEach(x=>fields.push([x.date,dayNames[new Date(x.date+'T12:00:00').getDay()],x.businessName,x.offer,x.media,x.time,x.task,x.paid?'Yes':'No',x.budget||0,x.status||'Planned']));
 const csv=fields.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\\r\\n');
 const blob=new Blob(['\\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='NDOA-Full-Schedule-'+items[0].date+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 $('#plannerFeedback').textContent='Full daily schedule downloaded as CSV. You can open it in Excel or Google Sheets.';
});
$('#downloadReport').addEventListener('click',()=>{
 if(!data.length){$('#plannerFeedback').textContent='Create a schedule first, then download the full report.';return}
 const plans=[...new Map(data.map(c=>[c.planId||c.id,c])).values()];
 const escHtml=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const selected=plans[plans.length-1];
 const groups=plans.map(p=>data.filter(c=>(c.planId||c.id)===(p.planId||p.id)));
 const rec=[['Business / service',selected.businessName],['Business type',typeNames[selected.businessType]||selected.businessType],['Product / service to advertise',selected.offer],['Target customers',selected.audience],['Campaign goal',selected.goal],['Preferred channel',selected.preferredMedia||selected.media],['Schedule start',selected.date],['Monthly advertising budget','TZS '+money(selected.totalBudget)],['Recommendation / creative direction',selected.creative],['Extra notes',selected.notes||'None provided']];
 const rows=rec.map(r=>'<tr><th>'+escHtml(r[0])+'</th><td>'+escHtml(r[1])+'</td></tr>').join('');
 const schedules=groups.map((items,idx)=>{
  const first=items[0]||{};
  return '<section class="page"><h2>Monthly Schedule '+(idx+1)+'</h2><div class="summary"><div><small>Business</small><b>'+escHtml(first.businessName)+'</b></div><div><small>Month</small><b>'+escHtml(items.length?new Date(items[0].date+'T12:00:00').toLocaleDateString('en-GB',{month:'long',year:'numeric'}):'—')+'</b></div><div><small>Budget</small><b>TZS '+money(items.reduce((s,c)=>s+(Number(c.budget)||0),0))+'</b></div><div><small>Scheduled days</small><b>'+items.length+'</b></div></div><table><thead><tr><th>Date</th><th>Platform</th><th>Time</th><th>Detailed task / post / video idea</th><th>Budget (TZS)</th><th>Status</th></tr></thead><tbody>'+items.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(c=>'<tr><td><b>'+escHtml(c.date)+'</b><br>'+escHtml(dayNames[new Date(c.date+'T12:00:00').getDay()])+'</td><td>'+escHtml(c.media)+'</td><td>'+escHtml(c.time||'18:30')+' EAT</td><td>'+escHtml(c.task||c.creative||c.offer)+'<br><small>'+escHtml(c.topic||'Daily marketing activity')+'</small></td><td>'+money(c.budget||0)+'<br>'+ (c.paid?'Paid promotion':'Organic task')+'</td><td>'+escHtml(c.status||'Planned')+'</td></tr>').join('')+'</tbody></table><p class="note">Budget is a planning allocation, not a platform quote or a guarantee of reach or results. Organic tasks have TZS 0 planned media spend.</p></section>';
 }).join('');
 const css='*{box-sizing:border-box}body{font:13px Arial,sans-serif;color:#182330;margin:0;line-height:1.5}.toolbar{background:#071522;color:white;padding:12px 4%;display:flex;justify-content:space-between;align-items:center}.toolbar button{background:#f2bf55;border:0;border-radius:7px;padding:10px 14px;font-weight:bold;cursor:pointer}.sheet{max-width:1100px;margin:24px auto;padding:32px}.brand{border-bottom:3px solid #e8b548;padding-bottom:16px;display:flex;justify-content:space-between;gap:20px}.brand h1{font-size:25px;margin:6px 0;color:#102233}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:bold;color:#946414}.meta{text-align:right;color:#657487}.page{margin-top:28px}.page h2{font-size:19px;color:#102233;border-bottom:1px solid #d9e0e7;padding-bottom:8px}.details,.page table{width:100%;border-collapse:collapse}.details th,.details td,.page td,.page th{border:1px solid #d8e0e7;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}.details th{background:#f4f6f8;width:28%}.page th{background:#102233;color:white;font-size:10px}.page td{font-size:10px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.summary div{border:1px solid #d8e0e7;border-radius:7px;padding:10px}.summary small{display:block;color:#657487;text-transform:uppercase;font-size:9px}.summary b{display:block;margin-top:5px}.note{font-size:10px;background:#f6f7f8;border-left:3px solid #e8b548;padding:9px;color:#586779}.foot{margin-top:30px;border-top:1px solid #ddd;padding-top:12px;color:#657487;font-size:10px}@page{size:A4 landscape;margin:10mm}@media print{.toolbar{display:none}.sheet{max-width:none;margin:0;padding:0}.page{break-before:page}.page:first-of-type{break-before:auto}thead{display:table-header-group}tr{break-inside:avoid}.page table{table-layout:fixed}.page td,.page th{font-size:9px;padding:6px}}@media(max-width:700px){.sheet{padding:16px}.summary{grid-template-columns:repeat(2,1fr)}.brand{display:block}.meta{text-align:left}.page{overflow-x:auto}.page table{min-width:780px}}';
 const reportHtml='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NDOA Full Campaign Report</title><style>'+css+'</style></head><body><div class="toolbar"><b>NDOA · FULL CAMPAIGN REPORT</b><div><button id="makePdf" type="button">Download PDF</button> <button onclick="window.print()">Print report</button></div></div><main class="sheet"><header class="brand"><div><div class="eyebrow">NDOA · SMART ADVERTISING PLANNER</div><h1>Campaign Recommendation & Monthly Schedule</h1><p>Complete report: form details, recommendations, daily content ideas, platforms, times and budget.</p></div><div class="meta">Generated<br><b>'+escHtml(new Date().toLocaleString('en-GB'))+'</b><br>East Africa Time (EAT)</div></header><section class="page"><h2>01 · Recommendation & Form Details</h2><table class="details"><tbody>'+rows+'</tbody></table><h3>Suggested campaign direction</h3><p>'+escHtml(selected.creative||selected.task)+'</p><div class="summary"><div><small>Suggested channel</small><b>'+escHtml(selected.media)+'</b></div><div><small>Recommended time</small><b>'+escHtml(selected.time||'18:30')+' EAT</b></div><div><small>Monthly budget</small><b>TZS '+money(selected.totalBudget)+'</b></div><div><small>Scheduled days</small><b>'+groups[groups.length-1].length+'</b></div></div><p class="note">Recommendations are planning guidance, not guaranteed analytics. Actual ad costs and reach vary. The planner does not publish ads automatically.</p></section>'+schedules+'<p class="foot">NDOA Smart Advertising Planner · Keep this report for later review. Status values describe planned tasks only and do not confirm that content has been published.</p></main></main><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"><\/script><script>document.getElementById("makePdf").addEventListener("click",function(){try{if(!window.jspdf||!window.jspdf.jsPDF)throw new Error("PDF library did not load. Connect to the internet and try again.");var doc=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a4"});var margin=12;doc.setFont("helvetica","bold");doc.setFontSize(17);doc.text("NDOA Campaign Recommendation and Monthly Schedule",margin,15);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Generated: "+new Date().toLocaleString(),margin,21);var tables=document.querySelectorAll("table");tables.forEach(function(table,index){if(index>0)doc.addPage("a4","landscape");var head=Array.from(table.querySelectorAll("thead th")).map(function(x){return x.innerText.trim()});var body=Array.from(table.querySelectorAll("tbody tr")).map(function(tr){return Array.from(tr.querySelectorAll("th,td")).map(function(td){return td.innerText.trim()})});if(!head.length){var first=table.querySelector("tr");head=first?Array.from(first.querySelectorAll("th,td")).map(function(x){return x.innerText.trim()}):[];body=Array.from(table.querySelectorAll("tr")).slice(1).map(function(tr){return Array.from(tr.querySelectorAll("th,td")).map(function(td){return td.innerText.trim()})})}doc.autoTable({startY:index===0?27:15,head:head.length?[head]:[],body:body,theme:"grid",styles:{fontSize:7,cellPadding:2,overflow:"linebreak"},headStyles:{fillColor:[16,34,51]},margin:{left:margin,right:margin}})});doc.save("NDOA-Campaign-Report.pdf")}catch(e){alert("PDF creation failed: "+e.message+". Please use Print report as a fallback.")}});<\/script></body></html>';
 const blob=new Blob([reportHtml],{type:'text/html;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;
 a.download='NDOA-Campaign-Report-'+(selected.date||iso(new Date()))+'.html';
 a.style.display='none';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
 $('#plannerFeedback').textContent='Full report downloaded as HTML. Open it and choose Download PDF; Print report is available as a backup.';
});
const calPanel=$('#calendar')?.closest('.planner-panel');if(calPanel)calPanel.hidden=!data.length;const hint=document.createElement('p');hint.id='calendarHint';hint.className='microcopy mt-3';hint.textContent=data.length?'Your saved daily plan is shown below.':'Create a schedule to display the detailed calendar here.';$('#calendar')?.after(hint);recommendation();drawList();drawCalendar();
})();