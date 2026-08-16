import{o as fe,b as pe,i as N,p as ee,s as F,c as De,a as K,e as Pe}from"./disclose-version.YkQSs8VA.js";import{i as ze}from"./legacy.DjeZzgb1.js";import{h as Re,k as Ve,bz as Be,d as He,B as Ne,a7 as W,ab as ue,p as _e,a9 as r,q as n,ae as b,aa as i,a4 as h,a5 as J,a8 as re,a6 as _,ah as se,ai as Y,aj as ae,a2 as M,a1 as G,a3 as D,b0 as Ae,O as Xe,af as je,aq as Ke,as as Oe,J as ge}from"./branches.BhkGGoxG.js";import{s as O}from"./render.BGZj2QUR.js";import{t as de,f as he,s as Fe,a as Ue}from"./index.DIMmsIOu.js";import{I as R}from"./Icon.DjT9Wd5B.js";import{g as qe,R as Ye,m as ve}from"./setting-utils.BXyEXcmI.js";import"./profileConfig.DsBWeoHP.js";import{m as w,i as We}from"./musicPlayerStore.4eqG2qOf.js";import{S as Je,a as Ge,b as Qe,c as Ze,d as $e,C as me,P as et,e as tt,N as nt}from"./SidebarTrackInfo.-FgXZVUk.js";import{I as Z}from"./zh_TW.k14aSqIC.js";import{i as $}from"./translation.Bm-empx3.js";import{s as it}from"./snippet.BDzyqJ9m.js";import{a as rt}from"./actions.hWMfc4qN.js";import{e as at,i as ot}from"./each.C_F8PSHr.js";import{g as lt}from"./url-utils.DSpxapWR.js";const st=Symbol("NaN");function ut(f,e,t){Re&&Ve();var a=new Ne(f),l=!Be();He(()=>{var o=e();o!==o&&(o=st),l&&o!==null&&typeof o=="object"&&(o={}),a.ensure(o,t)})}function dt(f){const e=f-1;return e*e*e+1}var ct=_('<div class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw] svelte-1lty5dg"><div class="fab-music-header svelte-1lty5dg"><!> <!></div> <!> <!> <!></div>');function gt(f,e){W(e,!0);let t=ue(_e(w.getState())),a=ue(!1);function l(T){const A=T;A.detail&&re(t,A.detail,!0)}fe(()=>{window.addEventListener("music-sidebar:state",l)}),pe(()=>{typeof window<"u"&&window.removeEventListener("music-sidebar:state",l)});function o(){w.toggle()}function x(){w.prev()}function y(){w.next()}function C(){w.toggleMode()}function s(){re(a,!n(a))}function m(T){w.playIndex(T)}function d(T){w.seek(T)}function g(){w.toggleMute()}function k(T){w.setVolume(T)}var S=ct(),c=r(S),L=r(c);Je(L,{get currentSong(){return n(t).currentSong},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading}});var E=b(L,2);Ge(E,{get currentSong(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get volume(){return n(t).volume},get isMuted(){return n(t).isMuted},onToggleMute:g,onSetVolume:k}),i(c);var V=b(c,2);Qe(V,{get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},onSeek:d});var u=b(V,2);Ze(u,{get isPlaying(){return n(t).isPlaying},get isShuffled(){return n(t).isShuffled},get repeatMode(){return n(t).isRepeating},onToggleMode:C,onPrev:x,onNext:y,onTogglePlay:o,onTogglePlaylist:s});var I=b(u,2);$e(I,{get playlist(){return n(t).playlist},get currentIndex(){return n(t).currentIndex},get isPlaying(){return n(t).isPlaying},get show(){return n(a)},onClose:s,onPlaySong:m}),i(S),h(f,S),J()}var vt=_('<p class="lyric-overlay__translation svelte-1dzesgx"> </p>'),mt=_('<div class="lyric-overlay__line svelte-1dzesgx"><p class="lyric-overlay__text svelte-1dzesgx"> </p> <!></div>'),ft=_('<div class="lyric-overlay svelte-1dzesgx" aria-hidden="true"><!></div>');function yt(f,e){W(e,!0);let t=ue(_e(w.getState())),a=ue(!0),l;function o(d){const g=d.detail;g&&typeof g.enabled=="boolean"&&re(a,g.enabled,!0)}fe(()=>(re(a,qe(),!0),Ye(),window.addEventListener("lyric-overlay-toggle",o),l=w.subscribe(d=>{re(t,d,!0)}),()=>{window.removeEventListener("lyric-overlay-toggle",o),l?.(),l=void 0}));let x=ae(()=>n(t).currentLyricIndex>=0?n(t).lyrics[n(t).currentLyricIndex]:void 0),y=ae(()=>n(a)&&n(t).isPlaying&&!!n(x)&&!We(n(x).text));var C=se(),s=Y(C);{var m=d=>{var g=ft(),k=r(g);ut(k,()=>n(x).time,S=>{var c=mt(),L=r(c),E=r(L,!0);i(L);var V=b(L,2);{var u=I=>{var T=vt(),A=r(T,!0);i(T),M(()=>O(A,n(x).translation)),h(I,T)};N(V,I=>{n(x).translation&&I(u)})}i(c),M(()=>O(E,n(x).text)),de(3,c,()=>he,()=>({duration:220})),h(S,c)}),i(g),de(3,g,()=>he,()=>({duration:200})),h(d,g)};N(s,d=>{n(y)&&n(x)&&d(m)})}h(f,C),J()}var bt=_('<div class="flex-1 min-w-0"><div class="text-sm font-medium text-90 truncate"> </div> <div class="text-xs text-50 truncate"> </div></div>'),ht=_('<div class="text-xs text-30 mt-1"> </div>'),xt=_('<div class="flex-1 min-w-0"><div class="song-title text-lg font-bold text-90 truncate mb-1"> </div> <div class="song-artist text-sm text-50 truncate"> </div> <!></div>');function xe(f,e){W(e,!0);const t=ee(e,"showTime",3,!1),a=ee(e,"size",3,"mini");function l(s){if(!Number.isFinite(s)||s<0)return"0:00";const m=Math.floor(s/60),d=Math.floor(s%60);return`${m}:${d.toString().padStart(2,"0")}`}var o=se(),x=Y(o);{var y=s=>{var m=bt(),d=r(m),g=r(d,!0);i(d);var k=b(d,2),S=r(k,!0);i(k),i(m),M(()=>{O(g,e.song.title),O(S,e.song.artist)}),h(s,m)},C=s=>{var m=xt(),d=r(m),g=r(d,!0);i(d);var k=b(d,2),S=r(k,!0);i(k);var c=b(k,2);{var L=E=>{var V=ht(),u=r(V);i(V),M((I,T)=>O(u,`${I??""} / ${T??""}`),[()=>l(e.currentTime),()=>l(e.duration)]),h(E,V)};N(c,E=>{t()&&E(L)})}i(m),M(()=>{O(g,e.song.title),O(S,e.song.artist)}),h(s,m)};N(x,s=>{a()==="mini"?s(y):s(C,-1)})}h(f,o),J()}var wt=_('<!> <div class="flex-1 min-w-0 cursor-pointer" role="button" tabindex="0"><!></div> <div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button></div>',1),kt=_('<div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button><!></button></div>'),pt=_("<!> <!> <!>",1),Pt=_("<div><!></div>");function Ce(f,e){W(e,!0);const t=ee(e,"size",3,"mini"),a=ee(e,"showControls",3,!1),l=ee(e,"showPlaylist",3,!1);var o=Pt(),x=r(o);{var y=s=>{var m=wt(),d=Y(m);me(d,{get cover(){return e.song.cover},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"mini",interactive:!0,get onclick(){return e.onCoverClick}});var g=b(d,2),k=r(g);xe(k,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},size:"mini"}),i(g);var S=b(g,2),c=r(S),L=r(c);R(L,{icon:"material-symbols:visibility-off",class:"text-lg"}),i(c);var E=b(c,2),V=r(E);R(V,{icon:"material-symbols:expand-less",class:"text-lg"}),i(E),i(S),M((u,I)=>{K(g,"aria-label",u),K(c,"title",I)},[()=>$(Z.musicPlayerExpand),()=>$(Z.musicPlayerHide)]),D("click",g,function(...u){e.onInfoClick?.apply(this,u)}),D("keydown",g,u=>{(u.key==="Enter"||u.key===" ")&&(u.preventDefault(),e.onInfoClick?.())}),D("click",c,u=>{u.stopPropagation(),e.onHideClick?.()}),D("click",E,u=>{u.stopPropagation(),e.onExpandClick?.()}),h(s,m)},C=s=>{var m=pt(),d=Y(m);me(d,{get cover(){return e.song.cover},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"expanded"});var g=b(d,2);xe(g,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},showTime:!0,size:"expanded"});var k=b(g,2);{var S=c=>{var L=kt(),E=r(L),V=r(E);R(V,{icon:"material-symbols:visibility-off",class:"text-lg"}),i(E);var u=b(E,2);let I;var T=r(u);R(T,{icon:"material-symbols:queue-music",class:"text-lg"}),i(u),i(L),M((A,oe)=>{K(E,"title",A),I=F(u,1,"btn-plain w-8 h-8 rounded-lg flex items-center justify-center",null,I,{"text-[var(--primary)]":l()}),K(u,"title",oe)},[()=>$(Z.musicPlayerHide),()=>$(Z.musicPlayerPlaylist)]),D("click",E,function(...A){e.onHideClick?.apply(this,A)}),D("click",u,function(...A){e.onPlaylistClick?.apply(this,A)}),h(c,L)};N(k,c=>{a()&&c(S)})}h(s,m)};N(x,s=>{t()==="mini"?s(y):s(C,-1)})}i(o),M(()=>F(o,1,De(t()==="mini"?"flex items-center gap-3 mb-0":"flex items-center gap-4 mb-4"))),h(f,o),J()}G(["click","keydown"]);var _t=_("<div><!></div>");function Ct(f,e){var t=_t();let a;var l=r(t);Ce(l,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"mini",get onCoverClick(){return e.onCoverClick},get onInfoClick(){return e.onInfoClick},get onHideClick(){return e.onHideClick},get onExpandClick(){return e.onExpandClick}}),i(t),M(()=>a=F(t,1,"mini-player card-base shadow-xl rounded-2xl p-3 absolute bottom-0 right-0 w-[17.5rem] svelte-g9ac72",null,a,{"mini-enter":!e.isHidden,"mini-leave":e.isHidden,"pointer-events-none":e.isHidden})),h(f,t)}var we=_("<button><!></button>");function ke(f,e){const t=ee(e,"repeatMode",3,0),a=ee(e,"disabled",3,!1);var l=se(),o=Y(l);{var x=C=>{var s=we();let m;var d=r(s);R(d,{icon:"material-symbols:shuffle",class:"text-lg"}),i(s),M(()=>{m=F(s,1,"w-10 h-10 rounded-lg",null,m,{"btn-regular":e.isActive,"btn-plain":!e.isActive}),s.disabled=a()}),D("click",s,function(...g){e.onclick?.apply(this,g)}),h(C,s)},y=C=>{var s=we();let m;var d=r(s);{var g=c=>{R(c,{icon:"material-symbols:repeat-one",class:"text-lg"})},k=c=>{R(c,{icon:"material-symbols:repeat",class:"text-lg"})},S=c=>{R(c,{icon:"material-symbols:repeat",class:"text-lg opacity-50"})};N(d,c=>{t()===1?c(g):t()===2?c(k,1):c(S,-1)})}i(s),M(()=>m=F(s,1,"w-10 h-10 rounded-lg",null,m,{"btn-regular":e.isActive,"btn-plain":!e.isActive})),D("click",s,function(...c){e.onclick?.apply(this,c)}),h(C,s)};N(o,C=>{e.mode==="shuffle"?C(x):C(y,-1)})}h(f,l)}G(["click"]);var St=_('<div class="controls flex items-center justify-center gap-2 mb-4"><!> <!> <!> <!> <!></div>');function Lt(f,e){var t=St(),a=r(t);ke(a,{mode:"shuffle",get isActive(){return e.isShuffled},get onclick(){return e.onShuffleClick}});var l=b(a,2);et(l,{get onclick(){return e.onPrevClick},disabled:!1});var o=b(l,2);tt(o,{get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},get onclick(){return e.onPlayClick}});var x=b(o,2);nt(x,{get onclick(){return e.onNextClick},disabled:!1});var y=b(x,2);{let C=ae(()=>e.isRepeating>0);ke(y,{mode:"repeat",get isActive(){return n(C)},get repeatMode(){return e.isRepeating},get onclick(){return e.onRepeatClick}})}i(t),h(f,t)}var Et=_('<div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"></div></div>');function Tt(f,e){W(e,!0);var t=Et(),a=r(t);i(t),M(l=>{K(t,"aria-label",l),K(t,"aria-valuenow",e.duration>0?e.currentTime/e.duration*100:0),Pe(a,`width: ${e.duration>0?e.currentTime/e.duration*100:0}%`)},[()=>$(Z.musicPlayerProgress)]),D("click",t,function(...l){e.onclick?.apply(this,l)}),D("keydown",t,function(...l){e.onkeydown?.apply(this,l)}),D("pointerdown",t,function(...l){e.onpointerdown?.apply(this,l)}),h(f,t),J()}G(["click","keydown","pointerdown"]);var Mt=_('<div class="progress-section mb-4"><!></div>');function It(f,e){var t=Mt(),a=r(t);Tt(a,{get currentTime(){return e.currentTime},get duration(){return e.duration},get onclick(){return e.onProgressClick},get onkeydown(){return e.onProgressKeyDown},get onpointerdown(){return e.onProgressPointerDown}}),i(t),h(f,t)}var Dt=_('<button class="btn-plain w-8 h-8 rounded-lg"><!></button>');function zt(f,e){var t=Dt(),a=r(t);{var l=y=>{R(y,{icon:"material-symbols:volume-off",class:"text-lg"})},o=y=>{R(y,{icon:"material-symbols:volume-down",class:"text-lg"})},x=y=>{R(y,{icon:"material-symbols:volume-up",class:"text-lg"})};N(a,y=>{e.isMuted||e.volume===0?y(l):e.volume<.5?y(o,1):y(x,-1)})}i(t),D("click",t,function(...y){e.onclick?.apply(this,y)}),h(f,t)}G(["click"]);var Rt=_('<div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>');function Vt(f,e){var t=Rt(),a=r(t);let l;i(t),rt(t,o=>e.volumeBarRef?.(o)),M(()=>{K(t,"aria-label",e.ariaLabel),K(t,"aria-valuenow",e.volume*100),l=F(a,1,"h-full bg-[var(--primary)] rounded-full transition-all",null,l,{"duration-100":!e.isVolumeDragging,"duration-0":e.isVolumeDragging}),Pe(a,`width: ${e.volume*100}%`)}),D("pointerdown",t,function(...o){e.onpointerdown?.apply(this,o)}),D("keydown",t,function(...o){e.onkeydown?.apply(this,o)}),h(f,t)}G(["pointerdown","keydown"]);var Bt=_('<div class="bottom-controls flex items-center gap-2"><!> <!> <!></div>');function Ht(f,e){var t=Bt(),a=r(t);zt(a,{get volume(){return e.volume},get isMuted(){return e.isMuted},get onclick(){return e.onVolumeButtonClick}});var l=b(a,2);{let x=ae(()=>e.isMuted?0:e.volume);Vt(l,{get volume(){return n(x)},get isVolumeDragging(){return e.isVolumeDragging},get volumeBarRef(){return e.volumeBarRef},get onpointerdown(){return e.onSliderPointerDown},get onkeydown(){return e.onSliderKeyDown},get ariaLabel(){return e.ariaLabel}})}var o=b(l,2);it(o,()=>e.children??Ae),i(t),h(f,t)}var Nt=_('<button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button>'),At=_("<div><!> <!> <!> <!></div>");function Xt(f,e){W(e,!0);var t=At();let a;var l=r(t);Ce(l,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"expanded",showControls:!0,get showPlaylist(){return e.showPlaylist},get onHideClick(){return e.onHideClick},get onPlaylistClick(){return e.onPlaylistClick}});var o=b(l,2);It(o,{get currentTime(){return e.currentTime},get duration(){return e.duration},get onProgressClick(){return e.onProgressClick},get onProgressKeyDown(){return e.onProgressKeyDown},get onProgressPointerDown(){return e.onProgressPointerDown}});var x=b(o,2);Lt(x,{get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},get isShuffled(){return e.isShuffled},get isRepeating(){return e.isRepeating},get onPlayClick(){return e.onPlayClick},get onPrevClick(){return e.onPrevClick},get onNextClick(){return e.onNextClick},get onShuffleClick(){return e.onShuffleClick},get onRepeatClick(){return e.onRepeatClick}});var y=b(x,2);{let C=ae(()=>$(Z.musicPlayerVolume));Ht(y,{get volume(){return e.volume},get isMuted(){return e.isMuted},get isVolumeDragging(){return e.isVolumeDragging},get volumeBarRef(){return e.volumeBarRef},get onVolumeButtonClick(){return e.onVolumeButtonClick},get onSliderPointerDown(){return e.onSliderPointerDown},get onSliderKeyDown(){return e.onSliderKeyDown},get ariaLabel(){return n(C)},children:(s,m)=>{var d=Nt(),g=r(d);R(g,{icon:"material-symbols:expand-more",class:"text-lg"}),i(d),M(k=>K(d,"title",k),[()=>$(Z.musicPlayerCollapse)]),D("click",d,function(...k){e.onCollapseClick?.apply(this,k)}),h(s,d)}})}i(t),M(()=>a=F(t,1,"expanded-player card-base shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out absolute bottom-0 right-0 w-80",null,a,{"opacity-0":e.isHidden,"scale-95":e.isHidden,"pointer-events-none":e.isHidden})),h(f,t),J()}G(["click"]);var jt=_('<span class="text-sm text-[var(--content-meta)]"> </span>'),Kt=_('<div role="button" tabindex="0"><div class="w-6 h-6 flex items-center justify-center"><!></div> <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0"><img decoding="async" class="w-full h-full object-cover"/></div> <div class="flex-1 min-w-0"><div> </div> <div> </div></div></div>');function Ot(f,e){W(e,!0);const t=ee(e,"lazy",3,!0);var a=Kt();let l;var o=r(a),x=r(o);{var y=u=>{R(u,{icon:"material-symbols:graphic-eq",class:"text-[var(--primary)] animate-pulse"})},C=u=>{R(u,{icon:"material-symbols:pause",class:"text-[var(--primary)]"})},s=u=>{var I=jt(),T=r(I,!0);i(I),M(()=>O(T,e.index+1)),h(u,I)};N(x,u=>{e.isCurrent&&e.isPlaying?u(y):e.isCurrent?u(C,1):u(s,-1)})}i(o);var m=b(o,2),d=r(m);i(m);var g=b(m,2),k=r(g);let S;var c=r(k,!0);i(k);var L=b(k,2);let E;var V=r(L,!0);i(L),i(g),i(a),M(u=>{l=F(a,1,"playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors",null,l,{"bg-[var(--btn-plain-bg)]":e.isCurrent,"text-[var(--primary)]":e.isCurrent}),K(a,"aria-label",`播放 ${e.song.title??""} - ${e.song.artist??""}`),K(d,"src",u),K(d,"alt",e.song.title),K(d,"loading",t()?"lazy":"eager"),S=F(k,1,"font-medium truncate",null,S,{"text-[var(--primary)]":e.isCurrent,"text-90":!e.isCurrent}),O(c,e.song.title),E=F(L,1,"text-sm text-[var(--content-meta)] truncate",null,E,{"text-[var(--primary)]":e.isCurrent}),O(V,e.song.artist)},[()=>lt(e.song.cover)]),D("click",a,function(...u){e.onclick?.apply(this,u)}),D("keydown",a,u=>{(u.key==="Enter"||u.key===" ")&&(u.preventDefault(),e.onclick())}),h(f,a),J()}G(["click","keydown"]);var Ft=_('<div class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50 svelte-1v267om"><div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"><h3 class="text-lg font-semibold text-90"> </h3> <button class="btn-plain w-8 h-8 rounded-lg"><!></button></div> <div class="playlist-content overflow-y-auto max-h-80 hide-scrollbar" role="presentation"></div></div>');function Ut(f,e){W(e,!0);var t=se(),a=Y(t);{var l=o=>{var x=Ft(),y=r(x),C=r(y),s=r(C,!0);i(C);var m=b(C,2),d=r(m);R(d,{icon:"material-symbols:close",class:"text-lg"}),i(m),i(y);var g=b(y,2);at(g,21,()=>e.playlist,ot,(k,S,c)=>{{let L=ae(()=>c===e.currentIndex);Ot(k,{get song(){return n(S)},index:c,get isCurrent(){return n(L)},get isPlaying(){return e.isPlaying},onclick:()=>e.onPlaySong(c),lazy:c!==0})}}),i(g),i(x),M(k=>O(s,k),[()=>$(Z.musicPlayerPlaylist)]),D("click",m,function(...k){e.onClose?.apply(this,k)}),de(3,x,()=>Fe,()=>({duration:300,axis:"y"})),h(o,x)};N(a,o=>{e.show&&o(l)})}h(f,t),J()}G(["click"]);var qt=_('<div class="fixed bottom-20 right-4 z-[60] max-w-sm"><div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"><!> <span class="text-sm flex-1"> </span> <button class="text-white/80 hover:text-white transition-colors"><!></button></div></div>'),Yt=_('<div class="music-player-fab-anchor fixed z-[55]"><div class="music-player-fab-shell"><!></div></div>'),Wt=_("<div><div><!></div> <!> <!> <!></div>"),Jt=_(`<!> <!> <style>.music-player-fab-anchor {
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
		}</style>`,1),Gt=_("<!> <!>",1);function mn(f,e){W(e,!1);let t=Xe(w.getState());const a=ve.showFloatingPlayer,o=(ve.floatingEntryMode??"default")==="fab",x=a&&ve.enable;let y;function C(){w.toggle()}function s(){w.prev()}function m(){w.next()}function d(){w.toggleShuffle()}function g(){w.toggleRepeat()}function k(v){w.playIndex(v)}function S(v){const p=v.currentTarget;if(!p)return;const X=p.getBoundingClientRect(),z=(v.clientX-X.left)/X.width;w.setProgress(z)}function c(v){const p=v.currentTarget;if(!p)return;const X=P=>{const H=p.getBoundingClientRect();if(H.width<=0)return;const j=(P-H.left)/H.width;w.setProgress(j)};v.preventDefault(),X(v.clientX);const z=v.pointerId;p.setPointerCapture(z);const te=P=>{P.pointerId===z&&X(P.clientX)},ne=()=>{p.removeEventListener("pointermove",te),p.removeEventListener("pointerup",ie),p.removeEventListener("pointercancel",B),p.hasPointerCapture(z)&&p.releasePointerCapture(z)},ie=P=>{P.pointerId===z&&(X(P.clientX),ne())},B=P=>{P.pointerId===z&&ne()};p.addEventListener("pointermove",te),p.addEventListener("pointerup",ie),p.addEventListener("pointercancel",B)}function L(v){(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),w.setProgress(.5))}function E(){w.toggleMute()}function V(){w.toggleMute()}function u(v){const p=v.currentTarget;if(!p)return;const X=P=>{const H=p.getBoundingClientRect();if(H.width<=0)return;const j=Math.max(0,Math.min(1,(P-H.left)/H.width));w.setVolume(j)};X(v.clientX);const z=v.pointerId;p.setPointerCapture(z);const te=P=>{P.pointerId===z&&X(P.clientX)},ne=()=>{p.removeEventListener("pointermove",te),p.removeEventListener("pointerup",ie),p.removeEventListener("pointercancel",B),p.hasPointerCapture(z)&&p.releasePointerCapture(z)},ie=P=>{P.pointerId===z&&(X(P.clientX),ne())},B=P=>{P.pointerId===z&&ne()};p.addEventListener("pointermove",te),p.addEventListener("pointerup",ie),p.addEventListener("pointercancel",B)}function I(v){const p=v.target;if(!(p?.tagName==="INPUT"||p?.tagName==="TEXTAREA"||p?.contentEditable==="true")){if(v.key==="ArrowLeft"||v.key==="ArrowDown"){v.preventDefault(),w.setVolume(n(t).volume-.05);return}if(v.key==="ArrowRight"||v.key==="ArrowUp"){v.preventDefault(),w.setVolume(n(t).volume+.05);return}(v.key==="Enter"||v.key===" "||v.key==="m"||v.key==="M")&&(v.preventDefault(),E())}}function T(){w.togglePlaylist()}function A(){w.toggleExpanded()}function oe(){w.toggleHidden()}function Se(){w.hideError()}function Le(v){}function Ee(){return w.canSkip()}fe(()=>{y=w.subscribe(v=>{re(t,v)}),w.initialize()}),pe(()=>{y&&y(),w.destroy()}),ze();var ye=Gt();je("keydown",Ke,I);var be=Y(ye);yt(be,{});var Te=b(be,2);{var Me=v=>{var p=Jt(),X=Y(p);{var z=B=>{var P=qt(),H=r(P),j=r(H);R(j,{icon:"material-symbols:error",class:"text-xl flex-shrink-0"});var q=b(j,2),Q=r(q,!0);i(q);var U=b(q,2),le=r(U);R(le,{icon:"material-symbols:close",class:"text-lg"}),i(U),i(H),i(P),M(()=>O(Q,n(t).errorMessage)),D("click",U,Se),h(B,P)};N(X,B=>{n(t).showError&&B(z)})}var te=b(X,2);{var ne=B=>{var P=se(),H=Y(P);{var j=q=>{var Q=Yt(),U=r(Q),le=r(U);gt(le,{}),i(U),i(Q),de(3,U,()=>Ue,()=>({y:16,duration:280,opacity:.12,easing:dt})),h(q,Q)};N(H,q=>{n(t).isExpanded&&q(j)})}h(B,P)},ie=B=>{var P=Wt();let H;var j=r(P),q=r(j);me(q,{get cover(){return n(t).currentSong.cover},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},size:"orb",onclick:oe}),i(j);var Q=b(j,2);{let ce=ge(()=>n(t).isExpanded||n(t).isHidden);Ct(Q,{get song(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},get isHidden(){return n(ce)},onCoverClick:C,onInfoClick:A,onHideClick:oe,onExpandClick:A})}var U=b(Q,2);{let ce=ge(Ee),Ie=ge(()=>!n(t).isExpanded);Xt(U,{get song(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},get isShuffled(){return n(t).isShuffled},get isRepeating(){return n(t).isRepeating},get showPlaylist(){return n(t).showPlaylist},get canSkip(){return n(ce)},get volume(){return n(t).volume},get isMuted(){return n(t).isMuted},isVolumeDragging:!1,get isHidden(){return n(Ie)},volumeBarRef:Le,onPlayClick:C,onPrevClick:s,onNextClick:()=>m(),onShuffleClick:d,onRepeatClick:g,onProgressClick:S,onProgressKeyDown:L,onProgressPointerDown:c,onVolumeButtonClick:V,onSliderPointerDown:u,onSliderKeyDown:I,onHideClick:oe,onPlaylistClick:T,onCollapseClick:A})}var le=b(U,2);Ut(le,{get playlist(){return n(t).playlist},get currentIndex(){return n(t).currentIndex},get isPlaying(){return n(t).isPlaying},get show(){return n(t).showPlaylist},onClose:T,onPlaySong:k}),i(P),M(()=>{H=F(P,1,"music-player fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",null,H,{expanded:n(t).isExpanded,"hidden-mode":n(t).isHidden}),F(j,1,`orb-player-container ${n(t).isHidden?"orb-enter pointer-events-auto":"orb-leave pointer-events-none"}`)}),h(B,P)};N(te,B=>{o?B(ne):B(ie,-1)})}Oe(2),h(v,p)};N(Te,v=>{x&&v(Me)})}h(f,ye),J()}G(["click"]);export{mn as default};
