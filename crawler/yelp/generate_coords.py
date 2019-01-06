from geopy import distance
#db = DataStore('68.185.251.95', 27017,'yelp','coords')


# size of rectangle
width = 350
height = 180

# resolution (yelp 50 miles)
res = 60

coords = []
#start point top left of rect box
start = distance.Point(33.4750858, -86.7538841)
while height > 0:
    localWidth = width
    row_start = distance.GeodesicDistance(kilometers=height).destination(point=start, bearing=180)
    height = height - res
    while localWidth > 0:
        pt =  distance.GeodesicDistance(kilometers=localWidth).destination(point=row_start, bearing=90)
        coords.append((pt.latitude, pt.longitude))
        localWidth = localWidth - res
        

print(coords)
