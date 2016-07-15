// Ionic Starter App

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      var lastBackAt;
      $ionicPlatform.registerBackButtonAction(function (event) {
        var now = new Date();
        if (lastBackAt && (now - lastBackAt < 1000)) {
          event.preventDefault();
          navigator.app.exitApp();
        }
        lastBackAt = now;
      }, 100);
    });

  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      .state('tab.beacons', {
        url: '/beacons',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'BeaconCtrl'
          }
        }
      })
      .state('tab.homepage', {
        url: '/homepage',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'HomepageCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/tab/beacons');

  })

  .config(['$ionicConfigProvider', function ($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top

  }]);


