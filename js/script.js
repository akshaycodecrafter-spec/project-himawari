
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';
  var $ = function(s,c){return (c||d).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  var lenis = null;

  function lockScroll(){d.body.classList.add('no-scroll');if(lenis)lenis.stop()}
  function unlockScroll(){d.body.classList.remove('no-scroll');if(lenis)lenis.start()}

  function initSmoothScroll(){
    if(!hasLenis || prefersReduced) return;
    lenis = new window.Lenis({
      duration:1.15,
      easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},
      smoothWheel:true, touchMultiplier:1.4
    });
    window.lenis = lenis;
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add(function(time){lenis.raf(time*1000)});
    window.gsap.ticker.lagSmoothing(0);
  }

  function splitWords(el){
    var inners=[];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(child){
        if(child.nodeType===3){
          var frag=d.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function(part){
            if(!part) return;
            if(/^\s+$/.test(part)){frag.appendChild(d.createTextNode(' '));return}
            var w=d.createElement('span');w.className='word';
            var inner=d.createElement('span');inner.className='word-inner';inner.textContent=part;
            w.appendChild(inner);frag.appendChild(w);inners.push(inner);
          });
          node.replaceChild(frag,child);
        } else if(child.nodeType===1 && child.tagName!=='BR'){
          walk(child);
        }
      });
    })(el);
    return inners;
  }

  function initIntro(){
    var pl=$('.preloader'), tag=$('.hero__tag'), headline=$('[data-split]'),
        sub=$('.hero__sub'), actions=$$('.hero__actions .btn'), meta=$('.hero__meta'),
        frame=$('.hero__frame'), chip=$('[data-hero-chip]'),
        cells=$$('.cell--hero-a, .cell--hero-b'), hint=$('.hero__scroll');

    if(prefersReduced){if(pl)pl.remove();unlockScroll();return}

    var wordInners = headline ? splitWords(headline) : [];
    var master = window.gsap.timeline({paused:true});

    if(pl){
      var blob=$('.preloader__blob'), chars=$$('.preloader__char'), caption=$('.preloader__caption');
      lockScroll();
      master
        .to(blob,{scale:1,opacity:1,duration:1.15,ease:'power2.out'})
        .to(chars,{y:0,opacity:1,duration:.65,ease:'power2.out',stagger:.045},'-=.85')
        .to(caption,{opacity:1,duration:.5,ease:'power2.out'},'-=.3')
        .addLabel('hero','-=.4')
        .to(pl,{opacity:0,duration:.65,ease:'power1.inOut',onStart:unlockScroll},'hero')
        .add(function(){if(pl.parentNode)pl.parentNode.removeChild(pl)},'hero+=.7');
    } else {
      master.addLabel('hero',0);
    }

    if(tag) master.fromTo(tag,{y:14,autoAlpha:0},{y:0,autoAlpha:1,duration:.55,ease:'power2.out'},'hero+=.05');
    if(wordInners.length) master.fromTo(wordInners,{yPercent:112},{yPercent:0,duration:.85,ease:'power2.out',stagger:.07},'hero+=.1');
    if(sub) master.fromTo(sub,{y:22,autoAlpha:0},{y:0,autoAlpha:1,duration:.6,ease:'power2.out'},'hero+=.45');
    if(actions.length) master.fromTo(actions,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.55,ease:'power2.out',stagger:.09},'hero+=.58');
    if(meta) master.fromTo(meta,{autoAlpha:0},{autoAlpha:1,duration:.5,ease:'power2.out'},'hero+=.78');
    if(frame) master.fromTo(frame,{autoAlpha:0,scale:.96,y:16},{autoAlpha:1,scale:1,y:0,duration:.85,ease:'power2.out',clearProps:'transform'},'hero+=.3');
    if(chip) master.fromTo(chip,{autoAlpha:0,y:16,scale:.92},{autoAlpha:1,y:0,scale:1,duration:.6,ease:'power2.out'},'hero+=.8');
    if(cells.length) master.fromTo(cells,{scale:.6,autoAlpha:0},{scale:1,autoAlpha:1,duration:.6,ease:'power2.out',stagger:.12,clearProps:'transform'},'hero+=.65');
    if(hint) master.fromTo(hint,{autoAlpha:0},{autoAlpha:1,duration:.5,ease:'power2.out'},'hero+=1');
    var fontsReady = (d.fonts && d.fonts.ready) ? d.fonts.ready : Promise.resolve();

    var hardReveal = setTimeout(function(){
      if(master.progress() < 1){
        $$('[data-reveal],[data-reveal-group]>* ,[data-img-reveal],[data-hero-chip],.cell').forEach(function(el){
          el.style.opacity='1';
          el.style.transform='none';
        });
      }
    },1400);

    Promise.race([fontsReady, new Promise(function(r){setTimeout(r,900)})]).then(function(){
      clearTimeout(hardReveal);
      master.play();
    });
  }

  function initAmbient(){
    if(prefersReduced || !$('.atmo--hero')) return;
    var gsap=window.gsap, drifts=[];
    [
      {sel:'.atmo--hero .blob--coral',x:26,y:-20,scale:1.06,dur:11},
      {sel:'.atmo--hero .blob--acrylic',x:-22,y:18,scale:1.05,dur:13},
      {sel:'.atmo--hero .blob--conifer',x:18,y:14,scale:1.08,dur:9.5}
    ].forEach(function(c){
      var el=$(c.sel); if(!el) return;
      drifts.push(gsap.to(el,{x:c.x,y:c.y,scale:c.scale,duration:c.dur,ease:'power1.inOut',yoyo:true,repeat:-1}));
    });
    var cellA=$('.cell--hero-a'), cellB=$('.cell--hero-b');
    if(cellA) drifts.push(gsap.to(cellA,{rotation:'+=140',duration:44,ease:'none',yoyo:true,repeat:-1}));
    if(cellB) drifts.push(gsap.to(cellB,{rotation:'-=120',duration:36,ease:'none',yoyo:true,repeat:-1}));
    if(!drifts.length) return;
    window.ScrollTrigger.create({
      trigger:'#hero', start:'top bottom', end:'bottom top',
      onToggle:function(self){drifts.forEach(function(t){self.isActive?t.play():t.pause()})}
    });
  }

  function initReveals(){
    var gsap=window.gsap;
    $$('[data-reveal]').forEach(function(el){
      gsap.fromTo(el,{y:34,autoAlpha:0,scale:.97},
        {y:0,autoAlpha:1,scale:1,duration:.72,ease:'power2.out',clearProps:'transform',
         scrollTrigger:{trigger:el,start:'top 86%',once:true}});
    });
    $$('[data-reveal-group]').forEach(function(group){
      var kids=Array.prototype.slice.call(group.children); if(!kids.length) return;
      gsap.fromTo(kids,{y:30,autoAlpha:0},
        {y:0,autoAlpha:1,duration:.7,ease:'power2.out',stagger:.09,
         scrollTrigger:{trigger:group,start:'top 84%',once:true}});
    });
    $$('[data-img-reveal]').forEach(function(el){
      if(el.closest('#hero')) return;
      gsap.fromTo(el,{autoAlpha:0,scale:.96},
        {autoAlpha:1,scale:1,duration:.75,ease:'power2.out',clearProps:'transform',
         scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
  }

  function initParallax(){
    if(prefersReduced) return;
    var gsap=window.gsap;
    $$('[data-parallax]').forEach(function(el){
      var amount=parseFloat(el.getAttribute('data-parallax'))||-8;
      var scope=el.closest('section')||el.parentElement;
      gsap.fromTo(el,{yPercent:-amount},
        {yPercent:amount,ease:'none',
         scrollTrigger:{trigger:scope,start:'top bottom',end:'bottom top',scrub:true}});
    });
  }

  function initStats(){
    var nums=$$('[data-count]'); if(!nums.length) return;
    var started=false, fmt=function(v){return Math.round(v).toLocaleString('en-US')};
    function startCounters(){
      if(started) return; started=true; var gsap=window.gsap;
      nums.forEach(function(el,i){
        var target=parseFloat(el.getAttribute('data-count'));
        var dd=el.parentElement;
        if(!prefersReduced && dd) gsap.fromTo(dd,{autoAlpha:0},{autoAlpha:1,duration:.4,delay:i*.08});
        var obj={v:0};
        gsap.to(obj,{v:target,duration:1.6,ease:'power2.out',delay:i*.08,
          onUpdate:function(){el.textContent=fmt(obj.v)}});
      });
    }
    if(prefersReduced){nums.forEach(function(el){el.textContent=fmt(parseFloat(el.getAttribute('data-count')))});return}
    nums.forEach(function(el){var dd=el.parentElement;if(dd)window.gsap.set(dd,{autoAlpha:0})});
    window.gsap.matchMedia().add('(min-width:1024px)',function(){
      var st=window.ScrollTrigger.create({trigger:'#results',start:'top top',end:'+=520',pin:true,anticipatePin:1});
      return function(){st.kill()};
    });
    window.ScrollTrigger.create({trigger:'#results',start:'top 75%',once:true,onEnter:startCounters});
  }

  function mmListen(mq,h){if(mq.addEventListener)mq.addEventListener('change',h);else if(mq.addListener)mq.addListener(h)}

  function initNav(){
    var nav=$('#siteNav'), burger=$('#navBurger'), linksWrap=$('#navLinks'),
        glider=$('.site-nav__glider'), links=$$('#navLinks a'), ticking=false;
    function onScroll(){
      if(ticking) return; ticking=true;
      requestAnimationFrame(function(){
        nav.classList.toggle('is-scrolled',(window.scrollY||0)>60);
        ticking=false;
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

    var desktop=window.matchMedia('(min-width:941px)');
    function placeGlider(link){
      if(!desktop.matches||!glider) return;
      glider.style.width=link.offsetWidth+'px';
      glider.style.transform='translateX('+link.offsetLeft+'px)';
      glider.style.opacity='1';
    }
    function hideGlider(){if(glider) glider.style.opacity='0'}
    links.forEach(function(link){
      link.addEventListener('mouseenter',function(){placeGlider(link)});
      link.addEventListener('focus',function(){placeGlider(link)});
    });
    if(linksWrap) linksWrap.addEventListener('mouseleave',hideGlider);
    mmListen(desktop,hideGlider);

    var spyMap={};
    links.forEach(function(l){var id=(l.getAttribute('href')||'').replace('#','');if(id) spyMap[id]=l});
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          var link=spyMap[e.target.id]; if(!link) return;
          if(e.isIntersecting){
            links.forEach(function(l){l.removeAttribute('aria-current')});
            link.setAttribute('aria-current','true');
          }
        });
      },{rootMargin:'-35% 0px -60% 0px'});
      Object.keys(spyMap).forEach(function(id){var sec=d.getElementById(id);if(sec)io.observe(sec)});
    }

    function closeMenu(){nav.classList.remove('is-open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu')}
    burger.addEventListener('click',function(){
      var open=nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded',String(open));
      burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    });
    d.addEventListener('keydown',function(e){if(e.key==='Escape') closeMenu()});
    mmListen(window.matchMedia('(min-width:941px)'),function(e){if(e.matches) closeMenu()});

    var toTop=$('#toTop');
    if(toTop) toTop.addEventListener('click',function(){
      if(lenis) lenis.scrollTo(0,{duration:1.3});
      else window.scrollTo({top:0,behavior:prefersReduced?'auto':'smooth'});
    });

    return {closeMenu:closeMenu};
  }

  function initAnchors(navModule){
    $$('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var href=a.getAttribute('href');
        if(href==='#'){e.preventDefault();return}
        var target=d.getElementById(href.slice(1)); if(!target) return;
        e.preventDefault();
        if(navModule && navModule.closeMenu) navModule.closeMenu();
        if(lenis){lenis.scrollTo(target,{offset:href==='#top'?0:-84,duration:1.25})}
        else{target.scrollIntoView({behavior:prefersReduced?'auto':'smooth',block:'start'})}
      });
    });
  }

  function initMisc(){var y=$('#year');if(y) y.textContent=String(new Date().getFullYear())}

  function initFallback(){
    var pl=$('.preloader'); if(pl) pl.remove();
    $$('[data-count]').forEach(function(el){el.textContent=Math.round(parseFloat(el.getAttribute('data-count'))).toLocaleString('en-US')});
    initMisc();
    var nav=initNav(); initAnchors(nav);
  }

  function bootFull(){
    root.classList.add('js');
    window.gsap.registerPlugin(window.ScrollTrigger);
    initSmoothScroll();
    initIntro();
    initAmbient();
    initReveals();
    initParallax();
    initStats();
    var navModule=initNav();
    initAnchors(navModule);
    initMisc();
    window.addEventListener('load',function(){window.ScrollTrigger.refresh()});
  }

  if(hasGsap && hasST) bootFull(); else initFallback();
})();
