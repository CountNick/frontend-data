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
    .then(nestData => cleanData(nestData))
    .then(cleanData => renderGraph(cleanData))


function transformData(data){
        //map over data objects and make new array filled with modified objects
    const objectsArray = data
        .map(object => {
                
            object.amount = parseInt(object.amount.value)
            object.type = object.typeLabel.value
            object.origin = object.herkomstSuperLabel.value

            return object

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

function cleanData(nestedData){
    //console.log("Clean data: ", nestedData)

    let result = []
    
    Object.entries(nestedData)
    	.forEach(([key, propValue]) => { 		
            result[key] = propValue.values
           // console.log("Result: ", result)
      })
      
      //console.log("Result: ", result)


    //   result.forEach(element => {
          
    //     console.log("ForEach: ", element)


    
    // })

    //   for (let i = 0; i < result.length; i++) {
    //     console.log("loop: ", result[0][i].amount, result[1][i].amount, result[2][i].amount, result[3][i].amount, result[4][i].amount)
    //   }

 //   console.log("MUM", d3.stack(nestedData))

 //console.log("gwbn leip", nestedData)
  
  var stack = d3.stack()
    .keys([d => {return d.origin}])
  	.value(d => {return d.amount})
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

var series = stack(nestedData);
  
  //console.log("ff", series)
  
  //console.log(stack(nestedData))
  
    return series

}



function renderGraph(result){

     console.log( "TTT", result)

    const svg = d3.select('svg');
    const svgContainer = d3.select('#container');
    
    const margin = 80;
    const width = 1000 - 2 * margin;
    const height = 500 - 2 * margin;

    const chart = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(result.map((d) => d.key))
      .padding(0.4)
    
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(result, d => d3.max(d, d => d[1]))])
    	.nice();

  console.log(yScale.domain())
  
    // vertical grid lines
    // const makeXLines = () => d3.axisBottom()
    //   .scale(xScale)

    const makeYLines = () => d3.axisLeft()
      .scale(yScale)

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append('g')
      .call(d3.axisLeft(yScale));

    // vertical grid lines
    // chart.append('g')
    //   .attr('class', 'grid')
    //   .attr('transform', `translate(0, ${height})`)
    //   .call(makeXLines()
    //     .tickSize(-height, 0, 0)
    //     .tickFormat('')
    //   )

    chart.append('g')
      .attr('class', 'grid')
      .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
      )

    const barGroups = chart.selectAll()
      .data(result)
      .enter()
      .append('g')

    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (g) => xScale(g.origin))
      .attr('y', (g) => yScale(g.amount))
      .attr('height', (g) => height - yScale(g.amount))
      .attr('width', xScale.bandwidth())
//       .on('mouseenter', function (actual, i) {
//         d3.selectAll('.value')
//           .attr('opacity', 0)

//         d3.select(this)
//           .transition()
//           .duration(300)
//           .attr('opacity', 0.6)
//           .attr('x', (a) => xScale(a.origin) - 5)
//           .attr('width', xScale.bandwidth() + 10)

//         const y = yScale(actual.amount)

//         line = chart.append('line')
//           .attr('id', 'limit')
//           .attr('x1', 0)
//           .attr('y1', y)
//           .attr('x2', width)
//           .attr('y2', y)

//         barGroups.append('text')
//           .attr('class', 'divergence')
//           .attr('x', (a) => xScale(a.origin) + xScale.bandwidth() / 2)
//           .attr('y', (a) => yScale(a.amount) + 30)
//           .attr('fill', 'white')
//           .attr('text-anchor', 'middle')
//           .text((a, idx) => {
//             const divergence = (a.amount - actual.amount).toFixed(1)
            
//             let text = ''
//             if (divergence > 0) text += '+'
//             text += `${divergence}%`

//             return idx !== i ? text : '';
//           })

//       })
//       .on('mouseleave', function () {
//         d3.selectAll('.value')
//           .attr('opacity', 1)

//         d3.select(this)
//           .transition()
//           .duration(300)
//           .attr('opacity', 1)
//           .attr('x', (a) => xScale(a.origin))
//           .attr('width', xScale.bandwidth())

//         chart.selectAll('#limit').remove()
//         chart.selectAll('.divergence').remove()
//       })

    // barGroups 
    //   .append('text')
    //   .attr('class', 'value')
    //   .attr('x', (a) => xScale(a.origin) + xScale.bandwidth() / 2)
    //   .attr('y', (a) => yScale(a.amount) + 30)
    //   .attr('text-anchor', 'middle')
    //   .text((a) => `${a.amount}%`)
    
    svg
      .append('text')
      .attr('class', 'label')
      .attr('x', -(height / 2) - margin)
      .attr('y', margin / 2.4)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Aantal')

    svg.append('text')
      .attr('class', 'label')
      .attr('x', width / 2 + margin)
      .attr('y', height + margin * 1.7)
      .attr('text-anchor', 'middle')
      .text('Continent')

    svg.append('text')
      .attr('class', 'title')
      .attr('x', width / 2 + margin)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text('Aantal rookgerei naar herkomst')

    svg.append('text')
      .attr('class', 'source')
      .attr('x', width - margin / 2)
      .attr('y', height + margin * 1.7)
      .attr('text-anchor', 'start')
      .text('Source: https://blog.risingstack.com/d3-js-tutorial-bar-charts-with-javascript/')
  

}



