#!usr/bin/python3

from bs4 import BeautifulSoup
import requests
import re
from collections import OrderedDict
import pymysql
from config import *

db = pymysql.connect(host=dbhost, user=dbuser, passwd=dbpasswd, db=dbdb, charset='utf8mb4')
cursor = db.cursor()

def remove_non_numeric(string):
    return re.sub('[^0-9]', '', string)

def remove_region_from_season(string):
    return re.sub(r'(EU |LCS |EUCS |Korea |LCK |NA |NACS )', '', string)


'''
 The following ids are tournament ids for the region and season as specified.
 They are mainly used to get a list of players from that region. All of the tournaments
 that the player has played in 2017 will be parsed, but for players who did not
 play in SUMMER 2017, their 2017 stats will not be parsed if they played in other
 2017 tournaments.
'''
eu_2017_summer="0768caf5-a948-4e3c-bf9e-72e480e00169"
na_2017_summer="9c67f1fe-34d8-445b-a93f-d93e0ecd0056"
lck_2017_summer="6e66df3c-1c99-46af-8903-51c562ca2a08"
tournament_list=[eu_2017_summer, na_2017_summer, lck_2017_summer]

base_players_url = "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=regular_season&tournamentId="
stats_url = "https://lol.gamepedia.com/%s/Statistics/2017"

for tournament in tournament_list:
        players_url=base_players_url+tournament

        response = requests.get(players_url)
        data = response.json()
        players = data['stats']

        for player in players:
            stats_response = requests.get(stats_url % (player['name']))
            soup = BeautifulSoup(stats_response.content, 'html.parser')
            tables = soup.find_all('table', attrs={'class':'sortable'})
            dict = {'Season':'',
                        'Player':'',
                        'Champion':'',
                        'Games Played':'',
                        'Wins':'',
                        'Losses':''
                        }
            dict['Player'] = player['name']
            for table in tables:
                    dict['Season'] = remove_region_from_season(table.tr.th.a.string)
                    rows = table.find_all('tr')
                    rows = rows[2:len(rows)]
                    for row in rows:
                        cols = row.find_all('td')
                        dict['Champion'] = cols[0].a.get('title')
                        dict['Games Played'] = cols[1].b.span.a.string
                        dict['Wins'] = remove_non_numeric(cols[2].string)
                        dict['Losses'] = remove_non_numeric(cols[3].string)
                        SQL = 'INSERT INTO gamepediaStats (name, champion, losses, wins, gamesPlayed, season) \
                               VALUES ("{0}", "{1}", {2}, {3}, {4}, "{5}") \
                               ON DUPLICATE KEY UPDATE name="{0}", champion="{1}", losses={2}, wins={3}, gamesPlayed={4}, season="{5}";'.format(dict['Player'], dict['Champion'], dict['Losses'], dict['Wins'], dict['Games Played'], dict['Season'])
                        cursor.execute(SQL)
                        print('Inserted ' + dict['Player'] + ' : ' + dict['Champion'] + ' : ' + dict['Season'])
            db.commit()
db.close()

    
