#!usr/bin/python3

import pymysql
import requests
import urllib.request
from config import *
from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os.path

# Connect to database
db = pymysql.connect(host=dbhost, user=dbuser, passwd=dbpasswd, db=dbdb, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
cursor = db.cursor()

# Populate playerlist and teamlist
SQL = 'SELECT playerSlug FROM player;'
cursor.execute(SQL)
allResults = cursor.fetchall()
playerList = []
for result in allResults:
    playerList.append(result['playerSlug'])
SQL = 'SELECT teamSlug FROM player GROUP BY teamSlug;'
cursor.execute(SQL)
allResults = cursor.fetchall()
teamList = []
for result in allResults:
    teamList.append(result['teamSlug'])
db.close()

# Start virtual display to load and download images
display = Display(visible=0, size=(800, 800))
display.start()
driver = webdriver.Chrome()
for player in playerList:
    playerPath = '/var/www/html/pro2pro/resources/images/players/%s.png' % (player)
    if os.path.isfile(playerPath):
        print('Player already exists: ' + player)
    else:
        driver.get('http://www.lolesports.com/en_US/na-lcs/na_2017_summer/players/' + player)
        try:
            element = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'portrait'))
            )
        except:
            print('exception thrown on ' + player)
            continue
        style = element.get_attribute('style')
        start = style.index('"') + 1
        end = style.index('&')
        imageUrl = style[start:end]
        urllib.request.urlretrieve(imageUrl, playerPath)
        print('Player Downloaded: ' + player)
for team in teamList:
    teamPath = '/var/www/html/pro2pro/resources/images/teams/%s.png' % (team)
    if os.path.isfile(teamPath):
        print('Team already exists: ' + team)
    else:
        driver.get('http://www.lolesports.com/en_US/na-lcs/na_2017_summer/teams/' + team)
        try:
            element = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'team-logo'))
            )
        except:
            print('exception thrown on ' + team)
            continue
        src = element.get_attribute('src')
        end = src.index('&')
        imageUrl = src[:end]
        urllib.request.urlretrieve(imageUrl, teamPath)
        print('Team downloaded: ' + team)
