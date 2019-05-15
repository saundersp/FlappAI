function nextGeneration() {
    //Save best scores
    gen++;
    bestScoreYet = max(bestScore, bestScoreYet);
    tabscore.push(bestScore);
    draw_graph(stat, tabscore);
    bestScore = 0;

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
        let cbird = bird[index];
        const child = new BirdBrain(cbird.img, cbird.brain);
        child.mutate();
        return child;
    });
}