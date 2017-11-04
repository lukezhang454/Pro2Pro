# API
This is the API for the Pro2pro database. The API only supports GET requests and returns JSON.
Replace the placeholders {} to make a request:
  e.g. https://ryany.org/pro2pro/api/region/NA to retrieve players in the NA region

## Stats
### Available seasons:
  https://ryany.org/pro2pro/api/season

### Available regions based on season:
  https://ryany.org/pro2pro/api/season/{season}/region

### Available teams based on season and region:
  https://ryany.org/pro2pro/api/season/{season}/region/{region}/team

### Select by season, region, and team
  https://ryany.org/pro2pro/api/season/{season}/region/{region}/team/{team}

## Player
### Available regions:
  https://ryany.org/pro2pro/api/region

### Select by region:
  https://ryany.org/pro2pro/api/region/{region}
