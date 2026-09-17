import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";

import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Text } from "@react-three/drei";

import * as THREE from "three";

import { ModuleId } from "./data";

/* =========================================================
   TYPES
========================================================= */

type SceneProps = {
  onOpen: (id: ModuleId) => void;
  reducedMotion?: boolean;
};

type MotionContextType = {
  reducedMotion: boolean;
};

const MotionContext = createContext<MotionContextType>({
  reducedMotion: false,
});

function useMotion() {
  return useContext(MotionContext);
}

/* =========================================================
   PLAYER STATE
========================================================= */

type PlayerState = {
  position: THREE.Vector3;
  rotation: number;
  velocityY: number;
  grounded: boolean;
  speed: number;
};

type PlayerContextType = {
  player: MutableRefObject<PlayerState>;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used inside PlayerContext");
  }

  return context;
}

/* =========================================================
   KEYBOARD INPUT
========================================================= */

function useKeyboard() {
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current[event.code] = true;
    };

    const up = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keys;
}

/* =========================================================
   INTERACTIVE MODULE
========================================================= */

function Interactive({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotion();

  const group = useRef<THREE.Group>(null);

  const hovered = useRef(false);

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;

    if (!reducedMotion) {
      group.current.position.y =
        position[1] + Math.sin(t * 1.2 + position[0]) * 0.12;

      group.current.rotation.y =
        rotation[1] + Math.sin(t * 0.45 + position[2]) * 0.025;
    }

    const targetScale = hovered.current ? scale * 1.08 : scale;

    group.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.12,
    );
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hovered.current = false;
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </group>
  );
}

/* =========================================================
   LABEL
========================================================= */

function Label({
  title,
  subtitle,
  position = [0, 0, 0],
}: {
  title: string;
  subtitle?: string;
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      <Text
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineWidth={0.012}
        outlineColor="#05070c"
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          position={[0, -0.32, 0]}
          fontSize={0.105}
          anchorX="center"
          anchorY="middle"
          color="#8d9aaa"
          outlineWidth={0.008}
          outlineColor="#05070c"
        >
          {subtitle}
        </Text>
      )}
    </group>
  );
}

/* =========================================================
   DEVELOPER CHARACTER
========================================================= */

