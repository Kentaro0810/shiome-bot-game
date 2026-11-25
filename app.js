const STONES=[-3,-3,-2,-2,-2,-1,-1,-1,0,0,1,1,1,2,2,2,3,3];
const BETS=[
{id:'ebb',name:'引潮',desc:'合計 -1以下',odds:2.15,test:(a)=>sum(a)<0},
{id:'still',name:'潮止まり',desc:'合計 0',odds:8,test:(a)=>sum(a)===0},
{id:'flood',name:'満潮',desc:'合計 +1以上',odds:2.15,test:(a)=>sum(a)>0},
{id:'calm',name:'凪',desc:'潮位 -1〜+1',odds:2.75,test:(a)=>Math.abs(sum(a))<=1},
{id:'swell',name:'うねり',desc:'絶対値 2〜4',odds:1.9,test:(a)=>Math.abs(sum(a))>=2&&Math.abs(sum(a))<=4},
{id:'storm',name:'嵐',desc:'絶対値 5〜8',odds:6.1,test:(a)=>Math.abs(sum(a))>=5},
{id:'bigEbb',name:'大引潮',desc:'合計 -5以下',odds:12.25,test:(a)=>sum(a)<=-5},
{id:'bigFlood',name:'大満潮',desc:'合計 +5以上',odds:12.25,test:(a)=>sum(a)>=5},
{id:'sameSign',name:'三連同符',desc:'3石が全て同符号',odds:7,test:(a)=>a.every(x=>x<0)||a.every(x=>x>0)},
{id:'sameValue',name:'三連同値',desc:'3石が同じ値',odds:195,test:(a)=>a[0]===a[1]&&a[1]===a[2]},
{id:'reverse',name:'反転潮',desc:'第一石と最終方向が逆',odds:4.2,test:(a)=>a[0]!==0&&sum(a)!==0&&Math.sign(a[0])!==Math.sign(sum(a)),push:(a)=>a[0]===0}
];
let state={round:1,player:10000,bot:10000,chip:500,bets:{},locked:false,history:[]};
const $=s=>document.querySelector(s), sum=a=>a.reduce((x,y)=>x+y,0), fmt=n=>Math.round(n).toLocaleString('ja-JP');
function renderBets(){ $('#bets').innerHTML=BETS.map(b=>`<button class="bet" data-bet="${b.id}"><strong>${b.name}</strong><small>${b.desc}｜総返却 ${b.odds}倍</small><span class="placed">${state.bets[b.id]?fmt(state.bets[b.id]):''}</span></button>`).join(''); document.querySelectorAll('.bet').forEach(x=>x.onclick=()=>place(x.dataset.bet)); }
function place(id){if(state.locked)return;if(state.player-totalStake()<state.chip)return flash('ポイントが足りません');state.bets[id]=(state.bets[id]||0)+state.chip;render();}
function totalStake(){return Object.values(state.bets).reduce((a,b)=>a+b,0)}
function render(){renderBets();$('#playerScore').textContent=fmt(state.player);$('#botScore').textContent=fmt(state.bot);$('#roundNo').textContent=state.round;$('#stake').textContent=fmt(totalStake());$('#ticketText').textContent=Object.keys(state.bets).length?Object.entries(state.bets).map(([id,v])=>`${BETS.find(b=>b.id===id).name} ${fmt(v)}`).join(' / '):'未選択';$('#drawBtn').disabled=!totalStake()||state.locked;}
function flash(t){$('#status').textContent=t}
function drawStones(){let pool=[...STONES],out=[];for(let i=0;i<3;i++){let k=Math.floor(Math.random()*pool.length);out.push(pool.splice(k,1)[0])}return out}
function botBets(){let budget=Math.min(state.bot,1200), choices=[];let style=state.round%3; if(style===0)choices=[['swell',500],['flood',500],['reverse',200]];else if(style===1)choices=[['ebb',600],['calm',400],['storm',200]];else choices=[['flood',600],['swell',400],['sameValue',50]];let o={};for(const [id,v] of choices){let x=Math.min(v,budget);if(x>0){o[id]=x;budget-=x}}return o}
function settle(wallet,bets,draw){let stake=Object.values(bets).reduce((a,b)=>a+b,0),ret=0,won=[];for(const [id,v] of Object.entries(bets)){let b=BETS.find(x=>x.id===id);if(b.test(draw)){ret+=v*b.odds;won.push(b.name)}else if(b.push&&b.push(draw)){ret+=v;won.push(b.name+'返却')}}return {wallet:wallet-stake+ret,stake,ret,won}}
async function play(){state.locked=true;render();let bb=botBets();$('#botMove').textContent='BOTがベットを確定しました。潮石を抽選します。';let d=drawStones();document.querySelectorAll('.stone').forEach((el,i)=>{el.className='stone hidden';el.textContent='?'});$('#level').textContent='--';$('#result').textContent='抽選中';for(let i=0;i<3;i++){await wait(650);let el=$('#stone'+i),v=d[i];el.className='stone '+(v<0?'negative':v>0?'positive':'');el.textContent=v>0?'+'+v:v;flash(`第${i+1}潮石 ${v>0?'+':''}${v}｜現在潮位 ${sum(d.slice(0,i+1))}`)}let lv=sum(d),name=lv<0?'引潮':lv>0?'満潮':'潮止まり';$('#level').textContent=(lv>0?'+':'')+lv;$('#result').textContent=name;let p=settle(state.player,state.bets,d),b=settle(state.bot,bb,d);state.player=p.wallet;state.bot=b.wallet;let line=`あなた: ${p.won.join('・')||'不成立'}（${p.ret?fmt(p.ret):'0'}返却） / BOT: ${b.won.join('・')||'不成立'}（${b.ret?fmt(b.ret):'0'}返却）`;$('#botMove').textContent=line;state.history.unshift({r:state.round,d:d.join(' / '),lv,line});state.bets={};renderHistory();render();if(state.round>=10||state.player<=0||state.bot<=0){setTimeout(finish,700)}else{state.round++;state.locked=false;setTimeout(()=>{resetBoard();render()},900)}}
function renderHistory(){ $('#history').innerHTML=state.history.map(h=>`<div class="history-row"><b>R${h.r}</b><span>${h.d} → 潮位 ${h.lv}</span><small>${h.line}</small></div>`).join('')}
function resetBoard(){document.querySelectorAll('.stone').forEach(e=>{e.className='stone hidden';e.textContent='?'});$('#level').textContent='--';$('#result').textContent='未確定';flash('賭け先と金額を選んでください');$('#botMove').textContent='BOTはあなたのベット確定後に、独自の戦略で賭けます。'}
function finish(){let win=state.player>state.bot;$('#finishTitle').textContent=state.player===state.bot?'引き分け':win?'あなたの勝利！':'BOTの勝利';$('#finishText').textContent=`最終残高　あなた ${fmt(state.player)} / BOT ${fmt(state.bot)}`;$('#finish').showModal()}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
document.querySelectorAll('[data-chip]').forEach(x=>x.onclick=()=>{document.querySelectorAll('[data-chip]').forEach(y=>y.classList.remove('active'));x.classList.add('active');state.chip=+x.dataset.chip});$('#clearBtn').onclick=()=>{if(!state.locked){state.bets={};render()}};$('#drawBtn').onclick=play;$('#helpBtn').onclick=()=>$('#help').showModal();$('#closeHelp').onclick=()=>$('#help').close();$('#restartBtn').onclick=()=>location.reload();render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');