<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';

// Set up database parameters
$dbVariables = array();
$lines = file('config.txt');
foreach($lines as $line) {
  $temp = explode('=', $line, 2);
  $dbVariables[$temp[0]] = trim($temp[1]);
}

$configuration = [
  'settings' =>[
    'displayErrorDetails' => true, 
    'db' => [
      'dbname' => $dbVariables['dbdb'],
      'host' => $dbVariables['dbhost'],
      'user' => $dbVariables['dbuser'],
      'pass' => $dbVariables['dbpasswd'],
    ],
  ], 
];
$container = new \Slim\Container($configuration);
$app = new \Slim\App($container);

// Enable lazy CORS from: https://www.slimframework.com/docs/cookbook/enable-cors.html
$app->options('/{routes:.+}', function ($request, $response, $args) {
      return $response;
      });

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET');
});


// Set up logger
$container['logger'] = function($c) {
  $logger = new \Monolog\Logger('api_logger');
  $file_handler = new \Monolog\Handler\StreamHandler('logs/app.log');
  $logger->pushHandler($file_handler);
  return $logger;
};

// Set up PDO database connection
$container['db'] = function ($c) {
  $db = $c->get('settings')['db'];
  $pdo = new PDO("mysql:host=".$db['host'].";dbname=".$db['dbname'].";charset=utf8mb4", $db['user'], $db['pass']);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  return $pdo;
};

// Log all API requests
$app->add(function (Request $request, Response $response, callable $next) {
  $uri = $request->getUri();
  $path = $uri->getPath();
  $this->logger->addInfo("API path requested: ".$path);
  return $next($request, $response);
});

// From slimframework https://www.slimframework.com/docs/cookbook/route-patterns.html
// Redirects trailing slashes to the non trailing slash function
$app->add(function (Request $request, Response $response, callable $next) {
  $uri = $request->getUri();
  $path = $uri->getPath();
  if ($path != '/' && substr($path, -1) == '/') {
    $uri = $uri->withPath(substr($path, 0, -1));

    if($request->getMethod() == 'GET') {
        return $response->withRedirect((string)$uri, 301);
    }
    else {
        return $next($request->withUri($uri), $response);
    }
  }

  return $next($request, $response);
});

// Select stats by season, region, team
$app->get('/seasons/{season}/regions/{region}/teams/{team}', function (Request $request, Response $response) {
  $db = $this->get('db');
  $season = $request->getAttribute('season');
  $region = $request->getAttribute('region');
  $team = $request->getAttribute('team');
  $statement = $db->prepare("SELECT * FROM player,stats WHERE player.id=stats.playerId AND stats.season = :season AND player.region = :region AND player.team = :team");
  $statement->bindParam(':season', $season, PDO::PARAM_STR, 25);
  $statement->bindParam(':region', $region, PDO::PARAM_STR, 25);
  $statement->bindParam(':team', $team, PDO::PARAM_STR, 3);
  $statement->execute();
  $data = array();
  if ($statement->rowCount() > 0) {
    loadData($data, $statement);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid teams for given season, region
$app->get('/seasons/{season}/regions/{region}/teams', function (Request $request, Response $response) {
  $db = $this->get('db');
  $season = $request->getAttribute('season');
  $region = $request->getAttribute('region');
  $statement = $db->prepare("SELECT player.team FROM player,stats WHERE player.id=stats.playerId AND stats.season = :season AND player.region = :region GROUP BY player.team");
  $statement->bindParam(':season', $season, PDO::PARAM_STR, 25);
  $statement->bindParam(':region', $region, PDO::PARAM_STR, 25);
  $statement->execute();
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row['team']);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid regions for given season
$app->get('/seasons/{season}/regions', function (Request $request, Response $response) {
  $db = $this->get('db');
  $season = $request->getAttribute('season');
  $statement = $db->prepare("SELECT region FROM player,stats WHERE player.id=stats.playerId AND stats.season = :season GROUP BY player.region"); 
  $statement->bindParam(':season', $season, PDO::PARAM_STR, 25);
  $statement->execute();
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row['region']);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid seasons
$app->get('/seasons', function (Request $request, Response $response) {
  $db = $this->get('db');
  $statement = $db->prepare("SELECT season FROM stats GROUP BY season");
  $statement->execute();
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row['season']);
  }
  $response = $response->withJson($data);
  return $response;
});

// Select players by region
$app->get('/regions/{region}', function (Request $request, Response $response) {
  $db = $this->get('db');
  $region = $request->getAttribute('region');
  $statement = $db->prepare("SELECT * FROM player WHERE region = :region");
  $statement->bindParam(':region', $region, PDO::PARAM_STR, 25);
  $statement->execute();
  $data = array();
  if ($statement->rowCount() > 0) {
    loadData($data, $statement);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid regions
$app->get('/regions', function (Request $request, Response $response) {
  $db = $this->get('db');
  $statement = $db->prepare("SELECT region FROM player GROUP BY region");
  $statement->execute();
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row['region']);
  }
  $response = $response->withJson($data);
  return $response;
});

$app->run();

function loadData(&$data, $statement) {
  while ($row = $statement->fetch()) {
    $rowData = array();
    foreach(array_keys($row) as $key) {
      $rowData[$key] = $row[$key];
    }
    array_push($data, $rowData);
  }
}

?>

