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
            this.setLearningRate(neurons.learning_rate);
            this.setActivationFunction(neurons.activation_function);
        } else {
            if (neurons.length < 2)
                throw "not enough neurons";

            this.info = neurons;
            this.weights = [];
            this.bias = [];
            for (let i = 0; i < neurons.length - 1; i++) {
                this.weights.push(new Matrix(neurons[i + 1], neurons[i]));
                this.weights[i].randomize();
                this.bias.push(new Matrix(neurons[i + 1], 1));
                this.bias[i].randomize();
            }
            this.setLearningRate();
            this.setActivationFunction();
        }
    }

    predict(input_array) {
        let last = Matrix.fromArray(input_array);
        for (let i = 0; i < this.weights.length; i++) {
            last = Matrix.multiply(this.weights[i], last);
            last.add(this.bias[i]);
            last.map(this.activation_function.func);
        }
        return last.toArray();
    }

    setLearningRate(learning_rate = 0.1) {
        this.learning_rate = learning_rate;
    }

    setActivationFunction(func = sigmoid) {
        this.activation_function = func;
    }

    //TODO: adapt to multi hidden layers
    /*train(input_array, target_array) {
        // Generating the Hidden Outputs
        const inputs = Matrix.fromArray(input_array);
        const hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // activation function!
        hidden.map(this.activation_function.func);

        // Generating the output's output!
        const outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(this.activation_function.func);

        // Convert array to matrix object
        const targets = Matrix.fromArray(target_array);

        // Calculate the error
        // ERROR = TARGETS - OUTPUTS
        const output_errors = Matrix.subtract(targets, outputs);

        // let gradient = outputs * (1 - outputs);
        // Calculate gradient
        const gradients = Matrix.map(outputs, this.activation_function.dfunc);
        gradients.multiply(output_errors);
        gradients.multiply(this.learning_rate);


        // Calculate deltas
        const hidden_T = Matrix.transpose(hidden);
        const weight_ho_deltas = Matrix.multiply(gradients, hidden_T);

        // Adjust the weights by deltas
        this.weights_ho.add(weight_ho_deltas);
        // Adjust the bias by its deltas (which is just the gradients)
        this.bias_o.add(gradients);

        // Calculate the hidden layer errors
        const who_t = Matrix.transpose(this.weights_ho);
        const hidden_errors = Matrix.multiply(who_t, output_errors);

        // Calculate hidden gradient
        const hidden_gradient = Matrix.map(hidden, this.activation_function.dfunc);
        hidden_gradient.multiply(hidden_errors);
        hidden_gradient.multiply(this.learning_rate);

        // Calcuate input->hidden deltas
        const inputs_T = Matrix.transpose(inputs);
        const weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

        this.weights_ih.add(weight_ih_deltas);
        // Adjust the bias by its deltas (which is just the gradients)
        this.bias_h.add(hidden_gradient);
    }*/

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data === 'string')
            data = JSON.parse(data);

        const nn = new NeuralNetwork(data.info);
        nn.weights = Matrix.deserialize(data.weights);
        nn.bias = Matrix.deserialize(data.bias);
        nn.setLearningRate(data.learning_rate);
        nn.setActivationFunction(data.activation_function);
        return nn;
    }

    copy() {
        return new NeuralNetwork(this);
    }

    mutate(rate) {
        [this.weights, this.bias].forEach(w => {
            w.forEach(m => {
                m.map(val => {
                    return val + (Math.random() < rate ? randomGaussian(0, 0.1) : 0);
                })
            })
        });
    }
}