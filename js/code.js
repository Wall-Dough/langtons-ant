/*
    w = Grid width
    h = Grid height
    c_d = cell dimensions
*/

var fps = 1000;
var grid;
var ant;
var stepInterval = -1;

function Grid(w, h, c_d) {
    this.w = w;
    this.h = h;
    this.c_d = c_d;

    this.map = [];
    for (var i = 0; i < this.h; i++) {
        var row = [];
        for (var j = 0; j < this.w; j++) {
            row.push(false);
        }
        this.map.push(row);
    }
    console.log(this.map);

    this.c = document.createElement("canvas");
    this.c.grid = this;
    this.c.width = this.w * this.c_d;
    this.c.height = this.h * this.c_d;
    var sizeString = this.c_d.toString() + "px";
    sizeString += " " + sizeString;
    this.c.setAttribute("style", "background-size: " + sizeString);

    this.ctx = this.c.getContext("2d");

    var div = document.createElement("div");
    var input = document.createElement("input");
    input.setAttribute("type", "button");
    input.setAttribute("onclick", "toggle();");
    input.setAttribute("value", "Toggle");
    div.appendChild(this.c);
    div.appendChild(document.createElement("br"));
    div.appendChild(input);
    document.body.appendChild(div);

    this.draw = function (x, y) {
        if ((x >= this.w) || (x < 0)) return;
        if ((y >= this.h) || (y < 0)) return;

        this.ctx.beginPath();
        this.ctx.fillStyle = "black";

        if (this.map[y][x])
            this.ctx.fillRect(x * this.c_d, y * this.c_d, this.c_d, this.c_d);
        else
            this.ctx.clearRect(x * this.c_d, y * this.c_d, this.c_d, this.c_d);
    };

    this.get = function(x, y) {
        if ((x >= this.w) || (x < 0)) return false;
        if ((y >= this.h) || (y < 0)) return false;

        return this.map[y][x];
    };

    this.set = function(x, y, val) {
        if ((x >= this.w) || (x < 0)) return;
        if ((y >= this.h) || (y < 0)) return;

        this.map[y][x] = val;
    };

    this.swap = function(x, y) {
        if ((x >= this.w) || (x < 0)) return;
        if ((y >= this.h) || (y < 0)) return;

        this.set(x, y, !this.get(x, y));
        this.draw(x, y);
    };

    this.handleClick = function(e) {
        console.log(this.grid);
        var mouseX = e.clientX;
        var mouseY = e.clientY;
        var rect = this.getBoundingClientRect();
        var x = Math.floor((mouseX - rect.left) / this.grid.c_d);
        var y = Math.floor((mouseY - rect.top) / this.grid.c_d);
        console.log(x);
        console.log(y);
        this.grid.swap(x, y);
    };

    this.randomInt = function (bound) {
        return Math.floor(Math.random() * bound);
    };

    this.randomX = function () {
        return this.randomInt(this.w);
    };

    this.randomY = function () {
        return this.randomInt(this.h);
    };

    this.drawRandom = function (n) {
        for (var i = 0; i < n; i++) {
            this.swap(this.randomX(), this.randomY());
        }
    };

    this.c.onclick = this.handleClick;
}


function Ant(x, y, g) {
    this.x = x;
    this.y = y;
    this.g = g;
    this.d = {a: true, b: true};

    this.in_bounds = function () {
        while (this.x < 0) this.x += this.g.w;
        while (this.y < 0) this.y += this.g.h;
        while (this.x >= this.g.w) this.x -= this.g.w;
        while (this.y >= this.g.h) this.y -= this.g.h;
    };

    this.in_bounds();

    /*
        swab b      TRUE TRUE   swap a
        TRUE FALSE              FALSE TRUE
        swap a      FALSE FALSE swap b


        swap b when a == b and dir == TRUE
                    a != b and dir == FALSE
        swap a when a == b and dir == FALSE
                    a != b and dir == TRUE
        FALSE FALSE: down
            turn 90 left: to right
                swap b
            turn 90 right: to left
                swap a
        FALSE TRUE: right
            turn 90 left: to up
                swap a
            turn 90 right: to down
                swap b
        TRUE FALSE: left
            turn 90 left: to down
                swap a
            turn 90 right: to up
                swap b
        TRUE TRUE: up
            turn 90 left: to left
                swap b
            turn 90 right: to right
                swap a


        FALSE: turn 90 deg right
        TRUE: turn 90 deg left
    */
    this.turn = function (dir) {
        if ((this.d.a + this.d.b + dir) % 2) this.d.b = !this.d.b;
        else this.d.a = !this.d.a;
    };

    this.move = function () {
        if (this.d.a) {
            if (this.d.b) this.y--;
            else this.x--;
        }
        else {
            if (this.d.b) this.x++;
            else this.y++;
        }

        this.in_bounds();
    };

    this.step = function () {
        this.turn(this.g.get(this.x, this.y));
        this.g.swap(this.x, this.y);
        this.move();
        this.draw();
    };

    this.draw = function () {
        this.g.ctx.beginPath();
        this.g.ctx.strokeStyle = "red";
        this.g.ctx.moveTo((this.x + 0.5) * this.g.c_d, (this.y + 0.5) * this.g.c_d);
        var dx = 0;
        var dy = 0;
        if (this.d.a) {
            if (this.d.b) dx = 0.5;
            else dy = 0.5;
        }
        else {
            if (this.d.b) {
                dx = 1;
                dy = 0.5;
            }
            else {
                dx = 0.5;
                dy = 1;
            }
        }
        this.g.ctx.lineTo((this.x + dx) * this.g.c_d, (this.y + dy) * this.g.c_d);
        this.g.ctx.stroke();
    };
}

function play() {
    stepInterval = setInterval(function () {
        ant.step();
    }, 1000 / fps);
}

function pause() {
    if (stepInterval != -1) {
        clearInterval(stepInterval);
        stepInterval = -1;
    }
}

function toggle() {
    if (stepInterval != -1) pause();
    else play();
}

window.onload = function () {
    grid = new Grid(100, 100, 5);

    ant = new Ant(50, 50, grid);

    ant.draw();

}
