//---------------------------------------------------------------------
// Options you can tweak
// Enable classic game playable by human
const humanGame = false;
// Enable faster graphics (no images just ugly rectangles)
const fastGraphics = false;

// Bird
const gravity = 20,
    speedY = 600;

// Pipe
const space = 180, // Space between top and bottom pipe
    spaceBetweenPipes = 350,
    pipe_speed = 300, // Horizontal speed
    offset = 1.5, // Level of height tolerance
    pipe_width = 50;

const stat = getCanvas('graph', {
    showN: 20, // Show last 20 scores
    lineWidth: 1.2,
    pointSize: 3
});

// Options AI (neat)
const nbBirds = 200, // Density of population
    mutationRate = 0.25,
    learningRate = 0.1;

// BirdBrain
const input_nodes = 6, // => see think method
    hidden_nodes = 8, // Tweakable
    output_nodes = 2; // Jump or NoJump

// End options
//---------------------------------------------------------------------


const game = getCanvas('game', {
    pausedSpeed: 0,
    speed: 1,
    changeSpeed: (opt, s) => {
        $("input#speed")[0].value = "" + s;
        opt.speed = s;
        $('legend#speed').html(`Speed: ${opt.speed}`);
    },
    togglePause: (opt) => {
        if (opt.speed !== 0) {
            opt.pausedSpeed = opt.speed;
            opt.changeSpeed(0);
        } else {
            opt.changeSpeed(opt.pausedSpeed);
            opt.pausedSpeed = 0;
        }
    }
});
const neu = getCanvas('neurons', {
    textLeftPadding: 5,
    nodes: [input_nodes, hidden_nodes, output_nodes],
    labels: [
        ["Y", "vY", "PtY", "PbY", "PdX", "PdW"],
        ["Up", "NoUp"]
    ],
    colorOver: 'aqua',
    mutationRate: mutationRate,
    coor: [-1, -1],
    onmousemove: (opt, e) => {
        const {
            left,
            top
        } = opt.canvas.getBoundingClientRect();
        opt.coor = [
            e.clientX - left,
            e.clientY - top
        ];
    },
    onmouseleave: opt => opt.coor = [-1, -1]
});

const tabscore = [];

function getCanvas(name, opt) {
    const canvas = $(`canvas#${name}`)[0];
    const res = {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        width: canvas.width,
        height: canvas.height
    };

    if (opt)
        Object.keys(opt).forEach(r => {
            switch (r) {
                case 'onmousemove':
                case 'onmousedown':
                case 'onmouseleave':
                    canvas[r] = e => opt[r](res, e);
                    break;

                default:
                    if (opt[r] instanceof Function)
                        res[r] = (...args) => opt[r](res, ...args);
                    else
                        res[r] = opt[r];
                    break;
            }
        });
    return res;
}

const keyInput = trackKeys(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'KeyS', 'KeyG', 'Space']);

let fps = 0;

// Object placeholders
let background, bird, pipes, ground, roof;

// Stats...
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

    const s = $("input#speed")[0];
    s.value = "1";

    s.oninput = e => {
        game.speed = e.target.valueAsNumber;
        $('legend#speed').html(`Speed: ${game.speed}`);
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
        for (; i < game.speed; i++) {
            common_loop_move(game, delta);
            move_loop(keyInput, game, delta);
        }

        checkControls(keyInput, game);
        common_loop_draw(game);
        draw_loop(game);
        draw_neurons(neu, bestBrainYet);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    draw_graph(stat, []);
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
            loadImage(p, 'images/full_pipe_top.png');
            loadImage(p.bottomPipe, 'images/full_pipe_bottom.png');
        }
        return p;
    });
}

function saveBlobAsFile(name, content) {
    const dl = document.createElement("a");
    dl.download = name;
    dl.href = window.URL.createObjectURL(new Blob([content], {
        type: 'text/plain'
    }));
    dl.onclick = event => document.body.removeChild(event.target);
    dl.style.display = "none";
    document.body.appendChild(dl);
    dl.click();
}