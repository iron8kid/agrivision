import os
from flask import Flask
from flask import json
from decimal import Decimal
def get_x(d):
    return d[0]

def get_y(d):
    return d[1]

#Cette fonction sert à déterminer le centre et la zone de délimitation de chaque champs et de la map en entier
def get_boxes(features):
    boxes=dict()
    min_min_x= Decimal('Infinity')
    min_min_y= Decimal('Infinity')
    max_max_y=Decimal('-Infinity')
    max_max_x=Decimal('-Infinity')

    for field in features:

        field_name=field["properties"]["field_name"]
        max_x=max(field["geometry"]["coordinates"][0],key=get_x)[0]
        max_y=max(field["geometry"]["coordinates"][0],key=get_y)[1]
        min_x=min(field["geometry"]["coordinates"][0],key=get_x)[0]
        min_y=min(field["geometry"]["coordinates"][0],key=get_y)[1]
        min_min_x=min(min_min_x,min_x)
        min_min_y=min(min_min_y,min_y)
        max_max_y=max(max_max_y,max_y)
        max_max_x=max(max_max_x,max_x)
    boxes["bounds"]=[[round(min_min_x,4),round(min_min_y,4)],[round(max_max_x,4),round(max_max_y,4)]]
    boxes["center"]=[round((min_min_x+max_max_x)/2,4),round((min_min_y+max_max_y)/2,4)]
    return boxes


class FlaskApp(Flask):

    #On ajoute ici toutes les fonctions nécessaires au pré-traitement des données à visualiser

    #Cette méthode sert au pré-traitement des données
    def prepare_data(self,fname):
        #fname = nom du fichier geojson
        #Ce fichier doit ce situer dans /static/data
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "static","data", fname)
        geojson = json.load(open(json_url))
        data=dict()
        data["boxe"]=get_boxes(geojson["features"])
        data["geojson"]=geojson
        return data
