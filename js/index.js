//puts the endpoint in a variable
const url ="https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-36/sparql"
//puts the query in a variable
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
//Resource promises: https://www.youtube.com/watch?v=DHvZLI7Db8E&t=349s
d3.json(url+"?query="+ encodeURIComponent(query) +"&format=json")
    .then(json => {
        // put fetch results in variable
        let data = json.results.bindings
        //transformData(data)
        return data
    })
    .then(data => transformData(data))
    .then(transformData => renderGraph(transformData))

function transformData(data){
    //map over data objects and make new array filled with modified objects
    const cleanedData = data
        .map(object => {
            //returns the values of each object in new key
            return{
            origin: object.herkomstSuperLabel.value,
            type: object.typeLabel.value,
            amount: parseInt(object.amount.value)
            }
        })
        return cleanedData
}

//I used the barchart tutotrial by Curran to first make a barchart: https://www.youtube.com/watch?v=NlBt-7PuaLk
//Then i set the bars to circles using this tutotial by Curran: https://www.youtube.com/watch?v=M2s2jowLkUo&t=692s
function renderGraph(data){

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
        //makes an ordinal color scale for each type
        const color = d3.scaleOrdinal()
            .domain(['hasjpijpen', 'tabakspijpen', 'waterpijpen', 'pijpen (rookgerei)', 'opiumpijpen' ])
            .range([ '#FF0047', '#FF8600', '#6663D5', '#FFF800', '#29FF3E']);
        const tooltip = d3.select('body').append('div').attr('class', 'toolTip');
        
        //sets the xScale with the values from d.amount
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth])
            .nice();

        //for plotting the dots on the yaxis
        const yScale = d3.scalePoint()
            .domain(data.map(yValue))
            .range([0, innerHeight])
            .padding(0.7);
            
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        //sets the y axis
        g.append('g')
            .call(d3.axisLeft(yScale)
                .tickSize(-innerWidth))
            .select('.domain')
            .remove()
              .append('text')
              .attr('fill', 'black');
      
        //sets the bottom axis
        g.append('g')
            .call(d3.axisBottom(xScale)
                .tickSize(-innerHeight))
              .attr('transform', `translate(0, ${innerHeight})`)
              
            .append('text')
              .attr('y', 60)
              .attr('x', innerWidth / 2)
              .attr('fill', 'white')
              .text('Aantal pijpen');

        //draw the circles on the chart
        drawCircles();
        //draw the legend 
        drawLegend();
        
        //initialize select button, and fire update function when changed
        d3.select('#selectButton')
            .on('change', selectionChanged);

        //function that draws all circles with the data, this function gets invoked when renderGraph gets invoked
        function drawCircles(){
            g.selectAll('circle')
            .data(data)
            .enter()
                .append('circle')
                    .attr('cy', d => yScale(yValue(d)))
                    .attr('cx', d => xScale(xValue(d)))
                    .attr('r', 0)
                    .classed('classnaam', true)
                    .style('fill', d => { return color(d.type) } )
                    .on('mousemove', function(d){
                        tooltip
                        .style('left', d3.event.pageX - 50 + 'px')
                        .style('top', d3.event.pageY - 80 + 'px')
                        .style('display', 'inline-block')
                        .html((d.origin) + '<br>' +d.type +': ' + (d.amount));
                        })
                        .on('mouseout', function(){ tooltip.style('display', 'none');}).transition().duration(1000)
                        .attr('r', 15)
                    }

        //The update function, chazz helped me with the update function
        //Checked Laurens' example for this function: https://vizhub.com/Razpudding/4a61de4a4034423a98ae79d0135781f7
        function selectionChanged() {
            
            let dataFilter = data.filter(d => {
                //if toon alles is selected return every type
                if(this.value == 'toon alles'){
                    return d.type
                }
                //otherwise only return the chosen type
                else {return d.type == this.value}
            })

            // g = append("g").attr(etc)
        
            const circle = g.selectAll('circle').data(dataFilter)

            circle.enter()
            .append('circle')
                    .attr('cy', d => yScale(yValue(d)))
                    .attr('cx', d => xScale(xValue(d)))
                    .attr('r', 0)
                    .classed('classnaam', true)
                    .style('fill', d => { return color(d.type) } )
                    .on('mousemove', function(d){
                        tooltip
                        .style('left', d3.event.pageX - 50 + 'px')
                        .style('top', d3.event.pageY - 80 + 'px')
                        .style('display', 'inline-block')
                        .html((d.origin) + '<br>' +d.type +': ' + (d.amount));
                        })
                        .on('mouseout', function(){ tooltip.style('display', 'none');}).transition().duration(1000)
                        .attr('r', 15)
            //relocate the circles that don't need to be removed
            circle
            .transition().duration(1000)
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .style('fill', d => { return color(d.type) } )
            
            //remove unnecesary circles
            circle.exit().transition().duration(1000).attr('r', 0).remove()
        }
        //function to draw the legend
        function drawLegend(){

        //got his piece of code from Ramon, who got it from Laurens' code at https://beta.vizhub.com/Razpudding/921ee6d44b634067a2649f738b6a3a6e
        const legend = svg.selectAll('.legend')
                .data(color.domain())
                .enter().append('g')
                .attr('class', 'legend')
                .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; })
                legend.append('circle')
                .attr('cx', 650 + innerWidth /3)
                .attr('cy', innerHeight+70)
                .attr('r', 8)
                .style('fill', color)
                legend.append('text')
                .attr('x', 630 + innerWidth / 3)
                .attr('y', innerHeight +70)
                .attr('dy', '.35em')
                .style('text-anchor', 'end')
                .text( d => { return d; })
                .attr('fill', 'white')
    
        //sets the graph title
        g.append('text')
            .attr('y', -10)
              .text('Aantal rookgerei naar type en continent')
            .attr('fill', 'white')
            }
}