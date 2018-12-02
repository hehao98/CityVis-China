
// ------------------- 维度选择模块 Start ------------------- 
{
    function DimensionSelector(x_axis, y_axis, data) {
        this.value_to_dims = [];
        this.data_dim = {"x": null, "y": null}
        this.x_axis = x_axis;
        this.y_axis = y_axis;
        this.initAxes(data);
        this.getAxes();
    }

    DimensionSelector.prototype.getAxes = function() { 
        var x_value = $(this.x_axis).val(), y_value = $(this.y_axis).val();
        this.data_dim.x = this.value_to_dims[x_value];
        this.data_dim.y = this.value_to_dims[y_value];
    };


    DimensionSelector.prototype.initAxes = function(d) {
        if (this.value_to_dims.length > 0) {
            return; // already initialized
        }

        // extract numerical data dimensions
        // and generate selectors
        var i = 0;
        for (var v_dim in d[0]) {
            //console.log(v_dim);
            if (dim_type[v_dim] == "num") {
                this.value_to_dims[i] = v_dim;
                var option_string = "<option value=" + i.toString() + ">" + v_dim + "</option>\n";
                if (i == 1) {
                    option_string = "<option value=" + i.toString() 
                        + " selected=\"selected\""+ ">" + v_dim + "</option>\n"
                }
                $(this.x_axis).append(option_string);
                $(this.y_axis).append(option_string);
                i++;
            }
        }

        //console.log("Value To Dims: " + this.value_to_dims);
    }
}
// ------------------- 维度选择模块 End ------------------- 


