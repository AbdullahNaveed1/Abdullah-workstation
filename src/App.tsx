import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Scene from "./scene";
import { ModuleId, projects, skills, experience } from "./data";

type AppState = "BOOT"|"WORLD"|"OPEN";

function CameraRig({target,reducedMotion}:{target:ModuleId|null;reducedMotion:boolean}){
  const {camera}=useThree();
  const destination=useRef(new THREE.Vector3(0,0,11));
  const look=useRef(new THREE.Vector3(0,0,0));
  useEffect(()=>{
    const positions:Record<string,[number,number,number]>={
      about:[-7,3.2,0],projects:[0,3.8,0],gameforge:[7.2,2.2,0],deadend:[-6.2,-1.4,-1],
      flappy:[6.1,-2.3,-1],skills:[-7.5,-3.8,1],experience:[7.4,-3.7,1],resume:[0,-4.2,2],
      contact:[0,1.1,2],core:[0,0,3]
    };
    const p=target?positions[target]:[0,0,11];
    destination.current.set(...p);
    look.current.set(...(target?positions[target]:[0,0,0]));
  },[target]);
  useFrame((_,d)=>{
    const speed=reducedMotion?1:Math.min(1,d*3.2);
    camera.position.lerp(destination.current,speed);
    const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(camera.position,look.current,camera.up));
    camera.quaternion.slerp(q,reducedMotion?1:Math.min(1,d*3));
  });
  return null;
}

function Boot({onEnter}:{onEnter:()=>void}){
  const [p,setP]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setP(v=>Math.min(100,v+Math.floor(Math.random()*9+4))),130);return()=>clearInterval(t)},[]);
  return <div className="boot">
    <div className="boot-grid"/>
    <div className="bootbox">
      <div className="eyebrow">ABN // WORKSTATION BOOT SEQUENCE</div>
      <h1>ABDULLAH<span>_OS</span></h1>
      <div className="boot-lines">
        <div>SYSTEM INITIALIZING... <b>OK</b></div>
        <div>LOADING 3D ENVIRONMENT... <b>{p}%</b></div>
        <div>LOADING GAME SYSTEMS... <b>OK</b></div>
        <div>LOADING BACKEND MODULE... <b>OK</b></div>
        <div>ESTABLISHING CONNECTION... <b>OK</b></div>
      </div>
      <div className="progress"><i style={{width:`${p}%`}}/></div>
      <div className="boot-role">UNITY GAMEPLAY // BACKEND DEVELOPMENT // 3D SYSTEMS</div>
      <button disabled={p<100} onClick={onEnter}>{p<100?"SYSTEM LOADING...":"ENTER WORKSTATION  ↵"}</button>
    </div>
  </div>
}

function HUD({onCommand,onMap,quality,setQuality,mute,setMute}:{onCommand:()=>void;onMap:()=>void;quality:string;setQuality:(x:string)=>void;mute:boolean;setMute:(x:boolean)=>void}){
  return <div className="hud">
    <div className="hud-tl"><b>ABDULLAH NAVEED</b><span>DEVELOPER WORKSTATION</span></div>
    <div className="hud-tr"><span>SYSTEM</span><b className="online">● ONLINE</b></div>
    <div className="hud-bl">LOCATION: <b>LAHORE, PK</b></div>
    <div className="hud-br"><span>FPS</span> <b>{quality.toUpperCase()}</b></div>
    <div className="reticle">+</div>
    <div className="toolbar">
      <button onClick={onCommand}>CTRL+K <small>TERMINAL</small></button>
      <button onClick={onMap}>M <small>MODULE MAP</small></button>
      <button onClick={()=>setMute(!mute)}>{mute?"SOUND OFF":"SOUND ON"}</button>
      <select value={quality} onChange={e=>setQuality(e.target.value)}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
    </div>
  </div>
}

