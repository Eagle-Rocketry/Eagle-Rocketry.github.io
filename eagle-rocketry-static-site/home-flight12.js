(() => {
  'use strict';
  const scenes = [
    { label:'LIQUID FEED', title:'Liquid Feed System', copy:'The current architecture maps nitrogen pressurization, fuel and oxidizer distribution, pneumatic controls, instrumentation, and the engine.', callouts:['Pressurization','Propellant distribution','Instrumentation'], href:'liquid-systems.html#feed-architecture', link:'Explore the system →' },
    { label:'PRESSURE CONTROL', title:'Control Logic', copy:'The working logic diagram follows pressure conditions through relay actions, system unlock, and ignition. The control-panel ladder logic remains in progress.', callouts:['Pressure conditions','Relay actions','Unlock / ignition'], href:'liquid-systems.html#control-logic', link:'Open flight operations →' },
    { label:'SOLID / TVC', title:'Solid Rocket System', copy:'The solid architecture connects video, radio control, power, recovery, and a two-servo thrust-vector-control arrangement around the motor chamber.', callouts:['Avionics','Recovery','Two-servo TVC'], href:'solid-tvc.html', link:'Explore Solid / TVC →' }
  ];
  const images=[...document.querySelectorAll('[data-scene-image]')];
  const markers=[...document.querySelectorAll('[data-scene]')];
  const fields={label:document.querySelector('[data-scene-label]'),title:document.querySelector('[data-scene-title]'),copy:document.querySelector('[data-scene-copy]'),link:document.querySelector('[data-scene-link]'),a:document.querySelector('[data-scene-callout-a]'),b:document.querySelector('[data-scene-callout-b]'),c:document.querySelector('[data-scene-callout-c]')};
  let active=-1;
  const setScene=index=>{if(index===active||!scenes[index])return;active=index;const scene=scenes[index];images.forEach((image,i)=>image.classList.toggle('is-active',i===index));fields.label.textContent=scene.label;fields.title.textContent=scene.title;fields.copy.textContent=scene.copy;fields.link.href=scene.href;fields.link.textContent=scene.link;fields.a.textContent=scene.callouts[0];fields.b.textContent=scene.callouts[1];fields.c.textContent=scene.callouts[2]};
  const menu=document.querySelector('.f12-menu');const nav=document.querySelector('#f12-nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open)});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}));
  const update=()=>{let closest=0,distance=Infinity;markers.forEach((marker,index)=>{const current=Math.abs(marker.getBoundingClientRect().top-innerHeight*.45);if(current<distance){distance=current;closest=index}});setScene(closest);const flight=document.querySelector('.f12-flight');const rect=flight.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height*.45)));flight.style.setProperty('--flight-progress',progress.toFixed(3))};
  let ticking=false;addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{update();ticking=false})},{passive:true});addEventListener('resize',update);setScene(0);update();
})();
