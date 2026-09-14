import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import * as THREE from "three";

const RIM_VERT = `
varying vec3 vN; varying vec3 vV;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const RIM_FRAG = `
uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
varying vec3 vN; varying vec3 vV;
void main(){
  float f = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uPower);
  float a = f * uIntensity;
  gl_FragColor = vec4(uColor * a, a);
}`;

function rimMaterial(color: string, power: number, side: THREE.Side) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uIntensity: { value: 1 },
    },
    vertexShader: RIM_VERT,
    fragmentShader: RIM_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side,
  });
}

function sparkleShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 1);
  s.bezierCurveTo(0.06, 0.54, 0.54, 0.06, 1, 0);
  s.bezierCurveTo(0.54, -0.06, 0.06, -0.54, 0, -1);
  s.bezierCurveTo(-0.06, -0.54, -0.54, -0.06, -1, 0);
  s.bezierCurveTo(-0.54, 0.06, -0.06, 0.54, 0, 1);
  return s;
}

function sparkleGeometry(depth: number) {
  const g = new THREE.ExtrudeGeometry(sparkleShape(), {
    depth,
    curveSegments: 28,
    bevelEnabled: true,
    bevelThickness: 0.085,
    bevelSize: 0.085,
    bevelOffset: 0,
    bevelSegments: 5,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

function studioEnv(renderer: THREE.WebGLRenderer, accent: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#3A4C57");
  grd.addColorStop(0.42, "#0D191F");
  grd.addColorStop(1, "#04090C");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.fillRect(56, 16, 190, 30);
  g.fillStyle = "rgba(255,255,255,0.42)";
  g.fillRect(300, 30, 120, 16);
  const rg = g.createRadialGradient(400, 96, 4, 400, 96, 130);
  rg.addColorStop(0, accent);
  rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg;
  g.fillRect(260, 0, 252, 226);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
  return env;
}

export type NeonIconKind = "sparkle" | "sparkles" | "pencil";
export type NeonIconHandle = { setHover: (on: boolean) => void };

type Props = {
  kind?: NeonIconKind;
  accent?: string;
  bg?: string;
  mood?: "brand" | "neutral";
  className?: string;
};

/** WebGL neon 3D icon (ported from the provided neon-icon web component). */
const NeonIcon = forwardRef<NeonIconHandle, Props>(function NeonIcon(
  { kind = "sparkle", accent = "#00BFFF", bg = "#05222C", mood = "brand", className },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);

  useImperativeHandle(ref, () => ({
    setHover: (on: boolean) => {
      targetRef.current = on ? 1 : 0;
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const transparent = bg === "transparent";
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: transparent,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (transparent) renderer.setClearAlpha(0);
    else renderer.setClearColor(new THREE.Color(bg), 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;border-radius:inherit";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = studioEnv(renderer, accent);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.35, 9);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x14242c, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(-3, 4.5, 5);
    scene.add(key);
    const rimLight = new THREE.DirectionalLight(new THREE.Color(accent), 3.2);
    rimLight.position.set(3.5, -1.5, -3);
    scene.add(rimLight);
    const underLight = new THREE.PointLight(new THREE.Color(accent), 12, 14, 2);
    underLight.position.set(0, -2.6, 1.6);
    scene.add(underLight);

    const accentColor = new THREE.Color(accent);
    const neutralColor = new THREE.Color("#93AAB6");
    const tmpColor = new THREE.Color();

    const rimMat = rimMaterial(accent, 1.75, THREE.FrontSide);
    const haloMat = rimMaterial(accent, 2.05, THREE.BackSide);

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1218,
      metalness: 0.72,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.5,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x93a7b0,
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.6,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x0a1218,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.62,
      roughness: 0.35,
      metalness: 0.2,
      envMapIntensity: 1.2,
    });
    const satMat = new THREE.MeshStandardMaterial({
      color: 0x0a1218,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.45,
      roughness: 0.32,
      metalness: 0.25,
      envMapIntensity: 1.3,
    });

    const root = new THREE.Group();
    scene.add(root);

    const sats: THREE.Mesh[] = [];
    let baseScale = 1;
    let star: THREE.Mesh | null = null;
    let ring: THREE.Group | null = null;
    let pencil: THREE.Group | null = null;
    let field: THREE.Mesh[] | null = null;

    const addRim = (mesh: THREE.Mesh, halo: boolean) => {
      const r = new THREE.Mesh(mesh.geometry, rimMat);
      r.scale.setScalar(1.006);
      mesh.add(r);
      if (halo) {
        const h = new THREE.Mesh(mesh.geometry, haloMat);
        h.scale.setScalar(1.055);
        mesh.add(h);
      }
    };

    const fit = (group: THREE.Object3D, target: number) => {
      const box = new THREE.Box3().setFromObject(group);
      const size = new THREE.Vector3();
      box.getSize(size);
      const s = target / Math.max(size.x, size.y);
      group.scale.setScalar(s);
      baseScale = s;
      const c = new THREE.Vector3();
      box.getCenter(c);
      group.position.sub(c.multiplyScalar(s));
    };

    const buildSparkle = () => {
      const geo = sparkleGeometry(0.46);
      star = new THREE.Mesh(geo, bodyMat);
      star.scale.setScalar(1.45);
      root.add(star);
      addRim(star, true);

      const satGeo = sparkleGeometry(0.16);
      ring = new THREE.Group();
      root.add(ring);
      (
        [
          [1.95, 0.66, 0.4],
          [-1.72, -1.0, 0.32],
          [0.58, 2.0, 0.26],
        ] as const
      ).forEach((p, i) => {
        const pivot = new THREE.Group();
        pivot.rotation.z = i * 2.1;
        const m = new THREE.Mesh(satGeo, satMat);
        m.position.set(p[0], p[1], 0.6 - i * 0.5);
        m.scale.setScalar(0.001);
        m.userData.size = p[2];
        pivot.add(m);
        ring!.add(pivot);
        sats.push(m);
        const r = new THREE.Mesh(satGeo, haloMat);
        r.scale.setScalar(1.1);
        m.add(r);
      });
    };

    const buildSparkleField = () => {
      const geo = sparkleGeometry(0.3);
      const defs = [
        [-2.58, 1.02, 1.5, 0.3, 0.52, 0.0, 1.0],
        [2.42, 1.34, -0.9, 0.23, 0.41, 1.7, -0.8],
        [-2.2, -1.42, -1.7, 0.19, 0.66, 3.1, 1.4],
        [2.72, -1.18, 0.9, 0.26, 0.36, 4.4, -1.2],
        [-0.4, 1.88, -2.3, 0.15, 0.74, 2.2, 1.7],
        [1.2, -1.98, 1.7, 0.13, 0.59, 5.3, -1.5],
      ];
      field = defs.map((d) => {
        const m = new THREE.Mesh(geo, satMat);
        m.userData = { p: [d[0], d[1], d[2]], s: d[3], sp: d[4], ph: d[5], spin: d[6] };
        m.position.set(d[0]!, d[1]!, d[2]!);
        m.scale.setScalar(d[3]!);
        const halo = new THREE.Mesh(geo, haloMat);
        halo.scale.setScalar(1.12);
        m.add(halo);
        if (d[3]! > 0.22) {
          const rim = new THREE.Mesh(geo, rimMat);
          rim.scale.setScalar(1.01);
          m.add(rim);
        }
        root.add(m);
        return m;
      });
    };

    const buildPencil = () => {
      const g = new THREE.Group();

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.35, 6, 1), bodyMat);
      barrel.position.y = 0.18;
      g.add(barrel);
      addRim(barrel, true);

      const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.075, 0.56, 6, 1), bodyMat);
      wood.position.y = -1.28;
      g.add(wood);
      addRim(wood, true);

      const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.004, 0.2, 16, 1), glowMat);
      lead.position.y = -1.66;
      g.add(lead);

      const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.315, 0.34, 24, 1), metalMat);
      ferrule.position.y = 1.52;
      g.add(ferrule);
      addRim(ferrule, false);

      const eraser = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.1, 6, 24), bodyMat);
      eraser.position.y = 1.81;
      g.add(eraser);
      addRim(eraser, true);

      g.rotation.z = -0.62;
      g.rotation.x = 0.12;
      root.add(g);
      pencil = g;
    };

    if (kind === "pencil") {
      buildPencil();
      fit(root, 3.15);
    } else if (kind === "sparkles") {
      buildSparkleField();
    } else {
      buildSparkle();
      fit(root, 3.15);
    }

    const clock = new THREE.Clock();
    let visible = true;
    let hover = 0;
    let spin = 0;
    let orbit = 0;
    let lastW = 0;
    let lastH = 0;
    let raf = 0;
    let queued = false;

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver((es) => { visible = es[0]!.isIntersecting; }, { threshold: 0 })
        : null;
    io?.observe(host);

    const resize = () => {
      const w = host.clientWidth || 240;
      const h = host.clientHeight || 240;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        resize();
      });
    });
    ro.observe(host);
    resize();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      hover += (targetRef.current - hover) * Math.min(1, dt * 7);
      const h = hover;

      spin += dt * (0.34 + h * 0.62);
      orbit += dt * (0.25 + h * 1.5);

      root.position.y = Math.sin(t * 0.85) * 0.075 + h * 0.1;
      root.rotation.x = Math.sin(t * 0.55) * 0.09 - h * 0.05;
      root.scale.setScalar(baseScale * (1 + h * 0.06));

      if (field) {
        root.position.y = 0;
        root.rotation.x = 0;
        field.forEach((o) => {
          const d = o.userData as { p: number[]; s: number; sp: number; ph: number; spin: number };
          const w1 = Math.sin(t * d.sp + d.ph);
          const w2 = Math.cos(t * d.sp * 0.71 + d.ph * 1.3);
          const amp = 0.11 + h * 0.15;
          const pull = h * 0.14;
          o.position.set(
            d.p[0]! * (1 - pull) + w1 * amp * 1.5,
            d.p[1]! * (1 - pull) + w2 * amp * 2.1,
            d.p[2]! + w1 * 0.45,
          );
          o.rotation.y = d.ph + t * (0.26 + h * 0.52) * d.spin;
          o.rotation.z = w2 * 0.34;
          o.scale.setScalar(d.s * (1 + h * 0.2 + w1 * 0.05));
        });
      }

      if (star && ring) {
        star.rotation.y = Math.sin(spin) * (0.28 + h * 0.58);
        star.rotation.z = Math.sin(t * 0.5) * 0.07 + h * 0.3;
        ring.rotation.z = orbit * 0.55;
        sats.forEach((m, i) => {
          const k = Math.max(0, Math.min(1, (h - i * 0.1) / (1 - i * 0.1)));
          m.scale.setScalar(Math.max(0.0001, (m.userData.size as number) * k * k * (3 - 2 * k)));
          m.rotation.y = Math.sin(orbit * (0.8 + i * 0.3)) * 0.6;
          m.rotation.z = -ring!.rotation.z + orbit * 0.3;
        });
      }
      if (pencil) {
        pencil.rotation.y = Math.sin(t * 0.42) * (0.16 + h * 0.5);
        pencil.rotation.z = -0.62 + h * 0.14 + Math.sin(t * 0.6) * 0.04;
      }

      const pulse = 0.5 + 0.5 * Math.sin(t * (1.6 + h * 1.6));
      rimMat.uniforms.uIntensity!.value = 1.55 + h * 1.15 + pulse * (0.18 + h * 0.5);
      haloMat.uniforms.uIntensity!.value = 0.85 + h * 1.05 + pulse * (0.16 + h * 0.42);
      glowMat.emissiveIntensity = 0.55 + h * 0.55 + pulse * 0.12;
      satMat.emissiveIntensity = 0.34 + h * 0.34 + pulse * 0.12;

      if (field) {
        satMat.emissiveIntensity = 0.24 + h * 0.66 + pulse * 0.1;
        rimMat.uniforms.uIntensity!.value = 1.05 + h * 1.3 + pulse * 0.2;
        haloMat.uniforms.uIntensity!.value = 0.42 + h * 1.05 + pulse * 0.18;
      }

      if (mood === "neutral") {
        const c = tmpColor.copy(neutralColor).lerp(accentColor, h);
        rimMat.uniforms.uColor!.value.copy(c);
        haloMat.uniforms.uColor!.value.copy(c);
        rimMat.uniforms.uIntensity!.value *= 0.26 + h * 0.3;
        haloMat.uniforms.uIntensity!.value *= 0.06 + h * 0.26;
        rimLight.color.copy(c);
        rimLight.intensity = 1.05 + h * 1.05;
        underLight.intensity = 1.2 + h * 4.2;
        glowMat.emissive.copy(c);
        glowMat.emissiveIntensity *= 0.1 + h * 0.62;
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      [bodyMat, metalMat, glowMat, satMat, rimMat, haloMat].forEach((m) => m.dispose());
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind, accent, bg, mood]);

  return <div ref={hostRef} className={className} style={{ display: "block", position: "relative" }} />;
});

export default NeonIcon;
