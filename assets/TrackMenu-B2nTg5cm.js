import{c as o,r as p,k as x,u as h,a4 as m,j as s,I as j,a9 as k,P as f,aa as M,H as v,O as b,ab as P,ac as g}from"./index-DxY1bOHq.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=o("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=o("ListPlus",[["path",{d:"M11 12H3",key:"51ecnj"}],["path",{d:"M16 6H3",key:"1wxfjs"}],["path",{d:"M16 18H3",key:"12xzn7"}],["path",{d:"M18 9v6",key:"1twb98"}],["path",{d:"M21 12h-6",key:"bt1uis"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=o("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);function z({track:e,playlistId:n}){const[c,t]=p.useState(!1),i=x(),a=h(),r=m(),u=l=>{l(),t(!1)};return s.jsxs(s.Fragment,{children:[s.jsx(j,{label:`More options for ${e.title}`,onClick:()=>t(!0),children:s.jsx(L,{size:19})}),c&&s.jsx(k,{title:e.title,onClose:()=>t(!1),children:s.jsx("div",{className:"track-menu",children:[[f,"Play",()=>i.play([e])],[M,"Play next",()=>i.addQueue(e,!0)],[w,"Add to queue",()=>i.addQueue(e)],[v,a.isLiked(e)?"Remove from Liked Songs":"Like song",()=>a.toggleLike(e)],[b,"Add to playlist",()=>a.setDialog({type:"add",track:e})],[P,"Go to artist",()=>r(`/artist/${e.artistId}`)],[g,e.albumId?"Go to album":"View release",()=>r(`/album/${e.albumId||`track-${e.id}`}`)],...n?[[H,"Remove from playlist",()=>a.removeFromPlaylist(n,e.id)]]:[]].map(([l,d,y])=>s.jsxs("button",{onClick:()=>u(y),children:[s.jsx(l,{size:18}),d]},d))})})]})}export{z as T,H as a};
