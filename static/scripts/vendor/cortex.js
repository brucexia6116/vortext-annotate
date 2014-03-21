!function t(e,r,i){function s(_,o){if(!r[_]){if(!e[_]){var p="function"==typeof require&&require;if(!o&&p)return p(_,!0);if(n)return n(_,!0);throw new Error("Cannot find module '"+_+"'")}var u=r[_]={exports:{}};e[_][0].call(u.exports,function(t){var r=e[_][1][t];return s(r?r:t)},u,u.exports,t,e,r,i)}return r[_].exports}for(var n="function"==typeof require&&require,_=0;_<i.length;_++)s(i[_]);return s}({1:[function(t,e){var r=function(t,e){for(var r=0,i=e.length;i>r;r++)for(var s in e[r])t.prototype[s]=e[r][s]};e.exports=function(t,e){function i(t,e,r){this.__eventId=r,this.__value=t,this.__path=e||[],this.__wrap()}return i.prototype.set=function(t,r){e.publish("update"+this.__eventId,{value:t,path:this.__path,forceUpdate:r})},i.prototype.getValue=function(){return this.__value},i.prototype.val=i.prototype.getValue,i.prototype.getPath=function(){return this.__path},i.prototype.getKey=function(){return this.__path[this.__path.length-1]},i.prototype.forEach=function(t){if(this.__isObject())for(var e in this.__wrappers)t(e,this.__wrappers[e],this.__wrappers);else this.__isArray()&&this.__wrappers.forEach(t)},i.prototype.remove=function(){e.publish("remove"+this.__eventId,{path:this.__path})},i.prototype.__wrap=function(){var t;if(this.__cleanup(),this.__isObject()){this.__wrappers={};for(var e in this.__value)t=this.__path.slice(),t.push(e),this.__wrappers[e]=new i(this.__value[e],t,this.__eventId),this[e]=this.__wrappers[e]}else if(this.__isArray()){this.__wrappers=[];for(var r=0,s=this.__value.length;s>r;r++)t=this.__path.slice(),t.push(r),this.__wrappers[r]=new i(this.__value[r],t,this.__eventId),this[r]=this.__wrappers[r]}},i.prototype.__cleanup=function(){if(this.__wrappers){if(this.__isObject())for(var t in this.__wrappers)delete this[t];else if(this.__isArray())for(var e=0,r=this.__wrappers.length;r>e;e++)delete this[e];delete this.__wrappers}},i.prototype.__forceUpdate=function(){this.set(this.__value,!0)},i.prototype.__isObject=function(){return this.__value&&this.__value.constructor===Object},i.prototype.__isArray=function(){return this.__value&&this.__value.constructor===Array},r(i,t),i}},{}],2:[function(t,e){var r=t("./pubsub"),i=t("./wrappers/array"),s=t("./wrappers/hash"),n=t("./data_wrapper")([i,s],r),_={}.hasOwnProperty,o=function(t,e){function r(){this.constructor=t}for(var i in e)_.call(e,i)&&(t[i]=e[i]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},p=function(t,e){function r(t,e){this.__value=t,this.__path=[],this.__callback=e,this.__subscribe(),this.__wrap()}return o(r,t),r.prototype.update=function(t,e,r){return r||this.__shouldUpdate(t,e)?(this.__setValue(t,e),this.__rewrap(e),this.__callback?this.__callback(this):void 0):!1},r.prototype.__subscribe=function(){this.__eventId=e.subscribeToCortex(function(t,e){this.update(e.value,e.path,e.forceUpdate)}.bind(this),function(t,e){this.__remove(e.path)}.bind(this))},r.prototype.__remove=function(t){if(t.length){var e=t.slice(0,t.length-1),r=this.__subValue(e),i=t[t.length-1],s=r[i];return r.constructor===Object?delete r[i]:r.constructor===Array&&r.splice(i,1),this.update(r,e,!0),s}delete this.__wrappers,delete this.__value},r.prototype.__rewrap=function(t){for(var e=t.slice(0,t.length-1),r=this,i=0,s=e.length;s>i;i++)r=r[e[i]];r.__wrap()},r.prototype.__setValue=function(t,e){if(e.length>1){var r=this.__subValue(e.slice(0,e.length-1));r[e[e.length-1]]=t}else 1===e.length?this.__value[e[0]]=t:this.__value=t},r.prototype.__subValue=function(t){for(var e=this.__value,r=0,i=t.length;i>r;r++)e=e[t[r]];return e},r.prototype.__shouldUpdate=function(t,e){for(var r=this.__value,i=0,s=e.length;s>i;i++)r=r[e[i]];return this.__isDifferent(r,t)},r.prototype.__isDifferent=function(t,e){if(t&&t.constructor===Object){if(!e||e.constructor!==Object||this.__isDifferent(Object.keys(t).sort(),Object.keys(e).sort()))return!0;for(var r in t)if(this.__isDifferent(t[r],e[r]))return!0}else{if(!t||t.constructor!==Array)return t!==e;if(!e||e.constructor!==Array||t.length!==e.length)return!0;for(var i=0,s=t.length;s>i;i++)if(this.__isDifferent(t[i],e[i]))return!0}},r}(n,r);"undefined"!=typeof window&&null!==window&&(window.Cortex=p),e.exports=p},{"./data_wrapper":1,"./pubsub":3,"./wrappers/array":4,"./wrappers/hash":5}],3:[function(t,e){var r=function(){function t(){this.uid=-1,this.topics={}}return t.prototype.subscribe=function(t,e){this.topics.hasOwnProperty(t)||(this.topics[t]=[]),this.topics[t].push({callback:e})},t.prototype.publish=function(t,e){if(!this.topics.hasOwnProperty(t))return!1;var r=this.topics[t],i=function(){for(var i=0,s=r.length;s>i;i++)r[i].callback(t,e)};return i(),!0},t.prototype.subscribeToCortex=function(t,e){return this.uid+=1,this.subscribe("update"+this.uid,t),this.subscribe("remove"+this.uid,e),this.uid},t.prototype.unsubscribeFromCortex=function(t){delete this.topics["update"+t],delete this.topics["remove"+t]},t}();e.exports=new r},{}],4:[function(t,e){var r={count:function(){return this.__value.length},map:function(t){return this.__wrappers.map(t)},find:function(t){for(var e=0,r=this.__wrappers.length;r>e;e++)if(t(this.__wrappers[e],e,this.__wrappers))return this.__wrappers[e];return null},findIndex:function(t){for(var e=0,r=this.__wrappers.length;r>e;e++)if(t(this.__wrappers[e],e,this.__wrappers))return e;return-1},push:function(t){var e=this.__value.push(t);return this.__forceUpdate(),e},pop:function(){var t=this.__value.pop();return this.__forceUpdate(),t},insertAt:function(t,e){var r=[t,0].concat(e);Array.prototype.splice.apply(this.__value,r),this.__forceUpdate()},removeAt:function(t,e){(isNaN(e)||0>=e)&&(e=1);var r=this.__value.splice(t,e);return this.__forceUpdate(),r}};e.exports=r},{}],5:[function(t,e){var r={keys:function(){return Object.keys(this.__value)},values:function(){var t,e=[];for(t in this.__value)e.push(this.__value[t]);return e},hasKey:function(t){return null!=this.__value[t]},"delete":function(t){var e=this.__value[t];return delete this.__value[t],this.__forceUpdate(),e},add:function(t,e){return this.__value[t]=e,this.__forceUpdate(),e}};e.exports=r},{}]},{},[2]);