from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
class Farm(db.Model):
      __tablename__ = "farm"
      id = db.Column(db.Integer, primary_key=True)
      name = db.Column(db.String,unique=True, nullable=False)

class Parcel(db.Model):
     __tablename__ = "parcel"
     id = db.Column(db.Integer, primary_key=True)
     name = db.Column(db.String,unique=True, nullable=False)
     geometry = db.Column(db.String,unique=True, nullable=False)
     objects=db.relationship('Object',backref='parcel',lazy=True)
     farm_id = db.Column(db.Integer,db.ForeignKey("farm.id"),unique=True, nullable=False)


class Object(db.Model):
      __tablename__ = "object"
      id = db.Column(db.Integer, primary_key=True)
      latitude = db.Column(db.Float ,unique=True, nullable=False)
      longitude = db.Column(db.Float ,unique=True, nullable=False)
      ff=db.relationship('Parcel',backref='object',lazy=True)
      sensors=db.relationship('Sensor_object',backref='object',lazy=True)
      parcel_id = db.Column(db.Integer, db.ForeignKey("parcel.id"),unique=True, nullable=False)

class Sensor_object(db.Model):
     __tablename__ = "sensor_object"
     id = db.Column(db.Integer, primary_key=True)
     name = db.Column(db.String ,unique=True, nullable=False)
     unit = db.Column(db.String ,unique=True, nullable=False)
     values=db.relationship('Value',backref='sensor',lazy=True)
     object_id= db.Column(db.Integer, db.ForeignKey("object.id"),unique=True, nullable=False)

class Value(db.Model):
     __tablename__ = "value"
     id = db.Column(db.Integer, primary_key=True)
     created = db.Column(db.DateTime ,unique=True, nullable=False)
     value = db.Column(db.Float ,unique=True, nullable=False)
     sensor_object_id = db.Column(db.Integer, db.ForeignKey("sensor_object.id"),unique=True, nullable=False)
