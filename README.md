# frontend-data📊


[![Hovering](https://i.gyazo.com/218222d8ff1cc7f9ca175998606e991a.gif)](https://gyazo.com/218222d8ff1cc7f9ca175998606e991a)
#### [ _Checkout the live demo_](https://countnick.github.io/frontend-data/)

## Table of contents 

* ### [_Concept_](#concept-pencil2)
* ### [_General update pattern_](#general-update-pattern-1)
* ### [_Data_](#data-1)
* ### [_Installation_](#Installation)
* ### [_Acknowledgements_](#Acknowledgements)


## Concept :pencil2:

The concept is a scattorplot which visualizes the amounts of smoking tools that are in the collection of the museums and are grouped by cultural heritage. If you want to read through my whole [concept](https://github.com/CountNick/frontend-data/wiki/2.3-Concept) and my [ideation proces](https://github.com/CountNick/frontend-data/wiki/2.2-Ideation) checkout the project Wiki. The chart features a filter function:

[![Filtering](https://i.gyazo.com/7609624c2e21e883e511791527547860.gif)](https://gyazo.com/7609624c2e21e883e511791527547860)

### Target audience 

The first thing people usually think about when you say Amsterdam is smoking weed. The target audience for the visualisation will be tourists and students aged 18-25. I want to reach this audience because the usual audience for the museum are grandparents with kids. I think this subject might attract some of those other people the museum wants to reach.

## General update pattern

In order to get the filter function working i had to write a update pattern. You can read more about my update pattern in [the project wiki](https://github.com/CountNick/frontend-data/wiki/3.4-Implementing-the-update-pattern)

```javascript
        function selectionChanged() {
            
            let dataFilter = result.filter(d => {
                if(this.value == 'toon alles'){
                    return d.type
                }
                else return d.type == this.value})

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
            //.transition().duration(300).style('opacity', 1)
            
            //remove unnecesary circles
            circle.exit().remove()
        }
```



## Data

To realise this visualisation i needed to get every continent, every type of smoking tool and the amount of each smoking tool from each continent. I realised this with a query that gets these things out of the database. Feel free to check the query out by clicking details open:
I made use of the follwing query, which i tweaked from one of Ivo's examples:
<details>


```
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
  
} 
```
</details>

## Installation :cd:

### Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)


* `git clone https://github.com/CountNick/functional-programming.git`

Open the index.html file in your browser to see the project

## Acknowledgements

* Chazz(https://github.com/Chazzers) for helping me debug the update pattern
* Eyob(https://github.com/EyobDejene) for trying to help with my d3 nest problem
* Laurens(https://github.com/Razpudding) for trying to help with my d3 nest problem
* Robert(https://github.com/robert-hoekstra) for trying to help with my d3 nest problem