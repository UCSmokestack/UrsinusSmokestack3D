// https://github.com/quantmind/d3-quant Version 0.4.2. Copyright 2017 quantmind.com.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array')) :
	typeof define === 'function' && define.amd ? define('d3-quant', ['exports', 'd3-array'], factory) :
	(factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Array) { 'use strict';

var BITS = 52;
var SCALE = 2 << 51;
var COEFFICIENTS = ['d       s       a       m_i', '2       1       0       1', '3       2       1       1 3', '4       3       1       1 3 1', '5       3       2       1 1 1', '6       4       1       1 1 3 3', '7       4       4       1 3 5 13', '8       5       2       1 1 5 5 17', '9       5       4       1 1 5 5 5', '10      5       7       1 1 7 11 1'];

function sobol(dim) {
    return new Sobol(dim);
}

function Sobol(dimension) {
    if (dimension < 1 || dimension > COEFFICIENTS.length) throw new Error("Out of range dimension");
    var tmp = [],
        direction = [],
        zero = [],
        x = [],
        lines = COEFFICIENTS,
        count = 0,
        i;

    Object.defineProperties(this, {
        dimension: {
            get: function get() {
                return dimension;
            }
        },
        count: {
            get: function get() {
                return count;
            }
        }
    });

    this.next = next;

    for (i = 0; i <= BITS; i++) {
        tmp.push(0);
    }for (i = 0; i < dimension; i++) {
        direction[i] = tmp.slice();
        x[i] = 0;
        zero[i] = 0;
    }

    for (i = 1; i <= BITS; i++) {
        direction[0][i] = 1 << BITS - i;
    }for (var d = 1; d < dimension; d++) {
        var cells = lines[d].split(/\s+/);
        var s = +cells[1];
        var a = +cells[2];
        var m = [0];
        for (i = 0; i < s; i++) {
            m.push(+cells[3 + i]);
        }for (i = 1; i <= s; i++) {
            direction[d][i] = m[i] << BITS - i;
        }for (i = s + 1; i <= BITS; i++) {
            direction[d][i] = direction[d][i - s] ^ direction[d][i - s] >> s;
            for (var k = 1; k <= s - 1; k++) {
                direction[d][i] ^= (a >> s - 1 - k & 1) * direction[d][i - k];
            }
        }
    }

    function next() {
        if (count === 0) {
            count++;
            return zero.slice();
        }
        var v = [],
            c = 1,
            value = count - 1;
        while ((value & 1) == 1) {
            value >>= 1;
            c++;
        }
        for (i = 0; i < dimension; i++) {
            x[i] ^= direction[i][c];
            v[i] = x[i] / SCALE;
        }
        count++;
        return v;
    }
}

Sobol.prototype = {
    generate: function generate(num) {
        var draws = [];
        for (var i = 0; i < num; ++i) {
            draws.push(this.next());
        }return draws;
    }
};

function euclidean(v1, v2) {
    var total = 0;
    for (var i = 0; i < v1.length; i++) {
        total += Math.pow(v2[i] - v1[i], 2);
    }return Math.sqrt(total);
}

var distances = Object.freeze({
	euclidean: euclidean
});

//  K-means clustering
var kmeans = function () {
    var _maxIters = 300,
        _distance,
        _centroids;

    var km = {
        centroids: function centroids(x) {
            if (!arguments.length) return _centroids;
            _centroids = x;
            return km;
        },
        maxIters: function maxIters(x) {
            if (!arguments.length) return _maxIters;
            _maxIters = +x;
            return km;
        },
        distance: function distance(_) {
            if (!arguments.length) return _distance;
            _ = _ || "euclidean";
            if (typeof _ == "string") _ = distances[_];
            _distance = _;
            return km;
        },


        // create a set of random centroids from a set of points
        randomCentroids: function randomCentroids(points, K) {
            var means = points.slice(0); // copy
            means.sort(function () {
                return Math.round(Math.random()) - 0.5;
            });
            return means.slice(0, K);
        },
        classify: function classify(point) {
            var min = Infinity,
                index = 0,
                i = void 0,
                dist = void 0;

            for (i = 0; i < _centroids.length; i++) {
                dist = _distance(point, _centroids[i]);
                if (dist < min) {
                    min = dist;
                    index = i;
                }
            }
            return index;
        },
        cluster: function cluster(points, callback) {

            var iterations = 0,
                movement = true,
                N = points.length,
                newCentroids,
                n,
                k;

            if (!_centroids) {
                _centroids = km.randomCentroids(points, N);
                km.centroids(_centroids);
            }

            var K = _centroids.length,
                clusters = new Array(K);

            if (N < K) throw Error('Number of points less than the number of clusters in K-means classification');

            while (movement && iterations < km.maxIters()) {
                movement = false;
                ++iterations;

                // Assignments
                for (k = 0; k < K; ++k) {
                    clusters[k] = {
                        centroid: _centroids[k],
                        points: [],
                        indices: []
                    };
                }for (n = 0; n < N; n++) {
                    k = km.classify(points[n]);
                    clusters[k].points.push(points[n]);
                    clusters[k].indices.push(n);
                }

                // Update centroids
                newCentroids = [];
                for (k = 0; k < K; ++k) {
                    if (clusters[k].points.length) newCentroids.push(d3Array.mean(clusters[k].points));else {
                        // A centroid with no points, randomly re-initialise it
                        newCentroids = km.randomCentroids(points, K);
                        break;
                    }
                }

                for (k = 0; k < K; ++k) {
                    if (newCentroids[k] != _centroids[k]) {
                        _centroids = newCentroids;
                        movement = true;
                        break;
                    }
                }

                km.centroids(_centroids);

                if (callback) callback(clusters, iterations);
            }

            return clusters;
        }
    };

    return km.distance('euclidean');
};

// Poisson disk sampler
// Based on https://www.jasondavies.com/poisson-disc/
var poisson = function (width, height, radius) {

    var k = 30,
        // maximum number of samples before rejection
    radius2 = radius * radius,
        R = 3 * radius2,
        cellSize = radius * Math.SQRT1_2,
        gridWidth = Math.ceil(width / cellSize),
        gridHeight = Math.ceil(height / cellSize),
        grid = new Array(gridWidth * gridHeight),
        queue = [],
        queueSize = 0,
        sampleSize = 0;

    return function () {
        if (!sampleSize) return sample(Math.random() * width, Math.random() * height);

        // Pick a random existing sample and remove it from the queue.
        while (queueSize) {
            var i = Math.random() * queueSize | 0,
                s = queue[i];

            // Make a new candidate between [radius, 2 * radius] from the existing sample.
            for (var j = 0; j < k; ++j) {
                var a = 2 * Math.PI * Math.random(),
                    r = Math.sqrt(Math.random() * R + radius2),
                    x = s[0] + r * Math.cos(a),
                    y = s[1] + r * Math.sin(a);

                // Reject candidates that are outside the allowed extent,
                // or closer than 2 * radius to any existing sample.
                if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
            }

            queue[i] = queue[--queueSize];
            queue.length = queueSize;
        }
    };

    function far(x, y) {
        var i = x / cellSize | 0,
            j = y / cellSize | 0,
            i0 = Math.max(i - 2, 0),
            j0 = Math.max(j - 2, 0),
            i1 = Math.min(i + 3, gridWidth),
            j1 = Math.min(j + 3, gridHeight);

        for (j = j0; j < j1; ++j) {
            var o = j * gridWidth;
            for (i = i0; i < i1; ++i) {
                if (s = grid[o + i]) {
                    var s,
                        dx = s[0] - x,
                        dy = s[1] - y;
                    if (dx * dx + dy * dy < radius2) return false;
                }
            }
        }

        return true;
    }

    function sample(x, y) {
        var s = [x, y];
        queue.push(s);
        grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
        ++sampleSize;
        ++queueSize;
        return s;
    }
};

var M = {
    'Y': 'Years',
    'M': 'Months',
    'W': 'Weeks',
    'D': 'Days'
};

function period(pstr) {
    if (pstr instanceof period) return pstr;
    return new Period().addTenure(pstr);
}

function Period() {
    this.$months = 0;
    this.$days = 0;

    Object.defineProperties(this, {
        years: {
            get: function get() {
                return Math.trunc(this.$months / 12);
            }
        },
        months: {
            get: function get() {
                return this.$months % 12;
            }
        },
        weeks: {
            get: function get() {
                return Math.trunc(this.$days / 7);
            }
        },
        days: {
            get: function get() {
                return this.$days % 7;
            }
        },
        totalDays: {
            get: function get() {
                return 30 * this.$months + this.$days;
            }
        }
    });
}

Period.prototype = period.prototype = {
    addTenure: function addTenure(pstr) {
        if (pstr instanceof period) {
            this.$months += pstr.$months;
            this.$days += pstr.$days;
        } else {
            var st = ('' + pstr).toUpperCase(),
                search = 'DWMY',
                s = 0,
                S = search[s],
                sign = 1,
                ip,
                l;

            if (st[0] === '-') {
                sign = -1;
                st = st.substring(1);
            }

            while (st.length) {
                if (!S) throw new Error('Unknown period "' + pstr + '"');
                ip = st.indexOf(S);
                if (ip == -1) {
                    S = search[++s];
                    continue;
                }
                l = 0;
                while (ip - l - 1 >= 0 && +st[ip - l - 1] === +st[ip - l - 1]) {
                    l++;
                }if (!l) throw new Error('Unknown period "' + pstr + '"');
                this['add' + M[S]](sign * st.substring(ip - l, ip));
                st = st.substring(0, ip - l) + st.substring(ip + 1);
            }
        }
        return this;
    },
    addDays: function addDays(days) {
        this.$days += days;
    },
    addWeeks: function addWeeks(weeks) {
        this.$days += 7 * weeks;
    },
    addMonths: function addMonths(months) {
        this.$months += months;
    },
    addYears: function addYears(years) {
        this.$months += 12 * years;
    }
};

var round = function (x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
};

function btree() {
    return new Btree();
}

function Btree() {
    this.root = null;
}

function Node(node) {
    this.score = typeof node == 'number' ? node : node.score;
    this.value = node.value;
    this.parent = null;
    this.left = null;
    this.right = null;
    this.red = false;

    Object.defineProperty(this, 'root', {
        get: function get() {
            return this.parent ? this.parent.root : this;
        }
    });
}

Btree.prototype = btree.prototype = {
    insert: function insert(node, callback) {
        if (!this.root) {
            this.root = new Node(node);
            if (callback) callback(this.root);
        } else this.root = this.root.insert(node, callback);
    },
    size: function size() {
        return this.root ? this.root.size() : 0;
    },
    maxDepth: function maxDepth() {
        return this.root ? this.root.maxDepth() : 0;
    },
    traverse: function traverse(callback) {
        this.root ? this.root.traverse(callback) : null;
    },
    traverseInOrder: function traverseInOrder(callback) {
        this.root ? this.root.traverseInOrder(callback) : null;
    },
    nodes: function nodes() {
        return this.root ? this.root.nodes() : [];
    },
    links: function links() {
        return this.root ? this.root.links() : [];
    }
};

Node.prototype = {

    insert: function insert(node, callback) {
        var score = typeof node == 'number' ? node : node.score,
            nd;

        if (score > this.score) {
            if (this.right) return this.right.insert(node);else this.right = nd = new Node(score);
        } else {
            if (this.left) return this.left.insert(node);else this.left = nd = new Node(score);
        }
        nd.red = true;
        nd.parent = this;
        var root = rb_insert_fix(nd);
        if (callback) callback(nd);
        return root;
    },

    size: function size() {
        var count = 0;
        this.traverse(function () {
            count++;
        });
        return count;
    },
    depth: function depth() {
        if (this.parent) return this.parent.depth() + 1;else return 0;
    },
    maxDepth: function maxDepth() {
        var dl = this.left ? this.left.maxDepth() + 1 : 0,
            dr = this.right ? this.right.maxDepth() + 1 : 0;
        return Math.max(dl, dr);
    },
    traverse: function traverse(callback) {
        callback(this);
        if (this.left) this.left.traverse(callback);
        if (this.right) this.right.traverse(callback);
    },
    traverseInOrder: function traverseInOrder(callback) {
        if (this.left) this.left.traverseInOrder(callback);
        callback(this);
        if (this.right) this.right.traverseInOrder(callback);
    },
    nodes: function nodes() {
        var nodes = [];
        this.traverseInOrder(function (node) {
            nodes.push(node);
        });
        return nodes;
    },
    links: function links() {
        var links = [];
        this.traverse(function (node) {
            if (node.parent) links.push({
                source: node.parent.index,
                target: node.index
            });
        });
        return links;
    }
};

function rb_insert_fix(z) {
    var y;

    if (!z.parent || !z.parent.red) {
        z = z.root;
        z.red = false;
        return z;
    }

    if (z.parent === z.parent.parent.left) {
        y = z.parent.parent.right;
        if (y && y.red) {
            z.parent.red = false;
            y.red = false;
            z.parent.parent.red = true;
            z = z.parent.parent;
        } else {
            if (z === z.parent.right) {
                z = z.parent;
                left_rotate(z);
            }
            z.parent.red = false;
            z.parent.parent.red = true;
            right_rotate(z.parent.parent);
        }
    } else {
        y = z.parent.parent.left;
        if (y && y.red) {
            z.parent.red = false;
            y.red = false;
            z.parent.parent.red = true;
            z = z.parent.parent;
        } else {
            if (z === z.parent.left) {
                z = z.parent;
                right_rotate(z);
            }
            z.parent.red = false;
            z.parent.parent.red = true;
            left_rotate(z.parent.parent);
        }
    }

    return rb_insert_fix(z);
}

function left_rotate(x) {
    var y = x.right;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent) {
        if (x === x.parent.left) x.parent.left = y;else x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
}

function right_rotate(x) {
    var y = x.left;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (x.parent) {
        if (x === x.parent.right) x.parent.right = y;else x.parent.left = y;
    }
    y.right = x;
    x.parent = y;
}

var version = "0.4.2";

exports.sobol = sobol;
exports.kmeans = kmeans;
exports.poisson = poisson;
exports.period = period;
exports.round = round;
exports.binaryTree = btree;
exports.quantVersion = version;

Object.defineProperty(exports, '__esModule', { value: true });

})));
