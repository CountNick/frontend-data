# frontend-data📊


[![Hovering](https://i.gyazo.com/c60b89d8a66bf9ec1ee9d5b310c7d456.gif)](https://gyazo.com/c60b89d8a66bf9ec1ee9d5b310c7d456)
#### [ _Checkout the live demo_](https://countnick.github.io/frontend-data/)

## Table of contents 

* ### [_Concept_](#concept-pencil2)
* ### [_General update pattern_](#general-update-pattern-1)
* ### [_Data_](#data-1)
* ### [_Installation_](#installation-cd)
* ### [_Acknowledgements_](#acknowledgements-1)


## Concept :pencil2:

The concept is a scattorplot which visualizes the amounts of smoking tools that are in the collection of the museums and are grouped by cultural heritage. If you want to read through my whole [concept](https://github.com/CountNick/frontend-data/wiki/2.3-Concept) and my [ideation proces](https://github.com/CountNick/frontend-data/wiki/2.2-Ideation) checkout the project Wiki.
Early sketch of my concept:
[![sketch](https://i.imgur.com/gULvTyB.jpg)](https://i.imgur.com/gULvTyB.jpg)


### Target audience 

The first thing people usually think about when you say Amsterdam is smoking weed. The target audience for the visualisation will be tourists and students aged 18-25. I want to reach this audience because the usual audience for the museum are grandparents with kids. I think this subject might attract some of those other people the museum wants to reach.

## General update pattern

In order to get the filter function working i had to write an update pattern. When the user clicks makes a change on the filter dropdown, the selected value is being compared with the data. The filter function only returns the types of smoking pipes that have been chosen. You can read more about my update pattern in [the project wiki](https://github.com/CountNick/frontend-data/wiki/3.4-Implementing-the-update-pattern)

[![Filtering](https://i.gyazo.com/8e4f52512034795f09372c1eea937d58.gif)](https://gyazo.com/8e4f52512034795f09372c1eea937d58)


## Data

To realise this visualisation i needed to fetch every continent, every type of smoking tool and the amount of each smoking tool from each continent. I realised this with a query that gets these things out of the database. Luckily i didn't get any extreme values out of this query. Ofcourse some values are way higher than others, but the visualisation is able to show the difference between these values. Also when the user filters on a type, the dots move to the place they need to be at. This movement is to compare the sometimes extreme values to those of the selection that came before. Feel free to check the query out by clicking details open I tweaked this query from one of Ivo's examples:
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

* [Chazz](https://github.com/Chazzers) for helping me debug the update pattern
* [Eyob](https://github.com/EyobDejene) for trying to help with my d3 nest problem
* [Laurens](https://github.com/Razpudding) for trying to help with my d3 nest problem
* [Robert](https://github.com/robert-hoekstra) for trying to help with my d3 nest problem

## Resources

* [Ordinal scatterplot](https://vizhub.com/curran/a9ec621b1c36439aa2a65e0c28462d7a)
* [Barchart](https://vizhub.com/curran/a44b38541b6e47a4afdd2dfe67a302c5)