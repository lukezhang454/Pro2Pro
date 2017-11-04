# API
This is the API for the Pro2pro database. The API only supports GET requests and returns JSON.
Replace the placeholders {} to make a request:
  e.g. https://ryany.org/pro2pro/api/region/NA to retrieve players in the NA region

## Stats
### Available seasons:
  https://ryany.org/pro2pro/api/seasons

### Available regions based on season:
  https://ryany.org/pro2pro/api/seasons/{season}/regions

### Available teams based on season and region:
  https://ryany.org/pro2pro/api/seasons/{season}/regions/{region}/teams

### Select by season, region, and team
  https://ryany.org/pro2pro/api/seasons/{season}/regions/{region}/teams/{team}

## Player
### Available regions:
  https://ryany.org/pro2pro/api/regions

### Select by region:
  https://ryany.org/pro2pro/api/regions/{region}
