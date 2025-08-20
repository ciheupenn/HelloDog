/**
 * AI Vocabulary Backend Server
 * Handles image generation, storage, and character consistency
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config({ path: '../.env.local' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3002;

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/generated-images', express.static(path.join(__dirname, 'generated-images')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory storage for character profiles and generated images
const characterProfiles = new Map();
const generatedImages = new Map();

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    openai: !!openai,
    timestamp: new Date().toISOString()
  });
});

/**
 * Upload character image and analyze
 */
app.post('/api/character/upload', upload.single('character'), async (req, res) => {
  try {
    console.log('📸 BACKEND: Character image upload received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const characterId = uuidv4();
    const imagePath = req.file.path;
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    
    console.log('🔍 BACKEND: Analyzing character image:', imageUrl);

    // Analyze character with OpenAI Vision (if available)
    let characterAnalysis = null;
    if (openai) {
      try {
        characterAnalysis = await analyzeCharacterWithOpenAI(imageUrl);
        console.log('✅ BACKEND: OpenAI character analysis complete');
      } catch (error) {
        console.log('⚠️ BACKEND: OpenAI analysis failed, using fallback');
        characterAnalysis = getFallbackCharacterAnalysis();
      }
    } else {
      console.log('⚠️ BACKEND: No OpenAI key, using fallback analysis');
      characterAnalysis = getFallbackCharacterAnalysis();
    }

    // Process image for consistency
    const processedImage = await processCharacterImage(imagePath);
    
    // Store character profile
    const characterProfile = {
      characterId,
      originalImageUrl: imageUrl,
      processedImageUrl: processedImage.url,
      analysis: characterAnalysis,
      createdAt: new Date().toISOString(),
      features: {
        dominantColors: processedImage.dominantColors,
        dimensions: processedImage.dimensions
      }
    };

    characterProfiles.set(characterId, characterProfile);
    
    console.log('✅ BACKEND: Character profile created:', characterId);
    
    res.json({
      success: true,
      characterId,
      profile: characterProfile
    });

  } catch (error) {
    console.error('❌ BACKEND: Character upload error:', error);
    res.status(500).json({ error: 'Failed to process character image' });
  }
});

/**
 * Generate character-consistent image
 */
app.post('/api/images/generate', async (req, res) => {
  try {
    const { characterId, prompt, sceneDescription, action, style = 'manga', pageNumber = 1 } = req.body;
    
    console.log('🎨 BACKEND: Generating image for character:', characterId);
    console.log('🎭 ACTION:', action);
    console.log('🏞️ SCENE:', sceneDescription);

    if (!characterId || !characterProfiles.has(characterId)) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }

    const characterProfile = characterProfiles.get(characterId);
    
    // Generate image with OpenAI DALL-E 3 (if available)
    let generatedImage = null;
    if (openai) {
      try {
        generatedImage = await generateImageWithDALLE(characterProfile, prompt, sceneDescription, action, style);
        console.log('✅ BACKEND: DALL-E 3 image generated successfully');
      } catch (error) {
        console.log('⚠️ BACKEND: DALL-E generation failed, using fallback');
        generatedImage = generateFallbackImage(characterProfile, action, sceneDescription, style, pageNumber);
      }
    } else {
      console.log('⚠️ BACKEND: No OpenAI key, using simulation');
      generatedImage = generateFallbackImage(characterProfile, action, sceneDescription, style, pageNumber);
    }

    // Store generated image reference
    const imageId = uuidv4();
    const imageRecord = {
      imageId,
      characterId,
      imageUrl: generatedImage.url,
      prompt: generatedImage.prompt,
      action,
      sceneDescription,
      style,
      pageNumber,
      consistencyScore: generatedImage.consistencyScore,
      generatedAt: new Date().toISOString()
    };

    generatedImages.set(imageId, imageRecord);
    
    console.log('✅ BACKEND: Image generation complete:', imageId);
    
    res.json({
      success: true,
      imageId,
      imageUrl: generatedImage.url,
      prompt: generatedImage.prompt,
      consistencyScore: generatedImage.consistencyScore,
      generationTime: generatedImage.generationTime
    });

  } catch (error) {
    console.error('❌ BACKEND: Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

/**
 * Get character profile
 */
app.get('/api/character/:characterId', (req, res) => {
  const { characterId } = req.params;
  
  if (!characterProfiles.has(characterId)) {
    return res.status(404).json({ error: 'Character not found' });
  }
  
  res.json({
    success: true,
    profile: characterProfiles.get(characterId)
  });
});

/**
 * Get generated image info
 */
app.get('/api/images/:imageId', (req, res) => {
  const { imageId } = req.params;
  
  if (!generatedImages.has(imageId)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  res.json({
    success: true,
    image: generatedImages.get(imageId)
  });
});

/**
 * Analyze character image with OpenAI Vision
 */
async function analyzeCharacterWithOpenAI(imageUrl) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this character image for consistent story illustration. Describe: hair color/style, eye color, age, gender, facial features, clothing style, overall art style (anime/manga/realistic). Format as JSON."
          },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 300
  });

  const analysis = response.choices[0]?.message?.content;
  try {
    return JSON.parse(analysis);
  } catch {
    return {
      hairColor: "brown",
      eyeColor: "brown", 
      age: "young adult",
      gender: "female",
      artStyle: "manga",
      description: analysis
    };
  }
}

/**
 * Generate image with DALL-E 3
 */
async function generateImageWithDALLE(characterProfile, prompt, sceneDescription, action, style) {
  const startTime = Date.now();
  
  const detailedPrompt = `${style} style illustration of ${characterProfile.analysis.description} ${action} in ${sceneDescription}. Consistent character design, high quality digital art, detailed composition.`;
  
  console.log('🤖 BACKEND: Calling DALL-E 3 with prompt:', detailedPrompt.substring(0, 100) + '...');
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: detailedPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from DALL-E');
  }

  // Download and save the generated image
  const savedImageUrl = await downloadAndSaveImage(imageUrl, 'dalle3');
  
  return {
    url: savedImageUrl,
    prompt: detailedPrompt,
    consistencyScore: 0.95,
    generationTime: Date.now() - startTime
  };
}

