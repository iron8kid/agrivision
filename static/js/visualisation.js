//Initialisation de la projection (geoMercator)
var projection = d3.geoMercator();

//Initialisation du Path
var path = d3.geoPath()
    .projection(projection);

//Creation de la variable couleurs des champs
var color = d3.scaleLinear()
.domain([-10, 40]) //Temperature de -10 à 40 [Ces deux valeurs seront modifiées après dynamiquement]
.clamp(true)
.range(['#e6eba9', '#cddb38']); //Couleurs de  #e6eba9 à #cddb38

//Initialisation des variables
//org_width contient la largeur de la map à l'ouverture de la page web

var org_width =$(".map_card").width(),
  width =$(".map_card").width(), //Contient la largeur de la map actuelle
  height = $(".map_card").height(), 
  centered; //Indique sur quel champs la map est centrée, NULL sinon

//Initialise la balise svg dans index.html 
var svg = d3.select('svg')
.attr('width', "100%")
.attr('height', "100%");
svg.append('rect')
.attr('class', 'background')
.attr('width', "100%")
.attr('height', "100%")
.on('click', clicked); //Lance la fonction "click" lors d'un clique utilisateur

//Ajout d'une balise group qui contient le champs
var g = svg.append('g');
var mapLayer = g.append('g')
.classed('map-layer', true);
var bigText = g.append('text')
.classed('big-text', true)
.attr('x', 20)
.attr('y', 45);

//Récupération des températures moyennes sur chaque section de champs (pour l'instant valeurs arbitraires)
var  avg_temp_field ={
  "Falkor":20,
  "Bonnie Tyler":30,
  "Skysheen":0,
  "Super Joe":15,
  "Bonersaurus":10,
  "Mr Hands":25,
  "chikorita":25,
  "Bloodbane":22,
  "Cartman":18,
  "Kabbalah":11,
  "Nauty":5,
  "Undyne":7,
  "Tritox":8,
  "Kim Carnes":27
}

//Permet à la map d'être responsive
//Début
var rtime;
var timeout = false;
var delta = 200;
function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;

        width =$(".map_card").width()
        console.log('width after resize'+width)
        g.transition()
          .duration(750)
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')translate(' + -org_width/2 + ',' + -height/2 + ')');
        bigText.transition()
          .duration(750)
          .attr('transform', 'translate('  +-width / 2 + ',' + height / 2 + ')translate(' + org_width/2 + ',' + -height/2 + ')');

        }
}
window.addEventListener('resize', function(event){
  rtime = new Date();
  if (timeout === false) {
      timeout = true;
      setTimeout(resizeend, delta);
  }

});
//Fin


//Permet la visualisation de la map
function do_it(data) {

    //Centre la map
    projection.scale(580000)
               .translate([width / 2, height / 2])
               .center([-0.3310,44.5327]);

    var features = data.geojson.features;
    color.domain([d3.min(features, avgTemp), d3.max(features, avgTemp)]); //Il y a un gradient de couleur entre la température moyenne minimale et la température moyenne maximale
    //Visualisation de la délimitation de chaque champs
    mapLayer.selectAll('path')
    .data(features)
    .enter().append('path')
    .attr('d', path)
    .attr('vector-effect', 'non-scaling-stroke')
    .style('fill', fillFn)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .on('click', clicked);
     }

//Retourne le nom du champ d
function nameFn(d){
       return d && d.properties ? d.properties.field_name : null;
     }

//Retourne la température moyenne du champ d
function avgTemp(d){
       var n = nameFn(d);
       return n ? avg_temp_field[n] : 0;
     }

//Retourne la couleur selon la température moyenne du champ d
function fillFn(d){
     return color(avgTemp(d));
}

//Cette fonction sert à zoomer/dézoomer quand on clique sur un champ
function clicked(d) {
      var x, y, k;

      // Calcule le centre du champ sélectionné
      if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 3;
        centered = d;
        g.transition()
          .duration(750)
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
      } else {
        x = width/ 2;
        y = height / 2;
        k = 1;
        centered = null;
        g.transition()
          .duration(750)
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')translate(' + -org_width/2 + ',' + -height/2 + ')');
      }
      mapLayer.selectAll('path')
          .style('fill', function(d){return centered && d===centered ? '#0b2d46' : fillFn(d);});

}

//Colorie le champ survolé
function mouseover(d){
      d3.select(this).style('fill', '#89abbe');
      bigText.text(nameFn(d)); //Affiche le nom du champ
}

//Réaffecte la couleur d'origine quand le champ n'est plus survolé
function mouseout(d){
      mapLayer.selectAll('path')
      .style('fill', function(d){return centered && d===centered ? '#0b2d46' : fillFn(d);});

      //Efface le nom du champ
      bigText.text('');
}
