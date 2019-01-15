from geopy import distance
from db import DataStore
from decimal import Decimal

db = DataStore('127.0.0.1', 27017,'yelp','coords')

# round gps coords to x decimal places
numDecimals = 7
# size of rectangle
width = 4800
height = 3000

# resolution (yelp 50 miles)
res = 20

coords = []
#start point top left of rect box
lat = 50.484779
lon = -128.065144

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

        coords.append({'topRightLat': round(top_pt.latitude, numDecimals), 'topRightLon': round(top_pt.longitude, numDecimals),
        'botLeftLat': round(bot_pt.latitude, numDecimals), 'botLeftLon': round(bot_pt.longitude, numDecimals)})
        
        localWidth = localWidth - res

docs = []
for points in coords:
    docs.append({'coords': points, 'items': [], 'isFinished': False, 'lastUpdate': 0})
db.Insert_Many(docs)


