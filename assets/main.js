(()=>{'use strict';
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const booking=document.querySelector('#bookingForm')||document.querySelector('#contactForm');
if(booking)booking.addEventListener('submit',e=>{e.preventDefault();const r=document.querySelector('#result');if(r){r.hidden=false;r.textContent='Your details are filled in, but this website has no online delivery connection configured yet. Contact the business directly; your appointment is not confirmed.'}});
const form=document.querySelector('#campaignForm');
if(form){
 const $=s=>document.querySelector(s);
 const fields=['businessType','businessName','offer','audience','goal','preferredMedia','startDate','budget','frequency','notes'];
 let data=[];try{data=JSON.parse(localStorage.getItem('ndoa_campaigns')||'[]')}catch(e){}
 const today=new Date();today.setHours(0,0,0,0);
 const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 $('#startDate').min=iso(today);$('#startDate').value=iso(today);
 let month=new Date(today.getFullYear(),today.getMonth(),1);
 const typeNames={carScanner:'Car scanner / computer diagnostics',carRepair:'Car repair / garage',carSales:'Cars for sale / car dealer',hotel:'Hotel / lodge / restaurant',fashion:'Clothes / fashion / beauty',electronics:'Electronics / phones / computers',realEstate:'Houses / rentals / real estate',education:'School / training / tuition',tourism:'Tourism / trips / transport',other:'Other business or service'};
 const mediaByType={carScanner:['WhatsApp Status','Facebook','Google Business Profile'],carRepair:['WhatsApp Status','Facebook','Google Business Profile'],carSales:['Facebook','Instagram','TikTok'],hotel:['Instagram','Facebook','WhatsApp Status'],fashion:['Instagram','TikTok','WhatsApp Status'],electronics:['Facebook','TikTok','WhatsApp Status'],realEstate:['Facebook','WhatsApp Status','Website'],education:['Facebook','WhatsApp Status','YouTube'],tourism:['Instagram','TikTok','Facebook'],other:['WhatsApp Status','Facebook','Instagram']};
 const imageByType={carScanner:'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=85',carRepair:'https://images.unsplash.com/photo-1632823471565-1ecdf5c6f1b4?auto=format&fit=crop&w=1000&q=85',carSales:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85',hotel:'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',fashion:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',electronics:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=85',realEstate:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',education:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=85',tourism:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',other:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85'};\n const creativeByType={carScanner:'Show the scanner connected to a vehicle, explain which warning/fault it helps investigate, show your location and invite drivers to call or WhatsApp for a scan.',carRepair:'Show a real repair or diagnostic check, explain the customer benefit and invite people to request a quote.',carSales:'Use clear photos/video, price, key specifications, condition and a direct enquiry action.',hotel:'Show attractive real photos/video, location, key experience or offer and a simple booking/contact action.',fashion:'Use a short vertical video or carousel showing the product, price, available sizes/colours and ordering method.',electronics:'Demonstrate the product working, list the key specifications, price and how customers can order.',realEstate:'Show clear property photos/video, area, price/rent, main features and a viewing/contact action.',education:'Highlight the course or programme, who it is for, outcome, intake dates and how to register.',tourism:'Show the experience visually, trip date, inclusions, price if known and how to reserve a place.',other:'Show the product/service in use, explain one clear benefit, identify who it is for and include one direct call to action.'};
 const times={Instagram:'19:00',Facebook:'18:30',TikTok:'19:30', 'WhatsApp Status':'07:30',YouTube:'18:00','Google Business Profile':'10:00',Website:'10:00',LinkedIn:'09:00',Radio:'07:15','Outdoor posters':'09:00','Multi-platform':'18:30'};
 const weekdays={Instagram:[2,3,4,5,6],Facebook:[2,3,4,5,6],TikTok:[3,4,5,6], 'WhatsApp Status':[1,2,3,4,5,6],YouTube:[4,5,6], 'Google Business Profile':[1,2,3,4,5,6],Website:[1,2,3,4,5],LinkedIn:[2,3,4],Radio:[1,2,3,4,5,6], 'Outdoor posters':[1,2,3,4,5,6], 'Multi-platform':[3,4,5,6]};
 const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 const money=n=>new Intl.NumberFormat('en-TZ',{maximumFractionDigits:0}).format(Number(n)||0);
 function recommendation(){
  const type=$('#businessType').value,preferred=$('#preferredMedia').value,media=preferred==='auto'?mediaByType[type][0]:preferred;
  const start=$('#startDate').value?new Date($('#startDate').value+'T12:00:00'):new Date();
  const suitable=weekdays[media]||[2,3,4,5,6];let d=new Date(start);let count=0;while(!suitable.includes(d.getDay())&&count<7){d.setDate(d.getDate()+1);count++}
  const offer=$('#offer').value.trim();const business=$('#businessName').value.trim();
  $('#recWhat').textContent=(business||typeNames[type])+ (offer?' — '+offer:' — '+typeNames[type]);
  $('#recMedia').textContent=preferred==='auto'?mediaByType[type].join(' + '):media;
  $('#recDate').textContent=dayNames[d.getDay()]+', '+d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  $('#recTime').textContent=(times[media]||'18:30')+' EAT (UTC+3)';
  $('#recBudget').textContent='TZS '+money($('#budget').value);
  $('#recCreative').textContent=creativeByType[type];
  const dayText=dayNames[d.getDay()]+', '+d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  $('#recSummary').textContent='Promote '+(offer||typeNames[type])+' on '+media+' on '+dayText+' at '+(times[media]||'18:30')+' EAT. Planned budget: TZS '+money($('#budget').value)+'.';
  const image=$('#recImage');if(image){image.src=imageByType[type]||imageByType.other;image.alt=typeNames[type]+' advertising visual';}
  const caption=$('#recImageCaption');if(caption)caption.textContent=creativeByType[type];
  return {type,media,date:iso(d),time:times[media]||'18:30',creative:creativeByType[type]};
 }
 fields.forEach(name=>{const el=form.elements.namedItem(name);if(el)el.addEventListener('input',recommendation);if(el)el.addEventListener('change',recommendation)});
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function drawList(){
  const list=$('#campaignList');
  list.innerHTML=data.length?data.map((c,i)=>'<article class="saved-campaign"><div><h4>'+esc(c.businessName||c.name||'Untitled campaign')+'</h4><p><strong>Promote:</strong> '+esc(c.offer||c.name||'Product/service')+'</p><p>📣 '+esc(c.media||c.platform||'Media not selected')+' · 📅 '+esc(c.date||'')+' at '+esc(c.time||'18:30')+' EAT</p><p>💰 TZS '+money(c.budget)+' · '+esc(c.frequency||'One-time')+'</p><p>'+esc(c.creative||c.notes||'')+'</p><span class="tag">'+esc(c.status||'Planned')+'</span></div><div><button class="btn-danger-soft" type="button" data-delete="'+i+'">Delete</button></div></article>').join(''):'<p class="empty-state">No plans saved yet. Fill the form and save your first campaign.</p>';
 }
 function drawCalendar(){
  const cal=$('#calendar'),y=month.getFullYear(),mo=month.getMonth(),start=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
  $('#monthLabel').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>'<div class="calhead">'+x+'</div>').join('');
  for(let i=0;i<start;i++)h+='<div class="calcell"></div>';
  for(let day=1;day<=days;day++){const key=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');h+='<div class="calcell">'+day+data.filter(c=>c.date===key).map(c=>'<small title="'+esc(c.businessName||c.name||'Campaign')+'">'+esc(c.businessName||c.name||c.offer||'Campaign')+'</small>').join('')+'</div>'}
  cal.innerHTML=h;
 }
 function persist(){localStorage.setItem('ndoa_campaigns',JSON.stringify(data));drawList();drawCalendar()}
 form.addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(form).entries());const rec=recommendation();data.push({...f,name:f.businessName,media:rec.media,date:rec.date,time:rec.time,creative:rec.creative,status:'Planned',createdAt:new Date().toISOString()});persist();$('#plannerFeedback').textContent='Plan saved. Your recommended date, time, media and budget are now in the campaign list and calendar. Remember: this does not publish the advert automatically.';});
 $('#campaignList').addEventListener('click',e=>{const b=e.target.closest('[data-delete]');if(b){data.splice(Number(b.dataset.delete),1);persist()}});
 $('#prevMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);drawCalendar()});
 $('#nextMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);drawCalendar()});
 $('#resetPlanner').addEventListener('click',()=>{form.reset();$('#startDate').value=iso(today);$('#plannerFeedback').textContent='Form cleared. Choose your business and the planner will suggest a new schedule.';recommendation()});
 $('#exportCsv').addEventListener('click',()=>{if(!data.length){$('#plannerFeedback').textContent='Save a campaign first, then export it.';return}const rows=[['Business','Business type','Offer','Audience','Goal','Media','Recommended date','Time EAT','Budget TZS','Frequency','Creative idea','Notes'],...data.map(c=>[c.businessName,c.businessType,c.offer,c.audience,c.goal,c.media,c.date,c.time,c.budget,c.frequency,c.creative,c.notes])];const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.download='ndoa-advertising-plan.csv';a.click();URL.revokeObjectURL(a.href)});
 recommendation();drawList();drawCalendar();
}
})();