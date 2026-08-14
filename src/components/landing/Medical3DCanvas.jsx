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

    // 1. Scene setup with soft dark fog
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
    renderer.toneMappingExposure = 1.3
    container.appendChild(renderer.domElement)

    // 4. Lighting setup for Simple Clean 3D Organs
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const heartLight = new THREE.PointLight(0xf43f5e, 5.0, 20)
    heartLight.position.set(3.5, 1.0, 4)
    scene.add(heartLight)

    const lungsLight = new THREE.PointLight(0x06b6d4, 5.0, 20)
    lungsLight.position.set(3.5, 2.0, 2)
    scene.add(lungsLight)

    const kidneyLight = new THREE.PointLight(0xf59e0b, 5.0, 20)
    kidneyLight.position.set(3.5, -2.0, 2)
    scene.add(kidneyLight)

    // 5. Texture Loader for Simple Clean 3D Organ Sprites
    const textureLoader = new THREE.TextureLoader()

    const createSimpleOrganMesh = (textureUrl, size = 6.2) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const texture = textureLoader.load(textureUrl)
      texture.colorSpace = THREE.SRGBColorSpace

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.2,
        metalness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide
      })

      const mesh = new THREE.Mesh(geometry, material)
      return { mesh, material }
    }

    const isMobile = width < 768
    const rightOffsetX = isMobile ? 0 : 3.2 // Positioned cleanly on RIGHT side

    // Clean 3D Heart (Right Side)
    const { mesh: heartMesh, material: heartMat } = createSimpleOrganMesh('/images/heart.png', isMobile ? 4.2 : 6.6)
    heartMesh.position.set(rightOffsetX, 0, 0)
    scene.add(heartMesh)

    // Clean 3D Lungs (Right Side)
    const { mesh: lungsMesh, material: lungsMat } = createSimpleOrganMesh('/images/lungs.png', isMobile ? 4.4 : 6.8)
    lungsMesh.position.set(rightOffsetX + 4, 0, -3)
    lungsMat.opacity = 0
    scene.add(lungsMesh)

    // Clean 3D Kidneys (Right Side)
    const { mesh: kidneyMesh, material: kidneyMat } = createSimpleOrganMesh('/images/kidney.png', isMobile ? 3.8 : 5.6)
    kidneyMesh.position.set(rightOffsetX - 4, -4, -6)
    kidneyMat.opacity = 0
    scene.add(kidneyMesh)

    // 6. Holographic Human Anatomy (Simple Particles + Wireframe Spine)
    const humanGroup = new THREE.Group()
    const spineGeo = new THREE.CylinderGeometry(0.8, 1.5, 7.0, 16, 24, true)
    const spineMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0
    })
    const spineMesh = new THREE.Mesh(spineGeo, spineMat)
    humanGroup.add(spineMesh)

    const particleCount = 750
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.7 + Math.random() * 1.1
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 7.5

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
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    })
    const humanParticles = new THREE.Points(particleGeo, particleMat)
    humanGroup.add(humanParticles)

    humanGroup.position.set(rightOffsetX, 0, -10)
    scene.add(humanGroup)

    // 7. Ambient Floating Blood Flow Particles
    const ambientParticleCount = 400
    const ambientGeo = new THREE.BufferGeometry()
    const ambientPos = new Float32Array(ambientParticleCount * 3)

    for (let i = 0; i < ambientParticleCount; i++) {
      ambientPos[i * 3] = (Math.random() - 0.5) * 18
      ambientPos[i * 3 + 1] = (Math.random() - 0.5) * 18
      ambientPos[i * 3 + 2] = (Math.random() - 0.5) * 18
    }

    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3))
    const ambientMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    })
    const ambientParticles = new THREE.Points(ambientGeo, ambientMat)
    scene.add(ambientParticles)

    // 8. Animation Frame Loop with Lerp & Scroll Interpolation
    let animationFrameId
    let clock = new THREE.Clock()

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const p = Math.max(0, Math.min(1, progressRef.current))

      ambientParticles.rotation.y = elapsedTime * 0.04

      // Gentle heartbeat pulse
      const heartBeat = 1 + Math.sin(elapsedTime * 3.5) * 0.06

      // STAGE 1: HERO - SIMPLE CLEAN 3D HEART ON RIGHT SIDE (0.0 to 0.22)
      if (p <= 0.22) {
        const stageP = p / 0.22

        heartMesh.position.x = lerp(rightOffsetX, rightOffsetX - 0.3, stageP)
        heartMesh.position.y = lerp(0, 0.4, stageP)
        heartMesh.position.z = lerp(0, -1.2, stageP)
        heartMesh.scale.set(heartBeat, heartBeat, 1)
        heartMat.opacity = lerp(1, 0.5, stageP)

        lungsMesh.position.x = lerp(rightOffsetX + 4, rightOffsetX, stageP)
        lungsMesh.position.y = lerp(-1, 0, stageP)
        lungsMesh.position.z = lerp(-4, 0, stageP)
        lungsMat.opacity = lerp(0, 0.9, stageP)

        kidneyMat.opacity = 0
        spineMat.opacity = 0
        particleMat.opacity = 0

        heartLight.color.setHex(0xf43f5e)
        ambientMat.color.setHex(0xf43f5e)
        scene.fog.color.setHex(0x0a0518)
      }
      // STAGE 2: HEART → LUNGS (0.22 to 0.48)
      else if (p > 0.22 && p <= 0.48) {
        const stageP = (p - 0.22) / 0.26
        const lungsBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.05

        lungsMesh.scale.set(lungsBreath, lungsBreath, 1)
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

        lungsLight.color.setHex(0x06b6d4)
        ambientMat.color.setHex(0x06b6d4)
        scene.fog.color.setHex(0x021c16)
      }
      // STAGE 3: LUNGS → KIDNEYS (0.48 to 0.72)
      else if (p > 0.48 && p <= 0.72) {
        const stageP = (p - 0.48) / 0.24
        const kidneyPulse = 1 + Math.sin(elapsedTime * 3.2) * 0.05

        kidneyMesh.scale.set(kidneyPulse, kidneyPulse, 1)
        kidneyMesh.position.x = lerp(rightOffsetX, rightOffsetX - 0.4, stageP)
        kidneyMesh.position.y = lerp(0, -0.8, stageP)
        kidneyMesh.position.z = lerp(0, -3.5, stageP)
        kidneyMat.opacity = lerp(0.95, 0.35, stageP)

        lungsMat.opacity = lerp(0.25, 0.05, stageP)
        heartMat.opacity = lerp(0.1, 0.05, stageP)

        humanGroup.position.x = rightOffsetX
        humanGroup.position.z = lerp(-12, 0, stageP)
        spineMat.opacity = lerp(0, 0.8, stageP)
        particleMat.opacity = lerp(0, 0.9, stageP)

        kidneyLight.color.setHex(0xf59e0b)
        ambientMat.color.setHex(0xf59e0b)
        scene.fog.color.setHex(0x1e0f04)
      }
      // STAGE 4 & 5: HOLOGRAPHIC HUMAN ANATOMY
      else {
        const stageP = (p - 0.72) / 0.28

        humanGroup.position.x = rightOffsetX
        humanGroup.rotation.y = elapsedTime * 0.25
        humanGroup.position.z = lerp(0, 1.2, stageP)
        spineMat.opacity = lerp(0.8, 0.6, stageP)
        particleMat.opacity = lerp(0.9, 0.75, stageP)

        heartMat.opacity = lerp(0.1, 0, stageP)
        lungsMat.opacity = lerp(0.05, 0, stageP)
        kidneyMat.opacity = lerp(0.35, 0, stageP)

        ambientMat.color.setHex(0x6366f1)
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
