# API
This is the API for the Pro2pro database. The API only supports GET requests and returns JSON.  
Contact Ryan if there are any questions or endpoint requests.  
Replace the placeholders {} with the appropriate data to make a request.

## Stats
### Available seasons:
  `https://ryany.org/pro2pro/api/seasons`

### Available regions based on season:
  `https://ryany.org/pro2pro/api/seasons/{season}/regions`

### Available teams based on season and region:
  `https://ryany.org/pro2pro/api/seasons/{season}/regions/{region}/teams`

### Select player stats by season, region, and team
  `https://ryany.org/pro2pro/api/seasons/{season}/regions/{region}/teams/{team}`

### Select player's champion stats by season, region, team, and player
  `https://ryany.org/pro2pro/api/seasons/{season}/regions/{region}/teams/{team}/players/{player}/champions`

## Images
### Select player images
  `https://ryany.org/pro2pro/api/images/players/{playerSlug}`

### Select team images
  `https://ryany.org/pro2pro/api/images/teams/{teamSlug}`

### Select champion icon images
  `https://ryany.org/pro2pro/api/images/champions/{championSlug}/icon`

### Select champion backdrop images
  `https://ryany.org/pro2pro/api/images/champions/{championSlug}/backdrop`
