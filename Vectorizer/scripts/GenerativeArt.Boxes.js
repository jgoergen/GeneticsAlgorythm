var GenerativeArt = 
function(settings) {

    var baseImagePixels,
        offscreenCanvas,
        offscreenContext,
        ga = 
        null;

    var badIterations,
        createNewBoxes,
        largestTriangleSize,
        smallestTriangleSize,
        stageWidth,
        stageHeight,
        pixelCheckSkip,
        minTriangleVolume =
        0;

    function init(settings) {
        
        stageWidth =
            settings
            .stageWidth;
    
        stageHeight =
            settings
            .stageHeight;
            
        offscreenCanvas = 
            document
            .createElement(
                "canvas");
                
        offscreenCanvas
        .width = 
            stageWidth;
        
        offscreenCanvas
        .height = 
            stageHeight;
        
        offscreenContext = 
            offscreenCanvas
            .getContext('2d');

        imageData =
            settings
            .imageData;

        createNewBoxes =
            settings
            .createNewShapes;

        minTriangleVolume =
            settings
            .minTriangleVolume;
        
        largestTriangleSize =
            settings
            .largestTriangleSize;
        
        smallestTriangleSize =
            settings
            .smallestTriangleSize;
                    
        pixelCheckSkip =
            settings
            .pixelCheckSkip;

        ga =
            new GeneticsAlgorythm({
                numberOfGenerations: settings.numberOfGenerations,
                baseMutationRate: settings.baseMutationRate,
                maxMutationRate: settings.maxMutationRate,
                mutationIncreaseRate: settings.mutationIncreaseRate,
                badIterationResest: settings.badIterationResest,
                mutationRate: settings.baseMutationRate,
                fitnessFunction: testFitness,
                newRandomGenerationFunction: randomGeneration,
                mutationFunction: mutateNode
            });

        baseImagePixels = 
            prePullBaseImagePixels();
    }
    
    function prePullBaseImagePixels() {
        
        var pixels = [];
        var img = document.getElementById("img1");
        offscreenContext.drawImage(img, 0, 0, 400, 400);
    
        var imgd = offscreenContext.getImageData(0, 0, stageWidth, stageHeight);
        var pix = imgd.data;
    
        for (var i = 0, n = pix.length; i < n; i += 4) {
    
            if (i % pixelCheckSkip == 0) {
    
                var r = pix[i]; // red
                var g = pix[i + 1]; // green
                var b = pix[i + 2]; // blue
                var a = pix[i + 3]; // alpha
    
                // if it's transparent, make it white
                if (r == 0 && g == 0 && b == 0 && a == 0)
                    r = g = b = 255;

                pixels.push({
                    r: r,
                    g: g,
                    b: b
                });
            }
        }
        
        return pixels;
    }
    
    function drawGeneration(generationData, drawingContext) {

        drawingContext.clearRect(0, 0, stageWidth, stageHeight);
        drawingContext.globalAlpha = 0.3;

        for (var i = 0; i < generationData.length; i += 9) {
    
            var x = fixVal(generationData[i + 0], stageWidth);
            var y = fixVal(generationData[i + 1], stageHeight);
            var size = 30; //fixVal(generationData[i + 2], stageHeight);
            var r = fixVal(generationData[i + 3], 255);
            var g = fixVal(generationData[i + 4], 255);
            var b = fixVal(generationData[i + 5], 255);

            drawingContext.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            drawingContext.fillRect(x, y, size, size);
        }
    }
    
    function testFitness(generationData) {
    
        drawGeneration(generationData, offscreenContext);

        var fitness = 0;
        var imgd = offscreenContext.getImageData(0, 0, stageWidth, stageHeight);
        var pix = imgd.data;
        var o = 0;
    
        for (var i = 4, n = pix.length; i < n; i += 4) {
    
            if (i % pixelCheckSkip == 0) {
    
                var r = pix[i]; // red
                var g = pix[i + 1]; // green
                var b = pix[i + 2]; // blue
                var a = pix[i + 3]; // alpha

                // if it's transparent, make it white
                if (r == 0 && g == 0 && b == 0 && a == 0)
                    r = g = b = 255;

                //get delta per color
                var deltaRed = 
                    Math
                    .abs(
                        baseImagePixels[o].r - r);
                
                var deltaGreen = 
                    Math
                    .abs(
                        baseImagePixels[o].g - g);
                
                var deltaBlue = 
                    Math
                    .abs(
                        baseImagePixels[o].b - b);
    
                var dist =
                    Math.sqrt(deltaRed * deltaRed + deltaGreen * deltaGreen + deltaBlue * deltaBlue)

                //add the pixel fitness to the total fitness ( lower is better )
                fitness += dist;
                o++;
            }
        }
        
        return fitness;
    }

    function randomGeneration() {

        var gen = [];

        for (var i = 0; i < createNewBoxes * 6; i++)
            gen.push(randomNode())

        return gen;
    }

    function randomNode() {
        
        return Math.ceil(Math.random() * stageHeight); 
    }

    function fixVal(val, limit) {

        var result = val;

        while (result > limit)
            result -= limit;

        while (result < 0)
            result += limit;

        return result;
    }

    function mutateNode(targetNode) {
                        
        var movePolarity = Math.random() <= 0.5 ? 1 : -1;
        var moveDist = Math.floor(Math.random() * stageWidth) * movePolarity;

        return fixVal(targetNode += moveDist, stageWidth);
    }
    
    function iterate() {
    
        var data =
            ga
            .iterate();
    
        var iterationData = {
            round: data.round,
            iteration: data.iteration,
            image: null,
            iterated: data.iterated,
            average: 999999999,
            badIterations: 0,
            good: data.good};
            
        if (data.iterated) {

            drawGeneration(data.bestData, ctx);

            iterationData
            .image =
                canvas
                .toDataURL();

            iterationData
            .average =
                data
                .average;

            iterationData
            .badIterations =
                data
                .badIterations;
        }

        return iterationData;
    }
    
    init(settings);

    return {
        iterate: iterate
    };
}
