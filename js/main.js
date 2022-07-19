(function () {
    self.Board = function (width, height) {
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.playing = false;
    }

    self.Board.prototype = {
        get elements() {
            var elements = this.bars.map(function (bar) { return bar; });
            elements.push(this.ball);
            return elements;
        }
    }
})();

(function () {
    self.Ball = function (x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_y = 0;
        this.speed_x = 3;
        this.board = board;
        this.direction = 1;
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed = 3;

        board.ball = this;
        this.kind = "circle";
    }

    self.Ball.prototype = {
        move: function () {
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y);
        },
        get width() {
            return this.radius * 2;
        },
        get height() {
            return this.radius * 2;
        },
        collision: function (bar) {
            // Reacciona a la colisión con una barra que recibe como parámetro
            var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;
            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if (this.x > (this.board.width / 2)) this.direction = -1;
            else this.direction = 1;
        }
    }
})();

(function () {
    self.Bar = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 5;
    }

    self.Bar.prototype = {
        down: function () {
            this.y += this.speed;

        },
        up: function () {
            this.y -= this.speed;
        },
        toString: function () {
            return "x: " + this.x + " y: " + this.y;
        }
    }
})();

(function () {
    self.BoardView = function (canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.context = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        clean: function () {
            this.context.clearRect(0, 0, this.board.width, this.board.height);
        },
        draw: function () {
            for (var i = this.board.elements.length - 1; i >= 0; i--) {
                var element = this.board.elements[i];

                draw(this.context, element);
            };
        },
        check_collisions: function () {
            for (var i = this.board.bars.length - 1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if (hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);
                }
            };
        },
        play: function () {
            if (this.board.playing) {
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
            }
        }
    }

    function hit(element_a, element_b) {
        //Revisa si el elemento A colisiona con B
        var hit = false;

        // Colisiones horizontales
        if (element_b.x + element_b.width >= element_a.x && element_b.x < element_a.x + element_a.width) {
            // Colisiones verticales
            if (element_b.y + element_b.height >= element_a.y && element_b.y < element_a.y + element_a.height) {
                hit = true;
            }
        }

        // Colisión de a con b
        if (element_b.x <= element_a.x && element_b.x + element_b.width >= element_a.x + element_a.width) {
            if (element_b.y <= element_a.y && element_b.y + element_b.height >= element_a.y + element_a.height) {
                hit = true;
            }
        }

        // Colisión de b con a
        if (element_a.x <= element_b.x && element_a.x + element_a.width >= element_b.x + element_b.width) {
            if (element_a.y <= element_b.y && element_a.y + element_a.height >= element_b.y + element_b.height) {
                hit = true;
            }
        }

        return hit;
    }

    function draw(context, element) {
        switch (element.kind) {
            case "rectangle":
                context.fillRect(element.x, element.y, element.width, element.height);
                break;

            case "circle":
                context.beginPath();
                context.arc(element.x, element.y, element.radius, 0, 7);
                context.fill();
                context.closePath();
                break;
        }
    }
})();

var board = new Board(800, 300);
var bar = new Bar(20, 100, 40, 100, board);
var bar_2 = new Bar(740, 100, 40, 100, board);
var canvas = document.getElementById('canvas', board);
var board_view = new BoardView(canvas, board);
var ball = new Ball(350, 100, 10, board);

document.addEventListener("keydown", function (event) {
    if (event.keyCode === 38) {
        event.preventDefault();
        bar.up();
    }
    else if (event.keyCode === 40) {
        event.preventDefault();
        bar.down();
    }
    else if (event.keyCode === 87) { // W
        event.preventDefault();
        bar_2.up();
    }
    else if (event.keyCode === 83) { // S
        event.preventDefault();
        bar_2.down();
    }
    else if (event.keyCode === 32) { // PAUSE
        event.preventDefault();
        board.playing = !board.playing;
    }
});

board_view.draw();
window.requestAnimationFrame(controller);

function controller() {
    board_view.play();
    window.requestAnimationFrame(controller);
}