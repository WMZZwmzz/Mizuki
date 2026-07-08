import{o as Et,a as Tt,p as $,b as j,g as At,s as X,d as Lt}from"./disclose-version.x0avWqeP.js";import{i as Ft}from"./legacy.BjYMrsBj.js";import{an as Nt,E as Xt,bq as Kt,br as jt,o as Ot,u as Ut,bs as qt,bt as Wt,$ as Yt,bp as lt,bu as Mt,c as et,aa as wt,p as Gt,d as m,g as a,e as _,r as g,a as E,b as rt,s as yt,f as T,ad as ut,ae as tt,t as z,a6 as G,a9 as M,af as vt,m as Qt,ab as Jt,bv as Zt,am as $t,Q as ft}from"./utils.rgxtgsju.js";import{a as te,s as U}from"./render.CzXsKnqY.js";import{i as K}from"./if.DmcWQ1pC.js";import{I as V}from"./Icon.B3dpGlTC.js";import{m as bt}from"./musicConfig.Do4M7IBc.js";import"./profileConfig.x8Q2lDz4.js";import{m as C}from"./musicPlayerStore.CkZTEeVB.js";import{S as ee,a as re,b as ne,c as ie,d as ae,C as ht,P as oe,e as le,N as se}from"./SidebarTrackInfo.BF3X2W9X.js";import{I as J}from"./zh_TW.vPeSsvua.js";import{i as Z}from"./translation.CuEKZGXD.js";import{s as ue}from"./snippet.Iwhhp99k.js";import{a as ce}from"./actions.BoGPqx9Y.js";import{e as de,i as ge}from"./each.C2X2S7zn.js";import{g as ve}from"./url-utils.CxNlZ0tZ.js";const me=()=>performance.now(),Y={tick:r=>requestAnimationFrame(r),now:()=>me(),tasks:new Set};function It(){const r=Y.now();Y.tasks.forEach(t=>{t.c(r)||(Y.tasks.delete(t),t.f())}),Y.tasks.size!==0&&Y.tick(It)}function fe(r){let t;return Y.tasks.size===0&&Y.tick(It),{promise:new Promise(e=>{Y.tasks.add(t={c:r,f:e})}),abort(){Y.tasks.delete(t)}}}function gt(r,t){Mt(()=>{r.dispatchEvent(new CustomEvent(t))})}function be(r){if(r==="float")return"cssFloat";if(r==="offset")return"cssOffset";if(r.startsWith("--"))return r;const t=r.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(e=>e[0].toUpperCase()+e.slice(1)).join("")}function kt(r){const t={},e=r.split(";");for(const n of e){const[l,o]=n.split(":");if(!l||o===void 0)break;const y=be(l.trim());t[y]=o.trim()}return t}const ye=r=>r;function Dt(r,t,e,n){var l=(r&qt)!==0,o="both",y,c=t.inert,p=t.style.overflow,i,u;function d(){return Mt(()=>y??=e()(t,n?.()??{},{direction:o}))}var b={is_global:l,in(){t.inert=c,i=xt(t,d(),u,1,()=>{gt(t,"introstart")},()=>{gt(t,"introend"),i?.abort(),i=y=void 0,t.style.overflow=p})},out(w){t.inert=!0,u=xt(t,d(),i,0,()=>{gt(t,"outrostart")},()=>{gt(t,"outroend"),w?.()})},stop:()=>{i?.abort(),u?.abort()}},f=Nt;if((f.nodes.t??=[]).push(b),te){var P=l;if(!P){for(var s=f.parent;s&&(s.f&Xt)!==0;)for(;(s=s.parent)&&(s.f&Kt)===0;);P=!s||(s.f&jt)!==0}P&&Ot(()=>{Ut(()=>b.in())})}}function xt(r,t,e,n,l,o){var y=n===1;if(Wt(t)){var c,p=!1;return Yt(()=>{if(!p){var h=t({direction:y?"in":"out"});c=xt(r,h,e,n,l,o)}}),{abort:()=>{p=!0,c?.abort()},deactivate:()=>c.deactivate(),reset:()=>c.reset(),t:()=>c.t()}}if(e?.deactivate(),!t?.duration&&!t?.delay)return l(),o(),{abort:lt,deactivate:lt,reset:lt,t:()=>n};const{delay:i=0,css:u,tick:d,easing:b=ye}=t;var f=[];if(y&&e===void 0&&(d&&d(0,1),u)){var P=kt(u(0,1));f.push(P,P)}var s=()=>1-n,w=r.animate(f,{duration:i,fill:"forwards"});return w.onfinish=()=>{w.cancel(),l();var h=e?.t()??1-n;e?.abort();var I=n-h,v=t.duration*Math.abs(I),D=[];if(v>0){var L=!1;if(u)for(var H=Math.ceil(v/16.666666666666668),q=0;q<=H;q+=1){var ct=h+I*b(q/H),dt=kt(u(ct,1-ct));D.push(dt),L||=dt.overflow==="hidden"}L&&(r.style.overflow="hidden"),s=()=>{var ot=w.currentTime;return h+I*b(ot/v)},d&&fe(()=>{if(w.playState!=="running")return!1;var ot=s();return d(ot,1-ot),!0})}w=r.animate(D,{duration:v,fill:"forwards"}),w.onfinish=()=>{s=()=>n,d?.(n,1-n),o()}},{abort:()=>{w&&(w.cancel(),w.effect=null,w.onfinish=lt)},deactivate:()=>{o=lt},reset:()=>{n===0&&d?.(1,0)},t:()=>s()}}function he(r){const t=r-1;return t*t*t+1}function zt(r){const t=r-1;return t*t*t+1}function _t(r){const t=typeof r=="string"&&r.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||"px"]:[r,"px"]}function xe(r,{delay:t=0,duration:e=400,easing:n=zt,x:l=0,y:o=0,opacity:y=0}={}){const c=getComputedStyle(r),p=+c.opacity,i=c.transform==="none"?"":c.transform,u=p*(1-y),[d,b]=_t(l),[f,P]=_t(o);return{delay:t,duration:e,easing:n,css:(s,w)=>`
			transform: ${i} translate(${(1-s)*d}${b}, ${(1-s)*f}${P});
			opacity: ${p-u*w}`}}function pe(r,{delay:t=0,duration:e=400,easing:n=zt,axis:l="y"}={}){const o=getComputedStyle(r),y=+o.opacity,c=l==="y"?"height":"width",p=parseFloat(o[c]),i=l==="y"?["top","bottom"]:["left","right"],u=i.map(h=>`${h[0].toUpperCase()}${h.slice(1)}`),d=parseFloat(o[`padding${u[0]}`]),b=parseFloat(o[`padding${u[1]}`]),f=parseFloat(o[`margin${u[0]}`]),P=parseFloat(o[`margin${u[1]}`]),s=parseFloat(o[`border${u[0]}Width`]),w=parseFloat(o[`border${u[1]}Width`]);return{delay:t,duration:e,easing:n,css:h=>`overflow: hidden;opacity: ${Math.min(h*20,1)*y};${c}: ${h*p}px;padding-${i[0]}: ${h*d}px;padding-${i[1]}: ${h*b}px;margin-${i[0]}: ${h*f}px;margin-${i[1]}: ${h*P}px;border-${i[0]}-width: ${h*s}px;border-${i[1]}-width: ${h*w}px;min-${c}: 0`}}var we=T('<div class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw] svelte-1lty5dg"><div class="fab-music-header svelte-1lty5dg"><!> <!></div> <!> <!> <!></div>');function ke(r,t){et(t,!0);let e=wt(Gt(C.getState())),n=wt(!1);function l(L){const H=L;H.detail&&yt(e,H.detail,!0)}Et(()=>{window.addEventListener("music-sidebar:state",l)}),Tt(()=>{typeof window<"u"&&window.removeEventListener("music-sidebar:state",l)});function o(){C.toggle()}function y(){C.prev()}function c(){C.next()}function p(){C.toggleMode()}function i(){yt(n,!a(n))}function u(L){C.playIndex(L)}function d(L){C.seek(L)}function b(){C.toggleMute()}function f(L){C.setVolume(L)}var P=we(),s=m(P),w=m(s);ee(w,{get currentSong(){return a(e).currentSong},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading}});var h=_(w,2);re(h,{get currentSong(){return a(e).currentSong},get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},get volume(){return a(e).volume},get isMuted(){return a(e).isMuted},onToggleMute:b,onSetVolume:f}),g(s);var I=_(s,2);ne(I,{get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},onSeek:d});var v=_(I,2);ie(v,{get isPlaying(){return a(e).isPlaying},get isShuffled(){return a(e).isShuffled},get repeatMode(){return a(e).isRepeating},onToggleMode:p,onPrev:y,onNext:c,onTogglePlay:o,onTogglePlaylist:i});var D=_(v,2);ae(D,{get playlist(){return a(e).playlist},get currentIndex(){return a(e).currentIndex},get isPlaying(){return a(e).isPlaying},get show(){return a(n)},onClose:i,onPlaySong:u}),g(P),E(r,P),rt()}var _e=T('<div class="flex-1 min-w-0"><div class="text-sm font-medium text-90 truncate"> </div> <div class="text-xs text-50 truncate"> </div></div>'),Pe=T('<div class="text-xs text-30 mt-1"> </div>'),Ce=T('<div class="flex-1 min-w-0"><div class="song-title text-lg font-bold text-90 truncate mb-1"> </div> <div class="song-artist text-sm text-50 truncate"> </div> <!></div>');function Pt(r,t){et(t,!0);const e=$(t,"showTime",3,!1),n=$(t,"size",3,"mini");function l(i){if(!Number.isFinite(i)||i<0)return"0:00";const u=Math.floor(i/60),d=Math.floor(i%60);return`${u}:${d.toString().padStart(2,"0")}`}var o=ut(),y=tt(o);{var c=i=>{var u=_e(),d=m(u),b=m(d,!0);g(d);var f=_(d,2),P=m(f,!0);g(f),g(u),z(()=>{U(b,t.song.title),U(P,t.song.artist)}),E(i,u)},p=i=>{var u=Ce(),d=m(u),b=m(d,!0);g(d);var f=_(d,2),P=m(f,!0);g(f);var s=_(f,2);{var w=h=>{var I=Pe(),v=m(I);g(I),z((D,L)=>U(v,`${D??""} / ${L??""}`),[()=>l(t.currentTime),()=>l(t.duration)]),E(h,I)};K(s,h=>{e()&&h(w)})}g(u),z(()=>{U(b,t.song.title),U(P,t.song.artist)}),E(i,u)};K(y,i=>{n()==="mini"?i(c):i(p,-1)})}E(r,o),rt()}var Se=T('<!> <div class="flex-1 min-w-0 cursor-pointer" role="button" tabindex="0"><!></div> <div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button></div>',1),Ee=T('<div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button><!></button></div>'),Te=T("<!> <!> <!>",1),Le=T("<div><!></div>");function Rt(r,t){et(t,!0);const e=$(t,"size",3,"mini"),n=$(t,"showControls",3,!1),l=$(t,"showPlaylist",3,!1);var o=Le(),y=m(o);{var c=i=>{var u=Se(),d=tt(u);ht(d,{get cover(){return t.song.cover},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"mini",interactive:!0,get onclick(){return t.onCoverClick}});var b=_(d,2),f=m(b);Pt(f,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},size:"mini"}),g(b);var P=_(b,2),s=m(P),w=m(s);V(w,{icon:"material-symbols:visibility-off",class:"text-lg"}),g(s);var h=_(s,2),I=m(h);V(I,{icon:"material-symbols:expand-less",class:"text-lg"}),g(h),g(P),z((v,D)=>{X(b,"aria-label",v),X(s,"title",D)},[()=>Z(J.musicPlayerExpand),()=>Z(J.musicPlayerHide)]),M("click",b,function(...v){t.onInfoClick?.apply(this,v)}),M("keydown",b,v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),t.onInfoClick?.())}),M("click",s,v=>{v.stopPropagation(),t.onHideClick?.()}),M("click",h,v=>{v.stopPropagation(),t.onExpandClick?.()}),E(i,u)},p=i=>{var u=Te(),d=tt(u);ht(d,{get cover(){return t.song.cover},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"expanded"});var b=_(d,2);Pt(b,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},showTime:!0,size:"expanded"});var f=_(b,2);{var P=s=>{var w=Ee(),h=m(w),I=m(h);V(I,{icon:"material-symbols:visibility-off",class:"text-lg"}),g(h);var v=_(h,2);let D;var L=m(v);V(L,{icon:"material-symbols:queue-music",class:"text-lg"}),g(v),g(w),z((H,q)=>{X(h,"title",H),D=j(v,1,"btn-plain w-8 h-8 rounded-lg flex items-center justify-center",null,D,{"text-[var(--primary)]":l()}),X(v,"title",q)},[()=>Z(J.musicPlayerHide),()=>Z(J.musicPlayerPlaylist)]),M("click",h,function(...H){t.onHideClick?.apply(this,H)}),M("click",v,function(...H){t.onPlaylistClick?.apply(this,H)}),E(s,w)};K(f,s=>{n()&&s(P)})}E(i,u)};K(y,i=>{e()==="mini"?i(c):i(p,-1)})}g(o),z(()=>j(o,1,At(e()==="mini"?"flex items-center gap-3 mb-0":"flex items-center gap-4 mb-4"))),E(r,o),rt()}G(["click","keydown"]);var Me=T("<div><!></div>");function Ie(r,t){var e=Me();let n;var l=m(e);Rt(l,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"mini",get onCoverClick(){return t.onCoverClick},get onInfoClick(){return t.onInfoClick},get onHideClick(){return t.onHideClick},get onExpandClick(){return t.onExpandClick}}),g(e),z(()=>n=j(e,1,"mini-player card-base shadow-xl rounded-2xl p-3 absolute bottom-0 right-0 w-[17.5rem] svelte-g9ac72",null,n,{"mini-enter":!t.isHidden,"mini-leave":t.isHidden,"pointer-events-none":t.isHidden})),E(r,e)}var Ct=T("<button><!></button>");function St(r,t){const e=$(t,"repeatMode",3,0),n=$(t,"disabled",3,!1);var l=ut(),o=tt(l);{var y=p=>{var i=Ct();let u;var d=m(i);V(d,{icon:"material-symbols:shuffle",class:"text-lg"}),g(i),z(()=>{u=j(i,1,"w-10 h-10 rounded-lg",null,u,{"btn-regular":t.isActive,"btn-plain":!t.isActive}),i.disabled=n()}),M("click",i,function(...b){t.onclick?.apply(this,b)}),E(p,i)},c=p=>{var i=Ct();let u;var d=m(i);{var b=s=>{V(s,{icon:"material-symbols:repeat-one",class:"text-lg"})},f=s=>{V(s,{icon:"material-symbols:repeat",class:"text-lg"})},P=s=>{V(s,{icon:"material-symbols:repeat",class:"text-lg opacity-50"})};K(d,s=>{e()===1?s(b):e()===2?s(f,1):s(P,-1)})}g(i),z(()=>u=j(i,1,"w-10 h-10 rounded-lg",null,u,{"btn-regular":t.isActive,"btn-plain":!t.isActive})),M("click",i,function(...s){t.onclick?.apply(this,s)}),E(p,i)};K(o,p=>{t.mode==="shuffle"?p(y):p(c,-1)})}E(r,l)}G(["click"]);var De=T('<div class="controls flex items-center justify-center gap-2 mb-4"><!> <!> <!> <!> <!></div>');function ze(r,t){var e=De(),n=m(e);St(n,{mode:"shuffle",get isActive(){return t.isShuffled},get onclick(){return t.onShuffleClick}});var l=_(n,2);oe(l,{get onclick(){return t.onPrevClick},disabled:!1});var o=_(l,2);le(o,{get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},get onclick(){return t.onPlayClick}});var y=_(o,2);se(y,{get onclick(){return t.onNextClick},disabled:!1});var c=_(y,2);{let p=vt(()=>t.isRepeating>0);St(c,{mode:"repeat",get isActive(){return a(p)},get repeatMode(){return t.isRepeating},get onclick(){return t.onRepeatClick}})}g(e),E(r,e)}var Re=T('<div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"></div></div>');function Ve(r,t){et(t,!0);var e=Re(),n=m(e);g(e),z(l=>{X(e,"aria-label",l),X(e,"aria-valuenow",t.duration>0?t.currentTime/t.duration*100:0),Lt(n,`width: ${t.duration>0?t.currentTime/t.duration*100:0}%`)},[()=>Z(J.musicPlayerProgress)]),M("click",e,function(...l){t.onclick?.apply(this,l)}),M("keydown",e,function(...l){t.onkeydown?.apply(this,l)}),M("pointerdown",e,function(...l){t.onpointerdown?.apply(this,l)}),E(r,e),rt()}G(["click","keydown","pointerdown"]);var Be=T('<div class="progress-section mb-4"><!></div>');function He(r,t){var e=Be(),n=m(e);Ve(n,{get currentTime(){return t.currentTime},get duration(){return t.duration},get onclick(){return t.onProgressClick},get onkeydown(){return t.onProgressKeyDown},get onpointerdown(){return t.onProgressPointerDown}}),g(e),E(r,e)}var Ae=T('<button class="btn-plain w-8 h-8 rounded-lg"><!></button>');function Fe(r,t){var e=Ae(),n=m(e);{var l=c=>{V(c,{icon:"material-symbols:volume-off",class:"text-lg"})},o=c=>{V(c,{icon:"material-symbols:volume-down",class:"text-lg"})},y=c=>{V(c,{icon:"material-symbols:volume-up",class:"text-lg"})};K(n,c=>{t.isMuted||t.volume===0?c(l):t.volume<.5?c(o,1):c(y,-1)})}g(e),M("click",e,function(...c){t.onclick?.apply(this,c)}),E(r,e)}G(["click"]);var Ne=T('<div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>');function Xe(r,t){var e=Ne(),n=m(e);let l;g(e),ce(e,o=>t.volumeBarRef?.(o)),z(()=>{X(e,"aria-label",t.ariaLabel),X(e,"aria-valuenow",t.volume*100),l=j(n,1,"h-full bg-[var(--primary)] rounded-full transition-all",null,l,{"duration-100":!t.isVolumeDragging,"duration-0":t.isVolumeDragging}),Lt(n,`width: ${t.volume*100}%`)}),M("pointerdown",e,function(...o){t.onpointerdown?.apply(this,o)}),M("keydown",e,function(...o){t.onkeydown?.apply(this,o)}),E(r,e)}G(["pointerdown","keydown"]);var Ke=T('<div class="bottom-controls flex items-center gap-2"><!> <!> <!></div>');function je(r,t){var e=Ke(),n=m(e);Fe(n,{get volume(){return t.volume},get isMuted(){return t.isMuted},get onclick(){return t.onVolumeButtonClick}});var l=_(n,2);{let y=vt(()=>t.isMuted?0:t.volume);Xe(l,{get volume(){return a(y)},get isVolumeDragging(){return t.isVolumeDragging},get volumeBarRef(){return t.volumeBarRef},get onpointerdown(){return t.onSliderPointerDown},get onkeydown(){return t.onSliderKeyDown},get ariaLabel(){return t.ariaLabel}})}var o=_(l,2);ue(o,()=>t.children??lt),g(e),E(r,e)}var Oe=T('<button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button>'),Ue=T("<div><!> <!> <!> <!></div>");function qe(r,t){et(t,!0);var e=Ue();let n;var l=m(e);Rt(l,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"expanded",showControls:!0,get showPlaylist(){return t.showPlaylist},get onHideClick(){return t.onHideClick},get onPlaylistClick(){return t.onPlaylistClick}});var o=_(l,2);He(o,{get currentTime(){return t.currentTime},get duration(){return t.duration},get onProgressClick(){return t.onProgressClick},get onProgressKeyDown(){return t.onProgressKeyDown},get onProgressPointerDown(){return t.onProgressPointerDown}});var y=_(o,2);ze(y,{get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},get isShuffled(){return t.isShuffled},get isRepeating(){return t.isRepeating},get onPlayClick(){return t.onPlayClick},get onPrevClick(){return t.onPrevClick},get onNextClick(){return t.onNextClick},get onShuffleClick(){return t.onShuffleClick},get onRepeatClick(){return t.onRepeatClick}});var c=_(y,2);{let p=vt(()=>Z(J.musicPlayerVolume));je(c,{get volume(){return t.volume},get isMuted(){return t.isMuted},get isVolumeDragging(){return t.isVolumeDragging},get volumeBarRef(){return t.volumeBarRef},get onVolumeButtonClick(){return t.onVolumeButtonClick},get onSliderPointerDown(){return t.onSliderPointerDown},get onSliderKeyDown(){return t.onSliderKeyDown},get ariaLabel(){return a(p)},children:(i,u)=>{var d=Oe(),b=m(d);V(b,{icon:"material-symbols:expand-more",class:"text-lg"}),g(d),z(f=>X(d,"title",f),[()=>Z(J.musicPlayerCollapse)]),M("click",d,function(...f){t.onCollapseClick?.apply(this,f)}),E(i,d)}})}g(e),z(()=>n=j(e,1,"expanded-player card-base shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out absolute bottom-0 right-0 w-80",null,n,{"opacity-0":t.isHidden,"scale-95":t.isHidden,"pointer-events-none":t.isHidden})),E(r,e),rt()}G(["click"]);var We=T('<span class="text-sm text-[var(--content-meta)]"> </span>'),Ye=T('<div role="button" tabindex="0"><div class="w-6 h-6 flex items-center justify-center"><!></div> <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0"><img decoding="async" class="w-full h-full object-cover"/></div> <div class="flex-1 min-w-0"><div> </div> <div> </div></div></div>');function Ge(r,t){et(t,!0);const e=$(t,"lazy",3,!0);var n=Ye();let l;var o=m(n),y=m(o);{var c=v=>{V(v,{icon:"material-symbols:graphic-eq",class:"text-[var(--primary)] animate-pulse"})},p=v=>{V(v,{icon:"material-symbols:pause",class:"text-[var(--primary)]"})},i=v=>{var D=We(),L=m(D,!0);g(D),z(()=>U(L,t.index+1)),E(v,D)};K(y,v=>{t.isCurrent&&t.isPlaying?v(c):t.isCurrent?v(p,1):v(i,-1)})}g(o);var u=_(o,2),d=m(u);g(u);var b=_(u,2),f=m(b);let P;var s=m(f,!0);g(f);var w=_(f,2);let h;var I=m(w,!0);g(w),g(b),g(n),z(v=>{l=j(n,1,"playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors",null,l,{"bg-[var(--btn-plain-bg)]":t.isCurrent,"text-[var(--primary)]":t.isCurrent}),X(n,"aria-label",`播放 ${t.song.title??""} - ${t.song.artist??""}`),X(d,"src",v),X(d,"alt",t.song.title),X(d,"loading",e()?"lazy":"eager"),P=j(f,1,"font-medium truncate",null,P,{"text-[var(--primary)]":t.isCurrent,"text-90":!t.isCurrent}),U(s,t.song.title),h=j(w,1,"text-sm text-[var(--content-meta)] truncate",null,h,{"text-[var(--primary)]":t.isCurrent}),U(I,t.song.artist)},[()=>ve(t.song.cover)]),M("click",n,function(...v){t.onclick?.apply(this,v)}),M("keydown",n,v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),t.onclick())}),E(r,n),rt()}G(["click","keydown"]);var Qe=T('<div class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50 svelte-1v267om"><div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"><h3 class="text-lg font-semibold text-90"> </h3> <button class="btn-plain w-8 h-8 rounded-lg"><!></button></div> <div class="playlist-content overflow-y-auto max-h-80 hide-scrollbar" role="presentation"></div></div>');function Je(r,t){et(t,!0);var e=ut(),n=tt(e);{var l=o=>{var y=Qe(),c=m(y),p=m(c),i=m(p,!0);g(p);var u=_(p,2),d=m(u);V(d,{icon:"material-symbols:close",class:"text-lg"}),g(u),g(c);var b=_(c,2);de(b,21,()=>t.playlist,ge,(f,P,s)=>{{let w=vt(()=>s===t.currentIndex);Ge(f,{get song(){return a(P)},index:s,get isCurrent(){return a(w)},get isPlaying(){return t.isPlaying},onclick:()=>t.onPlaySong(s),lazy:s!==0})}}),g(b),g(y),z(f=>U(i,f),[()=>Z(J.musicPlayerPlaylist)]),M("click",u,function(...f){t.onClose?.apply(this,f)}),Dt(3,y,()=>pe,()=>({duration:300,axis:"y"})),E(o,y)};K(n,o=>{t.show&&o(l)})}E(r,e),rt()}G(["click"]);var Ze=T('<div class="fixed bottom-20 right-4 z-[60] max-w-sm"><div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"><!> <span class="text-sm flex-1"> </span> <button class="text-white/80 hover:text-white transition-colors"><!></button></div></div>'),$e=T('<div class="music-player-fab-anchor fixed z-[55]"><div class="music-player-fab-shell"><!></div></div>'),tr=T("<div><div><!></div> <!> <!> <!></div>"),er=T(`<!> <!> <style>.music-player-fab-anchor {
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
		}</style>`,1);function hr(r,t){et(t,!1);let e=Qt(C.getState());const n=bt.showFloatingPlayer,o=(bt.floatingEntryMode??"default")==="fab",y=n&&bt.enable;let c;function p(){C.toggle()}function i(){C.prev()}function u(){C.next()}function d(){C.toggleShuffle()}function b(){C.toggleRepeat()}function f(x){C.playIndex(x)}function P(x){const k=x.currentTarget;if(!k)return;const F=k.getBoundingClientRect(),R=(x.clientX-F.left)/F.width;C.setProgress(R)}function s(x){const k=x.currentTarget;if(!k)return;const F=S=>{const A=k.getBoundingClientRect();if(A.width<=0)return;const N=(S-A.left)/A.width;C.setProgress(N)};x.preventDefault(),F(x.clientX);const R=x.pointerId;k.setPointerCapture(R);const nt=S=>{S.pointerId===R&&F(S.clientX)},it=()=>{k.removeEventListener("pointermove",nt),k.removeEventListener("pointerup",at),k.removeEventListener("pointercancel",B),k.hasPointerCapture(R)&&k.releasePointerCapture(R)},at=S=>{S.pointerId===R&&(F(S.clientX),it())},B=S=>{S.pointerId===R&&it()};k.addEventListener("pointermove",nt),k.addEventListener("pointerup",at),k.addEventListener("pointercancel",B)}function w(x){(x.key==="Enter"||x.key===" ")&&(x.preventDefault(),C.setProgress(.5))}function h(){C.toggleMute()}function I(){C.toggleMute()}function v(x){const k=x.currentTarget;if(!k)return;const F=S=>{const A=k.getBoundingClientRect();if(A.width<=0)return;const N=Math.max(0,Math.min(1,(S-A.left)/A.width));C.setVolume(N)};F(x.clientX);const R=x.pointerId;k.setPointerCapture(R);const nt=S=>{S.pointerId===R&&F(S.clientX)},it=()=>{k.removeEventListener("pointermove",nt),k.removeEventListener("pointerup",at),k.removeEventListener("pointercancel",B),k.hasPointerCapture(R)&&k.releasePointerCapture(R)},at=S=>{S.pointerId===R&&(F(S.clientX),it())},B=S=>{S.pointerId===R&&it()};k.addEventListener("pointermove",nt),k.addEventListener("pointerup",at),k.addEventListener("pointercancel",B)}function D(x){const k=x.target;if(!(k?.tagName==="INPUT"||k?.tagName==="TEXTAREA"||k?.contentEditable==="true")){if(x.key==="ArrowLeft"||x.key==="ArrowDown"){x.preventDefault(),C.setVolume(a(e).volume-.05);return}if(x.key==="ArrowRight"||x.key==="ArrowUp"){x.preventDefault(),C.setVolume(a(e).volume+.05);return}(x.key==="Enter"||x.key===" "||x.key==="m"||x.key==="M")&&(x.preventDefault(),h())}}function L(){C.togglePlaylist()}function H(){C.toggleExpanded()}function q(){C.toggleHidden()}function ct(){C.hideError()}function dt(x){}function ot(){return C.canSkip()}Et(()=>{c=C.subscribe(x=>{yt(e,x)}),C.initialize()}),Tt(()=>{c&&c(),C.destroy()}),Ft();var pt=ut();Jt("keydown",Zt,D);var Vt=tt(pt);{var Bt=x=>{var k=er(),F=tt(k);{var R=B=>{var S=Ze(),A=m(S),N=m(A);V(N,{icon:"material-symbols:error",class:"text-xl flex-shrink-0"});var W=_(N,2),Q=m(W,!0);g(W);var O=_(W,2),st=m(O);V(st,{icon:"material-symbols:close",class:"text-lg"}),g(O),g(A),g(S),z(()=>U(Q,a(e).errorMessage)),M("click",O,ct),E(B,S)};K(F,B=>{a(e).showError&&B(R)})}var nt=_(F,2);{var it=B=>{var S=ut(),A=tt(S);{var N=W=>{var Q=$e(),O=m(Q),st=m(O);ke(st,{}),g(O),g(Q),Dt(3,O,()=>xe,()=>({y:16,duration:280,opacity:.12,easing:he})),E(W,Q)};K(A,W=>{a(e).isExpanded&&W(N)})}E(B,S)},at=B=>{var S=tr();let A;var N=m(S),W=m(N);ht(W,{get cover(){return a(e).currentSong.cover},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading},size:"orb",onclick:q}),g(N);var Q=_(N,2);{let mt=ft(()=>a(e).isExpanded||a(e).isHidden);Ie(Q,{get song(){return a(e).currentSong},get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading},get isHidden(){return a(mt)},onCoverClick:p,onInfoClick:H,onHideClick:q,onExpandClick:H})}var O=_(Q,2);{let mt=ft(ot),Ht=ft(()=>!a(e).isExpanded);qe(O,{get song(){return a(e).currentSong},get currentTime(){return a(e).currentTime},get duration(){return a(e).duration},get isPlaying(){return a(e).isPlaying},get isLoading(){return a(e).isLoading},get isShuffled(){return a(e).isShuffled},get isRepeating(){return a(e).isRepeating},get showPlaylist(){return a(e).showPlaylist},get canSkip(){return a(mt)},get volume(){return a(e).volume},get isMuted(){return a(e).isMuted},isVolumeDragging:!1,get isHidden(){return a(Ht)},volumeBarRef:dt,onPlayClick:p,onPrevClick:i,onNextClick:()=>u(),onShuffleClick:d,onRepeatClick:b,onProgressClick:P,onProgressKeyDown:w,onProgressPointerDown:s,onVolumeButtonClick:I,onSliderPointerDown:v,onSliderKeyDown:D,onHideClick:q,onPlaylistClick:L,onCollapseClick:H})}var st=_(O,2);Je(st,{get playlist(){return a(e).playlist},get currentIndex(){return a(e).currentIndex},get isPlaying(){return a(e).isPlaying},get show(){return a(e).showPlaylist},onClose:L,onPlaySong:f}),g(S),z(()=>{A=j(S,1,"music-player fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",null,A,{expanded:a(e).isExpanded,"hidden-mode":a(e).isHidden}),j(N,1,`orb-player-container ${a(e).isHidden?"orb-enter pointer-events-auto":"orb-leave pointer-events-none"}`)}),E(B,S)};K(nt,B=>{o?B(it):B(at,-1)})}$t(2),E(x,k)};K(Vt,x=>{y&&x(Bt)})}E(r,pt),rt()}G(["click"]);export{hr as default};
