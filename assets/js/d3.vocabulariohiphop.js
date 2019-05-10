var margin = { top: 30, right: 20, bottom: 30, left: 40 },
    width = parseInt(d3.select('.grafico').style('width'), 10),
    width = width - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom,
    radio = 7;

var xScaleScaler = d3.scale.linear()
    .range([0, width]);

var yScaleScaler = d3.scale.linear()
    .range([height, 0]);

var xScaleBar = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);


var yScaleBar = d3.scale.linear()
    .range([height, 0]);

///////////////////////////////////////////////  

var xAxisScaler = d3.svg.axis()
    .scale(xScaleScaler)
    .orient("bottom");

var yAxisScaler = d3.svg.axis()
    .scale(yScaleScaler)
    .orient("left");

/* var xAxisBar = d3.svg.axis()
    .scale(xScaleBar)
    .orient("bottom"); */

var yAxisBar = d3.svg.axis()
    .scale(yScaleBar)
    .orient("left")
    .tickFormat(d3.format(".0%"))
    .ticks(10);

///////////////////////////////////////////////

var svgscaler = d3.select("#scalerplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgbar = d3.select("#barplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var patterns = svgscaler.append('svg:defs');



d3.csv("/static/projects/hiphop/data/ArtistasH_all.csv", function(error, data) {
    data.forEach(function(d) {
        d.PUnica = +d.PUnica;
        d.PUnica20 = +d.PUnica20;
        d.PTotal = +d.PTotal;
    });

    function linearRegression(y, x) {
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        for (var i = 0; i < y.length; i++) {
            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i] * y[i]);
            sum_xx += (x[i] * x[i]);
            sum_yy += (y[i] * y[i]);
        }

        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
        lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

        return lr;
    }

    function mediaRegression(y, x) {
        var media = {};
        var sum_x = 0;
        var sum_y = 0;
        var n = y.length;

        for (var i = 0; i < y.length; i++) {
            sum_x += x[i];
            sum_y += y[i];
        }

        media['x'] = sum_x / n;
        media['y'] = sum_y / n;
        return media;
    }

    var known_y = data.map(function(d) {
        return parseFloat(d.PUnica);
    });
    var known_x = data.map(function(d) {
        return parseFloat(d.PTotal);
    });
    var known_y20 = data.map(function(d) {
        return parseFloat(d.PUnica / d.PTotal);
    });
    var lr = linearRegression(known_y, known_x);
    var max = d3.max(data, function(d) {
        return d.PTotal;
    });
    var media = mediaRegression(known_y, known_x)
    var media20 = mediaRegression(known_y20, known_x)

    xScaleScaler.domain([0, d3.max(data, function(d) {
        return d.PTotal;
    })]);
    yScaleScaler.domain([0, d3.max(data, function(d) {
        return d.PUnica;
    })]);
    //xScaleBar.domain(data.map(function(d) { return d.ID; }));
    yScaleBar.domain([0, d3.max(data, function(d) {
        return d.PUnica / d.PTotal;
    })]);

    var x0 = xScaleBar.domain(data.sort(function(a, b) {
                return (b.PUnica / b.PTotal) - (a.PUnica / a.PTotal);
            })
            .map(function(d) {
                return d.PUnica / d.PTotal;
            }))
        .copy();

    svgscaler.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisScaler)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .text("Palabras totales");

    svgscaler.append("g")
        .attr("class", "y axis")
        .call(yAxisScaler)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Palabras Ãºnicas")


    // BAR RECTANGULOS
    svgbar.append("g").selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr('class', function(d) {
            return 'bar' + d.Region + ' barrect';
        })
        .attr("height", function(d) {
            return height - yScaleBar(d.PUnica / d.PTotal);
        })
        .attr("width", xScaleBar.rangeBand())
        .attr("y", function(d) {
            return yScaleBar(d.PUnica / d.PTotal);
        })
        .attr("x", function(d) {
            return x0(d.PUnica / d.PTotal);
        });

    // BAR NOMBRE GRUPOS
    svgbar.selectAll(".text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bartext")
        .attr("transform", function(d, i) {
            return "translate(" + (((xScaleBar.rangeBand() / 2) + 3) + x0(d.PUnica / d.PTotal)) + ", " + (height - 4) + ")" + "rotate(-90)";
        })
        .text(function(d) {
            return d.Cantante;
        })

    // BAR LINEA MEDIA
    svgbar.append('line')
        .attr("x1", 0)
        .attr("y1", yScaleBar(media20['y']))
        .attr("x2", width)
        .attr("y2", yScaleBar(media20['y']))
        .attr("class", "regressionline");

    // BAR LINEA MEDIA TEXTO
    var mediatextbar = svgbar.append("text")
        .attr("class", "textaxis")
        .attr("y", yScaleBar(media20['y']) - 12)
        .attr("x", width)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    mediatextbar.append('tspan').text('MEDIA:');
    mediatextbar.append('tspan').attr('dx', 10).attr("class", "quijoaxis").text(d3.round(media20['y'] * 100, 2));
    mediatextbar.append('tspan').attr("class", "quijoaxis").text('%');
    mediatextbar.append('tspan').text(' PALABRAS ÃšNICAS');

    // BAR Y AXIS  
    svgbar.append("g")
        .attr("class", "y axis")
        .call(yAxisBar)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("% Ãºnicas/totales");


    patterns.append('defs').selectAll("pattern")
        .data(data)
        .enter()
        .append("pattern")
        .attr("id", function(d) {
            return d.ID + "pqn";
        })
        .attr("width", radio * 2)
        .attr("height", radio * 2)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", function(d) {
            return '/static/projects/hiphop/img/' + d.ID + '.jpg';
        })
        .attr("width", radio * 2).attr("height", radio * 2).attr("x", 0).attr("y", 0);


    svgscaler.append("g").append("line")
        .attr("x1", xScaleScaler(0))
        .attr("y1", yScaleScaler(lr.intercept))
        .attr("x2", xScaleScaler(max))
        .attr("y2", yScaleScaler((max * lr.slope) + lr.intercept))
        .attr("class", "regressionline");

    var mediatext = svgscaler.append("g").append("text")
        .attr("class", "textaxis")
        .attr("y", height - 28)
        .attr("x", width)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    mediatext.append('tspan').text('MEDIA:');
    mediatext.append('tspan').attr('dx', 10).attr("class", "quijoaxis").text(d3.round(media['x']));
    mediatext.append('tspan').text(' P. TOTALES');
    mediatext.append('tspan').attr('dx', 10).attr("class", "quijoaxis").text(d3.round(media['y']));
    mediatext.append('tspan').text(' P. ÃšNICAS');
    mediatext.append('tspan').attr('dx', 10).attr("class", "quijoaxis").text(d3.round(media['y'] / media['x'], 3));
    mediatext.append('tspan').text(' P. ÃšNICAS/TOTALES');

    svgscaler.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", function(d) {
            return d.Region + ' rapper-circle';
        })
        .attr("r", radio)
        .attr("cx", function(d) {
            return xScaleScaler(d.PTotal);
        })
        .attr("cy", function(d) {
            return yScaleScaler(d.PUnica);
        })
        .style("fill", function(d) {
            return "url(#" + d.ID + "pqn)";
        })
        .on("mouseover", function(d) {
            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];
            d3.select(".tooltipscaler")
                .style("left", x + "px")
                .style("top", y + "px")
                .style("margin-top", "160px")
                .select("#value")
                .text(d.PUnica);
            d3.select(".tooltipscaler")
                .select("#rapper")
                .text(d.Cantante);
            d3.select(".tooltipscaler")
                .select("#value2")
                .text(d.PTotal);
            d3.select(".tooltipscaler").classed("hidden", false);
        })

    .on("mouseout", function() {
        d3.select(".tooltipscaler").classed("hidden", true);
    })


    var legend = svgscaler.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
            return d;
        });

});


