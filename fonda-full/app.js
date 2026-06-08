/* Fonda San Miguel — shared interactions */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  if(!reduce && window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    // Home curtain reveal (only if present)
    if(document.getElementById('cLeft')){
      gsap.to('#cLeft', {xPercent:-100, ease:'power2.inOut',
        scrollTrigger:{trigger:'.hero', start:'top top', end:'70% top', scrub:.6}});
      gsap.to('#cRight',{xPercent:100, ease:'power2.inOut',
        scrollTrigger:{trigger:'.hero', start:'top top', end:'70% top', scrub:.6}});
      gsap.to('.hero-bg',{scale:1, ease:'none',
        scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});
    }

    // Reveal on scroll
    gsap.utils.toArray('.reveal').forEach(function(el){
      gsap.to(el,{opacity:1, y:0, duration:.9, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });

    // Odometer counters
    gsap.utils.toArray('.num').forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var obj = {v:0};
      ScrollTrigger.create({trigger:el, start:'top 90%', once:true, onEnter:function(){
        gsap.to(obj,{v:target, duration:1.6, ease:'power2.out',
          onUpdate:function(){ el.textContent = Math.round(obj.v) + suffix; }});
      }});
    });
  } else {
    // reduced motion / no gsap: ensure counters show final value
    document.querySelectorAll('.num').forEach(function(el){
      el.textContent = (el.getAttribute('data-count')||'') + (el.getAttribute('data-suffix')||'');
    });
  }

  // Nav state + mobile toggle + sticky book bar
  var nav = document.getElementById('nav');
  var book = document.getElementById('booknow');
  var toggle = document.getElementById('navtoggle');
  var links = document.getElementById('navlinks');
  function onScroll(){
    var y = window.scrollY;
    if(nav) nav.classList.toggle('solid', y > 60);
    if(book) book.classList.toggle('show', y > window.innerHeight*0.6);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  if(toggle && links){
    toggle.addEventListener('click', function(){ links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ links.classList.remove('open'); }); });
  }
})();

/* 3D cursor tilt */
(function(){
  if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  document.querySelectorAll(".tilt").forEach(function(c){
    var max=11;
    c.addEventListener("mousemove",function(e){
      var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      c.style.transform="rotateY("+((px-.5)*max*2)+"deg) rotateX("+((.5-py)*max*2)+"deg) translateZ(6px)";
      c.style.setProperty("--mx",(px*100)+"%");c.style.setProperty("--my",(py*100)+"%");
    });
    c.addEventListener("mouseleave",function(){c.style.transform="rotateY(0) rotateX(0)";});
  });
})();
