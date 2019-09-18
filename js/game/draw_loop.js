function common_loop_draw(game) {
    const {
        ctx,
        width,
        height,
        fast_graphics
    } = game;

    ctx.clearRect(0, 0, width, height);

    ctx.font = "25px arial";

    background.draw(ctx);
    pipes.forEach(o => o.draw(ctx, fast_graphics));
    ground.draw(ctx);
    roof.draw(ctx);

    ctx.fillStyle = 'black';
    ctx.fillText(`FPS: ${fps}`, 10, height - 10);
    return game;
}

function humain_loop_draw(game) {
    const {
        ctx
    } = game;

    ctx.fillText(`Score: ${bird.score.toLocaleString()}`, 10, 25);

    bird.draw(ctx);
}

function simulation_loop_draw(game) {

    const {
        ctx,
        height
    } = game;

    ctx.fillText(`Left alive: ${nbAlive}`, 430, height - 10);

    bird.forEach(bird => {
        if (!bird.dead)
            bird.draw(ctx);
    });

    ctx.fillText(`Score: ${bestScore.toLocaleString()}`, 10, 25);
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