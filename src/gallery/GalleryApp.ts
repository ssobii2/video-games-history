import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import type { Era, MuseumItem } from '../types';
import { ROOM_THEMES, type RoomTheme } from './themes';
import { placeholderCanvas } from '../art/placeholder';

export interface GalleryCallbacks {
  onInspect: (item: MuseumItem) => void;
  onInspectClosed: () => void;
}

interface Display {
  item: MuseumItem;
  group: THREE.Group;
  art: THREE.Mesh;
  /** Wall normal — the direction a visitor faces to look at this piece. */
  normal: THREE.Vector3;
  hitMeshes: THREE.Mesh[];
}

const HALL_W = 9;
const HALL_H = 4.6;
const SPACING = 4.6;
const EYE_Y = 1.7;
const WALK_SPEED = 5.2;

/**
 * One shared first-person gallery engine; the era themes do the set dressing.
 * Rail navigation: ←/→ (or A/D) walk the hall, mouse pans the view, click a
 * display to glide into inspection. ACES tone mapping + PCF soft shadows.
 */
export class GalleryApp {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private theme: RoomTheme;
  private displays: Display[] = [];
  private raycaster = new THREE.Raycaster();
  private pmrem?: THREE.PMREMGenerator;
  private hallLen: number;

  private yaw = 0;
  private pitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private moveDir = 0;
  private camX: number;
  private inspecting: Display | null = null;
  private transitioning = false;
  private savedPose: { pos: THREE.Vector3; yaw: number; pitch: number } | null = null;
  private flickerLights: THREE.Light[] = [];
  private baseIntensities = new Map<THREE.Light, number>();

  private rafId = 0;
  private clock = new THREE.Clock();
  private disposed = false;
  private abort = new AbortController();