function Drawer({id,onClose}:{id:ModuleId;onClose:()=>void}){
  const [skill,setSkill]=useState(0);
  const [job,setJob]=useState(0);
  if(id==="about"||id==="core") return <Panel title="DEVELOPER PROFILE" onClose={onClose}>
    <h2>ABDULLAH NAVEED</h2><p className="lead">Unity Gameplay & Backend Developer building interactive game systems, gameplay mechanics, UI systems and backend infrastructure.</p>
    <div className="chips">{["Unity","C#","Gameplay Programming","Game Architecture","ASP.NET Core","REST APIs","PostgreSQL","Redis","Docker","3D Development"].map(x=><span>{x}</span>)}</div>
  </Panel>;
  if(id==="gameforge"||id==="deadend"||id==="flappy"){
    const p=projects[id];
    return <Panel title={p.title} subtitle={p.category} onClose={onClose}>
      <div className="console">{id==="gameforge" && <><div>GAMEFORGE CORE <b>ONLINE</b></div><div>DATABASE CONNECTED</div><div>REDIS ACTIVE</div><div>AUTH SERVICE ONLINE</div><div className="stream">POST /api/player/login <b>200 OK</b></div><div className="stream">POST /api/leaderboard/submit <b>200 OK</b></div><div className="stream">GET /api/leaderboard/top <b>200 OK</b></div></>}</div>
      <p className="lead">{p.description}</p><Section title="FEATURES"><div className="chips">{p.features.map(x=><span>{x}</span>)}</div></Section>
      <Section title="TECH STACK"><div className="chips">{p.tech.map(x=><span>{x}</span>)}</div></Section>
      {id==="flappy"&&<Flappy/>}
      <button className="primary" onClick={()=>alert("Project link can be connected here.")}>VIEW PROJECT</button>
    </Panel>
  }
  if(id==="skills") return <Panel title="SKILLS REACTOR" subtitle="SELECT A TECHNOLOGY NODE" onClose={onClose}>
    <div className="skill-layout"><div className="skill-list">{skills.map(([n])=><button className={skill===skills.findIndex(s=>s[0]===n)?"selected":""} onClick={()=>setSkill(skills.findIndex(s=>s[0]===n))}>{n}</button>)}</div><div className="skill-detail"><div className="eyebrow">MODULE // {skills[skill][0]}</div><h2>{skills[skill][0]}</h2><p>{skills[skill][1]}</p></div></div>
  </Panel>;
  if(id==="experience") return <Panel title="CAREER TIMELINE" subtitle="PROFESSIONAL DEVELOPMENT HISTORY" onClose={onClose}>
    <div className="timeline">{experience.map((e,i)=><button className={job===i?"job active":"job"} onClick={()=>setJob(i)}><b>{e.year}</b><span>{e.company}</span><small>{e.role}</small>{job===i&&<p>{e.text}</p>}</button>)}</div>
  </Panel>;
  if(id==="resume") return <Panel title="RESUME // FULL VIEW" onClose={onClose}>
    <div className="resume"><h1>ABDULLAH NAVEED</h1><h3>UNITY GAMEPLAY & BACKEND DEVELOPER</h3><hr/><h4>PROFILE</h4><p>Game-focused developer working across Unity/C#, Unreal/C++, backend APIs and 3D development.</p><h4>SKILLS</h4><p>Unity · C# · Unreal Engine · C++ · ASP.NET Core · PostgreSQL · Redis · Docker · Git · Blender · REST APIs</p><h4>PROJECTS</h4><p>GameForge · Dead End Survival · Flappy Bird</p><h4>EXPERIENCE</h4><p>Venda Agency · Yobro Studios · Telos Solutions · Digitaliom Studios</p></div>
    <a className="primary link" href="/Abdullah-Naveed-CV.pdf" download>DOWNLOAD CV</a>
  </Panel>;
  if(id==="contact") return <Panel title="ESTABLISH CONNECTION" subtitle="COMMUNICATION TERMINAL" onClose={onClose}>
    <div className="contact-copy"><h2>AVAILABLE FOR</h2><p>UNITY DEVELOPMENT<br/>GAMEPLAY PROGRAMMING<br/>BACKEND DEVELOPMENT<br/>GAME SYSTEMS<br/>3D DEVELOPMENT</p></div>
    <form onSubmit={e=>{e.preventDefault();alert("Transmission prepared. Connect this form to your preferred email endpoint.")}}><input placeholder="NAME" required/><input placeholder="EMAIL" type="email" required/><textarea placeholder="MESSAGE" required/><button className="primary">SEND TRANSMISSION</button></form>
    <div className="socials"><a href="#">EMAIL</a><a href="#">LINKEDIN</a><a href="#">GITHUB</a></div>
    <p className="lead">Let's build something worth playing.</p>
  </Panel>;
  return null;
}

function Section({title,children}:{title:string;children:React.ReactNode}){return <section><div className="section-title">{title}</div>{children}</section>}
function Panel({title,subtitle,children,onClose}:{title:string;subtitle?:string;children:React.ReactNode;onClose:()=>void}){
 return <div className="drawer"><div className="drawer-head"><div><div className="eyebrow">ABDULLAH_OS // INTERFACE</div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><button onClick={onClose}>ESC ×</button></div><div className="drawer-body">{children}</div></div>
}

