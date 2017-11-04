<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';

// Set up database parameters
$dbVariables = array();
$lines = file("config.txt");
foreach($lines as $line) {
  $temp = explode('=', $line, 2);
  $dbVariables[$temp[0]] = trim($temp[1]);
}

$configuration = [
  'settings' =>[
    'displayErrorDetails' => true, 
    'db' => [
      'dbname' => $dbVariables["dbdb"],
      'host' => $dbVariables["dbhost"],
      'user' => $dbVariables["dbuser"],
      'pass' => $dbVariables["dbpasswd"],
    ],
  ], 
];
$container = new \Slim\Container($configuration);
$app = new \Slim\App($container);

// Set up logger
$container['logger'] = function($c) {
  $logger = new \Monolog\Logger('api_logger');
  $file_handler = new \Monolog\Handler\StreamHandler("logs/app.log");
  $logger->pushHandler($file_handler);
  return $logger;
};

// Set up PDO database connection
$container['db'] = function ($c) {
  $db = $c->get('settings')['db'];
  $pdo = new PDO("mysql:host=".$db['host'].";dbname=".$db["dbname"].";charset=utf8mb4", $db['user'], $db['pass']);
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
$app->get('/season/{season}/region/{region}/team/{team}', function (Request $request, Response $response) {
  $db = $this->get('db');
  $season = $request->getAttribute('season');
  $region = $request->getAttribute('region');
  $team = $request->getAttribute('team');
  $statement = $db->query("SELECT * FROM player,stats WHERE player.id=stats.playerId AND stats.season='".$season."' AND player.region='".$region."' AND player.team='".$team."'");
  $data = array();
  if ($statement->rowCount() > 0) {
    loadData($data, $statement);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid teams for given season, region
$app->get('/season/{season}/region/{region}/team', function (Request $request, Response $response) {
  $db = $this->get('db');
  $season = $request->getAttribute('season');
  $region = $request->getAttribute('region');
  $statement = $db->query("SELECT player.team FROM player,stats WHERE player.id=stats.playerId AND stats.season='".$season."' AND player.region='".$region."' GROUP BY player.team");
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row["team"]);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid regions for given season
$app->get('/season/{season}/region', function (Request $request, Response $response) {
  $db = $this->get('db');
  $season = $request->getAttribute('season');
  $statement = $db->query("SELECT region FROM player,stats WHERE player.id=stats.playerId AND stats.season='".$season."' GROUP BY player.region"); 
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row["region"]);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid seasons
$app->get('/season', function (Request $request, Response $response) {
  $db = $this->get('db');
  $statement = $db->query("SELECT season FROM stats GROUP BY season");
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row["season"]);
  }
  $response = $response->withJson($data);
  return $response;
});

// Select players by region
$app->get('/region/{region}', function (Request $request, Response $response) {
  $db = $this->get('db');
  $region = $request->getAttribute('region');
  $statement = $db->query("SELECT * FROM player WHERE region='".$region."'");
  $data = array();
  if ($statement->rowCount() > 0) {
    loadData($data, $statement);
  }
  $response = $response->withJson($data);
  return $response;
});

// Show valid regions
$app->get('/region', function (Request $request, Response $response) {
  $db = $this->get('db');
  $statement = $db->query("SELECT region FROM player GROUP BY region");
  $data = array();
  while ($row = $statement->fetch()) {
    array_push($data, $row["region"]);
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

