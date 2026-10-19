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
 const image=$('#recImage');if(image){image.src=imageByType[type]||imageByType.other;image.alt=typeNames[type]+' advertising visual'}
 const caption=$('#recImageCaption');if(caption)caption.textContent=creativeByType[type];
 return {type,media,date:iso(d),time:mediaTimes[media]||'18:30',creative:creativeByType[type]};
}
form.querySelectorAll('input,select,textarea').forEach(el=>{el.addEventListener('input',recommendation);el.addEventListener('change',recommendation)});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const weekly=[
 {day:1,media:'WhatsApp Status',time:'07:30',task:'Post a clear photo, price/offer and contact details to WhatsApp Status. Reply to enquiries.',paid:false},
 {day:2,media:'Facebook',time:'19:00',task:'Publish a targeted Facebook promotion. Use a strong image/video, location, clear benefit and call-to-action.',paid:true},
 {day:3,media:'TikTok',time:'19:30',task:'Post a short vertical demonstration/story. Hook viewers in the first seconds and tell them how to contact/order.',paid:true},
 {day:4,media:'WhatsApp Status',time:'12:30',task:'Answer common questions, share a customer FAQ or behind-the-scenes clip; follow up with interested customers.',paid:false},
 {day:5,media:'Facebook',time:'19:00',task:'Run the second Facebook promotion with a different creative or offer. Track messages, calls and enquiries.',paid:true},
 {day:6,media:'YouTube',time:'18:00',task:'Publish a useful short video/demo or, if budget and video assets permit, promote the video on YouTube.',paid:true},
 {day:0,media:'WhatsApp Status + review',time:'18:00',task:'Share a weekly recap organically. Review views, messages, leads and sales; prepare next week’s content.',paid:false}
];
function buildMonthlyPlan(start,budget,type,business,offer,notes,goal){
 const first=new Date(start+'T12:00:00'),last=new Date(first.getFullYear(),first.getMonth()+1,0,12),days=[];
 for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)){const item=weekly[d.getDay()];days.push({...item,date:iso(d),businessType:type,businessName:business,offer,audience:'',goal,notes,creative:creativeByType[type],status:'Planned'});}
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
 $('#monthLabel').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
 let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>'<div class="calhead">'+x+'</div>').join('');
 for(let i=0;i<start;i++)h+='<div class="calcell"></div>';
 for(let day=1;day<=days;day++){const key=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');h+='<div class="calcell">'+day+data.filter(c=>c.date===key).map(c=>'<small title="'+esc(c.task||c.businessName||'Campaign')+'">'+esc(c.media||'Task')+'<br>'+esc(c.time||'')+'<br>TZS '+money(c.budget)+'</small>').join('')+'</div>'}
 cal.innerHTML=h;
}
function persist(){try{localStorage.setItem('ndoa_campaigns',JSON.stringify(data));drawList();drawCalendar();return true}catch(e){$('#plannerFeedback').textContent='Browser storage is unavailable or full. Export your plans or enable site storage and try again.';return false}}
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const f=Object.fromEntries(new FormData(form).entries()),budget=Number(f.budget);
 if(!Number.isFinite(budget)||budget<0){$('#plannerFeedback').textContent='Enter a valid monthly budget in TZS.';return}
 const plan=buildMonthlyPlan(f.startDate,budget,f.businessType,f.businessName,f.offer,f.notes,f.goal);
 plan.forEach(x=>{x.audience=f.audience;x.preferredMedia=f.preferredMedia});
 data.push(...plan);
 if(persist())$('#plannerFeedback').textContent='Saved a full Monday–Sunday plan for '+plan.length+' days. Paid budget TZS '+money(budget)+' is split across '+plan.filter(x=>x.paid).length+' Facebook/TikTok/YouTube promotion days. Organic days are budgeted at TZS 0. Prices are estimates/your spending cap, not fixed platform rates. Export CSV to keep a copy.';
});
$('#campaignList').addEventListener('click',e=>{const b=e.target.closest('[data-delete]');if(b){const item=data.find(c=>c.id===b.dataset.delete);if(item&&item.planId)data=data.filter(c=>c.planId!==item.planId);else data=data.filter(c=>c.id!==b.dataset.delete);persist();$('#plannerFeedback').textContent='Entire monthly plan deleted.'}});
$('#prevMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);drawCalendar()});
$('#nextMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);drawCalendar()});
$('#resetPlanner').addEventListener('click',()=>{form.reset();$('#startDate').value=iso(today);$('#plannerFeedback').textContent='Form cleared. Choose your business and budget to generate a new weekly plan.';recommendation()});
$('#exportCsv').addEventListener('click',()=>{if(!data.length){$('#plannerFeedback').textContent='Save a campaign first, then export it.';return}const rows=[['Date','Weekday','Business','Business type','Task','Platform','Time EAT','Paid?','Daily spend TZS','Monthly budget TZS','Creative idea','Notes'],...data.map(c=>[c.date,dayNames[new Date(c.date+'T12:00:00').getDay()],c.businessName,c.businessType,c.task,c.media,c.time,c.paid?'Yes':'No',c.budget,c.totalBudget,c.creative,c.notes])];const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.href=url;a.download='ndoa-monday-sunday-monthly-plan.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
recommendation();drawList();drawCalendar();
})();