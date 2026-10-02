import{R as o,r as x,a as h,u as m,U as j,j as s,I as k,_ as f,P as M,$ as v,H as P,Q as b,a0 as g,a1 as L}from"./index-C6c4hJ8-.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=o("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=o("ListPlus",[["path",{d:"M11 12H3",key:"51ecnj"}],["path",{d:"M16 6H3",key:"1wxfjs"}],["path",{d:"M16 18H3",key:"12xzn7"}],["path",{d:"M18 9v6",key:"1twb98"}],["path",{d:"M21 12h-6",key:"bt1uis"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=o("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);function I({track:e,playlistId:n}){const[u,t]=x.useState(!1),i=h(),a=m(),r=j(),y=l=>{l(),t(!1)};return s.jsxs(s.Fragment,{children:[s.jsx(k,{label:`More options for ${e.title}`,onClick:()=>t(!0),children:s.jsx(w,{size:19})}),u&&s.jsx(f,{title:e.title,onClose:()=>t(!1),children:s.jsx("div",{className:"track-menu",children:[[M,"Play",()=>i.play([e])],[v,"Play next",()=>i.addQueue(e,!0)],[H,"Add to queue",()=>i.addQueue(e)],[P,a.isLiked(e)?"Remove from Liked Songs":"Like song",()=>a.toggleLike(e)],[b,"Add to playlist",()=>a.setDialog({type:"add",track:e})],[g,"Go to artist",()=>r(`/artist/${e.artistId}`)],[L,e.albumId?"Go to album":"View release",()=>r(`/album/${e.albumId||`track-${e.id}`}`)],...n?[[c,"Remove from playlist",()=>a.removeFromPlaylist(n,e.id)]]:[]].map(([l,d,p])=>s.jsxs("button",{onClick:()=>y(p),children:[s.jsx(l,{size:18}),d]},d))})})]})}export{I as T,c as a};
