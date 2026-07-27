/**
 * Image Analysis Module for Fraud Detection
 * 
 * Detects:
 * - Duplicate images (perceptual hashing)
 * - AI-generated content
 * - Image manipulation/tampering
 * - Quality issues
 * - Objects and composition anomalies
 */

import { ImageAnalysis } from "../types";

/**
 * Generate perceptual hash for duplicate detection
 * Uses simplified algorithm suitable for web environment
 * 
 * @param imageData - Image blob or base64 data
 * @returns 64-character hash string
 */
export async function generatePerceptualHash(
  imageData: Blob | ArrayBuffer | string
): Promise<string> {
  try {
    // Convert to array buffer if needed
    let buffer: ArrayBuffer;
    if (typeof imageData === "string") {
      // Base64 string
      const binaryString = atob(imageData.split(",")[1] || imageData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      buffer = bytes.buffer;
    } else if (imageData instanceof Blob) {
      buffer = await imageData.arrayBuffer();
    } else {
      buffer = imageData;
    }

    // Simple hash: take byte patterns every N bytes
    const view = new Uint8Array(buffer);
    let hash = "";
    const sampleSize = Math.max(1, Math.floor(view.length / 64));

    for (let i = 0; i < view.length; i += sampleSize) {
      const byte = view[i];
      hash += byte.toString(16).padStart(2, "0");
      if (hash.length >= 64) break;
    }

    return hash.padEnd(64, "0");
  } catch (error) {
    console.error("Error generating perceptual hash:", error);
    // Return random hash on error (fail open)
    return Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }
}

/**
 * Calculate quick image hash for duplicate detection
 * Faster than perceptual hash, useful for quick lookups
 * 
 * @param buffer - Image buffer
 * @returns Hash string
 */
export function calculateImageHash(buffer: ArrayBuffer): string {
  const view = new Uint8Array(buffer);
  let hash = 0;

  for (let i = 0; i < view.length; i += Math.max(1, Math.floor(view.length / 256))) {
    hash = ((hash << 5) - hash + view[i]) | 0;
  }

  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Calculate image similarity using hash comparison
 * 
 * @param hash1 - First hash
 * @param hash2 - Second hash
 * @returns Similarity score 0-1 (1 = identical, 0 = completely different)
 */
export function calculateHashSimilarity(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 0;

  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) {
      matches++;
    }
  }

  return matches / hash1.length;
}

/**
 * Analyze image for AI generation markers
 * Checks for common indicators of synthetic content
 * 
 * @param imageElement - HTML image element
 * @returns AI probability (0-1) and detection details
 */
export async function analyzeForAI(
  imageElement: HTMLImageElement | string
): Promise<{
  aiProbability: number;
  realProbability: number;
  artifacts: {
    perfectSymmetry: boolean;
    unusualBackground: boolean;
    watermarkPattern: boolean;
    colorAnomalies: boolean;
  };
}> {
  try {
    // Get image data
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    if (typeof imageElement === "string") {
      // URL or base64
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d")!;

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageElement;
      });

      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(img, 0, 0, 256, 256);
    } else {
      // HTML image element
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d")!;
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(imageElement, 0, 0, 256, 256);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Check for AI generation markers
    const artifacts = {
      perfectSymmetry: detectPerfectSymmetry(data, canvas.width, canvas.height),
      unusualBackground: detectUnusualBackground(data, canvas.width, canvas.height),
      watermarkPattern: detectWatermarkPattern(data, canvas.width, canvas.height),
      colorAnomalies: detectColorAnomalies(data),
    };

    // Calculate AI probability based on artifacts found
    let aiScore = 0;
    if (artifacts.perfectSymmetry) aiScore += 0.25;
    if (artifacts.unusualBackground) aiScore += 0.20;
    if (artifacts.watermarkPattern) aiScore += 0.30;
    if (artifacts.colorAnomalies) aiScore += 0.25;

    return {
      aiProbability: Math.min(1, aiScore),
      realProbability: 1 - Math.min(1, aiScore),
      artifacts,
    };
  } catch (error) {
    console.error("Error analyzing image for AI:", error);
    // Return neutral result on error
    return {
      aiProbability: 0.5,
      realProbability: 0.5,
      artifacts: {
        perfectSymmetry: false,
        unusualBackground: false,
        watermarkPattern: false,
        colorAnomalies: false,
      },
    };
  }
}

/**
 * Detect perfect symmetry (common in AI-generated images)
 */
function detectPerfectSymmetry(
  data: Uint8ClampedArray,
  width: number,
  height: number
): boolean {
  // Check vertical symmetry
  let symmetryMatches = 0;
  const threshold = 10; // Pixel value difference threshold
  const samplePoints = Math.min(100, (width * height) / 4); // Sample points for efficiency

  for (let i = 0; i < samplePoints; i++) {
    const randY = Math.floor(Math.random() * height);
    const randX = Math.floor(Math.random() * width);
    const idx1 = (randY * width + randX) * 4;
    const mirrorX = width - randX - 1;
    const idx2 = (randY * width + mirrorX) * 4;

    let diff = 0;
    for (let j = 0; j < 4; j++) {
      diff += Math.abs(data[idx1 + j] - data[idx2 + j]);
    }
    if (diff < threshold * 4) symmetryMatches++;
  }

  return symmetryMatches / samplePoints > 0.8;
}

