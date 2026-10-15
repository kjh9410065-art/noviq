// NOVIQ mini-app: calculations run locally; no user data leaves the device.
const n=(v)=>{let s=String(v??'').trim().replaceAll(',','');if(!s||!Number.isFinite(Number(s)))throw Error('숫자를 정확히 입력해 주세요.');return Number(s)};
const p=(v)=>{let x=n(v);if(x<0)throw Error('음수는 입력할 수 없어요.');return x};
const rate=(v)=>{let x=p(v);if(x>100)throw Error('비율은 0~100 사이여야 해요.');return x};
const won=(x)=>Math.round(x).toLocaleString('ko-KR')+'원';
const qty=(x)=>Number(x.toFixed(2)).toLocaleString('ko-KR');
const dt=(v)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('날짜를 입력해 주세요.');let [y,m,d]=v.split('-').map(Number);let t=Date.UTC(y,m-1,d),a=new Date(t);if(a.getUTCFullYear()!==y||a.getUTCMonth()!==m-1||a.getUTCDate()!==d)throw Error('올바른 날짜를 입력해 주세요.');return t};
const diff=(a,b)=>Math.round((dt(b)-dt(a))/86400000);
const f=(id,name,category,description,fields,run)=>({id,name,category,description,fields,run});
const inp=(id,label,value,type='number')=>({id,label,value,type});
export const calculators=[
 f('percent','퍼센트 계산기','수학','금액의 비율과 증감을 계산해요',[inp('amount','기준 금액','100000'),inp('rate','비율(%)','15')],v=>{let a=p(v.amount),r=rate(v.rate)/100;return [['비율 금액',won(a*r)],['증가 적용',won(a*(1+r))],['감소 적용',won(a*(1-r))]]}),
 f('discount','할인 계산기','생활','할인 후 가격을 계산해요',[inp('price','상품 가격','59000'),inp('rate','할인율(%)','20')],v=>{let a=p(v.price),r=rate(v.rate)/100;return [['할인 금액',won(a*r)],['최종 가격',won(a*(1-r))]]}),
 f('split-bill','더치페이 계산기','생활','1인당 결제액을 계산해요',[inp('total','결제 금액','85000'),inp('people','인원 수','4')],v=>{let a=p(v.total),c=n(v.people);if(!Number.isInteger(c)||c<=0)throw Error('인원 수는 1명 이상 정수여야 해요.');return [['1인당 금액 (올림)',won(Math.ceil(a/c))],['정확한 1인당 금액',qty(a/c)+'원']]}),
 f('vat','부가세 계산기','사업','공급가액과 부가세를 구해요',[inp('amount','금액','110000'),inp('included','부가세 포함(1) / 별도(0)','1')],v=>{let a=p(v.amount),inc=n(v.included);if(inc!==1&&inc!==0)throw Error('포함은 1, 별도는 0을 입력해 주세요.');let base=inc?a/1.1:a;return [['공급가액',won(base)],['부가세',won(base*0.1)],['합계',won(base*1.1)]]}),
 f('average','평균 계산기','수학','숫자를 쉼표로 구분해 입력하세요',[inp('numbers','숫자 목록','10,20,30,40','text')],v=>{let a=String(v.numbers).split(/[\n,]+/).filter(x=>x.trim()).map(n);if(!a.length)throw Error('숫자를 하나 이상 입력해 주세요.');let sum=a.reduce((x,y)=>x+y,0);return [['합계',qty(sum)],['개수',a.length+'개'],['평균',qty(sum/a.length)]]}),
 f('dday','D-day 계산기','날짜','오늘과 목표일의 차이를 계산해요',[inp('target','목표일','2026-12-31','date')],v=>{let now=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());let d=diff(now,v.target);return [['D-day',d===0?'D-DAY':d>0?'D-'+d:'D+'+(-d)],['일수 차이',Math.abs(d)+'일']]}),
 f('date-difference','날짜 차이 계산기','날짜','두 날짜 간 차이를 계산해요',[inp('start','시작 날짜','2026-10-01','date'),inp('end','끝 날짜','2026-10-15','date')],v=>{let d=Math.abs(diff(v.start,v.end));return [['차이',d+'일'],['양 끝 날짜 포함',(d+1)+'일']]}),
 f('compound-interest','복리 계산기','금융','매월 복리 기준 예상 자산',[inp('principal','시작 금액','1000000'),inp('rate','연 이율(%)','5'),inp('years','기간(년)','3')],v=>{let a=p(v.principal),r=rate(v.rate)/1200,y=p(v.years);if(y>100)throw Error('기간은 100년 이하여야 해요.');let end=a*(1+r)**(12*y);return [['예상 만기액',won(end)],['예상 이자',won(end-a)],['안내','세금·수수료 제외']]}),
 f('loan','대출 상환 계산기','금융','원리금균등 월 상환액을 계산해요',[inp('principal','대출 원금','10000000'),inp('rate','연 이율(%)','4.5'),inp('months','기간(개월)','36')],v=>{let a=p(v.principal),r=rate(v.rate)/1200,m=n(v.months);if(m<=0||m>1200||!Number.isInteger(m))throw Error('기간은 1~1200개월의 정수여야 해요.');let pay=r===0?a/m:a*r/(1-(1+r)**(-m));return [['월 상환액',won(pay)],['전체 이자',won(pay*m-a)],['방식','원리금균등·수수료 제외']]}),
 f('hourly-wage','시급 계산기','직장','근무시간에 따른 세전 금액',[inp('wage','시급','10320'),inp('hours','근무시간','40')],v=>[['예상 급여',won(p(v.wage)*p(v.hours))],['안내','세전·주휴수당 제외']])
];
export const findCalculator=(id)=>calculators.find(x=>x.id===id);