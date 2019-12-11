function common_loop_move(game, delta) {
    pipes.forEach(pipe => {
        pipe.move(delta);
        if (pipe.x + pipe.w < 0) {
            pipe.renew();
            pipe.reset(game.width);
        }
    });
}

function humain_loop_move(keyInput, game, delta) {

    bird.move(delta, pipes);

    if (keyInput.ArrowUp)
        bird.flap(delta);

    if (keyInput.Space)
        game.changeSpeed(0);

    if (bird.dead) {
        resetGame(game.width);
        bestScore = bird.score;
        nextGeneration();
    }
}

function simulation_loop_move(_, game, delta) {

    const { width, height } = game;

    nbAlive = bird.reduce((n, bird) => {
        if (bird.dead)
            return n;

        bird.move(delta, pipes);

        if (bird.think(pipes, width, height))
            bird.flap(delta);

        if (bird.score > bestScore)
            bestScore = bird.score;

        return n + 1;
    }, 0);

    if (nbAlive === 0) {
        resetGame(width);
        nextGeneration();
    }
}

function collisionBird(b) {
    return collision(b, [roof, ground].concat(pipes.reduce((t, p) => {
        t.push(p);
        t.push(p.bottomPipe);
        return t;
    }, [])));
}