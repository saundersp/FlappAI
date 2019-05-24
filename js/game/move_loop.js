function checkControls(keyInput, game) {
    if (keyInput.Space) {
        game.togglePause();
        keyInput.Space = false;
    }
}

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

    const width = game.width;

    bird.move(delta, pipes);

    if (keyInput.ArrowUp)
        bird.flap(delta);

    if (bird.dead) {
        resetGame(width);
        bird = new Bird(bird.img);
    }
}

function simulation_loop_move(keyInput, game, delta) {

    const {
        width,
        height,
        speed,
        maxSpeed,
        adapSpeed,
        changeSpeed
    } = game;

    if (!adapSpeed) {
        if (keyInput.ArrowRight) {
            if (speed < maxSpeed)
                changeSpeed(speed + 1);
            keyInput.ArrowRight = false;
        }
        if (keyInput.ArrowLeft) {
            if (speed > 1)
                changeSpeed(speed - 1);
            keyInput.ArrowLeft = false;
        }
    }
    if (keyInput.KeyS) {
        saveBlobAsFile("bestBrainYet.json", bestBrainYet.serialize());
        keyInput.KeyS = false;
    }
    if (keyInput.KeyG) {
        saveBlobAsFile("tabScore.json", JSON.stringify(tabscore));
        keyInput.KeyG = false;
    }

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