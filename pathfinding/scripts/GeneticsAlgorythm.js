var GeneticsAlgorythm =
    function (settings) {

        var generations = [];
        var bestAverage = 99999999;

        var mutationRate,
            iterationVal,
            rounds,
            badIterations,
            numberOfGenerations,
            baseMutationRate,
            maxMutationRate,
            mutationIncreaseRate,
            crossoverRate,
            badIterationResest,
            crossoverPosition =
                0;

        var lastGoodSet,
            fitnessFunction,
            newRandomGenerationFunction,
            mutationFunction =
                null;

        function init(settings) {

            fitnessFunction = settings.fitnessFunction;
            newRandomGenerationFunction = settings.newRandomGenerationFunction;
            mutationFunction =settings.mutationFunction;
            numberOfGenerations =settings.numberOfGenerations;
            baseMutationRate = settings.baseMutationRate;
            maxMutationRate = settings.maxMutationRate;
            mutationIncreaseRate = settings.mutationIncreaseRate;
            badIterationResest = settings.badIterationResest;
            crossoverRate = settings.crossoverRate;
            crossoverPosition = settings.crossoverPosition;
            mutationRate = baseMutationRate;
            iterationVal = 0;
            rounds = 0;

            // setup base generations
            for (var p = 0; p < numberOfGenerations; p++)
                generations.push({
                    data: newRandomGenerationFunction(),
                    val: 0,
                    check: true
                });
        }

        function getGenerations() {

            return generations;
        }

        function cloneNode(oldNode) {

            return JSON.parse(JSON.stringify(oldNode));
        }

        function runGeneration(data) {

            return fitnessFunction(data);
        }

        function mutateGeneration(generationToMutate) {

            for (var i = 0; i < generationToMutate.data.length; i++)
                if (Math.random() < mutationRate)
                    generationToMutate.data[i] =
                        mutationFunction(
                            cloneNode(
                                generationToMutate.data[i]));

            return generationToMutate;
        }

        function crossoverGenerations(motherGeneration, fatherGeneration) {

            var baby1Generation =
                { data: [], val: 0, check: true };

            var baby2Generation =
                { data: [], val: 0, check: true };

            // perform crossover between parents
            var crossoverPosition =
                Math.floor(fatherGeneration.data.length & crossoverPosition);

            for (var i = 0; i < crossoverPosition; i++) {

                baby1Generation.data.push(
                    cloneNode(
                        fatherGeneration.data[i]));

                baby2Generation.data.push(
                    cloneNode(
                        motherGeneration.data[i]));
            }

            for (var o = crossoverPosition; o < fatherGeneration.data.length; o++) {

                baby2Generation
                    .data
                    .push(
                        cloneNode(
                            fatherGeneration
                                .data[o]));

                baby1Generation
                    .data
                    .push(
                        cloneNode(
                            motherGeneration
                                .data[o]));
            }

            return [baby1Generation, baby2Generation];
        }

        function iterate() {

            var iterationData = {
                round: rounds,
                iteration: iterationVal,
                iterated: false,
                average: 0,
                badIterations: 0,
                good: false,
                bestData: generations[bestIndex].data,
                bestVal: best
            };

            if (generations[iterationVal].check) {

                generations[iterationVal].val =
                    runGeneration(
                        generations[iterationVal].data);

                generations[iterationVal].check = false;
            }

            iterationVal++;

            if (iterationVal == generations.length) {

                generationComplete();
                iterationData.iterated = true;
                iterationData.good = wasGood;
                iterationData.average = bestAverage;
                iterationData.badIterations = badIterations;
            }

            return iterationData;
        }

        var wasGood = false;
        var bestIndex = 0;
        var best = 0;

        function generationComplete() {

            rounds++;
            var totalFitness = 0;
            best = 999999999;

            // wasGood = false;
            wasGood = true;

            for (var i = 0; i < generations.length; i++) {

                if (generations[i].val < best) {

                    best = generations[i].val;
                    bestIndex = i;
                }

                totalFitness += generations[i].val;
            }

            average = (totalFitness / generations.length);

            if (badIterationResest > 0) {

                if (average < bestAverage) {

                    bestAverage = average;
                    //runGeneration(generations[bestIndex].data);
                    mutationRate = baseMutationRate;
                    badIterations = 0;
                    lastGoodSet = generations;
                    wasGood = true;

                } else {

                    badIterations ++;

                    if (mutationRate < maxMutationRate)
                        mutationRate += mutationIncreaseRate;

                    // too many bad variations, revert to last good.
                    if (badIterations > badIterationResest) {

                        var newGenerationsFitness = [];
                        for (var i = 0; i < numberOfGenerations; i++)
                            newGenerationsFitness.push(0);

                        generations = lastGoodSet;

                        for (var n = 0; n < generations.length; n++)
                            generations[n].val = newGenerationsFitness[n];

                        iterationVal = 0;
                        badIterations = 0;
                        return;
                    }
                }
            }

            var newGenerations = [];

            // sort generations by fitness 
            var tmpArr = [];
            for (var i = 0; i < generations.length; i++)
                tmpArr.push({
                    v: generations[i].val,
                    i: i
                });

            tmpArr.sort(
                function (a, b) {

                    if (a.v < b.v)
                        return -1;
                    else if (a.v > b.v)
                        return 1;
                    else
                        return 0;
                });

            var keepCount = Math.floor(tmpArr.length * ( 1 - crossoverRate));
            if (keepCount % 2 != 0)
                keepCount --;

            for (var i = 0; i < keepCount; i++)
                newGenerations.push(generations[tmpArr[i].i]);

            for (var i = 0; i < (tmpArr.length - keepCount); i += 2) {

                var firstGenToCrossOver = Math.floor(Math.random() * (keepCount / 3));
                var secondGenToCrossOver = Math.floor(Math.random() * (keepCount / 3));

                while(firstGenToCrossOver == secondGenToCrossOver)
                    secondGenToCrossOver = Math.floor(Math.random() * (keepCount / 3));

                var COResult =
                    crossoverGenerations(
                        generations[firstGenToCrossOver],
                        generations[secondGenToCrossOver]);

                newGenerations.push(mutateGeneration(COResult[0]));
                newGenerations.push(mutateGeneration(COResult[1]));
            }

            // replace current generations with new generations
            generations = newGenerations;

            //Re-run generations
            iterationVal = 0;
        }

        init(settings);

        return {
            iterate: iterate,
            getGenerations: getGenerations
        };
    };