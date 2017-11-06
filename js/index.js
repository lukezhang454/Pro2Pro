import $ from 'jquery';
import angular from 'angular';
import 'angular-ui-bootstrap';

var index = angular.module('index', ['ui.bootstrap']);

var baseUrl = "https://ryany.org/pro2pro/api";
var SEASONS = baseUrl + "/seasons";
var tableDict = { Name: "", GamesPlayed: "", Kills: "", Deaths: "", Assists: "", Kda: "", CSPerMin: "" };

index.controller('homeController', function($scope) {

    //Creates the player object with relevant stats and push it to scope variable
    function getPlayersByTeam(response, side){
        let players = [];
        response.forEach(function(player){
            //for kda and csPerMin we multiply then round and then divide by 100
            //so we only show up to 2 decimal places
            players.push(
                {
                    name:player.name, 
                    gamesPlayed: player.gamesPlayed,
                    kills: player.kills, 
                    deaths: player.deaths,
                    assists: player.assists,
                    kda: player.deaths == 0? "Perfect" : Math.round((player.kills + player.assists)/player.deaths*100)/100,
                    csPerMin: Math.round(player.cs/player.minutesPlayed*100)/100
                });
        });
        if(side==='left'){
            $scope.players1 = players;
        }
        else if(side==='right'){
            $scope.players2 = players;
        }
    }

    //Sets the scope variable for teams within a region
    function getTeamsByRegion(response, side){
        if(side==='left'){
            $scope.teams1 = response;
        }
        else if(side==='right'){
            $scope.teams2 = response;
        }
    }
    
    //Gets all of the seasons
    function getSeasons(){
        return new Promise ((resolve, reject) =>{
            let seasons = [];
            $.get(SEASONS, function(response){
                response.forEach(function(season){
                    seasons.push(season);
                });
                $scope.seasons = seasons;
                $scope.$apply();
                resolve($scope.seasons[0]);
            });
        });
    }
    
    //Gets all of the available regions given a season
    function getRegions(season){
        let regions = [];
        $.get(baseUrl + `/seasons/${season}/regions`, function(response){
            response.forEach(function(region){
                regions.push(region);
            });
            $scope.regions = regions;
            $scope.$apply();
        });
    }
    
    //Event handler when a team is selected from the dropdown
    $scope.onTeamChange = function(selectedTeam, side){
        if(side === 'left'){
            $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${$scope.selectedRegion1}/teams/${selectedTeam}`,
                function( response ) {
                    $scope.$apply(getPlayersByTeam(response, side));
            });
        }
        else if(side ==='right'){
            $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${$scope.selectedRegion2}/teams/${selectedTeam}`,
                function( response ) {
                    $scope.$apply(getPlayersByTeam(response, side));
            });
        };
    }
    
    //Event handler when a region is selected from the dropdown
    $scope.onRegionChange = function(selectedRegion, side){
        $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${selectedRegion}/teams`,
            function( response ) {
                $scope.$apply(getTeamsByRegion(response, side));
        });
    }
    
    //Sets the stats dictionary for the selected player in the dropdown
    $scope.setPlayer = function(selectedPlayer, side){
        if(selectedPlayer){
            if(side === 'left'){
                $scope.stats1 = {};
                $scope.stats1.Name = selectedPlayer.name;
                $scope.stats1.GamesPlayed = selectedPlayer.gamesPlayed;
                $scope.stats1.Kills = selectedPlayer.kills;
                $scope.stats1.Deaths = selectedPlayer.deaths;
                $scope.stats1.Assists = selectedPlayer.assists;
                $scope.stats1.Kda = selectedPlayer.kda;
                $scope.stats1.CSPerMin = selectedPlayer.csPerMin;
            }
            else if(side === 'right'){
                $scope.stats2 = {};
                $scope.stats2.Name = selectedPlayer.name;
                $scope.stats2.GamesPlayed = selectedPlayer.gamesPlayed;
                $scope.stats2.Kills = selectedPlayer.kills;
                $scope.stats2.Deaths = selectedPlayer.deaths;
                $scope.stats2.Assists = selectedPlayer.assists;
                $scope.stats2.Kda = selectedPlayer.kda;
                $scope.stats2.CSPerMin = selectedPlayer.csPerMin;
            }
        }
    };
    
    getSeasons().then(getRegions);
    $scope.stats1 = tableDict;
    $scope.stats2 = tableDict;
})