// ------------------- 数据渲染模块 Start ------------------- 
{
    var svg_length = 400, 
        sc_margin = svg_length * 0.1,
        sc_length = svg_length * 0.8, // svg 以及 scatterplot 的大小、边距
        point_r = 8;

    function ScatterplotRenderer(svg, axes) {
        this.svg = svg;
        this.axes = axes;
        this.state = "new"
        }

        ScatterplotRenderer.prototype.bindData = function(d) {
            var t_points = d3.select(this.svg + " " + "#dataPoints")
                .selectAll(".dataPoint")
                .data(d);
            t_points.exit().remove();
            t_points.enter()
                .append("g")
                .attr("class", "dataPoint");
            t_points = d3.selectAll(this.svg + " " + ".dataPoint");
            return t_points;
        }

        ScatterplotRenderer.prototype.drawAxes = function() {
            var x_dim = this.axes.x, y_dim = this.axes.y;
            //console.log("X Axis: " + x_dim, " Y Axis: " + y_dim);
            var x_scale = d3.scale.linear()                                             // 创建线性比例尺（即线性映射关系）
                            .domain(extents[x_dim])                                 // domain：原数据的值域
                            .range([sc_margin, sc_margin + sc_length]);   // range：映射后数据的值域
            var y_scale = d3.scale.linear()
                            .domain(extents[y_dim])
                            .range([sc_margin + sc_length, sc_margin]);    // 注意：svg 中，y轴坐标由上至下递增
            var x_axis = d3.svg.axis().scale(x_scale).orient("bottom"),
                y_axis = d3.svg.axis().scale(y_scale).orient("left");           // 生成数轴
            if(this.state == "new") {                                                                 // 如果“new”，则创建数轴的图元容器
                d3.select(this.svg).append("g")
                .attr("class", "dataAxis")
                .attr("id", "x_axis_g")
                .attr("transform", "translate(" + [0, sc_margin + sc_length] + ")")             // 数轴平移
                .append("g").attr("class", "axisLegend")
                .attr("transform", "translate(" + [sc_margin + sc_length - 50, 40] + ")")     // 平移数轴名称
                .append("text");
                d3.select(this.svg).append("g")
                .attr("class", "dataAxis")
                .attr("id", "y_axis_g")
                .attr("transform", "translate(" + [sc_margin, 0] + ")")
                .append("g").attr("class", "axisLegend")
                .attr("transform", "translate(" + [- 50, sc_margin - 20] + ")")
                .append("text");
            }
            d3.select(this.svg + " " + "#x_axis_g").call(x_axis);                                          // 画出数轴图元
            d3.select(this.svg + " " + "#x_axis_g text").text(x_dim);                                  // 写上数轴名称
            d3.select(this.svg + " " + "#y_axis_g").call(y_axis);
            d3.select(this.svg + " " + "#y_axis_g text").text(y_dim);
            return {x: x_scale, y: y_scale};                                                  // 返回比例尺
        }

        ScatterplotRenderer.prototype.movePoints = function(v_points, v_scales) {                                          // movePoints：移动数据点
            var x_dim = this.axes.x, y_dim = this.axes.y;
            var x_scale = v_scales.x, y_scale = v_scales.y;
            var t_get_position = function(d){                                   
                var x_value = d[x_dim], y_value = d[y_dim];
                return "translate(" + [x_scale(x_value), y_scale(y_value)] + ")";   // translate 为平移
                // scale(value) 负责数据映射工作
            }
            if(this.state == "new"){
                v_points.attr("transform", t_get_position);                                   // transform 为几何变换
            }else{
                v_points.transition()                                                                      // 使用 transition 动画更新数据
                .duration(1000)                                                                             // 动画时长：1000毫秒
                .attr("transform", t_get_position);
            }
        }

        ScatterplotRenderer.prototype.drawEachPoint = function(d) {
            // this在这里指向“调用drawEachPoint函数的对象”，即 g 容器
            var t_children = d3.select(this).select("*");
            // select("*") 即选择所有子元素，非空则说明已经渲染
            if(!t_children.empty()) { 
                return;
            }
            if (selected_data[d["EnglishName"]] == 1) {
                d3.select(this)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", point_r)
                .attr("class", "common brushed")
                .attr("id", d["EnglishName"]);
            } else {
                d3.select(this)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", point_r)
                .attr("class", "common")
                .attr("id", d["EnglishName"]);
            }
            d3.select(this).append("rect")
            .attr("x", - point_r)
            .attr("y", - point_r)
            .attr("width", point_r * 2)
            .attr("height", point_r * 2)
            .attr("class", "foreground")
            .attr("fill-opacity", 0)
            .attr("id", d["EnglishName"]);; // 不透明度为0的隐藏图层，用于交互
        };

        ScatterplotRenderer.prototype.bindTooltip = function(v_points) {
            var x_dim = this.axes.x, y_dim = this.axes.y;
            var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<p> Name: "+ d["ChineseName"] + "(" + d["EnglishName"] +")</p>"
                + "<p>" + x_dim + ": " + d[x_dim] + "</p>"
                + "<p>" + y_dim + ": " + d[y_dim] + "</p>" ;
                       }); 
            v_points.call(tip);
            v_points.select(".foreground")
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);  
        };

        ScatterplotRenderer.prototype.drawScatterPlot = function(d) {                                // drawScatterPlot：渲染模块的主函数
            if(this.state == "new"){
                d3.select(this.svg)
                .attr("width", svg_length)
                .attr("height", svg_length) 
                .append("g")
                .attr("id", "dataPoints");
            }
            var t_scales = this.drawAxes(); 
            var t_points = this.bindData(d); 
            //console.log("t_points: " + t_points);
            this.movePoints(t_points, t_scales); 
            t_points.each(this.drawEachPoint);
            this.bindTooltip(t_points);

            current_svg = d3.select(this.svg);
            var brush = d3.svg.brush()
                .x(t_scales.x)
                .y(t_scales.y)
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend);
            //current_svg.call(brush);
            x_axis = this.axes["x"];
            y_axis = this.axes["y"];

            // Clear the previously-active brush, if any.
            function brushstart() {
                d3.selectAll(".extent").remove();
                current_svg.selectAll(".brushed").classed("brushed", false);
            }
            // Highlight the selected circles.
            function brushmove() {
                var e = brush.extent();
                current_svg.selectAll("circle").classed("brushed", function(d) {
                  return !(e[0][0] > d[x_axis] || d[x_axis] > e[1][0]
                      || e[0][1] > d[y_axis] || d[y_axis] > e[1][1]);
                });
            }
            // If the brush is empty, select all circles.
            function brushend() {
                if (brush.empty()) {
                    current_svg.selectAll(".brushed").classed("brushed", false);
                }
                current_svg.selectAll(".common").each(d => {
                    selected_data[d["EnglishName"]] = 0;
                });
                current_svg.selectAll(".brushed").each(d => {
                    selected_data[d["EnglishName"]] = 1;
                });
                updateCheckerboxes();
                updateParallelCoordinates();
                updateScatterplots();
            }

            this.state = "update";
        };
    // End Scatterplot Renderer
}
// ------------------- 数据渲染模块 End ------------------- 

