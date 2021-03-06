/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2014, Juerg Lehni & Jonathan Puckey
 * http://scratchdisk.com/ & http://jonathanpuckey.com/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

module('Path');

test('path.join(path)', function() {
    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);

    var path2 = new Path();
    path2.add(10, 0);
    path2.add(20, 10);

    path.join(path2);
    equals(path.segments.toString(), '{ point: { x: 0, y: 0 } },{ point: { x: 10, y: 0 } },{ point: { x: 20, y: 10 } }');
    equals(function() {
        return paper.project.activeLayer.children.length;
    }, 1);

    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);

    var path2 = new Path();
    path2.add(20, 10);
    path2.add(10, 0);
    path.join(path2);
    equals(path.segments.toString(), '{ point: { x: 0, y: 0 } },{ point: { x: 10, y: 0 } },{ point: { x: 20, y: 10 } }');

    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);

    var path2 = new Path();
    path2.add(30, 10);
    path2.add(40, 0);
    path.join(path2);
    equals(path.segments.toString(), '{ point: { x: 0, y: 0 } },{ point: { x: 10, y: 0 } },{ point: { x: 30, y: 10 } },{ point: { x: 40, y: 0 } }');

    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);
    path.add(20, 10);

    var path2 = new Path();
    path2.add(0, 0);
    path2.add(10, 5);
    path2.add(20, 10);

    path.join(path2);

    equals(path.segments.toString(), '{ point: { x: 0, y: 0 } },{ point: { x: 10, y: 0 } },{ point: { x: 20, y: 10 } },{ point: { x: 10, y: 5 } }');
    equals(function() {
        return path.closed;
    }, true);
});

test('path.remove()', function() {
    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);
    path.add(20, 0);
    path.add(30, 0);

    path.removeSegment(0);
    equals(function() {
        return path.segments.length;
    }, 3);

    path.removeSegment(0);
    equals(function() {
        return path.segments.length;
    }, 2);

    path.removeSegments(0, 1);
    equals(function() {
        return path.segments.length;
    }, 1);

    path.remove();

    equals(function() {
        return paper.project.activeLayer.children.length;
    }, 0);
});

test('path.removeSegments()', function() {
    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);
    path.add(20, 0);
    path.add(30, 0);

    path.removeSegments();
    equals(function() {
        return path.segments.length;
    }, 0);
});

test('path.getNearestPoint()', function() {
    var path = new Path();
    path.add(0, 0);
    path.add(10, 0);
    path.add(10, 10);
    path.add(0, 10);
    path.closePath();

    var point = path.getNearestPoint(new Point(1, 5));
    equals(function() {
        return [point.x, point.y];
    }, [0, 5]);

    var point = path.getNearestPoint(new Point(11, 11));
    equals(function() {
        return [point.x, point.y];
    }, [10, 10]);

    var path = new Path();
    path.add(0, 0);
    path.add(100, 0);
    path.add(100, 100);
    path.add(0, 100);
    path.closePath();

    var point = path.getNearestPoint(new Point(1, 5));
    equals(function() {
        return [point.x, point.y];
    }, [0, 5]);

    var point = path.getNearestPoint(new Point(5, 20));
    equals(function() {
        return [point.x, point.y];
    }, [0, 20]);

    var point = path.getNearestPoint(new Point(101, 101));
    equals(function() {
        return [point.x, point.y];
    }, [100, 100]);

    var line = new Path.Line([10, 10], [100, 100])
    var point = line.getNearestPoint(new Point(70, 60));
    equals(function() {
        return [point.x, point.y];
    }, [65, 65]);
});

test('Is the path deselected after setting a new list of segments?', function() {
    var path = new Path([0, 0]);
    path.selected = true;
    equals(function() {
        return path.selected;
    }, true);
    equals(function() {
        return paper.project.selectedItems.length;
    }, 1);

    path.segments = [[0, 10]];
    equals(function() {
        return path.selected;
    }, true);
    equals(function() {
        return paper.project.selectedItems.length;
    }, 1);
});

test('Setting Path#fullySelected=true on an empty path should only set path#selected=true', function() {
    var path = new Path();
    path.fullySelected = true;
    equals(function() {
        return path.fullySelected;
    }, false);
    equals(function() {
        return path.selected;
    }, true);
});

