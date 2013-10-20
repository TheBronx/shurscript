function getGlobal(){return function(){return this.dust}.call(null)}var dust={};(function(dust){function Context(e,t,n){this.stack=e,this.global=t,this.blocks=n}function Stack(e,t,n,r){this.tail=t,this.isObject=!dust.isArray(e)&&e&&typeof e=="object",this.head=e,this.index=n,this.of=r}function Stub(e){this.head=new Chunk(this),this.callback=e,this.out=""}function Stream(){this.head=new Chunk(this)}function Chunk(e,t,n){this.root=e,this.next=t,this.data=[],this.flushable=!1,this.taps=n}function Tap(e,t){this.head=e,this.tail=t}dust.helpers={},dust.cache={},dust.register=function(e,t){if(!e)return;dust.cache[e]=t},dust.render=function(e,t,n){var r=(new Stub(n)).head;dust.load(e,r,Context.wrap(t,e)).end()},dust.stream=function(e,t){var n=new Stream;return dust.nextTick(function(){dust.load(e,n.head,Context.wrap(t,e)).end()}),n},dust.renderSource=function(e,t,n){return dust.compileFn(e)(t,n)},dust.compileFn=function(e,t){var n=dust.loadSource(dust.compile(e,t));return function(e,r){var i=r?new Stub(r):new Stream;return dust.nextTick(function(){n(i.head,Context.wrap(e,t)).end()}),i}},dust.load=function(e,t,n){var r=dust.cache[e];return r?r(t,n):dust.onLoad?t.map(function(t){dust.onLoad(e,function(r,i){if(r)return t.setError(r);dust.cache[e]||dust.loadSource(dust.compile(i,e)),dust.cache[e](t,n).end()})}):t.setError(new Error("Template Not Found: "+e))},dust.loadSource=function(source,path){return eval(source)},Array.isArray?dust.isArray=Array.isArray:dust.isArray=function(e){return Object.prototype.toString.call(e)=="[object Array]"},dust.nextTick=function(){return typeof process!="undefined"?process.nextTick:function(e){setTimeout(e,0)}}(),dust.isEmpty=function(e){return dust.isArray(e)&&!e.length?!0:e===0?!1:!e},dust.filter=function(e,t,n){if(n)for(var r=0,i=n.length;r<i;r++){var s=n[r];s==="s"?t=null:typeof dust.filters[s]=="function"&&(e=dust.filters[s](e))}return t&&(e=dust.filters[t](e)),e},dust.filters={h:function(e){return dust.escapeHtml(e)},j:function(e){return dust.escapeJs(e)},u:encodeURI,uc:encodeURIComponent,js:function(e){return JSON?JSON.stringify(e):e},jp:function(e){return JSON?JSON.parse(e):e}},dust.makeBase=function(e){return new Context(new Stack,e)},Context.wrap=function(e,t){if(e instanceof Context)return e;var n={};return n.__templates__=[],n.__templates__.push(t),new Context(new Stack(e),n)},Context.prototype.get=function(e){var t=this.stack,n;while(t){if(t.isObject){n=t.head[e];if(n!==undefined)return n}t=t.tail}return this.global?this.global[e]:undefined},Context.prototype.getPath=function(e,t){var n=this.stack,r,i=t.length,s=e?undefined:this.stack.tail;if(e&&i===0)return n.head;n=n.head;var o=0;while(n&&o<i){r=n,n=n[t[o]],o++;while(!n&&!e){if(o>1)return undefined;s?(n=s.head,s=s.tail,o=0):e||(n=this.global,e=!0,o=0)}}return typeof n=="function"?function(){return n.apply(r,arguments)}:n},Context.prototype.push=function(e,t,n){return new Context(new Stack(e,this.stack,t,n),this.global,this.blocks)},Context.prototype.rebase=function(e){return new Context(new Stack(e),this.global,this.blocks)},Context.prototype.current=function(){return this.stack.head},Context.prototype.getBlock=function(e,t,n){typeof e=="function"&&(e=e(t,n).data.join(""),t.data=[]);var r=this.blocks;if(!r)return;var i=r.length,s;while(i--){s=r[i][e];if(s)return s}},Context.prototype.shiftBlocks=function(e){var t=this.blocks,n;return e?(t?n=t.concat([e]):n=[e],new Context(this.stack,this.global,n)):this},Stub.prototype.flush=function(){var e=this.head;while(e){if(!e.flushable){if(e.error){this.callback(e.error),this.flush=function(){};return}return}this.out+=e.data.join(""),e=e.next,this.head=e}this.callback(null,this.out)},Stream.prototype.flush=function(){var e=this.head;while(e){if(!e.flushable){if(e.error){this.emit("error",e.error),this.flush=function(){};return}return}this.emit("data",e.data.join("")),e=e.next,this.head=e}this.emit("end")},Stream.prototype.emit=function(e,t){if(!this.events)return!1;var n=this.events[e];if(!n)return!1;if(typeof n=="function")n(t);else{var r=n.slice(0);for(var i=0,s=r.length;i<s;i++)r[i](t)}},Stream.prototype.on=function(e,t){return this.events||(this.events={}),this.events[e]?typeof this.events[e]=="function"?this.events[e]=[this.events[e],t]:this.events[e].push(t):this.events[e]=t,this},Stream.prototype.pipe=function(e){return this.on("data",function(t){e.write(t,"utf8")}).on("end",function(){e.end()}).on("error",function(t){e.error(t)}),this},Chunk.prototype.write=function(e){var t=this.taps;return t&&(e=t.go(e)),this.data.push(e),this},Chunk.prototype.end=function(e){return e&&this.write(e),this.flushable=!0,this.root.flush(),this},Chunk.prototype.map=function(e){var t=new Chunk(this.root,this.next,this.taps),n=new Chunk(this.root,t,this.taps);return this.next=n,this.flushable=!0,e(n),t},Chunk.prototype.tap=function(e){var t=this.taps;return t?this.taps=t.push(e):this.taps=new Tap(e),this},Chunk.prototype.untap=function(){return this.taps=this.taps.tail,this},Chunk.prototype.render=function(e,t){return e(this,t)},Chunk.prototype.reference=function(e,t,n,r){if(typeof e=="function"){e.isFunction=!0,e=e.apply(t.current(),[this,t,null,{auto:n,filters:r}]);if(e instanceof Chunk)return e}return dust.isEmpty(e)?this:this.write(dust.filter(e,n,r))},Chunk.prototype.section=function(e,t,n,r){if(typeof e=="function"){e=e.apply(t.current(),[this,t,n,r]);if(e instanceof Chunk)return e}var i=n.block,s=n["else"];r&&(t=t.push(r));if(dust.isArray(e)){if(i){var o=e.length,u=this;if(o>0){t.stack.head&&(t.stack.head.$len=o);for(var a=0;a<o;a++)t.stack.head&&(t.stack.head.$idx=a),u=i(u,t.push(e[a],a,o));return t.stack.head&&(t.stack.head.$idx=undefined,t.stack.head.$len=undefined),u}if(s)return s(this,t)}}else if(e===!0){if(i)return i(this,t)}else if(e||e===0){if(i)return i(this,t.push(e))}else if(s)return s(this,t);return this},Chunk.prototype.exists=function(e,t,n){var r=n.block,i=n["else"];if(!dust.isEmpty(e)){if(r)return r(this,t)}else if(i)return i(this,t);return this},Chunk.prototype.notexists=function(e,t,n){var r=n.block,i=n["else"];if(dust.isEmpty(e)){if(r)return r(this,t)}else if(i)return i(this,t);return this},Chunk.prototype.block=function(e,t,n){var r=n.block;return e&&(r=e),r?r(this,t):this},Chunk.prototype.partial=function(e,t,n){var r;t.global&&t.global.__templates__&&t.global.__templates__.push(e),n?(r=dust.makeBase(t.global),r.blocks=t.blocks,t.stack&&t.stack.tail&&(r.stack=t.stack.tail),r=r.push(n),r=r.push(t.stack.head)):r=t;var i;return typeof e=="function"?i=this.capture(e,r,function(e,t){dust.load(e,t,r).end()}):i=dust.load(e,this,r),t.global&&t.global.__templates__&&t.global.__templates__.pop(),i},Chunk.prototype.helper=function(e,t,n,r){return dust.helpers[e]?dust.helpers[e](this,t,n,r):this},Chunk.prototype.capture=function(e,t,n){return this.map(function(r){var i=new Stub(function(e,t){e?r.setError(e):n(t,r)});e(i.head,t).end()})},Chunk.prototype.setError=function(e){return this.error=e,this.root.flush(),this},Tap.prototype.push=function(e){return new Tap(e,this)},Tap.prototype.go=function(e){var t=this;while(t)e=t.head(e),t=t.tail;return e};var HCHARS=new RegExp(/[&<>\"\']/),AMP=/&/g,LT=/</g,GT=/>/g,QUOT=/\"/g,SQUOT=/\'/g;dust.escapeHtml=function(e){return typeof e=="string"?HCHARS.test(e)?e.replace(AMP,"&amp;").replace(LT,"&lt;").replace(GT,"&gt;").replace(QUOT,"&quot;").replace(SQUOT,"&#39;"):e:e};var BS=/\\/g,FS=/\//g,CR=/\r/g,LS=/\u2028/g,PS=/\u2029/g,NL=/\n/g,LF=/\f/g,SQ=/'/g,DQ=/"/g,TB=/\t/g;dust.escapeJs=function(e){return typeof e=="string"?e.replace(BS,"\\\\").replace(FS,"\\/").replace(DQ,'\\"').replace(SQ,"\\'").replace(CR,"\\r").replace(LS,"\\u2028").replace(PS,"\\u2029").replace(NL,"\\n").replace(LF,"\\f").replace(TB,"\\t"):e}})(dust),typeof exports!="undefined"&&(typeof process!="undefined"&&require("./server")(dust),module.exports=dust)