// ------------------ 平行坐标模块 Start ------------------ 
{
    function drawParallelCoordinates() {
        var traits = ["Rank", "GDP_PerCapita", "Income", "LifeExpectancy", "Salt","Hypertension"];

        // Margin, width and height
        var m = [80, 80, 80, 80],
        w = 800 - m[1] - m[3],
        h = 600 - m[0] - m[2];

        var x = d3.scale.ordinal().domain(traits).rangePoints([0, w]),
        y = {};

        var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"), foreground;

        var svg = d3.select("#ParallelCoordinateContainer").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        // Create a scale and brush for each trait.
        traits.forEach(function(d) {
            y[d] = d3.scale.linear()
            .domain(d3.extent(data, function(p) { return p[d]; }))
            .range([h, 0]);
            if (d == "Rank" || d == "Salt") {
                y[d].range([0,h]);
            }

            y[d].brush = d3.svg.brush()
            .y(y[d])
            .on("brush", brush);
        });

        // Add foreground lines.
        foreground = svg.append("svg:g")
          .attr("class", "foreground")
          .selectAll("path")
          .data(data)
          .enter().append("svg:path")
          .attr("d", path)
          .attr("class", "common")
          .attr("id", function(d) { return d.EnglishName; });
        /*
        // Add Hidden lines for interaction
        hiddenLines = svg.select("g.foreground").selectAll("path.foreground")
            .data(data).enter().append("svg:path")
            .attr("d", path)
            .attr("class", "foreground")
            .attr("fill-opacity", 0);
            */

        // Add a group element for each trait.
        var g = svg.selectAll(".trait")
          .data(traits)
          .enter().append("svg:g")
          .attr("class", "trait")
          .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
          .call(d3.behavior.drag()
              .origin(function(d) { return {x: x(d)}; })
              .on("dragstart", dragstart)
              .on("drag", drag)
              .on("dragend", dragend));

        // Add an axis and title.
        g.append("svg:g")
          .attr("class", "axis")
          .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
          .append("svg:text")
          .attr("text-anchor", "middle")
          .attr("y", -9)
          .text(String);

        /*
        // Add tooltip for each line
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .direction('w')
          .offset([0, 0])
          .html((d) => {
            return "<p> Name: "+ d["ChineseName"] + "(" + d["EnglishName"] +")</p>";
        });
        hiddenLines.call(tip);
        hiddenLines.on("mouseover", tip.show).on("mouseout", tip.hide); 
        */

        // Add a brush for each axis.
        g.append("svg:g")
          .attr("class", "brush")
          .each(function(d) { d3.select(this).call(y[d].brush); })
          .selectAll("rect")
          .attr("x", -8)
          .attr("width", 16);

        function dragstart(d) {
            i = traits.indexOf(d);
        }

        function drag(d) {
            x.range()[i] = d3.event.x;
            traits.sort(function(a, b) { return x(a) - x(b); });
            g.attr("transform", function(d) { return "translate(" + x(d) + ")"; });
            foreground.attr("d", path);
        }

        function dragend(d) {
            x.domain(traits).rangePoints([0, w]);
            var t = d3.transition().duration(500);
            t.selectAll(".trait").attr("transform", function(d) { return "translate(" + x(d) + ")"; });
            t.selectAll(".foreground path").attr("d", path);
        }
    

        // Returns the path for a given data point.
        function path(d) {
            return line(traits.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            // Update in graph view
            var actives = traits.filter(function(p) { return !y[p].brush.empty(); }),
            extents = actives.map(function(p) { return y[p].brush.extent(); });
            foreground.classed("brushed", function(d) {
                return actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                });
            });

            // Update other elements
            d3.selectAll("#ParallelCoordinateContainer path.common")
            .each(function(d) {
                selected_data[d["EnglishName"]] = 0;
            });
            // This must be placed after the common tag
            d3.selectAll("#ParallelCoordinateContainer path.brushed")
            .each(function(d) {
                selected_data[d["EnglishName"]] = 1;
            });
            updateCheckerboxes();
            updateScatterplots();
        }
    }
}
// ------------------- 平行坐标模块 End ------------------- 