function DeveloperCharacter() {
  const keys = useKeyboard();
  const { reducedMotion } = useMotion();
  const { player } = usePlayer();

  /*
    IMPORTANT:
    useThree() must be called inside the React component.
    This fixes the previous blank-screen issue.
  */
  const { camera } = useThree();

  const root = useRef<THREE.Group>(null);

  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);

  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);

  const jumpPressed = useRef(false);

  useFrame((state, delta) => {
    if (!root.current) return;

    const dt = Math.min(delta, 0.05);

    const forward = keys.current["KeyW"] || keys.current["ArrowUp"];

    const backward = keys.current["KeyS"] || keys.current["ArrowDown"];

    const left = keys.current["KeyA"] || keys.current["ArrowLeft"];

    const right = keys.current["KeyD"] || keys.current["ArrowRight"];

    const sprint = keys.current["ShiftLeft"] || keys.current["ShiftRight"];

    const moving = forward || backward || left || right;

    /* -----------------------------------------------------
       CAMERA DIRECTION
    ----------------------------------------------------- */

    const cameraDirection = new THREE.Vector3();

    camera.getWorldDirection(cameraDirection);

    cameraDirection.y = 0;

    if (cameraDirection.lengthSq() > 0.001) {
      cameraDirection.normalize();
    }

    const cameraRight = new THREE.Vector3(
      cameraDirection.z,
      0,
      -cameraDirection.x,
    );

    /* -----------------------------------------------------
       MOVEMENT
    ----------------------------------------------------- */

    const movement = new THREE.Vector3();

    if (forward) {
      movement.add(cameraDirection);
    }

    if (backward) {
      movement.sub(cameraDirection);
    }

    if (right) {
      movement.add(cameraRight);
    }

    if (left) {
      movement.sub(cameraRight);
    }

    if (movement.lengthSq() > 0.001) {
      movement.normalize();

      const targetSpeed = sprint ? 6.5 : 3.5;

      player.current.speed = THREE.MathUtils.lerp(
        player.current.speed,
        targetSpeed,
        1 - Math.pow(0.001, dt),
      );

      player.current.position.addScaledVector(
        movement,
        player.current.speed * dt,
      );

      /*
        Rotate character toward movement.
      */
      const targetRotation = Math.atan2(movement.x, movement.z);

      let rotationDifference = targetRotation - player.current.rotation;

      while (rotationDifference > Math.PI) {
        rotationDifference -= Math.PI * 2;
      }

      while (rotationDifference < -Math.PI) {
        rotationDifference += Math.PI * 2;
      }

      player.current.rotation += rotationDifference * Math.min(1, dt * 10);
    } else {
      player.current.speed = THREE.MathUtils.lerp(
        player.current.speed,
        0,
        1 - Math.pow(0.001, dt),
      );
    }

    /* -----------------------------------------------------
       JUMP
    ----------------------------------------------------- */

    const jump = keys.current["Space"];

    if (jump && !jumpPressed.current && player.current.grounded) {
      player.current.velocityY = 7.5;
      player.current.grounded = false;
    }

    jumpPressed.current = jump;

    /* -----------------------------------------------------
       GRAVITY
    ----------------------------------------------------- */

    player.current.velocityY -= 18 * dt;

    player.current.position.y += player.current.velocityY * dt;

    if (player.current.position.y <= 0) {
      player.current.position.y = 0;
      player.current.velocityY = 0;
      player.current.grounded = true;
    }

    /* -----------------------------------------------------
       APPLY PLAYER TRANSFORM
    ----------------------------------------------------- */

    root.current.position.copy(player.current.position);

    root.current.rotation.y = player.current.rotation;

    /* -----------------------------------------------------
       ANIMATION
    ----------------------------------------------------- */

    const speed = player.current.speed;

    const isWalking = speed > 0.2;

    const isRunning = speed > 5;

    const time = state.clock.elapsedTime;

    if (reducedMotion) {
      if (leftLeg.current) {
        leftLeg.current.rotation.x = 0;
      }

      if (rightLeg.current) {
        rightLeg.current.rotation.x = 0;
      }

      if (leftArm.current) {
        leftArm.current.rotation.x = 0;
      }

      if (rightArm.current) {
        rightArm.current.rotation.x = 0;
      }

      return;
    }

    /* -----------------------------------------------------
       IDLE BREATHING
    ----------------------------------------------------- */

    const breathing = Math.sin(time * 2.0) * 0.025;

    if (torso.current) {
      torso.current.position.y = 1.55 + breathing;
    }

    /* -----------------------------------------------------
       WALK / RUN CYCLE
    ----------------------------------------------------- */

    if (isWalking) {
      const animationSpeed = isRunning ? 10 : 7;

      const walkTime = time * animationSpeed;

      const legSwing = Math.sin(walkTime) * (isRunning ? 0.75 : 0.5);

      const armSwing = Math.sin(walkTime) * (isRunning ? 0.5 : 0.35);

      if (leftLeg.current) {
        leftLeg.current.rotation.x = legSwing;
      }

      if (rightLeg.current) {
        rightLeg.current.rotation.x = -legSwing;
      }

      if (leftArm.current) {
        leftArm.current.rotation.x = -armSwing;
      }

      if (rightArm.current) {
        rightArm.current.rotation.x = armSwing;
      }

      if (head.current) {
        head.current.rotation.y = Math.sin(time * 3) * 0.025;
      }
    } else {
      if (leftLeg.current) {
        leftLeg.current.rotation.x = THREE.MathUtils.lerp(
          leftLeg.current.rotation.x,
          0,
          0.15,
        );
      }

      if (rightLeg.current) {
        rightLeg.current.rotation.x = THREE.MathUtils.lerp(
          rightLeg.current.rotation.x,
          0,
          0.15,
        );
      }

      if (leftArm.current) {
        leftArm.current.rotation.x = THREE.MathUtils.lerp(
          leftArm.current.rotation.x,
          0,
          0.15,
        );
      }

      if (rightArm.current) {
        rightArm.current.rotation.x = THREE.MathUtils.lerp(
          rightArm.current.rotation.x,
          0,
          0.15,
        );
      }

      if (head.current) {
        head.current.rotation.y = Math.sin(time * 0.7) * 0.08;

        head.current.rotation.x = Math.sin(time * 0.45) * 0.025;
      }
    }

    /* -----------------------------------------------------
       JUMP ANIMATION
    ----------------------------------------------------- */

    if (!player.current.grounded) {
      const jumpPose = THREE.MathUtils.clamp(
        player.current.velocityY / 7.5,
        -1,
        1,
      );

      if (leftArm.current) {
        leftArm.current.rotation.x = -0.9 * jumpPose;
      }

      if (rightArm.current) {
        rightArm.current.rotation.x = -0.9 * jumpPose;
      }

      if (leftLeg.current) {
        leftLeg.current.rotation.x = 0.35;
      }

      if (rightLeg.current) {
        rightLeg.current.rotation.x = -0.35;
      }
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* ================================================
          SHADOW / CHARACTER BASE
      ================================================= */}

      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.06, 48]} />

        <meshStandardMaterial
          color="#10151c"
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0.065, 0]}>
        <torusGeometry args={[0.62, 0.025, 12, 48]} />

        <meshStandardMaterial
          color="#5e6878"
          emissive="#202938"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* ================================================
          LEGS
      ================================================= */}

      <group ref={leftLeg} position={[-0.22, 0.78, 0]}>
        <mesh position={[0, -0.38, 0]}>
          <boxGeometry args={[0.22, 0.72, 0.28]} />

          <meshStandardMaterial
            color="#151a22"
            metalness={0.65}
            roughness={0.32}
          />
        </mesh>

        <mesh position={[0, -0.78, 0.06]}>
          <boxGeometry args={[0.3, 0.18, 0.55]} />

          <meshStandardMaterial
            color="#080b10"
            metalness={0.8}
            roughness={0.28}
          />
        </mesh>
      </group>

      <group ref={rightLeg} position={[0.22, 0.78, 0]}>
        <mesh position={[0, -0.38, 0]}>
          <boxGeometry args={[0.22, 0.72, 0.28]} />

          <meshStandardMaterial
            color="#151a22"
            metalness={0.65}
            roughness={0.32}
          />
        </mesh>

        <mesh position={[0, -0.78, 0.06]}>
          <boxGeometry args={[0.3, 0.18, 0.55]} />

          <meshStandardMaterial
            color="#080b10"
            metalness={0.8}
            roughness={0.28}
          />
        </mesh>
      </group>

      {/* ================================================
          TORSO
      ================================================= */}

      <group ref={torso} position={[0, 1.55, 0]}>
        <mesh>
          <boxGeometry args={[0.72, 1.05, 0.42]} />

          <meshStandardMaterial
            color="#202733"
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>

        {/* chest plate */}

        <mesh position={[0, 0.08, 0.23]}>
          <boxGeometry args={[0.48, 0.58, 0.08]} />

          <meshStandardMaterial
            color="#303b4d"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* center light */}

        <mesh position={[0, 0.05, 0.29]}>
          <sphereGeometry args={[0.095, 20, 20]} />

          <meshStandardMaterial
            color="#e9edf3"
            emissive="#ffffff"
            emissiveIntensity={2}
            metalness={0.1}
            roughness={0.15}
          />
        </mesh>

        {/* belt */}

        <mesh position={[0, -0.42, 0]}>
          <boxGeometry args={[0.78, 0.12, 0.46]} />

          <meshStandardMaterial
            color="#0a0d12"
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
      </group>

      {/* ================================================
          LEFT ARM
      ================================================= */}

      <group ref={leftArm} position={[-0.52, 1.65, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.2, 0.62, 0.2]} />

          <meshStandardMaterial
            color="#161c26"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />

          <meshStandardMaterial
            color="#10151c"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
      </group>

      {/* ================================================
          RIGHT ARM
      ================================================= */}

      <group ref={rightArm} position={[0.52, 1.65, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.2, 0.62, 0.2]} />

          <meshStandardMaterial
            color="#161c26"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />

          <meshStandardMaterial
            color="#10151c"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
      </group>

      {/* ================================================
          HEAD
      ================================================= */}

      <group ref={head} position={[0, 2.35, 0]}>
        <mesh>
          <sphereGeometry args={[0.34, 32, 24]} />

          <meshStandardMaterial color="#c88d70" roughness={0.8} metalness={0} />
        </mesh>

        {/* hair */}

        <mesh position={[0, 0.22, -0.01]}>
          <sphereGeometry
            args={[0.35, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]}
          />

          <meshStandardMaterial color="#101318" roughness={0.55} />
        </mesh>

        {/* visor */}

        <mesh position={[0, 0, 0.31]}>
          <boxGeometry args={[0.42, 0.08, 0.025]} />

          <meshStandardMaterial
            color="#0b1017"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* neck */}

        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.22, 16]} />

          <meshStandardMaterial color="#b97861" roughness={0.8} />
        </mesh>
      </group>

      {/* ================================================
          BACKPACK
      ================================================= */}

      <mesh position={[0, 1.55, -0.28]}>
        <boxGeometry args={[0.55, 0.75, 0.18]} />

        <meshStandardMaterial
          color="#10151d"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>

      {/* ================================================
          NAME
      ================================================= */}

      <group position={[0, 3.0, 0]}>
        <Text
          fontSize={0.19}
          anchorX="center"
          anchorY="middle"
          color="#f3f5f8"
          outlineWidth={0.012}
          outlineColor="#05070c"
        >
          ABDULLAH
        </Text>

        <Text
          position={[0, -0.23, 0]}
          fontSize={0.075}
          anchorX="center"
          anchorY="middle"
          color="#8d98a9"
          outlineWidth={0.005}
          outlineColor="#05070c"
        >
          UNITY • BACKEND • GAMEPLAY
        </Text>
      </group>
    </group>
  );
}