  constructor(
    private container: HTMLElement,
    era: Era,
    items: MuseumItem[],
    private callbacks: GalleryCallbacks
  ) {
    this.theme = ROOM_THEMES[era.galleryTheme];
    const sorted = [...items].sort((a, b) => a.year - b.year);
    this.hallLen = Math.max(20, Math.ceil(sorted.length / 2) * SPACING + 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    this.camX = -this.hallLen / 2 + 2.5;
    this.camera.position.set(this.camX, EYE_Y, 0);

    this.scene.fog = new THREE.FogExp2(this.theme.fog.color, this.theme.fog.density);
    this.scene.background = new THREE.Color(this.theme.fog.color);

    if (this.theme.useEnvironment) {
      this.pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    }

    this.buildRoom();
    this.buildLights(sorted.length);
    this.buildDisplays(era, sorted);
    this.theme.dress(this.scene, this.hallLen, HALL_W, HALL_H);
    this.bindInput();

    // Dolly in from the doorway.
    this.transitioning = true;
    gsap.fromTo(
      this,
      { camX: -this.hallLen / 2 + 0.8 },
      {
        camX: -this.hallLen / 2 + 3.4,
        duration: 1.8,
        ease: 'power2.out',
        onComplete: () => {
          this.transitioning = false;
        },
      }
    );

    this.tick();
  }

  private buildRoom(): void {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(this.hallLen, HALL_W), this.theme.floor());
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(this.hallLen, HALL_W),
      new THREE.MeshStandardMaterial({ color: this.theme.ceilingColor, roughness: 1 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = HALL_H;
    this.scene.add(ceiling);

    const wallMat = this.theme.wall();
    const longWall = new THREE.PlaneGeometry(this.hallLen, HALL_H);
    const wallA = new THREE.Mesh(longWall, wallMat);
    wallA.position.set(0, HALL_H / 2, -HALL_W / 2);
    wallA.receiveShadow = true;
    const wallB = new THREE.Mesh(longWall, wallMat);
    wallB.position.set(0, HALL_H / 2, HALL_W / 2);
    wallB.rotation.y = Math.PI;
    wallB.receiveShadow = true;

    const endWallGeo = new THREE.PlaneGeometry(HALL_W, HALL_H);
    const endA = new THREE.Mesh(endWallGeo, wallMat);
    endA.position.set(-this.hallLen / 2, HALL_H / 2, 0);
    endA.rotation.y = Math.PI / 2;
    const endB = new THREE.Mesh(endWallGeo, wallMat);
    endB.position.set(this.hallLen / 2, HALL_H / 2, 0);
    endB.rotation.y = -Math.PI / 2;
    this.scene.add(wallA, wallB, endA, endB);
  }

  private buildLights(displayCount: number): void {
    const { hemi, ambient, keySpots } = this.theme;
    const h = new THREE.HemisphereLight(hemi.sky, hemi.ground, hemi.intensity);
    this.scene.add(h);
    const a = new THREE.AmbientLight(ambient.color, ambient.intensity);
    this.scene.add(a);
    if (this.theme.flicker) {
      this.flickerLights.push(h, a);
      this.baseIntensities.set(h, hemi.intensity);
      this.baseIntensities.set(a, ambient.intensity);
    }

    // A handful of museum key spots — shadows on the first two only.
    const spotCount = Math.min(6, Math.max(3, Math.ceil(displayCount / 4)));
    for (let i = 0; i < spotCount; i++) {
      const t = (i + 0.5) / spotCount;
      const x = -this.hallLen / 2 + t * this.hallLen;
      const spot = new THREE.SpotLight(
        keySpots.color,
        keySpots.intensity,
        14,
        Math.PI / 4.2,
        0.55,
        1.6
      );
      spot.position.set(x, HALL_H - 0.25, 0);
      spot.target.position.set(x, 1.2, i % 2 === 0 ? -HALL_W / 2 : HALL_W / 2);
      spot.castShadow = i < 2;
      if (spot.castShadow) {
        spot.shadow.mapSize.set(1024, 1024);
        spot.shadow.bias = -0.0004;
      }
      this.scene.add(spot, spot.target);
    }
  }

  private buildDisplays(era: Era, items: MuseumItem[]): void {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    items.forEach((item, i) => {
      const side = i % 2 === 0 ? -1 : 1; // -1 = north wall
      const slot = Math.floor(i / 2);
      const x = -this.hallLen / 2 + 4.5 + slot * SPACING;
      const z = side * (HALL_W / 2 - (item.kind === 'console' ? 1.05 : 0.12));
      const normal = new THREE.Vector3(0, 0, -side);

      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = side === -1 ? 0 : Math.PI;

      const hitMeshes: THREE.Mesh[] = [];
      let art: THREE.Mesh;

      if (item.kind === 'console') {
        // Pedestal piece: plinth + upright art card, museum-style.
        const plinth = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 1.05, 0.95),
          new THREE.MeshStandardMaterial({ color: this.theme.pedestalColor, roughness: 0.4, metalness: 0.2 })
        );
        plinth.position.y = 0.525;
        plinth.castShadow = true;
        plinth.receiveShadow = true;
        group.add(plinth);
        art = this.makeArtPlane(item, era, loader, 1.45, 1.15);
        art.position.set(0, 1.75, 0);
        art.rotation.x = -0.06;
        group.add(art);
        hitMeshes.push(plinth, art);
      } else {
        // Framed wall piece.
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 2.0, 0.09),
          new THREE.MeshStandardMaterial({ color: this.theme.frameColor, roughness: 0.5, metalness: 0.3 })
        );
        frame.position.set(0, 2.15, -0.05);
        frame.castShadow = true;
        group.add(frame);
        art = this.makeArtPlane(item, era, loader, 1.78, 1.78);
        art.position.set(0, 2.15, 0.02);
        group.add(art);
        hitMeshes.push(frame, art);
      }

      const label = this.makeLabelPlate(item);
      label.position.set(0, item.kind === 'console' ? 1.06 : 1.0, item.kind === 'console' ? 0.49 : 0.03);
      if (item.kind === 'console') label.rotation.x = -0.35;
      group.add(label);
      hitMeshes.push(label);

      this.scene.add(group);
      this.displays.push({ item, group, art, normal, hitMeshes });
    });
  }

  private makeArtPlane(
    item: MuseumItem,
    era: Era,
    loader: THREE.TextureLoader,
    maxW: number,
    maxH: number
  ): THREE.Mesh {
    const material = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

    const applyTexture = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      material.map = tex;
      material.emissive = new THREE.Color(0xffffff);
      material.emissiveMap = tex;
      material.emissiveIntensity = this.theme.artEmissive;
      material.needsUpdate = true;
      const img = tex.image as { width?: number; height?: number };
      const aspect = img?.width && img?.height ? img.width / img.height : 1;
      const w = Math.min(maxW, maxH * aspect);
      mesh.scale.set(w, w / aspect, 1);
    };

    const usePlaceholder = () => {
      if (this.disposed) return;
      applyTexture(new THREE.CanvasTexture(placeholderCanvas(item, era, 512, 512)));
    };

    if (item.imageUrl && item.imageStatus === 'ok') {
      loader.load(item.imageUrl, (tex) => !this.disposed && applyTexture(tex), undefined, usePlaceholder);
      usePlaceholder(); // visible immediately; swapped when the photo arrives
    } else {
      usePlaceholder();
    }
    return mesh;
  }

  private makeLabelPlate(item: MuseumItem): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 144;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#101216';
    ctx.fillRect(0, 0, 512, 144);
    ctx.strokeStyle = '#3a4048';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 136);
    ctx.fillStyle = '#f2f4f6';
    ctx.font = '600 38px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fitText(ctx, item.name, 480), 256, 62);
    ctx.fillStyle = '#9aa4ae';
    ctx.font = '30px "VT323", monospace';
    ctx.fillText(`${item.maker} · ${item.year}`, 256, 110);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.92, 0.26),
      new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 0.45,
        roughness: 0.6,
      })
    );
    return mesh;
  }

  // ── Input ────────────────────────────────────────────────────────────────

  private bindInput(): void {
    const { signal } = this.abort;
    window.addEventListener(
      'keydown',
      (e) => {
        if (this.inspecting || this.transitioning) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.moveDir = -1;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.moveDir = 1;
      },
      { signal }
    );
    window.addEventListener(
      'keyup',
      (e) => {
        if (['ArrowLeft', 'a', 'A'].includes(e.key) && this.moveDir === -1) this.moveDir = 0;
        if (['ArrowRight', 'd', 'D'].includes(e.key) && this.moveDir === 1) this.moveDir = 0;
      },
      { signal }
    );
    this.container.addEventListener(
      'pointermove',
      (e) => {
        if (this.inspecting || this.transitioning) return;
        const rect = this.container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        this.targetYaw = -nx * 1.55;
        this.targetPitch = -ny * 0.5;
      },
      { signal }
    );
    this.container.addEventListener(
      'click',
      (e) => {
        if (this.inspecting || this.transitioning) return;
        const rect = this.container.getBoundingClientRect();
        const pointer = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        this.raycaster.setFromCamera(pointer, this.camera);
        const all = this.displays.flatMap((d) => d.hitMeshes);
        const hits = this.raycaster.intersectObjects(all, false);
        if (hits.length > 0) {
          const display = this.displays.find((d) => d.hitMeshes.includes(hits[0].object as THREE.Mesh));
          if (display) this.enterInspect(display);
        }
      },
      { signal }
    );
  }

  // ── Inspection ───────────────────────────────────────────────────────────

  private enterInspect(display: Display): void {
    this.inspecting = display;
    this.transitioning = true;
    this.moveDir = 0;
    this.savedPose = {
      pos: this.camera.position.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
    };

    const artPos = new THREE.Vector3();
    display.art.getWorldPosition(artPos);
    const camTarget = artPos.clone().addScaledVector(display.normal, 2.15);
    camTarget.y = Math.max(1.3, artPos.y - 0.1);

    const startPos = this.camera.position.clone();
    const startQuat = this.camera.quaternion.clone();
    const probe = this.camera.clone();
    probe.position.copy(camTarget);
    probe.lookAt(artPos);
    const endQuat = probe.quaternion.clone();

    const state = { t: 0 };
    gsap.to(state, {
      t: 1,
      duration: 1.25,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.position.lerpVectors(startPos, camTarget, state.t);
        this.camera.quaternion.slerpQuaternions(startQuat, endQuat, state.t);
      },
      onComplete: () => {
        this.transitioning = false;
        this.callbacks.onInspect(display.item);
      },
    });
  }

  /** External walk control — on-screen ◀ ▶ buttons (touch) mirror the arrow keys. */
  setMove(dir: -1 | 0 | 1): void {
    if (this.inspecting || this.transitioning) {
      this.moveDir = 0;
      return;
    }
    this.moveDir = dir;
  }

  exitInspect(): void {
    if (!this.inspecting || !this.savedPose) return;
    const pose = this.savedPose;
    this.transitioning = true;

    const startPos = this.camera.position.clone();
    const startQuat = this.camera.quaternion.clone();
    const probe = this.camera.clone();
    probe.position.copy(pose.pos);
    probe.rotation.set(pose.pitch, -Math.PI / 2 + pose.yaw, 0, 'YXZ');
    const endQuat = probe.quaternion.clone();

    const state = { t: 0 };
    gsap.to(state, {
      t: 1,
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.camera.position.lerpVectors(startPos, pose.pos, state.t);
        this.camera.quaternion.slerpQuaternions(startQuat, endQuat, state.t);
      },
      onComplete: () => {
        this.camX = pose.pos.x;
        this.yaw = pose.yaw;
        this.pitch = pose.pitch;
        this.inspecting = null;
        this.savedPose = null;
        this.transitioning = false;
        this.callbacks.onInspectClosed();
      },
    });
  }

  // ── Frame loop ───────────────────────────────────────────────────────────

  private tick = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    if (!this.inspecting && !this.transitioning) {
      this.camX = THREE.MathUtils.clamp(
        this.camX + this.moveDir * WALK_SPEED * dt,
        -this.hallLen / 2 + 1.6,
        this.hallLen / 2 - 1.6
      );
      // Smooth look + walk
      this.yaw = THREE.MathUtils.lerp(this.yaw, this.targetYaw, 1 - Math.exp(-dt * 7));
      this.pitch = THREE.MathUtils.lerp(this.pitch, this.targetPitch, 1 - Math.exp(-dt * 7));
      this.camera.position.x = THREE.MathUtils.lerp(
        this.camera.position.x,
        this.camX,
        1 - Math.exp(-dt * 9)
      );
      this.camera.position.y = EYE_Y;
      this.camera.rotation.set(this.pitch, -Math.PI / 2 + this.yaw, 0, 'YXZ');
    } else if (this.transitioning && !this.inspecting) {
      // Entry dolly writes camX directly.
      this.camera.position.x = this.camX;
      this.camera.rotation.set(this.pitch, -Math.PI / 2 + this.yaw, 0, 'YXZ');
    }

    if (this.theme.flicker) {
      // The fluorescent hum: layered sines with an occasional dropout.
      const buzz =
        0.92 +
        0.05 * Math.sin(t * 47.0) +
        0.03 * Math.sin(t * 7.3 + 1.7) +
        (Math.sin(t * 1.13) > 0.985 ? -0.25 : 0);
      for (const light of this.flickerLights) {
        light.intensity = (this.baseIntensities.get(light) ?? 1) * buzz;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  resize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.abort.abort();
    gsap.killTweensOf(this);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          for (const key of ['map', 'emissiveMap'] as const) {
            const tex = (m as THREE.MeshStandardMaterial)[key];
            if (tex) tex.dispose();
          }
          m.dispose();
        }
      }
    });
    this.pmrem?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let out = text;
  while (out.length > 4 && ctx.measureText(out + '…').width > maxW) out = out.slice(0, -1);
  return out + '…';
}
