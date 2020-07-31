function nextGeneration() {
	//Save best scores
	gen++;

	if (humanGame) {
		if (bestScore > bestScoreYet)
			bestScoreYet = bestScore;
		tabscore.push(bestScore);
		draw_graph(stat, tabscore);
		bestScore = 0;
		bird = new Bird(bird.img);
	} else {
		if (bestScore > bestScoreYet) {
			bestScoreYet = bestScore;
			bestBrainYet = bird.filter(o => o.score === bestScore)[0].brain.copy();
		}
		tabscore.push(bestScore);
		draw_graph(stat, tabscore);
		bestScore = 0;

		if (game.adapSpeed)
			game.changeSpeed(1);

		//calculate fitness
		const sum = bird.reduce((n, b) => n + b.score, 0);

		//Mutation
		bird = bird.map(_ => {
			let index = -1;
			for (let r = randomFloat(); r > 0; index++)
				r -= bird[index + 1].score / sum; //fitness = score / sum
			const cbird = bird[index];
			return new BirdBrain(cbird.img, cbird.brain).mutate(mutationRate);
		});
	}
}