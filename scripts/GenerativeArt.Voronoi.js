var GenerativeArt = 
function(settings) {

    var baseImagePixels,
        offscreenCanvas,
        offscreenContext,
        ga = 
        null;

    var badIterations,
        createNewTris,
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

        createNewTris =
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

        var PIXEL_SIZE = DRAWN_POINT_SIZE = 4;

        drawingContext.clearRect(0, 0, stageWidth, stageHeight);
        var points = [];

        for (var i = 0; i < generationData.length; i += 9) {
    
            points.push({
                x: fixVal(generationData[i + 0], stageWidth),
                y: fixVal(generationData[i + 1], stageHeight),
                r: fixVal(generationData[i + 2], 255),
                g: fixVal(generationData[i + 3], 255),
                b: fixVal(generationData[i + 4], 255)
            });
        }

        // generate simple voronoi data (brute force method)
        for (var x = 0; x < stageWidth; x += DRAWN_POINT_SIZE) {

            for (var y = 0; y < stageHeight; y += DRAWN_POINT_SIZE) {

                var closestIndex = -1;
                var closestDistance = Infinity;

                for (var o = 0; o < points.length; o++) {

                    var distance = Math.hypot(points[o].x - x, points[o].y - y);

                    if (distance < closestDistance) {

                        closestDistance = distance;
                        closestIndex = o
                    }
                }

                drawingContext.fillStyle = 
                    "rgb(" + 
                    points[closestIndex].r + "," + 
                    points[closestIndex].g + "," + 
                    points[closestIndex].b + ")";

                    drawingContext.fillRect(
                    x, 
                    y, 
                    PIXEL_SIZE, 
                    PIXEL_SIZE);
            }
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

        for (var i = 0; i < createNewTris * 5; i++)
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