function Flappy(){
 const [score,setScore]=useState(0);
 return <div className="flappy"><div className="flappy-screen"><span>SCORE: {String(score).padStart(3,"0")}</span><div className="bird">◆</div><div className="pipe top"/><div className="pipe bottom"/></div><button onClick={()=>setScore(score+1)}>SPACE / CLICK — PLAY AGAIN</button></div>
}

function Terminal({onClose,onOpen}:{onClose:()=>void;onOpen:(id:ModuleId)=>void}){
 const [input,setInput]=useState("");const [logs,setLogs]=useState(["ABDULLAH_OS TERMINAL","Type help for available commands."]);
 const run=(v:string)=>{const x=v.trim().toLowerCase();let out:string[]=[];if(x==="help")out=["help about projects skills experience gameforge contact clear"];else if(x==="projects")out=["DEAD END SURVIVAL","GAMEFORGE","FLAPPY BIRD"];else if(x==="about"){onOpen("about");return}else if(x==="gameforge"){onOpen("gameforge");return}else if(x==="skills"){onOpen("skills");return}else if(x==="experience"){onOpen("experience");return}else if(x==="contact"){onOpen("contact");return}else if(x==="clear"){setLogs([]);return}else out=[`command not found: ${x}`];setLogs(l=>[...l,"> "+v,...out]);setInput("")};
 return <div className="terminal"><div className="terminal-head">ABDULLAH_OS TERMINAL <button onClick={onClose}>×</button></div><div className="terminal-body">{logs.map(x=><div>{x}</div>)}<div className="prompt">› <input autoFocus value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run(input)}/></div></div></div>
}

function Map({onClose,onOpen}:{onClose:()=>void;onOpen:(id:ModuleId)=>void}){
 const nodes:[string,ModuleId][]=[["ABOUT","about"],["PROJECTS","projects"],["GAMEFORGE","gameforge"],["DEAD END","deadend"],["FLAPPY","flappy"],["SKILLS","skills"],["EXPERIENCE","experience"],["RESUME","resume"],["CONTACT","contact"]];
 return <div className="map"><div className="map-head">MODULE MAP <button onClick={onClose}>×</button></div><div className="map-core">PLAYER</div>{nodes.map(([n,id],i)=><button style={{left:`${15+(i%3)*35}%`,top:`${18+Math.floor(i/3)*25}%`}} onClick={()=>onOpen(id)}>{n}</button>)}</div>
}

export default function App(){
 const [state,setState]=useState<AppState>("BOOT");const [active,setActive]=useState<ModuleId|null>(null);const [terminal,setTerminal]=useState(false);const [map,setMap]=useState(false);const [quality,setQuality]=useState("HIGH");const [mute,setMute]=useState(true);const [reduced,setReduced]=useState(false);
 const open=(id:ModuleId)=>{setMap(false);setTerminal(false);setActive(id);};
 const close=()=>setActive(null);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){setTerminal(false);setMap(false);setActive(null)}if(e.key==="m"&&!e.ctrlKey){setMap(v=>!v)}if((e.key==="k"&&e.ctrlKey)||e.key==="~"){e.preventDefault();setTerminal(v=>!v)}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[]);
 if(state==="BOOT")return <Boot onEnter={()=>setState("WORLD")}/>;
 return <main className={quality==="LOW"?"low":quality==="MEDIUM"?"medium":""}>
   <Canvas camera={{position:[0,0,11],fov:48}} dpr={quality==="HIGH"?[1,2]:quality==="MEDIUM"?1.25:1} gl={{antialias:true}}>
    <CameraRig target={active} reducedMotion={reduced}/>
    <Scene onOpen={open} reducedMotion={reduced}/>
    <EffectComposer enabled={quality!=="LOW"}><Bloom intensity={quality==="HIGH"?0.65:0.35} luminanceThreshold={0.75} mipmapBlur/><Vignette darkness={0.72}/></EffectComposer>
   </Canvas>
   <HUD onCommand={()=>setTerminal(true)} onMap={()=>setMap(true)} quality={quality} setQuality={setQuality} mute={mute} setMute={setMute}/>
   {active&&<Drawer id={active} onClose={close}/>}
   {terminal&&<Terminal onClose={()=>setTerminal(false)} onOpen={open}/>}
   {map&&<Map onClose={()=>setMap(false)} onOpen={open}/>}
   <div className="access"><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> REDUCE MOTION</label></div>
 </main>
}