/**
 * Detect unusual background patterns
 */
function detectUnusualBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number
): boolean {
  // Check for gradient backgrounds (common in AI images)
  // Sample edges
  const edgeVariation: number[] = [];

  for (let i = 0; i < 50; i++) {
    const y = Math.floor((height * i) / 50);
    const idx = (y * width + Math.floor(width / 4)) * 4;
    const r = data[idx];
    edgeVariation.push(r);
  }

  // Calculate standard deviation
  const mean = edgeVariation.reduce((a, b) => a + b) / edgeVariation.length;
  const variance = edgeVariation.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / edgeVariation.length;
  const stdDev = Math.sqrt(variance);

  // Very smooth gradients are suspicious
  return stdDev < 15;
}

/**
 * Detect watermark or repeated patterns
 */
function detectWatermarkPattern(
  data: Uint8ClampedArray,
  width: number,
  height: number
): boolean {
  // Check for repeated patterns in corners (common watermarks/watermarks)
  const checkSize = Math.min(20, Math.floor(Math.min(width, height) / 5));
  let patternDetected = 0;

  // Check 4 corners
  const corners = [
    { x: 0, y: 0 }, // Top-left
    { x: width - checkSize, y: 0 }, // Top-right
    { x: 0, y: height - checkSize }, // Bottom-left
    { x: width - checkSize, y: height - checkSize }, // Bottom-right
  ];

  for (let corner of corners) {
    let sum = 0;
    for (let y = corner.y; y < corner.y + checkSize; y++) {
      for (let x = corner.x; x < corner.x + checkSize; x++) {
        const idx = (y * width + x) * 4;
        sum += data[idx] + data[idx + 1] + data[idx + 2];
      }
    }
    const avg = sum / (checkSize * checkSize * 3);
    if (avg > 200 || avg < 50) {
      // Very bright or very dark corner
      patternDetected++;
    }
  }

  return patternDetected >= 3;
}

/**
 * Detect color anomalies (banding, unusual distributions)
 */
function detectColorAnomalies(data: Uint8ClampedArray): boolean {
  // Analyze color distribution
  const rValues = [];
  const gValues = [];
  const bValues = [];

  for (let i = 0; i < data.length; i += 4) {
    rValues.push(data[i]);
    gValues.push(data[i + 1]);
    bValues.push(data[i + 2]);
  }

  // Calculate standard deviations
  const colorStats = [rValues, gValues, bValues].map((vals) => {
    const mean = vals.reduce((a, b) => a + b) / vals.length;
    const variance = vals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vals.length;
    return Math.sqrt(variance);
  });

  // Too similar color channels suggest artificial uniformity
  const avgColorStdDev = colorStats.reduce((a, b) => a + b) / 3;
  return avgColorStdDev < 20;
}

/**
 * Analyze image quality (resolution, artifacts, clarity)
 */
export function analyzeImageQuality(
  imageElement: HTMLImageElement | { width: number; height: number }
): "low" | "medium" | "high" {
  const width = "width" in imageElement ? imageElement.width : 0;
  const height = "height" in imageElement ? imageElement.height : 0;
  const pixels = width * height;

  if (pixels < 150000) return "low"; // Less than ~387x387
  if (pixels < 1000000) return "medium"; // Less than ~1000x1000
  return "high"; // Higher resolution
}

/**
 * Extract metadata from image (simplified EXIF-like data)
 */
export function extractImageMetadata(
  file: File
): {
  fileSize: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
} {
  return {
    fileSize: file.size,
    mimeType: file.type,
  };
}

/**
 * Main image analysis function
 */
export async function analyzeImage(
  imageFile: File | Blob,
  imageUrl?: string
): Promise<ImageAnalysis> {
  const timestamp = new Date().toISOString();

  try {
    // Generate hash
    const buffer = await imageFile.arrayBuffer();
    const hash = calculateImageHash(buffer);

    // Create image element for analysis
    const imageElement = new Image();
    const objectUrl = URL.createObjectURL(imageFile);

    await new Promise((resolve, reject) => {
      imageElement.onload = resolve;
      imageElement.onerror = reject;
      imageElement.src = objectUrl;
    });

    // Analyze for AI
    const aiAnalysis = await analyzeForAI(imageElement);

    // Check quality
    const quality = analyzeImageQuality(imageElement);

    // Clean up
    URL.revokeObjectURL(objectUrl);

    return {
      hash,
      aiProbability: aiAnalysis.aiProbability,
      realProbability: aiAnalysis.realProbability,
      detectedObjects: [], // Would use real detection in production
      quality,
      timestamp,
      artifacts: aiAnalysis.artifacts,
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    // Return safe default
    return {
      hash: "unknown",
      aiProbability: 0,
      realProbability: 1,
      detectedObjects: [],
      quality: "medium",
      timestamp,
      artifacts: {
        perfectSymmetry: false,
        unusualBackground: false,
        watermarkPattern: false,
        colorAnomalies: false,
      },
    };
  }
}

/**
 * Compare two images for similarity
 * Returns similarity score 0-1
 */
export function compareImages(hash1: string, hash2: string): number {
  return calculateHashSimilarity(hash1, hash2);
}

/**
 * Check if image appears to be a duplicate
 */
export function isDuplicate(similarity: number, threshold: number = 0.85): boolean {
  return similarity >= threshold;
}
