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
    var selected_data = new Object();

    var extents = new Object();
    var enums = new Object();

    var city_names = [];

    var railway_graph = new Object(); 

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
                enums[t_dim] = [];
                for (var j = 0; j < d.length; ++j) {
                	if (enums[t_dim].includes(d[j][t_dim]) == false) {
                		enums[t_dim].push(d[j][t_dim]);
                	}
                }
            }
        }
        console.log("Extents:", extents);
        console.log("Enums:", enums);      
    };

    function buildGraph(d) {
        function getRankFromName(name) {
            for (var i = 0; i < d.length; ++i) {
                if (d[i]["EnglishName"] == name) {
                    return d[i]["Rank"];
                }
            }
            console.log(name + " not found");
            return null;
        }

        // Build railway graphs
        railway_graph["nodes"] = [];
        railway_graph["links"] = [];
        for (var i = 0; i < city_names.length; ++i) {
            var node = new Object();
            node["name"] = city_names[i];
            node["location"] = d[i]["Location"];
            node["Zongzi"] = d[i]["Zongzi"];
            node["Doufunao"] = d[i]["Doufunao"];
            node["group"] = 1;
            railway_graph["nodes"].push(node);
        }
        for (var i = 0; i < d.length; ++i) {
            var source = d[i]["EnglishName"];
            var targets = d[i]["HSR"].split(',');
            for (var j in targets) {
                var link = new Object();
                link["source"] = d[i]["Rank"] - 1;
                link["target"] = getRankFromName(targets[j]) - 1;
                link["value"] = 1;
                railway_graph["links"].push(link);
            }
        }
        console.log("Graphs:", railway_graph);
    }

    // readData：读取数据，参数为“定时器”
    function readData(v_df) {                                        
        d3.csv("data/City.csv", function(d) {
            console.log("Original data:", d); 
            data = stringToFloat(d);
            console.log("Processed data: ", data);
            for (var i = 0; i < d.length; ++i) {
                selected_data[d[i]["EnglishName"]] = 0;
                city_names.push(d[i]["EnglishName"]);
            }
            console.log("City Names", city_names);
            getDimensions(data);
            buildGraph(data);
            v_df.resolve(); // 将参数“定时器”释放掉
        });                                                                      
    };
}
// ------------------- 数据处理模块 End ------------------- 

