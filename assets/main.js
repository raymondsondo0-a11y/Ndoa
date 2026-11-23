(()=>{'use strict';
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const booking=document.querySelector('#bookingForm')||document.querySelector('#contactForm');
if(booking)booking.addEventListener('submit',e=>{e.preventDefault();const r=document.querySelector('#result');if(r){r.hidden=false;r.textContent='Your details are filled in, but this website has no online delivery connection configured yet. Contact the business directly; your appointment is not confirmed.'}});
const form=document.querySelector('#campaignForm'); if(!form)return;
const $=s=>document.querySelector(s);
// Start every visit with an empty working plan. Old saved reports are never used as input.
let data=[];
let hasGeneratedPlan=false;
const today=new Date();today.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
$('#startDate').min=iso(today);$('#startDate').value=iso(today);
let selectedPhotoData='';
const photoInput=$('#businessPhoto'),photoPreview=$('#businessPhotoPreview'),photoThumb=$('#businessPhotoThumb'),photoName=$('#businessPhotoName');
if(photoInput){photoInput.addEventListener('change',()=>{const file=photoInput.files&&photoInput.files[0];if(!file)return;if(!file.type.startsWith('image/')){photoInput.value='';$('#plannerFeedback').textContent='Please choose an image file.';return;}if(file.size>8*1024*1024){photoInput.value='';$('#plannerFeedback').textContent='Choose an image smaller than 8 MB.';return;}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');const scale=Math.min(1,1400/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);selectedPhotoData=canvas.toDataURL('image/jpeg',0.82);photoThumb.src=selectedPhotoData;photoName.textContent=file.name+' · ready for your report';photoPreview.hidden=false;recommendation();};img.onerror=()=>{$('#plannerFeedback').textContent='This image could not be opened. Try another photo.'};img.src=reader.result;};reader.readAsDataURL(file);});}
const removePhoto=$('#removeBusinessPhoto');if(removePhoto)removePhoto.addEventListener('click',()=>{selectedPhotoData='';if(photoInput)photoInput.value='';if(photoPreview)photoPreview.hidden=true;recommendation();});
let month=new Date(today.getFullYear(),today.getMonth(),1);
const typeNames={carScanner:'Car scanner / computer diagnostics',carRepair:'Car repair / garage',carSales:'Cars for sale / car dealer',hotel:'Hotel / lodge / restaurant',fashion:'Clothes / fashion / beauty',electronics:'Electronics / phones / computers',realEstate:'Houses / rentals / real estate',education:'School / training / tuition',tourism:'Tourism / trips / transport',other:'Other business or service'};
const imageByType={carScanner:'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=85',carRepair:'https://images.unsplash.com/photo-1632823471565-1ecdf5c6f1b4?auto=format&fit=crop&w=1000&q=85',carSales:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85',hotel:'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',fashion:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',electronics:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=85',realEstate:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',education:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=85',tourism:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',other:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85'};
const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const money=n=>new Intl.NumberFormat('en-TZ',{maximumFractionDigits:0}).format(Number(n)||0);
function recommendation(){
 if(!hasGeneratedPlan||!data.length)return;
 const first=data[0],channels=[...new Set(data.map(x=>x.media).filter(Boolean))];
 const sw=window.primonizerLanguage==='sw';
 $('#recWhat').textContent=(first.businessName||first.businessType||'Business')+' — '+(first.offer||'Product / service');
 $('#recMedia').textContent=channels.join(' · ');
 $('#recDate').textContent=new Date(first.date+'T12:00:00').toLocaleDateString(sw?'sw-TZ':'en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('#recTime').textContent=(first.time||'18:00')+' EAT (UTC+3)';
 const paidTotal=data.reduce((sum,x)=>sum+(Number(x.budget)||0),0);
 $('#recBudget').textContent='TZS '+money(first.totalBudget||0)+' total · TZS '+money(paidTotal)+' allocated to paid promotion';
 $('#recCreative').textContent=first.aiStrategy||first.task||'AI-generated campaign strategy';
 $('#recSummary').textContent=first.aiSummary||'AI created this schedule from the business details entered in the form.';
 const image=$('#recImage');if(image){image.src=selectedPhotoData||imageByType.other;image.alt='Customer-provided business image or general campaign visual';}
 const caption=$('#recImageCaption');if(caption)caption.textContent=sw?'Mpango huu umetengenezwa na AI kwa kutumia taarifa ulizoingiza.':'This plan was generated by AI from the details you entered.';
}
form.querySelectorAll('input,select,textarea').forEach(el=>{
 el.addEventListener('input',()=>{hasGeneratedPlan=false;const box=$('#generatedRecommendation'),cal=$('#calendarPanel'),saved=$('#savedCampaignPanel');if(box)box.hidden=true;if(cal)cal.hidden=true;if(saved)saved.hidden=true;});
 el.addEventListener('change',()=>{hasGeneratedPlan=false;const box=$('#generatedRecommendation'),cal=$('#calendarPanel'),saved=$('#savedCampaignPanel');if(box)box.hidden=true;if(cal)cal.hidden=true;if(saved)saved.hidden=true;});
});
document.addEventListener('primonizer:languagechange',()=>{recommendation();drawList();drawCalendar();});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function drawList(){
 const list=$('#campaignList');
 list.innerHTML=data.length?data.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(c=>'<article class="saved-campaign"><div><h4>'+esc(c.businessName||c.name||'Untitled campaign')+' · '+esc(c.date||'')+'</h4><p><strong>Task:</strong> '+esc(c.task||c.offer||c.name||'Promote product/service')+'</p><p>📣 '+esc(c.media||c.platform||'Media not selected')+' · ⏰ '+esc(c.time||'18:30')+' EAT</p><p>💰 '+(c.paid?'Paid promotion budget: TZS '+money(c.budget):'Organic task: TZS 0 planned')+'</p><p>'+esc(c.creative||c.notes||'')+'</p><span class="tag">'+esc(c.status||'Planned')+'</span></div><div><button class="btn-danger-soft" type="button" data-delete="'+esc(c.id)+'">Delete plan</button></div></article>').join(''):'<p class="empty-state">No plans saved yet. Fill the form and save a monthly plan.</p>';
}
function drawCalendar(){
 const cal=$('#calendar'),y=month.getFullYear(),mo=month.getMonth(),start=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
 const sw=window.primonizerLanguage==='sw';$('#monthLabel').textContent=month.toLocaleDateString(sw?'sw-TZ':'en-GB',{month:'long',year:'numeric'})+' — '+(sw?'Kalenda ya maudhui ya kila siku':'Daily content calendar');
 const latestPlanId=data[data.length-1]?.planId;const currentPlan=latestPlanId?data.filter(c=>c.planId===latestPlanId):data;const monthData=currentPlan.filter(c=>(c.date||'').slice(0,7)===y+'-'+String(mo+1).padStart(2,'0'));
 let h=(sw?['Jumapili','Jumatatu','Jumanne','Jumatano','Alhamisi','Ijumaa','Jumamosi']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']).map(x=>'<div class="calhead">'+x+'</div>').join('');
 for(let i=0;i<start;i++)h+='<div class="calcell cal-empty"></div>';
 for(let day=1;day<=days;day++){
  const key=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),items=monthData.filter(c=>c.date===key);
  h+='<div class="calcell'+(items.length?' has-plan':'')+'"><b class="cal-date">'+day+'</b>'+items.map(c=>'<article class="calendar-task"><span class="calendar-platform">'+esc(c.media||'Task')+'</span><span class="calendar-time">'+esc(c.time||'')+' EAT</span><p>'+esc(c.task||c.offer||'Daily marketing task')+'</p><p><strong>Caption:</strong> '+esc(c.caption||'')+'</p><small class="calendar-budget">'+(c.paid?'Ad budget: TZS '+money(c.budget):'Organic: TZS 0')+'</small></article>').join('')+'</div>';
 }
 cal.innerHTML=h;
 const note=$('#calendarHint');if(note)note.textContent=monthData.length?'This calendar shows '+monthData.length+' daily tasks. Select any date card to read the post/video idea and its platform.':'Create a schedule to display your detailed daily marketing calendar here.';
}
function persist(){try{localStorage.setItem('ndoa_campaigns',JSON.stringify(data));drawList();drawCalendar();return true}catch(e){$('#plannerFeedback').textContent='Browser storage is unavailable or full. Export your plans or enable site storage and try again.';return false}}
form.addEventListener('submit',async e=>{
 window.__ndoaSchedulerHandled=true;
 e.preventDefault();
 if(!form.reportValidity())return;
 const f=Object.fromEntries(new FormData(form).entries()),budget=Number(f.budget);
 const feedback=$('#plannerFeedback'),submitButton=form.querySelector('[type="submit"]');
 if(!Number.isFinite(budget)||budget<0){feedback.textContent='Enter a valid monthly budget in TZS.';return;}
 const originalLabel=submitButton?submitButton.textContent:'';
 if(submitButton){submitButton.disabled=true;submitButton.textContent=window.primonizerLanguage==='sw'?'AI inatengeneza ratiba...':'AI is building your schedule...';}
 feedback.textContent=window.primonizerLanguage==='sw'?'AI inachambua biashara, bajeti na walengwa wako. Tafadhali subiri...':'AI is analysing your business, budget and target customers. Please wait...';
 ['generatedRecommendation','savedCampaignPanel','calendarPanel'].forEach(id=>{const el=$('#'+id);if(el)el.hidden=true;});
 try{
  const response=await fetch('api/plan-campaign.php',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({
   businessType:f.businessType,businessName:f.businessName,offer:f.offer,audience:f.audience,goal:f.goal,
   preferredMedia:f.preferredMedia,startDate:f.startDate,budget:budget,notes:f.notes||'',
   language:window.primonizerLanguage==='sw'?'Swahili':'English'
  })});
  let result={};try{result=await response.json();}catch(parseError){throw new Error('The AI service returned an unreadable response. Please try again.');}
  if(!response.ok||!result.success)throw new Error(result.message||'AI campaign planning failed. Please try again.');
  const planId='ai-plan-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),aiPlan=result.plan;
  if(!aiPlan||!Array.isArray(aiPlan.days)||!aiPlan.days.length)throw new Error('AI did not return a complete daily schedule. Please try again.');
  data=aiPlan.days.map(day=>({
   ...day,id:planId+'-'+day.date,planId,status:'Planned',
   businessType:f.businessType,businessName:f.businessName,offer:f.offer,audience:f.audience,
   goal:f.goal,notes:f.notes||'',preferredMedia:f.preferredMedia,
   media:day.channel||day.media,creative:day.task,totalBudget:budget,
   aiSummary:aiPlan.summary||'',aiStrategy:aiPlan.strategy||'',
   budget:Number(day.budget)||0,paid:!!day.paid
  }));
  if(selectedPhotoData){try{localStorage.setItem('ndoa_photo_'+planId,selectedPhotoData);data.forEach(x=>x.customPhotoKey='ndoa_photo_'+planId);}catch(photoError){feedback.textContent='AI schedule is ready. The selected photo could not be saved in this browser.';}}
  month=new Date(f.startDate+'T12:00:00');hasGeneratedPlan=true;
  if(persist()){
   const calPanel=$('#calendarPanel');if(calPanel){calPanel.hidden=false;calPanel.scrollIntoView({behavior:'smooth',block:'start'});}
   const savedPanel=$('#savedCampaignPanel');if(savedPanel)savedPanel.hidden=false;
   const recommendationPanel=$('#generatedRecommendation');if(recommendationPanel)recommendationPanel.hidden=false;
   recommendation();drawCalendar();
   const paidTotal=data.reduce((sum,x)=>sum+(Number(x.budget)||0),0),unused=Math.max(0,budget-paidTotal);
   feedback.textContent=(window.primonizerLanguage==='sw'?'Ratiba imetengenezwa na AI kwa siku ':'AI generated your schedule for ')+data.length+(window.primonizerLanguage==='sw'?' siku. Bajeti iliyopangwa kwa matangazo ya kulipia: TZS ':' days. Budget allocated to paid promotion: TZS ')+money(paidTotal)+(unused>0?(window.primonizerLanguage==='sw'?'. Bajeti ambayo haijatumika: TZS ':'. Unallocated budget: TZS ')+money(unused):'')+'. '+(window.primonizerLanguage==='sw'?'Kila jukumu limetokana na taarifa ulizoweka.':'Every task is based on the details you supplied.');
  }else{feedback.textContent='AI schedule created, but this browser could not save it. Export it before leaving this page.';}
 }catch(error){
  feedback.textContent=(window.primonizerLanguage==='sw'?'AI haikuweza kutengeneza ratiba: ':'AI could not create the schedule: ')+(error.message||'Unknown error')+' '+(window.primonizerLanguage==='sw'?'Tafadhali jaribu tena baadaye.':'Please try again later.');
 }finally{
  if(submitButton){submitButton.disabled=false;submitButton.textContent=originalLabel;}
 }
});
const printButton=$('#printReport');
if(printButton)printButton.addEventListener('click',()=>{
 if(!data.length){$('#plannerFeedback').textContent='Create a schedule first, then print the full report.';return}
 const plans=[...new Map(data.map(c=>[c.planId||c.id,c])).values()];
 const selected=plans[plans.length-1];
 const items=data.filter(c=>(c.planId||c.id)===(selected.planId||selected.id)).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const escHtml=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const photo=(selected.customPhotoKey&&localStorage.getItem(selected.customPhotoKey))||imageByType[selected.businessType]||imageByType.other;
 const win=window.open('','_blank');
 if(!win){$('#plannerFeedback').textContent='Allow pop-ups for this website, then tap Print Report again.';return}
 const details=[
  ['Business / service',selected.businessName],['Business type',typeNames[selected.businessType]||selected.businessType],
  ['Product / service',selected.offer],['Target customers',selected.audience],['Campaign goal',selected.goal],
  ['Preferred channel',selected.preferredMedia||selected.media],['Schedule starts',selected.date],
  ['Monthly advertising budget','TZS '+money(selected.totalBudget)],['Creative recommendation',selected.creative||selected.task],
  ['Extra notes',selected.notes||'None provided']
 ];
 const detailRows=details.map(r=>'<tr><th>'+escHtml(r[0])+'</th><td>'+escHtml(r[1])+'</td></tr>').join('');
 const scheduleRows=items.map(x=>'<tr><td><b>'+escHtml(x.date)+'</b><br>'+escHtml(dayNames[new Date(x.date+'T12:00:00').getDay()])+'</td><td>'+escHtml(x.media||'—')+'</td><td>'+escHtml(x.time||'18:30')+' EAT</td><td><b>'+escHtml(x.task||x.creative||x.offer||'Daily marketing activity')+'</b><br><br><strong>Caption:</strong> '+escHtml(x.caption||'')+'</td><td>TZS '+money(x.budget||0)+'<br>'+ (x.paid?'Paid promotion':'Organic task')+'</td><td>'+escHtml(x.status||'Planned')+'</td></tr>').join('');
 const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Raymond Campaign Report</title><style>'+
 '*{box-sizing:border-box}html,body{margin:0;font:12px Arial,sans-serif;color:#142334;line-height:1.45}body{background:#eef2f5}.toolbar{position:sticky;top:0;z-index:5;background:#102233;color:white;padding:12px 4%;display:flex;justify-content:space-between;align-items:center;gap:10px}.toolbar button{border:0;border-radius:8px;padding:11px 15px;background:#f2bf55;color:#102233;font-weight:bold;font-size:14px}.bg-photo{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;opacity:.82;z-index:-1;pointer-events:none}.sheet{max-width:1100px;margin:22px auto;padding:26px;background:rgba(255,255,255,.34);border:1px solid rgba(220,170,70,.8);box-shadow:0 10px 35px #10223325}.brand{border-bottom:4px solid #d6a744;padding-bottom:15px;display:flex;justify-content:space-between;gap:15px}.brand h1{font-size:25px;margin:6px 0;color:#102233}.eyebrow{font-weight:bold;letter-spacing:2px;color:#946414;font-size:11px}.meta{text-align:right;color:#64748b}.page{margin-top:22px}.page h2{border-bottom:1px solid #d6a744;padding-bottom:7px;color:#102233;font-size:19px}.details,.schedule{width:100%;border-collapse:collapse;background:rgba(255,255,255,.76)}td,th{border:1px solid #d5dee7;padding:7px;text-align:left;vertical-align:top;overflow-wrap:anywhere}.details th{width:28%;background:rgba(232,238,243,.82)}.schedule th{background:#102233;color:#fff;font-size:10px}.schedule td{font-size:10px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.summary div{border:1px solid #d5dee7;background:rgba(255,255,255,.76);border-radius:7px;padding:10px}.summary small{display:block;color:#64748b;font-size:9px;text-transform:uppercase}.summary b{display:block;margin-top:4px}.note{background:rgba(255,248,226,.84);border-left:4px solid #d6a744;padding:10px}.foot{margin-top:24px;padding-top:10px;border-top:1px solid #d5dee7;color:#64748b;font-size:10px}@page{size:A4 landscape;margin:9mm}@media print{html,body{background:transparent!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.toolbar{display:none}.bg-photo{position:fixed;opacity:.82;width:100%;height:100%;object-fit:cover}.sheet{max-width:none;margin:0;padding:0;border:0;box-shadow:none;background:rgba(255,255,255,.34)}.page{break-before:page}.page:first-of-type{break-before:auto}thead{display:table-header-group}tr{break-inside:avoid}.schedule{table-layout:fixed}.schedule td,.schedule th{font-size:9px;padding:5px}}@media(max-width:700px){.sheet{margin:0;padding:14px}.brand{display:block}.meta{text-align:left}.summary{grid-template-columns:repeat(2,1fr)}.schedule{min-width:760px}.page{overflow-x:auto}}'+
 '</style></head><body><img class="bg-photo" src="'+escHtml(photo)+'" alt=""><div class="toolbar"><b>RAYMOND · CAMPAIGN REPORT</b><div><button onclick="window.print()">Print / Save as PDF ⎙</button></div></div><main class="sheet"><header class="brand"><div><div class="eyebrow">RAYMOND SMART CAMPAIGN PLANNER</div><h1>Campaign Recommendation & Monthly Schedule</h1><p>Personalised report with campaign details, daily content ideas, channels and budget.</p></div><div class="meta">Generated<br><b>'+escHtml(new Date().toLocaleString('en-GB'))+'</b><br>East Africa Time (EAT)</div></header><section class="page"><h2>01 · Your Campaign Details</h2><table class="details"><tbody>'+detailRows+'</tbody></table><div class="summary"><div><small>Business</small><b>'+escHtml(selected.businessName||'—')+'</b></div><div><small>Recommended channel</small><b>'+escHtml(selected.media||'—')+'</b></div><div><small>Monthly budget</small><b>TZS '+money(selected.totalBudget)+'</b></div><div><small>Scheduled days</small><b>'+items.length+'</b></div></div><p><b>Creative direction:</b> '+escHtml(selected.creative||selected.task||'—')+'</p><p class="note">Budget figures are planning allocations, not a guarantee of advertising reach or results. The planner does not publish advertisements automatically.</p></section><section class="page"><h2>02 · Full Daily Schedule</h2><table class="schedule"><thead><tr><th>Date / day</th><th>Platform</th><th>Time</th><th>Daily post / video idea</th><th>Planned budget</th><th>Status</th></tr></thead><tbody>'+scheduleRows+'</tbody></table><p class="foot">Raymond Smart Campaign Planner · Status values describe planned tasks only. They do not confirm that content has been published.</p></section></main><script>window.addEventListener("load",function(){var im=document.querySelector(".bg-photo");if(im&&!im.complete)im.addEventListener("load",function(){}, {once:true});});<\/script></body></html>';
 win.document.open();win.document.write(html);win.document.close();
 $('#plannerFeedback').textContent='Your print-ready report is open in a new tab. It includes a background image matched to the selected business. Tap “Print / Save as PDF” to print it or save a PDF copy.';
});

// Keep the report controls available beside the calendar, even after reloading a saved plan.
const quickDownload=$('#downloadReportQuick');if(quickDownload)quickDownload.addEventListener('click',()=>$('#downloadReport')?.click());
const quickPrint=$('#printReportQuick');if(quickPrint)quickPrint.addEventListener('click',()=>$('#printReport')?.click());
const quickCsv=$('#downloadCsvQuick');if(quickCsv)quickCsv.addEventListener('click',()=>$('#downloadCsv')?.click());
$('#campaignList').addEventListener('click',e=>{const b=e.target.closest('[data-delete]');if(b){const item=data.find(c=>c.id===b.dataset.delete);if(item&&item.planId)data=data.filter(c=>c.planId!==item.planId);else data=data.filter(c=>c.id!==b.dataset.delete);persist();$('#plannerFeedback').textContent='Entire monthly plan deleted.'}});
$('#prevMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);drawCalendar()});
$('#nextMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);drawCalendar()});
$('#resetPlanner').addEventListener('click',()=>{form.reset();$('#startDate').value=iso(today);hasGeneratedPlan=false;['generatedRecommendation','savedCampaignPanel','calendarPanel'].forEach(id=>{const el=$('#'+id);if(el)el.hidden=true;});$('#plannerFeedback').textContent='Form cleared. Enter your requirements to generate a new plan.';});
const downloadCsv=$('#downloadCsv');
if(downloadCsv)downloadCsv.addEventListener('click',()=>{
 if(!data.length){$('#plannerFeedback').textContent='Create a schedule first, then download the full schedule.';return;}
 const latestId=data[data.length-1].planId;
 const items=data.filter(x=>x.planId===latestId).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const fields=[['Date','Day','Business','Offer','Platform','Time EAT','Detailed task','AI caption','Format','Objective','Paid promotion','Budget TZS','Status']];
 items.forEach(x=>fields.push([x.date,dayNames[new Date(x.date+'T12:00:00').getDay()],x.businessName,x.offer,x.media,x.time,x.task,x.caption||'',x.format||'',x.objective||'',x.paid?'Yes':'No',x.budget||0,x.status||'Planned']));
 const csv=fields.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\\r\\n');
 const blob=new Blob(['\\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='NDOA-Full-Schedule-'+items[0].date+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 $('#plannerFeedback').textContent='Full daily schedule downloaded as CSV. You can open it in Excel or Google Sheets.';
});
const reportButton=$('#downloadReport');
if(reportButton)reportButton.addEventListener('click',async()=>{
 if(!data.length){$('#plannerFeedback').textContent='Create a schedule first, then download the full report.';return}
 const originalText=reportButton.textContent;
 reportButton.disabled=true;reportButton.textContent='Preparing PDF…';
 const feedback=$('#plannerFeedback');
 const loadScript=src=>new Promise((resolve,reject)=>{
  const existing=Array.from(document.scripts).find(s=>s.src===src);
  if(existing){
   if(existing.dataset.loaded==='yes'){resolve();return}
   existing.addEventListener('load',resolve,{once:true});
   existing.addEventListener('error',()=>reject(new Error('Could not load PDF component.')),{once:true});
   return;
  }
  const script=document.createElement('script');script.src=src;script.async=true;
  script.onload=()=>{script.dataset.loaded='yes';resolve()};
  script.onerror=()=>reject(new Error('Could not load the PDF library. Check your internet connection and try again.'));
  document.head.appendChild(script);
 });
 try{
  const jspdfUrl='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  const tableUrl='https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
  if(!window.jspdf||!window.jspdf.jsPDF)await loadScript(jspdfUrl);
  if(!window.jspdf||!window.jspdf.jsPDF)throw new Error('PDF engine did not start. Please reload the page and try again.');
  if(!window.jspdf.jsPDF.API.autoTable)await loadScript(tableUrl);
  const plans=[...new Map(data.map(c=>[c.planId||c.id,c])).values()];
  const selected=plans[plans.length-1];
  const items=data.filter(c=>(c.planId||c.id)===(selected.planId||selected.id)).slice().sort((a,b)=>a.date.localeCompare(b.date));
  if(!items.length)throw new Error('No daily schedule was found for this campaign.');
  let reportBackground=null;
  try{
   const photoUrl=(selected.customPhotoKey&&localStorage.getItem(selected.customPhotoKey))||imageByType[selected.businessType]||imageByType.other;
   reportBackground=await new Promise(resolve=>{
    const img=new Image();img.crossOrigin='anonymous';
    const timer=setTimeout(()=>resolve(null),7000);
    img.onload=()=>{
     clearTimeout(timer);
     try{
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=850;
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
      ctx.fillStyle='rgba(255,255,255,0.10)';ctx.fillRect(0,0,canvas.width,canvas.height);
      resolve(canvas.toDataURL('image/jpeg',0.96));
     }catch(e){resolve(null)}
    };
    img.onerror=()=>{clearTimeout(timer);resolve(null)};
    img.src=photoUrl;
   });
  }catch(e){reportBackground=null}
  const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
  if(reportBackground){
   const paintReportBackground=()=>{try{doc.addImage(reportBackground,'JPEG',0,0,297,210,'raymond-report-bg','FAST')}catch(e){}};
   doc.internal.events.subscribe('addPage',paintReportBackground);
   paintReportBackground();
  }
  const margin=12;
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(16,34,51);
  doc.text('Raymond Campaign Recommendation & Schedule',margin,16);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(80,96,112);
  doc.text('Generated: '+new Date().toLocaleString('en-GB')+' | East Africa Time (EAT)',margin,22);
  doc.autoTable({
   startY:27,
   head:[['Campaign detail','Your information']],
   body:[
    ['Business / service',selected.businessName||'—'],
    ['Business type',typeNames[selected.businessType]||selected.businessType||'—'],
    ['Product / service',selected.offer||'—'],
    ['Target customers',selected.audience||'—'],
    ['Campaign goal',selected.goal||'—'],
    ['Preferred channel',selected.preferredMedia||selected.media||'—'],
    ['Schedule start',selected.date||'—'],
    ['Monthly advertising budget','TZS '+money(selected.totalBudget)],
    ['Creative recommendation',selected.creative||selected.task||'—'],
    ['Extra notes',selected.notes||'None provided']
   ],
   theme:'grid',styles:{fontSize:9,cellPadding:3,overflow:'linebreak'},
   headStyles:{fillColor:[16,34,51]},columnStyles:{0:{cellWidth:55},1:{cellWidth:210}},margin:{left:margin,right:margin}
  });
  doc.addPage('a4','landscape');
  doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(16,34,51);
  doc.text('Full Monthly Schedule — '+(selected.businessName||'Campaign'),margin,15);
  doc.autoTable({
   startY:20,
   head:[['Date','Day','Platform','Time (EAT)','Detailed post / video task','Budget (TZS)','Status']],
   body:items.map(c=>[
    c.date||'—',
    dayNames[new Date((c.date||iso(new Date()))+'T12:00:00').getDay()],
    c.media||'—',
    (c.time||'18:30')+' EAT',
    c.task||c.creative||c.offer||'Daily marketing activity',
    money(c.budget||0)+(c.paid?' (paid)':' (organic)'),
    c.status||'Planned'
   ]),
   theme:'grid',styles:{fontSize:7,cellPadding:2,overflow:'linebreak',valign:'top'},
   headStyles:{fillColor:[16,34,51]},columnStyles:{0:{cellWidth:22},1:{cellWidth:20},2:{cellWidth:36},3:{cellWidth:22},4:{cellWidth:112},5:{cellWidth:30},6:{cellWidth:25}},
   margin:{left:margin,right:margin},rowPageBreak:'avoid'
  });
  const pages=doc.getNumberOfPages();
  for(let p=1;p<=pages;p++){doc.setPage(p);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90,100,110);doc.text('Raymond Smart Campaign Planner · Planning estimates only',margin,202);doc.text('Page '+p+' of '+pages,285,202,{align:'right'});}
  doc.save('Raymond-Campaign-Report-'+(selected.date||iso(new Date()))+'.pdf');
  feedback.textContent='Your complete PDF report has been generated. Check your Android Downloads folder; it includes campaign details and every scheduled day.';
 }catch(err){
  feedback.textContent='PDF could not be created: '+(err&&err.message?err.message:'Please check your internet connection and try again.')+' You can still use Download Schedule (Excel / CSV).';
 }finally{
  reportButton.disabled=false;reportButton.textContent=originalText;
 }
});
hasGeneratedPlan=data.length>0;const calPanel=$('#calendarPanel');if(calPanel)calPanel.hidden=!data.length;const savedPanel=$('#savedCampaignPanel');if(savedPanel)savedPanel.hidden=!data.length;const recPanel=$('#generatedRecommendation');if(recPanel)recPanel.hidden=!data.length;const hint=document.createElement('p');hint.id='calendarHint';hint.className='microcopy mt-3';hint.textContent=data.length?'Your saved daily plan is shown below.':'Create a schedule to display the detailed calendar here.';$('#calendar')?.after(hint);recommendation();drawList();drawCalendar();

/* Portable exports: recipients do not need a Primonizer account. */
function latestCampaign(){
 const id=data[data.length-1]?.planId;
 const items=data.filter(x=>x.planId===id).slice().sort((a,b)=>a.date.localeCompare(b.date));
 return {items,selected:items[0]||null};
}
function reportHtml(items){
 const c=items[0]||{},safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const rows=items.map(x=>'<tr><td>'+safe(x.date)+'</td><td>'+safe(dayNames[new Date(x.date+'T12:00:00').getDay()])+'</td><td>'+safe(x.media)+'</td><td>'+safe(x.time)+' EAT</td><td>'+safe(x.task)+'<br><strong>Caption:</strong> '+safe(x.caption||'')+'</td><td>'+safe(x.paid?'Paid':'Organic')+'</td><td>'+money(x.budget||0)+'</td></tr>').join('');
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+safe(c.businessName)+' campaign schedule</title><style>body{font:16px Arial,sans-serif;margin:28px;color:#20242b}h1{font-size:28px}p{line-height:1.5}.meta{background:#f1f2f4;padding:16px;border-radius:12px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border:1px solid #d6d8dc;padding:9px;text-align:left;vertical-align:top}th{background:#eceef1}@media print{body{margin:12mm}tr{break-inside:avoid}}</style><h1>'+safe(c.businessName||'Campaign')+' — Advertising schedule</h1><div class="meta"><p><b>Product/service:</b> '+safe(c.offer)+'</p><p><b>Monthly budget:</b> TZS '+money(c.totalBudget)+'</p><p><b>Campaign goal:</b> '+safe(c.goal)+'</p><p><b>Audience:</b> '+safe(c.audience)+'</p><p><b>Generated:</b> '+new Date().toLocaleString()+'</p></div><table><thead><tr><th>Date</th><th>Day</th><th>Platform</th><th>Time</th><th>Task</th><th>Type</th><th>Budget (TZS)</th></tr></thead><tbody>'+rows+'</tbody></table><p>Shared campaign document. No Primonizer account is required to open this file.</p></html>';
}
function downloadBlob(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
const xlsxButton=$('#downloadXlsx');
if(xlsxButton)xlsxButton.addEventListener('click',async()=>{
 const {items,selected}=latestCampaign();if(!items.length){$('#plannerFeedback').textContent='Create your schedule first.';return;}
 try{
  if(!window.XLSX){await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';sc.onload=resolve;sc.onerror=()=>reject(new Error('Excel library could not load'));document.head.appendChild(sc);});}
  const rows=items.map(x=>({Date:x.date,Day:dayNames[new Date(x.date+'T12:00:00').getDay()],Business:x.businessName,Product_Service:x.offer,Platform:x.media,Time_EAT:x.time,Format:x.format||'',Task:x.task,Caption:x.caption||'',Objective:x.objective||'',Promotion:x.paid?'Paid':'Organic',Budget_TZS:x.budget||0,Status:x.status||'Planned'}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Campaign Schedule');XLSX.writeFile(wb,'Primonizer-'+(selected.date||'schedule')+'.xlsx');
  $('#plannerFeedback').textContent='Excel workbook downloaded. Anyone can open and share it without a Primonizer account.';
 }catch(err){$('#plannerFeedback').textContent='Excel export failed: '+err.message+'. CSV is also available.';}
});
const htmlButton=$('#downloadHtml');
if(htmlButton)htmlButton.addEventListener('click',()=>{const {items,selected}=latestCampaign();if(!items.length){$('#plannerFeedback').textContent='Create your schedule first.';return;}downloadBlob(new Blob([reportHtml(items)],{type:'text/html;charset=utf-8'}),'Primonizer-'+(selected.date||'schedule')+'.html');$('#plannerFeedback').textContent='Standalone HTML report downloaded. It can be opened by anyone without an account.';});
const jsonButton=$('#downloadJson');
if(jsonButton)jsonButton.addEventListener('click',()=>{const {items,selected}=latestCampaign();if(!items.length){$('#plannerFeedback').textContent='Create your schedule first.';return;}downloadBlob(new Blob([JSON.stringify({campaign:items[0],schedule:items,generatedAt:new Date().toISOString()},null,2)],{type:'application/json'}),'Primonizer-'+(selected.date||'schedule')+'.json');$('#plannerFeedback').textContent='JSON data downloaded for sharing or importing into other tools.';});
const shareButton=$('#shareSchedule');
if(shareButton)shareButton.addEventListener('click',async()=>{
 const {items,selected}=latestCampaign();if(!items.length){$('#plannerFeedback').textContent='Create your schedule first.';return;}
 const file=new File([reportHtml(items)],'Primonizer-'+(selected.date||'schedule')+'.html',{type:'text/html'});
 try{
  if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:(selected.businessName||'Campaign')+' schedule',text:'Campaign schedule — open the attached file. No account is needed.',files:[file]});$('#plannerFeedback').textContent='Share sheet opened. Choose WhatsApp, email, Bluetooth or another app.';}
  else{downloadBlob(file,'Primonizer-'+(selected.date||'schedule')+'.html');$('#plannerFeedback').textContent='This browser cannot share files directly. The standalone report was downloaded; attach it to WhatsApp, email or any other app. The recipient needs no account.';}
 }catch(err){if(err.name!=='AbortError')$('#plannerFeedback').textContent='Sharing was unavailable. Download the HTML report and attach it to your preferred app.';}
});

})();