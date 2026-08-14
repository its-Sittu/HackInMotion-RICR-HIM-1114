import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Medical3DCanvas({ scrollProgress = 0 }) {
  const mountRef = useRef(null)
  const progressRef = useRef(scrollProgress)

  // Keep progressRef updated for animation frame loop
  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Scene setup with dynamic fog color
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x1e1b4b, 0.035)

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 8)

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.appendChild(renderer.domElement)

    // 4. Dynamic Color Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const heartLight = new THREE.PointLight(0xd946ef, 5.5, 20)
    heartLight.position.set(3, 1, 4)
    scene.add(heartLight)

    const lungsLight = new THREE.PointLight(0x06b6d4, 5.0, 20)
    lungsLight.position.set(3, 2, 2)
    scene.add(lungsLight)

    const kidneyLight = new THREE.PointLight(0xf59e0b, 5.0, 20)
    kidneyLight.position.set(3, -2, 2)
    scene.add(kidneyLight)

    // 5. Texture Loader for Ultra-Realistic 3D Organ Planes
    const textureLoader = new THREE.TextureLoader()

    const createOrganMesh = (textureUrl, size = 5.4) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const texture = textureLoader.load(textureUrl)
      texture.colorSpace = THREE.SRGBColorSpace
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.15,
        metalness: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide
      })
      return new THREE.Mesh(geometry, material)
    }

    const isMobile = width < 768
    const rightOffsetX = isMobile ? 0 : 2.6

    // Organ 1: Realistic 3D Heart
    const heartMesh = createOrganMesh('/images/heart.png', isMobile ? 4.0 : 5.8)
    heartMesh.position.set(rightOffsetX, 0, 0)
    scene.add(heartMesh)

    // Organ 2: Realistic 3D Lungs
    const lungsMesh = createOrganMesh('/images/lungs.png', isMobile ? 4.4 : 6.2)
    lungsMesh.position.set(rightOffsetX + 4, 0, -3)
    lungsMesh.material.opacity = 0
    scene.add(lungsMesh)

    // Organ 3: Realistic 3D Kidneys
    const kidneyMesh = createOrganMesh('/images/kidney.png', isMobile ? 3.8 : 5.2)
    kidneyMesh.position.set(rightOffsetX - 4, -4, -6)
    kidneyMesh.material.opacity = 0
    scene.add(kidneyMesh)

    // 6. Holographic Human Body Geometry
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

    // Holographic Bio-Particles
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

    // 7. Ambient Blood Flow & Cellular Circulation Particles
    const ambientParticleCount = 450
    const ambientGeo = new THREE.BufferGeometry()
    const ambientPos = new Float32Array(ambientParticleCount * 3)

    for (let i = 0; i < ambientParticleCount; i++) {
      ambientPos[i * 3] = (Math.random() - 0.5) * 18
      ambientPos[i * 3 + 1] = (Math.random() - 0.5) * 18
      ambientPos[i * 3 + 2] = (Math.random() - 0.5) * 18
    }

    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3))
    const ambientMat = new THREE.PointsMaterial({
      size: 0.075,
      color: 0xd946ef,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    })
    const ambientParticles = new THREE.Points(ambientGeo, ambientMat)
    scene.add(ambientParticles)

    // 8. Animation Frame Loop with Smooth Color Theme Interpolation
    let animationFrameId
    let clock = new THREE.Clock()

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const p = Math.max(0, Math.min(1, progressRef.current))

      ambientParticles.rotation.y = elapsedTime * 0.05

      // Continuous Slow 3D Organ Rotations
      const heartSlowRotate = elapsedTime * 0.38
      const lungsSlowRotate = elapsedTime * 0.28
      const kidneySlowRotate = elapsedTime * 0.32

      // Dynamic heartbeat pulse
      const heartBeat = 1 + Math.sin(elapsedTime * 3.8) * 0.065

      // STAGE 1: HERO - HEART (0.0 to 0.22) -> VIBRANT PURPLE-MAGENTA THEME
      if (p <= 0.22) {
        const stageP = p / 0.22

        heartMesh.position.x = lerp(rightOffsetX, rightOffsetX - 0.4, stageP)
        heartMesh.position.y = lerp(0, 0.4, stageP)
        heartMesh.position.z = lerp(0, -1.2, stageP)
        heartMesh.rotation.y = heartSlowRotate
        heartMesh.scale.set(heartBeat, heartBeat, 1)
        heartMesh.material.opacity = lerp(1, 0.5, stageP)

        lungsMesh.position.x = lerp(rightOffsetX + 4, rightOffsetX, stageP)
        lungsMesh.position.y = lerp(-1, 0, stageP)
        lungsMesh.position.z = lerp(-4, 0, stageP)
        lungsMesh.material.opacity = lerp(0, 0.9, stageP)

        kidneyMesh.material.opacity = 0
        spineMat.opacity = 0
        particleMat.opacity = 0
        ambientMat.color.setHex(0xd946ef)
        scene.fog.color.setHex(0x1e1b4b)
      }
      // STAGE 2: HEART → LUNGS (0.22 to 0.48) -> ELECTRIC CYAN TEAL THEME
      else if (p > 0.22 && p <= 0.48) {
        const stageP = (p - 0.22) / 0.26
        const lungsBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.05

        lungsMesh.scale.set(lungsBreath, lungsBreath, 1)
        lungsMesh.rotation.y = lungsSlowRotate
        lungsMesh.position.x = lerp(rightOffsetX, rightOffsetX + 0.8, stageP)
        lungsMesh.position.y = lerp(0, 0.6, stageP)
        lungsMesh.position.z = lerp(0, -1.8, stageP)
        lungsMesh.material.opacity = lerp(0.9, 0.25, stageP)

        heartMesh.material.opacity = lerp(0.5, 0.1, stageP)

        kidneyMesh.position.x = lerp(rightOffsetX - 4, rightOffsetX, stageP)
        kidneyMesh.position.y = lerp(-3, 0, stageP)
        kidneyMesh.position.z = lerp(-5, 0, stageP)
        kidneyMesh.material.opacity = lerp(0, 0.95, stageP)

        spineMat.opacity = 0
        particleMat.opacity = 0
        ambientMat.color.setHex(0x06b6d4)
        scene.fog.color.setHex(0x022c22)
      }
      // STAGE 3: LUNGS → KIDNEYS (0.48 to 0.72) -> SUNSET GOLDEN AMBER THEME
      else if (p > 0.48 && p <= 0.72) {
        const stageP = (p - 0.48) / 0.24
        const kidneyPulse = 1 + Math.sin(elapsedTime * 3.2) * 0.06

        kidneyMesh.scale.set(kidneyPulse, kidneyPulse, 1)
        kidneyMesh.rotation.y = kidneySlowRotate
        kidneyMesh.position.x = lerp(rightOffsetX, rightOffsetX - 0.4, stageP)
        kidneyMesh.position.y = lerp(0, -0.8, stageP)
        kidneyMesh.position.z = lerp(0, -3.5, stageP)
        kidneyMesh.material.opacity = lerp(0.95, 0.35, stageP)

        lungsMesh.material.opacity = lerp(0.25, 0.05, stageP)
        heartMesh.material.opacity = lerp(0.1, 0.05, stageP)

        humanGroup.position.x = rightOffsetX
        humanGroup.position.z = lerp(-12, 0, stageP)
        humanGroup.rotation.y = elapsedTime * 0.4
        spineMat.opacity = lerp(0, 0.8, stageP)
        particleMat.opacity = lerp(0, 0.9, stageP)
        ambientMat.color.setHex(0xf59e0b)
        scene.fog.color.setHex(0x3f2305)
      }
      // STAGE 4 & 5: FULL HOLOGRAPHIC HUMAN ANATOMY & MEDISAFE SOLUTION
      else {
        const stageP = (p - 0.72) / 0.28

        humanGroup.position.x = rightOffsetX
        humanGroup.rotation.y = elapsedTime * 0.35
        humanGroup.position.z = lerp(0, 1.2, stageP)
        spineMat.opacity = lerp(0.8, 0.6, stageP)
        particleMat.opacity = lerp(0.9, 0.75, stageP)

        // Smoothly fade out individual organ meshes to avoid overlapping clutter
        heartMesh.material.opacity = lerp(0.1, 0, stageP)
        lungsMesh.material.opacity = lerp(0.05, 0, stageP)
        kidneyMesh.material.opacity = lerp(0.35, 0, stageP)

        ambientMat.color.setHex(0xa855f7)
        scene.fog.color.setHex(0x130b2b)
      }

      camera.position.z = lerp(8, 7.2, p)
      camera.position.y = lerp(0, -0.4 * Math.sin(p * Math.PI), 0.1)

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
