import $ from 'jquery';
import angular from 'angular';
import 'angular-ui-bootstrap';

var index = angular.module('index', ['ui.bootstrap']);

var baseUrl = "https://ryany.org/pro2pro/api";
var imageUrl = "https://ryany.org/pro2pro/api/images/players/";
var SEASONS = baseUrl + "/seasons";
var tableDict = { Name: "", GamesPlayed: "", Kills: "", Deaths: "", Assists: "", Kda: "", CSPerMin: "" };
var teamTableDict = {Kills: "", Deaths: "", Assists: "", Kda: ""};

index.controller('homeController', function($scope) {

    //Creates the player object with relevant stats and push it to scope variable
    function getPlayersAndSetTeamStats(response, teamName, side){
        let players = [];
        let totalKills = 0;
        let totalDeaths = 0;
        let totalAssists = 0;
        let playerImage = "";

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
                    csPerMin: Math.round(player.cs/player.minutesPlayed*100)/100,
                    playerSlug: player.playerSlug
                });

            totalKills += player.kills;
            totalDeaths += player.deaths;
            totalAssists += player.assists;
        });
        let teamKda = totalDeaths == 0? "Perfect" : Math.round((totalKills + totalAssists)/totalDeaths*100)/100;
        if(teamName){
            if(side==='left'){
                $scope.players1 = players;
                $scope.teamStats1 = {};
                $scope.teamStats1.Kills = totalKills;
                $scope.teamStats1.Deaths = totalDeaths;
                $scope.teamStats1.Assists = totalAssists;
                $scope.teamStats1.Kda = teamKda;
            }
            else if(side==='right'){
                $scope.players2 = players;
                $scope.teamStats2 = {};
                $scope.teamStats2.Kills = totalKills;
                $scope.teamStats2.Deaths = totalDeaths;
                $scope.teamStats2.Assists = totalAssists;
                $scope.teamStats2.Kda = teamKda;
            }
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
                    $scope.$apply(getPlayersAndSetTeamStats(response, selectedTeam, side));
            });
            if(selectedTeam){
                $scope.teamName1 = selectedTeam;
            }
        }
        else if(side ==='right'){
            $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${$scope.selectedRegion2}/teams/${selectedTeam}`,
                function( response ) {
                    $scope.$apply(getPlayersAndSetTeamStats(response, selectedTeam, side));
            });
            if(selectedTeam){
                $scope.teamName2 = selectedTeam;
            }
        };
    }
    
    //Event handler when a region is selected from the dropdown
    $scope.onRegionChange = function(selectedRegion, side){
        $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${selectedRegion}/teams`,
            function( response ) {
                $scope.$apply(getTeamsByRegion(response, side));
        });
    }
    
    //Sets the stats dictionary for the selected player in the dropdown and player image
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
                $scope.playerImage1 = imageUrl+selectedPlayer.playerSlug;
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
                $scope.playerImage2 = imageUrl+selectedPlayer.playerSlug;
            }
        }
    };
    
    getSeasons().then(getRegions);
    $scope.stats1 = tableDict;
    $scope.stats2 = tableDict;
    $scope.teamStats1 = teamTableDict;
    $scope.teamStats2 = teamTableDict;
    $scope.teamName1 = "Team Name";
    $scope.teamName2 = "Team Name";
})