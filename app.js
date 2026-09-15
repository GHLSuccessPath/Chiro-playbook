/* ============ part switching ============ */
function goPart(n){
  document.querySelectorAll('.part').forEach(function(p){p.classList.remove('on')});
  document.getElementById('part'+n).classList.add('on');
  document.querySelectorAll('.pbtn').forEach(function(b){b.classList.toggle('on', b.dataset.part==String(n))});
  document.querySelectorAll('.spine i').forEach(function(i,idx){i.classList.toggle('on', idx<n)});
  window.scrollTo({top:0,behavior:'instant'});
  setTimeout(revealAll,60);
}
document.querySelectorAll('.pbtn').forEach(function(b){
  b.addEventListener('click',function(){goPart(+b.dataset.part)});
});
function jump(id){
  var el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ============ scroll progress ============ */
window.addEventListener('scroll',function(){
  var h=document.documentElement;
  var pct=h.scrollTop/(h.scrollHeight-h.clientHeight)*100;
  document.getElementById('prog').style.width=pct+'%';
});

/* ============ reveal on scroll ============ */
var io=new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
function revealAll(){
  document.querySelectorAll('.part.on .rv:not(.in)').forEach(function(el){io.observe(el)});
}
revealAll();

/* ============ count-up animation ============ */
function countTo(el,target,prefix){
  prefix=prefix||'';
  var start=parseFloat((el.dataset.v||0)), t0=null, dur=650;
  function frame(t){
    if(!t0)t0=t;
    var p=Math.min((t-t0)/dur,1), ease=1-Math.pow(1-p,3);
    var v=start+(target-start)*ease;
    el.textContent=prefix+Math.round(v).toLocaleString();
    if(p<1) requestAnimationFrame(frame); else el.dataset.v=target;
  }
  requestAnimationFrame(frame);
}

/* ============ PART 1 · interactive timeline ============ */
var PLAN=24, animating=false;
function drawTimeline(){
  var svg=document.getElementById('tlSvg'); if(!svg) return;
  var L=55,R=665,Y=155;
  var reliefPos=PLAN===12?0.42:PLAN===24?0.38:0.32;   // relief lands earlier on longer plans
  var rofPos=0.14, exPos=PLAN===12?0.52:PLAN===24?0.60:0.55;
  function x(p){return L+(R-L)*p}
  var v9=x(reliefPos), rof=x(rofPos), ex=x(exPos);
  var v9Num=PLAN===12?5:PLAN===24?9:11;

  svg.innerHTML=
  '<line x1="'+L+'" y1="'+Y+'" x2="'+R+'" y2="'+Y+'" stroke="#E5E6E0" stroke-width="2"/>'+
  // attention gap
  '<rect x="'+rof+'" y="'+(Y-58)+'" width="'+(ex-rof)+'" height="54" rx="8" fill="#E9EFFA"/>'+
  '<text x="'+((rof+ex)/2)+'" y="'+(Y-37)+'" font-family="IBM Plex Mono" font-size="11" font-weight="600" fill="#2456B8" text-anchor="middle">GAP 1 · THE ATTENTION GAP</text>'+
  '<text x="'+((rof+ex)/2)+'" y="'+(Y-19)+'" font-family="IBM Plex Sans" font-size="11.5" fill="#2456B8" text-anchor="middle">Nothing scheduled reinforces the plan</text>'+
  // relief window
  '<rect x="'+(v9-70)+'" y="'+(Y+8)+'" width="170" height="54" rx="8" fill="#FCF3E3"/>'+
  '<text x="'+(v9+15)+'" y="'+(Y+29)+'" font-family="IBM Plex Mono" font-size="11" font-weight="600" fill="#B45309" text-anchor="middle">GAP 2 · THE RELIEF WINDOW</text>'+
  '<text x="'+(v9+15)+'" y="'+(Y+47)+'" font-family="IBM Plex Sans" font-size="11.5" fill="#B45309" text-anchor="middle">"I feel better, am I done?"</text>'+
  // overlap
  '<rect x="'+(v9-70)+'" y="'+(Y-58)+'" width="'+Math.max(ex-(v9-70),120)+'" height="120" rx="9" fill="none" stroke="#C2452B" stroke-width="2" stroke-dasharray="6 4"/>'+
  '<text x="'+(v9+20)+'" y="'+(Y+86)+'" font-family="IBM Plex Mono" font-size="11" font-weight="600" fill="#C2452B" text-anchor="middle">THEY OVERLAP HERE</text>'+
  // milestones
  '<circle cx="'+L+'" cy="'+Y+'" r="8" fill="#0F766E"/><text x="'+L+'" y="'+(Y+80)+'" font-family="Space Grotesk" font-size="12" font-weight="700" fill="#12181F" text-anchor="middle">Day 1</text>'+
  '<circle cx="'+rof+'" cy="'+Y+'" r="8" fill="#0F766E"/><text x="'+rof+'" y="'+(Y-70)+'" font-family="Space Grotesk" font-size="12.5" font-weight="700" fill="#12181F" text-anchor="middle">Day 2 · ROF</text>'+
  '<circle cx="'+v9+'" cy="'+Y+'" r="10" fill="#C2452B" id="v9dot"/>'+
  '<text x="'+v9+'" y="'+(Y-96)+'" font-family="Space Grotesk" font-size="13" font-weight="700" fill="#C2452B" text-anchor="middle">VISIT '+v9Num+'</text>'+
  '<text x="'+v9+'" y="'+(Y-80)+'" font-family="IBM Plex Sans" font-size="11" fill="#C2452B" text-anchor="middle">first visit that is not about pain</text>'+
  '<circle cx="'+ex+'" cy="'+Y+'" r="8" fill="#0F766E"/><text x="'+ex+'" y="'+(Y-70)+'" font-family="Space Grotesk" font-size="12.5" font-weight="700" fill="#12181F" text-anchor="middle">Progress exam</text>'+
  '<circle cx="'+R+'" cy="'+Y+'" r="7" fill="#8A939D"/><text x="'+R+'" y="'+(Y+80)+'" font-family="Space Grotesk" font-size="12" font-weight="700" fill="#5B6672" text-anchor="middle">Visit '+PLAN+'</text>'+
  // patient dot
  '<circle id="pdot" cx="'+L+'" cy="'+Y+'" r="0" fill="#0F766E" opacity="0"/>'+
  '<text id="pdotLabel" x="'+L+'" y="'+(Y-24)+'" font-family="IBM Plex Sans" font-size="11.5" font-weight="600" fill="#0F766E" text-anchor="middle" opacity="0"></text>';
}
function animatePatient(){
  if(animating) return; animating=true;
  var svg=document.getElementById('tlSvg');
  var dot=svg.querySelector('#pdot'), lab=svg.querySelector('#pdotLabel');
  var v9=parseFloat(svg.querySelector('#v9dot').getAttribute('cx'));
  var L=55, Y=155, t0=null, dur=2600, end=v9+32;
  dot.setAttribute('r',7); dot.setAttribute('opacity',1); lab.setAttribute('opacity',1);
  function frame(t){
    if(!t0)t0=t;
    var p=Math.min((t-t0)/dur,1);
    var x=L+(end-L)*p;
    dot.setAttribute('cx',x); lab.setAttribute('x',x);
    if(p<.35) lab.textContent='in pain, coming in';
    else if(p<.72){ lab.textContent='feeling better'; dot.setAttribute('fill','#B45309'); lab.setAttribute('fill','#B45309'); }
    else { lab.textContent='"am I done?"'; dot.setAttribute('fill','#C2452B'); lab.setAttribute('fill','#C2452B'); }
    if(p<1) requestAnimationFrame(frame);
    else {
      lab.textContent='stops coming'; dot.setAttribute('opacity',.35);
      setTimeout(function(){
        dot.setAttribute('opacity',0); lab.setAttribute('opacity',0);
        dot.setAttribute('fill','#0F766E'); lab.setAttribute('fill','#0F766E'); animating=false;
      },1600);
    }
  }
  requestAnimationFrame(frame);
}
document.getElementById('playBtn').addEventListener('click',animatePatient);
document.querySelectorAll('#planSeg button').forEach(function(b){
  b.addEventListener('click',function(){
    document.querySelectorAll('#planSeg button').forEach(function(x){x.classList.remove('on')});
    b.classList.add('on'); PLAN=+b.dataset.plan; drawTimeline();
  });
});
drawTimeline();

/* ============ PART 1 · retention curve ============ */
var curveMode='off';
function drawCurve(){
  var svg=document.getElementById('curveSvg'); if(!svg) return;
  var L=55,R=675,T=30,B=195;
  var off=[100,97,93,87,78,68,60,55,50,47,44,42];
  var on =[100,98,96,93,89,85,82,80,78,76,75,74];
  var d=curveMode==='on'?on:off;
  function x(i){return L+(R-L)*(i/(d.length-1))}
  function y(v){return B-(B-T)*(v/100)}
  var path=d.map(function(v,i){return (i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)}).join(' ');
  var ghost=off.map(function(v,i){return (i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)}).join(' ');
  var color=curveMode==='on'?'#0F766E':'#C2452B';
  var ticks='';
  [0,2,5,8,11].forEach(function(i){
    ticks+='<text x="'+x(i)+'" y="'+(B+22)+'" font-family="IBM Plex Mono" font-size="10.5" fill="#8A939D" text-anchor="middle">v'+((i+1)*2)+'</text>';
  });
  svg.innerHTML=
  '<line x1="'+L+'" y1="'+B+'" x2="'+R+'" y2="'+B+'" stroke="#E5E6E0" stroke-width="1.5"/>'+
  '<line x1="'+L+'" y1="'+T+'" x2="'+L+'" y2="'+B+'" stroke="#E5E6E0" stroke-width="1.5"/>'+
  '<line x1="'+L+'" y1="'+y(50)+'" x2="'+R+'" y2="'+y(50)+'" stroke="#E5E6E0" stroke-width="1" stroke-dasharray="4 5"/>'+
  '<text x="18" y="'+(T+6)+'" font-family="IBM Plex Mono" font-size="10.5" fill="#8A939D">100%</text>'+
  '<text x="24" y="'+(y(50)+4)+'" font-family="IBM Plex Mono" font-size="10.5" fill="#8A939D">50%</text>'+ticks+
  (curveMode==='on'?'<path d="'+ghost+'" fill="none" stroke="#C2452B" stroke-width="2" stroke-dasharray="5 5" opacity=".35"/>':'')+
  '<path id="curvePath" d="'+path+'" fill="none" stroke="'+color+'" stroke-width="3.5" stroke-linecap="round"/>'+
  '<circle cx="'+x(d.length-1)+'" cy="'+y(d[d.length-1])+'" r="6" fill="'+color+'"/>'+
  '<text x="'+(x(d.length-1)-10)+'" y="'+(y(d[d.length-1])-14)+'" font-family="Space Grotesk" font-size="14" font-weight="700" fill="'+color+'" text-anchor="end">'+d[d.length-1]+'%</text>';
  var p=svg.querySelector('#curvePath'), len=p.getTotalLength();
  p.style.strokeDasharray=len; p.style.strokeDashoffset=len;
  p.getBoundingClientRect();
  p.style.transition='stroke-dashoffset 1.2s cubic-bezier(.3,.7,.3,1)';
  p.style.strokeDashoffset=0;
}
document.querySelectorAll('#curveSeg button').forEach(function(b){
  b.addEventListener('click',function(){
    document.querySelectorAll('#curveSeg button').forEach(function(x){x.classList.remove('on')});
    b.classList.add('on'); curveMode=b.dataset.curve; drawCurve();
    document.getElementById('curveCap').innerHTML = curveMode==='on'
      ? '<b>The dashed line is where you were.</b> The gain comes from occupying the gap, not from working harder. Your own before and after gets measured in Part 3.'
      : '<b>Most practices retain 40 to 60 percent</b>, with the weight of the drop-off landing before the plan is halfway done.';
  });
});
drawCurve();

/* ============ PART 1 · calculator ============ */
function calcOpp(){
  function n(id){return +document.getElementById(id).value||0}
  var gap=Math.max(n('rec')-n('pva'),0), per=gap*n('rev'), yr=per*n('np')*12, mo=yr/12;
  document.getElementById('gapOut').textContent=gap;
  countTo(document.getElementById('perOut'),per,'$');
  countTo(document.getElementById('monOut'),mo,'$');
  countTo(document.getElementById('oppOut'),yr,'$');
  var half=yr/2, planVal=n('rec')*n('rev'), cac=200;
  var newPts=planVal>0?Math.ceil(half/planVal):0, cost=newPts*cac;
  document.getElementById('wayAmt').textContent='$'+Math.round(half).toLocaleString();
  document.getElementById('wayAmt2').textContent='$'+Math.round(half).toLocaleString();
  document.getElementById('wayACost').textContent='$0';
  document.getElementById('wayBCost').textContent='$'+cost.toLocaleString();
  document.getElementById('wayABar').style.width='2%';
  document.getElementById('wayBBar').style.width='100%';
  document.getElementById('wayBNote').textContent='~'+newPts+' new patients, at a $200 acquisition cost each.';
}
['rec','pva','rev','np'].forEach(function(id){
  document.getElementById(id).addEventListener('input',calcOpp);
});
calcOpp();

/* ============ PART 2 · earn list bars ============ */
var barIo=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){
      e.target.querySelectorAll('.bar i').forEach(function(i,k){
        setTimeout(function(){i.style.width=i.dataset.w+'%'},k*60);
      });
      barIo.unobserve(e.target);
    }
  });
},{threshold:.2});
var et=document.getElementById('earnTable'); if(et) barIo.observe(et);

