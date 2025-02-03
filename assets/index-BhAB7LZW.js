import{c as f,j as o,g as P,a as B,r,u as M,s as L,b as A,d as v,e as R,S as $,f as F,m as G,h as I,i as z,k as O,l as T,n as y,C as E,G as k,D,B as H,T as S,o as N,L as V,p as W,F as U,q,A as K,t as _,v as Q,w as Y,x as J,y as X}from"./index-CvBylFaS.js";const Z=f(o.jsx("path",{d:"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}),"CheckBoxOutlineBlank"),ee=f(o.jsx("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"}),"CheckBox"),oe=f(o.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"}),"IndeterminateCheckBox");function te(e){return B("MuiCheckbox",e)}const j=P("MuiCheckbox",["root","checked","disabled","indeterminate","colorPrimary","colorSecondary","sizeSmall","sizeMedium"]),se=e=>{const{classes:t,indeterminate:s,color:i,size:d}=e,p={root:["root",s&&"indeterminate",`color${v(i)}`,`size${v(d)}`]},u=R(p,te,t);return{...t,...u}},ne=L($,{shouldForwardProp:e=>F(e)||e==="classes",name:"MuiCheckbox",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:s}=e;return[t.root,s.indeterminate&&t.indeterminate,t[`size${v(s.size)}`],s.color!=="default"&&t[`color${v(s.color)}`]]}})(G(({theme:e})=>({color:(e.vars||e).palette.text.secondary,variants:[{props:{color:"default",disableRipple:!1},style:{"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette.action.activeChannel} / ${e.vars.palette.action.hoverOpacity})`:I(e.palette.action.active,e.palette.action.hoverOpacity)}}},...Object.entries(e.palette).filter(z()).map(([t])=>({props:{color:t,disableRipple:!1},style:{"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette[t].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:I(e.palette[t].main,e.palette.action.hoverOpacity)}}})),...Object.entries(e.palette).filter(z()).map(([t])=>({props:{color:t},style:{[`&.${j.checked}, &.${j.indeterminate}`]:{color:(e.vars||e).palette[t].main},[`&.${j.disabled}`]:{color:(e.vars||e).palette.action.disabled}}})),{props:{disableRipple:!1},style:{"&:hover":{"@media (hover: none)":{backgroundColor:"transparent"}}}}]}))),ae=o.jsx(ee,{}),re=o.jsx(Z,{}),ie=o.jsx(oe,{}),ce=r.forwardRef(function(t,s){const i=M({props:t,name:"MuiCheckbox"}),{checkedIcon:d=ae,color:p="primary",icon:u=re,indeterminate:a=!1,indeterminateIcon:m=ie,inputProps:h,size:c="medium",disableRipple:x=!1,className:C,...g}=i,n=a?m:u,l=a?m:d,b={...i,disableRipple:x,color:p,indeterminate:a,size:c},w=se(b);return o.jsx(ne,{type:"checkbox",inputProps:{"data-indeterminate":a,...h},icon:r.cloneElement(n,{fontSize:n.props.fontSize??c}),checkedIcon:r.cloneElement(l,{fontSize:l.props.fontSize??c}),ownerState:b,ref:s,className:A(w.root,C),disableRipple:x,...g,classes:w})}),le=f(o.jsx("path",{d:"M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"}),"Google"),pe=()=>{const e=O(),[t,s]=r.useState(!1),[i,d]=r.useState(""),[p,u]=r.useState("success"),[a,m]=r.useState(!0),h=T(),c=y(h.breakpoints.down("sm"));y(h.breakpoints.between("sm","md")),y(h.breakpoints.up("md"));const x={network:"Login Failed: Network error, please check your connection.",popupClosed:"Login Failed: The sign-in popup was closed before completion.",cancelledRequest:"Login Failed: Another sign-in request was made before the first one was completed.",popupBlocked:"Login Failed: The sign-in popup was blocked by the browser. Please allow popups for this site.",unknown:"Login Failed: An unexpected error occurred."},C=async()=>{try{await _(e,a?Q:Y);const n=new J;await X(e,n),g("Successfully logged in with Google!","success")}catch(n){const l=n.code||"unknown",b=x[l]||x.unknown;g(b,"error")}},g=(n,l)=>{d(n),u(l),s(!0)};return o.jsxs(E,{maxWidth:"lg",sx:{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"},children:[o.jsxs(k,{container:!0,spacing:c?2:4,alignItems:"center",justifyContent:"center",children:[o.jsx(k,{item:!0,xs:12,md:6,sx:{textAlign:"center"},children:o.jsx("img",{src:"/ate-micr/nexlab-logo.png",alt:"ATE Logo",style:{width:600,marginBottom:20}})}),!c&&o.jsx(k,{item:!0,children:o.jsx(D,{orientation:"vertical",flexItem:!0})}),o.jsx(k,{item:!0,xs:12,md:6,sx:{textAlign:"center"},children:o.jsxs(H,{sx:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[o.jsx(S,{variant:"h6",component:"h2",gutterBottom:!0,children:"Welcome! Please sign in to get started."}),o.jsx(N,{variant:"contained",startIcon:o.jsx(le,{}),onClick:C,sx:{textTransform:"none",fontSize:"1rem",minWidth:"250px",boxShadow:"none","&:hover":{backgroundColor:"#357ae8",boxShadow:"0px 0px 10px rgba(0, 0, 0, 0.2)",transform:"scale(1.05)"},transition:"transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out"},children:"Google Authentication"}),o.jsxs(S,{variant:"body2",color:"textSecondary",sx:{marginBottom:2,textAlign:"center",maxWidth:300},children:["Note: Your email is only used for Google Authentication. No private information is collected in our database. For more details, please review our"," ",o.jsx(V,{href:"https://intofuture.org/nexlab-privacy.html",target:"_blank",rel:"noopener",underline:"hover",children:"Privacy Policy"}),"."]}),o.jsx(W,{title:"Keep you signed in on this device. Do not use on public or shared computers.",placement:"right",children:o.jsx(U,{control:o.jsx(ce,{checked:a,onChange:n=>m(n.target.checked)}),label:"Keep me signed in"})})]})})]}),o.jsx(q,{open:t,autoHideDuration:6e3,onClose:()=>s(!1),children:o.jsx(K,{onClose:()=>s(!1),severity:p,sx:{width:"100%"},children:o.jsx(S,{children:i})})})]})};export{pe as default};
