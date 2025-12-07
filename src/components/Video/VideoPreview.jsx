import React, { useState, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import Button from '../UI/Button'

const VideoPreview = ({ videoUrl, thumbnail, className }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        className="w-full h-full object-contain max-h-64"
        onEnded={handleVideoEnd}
        muted={isMuted}
        loop
      />
      
      {/* Overlay Controls */}
      <div 
        className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all transform hover:scale-105"
            >
              <Play className="h-8 w-8 text-gray-900" />
            </button>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-transform duration-300 ${
            showControls || !isPlaying ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div 
                  className="bg-white h-1 rounded-full transition-all"
                  style={{ 
                    width: videoRef.current ? 
                      `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` : '0%' 
                  }}
                />
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(videoUrl, '_blank')}
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Fullscreen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPreview