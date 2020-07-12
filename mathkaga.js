window.onload = function() {
    $('canvas[mathkaga]').each(function(index, element) {

        $(element).attr('title', 'mathkaga is working now.');
        $(element).tooltip();
        function changeTitle(title) {
            $(element).attr('data-original-title', title);
        }
        

        $(element).attr('id', 'mathkaga_' + index);
        const width = $(element).attr('width') || 200;
        const height = $(element).attr('height') || 200;
        const xMin = $(element).attr('xMin') || -100;
        const yMin = $(element).attr('yMin') || -100;
        const xMax = $(element).attr('xMax') || 100;
        const yMax = $(element).attr('yMax') || 100;
        const mk = new MathKaga(
            $(element).attr('id'),
            $(element).attr('mathkaga'),
            parseInt(width),
            parseInt(height),
            parseFloat(xMin),
            parseFloat(yMin),
            parseFloat(xMax),
            parseFloat(yMax),
            changeTitle
        );
    });
}
class MathKaga{
    constructor(id, formula, width, height, xMin, yMin, xMax, yMax, changeTitle){
        const _self = this;
        _self.canvas = document.getElementById(id);
        _self.ctx = _self.canvas.getContext("2d");
        _self.changeSize(width, height);
        _self.drawScreen(_self.vec2rgb(0, 0, 1));
        
        _self.sz = 32;
        _self.x = 0;
        _self.y = 0;
        function render() {
            for(let count = 0; count < 1000; count++) {
                if(_self.sz === 0){
                    changeTitle(formula);
                    return;
                }
                const X = xMin + _self.x * (xMax - xMin) / _self.width;
                const Y = yMin + _self.y * (yMax - yMin) / _self.height;
                const color = _self.vec2rgb(_self.calculateVec(formula, X, Y));
                _self.drawBox(_self.x, _self.y, _self.x + _self.sz, _self.y + _self.sz, color, -1);
                _self.x += _self.sz;
                if(_self.x >= _self.width) {
                    _self.x = 0;
                    _self.y += _self.sz;
                }
                if(_self.y >= _self.height) {
                    _self.y = 0;
                    _self.sz = parseInt(_self.sz / 2);
                    changeTitle(`mathkaga is working now. pitch : ${_self.sz}, ${formula}`);
                }
            }
            _self.requestID = window.requestAnimationFrame(render);
            
        }
        _self.requestID = window.requestAnimationFrame(render);
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
    rgb(r, g, b) {
        return "rgb(" + r + "," + g + "," + b + ")";
    }
    vec2rgb(vec) {
        const x = vec.x;
        const y = vec.y;
        const z = vec.z;
        const norm = Math.sqrt(x * x + y * y + z * z);
        const n_x = x / norm;
        const n_y = -y / norm;
        const n_z = z / norm;
        const color = this.rgb(
            parseInt(128 + 127 * n_x),
            parseInt(128 + 127 * n_y),
            parseInt(128 + 127 * n_z)
        );
        return color;
    }
    changeSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    drawBox(x1, y1, x2, y2, color, thickness = 1) {
        const w = x2 - x1;
        const h = y2 - y1;
        if (thickness < 0) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x1, y1, w, h);
        } else {
            this.ctx.lineWidth = thickness;
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(x1, y1, w, h);
        }
    }
    drawScreen(color) {
        this.drawBox(0, 0, this.width, this.height, color, -1);
    }
    drawDot(x, y, color) {
        this.drawBox(x, y, x + 1, y + 1, color, -1);
    }    
    parseFormula(formula, x, y) {
        if(!this.code) {
            this.code = [];
            const _self = this;
            function addCode(before, after) {
                _self.code.push({"before":before, "after":after});
            }
            addCode("sqrt", "Math.sqrt");
            addCode("^", "**");
            addCode("max", "Math.max");
            addCode("sin", "Math.sin");
            addCode("cos", "Math.cos");
            addCode("pi", "Math.pi");
            addCode("abs", "Math.abs");
            addCode("exp", "Math.exp");
            addCode("e", "Math.E");
            addCode("z", "");
            addCode("=", "");
            addCode(" ", "");
            this.str = String(formula);
            this.code.forEach((value, index) => {
                this.str = this.str.split(value.before).join(`CODE[${index}]`);
            });
            this.str = this.str.split('x').join('CODE[X]');
            this.str = this.str.split('y').join('CODE[Y]');
            this.code.forEach((value, index) => {
                this.str = this.str.split(`CODE[${index}]`).join(value.after);
            });
        }
        let str = this.str.split('CODE[X]').join(`(${x})`);
        str = str.split('CODE[Y]').join(`(${y})`);
        return(Function('"use strict";return (' + str + ')')());
    }
    calculateVec(formula, x, y) {
        let vec = {x: 0, y: 0, z: 1};
        vec.x = this.parseFormula(formula, x - 0.5, y) - this.parseFormula(formula, x + 0.5, y);
        vec.y = this.parseFormula(formula, x, y - 0.5) - this.parseFormula(formula, x, y + 0.5);
        return vec;
    }
};