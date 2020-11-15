import os
import sys
from flask import jsonify, render_template, request, url_for, json
from  FLaskApp import FlaskApp


app = FlaskApp(__name__)
data=app.prepare_data("chateau_guiraud.geojson")
@app.route('/')
def index():
    return render_template('index.html',z=data)

@app.route('/get_map')
def get_map():
    return data
