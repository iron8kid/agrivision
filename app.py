import os
import sys
from flask import jsonify, render_template, request, url_for, json
from  FLaskApp import FlaskApp
from flask_sqlalchemy import SQLAlchemy
from models import *


#Initialisation de l'application flask
app = FlaskApp(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///agribiot'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

#Préparation des données servant à la visualisation de la carte
map_data=app.get_map("chateau_guiraud.geojson")
#data=app.prepare_data(db)


#Création de ressources sur le serveur pour être affiché par la suite
@app.route('/')
def index():
    data=dict()
    markers=[]
    for parcel in Parcel.query.all():
        objects=parcel.objects
        data[parcel.name]=dict()
        for object in objects:
            sensors=object.sensors
            for sensor in sensors:
                value_n_date=db.session.query(Value.value,Value.created).filter(Value.sensor_object_id==sensor.id).order_by(Value.created).all()
                values=list(map(lambda d : d[0],value_n_date))
                dates=list(map(lambda d : d[1],value_n_date))
                markers.append({
                "parcel_name":parcel.name,
                "id":sensor.id,
                "name":sensor.name,
                "longitude":object.longitude,
                "latitude":object.latitude,
                "unit":sensor.unit
                })

                data[parcel.name][sensor.id]={
                "x":dates,
                "y":values
                }

    return render_template('index.html',map=map_data,data=data,markers=markers) #à modifier quand on aura la base de données

'''@app.route('/get_map')
def get_map():
    return data'''
