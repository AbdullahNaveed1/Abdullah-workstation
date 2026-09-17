export type ModuleId =
  | "core" | "about" | "projects" | "gameforge" | "deadend"
  | "flappy" | "skills" | "experience" | "resume" | "contact";

export const modules = [
  { id: "about" as ModuleId, label: "ABOUT", position: [-7, 3.2, -2.5] as [number,number,number] },
  { id: "projects" as ModuleId, label: "PROJECTS", position: [0, 3.8, -8] as [number,number,number] },
  { id: "gameforge" as ModuleId, label: "GAMEFORGE", position: [7.2, 2.2, -2] as [number,number,number] },
  { id: "deadend" as ModuleId, label: "DEAD END SURVIVAL", position: [-6.2, -1.4, -5.2] as [number,number,number] },
  { id: "flappy" as ModuleId, label: "FLAPPY BIRD", position: [6.1, -2.3, -5.8] as [number,number,number] },
  { id: "skills" as ModuleId, label: "SKILLS", position: [-7.5, -3.8, 2] as [number,number,number] },
  { id: "experience" as ModuleId, label: "EXPERIENCE", position: [7.4, -3.7, 2.3] as [number,number,number] },
  { id: "resume" as ModuleId, label: "RESUME", position: [0, -4.2, 4.8] as [number,number,number] },
  { id: "contact" as ModuleId, label: "CONTACT", position: [0, 1.1, 6.6] as [number,number,number] },
];

export const projects = {
  gameforge: {
    title: "GAMEFORGE",
    category: "GAME BACKEND AS A SERVICE",
    description: "Backend infrastructure for Unity and Unreal games, designed around authentication, player data, progression and competitive systems.",
    tech: ["ASP.NET Core", "C#", "PostgreSQL", "Redis", "Docker", "REST API"],
    features: ["Authentication","Player Accounts","Player Data","Inventory","Progression","Leaderboards","Analytics","API Keys","Unity Integration","Unreal Integration"],
    role: ["Backend Architecture","API Development","Game Integration"],
  },
  deadend: {
    title: "DEAD END SURVIVAL",
    category: "UE5 // C++ // BLUEPRINTS",
    description: "A dark medieval zombie-survival experience built around combat, character systems, ballistics and atmospheric exploration.",
    tech: ["Unreal Engine 5","C++","Blueprints","Enhanced Input","Character Systems","Combat","Raycast Ballistics","Animation Systems"],
    features: ["Gameplay","Combat","Character","World","Technical Systems"],
    role: ["Gameplay Engineering","Systems Development"],
  },
  flappy: {
    title: "FLAPPY BIRD",
    category: "UNITY // C#",
    description: "A compact arcade project focused on responsive input, scoring, game-state flow and a clean gameplay loop.",
    tech: ["Unity","C#","Input","UI","Game State"],
    features: ["Tap / Space Input","Score System","Best Score","Restart Loop"],
    role: ["Unity Gameplay Developer"],
  }
};

export const skills = [
  ["UNITY","Gameplay programming, UI systems, character systems, 2D/3D development, optimization and backend integration."],
  ["C#","Game architecture, gameplay logic, services, data flow and reusable systems."],
  ["UNREAL ENGINE","Third-person gameplay, Enhanced Input, Blueprint systems and C++ development."],
  ["C++","Core gameplay and systems programming for Unreal projects."],
  ["ASP.NET CORE","REST APIs and backend services for game-oriented systems."],
  ["POSTGRESQL","Relational game data, player records and backend persistence."],
  ["REDIS","Fast-access state, caching and backend infrastructure."],
  ["DOCKER","Containerized local development for API and database services."],
  ["GIT","Version control, branching, releases and project workflow."],
  ["BLENDER","3D assets, environments, materials, lighting and generalist workflows."],
  ["REST APIs","Client-server communication and Unity/Unreal integration."],
  ["GAME SYSTEMS","Gameplay loops, UI, progression, combat and interactive architecture."]
];

export const experience = [
  { year:"2026", company:"VENDA AGENCY", role:"3D GENERALIST", text:"3D assets, environments, lighting, materials and Blender production." },
  { year:"2025", company:"YOBRO STUDIOS", role:"JUNIOR UNITY DEVELOPER", text:"2D/3D game development, gameplay implementation, collaboration with artists and Unity optimization." },
  { year:"2021–2022", company:"TELOS SOLUTIONS", role:"IT TECHNICIAN", text:"Technical support, systems operations and back-office technology work." },
  { year:"", company:"DIGITALIOM STUDIOS", role:"UNITY DEVELOPMENT INTERN", text:"Three-month internship focused on hypercasual Unity development and core gameplay systems." }
];