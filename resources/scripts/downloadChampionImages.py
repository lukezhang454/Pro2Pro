#!usr/bin/python3

import requests
import urllib.request
import os.path

championUrl = 'https://ddragon.leagueoflegends.com/cdn/7.23.1/data/en_US/champion.json'
iconBase = 'http://ddragon.leagueoflegends.com/cdn/7.23.1/img/champion/%s'
backdropBase = 'https://lolstatic-a.akamaihd.net/game-info/1.1.9/images/champion/backdrop/bg-%s.jpg'

iconPathBase = '/var/www/html/pro2pro/resources/images/champions/icons/%s'
backdropPathBase = '/var/www/html/pro2pro/resources/images/champions/backdrops/%s.jpg'

response = requests.get(championUrl)
if response.status_code == 200:
    json = response.json()
    for champion in json['data']:
        iconUrl = iconBase % json['data'][champion]['image']['full']
        iconPath = iconPathBase % json['data'][champion]['image']['full'].lower()
        backdropUrl = backdropBase % champion.lower()
        backdropPath = backdropPathBase % champion.lower()
        if os.path.isfile(iconPath):
            print('Champion icon already exists: ' + champion)
        else:
            if requests.get(iconUrl).status_code == 200:
                urllib.request.urlretrieve(iconUrl, iconPath)
                print('Downloaded icon: ' + champion)
        if os.path.isfile(backdropPath):
            print('Champion backdrop already exists: ' + champion)
        else:
            if requests.get(backdropUrl).status_code == 200:
                urllib.request.urlretrieve(backdropUrl, backdropPath)
                print('Downloaded backdrop: ' + champion)
