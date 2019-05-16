function draw_neurons(neurons, bestBrainYet) {
    const {
        ctx,
        width,
        height,
        textTopPadding,
        nodes,
        labels
    } = neurons;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, width, height);

    const {
        weights_ho,
        weights_ih,
        bias_h,
        bias_o,
        learning_rate
    } = bestBrainYet;

    ctx.textAlign = 'left';
    ctx.font = "18px arial";
    ctx.fillStyle = 'black';
    ctx.fillText(`Learning rate: ${learning_rate}`, 20, height - 10);

    ctx.font = "13px arial";
    ctx.textAlign = 'center';

    const maxNb = max(...nodes);
    const rad = height / maxNb / 2.5;
    const disX = width / (nodes.length + 1);

    nodes.forEach((n, i) => {
        const val = n + 1;
        const x = (i + 1) * disX;
        const y = height / val;
        for (let j = 1; j < val; j++) {
            const nY = y * j;

            ctx.strokeStyle = 'black';

            //Drawing connections
            if (i < nodes.length - 1) {

                const val = nodes[i + 1] + 1;
                const y = height / val;
                for (let k = 1; k < val; k++) {
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
            ctx.fillStyle = 'black';
            let data, weight;
            switch (i) {
                case 0: //inputs_nodes
                    ctx.fillText(labels[0][j - 1], x, nY + textTopPadding);
                    break;

                case nodes.length - 1: //outputs_nodes
                    data = weights_ho.data[j - 1];
                    weight = data.reduce((n, o) => n + o + bias_o.data[j - 1][0], 0) / data.length;
                    ctx.fillText(weight.toFixed(2), x, nY + textTopPadding);
                    ctx.fillStyle = 'black';
                    ctx.fillText(labels[1][j - 1], x + textTopPadding * 10, nY + textTopPadding);
                    break;

                default: //hidden_nodes
                    data = weights_ih.data[j - 1];
                    weight = data.reduce((n, o) => n + o + bias_h.data[j - 1][0], 0) / data.length;
                    ctx.fillText(weight.toFixed(4), x, nY + textTopPadding);
                    break;
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

    len--;

    let {
        avg,
        maxi,
        mini
    } = tabscore.reduce((n, o, i) => {
        if (i > first) {
            n.maxi = max(n.maxi, o);
            n.mini = min(n.mini, o);
        }
        return {
            maxi: n.maxi,
            mini: n.mini,
            avg: n.avg + o
        };
    }, {
        maxi: 0,
        mini: Infinity,
        avg: 0
    });
    avg = floor(avg / tabscore.length);

    let prevX = 0,
        prevY = height - tabscore[first] / maxi * height;
    for (let i = first + 1; i < tabscore.length; i++) {
        const o = tabscore[i];
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.moveTo(prevX, prevY);
        prevX += width / len;
        prevY = height - o / maxi * height;
        ctx.lineTo(prevX, prevY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(prevX, 0);
        ctx.strokeStyle = '#FFFFFF33';
        ctx.lineTo(prevX, width);
        ctx.stroke();
        ctx.moveTo(prevX, prevY);
    }
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'grey';
    [
        `Gen: ${gen} Avg: ${avg} Best: ${bestScoreYet}`,
        `Max: ${maxi}, Min: ${mini}`
    ].forEach((o, i) => {
        const y = 30 * (i + 1);
        ctx.strokeText(o, 30, y);
        ctx.fillText(o, 30, y);
    });
}