/* =========================================================
   THIRD PERSON CAMERA
========================================================= */

function ThirdPersonCamera() {
  const { camera, gl } = useThree();
  const { player } = usePlayer();

  const yaw = useRef(0);
  const pitch = useRef(0.35);

  const distance = useRef(7);

  const dragging = useRef(false);

  const lastMouse = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const pointerDown = (event: PointerEvent) => {
      /*
        Only start camera orbit with middle mouse
        or right mouse.
      */
      if (event.button === 2 || event.button === 1) {
        dragging.current = true;

        lastMouse.current.x = event.clientX;
        lastMouse.current.y = event.clientY;
      }
    };

    const pointerMove = (event: PointerEvent) => {
      if (!dragging.current) return;

      const dx = event.clientX - lastMouse.current.x;

      const dy = event.clientY - lastMouse.current.y;

      lastMouse.current.x = event.clientX;

      lastMouse.current.y = event.clientY;

      yaw.current -= dx * 0.006;

      pitch.current -= dy * 0.004;

      pitch.current = THREE.MathUtils.clamp(pitch.current, -0.15, 1.1);
    };

    const pointerUp = () => {
      dragging.current = false;
    };

    const wheel = (event: WheelEvent) => {
      distance.current += event.deltaY * 0.005;

      distance.current = THREE.MathUtils.clamp(distance.current, 4.5, 11);
    };

    const contextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener("pointerdown", pointerDown);

    window.addEventListener("pointermove", pointerMove);

    window.addEventListener("pointerup", pointerUp);

    canvas.addEventListener("wheel", wheel, { passive: true });

    canvas.addEventListener("contextmenu", contextMenu);

    return () => {
      canvas.removeEventListener("pointerdown", pointerDown);

      window.removeEventListener("pointermove", pointerMove);

      window.removeEventListener("pointerup", pointerUp);

      canvas.removeEventListener("wheel", wheel);

      canvas.removeEventListener("contextmenu", contextMenu);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const target = player.current.position;

    /*
      Camera orbit position.
    */

    const horizontalDistance = Math.cos(pitch.current) * distance.current;

    const verticalDistance = Math.sin(pitch.current) * distance.current;

    const offsetX = Math.sin(yaw.current) * horizontalDistance;

    const offsetZ = Math.cos(yaw.current) * horizontalDistance;

    const desiredPosition = new THREE.Vector3(
      target.x + offsetX,
      target.y + 2.5 + verticalDistance,
      target.z + offsetZ,
    );

    camera.position.lerp(desiredPosition, 1 - Math.pow(0.001, delta));

    const lookAt = new THREE.Vector3(target.x, target.y + 1.25, target.z);

    camera.lookAt(lookAt);
  });

  return null;
}

