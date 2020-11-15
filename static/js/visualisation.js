
var projection = d3.geoMercator();
var path = d3.geoPath()
    .projection(projection);
// coleurs de champs
var color = d3.scaleLinear()
.domain([-10, 40]) // tempurature de -10 à 40[Ces deux valeurs seront modifiées après dynamiquement]
.clamp(true)
.range(['#e6eba9', '#cddb38']); // couleur de  #e6eba9 à #cddb38

var org_width =$(".map_card").width(),
  width =$(".map_card").width(),
  height = $(".map_card").height(),
  centered;
  var svg = d3.select('svg')
.attr('width', "100%")
.attr('height', "100%");
svg.append('rect')
.attr('class', 'background')
.attr('width', "100%")
.attr('height', "100%")
.on('click', clicked);
var g = svg.append('g');
var effectLayer = g.append('g')
.classed('effect-layer', true);
var mapLayer = g.append('g')
.classed('map-layer', true);
var bigText = g.append('text')
.classed('big-text', true)
.attr('x', 20)
.attr('y', 45);
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



function do_it(geojson) {

    // Center the Map
    projection.scale(580000)
               .translate([width / 2, height / 2])
               .center([-0.3310,44.5327]);

    var features = geojson.geojson.features;
    color.domain([0, d3.max(features, avgTemp)]);
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

function nameFn(d){
       return d && d.properties ? d.properties.field_name : null;
     }
function nameLength(d){
       var n = nameFn(d);
       return n ? n.length : 0;
     }
function avgTemp(d)
     {
       var n = nameFn(d);
       return n ? avg_temp_field[n] : 0;
     }
function fillFn(d){
     return color(avgTemp(d));
}
     function clicked(d) {
var x, y, k;

// Compute centroid of the selected path
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
function mouseover(d){
// Highlight hovered province
d3.select(this).style('fill', '#89abbe');
bigText.text(nameFn(d));

// Draw effects
}

function mouseout(d){
// Reset province color
mapLayer.selectAll('path')
  .style('fill', function(d){return centered && d===centered ? '#0b2d46' : fillFn(d);});

// Remove effect text
effectLayer.selectAll('text').transition()
  .style('opacity', 0)
  .remove();

// Clear province name
bigText.text('');
}
