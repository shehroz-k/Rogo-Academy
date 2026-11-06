
/* Rogo Academy — calculation labs. Pure functions are exposed on window.RALabs for testing. */
(function(root){
  const fmtM=x=>{if(!isFinite(x))return '—';const a=Math.abs(x);const s=x<0?'(':'';const e=x<0?')':'';return a>=1000?s+'$'+(a/1000).toFixed(2)+'B'+e:s+'$'+a.toFixed(1)+'M'+e};
  const pct=(x,d=1)=>isFinite(x)?(x*100).toFixed(d)+'%':'—';
  const mult=(x,d=2)=>isFinite(x)?x.toFixed(d)+'x':'—';
  const mo=x=>isFinite(x)?x.toFixed(1)+' months':'—';

  const L={
    unitEcon(k){
      const end=k.start+k.newArr+k.expansion-k.contraction-k.churn;
      const netNew=end-k.start;
      const nrr=(k.start+k.expansion-k.contraction-k.churn)/k.start;
      const grr=(k.start-k.contraction-k.churn)/k.start;
      const growth=netNew/k.start;
      const payback=k.sm/((k.newArr+k.expansion)*k.gm/100)*12;
      const burnMultiple=k.netBurn/netNew;
      const magic=netNew/k.sm;
      const rule40=growth*100+k.fcfMargin;
      return {end,netNew,nrr,grr,growth,payback,burnMultiple,magic,rule40};
    },
    runway(k){
      let cash=k.cash, rev=k.rev, opex=k.opex, runway=null, breakeven=null, minCash=cash, firstBurn=null;
      for(let m=1;m<=60;m++){
        const gp=rev*k.gm/100; const burn=opex-gp; if(firstBurn===null) firstBurn=burn;
        if(breakeven===null&&burn<=0) breakeven=m;
        cash-=burn; minCash=Math.min(minCash,cash);
        if(runway===null&&cash<0) runway=m-1+ (cash+burn)/burn;
        rev*=1+k.revGrowth/100; opex*=1+k.opexGrowth/100;
      }
      return {firstBurn, simpleRunway:firstBurn>0?k.cash/firstBurn:Infinity, runway, breakeven, minCash};
    },
    roundMath(k){
      const post=k.pre+k.inv; const own=k.inv/post;
      const retention=(1-k.d1/100)*(1-k.d2/100)*(1-k.d3/100);
      const exitOwn=own*retention; const proceeds=exitOwn*k.exit; const moic=proceeds/k.inv;
      const irr=Math.pow(moic,1/k.years)-1; const reqExit=k.target*k.inv/exitOwn; const fundReturner=k.fund/exitOwn;
      return {post,own,retention,exitOwn,proceeds,moic,irr,reqExit,fundReturner};
    },
    vcMethod(k){
      const exitArr=k.arr*Math.pow(1+k.cagr/100,k.years); const exitEv=exitArr*k.multiple; const retention=1-k.dil/100;
      const maxPost=exitEv*retention/k.target; const maxPre=maxPost-k.inv;
      const exitOwn=k.inv/k.post*retention; const moic=exitEv*exitOwn/k.inv; const irr=Math.pow(moic,1/k.years)-1;
      const sc=[[k.p1,k.v1],[k.p2,k.v2],[k.p3,k.v3]].map(([p,v])=>{const conv=v*exitOwn; const pro=k.pref==='yes'?Math.max(Math.min(v,k.inv),conv):conv; return {p:p/100,v,pro,moic:pro/k.inv}});
      const psum=sc.reduce((a,s)=>a+s.p,0); const exp=sc.reduce((a,s)=>a+s.p*s.moic,0);
      return {exitArr,exitEv,maxPost,maxPre,exitOwn,moic,irr,sc,psum,exp};
    },
    waterfall(k){
      const own=k.own/100; const P=Math.min(k.exit,k.pref*k.mult); const conv=own*k.exit;
      let inv, mode, bp;
      if(k.type==='non'){ inv=Math.max(P,conv); mode=conv>P?'Converts to common':'Takes the preference'; bp=k.pref*k.mult/own; }
      else if(k.type==='full'){ inv=P+own*(k.exit-P); mode='Preference plus pro rata participation'; bp=NaN; }
      else { const capAmt=k.cap*k.pref; const part=Math.min(P+own*(k.exit-P),capAmt); inv=Math.max(part,conv); mode=conv>part?'Converts to common (cap binding)':(part>=capAmt?'Participates up to the cap':'Preference plus participation'); bp=capAmt/own; }
      return {P,conv,inv,common:k.exit-inv,mode,bp,moic:inv/k.pref,share:inv/k.exit};
    },
    poolShuffle(k){
      const post=k.pre+k.inv; const T=k.target/100; const kk=T*post/k.pre;
      let N=(kk*k.shares-k.pool)/(1-kk); if(N<0) N=0;
      const price=k.pre/(k.shares+N); const I=k.inv/price; const total=k.shares+N+I;
      const effPre=price*k.shares; const existingPost=(k.shares-k.pool)/total;
      // Alternative: pool created after the round (dilutes the investor too)
      const price2=k.pre/k.shares; const I2=k.inv/price2; let N2=(T*(k.shares+I2)-k.pool)/(1-T); if(N2<0)N2=0; const total2=k.shares+I2+N2;
      const existingPost2=(k.shares-k.pool)/total2; const invPost2=I2/total2;
      return {post,N,price,I,total,effPre,invOwn:I/total,poolOwn:(k.pool+N)/total,existingPost,existingPost2,invPost2,cost:k.pre-effPre};
    },
    fundMath(k){
      const fees=k.fund*k.fee/100; const investable=k.fund-fees; const lp=k.target*k.fund; const c=k.carry/100;
      const G=k.target>=1?(lp-c*k.fund)/(1-c):lp; const gross=G/investable; const own=k.own/100;
      return {fees,investable,lp,G,gross,fundReturner:k.fund/own,equiv:G/k.fund,carryPaid:Math.max(0,c*(G-k.fund))};
    },
    tvpi(k){return {dpi:k.dist/k.paid,rvpi:k.nav/k.paid,tvpi:(k.dist+k.nav)/k.paid}},
    tam(k){const tam=k.accounts*k.acv/1000; const sam=tam*k.fit/100; const som=sam*k.share/100; return {tam,sam,som}},
    scorecard(k){
      const w=[k.w1,k.w2,k.w3,k.w4,k.w5,k.w6], r=[k.r1,k.r2,k.r3,k.r4,k.r5,k.r6];
      const ws=w.reduce((a,b)=>a+b,0); const score=w.reduce((a,x,i)=>a+x*r[i],0)/ws;
      const tier=score>=4?'Prioritize — partner intro this week':score>=3?'Track — set a trigger to re-engage':'Pass for now — log the reason';
      return {score,ws,tier};
    }
  };

  const R={
    unitEcon(o){return {
      end:fmtM(o.end),netNew:fmtM(o.netNew),growth:pct(o.growth),nrr:pct(o.nrr),grr:pct(o.grr),payback:mo(o.payback),burnMultiple:mult(o.burnMultiple,1),magic:isFinite(o.magic)?o.magic.toFixed(2):'—',rule40:isFinite(o.rule40)?o.rule40.toFixed(0):'—',
      read:`Retention: <strong>NRR ${pct(o.nrr)}</strong> with <strong>GRR ${pct(o.grr)}</strong> — ${o.grr<0.85?'gross churn is high enough that expansion is masking leakage; ask for logo and dollar cohorts.':o.nrr>=1.2?'expansion is doing real work; check whether it is concentrated in a few accounts.':'solid base; test durability by cohort.'} Efficiency: <strong>burn multiple ${mult(o.burnMultiple,1)}</strong> — ${o.burnMultiple<=1?'very efficient growth by common rules of thumb.':o.burnMultiple<=2?'acceptable for the stage, but the round should fund a path to under 1.5x.':'expensive growth; diligence where the burn goes and whether payback is improving.'}`
    }},
    runway(o){return {firstBurn:fmtM(o.firstBurn)+' / mo',simpleRunway:mo(o.simpleRunway),runway:o.runway===null?'Over 60 months':mo(o.runway),breakeven:o.breakeven===null?'Not within 60 months':'Month '+o.breakeven,minCash:fmtM(o.minCash),
      read:o.runway===null?'<strong>Default alive</strong> on these assumptions: the company reaches breakeven before cash runs out. Stress the growth rate before you believe it.':`<strong>Default dead</strong> on these assumptions: cash runs out ${o.breakeven===null?'before breakeven':'before the breakeven month'}. The company needs to raise roughly 6–9 months before the zero-cash date, or cut burn.`}},
    roundMath(o){return {post:fmtM(o.post),own:pct(o.own),retention:pct(o.retention),exitOwn:pct(o.exitOwn),proceeds:fmtM(o.proceeds),moic:mult(o.moic),irr:pct(o.irr),reqExit:fmtM(o.reqExit),fundReturner:fmtM(o.fundReturner),
      read:`Entry ownership of <strong>${pct(o.own)}</strong> becomes <strong>${pct(o.exitOwn)}</strong> by exit. To return the fund from this one position, the company must exit at <strong>${fmtM(o.fundReturner)}</strong>. Ask whether that outcome is plausible for this market — not just whether the round price is fair.`}},
    vcMethod(o){return {exitArr:fmtM(o.exitArr),exitEv:fmtM(o.exitEv),maxPost:fmtM(o.maxPost),maxPre:fmtM(o.maxPre),exitOwn:pct(o.exitOwn),moic:mult(o.moic),irr:pct(o.irr),
      s1:fmtM(o.sc[0].pro)+' · '+mult(o.sc[0].moic),s2:fmtM(o.sc[1].pro)+' · '+mult(o.sc[1].moic),s3:fmtM(o.sc[2].pro)+' · '+mult(o.sc[2].moic),exp:mult(o.exp),psum:pct(o.psum,0),
      read:(Math.abs(o.psum-1)>0.001?'<strong>Probabilities must sum to 100%.</strong> ':'')+`At the proposed price the base case returns <strong>${mult(o.moic)}</strong>; the price that hits your target in the base case is a <strong>${fmtM(o.maxPost)}</strong> post-money. The probability-weighted outcome is <strong>${mult(o.exp)}</strong>. If the gap depends on the bull case, say so in the memo.`}},
    waterfall(o){return {P:fmtM(o.P),conv:fmtM(o.conv),inv:fmtM(o.inv),common:fmtM(o.common),mode:o.mode,bp:isFinite(o.bp)?fmtM(o.bp):'n/a — always participates',moic:mult(o.moic),share:pct(o.share),
      read:`The investor receives <strong>${fmtM(o.inv)}</strong> (${pct(o.share)} of proceeds) and common receives <strong>${fmtM(o.common)}</strong>. ${isFinite(o.bp)?'Above an exit of '+fmtM(o.bp)+' the investor is better off converting.':'Full participation means the investor double-dips at every exit value.'}`}},
    poolShuffle(o){return {post:fmtM(o.post),N:o.N.toFixed(2)+'M sh',price:'$'+o.price.toFixed(3),effPre:fmtM(o.effPre),invOwn:pct(o.invOwn),poolOwn:pct(o.poolOwn),existingPost:pct(o.existingPost),existingPost2:pct(o.existingPost2),invPost2:pct(o.invPost2),cost:fmtM(o.cost),
      read:`Putting the pool top-up in the pre-money lowers the <strong>effective pre-money to ${fmtM(o.effPre)}</strong> — a ${fmtM(o.cost)} transfer from existing holders. The investor still owns ${pct(o.invOwn)}. If the pool were created after the round, existing holders would own ${pct(o.existingPost2)} instead of ${pct(o.existingPost)}.`}},
    fundMath(o){return {fees:fmtM(o.fees),investable:fmtM(o.investable),lp:fmtM(o.lp),G:fmtM(o.G),gross:mult(o.gross),fundReturner:fmtM(o.fundReturner),equiv:mult(o.equiv,1),carryPaid:fmtM(o.carryPaid),
      read:`To deliver the target net multiple, the portfolio must produce <strong>${fmtM(o.G)}</strong> of gross proceeds — a <strong>${mult(o.gross)}</strong> gross multiple on invested capital. That is the equivalent of ~${o.equiv.toFixed(1)} fund-returning outcomes, each needing a <strong>${fmtM(o.fundReturner)}</strong> exit at the assumed exit ownership.`}},
    tvpi(o){return {dpi:mult(o.dpi),rvpi:mult(o.rvpi),tvpi:mult(o.tvpi),read:`Only <strong>DPI (${mult(o.dpi)})</strong> is cash back to LPs. RVPI (${mult(o.rvpi)}) is the GP's mark — ask how it was valued and when it was last marked.`}},
    tam(o){return {tam:fmtM(o.tam),sam:fmtM(o.sam),som:fmtM(o.som),read:`A credible bottom-up market: <strong>${fmtM(o.sam)}</strong> serviceable today. The attainable revenue at the assumed share is <strong>${fmtM(o.som)}</strong> — compare that with the revenue the exit case requires.`}},
    scorecard(o){return {score:o.score.toFixed(2)+' / 5',tier:o.tier,ws:o.ws.toFixed(0),read:o.ws!==100?'<strong>Weights should sum to 100.</strong> Adjust before you compare companies.':'Use the same weights across your pipeline so scores are comparable. A rating with no source behind it is a guess — note the evidence for each.'}}
  };

  function bind(lab){
    const name=lab.dataset.lab; const inputs=[...lab.querySelectorAll('[data-k]')];
    function run(){
      const k={}; inputs.forEach(i=>{k[i.dataset.k]=i.tagName==='SELECT'?i.value:parseFloat(i.value)});
      const res=R[name](L[name](k));
      lab.querySelectorAll('[data-o]').forEach(el=>{const v=res[el.dataset.o]; if(v!==undefined) el.innerHTML=v});
      lab.querySelectorAll('[data-bar]').forEach(el=>{const raw=L[name](k); const v=raw[el.dataset.bar]; el.style.width=Math.max(0,Math.min(100,(v/5)*100))+'%'});
    }
    inputs.forEach(i=>i.addEventListener('input',run));
    const rb=lab.querySelector('[data-lab-reset]'); if(rb) rb.addEventListener('click',()=>{inputs.forEach(i=>{i.value=i.defaultValue; if(i.tagName==='SELECT'){i.value=i.dataset.default}});run()});
    run();
  }
  root.RALabs=L; root.RALabsRender=R;
  if(typeof document!=='undefined') document.querySelectorAll('[data-lab]').forEach(bind);
})(typeof window!=='undefined'?window:globalThis);
