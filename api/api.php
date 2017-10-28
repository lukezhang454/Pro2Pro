<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';

//set up database parameters
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

//set up logger
$container['logger'] = function($c) {
  $logger = new \Monolog\Logger('api_logger');
  $file_handler = new \Monolog\Handler\StreamHandler("logs/app.log");
  $logger->pushHandler($file_handler);
  return $logger;
};

//set up PDO database connection
$container['db'] = function ($c) {
  $db = $c->get('settings')['db'];
  $pdo = new PDO("mysql:host=".$db['host'].";dbname=".$db["dbname"].";charset=utf8mb4", $db['user'], $db['pass']);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  return $pdo;
};

$app->get('/region/{region}', function (Request $request, Response $response) {
  $db = $this->get('db');
  $statement = $db->query("SELECT region FROM player GROUP BY region");
  $validRegions = array();
  while ($row = $statement->fetch()) {
    array_push($validRegions, strtolower($row["region"]));
  }
  $region = strtolower($request->getAttribute('region'));
  if (is_null($region) || !in_array($region, $validRegions)) {
    $response->getBody()->write("Invalid Region");
    return $response;
  }
  $statement = $db->query("SELECT * FROM player WHERE region='".$region."'");
  $data = array();
  while ($row = $statement->fetch()) {
    $rowData = array();
    foreach(array_keys($row) as $key) {
      $rowData[$key] = $row[$key];
    }
    array_push($data, $rowData);
  }

  $response = $response->withJson($data);
  return $response;
});

$app->get('/region', function (Request $request, Response $response) {
  $db = $this->get('db');
  $statement = $db->query("SELECT region FROM player GROUP BY region");
  $validRegions = array();
  while ($row = $statement->fetch()) {
    array_push($validRegions, $row["region"]);
  }
  $response = $response->withJson($validRegions);
  return $response;
});
$app->run();
?>

