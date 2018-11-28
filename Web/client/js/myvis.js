// ------------------- 数据处理模块 Start ------------------- 
{
    // Map each data dimension into different types
    // Different data types need to be treated differently when processing
    // Types include: num, enum, vec, graph
    var dim_type = {
        "Rank": "num", 
        "ChineseName": "enum",
        "EnglishName": "enum",
        "Location": "vec",
        "Area": "num",
        "Population": "num",
        "GDP": "num",
        "GDP_PerCapita": "num",
        "Income": "num",
        "LifeExpectancy": "num",
        "Salt": "num",
        "Hypertension": "num",
        "Zongzi": "enum",
        "Doufunao": "enum",
        "HSR": "graph",
    };

    var data, dimensions;

    var extents = new Object();
    var enums = new Object();
    var neighbors = new Object();

    // Convert all num data to float
    function stringToFloat(d) { 
        for(var i = 0; i < d.length; i++) { 
            for(var v_dim in d[i]) { 
                if (dim_type[v_dim] == "num") {
                    var t_value = parseFloat(d[i][v_dim]);
                    d[i][v_dim] = t_value;
                } 
            }
        }
        return d;
    };

    function getDimensions(d) {
        dimensions = d3.keys(data[0]);
        console.log("Dimensions:", dimensions);
        for(var i = 0; i < dimensions.length; i++) { 
            var t_dim = dimensions[i];
            if (dim_type[t_dim] == "num") {
                extents[t_dim] = d3.extent(d, function(v_d){ 
                    return v_d[t_dim]; 
                });
            } else if (dim_type[t_dim] == "enum") {
                // TODO
            } else if (dim_type[t_dim] == "graph") {
                // TODO
            }
        }
        console.log("Extents:", extents);
    };

    // readData：读取数据，参数为“定时器”
    function readData(v_df) {                                        
        d3.csv("data/City.csv", function(d) {
            console.log("Original data:", d); 
            data = stringToFloat(d);
            console.log("Processed data: ", data);
            getDimensions(data);
            v_df.resolve(); // 将参数“定时器”释放掉
        });                                                                      
    };
}
// ------------------- 数据处理模块 End ------------------- 


// ------------------- 维度选择模块 Start ------------------- 
{
    var value_to_dims = [];
    var scatterplot_axes = {"x": null, "y": null};

    function initAxes(d) {
        if (value_to_dims.length > 0) {
            return; // already initialized
        }

        // extract numerical data dimensions
        // and generate selectors
        var i = 0;
        for (var v_dim in d[0]) {
            //console.log(v_dim);
            if (dim_type[v_dim] == "num") {
                value_to_dims[i] = v_dim;
                var option_string = "<option value=" + i.toString() + ">" + v_dim + "</option>\n";
                if (i == 1) {
                    option_string = "<option value=" + i.toString() 
                        + " selected=\"selected\""+ ">" + v_dim + "</option>\n"
                }
                $(".axis_selector #x_axis")
                    .append(option_string);
                $(".axis_selector #y_axis")
                    .append(option_string);
                i++;
            }
        }

        console.log("Value To Dims: " + value_to_dims);
    }

    function getAxes() { 
        var x_value = $("#x_axis").val(), y_value = $("#y_axis").val();
        scatterplot_axes.x = value_to_dims[x_value];
        scatterplot_axes.y = value_to_dims[y_value];
    };

    window.onload = function() {
        $(".axis_selector select") 
        .on("change", function() { 
            if(data != undefined) {
                initAxes(data);
                getAxes();
                drawScatterPlot(data);
            }
        });
    };
}
// ------------------- 维度选择模块 End ------------------- 


