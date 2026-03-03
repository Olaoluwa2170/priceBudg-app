import { GoogleGenerativeAI } from '@google/generative-ai';
import { File } from 'expo-file-system';
import { ScanItem, SearchResultItem } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export async function searchItemsByDescription(
  description: string,
  location?: { country?: string; city?: string }
): Promise<SearchResultItem[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    let locationContext = '';
    if (location?.country || location?.city) {
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      locationContext = ` User's location: ${parts.join(', ')}. Consider regional pricing when estimating.`;
    }

    const prompt = `The user is searching for items they don't know the price of. They described: "${description}"

Return a JSON array of 3 to 5 possible products that match this description. Each object must have:
- "name": string (full product name, include brand if relevant)
- "estimatedPrice": number (estimated price in USD, e.g. 29.99)

Only return the JSON array, no other text. Example:
[{"name":"Apple AirPods Pro (2nd Gen)","estimatedPrice":249},{"name":"Sony WH-1000XM5","estimatedPrice":399}]
${locationContext}`;

    const result = await model.generateContent([{ text: prompt }]);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as { name: string; estimatedPrice: number }[];
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, 5).map((item, index) => ({
      id: `search-${Date.now()}-${index}`,
      name: item.name || 'Unknown item',
      estimatedPrice: typeof item.estimatedPrice === 'number' ? item.estimatedPrice : 0,
      imageUri: null,
    }));
  } catch (error) {
    console.error('Error searching items:', error);
    return [];
  }
}

export async function analyzeImage(
  imageUri: string,
  location?: { country?: string; city?: string }
): Promise<Omit<ScanItem, 'id' | 'date'>> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const file = new File(imageUri);
    const base64 = await file.base64();
    const mimeType = imageUri.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Build location context for the prompt
    let locationContext = '';
    if (location?.country || location?.city) {
      const locationParts = [];
      if (location.city) locationParts.push(location.city);
      if (location.country) locationParts.push(location.country);
      locationContext = `\n\nUser's location: ${locationParts.join(', ')}. Consider regional pricing and availability when estimating the price.`;
    }

    const prompt = `Analyze this image and identify the product. Return a JSON object with the following structure:
{
  // Product name (be specific, include brand and model if visible)
  "name": string,
  // "Estimated current price in USD (format as XXX.XX)"
  "price": number,
  // AI-Confidence level: "High, Medium or Low
  "confidence": "High | Medium | Low"
}

If you cannot identify the product, set confidence to "Low" and provide your best guess.${locationContext}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
      { text: prompt },
    ]);

    const response = result.response;
    const text = response.text();

    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const responseObject = {
      imageUri,
      name: parsed.name || 'Unknown Product',
      price: parsed.price || '~$0.00 USD',
      confidence: parsed.confidence || 'Low',
    };

    return responseObject;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      imageUri,
      name: 'Unable to identify product',
      price: 0.0,
      confidence: 'Low',
    };
  }
}
