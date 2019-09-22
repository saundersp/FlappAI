//---------------------------------------------------------------------
// Options you can tweak
// Enable classic game playable by human
const humanGame = false;

// Bird
const gravity = 40;
const speedY = 600;

// Pipe
const space = 180; // Space between top and bottom pipe
const spaceBetweenPipes = 350;
const pipe_speed = 300; // Horizontal speed
const offset = 1.5; // Level of height tolerance
const pipe_width = 50;

// Roof and bottom height
const borderSize = 50;

const stat = getCanvas('graph', {
    showN: 20, // Show last 20 scores
    lineWidth: 1.2,
    pointSize: 3
});

// Options AI (neat)
const nbBirds = 200; // Density of population
const mutationRate = 0.3;

// BirdBrain
// 6 inputs nodes => see BirdBrain.think method
// 4 hidden nodes => Tweakable (Best result seen with 4)
// 2 outputs nodes =>  Jump or NoJump
const nodes = [6, 4, 2];

// End options
//---------------------------------------------------------------------

//Global game canvas manager
const game = getCanvas('game', {
    pausedSpeed: 0,
    speed: 1,
    fps_threshold: 50,
    maxSpeed: Number($("input#speed")[0].max),
    adapSpeed: true,
    fast_graphics: false,
    changeSpeed: (opt, s) => {
        $("input#speed")[0].value = String(s);
        opt.speed = s;
        $('legend#len_speed').html(`Speed: ${opt.speed}`);
    },
    toggleAdapSpeed: opt => {
        $('input#adapSpeed')[0].checked = opt.adapSpeed = !opt.adapSpeed;
    },
    togglePause: opt => {
        if (opt.speed !== 0) {
            opt.pausedSpeed = opt.speed;
            opt.changeSpeed(0);
        } else {
            opt.changeSpeed(opt.pausedSpeed);
            opt.pausedSpeed = 0;
        }
    }
});

// Global neurons graph canvas manager
const neu = getCanvas('neurons', {
    textLeftPadding: 60,
    labels: [
        ["Y", "vY", "PtY", "PbY", "PdX", "PdW"],
        ["Jump", "NoJump"]
    ],
    colorOver: '#00FFFF',
    floatPrecision: 4,
    populationSize: nbBirds,
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

// Load assets in memory then giving pointer to objects
const assets = {};

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

const keyInput = trackKeys(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'Space']);

let fps = 0;

// Object placeholders
let background, bird, pipes, ground, roof;

// Stats...
let gen = 1;
let bestScore = 0;
let bestBrainYet = new NeuralNetwork(nodes);
let bestScoreYet = 0;
let nbAlive = 0;

// Records of all best scores
const tabscore = [];

window.onload = _ => {
    game_setup(game.width, game.height);

    const range_speed = $("input#speed")[0];
    range_speed.oninput = e => game.changeSpeed(e.target.valueAsNumber);
    range_speed.disabled = true;
    const input_fps_threshold = $('input#fps_threshold')[0];
    input_fps_threshold.oninput = e => game.fps_threshold = e.target.valueAsNumber;
    input_fps_threshold.valueAsNumber = game.fps_threshold;
    $('button#save_brain').click(_ => saveBlobAsFile("bestBrainYet.json", bestBrainYet.serialize()));
    $('button#save_scores').click(_ => saveBlobAsFile("tabScore.json", JSON.stringify(tabscore)));

    $('button#toggleFastGraphics').click(obj => {
        if (game.fast_graphics) {
            obj.target.innerHTML = 'Enable fast graphics';
            obj.target.setAttribute('class', 'btn_disabled');
            game.fast_graphics = false;
            background.img = assets.background;
            ground.img = roof.img = assets.groundPiece;
            pipes.forEach(p => {
                p.img = assets.full_pipe_top;
                p.bottomPipe.img = assets.full_pipe_bottom;
            });
            humanGame ? bird.img = assets.bird : bird.forEach(b => b.img = assets.bird);
        } else {
            obj.target.innerHTML = 'Disable fast graphics';
            obj.target.setAttribute('class', 'btn_enabled');
            game.fast_graphics = true;
            background.img = ground.img = roof.img = undefined;
            pipes.forEach(p => p.img = p.bottomPipe.img = undefined);
            humanGame ? bird.img = undefined : bird.forEach(b => b.img = undefined);
        }
    });

    $('button#toggleAdapSpeed').click(obj => {
        if (game.adapSpeed) {
            game.adapSpeed = false;
            obj.target.innerHTML = 'Enable adaptative speed';
            obj.target.setAttribute('class', 'btn_disabled');
            game.changeSpeed(1);
            range_speed.disabled = false;
        } else {
            game.adapSpeed = true;
            obj.target.innerHTML = 'Disable adaptative speed';
            obj.target.setAttribute('class', 'btn_enabled');
            range_speed.disabled = true;
        }
    });

    let draw_loop, move_loop;
    if (humanGame) {
        draw_loop = humain_loop_draw;
        move_loop = humain_loop_move;
    } else {
        draw_loop = simulation_loop_draw;
        move_loop = simulation_loop_move;
    }

    let oldTime = 0;
    let ccfps = 0;
    let hf = 0;

    const loop = currentTime => {
        const delta = currentTime - oldTime;
        oldTime = currentTime;
        ccfps += delta;

        if (ccfps > 1e3) {
            ccfps %= 1e3;
            fps = hf;
            hf = 0;
        } else
            hf++;

        if (game.adapSpeed && !humanGame && game.speed !== 0)
            if (delta < 1e3 / game.fps_threshold) {
                if (game.speed < game.maxSpeed)
                    game.changeSpeed(game.speed + 1);
            } else {
                if (game.speed > 1)
                    game.changeSpeed(game.speed - 1);
            }

        for (let i = 0; i < game.speed; i++) {
            common_loop_move(game, delta);
            move_loop(keyInput, game, delta);
        }

        common_loop_draw(game);
        draw_loop(game);
        draw_neurons(neu, bestBrainYet);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    draw_graph(stat, []);
};

function game_setup(width, height) {
    // Create objects...
    background = new Rectangle(0, 0, width, height, '#00DBFF');
    ground = new Rectangle(0, height - borderSize, width, borderSize, 'yellow');
    roof = new Rectangle(0, 0, width, borderSize, 'yellow');
    roof.draw = function (ctx) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(Math.PI);
        if (this.img)
            ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
        else {
            ctx.fillStyle = this.c;
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        }
        ctx.restore();
    };

    bird = humanGame ? new Bird() : generateArray(nbBirds).map(_ => new BirdBrain());
    pipes = generateArray(2).map((_, i) => new Pipe(width + i * spaceBetweenPipes, height));

    load_and_attach('background', background);
    load_and_attach('groundPiece', [ground, roof]);
    load_and_attach('bird', bird);
    load_and_attach('full_pipe_top', pipes);
    load_and_attach('full_pipe_bottom', pipes.map(p => p.bottomPipe));
}

function load_and_attach(name, obj) {
    assets[name] = loadImage(`images/${name}.png`);
    assets[name].onload = e => {
        if (obj.forEach)
            obj.forEach(o => o.img = e.target);
        else
            obj.img = e.target;
    };
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