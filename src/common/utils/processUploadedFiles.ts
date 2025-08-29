import { GenerateConfigService } from "../services/generate-config.service";

/**
 * Traiter les fichiers téléchargés
 */
export async function processUploadedFiles(files: Express.Multer.File[], path: string): Promise<string[]> {
    if (files.length === 0) return [];
    return files.map(file => file.path);
    const fileMap: Record<string, string> = {};
    const timestamp = Date.now();

    files.forEach((file, i) => {
        // Générer un nom unique pour chaque fichier avec timestamp et index
        const uniqueKey = `image_${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`;
        fileMap[uniqueKey] = file.path;
    });

    const compressedPaths = await GenerateConfigService.compressImages(
        fileMap,
        path,
        { quality: 75, width: 1280, height: 720, fit: 'inside' },
        true
    );

    return Object.values(compressedPaths);
}