/* ============ PART 2 · streak simulator ============ */
var streak=0, total=0;
function drawStreak(){
  var row=document.getElementById('streakRow'); if(!row) return;
  var h='';
  for(var i=1;i<=4;i++){
    var cls='sdot'+(i<=streak?(streak===4?' win':' on'):'');
    h+='<div class="'+cls+'">'+(i<=streak?'✓':i)+'</div>';
    if(i<4) h+='<span class="sarrow">›</span>';
  }
  h+='<span class="sarrow">›</span><div class="spill'+(streak===4?' show':'')+'">+50 bonus</div>';
  row.innerHTML=h;
  var out=document.getElementById('streakOut');
  if(streak===4) out.innerHTML='<b style="color:var(--teal)">Streak complete.</b> 50 points added, and the count starts again. Balance: '+total+' points.';
  else if(streak===0) out.textContent='Log four visits in a row without skipping a week.';
  else out.innerHTML='<b>'+(4-streak)+' more</b> and the bonus lands. This is the message that moves people: "You are '+(4-streak)+' visit'+(4-streak>1?'s':'')+' away."';
}
var lb=document.getElementById('logBtn');
if(lb){
  lb.addEventListener('click',function(){
    if(streak===4) streak=0;
    streak++; total+=10;
    if(streak===4) total+=50;
    drawStreak();
  });
  document.getElementById('skipBtn').addEventListener('click',function(){
    if(streak===0){ document.getElementById('streakOut').textContent='Nothing to lose yet. Log a visit first.'; return; }
    var had=streak; streak=0; drawStreak();
    document.getElementById('streakOut').innerHTML='<b style="color:var(--red)">Back to zero.</b> They just gave up '+had+' visit'+(had>1?'s':'')+' of progress. That is the feeling the mechanic is built on.';
  });
  drawStreak();
}

