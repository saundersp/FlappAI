function common_loop_draw(game) {
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
    return game;
}

function common_loop_move(game, delta) {
    const {
        width
    } = game;

    pipes.forEach(pipe => {
        pipe.move(delta);
        if (pipe.x + pipe.w < 0) {
            pipe.renew();
            pipe.reset(width);
        }
    });
}

function humain_loop_draw(game) {
    const {
        ctx
    } = game;

    ctx.fillText(`Score: ${bird.score}`, 10, 30);

    bird.draw(ctx);
}

function humain_loop_move(delta) {
    bird.move(delta, pipes);

    if (keyInput.ArrowUp)
        bird.flap(delta);

    if (bird.dead)
        return false;
}

function simulation_loop_draw(game) {

    const {
        ctx,
        height
    } = game;

    ctx.fillText(`nbAlive: ${nbAlive}`, 440, height - 10);

    bird.forEach(bird => {
        if (!bird.dead)
            bird.draw(ctx);
    });

    ctx.fillText(`Score: ${bestScore}`, 10, 30);
}

function simulation_loop_move(delta, width, height) {

    nbAlive = bird.reduce((n, bird) => {
        if (bird.dead)
            return n;

        bird.move(delta);

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

function resetGame(width) {
    pipes.forEach((p, i) => {
        const nX = width + i * spaceBetweenPipes;
        p.x = nX;
        p.bottomPipe.x = nX;
        p.barrier.x = nX + p.w - 1;
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