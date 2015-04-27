var app = angular.module('myApp', []);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        controller: 'PlayerController',
        templateUrl: 'views/player.html'
    }).when('/related', {
        controller: 'RelatedController',
        templateUrl: 'views/related.html'
})
    .otherwise({ redirectTo: '/' });
}]);

app.controller('ParentController', function ($scope) {
    $scope.person = { greeting: "Welcome" };
});

app.controller('ChildController', function ($scope) {
    $scope.sayHello = function () {
        $scope.person.greeting = "Hi there";
    }
});

app.controller('MyController', function ($scope) {
    $scope.person = {
        name: "Erick Pearson"
    };
    $scope.filters = {
      search: ''
    }

    $scope.roommates = [
  { name: 'Jimbo', color: 'Blue' },
  { name: 'Mr. T', color: 'Black' },
  { name: 'Timmy', color: 'Red' },
  { name: 'Mike Tyson', color: 'Green' }
    ];

  

    var updateClock = function () {
        $scope.clock = new Date().toTimeString();
    };
    var timer = setInterval(function () {
        $scope.$apply(updateClock);
    }, 1000);
    updateClock();

    $scope.counter = 0;

    $scope.add = function () {
        $scope.counter++;

    }
    $scope.subtract = function () {
        $scope.counter--;

    }

});
app.factory('audio', ['$document', function ($document) {
    var audio = $document[0].createElement('audio');
    return audio;
}]);

app.factory('player', ['audio', function (audio) {
    var player = {
        playing: false,
        current: null,
        ready: false,

        play: function (program) {
            // If we are playing, stop the current playback
            if (player.playing) player.stop();
            var url = program.audio[0].format.mp4.$text; // from the npr API
            player.current = program; // Store the current program
            audio.src = url;
            audio.play(); // Start playback of the url
            player.playing = true
        },

        stop: function () {
            if (player.playing) {
                audio.pause(); // stop playback
                // Clear the state of the player
                player.ready = player.playing = false;
                player.current = null;
            }
        }
    };
    return player;
}]);
var apiKey = "MDE4NzgzMDcxMDE0Mjg0MjM5OTBkNDdmNA001", nprUrl = 'http://api.npr.org/query?id=61&fields=relatedLink,title,byline,text,audio,image,pullQuote,all&output=JSON';;

app.factory('nprService', ['$http', function ($http) {
    var callNPR = function (apiKey) {
        return $http({
            method: 'JSONP',
            url: nprUrl + '&apiKey=' + apiKey + '&callback=JSON_CALLBACK'
        });
    }

    return {
        programs: function (apiKey) {
            return callNPR(apiKey);
        }
    };
}]);

app.controller('PlayerController', ['$scope', '$http', 'nprService', 'player', function ($scope, $http,nprService, player ) {

    $scope.player = player;
    nprService.programs(apiKey)
        .success(function (data, status) {
        $scope.programs = data.list.story;
    });  
}]);

app.controller('RelatedController', ['$scope', 'player',
  function ($scope, player) {
      $scope.player = player;

      $scope.$watch('player.current', function (program) {
          if (program) {
              $scope.related = [];
              angular.forEach(program.relatedLink, function (link) {
                  $scope.related.push({
                      link: link.link[0].$text,
                      caption: link.caption.$text
                  });
              });
          }
      });
  }]);



app.directive('nprLink', function () {
    return {
        restrict: 'EA',
        require: ['^ngModel'],
        replace: true,
        scope: {
            ngModel: '=',
            play: '&',
            stop: '&'
        },
        templateUrl: 'views/nprListItem.html',
        link: function (scope, ele, attr) {
            scope.duration = scope.ngModel.audio[0].duration.$text;
        }
    }
});



  app.factory('githubService', ['$http', function ($http) {

      var doRequest = function (username, path) {
          return $http({
              method: 'JSONP',
              url: 'https://api.github.com/users/' + username + '/' + path + '?callback=JSON_CALLBACK'
          });
      }
      return {
          events: function (username) {
              return doRequest(username, 'events');
          },
      };
  }]);

app.controller('ServiceController', ['$scope', '$timeout', 'githubService',
  function ($scope, $timeout, githubService) {
      // The same example as above, plus the $timeout service
      var timeout;
      $scope.$watch('username', function (newVal) {
          if (newVal) {
              if (timeout) $timeout.cancel(timeout);
              timeout = $timeout(function () {
                  githubService.events(newVal)
                  .success(function (data, status) {
                      $scope.events = data.data;
                  });
              }, 350);
          }
      });
  }]);