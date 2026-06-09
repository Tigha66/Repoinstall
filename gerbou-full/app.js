// shared site script
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav&&nav.classList.toggle('solid',scrollY>40));
// mobile menu
const tg=document.getElementById('navtoggle'),nl=document.getElementById('navlinks');
if(tg&&nl){tg.addEventListener('click',()=>nl.classList.toggle('open'));
  nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nl.classList.remove('open')));}
// GSAP
if(window.gsap){
  gsap.registerPlugin(ScrollTrigger);
  const cl=document.getElementById('cLeft'),cr=document.getElementById('cRight');
  if(cl){gsap.to(cl,{xPercent:-100,ease:'power2.inOut',duration:1.4,delay:.2});}
  if(cr){gsap.to(cr,{xPercent:100,ease:'power2.inOut',duration:1.4,delay:.2});}
  gsap.utils.toArray('.reveal').forEach(el=>{
    gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 87%'}});
  });
  gsap.utils.toArray('.num').forEach(el=>{
    const end=+el.dataset.count;
    ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>{
      gsap.to({v:0},{v:end,duration:1.6,ease:'power1.out',onUpdate:function(){el.textContent=Math.round(this.targets()[0].v)}});
    }});
  });
}