d3.csv("/static/projects/hiphop/data/ArtistasH_all.csv", function(error, datac) {
    var svg = d3.select("#rapper-circles svg");
    var margin = 50;
    var radius = 15;
    var padding = 3;
    var biggestFirst = true;
    var escala = 10000;

    var baselineHeight = height / 2;

    datac.forEach(function(d) {
        d.x = +d.PUnicaLim / escala;
    });

    var xScale = d3.scale.linear()
        .range([0, width])
        .domain([d3.min(datac, function(d) {
            return d.x - 0.02;
        }), d3.max(datac, function(d) {
            return d.x + 0.01;
        })]);

    var threads = svg.append("g")
        .attr("class", "threads");

    var bubbleLine = svg.append("g")
        .attr("class", "bubbles")
        .attr("transform",
            "translate(0," + baselineHeight + ")");

    bubbleLine.append("line")
        .attr("x1", xScale.range()[0])
        .attr("x2", xScale.range()[1])
        .attr("class", "midaxis");

    bubbleLine.append("line").attr("x1", xScale(0.14)).attr("x2", xScale(0.14)).attr("y1", -baselineHeight + 30).attr("y2", baselineHeight).attr("class", "countaxis");
    bubbleLine.append("line").attr("x1", xScale(0.17)).attr("x2", xScale(0.17)).attr("y1", -baselineHeight + 30).attr("y2", baselineHeight).attr("class", "countaxis");
    bubbleLine.append("line").attr("x1", xScale(0.20)).attr("x2", xScale(0.20)).attr("y1", -baselineHeight + 30).attr("y2", baselineHeight).attr("class", "countaxis");
    bubbleLine.append("line").attr("x1", xScale(0.23)).attr("x2", xScale(0.23)).attr("y1", -baselineHeight + 30).attr("y2", baselineHeight).attr("class", "countaxis");

    bubbleLine.append("text").attr("class", "textaxis").attr("y", -baselineHeight + 10).attr("x", xScale(0.14)).attr("dy", ".71em").style("text-anchor", "middle").text("1.400 PALABRAS");
    bubbleLine.append("text").attr("class", "textaxis").attr("y", -baselineHeight + 10).attr("x", xScale(0.17)).attr("dy", ".71em").style("text-anchor", "middle").text("1.700");
    bubbleLine.append("text").attr("class", "textaxis").attr("y", -baselineHeight + 10).attr("x", xScale(0.20)).attr("dy", ".71em").style("text-anchor", "middle").text("2.000");
    bubbleLine.append("text").attr("class", "textaxis").attr("y", -baselineHeight + 10).attr("x", xScale(0.23)).attr("dy", ".71em").style("text-anchor", "middle").text("2.300");

    bubbleLine.append("line").attr("x1", xScale(0.1488)).attr("x2", xScale(0.1488)).attr("y1", -baselineHeight + 60).attr("y2", baselineHeight - 60).attr("class", "countaxis countquijo");
    bubbleLine.append("text").attr("class", "textaxis quijoaxis").attr("y", -baselineHeight + 44).attr("x", xScale(0.1488)).attr("dy", ".71em").style("text-anchor", "middle").text("EL QUIJOTE");

    bubbleLine.append("line").attr("x1", xScale(0.1653)).attr("x2", xScale(0.1653)).attr("y1", -baselineHeight + 60).attr("y2", baselineHeight - 60).attr("class", "countaxis countquijo");
    bubbleLine.append("text").attr("class", "textaxis quijoaxis").attr("y", -baselineHeight + 32).attr("x", xScale(0.1653)).attr("dy", ".71em").style("text-anchor", "middle").text("ZALACAÃN");
    bubbleLine.append("text").attr("class", "textaxis quijoaxis").attr("y", -baselineHeight + 44).attr("x", xScale(0.1653)).attr("dy", ".71em").style("text-anchor", "middle").text("EL AVENTURERO");

    var quadtree = d3.geom.quadtree()
        .x(function(d) {
            return xScale(d.x);
        })
        .y(0)
        .extent([
            [xScale(-1), 0],
            [xScale(2), 0]
        ]);

    var quadroot = quadtree([]);

    function findNeighbours(root, scaledX, scaledR, maxR) {
        var neighbours = [];
        root.visit(function(node, x1, y1, x2, y2) {
            var p = node.point;
            if (p) {
                var overlap, x2 = xScale(p.x),
                    r2 = radius;
                if (x2 < scaledX) {
                    overlap = (x2 + r2 + padding >= scaledX - scaledR);
                } else {
                    overlap = (scaledX + scaledR + padding >= x2 - r2);
                }
                if (overlap) neighbours.push(p);
            }
            return (x1 - maxR > scaledX + scaledR + padding) && (x2 + maxR < scaledX - scaledR - padding);
        });
        return neighbours;
    }

    function calculateOffset(maxR) {
        return function(d) {
            neighbours = findNeighbours(quadroot, xScale(d.x), radius, maxR);
            var n = neighbours.length;
            var upperEnd = 0,
                lowerEnd = 0;
            if (n) {
                var j = n,
                    occupied = new Array(n);
                while (j--) {
                    var p = neighbours[j];
                    var hypoteneuse = 2 * radius + padding;
                    var base = xScale(d.x) - xScale(p.x);
                    var vertical = Math.sqrt(Math.pow(hypoteneuse, 2) - Math.pow(base, 2));
                    occupied[j] = [p.offset + vertical, p.offset - vertical];
                }
                occupied = occupied.sort(function(a, b) {
                    return a[0] - b[0];
                });
                lowerEnd = upperEnd = 1 / 0;
                j = n;
                while (j--) {
                    if (lowerEnd > occupied[j][0]) {
                        upperEnd = Math.min(lowerEnd, occupied[j][0]);
                        lowerEnd = occupied[j][1];
                    } else {
                        lowerEnd = Math.min(lowerEnd, occupied[j][1]);
                    }
                }
            }
            return d.offset = (Math.abs(upperEnd) < Math.abs(lowerEnd)) ? upperEnd : lowerEnd;
        };
    }

    bubbleLine.selectAll("circle")
        .data(datac.sort(biggestFirst ? function(a, b) {
            return b.r - a.r;
        } : function(a, b) {
            return a.r - b.r;
        }))
        .enter()
        .append("circle")
        .attr("r", radius)
        .each(function(d, i) {
            d3.select(this)
                .attr("cx", xScale(d.x))
                .attr("cy", -baselineHeight)
                .attr("cy", calculateOffset(0))
                .attr("class", function(d) {
                    return d.Region + ' rapper-circle';
                })
                .style("fill", function() {
                    return "url(#" + d.ID + ")";
                });
            quadroot.add(d);
        })
        .on("mouseover", function(d) {
            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];
            d3.select(".tooltipcircle")
                .style("left", x + "px")
                .style("top", y + "px")
                .style("margin-top", "150px")
                .select("#value")
                .text(function() {
                    return d3.round(d.x * escala);
                });
            d3.select(".tooltipcircle")
                .select("#rapper")
                .text(d.Cantante);
            d3.select(".tooltipcircle").classed("hidden", false);
        })
        .on("mouseout", function() {
            d3.select(".tooltipcircle").classed("hidden", true);
        });

    var backgrounds = bubbleLine.append('svg:defs');

    backgrounds.selectAll("pattern")
        .data(datac)
        .enter()
        .append("pattern")
        .attr("id", function(d) {
            return d.ID;
        })
        .attr("width", radius * 2)
        .attr("height", radius * 2)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", function(d) {
            return '/static/projects/hiphop/img/' + d.ID + '.jpg';
        })
        .attr("width", radius * 2).attr("height", radius * 2).attr("x", 0).attr("y", 0);

});

d3.selectAll(".regionselect")
    .on("click", function(d) {
        d3.selectAll(".andalucia").classed("andaluz", true).classed("rapper-circle", false);
        d3.selectAll(".aragon").classed("aragones", true).classed("rapper-circle", false);
        d3.selectAll(".catalunya").classed("catalan", true).classed("rapper-circle", false);
        d3.selectAll(".madrid").classed("madrileno", true).classed("rapper-circle", false);
        d3.selectAll(".valencia").classed("valenciano", true).classed("rapper-circle", false);
        d3.selectAll(".leyenda").style("display", "initial");
    });
d3.selectAll(".allselect")
    .on("click", function(d) {
        d3.selectAll(".andalucia").classed("andaluz", false).classed("rapper-circle", true);
        d3.selectAll(".aragon").classed("aragones", false).classed("rapper-circle", true);
        d3.selectAll(".catalunya").classed("catalan", false).classed("rapper-circle", true);
        d3.selectAll(".madrid").classed("madrileno", false).classed("rapper-circle", true);
        d3.selectAll(".valencia").classed("valenciano", false).classed("rapper-circle", true);
        d3.selectAll(".leyenda").style("display", "none");
    });
