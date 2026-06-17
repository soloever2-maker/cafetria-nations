"use client"

import { useCallback, useRef, useEffect } from "react"

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    // Create audio element with a simple notification tone
    // Using Web Audio API to generate a simple tone
    if (typeof window !== "undefined" && !isInitialized.current) {
      isInitialized.current = true
    }
  }, [])

  const playSound = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      // Create audio context for a simple notification sound
      const AudioContext = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
      const audioContext = new AudioContext()

      // Create oscillator for the notification tone
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configure the sound - a pleasant two-tone notification
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5
      oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1) // C#6
      oscillator.type = "sine"

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02)
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.12)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)

      // Play a second tone after a short delay
      setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()

        osc2.connect(gain2)
        gain2.connect(audioContext.destination)

        osc2.frequency.setValueAtTime(1318.51, audioContext.currentTime) // E6
        osc2.type = "sine"

        gain2.gain.setValueAtTime(0, audioContext.currentTime)
        gain2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.02)
        gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25)

        osc2.start(audioContext.currentTime)
        osc2.stop(audioContext.currentTime + 0.25)
      }, 150)
    } catch (error) {
      console.error("Failed to play notification sound:", error)
    }
  }, [])

  return { playSound }
}
