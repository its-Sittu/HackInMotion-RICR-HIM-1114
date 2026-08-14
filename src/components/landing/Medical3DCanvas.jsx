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

    // 1. Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x030712, 0.035)

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 8)

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const heartLight = new THREE.PointLight(0xf43f5e, 3.5, 15)
    heartLight.position.set(0, 0, 4)
    scene.add(heartLight)

    const lungsLight = new THREE.PointLight(0x06b6d4, 3.5, 15)
    lungsLight.position.set(2, 2, 2)
    scene.add(lungsLight)

    const kidneyLight = new THREE.PointLight(0xf59e0b, 3.5, 15)
    kidneyLight.position.set(-2, -2, 2)
    scene.add(kidneyLight)

    // 5. Texture Loader for Organ Sprites
    const textureLoader = new THREE.TextureLoader()

    // Helper to create 3D organ plane mesh
    const createOrganMesh = (textureUrl, size = 3.5) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const texture = textureLoader.load(textureUrl)
      texture.colorSpace = THREE.SRGBColorSpace
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.3,
        metalness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide
      })
      return new THREE.Mesh(geometry, material)
    }

    // Organ Meshes
    const heartMesh = createOrganMesh('/images/heart.png', 3.8)
    heartMesh.position.set(0, 0, 0)
    scene.add(heartMesh)

    const lungsMesh = createOrganMesh('/images/lungs.png', 4.2)
    lungsMesh.position.set(5, 0, -3)
    lungsMesh.material.opacity = 0
    scene.add(lungsMesh)

    const kidneyMesh = createOrganMesh('/images/kidney.png', 3.4)
    kidneyMesh.position.set(-5, -5, -6)
    kidneyMesh.material.opacity = 0
    scene.add(kidneyMesh)

    // 6. Holographic Human Body Geometry (Particle System + Wireframe Outline)
    const humanGroup = new THREE.Group()

    // Human Holographic Spine / Torso Wireframe
    const spineGeo = new THREE.CylinderGeometry(0.6, 1.2, 5.5, 16, 24, true)
    const spineMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0
    })
    const spineMesh = new THREE.Mesh(spineGeo, spineMat)
    humanGroup.add(spineMesh)

    // Holographic Anatomy Particles
    const particleCount = 600
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      // Cylinder outline distribution
      const radius = 0.6 + Math.random() * 0.8
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 6

      particlePos[i * 3] = Math.cos(theta) * radius
      particlePos[i * 3 + 1] = y
      particlePos[i * 3 + 2] = Math.sin(theta) * radius

      // Soft Cyan/Indigo palette
      particleColors[i * 3] = 0.38 + Math.random() * 0.2
      particleColors[i * 3 + 1] = 0.4 + Math.random() * 0.4
      particleColors[i * 3 + 2] = 0.95
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    })
    const humanParticles = new THREE.Points(particleGeo, particleMat)
    humanGroup.add(humanParticles)

    humanGroup.position.set(0, 0, -10)
    scene.add(humanGroup)

    // 7. Ambient Floating Blood Flow / Bio-Particles
    const ambientParticleCount = 350
    const ambientGeo = new THREE.BufferGeometry()
    const ambientPos = new Float32Array(ambientParticleCount * 3)

    for (let i = 0; i < ambientParticleCount; i++) {
      ambientPos[i * 3] = (Math.random() - 0.5) * 16
      ambientPos[i * 3 + 1] = (Math.random() - 0.5) * 16
      ambientPos[i * 3 + 2] = (Math.random() - 0.5) * 16
    }

    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3))
    const ambientMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    })
    const ambientParticles = new THREE.Points(ambientGeo, ambientMat)
    scene.add(ambientParticles)

    // 8. Animation Frame Loop with Lerp & Scroll Interpolation
    let animationFrameId
    let clock = new THREE.Clock()

    // Smooth Lerp helper
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const p = Math.max(0, Math.min(1, progressRef.current))

      // Rotate ambient particles
      ambientParticles.rotation.y = elapsedTime * 0.04

      // STAGE 1: HERO - HEART (0.0 to 0.22)
      // Pulsing heartbeat animation
      const heartBeat = 1 + Math.sin(elapsedTime * 5.5) * 0.06
      
      if (p <= 0.22) {
        const stageP = p / 0.22
        // Heart in center
        heartMesh.position.x = lerp(0, -1.8, stageP)
        heartMesh.position.y = lerp(0, 0.8, stageP)
        heartMesh.position.z = lerp(0, -1.5, stageP)
        heartMesh.scale.set(heartBeat, heartBeat, 1)
        heartMesh.material.opacity = lerp(1, 0.4, stageP)
        heartMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.15

        // Lungs emerging
        lungsMesh.position.x = lerp(4, 0, stageP)
        lungsMesh.position.y = lerp(-1, 0, stageP)
        lungsMesh.position.z = lerp(-4, 0, stageP)
        lungsMesh.material.opacity = lerp(0, 0.9, stageP)

        kidneyMesh.material.opacity = 0
        spineMat.opacity = 0
        particleMat.opacity = 0
      }
      // STAGE 2: HEART → LUNGS (0.22 to 0.48)
      else if (p > 0.22 && p <= 0.48) {
        const stageP = (p - 0.22) / 0.26
        // Lungs breathing in center
        const lungsBreath = 1 + Math.sin(elapsedTime * 2.8) * 0.04
        lungsMesh.scale.set(lungsBreath, lungsBreath, 1)
        lungsMesh.position.x = lerp(0, 1.8, stageP)
        lungsMesh.position.y = lerp(0, 1.2, stageP)
        lungsMesh.position.z = lerp(0, -2, stageP)
        lungsMesh.material.opacity = lerp(0.9, 0.2, stageP)

        heartMesh.material.opacity = lerp(0.4, 0.1, stageP)

        // Kidneys emerging
        kidneyMesh.position.x = lerp(-4, 0, stageP)
        kidneyMesh.position.y = lerp(-3, 0, stageP)
        kidneyMesh.position.z = lerp(-5, 0, stageP)
        kidneyMesh.material.opacity = lerp(0, 0.95, stageP)

        spineMat.opacity = 0
        particleMat.opacity = 0
      }
      // STAGE 3: LUNGS → KIDNEYS (0.48 to 0.72)
      else if (p > 0.48 && p <= 0.72) {
        const stageP = (p - 0.48) / 0.24
        // Kidneys filtration pulse
        const kidneyPulse = 1 + Math.sin(elapsedTime * 3.5) * 0.05
        kidneyMesh.scale.set(kidneyPulse, kidneyPulse, 1)
        kidneyMesh.position.x = lerp(0, -1.2, stageP)
        kidneyMesh.position.y = lerp(0, -1.5, stageP)
        kidneyMesh.position.z = lerp(0, -4, stageP)
        kidneyMesh.material.opacity = lerp(0.95, 0.3, stageP)

        lungsMesh.material.opacity = lerp(0.2, 0.05, stageP)
        heartMesh.material.opacity = lerp(0.1, 0.05, stageP)

        // Holographic Human Body revealing
        humanGroup.position.z = lerp(-12, 0, stageP)
        humanGroup.rotation.y = elapsedTime * 0.4
        spineMat.opacity = lerp(0, 0.75, stageP)
        particleMat.opacity = lerp(0, 0.85, stageP)
      }
      // STAGE 4 & 5: FULL HUMAN BODY & MEDISAFE SOLUTION (0.72 to 1.0)
      else {
        const stageP = (p - 0.72) / 0.28
        humanGroup.rotation.y = elapsedTime * 0.3
        humanGroup.position.z = lerp(0, 1.2, stageP)
        spineMat.opacity = lerp(0.75, 0.4, stageP)
        particleMat.opacity = lerp(0.85, 0.5, stageP)

        // Scale organ meshes down into anatomical alignment
        heartMesh.position.set(-0.3, 0.8, 0.4)
        heartMesh.scale.set(0.6, 0.6, 1)
        heartMesh.material.opacity = 0.65

        lungsMesh.position.set(0.1, 0.8, 0.2)
        lungsMesh.scale.set(0.8, 0.8, 1)
        lungsMesh.material.opacity = 0.65

        kidneyMesh.position.set(-0.1, -0.6, 0.2)
        kidneyMesh.scale.set(0.6, 0.6, 1)
        kidneyMesh.material.opacity = 0.65
      }

      // Camera gentle lerp motion based on scroll
      camera.position.z = lerp(8, 7.2, p)
      camera.position.y = lerp(0, -0.6 * Math.sin(p * Math.PI), 0.1)

      renderer.render(scene, camera)
    }

    animate()

    // 9. Resize Listener
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