/* =========================================================
   PLAYER HUD
========================================================= */

function PlayerHUD() {
  const { player } = usePlayer();

  const hud = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!hud.current) return;

    const speed = player.current.speed;

    const moving = speed > 0.2;

    hud.current.innerText = moving
      ? speed > 5
        ? "RUNNING"
        : "WALKING"
      : "IDLE";
  });

  /*
    This is rendered as HTML using drei's Html would be
    another option. We keep the scene clean here.
  */

  return null;
}

/* =========================================================
   ABOUT MODULE
========================================================= */

function AboutModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.4, 1.45, 0.18]} />

        <meshStandardMaterial
          color="#11161f"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2.18, 1.18, 0.025]} />

        <meshStandardMaterial
          color="#171d27"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      <Label
        title="ABOUT"
        subtitle="Developer Profile"
        position={[0, 0.15, 0.16]}
      />

      <Text
        position={[0, -0.35, 0.16]}
        fontSize={0.08}
        maxWidth={1.85}
        textAlign="center"
        color="#9ca7b8"
      >
        Unity gameplay, C#, backend systems and interactive game technology.
      </Text>
    </group>
  );
}

/* =========================================================
   GAMEFORGE MODULE
========================================================= */

function GameForgeModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.4, 1.45, 0.18]} />

        <meshStandardMaterial
          color="#101821"
          metalness={0.8}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[1.65, 0.75, 0.08]} />

        <meshStandardMaterial
          color="#1d2733"
          metalness={0.8}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, 0, 0.19]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.28, 0.045, 12, 32]} />

        <meshStandardMaterial
          color="#d9dee6"
          emissive="#707b8c"
          emissiveIntensity={0.6}
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>

      <Label
        title="GAMEFORGE"
        subtitle="ASP.NET Core • PostgreSQL • Redis"
        position={[0, -0.48, 0.18]}
      />
    </group>
  );
}