// ------------------ 图可视化模块 Start ------------------ 
{
    function drawForceDirectedGraph() {
        var width = 800, height = 600, margin = 50;

        var svg = d3.select("#GraphContainer").append("svg")
            .attr("width", width)
            .attr("height", height);

        var force = d3.layout.force()
            .gravity(0.05)
            .distance(250)
            .charge(-250)
            .size([width, height]);

        force
          .nodes(railway_graph["nodes"])
          .links(railway_graph["links"])
          .start();

        var link = svg.selectAll("#GraphContainer .link")
          .data(railway_graph["links"])
          .enter().append("line")
          .attr("class", "link");

        var node = svg.selectAll("#GraphContainer .node")
          .data(railway_graph["nodes"])
          .enter().append("g")
          .attr("class", "node")
          .call(force.drag);

        node.append("circle")
          .data(data)
          .attr("x", -8)
          .attr("y", -8)
          .attr("r", (d)=>{
            var range = [0, 0];
            range[0] = Math.sqrt(extents["Area"][0]);
            range[1] = Math.sqrt(extents["Area"][1]);
            return (Math.sqrt(d["Area"]) - range[0]) / (range[1] - range[0]) * 20 + 2;
          })
          .style("fill", (d, i)=>{
            var density_extent = d3.extent(data, (v_d)=>{
                return v_d["Population"]/v_d["Area"];
            })
            var color = d3.scale.log()
                .domain(density_extent)
                .range(['black', 'red']);
            //console.log("density",density_extent);
            //console.log("color",color);
            return color(d["Population"]/d["Area"]);
          })

        node.append("text")
          .attr("dx", 12)
          .attr("dy", ".35em")
          .text(function(d) { return d.name })
          .attr("stroke-width", 1)
          .attr("stroke", "#B8860B");

        force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        }); 

        $("#ForceLayoutCheckbox").on("click", ()=>{
            if ($("#ForceLayoutCheckbox").is(":checked")) {
                force.resume();
            } else {
                force.stop();
                // Generate Location for each node
                node.attr("transform", (d)=>{
                    console.log(d);
                    var location = d.location.split('(')[1].split(')')[0].split(',');
                    d.x = (parseFloat(location[0]) - 102) * 36;
                    d.y = 600 - (parseFloat(location[1]) - 21) * 27;
                    return "translate(" + d.x + "," + d.y + ")";
                });
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
            }
        })  

        $("#color-selector").on("change", ()=>{
            var val = $("#color-selector").val();
            if (val == 1) { // Population
                node.select('circle').style("fill", (d, i)=>{
                    var density_extent = d3.extent(data, (v_d)=>{
                        return v_d["Population"]/v_d["Area"];
                    })
                    var color = d3.scale.log()
                        .domain(density_extent)
                        .range(['black', 'red']);
                    console.log("density",density_extent);
                    console.log("color",color);
                    return color(d["Population"]/d["Area"]);
                })
            } else if (val == "2") { // Doufunao
                //console.log(val);
                node.select('circle').style("fill", (d, i)=>{
                    if (d["Doufunao"] == 'Sweet') {
                        return '#00FF00';
                    } else if (d["Doufunao"] == "Spicy") {
                        return '#FF0000';
                    } else {
                        return '#00BFFF';
                    }
                })
            } else if (val == 3) { // Zongzi
                node.select('circle').style("fill", (d, i)=>{
                    if (d["Zongzi"] == 'Sweet') {
                        return '#00FF00';
                    } else if (d["Zongzi"] == "Spicy") {
                        return '#FF0000';
                    } else {
                        return '#00BFFF';
                    }
                })
            }
        })    
    }
}
// ------------------- 图可视化模块 End ------------------- 

