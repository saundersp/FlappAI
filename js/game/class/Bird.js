class Bird extends Rectangle {
    constructor() {
        super(100, 300, 40, 30, 'rgba(0, 100, 100, 0.5)');
        this.vY = 0;
        this.dead = false;
        this.score = 0;
    }

    move(delta, pipes) {
        this.vY += calcSpeedFromDelta(delta, gravity);

        this.vY = constrain(this.vY, -10, 30);

        this.y += this.vY;

        if (collisionBird(this))
            this.dead = true;
        /*if (collision(bird, ground))
            bird.y = ground.y - bird.h;*/

        else {
            pipes.some(p => {
                if (!p.barrier.broke)
                    if (collision(this, p.barrier)) {
                        p.barrier.broke = true;
                        this.score++;
                        return true;
                    }
                return false;
            });
        }
    }

    flap(delta) {
        this.vY = -calcSpeedFromDelta(delta, speedY);
    }
}