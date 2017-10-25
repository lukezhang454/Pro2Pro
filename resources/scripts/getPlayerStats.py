#!usr/bin/python3

import requests
import pymysql
from config import *

#Need to figure out a way to webcrawl and get these links for other leagues/seasons/regions from lolesports.com
seasonStatLinks = [
        #NA Spring 2016
        "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=promotion_relegation&tournamentId=739fc707-a686-4e49-9209-e16a80fd1655",
        #NA Summer 2016
        "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=promotion_relegation&tournamentId=472c44a9-49d3-4de4-912c-aa4151fd1b3b",
        #NA Spring 2017
        "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=promotion_relegation&tournamentId=ce8e57ab-9804-496d-941a-9d04558f7bb4",
        #NA Summer 2017
        "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=regionals&tournamentId=9c67f1fe-34d8-445b-a93f-d93e0ecd0056"
        ]

#single link for testing
#figure out how to get seasons (relates to web crawling)
testseason = "summer2017regionals"
testregion = "NA"
testlinkNA = "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=regionals&tournamentId=9c67f1fe-34d8-445b-a93f-d93e0ecd0056"
testlinkEU = "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=regionals&tournamentId=0768caf5-a948-4e3c-bf9e-72e480e00169"

#setup DB connection
db = pymysql.connect(host=dbhost,user=dbuser,passwd=dbpasswd,db=dbdb,charset="utf8mb4");
cursor = db.cursor();

#This would be looped through for all seasons
response = requests.get(testlinkNA)
if response.status_code == 200:
    count = 0
    json = response.json()
    for p in json["stats"]:
        SQL = 'INSERT INTO player (id, name, position, playerSlug, team, teamSlug, region) \
        VALUES ({0}, "{1}", "{2}", "{3}", "{4}", "{5}", "{6}") \
        ON DUPLICATE KEY UPDATE id={0}, name="{1}", position="{2}", playerSlug="{3}", team="{4}", teamSlug="{5}", region="{6}";'.format(p["id"], p["name"], p["position"], p["playerSlug"], p["team"], p["teamSlug"], testregion)
        cursor.execute(SQL)
    db.commit()
    for p in json["stats"]:
        SQL = 'INSERT INTO stats (playerId, season, gamesPlayed, kills, deaths, assists, killParticipation, cs, minutesPlayed) \
        VALUES ({0}, "{1}", {2}, {3}, {4}, {5}, {6}, {7}, {8}) \
        ON DUPLICATE KEY UPDATE playerId={0}, season="{1}", gamesPlayed={2}, kills={3}, deaths={4}, assists={5}, killParticipation={6}, cs={7}, minutesPlayed={8};'.format(p["id"], testseason, p["gamesPlayed"], p["kills"], p["deaths"], p["assists"], p["killParticipation"], p["cs"], p["minutesPlayed"])
        cursor.execute(SQL)
    db.commit()

db.close()

