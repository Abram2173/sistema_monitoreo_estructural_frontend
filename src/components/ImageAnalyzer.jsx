import * as cocoSsd from '@tensorflow-models/coco-ssd';

class ImageAnalyzer {
    constructor() {
        this.model = null;
    }

    async loadModel() {
        this.model = await cocoSsd.load();
        console.log('Modelo cargado exitosamente');
    }

    async analyzeImage(imageElement) {
        if (!this.model) await this.loadModel();
        const predictions = await this.model.detect(imageElement);
        const hasCrack = predictions.some(pred => pred.score > 0.5); // Umbral del 50%
        const evaluation = hasCrack ? 'Posible grieta detectada' : 'Ningún daño evidente';
        return { evaluation, hasCrack };
    }
}

const analyzer = new ImageAnalyzer();
export default analyzer; // Exporta como variable nombrada