/* =========================================================
   DEAD END MODULE
========================================================= */

function DeadEndModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.35, 1.4, 0.18]} />

        <meshStandardMaterial
          color="#15161b"
          metalness={0.72}
          roughness={0.36}
        />
      </mesh>

      <mesh position={[0, 0.05, 0.14]}>
        <coneGeometry args={[0.35, 0.7, 6]} />

        <meshStandardMaterial
          color="#35343a"
          metalness={0.45}
          roughness={0.6}
        />
      </mesh>

      <Label
        title="DEAD END"
        subtitle="UE5 • Survival RPG"
        position={[0, -0.47, 0.17]}
      />
    </group>
  );
}

/* =========================================================
   FLAPPY MODULE
========================================================= */

function FlappyModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.35, 1.4, 0.18]} />

        <meshStandardMaterial
          color="#151a1d"
          metalness={0.7}
          roughness={0.34}
        />
      </mesh>

      <mesh position={[0, 0.05, 0.16]}>
        <sphereGeometry args={[0.28, 20, 20]} />

        <meshStandardMaterial
          color="#c7ccd2"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      <Label
        title="FLAPPY BIRD"
        subtitle="Unity • Gameplay"
        position={[0, -0.47, 0.17]}
      />
    </group>
  );
}

/* =========================================================
   SKILLS MODULE
========================================================= */

function SkillsModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.4, 1.45, 0.18]} />

        <meshStandardMaterial
          color="#131820"
          metalness={0.78}
          roughness={0.3}
        />
      </mesh>

      <Label
        title="SKILLS"
        subtitle="Unity • C# • UE5 • .NET"
        position={[0, 0.12, 0.17]}
      />

      <Text
        position={[0, -0.32, 0.17]}
        fontSize={0.07}
        maxWidth={1.9}
        textAlign="center"
        color="#8e9aaa"
      >
        Gameplay • APIs • UI • Systems • Git
      </Text>
    </group>
  );
}

/* =========================================================
   EXPERIENCE MODULE
========================================================= */

function ExperienceModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.4, 1.45, 0.18]} />

        <meshStandardMaterial
          color="#15191f"
          metalness={0.78}
          roughness={0.32}
        />
      </mesh>

      <Label
        title="EXPERIENCE"
        subtitle="Professional Timeline"
        position={[0, 0.12, 0.17]}
      />

      <Text
        position={[0, -0.32, 0.17]}
        fontSize={0.07}
        maxWidth={1.9}
        textAlign="center"
        color="#8e9aaa"
      >
        Unity • 3D • Backend • Technical Development
      </Text>
    </group>
  );
}

/* =========================================================
   RESUME MODULE
========================================================= */

function ResumeModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.3, 1.35, 0.18]} />

        <meshStandardMaterial
          color="#181b20"
          metalness={0.72}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0.03, 0.14]}>
        <boxGeometry args={[0.7, 0.8, 0.06]} />

        <meshStandardMaterial
          color="#d3d7dd"
          metalness={0.2}
          roughness={0.65}
        />
      </mesh>

      <Label
        title="RESUME"
        subtitle="CV / Download"
        position={[0, -0.45, 0.17]}
      />
    </group>
  );
}

