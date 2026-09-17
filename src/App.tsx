import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Scene from "./scene";
import { ModuleId, projects, skills, experience } from "./data";

type AppState = "BOOT" | "WORLD" | "OPEN";

type CameraPosition = [number, number, number];

function CameraRig({
  target,
  reducedMotion,
}: {
  target: ModuleId | null;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();

  const destination = useRef(new THREE.Vector3(0, 0, 11));

  const look = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const positions: Record<string, CameraPosition> = {
      about: [-7, 3.2, 0],
      projects: [0, 3.8, 0],
      gameforge: [7.2, 2.2, 0],
      deadend: [-6.2, -1.4, -1],
      flappy: [6.1, -2.3, -1],
      skills: [-7.5, -3.8, 1],
      experience: [7.4, -3.7, 1],
      resume: [0, -4.2, 2],
      contact: [0, 1.1, 2],
      core: [0, 0, 3],
    };

    const p: CameraPosition = target ? positions[target] : [0, 0, 11];

    if (p) {
      destination.current.set(p[0], p[1], p[2]);
    }

    const targetPosition: CameraPosition = target
      ? positions[target]
      : [0, 0, 0];

    if (targetPosition) {
      look.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    }
  }, [target]);

  useFrame((_, delta) => {
    const speed = reducedMotion ? 1 : Math.min(1, delta * 3.2);

    camera.position.lerp(destination.current, speed);

    const matrix = new THREE.Matrix4().lookAt(
      camera.position,
      look.current,
      camera.up,
    );

    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);

    camera.quaternion.slerp(
      quaternion,
      reducedMotion ? 1 : Math.min(1, delta * 3),
    );
  });

  return null;
}

function Boot({ onEnter }: { onEnter: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((value) =>
        Math.min(100, value + Math.floor(Math.random() * 9 + 4)),
      );
    }, 130);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="boot">
      <div className="boot-grid" />

      <div className="bootbox">
        <div className="eyebrow">ABN // WORKSTATION BOOT SEQUENCE</div>

        <h1>
          ABDULLAH<span>_OS</span>
        </h1>

        <div className="boot-lines">
          <div>
            SYSTEM INITIALIZING... <b>OK</b>
          </div>

          <div>
            LOADING 3D ENVIRONMENT... <b>{progress}%</b>
          </div>

          <div>
            LOADING GAME SYSTEMS... <b>OK</b>
          </div>

          <div>
            LOADING BACKEND MODULE... <b>OK</b>
          </div>

          <div>
            ESTABLISHING CONNECTION... <b>OK</b>
          </div>
        </div>

        <div className="progress">
          <i
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="boot-role">
          UNITY GAMEPLAY // BACKEND DEVELOPMENT // 3D SYSTEMS
        </div>

        <button disabled={progress < 100} onClick={onEnter}>
          {progress < 100 ? "SYSTEM LOADING..." : "ENTER WORKSTATION  ↵"}
        </button>
      </div>
    </div>
  );
}

function HUD({
  onCommand,
  onMap,
  quality,
  setQuality,
  mute,
  setMute,
}: {
  onCommand: () => void;
  onMap: () => void;
  quality: string;
  setQuality: (value: string) => void;
  mute: boolean;
  setMute: (value: boolean) => void;
}) {
  return (
    <div className="hud">
      <div className="hud-tl">
        <b>ABDULLAH NAVEED</b>
        <span>DEVELOPER WORKSTATION</span>
      </div>

      <div className="hud-tr">
        <span>SYSTEM</span>
        <b className="online">● ONLINE</b>
      </div>

      <div className="hud-bl">
        LOCATION: <b>LAHORE, PK</b>
      </div>

      <div className="hud-br">
        <span>FPS</span> <b>{quality.toUpperCase()}</b>
      </div>

      <div className="reticle">+</div>

      <div className="toolbar">
        <button onClick={onCommand}>
          CTRL+K <small>TERMINAL</small>
        </button>

        <button onClick={onMap}>
          M <small>MODULE MAP</small>
        </button>

        <button onClick={() => setMute(!mute)}>
          {mute ? "SOUND OFF" : "SOUND ON"}
        </button>

        <select
          value={quality}
          onChange={(event) => setQuality(event.target.value)}
        >
          <option>HIGH</option>
          <option>MEDIUM</option>
          <option>LOW</option>
        </select>
      </div>
    </div>
  );
}

