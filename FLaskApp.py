import os
from flask import Flask ,json
from decimal import Decimal


class FlaskApp(Flask):

    #data est une liste de capteurs, chaque capteur est représenté sous la forme d'un dictionnaire 
    #(ex : parcel_name, id, name, unit, x, y, longitude, latitude, function)
    data=list()

    #On ajoute ici toutes les fonctions nécessaires au pré-traitement des données à visualiser

    #Cette méthode sert au pré-traitement des données
    def get_map(self,fname):
        #fname = nom du fichier geojson
        #Ce fichier doit ce situer dans /static/data
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "static","data", fname)
        data = json.load(open(json_url))


        return data
