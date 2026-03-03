import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { analyzeImage } from './gemini';
import { saveScan } from './storage/scans';
import { generateFileName } from './helper';
import { ScanItem } from '../types';

export interface ProcessScanOptions {
  imageUri: string;
  location?: { country?: string; city?: string };
  originalFileName?: string;
}

export interface ProcessScanResult {
  scanItem: ScanItem;
  processedImageUri: string;
}

/**
 * Process and resize an image for scanning
 */
async function processImage(
  imageUri: string,
  originalFileName?: string
): Promise<{ processedUri: string; finalUri: string }> {
  const imageRef = await ImageManipulator.ImageManipulator.manipulate(imageUri)
    .resize({
      width: 1024,
    })
    .renderAsync();

  const tempResult = await imageRef.saveAsync({
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  // If originalFileName is provided, create a properly named file
  if (originalFileName) {
    const fileName = generateFileName(originalFileName);
    const tempDir = tempResult.uri.substring(0, tempResult.uri.lastIndexOf('/') + 1);
    const fileUri = `${tempDir}${fileName}`;

    const sourceFile = new File(tempResult.uri);
    const destFile = new File(fileUri);
    await sourceFile.copy(destFile);

    return { processedUri: tempResult.uri, finalUri: fileUri };
  }

  return { processedUri: tempResult.uri, finalUri: tempResult.uri };
}

/**
 * Simulate analysis delay when credits are used up
 */
async function simulateAnalysisDelay(delayMs: number = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Process a scan: analyze image, create scan item, and save it
 */
export async function processScan(options: ProcessScanOptions): Promise<ProcessScanResult> {
  const { imageUri, location, originalFileName } = options;

  // Process and resize the image
  const { processedUri, finalUri } = await processImage(imageUri, originalFileName);

  // Analyze with Gemini
  const analysis = await analyzeImage(finalUri, location);

  // Create scan item
  const scanItem: ScanItem = {
    id: Date.now().toString(),
    ...analysis,
    date: new Date().toISOString(),
  };

  // Save scan to storage
  await saveScan(scanItem);

  return {
    scanItem,
    processedImageUri: processedUri,
  };
}

/**
 * Check if user has used up their credits
 */
export function hasUsedUpCredits(
  requestCount: number | null | undefined,
  isPremium: boolean,
  requestAllocations: number
): boolean {
  if (isPremium) return false;
  if (requestCount === null || requestCount === undefined) return false;
  return requestCount >= requestAllocations;
}

/**
 * Process scan with credit check and delay simulation when credits are used up
 */
export async function processScanWithCreditCheck(
  options: ProcessScanOptions & {
    requestCount: number | null | undefined;
    isPremium: boolean;
    requestAllocations: number;
  }
): Promise<ProcessScanResult | 'no-credit'> {
  const { requestCount, isPremium, requestAllocations, ...scanOptions } = options;

  // Check if user has used up credits BEFORE analysis
  const hasUsedUp = hasUsedUpCredits(requestCount, isPremium, requestAllocations);

  if (hasUsedUp) {
    // Simulate analysis delay to show the analyzing overlay
    await simulateAnalysisDelay(2000);
    // Return null to indicate credits are used up
    return 'no-credit';
  }

  // Process the scan normally
  return await processScan(scanOptions);
}
