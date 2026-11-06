
/* Rogo Academy — shared interactions. Progress is stored only in this browser (learner-private). */
(function(){
  const KEY='rogoAcademy.v1';
  const MODULES=['ai-work','sourcing','financials','unit-economics','vc-math','valuation','cap-tables','diligence','fund-economics'];
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{modules:{},checks:{}}}catch(e){return {modules:{},checks:{}}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  const state=load(); state.modules=state.modules||{}; state.checks=state.checks||{};
  window.RA={state,save:()=>save(state),MODULES};

  function completedCount(){return MODULES.filter(m=>state.modules[m]&&state.modules[m].complete).length}
  function renderProgress(){
    document.querySelectorAll('[data-progress-pill]').forEach(el=>{el.textContent=completedCount()+' of '+MODULES.length+' complete'});
    document.querySelectorAll('[data-status]').forEach(el=>{
      const m=state.modules[el.dataset.status];
      if(m&&m.complete){el.textContent='Complete';el.className='badge done status'}
      else if(m&&m.best!=null){el.textContent='Practice '+m.best+'/'+m.total;el.className='badge warn status'}
      else{el.textContent='Not started';el.className='badge status'}
    });
    document.querySelectorAll('[data-progress-bar]').forEach(el=>{el.style.width=(completedCount()/MODULES.length*100)+'%'});
    document.querySelectorAll('[data-complete-btn]').forEach(btn=>{
      const id=btn.dataset.completeBtn; const done=state.modules[id]&&state.modules[id].complete;
      btn.textContent=done?'Completed — Undo':'Mark Module Complete';
    });
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-complete-btn]'); if(!b) return;
    const id=b.dataset.completeBtn; state.modules[id]=state.modules[id]||{};
    state.modules[id].complete=!state.modules[id].complete; state.modules[id].ts=new Date().toISOString(); save(state); renderProgress();
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-reset-progress]'); if(!b) return;
    if(confirm('Clear all progress saved in this browser?')){localStorage.removeItem(KEY);location.reload()}
  });

  // Copy buttons
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-copy]'); if(!b) return;
    const src=document.getElementById(b.dataset.copy); if(!src) return;
    const text=src.innerText;
    const done=()=>{const t=b.textContent;b.textContent='Copied';b.classList.add('copied');setTimeout(()=>{b.textContent=t;b.classList.remove('copied')},1600)};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done,()=>fallback(text,done))}else{fallback(text,done)}
  });
  function fallback(text,done){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){}document.body.removeChild(ta)}

  // Quizzes
  document.querySelectorAll('.quiz').forEach(quiz=>{
    const id=quiz.dataset.quiz; const qs=[...quiz.querySelectorAll('.q')]; let answered=0, right=0;
    const scoreEl=quiz.querySelector('.quiz-score');
    qs.forEach(q=>{
      const correct=parseInt(q.dataset.correct,10); const opts=[...q.querySelectorAll('.opt')];
      opts.forEach((o,i)=>o.addEventListener('click',()=>{
        if(q.dataset.done) return; q.dataset.done='1'; answered++;
        opts.forEach(x=>x.disabled=true);
        opts[correct].classList.add('correct'); if(i!==correct){o.classList.add('wrong')}else{right++}
        const ex=q.querySelector('.explain'); if(ex){ex.classList.add('show'); ex.insertAdjacentHTML('afterbegin', i===correct?'<strong>Correct.</strong> ':'<strong>Not quite.</strong> ')}
        if(answered===qs.length&&scoreEl){
          scoreEl.hidden=false; scoreEl.querySelector('.s').textContent=right+' / '+qs.length;
          const m=state.modules[id]=state.modules[id]||{}; m.total=qs.length; m.best=Math.max(m.best||0,right); save(state); renderProgress();
          scoreEl.querySelector('.msg').textContent= right===qs.length? 'Clean sweep. Now prove it on a fresh case in Felix.' : right>=qs.length-1? 'Strong. Review the explanation you missed, then run the graded case.' : 'Revisit the teaching sections above before the graded case — practice checks are for learning, not scoring.';
        }
      }));
    });
    const rb=quiz.querySelector('[data-quiz-reset]');
    if(rb) rb.addEventListener('click',()=>location.reload());
  });

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach(group=>{
    const tabs=[...group.querySelectorAll('.tab')];
    tabs.forEach(t=>t.addEventListener('click',()=>{
      tabs.forEach(x=>x.classList.remove('on')); t.classList.add('on');
      const root=document.getElementById(group.dataset.tabs);
      root.querySelectorAll(':scope > .panel').forEach(p=>p.classList.toggle('on',p.id===t.dataset.panel));
    }));
  });

  // Checklists (local)
  document.querySelectorAll('[data-check]').forEach(cb=>{
    const k=cb.dataset.check; cb.checked=!!state.checks[k];
    cb.addEventListener('change',()=>{state.checks[k]=cb.checked;save(state)});
  });

  // Slop drill
  document.querySelectorAll('[data-drill]').forEach(dr=>{
    const sents=[...dr.querySelectorAll('.sent')];
    let checked=false;
    sents.forEach(s=>s.addEventListener('click',()=>{if(checked) return; s.classList.toggle('flagged'); upd()}));
    const counter=dr.querySelector('[data-drill-count]');
    function upd(){if(counter) counter.textContent=dr.querySelectorAll('.sent.flagged').length+' flagged'}
    dr.querySelector('[data-drill-check]').addEventListener('click',()=>{
      checked=true; let hit=0,miss=0,fp=0; const total=sents.filter(s=>s.dataset.flaw).length;
      sents.forEach(s=>{const f=!!s.dataset.flaw, fl=s.classList.contains('flagged'); s.classList.remove('flagged');
        if(f&&fl){s.classList.add('hit');hit++} else if(f&&!fl){s.classList.add('miss');miss++} else if(!f&&fl){s.classList.add('false');fp++} else s.classList.add('ok');});
      const r=dr.querySelector('[data-drill-result]'); r.hidden=false;
      r.querySelector('.s').textContent=hit+' / '+total;
      r.querySelector('.msg').textContent='Problems caught: '+hit+' of '+total+'. Missed: '+miss+'. Flagged but actually supported by the source: '+fp+'.';
      dr.querySelector('[data-drill-findings]').hidden=false;
    });
    dr.querySelector('[data-drill-reset]').addEventListener('click',()=>{checked=false;sents.forEach(s=>s.className='sent');dr.querySelector('[data-drill-result]').hidden=true;dr.querySelector('[data-drill-findings]').hidden=true;upd()});
  });

  // Classifier
  document.querySelectorAll('.cls-card').forEach(c=>{
    const ans=c.dataset.answer; const btns=[...c.querySelectorAll('.cls-opts button')];
    btns.forEach(b=>b.addEventListener('click',()=>{
      if(c.dataset.done) return; c.dataset.done='1';
      btns.forEach(x=>{if(x.dataset.v===ans) x.classList.add('correct')}); if(b.dataset.v!==ans) b.classList.add('wrong');
      c.querySelector('.explain').classList.add('show');
    }));
  });

  // TOC highlight
  const tocLinks=[...document.querySelectorAll('.toc a[href^="#"]')];
  if(tocLinks.length&&'IntersectionObserver' in window){
    const map=new Map(tocLinks.map(a=>[a.getAttribute('href').slice(1),a]));
    const obs=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){tocLinks.forEach(a=>a.classList.remove('on'));const a=map.get(en.target.id);if(a)a.classList.add('on')}})},{rootMargin:'-30% 0px -60% 0px'});
    map.forEach((a,id)=>{const el=document.getElementById(id);if(el)obs.observe(el)});
  }
  renderProgress();
})();
