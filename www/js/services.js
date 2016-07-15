angular.module('starter.services', ['ionic'])

  .factory('Beacons', function ($rootScope, $cordovaBeacon, $cordovaGeolocation, $ionicPlatform, $ionicPopup) {
    var IS_DEV_INBROWSER = (ionic.Platform.platform() && ionic.Platform.platforms && ionic.Platform.platforms[0] == "browser");
    var service = {
      ready: false
    };
    var brIdentifier = 'estimote';
    // FOR ESTIMOTE
    // var brUuid = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
    // FOR SENSORO
    var brUuid = '23a01af0-232a-4518-9c0e-323fb773f5ef';
    var brMajor = null;
    var brMinor = null;
    var brNotifyEntryStateOnDisplay = true;

    $ionicPlatform.ready(function () {

      $cordovaBeacon.isBluetoothEnabled()
        .then(function (ret) {
          if (!ret) {
            var alertPopup = $ionicPopup.alert({
              title: '请打开蓝牙获取场景信息'
            });

            alertPopup.then(function (res) {
              console.log('Thank you for not eating my delicious ice cream cone');
              bluetoothSerial.showBluetoothSettings();
            });

            //
            // $cordovaBeacon.enableBluetooth()
            //   .then(function(){
            //     alert("已经为您打开了蓝牙");
            //   })
          }
        })


      service.requestAlwaysAuthorization = function () {
        if (!IS_DEV_INBROWSER) {
          $cordovaBeacon.requestAlwaysAuthorization();
        }
      };

      service.requestWhenInUseAuthorization = function () {
        if (!IS_DEV_INBROWSER) {
          $cordovaBeacon.requestWhenInUseAuthorization();
        }
      };

      var FAKE_BEACONS = [
        {uuid: "23a01af0-232a", major: "1", minor: "A", accuracy: 0.4},
        {uuid: "23a01af0-232a", major: "2", minor: "B", accuracy: 0.5},
        {uuid: "23a01af0-232a", major: "3", minor: "C", accuracy: 0.6},
        {uuid: "23a01af0-232a", major: "4", minor: "D", accuracy: 0.7},
        {uuid: "23a01af0-232a", major: "5", minor: "A", accuracy: 0.8},
        {uuid: "23a01af0-232a", major: "6", minor: "F", accuracy: 0.9},
      ]

      service.startRangingBeaconsInRegion = function () {
        if (!IS_DEV_INBROWSER) {
          $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion(
            brIdentifier, brUuid, brMajor, brMinor, brNotifyEntryStateOnDisplay
          ));
        } else {
          setInterval(function () {
            var fake_beacons = [];
            for (var i = 0; i < FAKE_BEACONS.length; i++) {
              if (Math.random() > 0.3) {
                fake_beacons.push(FAKE_BEACONS[i]);
              }
            }
            $rootScope.$emit('$cordovaBeacon:didRangeBeaconsInRegion', {beacons: fake_beacons});
          }, 1000);
        }
      };

      service.stopMonitoringForRegion = function () {
        $cordovaBeacon.stopMonitoringForRegion($cordovaBeacon.createBeaconRegion(
          brIdentifier, brUuid, brMajor, brMinor, brNotifyEntryStateOnDisplay
        ));
      };

      service.stopRangingBeaconsInRegion = function () {
        $cordovaBeacon.stopRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion(
          brIdentifier, brUuid, brMajor, brMinor, brNotifyEntryStateOnDisplay
        ));
      };
      service.ready = true;
      setTimeout(function () {
        $rootScope.$emit('beaconReady', {beacons: [{uuid: "s"}, {}]});
      }, 0);
    });

    return service;
  })
  .factory('Settings', function ($rootScope, Config) {
    var settings = {
      map: {},
      settings: {}
    };
    var ref = new Wilddog("https://beaconlist.wilddogio.com/");
    ref.child('beacons').on('value', function (datasnapshot, error) {
      if (error == null) {
        settings.map = datasnapshot.val();
        $rootScope.$emit('$cordovaBeacon:beacon_mapping', settings.map);
        Config.map = settings.map;
      }
    });
    ref.child('settings').on('value', function (datasnapshot, error) {
      if (error == null) {
        settings.settings = datasnapshot.val();
        console.log('setting updated');
        $rootScope.$emit('$cordovaBeacon:settings', settings.settings);
        Config.settings = settings.settings;
      }
    });
    console.log('loaded');
    return settings;
  })
  .factory('BeaconInfo', function ($rootScope, Settings, $cordovaBeacon, $cordovaGeolocation, $ionicPlatform) {
    var service = {
      mapping: {},
      settings: {},
      nowBeacons: [],
      beaconInfo: []
    };

    $rootScope.getBeaconId = function (beacon) {
      return beacon.uuid + ',' + beacon.major + ',' + beacon.minor;
    }
    $rootScope.$on("$cordovaBeacon:beacon_mapping", function (event, pluginResult) {
      service.mapping = pluginResult;
    });
    $rootScope.$on("$cordovaBeacon:settings", function (event, pluginResult) {
      service.settings = pluginResult;
    });

    function compareDistance(a, b) {
      return a.accuracy - b.accuracy;
    }

    var cacheBeacons = {};
    var lastBeaconUpdateAt = new Date();
    $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function (event, pluginResult) {
      var now = new Date();
      service.nowBeacons = pluginResult.beacons;
      for (var i in service.nowBeacons) {
        var beacon = service.nowBeacons[i];
        cacheBeacons[$rootScope.getBeaconId(beacon)] = beacon;
      }
      if ((now - lastBeaconUpdateAt) > 3000) {
        service.beaconInfo = [];
        for (var i in cacheBeacons) {
          if (service.mapping[i]) {
            cacheBeacons[i].info = service.mapping[i];
            service.beaconInfo.push(cacheBeacons[i]);
          }
        }
        $rootScope.$emit('onBeaconInfoUpdate', {
          beaconInfo: service.beaconInfo.sort(compareDistance),
          settings: service.settings
        });
        lastBeaconUpdateAt = now;
        cacheBeacons = {};
      }
    });
    return {};
  }).constant('Config', {});
