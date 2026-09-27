const WEDDING_DATE=new Date("2026-12-19T10:00:00+03:00");
$(window).on("load",function(){$("#preloader").fadeOut(900);});
$(window).on("scroll",function(){$(".wedding-nav").toggleClass("scrolled",window.scrollY>50);});
function pad(n){return String(Math.max(0,n)).padStart(2,"0")}
function tick(){const d=Math.max(0,WEDDING_DATE-new Date());$("#days").text(pad(Math.floor(d/86400000)));$("#hours").text(pad(Math.floor(d/3600000)%24));$("#minutes").text(pad(Math.floor(d/60000)%60));$("#seconds").text(pad(Math.floor(d/1000)%60));$("#weddingDateLabel").text(WEDDING_DATE.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}).toUpperCase())}
tick();setInterval(tick,1000);

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$(e.target).animate({opacity:1},850);$(e.target).css("transform","translateY(0)");observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

$("a[href^='#']").on("click",function(){const t=$(this).attr("href");if(t&&t!=="#")$("html,body").animate({scrollTop:$(t).offset().top-70},650);});
$("#rsvpForm").on("submit",async function(e){
 e.preventDefault();
 const form=this,btn=$(form).find("button[type=submit]"),label=btn.find("span"),old=label.text();
 btn.prop("disabled",true);label.text("Sending…");
 try{
   const response=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{"Accept":"application/json"}});
   const result=await response.json();
   if(!response.ok||!result.success)throw new Error(result.message||"Unable to send RSVP");
   localStorage.setItem("wedding_rsvp",JSON.stringify({...Object.fromEntries(new FormData(form)),submittedAt:new Date().toISOString()}));
   form.reset();$("#rsvpSuccess").prop("hidden",false).text("Thank you — your RSVP has been received. ♥");
 }catch(err){
   $("#rsvpSuccess").prop("hidden",false).text("We could not send your RSVP right now. Please try again.");
 }
 btn.prop("disabled",false);label.text(old);
});
$("#musicBtn").on("click",function(){const a=document.getElementById("weddingAudio");if(!a.src){alert("Add the couple's licensed wedding song as assets/audio/wedding-song.mp3, then click again.");return}if(a.paused){a.play();$(this).find("span").text("Pause song")}else{a.pause();$(this).find("span").text("Our song")}});

$(function(){
if(window.gsap){gsap.from(".hero-kicker",{y:25,opacity:0,duration:1,delay:.2});gsap.from(".hero h1",{y:55,opacity:0,duration:1.25,delay:.35,ease:"power3.out"});gsap.from(".hero-script,.hero-meta,.hero-actions",{y:25,opacity:0,duration:.8,stagger:.12,delay:.8,ease:"power2.out"});}
});

(function(){
const canvas=document.getElementById("loveCanvas");
if(!canvas||!window.THREE)return;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100);
camera.position.z=9;
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
const group=new THREE.Group();scene.add(group);
const count=180,positions=new Float32Array(count*3);
for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*14;positions[i*3+1]=(Math.random()-.5)*8;positions[i*3+2]=(Math.random()-.5)*4;}
const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(positions,3));
const mat=new THREE.PointsMaterial({color:0xc69b61,size:.035,transparent:true,opacity:.48,sizeAttenuation:true});
const points=new THREE.Points(geo,mat);group.add(points);
const ringGeo=new THREE.TorusGeometry(2.7,.006,12,180),ringMat=new THREE.MeshBasicMaterial({color:0xc69b61,transparent:true,opacity:.12});
const ring=new THREE.Mesh(ringGeo,ringMat);ring.rotation.x=1.1;group.add(ring);
function animate(t){points.rotation.y=t*.000025;points.rotation.x=Math.sin(t*.00015)*.05;ring.rotation.z=t*.00006;renderer.render(scene,camera);requestAnimationFrame(animate)}
requestAnimationFrame(animate);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
})();

$(function(){
 if(window.Swiper){
   new Swiper(".wedding-swiper",{
     loop:true,grabCursor:true,speed:900,spaceBetween:18,
     autoplay:{delay:4200,disableOnInteraction:false},
     pagination:{el:".swiper-pagination",clickable:true},
     navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"},
     breakpoints:{0:{slidesPerView:1.15},576:{slidesPerView:2},992:{slidesPerView:3}}
   });
 }
});
