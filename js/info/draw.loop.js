function draw_neurons(neurons, bestBrainYet) {
    const {
        ctx,
        width,
        height,
        textTopPadding
    } = neurons;
    ctx.textAlign = 'center';
    ctx.font = "13px arial";

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, width, height);

    const {
        input_nodes,
        hidden_nodes,
        output_nodes
    } = bestBrainYet;

    const tabNodes = [
        [input_nodes, ["Y", "vY", "PTH", "PBH", "PdX", "PdW"]],
        [hidden_nodes],
        [output_nodes, ["Flap", "NoFlap"]]
    ];

    const maxNb = max(...tabNodes.map(n => n[0]));
    const rad = height / maxNb / 2.5;
    const disX = width / (tabNodes.length + 1);

    tabNodes.forEach((n, i) => {
        const nodes = n[0] + 1;
        const x = (i + 1) * disX;
        const y = height / nodes;
        for (let j = 1; j < nodes; j++) {
            const nY = y * j;

            ctx.strokeStyle = 'black';

            //Drawing connections
            if (i < tabNodes.length - 1) {

                const nodes = tabNodes[i + 1][0] + 1;
                const y = height / nodes;
                for (let k = 1; k < nodes; k++) {
                    ctx.beginPath();
                    ctx.moveTo(x, nY);
                    ctx.lineTo(x + disX, y * k);
                    ctx.stroke();
                }
            }

            //Drawing cells
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(x, nY, rad * 1.2, rad, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            //Drawing weight
            if (n[1]) {
                ctx.fillStyle = 'black';
                ctx.fillText(n[1][j - 1], x, nY + textTopPadding);
            }
        }
    });
}

function draw_graph(stat, tabscore) {
    const {
        ctx,
        width,
        height,
        showN
    } = stat;

    ctx.clearRect(0, 0, width, height);
    ctx.font = "15px arial";
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    let first, len;
    if (tabscore.length < showN) {
        first = 0;
        len = tabscore.length;
    } else {
        first = tabscore.length - showN;
        len = showN;
    }

    let {
        avg,
        maxi
    } = tabscore.reduce((n, o, i) => {
        if (i >= first)
            n.maxi = max(n.maxi, o);
        return {
            maxi: n.maxi,
            avg: n.avg + o
        };
    }, {
        maxi: 0,
        avg: 0
    });
    avg = floor(avg / tabscore.length);

    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(0, height - tabscore[first] / maxi * height);

    let prevX = 0;
    let mini = Infinity;
    for (let i = first; i < tabscore.length; i++) {
        const o = tabscore[i];
        prevX += width / len;
        const y = height - o / maxi * height;
        ["lineTo", "moveTo"].forEach(t => ctx[t](prevX, y));
        mini = min(mini, o);
    }
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'grey';
    [
        `Gen: ${gen} Avg: ${avg} Best: ${bestScoreYet}`,
        `Max: ${maxi}, Min: ${mini}`
    ].forEach((o, i) => ["strokeText", "fillText"].forEach(t => ctx[t](o, 30, 30 * (i + 1))));
}