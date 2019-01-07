from geopy import distance
from db import DataStore

db = DataStore('127.0.0.1', 27017,'yelp','coords')

# size of rectangle
width = 350
height = 180

# resolution (yelp 50 miles)
res = 60

coords = []
#start point top left of rect box
lat = 33.4750858
lon = -86.7538841

start = distance.Point(lat, lon)
while height > 0:

    localWidth = width-res # gets the pt ahead for bottom row
    bot_row = distance.GeodesicDistance(kilometers=height).destination(point=start, bearing=180)
    height = height - res
    top_row = distance.GeodesicDistance(kilometers=height).destination(point=start, bearing=180) 
    height = height - res
    while localWidth > 0:
        
        bot_pt =  distance.GeodesicDistance(kilometers=localWidth).destination(point=bot_row, bearing=90) 
        
        # gets the top row which is 1 point further right than bot
        top_pt = distance.GeodesicDistance(kilometers=localWidth+res).destination(point=top_row, bearing=90) 

        coords.append({'topRightLat': top_pt.latitude, 'topRightLon': top_pt.longitude,
        'botLeftLat': bot_pt.latitude, 'botLeftLon': bot_pt.longitude, 'processed': False, 'item': 0})
        
        localWidth = localWidth - res
        

doc = {'startCoords': (lat, lon), 'res': res, 'width': width, 'height': height, 'coords': coords }

db.Insert_One(doc)


