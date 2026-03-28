// lib/gemini-enhancer.ts
import { GoogleGenAI } from '@google/genai';

const ENHANCE_SYSTEM_PROMPT = `
Tu es un expert en ingénierie de prompts vidéo cinématiques pour des modèles génératifs comme Veo 3.1 et Wan 2.1.
Ton rôle est de réécrire un prompt utilisateur simple pour en faire une description riche, cinématographique et très détaillée, optimisée pour le meilleur rendu physique, temporel et visuel.
Ajoute des instructions sur : l'éclairage (volumétrique, dramatique, naturel), les mouvements de caméra (pan, tilt, tracking shot, drone shot), la lentille (50mm, anamorphic), et le grain du film (propre, granuleux, 4k ultra hd).
NE RÉPONDS QUE LE PROMPT RÉÉCRIT, aucune explication, aucune salutation.
`;

export async function enhanceVideoPrompt(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    // Si pas de clé, on retourne le prompt tel quel pour éviter des erreurs bloquantes
    return prompt;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'models/gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${ENHANCE_SYSTEM_PROMPT}\n\nPrompt original : ${prompt}` }] }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    const enhanced = response.text?.trim() || prompt;
    return enhanced.replace(/^"|"$|^```[a-z]*|```$/g, '').trim();
  } catch (error) {
    console.warn('[Gemini Enhancer] Error, falling back to original prompt:', error);
    return prompt;
  }
}