/* ============ PART 2 · reward ladder ============ */
var bs=document.getElementById('balSlider');
if(bs){
  function drawLadder(){
    var v=+bs.value;
    document.getElementById('balOut').textContent=v.toLocaleString()+' points';
    document.querySelectorAll('#ladder .tier').forEach(function(t){
      var min=+t.dataset.min, un=v>=min;
      t.classList.toggle('unlocked',un);
      t.querySelector('.lock').textContent=un?'UNLOCKED':(min-v).toLocaleString()+' to go';
    });
  }
  bs.addEventListener('input',drawLadder); drawLadder();
}

/* ============ PART 2 · checklist strike ============ */
document.querySelectorAll('.check input').forEach(function(c){
  c.addEventListener('change',function(){c.closest('label').classList.toggle('done',c.checked)});
});

/* ============ PART 3 · steps ============ */
var STEPS=[
 {n:1,t:'Pull Your Numbers',d:'You cannot size an opportunity you have not measured.',time:'20 MIN',
  need:['YOUR EHR','LAST 12 MONTHS','LAST 20 ROFs'],
  body:`
  <h4>Where to find each figure</h4>
  <div class="rules">
    <div class="rule"><span class="rn">A</span><div><b>Total patient visits, last 12 months</b><span>Every EHR reports this. Look under practice statistics or production summary.</span></div></div>
    <div class="rule"><span class="rn">B</span><div><b>New patients, last 12 months</b><span>Same place. Same date window as A.</span></div></div>
    <div class="rule"><span class="rn">C</span><div><b>Your recommended plan</b><span>Average your last 20 Reports of Findings. Use your real number, not the one you would like it to be.</span></div></div>
    <div class="rule"><span class="rn">D</span><div><b>Average revenue per visit</b><span>Total visit revenue divided by total visits, same window.</span></div></div>
    <div class="rule"><span class="rn">E</span><div><b>No visit in 90+ days and did not complete</b><span>This is your reactivation list for Step 8. Save the export.</span></div></div>
  </div>
  <div class="note"><div class="nl">Why PVA and not "average visits per care plan"</div>
    <p>The cleaner number is much harder to extract and in most systems is not available at all. PVA is obtainable everywhere and good enough here. It is blended, with maintenance patients alongside acute ones, so treat it as directional. <b>You are sizing an opportunity, not billing from it.</b></p></div>
  <div class="fill">
    <div class="fl3">Fill this in</div>
    <div class="frow"><label>A · Total patient visits, 12 months</label><input id="tv" type="number" value="4480"></div>
    <div class="frow"><label>B · New patients, 12 months</label><input id="npy" type="number" value="320"></div>
    <div class="frow"><label>C · Visits you recommend, average</label><input id="rec2" type="number" value="24"></div>
    <div class="frow"><label>D · Average revenue per visit</label><input id="rev2" type="number" value="65"></div>
    <div class="frow"><label>E · New patients per month</label><input id="npm" type="number" value="20"></div>
    <div class="fout">
      <div><div class="ol">Your PVA</div><div class="ov" id="pvaOut2">14.0</div></div>
      <div><div class="ol">Your gap</div><div class="ov" id="gapOut2">10</div></div>
      <div style="text-align:right"><div class="ol">Annual opportunity</div><div class="ov" id="oppOut2">$156,000</div></div>
    </div>
  </div>
  <div class="good"><div class="nl">Two honest notes</div>
    <p><b>It is an opportunity, not a loss.</b> Nobody recovers all of it. It is the size of the prize, not a forecast.</p>
    <p>Precise enough to tell you whether this deserves an afternoon. Not precise enough to put in a projection.</p></div>
  <div class="fill"><div class="fl3">Write it down. This is what the rest of the workbook is for.</div>
    <input class="writein" placeholder="My annual retention opportunity is $________"></div>`},

 {n:2,t:'Find Where Your Patients Actually Fall Out',d:'There is no universal drop-off visit. Yours is in your data.',time:'20 MIN EXPRESS',
  need:['30 CHARTS EXPRESS','OR 100 FOR PRECISION','PEN AND PAPER IS FINE'],
  body:`
  <div class="good"><div class="nl">◆ Do the express version first</div>
    <p><b>Pull the last 30 patients</b> who started a plan and did not complete it. Write down two things each: the visit number of their last attended visit, and whether they stopped before or after their first progress exam. Thirty is enough to see where the weight sits.</p></div>
  <div class="fill"><div class="fl3">Tally sheet</div>
    <div class="frow"><label>Stopped in visits 1 to 3</label><input type="number" placeholder="0"></div>
    <div class="frow"><label>Stopped in visits 4 to 8</label><input type="number" placeholder="0"></div>
    <div class="frow"><label>Stopped in visits 9 to 14</label><input type="number" placeholder="0"></div>
    <div class="frow"><label>Stopped after visit 15</label><input type="number" placeholder="0"></div>
  </div>
  <h4 style="margin-top:20px">Click your result to see what it means</h4>
  <div class="tree" id="tree">
    <div class="tr" data-k="a"><div>Mostly visits 1 to 3</div><div>They never really committed at Day 2. <b>This document will not fix it.</b> Case acceptance is a separate discipline and there are groups that train it well.<span class="go stopb">STOP · FIX CASE ACCEPTANCE FIRST</span></div></div>
    <div class="tr" data-k="b"><div>Between Day 2 and the first progress exam</div><div>The attention gap. Nothing was reinforcing the case. Exactly what the engine is built for.<span class="go">BUILD STEPS 3 TO 7 IN ORDER</span></div></div>
    <div class="tr" data-k="c"><div>After a progress exam</div><div>The re-exam is not landing as evidence. The written findings message is your highest-leverage fix.<span class="go">STEP 3 FIRST · FOCUS ON THE WRITTEN SUMMARY</span></div></div>
    <div class="tr" data-k="d"><div>Clustered where symptoms improve</div><div>The relief moment. You are arriving after the decision instead of before it.<span class="go">STEP 4 · ONE VISIT EARLIER THAN YOUR CLUSTER</span></div></div>
  </div>
  <p style="font-size:15.5px;color:var(--soft)">Most practices find weight in more than one place. <b>Build for the heaviest first.</b></p>
  <div class="fill"><div class="fl3">Your relief window</div>
    <input class="writein" placeholder="Patients feel better around visit ___ , so the Relief Conversation happens at visit ___"></div>`},

 {n:3,t:'Set Up the Progress Exam Bridge',d:'Highest value, easiest to implement.',time:'45 MIN · FREE',
  need:['NO SOFTWARE','NO COST','START TODAY'],
  body:`
  <div class="check">
    <label><input type="checkbox"><span><b>Move the booking to the ROF.</b> From this week, the first progress exam goes on the calendar before the patient leaves Day 2.</span></label>
    <label><input type="checkbox"><span><b>Tell your CA the new rule</b> and make it part of the Day 2 checkout, every time.</span></label>
    <label><input type="checkbox"><span><b>Write the two-day-before framing message</b> in your own voice. Not a reminder. A frame.</span></label>
    <label><input type="checkbox"><span><b>Write the written-findings message.</b> Two or three lines on what changed and what remains.</span></label>
    <label><input type="checkbox"><span><b>Map the placeholders</b> to the objective measures you already record.</span></label>
  </div>
  <div class="fill"><div class="fl3">Draft your framing message</div>
    <input class="writein" placeholder="[Day] is your progress exam, not a regular visit. We re-measure..."></div>
  <div class="good"><div class="nl">Why the written summary matters most</div>
    <p>Verbal progress is forgotten by Thursday. A written summary is re-readable, and it is what a patient shows their spouse when asked why they are still going.</p></div>`},

 {n:4,t:'Learn the Relief Conversation',d:'Forty seconds. The doc, not the CA.',time:'30 MIN · FREE',
  need:['NO SOFTWARE','SAY IT OUT LOUD 10 TIMES'],
  body:`
  <div class="check">
    <label><input type="checkbox"><span><b>Write the five steps in your own words</b>, using the language you actually use.</span></label>
    <label><input type="checkbox"><span><b>Say it out loud ten times.</b> You deliver it mid-day between two patients. If you have to think about it, you will skip it.</span></label>
    <label><input type="checkbox"><span><b>Teach it to every associate</b> and put it in the protocol.</span></label>
    <label><input type="checkbox"><span><b>Decide how you flag it in the chart</b> so you can compare completion rates in ninety days.</span></label>
    <label><input type="checkbox"><span><b>Set the trigger</b> at one visit before the relief window from Step 2.</span></label>
  </div>
  <div class="note"><div class="nl">The part people skip</div>
    <p>Step 5 hands the patient off to the progress exam. You are not asking them to keep coming indefinitely, you are asking them to reach a specific, already-scheduled date. Do not drop it.</p></div>`},

 {n:5,t:'Build Your Earn List and Economics',d:'Start from the Part 2 template and adjust.',time:'45 MIN',
  need:['POINTS LAYER','ATTORNEY REVIEW BEFORE LAUNCH'],
  body:`
  <h4>Run every line through four checks</h4>
  <div class="rules">
    <div class="rule"><span class="rn">01</span><div><b>Would a patient know, without ambiguity, that they did this?</b><span>Anything they have to interpret goes unlogged.</span></div></div>
    <div class="rule"><span class="rn">02</span><div><b>Could you check it against the chart?</b><span>A line you could never verify does not belong.</span></div></div>
    <div class="rule"><span class="rn">03</span><div><b>Does it predict plan completion?</b><span>If yes weight it heavily. If merely pleasant, weight it low or cut it.</span></div></div>
    <div class="rule"><span class="rn">04</span><div><b>Would you explain this line to a regulator without hesitating?</b><span>If you hesitate, cut it.</span></div></div>
  </div>
  <div class="fill"><div class="fl3">Set your economics</div>
    <div class="frow"><label>Plan value <small>recommended visits × revenue per visit</small></label><input id="pval" type="number" value="1560"></div>
    <div class="frow"><label>Reward cost, % of plan value <small>aim for 1 to 2</small></label><input id="pctc" type="number" value="1.5" step="0.1"></div>
    <div class="frow"><label>Points earned completing the plan</label><input id="ptot" type="number" value="2100"></div>
    <div class="fout">
      <div><div class="ol">Reward budget per completed plan</div><div class="ov" id="budOut">$23</div></div>
      <div style="text-align:right"><div class="ol">Your cost per point</div><div class="ov" id="cppOut">$0.011</div></div>
    </div>
  </div>
  <p style="font-size:15px;color:var(--soft)">Shorter plans usually need a slightly higher percentage, because reward costs do not scale down as smoothly as plan length does.</p>`},

 {n:6,t:'Build Your Reward Menu and Streak',d:'Four tiers, five or six items total.',time:'45 MIN',
  need:['ORDER PHYSICAL STOCK','SHOW 5 PATIENTS FIRST'],
  body:`
  <h4>Write down four things for each item</h4>
  <table>
    <thead><tr><th>Item</th><th>Fair market value</th><th>Your cost</th><th>Points</th></tr></thead>
    <tbody>
      <tr><td><input placeholder="Ice pack"></td><td><input placeholder="$8"></td><td><input placeholder="$2"></td><td><input placeholder="100"></td></tr>
      <tr><td><input placeholder="Massage add-on"></td><td><input placeholder="$15"></td><td><input placeholder="$6"></td><td><input placeholder="300"></td></tr>
      <tr><td><input></td><td><input></td><td><input></td><td><input></td></tr>
      <tr><td><input></td><td><input></td><td><input></td><td><input></td></tr>
    </tbody>
  </table>
  <div class="check">
    <label><input type="checkbox"><span><b>The first week test.</b> Can a new patient reach the entry tier in their first week? If not, lower it.</span></label>
    <label><input type="checkbox"><span><b>The threshold test.</b> Is every item beneath the value your attorney confirmed?</span></label>
    <label><input type="checkbox"><span><b>The "would I want this" test.</b> Show five current patients. If they shrug, the menu is wrong.</span></label>
    <label><input type="checkbox"><span><b>Completion tier set just below the plan total</b>, reachable only by finishing.</span></label>
    <label><input type="checkbox"><span><b>Streak set at 4 visits</b>, a skipped week resets, one rescue per plan on request only.</span></label>
  </div>`},

 {n:7,t:'Write Your Four Reactivation Messages',d:'Write all four before sending any.',time:'40 MIN',
  need:['CHECK SMS CONSENT FIRST','YOUR 90-DAY LIST'],
  body:`
  <div class="stop"><div class="nl">◆ Before you write anything</div>
    <p>Check what your intake paperwork says about SMS. A reactivation campaign is a <b>marketing message</b>, not an appointment reminder, and the two are treated differently.</p></div>
  <div class="check">
    <label><input type="checkbox"><span><b>One idea per message.</b> Do not stack.</span></label>
    <label><input type="checkbox"><span><b>Under 300 characters where you can.</b> Long texts read as marketing.</span></label>
    <label><input type="checkbox"><span><b>From the practice, signed by the doc.</b> Not "Team [Practice]."</span></label>
    <label><input type="checkbox"><span><b>No emojis, no exclamation points, no "Hope this finds you well."</b> You are a medical office.</span></label>
    <label><input type="checkbox"><span><b>Message 1 makes no offer.</b> The temptation is strong. Resist it.</span></label>
    <label><input type="checkbox"><span><b>Use their real numbers.</b> "You completed 13 of your 24 visits" lands because it is about them.</span></label>
  </div>
  <p style="font-size:15px;color:var(--soft)"><b>The final test:</b> read them out loud. If a sentence would feel strange said to a patient in the hallway, rewrite it.</p>`},

 {n:8,t:'Launch Week',d:'Do not switch it on quietly. The announcement itself reactivates patients.',time:'5 DAYS',
  need:['WHOLE TEAM','STOCK ON THE SHELF'],
  body:`
  <div class="week" id="week">
    <div class="day2"><div class="dn">MONDAY</div><h4>Staff</h4><p>Fifteen minutes with the team. Everyone answers "what's this points thing?" in one sentence without looking anything up. Show your CA how to send the link and where the redemption list lives.</p><div class="tick">☐ Click when done</div></div>
    <div class="day2"><div class="dn">TUESDAY</div><h4>The office</h4><p>Counter card at the desk, a sign in each adjusting room, reward stock physically on the shelf. A reward they can see is one they will work toward.</p><div class="tick">☐ Click when done</div></div>
    <div class="day2"><div class="dn">WEDNESDAY</div><h4>Active patients</h4><p>Text and email everyone in a plan with their link and a starting balance reflecting visits already attended. Someone at visit 12 of 24 opens with ~900 points. Opening at zero converts far worse.</p><div class="tick">☐ Click when done</div></div>
    <div class="day2"><div class="dn">THURSDAY</div><h4>Day 1 enrolment</h4><p>From today every new patient is introduced before they leave, and the link goes out same day. <b>The single most important habit.</b></p><div class="tick">☐ Click when done</div></div>
    <div class="day2"><div class="dn">FRIDAY</div><h4>The sweep</h4><p>Launch the reactivation sequence to the inactive list. Last, so when a returning patient walks in on Monday the office is already running properly.</p><div class="tick">☐ Click when done</div></div>
  </div>`}
];

