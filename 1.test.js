let compiler = require('vue-template-compiler');

let t1 = `<div v-if="true">hello</div>
<div v-else>world</div>`;

let t2 = `<div v-show="true">hello</div>`;

let t3 = `<div v-for="(a,index) of arr" :key="index" v-if="a%2===0"></div>`;

console.log(compiler.compile(t3).render);

// with(this){return (true)?_c('div',[_v("hello")]):_c('div',[_v("world")])}

// with(this){return _c('div',{directives:[{name:"show",rawName:"v-show",value:(true),expression:"true"}]},[_v("hello")])}

// with(this){return _l((arr),function(a,index){return (a%2===0)?_c('div',{key:index}):_e()})}