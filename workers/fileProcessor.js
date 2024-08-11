import { loadImage } from 'canvas';
import { promises as fsPromises } from 'fs';
import { OfflineCompiler } from '../utils/image-target/offline-compiler.js';

const { writeFile, unlink } = fsPromises;

async function processImage(imagePath, uniqueId) {
    try {
        const images = await Promise.all([loadImage(imagePath)]);
        const compiler = new OfflineCompiler();
        await compiler.compileImageTargets(images, console.log);
        const buffer = compiler.exportData();

        // Use the unique ID for the generated file
        const outputFilename = `public/${uniqueId}.mind`;
        await writeFile(outputFilename, buffer);

        // Clean up the uploaded image file
        await unlink(imagePath);

        // Send success message with the output filename
        process.send({ outputFilename });
    } catch (error) {
        // Send error message back to parent process
        process.send({ error: error.message });
    }
}

// Listen for messages from the parent process
process.on('message', async (message) => {
    const { imagePath, uniqueId } = message;
    await processImage(imagePath, uniqueId);
});
