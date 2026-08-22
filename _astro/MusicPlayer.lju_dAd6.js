import{o as ke,b as Me,i as X,e as Pe,p as ie,s as O,c as Re,a as K}from"./disclose-version.YkQSs8VA.js";import{i as Ve}from"./legacy.DjeZzgb1.js";import{h as Be,k as He,bz as Ae,d as Ne,B as Xe,a7 as Q,ab as se,p as Ie,a9 as a,q as n,ae as h,aa as r,a4 as w,a5 as Z,a8 as U,a6 as S,a1 as q,ah as ve,ai as G,aj as ue,a2 as z,a3 as I,af as Te,b0 as je,O as Ke,aq as Ye,as as Oe,J as xe}from"./branches.BhkGGoxG.js";import{s as Y}from"./render.BGZj2QUR.js";import{t as ye,f as _e,s as Ue,a as Fe}from"./index.DIMmsIOu.js";import{I as R}from"./Icon.DjT9Wd5B.js";import{g as qe,U as We,M as Je,V as Ge,X as Qe,Y as Ze,O as Ce,m as we}from"./setting-utils.DoiAsQuv.js";import"./profileConfig.DsBWeoHP.js";import{m as p,i as $e}from"./musicPlayerStore.DNz4TmxL.js";import{S as et,a as tt,b as nt,c as it,d as rt,C as pe,P as at,e as ot,N as lt}from"./SidebarTrackInfo.-FgXZVUk.js";import{b as st}from"./this.DyKq22AR.js";import{I as te}from"./zh_TW.k14aSqIC.js";import{i as ne}from"./translation.Bm-empx3.js";import{s as ut}from"./snippet.BDzyqJ9m.js";import{a as ct}from"./actions.hWMfc4qN.js";import{e as dt,i as gt}from"./each.C_F8PSHr.js";import{g as vt}from"./url-utils.DSpxapWR.js";const mt=Symbol("NaN");function ft(x,e,t){Be&&He();var o=new Xe(x),l=!Ae();Ne(()=>{var i=e();i!==i&&(i=mt),l&&i!==null&&typeof i=="object"&&(i={}),o.ensure(i,t)})}function yt(x){const e=x-1;return e*e*e+1}var bt=S('<div class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw] svelte-1lty5dg"><div class="fab-music-header svelte-1lty5dg"><!> <!></div> <!> <!> <!></div>');function ht(x,e){Q(e,!0);let t=se(Ie(p.getState())),o=se(!1);function l(b){const B=b;B.detail&&U(t,B.detail,!0)}ke(()=>{window.addEventListener("music-sidebar:state",l)}),Me(()=>{typeof window<"u"&&window.removeEventListener("music-sidebar:state",l)});function i(){p.toggle()}function k(){p.prev()}function d(){p.next()}function L(){p.toggleMode()}function s(){U(o,!n(o))}function g(b){p.playIndex(b)}function f(b){p.seek(b)}function _(){p.toggleMute()}function P(b){p.setVolume(b)}var E=bt(),v=a(E),T=a(v);et(T,{get currentSong(){return n(t).currentSong},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading}});var M=h(T,2);tt(M,{get currentSong(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get volume(){return n(t).volume},get isMuted(){return n(t).isMuted},onToggleMute:_,onSetVolume:P}),r(v);var V=h(v,2);nt(V,{get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},onSeek:f});var u=h(V,2);it(u,{get isPlaying(){return n(t).isPlaying},get isShuffled(){return n(t).isShuffled},get repeatMode(){return n(t).isRepeating},onToggleMode:L,onPrev:k,onNext:d,onTogglePlay:i,onTogglePlaylist:s});var m=h(u,2);rt(m,{get playlist(){return n(t).playlist},get currentIndex(){return n(t).currentIndex},get isPlaying(){return n(t).isPlaying},get show(){return n(o)},onClose:s,onPlaySong:g}),r(E),w(x,E),Z()}var xt=S('<p class="lyric-overlay__translation svelte-1dzesgx"> </p>'),wt=S('<div class="lyric-overlay__line svelte-1dzesgx"><p class="lyric-overlay__text svelte-1dzesgx"> </p> <!> <span class="lyric-overlay__resize svelte-1dzesgx" role="separator" aria-label="拖拽缩放歌词字幕" title="拖拽缩放，双击恢复默认大小"></span></div>'),pt=S('<div class="lyric-overlay svelte-1dzesgx" aria-hidden="true"><!></div>');function kt(x,e){Q(e,!0);let t=se(Ie(p.getState())),o=se(!0),l,i=se(1),k=se(null),d=null;function L(m){const b=m.detail;b&&typeof b.enabled=="boolean"&&U(o,b.enabled,!0)}function s(m){const b=m.detail;b&&typeof b.scale=="number"&&U(i,b.scale,!0)}ke(()=>(U(o,qe(),!0),We(),U(i,Je(),!0),Ge(),window.addEventListener("lyric-overlay-toggle",L),window.addEventListener("lyric-scale-change",s),l=p.subscribe(m=>{U(t,m,!0)}),()=>{window.removeEventListener("lyric-overlay-toggle",L),window.removeEventListener("lyric-scale-change",s),l?.(),l=void 0}));let g=ue(()=>n(t).currentLyricIndex>=0?n(t).lyrics[n(t).currentLyricIndex]:void 0),f=ue(()=>n(o)&&n(t).isPlaying&&!!n(g)&&!$e(n(g).text));function _(m){if(!n(k))return 0;const b=n(k).getBoundingClientRect(),B=m.clientX-(b.left+b.width/2),W=m.clientY-(b.top+b.height/2);return Math.hypot(B,W)}function P(m){if(m.button===0){if(m.preventDefault(),d={dist:_(m),scale:n(i)},d.dist===0){d=null;return}m.currentTarget.setPointerCapture(m.pointerId),document.body.style.userSelect="none"}}function E(m){if(!d)return;const b=_(m)/d.dist;U(i,Math.min(Qe,Math.max(Ze,d.scale*b)),!0)}function v(m){d&&(d=null,document.body.style.userSelect="",n(k)?.hasPointerCapture(m.pointerId)&&n(k).releasePointerCapture(m.pointerId),Ce(n(i)))}function T(){U(i,1),Ce(n(i))}var M=ve(),V=G(M);{var u=m=>{var b=pt(),B=a(b);ft(B,()=>n(g).time,W=>{var $=wt();let me;var ce=a($),fe=a(ce,!0);r(ce);var de=h(ce,2);{var be=c=>{var y=xt(),A=a(y,!0);r(y),z(()=>Y(A,n(g).translation)),w(c,y)};X(de,c=>{n(g).translation&&c(be)})}var re=h(de,2);r($),st($,c=>U(k,c),()=>n(k)),z(()=>{me=Pe($,"",me,{"--lyric-scale":n(i)}),Y(fe,n(g).text)}),I("pointerdown",re,P),I("pointermove",re,E),I("pointerup",re,v),Te("pointercancel",re,v),I("dblclick",re,T),ye(3,$,()=>_e,()=>({duration:220})),w(W,$)}),r(b),ye(3,b,()=>_e,()=>({duration:200})),w(m,b)};X(V,m=>{n(f)&&n(g)&&m(u)})}w(x,M),Z()}q(["pointerdown","pointermove","pointerup","dblclick"]);var Pt=S('<div class="flex-1 min-w-0"><div class="text-sm font-medium text-90 truncate"> </div> <div class="text-xs text-50 truncate"> </div></div>'),_t=S('<div class="text-xs text-30 mt-1"> </div>'),Ct=S('<div class="flex-1 min-w-0"><div class="song-title text-lg font-bold text-90 truncate mb-1"> </div> <div class="song-artist text-sm text-50 truncate"> </div> <!></div>');function Se(x,e){Q(e,!0);const t=ie(e,"showTime",3,!1),o=ie(e,"size",3,"mini");function l(s){if(!Number.isFinite(s)||s<0)return"0:00";const g=Math.floor(s/60),f=Math.floor(s%60);return`${g}:${f.toString().padStart(2,"0")}`}var i=ve(),k=G(i);{var d=s=>{var g=Pt(),f=a(g),_=a(f,!0);r(f);var P=h(f,2),E=a(P,!0);r(P),r(g),z(()=>{Y(_,e.song.title),Y(E,e.song.artist)}),w(s,g)},L=s=>{var g=Ct(),f=a(g),_=a(f,!0);r(f);var P=h(f,2),E=a(P,!0);r(P);var v=h(P,2);{var T=M=>{var V=_t(),u=a(V);r(V),z((m,b)=>Y(u,`${m??""} / ${b??""}`),[()=>l(e.currentTime),()=>l(e.duration)]),w(M,V)};X(v,M=>{t()&&M(T)})}r(g),z(()=>{Y(_,e.song.title),Y(E,e.song.artist)}),w(s,g)};X(k,s=>{o()==="mini"?s(d):s(L,-1)})}w(x,i),Z()}var St=S('<!> <div class="flex-1 min-w-0 cursor-pointer" role="button" tabindex="0"><!></div> <div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button></div>',1),Lt=S('<div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button><!></button></div>'),Et=S("<!> <!> <!>",1),Mt=S("<div><!></div>");function ze(x,e){Q(e,!0);const t=ie(e,"size",3,"mini"),o=ie(e,"showControls",3,!1),l=ie(e,"showPlaylist",3,!1);var i=Mt(),k=a(i);{var d=s=>{var g=St(),f=G(g);pe(f,{get cover(){return e.song.cover},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"mini",interactive:!0,get onclick(){return e.onCoverClick}});var _=h(f,2),P=a(_);Se(P,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},size:"mini"}),r(_);var E=h(_,2),v=a(E),T=a(v);R(T,{icon:"material-symbols:visibility-off",class:"text-lg"}),r(v);var M=h(v,2),V=a(M);R(V,{icon:"material-symbols:expand-less",class:"text-lg"}),r(M),r(E),z((u,m)=>{K(_,"aria-label",u),K(v,"title",m)},[()=>ne(te.musicPlayerExpand),()=>ne(te.musicPlayerHide)]),I("click",_,function(...u){e.onInfoClick?.apply(this,u)}),I("keydown",_,u=>{(u.key==="Enter"||u.key===" ")&&(u.preventDefault(),e.onInfoClick?.())}),I("click",v,u=>{u.stopPropagation(),e.onHideClick?.()}),I("click",M,u=>{u.stopPropagation(),e.onExpandClick?.()}),w(s,g)},L=s=>{var g=Et(),f=G(g);pe(f,{get cover(){return e.song.cover},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"expanded"});var _=h(f,2);Se(_,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},showTime:!0,size:"expanded"});var P=h(_,2);{var E=v=>{var T=Lt(),M=a(T),V=a(M);R(V,{icon:"material-symbols:visibility-off",class:"text-lg"}),r(M);var u=h(M,2);let m;var b=a(u);R(b,{icon:"material-symbols:queue-music",class:"text-lg"}),r(u),r(T),z((B,W)=>{K(M,"title",B),m=O(u,1,"btn-plain w-8 h-8 rounded-lg flex items-center justify-center",null,m,{"text-[var(--primary)]":l()}),K(u,"title",W)},[()=>ne(te.musicPlayerHide),()=>ne(te.musicPlayerPlaylist)]),I("click",M,function(...B){e.onHideClick?.apply(this,B)}),I("click",u,function(...B){e.onPlaylistClick?.apply(this,B)}),w(v,T)};X(P,v=>{o()&&v(E)})}w(s,g)};X(k,s=>{t()==="mini"?s(d):s(L,-1)})}r(i),z(()=>O(i,1,Re(t()==="mini"?"flex items-center gap-3 mb-0":"flex items-center gap-4 mb-4"))),w(x,i),Z()}q(["click","keydown"]);var It=S("<div><!></div>");function Tt(x,e){var t=It();let o;var l=a(t);ze(l,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"mini",get onCoverClick(){return e.onCoverClick},get onInfoClick(){return e.onInfoClick},get onHideClick(){return e.onHideClick},get onExpandClick(){return e.onExpandClick}}),r(t),z(()=>o=O(t,1,"mini-player card-base shadow-xl rounded-2xl p-3 absolute bottom-0 right-0 w-[17.5rem] svelte-g9ac72",null,o,{"mini-enter":!e.isHidden,"mini-leave":e.isHidden,"pointer-events-none":e.isHidden})),w(x,t)}var Le=S("<button><!></button>");function Ee(x,e){const t=ie(e,"repeatMode",3,0),o=ie(e,"disabled",3,!1);var l=ve(),i=G(l);{var k=L=>{var s=Le();let g;var f=a(s);R(f,{icon:"material-symbols:shuffle",class:"text-lg"}),r(s),z(()=>{g=O(s,1,"w-10 h-10 rounded-lg",null,g,{"btn-regular":e.isActive,"btn-plain":!e.isActive}),s.disabled=o()}),I("click",s,function(..._){e.onclick?.apply(this,_)}),w(L,s)},d=L=>{var s=Le();let g;var f=a(s);{var _=v=>{R(v,{icon:"material-symbols:repeat-one",class:"text-lg"})},P=v=>{R(v,{icon:"material-symbols:repeat",class:"text-lg"})},E=v=>{R(v,{icon:"material-symbols:repeat",class:"text-lg opacity-50"})};X(f,v=>{t()===1?v(_):t()===2?v(P,1):v(E,-1)})}r(s),z(()=>g=O(s,1,"w-10 h-10 rounded-lg",null,g,{"btn-regular":e.isActive,"btn-plain":!e.isActive})),I("click",s,function(...v){e.onclick?.apply(this,v)}),w(L,s)};X(i,L=>{e.mode==="shuffle"?L(k):L(d,-1)})}w(x,l)}q(["click"]);var zt=S('<div class="controls flex items-center justify-center gap-2 mb-4"><!> <!> <!> <!> <!></div>');function Dt(x,e){var t=zt(),o=a(t);Ee(o,{mode:"shuffle",get isActive(){return e.isShuffled},get onclick(){return e.onShuffleClick}});var l=h(o,2);at(l,{get onclick(){return e.onPrevClick},disabled:!1});var i=h(l,2);ot(i,{get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},get onclick(){return e.onPlayClick}});var k=h(i,2);lt(k,{get onclick(){return e.onNextClick},disabled:!1});var d=h(k,2);{let L=ue(()=>e.isRepeating>0);Ee(d,{mode:"repeat",get isActive(){return n(L)},get repeatMode(){return e.isRepeating},get onclick(){return e.onRepeatClick}})}r(t),w(x,t)}var Rt=S('<div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"></div></div>');function Vt(x,e){Q(e,!0);var t=Rt(),o=a(t);r(t),z(l=>{K(t,"aria-label",l),K(t,"aria-valuenow",e.duration>0?e.currentTime/e.duration*100:0),Pe(o,`width: ${e.duration>0?e.currentTime/e.duration*100:0}%`)},[()=>ne(te.musicPlayerProgress)]),I("click",t,function(...l){e.onclick?.apply(this,l)}),I("keydown",t,function(...l){e.onkeydown?.apply(this,l)}),I("pointerdown",t,function(...l){e.onpointerdown?.apply(this,l)}),w(x,t),Z()}q(["click","keydown","pointerdown"]);var Bt=S('<div class="progress-section mb-4"><!></div>');function Ht(x,e){var t=Bt(),o=a(t);Vt(o,{get currentTime(){return e.currentTime},get duration(){return e.duration},get onclick(){return e.onProgressClick},get onkeydown(){return e.onProgressKeyDown},get onpointerdown(){return e.onProgressPointerDown}}),r(t),w(x,t)}var At=S('<button class="btn-plain w-8 h-8 rounded-lg"><!></button>');function Nt(x,e){var t=At(),o=a(t);{var l=d=>{R(d,{icon:"material-symbols:volume-off",class:"text-lg"})},i=d=>{R(d,{icon:"material-symbols:volume-down",class:"text-lg"})},k=d=>{R(d,{icon:"material-symbols:volume-up",class:"text-lg"})};X(o,d=>{e.isMuted||e.volume===0?d(l):e.volume<.5?d(i,1):d(k,-1)})}r(t),I("click",t,function(...d){e.onclick?.apply(this,d)}),w(x,t)}q(["click"]);var Xt=S('<div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>');function jt(x,e){var t=Xt(),o=a(t);let l;r(t),ct(t,i=>e.volumeBarRef?.(i)),z(()=>{K(t,"aria-label",e.ariaLabel),K(t,"aria-valuenow",e.volume*100),l=O(o,1,"h-full bg-[var(--primary)] rounded-full transition-all",null,l,{"duration-100":!e.isVolumeDragging,"duration-0":e.isVolumeDragging}),Pe(o,`width: ${e.volume*100}%`)}),I("pointerdown",t,function(...i){e.onpointerdown?.apply(this,i)}),I("keydown",t,function(...i){e.onkeydown?.apply(this,i)}),w(x,t)}q(["pointerdown","keydown"]);var Kt=S('<div class="bottom-controls flex items-center gap-2"><!> <!> <!></div>');function Yt(x,e){var t=Kt(),o=a(t);Nt(o,{get volume(){return e.volume},get isMuted(){return e.isMuted},get onclick(){return e.onVolumeButtonClick}});var l=h(o,2);{let k=ue(()=>e.isMuted?0:e.volume);jt(l,{get volume(){return n(k)},get isVolumeDragging(){return e.isVolumeDragging},get volumeBarRef(){return e.volumeBarRef},get onpointerdown(){return e.onSliderPointerDown},get onkeydown(){return e.onSliderKeyDown},get ariaLabel(){return e.ariaLabel}})}var i=h(l,2);ut(i,()=>e.children??je),r(t),w(x,t)}var Ot=S('<button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button>'),Ut=S("<div><!> <!> <!> <!></div>");function Ft(x,e){Q(e,!0);var t=Ut();let o;var l=a(t);ze(l,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"expanded",showControls:!0,get showPlaylist(){return e.showPlaylist},get onHideClick(){return e.onHideClick},get onPlaylistClick(){return e.onPlaylistClick}});var i=h(l,2);Ht(i,{get currentTime(){return e.currentTime},get duration(){return e.duration},get onProgressClick(){return e.onProgressClick},get onProgressKeyDown(){return e.onProgressKeyDown},get onProgressPointerDown(){return e.onProgressPointerDown}});var k=h(i,2);Dt(k,{get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},get isShuffled(){return e.isShuffled},get isRepeating(){return e.isRepeating},get onPlayClick(){return e.onPlayClick},get onPrevClick(){return e.onPrevClick},get onNextClick(){return e.onNextClick},get onShuffleClick(){return e.onShuffleClick},get onRepeatClick(){return e.onRepeatClick}});var d=h(k,2);{let L=ue(()=>ne(te.musicPlayerVolume));Yt(d,{get volume(){return e.volume},get isMuted(){return e.isMuted},get isVolumeDragging(){return e.isVolumeDragging},get volumeBarRef(){return e.volumeBarRef},get onVolumeButtonClick(){return e.onVolumeButtonClick},get onSliderPointerDown(){return e.onSliderPointerDown},get onSliderKeyDown(){return e.onSliderKeyDown},get ariaLabel(){return n(L)},children:(s,g)=>{var f=Ot(),_=a(f);R(_,{icon:"material-symbols:expand-more",class:"text-lg"}),r(f),z(P=>K(f,"title",P),[()=>ne(te.musicPlayerCollapse)]),I("click",f,function(...P){e.onCollapseClick?.apply(this,P)}),w(s,f)}})}r(t),z(()=>o=O(t,1,"expanded-player card-base shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out absolute bottom-0 right-0 w-80",null,o,{"opacity-0":e.isHidden,"scale-95":e.isHidden,"pointer-events-none":e.isHidden})),w(x,t),Z()}q(["click"]);var qt=S('<span class="text-sm text-[var(--content-meta)]"> </span>'),Wt=S('<div role="button" tabindex="0"><div class="w-6 h-6 flex items-center justify-center"><!></div> <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0"><img decoding="async" class="w-full h-full object-cover"/></div> <div class="flex-1 min-w-0"><div> </div> <div> </div></div></div>');function Jt(x,e){Q(e,!0);const t=ie(e,"lazy",3,!0);var o=Wt();let l;var i=a(o),k=a(i);{var d=u=>{R(u,{icon:"material-symbols:graphic-eq",class:"text-[var(--primary)] animate-pulse"})},L=u=>{R(u,{icon:"material-symbols:pause",class:"text-[var(--primary)]"})},s=u=>{var m=qt(),b=a(m,!0);r(m),z(()=>Y(b,e.index+1)),w(u,m)};X(k,u=>{e.isCurrent&&e.isPlaying?u(d):e.isCurrent?u(L,1):u(s,-1)})}r(i);var g=h(i,2),f=a(g);r(g);var _=h(g,2),P=a(_);let E;var v=a(P,!0);r(P);var T=h(P,2);let M;var V=a(T,!0);r(T),r(_),r(o),z(u=>{l=O(o,1,"playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors",null,l,{"bg-[var(--btn-plain-bg)]":e.isCurrent,"text-[var(--primary)]":e.isCurrent}),K(o,"aria-label",`播放 ${e.song.title??""} - ${e.song.artist??""}`),K(f,"src",u),K(f,"alt",e.song.title),K(f,"loading",t()?"lazy":"eager"),E=O(P,1,"font-medium truncate",null,E,{"text-[var(--primary)]":e.isCurrent,"text-90":!e.isCurrent}),Y(v,e.song.title),M=O(T,1,"text-sm text-[var(--content-meta)] truncate",null,M,{"text-[var(--primary)]":e.isCurrent}),Y(V,e.song.artist)},[()=>vt(e.song.cover)]),I("click",o,function(...u){e.onclick?.apply(this,u)}),I("keydown",o,u=>{(u.key==="Enter"||u.key===" ")&&(u.preventDefault(),e.onclick())}),w(x,o),Z()}q(["click","keydown"]);var Gt=S('<div class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50 svelte-1v267om"><div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"><h3 class="text-lg font-semibold text-90"> </h3> <button class="btn-plain w-8 h-8 rounded-lg"><!></button></div> <div class="playlist-content overflow-y-auto max-h-80 hide-scrollbar" role="presentation"></div></div>');function Qt(x,e){Q(e,!0);var t=ve(),o=G(t);{var l=i=>{var k=Gt(),d=a(k),L=a(d),s=a(L,!0);r(L);var g=h(L,2),f=a(g);R(f,{icon:"material-symbols:close",class:"text-lg"}),r(g),r(d);var _=h(d,2);dt(_,21,()=>e.playlist,gt,(P,E,v)=>{{let T=ue(()=>v===e.currentIndex);Jt(P,{get song(){return n(E)},index:v,get isCurrent(){return n(T)},get isPlaying(){return e.isPlaying},onclick:()=>e.onPlaySong(v),lazy:v!==0})}}),r(_),r(k),z(P=>Y(s,P),[()=>ne(te.musicPlayerPlaylist)]),I("click",g,function(...P){e.onClose?.apply(this,P)}),ye(3,k,()=>Ue,()=>({duration:300,axis:"y"})),w(i,k)};X(o,i=>{e.show&&i(l)})}w(x,t),Z()}q(["click"]);var Zt=S('<div class="fixed bottom-20 right-4 z-[60] max-w-sm"><div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"><!> <span class="text-sm flex-1"> </span> <button class="text-white/80 hover:text-white transition-colors"><!></button></div></div>'),$t=S('<div class="music-player-fab-anchor fixed z-[55]"><div class="music-player-fab-shell"><!></div></div>'),en=S("<div><div><!></div> <!> <!> <!></div>"),tn=S(`<!> <!> <style>.music-player-fab-anchor {
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
		}</style>`,1),nn=S("<!> <!>",1);function pn(x,e){Q(e,!1);let t=Ke(p.getState());const o=we.showFloatingPlayer,i=(we.floatingEntryMode??"default")==="fab",k=o&&we.enable;let d;function L(){p.toggle()}function s(){p.prev()}function g(){p.next()}function f(){p.toggleShuffle()}function _(){p.toggleRepeat()}function P(c){p.playIndex(c)}function E(c){const y=c.currentTarget;if(!y)return;const A=y.getBoundingClientRect(),D=(c.clientX-A.left)/A.width;p.setProgress(D)}function v(c){const y=c.currentTarget;if(!y)return;const A=C=>{const N=y.getBoundingClientRect();if(N.width<=0)return;const j=(C-N.left)/N.width;p.setProgress(j)};c.preventDefault(),A(c.clientX);const D=c.pointerId;y.setPointerCapture(D);const ae=C=>{C.pointerId===D&&A(C.clientX)},oe=()=>{y.removeEventListener("pointermove",ae),y.removeEventListener("pointerup",le),y.removeEventListener("pointercancel",H),y.hasPointerCapture(D)&&y.releasePointerCapture(D)},le=C=>{C.pointerId===D&&(A(C.clientX),oe())},H=C=>{C.pointerId===D&&oe()};y.addEventListener("pointermove",ae),y.addEventListener("pointerup",le),y.addEventListener("pointercancel",H)}function T(c){(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),p.setProgress(.5))}function M(){p.toggleMute()}function V(){p.toggleMute()}function u(c){const y=c.currentTarget;if(!y)return;const A=C=>{const N=y.getBoundingClientRect();if(N.width<=0)return;const j=Math.max(0,Math.min(1,(C-N.left)/N.width));p.setVolume(j)};A(c.clientX);const D=c.pointerId;y.setPointerCapture(D);const ae=C=>{C.pointerId===D&&A(C.clientX)},oe=()=>{y.removeEventListener("pointermove",ae),y.removeEventListener("pointerup",le),y.removeEventListener("pointercancel",H),y.hasPointerCapture(D)&&y.releasePointerCapture(D)},le=C=>{C.pointerId===D&&(A(C.clientX),oe())},H=C=>{C.pointerId===D&&oe()};y.addEventListener("pointermove",ae),y.addEventListener("pointerup",le),y.addEventListener("pointercancel",H)}function m(c){const y=c.target;if(!(y?.tagName==="INPUT"||y?.tagName==="TEXTAREA"||y?.contentEditable==="true")){if(c.key==="ArrowLeft"||c.key==="ArrowDown"){c.preventDefault(),p.setVolume(n(t).volume-.05);return}if(c.key==="ArrowRight"||c.key==="ArrowUp"){c.preventDefault(),p.setVolume(n(t).volume+.05);return}(c.key==="Enter"||c.key===" "||c.key==="m"||c.key==="M")&&(c.preventDefault(),M())}}function b(){p.togglePlaylist()}function B(){p.toggleExpanded()}function W(){p.toggleHidden()}function $(){p.hideError()}function me(c){}function ce(){return p.canSkip()}ke(()=>{d=p.subscribe(c=>{U(t,c)}),p.initialize()}),Me(()=>{d&&d(),p.destroy()}),Ve();var fe=nn();Te("keydown",Ye,m);var de=G(fe);kt(de,{});var be=h(de,2);{var re=c=>{var y=tn(),A=G(y);{var D=H=>{var C=Zt(),N=a(C),j=a(N);R(j,{icon:"material-symbols:error",class:"text-xl flex-shrink-0"});var J=h(j,2),ee=a(J,!0);r(J);var F=h(J,2),ge=a(F);R(ge,{icon:"material-symbols:close",class:"text-lg"}),r(F),r(N),r(C),z(()=>Y(ee,n(t).errorMessage)),I("click",F,$),w(H,C)};X(A,H=>{n(t).showError&&H(D)})}var ae=h(A,2);{var oe=H=>{var C=ve(),N=G(C);{var j=J=>{var ee=$t(),F=a(ee),ge=a(F);ht(ge,{}),r(F),r(ee),ye(3,F,()=>Fe,()=>({y:16,duration:280,opacity:.12,easing:yt})),w(J,ee)};X(N,J=>{n(t).isExpanded&&J(j)})}w(H,C)},le=H=>{var C=en();let N;var j=a(C),J=a(j);pe(J,{get cover(){return n(t).currentSong.cover},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},size:"orb",onclick:W}),r(j);var ee=h(j,2);{let he=xe(()=>n(t).isExpanded||n(t).isHidden);Tt(ee,{get song(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},get isHidden(){return n(he)},onCoverClick:L,onInfoClick:B,onHideClick:W,onExpandClick:B})}var F=h(ee,2);{let he=xe(ce),De=xe(()=>!n(t).isExpanded);Ft(F,{get song(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},get isShuffled(){return n(t).isShuffled},get isRepeating(){return n(t).isRepeating},get showPlaylist(){return n(t).showPlaylist},get canSkip(){return n(he)},get volume(){return n(t).volume},get isMuted(){return n(t).isMuted},isVolumeDragging:!1,get isHidden(){return n(De)},volumeBarRef:me,onPlayClick:L,onPrevClick:s,onNextClick:()=>g(),onShuffleClick:f,onRepeatClick:_,onProgressClick:E,onProgressKeyDown:T,onProgressPointerDown:v,onVolumeButtonClick:V,onSliderPointerDown:u,onSliderKeyDown:m,onHideClick:W,onPlaylistClick:b,onCollapseClick:B})}var ge=h(F,2);Qt(ge,{get playlist(){return n(t).playlist},get currentIndex(){return n(t).currentIndex},get isPlaying(){return n(t).isPlaying},get show(){return n(t).showPlaylist},onClose:b,onPlaySong:P}),r(C),z(()=>{N=O(C,1,"music-player fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",null,N,{expanded:n(t).isExpanded,"hidden-mode":n(t).isHidden}),O(j,1,`orb-player-container ${n(t).isHidden?"orb-enter pointer-events-auto":"orb-leave pointer-events-none"}`)}),w(H,C)};X(ae,H=>{i?H(oe):H(le,-1)})}Oe(2),w(c,y)};X(be,c=>{k&&c(re)})}w(x,fe),Z()}q(["click"]);export{pn as default};