function Drawer({ id, onClose }: { id: ModuleId; onClose: () => void }) {
  const [skill, setSkill] = useState(0);
  const [job, setJob] = useState(0);

  if (id === "about" || id === "core") {
    return (
      <Panel title="DEVELOPER PROFILE" onClose={onClose}>
        <h2>ABDULLAH NAVEED</h2>

        <p className="lead">
          Unity Gameplay & Backend Developer building interactive game systems,
          gameplay mechanics, UI systems and backend infrastructure.
        </p>

        <div className="chips">
          {[
            "Unity",
            "C#",
            "Gameplay Programming",
            "Game Architecture",
            "ASP.NET Core",
            "REST APIs",
            "PostgreSQL",
            "Redis",
            "Docker",
            "3D Development",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Panel>
    );
  }

  if (id === "gameforge" || id === "deadend" || id === "flappy") {
    const project = projects[id];

    return (
      <Panel
        title={project.title}
        subtitle={project.category}
        onClose={onClose}
      >
        <div className="console">
          {id === "gameforge" && (
            <>
              <div>
                GAMEFORGE CORE <b>ONLINE</b>
              </div>

              <div>DATABASE CONNECTED</div>
              <div>REDIS ACTIVE</div>
              <div>AUTH SERVICE ONLINE</div>

              <div className="stream">
                POST /api/player/login <b>200 OK</b>
              </div>

              <div className="stream">
                POST /api/leaderboard/submit <b>200 OK</b>
              </div>

              <div className="stream">
                GET /api/leaderboard/top <b>200 OK</b>
              </div>
            </>
          )}
        </div>

        <p className="lead">{project.description}</p>

        <Section title="FEATURES">
          <div className="chips">
            {project.features.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Section>

        <Section title="TECH STACK">
          <div className="chips">
            {project.tech.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Section>

        {id === "flappy" && <Flappy />}

        <button
          className="primary"
          onClick={() => alert("Project link can be connected here.")}
        >
          VIEW PROJECT
        </button>
      </Panel>
    );
  }

  if (id === "skills") {
    return (
      <Panel
        title="SKILLS REACTOR"
        subtitle="SELECT A TECHNOLOGY NODE"
        onClose={onClose}
      >
        <div className="skill-layout">
          <div className="skill-list">
            {skills.map(([name], index) => (
              <button
                key={name}
                className={skill === index ? "selected" : ""}
                onClick={() => setSkill(index)}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="skill-detail">
            <div className="eyebrow">MODULE // {skills[skill][0]}</div>

            <h2>{skills[skill][0]}</h2>

            <p>{skills[skill][1]}</p>
          </div>
        </div>
      </Panel>
    );
  }

  if (id === "experience") {
    return (
      <Panel
        title="CAREER TIMELINE"
        subtitle="PROFESSIONAL DEVELOPMENT HISTORY"
        onClose={onClose}
      >
        <div className="timeline">
          {experience.map((item, index) => (
            <button
              key={`${item.company}-${item.year}`}
              className={job === index ? "job active" : "job"}
              onClick={() => setJob(index)}
            >
              <b>{item.year}</b>
              <span>{item.company}</span>
              <small>{item.role}</small>

              {job === index && <p>{item.text}</p>}
            </button>
          ))}
        </div>
      </Panel>
    );
  }

  if (id === "resume") {
    return (
      <Panel title="RESUME // FULL VIEW" onClose={onClose}>
        <div className="resume">
          <h1>ABDULLAH NAVEED</h1>

          <h3>UNITY GAMEPLAY & BACKEND DEVELOPER</h3>

          <hr />

          <h4>PROFILE</h4>

          <p>
            Game-focused developer working across Unity/C#, Unreal/C++, backend
            APIs and 3D development.
          </p>

          <h4>SKILLS</h4>

          <p>
            Unity · C# · Unreal Engine · C++ · ASP.NET Core · PostgreSQL · Redis
            · Docker · Git · Blender · REST APIs
          </p>

          <h4>PROJECTS</h4>

          <p>GameForge · Dead End Survival · Flappy Bird</p>

          <h4>EXPERIENCE</h4>

          <p>
            Venda Agency · Yobro Studios · Telos Solutions · Digitaliom Studios
          </p>
        </div>

        <a className="primary link" href="/Abdullah-Naveed-CV.pdf" download>
          DOWNLOAD CV
        </a>
      </Panel>
    );
  }

  if (id === "contact") {
    return (
      <Panel
        title="ESTABLISH CONNECTION"
        subtitle="COMMUNICATION TERMINAL"
        onClose={onClose}
      >
        <div className="contact-copy">
          <h2>AVAILABLE FOR</h2>

          <p>
            UNITY DEVELOPMENT
            <br />
            GAMEPLAY PROGRAMMING
            <br />
            BACKEND DEVELOPMENT
            <br />
            GAME SYSTEMS
            <br />
            3D DEVELOPMENT
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            alert(
              "Transmission prepared. Connect this form to your preferred email endpoint.",
            );
          }}
        >
          <input placeholder="NAME" required />

          <input placeholder="EMAIL" type="email" required />

          <textarea placeholder="MESSAGE" required />

          <button className="primary">SEND TRANSMISSION</button>
        </form>

        <div className="socials">
          <a href="#">EMAIL</a>
          <a href="#">LINKEDIN</a>
          <a href="#">GITHUB</a>
        </div>

        <p className="lead">Let's build something worth playing.</p>
      </Panel>
    );
  }

  return null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="section-title">{title}</div>

      {children}
    </section>
  );
}

function Panel({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="drawer">
      <div className="drawer-head">
        <div>
          <div className="eyebrow">ABDULLAH_OS // INTERFACE</div>

          <h1>{title}</h1>

          {subtitle && <p>{subtitle}</p>}
        </div>

        <button onClick={onClose}>ESC ×</button>
      </div>

      <div className="drawer-body">{children}</div>
    </div>
  );
}

function Flappy() {
  const [score, setScore] = useState(0);

  return (
    <div className="flappy">
      <div className="flappy-screen">
        <span>SCORE: {String(score).padStart(3, "0")}</span>

        <div className="bird">◆</div>

        <div className="pipe top" />
        <div className="pipe bottom" />
      </div>

      <button onClick={() => setScore((value) => value + 1)}>
        SPACE / CLICK — PLAY AGAIN
      </button>
    </div>
  );
}

function Terminal({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (id: ModuleId) => void;
}) {
  const [input, setInput] = useState("");

  const [logs, setLogs] = useState<string[]>([
    "ABDULLAH_OS TERMINAL",
    "Type help for available commands.",
  ]);

  const run = (value: string) => {
    const command = value.trim().toLowerCase();

    let output: string[] = [];

    if (command === "help") {
      output = [
        "help about projects skills experience gameforge contact clear",
      ];
    } else if (command === "projects") {
      output = ["DEAD END SURVIVAL", "GAMEFORGE", "FLAPPY BIRD"];
    } else if (command === "about") {
      onOpen("about");
      return;
    } else if (command === "gameforge") {
      onOpen("gameforge");
      return;
    } else if (command === "skills") {
      onOpen("skills");
      return;
    } else if (command === "experience") {
      onOpen("experience");
      return;
    } else if (command === "contact") {
      onOpen("contact");
      return;
    } else if (command === "clear") {
      setLogs([]);
      setInput("");
      return;
    } else {
      output = [`command not found: ${command}`];
    }

    setLogs((current) => [...current, `> ${value}`, ...output]);

    setInput("");
  };

  return (
    <div className="terminal">
      <div className="terminal-head">
        ABDULLAH_OS TERMINAL
        <button onClick={onClose}>×</button>
      </div>

      <div className="terminal-body">
        {logs.map((item, index) => (
          <div key={`${item}-${index}`}>{item}</div>
        ))}

        <div className="prompt">
          ›{" "}
          <input
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                run(input);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Map({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (id: ModuleId) => void;
}) {
  const nodes: [string, ModuleId][] = [
    ["ABOUT", "about"],
    ["PROJECTS", "projects"],
    ["GAMEFORGE", "gameforge"],
    ["DEAD END", "deadend"],
    ["FLAPPY", "flappy"],
    ["SKILLS", "skills"],
    ["EXPERIENCE", "experience"],
    ["RESUME", "resume"],
    ["CONTACT", "contact"],
  ];

  return (
    <div className="map">
      <div className="map-head">
        MODULE MAP
        <button onClick={onClose}>×</button>
      </div>

      <div className="map-core">PLAYER</div>

      {nodes.map(([name, id], index) => (
        <button
          key={id}
          style={{
            left: `${15 + (index % 3) * 35}%`,
            top: `${18 + Math.floor(index / 3) * 25}%`,
          }}
          onClick={() => onOpen(id)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>("BOOT");

  const [active, setActive] = useState<ModuleId | null>(null);

  const [terminal, setTerminal] = useState(false);

  const [map, setMap] = useState(false);

  const [quality, setQuality] = useState("HIGH");

  const [mute, setMute] = useState(true);

  const [reduced, setReduced] = useState(false);

  const open = (id: ModuleId) => {
    setMap(false);
    setTerminal(false);
    setActive(id);
  };

  const close = () => {
    setActive(null);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTerminal(false);
        setMap(false);
        setActive(null);
      }

      if (event.key.toLowerCase() === "m" && !event.ctrlKey) {
        setMap((value) => !value);
      }

      if (
        (event.key.toLowerCase() === "k" && event.ctrlKey) ||
        event.key === "~"
      ) {
        event.preventDefault();

        setTerminal((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (state === "BOOT") {
    return <Boot onEnter={() => setState("WORLD")} />;
  }

  return (
    <main
      className={
        quality === "LOW" ? "low" : quality === "MEDIUM" ? "medium" : ""
      }
    >
      <Canvas
        camera={{
          position: [0, 0, 11],
          fov: 48,
        }}
        dpr={quality === "HIGH" ? [1, 2] : quality === "MEDIUM" ? 1.25 : 1}
        gl={{
          antialias: true,
        }}
      >
        <CameraRig target={active} reducedMotion={reduced} />

        <Scene onOpen={open} reducedMotion={reduced} />

        <EffectComposer enabled={quality !== "LOW"}>
          <Bloom
            intensity={quality === "HIGH" ? 0.65 : 0.35}
            luminanceThreshold={0.75}
            mipmapBlur
          />

          <Vignette darkness={0.72} />
        </EffectComposer>
      </Canvas>

      <HUD
        onCommand={() => setTerminal(true)}
        onMap={() => setMap(true)}
        quality={quality}
        setQuality={setQuality}
        mute={mute}
        setMute={setMute}
      />

      {active && <Drawer id={active} onClose={close} />}

      {terminal && (
        <Terminal onClose={() => setTerminal(false)} onOpen={open} />
      )}

      {map && <Map onClose={() => setMap(false)} onOpen={open} />}

      <div className="access">
        <label>
          <input
            type="checkbox"
            checked={reduced}
            onChange={(event) => setReduced(event.target.checked)}
          />{" "}
          REDUCE MOTION
        </label>
      </div>
    </main>
  );
}
