(function(root){'use strict';
const themes=[
{name:'Солнечная долина',sky:['#9edee9','#fff2c7'],hill:'#8aba84',earth:'#668a57',grass:'#b1d979',accent:'#efbd53',cloud:'#fff9e9',props:['🌻','🌳','🌼'],critter:'🐢'},
{name:'Ночной сад фонарей',sky:['#263454','#746397'],hill:'#4b5579',earth:'#384861',grass:'#819eab',accent:'#f4cf77',cloud:'#b5aed1',props:['🏮','✨','🌙'],critter:'🦔'},
{name:'Снежные вершины',sky:['#abd4ed','#f4f8fc'],hill:'#c1d2e0',earth:'#7697aa',grass:'#f4ffff',accent:'#64a7cd',cloud:'#ffffff',props:['🌲','❄️','🏔️'],critter:'🐑'},
{name:'Осенняя тропа',sky:['#f1c496','#fff0d6'],hill:'#c29770',earth:'#996747',grass:'#dfa95d',accent:'#b65042',cloud:'#fff5d9',props:['🍁','🌾','🍂'],critter:'🦊'},
{name:'Цветочный берег',sky:['#91d2cd','#d5f3df'],hill:'#71b9aa',earth:'#43877b',grass:'#90d3a7',accent:'#e9a6ba',cloud:'#f5ffea',props:['🌷','🪷','💧'],critter:'🐸'}];
function make(level){let theme=themes[level%themes.length],platforms=[],x=0;const widths=[310,170,300,200,340,180,320,220];let i=0;while(x<4620){let w=widths[(i+level)%widths.length],y=(i%3===1?420-(level%2)*15:460);platforms.push([x,w,y]);x+=w;i++}
const arenas=[[1100,650,460],[3450,700,460]];for(const [ax,aw,ay] of arenas){const clipped=[];for(const [px,pw,py] of platforms){if(px+pw<=ax||px>=ax+aw)clipped.push([px,pw,py]);else{if(px<ax)clipped.push([px,ax-px,py]);if(px+pw>ax+aw)clipped.push([ax+aw,px+pw-ax-aw,py])}}clipped.push([ax,aw,ay]);platforms=clipped.sort((a,b)=>a[0]-b[0])}
const floor=x=>{const a=platforms.find(p=>x>=p[0]&&x<p[0]+p[1]);return a?a[2]:460};
const ledges=[[520,110,350],[610,120,285],[2300,120,355],[2400,140,285],[2690,110,350],[2790,120,280],[3020,120,345]].map(([x,w,y])=>[x,w,y-Math.min(level,5)*3]);platforms.push(...ledges);const monsters=arenas.slice(0,level<3?1:2).map(([ax,aw],id)=>({id,x:ax+aw/2,range:10,speed:.35}));
const coins=[];let coinIndex=0;const rewardHeight=44;
for(const [px,w,y] of platforms.slice(0,-ledges.length)){if(w<70)continue;const count=Math.max(1,Math.floor((w-64)/100)+1);for(let j=0;j<count;j++){const cx=px+w*(j+1)/(count+1);if(cx<100||cx>4300||[900,2100,3300].some(g=>Math.abs(cx-g)<75)||platforms.some(([sx,sw,sy])=>sy<y&&cx+14>sx&&cx-14<sx+sw))continue;coins.push({id:'c'+coinIndex++,x:cx,y:y-rewardHeight,support:[px,w,y]})}}
const critters=[650,1690,2900,4300].map((x,j)=>({id:j,x,y:floor(x),range:22}));
for(const [px,w,y] of ledges){const count=w>=135?2:1;for(let j=0;j<count;j++){const cx=px+w*(j+1)/(count+1);if(platforms.some(([sx,sw,sy])=>sy<y&&cx+14>sx&&cx-14<sx+sw))continue;coins.push({id:'ledge'+px+(j?'-'+j:''),x:cx,y:y-rewardHeight,support:[px,w,y]})}}
return{theme,platforms,ledges,monsters,coins,critters,gates:[900,2100,3300],finish:4400,floor}}
const api={themes,make};if(typeof module!=='undefined')module.exports=api;else root.LumiWorld=api;
})(typeof window!=='undefined'?window:this);
