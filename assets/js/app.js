const WEDDING_DATE=new Date("2026-12-19T10:00:00+03:00");
$(window).on("load",function(){$("#preloader").fadeOut(700);});
$(window).on("scroll",function(){$(".wedding-nav").toggleClass("scrolled",window.scrollY>40);});
function pad(n){return String(Math.max(0,n)).padStart(2,"0")}
function tick(){let diff=WEDDING_DATE-new Date();if(diff<0)diff=0;$("#days").text(pad(Math.floor(diff/86400000)));$("#hours").text(pad(Math.floor(diff/3600000)%24));$("#minutes").text(pad(Math.floor(diff/60000)%60));$("#seconds").text(pad(Math.floor(diff/1000)%60));$("#weddingDateLabel").text(WEDDING_DATE.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}).toUpperCase())}
tick();setInterval(tick,1000);
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$(e.target).animate({opacity:1},700);$(e.target).css("transform","translateY(0)");observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
$("#rsvpForm").on("submit",function(e){e.preventDefault();const data=Object.fromEntries(new FormData(this));localStorage.setItem("wedding_rsvp",JSON.stringify({...data,submittedAt:new Date().toISOString()}));this.reset();$("#rsvpSuccess").prop("hidden",false);});
$("#musicBtn").on("click",function(){const a=document.getElementById("weddingAudio");if(!a.src){alert("Add the couple's licensed wedding song as assets/audio/wedding-song.mp3, then click again.");return}if(a.paused){a.play();$(this).find("span").text("Pause song")}else{a.pause();$(this).find("span").text("Our song")}});
$(function(){if(window.gsap){gsap.from(".hero-content>*",{y:30,opacity:0,duration:1,stagger:.12,ease:"power2.out",delay:.2})}});
