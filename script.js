"use strict";

const game = getCanvas('game');
const stat = getCanvas('graph', {
    showN: 20
});

//BirdBrain
const input_nodes = 6;
const hidden_nodes = 8;
const output_nodes = 2;

const neu = getCanvas('neurons', {
    textTopPadding: 5,
    nodes: [input_nodes, hidden_nodes, output_nodes],
    labels: [
        ["Y", "vY", "PtY", "PbY", "PdX", "PdW"],
        ["Up", "NoUp"]
    ]
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
    fastGraphics = true;

//Bird
const gravity = 20;
const speedY = 600;

//Pipe
const space = 180;
const pipe_speed = 300;
const offset = 1.5;
const pipe_width = 50;

let fps = 0;
let speed = 1;

let background, bird, pipes, ground, roof;
//IF IA
const nbBirds = 200,
    spaceBetweenPipes = 400,
    mutationRate = 0.25;

let gen = 1,
    bestScore = 0,
    bestBrainYet = new NeuralNetwork(input_nodes, hidden_nodes, output_nodes),
    bestScoreYet = 0,
    nbAlive = 0;

window.onload = _ => {
    game_setup(game.width, game.height);

    let oldTime = 0,
        ccfps = 0,
        hf = 0;

    $("input#speed")[0].oninput = e => {
        speed = e.originalTarget.valueAsNumber;
        $('legend#speed').html(speed);
    };

    let draw_loop, move_loop;
    if (humanGame) {
        draw_loop = humain_loop_draw;
        move_loop = humain_loop_move;
    } else {
        draw_loop = simulation_loop_draw;
        move_loop = simulation_loop_move;
    }

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

        let i = 0;
        for (i = 0; i < speed; i++) {
            common_loop_move(game, delta);
            if (move_loop(delta, game.width, game.height) === false)
                break;
        }

        if (i === speed) {
            common_loop_draw(game);
            draw_loop(game);
            requestAnimationFrame(loop);
        }
    };
    requestAnimationFrame(loop);
    draw_graph(stat, []);
    draw_neurons(neu, bestBrainYet);
};

function game_setup(width, height) {
    background = new Rectangle(0, 0, width, height, '#00DBFF');

    const borderSize = 50;

    roof = new Rectangle(0, -borderSize, width, borderSize, 'grey');

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