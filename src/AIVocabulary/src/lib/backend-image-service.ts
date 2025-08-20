/**
 * Backend Integration Service
 * Connects the Next.js frontend with the Node.js backend for image generation
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

export interface BackendCharacterProfile {
  characterId: string;
  originalImageUrl: string;
  processedImageUrl: string;
  analysis: {
    hairColor: string;
    eyeColor: string;
    age: string;
    gender: string;
    artStyle: string;
    description: string;
  };
  features: {
    dominantColors: string[];
    dimensions: { width: number; height: number; };
  };
  createdAt: string;
}

export interface BackendImageGeneration {
  success: boolean;
  imageId: string;
  imageUrl: string;
  prompt: string;
  consistencyScore: number;
  generationTime: number;
}

export class BackendImageService {
  private static instance: BackendImageService;
  private characterProfiles: Map<string, BackendCharacterProfile> = new Map();

  static getInstance(): BackendImageService {
    if (!BackendImageService.instance) {
      BackendImageService.instance = new BackendImageService();
    }
    return BackendImageService.instance;
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      console.log('🔗 BACKEND STATUS:', data.status, data.openai ? '(OpenAI Enabled)' : '(Simulation Mode)');
      return data.status === 'healthy';
    } catch (error) {
      console.log('⚠️ BACKEND UNAVAILABLE: Using frontend simulation');
      return false;
    }
  }

  /**
   * Upload character image to backend for analysis
   */
  async uploadCharacterImage(file: File): Promise<BackendCharacterProfile | null> {
    try {
      console.log('📤 UPLOADING: Character image to backend');
      
      const formData = new FormData();
      formData.append('character', file);

      const response = await fetch(`${BACKEND_URL}/api/character/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.characterProfiles.set(data.characterId, data.profile);
        console.log('✅ BACKEND: Character uploaded and analyzed:', data.characterId);
        return data.profile;
      }

      throw new Error('Upload unsuccessful');

    } catch (error) {
      console.error('❌ BACKEND: Character upload failed:', error);
      return null;
    }
  }

  /**
   * Generate character-consistent image via backend
   */
  async generateCharacterImage(
    characterId: string,
    action: string,
    sceneDescription: string,
    style: 'manga' | 'anime' | 'realistic' = 'manga',
    pageNumber: number = 1
  ): Promise<BackendImageGeneration | null> {
    try {
      console.log('🎨 BACKEND: Generating image for character:', characterId);
      console.log('🎭 ACTION:', action);
      console.log('🏞️ SCENE:', sceneDescription);

      const characterProfile = this.characterProfiles.get(characterId);
      if (!characterProfile) {
        throw new Error('Character profile not found');
      }

      const prompt = `${style} style illustration of ${characterProfile.analysis.description} ${action} in ${sceneDescription}. Consistent character design, high quality digital art.`;

      const response = await fetch(`${BACKEND_URL}/api/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          prompt,
          sceneDescription,
          action,
          style,
          pageNumber
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ BACKEND: Image generated successfully');
        console.log('🎯 CONSISTENCY SCORE:', data.consistencyScore);
        console.log('⏱️ GENERATION TIME:', data.generationTime + 'ms');
        return data;
      }

      throw new Error('Generation unsuccessful');

    } catch (error) {
      console.error('❌ BACKEND: Image generation failed:', error);
      return null;
    }
  }

  /**
   * Get character profile from backend
   */
  async getCharacterProfile(characterId: string): Promise<BackendCharacterProfile | null> {
    try {
      // Check local cache first
      if (this.characterProfiles.has(characterId)) {
        return this.characterProfiles.get(characterId)!;
      }

      // Fetch from backend
      const response = await fetch(`${BACKEND_URL}/api/character/${characterId}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.success) {
        this.characterProfiles.set(characterId, data.profile);
        return data.profile;
      }

      return null;

    } catch (error) {
      console.error('❌ BACKEND: Failed to get character profile:', error);
      return null;
    }
  }

  /**
   * Process uploaded character file for character consistency
   */
  async processCharacterFile(file: File): Promise<{
    characterId: string;
    profile: BackendCharacterProfile;
    imageUrl: string;
  } | null> {
    try {
      // First check if backend is available
      const backendAvailable = await this.checkBackendHealth();
      
      if (!backendAvailable) {
        console.log('⚠️ BACKEND UNAVAILABLE: Creating simulation profile');
        return this.createSimulationProfile(file);
      }

      // Upload to backend for real processing
      const profile = await this.uploadCharacterImage(file);
      
      if (profile) {
        return {
          characterId: profile.characterId,
          profile,
          imageUrl: profile.processedImageUrl
        };
      }

      // Fallback to simulation
      return this.createSimulationProfile(file);

    } catch (error) {
      console.error('❌ CHARACTER PROCESSING ERROR:', error);
      return this.createSimulationProfile(file);
    }
  }

  /**
   * Create simulation profile when backend is unavailable
   */
  private async createSimulationProfile(file: File): Promise<{
    characterId: string;
    profile: BackendCharacterProfile;
    imageUrl: string;
  }> {
    const characterId = 'sim_' + Math.random().toString(36).substring(2, 15);
    const imageUrl = URL.createObjectURL(file);
    
    const simulationProfile: BackendCharacterProfile = {
      characterId,
      originalImageUrl: imageUrl,
      processedImageUrl: imageUrl,
      analysis: {
        hairColor: "dark brown",
        eyeColor: "brown",
        age: "young adult",
        gender: "female", 
        artStyle: "manga",
        description: "Young adult female character with dark hair and friendly expression, manga art style"
      },
      features: {
        dominantColors: ['#8B4513', '#F4E4BC', '#2F1B14'],
        dimensions: { width: 512, height: 512 }
      },
      createdAt: new Date().toISOString()
    };

    this.characterProfiles.set(characterId, simulationProfile);
    
    console.log('🔄 SIMULATION: Created character profile:', characterId);
    
    return {
      characterId,
      profile: simulationProfile,
      imageUrl
    };
  }
}

// Export singleton instance
export const backendImageService = BackendImageService.getInstance();
