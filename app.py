import os
import sys
from flask import jsonify, render_template, request, url_for, json
from  FLaskApp import FlaskApp
from flask_sqlalchemy import SQLAlchemy

#Importation du modèle de la base de données (ORM)
from models import *


#Initialisation de l'application flask
app = FlaskApp(__name__)

#Configuration de l'URI de la base de données
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///agribiot'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

#Préparation des données servant à la visualisation de la carte
map_data=app.get_map("chateau_guiraud.geojson")


#Création de ressources sur le serveur pour être affiché par la suite
@app.route('/')
def index():
    data=list()
    avg_temp_field=dict()

    #On parcourt toutes les parcelles
    for parcel in Parcel.query.all():
        objects=parcel.objects

        #Dans chaque parcelle, on parcourt tous les objets
        i=0
        avg=0
        for object in objects:

            #On regroupe les capteurs appartenant à un même objet
            sensors=object.sensors

            #On parcourt tous les capteurs

            for sensor in sensors:
                value_n_date=db.session.query(Value.value,Value.created).filter(Value.sensor_object_id==sensor.id).order_by(Value.created).all()

                #On récupère les valeurs mesurées par le capteur
                values=list(map(lambda d : d[0],value_n_date))

                #On récupère la date associée
                dates=list(map(lambda d : str(d[1]),value_n_date))
                data.append({
                "parcel_name":parcel.name,
                "id":sensor.id,
                "name":sensor.name,
                "unit":sensor.unit,
                "x": dates,
                "y":values,
                "longitude":object.longitude,
                "latitude":object.latitude,
                "function":'Température' if sensor.unit == 'C' else 'Humidité'
                })
                if sensor.unit=='C':
                    i+=len(values)
                    avg+=sum(values)
        if i == 0:
            avg_temp_field[parcel.name]=25
        else :
            avg_temp_field[parcel.name]=avg/i
    #data est une liste de capteurs, chaque capteur est représenté sous la forme d'un dictionnaire
    #(ex : parcel_name, id, name, unit, x, y, longitude, latitude, function)
    app.data=data

    return render_template('index.html',map=map_data,data=data,avg_temp_field=avg_temp_field)
