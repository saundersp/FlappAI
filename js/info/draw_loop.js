function draw_neurons(neurons, bestBrainYet) {
    const {
        ctx,
        width,
        height,
        textLeftPadding,
        mutationRate,
        nodes,
        labels,
        coor,
        colorOver,
        colorConnection,
        floatPrecision
    } = neurons;

    const colliMouse = !arrayEqual(coor, [-1, -1]) ? {
        x: coor[0],
        y: coor[1],
        w: 0,
        h: 0
    } : false;

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
    ctx.fillText(`Learning rate: ${learning_rate}`, 10, height - 12);
    ctx.fillText(`Mutation rate: ${mutationRate}`, width - 160, height - 12);

    ctx.font = "13px arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxNb = max(...nodes);
    const rad = height / maxNb / 2.5;
    const disX = width / (nodes.length + 1);

    nodes.forEach((n, i) => {
        const val = n + 1;
        const x = (i + 1) * disX;
        const y = height / val;
        for (let j = 1; j < val; j++) {
            const nY = y * j;

            const overCell = colliMouse && collision(colliMouse, {
                x: x - rad,
                y: nY - rad,
                w: rad * 2.4,
                h: rad * 2
            });

            //Drawing connections
            if (i < nodes.length - 1) {
                const val = nodes[i + 1] + 1;
                const y = height / val;
                for (let k = 1; k < val; k++) {
                    const coor = [x + disX, y * k];
                    if (overCell || colliMouse && collision(colliMouse, {
                            x: (i + 2) * disX - rad,
                            y: height / val * k - rad,
                            w: rad * 2.4,
                            h: rad * 2
                        }))
                        strokeLineText(ctx, colorOver, (i === 0 ? weights_ih : weights_ho).data[k - 1][j - 1].toFixed(floatPrecision), ...[x, nY], ...coor);
                    else {
                        ctx.beginPath();
                        ctx.moveTo(x, nY);
                        ctx.lineTo(...coor);
                        ctx.strokeStyle = colorConnection;
                        ctx.stroke();
                    }
                }
            }

            //Drawing cells
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.ellipse(x, nY, rad * 1.2, rad, 0, 0, 2 * Math.PI);
            if (overCell)
                ctx.fillStyle = colorOver;
            ctx.fill();
            ctx.stroke();

            //Drawing weight
            ctx.fillStyle = 'black';
            let data, weight;
            switch (i) {
                case 0: //inputs_nodes
                    ctx.fillText(labels[0][j - 1], x, nY);
                    break;

                case nodes.length - 1: //outputs_nodes

                    //Drawing total of connections weights
                    if (!overCell) {
                        data = weights_ho.data[j - 1];
                        weight = data.reduce((n, o) => n + o + bias_o.data[j - 1][0], 0) / data.length;
                    } else
                        weight = bias_o.data[j - 1][0];

                    ctx.fillText(weight.toFixed(floatPrecision), x, nY);

                    ctx.fillStyle = 'black';
                    ctx.fillText(labels[1][j - 1], x + textLeftPadding * 10, nY);
                    break;

                default: //hidden_nodes

                    //Drawing total of connections weights
                    if (!overCell) {
                        data = weights_ih.data[j - 1];
                        weight = data.reduce((n, o) => n + o + bias_h.data[j - 1][0], 0) / data.length;
                    } else
                        weight = bias_h.data[j - 1][0];

                    ctx.fillText(weight.toFixed(floatPrecision), x, nY);

                    break;
            }
        }
    });
}

function strokeLineText(ctx, strokeColor, text, x, y, nX, nY) {
    const disV = [
        x + (nX - x) / 2,
        y + (nY - y) / 2
    ];

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nX, nY);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    ctx.save();
    ctx.translate(...disV);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

function arrayEqual(t1, t2) {
    return t1.length === t1.length && t1.every((o, i) => o === t2[i]);
}

function draw_graph(stat, tabscore) {
    const {
        ctx,
        width,
        height,
        showN,
        lineWidth,
        pointSize
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
    const moy = (maxi - mini) / 2;
    avg = floor(avg / tabscore.length);

    ctx.lineWidth = lineWidth;
    ctx.fillStyle = 'white';

    let prevX = 0,
        prevY = height - tabscore[first] / maxi * height;
    for (let i = first + 1; i < tabscore.length; i++) {
        const o = tabscore[i];
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.arc(prevX, prevY, pointSize, 0, 2 * Math.PI);
        ctx.fill();
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

    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.strokeStyle = '#FFFFFF33';
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'grey';
    [
        `Generation: ${gen} Average: ${avg} Best ever: ${bestScoreYet}`,
        `Maximum: ${maxi}, Middle: ${moy} Minimum: ${mini}`
    ].forEach((o, i) => {
        const y = 30 * (i + 1);
        ctx.strokeText(o, 30, y);
        ctx.fillText(o, 30, y);
    });
}