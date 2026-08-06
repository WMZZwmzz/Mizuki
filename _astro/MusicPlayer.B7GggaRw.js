import{o as he,a as xe,p as Q,i as K,s as F,c as Le,b as N,e as we}from"./disclose-version.-zam-uKS.js";import{i as Me}from"./legacy.CFhft6Uy.js";import{a9 as $,ae as ve,p as De,ab as r,q as n,ad as b,ac as i,a6 as k,a7 as ee,aa as ce,a8 as C,ah as oe,ai as Z,a4 as M,a1 as O,a5 as T,aj as le,b0 as Ie,O as ze,af as Ve,aq as Re,as as He,J as ue}from"./branches.iRLc8qXB.js";import{s as q}from"./render.DsNAIBjV.js";import{t as ke,s as Be,a as Ae}from"./index.yBh5Mwbg.js";import{I}from"./Icon.DayTuTMX.js";import{m as de}from"./musicConfig.CaAUvbfQ.js";import"./profileConfig.Dlu9j0QK.js";import{m as y}from"./musicPlayerStore.vD7MU12-.js";import{S as Xe,a as Ke,b as Ne,c as je,d as Fe,C as ge,P as Ue,e as qe,N as Ye}from"./SidebarTrackInfo.Cwds7Cfr.js";import{I as J}from"./zh_TW.CXUcOZ30.js";import{i as G}from"./translation.S_1HZ9Dk.js";import{s as Oe}from"./snippet.BQ10FKD1.js";import{a as We}from"./actions.ivk7fkjo.js";import{e as Je,i as Ge}from"./each.DHaGcmfC.js";import{g as Qe}from"./url-utils.BvqnLyRe.js";function Ze(h){const e=h-1;return e*e*e+1}var $e=C('<div class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw] svelte-1lty5dg"><div class="fab-music-header svelte-1lty5dg"><!> <!></div> <!> <!> <!></div>');function et(h,e){$(e,!0);let t=ve(De(y.getState())),a=ve(!1);function s(z){const j=z;j.detail&&ce(t,j.detail,!0)}he(()=>{window.addEventListener("music-sidebar:state",s)}),xe(()=>{typeof window<"u"&&window.removeEventListener("music-sidebar:state",s)});function u(){y.toggle()}function p(){y.prev()}function v(){y.next()}function _(){y.toggleMode()}function o(){ce(a,!n(a))}function m(z){y.playIndex(z)}function g(z){y.seek(z)}function P(){y.toggleMute()}function x(z){y.setVolume(z)}var S=$e(),c=r(S),L=r(c);Xe(L,{get currentSong(){return n(t).currentSong},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading}});var E=b(L,2);Ke(E,{get currentSong(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get volume(){return n(t).volume},get isMuted(){return n(t).isMuted},onToggleMute:P,onSetVolume:x}),i(c);var B=b(c,2);Ne(B,{get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},onSeek:g});var l=b(B,2);je(l,{get isPlaying(){return n(t).isPlaying},get isShuffled(){return n(t).isShuffled},get repeatMode(){return n(t).isRepeating},onToggleMode:_,onPrev:p,onNext:v,onTogglePlay:u,onTogglePlaylist:o});var R=b(l,2);Fe(R,{get playlist(){return n(t).playlist},get currentIndex(){return n(t).currentIndex},get isPlaying(){return n(t).isPlaying},get show(){return n(a)},onClose:o,onPlaySong:m}),i(S),k(h,S),ee()}var tt=C('<div class="flex-1 min-w-0"><div class="text-sm font-medium text-90 truncate"> </div> <div class="text-xs text-50 truncate"> </div></div>'),nt=C('<div class="text-xs text-30 mt-1"> </div>'),it=C('<div class="flex-1 min-w-0"><div class="song-title text-lg font-bold text-90 truncate mb-1"> </div> <div class="song-artist text-sm text-50 truncate"> </div> <!></div>');function fe(h,e){$(e,!0);const t=Q(e,"showTime",3,!1),a=Q(e,"size",3,"mini");function s(o){if(!Number.isFinite(o)||o<0)return"0:00";const m=Math.floor(o/60),g=Math.floor(o%60);return`${m}:${g.toString().padStart(2,"0")}`}var u=oe(),p=Z(u);{var v=o=>{var m=tt(),g=r(m),P=r(g,!0);i(g);var x=b(g,2),S=r(x,!0);i(x),i(m),M(()=>{q(P,e.song.title),q(S,e.song.artist)}),k(o,m)},_=o=>{var m=it(),g=r(m),P=r(g,!0);i(g);var x=b(g,2),S=r(x,!0);i(x);var c=b(x,2);{var L=E=>{var B=nt(),l=r(B);i(B),M((R,z)=>q(l,`${R??""} / ${z??""}`),[()=>s(e.currentTime),()=>s(e.duration)]),k(E,B)};K(c,E=>{t()&&E(L)})}i(m),M(()=>{q(P,e.song.title),q(S,e.song.artist)}),k(o,m)};K(p,o=>{a()==="mini"?o(v):o(_,-1)})}k(h,u),ee()}var rt=C('<!> <div class="flex-1 min-w-0 cursor-pointer" role="button" tabindex="0"><!></div> <div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button></div>',1),at=C('<div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button><!></button></div>'),ot=C("<!> <!> <!>",1),lt=C("<div><!></div>");function Pe(h,e){$(e,!0);const t=Q(e,"size",3,"mini"),a=Q(e,"showControls",3,!1),s=Q(e,"showPlaylist",3,!1);var u=lt(),p=r(u);{var v=o=>{var m=rt(),g=Z(m);ge(g,{get cover(){return e.song.cover},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"mini",interactive:!0,get onclick(){return e.onCoverClick}});var P=b(g,2),x=r(P);fe(x,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},size:"mini"}),i(P);var S=b(P,2),c=r(S),L=r(c);I(L,{icon:"material-symbols:visibility-off",class:"text-lg"}),i(c);var E=b(c,2),B=r(E);I(B,{icon:"material-symbols:expand-less",class:"text-lg"}),i(E),i(S),M((l,R)=>{N(P,"aria-label",l),N(c,"title",R)},[()=>G(J.musicPlayerExpand),()=>G(J.musicPlayerHide)]),T("click",P,function(...l){e.onInfoClick?.apply(this,l)}),T("keydown",P,l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),e.onInfoClick?.())}),T("click",c,l=>{l.stopPropagation(),e.onHideClick?.()}),T("click",E,l=>{l.stopPropagation(),e.onExpandClick?.()}),k(o,m)},_=o=>{var m=ot(),g=Z(m);ge(g,{get cover(){return e.song.cover},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"expanded"});var P=b(g,2);fe(P,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},showTime:!0,size:"expanded"});var x=b(P,2);{var S=c=>{var L=at(),E=r(L),B=r(E);I(B,{icon:"material-symbols:visibility-off",class:"text-lg"}),i(E);var l=b(E,2);let R;var z=r(l);I(z,{icon:"material-symbols:queue-music",class:"text-lg"}),i(l),i(L),M((j,re)=>{N(E,"title",j),R=F(l,1,"btn-plain w-8 h-8 rounded-lg flex items-center justify-center",null,R,{"text-[var(--primary)]":s()}),N(l,"title",re)},[()=>G(J.musicPlayerHide),()=>G(J.musicPlayerPlaylist)]),T("click",E,function(...j){e.onHideClick?.apply(this,j)}),T("click",l,function(...j){e.onPlaylistClick?.apply(this,j)}),k(c,L)};K(x,c=>{a()&&c(S)})}k(o,m)};K(p,o=>{t()==="mini"?o(v):o(_,-1)})}i(u),M(()=>F(u,1,Le(t()==="mini"?"flex items-center gap-3 mb-0":"flex items-center gap-4 mb-4"))),k(h,u),ee()}O(["click","keydown"]);var st=C("<div><!></div>");function ut(h,e){var t=st();let a;var s=r(t);Pe(s,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"mini",get onCoverClick(){return e.onCoverClick},get onInfoClick(){return e.onInfoClick},get onHideClick(){return e.onHideClick},get onExpandClick(){return e.onExpandClick}}),i(t),M(()=>a=F(t,1,"mini-player card-base shadow-xl rounded-2xl p-3 absolute bottom-0 right-0 w-[17.5rem] svelte-g9ac72",null,a,{"mini-enter":!e.isHidden,"mini-leave":e.isHidden,"pointer-events-none":e.isHidden})),k(h,t)}var be=C("<button><!></button>");function ye(h,e){const t=Q(e,"repeatMode",3,0),a=Q(e,"disabled",3,!1);var s=oe(),u=Z(s);{var p=_=>{var o=be();let m;var g=r(o);I(g,{icon:"material-symbols:shuffle",class:"text-lg"}),i(o),M(()=>{m=F(o,1,"w-10 h-10 rounded-lg",null,m,{"btn-regular":e.isActive,"btn-plain":!e.isActive}),o.disabled=a()}),T("click",o,function(...P){e.onclick?.apply(this,P)}),k(_,o)},v=_=>{var o=be();let m;var g=r(o);{var P=c=>{I(c,{icon:"material-symbols:repeat-one",class:"text-lg"})},x=c=>{I(c,{icon:"material-symbols:repeat",class:"text-lg"})},S=c=>{I(c,{icon:"material-symbols:repeat",class:"text-lg opacity-50"})};K(g,c=>{t()===1?c(P):t()===2?c(x,1):c(S,-1)})}i(o),M(()=>m=F(o,1,"w-10 h-10 rounded-lg",null,m,{"btn-regular":e.isActive,"btn-plain":!e.isActive})),T("click",o,function(...c){e.onclick?.apply(this,c)}),k(_,o)};K(u,_=>{e.mode==="shuffle"?_(p):_(v,-1)})}k(h,s)}O(["click"]);var dt=C('<div class="controls flex items-center justify-center gap-2 mb-4"><!> <!> <!> <!> <!></div>');function ct(h,e){var t=dt(),a=r(t);ye(a,{mode:"shuffle",get isActive(){return e.isShuffled},get onclick(){return e.onShuffleClick}});var s=b(a,2);Ue(s,{get onclick(){return e.onPrevClick},disabled:!1});var u=b(s,2);qe(u,{get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},get onclick(){return e.onPlayClick}});var p=b(u,2);Ye(p,{get onclick(){return e.onNextClick},disabled:!1});var v=b(p,2);{let _=le(()=>e.isRepeating>0);ye(v,{mode:"repeat",get isActive(){return n(_)},get repeatMode(){return e.isRepeating},get onclick(){return e.onRepeatClick}})}i(t),k(h,t)}var gt=C('<div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"></div></div>');function mt(h,e){$(e,!0);var t=gt(),a=r(t);i(t),M(s=>{N(t,"aria-label",s),N(t,"aria-valuenow",e.duration>0?e.currentTime/e.duration*100:0),we(a,`width: ${e.duration>0?e.currentTime/e.duration*100:0}%`)},[()=>G(J.musicPlayerProgress)]),T("click",t,function(...s){e.onclick?.apply(this,s)}),T("keydown",t,function(...s){e.onkeydown?.apply(this,s)}),T("pointerdown",t,function(...s){e.onpointerdown?.apply(this,s)}),k(h,t),ee()}O(["click","keydown","pointerdown"]);var vt=C('<div class="progress-section mb-4"><!></div>');function ft(h,e){var t=vt(),a=r(t);mt(a,{get currentTime(){return e.currentTime},get duration(){return e.duration},get onclick(){return e.onProgressClick},get onkeydown(){return e.onProgressKeyDown},get onpointerdown(){return e.onProgressPointerDown}}),i(t),k(h,t)}var bt=C('<button class="btn-plain w-8 h-8 rounded-lg"><!></button>');function yt(h,e){var t=bt(),a=r(t);{var s=v=>{I(v,{icon:"material-symbols:volume-off",class:"text-lg"})},u=v=>{I(v,{icon:"material-symbols:volume-down",class:"text-lg"})},p=v=>{I(v,{icon:"material-symbols:volume-up",class:"text-lg"})};K(a,v=>{e.isMuted||e.volume===0?v(s):e.volume<.5?v(u,1):v(p,-1)})}i(t),T("click",t,function(...v){e.onclick?.apply(this,v)}),k(h,t)}O(["click"]);var ht=C('<div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>');function xt(h,e){var t=ht(),a=r(t);let s;i(t),We(t,u=>e.volumeBarRef?.(u)),M(()=>{N(t,"aria-label",e.ariaLabel),N(t,"aria-valuenow",e.volume*100),s=F(a,1,"h-full bg-[var(--primary)] rounded-full transition-all",null,s,{"duration-100":!e.isVolumeDragging,"duration-0":e.isVolumeDragging}),we(a,`width: ${e.volume*100}%`)}),T("pointerdown",t,function(...u){e.onpointerdown?.apply(this,u)}),T("keydown",t,function(...u){e.onkeydown?.apply(this,u)}),k(h,t)}O(["pointerdown","keydown"]);var wt=C('<div class="bottom-controls flex items-center gap-2"><!> <!> <!></div>');function kt(h,e){var t=wt(),a=r(t);yt(a,{get volume(){return e.volume},get isMuted(){return e.isMuted},get onclick(){return e.onVolumeButtonClick}});var s=b(a,2);{let p=le(()=>e.isMuted?0:e.volume);xt(s,{get volume(){return n(p)},get isVolumeDragging(){return e.isVolumeDragging},get volumeBarRef(){return e.volumeBarRef},get onpointerdown(){return e.onSliderPointerDown},get onkeydown(){return e.onSliderKeyDown},get ariaLabel(){return e.ariaLabel}})}var u=b(s,2);Oe(u,()=>e.children??Ie),i(t),k(h,t)}var Pt=C('<button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button>'),pt=C("<div><!> <!> <!> <!></div>");function _t(h,e){$(e,!0);var t=pt();let a;var s=r(t);Pe(s,{get song(){return e.song},get currentTime(){return e.currentTime},get duration(){return e.duration},get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},size:"expanded",showControls:!0,get showPlaylist(){return e.showPlaylist},get onHideClick(){return e.onHideClick},get onPlaylistClick(){return e.onPlaylistClick}});var u=b(s,2);ft(u,{get currentTime(){return e.currentTime},get duration(){return e.duration},get onProgressClick(){return e.onProgressClick},get onProgressKeyDown(){return e.onProgressKeyDown},get onProgressPointerDown(){return e.onProgressPointerDown}});var p=b(u,2);ct(p,{get isPlaying(){return e.isPlaying},get isLoading(){return e.isLoading},get isShuffled(){return e.isShuffled},get isRepeating(){return e.isRepeating},get onPlayClick(){return e.onPlayClick},get onPrevClick(){return e.onPrevClick},get onNextClick(){return e.onNextClick},get onShuffleClick(){return e.onShuffleClick},get onRepeatClick(){return e.onRepeatClick}});var v=b(p,2);{let _=le(()=>G(J.musicPlayerVolume));kt(v,{get volume(){return e.volume},get isMuted(){return e.isMuted},get isVolumeDragging(){return e.isVolumeDragging},get volumeBarRef(){return e.volumeBarRef},get onVolumeButtonClick(){return e.onVolumeButtonClick},get onSliderPointerDown(){return e.onSliderPointerDown},get onSliderKeyDown(){return e.onSliderKeyDown},get ariaLabel(){return n(_)},children:(o,m)=>{var g=Pt(),P=r(g);I(P,{icon:"material-symbols:expand-more",class:"text-lg"}),i(g),M(x=>N(g,"title",x),[()=>G(J.musicPlayerCollapse)]),T("click",g,function(...x){e.onCollapseClick?.apply(this,x)}),k(o,g)}})}i(t),M(()=>a=F(t,1,"expanded-player card-base shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out absolute bottom-0 right-0 w-80",null,a,{"opacity-0":e.isHidden,"scale-95":e.isHidden,"pointer-events-none":e.isHidden})),k(h,t),ee()}O(["click"]);var Ct=C('<span class="text-sm text-[var(--content-meta)]"> </span>'),St=C('<div role="button" tabindex="0"><div class="w-6 h-6 flex items-center justify-center"><!></div> <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0"><img decoding="async" class="w-full h-full object-cover"/></div> <div class="flex-1 min-w-0"><div> </div> <div> </div></div></div>');function Et(h,e){$(e,!0);const t=Q(e,"lazy",3,!0);var a=St();let s;var u=r(a),p=r(u);{var v=l=>{I(l,{icon:"material-symbols:graphic-eq",class:"text-[var(--primary)] animate-pulse"})},_=l=>{I(l,{icon:"material-symbols:pause",class:"text-[var(--primary)]"})},o=l=>{var R=Ct(),z=r(R,!0);i(R),M(()=>q(z,e.index+1)),k(l,R)};K(p,l=>{e.isCurrent&&e.isPlaying?l(v):e.isCurrent?l(_,1):l(o,-1)})}i(u);var m=b(u,2),g=r(m);i(m);var P=b(m,2),x=r(P);let S;var c=r(x,!0);i(x);var L=b(x,2);let E;var B=r(L,!0);i(L),i(P),i(a),M(l=>{s=F(a,1,"playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors",null,s,{"bg-[var(--btn-plain-bg)]":e.isCurrent,"text-[var(--primary)]":e.isCurrent}),N(a,"aria-label",`播放 ${e.song.title??""} - ${e.song.artist??""}`),N(g,"src",l),N(g,"alt",e.song.title),N(g,"loading",t()?"lazy":"eager"),S=F(x,1,"font-medium truncate",null,S,{"text-[var(--primary)]":e.isCurrent,"text-90":!e.isCurrent}),q(c,e.song.title),E=F(L,1,"text-sm text-[var(--content-meta)] truncate",null,E,{"text-[var(--primary)]":e.isCurrent}),q(B,e.song.artist)},[()=>Qe(e.song.cover)]),T("click",a,function(...l){e.onclick?.apply(this,l)}),T("keydown",a,l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),e.onclick())}),k(h,a),ee()}O(["click","keydown"]);var Tt=C('<div class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50 svelte-1v267om"><div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"><h3 class="text-lg font-semibold text-90"> </h3> <button class="btn-plain w-8 h-8 rounded-lg"><!></button></div> <div class="playlist-content overflow-y-auto max-h-80 hide-scrollbar" role="presentation"></div></div>');function Lt(h,e){$(e,!0);var t=oe(),a=Z(t);{var s=u=>{var p=Tt(),v=r(p),_=r(v),o=r(_,!0);i(_);var m=b(_,2),g=r(m);I(g,{icon:"material-symbols:close",class:"text-lg"}),i(m),i(v);var P=b(v,2);Je(P,21,()=>e.playlist,Ge,(x,S,c)=>{{let L=le(()=>c===e.currentIndex);Et(x,{get song(){return n(S)},index:c,get isCurrent(){return n(L)},get isPlaying(){return e.isPlaying},onclick:()=>e.onPlaySong(c),lazy:c!==0})}}),i(P),i(p),M(x=>q(o,x),[()=>G(J.musicPlayerPlaylist)]),T("click",m,function(...x){e.onClose?.apply(this,x)}),ke(3,p,()=>Be,()=>({duration:300,axis:"y"})),k(u,p)};K(a,u=>{e.show&&u(s)})}k(h,t),ee()}O(["click"]);var Mt=C('<div class="fixed bottom-20 right-4 z-[60] max-w-sm"><div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"><!> <span class="text-sm flex-1"> </span> <button class="text-white/80 hover:text-white transition-colors"><!></button></div></div>'),Dt=C('<div class="music-player-fab-anchor fixed z-[55]"><div class="music-player-fab-shell"><!></div></div>'),It=C("<div><div><!></div> <!> <!> <!></div>"),zt=C(`<!> <!> <style>.music-player-fab-anchor {
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
		}</style>`,1);function Gt(h,e){$(e,!1);let t=ze(y.getState());const a=de.showFloatingPlayer,u=(de.floatingEntryMode??"default")==="fab",p=a&&de.enable;let v;function _(){y.toggle()}function o(){y.prev()}function m(){y.next()}function g(){y.toggleShuffle()}function P(){y.toggleRepeat()}function x(d){y.playIndex(d)}function S(d){const f=d.currentTarget;if(!f)return;const A=f.getBoundingClientRect(),D=(d.clientX-A.left)/A.width;y.setProgress(D)}function c(d){const f=d.currentTarget;if(!f)return;const A=w=>{const H=f.getBoundingClientRect();if(H.width<=0)return;const X=(w-H.left)/H.width;y.setProgress(X)};d.preventDefault(),A(d.clientX);const D=d.pointerId;f.setPointerCapture(D);const te=w=>{w.pointerId===D&&A(w.clientX)},ne=()=>{f.removeEventListener("pointermove",te),f.removeEventListener("pointerup",ie),f.removeEventListener("pointercancel",V),f.hasPointerCapture(D)&&f.releasePointerCapture(D)},ie=w=>{w.pointerId===D&&(A(w.clientX),ne())},V=w=>{w.pointerId===D&&ne()};f.addEventListener("pointermove",te),f.addEventListener("pointerup",ie),f.addEventListener("pointercancel",V)}function L(d){(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),y.setProgress(.5))}function E(){y.toggleMute()}function B(){y.toggleMute()}function l(d){const f=d.currentTarget;if(!f)return;const A=w=>{const H=f.getBoundingClientRect();if(H.width<=0)return;const X=Math.max(0,Math.min(1,(w-H.left)/H.width));y.setVolume(X)};A(d.clientX);const D=d.pointerId;f.setPointerCapture(D);const te=w=>{w.pointerId===D&&A(w.clientX)},ne=()=>{f.removeEventListener("pointermove",te),f.removeEventListener("pointerup",ie),f.removeEventListener("pointercancel",V),f.hasPointerCapture(D)&&f.releasePointerCapture(D)},ie=w=>{w.pointerId===D&&(A(w.clientX),ne())},V=w=>{w.pointerId===D&&ne()};f.addEventListener("pointermove",te),f.addEventListener("pointerup",ie),f.addEventListener("pointercancel",V)}function R(d){const f=d.target;if(!(f?.tagName==="INPUT"||f?.tagName==="TEXTAREA"||f?.contentEditable==="true")){if(d.key==="ArrowLeft"||d.key==="ArrowDown"){d.preventDefault(),y.setVolume(n(t).volume-.05);return}if(d.key==="ArrowRight"||d.key==="ArrowUp"){d.preventDefault(),y.setVolume(n(t).volume+.05);return}(d.key==="Enter"||d.key===" "||d.key==="m"||d.key==="M")&&(d.preventDefault(),E())}}function z(){y.togglePlaylist()}function j(){y.toggleExpanded()}function re(){y.toggleHidden()}function pe(){y.hideError()}function _e(d){}function Ce(){return y.canSkip()}he(()=>{v=y.subscribe(d=>{ce(t,d)}),y.initialize()}),xe(()=>{v&&v(),y.destroy()}),Me();var me=oe();Ve("keydown",Re,R);var Se=Z(me);{var Ee=d=>{var f=zt(),A=Z(f);{var D=V=>{var w=Mt(),H=r(w),X=r(H);I(X,{icon:"material-symbols:error",class:"text-xl flex-shrink-0"});var Y=b(X,2),W=r(Y,!0);i(Y);var U=b(Y,2),ae=r(U);I(ae,{icon:"material-symbols:close",class:"text-lg"}),i(U),i(H),i(w),M(()=>q(W,n(t).errorMessage)),T("click",U,pe),k(V,w)};K(A,V=>{n(t).showError&&V(D)})}var te=b(A,2);{var ne=V=>{var w=oe(),H=Z(w);{var X=Y=>{var W=Dt(),U=r(W),ae=r(U);et(ae,{}),i(U),i(W),ke(3,U,()=>Ae,()=>({y:16,duration:280,opacity:.12,easing:Ze})),k(Y,W)};K(H,Y=>{n(t).isExpanded&&Y(X)})}k(V,w)},ie=V=>{var w=It();let H;var X=r(w),Y=r(X);ge(Y,{get cover(){return n(t).currentSong.cover},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},size:"orb",onclick:re}),i(X);var W=b(X,2);{let se=ue(()=>n(t).isExpanded||n(t).isHidden);ut(W,{get song(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},get isHidden(){return n(se)},onCoverClick:_,onInfoClick:j,onHideClick:re,onExpandClick:j})}var U=b(W,2);{let se=ue(Ce),Te=ue(()=>!n(t).isExpanded);_t(U,{get song(){return n(t).currentSong},get currentTime(){return n(t).currentTime},get duration(){return n(t).duration},get isPlaying(){return n(t).isPlaying},get isLoading(){return n(t).isLoading},get isShuffled(){return n(t).isShuffled},get isRepeating(){return n(t).isRepeating},get showPlaylist(){return n(t).showPlaylist},get canSkip(){return n(se)},get volume(){return n(t).volume},get isMuted(){return n(t).isMuted},isVolumeDragging:!1,get isHidden(){return n(Te)},volumeBarRef:_e,onPlayClick:_,onPrevClick:o,onNextClick:()=>m(),onShuffleClick:g,onRepeatClick:P,onProgressClick:S,onProgressKeyDown:L,onProgressPointerDown:c,onVolumeButtonClick:B,onSliderPointerDown:l,onSliderKeyDown:R,onHideClick:re,onPlaylistClick:z,onCollapseClick:j})}var ae=b(U,2);Lt(ae,{get playlist(){return n(t).playlist},get currentIndex(){return n(t).currentIndex},get isPlaying(){return n(t).isPlaying},get show(){return n(t).showPlaylist},onClose:z,onPlaySong:x}),i(w),M(()=>{H=F(w,1,"music-player fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",null,H,{expanded:n(t).isExpanded,"hidden-mode":n(t).isHidden}),F(X,1,`orb-player-container ${n(t).isHidden?"orb-enter pointer-events-auto":"orb-leave pointer-events-none"}`)}),k(V,w)};K(te,V=>{u?V(ne):V(ie,-1)})}He(2),k(d,f)};K(Se,d=>{p&&d(Ee)})}k(h,me),ee()}O(["click"]);export{Gt as default};
