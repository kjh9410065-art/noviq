import {test} from 'node:test';import assert from 'node:assert/strict';import{calculators,findCalculator}from './calculators.mjs';const calc=(id,v)=>findCalculator(id).run(v);test('중복 없음',()=>assert.equal(new Set(calculators.map(x=>x.id)).size,10));test('할인',()=>assert.equal(calc('discount',{price:59000,rate:20})[1][1],'47,200원'));test('VAT',()=>assert.equal(calc('vat',{amount:110000,included:1})[0][1],'100,000원'));test('날짜',()=>assert.equal(calc('date-difference',{start:'2026-10-01',end:'2026-10-15'})[0][1],'14일'));test('인원 오류',()=>assert.throws(()=>calc('split-bill',{total:100,people:0})));test('평균',()=>assert.equal(calc('average',{numbers:'10,20,30'})[2][1],'20'));
test('팁 계산',()=>assert.equal(calc('tip',{price:30000,rate:10})[1][1],'33,000원'));
test('비율 계산',()=>assert.equal(calc('ratio',{part:25,total:100})[0][1],'25%'));
test('비율 분모 0 거부',()=>assert.throws(()=>calc('ratio',{part:1,total:0})));
test('대출·금융상품 계산 제외',()=>{assert.equal(findCalculator('loan'),undefined);assert.equal(findCalculator('compound-interest'),undefined);assert.equal(calculators.length,10)});
test('잘못된 날짜 거부',()=>assert.throws(()=>calc('date-difference',{start:'2025-02-29',end:'2025-03-01'})));
test('너무 큰 입력값 거부',()=>assert.throws(()=>calc('discount',{price:'1e308',rate:20})));
test('계산값 넘침 거부',()=>assert.throws(()=>calc('hourly-wage',{wage:'1e15',hours:'1000'})));
test('오늘 날짜 D-day 형식',()=>assert.equal(calc('dday',{target:new Date(Date.now()+9*3600000).toISOString().slice(0,10)})[0][1],'D-DAY'));
