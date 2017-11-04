import $ from 'jquery';
import angular from 'angular';
import 'angular-ui-bootstrap';

var index = angular.module('index', ['ui.bootstrap']);

var baseUrl = "https://ryany.org/pro2pro/api";
var SEASONS = baseUrl + "/seasons";
var tableDict = { Name: "", GamesPlayed: "", Kills: "", Deaths: "", Assists: "" };

index.controller('homeController', function($scope) {
    //Shouldn't have to make a request each time a team is selected
    function getPlayersByTeam(response, side){
        let players = [];
        response.forEach(function(player){
            players.push(
                {
                    name:player.name, 
                    gamesPlayed: player.gamesPlayed,
                    kills: player.kills, 
                    deaths: player.deaths,
                    assists: player.assists
                });
        });
        if(side==='left'){
            $scope.players1 = players;
        }
        else if(side==='right'){
            $scope.players2 = players;
        }
    }

    function getTeamsByRegion(response, side){
        if(side==='left'){
            $scope.teams1 = response;
        }
        else if(side==='right'){
            $scope.teams2 = response;
        }
    }
    
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
    
    $scope.onRegionChange = function(selectedRegion, side){
        $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${selectedRegion}/teams`,
            function( response ) {
                if(side === 'left'){
                    $scope.$apply(getTeamsByRegion(response, side));
                }
                else if(side ==='right'){
                    $scope.$apply(getTeamsByRegion(response,side));
                }
        });
    }
    
    $scope.setPlayer = function(selectedPlayer, side){
        if(side === 'left'){
            $scope.stats1 = {};
            $scope.stats1.Name = selectedPlayer.name;
            $scope.stats1.GamesPlayed = selectedPlayer.gamesPlayed;
            $scope.stats1.Kills = selectedPlayer.kills;
            $scope.stats1.Deaths = selectedPlayer.deaths;
            $scope.stats1.Assists = selectedPlayer.assists;
        }
        else if(side === 'right'){
            $scope.stats2 = {};
            $scope.stats2.Name = selectedPlayer.name;
            $scope.stats2.GamesPlayed = selectedPlayer.gamesPlayed;
            $scope.stats2.Kills = selectedPlayer.kills;
            $scope.stats2.Deaths = selectedPlayer.deaths;
            $scope.stats2.Assists = selectedPlayer.assists;
        }
    };
    
    getSeasons().then(getRegions);
    $scope.stats1 = tableDict;
    $scope.stats2 = tableDict;
})