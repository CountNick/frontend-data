# frontend-data
[## _Check the live demo out here_](https://countnick.github.io/frontend-data/)

![frontend-data_screenshot](https://i.imgur.com/EgGBWwQ.png)

## Table of contents 

* [### _Concept_](#Concept)
* [### _Data_](#Data)
* [### _Installation_](#Installation)


## Concept

The concept is a scattorplot which actually is a barchart that visualizes the amounts of smoke pipes that are in the collection of the museums and are grouped by cultural heritage. If you want to read through my whole concept checkout the project Wiki

## Data

To realise this visualisation i needed to get every continent, every type of smoking tool and the amount of each smoking tool from each continent.

I made use of the follwing query, which i tweaked from one of Ivo's examples:

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?cho ?title ?typeLabel ?cultHer WHERE {

  <https://hdl.handle.net/20.500.11840/termmaster14607> skos:narrower* ?type .
  ?type skos:prefLabel ?typeLabel .
  
  
  ?placeNameLink skos:prefLabel ?cultHer.
  ?cho edm:object ?type .
  ?cho dc:title ?title .
  #?cho dct:medium ?materiaalLink.
  #?materiaalLink skos:broader ?materiaalBroad.
  #?materiaalBroad skos:prefLabel ?materiaal.
  
  VALUES ?cultHer {"Afrikaans" "Europees" "Amerikaans" "Aziatisch" "Oceanisch" "Euraziatisch" "Circumpolaire volken-culturen-stijlen-perioden"}
  
  VALUES ?typeLabel{ "waterpijpen" "opiumpijpen" "hasjpijpen" "tabakspijpen" }
}
```

## Installation

### Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)


* `git clone https://github.com/CountNick/functional-programming.git`

Open the index.html file in your browser to see the project
