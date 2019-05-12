"use strict";

const game = getCanvas('game');
const stat = getCanvas('graph', {
    showN: 20
});
const neu = getCanvas('neurons', {
    textTopPadding: 5
});

const tabscore = [];

function getCanvas(name, opt) {
    const canvas = $('canvas#' + name)[0];
    const res = {
        ctx: canvas.getContext('2d'),
        width: canvas.width,
        height: canvas.height
    };

    if (opt)
        Object.keys(opt).forEach(r => res[r] = opt[r]);

    return res;
}

//only used in humanGame
const keyInput = trackKeys(['ArrowUp']);

const humanGame = false,
    fastGraphics = false;

//BirdBrain
const input_nodes = 6;
const hidden_notes = 4;
const output_nodes = 2;

//Bird
const gravity = 40;
const speedY = 600;

//Pipe
const space = 180;
const pipe_speed = 300;
const offset = 1.5;
const pipe_width = 50;

let fps = 0;

let background, bird, pipes, ground, roof;
//IF IA
const nbBirds = 250,
    spaceBetweenPipes = 350;

let gen = 1,
    bestScore = 0,
    bestBrainYet = new NeuralNetwork(input_nodes, hidden_notes, output_nodes),
    bestScoreYet = 0,
    worstScoreYet = Infinity,
    nbAlive = 0;

window.onload = _ => {
    game_setup(game.width, game.height);

    let oldTime = 0,
        ccfps = 0,
        hf = 0;

    const slider = $("input#speed")[0];

    const game_loop = humanGame ? humain_loop : simulation_loop;

    const loop = currentTime => {
        const delta = currentTime - oldTime;
        oldTime = currentTime;
        ccfps += delta;

        if (ccfps > 1000) {
            ccfps = 0;
            fps = hf;
            hf = 0;
        } else
            hf++;

        const it = slider.valueAsNumber;
        let i = 0;

        for (i = 0; i < it; i++)
            if (game_loop(game, delta) === false)
                break;

        if (i === it)
            requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    draw_graph(stat, []);
    draw_neurons(neu, bestBrainYet);
};

function game_setup(width, height) {
    background = new Rectangle(0, 0, width, height, '#00DBFF');

    const borderSize = 50;

    roof = new Rectangle(0, -borderSize, width, borderSize, 'gray');

    ground = new Rectangle(0, height - borderSize, width, borderSize, 'yellow');

    if (!fastGraphics) {
        loadImage(background, 'images/background.png');
        loadImage(ground, 'images/groundPiece.png');
    }

    if (humanGame) {
        bird = new Bird();
        if (!fastGraphics)
            loadImage(bird, 'images/bird.png');
    } else {
        if (!fastGraphics)
            bird = generateArray(nbBirds).map(_ => new BirdBrain(loadImage('images/bird.png')));
        else
            bird = generateArray(nbBirds).map(_ => new BirdBrain());
    }

    pipes = generateArray(2).map((_, i) => {
        const p = new Pipe(width + i * spaceBetweenPipes, height);
        if (!fastGraphics) {
            loadImage(p, 'images/full pipe top.png');
            loadImage(p.bottomPipe, 'images/full pipe bottom.png');
        }
        return p;
    });
}