test('After removing all segments of a fully selected path, it should still be selected.', function() {
    var path = new Path([10, 20], [30, 40]);
    path.fullySelected = true;
    equals(function() {
        return path.fullySelected;
    }, true);
    path.removeSegments();
    equals(function() {
        return path.fullySelected;
    }, false);
    equals(function() {
        return path.selected;
    }, true);
});

test('After removing all segments of a selected path, it should still be selected.', function() {
    var path = new Path([10, 20], [30, 40]);
    path.selected = true;
    path.removeSegments();
    equals(function() {
        return path.selected;
    }, true);
});


test('After simplifying a path using #simplify(), the path should stay fullySelected', function() {
    var path = new Path();
    for (var i = 0; i < 30; i++) {
        path.add(i * 10, 10);
    }
    path.fullySelected = true;
    equals(function() {
        return path.selected;
    }, true);

    path.simplify();

    equals(function() {
        return path.selected;
    }, true);

    equals(function() {
        return path.fullySelected;
    }, true);
});

test('After cloning a selected item, it should be added to the Project#selectedItems array', function() {
    var path = new Path.Circle(new Size(80, 50), 35);
    path.selected = true;
    var copy = path.clone();

    equals(function() {
        return paper.project.selectedItems.length;
    }, 2);
});

test('After simplifying a path using #simplify(), the path should stay selected', function() {
    var path = new Path();
    for (var i = 0; i < 30; i++) {
        path.add(i * 10, (i % 2 ? 20 : 40));
    }
    path.selected = true;
    path.simplify();
    equals(function() {
        return path.selected;
    }, true);
});

test('After smoothing a path using #smooth(), the path should stay fullySelected', function() {
    var path = new Path();
    for (var i = 0; i < 30; i++) {
        path.add(i * 10, (i % 2 ? 20 : 40));
    }
    path.fullySelected = true;
    path.smooth();
    equals(function() {
        return path.fullySelected;
    }, true);
});

test('After smoothing a path using #smooth(), the path should stay selected', function() {
    var path = new Path();
    for (var i = 0; i < 30; i++) {
        path.add(i * 10, (i % 2 ? 20 : 40));
    }
    path.selected = true;
    path.smooth();
    equals(function() {
        return path.selected;
    }, true);
});

test('After selecting a segment, Path#selected should return true', function() {
    var path = new Path();
    path.add([10, 10]);
    path.firstSegment.selected = true;
    equals(function() {
        return path.selected;
    }, true);
});

test('Path#reverse', function() {
    var path = new Path.Circle([100, 100], 30);
    path.reverse();
    equals(path.segments.toString(), '{ point: { x: 100, y: 130 }, handleIn: { x: -16.56854, y: 0 }, handleOut: { x: 16.56854, y: 0 } },{ point: { x: 130, y: 100 }, handleIn: { x: 0, y: 16.56854 }, handleOut: { x: 0, y: -16.56854 } },{ point: { x: 100, y: 70 }, handleIn: { x: 16.56854, y: 0 }, handleOut: { x: -16.56854, y: 0 } },{ point: { x: 70, y: 100 }, handleIn: { x: 0, y: -16.56854 }, handleOut: { x: 0, y: 16.56854 } }');
});

test('Path#reverse should adjust segment indices', function() {
    var path = new Path([[0, 0], [10, 10], [20, 20]]);
    path.reverse();
    equals(path.segments[0].index, 0);
    equals(path.segments[1].index, 1);
    equals(path.segments[2].index, 2);
});

test('Path#fullySelected', function() {
    var path = new Path.Circle([100, 100], 10);
    path.fullySelected = true;
    path.segments[1].selected = false;
    equals(function() {
        return path.fullySelected;
    }, false);
});

test('Simplifying a path with three segments of the same position should not throw an error', function() {
    var path = new Path([20, 20], [20, 20], [20, 20]);
    path.simplify();
    equals(function() {
        return path.segments.length;
    }, 1);
});

test('Simplifying a path with three segments of the same position should not throw an error', function() {
    var path = new Path([20, 20], [20, 20], [20, 20]);
    path.simplify();
    equals(function() {
        return path.segments.length;
    }, 1);
});