//  ------------------- 主程序 Start ------------------- 
{
    function generateSelections(d) {
        for (var i = 0; i < d.length; ++i) {
            var city_name = d[i]["EnglishName"];
            $("#city-selections").append(
                "<input type=\"checkbox\" id=\"" + city_name + "\">" 
                + city_name 
                + "</input><br>");
        }
        $("#city-selections input").on("click", function() {
            if (data != undefined) {
                for (var i = 0; i < d.length; ++i) {
                    var city_name = d[i]["EnglishName"];
                    if ($("#city-selections #" + city_name).is(":checked")) {
                        selected_data[city_name] = 1;
                        $(".dataPoint circle#" + city_name).attr("class", "common brushed");
                        $("#ParallelCoordinateContainer path#" + city_name).attr("class", "common brushed");
                    } else {
                        selected_data[city_name] = 0;
                        $(".dataPoint circle#" + city_name).attr("class", "common");
                        $("#ParallelCoordinateContainer path#" + city_name).attr("class", "common");
                    }
                }
            }
        });
    }

    function updateCheckerboxes() {
        d = data;
        for (var i = 0; i < d.length; ++i) {
            var city_name = d[i]["EnglishName"];
            if (selected_data[city_name] == 1) {
                $("#city-selections #" + city_name).prop("checked", true);
            } else {
                $("#city-selections #" + city_name).prop("checked", false);
            }
        }
    }

    function updateScatterplots() {
        d = data;
        for (var i = 0; i < d.length; ++i) {
            var city_name = d[i]["EnglishName"];
            if (selected_data[city_name] == 1) {
                $(".dataPoint circle#" + city_name).attr("class", "common brushed");
            } else {
                $(".dataPoint circle#" + city_name).attr("class", "common");
            }
        }
    }

    function updateParallelCoordinates() {
        d = data;
        for (var i = 0; i < d.length; ++i) {
            var city_name = d[i]["EnglishName"];
            if (selected_data[city_name] == 1) {
                $("#ParallelCoordinateContainer path#" + city_name).attr("class", "common brushed");
            } else {
                $("#ParallelCoordinateContainer path#" + city_name).attr("class", "common");
            }
        }
    }

    function updateGraphVisualization() {
        d = data;
        for (var i = 0; i < d.length; ++i) {
            var city_name = d[i]["EnglishName"];
            if (selected_data[city_name] == 1) {
                $("#GraphContainer circle#" + city_name).attr("class", "common brushed");
            } else {
                $("#GraphContainer circle#" + city_name).attr("class", "common");
            }
        }
    }

    function drawScatterplots() {
        var selector = new DimensionSelector(
            ".axis_selector #x_axis",
            ".axis_selector #y_axis",
            data
        );
        var renderer = new ScatterplotRenderer(
            "#ScatterplotSVG", 
            selector.data_dim,
        );
        renderer.drawScatterPlot(data);

        $(".axis_selector select") 
        .on("change", function() { 
            if(data != undefined) {
                selector.initAxes(data);
                selector.getAxes();
                renderer.currentSVG = "#ScatterplotSVG";
                renderer.axes["x"] = selector.data_dim.x;
                renderer.axes["y"] = selector.data_dim.y;
                renderer.drawScatterPlot(data);
            }
        });

        var selector2 = new DimensionSelector(
            ".axis_selector2 #x_axis",
            ".axis_selector2 #y_axis",
            data
        );
        var renderer2 = new ScatterplotRenderer(
            "#ScatterplotSVG2", 
            selector2.data_dim,
        );
        renderer2.drawScatterPlot(data);

        $(".axis_selector2 select") 
        .on("change", function() { 
            if(data != undefined) {
                selector2.initAxes(data);
                selector2.getAxes();
                renderer2.currentSVG = "#ScatterplotSVG2";
                renderer2.axes["x"] = selector2.data_dim.x;
                renderer2.axes["y"] = selector2.data_dim.y;
                renderer2.drawScatterPlot(data);
            }
        });

        var selector3 = new DimensionSelector(
            ".axis_selector3 #x_axis",
            ".axis_selector3 #y_axis",
            data
        );
        var renderer3 = new ScatterplotRenderer(
            "#ScatterplotSVG3", 
            selector3.data_dim,
        );
        renderer3.drawScatterPlot(data);

        $(".axis_selector3 select") 
        .on("change", function() { 
            if(data != undefined) {
                selector3.initAxes(data);
                selector3.getAxes();
                renderer3.currentSVG = "#ScatterplotSVG3";
                renderer3.axes["x"] = selector3.data_dim.x;
                renderer3.axes["y"] = selector3.data_dim.y;
                renderer3.drawScatterPlot(data);
            }
        });

        var selector4 = new DimensionSelector(
            ".axis_selector4 #x_axis",
            ".axis_selector4 #y_axis",
            data
        );
        var renderer4 = new ScatterplotRenderer(
            "#ScatterplotSVG4", 
            selector4.data_dim,
        );
        renderer4.drawScatterPlot(data);

        $(".axis_selector4 select") 
        .on("change", function() { 
            if(data != undefined) {
                selector4.initAxes(data);
                selector4.getAxes();
                renderer4.currentSVG = "#ScatterplotSVG4";
                renderer4.axes["x"] = selector4.data_dim.x;
                renderer4.axes["y"] = selector4.data_dim.y;
                renderer4.drawScatterPlot(data);
            }
        });
    }

    var t_df = $.Deferred(); // jquery提供的“定时器”，用于同步操作
    readData(t_df);
    t_df.done(function(){ // 定时器.done：定义“定时器释放”后的后续操作
        generateSelections(data);
        drawScatterplots();
        drawParallelCoordinates();
        drawForceDirectedGraph();
    });
}
//  ------------------- 主程序 End ------------------- 