/* =========================================================
   CONTACT MODULE
========================================================= */

function ContactModule() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.35, 1.35, 0.18]} />

        <meshStandardMaterial
          color="#151920"
          metalness={0.78}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 0.05, 0.14]}>
        <boxGeometry args={[0.85, 0.5, 0.08]} />

        <meshStandardMaterial color="#202833" metalness={0.8} roughness={0.2} />
      </mesh>

      <Label
        title="CONTACT"
        subtitle="Let's build something"
        position={[0, -0.43, 0.17]}
      />
    </group>
  );
}

/* =========================================================
   STARS
========================================================= */

function Stars() {
  const positions = useMemo(() => {
    const result: number[] = [];

    for (let i = 0; i < 900; i++) {
      const radius = 18 + Math.random() * 30;

      const theta = Math.random() * Math.PI * 2;

      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      result.push(
        Math.sin(phi) * Math.cos(theta) * radius,

        Math.cos(phi) * radius,

        Math.sin(phi) * Math.sin(theta) * radius,
      );
    }

    return new Float32Array(result);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>

      <pointsMaterial
        size={0.045}
        color="#aeb8c7"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

/* =========================================================
   GROUND
========================================================= */

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[60, 60]} />

        <meshStandardMaterial
          color="#07090d"
          roughness={0.86}
          metalness={0.18}
        />
      </mesh>

      <gridHelper args={[60, 60, "#20252e", "#10141b"]} position={[0, 0, 0]} />
    </group>
  );
}

/* =========================================================
   MAIN SCENE
========================================================= */

export default function Scene({ onOpen, reducedMotion = false }: SceneProps) {
  const player = useRef<PlayerState>({
    position: new THREE.Vector3(0, 0, 0),

    rotation: 0,

    velocityY: 0,

    grounded: true,

    speed: 0,
  });

  return (
    <MotionContext.Provider
      value={{
        reducedMotion,
      }}
    >
      <PlayerContext.Provider
        value={{
          player,
        }}
      >
        {/* =============================================
            LIGHTING
        ============================================== */}

        <color attach="background" args={["#05070b"]} />

        <fog attach="fog" args={["#05070b", 12, 42]} />

        <ambientLight intensity={0.8} />

        <directionalLight position={[5, 10, 5]} intensity={2} castShadow />

        <pointLight
          position={[0, 4, 0]}
          intensity={18}
          distance={14}
          color="#dfe6ef"
        />

        <pointLight
          position={[-8, 2, -5]}
          intensity={7}
          distance={15}
          color="#667386"
        />

        <pointLight
          position={[8, 2, -5]}
          intensity={7}
          distance={15}
          color="#7a8495"
        />

        {/* =============================================
            WORLD
        ============================================== */}

        <Ground />

        <Stars />

        {/* =============================================
            PLAYER
        ============================================== */}

        <DeveloperCharacter />

        <ThirdPersonCamera />

        <PlayerHUD />

        {/* =============================================
            PORTFOLIO MODULES
        ============================================== */}

        <Interactive
          position={[-4.8, 2.5, -1.5]}
          onClick={() => onOpen("about")}
        >
          <AboutModule />
        </Interactive>

        <Interactive
          position={[4.8, 2.5, -1.5]}
          onClick={() => onOpen("gameforge")}
        >
          <GameForgeModule />
        </Interactive>

        <Interactive
          position={[-5.2, -1.5, -2.8]}
          onClick={() => onOpen("deadend")}
        >
          <DeadEndModule />
        </Interactive>

        <Interactive
          position={[5.2, -1.5, -3]}
          onClick={() => onOpen("flappy")}
        >
          <FlappyModule />
        </Interactive>

        <Interactive
          position={[-4.7, -4.0, 0.8]}
          onClick={() => onOpen("skills")}
        >
          <SkillsModule />
        </Interactive>

        <Interactive
          position={[4.7, -4.0, 1.2]}
          onClick={() => onOpen("experience")}
        >
          <ExperienceModule />
        </Interactive>

        <Interactive position={[0, -4.1, 2.8]} onClick={() => onOpen("resume")}>
          <ResumeModule />
        </Interactive>

        {/* Contact is deliberately away from center */}

        <Interactive
          position={[7.0, 3.2, 0.5]}
          onClick={() => onOpen("contact")}
        >
          <ContactModule />
        </Interactive>
      </PlayerContext.Provider>
    </MotionContext.Provider>
  );
}