var stepDone={};
function buildSteps(){
  var host=document.getElementById('steps'); if(!host) return;
  host.innerHTML=STEPS.map(function(s){
    return '<div class="step rv" id="st'+s.n+'">'+
      '<div class="shead" data-n="'+s.n+'">'+
        '<div class="sn2">'+s.n+'</div>'+
        '<div><h3>'+s.t+'</h3><div class="sd">'+s.d+'</div></div>'+
        '<span class="time">'+s.time+'</span><span class="chev">⌄</span>'+
      '</div>'+
      '<div class="sbody"><div class="inner">'+
        '<div class="need">'+s.need.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>'+
        s.body+
        '<div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--line2)">'+
          '<button class="sbtn primary" data-done="'+s.n+'">Mark step '+s.n+' complete</button>'+
        '</div>'+
      '</div></div></div>';
  }).join('');

  host.querySelectorAll('.shead').forEach(function(h){
    h.addEventListener('click',function(){
      var st=h.parentElement, body=st.querySelector('.sbody'), open=st.classList.contains('open');
      st.classList.toggle('open',!open);
      body.style.maxHeight=open?null:body.scrollHeight+'px';
    });
  });
  host.querySelectorAll('[data-done]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var n=+b.dataset.done; stepDone[n]=!stepDone[n];
      b.textContent=stepDone[n]?'✓ Step '+n+' complete':'Mark step '+n+' complete';
      b.classList.toggle('primary',!stepDone[n]);
      updateRing();
    });
  });
  host.querySelectorAll('.check input').forEach(function(c){
    c.addEventListener('change',function(){c.closest('label').classList.toggle('done',c.checked)});
  });
  // decision tree
  host.querySelectorAll('#tree .tr').forEach(function(r){
    r.addEventListener('click',function(){
      host.querySelectorAll('#tree .tr').forEach(function(x){x.classList.remove('sel','danger')});
      r.classList.add('sel'); if(r.dataset.k==='a') r.classList.add('danger');
    });
  });
  // launch week toggles
  host.querySelectorAll('#week .day2').forEach(function(d){
    d.addEventListener('click',function(){
      d.classList.toggle('done');
      d.querySelector('.tick').textContent=d.classList.contains('done')?'☑ Done':'☐ Click when done';
    });
  });
  wireStepCalcs();
  revealAll();
}
function wireStepCalcs(){
  function n(id){var e=document.getElementById(id);return e?(+e.value||0):0}
  function s1(){
    var pva=n('npy')?n('tv')/n('npy'):0, gap=Math.max(n('rec2')-pva,0), per=gap*n('rev2'), yr=per*n('npm')*12;
    document.getElementById('pvaOut2').textContent=pva.toFixed(1);
    document.getElementById('gapOut2').textContent=gap.toFixed(1);
    document.getElementById('oppOut2').textContent='$'+Math.round(yr).toLocaleString();
  }
  ['tv','npy','rec2','rev2','npm'].forEach(function(id){
    var e=document.getElementById(id); if(e) e.addEventListener('input',s1);
  });
  s1();
  function s5(){
    var bud=n('pval')*(n('pctc')/100), cpp=n('ptot')?bud/n('ptot'):0;
    document.getElementById('budOut').textContent='$'+bud.toFixed(0);
    document.getElementById('cppOut').textContent='$'+cpp.toFixed(3);
  }
  ['pval','pctc','ptot'].forEach(function(id){
    var e=document.getElementById(id); if(e) e.addEventListener('input',s5);
  });
  s5();
}
function updateRing(){
  var done=Object.keys(stepDone).filter(function(k){return stepDone[k]}).length;
  var pct=done/8;
  document.getElementById('ringFg').style.strokeDashoffset=(251.3*(1-pct)).toFixed(1);
  document.getElementById('ringPct').textContent=Math.round(pct*100)+'%';
  document.querySelectorAll('.sdotbtn').forEach(function(b){
    b.classList.toggle('done', !!stepDone[+b.dataset.s]);
  });
}
(function(){
  var d=document.getElementById('dots');
  if(!d) return;
  d.innerHTML=STEPS.map(function(s){return '<div class="sdotbtn" data-s="'+s.n+'">Step '+s.n+'</div>'}).join('');
  d.querySelectorAll('.sdotbtn').forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.getElementById('st'+b.dataset.s);
      if(el){ el.scrollIntoView({behavior:'smooth',block:'center'});
        if(!el.classList.contains('open')) el.querySelector('.shead').click(); }
    });
  });
})();
buildSteps();
updateRing();

