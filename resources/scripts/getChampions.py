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
from bs4 import BeautifulSoup
import os.path

# Connect to database
db = pymysql.connect(host=dbhost, user=dbuser, passwd=dbpasswd, db=dbdb, charset='utf8mb4')
cursor = db.cursor()

# Start virtual display to load and download images
display = Display(visible=0, size=(800, 800))
display.start()
driver = webdriver.Chrome()
driver.get('https://na.leagueoflegends.com/en/game-info/champions/')
try:
    element = WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.ID, 'champion-grid-content'))
    )
except:
    print('Champion table did not load')
soup = BeautifulSoup(element.get_attribute('innerHTML'), 'html.parser')
championNames = soup.find_all('div', class_='champ-name')
for div in championNames:
    a = str(div.find('a'))
    startSlug = a.index('"') + 1
    endSlug = a.index('/')
    slug = a[startSlug:endSlug].lower()
    startName = a.index('>') + 1
    endName = -4
    name = a[startName:endName]
    SQL = 'INSERT INTO champion (name, slug) \
           VALUES ("{0}", "{1}") \
           ON DUPLICATE KEY UPDATE name="{0}", slug="{1}"'.format(name, slug)
    cursor.execute(SQL)
    print('Updated champion ' + name)
db.commit()
db.close()
