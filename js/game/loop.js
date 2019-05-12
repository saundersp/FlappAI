function common_loop(game, delta) {

    const {
        ctx,
        width,
        height
    } = game;

    ctx.clearRect(0, 0, width, height);

    ctx.font = "25px arial";

    background.draw(ctx);
    pipes.forEach(o => o.draw(ctx));
    ground.draw(ctx);

    ctx.fillStyle = 'black';
    ctx.fillText(`FPS: ${fps}`, 10, height - 10);

    pipes.forEach(pipe => {
        pipe.move(delta);
        if (pipe.x + pipe.w < 0) {
            pipe.renew();
            pipe.reset(width);
        }
    });
    return game;
}

function humain_loop(game, delta) {
    const {
        ctx
    } = common_loop(game, delta);

    ctx.fillText(`Score: ${bird.score}`, 10, 30);

    bird.draw(ctx);
    bird.move(delta, pipes);

    if (keyInput.ArrowUp)
        bird.flap(delta);

    if (bird.dead)
        return false;
}

function simulation_loop(game, delta) {

    const {
        ctx,
        width,
        height
    } = common_loop(game, delta);

    ctx.fillText(`nbAlive: ${nbAlive}`, 440, height - 10);

    nbAlive = bird.reduce((n, bird) => {
        if (bird.dead)
            return n;

        bird.draw(ctx);
        bird.move(delta);

        if (bird.think(pipes, width, height))
            bird.flap(delta);

        if (bird.score > bestScore)
            bestScore = bird.score;

        return n + 1;
    }, 0);

    ctx.fillText(`Score: ${bestScore}`, 10, 30);

    if (nbAlive === 0) {
        resetGame(width);
        nextGeneration();
    }
}

function resetGame(width) {
    pipes.forEach((p, i) => {
        const nX = width + i * spaceBetweenPipes;
        p.x = nX;
        p.bottomPipe.x = nX;
        p.barrier.x = nX + p.w;
        p.barrier.broke = false;
    });
}

function collisionBird(b) {
    return collision(b, [roof, ground]) || collision(b, pipes.reduce((t, p) => {
        t.push(p);
        t.push(p.bottomPipe);
        return t;
    }, []));
}