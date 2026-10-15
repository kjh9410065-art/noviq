// NOVIQ mini-app: calculations run locally; no user data leaves the device.
const n=(v)=>{let s=String(v??'').trim().replaceAll(',',''),vNum=Number(s);if(!s||!Number.isFinite(vNum))throw Error('숫자를 정확히 입력해 주세요.');if(Math.abs(vNum)>1e15)throw Error('입력 값이 너무 커요.');return vNum};
const p=(v)=>{let x=n(v);if(x<0)throw Error('음수는 입력할 수 없어요.');return x};
const rate=(v)=>{let x=p(v);if(x>100)throw Error('비율은 0~100 사이여야 해요.');return x};
const result=(x)=>{if(!Number.isFinite(x)||Math.abs(x)>Number.MAX_SAFE_INTEGER)throw Error('계산 결과가 너무 커요. 입력 값을 줄여주세요.');return x};
const won=(x)=>Math.round(result(x)).toLocaleString('ko-KR')+'원';
const qty=(x)=>Number(result(x).toFixed(2)).toLocaleString('ko-KR');
const dt=(v)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('날짜를 입력해 주세요.');let [y,m,d]=v.split('-').map(Number);let t=Date.UTC(y,m-1,d),a=new Date(t);if(a.getUTCFullYear()!==y||a.getUTCMonth()!==m-1||a.getUTCDate()!==d)throw Error('올바른 날짜를 입력해 주세요.');return t};
const diff=(a,b)=>Math.round((dt(b)-dt(a))/86400000);
const todayKST=()=>{let parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const g=(type)=>parts.find(p=>p.type===type)?.value;return `${g('year')}-${g('month')}-${g('day')}`};
const f=(id,name,category,description,fields,run)=>({id,name,category,description,fields,run});
const inp=(id,label,value,type='number')=>({id,label,value,type});
export const calculators=[
 f('percent','퍼센트 계산기','수학','금액의 비율과 증감을 계산해요',[inp('amount','기준 금액','100000'),inp('rate','비율(%)','15')],v=>{let a=p(v.amount),r=rate(v.rate)/100;return [['비율 금액',won(a*r)],['증가 적용',won(a*(1+r))],['감소 적용',won(a*(1-r))]]}),
 f('discount','할인 계산기','생활','할인 후 가격을 계산해요',[inp('price','상품 가격','59000'),inp('rate','할인율(%)','20')],v=>{let a=p(v.price),r=rate(v.rate)/100;return [['할인 금액',won(a*r)],['최종 가격',won(a*(1-r))]]}),
 f('split-bill','더치페이 계산기','생활','1인당 결제액을 계산해요',[inp('total','결제 금액','85000'),inp('people','인원 수','4')],v=>{let a=p(v.total),c=n(v.people);if(!Number.isInteger(c)||c<=0)throw Error('인원 수는 1명 이상 정수여야 해요.');return [['1인당 금액 (올림)',won(Math.ceil(a/c))],['정확한 1인당 금액',qty(a/c)+'원']]}),
 f('vat','부가세 계산기','사업','공급가액과 부가세를 구해요',[inp('amount','금액','110000'),inp('included','부가세 포함 여부','1','select')],v=>{let a=p(v.amount),inc=n(v.included);if(inc!==1&&inc!==0)throw Error('포함은 1, 별도는 0을 입력해 주세요.');let base=inc?a/1.1:a;return [['공급가액',won(base)],['부가세',won(base*0.1)],['합계',won(base*1.1)]]}),
 f('average','평균 계산기','수학','숫자를 쉼표로 구분해 입력하세요',[inp('numbers','숫자 목록','10,20,30,40','text')],v=>{let a=String(v.numbers).split(/[\n,]+/).filter(x=>x.trim()).map(n);if(!a.length)throw Error('숫자를 하나 이상 입력해 주세요.');let sum=a.reduce((x,y)=>x+y,0);return [['합계',qty(sum)],['개수',a.length+'개'],['평균',qty(sum/a.length)]]}),
 f('dday','D-day 계산기','날짜','오늘과 목표일의 차이를 계산해요',[inp('target','목표일','2026-12-31','date')],v=>{let now=todayKST();let d=diff(now,v.target);return [['D-day',d===0?'D-DAY':d>0?'D-'+d:'D+'+(-d)],['일수 차이',Math.abs(d)+'일']]}),
 f('date-difference','날짜 차이 계산기','날짜','두 날짜 간 차이를 계산해요',[inp('start','시작 날짜','2026-10-01','date'),inp('end','끝 날짜','2026-10-15','date')],v=>{let d=Math.abs(diff(v.start,v.end));return [['차이',d+'일'],['양 끝 날짜 포함',(d+1)+'일']]}),
 f('tip','팁 계산기','생활','팁 금액과 총 결제액을 계산해요',[inp('price','결제 금액','30000'),inp('rate','팁 비율(%)','10')],v=>{let a=p(v.price),r=rate(v.rate)/100;return [['팁 금액',won(a*r)],['총 결제 금액',won(a*(1+r))]]}),
 f('ratio','비율 계산기','수학','전체에서 일부가 차지하는 비율을 계산해요',[inp('part','일부의 값','25'),inp('total','전체 값','100')],v=>{let part=p(v.part),total=n(v.total);if(total<=0)throw Error('전체 값은 0보다 커야 해요.');return [['전체 대비 비율',qty(part/total*100)+'%'],['기준 관계',qty(part)+' / '+qty(total)]]}),
 f('hourly-wage','시급 계산기','직장','근무시간에 따른 세전 금액',[inp('wage','시급','10320'),inp('hours','근무시간','40')],v=>[['예상 급여',won(p(v.wage)*p(v.hours))],['안내','세전·주휴수당 제외']])
];
export const findCalculator=(id)=>calculators.find(x=>x.id===id);