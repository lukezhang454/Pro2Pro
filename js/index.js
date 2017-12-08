import $ from 'jquery';
import angular from 'angular';
import 'angular-ui-bootstrap';
import 'angular-animate'

var index = angular.module('index', ['ui.bootstrap', 'ngAnimate']);

var baseUrl = "https://ryany.org/pro2pro/api";
var imageUrl = baseUrl + "/images/players/";
var teamImageUrl = baseUrl + "/images/teams/";
var SEASONS = baseUrl + "/seasons";
var championUrl = baseUrl + "/images/champions/"
var tableDict = { Name: "", GamesPlayed: "", Kills: "", Deaths: "", Assists: "", Kda: "", CSPerMin: "" };
var teamTableDict = {Kills: "", Deaths: "", Assists: "", Kda: ""};

index.directive('onload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                $("#"+this.id).fadeIn();
            });
            element.bind('error', function(){
            });
        }
    };
});

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
                //clear any current stats and images
                $scope.stats1 = tableDict;
                $scope.players1 = players;
                $('.image-left').children(".player-image").attr('src', '');
                $('.image-left').children(".player-image").fadeOut();
                $scope.championStats1 = undefined;

                $scope.teamStats1 = {};
                $scope.teamStats1.Kills = totalKills;
                $scope.teamStats1.Deaths = totalDeaths;
                $scope.teamStats1.Assists = totalAssists;
                $scope.teamStats1.Kda = teamKda;
                $scope.teamImage1 = teamImageUrl+response[0].teamSlug;
                $('.image-left').children(".team-image").fadeOut();
            }
            else if(side==='right'){
                //clear any current stats and images
                $scope.stats2 = tableDict;
                $scope.players2 = players;
                $('.image-right').children(".player-image").attr('src', '');
                $('.image-right').children(".player-image").fadeOut();
                $scope.championStats2 = undefined;

                $scope.teamStats2 = {};
                $scope.teamStats2.Kills = totalKills;
                $scope.teamStats2.Deaths = totalDeaths;
                $scope.teamStats2.Assists = totalAssists;
                $scope.teamStats2.Kda = teamKda;
                $scope.teamImage2 = teamImageUrl+response[0].teamSlug;
                $('.image-right').children(".team-image").fadeOut();
            }
        }
    }

    //Sets the scope variable for teams within a region
    function getTeamsByRegion(response, side){
        if(side==='left'){
            //clear existing stats and images
            $scope.stats1 = tableDict;
            $scope.teamStats1 = teamTableDict;
            $scope.teamName1 = "Team Name"
            $('.image-left').children(".player-image").attr('src', '');
            $('.image-left').children(".team-image").attr('src', '');
            //workaround to remove broken image border because width and height
            //is explicitly set in style
            $('.image-left').children(".team-image").hide();
            $('.image-left').children(".player-image").hide();
            $scope.championStats1 = undefined;

            $scope.teams1 = response;
        }
        else if(side==='right'){
            //clear existing stats and images
            $scope.stats2 = tableDict;
            $scope.teamStats2 = teamTableDict;
            $scope.teamName2 = "Team Name"
            $('.image-right').children(".player-image").attr('src', '');
            $('.image-right').children(".team-image").attr('src', '');
            $('.image-right').children(".team-image").hide();
            $('.image-right').children(".player-image").hide();
            $scope.championStats2 = undefined;

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

    function setPlayerChampionStats(response, selectedPlayer, side){
        let championStats = [];
        response.forEach(function(champion){
            championStats.push({
                champion: champion.champion,
                championSlug: champion.championSlug,
                gamesPlayed: champion.gamesPlayed,
                wins: champion.wins,
                losses: champion.losses,
                championIcon: championUrl + champion.championSlug + "/icon"
            })
        })

        championStats.sort(function(a,b){
            return b.gamesPlayed - a.gamesPlayed;
        })
        
        if(side ==='left'){
            $scope.championStats1 = championStats;
        }
        if(side ==='right'){
            $scope.championStats2 = championStats;
        }
    }
    
    //Sets the stats dictionary for the selected player in the dropdown and player image
    $scope.setPlayer = function(selectedPlayer, side){
    
        let teamName = "";
        let region = "";
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
                $('.image-left').children(".player-image").fadeOut();
                region = $scope.selectedRegion1;
                teamName = $scope.teamName1;
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
                $('.image-right').children(".player-image").fadeOut();
                region = $scope.selectedRegion2;
                teamName = $scope.teamName2;
            }
        }

        $.get(baseUrl + `/seasons/${$scope.$ctrl.selectedSeason}/regions/${region}/teams/${teamName}/players/${selectedPlayer.playerSlug}/champions`,
            function( response ) {
                $scope.$apply(setPlayerChampionStats(response, selectedPlayer, side));
        });
    };
    
    getSeasons().then(getRegions);
    $scope.stats1 = tableDict;
    $scope.stats2 = tableDict;
    $scope.teamStats1 = teamTableDict;
    $scope.teamStats2 = teamTableDict;
    $scope.teamName1 = "Team Name";
    $scope.teamName2 = "Team Name";
    $('.image-left').children(".team-image").hide();
    $('.image-right').children(".team-image").hide();
    $('.image-left').children(".player-image").hide();
    $('.image-right').children(".player-image").hide();
})