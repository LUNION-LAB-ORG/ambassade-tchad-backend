
import * as fs from 'fs';

/**
 * Supprimer les fichiers du système de fichiers
 */
export async function deleteFilesFromSystem(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
        try {
            // Nettoyer le chemin et vérifier s'il existe
            const cleanPath = filePath.replace(/\\/g, '/');
            if (fs.existsSync(cleanPath)) {
                await fs.promises.unlink(cleanPath);
                console.log(`Fichier supprimé: ${cleanPath}`);
            } else {
                console.log(`Fichier non trouvé (déjà supprimé?): ${cleanPath}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
            // Ne pas arrêter le processus si un fichier ne peut pas être supprimé
        }
    }
}