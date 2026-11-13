(function(){
  var d=document,root=d.documentElement,
      reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Tema gelap/terang ---- */
  var btn=d.getElementById('theme');
  function icon(){btn.textContent=root.dataset.theme==='dark'?'☀️':'🌙'}
  icon();
  btn.addEventListener('click',function(){
    var t=root.dataset.theme==='dark'?'light':'dark';
    root.dataset.theme=t;
    try{localStorage.setItem('theme',t)}catch(e){}
    icon();
  });

  /* ---- Progress bar & header ---- */
  var bar=d.getElementById('bar'),hdr=d.querySelector('header'),tick=false;
  function onScroll(){
    var h=root.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(h>0?scrollY/h:0)+')';
    hdr.classList.toggle('scrolled',scrollY>10);
    tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  /* ---- Menu mobile menutup saat link diklik ---- */
  var cb=d.getElementById('burger');
  d.querySelectorAll('.links a').forEach(function(a){a.addEventListener('click',function(){cb.checked=false})});

  /* ---- Menu aktif sesuai bagian ---- */
  var links={};
  d.querySelectorAll('.links a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
  var spy=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        Object.keys(links).forEach(function(k){links[k].classList.remove('active')});
        if(links[e.target.id])links[e.target.id].classList.add('active');
      }
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  d.querySelectorAll('section[id]').forEach(function(s){spy.observe(s)});

  /* ---- Reveal saat scroll ---- */
  var sel='.hi,.hero h1,.role,.typed-line,.desc,.btns,.stats,.photo-wrap,.eyebrow,.title,.lead,.about .wrap>div:first-child p,.mini,.skill,.tl,.proj,.orgs>div,.contact .box';
  var count={};
  d.querySelectorAll(sel).forEach(function(el){
    var p=el.parentElement;
    p.__i=(p.__i||0);
    el.style.setProperty('--d',(p.__i++*0.09)+'s');
    el.classList.add('rv');
  });
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
        e.target.querySelectorAll&&e.target.querySelectorAll('[data-to]').forEach(countUp);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  d.querySelectorAll('.rv').forEach(function(el){io.observe(el)});

  /* ---- Angka berhitung ---- */
  function countUp(el){
    var to=parseFloat(el.dataset.to),dec=+el.dataset.dec||0,suf=el.dataset.suf||'';
    if(reduce){el.textContent=to.toFixed(dec)+suf;return}
    var t0=null,dur=1500;
    function step(t){
      if(!t0)t0=t;
      var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);
      el.textContent=(to*e).toFixed(dec)+suf;
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Teks mengetik ---- */
  var ty=d.querySelector('.typed');
  if(ty&&!reduce){
    var words=ty.dataset.words.split('|'),w=0,c=0,del=false;
    (function loop(){
      var word=words[w],delay;
      if(!del){
        c++;delay=85;
        if(c===word.length){del=true;delay=1500}
      }else{
        c--;delay=40;
        if(c===0){del=false;w=(w+1)%words.length;delay=350}
      }
      ty.textContent=word.slice(0,c);
      setTimeout(loop,delay);
    })();
  }
})();

/* ---- Jaringan partikel di hero (animasi background) ---- */
(function(){
  var cv=document.getElementById('net');
  if(!cv||!cv.getContext)return;
  var hero=cv.parentElement,ctx=cv.getContext('2d'),
      reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,
      W,H,dpr,pts=[],mouse={x:-999,y:-999},run=false,LINK=125;

  function size(){
    dpr=Math.min(devicePixelRatio||1,2);
    W=hero.clientWidth;H=hero.clientHeight;
    cv.width=W*dpr;cv.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.min(Math.round(W*H/17000),70);
    pts=[];
    for(var i=0;i<n;i++)pts.push({
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,
      r:Math.random()*1.6+1
    });
    if(reduce)frame();
  }

  function frame(){
    ctx.clearRect(0,0,W,H);
    var dark=document.documentElement.dataset.theme==='dark',
        a=dark?.5:.32,i,j,p,q,dx,dy,d;
    for(i=0;i<pts.length;i++){
      p=pts[i];
      if(!reduce){
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1;
        if(p.y<0||p.y>H)p.vy*=-1;
        dx=p.x-mouse.x;dy=p.y-mouse.y;d=Math.sqrt(dx*dx+dy*dy);
        if(d<110&&d>0){p.x+=dx/d*.9;p.y+=dy/d*.9}
      }
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);
      ctx.fillStyle='rgba(20,184,166,'+(a+.2)+')';ctx.fill();
      for(j=i+1;j<pts.length;j++){
        q=pts[j];dx=p.x-q.x;dy=p.y-q.y;d=Math.sqrt(dx*dx+dy*dy);
        if(d<LINK){
          ctx.strokeStyle='rgba(20,184,166,'+(a*(1-d/LINK)).toFixed(3)+')';
          ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
        }
      }
      d=Math.hypot(p.x-mouse.x,p.y-mouse.y);
      if(d<150){
        ctx.strokeStyle='rgba(244,114,182,'+(.5*(1-d/150)).toFixed(3)+')';
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
      }
    }
  }

  function loop(){if(!run)return;frame();requestAnimationFrame(loop)}
  function start(){if(!run&&!reduce&&!document.hidden){run=true;loop()}}
  function stop(){run=false}

  hero.addEventListener('mousemove',function(e){
    var r=hero.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });
  hero.addEventListener('mouseleave',function(){mouse.x=mouse.y=-999});

  new IntersectionObserver(function(es){es[0].isIntersecting?start():stop()}).observe(hero);
  document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
  var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(size,200)});
  size();
})();