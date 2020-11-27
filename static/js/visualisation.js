var $table = $('.table')
graph = document.getElementById('graph');
 var tab_col = [
   {
     'id': 'id_capteur',
     'name': 'nom-caapteur',
     'function': 'Humidité/Température'
   }
 ]
 $table.bootstrapTable({data: tab_col})
//Initialisation de la projection (geoMercator)
var projection = d3.geoMercator();
var map;
var data;
var tablename=$(".table_name")
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
//Contient la largeur de la map actuelle
var org_width =$(".map_card").width(),
  width =$(".map_card").width(),
  old_width =$(".map_card").width(),
  height = $(".map_card").height(),
  centered,
  old_centered;//Indique sur quel champs la map est centrée, NULL sinon

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
        if(width!==old_width)
        {
          //Plotly.relayout(graph)
          old_width=width
          if (centered)
          {
            old_centered=centered
            clicked(null)
            g.transition()
              .duration(750)
              .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')translate(' + -org_width/2 + ',' + -height/2 + ')');
            bigText.transition()
              .duration(750)
              .attr('transform', 'translate('  +-width / 2 + ',' + height / 2 + ')translate(' + org_width/2 + ',' + -height/2 + ')');
            clicked(old_centered)

          }
          else {
            g.transition()
              .duration(750)
              .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')translate(' + -org_width/2 + ',' + -height/2 + ')');
            bigText.transition()
              .duration(750)
              .attr('transform', 'translate('  +-width / 2 + ',' + height / 2 + ')translate(' + org_width/2 + ',' + -height/2 + ')');

          }

        }
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
function do_it(d , data_sensor) {
    //Centre la map
    map=d;
    data=data_sensor;
    bmap=path.bounds(map)
    s=.85*projection.scale() / Math.max((bmap[1][0]- bmap[0][0]) / width, (bmap[1][1] - bmap[0][1]) / height);



    projection.scale(s)
               .translate([width / 2, height / 2])
               .center(projection.invert(path.centroid(map)));


    var features = map.features;
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


    mapLayer
     .selectAll("mysensors")
     .data(data)
     .enter()
     .append("image").attr("xlink:href",function(d){ return d.unit=="C" ? "static/image/thermo.png" : "static/image/hum.png"; })
     .attr("x", function(d){ return projection([d.longitude, d.latitude])[0]-10 })
     .attr("y", function(d){ return projection([d.longitude, d.latitude])[1]-10 })
     .attr("height", 20)
     .attr("width", 20)
     .on('click', clicked_sensor);

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
        tablename.html(nameFn(d));
        load_table(d)
        var centroid = path.centroid(d),
            b=path.bounds(d);
        k = .80 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        x = centroid[0];
        y = centroid[1];
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
function clicked_sensor(d)
{

clicked(get_field(d.parcel_name))
}
function get_field(name)
{
  f=map.features.filter(function (field) {
  return nameFn(field) === name;
});
return f[0]
}
function  load_table(d){
    sensors=data.filter(sensor=>sensor.parcel_name===nameFn(d))
    if (sensors.length > 0)
    {
      $table.bootstrapTable('load',sensors)
    }
    else
    {
      $table.bootstrapTable('load',tab_col)
    }
  }
  $(".table").on('click-row.bs.table', function (row, $element, field) {
    if($element.hasOwnProperty('x'))
    {

      var layout = {
  title: $element.function,
  xaxis: {
    title: 'date',
    tickangle: 90,
    automargin: true,
    showgrid: false,
    zeroline: false
  },
  yaxis: {
    title:  $element.unit,
    showline: false
  }
};
      var config = {responsive: true}
      Plotly.newPlot(graph, [{
  	x:$element.x,
  	y:$element.y }] ,layout,config);
  }});
