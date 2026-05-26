import { NextResponse } from 'next/server';
import { updateContactCustomFields, getOrCreateCustomField } from '@/lib/ghl';
import fs from 'fs';
import path from 'path';

const FAL_API_URL = 'https://queue.fal.run/fal-ai/fashn/tryon/v1.6';

// Helper to convert any image URL (local, relative, or remote) to base64 Data URL
async function getImageAsBase64(imageUrl: string): Promise<string> {
  if (!imageUrl) return '';
  
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  let isLocal = false;
  let pathname = '';

  if (imageUrl.startsWith('/')) {
    isLocal = true;
    pathname = imageUrl;
  } else {
    try {
      const parsedUrl = new URL(imageUrl);
      const hostname = parsedUrl.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.endsWith('.local')
      ) {
        isLocal = true;
        pathname = parsedUrl.pathname;
      }
    } catch (e) {
      // Ignored
    }
  }

  if (isLocal && pathname) {
    try {
      const filePath = path.join(process.cwd(), 'public', pathname);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).substring(1) || 'png';
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      } else {
        console.warn(`Local file path does not exist for base64 conversion: ${filePath}`);
      }
    } catch (err) {
      console.error(`Failed to convert local image to base64: ${imageUrl}`, err);
    }
  }

  // Remote URL
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/png';
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    }
  } catch (err) {
    console.error(`Failed to download remote image to base64: ${imageUrl}`, err);
  }

  return imageUrl;
}

// Extract base64 mime type and raw data
function getBase64Components(base64DataUrl: string): { mimeType: string; data: string } {
  if (base64DataUrl.startsWith('data:')) {
    const parts = base64DataUrl.split(';base64,');
    const mimeType = parts[0].split(':')[1] || 'image/png';
    const data = parts[1] || '';
    return { mimeType, data };
  }
  return { mimeType: 'image/png', data: base64DataUrl };
}

