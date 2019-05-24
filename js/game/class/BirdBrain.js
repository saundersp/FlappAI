class BirdBrain extends Bird {
    constructor(img, brain) {
        super(img);

        this.fitness = 0;
        if (brain)
            this.brain = brain.copy();
        else {
            this.brain = new NeuralNetwork(nodes);
            this.brain.setLearningRate(learningRate);
        }
    }

    move(delta, pipes) {
        this.score++;

        this.vY += calcSpeedFromDelta(delta, gravity);

        this.vY = constrain(this.vY, -10, 50);

        this.y += this.vY;

        if (collisionBird(this))
            this.dead = true;
        else {
            pipes.some(p => {
                if (!p.barrier.broke)
                    if (collision(this, p.barrier)) {
                        //p.barrier.broke = true;
                        this.score += 20;
                        return true;
                    }
                return false;
            });
        }
    }

    mutate() {
        this.brain.mutate(mutationRate);
    }

    think(pipes, width, height) {

        // Find the closest pipe
        let closest_dis = Infinity;
        const closest = pipes.reduce((o, p) => {
            const d = p.x + p.w - this.x;
            if (d < closest_dis && d > 0) {
                o = p;
                closest_dis = d;
            }
            return o;
        }, null);

        const barr = closest.barrier;

        //6 inputs =>        
        //Bird y position
        //Bird y velocity
        //Height top closest pipe
        //Height bottom closest pipe
        //Distance x closest pipe
        //Distance x end closest pipe

        //All numbers must be between 0 and 1
        const output = this.brain.predict([
            this.y / height,
            map(this.vY, -10, 50, 0, 1),
            barr.y / height,
            (barr.y + barr.h) / height,
            closest.x / width,
            (closest.x + closest.w) / width
        ]);

        return output[0] > output[1];
    }
}