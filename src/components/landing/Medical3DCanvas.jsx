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

    // 4. Multi-Directional Lighting for High-Res Organ Mesh on RIGHT Side
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

    // 5. Clean 3D Organ Factory (Zero Circles / Spheres, Constant Front Facing)
    const textureLoader = new THREE.TextureLoader()

    const createCleanOrganMesh = (textureUrl, size = 6.4) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const texture = textureLoader.load(textureUrl)
      texture.colorSpace = THREE.SRGBColorSpace

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.1,
        metalness: 0.25,
        depthWrite: false,
        side: THREE.DoubleSide
      })

      const mesh = new THREE.Mesh(geometry, material)
      return { mesh, material }
    }

    const isMobile = width < 768
    const rightOffsetX = isMobile ? 0 : 3.4 // Positioned on RIGHT side

    // Organ 1: Clean 3D Heart (Front-Facing, Constant, No Circle Meshes)
    const { mesh: heartMesh, material: heartMat } = createCleanOrganMesh('/images/heart.png', isMobile ? 4.4 : 6.8)
    heartMesh.position.set(rightOffsetX, 0, 0)
    scene.add(heartMesh)

    // Organ 2: Clean 3D Lungs (Front-Facing, Constant)
    const { mesh: lungsMesh, material: lungsMat } = createCleanOrganMesh('/images/lungs.png', isMobile ? 4.6 : 7.0)
    lungsMesh.position.set(rightOffsetX + 4, 0, -3)
    lungsMat.opacity = 0
    scene.add(lungsMesh)

    // Organ 3: Clean 3D Kidneys (Front-Facing, Constant)
    const { mesh: kidneyMesh, material: kidneyMat } = createCleanOrganMesh('/images/kidney.png', isMobile ? 4.0 : 5.8)
    kidneyMesh.position.set(rightOffsetX - 4, -4, -6)
    kidneyMat.opacity = 0
    scene.add(kidneyMesh)

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

    // 7. Dual-Tone Energetic Particles
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

    // 8. Animation Frame Loop (Constant Organs, Zero Circle Meshes, Zero Axis Rotation)
    let animationFrameId
    let clock = new THREE.Clock()

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const p = Math.max(0, Math.min(1, progressRef.current))

      rightRedParticles.rotation.y = elapsedTime * 0.08
      leftCyanParticles.rotation.y = -elapsedTime * 0.05

      // Heart breathing pulse animation (Constant front-facing orientation!)
      const heartBeat = 1 + Math.sin(elapsedTime * 3.8) * 0.065

      // STAGE 1: HERO - CLEAN 3D HEART ON RIGHT SIDE (0.0 to 0.22)
      if (p <= 0.22) {
        const stageP = p / 0.22

        heartMesh.position.x = lerp(rightOffsetX, rightOffsetX - 0.3, stageP)
        heartMesh.position.y = lerp(0, 0.4, stageP)
        heartMesh.position.z = lerp(0, -1.2, stageP)
        heartMesh.rotation.y = 0
        heartMesh.scale.set(heartBeat, heartBeat, 1)
        heartMat.opacity = lerp(1, 0.5, stageP)

        lungsMesh.position.x = lerp(rightOffsetX + 4, rightOffsetX, stageP)
        lungsMesh.position.y = lerp(-1, 0, stageP)
        lungsMesh.position.z = lerp(-4, 0, stageP)
        lungsMat.opacity = lerp(0, 0.9, stageP)

        kidneyMat.opacity = 0
        spineMat.opacity = 0
        particleMat.opacity = 0

        keyCrimsonLight.color.setHex(0xf43f5e)
        backGlowLight.color.setHex(0xe11d48)
        leftCyanLight.color.setHex(0x06b6d4)
        scene.fog.color.setHex(0x0a0518)
      }
      // STAGE 2: HEART → LUNGS (0.22 to 0.48)
      else if (p > 0.22 && p <= 0.48) {
        const stageP = (p - 0.22) / 0.26
        const lungsBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.05

        lungsMesh.scale.set(lungsBreath, lungsBreath, 1)
        lungsMesh.rotation.y = 0
        lungsMesh.position.x = lerp(rightOffsetX, rightOffsetX + 0.8, stageP)
        lungsMesh.position.y = lerp(0, 0.6, stageP)
        lungsMesh.position.z = lerp(0, -1.8, stageP)
        lungsMat.opacity = lerp(0.9, 0.25, stageP)

        heartMat.opacity = lerp(0.5, 0.1, stageP)

        kidneyMesh.position.x = lerp(rightOffsetX - 4, rightOffsetX, stageP)
        kidneyMesh.position.y = lerp(-3, 0, stageP)
        kidneyMesh.position.z = lerp(-5, 0, stageP)
        kidneyMat.opacity = lerp(0, 0.95, stageP)

        spineMat.opacity = 0
        particleMat.opacity = 0

        keyCrimsonLight.color.setHex(0x10b981)
        backGlowLight.color.setHex(0x059669)
        leftCyanLight.color.setHex(0x0284c7)
        scene.fog.color.setHex(0x021c16)
      }
      // STAGE 3: LUNGS → KIDNEYS (0.48 to 0.72)
      else if (p > 0.48 && p <= 0.72) {
        const stageP = (p - 0.48) / 0.24
        const kidneyPulse = 1 + Math.sin(elapsedTime * 3.2) * 0.06

        kidneyMesh.scale.set(kidneyPulse, kidneyPulse, 1)
        kidneyMesh.rotation.y = 0
        kidneyMesh.position.x = lerp(rightOffsetX, rightOffsetX - 0.4, stageP)
        kidneyMesh.position.y = lerp(0, -0.8, stageP)
        kidneyMesh.position.z = lerp(0, -3.5, stageP)
        kidneyMat.opacity = lerp(0.95, 0.35, stageP)

        lungsMat.opacity = lerp(0.25, 0.05, stageP)
        heartMat.opacity = lerp(0.1, 0.05, stageP)

        humanGroup.position.x = rightOffsetX
        humanGroup.position.z = lerp(-12, 0, stageP)
        humanGroup.rotation.y = 0
        spineMat.opacity = lerp(0, 0.8, stageP)
        particleMat.opacity = lerp(0, 0.9, stageP)

        keyCrimsonLight.color.setHex(0xf59e0b)
        backGlowLight.color.setHex(0xd97706)
        leftCyanLight.color.setHex(0x8b5cf6)
        scene.fog.color.setHex(0x1e0f04)
      }
      // STAGE 4 & 5: HOLOGRAPHIC HUMAN ANATOMY
      else {
        const stageP = (p - 0.72) / 0.28

        humanGroup.position.x = rightOffsetX
        humanGroup.rotation.y = 0
        humanGroup.position.z = lerp(0, 1.2, stageP)
        spineMat.opacity = lerp(0.8, 0.6, stageP)
        particleMat.opacity = lerp(0.9, 0.75, stageP)

        heartMat.opacity = lerp(0.1, 0, stageP)
        lungsMat.opacity = lerp(0.05, 0, stageP)
        kidneyMat.opacity = lerp(0.35, 0, stageP)

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