// Helper to save base64 image data to local uploads folder
function saveBase64Image(base64DataUrl: string): string {
  try {
    const { mimeType, data } = getBase64Components(base64DataUrl);
    const buffer = Buffer.from(data, 'base64');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const extension = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = `tryon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (err) {
    console.error('Failed to save base64 image to file:', err);
    return base64DataUrl; // fallback to base64 Data URL if save fails
  }
}

// Predefined mock outputs for demonstration when no API keys are set
const MOCK_TRYON_OUTPUTS = [
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop', // Black premium t-shirt on model
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop', // Hoodie on model
  'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop', // Jacket on model
];

async function pollFalStatus(statusUrl: string, responseUrl: string, apiKey: string): Promise<string> {
  // Poll every 2 seconds for a maximum of 45 attempts (90 seconds)
  for (let i = 0; i < 45; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Fal.ai polling failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'COMPLETED') {
      const responsePayload = await fetch(responseUrl, {
        method: 'GET',
        headers: {
          Authorization: `Key ${apiKey}`,
        },
      });
      
      if (!responsePayload.ok) {
        throw new Error(`Fal.ai response retrieval failed with status: ${responsePayload.status}`);
      }
      
      const resultData = await responsePayload.json();
      if (resultData.images && resultData.images.length > 0) {
        return resultData.images[0].url;
      }
      throw new Error('Fal.ai completed but returned no output images in response payload.');
    }
    
    if (data.status === 'FAILED') {
      throw new Error('Fal.ai try-on generation failed on the server.');
    }
    
    console.log(`Polling Fal.ai status: ${data.status}...`);
  }
  
  throw new Error('AI try-on generation timed out.');
}

// Helper to choose high-fidelity mock outputs based on active selections
function getMockResult(gender: string, categories: string[], background: string): string {
  const isMulti = categories.length > 1;
  const mainCat = categories[0] || 'tops';
  const bg = background ? background.toLowerCase() : 'studio';
  const gen = gender ? gender.toLowerCase() : 'female';
  
  if (gen === 'male') {
    if (isMulti || mainCat === 'full-body') {
      if (bg === 'cafe') return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop'; // Man in suit outdoor cafe
      if (bg === 'neon') return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop'; // Man in street neon
      if (bg === 'boutique') return 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop'; // Man in showroom
      return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop'; // Man studio styled
    }
    if (mainCat === 'bottoms') {
      return 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop'; // Jeans
    }
    if (bg === 'cafe') return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop';
    if (bg === 'neon') return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop';
    if (bg === 'boutique') return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop'; // Black t-shirt
  } else {
    if (isMulti || mainCat === 'full-body') {
      if (bg === 'cafe') return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop'; // Woman at cafe
      if (bg === 'neon') return 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop'; // Woman neon street
      if (bg === 'boutique') return 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=600&auto=format&fit=crop'; // Boutique style
      return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'; // Studio styled
    }
    if (mainCat === 'bottoms') {
      return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'; // Jeans
    }
    if (bg === 'cafe') return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop';
    if (bg === 'neon') return 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop';
    if (bg === 'boutique') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=600&auto=format&fit=crop'; // White t-shirt
  }
}

export async function POST(request: Request) {
  try {
    const { 
      modelImage, 
      garmentImage, // fallback for legacy
      category = 'tops', // fallback for legacy
      garments = [], // primary multi-garment array
      locationId, 
      contactId,
      gender = 'female',
      background = 'studio'
    } = await request.json();

    if (!modelImage) {
      return NextResponse.json(
        { error: 'Model image is required.' },
        { status: 400 }
      );
    }

    let itemsToProcess = garments;
    if (itemsToProcess.length === 0 && garmentImage) {
      itemsToProcess = [{ imageUrl: garmentImage, category }];
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No garments selected for try-on.' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const falKey = process.env.FAL_KEY;
    const isMock = (!geminiKey || geminiKey === 'placeholder' || geminiKey.startsWith('your_')) && 
                   (!falKey || falKey === 'placeholder' || falKey.startsWith('your_'));

    let resultImageUrl = '';

    if (isMock) {
      console.log(`Running in Mock Mode. Processing ${itemsToProcess.length} items sequentially...`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * itemsToProcess.length));
      const categories = itemsToProcess.map((item: any) => item.category);
      resultImageUrl = getMockResult(gender, categories, background);
    } else if (geminiKey && geminiKey !== 'placeholder' && !geminiKey.startsWith('your_')) {
      // --- GOOGLE AI (GEMINI & IMAGEN 4) PIPELINE ---
      console.log(`Submitting try-on request to Google AI. Garments count: ${itemsToProcess.length}`);

      // 1. Convert model image to base64 Data URL
      console.log('Resolving model image to base64...');
      const modelBase64Data = await getImageAsBase64(modelImage);
      const { mimeType: modelMime, data: modelCleanBase64 } = getBase64Components(modelBase64Data);

      // 2. Build Gemini contents payload with all garments
      const parts: any[] = [
        {
          text: `You are an expert AI Virtual Try-on Prompt Engineer. Your goal is to achieve 1:1 facial and body likeness match between the reference model person (in the first image) and the generated target person.

Analyze the attached model image and garment image(s). Generate a detailed, realistic photo-generation prompt describing the model person wearing the exact garments.
To guarantee 1:1 face and body likeness, you must write a highly detailed, precise anatomical description of the model person's features from the image:
1. Face details: Describe their exact face shape, jawline structure, nose shape, eyes (shape, size, look), eyebrows, lips (contour, fullness), cheekbones, chin, forehead, age range, skin tone, skin undertone, and facial symmetry.
2. Hair details: Describe their exact hair style, length, texture, color, and partition/flow.
3. Body & Pose details: Describe their exact body build, height perception, neck length, hands, pose, posture, and facial expression. Keep these completely identical.
4. Background: Describe the background environment matching the user's selection: "${background}". 
   - If "studio": describe a professional high-end studio cyclorama backdrop with neutral colors and clean studio lighting.
   - If "cafe": describe a warm-lit aesthetic premium cafe interior with soft bokeh.
   - If "boutique": describe a luxurious modern clothing showroom/boutique background.
   - If "neon": describe a vibrant urban street at night with glowing neon lights and high contrast lighting.
5. Garment(s): Describe the exact style, color, pattern, texture, fabric material, and fit of each garment shown in the garment image(s), fitting it perfectly onto the person's body structure.

The prompt must start by describing the detailed physical features of the person, then describe them wearing the garments in the specified environment, ensuring that the person in the prompt is a perfect 1:1 lookalike. Keep the image style as a high-fidelity, hyper-realistic fashion photograph with professional lighting and sharp focus.

Return ONLY the final prompt text. Do NOT include any markdown formatting, code blocks, headers, prefixes, or explanations.`
        },
        {
          inlineData: {
            mimeType: modelMime,
            data: modelCleanBase64
          }
        }
      ];

      // Convert and append all garment images
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        console.log(`Resolving garment ${i + 1}/${itemsToProcess.length} (${item.category}) to base64...`);
        const garmentBase64Data = await getImageAsBase64(item.imageUrl);
        const { mimeType: garmentMime, data: garmentCleanBase64 } = getBase64Components(garmentBase64Data);

        parts.push({
          inlineData: {
            mimeType: garmentMime,
            data: garmentCleanBase64
          }
        });
      }

      // Call Gemini 2.5 Flash
      console.log('Generating prompt description using gemini-2.5-flash...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });

      const geminiData = await geminiResponse.json();
      if (!geminiResponse.ok) {
        console.error('Gemini prompt generation failed:', geminiData);
        throw new Error(geminiData.error?.message || 'Failed to generate prompt description with Gemini.');
      }

      const promptText = geminiData.candidates[0].content.parts[0].text.trim();
      console.log(`Generated Prompt description: "${promptText.slice(0, 100)}..."`);

      // Call Imagen 4.0
      console.log('Generating final image using models/imagen-4.0-generate-001:predict...');
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiKey}`;
      const imagenResponse = await fetch(imagenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: promptText }],
          parameters: {
            sampleCount: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1'
          }
        })
      });

      const imagenData = await imagenResponse.json();
      if (!imagenResponse.ok) {
        console.error('Imagen generation failed:', imagenData);
        throw new Error(imagenData.error?.message || 'Failed to generate image with Imagen 4.');
      }

      const base64ImageBytes = imagenData.predictions[0].bytesBase64Encoded;
      const base64DataUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

      // Save locally to keep the output URL clean and GHL compatible
      resultImageUrl = saveBase64Image(base64DataUrl);
    } else {
      // --- FALLBACK FAL.AI PIPELINE ---
      console.log(`Submitting virtual try-on requests to Fal.ai. Count: ${itemsToProcess.length}`);
      
      let currentModelImage = await getImageAsBase64(modelImage);
      
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        console.log(`Fitting item ${i + 1}/${itemsToProcess.length} (Category: ${item.category})...`);
        
        const garmentImageBase64 = await getImageAsBase64(item.imageUrl);
        
        const submitResponse = await fetch(FAL_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Key ${falKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_image: currentModelImage,
            garment_image: garmentImageBase64,
            category: item.category === 'full-body' ? 'one-pieces' : item.category,
          }),
        });

        const submitData = await submitResponse.json();

        if (!submitResponse.ok) {
          console.error(`Fal.ai submit error on item ${i + 1}:`, submitData);
          return NextResponse.json(
            { error: submitData.detail || `Failed to submit try-on job for item ${i + 1}.` },
            { status: submitResponse.status }
          );
        }

        const { request_id, status_url, response_url } = submitData;
        const actualStatusUrl = status_url || `https://queue.fal.run/fal-ai/fashn/tryon/v1.6/requests/${request_id}`;
        const actualResponseUrl = response_url || `https://queue.fal.run/fal-ai/fashn/tryon/v1.6/requests/${request_id}/response`;
        console.log(`Job submitted. Request ID: ${request_id}. Status URL: ${actualStatusUrl}. Response URL: ${actualResponseUrl}. Starting status polling...`);
        
        const outputUrl = await pollFalStatus(actualStatusUrl, actualResponseUrl, falKey || '');
        currentModelImage = outputUrl; 
      }
      
      resultImageUrl = currentModelImage;
    }

    // Sync with GHL if requested
    let ghlSyncSuccess = false;
    let ghlError = null;

    if (locationId && contactId) {
      try {
        console.log(`Syncing try-on image for contact ${contactId} at location ${locationId}...`);
        
        // 1. Get or create the custom field "AI Try-on Image"
        const customFieldId = await getOrCreateCustomField(locationId, 'AI Try-on Image');
        
        // Construct absolute URL for GHL writeback
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const absoluteResultImageUrl = resultImageUrl.startsWith('/') 
          ? `${appUrl}${resultImageUrl}` 
          : resultImageUrl;
        
        // 2. Update the contact custom field
        await updateContactCustomFields(locationId, contactId, [
          { id: customFieldId, value: absoluteResultImageUrl }
        ]);
        
        ghlSyncSuccess = true;
      } catch (err: any) {
        console.error('Error syncing results to GHL contact:', err);
        ghlError = err.message || 'GHL writeback failed';
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: resultImageUrl,
      mock: isMock,
      ghlSync: {
        synced: ghlSyncSuccess,
        error: ghlError
      }
    });
  } catch (err: any) {
    console.error('Try-On Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during try-on.' }, { status: 500 });
  }
}
