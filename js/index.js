var index = angular.module('index', []);

var url = "http://api.lolesports.com/api/v2/tournamentPlayerStats?groupName=regular_season&tournamentId=9c67f1fe-34d8-445b-a93f-d93e0ecd0056";
var teams = ["TSM", "C9", "CLG", "DIG", "IMT", "FOX", "FLY", "P1", "NV", "TL"]

index.controller('ctrl1', function($scope) {
	//Shouldn't have to make a request each time a team is selected
	function getPlayersByTeam(response, teamId, side){
		let players = [];
		response.stats.forEach(function(player){
			if(player.team === teamId) players.push({name:player.name, kda: player.kda, csPerMin: player.csPerMin});
		});
		if(side==='left'){
			$scope.players1 = players;
		}
		else if(side==='right'){
			$scope.players2 = players;
		}
	}
	
	$scope.onTeamChange = function(selectedTeam, side){
		$.get(url, function( response ) {
			if(side === 'left'){
				$scope.$apply(getPlayersByTeam(response, $scope.selectedTeam1,side));
			}
			else if(side ==='right'){
				$scope.$apply(getPlayersByTeam(response, $scope.selectedTeam2,side));
			}
		});
	}
	
	$scope.setPlayer = function(selectedPlayer, side){
		if(side === 'left'){
			$scope.name1 = selectedPlayer.name;
			$scope.kda1 = selectedPlayer.kda;
			$scope.csPerMin1 = selectedPlayer.csPerMin;
		}
		else if(side === 'right'){
			$scope.name2 = selectedPlayer.name;
			$scope.kda2 = selectedPlayer.kda;
			$scope.csPerMin2 = selectedPlayer.csPerMin;
		}
	};
	
	$scope.teams = teams;
})