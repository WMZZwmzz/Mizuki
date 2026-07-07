import{o as St,a as Tt,p as Z,b as F,g as Bt,s as B,d as Et}from"./disclose-version.x0avWqeP.js";import{i as At}from"./legacy.BjYMrsBj.js";import{an as Ft,E as Nt,bq as Kt,br as jt,o as Xt,u as Ot,bs as Ut,bt as qt,$ as Wt,bp as nt,bu as Mt,c as tt,aa as pt,p as Yt,d as m,g as a,e as w,r as v,a as C,b as et,s as yt,f as S,ad as ot,ae as $,t as D,a6 as Y,a9 as z,af as vt,m as Gt,ab as Qt,bv as Jt,am as Zt,Q as ft}from"./utils.rgxtgsju.js";import{a as $t,s as O}from"./render.CzXsKnqY.js";import{i as A}from"./if.DmcWQ1pC.js";import{I as R}from"./Icon.B3dpGlTC.js";import{m as bt}from"./musicConfig.BaHFQ7v8.js";import"./profileConfig.x8Q2lDz4.js";import{m as P}from"./musicPlayerStore.BNeJFQu3.js";import{S as te,a as ee,b as re,c as ie,d as ne,C as ht,P as ae,e as oe,N as le}from"./SidebarTrackInfo.Cnmptmt6.js";import{I as Q}from"./zh_TW.vPeSsvua.js";import{i as J}from"./translation.CuEKZGXD.js";import{s as se}from"./snippet.Iwhhp99k.js";import{a as ue}from"./actions.BoGPqx9Y.js";import{e as ce,i as de}from"./each.C2X2S7zn.js";import{g as ge}from"./url-utils.l6OGKkSY.js";const ve=()=>performance.now(),W={tick:r=>requestAnimationFrame(r),now:()=>ve(),tasks:new Set};function Lt(){const r=W.now();W.tasks.forEach(t=>{t.c(r)||(W.tasks.delete(t),t.f())}),W.tasks.size!==0&&W.tick(Lt)}function me(r){let t;return W.tasks.size===0&&W.tick(Lt),{promise:new Promise(e=>{W.tasks.add(t={c:r,f:e})}),abort(){W.tasks.delete(t)}}}function gt(r,t){Mt(()=>{r.dispatchEvent(new CustomEvent(t))})}function fe(r){if(r==="float")return"cssFloat";if(r==="offset")return"cssOffset";if(r.startsWith("--"))return r;const t=r.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(e=>e[0].toUpperCase()+e.slice(1)).join("")}function wt(r){const t={},e=r.split(";");for(const i of e){const[s,o]=i.split(":");if(!s||o===void 0)break;const y=fe(s.trim());t[y]=o.trim()}return t}const be=r=>r;function It(r,t,e,i){var s=(r&Ut)!==0,o="both",y,c=t.inert,x=t.style.overflow,n,u;function d(){return Mt(()=>y??=e()(t,i?.()??{},{direction:o}))}var b={is_global:s,in(){t.inert=c,n=xt(t,d(),u,1,()=>{gt(t,"introstart")},()=>{gt(t,"introend"),n?.abort(),n=y=void 0,t.style.overflow=x})},out(p){t.inert=!0,u=xt(t,d(),n,0,()=>{gt(t,"outrostart")},()=>{gt(t,"outroend"),p?.()})},stop:()=>{n?.abort(),u?.abort()}},f=Ft;if((f.nodes.t??=[]).push(b),$t){var k=s;if(!k){for(var l=f.parent;l&&(l.f&Nt)!==0;)for(;(l=l.parent)&&(l.f&Kt)===0;);k=!l||(l.f&jt)!==0}k&&Xt(()=>{Ot(()=>b.in())})}}function xt(r,t,e,i,s,o){var y=i===1;if(qt(t)){var c,x=!1;return Wt(()=>{if(!x){var h=t({direction:y?"in":"out"});c=xt(r,h,e,i,s,o)}}),{abort:()=>{x=!0,c?.abort()},deactivate:()=>c.deactivate(),reset:()=>c.reset(),t:()=>c.t()}}if(e?.deactivate(),!t?.duration&&!t?.delay)return s(),o(),{abort:nt,deactivate:nt,reset:nt,t:()=>i};const{delay:n=0,css:u,tick:d,easing:b=be}=t;var f=[];if(y&&e===void 0&&(d&&d(0,1),u)){var k=wt(u(0,1));f.push(k,k)}var l=()=>1-i,p=r.animate(f,{duration:n,fill:"forwards"});return p.onfinish=()=>{p.cancel(),s();var h=e?.t()??1-i;e?.abort();var L=i-h,g=t.duration*Math.abs(L),I=[];if(g>0){var M=!1;if(u)for(var V=Math.ceil(g/16.666666666666668),rt=0;rt<=V;rt+=1){var lt=h+L*b(rt/V),st=wt(u(lt,1-lt));I.push(st),M||=st.overflow==="hidden"}M&&(r.style.overflow="hidden"),l=()=>{var it=p.currentTime;return h+L*b(it/g)},d&&me(()=>{if(p.playState!=="running")return!1;var it=l();return d(it,1-it),!0})}p=r.animate(I,{duration:g,fill:"forwards"}),p.onfinish=()=>{l=()=>i,d?.(i,1-i),o()}},{abort:()=>{p&&(p.cancel(),p.effect=null,p.onfinish=nt)},deactivate:()=>{o=nt},reset:()=>{i===0&&d?.(1,0)},t:()=>l()}}function ye(r){const t=r-1;return t*t*t+1}function zt(r){const t=r-1;return t*t*t+1}function kt(r){const t=typeof r=="string"&&r.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||"px"]:[r,"px"]}function he(r,{delay:t=0,duration:e=400,easing:i=zt,x:s=0,y:o=0,opacity:y=0}={}){const c=getComputedStyle(r),x=+c.opacity,n=c.transform==="none"?"":c.transform,u=x*(1-y),[d,b]=kt(s),[f,k]=kt(o);return{delay:t,duration:e,easing:i,css:(l,p)=>`
			transform: ${n} translate(${(1-l)*d}${b}, ${(1-l)*f}${k});
			opacity: ${x-u*p}`}}function xe(r,{delay:t=0,duration:e=400,easing:i=zt,axis:s="y"}={}){const o=getComputedStyle(r),y=+o.opacity,c=s==="y"?"height":"width",x=parseFloat(o[c]),n=s==="y"?["top","bottom"]:["left","right"],u=n.map(h=>`${h[0].toUpperCase()}${h.slice(1)}`),d=parseFloat(o[`padding${u[0]}`]),b=parseFloat(o[`padding${u[1]}`]),f=parseFloat(o[`margin${u[0]}`]),k=parseFloat(o[`margin${u[1]}`]),l=parseFloat(o[`border${u[0]}Width`]),p=parseFloat(o[`border${u[1]}Width`]);return{delay:t,duration:e,easing:i,css:h=>`overflow: hidden;opacity: ${Math.min(h*20,1)*y};${c}: ${h*x}px;padding-${n[0]}: ${h*d}px;padding-${n[1]}: ${h*b}px;margin-${n[0]}: ${h*f}px;margin-${n[1]}: ${h*k}px;border-${n[0]}-width: ${h*l}px;border-${n[1]}-width: ${h*p}px;min-${c}: 0`}}var pe=S('<div class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw] svelte-1lty5dg"><div class="fab-music-header svelte-1lty5dg"><!> <!></div> <!> <!> <!></div>');function we(r,t){tt(t,!0);let e=pt(Yt(P.getState())),i=pt(!1);function s(M){const V=M;V.detail&&yt(e,V.detail,!0)}St(()=>{window.addEventListener("music-sidebar:state",s)}),Tt(()=>{typeof window<"u"&&window.removeEventListener("music-sidebar:state",s)});function o(){P.toggle()}function y(){P.prev()}function c(){P.next()}function x(){P.toggleMode()}function n(){yt(i,!a(i))}function u(M){P.playIndex(M)}function d(M){P.seek(M)}function b(){P.toggleMute()}function f(M){P.setVolume(M)}var k=pe(),l=m(k),p=m(l);te(p,{get currentSong(){return a(e).currentSong},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading}});var h=w(p,2);ee(h,{get currentSong(){return a(e).currentSong},get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},get volume(){return a(e).volume},get isMuted(){return a(e).isMuted},onToggleMute:b,onSetVolume:f}),v(l);var L=w(l,2);re(L,{get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},onSeek:d});var g=w(L,2);ie(g,{get isPlaying(){return a(e).isPlaying},get isShuffled(){return a(e).isShuffled},get repeatMode(){return a(e).isRepeating},onToggleMode:x,onPrev:y,onNext:c,onTogglePlay:o,onTogglePlaylist:n});var I=w(g,2);ne(I,{get playlist(){return a(e).playlist},get currentIndex(){return a(e).currentIndex},get isPlaying(){return a(e).isPlaying},get show(){return a(i)},onClose:n,onPlaySong:u}),v(k),C(r,k),et()}var ke=S('<div class="flex-1 min-w-0"><div class="text-sm font-medium text-90 truncate"> </div> <div class="text-xs text-50 truncate"> </div></div>'),_e=S('<div class="text-xs text-30 mt-1"> </div>'),Pe=S('<div class="flex-1 min-w-0"><div class="song-title text-lg font-bold text-90 truncate mb-1"> </div> <div class="song-artist text-sm text-50 truncate"> </div> <!></div>');function _t(r,t){tt(t,!0);const e=Z(t,"showTime",3,!1),i=Z(t,"size",3,"mini");function s(n){if(!Number.isFinite(n)||n<0)return"0:00";const u=Math.floor(n/60),d=Math.floor(n%60);return`${u}:${d.toString().padStart(2,"0")}`}var o=ot(),y=$(o);{var c=n=>{var u=ke(),d=m(u),b=m(d,!0);v(d);var f=w(d,2),k=m(f,!0);v(f),v(u),D(()=>{O(b,t.song.title),O(k,t.song.artist)}),C(n,u)},x=n=>{var u=Pe(),d=m(u),b=m(d,!0);v(d);var f=w(d,2),k=m(f,!0);v(f);var l=w(f,2);{var p=h=>{var L=_e(),g=m(L);v(L),D((I,M)=>O(g,`${I??""} / ${M??""}`),[()=>s(t.currentTime),()=>s(t.duration)]),C(h,L)};A(l,h=>{e()&&h(p)})}v(u),D(()=>{O(b,t.song.title),O(k,t.song.artist)}),C(n,u)};A(y,n=>{i()==="mini"?n(c):n(x,-1)})}C(r,o),et()}var Ce=S('<!> <div class="flex-1 min-w-0 cursor-pointer" role="button" tabindex="0"><!></div> <div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button></div>',1),Se=S('<div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button><!></button></div>'),Te=S("<!> <!> <!>",1),Ee=S("<div><!></div>");function Dt(r,t){tt(t,!0);const e=Z(t,"size",3,"mini"),i=Z(t,"showControls",3,!1),s=Z(t,"showPlaylist",3,!1);var o=Ee(),y=m(o);{var c=n=>{var u=Ce(),d=$(u);ht(d,{get cover(){return t.song.cover},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"mini",interactive:!0,get onclick(){return t.onCoverClick}});var b=w(d,2),f=m(b);_t(f,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},size:"mini"}),v(b);var k=w(b,2),l=m(k),p=m(l);R(p,{icon:"material-symbols:visibility-off",class:"text-lg"}),v(l);var h=w(l,2),L=m(h);R(L,{icon:"material-symbols:expand-less",class:"text-lg"}),v(h),v(k),D((g,I)=>{B(b,"aria-label",g),B(l,"title",I)},[()=>J(Q.musicPlayerExpand),()=>J(Q.musicPlayerHide)]),z("click",b,function(...g){t.onInfoClick?.apply(this,g)}),z("keydown",b,g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),t.onInfoClick?.())}),z("click",l,g=>{g.stopPropagation(),t.onHideClick?.()}),z("click",h,g=>{g.stopPropagation(),t.onExpandClick?.()}),C(n,u)},x=n=>{var u=Te(),d=$(u);ht(d,{get cover(){return t.song.cover},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"expanded"});var b=w(d,2);_t(b,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},showTime:!0,size:"expanded"});var f=w(b,2);{var k=l=>{var p=Se(),h=m(p),L=m(h);R(L,{icon:"material-symbols:visibility-off",class:"text-lg"}),v(h);var g=w(h,2);let I;var M=m(g);R(M,{icon:"material-symbols:queue-music",class:"text-lg"}),v(g),v(p),D((V,rt)=>{B(h,"title",V),I=F(g,1,"btn-plain w-8 h-8 rounded-lg flex items-center justify-center",null,I,{"text-[var(--primary)]":s()}),B(g,"title",rt)},[()=>J(Q.musicPlayerHide),()=>J(Q.musicPlayerPlaylist)]),z("click",h,function(...V){t.onHideClick?.apply(this,V)}),z("click",g,function(...V){t.onPlaylistClick?.apply(this,V)}),C(l,p)};A(f,l=>{i()&&l(k)})}C(n,u)};A(y,n=>{e()==="mini"?n(c):n(x,-1)})}v(o),D(()=>F(o,1,Bt(e()==="mini"?"flex items-center gap-3 mb-0":"flex items-center gap-4 mb-4"))),C(r,o),et()}Y(["click","keydown"]);var Me=S("<div><!></div>");function Le(r,t){var e=Me();let i;var s=m(e);Dt(s,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"mini",get onCoverClick(){return t.onCoverClick},get onInfoClick(){return t.onInfoClick},get onHideClick(){return t.onHideClick},get onExpandClick(){return t.onExpandClick}}),v(e),D(()=>i=F(e,1,"mini-player card-base shadow-xl rounded-2xl p-3 absolute bottom-0 right-0 w-[17.5rem] svelte-g9ac72",null,i,{"mini-enter":!t.isHidden,"mini-leave":t.isHidden,"pointer-events-none":t.isHidden})),C(r,e)}var Pt=S("<button><!></button>");function Ct(r,t){const e=Z(t,"repeatMode",3,0),i=Z(t,"disabled",3,!1);var s=ot(),o=$(s);{var y=x=>{var n=Pt();let u;var d=m(n);R(d,{icon:"material-symbols:shuffle",class:"text-lg"}),v(n),D(()=>{u=F(n,1,"w-10 h-10 rounded-lg",null,u,{"btn-regular":t.isActive,"btn-plain":!t.isActive}),n.disabled=i()}),z("click",n,function(...b){t.onclick?.apply(this,b)}),C(x,n)},c=x=>{var n=Pt();let u;var d=m(n);{var b=l=>{R(l,{icon:"material-symbols:repeat-one",class:"text-lg"})},f=l=>{R(l,{icon:"material-symbols:repeat",class:"text-lg"})},k=l=>{R(l,{icon:"material-symbols:repeat",class:"text-lg opacity-50"})};A(d,l=>{e()===1?l(b):e()===2?l(f,1):l(k,-1)})}v(n),D(()=>u=F(n,1,"w-10 h-10 rounded-lg",null,u,{"btn-regular":t.isActive,"btn-plain":!t.isActive})),z("click",n,function(...l){t.onclick?.apply(this,l)}),C(x,n)};A(o,x=>{t.mode==="shuffle"?x(y):x(c,-1)})}C(r,s)}Y(["click"]);var Ie=S('<div class="controls flex items-center justify-center gap-2 mb-4"><!> <!> <!> <!> <!></div>');function ze(r,t){var e=Ie(),i=m(e);Ct(i,{mode:"shuffle",get isActive(){return t.isShuffled},get onclick(){return t.onShuffleClick}});var s=w(i,2);ae(s,{get onclick(){return t.onPrevClick},disabled:!1});var o=w(s,2);oe(o,{get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},get onclick(){return t.onPlayClick}});var y=w(o,2);le(y,{get onclick(){return t.onNextClick},disabled:!1});var c=w(y,2);{let x=vt(()=>t.isRepeating>0);Ct(c,{mode:"repeat",get isActive(){return a(x)},get repeatMode(){return t.isRepeating},get onclick(){return t.onRepeatClick}})}v(e),C(r,e)}var De=S('<div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"></div></div>');function Re(r,t){tt(t,!0);var e=De(),i=m(e);v(e),D(s=>{B(e,"aria-label",s),B(e,"aria-valuenow",t.duration>0?t.currentTime/t.duration*100:0),Et(i,`width: ${t.duration>0?t.currentTime/t.duration*100:0}%`)},[()=>J(Q.musicPlayerProgress)]),z("click",e,function(...s){t.onclick?.apply(this,s)}),z("keydown",e,function(...s){t.onkeydown?.apply(this,s)}),C(r,e),et()}Y(["click","keydown"]);var Ve=S('<div class="progress-section mb-4"><!></div>');function He(r,t){var e=Ve(),i=m(e);Re(i,{get currentTime(){return t.currentTime},get duration(){return t.duration},get onclick(){return t.onProgressClick},get onkeydown(){return t.onProgressKeyDown}}),v(e),C(r,e)}var Be=S('<button class="btn-plain w-8 h-8 rounded-lg"><!></button>');function Ae(r,t){var e=Be(),i=m(e);{var s=c=>{R(c,{icon:"material-symbols:volume-off",class:"text-lg"})},o=c=>{R(c,{icon:"material-symbols:volume-down",class:"text-lg"})},y=c=>{R(c,{icon:"material-symbols:volume-up",class:"text-lg"})};A(i,c=>{t.isMuted||t.volume===0?c(s):t.volume<.5?c(o,1):c(y,-1)})}v(e),z("click",e,function(...c){t.onclick?.apply(this,c)}),C(r,e)}Y(["click"]);var Fe=S('<div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>');function Ne(r,t){var e=Fe(),i=m(e);let s;v(e),ue(e,o=>t.volumeBarRef?.(o)),D(()=>{B(e,"aria-label",t.ariaLabel),B(e,"aria-valuenow",t.volume*100),s=F(i,1,"h-full bg-[var(--primary)] rounded-full transition-all",null,s,{"duration-100":!t.isVolumeDragging,"duration-0":t.isVolumeDragging}),Et(i,`width: ${t.volume*100}%`)}),z("pointerdown",e,function(...o){t.onpointerdown?.apply(this,o)}),z("keydown",e,function(...o){t.onkeydown?.apply(this,o)}),C(r,e)}Y(["pointerdown","keydown"]);var Ke=S('<div class="bottom-controls flex items-center gap-2"><!> <!> <!></div>');function je(r,t){var e=Ke(),i=m(e);Ae(i,{get volume(){return t.volume},get isMuted(){return t.isMuted},get onclick(){return t.onVolumeButtonClick}});var s=w(i,2);{let y=vt(()=>t.isMuted?0:t.volume);Ne(s,{get volume(){return a(y)},get isVolumeDragging(){return t.isVolumeDragging},get volumeBarRef(){return t.volumeBarRef},get onpointerdown(){return t.onSliderPointerDown},get onkeydown(){return t.onSliderKeyDown},get ariaLabel(){return t.ariaLabel}})}var o=w(s,2);se(o,()=>t.children??nt),v(e),C(r,e)}var Xe=S('<button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button>'),Oe=S("<div><!> <!> <!> <!></div>");function Ue(r,t){tt(t,!0);var e=Oe();let i;var s=m(e);Dt(s,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"expanded",showControls:!0,get showPlaylist(){return t.showPlaylist},get onHideClick(){return t.onHideClick},get onPlaylistClick(){return t.onPlaylistClick}});var o=w(s,2);He(o,{get currentTime(){return t.currentTime},get duration(){return t.duration},get onProgressClick(){return t.onProgressClick},get onProgressKeyDown(){return t.onProgressKeyDown}});var y=w(o,2);ze(y,{get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},get isShuffled(){return t.isShuffled},get isRepeating(){return t.isRepeating},get onPlayClick(){return t.onPlayClick},get onPrevClick(){return t.onPrevClick},get onNextClick(){return t.onNextClick},get onShuffleClick(){return t.onShuffleClick},get onRepeatClick(){return t.onRepeatClick}});var c=w(y,2);{let x=vt(()=>J(Q.musicPlayerVolume));je(c,{get volume(){return t.volume},get isMuted(){return t.isMuted},get isVolumeDragging(){return t.isVolumeDragging},get volumeBarRef(){return t.volumeBarRef},get onVolumeButtonClick(){return t.onVolumeButtonClick},get onSliderPointerDown(){return t.onSliderPointerDown},get onSliderKeyDown(){return t.onSliderKeyDown},get ariaLabel(){return a(x)},children:(n,u)=>{var d=Xe(),b=m(d);R(b,{icon:"material-symbols:expand-more",class:"text-lg"}),v(d),D(f=>B(d,"title",f),[()=>J(Q.musicPlayerCollapse)]),z("click",d,function(...f){t.onCollapseClick?.apply(this,f)}),C(n,d)}})}v(e),D(()=>i=F(e,1,"expanded-player card-base shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out absolute bottom-0 right-0 w-80",null,i,{"opacity-0":t.isHidden,"scale-95":t.isHidden,"pointer-events-none":t.isHidden})),C(r,e),et()}Y(["click"]);var qe=S('<span class="text-sm text-[var(--content-meta)]"> </span>'),We=S('<div role="button" tabindex="0"><div class="w-6 h-6 flex items-center justify-center"><!></div> <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0"><img decoding="async" class="w-full h-full object-cover"/></div> <div class="flex-1 min-w-0"><div> </div> <div> </div></div></div>');function Ye(r,t){tt(t,!0);const e=Z(t,"lazy",3,!0);var i=We();let s;var o=m(i),y=m(o);{var c=g=>{R(g,{icon:"material-symbols:graphic-eq",class:"text-[var(--primary)] animate-pulse"})},x=g=>{R(g,{icon:"material-symbols:pause",class:"text-[var(--primary)]"})},n=g=>{var I=qe(),M=m(I,!0);v(I),D(()=>O(M,t.index+1)),C(g,I)};A(y,g=>{t.isCurrent&&t.isPlaying?g(c):t.isCurrent?g(x,1):g(n,-1)})}v(o);var u=w(o,2),d=m(u);v(u);var b=w(u,2),f=m(b);let k;var l=m(f,!0);v(f);var p=w(f,2);let h;var L=m(p,!0);v(p),v(b),v(i),D(g=>{s=F(i,1,"playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors",null,s,{"bg-[var(--btn-plain-bg)]":t.isCurrent,"text-[var(--primary)]":t.isCurrent}),B(i,"aria-label",`播放 ${t.song.title??""} - ${t.song.artist??""}`),B(d,"src",g),B(d,"alt",t.song.title),B(d,"loading",e()?"lazy":"eager"),k=F(f,1,"font-medium truncate",null,k,{"text-[var(--primary)]":t.isCurrent,"text-90":!t.isCurrent}),O(l,t.song.title),h=F(p,1,"text-sm text-[var(--content-meta)] truncate",null,h,{"text-[var(--primary)]":t.isCurrent}),O(L,t.song.artist)},[()=>ge(t.song.cover)]),z("click",i,function(...g){t.onclick?.apply(this,g)}),z("keydown",i,g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),t.onclick())}),C(r,i),et()}Y(["click","keydown"]);var Ge=S('<div class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50 svelte-1v267om"><div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"><h3 class="text-lg font-semibold text-90"> </h3> <button class="btn-plain w-8 h-8 rounded-lg"><!></button></div> <div class="playlist-content overflow-y-auto max-h-80 hide-scrollbar" role="presentation"></div></div>');function Qe(r,t){tt(t,!0);var e=ot(),i=$(e);{var s=o=>{var y=Ge(),c=m(y),x=m(c),n=m(x,!0);v(x);var u=w(x,2),d=m(u);R(d,{icon:"material-symbols:close",class:"text-lg"}),v(u),v(c);var b=w(c,2);ce(b,21,()=>t.playlist,de,(f,k,l)=>{{let p=vt(()=>l===t.currentIndex);Ye(f,{get song(){return a(k)},index:l,get isCurrent(){return a(p)},get isPlaying(){return t.isPlaying},onclick:()=>t.onPlaySong(l),lazy:l!==0})}}),v(b),v(y),D(f=>O(n,f),[()=>J(Q.musicPlayerPlaylist)]),z("click",u,function(...f){t.onClose?.apply(this,f)}),It(3,y,()=>xe,()=>({duration:300,axis:"y"})),C(o,y)};A(i,o=>{t.show&&o(s)})}C(r,e),et()}Y(["click"]);var Je=S('<div class="fixed bottom-20 right-4 z-[60] max-w-sm"><div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"><!> <span class="text-sm flex-1"> </span> <button class="text-white/80 hover:text-white transition-colors"><!></button></div></div>'),Ze=S('<div class="music-player-fab-anchor fixed z-[55]"><div class="music-player-fab-shell"><!></div></div>'),$e=S("<div><div><!></div> <!> <!> <!></div>"),tr=S(`<!> <!> <style>.music-player-fab-anchor {
			right: var(--fab-group-right, 1.5rem);
			bottom: calc(
				var(--fab-group-bottom, 10rem) +
					(
						var(--fab-button-size, 3rem) *
							var(--fab-visible-count, 1)
					) +
					(
						var(--fab-group-gap, 0.5rem) *
							(var(--fab-visible-count, 1) - 1)
					)
			);
			width: 0;
			height: 0;
			pointer-events: none;
		}

		.music-player-fab-shell {
			position: absolute;
			right: 0;
			bottom: 0.75rem;
			transform-origin: bottom right;
			pointer-events: auto;
			will-change: transform, opacity;
		}

		.orb-player-container {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		.orb-enter {
			animation: orbElasticIn 460ms cubic-bezier(0.22, 1.25, 0.36, 1)
				forwards;
		}

		.orb-leave {
			animation: orbElasticOut 360ms cubic-bezier(0.4, 0, 1, 1) forwards;
		}

		@keyframes orbElasticIn {
			0% {
				opacity: 0;
				transform: translateX(0) scale(0.55);
			}
			70% {
				opacity: 1;
				transform: translateX(0) scale(1.12);
			}
			100% {
				opacity: 1;
				transform: translateX(0) scale(1);
			}
		}

		@keyframes orbElasticOut {
			0% {
				opacity: 1;
				transform: translateX(0) scale(1);
			}
			100% {
				opacity: 0;
				transform: translateX(0) scale(0.6);
			}
		}

		.music-player.hidden-mode {
			width: 3rem;
			height: 3rem;
		}

		.music-player {
			width: 20rem;
			max-width: 20rem;
			min-width: 20rem;
			user-select: none;
		}

		:global(.mini-player) {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		:global(.expanded-player) {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		:global(.orb-player) {
			position: relative;
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
		}

		:global(.orb-player::before) {
			content: "";
			position: absolute;
			inset: -0.125rem;
			background: linear-gradient(
				45deg,
				var(--primary),
				transparent,
				var(--primary)
			);
			border-radius: 50%;
			z-index: -1;
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		:global(.orb-player:hover::before) {
			opacity: 0.3;
			animation: rotate 2s linear infinite;
		}

		:global(.orb-player .animate-pulse) {
			animation: musicWave 1.5s ease-in-out infinite;
		}

		@keyframes rotate {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}

		@keyframes musicWave {
			0%,
			100% {
				transform: scaleY(0.5);
			}
			50% {
				transform: scaleY(1);
			}
		}

		:global(.animate-pulse) {
			animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		}

		@keyframes pulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.5;
			}
		}

		:global(.progress-section div:hover),
		:global(.bottom-controls > div:hover) {
			transform: scaleY(1.2);
			transition: transform 0.2s ease;
		}

		@media (max-width: 768px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 0.75rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 5rem) +
						(
							var(--fab-button-size, 2.75rem) *
								var(--fab-visible-count, 1)
						) +
						(
							var(--fab-group-gap, 0.5rem) *
								(var(--fab-visible-count, 1) - 1)
						)
				) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0.75rem !important;
			}

			.music-player {
				width: 280px !important;
				min-width: 280px !important;
				max-width: 280px !important;
				bottom: 0.5rem !important;
				right: 0.5rem !important;
			}
			:global(.mini-player) {
				width: 280px !important;
			}
			:global(.expanded-player) {
				width: 280px !important;
				max-width: 280px !important;
			}
			.music-player.expanded {
				width: 280px !important;
				min-width: 280px !important;
				max-width: 280px !important;
				right: 0.5rem !important;
			}
			:global(.playlist-panel) {
				width: 280px !important;
				right: 0.5rem !important;
				max-width: 280px !important;
			}
			:global(.controls) {
				gap: 8px;
			}
			:global(.controls button) {
				width: 36px;
				height: 36px;
			}
			:global(.controls button:nth-child(3)) {
				width: 44px;
				height: 44px;
			}
		}

		@media (max-width: 480px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 0.5rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 4.5rem) +
						(
							var(--fab-button-size, 2.5rem) *
								var(--fab-visible-count, 1)
						) +
						(
							var(--fab-group-gap, 0.5rem) *
								(var(--fab-visible-count, 1) - 1)
						)
				) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0.75rem !important;
			}

			.music-player {
				width: 260px !important;
				min-width: 260px !important;
				max-width: 260px !important;
			}
			:global(.expanded-player) {
				width: 260px !important;
				max-width: 260px !important;
			}
			:global(.playlist-panel) {
				width: 260px !important;
				max-width: 260px !important;
				right: 0.5rem !important;
			}
			:global(.song-title) {
				font-size: 14px;
			}
			:global(.song-artist) {
				font-size: 12px;
			}
			:global(.controls) {
				gap: 6px;
				margin-bottom: 12px;
			}
			:global(.controls button) {
				width: 32px;
				height: 32px;
			}
			:global(.controls button:nth-child(3)) {
				width: 40px;
				height: 40px;
			}
			:global(.playlist-item) {
				padding: 8px 12px;
			}
			:global(.playlist-item .w-10) {
				width: 32px;
				height: 32px;
			}
		}

		@keyframes slide-up {
			from {
				transform: translateY(100%);
				opacity: 0;
			}
			to {
				transform: translateY(0);
				opacity: 1;
			}
		}

		.animate-slide-up {
			animation: slide-up 0.3s ease-out;
		}

		@media (hover: none) and (pointer: coarse) {
			:global(.music-player button),
			:global(.playlist-item) {
				min-height: 44px;
			}
			:global(.progress-section > div),
			:global(.bottom-controls > div:nth-child(2)) {
				height: 12px;
			}
		}

		@keyframes spin-continuous {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}

		:global(.cover-container img) {
			animation: spin-continuous 3s linear infinite;
			animation-play-state: paused;
		}

		:global(.cover-container img.spinning) {
			animation-play-state: running;
		}

		:global(button.bg-\\\\[var\\\\(--primary\\\\)\\\\]) {
			box-shadow: 0 0 0 2px var(--primary);
			border: none;
		}</style>`,1);function yr(r,t){tt(t,!1);let e=Gt(P.getState());const i=bt.showFloatingPlayer,o=(bt.floatingEntryMode??"default")==="fab",y=i&&bt.enable;let c;function x(){P.toggle()}function n(){P.prev()}function u(){P.next()}function d(){P.toggleShuffle()}function b(){P.toggleRepeat()}function f(_){P.playIndex(_)}function k(_){const T=_.currentTarget;if(!T)return;const U=T.getBoundingClientRect(),j=(_.clientX-U.left)/U.width;P.setProgress(j)}function l(_){(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),P.setProgress(.5))}function p(){P.toggleMute()}function h(){P.toggleMute()}function L(_){const T=_.currentTarget;if(!T)return;const U=E=>{const N=T.getBoundingClientRect();if(N.width<=0)return;const K=Math.max(0,Math.min(1,(E-N.left)/N.width));P.setVolume(K)};U(_.clientX);const j=_.pointerId;T.setPointerCapture(j);const ut=E=>{E.pointerId===j&&U(E.clientX)},ct=()=>{T.removeEventListener("pointermove",ut),T.removeEventListener("pointerup",dt),T.removeEventListener("pointercancel",H),T.hasPointerCapture(j)&&T.releasePointerCapture(j)},dt=E=>{E.pointerId===j&&(U(E.clientX),ct())},H=E=>{E.pointerId===j&&ct()};T.addEventListener("pointermove",ut),T.addEventListener("pointerup",dt),T.addEventListener("pointercancel",H)}function g(_){const T=_.target;if(!(T?.tagName==="INPUT"||T?.tagName==="TEXTAREA"||T?.contentEditable==="true")){if(_.key==="ArrowLeft"||_.key==="ArrowDown"){_.preventDefault(),P.setVolume(a(e).volume-.05);return}if(_.key==="ArrowRight"||_.key==="ArrowUp"){_.preventDefault(),P.setVolume(a(e).volume+.05);return}(_.key==="Enter"||_.key===" "||_.key==="m"||_.key==="M")&&(_.preventDefault(),p())}}function I(){P.togglePlaylist()}function M(){P.toggleExpanded()}function V(){P.toggleHidden()}function rt(){P.hideError()}function lt(_){}function st(){return P.canSkip()}St(()=>{c=P.subscribe(_=>{yt(e,_)}),P.initialize()}),Tt(()=>{c&&c(),P.destroy()}),At();var it=ot();Qt("keydown",Jt,g);var Rt=$(it);{var Vt=_=>{var T=tr(),U=$(T);{var j=H=>{var E=Je(),N=m(E),K=m(N);R(K,{icon:"material-symbols:error",class:"text-xl flex-shrink-0"});var q=w(K,2),G=m(q,!0);v(q);var X=w(q,2),at=m(X);R(at,{icon:"material-symbols:close",class:"text-lg"}),v(X),v(N),v(E),D(()=>O(G,a(e).errorMessage)),z("click",X,rt),C(H,E)};A(U,H=>{a(e).showError&&H(j)})}var ut=w(U,2);{var ct=H=>{var E=ot(),N=$(E);{var K=q=>{var G=Ze(),X=m(G),at=m(X);we(at,{}),v(X),v(G),It(3,X,()=>he,()=>({y:16,duration:280,opacity:.12,easing:ye})),C(q,G)};A(N,q=>{a(e).isExpanded&&q(K)})}C(H,E)},dt=H=>{var E=$e();let N;var K=m(E),q=m(K);ht(q,{get cover(){return a(e).currentSong.cover},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading},size:"orb",onclick:V}),v(K);var G=w(K,2);{let mt=ft(()=>a(e).isExpanded||a(e).isHidden);Le(G,{get song(){return a(e).currentSong},get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading},get isHidden(){return a(mt)},onCoverClick:x,onInfoClick:M,onHideClick:V,onExpandClick:M})}var X=w(G,2);{let mt=ft(st),Ht=ft(()=>!a(e).isExpanded);Ue(X,{get song(){return a(e).currentSong},get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading},get isShuffled(){return a(e).isShuffled},get isRepeating(){return a(e).isRepeating},get showPlaylist(){return a(e).showPlaylist},get canSkip(){return a(mt)},get volume(){return a(e).volume},get isMuted(){return a(e).isMuted},isVolumeDragging:!1,get isHidden(){return a(Ht)},volumeBarRef:lt,onPlayClick:x,onPrevClick:n,onNextClick:()=>u(),onShuffleClick:d,onRepeatClick:b,onProgressClick:k,onProgressKeyDown:l,onVolumeButtonClick:h,onSliderPointerDown:L,onSliderKeyDown:g,onHideClick:V,onPlaylistClick:I,onCollapseClick:M})}var at=w(X,2);Qe(at,{get playlist(){return a(e).playlist},get currentIndex(){return a(e).currentIndex},get isPlaying(){return a(e).isPlaying},get show(){return a(e).showPlaylist},onClose:I,onPlaySong:f}),v(E),D(()=>{N=F(E,1,"music-player fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",null,N,{expanded:a(e).isExpanded,"hidden-mode":a(e).isHidden}),F(K,1,`orb-player-container ${a(e).isHidden?"orb-enter pointer-events-auto":"orb-leave pointer-events-none"}`)}),C(H,E)};A(ut,H=>{o?H(ct):H(dt,-1)})}Zt(2),C(_,T)};A(Rt,_=>{y&&_(Vt)})}C(r,it),et()}Y(["click"]);export{yr as default};