// ------------------- 数据渲染模块 Start ------------------- 
{
    var svg_length = 600, 
    sc_margin = svg_length * 0.1,
          sc_length = svg_length * 0.8,                          // svg 以及 scatterplot 的大小、边距
          point_r = 8;
    var state = "new";                                                  // state：标记当前状态为“创建”或“更新”

    function bindData(d){                                           // bindData：给图元绑定数据
        var t_points = d3.select("#dataPoints")
        .selectAll(".dataPoint")
                                .data(d);                                      // 更新数据
        t_points.exit().remove();                                     // 去除多余元素
        t_points.enter()                                                   // 添加缺少的元素
        .append("g")                                                       // g 是 svg 中的分组容器，类似于 html 中的 div
        .attr("class", "dataPoint");
        t_points = d3.selectAll(".dataPoint");
        return t_points;
    };

    function drawAxes(){                                                              // drawAxes：更新数轴
        var x_dim = scatterplot_axes.x, y_dim = scatterplot_axes.y;
        console.log("X Axis: " + x_dim, " Y Axis: " + y_dim);
        var x_scale = d3.scale.linear()                                             // 创建线性比例尺（即线性映射关系）
                            .domain(extents[x_dim])                                 // domain：原数据的值域
                            .range([sc_margin, sc_margin + sc_length]);   // range：映射后数据的值域
                            var y_scale = d3.scale.linear()
                            .domain(extents[y_dim])
                            .range([sc_margin + sc_length, sc_margin]);    // 注意：svg 中，y轴坐标由上至下递增
                            var x_axis = d3.svg.axis().scale(x_scale).orient("bottom"),
              y_axis = d3.svg.axis().scale(y_scale).orient("left");           // 生成数轴
        if(state == "new"){                                                                 // 如果“new”，则创建数轴的图元容器
            d3.select("#ScatterplotSVG").append("g")
            .attr("class", "dataAxis")
            .attr("id", "x_axis_g")
                .attr("transform", "translate(" + [0, sc_margin + sc_length] + ")")             // 数轴平移
                .append("g").attr("class", "axisLegend")
                .attr("transform", "translate(" + [sc_margin + sc_length - 50, 40] + ")")     // 平移数轴名称
                .append("text");
                d3.select("#ScatterplotSVG").append("g")
                .attr("class", "dataAxis")
                .attr("id", "y_axis_g")
                .attr("transform", "translate(" + [sc_margin, 0] + ")")
                .append("g").attr("class", "axisLegend")
                .attr("transform", "translate(" + [- 50, sc_margin - 20] + ")")
                .append("text");
            }
        d3.select("#x_axis_g").call(x_axis);                                          // 画出数轴图元
        d3.select("#x_axis_g text").text(x_dim);                                  // 写上数轴名称
        d3.select("#y_axis_g").call(y_axis);
        d3.select("#y_axis_g text").text(y_dim);
        return {x: x_scale, y: y_scale};                                                  // 返回比例尺
    };

    function movePoints(v_points, v_scales){                                          // movePoints：移动数据点
        var x_dim = scatterplot_axes.x, y_dim = scatterplot_axes.y;
        var x_scale = v_scales.x, y_scale = v_scales.y;
        var t_get_position = function(d){                                   
            var x_value = d[x_dim], y_value = d[y_dim];
            return "translate(" + [x_scale(x_value), y_scale(y_value)] + ")";   // translate 为平移
            // scale(value) 负责数据映射工作
        }
        if(state == "new"){
            v_points.attr("transform", t_get_position);                                   // transform 为几何变换
        }else{
            v_points.transition()                                                                      // 使用 transition 动画更新数据
            .duration(1000)                                                                             // 动画时长：1000毫秒
            .attr("transform", t_get_position);
        }
    };

    function drawEachPoint(d) {
        // this在这里指向“调用drawEachPoint函数的对象”，即 g 容器
        var t_children = d3.select(this).select("*");
        // select("*") 即选择所有子元素，非空则说明已经渲染
        if(!t_children.empty()) { 
            return;
        }
        d3.select(this)
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", point_r)
            .attr("class", "PlotCircle");
        d3.select(this).append("rect")
            .attr("x", - point_r)
            .attr("y", - point_r)
            .attr("width", point_r * 2)
            .attr("height", point_r * 2)
            .attr("class", "foreground")
            .attr("fill-opacity", 0); // 不透明度为0的隐藏图层，用于交互
    };

    function bindTooltip(v_points){                           // bindTooltip：绑定 tooltip
        var x_dim = scatterplot_axes.x, y_dim = scatterplot_axes.y;
        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<p> Name: "+ d["ChineseName"] + "(" + d["EnglishName"] +")</p>"
                + "<p>" + x_dim + ": " + d[x_dim] + "</p>"
                + "<p>" + y_dim + ": " + d[y_dim] + "</p>" ;
                       });                                                        // 设置 tooltip 的内容
        v_points.call(tip);
        v_points.select(".foreground")
        .on("mouseover", tip.show)                              // mouseover：鼠标悬浮在元素上时触发函数 tip.show
        .on("mouseout", tip.hide);                                 // mouseout：鼠标离开元素时触发函数 tip.hide
    };

    function drawScatterPlot(d){                                // drawScatterPlot：渲染模块的主函数
        if(state == "new"){
            d3.select("#ScatterplotSVG")
            .attr("width", svg_length)
            .attr("height", svg_length)                                // 设置 svg 的长宽
            .append("g")
            .attr("id", "dataPoints");
        }
        var t_scales = drawAxes();                                 // 更新并渲染数轴
        var t_points = bindData(d);                               // 绑定数据。数组用以接收多个函数返回值
        movePoints(t_points, t_scales);                         // 依照数据移动图元的 g 容器
        t_points.each(drawEachPoint);                          // 渲染每个图元
        bindTooltip(t_points);                                        // 绑定 tooltip
        state = "update";                                               // 变为“更新”状态
    };
}
// ------------------- 数据渲染模块 End ------------------- 


//  ------------------- 主程序 Start ------------------- 
{
    var t_df = $.Deferred(); // jquery提供的“定时器”，用于同步操作
    readData(t_df);
    t_df.done(function(){ // 定时器.done：定义“定时器释放”后的后续操作
        initAxes(data);
        getAxes();
        drawScatterPlot(data);
    });
}
//  ------------------- 主程序 End ------------------- 