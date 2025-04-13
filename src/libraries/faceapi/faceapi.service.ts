import { Person } from '@/domain/person/Person';
import * as faceapi from '@vladmandic/face-api';
import * as fs from 'fs';
import * as path from 'path';

// Patch nodejs environment for face-api
const { Canvas, Image, loadImage } = require('canvas');
faceapi.env.monkeyPatch({ Canvas, Image, ImageData: Canvas.ImageData, createCanvasElement: () => new Canvas() });

export class FaceApiService {
  private modelsLoaded = false;
  private labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[] = [];
  private faceMatcher: faceapi.FaceMatcher | null = null;

  /**
   * Loads the required face-api models
   */
  private async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      // Load the models from the node_modules
      const modelPath = path.join(process.cwd(), 'node_modules/@vladmandic/face-api/model');
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      
      this.modelsLoaded = true;
      console.log('Face-api models loaded successfully');
    } catch (error) {
      console.error('Error loading face-api models:', error);
      throw new Error(`Failed to load models: ${(error as any).message}`);
    }
  }

  /**
   * Loads trained face descriptors from a directory
   * @param trainingDir Directory containing the face images organized by person
   */
  public async loadTrainingData(trainingDir = './training'): Promise<void> {
    await this.loadModels();
    
    if (!fs.existsSync(trainingDir)) {
      console.warn(`Training directory ${trainingDir} not found. No faces will be recognized.`);
      return;
    }
    
    const personDirs = fs.readdirSync(trainingDir)
      .filter(item => {
        const itemPath = path.join(trainingDir, item);
        return fs.existsSync(itemPath) && fs.statSync(itemPath).isDirectory();
      });
    
    this.labeledFaceDescriptors = [];
    
    for (const personName of personDirs) {
      const personDir = path.join(trainingDir, personName);
      const imageFiles = fs.readdirSync(personDir)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
      
      if (imageFiles.length === 0) continue;
      
      console.log(`Processing training images for ${personName}...`);
      const faceDescriptors: Float32Array[] = [];
      
      for (const imageFile of imageFiles) {
        const imagePath = path.join(personDir, imageFile);
        try {
          // Only process actual image files (skip README.txt, etc.)
          if (!fs.statSync(imagePath).isFile() || !imagePath.match(/\.(jpg|jpeg|png)$/i)) {
            continue;
          }
          
          // Check if the file has content
          if (fs.statSync(imagePath).size === 0) {
            console.warn(`Skipping empty image file: ${imagePath}`);
            continue;
          }
          
          // Load and process the image
          const img = await loadImage(imagePath);
          
          // Get image dimensions
          const imgWidth = img.width;
          const imgHeight = img.height;
          
          // Skip if image is too small
          if (imgWidth < 50 || imgHeight < 50) {
            console.warn(`Skipping too small image: ${imagePath} (${imgWidth}x${imgHeight})`);
            continue;
          }
          
          // Create canvas and context to process image
          const canvas = new Canvas(imgWidth, imgHeight);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
          
          // Detect a single face in the training image
          const detection = await faceapi
            .detectSingleFace(canvas)
            .withFaceLandmarks()
            .withFaceDescriptor();
          
          // Add the face descriptor to the array if a face was detected
          if (detection) {
            faceDescriptors.push(detection.descriptor);
            console.log(`Processed training image: ${imagePath}`);
          } else {
            console.warn(`No face detected in training image: ${imagePath}`);
          }
        } catch (error) {
          console.error(`Error processing training image ${imagePath}:`, error);
        }
      }
      
      // Create a labeled face descriptor if at least one face was detected
      if (faceDescriptors.length > 0) {
        const labeledDescriptor = new faceapi.LabeledFaceDescriptors(personName, faceDescriptors);
        this.labeledFaceDescriptors.push(labeledDescriptor);
        console.log(`Added ${faceDescriptors.length} descriptors for ${personName}`);
      } else {
        console.warn(`No valid face descriptors were found for ${personName}`);
      }
    }
    
    // Create a face matcher with the labeled descriptors
    if (this.labeledFaceDescriptors.length > 0) {
      this.faceMatcher = new faceapi.FaceMatcher(this.labeledFaceDescriptors, 0.6);
      console.log(`Loaded training data for ${this.labeledFaceDescriptors.length} people`);
    } else {
      console.warn('No valid training data was loaded. The app will only detect faces without recognition.');
    }
  }

  /**
   * Recognizes people in an image
   * @param imagePath Path to the image file to analyze
   * @returns Array of recognized people with their names and probabilities
   */
  async recognizePeople(imagePath: string): Promise<Person[]> {
    try {
      // Check if the image exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found at path: ${imagePath}`);
      }
      
      // Load models if not already loaded
      await this.loadModels();
      
      // Check if the image is a valid image file
      if (!imagePath.match(/\.(jpg|jpeg|png)$/i)) {
        throw new Error('The provided file is not a supported image format (jpg, jpeg, png)');
      }
      
      // Get the file size - if it's 0, it's an empty placeholder
      const stats = fs.statSync(imagePath);
      if (stats.size === 0) {
        console.warn('The image file is empty. Please provide a valid image file.');
        return [new Person('No image data', 0)];
      }
      
      try {
        // Load the image using canvas
        const img = await loadImage(imagePath);
        
        // Create a canvas
        const canvas = new Canvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Detect all faces in the image with landmarks and descriptors
        const detections = await faceapi
          .detectAllFaces(canvas)
          .withFaceLandmarks()
          .withFaceDescriptors();
                
        const recognizedPeople: Person[] = [];
        
        // If we have training data, use it to match faces
        if (this.faceMatcher) {
          for (const detection of detections) {
            const match = this.faceMatcher.findBestMatch(detection.descriptor);
            
            // Convert distance to similarity (1 - distance)
            // face-api returns distance where 0 is a perfect match
            const similarity = 1 - match.distance;
            
            // Include all matches (including "unknown") with the calculated confidence
            if (match.label !== 'unknown') {
              recognizedPeople.push(new Person(match.label, similarity));
            } else {
              // For unknown faces, assign a low probability
              recognizedPeople.push(new Person('Unknown Person', 0));
            }
          }
        } else {
          // If no training data, report all faces as unknown
          detections.forEach((_, index) => {
            recognizedPeople.push(new Person(`Unknown Person ${index + 1}`, 0));
          });
        }
        
        return recognizedPeople;
      } catch (imageError) {
        console.error('Error processing the image:', imageError);
        throw new Error(`Failed to process the image: ${(imageError as any).message}`);
      }
    } catch (error) {
      console.error('Error in face recognition service:', error);
      throw new Error(`Face recognition failed: ${(error as any).message}`);
    }
  }
} 