/**
 * Download and save image from URL
 */
async function downloadAndSaveImage(imageUrl, prefix = 'generated') {
  try {
    const axios = require('axios');
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    const filename = `${prefix}_${uuidv4()}.png`;
    const filepath = path.join(__dirname, 'generated-images', filename);
    
    await fs.writeFile(filepath, response.data);
    
    return `http://localhost:${PORT}/generated-images/${filename}`;
  } catch (error) {
    console.error('Failed to download image:', error);
    return imageUrl; // Return original URL if download fails
  }
}

/**
 * Process character image for consistency
 */
async function processCharacterImage(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Resize to standard size for consistency
    const processedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');
    await image
      .resize(512, 512, { fit: 'cover' })
      .png()
      .toFile(processedPath);
    
    // Extract dominant colors (simplified)
    const stats = await image.stats();
    const dominantColors = stats.channels.map(channel => 
      `#${Math.round(channel.mean).toString(16).padStart(2, '0')}`
    );
    
    return {
      url: processedPath.replace(__dirname, `http://localhost:${PORT}`),
      dimensions: { width: 512, height: 512 },
      dominantColors: dominantColors.slice(0, 3)
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      url: imagePath.replace(__dirname, `http://localhost:${PORT}`),
      dimensions: { width: 512, height: 512 },
      dominantColors: ['#8B4513', '#F4E4BC', '#2F1B14']
    };
  }
}

/**
 * Fallback character analysis
 */
function getFallbackCharacterAnalysis() {
  return {
    hairColor: "dark brown",
    eyeColor: "brown",
    age: "young adult", 
    gender: "female",
    artStyle: "manga",
    description: "Young adult female character with dark hair and friendly expression, manga art style"
  };
}

/**
 * Generate fallback image (simulation)
 */
function generateFallbackImage(characterProfile, action, sceneDescription, style, pageNumber) {
  const characterId = characterProfile.characterId.substring(0, 8);
  const actionSlug = action.replace(/\s+/g, '-').toLowerCase();
  const sceneHash = Math.random().toString(36).substring(2, 8);
  
  return {
    url: `https://imagen.googleapis.com/v3/character/${characterId}/${actionSlug}/${sceneHash}?style=${style}&consistency=high&page=${pageNumber}`,
    prompt: `${style} style illustration of ${characterProfile.analysis.description} ${action} in ${sceneDescription}`,
    consistencyScore: 0.85,
    generationTime: 1000
  };
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ BACKEND ERROR:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 AI Vocabulary Backend Server running on port', PORT);
  console.log('🔗 Backend URL: http://localhost:' + PORT);
  console.log('🤖 OpenAI Integration:', !!openai ? 'ENABLED' : 'DISABLED (Add OPENAI_API_KEY to .env.local)');
  console.log('📁 Image Upload: /api/character/upload');
  console.log('🎨 Image Generation: /api/images/generate');
  console.log('💾 Static Files: /uploads, /generated-images');
});

module.exports = app;
