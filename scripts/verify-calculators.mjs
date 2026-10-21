#!/usr/bin/env node
// NOVIQ static page and calculator smoke tests. Run: node scripts/verify-calculators.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root='public';
const registry=JSON.parse(fs.readFileSync(root+'/calculators.json','utf8'));
const active=registry.calculators.filter(c=>c.status==='active');
assert.equal(active.length,38,'Expected 38 active calculators');
assert.equal(new Set(active.map(c=>c.id)).size,active.length,'Duplicate calculator ID');
assert.equal(new Set(active.map(c=>c.url)).size,active.length,'Duplicate calculator URL');
const expected={
 'rent-conversion':625000,'brokerage-fee':1200000,'car-cost':1700000,
 'monthly-dividend':41666.666666666664,'sales-margin':6500,'break-even':125,
 'gpa':3.9375,'appliance-energy':60,'card-installment':100000,
 'salary-increase':10,'bmi':70/(1.7**2),'unit-converter':100
};
let checked=0;
for(const item of active){
 assert.match(item.url,/^\/[a-z0-9-]+\.html$/,'Invalid URL');
 const html=fs.readFileSync(root+item.url,'utf8');
 assert.match(html,/<html\b/i,item.id+' HTML missing');
 assert.match(html,/<\/html>/i,item.id+' HTML not closed');
 assert.match(html,/ca-pub-6943939077344765/,item.id+' AdSense missing');
 assert.doesNotMatch(html,/yandex\.ru|yaContextCb|Ya\.Context/i,item.id+' Yandex remains');
 if(!(item.id in expected))continue;
 const matches=[...html.matchAll(/id="v(\d+)" value="([^"]+)"/g)];
 const values=matches.map(x=>Number(x[2]));
 assert.ok(values.length>0,item.id+' no inputs');
 const formula=html.match(/const rows=\(\(\)=>\{([\s\S]*?)\}\)\(\)/);
 assert.ok(formula,item.id+' no formula');
 const rows=vm.runInNewContext('(function(v){'+formula[1]+'})',{}, {timeout:1000})(values);
 assert.ok(rows.every(x=>Number.isFinite(x[1])),item.id+' nonfinite result');
 assert.ok(Math.abs(rows[0][1]-expected[item.id])<0.0001,item.id+' unexpected result');
 checked++;
}
assert.equal(checked,12);
console.log('PASS: '+active.length+' registered pages, 12 executed calculation examples; AdSense/Yandex checks.');
