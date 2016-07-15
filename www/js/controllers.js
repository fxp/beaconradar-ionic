angular.module('starter.controllers', ['ionic'])

  .controller('BeaconCtrl',
    // function (Beacons, Settings, $scope, $rootScope, $ionicPlatform, $cordovaBeacon, $sce, $ionicModal, $cordovaGeolocation) {
    function (Beacons, BeaconInfo, $scope, $rootScope, $sce, $ionicModal) {
      $rootScope.$on("onBeaconInfoUpdate", function (event, pluginResult) {
        $scope.beacons = pluginResult.beaconInfo;
        $scope.homepage = pluginResult.settings.homepage;
      });

      $rootScope.$on("beaconReady", function (event, pluginResult) {
        Beacons.requestAlwaysAuthorization();
        Beacons.startRangingBeaconsInRegion();
      });

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }

      $scope.mode = 'mode0';
      $ionicModal.fromTemplateUrl('templates/my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function (beacon) {
        $scope.selectedBeacon = beacon;
        $scope.modal.show();
      };

      $scope.closeModal = function () {
        // $scope.modal.hide();
        var ifr = document.getElementById("iframeId");
        // ifr.contentWindow.history.back();
        ifr.contentWindow.history.go(-1); // back
        $scope.$apply();
      };

      $scope.beacons = [];
      $scope.doRefresh = function () {
        var size = $scope.beacons.length;
        if (size == 0) {
          $scope.mode = 'mode1';
        } else if (size == 1) {
          $scope.mode = 'mode2';
          $scope.title = $scope.beacons[0].info.title;
          $scope.pageUrl = $scope.beacons[0].info.url;
        } else if (size > 1) {
          $scope.mode = 'mode3';
          $scope.lastestBeacons = [];
          for (var i in $scope.beacons) {
            $scope.lastestBeacons.push({
              uuid: $scope.beacons[i].uuid,
              major: $scope.beacons[i].major,
              minor: $scope.beacons[i].minor,
              rssi: $scope.beacons[i].rssi,
              accuracy: $scope.beacons[i].accuracy,
              info: $scope.beacons[i].info
            });
          }
          $scope.$apply();
        }
        // $scope.needRefresh = false;
        $scope.$broadcast('scroll.refreshComplete');
      }
      setTimeout(function () {
        $scope.doRefresh();
      }, 5000);
    }
  )

  .controller('HomepageCtrl', function (Beacons, Settings, Config, $rootScope, $scope, $sce, $interval, $timeout) {
    $scope.readyToShow = false;
    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    }

    $interval(function () {
      if (Config.settings.homepage) {
        $scope.homepage = Config.settings.homepage;
      }
    }, 1000);

    window.uploadDone = function () {
      $scope.readyToShow = true;
      console.log('uploadDone');
    }
  });
