'use strict';

angular.module('openAim')
  .controller('TestMapCtrl', function ($filter, $uibModal, testRes, analyzerRes, testMapRes, Constant) {

    var vm = this;

    angular.extend(vm, {
       // init data
      name: 'TestMapCtrl',
      disabledAddBtn: false,
      testMaps: [],
      analyzers:[],
      tests: [],
      newTestMap: {},
      search: '',

      // pagination config
      recordPerPage: Constant.record_per_page.TEST_MAP,
      currentPage: 1,
      totalItems: 0,
      /**
        load data: get test-map with pagination
      */
      getTestMaps: function(){
        // send request with the filter conditions and get return data
        return testMapRes.load({
          page: vm.currentPage,
          limit: vm.recordPerPage,
          search: (vm.search === '') ? null : vm.search
        }).$promise.then(function(data) {
          console.log(Constant.msg.test.MSG_LOAD_DATA_SUCCESS + new Date());
          vm.testMaps = data.analyzerTestMapResult;
          vm.testMaps.reverse();
          vm.totalItems = data.totalAnalyzerTestMapResult;
          return data;
        }, function() {
          console.log(Constant.msg.test.MSG_LOAD_DATA_SUCCESS + new Date());
          return false;
        });
      },

      /**
        get all analyzers
      */
      getAnalyzers: function(){
        return analyzerRes.query().$promise.then(function(data) {
          console.log(Constant.msg.analyzer.MSG_LOAD_DATA_SUCCESS + new Date());
          vm.analyzers = data;
          return data;
        }, function() {
          console.log(Constant.msg.analyzer.MSG_LOAD_DATA_UNSUCCESS + new Date());
          return false;
        });
      },

      /**
        get all tests
      */
      getTests: function(){
        return testRes.load({
          getLatest: false,
          limit: 0
        }).$promise.then(function(data) {
          console.log(Constant.msg.testMap.MSG_LOAD_DATA_SUCCESS + new Date());
          vm.tests = data.testResult;
          return data;
        }, function() {
          console.log(Constant.msg.testMap.MSG_LOAD_DATA_SUCCESS + new Date());
          return false;
        });
      },
      /**
       * Check 2 testmaps are equal
       * @return {Boolean} true: equal, false: not equal
       */
      isTestMapsEqual: function (testMap1, testMap2) {
        if (testMap1.analyzer._id === testMap2.analyzer._id &&
          testMap1.test._id === testMap2.test._id &&
          testMap1.testCode === testMap2.testCode) {
          return true;
        }
        return false;
      },
      /**
       * Check testmap is duplicate
       * @param  testMap
       * @return boolean true: duplicate, false: not duplicate
       */
      checkDuplicate: function (testMap) {
        var checker = 0;
        vm.testMaps.forEach(function (testmap) {
          if (vm.isTestMapsEqual(testmap, testMap)) {
            checker ++;
          }
        });
        if (checker === 2) {
          return true;
        }
        return false;
      },
      /**
        save a test map
        @param testMap
      */
      onSave: function(testMap) {
        // Enable Add button
        vm.disabledAddBtn = false;
        // validate input data
        if (testMap.analyzer === null || testMap.test === null || testMap.testCode === undefined || testMap.testCode === '') {
          var alertErrorModal = $uibModal.open({
            templateUrl: 'alert-error-modal',
            controller: 'AlertErrorModalTestMapCtrl',
            size: 'sm',
            animation: true,
            // send data to AlertErrorModalTestMapCtrl
            resolve: {
              errorMessage: function() {
                var msg = Constant.msg.testMap.MSG_SAVE_ERR;
                return msg;
              }
            }
          });
          // open error message modal
          alertErrorModal.result.then(function() {
            vm.getTestMaps();
          });
          return false;
        }
        // check duplicate testmap
        if (vm.checkDuplicate(testMap)) {
          var alertErrorModal = $uibModal.open({
              templateUrl: 'alert-error-modal',
              controller: 'AlertErrorModalTestMapCtrl',
              size: 'sm',
              animation: true,
              // send data to AlertErrorModalTestMapCtrl
              resolve: {
                errorMessage: function() {
                  var msg = Constant.msg.testMap.MSG_DUPLICATE;
                  return msg;
                }
              }
            });
          // open error message modal
          alertErrorModal.result.then(function() {
            vm.getTestMaps();
          });
          return false;
        }

        if (!testMap.isNew) {
          // update a test map
          testMapRes.update({ id: testMap._id }, testMap)
          .$promise.then(function() {
            console.log(Constant.msg.testMap.MSG_UPDATE_DATA_SUCCESS + new Date());
          }, function(response) {
            var alertErrorModal = $uibModal.open({
              templateUrl: 'alert-error-modal',
              controller: 'AlertErrorModalTestMapCtrl',
              size: 'sm',
              animation: true,
              // send data to AlertErrorModalTestMapCtrl
              resolve: {
                errorMessage: function() {
                  var responseData = response.data;
                  var msg = (responseData.errors.order) ? responseData.errors.order.message : responseData.message;
                  return msg;
                }
              }
            });
            // open error message modal
            alertErrorModal.result.then(function() {
              vm.getTestMaps();
            });
            console.log(Constant.msg.testMap.MSG_UPDATE_DATA_UNSUCCESS + new Date());
          });
        } else {
          // add new test map
          testMap.isNew = false;
          testMapRes.save(testMap)
          .$promise.then(function() {
            vm.getTestMaps();
            console.log(Constant.msg.testMap.MSG_CREATE_DATA_SUCCESS + new Date());
          }, function(response) {
            var alertErrorModal = $uibModal.open({
              templateUrl: 'alert-error-modal',
              controller: 'AlertErrorModalTestMapCtrl',
              animation: true,
              size: 'sm',
              // send data to AlertErrorModalTestMapCtrl
              resolve: {
                errorMessage: function() {
                  var responseData = response.data;
                  var msg = (responseData.errors.order) ? responseData.errors.order.message : responseData.message;
                  return msg;
                }
              }
            });
            // open error message modal
            alertErrorModal.result.then(function() {
              vm.getTestMaps();
            });
            console.log(Constant.msg.testMap.MSG_CREATE_DATA_UNSUCCESS + new Date());
          });
        }
      },

      /**
        search test map
      */
      onSearch: function() {
        vm.setPage(1);
        vm.getTestMaps();
      },

      /**
        set page
        @param pageNo
      */
      setPage: function (pageNo) {
        return vm.currentPage = pageNo;
      },

      /**
        change page
      */
      pageChanged: function() {
        vm.getTestMaps();
      },

      /**
        add test map record
      */
      addRow: function() {
        // Disabled add button
        vm.disabledAddBtn = true;
        vm.newTestMap = {
          analyzer: null,
          testCode: '',
          test: null,
          testID: '',
          isNew: true
        };
        vm.testMaps.unshift(vm.newTestMap);
      },

      /**
        cancel adding
        @param testMap
      */
      onCancelSaving: function(testMap) {
        // Enable add button
        vm.disabledAddBtn = false;
        if(testMap.isNew) {
          var index = vm.testMaps.indexOf(testMap);
          vm.testMaps.splice(index, 1);
        }
      },

      /**
        show analyzer by name on grid
        @param analyzer
      */
      showAnalyzer: function(analyzer) {
        var selected = [];
        if(analyzer) {
          selected = $filter('filter')(vm.analyzers, {_id: analyzer._id});
        }
        return selected.length ? selected[0].name : Constant.msg.testMap.MSG_NOT_SET;
      },

      /**
        delete record with confirmation
        @param testMap
      */
      onDelete: function(testMap) {
        var confirmDelete = $uibModal.open({
          templateUrl: 'confirm-delete',
          controller: 'ConfirmDeleteCtrl',
          size: 'sm',
          animation: true,
          backdrop: "static",
          // send data to pop
          resolve: {
            testMap: function() {
              return testMap;
            }
          }
        });
        // open confirmation modal
        confirmDelete.result.then(function (testMap) {
          var index = vm.testMaps.indexOf(testMap);
          testMapRes.delete({id: testMap._id})
          .$promise.then(function() {
            vm.testMaps.splice(index, 1);
            console.log(Constant.msg.testMap.MSG_DELETE_DATA_SUCCESS + new Date());
            return true;
          }, function(){
            console.log(Constant.msg.testMap.MSG_DELETE_DATA_UNSUCCESS + new Date());
            return false;
          });

        }, function () {
          console.log(Constant.msg.modal.MSG_MODAL_DISMISS + new Date());
          return false;
        });
      }

    });

    // on page loaded
    vm.getTestMaps();
    vm.getAnalyzers();
    vm.getTests();
  })

  .controller('ConfirmDeleteCtrl', function ($scope, $uibModalInstance, testMap) {
    $scope.ok = function () {
      $scope.testMap = testMap;
      $uibModalInstance.close($scope.testMap);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  })
  .controller('AlertErrorModalTestMapCtrl', function ($scope, $uibModalInstance, errorMessage) {
    $scope.errorMessage = errorMessage;
    $scope.close = function () {
      $uibModalInstance.close();
    };
  });
