class BirdBrain extends Bird {
	constructor(img, brain) {
		super(img);
		this.fitness = 0;
		this.brain = brain ? brain.copy() : new NeuralNetwork(nodes);
		this.brain.setActivationFunction(tanh);
	}

	move(delta) {
		this.vY += calcSpeedFromDelta(delta, gravity);
		this.vY = constrain(this.vY, -10, 50);
		this.y += this.vY;
		if (collisionBird(this))
			this.dead = true;
		else
			this.score++;
	}

	mutate(rate) {
		this.brain.mutate(rate);
		return this;
	}

	think(pipes, width, height) {

		// Find the closest pipe
		let closest_dis = Infinity;
		const { barrier, x: closest_x, w: closest_w } = pipes.reduce((o, p) => {
			const d = p.x + p.w - this.x;
			if (d < closest_dis && d > 0) {
				o = p;
				closest_dis = d;
			}
			return o;
		}, null);

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
			barrier.y / height,
			(barrier.y + barrier.h) / height,
			closest_x / width,
			(closest_x + closest_w) / width
		]);

		return output[0] > output[1];
	}
}