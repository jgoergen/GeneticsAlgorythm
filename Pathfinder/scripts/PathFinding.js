var PathFinder =
    function (settings) {
        "use strict";

        // graphics
        var graphics = {
            FootStep: "0ZI4L0D4L0D4L0D4L0D4L0D4L0D4L0D4L0D4L0D4L0D4L0D4L",
            StartPoint: "0ZZZL1B0ZC101B010J101B010ZC1B",
            EndPoint: "0ZZU1B0ZD1D0J1010B1010H1010B1010J1D0ZD1B",
            EmptySpace: "1Q0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1B0N1Q",
            FilledSpace: "1ZZZZZZZZZZF"
        };

        // hueristics
        var REWALK_PENALTY = 0.5;
        var WALL_PENALTY = 1;
        var DISTANCE_MULTIPLIER = 2;

        var ga = null;

        var badIterations = 0,
            createNewSteps = 0,
            stageWidth = 0,
            stageHeight = 0,
            startX = 0,
            startY = 0,
            endX = 0,
            endY = 0;

        var offscreenCanvas = undefined;
        var offscreenContext = undefined;
        var graphicsCanvas = undefined;
        var graphicsContext = undefined;
        var floor;
        var graphicCache = {};
        var completeCallback = undefined;
        var debug = false;
        var mapGenerationFunction = undefined;

        function init(settings) {

            mapGenerationFunction = generateSimpleMap;

            stageWidth = settings.stageWidth;
            stageHeight = settings.stageHeight;
            createNewSteps = settings.createNewSteps;
            completeCallback = settings.completeCallback;
            debug = settings.debug;

            offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = stageWidth;
            offscreenCanvas.height = stageHeight;
            offscreenContext = settings.ctx; //offscreenCanvas.getContext('2d');

            graphicsCanvas = document.createElement("canvas");
            graphicsCanvas.width = 400;
            graphicsCanvas.height = 400;
            graphicsContext = graphicsCanvas.getContext('2d');

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
                    mutationFunction: mutateNode,
                    crossoverRate: settings.crossoverRate,
                    crossoverPosition: settings.crossoverPosition
                });

            floor = mapGenerationFunction();
        }

        // hard map
        function generateChallengingMap() {

            var map = new Array();
            map.push(new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1));
            map.push(new Array(1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1));
            map.push(new Array(1, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));
            map.push(new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            return map;
        }

        // test simple map
        function generateSimpleMap() {

            var map = new Array();
            map.push(new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 5, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 8, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            return map;
        }

        // test empty map
        function generateEmptyMap() {

            var map = new Array();
            map.push(new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1));
            map.push(new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            return map;
        }

        function DrawGraphic(_ctx, _sprite, _customColor, _alpha, _scale, _x, _y, _rotation) {

            var cacheRef = _sprite + "_" + _customColor + "_" + _scale;

            _ctx.globalAlpha = _alpha;
            _ctx.save();

            if (_rotation) {

                _ctx.translate(16 + _x, 16 + _y);
                _ctx.rotate(_rotation);
                _ctx.translate((16 + _x) * -1, (16 + _y) * -1);
            }

            graphicsCanvas.width = 16 * _scale;
            graphicsCanvas.height = 16 * _scale;
            graphicsContext.clearRect(0, 0, 16 * _scale, 16 * _scale);

            if (!graphicCache[cacheRef]) {

                var _spriteCode = graphics[_sprite];
                var i = 0;
                var u = 0;

                while (i < _spriteCode.length) {

                    var t = _spriteCode.substr(i, 1);
                    var r = (t.charCodeAt(0) - 65);

                    do {
                        graphicsContext.fillStyle = ["rgba(0,0,0,0)", "#000", "#fff", "#ccc", _customColor][parseInt(t)];
                        graphicsContext.fillRect((((i + u) - (~~((i + u) / 16) * 16)) * _scale), (~~((i + u) / 16) * _scale), _scale, _scale);
                        u++;
                        r--;
                    } while (r > 0);

                    u--;
                    i++;
                }

                graphicCache[cacheRef] = graphicsContext.getImageData(0, 0, 16 * _scale, 16 * _scale);
            }

            graphicsContext.putImageData(graphicCache[cacheRef], 0, 0);
            _ctx.drawImage(graphicsCanvas, _x, _y);
            _ctx.restore();
            _ctx.globalAlpha = 1;
        }

        function drawMap(_ctx) {

            for (var i = 0; i < 16; i++) {

                for (var o = 0; o < 16; o++) {

                    var scale = 2;
                    var x = o * 16 * scale;
                    var y = i * 16 * scale;
                    var graphic = "";

                    switch (floor[i][o]) {

                        case 0:

                            DrawGraphic(_ctx, "EmptySpace", "#f00", 0.5, scale, x, y, 0);
                            break;

                        case 1:
                            DrawGraphic(_ctx, "FilledSpace", "#f00", 1, scale, x, y, 0);
                            break;

                        case 8:
                            DrawGraphic(_ctx, "EmptySpace", "#f00", 0.5, scale, x, y, 0);
                            DrawGraphic(_ctx, "StartPoint", "#f00", 0.9, scale, x, y, 0);
                            startX = o;
                            startY = i;
                            break;

                        case 5:
                            DrawGraphic(_ctx, "EmptySpace", "#f00", 0.5, scale, x, y, 0);
                            DrawGraphic(_ctx, "EndPoint", "#f00", 0.9, scale, x, y, 0);
                            endX = o;
                            endY = i;
                            break;
                    }
                }
            }
        }

        function drawGeneration(generationData, drawingContext, clearFirst, fadeVal, customColor) {

            if (!customColor)
                customColor = "#f00";

            if (!fadeVal)
                fadeVal = 0.1;

            if (clearFirst) {

                drawingContext.fillStyle = "#fff";
                drawingContext.fillRect(0, 0, stageWidth, stageHeight);
            }

            drawMap(drawingContext);

            var currentX = startX;
            var currentY = startY;
            var tmpMap = mapGenerationFunction();

            for (var i = 0; i < generationData.length; i++) {

                var tempCoordX = currentX;
                var tempCoordY = currentY;

                if (generationData[i] == "00")
                    tempCoordY -= 1;
                if (generationData[i] == "01")
                    tempCoordX += 1;
                if (generationData[i] == "10")
                    tempCoordY += 1;
                if (generationData[i] == "11")
                    tempCoordX -= 1;

                if (tempCoordY >= 0 && tempCoordX >= 0 && tmpMap[tempCoordY][tempCoordX] != 1) {

                    currentX = tempCoordX;
                    currentY = tempCoordY;
                }

                DrawGraphic(drawingContext, "FootStep", customColor, fadeVal, 2, (currentX * 16 * 2), (currentY * 16 * 2), 0);
            }
        }

        function testFitness(generationData) {

            if (debug)
                drawGeneration(generationData, offscreenContext, false);

            var currentX = startX;
            var currentY = startY;
            var penalty = 0;
            var tmpMap = mapGenerationFunction();
            var shortestDistance = 999999;

            for (var i = 0; i < generationData.length; i++) {

                var tempCoordX = currentX;
                var tempCoordY = currentY;

                if (generationData[i] == "00")
                    tempCoordY -= 1;
                if (generationData[i] == "01")
                    tempCoordX += 1;
                if (generationData[i] == "10")
                    tempCoordY += 1;
                if (generationData[i] == "11")
                    tempCoordX -= 1;

                if (tempCoordY >= 0 && tempCoordX >= 0) {

                    if (floor[tempCoordY][tempCoordX] == 5) {

                        drawGeneration(generationData, ctx, true, 0.3, "#0f0");
                        completeCallback(canvas.toDataURL());
                        return null;
                    }

                    if (tmpMap[tempCoordY][tempCoordX] != 1) {

                        currentX = tempCoordX;
                        currentY = tempCoordY;

                        if (tmpMap[tempCoordY][tempCoordX] == 9)
                            penalty += REWALK_PENALTY;
                        else
                            tmpMap[tempCoordY][tempCoordX] = 9;

                        var winDistance = Math.sqrt((currentX - endX) * (currentX - endX) + (currentY - endY) * (currentY - endY));

                        if (winDistance < shortestDistance)
                            shortestDistance = winDistance;

                    } else {

                        penalty += WALL_PENALTY;
                    }
                }
            }

            var fitness = (shortestDistance * DISTANCE_MULTIPLIER) + penalty;
            return fitness;
        }

        function randomGeneration() {

            var gen = [];

            for (var i = 0; i < createNewSteps; i++)
                gen.push(randomNode())

            return gen;
        }

        function randomNode() {

            var moveDir = Math.floor(Math.random() * 4);

            if (moveDir == 0)
                return "00"; // move north /\
            if (moveDir == 1)
                return "01"; // move east >
            if (moveDir == 2)
                return "10"; // move south \/
            if (moveDir == 3)
                return "11"; // move west <
        }

        function mutateNode(targetNode) {

            return randomNode();
        }

        function iterate(ctx) {

            var data = ga.iterate();

            var iterationData = {
                round: data.round,
                iteration: data.iteration,
                image: null,
                iterated: data.iterated,
                average: 999999999,
                badIterations: 0,
                good: data.good
            };

            if (data.iterated) {

                drawGeneration(data.bestData, ctx, true, 0.3, "#00f");

                iterationData.image = canvas.toDataURL();
                iterationData.average = data.average;
                iterationData.badIterations = data.badIterations;
            }

            return iterationData;
        }

        init(settings);

        return {
            iterate: iterate
        };
    }
