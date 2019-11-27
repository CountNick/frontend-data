//console.log(d3.symbol())

//puts the endpoint in a variable
const url ="https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-36/sparql"

const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?herkomstSuper ?herkomstSuperLabel ?typeLabel (COUNT(?cho) AS ?amount) 
WHERE {
  # geef ruilmiddelen
  <https://hdl.handle.net/20.500.11840/termmaster14607> skos:narrower* ?type .
  ?type skos:prefLabel ?typeLabel .

  # geef de continenten
  <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?herkomstSuper .
  ?herkomstSuper skos:prefLabel ?herkomstSuperLabel .

  # geef per continent de onderliggende geografische termen
  ?herkomstSuper skos:narrower* ?herkomstSub .
  ?herkomstSub skos:prefLabel ?herkomstSubLabel .

  # geef objecten bij de onderliggende geografische termen
  ?cho dct:spatial ?herkomstSub .
  ?cho edm:object ?type . 
  
} #GROUP BY ?herkomstSuper ?herkomstSuperLabel 
`

// fetch data from endpoint
d3.json(url+"?query="+ encodeURIComponent(query) +"&format=json")
    .then(json => {
        // put fetch results in variable
        let data = json.results.bindings
        //transformData(data)
        return data
    })
    .then(data => transformData(data))
    .then(transformData => nestData(transformData))
    .then(nestData => renderGraph(nestData))
    


function transformData(data){
        //map over data objects and make new array filled with modified objects
    const objectsArray = data
        .map(object => {
            
            return{

            origin: object.herkomstSuperLabel.value,
            type: object.typeLabel.value,
            amount: parseInt(object.amount.value)

            }
        })
        //console.log("objectsarray: ", objectsArray)
        return objectsArray
}

function nestData(objectsArray){

    let nestedData = d3.nest()
    .key(continent => { return continent.origin })
    // .rollup(count => { return {"length": count.length, "total_amount": d3.sum(count, d => { return parseFloat(d.amount)})}})
    // .rollup(leaves => {
    //     leaves.forEach(d => {
    //         console.log("amount: ", d.amount)
    //         return d.amount
    //     })
    // })
    // .rollup( d => {
    //     return d
    //         .map(d => {return d.amount})
    // })
    // .rollup(d => {
    //     return {
    //         amount: d.map(d => d.amount),
    //         origin: d.origin
    //     }
    // })
    .entries(objectsArray);

    // for (let continent of nestedData){
    //     continent.types =  continent.values
    //     //console.log("GGGGG", continent.amount)
    //     //console.log(continentObject)
    // }
    //console.log("wemwem", nestedData)

    //console.log(typeof(nestedData))

    
    
    return objectsArray
}



function renderGraph(result){

        //select the svg element in index.html
        const svg = d3.select('svg');
        //sets height and width to height and width of svg element
        const width = +svg.attr('width');
        const height = +svg.attr('height');
        //sets x and y values to the values of amount and origin
        const xValue = d => d.amount;
        const yValue = d => d.origin;
        const margin = { top: 40, right: 30, bottom: 150, left: 120 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;


        const xScale = d3.scaleLinear()
            .domain([0, d3.max(result, xValue)])
            .range([0, innerWidth])
            .nice();

      
        const yScale = d3.scalePoint()
            .domain(result.map(yValue))
            .range([0, innerHeight])
            .padding(0.7);
      
      
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
          

//console.log(circle)
      
        g.append('g')
            .call(d3.axisLeft(yScale)
                .tickSize(-innerWidth))
              .append('text')
              .attr('fill', 'black');
              //.attr('y', innerHeight /2)
              //.text('Continenten');


        d3.selectAll('.tick text')
            .on('click', d => {
                console.log(d)
            });
      
        g.append('g')
            .call(d3.axisBottom(xScale)
                .tickSize(-innerHeight))
              .attr('transform', `translate(0, ${innerHeight})`)
            .append('text')
              .attr('y', 60)
              .attr('x', innerWidth / 2)
              .attr('fill', 'black')
              .text('Aantal pijpen');
    
        //makes an ordinal color scale for each type
        const color = d3.scaleOrdinal()
            .domain(["hasjpijpen", "tabakspijpen", "waterpijpen", "pijpen (rookgerei)", "opiumpijpen" ])
            .range([ "#FF0047", "#FF8600", "#6663D5", "#FFF800", "#29FF3E"]);
      

        const tooltip = d3.select("body").append("div").attr("class", "toolTip");
        
        
        drawCircles()
        //chazz helped me with the update function
        function selectionChanged() {
            console.log(result);
            
            let dataFilter = result.filter(d => {return d.type == this.value})

            // g = append("g").attr(etc)

            const circle = g.selectAll('circle').data(dataFilter)

            circle.enter()
            .append("circle")
                    .attr('cy', d => yScale(yValue(d)))
                    .attr('cx', d => xScale(xValue(d)))
                    .attr('r', 15)
                    .classed('classnaam', true)
                    .style('fill', d => { return color(d.type) } )
                    .on("mousemove", function(d){
                        tooltip
                        .style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 80 + "px")
                        .style("display", "inline-block")
                        .html((d.origin) + "<br>" +d.type +": " + (d.amount));
                        })
                        .on("mouseout", function(){ tooltip.style("display", "none");})
            
            circle.attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', 15)
            .style('fill', d => { return color(d.type) } )

            circle.exit().remove()
            
            
            //console.log('Data word veranderd naar: ', this.value)


            // console.log(circles);

            //drawCircles()

            // circle.join(
            //     enter => {                   
            //         enter.append("circle")
            //         .attr('cy', d => yScale(yValue(d)))
            //         .attr('cx', d => xScale(xValue(d)))
            //         .attr('r', 15)
            //         .classed('classnaam', true)
            //         .style('fill', d => { return color(d.type) } )
            //         .on("mousemove", function(d){
            //             tooltip
            //             .style("left", d3.event.pageX - 50 + "px")
            //             .style("top", d3.event.pageY - 80 + "px")
            //             .style("display", "inline-block")
            //             .html((d.origin) + "<br>" +d.type +": " + (d.amount));
            //             })
            //             .on("mouseout", function(){ tooltip.style("display", "none");})
            //     },
            //     update => {
            //         console.log(update)
            //         update
            //         .attr('cy', d => yScale(yValue(d)))
            //         .attr('cx', d => xScale(xValue(d)))
            //         .attr('r', 15)
            //         .style('fill', d => { return color(d.type) } )
            //     }
            // )

            // circles.select('circle')
            //     .attr('cy', d => yScale(yValue(d)))
            //     .attr('cx', d => xScale(xValue(d)))
            //     .attr('r', 15)
            //     .style('fill', d => {return color(d.type)})
            
            // circle
            // .data(dataFilter)
            // .enter()
            //     .select('circle')
            //         .attr('cy', d => yScale(yValue(d)))
            //         .attr('cx', d => xScale(xValue(d)))
            //         .attr('r', 15)
            //         .style('fill', d => {return color(d.type)})
        
        }


    //draws all circles
    function drawCircles(){
    g.selectAll('circle')
    .data(result)
      .enter()
            .append('circle')
                .attr('cy', d => yScale(yValue(d)))
                .attr('cx', d => xScale(xValue(d)))
                .attr('r', 15)
                .classed('classnaam', true)
                .style('fill', d => { return color(d.type) } )
                .on("mousemove", function(d){
                    tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 80 + "px")
                    .style("display", "inline-block")
                    .html((d.origin) + "<br>" +d.type +": " + (d.amount));
                    })
                    .on("mouseout", function(){ tooltip.style("display", "none");})
                }
                
        d3.select("#selectButton").on("change", selectionChanged)

        
        //got his piece of code from Ramon, who got it from Laurens' code at https://beta.vizhub.com/Razpudding/921ee6d44b634067a2649f738b6a3a6e
        const legend = svg.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
                .on("mouseenter", d => {
                    console.log(d)
                });
                legend.append("rect")
                .attr("x", innerWidth /3)
                .attr('y', innerHeight+70)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color)
                legend.append("text")
                .attr("x", innerWidth / 3)
                .attr("y", innerHeight +79)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text( d => { return d; })

        		function showAll(){
                    d3.selectAll('circle')
                    .classed("hide", false)
                    .attr("r", getDotSize())
                }

    
        //sets the graph title
        g.append('text')
            .attr('y', -10)
              .text('Aantal rookgerei naar type en continent')


}