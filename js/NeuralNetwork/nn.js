const [sigmoid, tanh] = [
    [
        x => 1 / (1 + Math.exp(-x)),
        y => y * (1 - y),
        "sigmoid"
    ],
    [
        x => Math.tanh(x),
        y => 1 - Math.pow(y, 2),
        "tanh"
    ]
].map(o => {
    return {
        func: o[0],
        dfunc: o[1],
        name: o[3],
        serialize: _ => o[3]
    };
});

class NeuralNetwork {
    constructor(neurons) {
        if (neurons instanceof NeuralNetwork) {
            this.info = neurons.info;
            this.weights = neurons.weights.map(w => w.copy());
            this.bias = neurons.bias.map(b => b.copy());
            this.setActivationFunction(neurons.activation_function);
        } else {
            if (neurons.length < 2)
                throw "Can't create network with less than 2 layers";

            this.info = neurons;
            this.weights = [];
            this.bias = [];
            for (let i = 0; i < neurons.length - 1; i++) {
                this.weights.push(new Matrix(neurons[i + 1], neurons[i]).randomize());
                this.bias.push(new Matrix(neurons[i + 1], 1).randomize());
            }
            this.setActivationFunction();
        }
    }

    predict(input_array) {
        let last = Matrix.fromArray(input_array);
        this.weights.forEach((w, i) => {
            last = Matrix.multiply(w, last);
            last.add(this.bias[i]);
            last.map(this.activation_function.func);
        });
        return last.toArray();
    }

    setActivationFunction(func = sigmoid) {
        this.activation_function = func;
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data === 'string')
            data = JSON.parse(data);

        const nn = new NeuralNetwork(data.info);
        nn.weights = Matrix.deserialize(data.weights);
        nn.bias = Matrix.deserialize(data.bias);
        nn.setActivationFunction(data.activation_function);
        return nn;
    }

    static crossover(nn1, nn2) {
        if (arrayEqual(nn1.info, nn2.info) == false)
            throw "Can't crossover incompatibles neural network";

        const child = new NeuralNetwork(nn1.info);

        child.weights.map((w, k) => {
            return w.map((v, i, j) => {
                return (v + nn2.weights[k].data[i][j]) / 2;
            });
        });

        child.bias.map((w, k) => {
            return w.map((v, i, j) => {
                return (v + nn2.bias[k].data[i][j]) / 2;
            });
        });

        return child;
    }

    copy() {
        return new NeuralNetwork(this);
    }

    mutate(rate) {
        [this.weights, this.bias].forEach(w => {
            w.forEach(m => {
                m.map(val => {
                    return val + (randomFloat() < rate ? randomNormal(0, 0.1) : 0);
                });
            });
        });
    }
}