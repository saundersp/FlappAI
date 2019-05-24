function nextGeneration() {
    //Save best scores
    gen++;
    if (bestScore > bestScoreYet) {
        bestScoreYet = bestScore;
        bestBrainYet = bird.filter(o => o.score === bestScore)[0].brain.copy();
    }
    tabscore.push(bestScore);
    draw_graph(stat, tabscore);
    bestScore = 0;

    if (game.adapSpeed && !humanGame)
        game.changeSpeed(1);

    //calculate fitness
    const sum = bird.reduce((n, b) => n + b.score, 0);
    bird.forEach(b => b.fitness = b.score / sum);

    //Mutation
    bird = bird.map(_ => {

        let index = 0;
        let r = randomFloat();
        while (r > 0) {
            r = r - bird[index].fitness;
            index++;
        }
        index--;
        const cbird = bird[index];
        const child = new BirdBrain(cbird.img, cbird.brain);
        child.mutate();
        return child;
    });
}