/* ============ PART 3 · plan chooser ============ */
(function(){
  var pick={build:null,scope:null};
  var out=document.getElementById('pickOut');
  if(!out) return;

  function recommend(){
    if(!pick.build||!pick.scope){
      out.innerHTML='Pick one from each row and we will point at the right plan.';
      highlight(null); return;
    }
    var plan, why;
    if(pick.build==='self'){
      plan='diy';
      why = pick.scope==='all'
        ? '<b>Build it yourself</b> for the retention piece, and look at Liftoff later if the follow-up and marketing side is still unbuilt in three months. You have the full specification either way.'
        : '<b>Build it yourself.</b> You have the hours and the spec. Start at Step 1 and work the eight steps in order.';
    } else if(pick.scope==='ret'){
      plan='stars';
      why='<b>ChiroStars at $99 a month.</b> Retention and reviews are the gap, and that is exactly what it covers. Your account upgrades to Liftoff later without rebuilding anything.';
    } else {
      plan='liftoff';
      why='<b>ChiroStars + Liftoff at $199 a month.</b> You want the leak stopped and real infrastructure under the rest of the patient journey. One setup, nothing to configure twice.';
    }
    out.innerHTML=why;
    highlight(plan);
  }
  function highlight(p){
    document.querySelectorAll('.plan').forEach(function(el){
      el.classList.toggle('rec', !!p && el.dataset.plan===p);
    });
    if(p){
      var el=document.querySelector('.plan[data-plan="'+p+'"]');
      if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
    }
  }
  document.querySelectorAll('.qopts button').forEach(function(b){
    b.addEventListener('click',function(){
      var q=b.parentElement.dataset.q;
      b.parentElement.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on'); pick[q]=b.dataset.v; recommend();
    });
  });
  var rp=document.getElementById('resetPick');
  if(rp) rp.addEventListener('click',function(){
    pick={build:null,scope:null};
    document.querySelectorAll('.qopts button').forEach(function(x){x.classList.remove('on')});
    recommend();
  });
})();
