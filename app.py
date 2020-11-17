import os
import sys
from flask import jsonify, render_template, request, url_for, json
from  FLaskApp import FlaskApp

#Initialisation de l'application flask
app = FlaskApp(__name__)

#Préparation des données servant à la visualisation de la carte
data=app.prepare_data("chateau_guiraud.geojson")

#Création de ressources sur le serveur pour être affiché par la suite
@app.route('/')
def index():
    return render_template('index.html',z=data) #à modifier quand on aura la base de données

'''@app.route('/get_map')
def get_map():
    return data'''
