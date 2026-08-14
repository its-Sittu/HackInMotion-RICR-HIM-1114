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
    scene.fog = new THREE.FogExp2(0x0a0518, 0.035)

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

    // 4. Dual-Tone Lighting System (Red/Magenta Left + Cyan/Blue Right)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
    scene.add(ambientLight)

    // Left Crimson/Magenta Light (for Heart Glow)
    const leftHeartLight = new THREE.PointLight(0xf43f5e, 7.5, 22)
    leftHeartLight.position.set(-3.5, 0.5, 4)
    scene.add(leftHeartLight)

    // Right Cyan/Blue Light (for Background Aura)
    const rightCyanLight = new THREE.PointLight(0x06b6d4, 6.0, 22)
    rightCyanLight.position.set(4, 1, 3)
    scene.add(rightCyanLight)

    // 5. Texture Loader & Organ Meshes
    const textureLoader = new THREE.TextureLoader()

    const createOrganMesh = (textureUrl, size = 5.8) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const texture = textureLoader.load(textureUrl)
      texture.colorSpace = THREE.SRGBColorSpace
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.1,
        metalness: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide
      })
      return new THREE.Mesh(geometry, material)
    }

    const isMobile = width < 768
    const leftOffsetX = isMobile ? 0 : -2.6

    // 3D Heart on the LEFT Side (Matching Reference Image)
    const heartMesh = createOrganMesh('/images/heart.png', isMobile ? 4.2 : 6.4)
    heartMesh.position.set(leftOffsetX, 0, 0)
    scene.add(heartMesh)

    // 3D Lungs & Kidneys on Left Side for Transitions
    const lungsMesh = createOrganMesh('/images/lungs.png', isMobile ? 4.4 : 6.4)
    lungsMesh.position.set(leftOffsetX - 4, 0, -3)
    lungsMesh.material.opacity = 0
    scene.add(lungsMesh)

    const kidneyMesh = createOrganMesh('/images/kidney.png', isMobile ? 3.8 : 5.4)
    kidneyMesh.position.set(leftOffsetX + 4, -4, -6)
    kidneyMesh.material.opacity = 0
    scene.add(kidneyMesh)

    // 6. Holographic Body Group
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

    humanGroup.position.set(leftOffsetX, 0, -10)
    scene.add(humanGroup)

    // 7. Dual-Tone Energetic Particle Cloud (Red Around Heart + Cyan On Right)
    const leftRedParticlesCount = 350
    const leftRedGeo = new THREE.BufferGeometry()
    const leftRedPos = new Float32Array(leftRedParticlesCount * 3)

    for (let i = 0; i < leftRedParticlesCount; i++) {
      leftRedPos[i * 3] = leftOffsetX + (Math.random() - 0.5) * 6
      leftRedPos[i * 3 + 1] = (Math.random() - 0.5) * 7
      leftRedPos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    leftRedGeo.setAttribute('position', new THREE.BufferAttribute(leftRedPos, 3))

    const leftRedMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    })
    const leftRedParticles = new THREE.Points(leftRedGeo, leftRedMat)
    scene.add(leftRedParticles)

    const rightCyanParticlesCount = 450
    const rightCyanGeo = new THREE.BufferGeometry()
    const rightCyanPos = new Float32Array(rightCyanParticlesCount * 3)

    for (let i = 0; i < rightCyanParticlesCount; i++) {
      rightCyanPos[i * 3] = (Math.random() - 0.2) * 12
      rightCyanPos[i * 3 + 1] = (Math.random() - 0.5) * 14
      rightCyanPos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    rightCyanGeo.setAttribute('position', new THREE.BufferAttribute(rightCyanPos, 3))

    const rightCyanMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    })
    const rightCyanParticles = new THREE.Points(rightCyanGeo, rightCyanMat)
    scene.add(rightCyanParticles)

    // 8. Animation Frame Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const p = Math.max(0, Math.min(1, progressRef.current))

      leftRedParticles.rotation.y = elapsedTime * 0.08
      rightCyanParticles.rotation.y = -elapsedTime * 0.05

      // Continuous Slow 3D Heart Rotation on Y-Axis
      const heartSlowRotate = elapsedTime * 0.4
      const heartBeat = 1 + Math.sin(elapsedTime * 3.8) * 0.065

      // STAGE 1: HERO - HEART ON LEFT SIDE (0.0 to 0.22)
      if (p <= 0.22) {
        const stageP = p / 0.22

        heartMesh.position.x = lerp(leftOffsetX, leftOffsetX + 0.3, stageP)
        heartMesh.position.y = lerp(0, 0.4, stageP)
        heartMesh.position.z = lerp(0, -1.2, stageP)
        heartMesh.rotation.y = heartSlowRotate
        heartMesh.scale.set(heartBeat, heartBeat, 1)
        heartMesh.material.opacity = lerp(1, 0.5, stageP)

        lungsMesh.position.x = lerp(leftOffsetX - 4, leftOffsetX, stageP)
        lungsMesh.position.y = lerp(-1, 0, stageP)
        lungsMesh.position.z = lerp(-4, 0, stageP)
        lungsMesh.material.opacity = lerp(0, 0.9, stageP)

        kidneyMesh.material.opacity = 0
        spineMat.opacity = 0
        particleMat.opacity = 0

        leftHeartLight.color.setHex(0xf43f5e)
        rightCyanLight.color.setHex(0x06b6d4)
        scene.fog.color.setHex(0x0a0518)
      }
      // STAGE 2: HEART → LUNGS (0.22 to 0.48) -> EMERALD / TEAL
      else if (p > 0.22 && p <= 0.48) {
        const stageP = (p - 0.22) / 0.26
        const lungsBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.05

        lungsMesh.scale.set(lungsBreath, lungsBreath, 1)
        lungsMesh.rotation.y = elapsedTime * 0.28
        lungsMesh.position.x = lerp(leftOffsetX, leftOffsetX - 0.8, stageP)
        lungsMesh.position.y = lerp(0, 0.6, stageP)
        lungsMesh.position.z = lerp(0, -1.8, stageP)
        lungsMesh.material.opacity = lerp(0.9, 0.25, stageP)

        heartMesh.material.opacity = lerp(0.5, 0.1, stageP)

        kidneyMesh.position.x = lerp(leftOffsetX + 4, leftOffsetX, stageP)
        kidneyMesh.position.y = lerp(-3, 0, stageP)
        kidneyMesh.position.z = lerp(-5, 0, stageP)
        kidneyMesh.material.opacity = lerp(0, 0.95, stageP)

        spineMat.opacity = 0
        particleMat.opacity = 0

        leftHeartLight.color.setHex(0x10b981)
        rightCyanLight.color.setHex(0x0284c7)
        scene.fog.color.setHex(0x021c16)
      }
      // STAGE 3: LUNGS → KIDNEYS (0.48 to 0.72) -> GOLDEN AMBER
      else if (p > 0.48 && p <= 0.72) {
        const stageP = (p - 0.48) / 0.24
        const kidneyPulse = 1 + Math.sin(elapsedTime * 3.2) * 0.06

        kidneyMesh.scale.set(kidneyPulse, kidneyPulse, 1)
        kidneyMesh.rotation.y = elapsedTime * 0.32
        kidneyMesh.position.x = lerp(leftOffsetX, leftOffsetX + 0.4, stageP)
        kidneyMesh.position.y = lerp(0, -0.8, stageP)
        kidneyMesh.position.z = lerp(0, -3.5, stageP)
        kidneyMesh.material.opacity = lerp(0.95, 0.35, stageP)

        lungsMesh.material.opacity = lerp(0.25, 0.05, stageP)
        heartMesh.material.opacity = lerp(0.1, 0.05, stageP)

        humanGroup.position.x = leftOffsetX
        humanGroup.position.z = lerp(-12, 0, stageP)
        humanGroup.rotation.y = elapsedTime * 0.4
        spineMat.opacity = lerp(0, 0.8, stageP)
        particleMat.opacity = lerp(0, 0.9, stageP)

        leftHeartLight.color.setHex(0xf59e0b)
        rightCyanLight.color.setHex(0x8b5cf6)
        scene.fog.color.setHex(0x1e0f04)
      }
      // STAGE 4 & 5: HOLOGRAPHIC HUMAN ANATOMY -> INDIGO / NEON PURPLE
      else {
        const stageP = (p - 0.72) / 0.28

        humanGroup.position.x = leftOffsetX
        humanGroup.rotation.y = elapsedTime * 0.35
        humanGroup.position.z = lerp(0, 1.2, stageP)
        spineMat.opacity = lerp(0.8, 0.6, stageP)
        particleMat.opacity = lerp(0.9, 0.75, stageP)

        heartMesh.material.opacity = lerp(0.1, 0, stageP)
        lungsMesh.material.opacity = lerp(0.05, 0, stageP)
        kidneyMesh.material.opacity = lerp(0.35, 0, stageP)

        leftHeartLight.color.setHex(0xd946ef)
        rightCyanLight.color.setHex(0x6366f1)
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
