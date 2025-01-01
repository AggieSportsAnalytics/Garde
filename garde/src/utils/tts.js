export async function playTextToSpeech(text) {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        voice_settings: {
          stability: 0.8,  // Higher stability for more consistent voice
          similarity_boost: 0.7,  // Good balance of similarity
          style: 0.0,  // Neutral style for natural speech
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    await audio.play();

    // Cleanup
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (error) {
    console.error('Error playing TTS:', error);
  }
} 