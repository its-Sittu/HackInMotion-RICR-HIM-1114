import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Medical3DCanvas({ scrollProgress = 0 }) {
  const mountRef = useRef(null)
  const progressRef = useRef(scrollProgress)

  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Scene setup with fog
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0518, 0.032)

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 8)

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.45
    container.appendChild(renderer.domElement)

    // 4. Multi-Directional Lighting for Volumetric 3D Depth on RIGHT Side
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
    scene.add(ambientLight)

    const keyCrimsonLight = new THREE.PointLight(0xf43f5e, 8.5, 24)
    keyCrimsonLight.position.set(3.5, 1.0, 4)
    scene.add(keyCrimsonLight)

    const backGlowLight = new THREE.PointLight(0xe11d48, 6.0, 20)
    backGlowLight.position.set(3.5, -1.0, -3)
    scene.add(backGlowLight)

    const leftCyanLight = new THREE.PointLight(0x06b6d4, 6.0, 24)
    leftCyanLight.position.set(-4, 1.5, 3)
    scene.add(leftCyanLight)

    // 5. Texture Loader & Volumetric 3D Organ Factory
    const textureLoader = new THREE.TextureLoader()

    const createVolumetricOrgan = (textureUrl, size = 6.2, glowHex = 0xf43f5e) => {
      const organGroup = new THREE.Group()

      const texture = textureLoader.load(textureUrl)
      texture.colorSpace = THREE.SRGBColorSpace

      // Front Face Plane
      const frontMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.12,
        metalness: 0.4,
        depthWrite: false,
        side: THREE.FrontSide
      })
      const frontPlane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), frontMat)
      frontPlane.position.z = 0.18
      organGroup.add(frontPlane)

      // Back Face Plane (Rotated 180 deg for full 3D rotation coverage)
      const backMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.12,
        metalness: 0.4,
        depthWrite: false,
        side: THREE.BackSide
      })
      const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), backMat)
      backPlane.position.z = -0.18
      backPlane.rotation.y = Math.PI
      organGroup.add(backPlane)

      // 3D Inner Volumetric Glow Core (Full 3D volume depth!)
      const coreGeo = new THREE.SphereGeometry(size * 0.36, 32, 32)
      coreGeo.scale(1.0, 1.15, 0.65)
      const coreMat = new THREE.MeshStandardMaterial({
        color: glowHex,
        emissive: glowHex,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.82,
        roughness: 0.2,
        metalness: 0.3
      })
      const coreMesh = new THREE.Mesh(coreGeo, coreMat)
      organGroup.add(coreMesh)

      // Outer Volumetric Aura Mesh
      const auraGeo = new THREE.SphereGeometry(size * 0.42, 24, 24)
      auraGeo.scale(1.05, 1.2, 0.75)
      const auraMat = new THREE.MeshBasicMaterial({
        color: glowHex,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      })
      const auraMesh = new THREE.Mesh(auraGeo, auraMat)
      organGroup.add(auraMesh)

      return { organGroup, frontMat, backMat, coreMat, auraMat }
    }

    const isMobile = width < 768
    const rightOffsetX = isMobile ? 0 : 2.85 // Placed on RIGHT side

    // Volumetric 3D Heart on the RIGHT Side
    const {
      organGroup: heartGroup,
      frontMat: heartFrontMat,
      backMat: heartBackMat,
      coreMat: heartCoreMat,
      auraMat: heartAuraMat
    } = createVolumetricOrgan('/images/heart.png', isMobile ? 4.4 : 6.8, 0xf43f5e)

    heartGroup.position.set(rightOffsetX, 0, 0)
    scene.add(heartGroup)

    // Volumetric 3D Lungs on RIGHT Side
    const {
      organGroup: lungsGroup,
      frontMat: lungsFrontMat,
      backMat: lungsBackMat,
      coreMat: lungsCoreMat,
      auraMat: lungsAuraMat
    } = createVolumetricOrgan('/images/lungs.png', isMobile ? 4.6 : 7.0, 0x06b6d4)

    lungsGroup.position.set(rightOffsetX + 4, 0, -3)
    lungsFrontMat.opacity = 0
    lungsBackMat.opacity = 0
    lungsCoreMat.opacity = 0
    lungsAuraMat.opacity = 0
    scene.add(lungsGroup)

    // Volumetric 3D Kidneys on RIGHT Side
    const {
      organGroup: kidneyGroup,
      frontMat: kidneyFrontMat,
      backMat: kidneyBackMat,
      coreMat: kidneyCoreMat,
      auraMat: kidneyAuraMat
    } = createVolumetricOrgan('/images/kidney.png', isMobile ? 4.0 : 5.8, 0xf59e0b)

    kidneyGroup.position.set(rightOffsetX - 4, -4, -6)
    kidneyFrontMat.opacity = 0
    kidneyBackMat.opacity = 0
    kidneyCoreMat.opacity = 0
    kidneyAuraMat.opacity = 0
    scene.add(kidneyGroup)

    // 6. Holographic Body Group on RIGHT Side
    const humanGroup = new THREE.Group()
    const spineGeo = new THREE.CylinderGeometry(0.85, 1.6, 7.5, 20, 28, true)
    const spineMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0
    })
    const spineMesh = new THREE.Mesh(spineGeo, spineMat)
    humanGroup.add(spineMesh)

    const particleCount = 850
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.7 + Math.random() * 1.2
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 8.0

      particlePos[i * 3] = Math.cos(theta) * radius
      particlePos[i * 3 + 1] = y
      particlePos[i * 3 + 2] = Math.sin(theta) * radius

      particleColors[i * 3] = 0.45 + Math.random() * 0.3
      particleColors[i * 3 + 1] = 0.45 + Math.random() * 0.45
      particleColors[i * 3 + 2] = 0.98
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.095,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    })
    const humanParticles = new THREE.Points(particleGeo, particleMat)
    humanGroup.add(humanParticles)

    humanGroup.position.set(rightOffsetX, 0, -10)
    scene.add(humanGroup)

    // 7. Dual-Tone Energetic Particles (Crimson Around Organ Right + Cyan Fill Left)
    const rightRedParticlesCount = 380
    const rightRedGeo = new THREE.BufferGeometry()
    const rightRedPos = new Float32Array(rightRedParticlesCount * 3)

    for (let i = 0; i < rightRedParticlesCount; i++) {
      rightRedPos[i * 3] = rightOffsetX + (Math.random() - 0.5) * 6
      rightRedPos[i * 3 + 1] = (Math.random() - 0.5) * 7
      rightRedPos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    rightRedGeo.setAttribute('position', new THREE.BufferAttribute(rightRedPos, 3))

    const rightRedMat = new THREE.PointsMaterial({
      size: 0.085,
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    const rightRedParticles = new THREE.Points(rightRedGeo, rightRedMat)
    scene.add(rightRedParticles)

    const leftCyanParticlesCount = 450
    const leftCyanGeo = new THREE.BufferGeometry()
    const leftCyanPos = new Float32Array(leftCyanParticlesCount * 3)

    for (let i = 0; i < leftCyanParticlesCount; i++) {
      leftCyanPos[i * 3] = (Math.random() - 0.8) * 12
      leftCyanPos[i * 3 + 1] = (Math.random() - 0.5) * 14
      leftCyanPos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    leftCyanGeo.setAttribute('position', new THREE.BufferAttribute(leftCyanPos, 3))

    const leftCyanMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    })
    const leftCyanParticles = new THREE.Points(leftCyanGeo, leftCyanMat)
    scene.add(leftCyanParticles)

    const setOrganOpacity = (front, back, core, aura, opacityVal) => {
      front.opacity = opacityVal
      back.opacity = opacityVal
      core.opacity = opacityVal * 0.8
      aura.opacity = opacityVal * 0.3
    }

    // 8. Animation Frame Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const p = Math.max(0, Math.min(1, progressRef.current))

      rightRedParticles.rotation.y = elapsedTime * 0.08
      leftCyanParticles.rotation.y = -elapsedTime * 0.05

      // Continuous Slow 3D Volumetric Organ Rotation on Y-Axis
      const heartSlowRotate = elapsedTime * 0.4
      const heartBeat = 1 + Math.sin(elapsedTime * 3.8) * 0.065

      // STAGE 1: HERO - VOLUMETRIC 3D HEART ON RIGHT SIDE (0.0 to 0.22)
      if (p <= 0.22) {
        const stageP = p / 0.22

        heartGroup.position.x = lerp(rightOffsetX, rightOffsetX - 0.3, stageP)
        heartGroup.position.y = lerp(0, 0.4, stageP)
        heartGroup.position.z = lerp(0, -1.2, stageP)
        heartGroup.rotation.y = heartSlowRotate
        heartGroup.scale.set(heartBeat, heartBeat, heartBeat)
        setOrganOpacity(heartFrontMat, heartBackMat, heartCoreMat, heartAuraMat, lerp(1, 0.5, stageP))

        lungsGroup.position.x = lerp(rightOffsetX + 4, rightOffsetX, stageP)
        lungsGroup.position.y = lerp(-1, 0, stageP)
        lungsGroup.position.z = lerp(-4, 0, stageP)
        setOrganOpacity(lungsFrontMat, lungsBackMat, lungsCoreMat, lungsAuraMat, lerp(0, 0.9, stageP))

        setOrganOpacity(kidneyFrontMat, kidneyBackMat, kidneyCoreMat, kidneyAuraMat, 0)
        spineMat.opacity = 0
        particleMat.opacity = 0

        keyCrimsonLight.color.setHex(0xf43f5e)
        backGlowLight.color.setHex(0xe11d48)
        leftCyanLight.color.setHex(0x06b6d4)
        scene.fog.color.setHex(0x0a0518)
      }
      // STAGE 2: HEART → LUNGS (0.22 to 0.48) -> EMERALD / TEAL ON RIGHT SIDE
      else if (p > 0.22 && p <= 0.48) {
        const stageP = (p - 0.22) / 0.26
        const lungsBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.05

        lungsGroup.scale.set(lungsBreath, lungsBreath, lungsBreath)
        lungsGroup.rotation.y = elapsedTime * 0.28
        lungsGroup.position.x = lerp(rightOffsetX, rightOffsetX + 0.8, stageP)
        lungsGroup.position.y = lerp(0, 0.6, stageP)
        lungsGroup.position.z = lerp(0, -1.8, stageP)
        setOrganOpacity(lungsFrontMat, lungsBackMat, lungsCoreMat, lungsAuraMat, lerp(0.9, 0.25, stageP))

        setOrganOpacity(heartFrontMat, heartBackMat, heartCoreMat, heartAuraMat, lerp(0.5, 0.1, stageP))

        kidneyGroup.position.x = lerp(rightOffsetX - 4, rightOffsetX, stageP)
        kidneyGroup.position.y = lerp(-3, 0, stageP)
        kidneyGroup.position.z = lerp(-5, 0, stageP)
        setOrganOpacity(kidneyFrontMat, kidneyBackMat, kidneyCoreMat, kidneyAuraMat, lerp(0, 0.95, stageP))

        spineMat.opacity = 0
        particleMat.opacity = 0

        keyCrimsonLight.color.setHex(0x10b981)
        backGlowLight.color.setHex(0x059669)
        leftCyanLight.color.setHex(0x0284c7)
        scene.fog.color.setHex(0x021c16)
      }
      // STAGE 3: LUNGS → KIDNEYS (0.48 to 0.72) -> GOLDEN AMBER ON RIGHT SIDE
      else if (p > 0.48 && p <= 0.72) {
        const stageP = (p - 0.48) / 0.24
        const kidneyPulse = 1 + Math.sin(elapsedTime * 3.2) * 0.06

        kidneyGroup.scale.set(kidneyPulse, kidneyPulse, kidneyPulse)
        kidneyGroup.rotation.y = elapsedTime * 0.32
        kidneyGroup.position.x = lerp(rightOffsetX, rightOffsetX - 0.4, stageP)
        kidneyGroup.position.y = lerp(0, -0.8, stageP)
        kidneyGroup.position.z = lerp(0, -3.5, stageP)
        setOrganOpacity(kidneyFrontMat, kidneyBackMat, kidneyCoreMat, kidneyAuraMat, lerp(0.95, 0.35, stageP))

        setOrganOpacity(lungsFrontMat, lungsBackMat, lungsCoreMat, lungsAuraMat, lerp(0.25, 0.05, stageP))
        setOrganOpacity(heartFrontMat, heartBackMat, heartCoreMat, heartAuraMat, lerp(0.1, 0.05, stageP))

        humanGroup.position.x = rightOffsetX
        humanGroup.position.z = lerp(-12, 0, stageP)
        humanGroup.rotation.y = elapsedTime * 0.4
        spineMat.opacity = lerp(0, 0.8, stageP)
        particleMat.opacity = lerp(0, 0.9, stageP)

        keyCrimsonLight.color.setHex(0xf59e0b)
        backGlowLight.color.setHex(0xd97706)
        leftCyanLight.color.setHex(0x8b5cf6)
        scene.fog.color.setHex(0x1e0f04)
      }
      // STAGE 4 & 5: HOLOGRAPHIC HUMAN ANATOMY ON RIGHT SIDE
      else {
        const stageP = (p - 0.72) / 0.28

        humanGroup.position.x = rightOffsetX
        humanGroup.rotation.y = elapsedTime * 0.35
        humanGroup.position.z = lerp(0, 1.2, stageP)
        spineMat.opacity = lerp(0.8, 0.6, stageP)
        particleMat.opacity = lerp(0.9, 0.75, stageP)

        setOrganOpacity(heartFrontMat, heartBackMat, heartCoreMat, heartAuraMat, lerp(0.1, 0, stageP))
        setOrganOpacity(lungsFrontMat, lungsBackMat, lungsCoreMat, lungsAuraMat, lerp(0.05, 0, stageP))
        setOrganOpacity(kidneyFrontMat, kidneyBackMat, kidneyCoreMat, kidneyAuraMat, lerp(0.35, 0, stageP))

        keyCrimsonLight.color.setHex(0xd946ef)
        backGlowLight.color.setHex(0xc084fc)
        leftCyanLight.color.setHex(0x6366f1)
        scene.fog.color.setHex(0x12092b)
      }

      camera.position.z = lerp(8, 7.2, p)

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
    />
  )
}
