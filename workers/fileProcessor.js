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
  
      const outputFilename = `public/${uniqueId}.mind`;
      await writeFile(outputFilename, buffer);
  
    //   await unlink(imagePath);
  
      process.send({ outputFilename });
    } catch (error) {
      process.send({ error: error.message });
    }
  }
  
  process.on('message', async (message) => {
    const { imagePath, uniqueId } = message;
    await processImage(imagePath, uniqueId);
  });