var app = angular.module("ResvForm", ['ngTouch','ngAnimate', 'pascalprecht.translate', 'ngCookies', 'ngSanitize']);

app.controller("ResvFormController", ['$scope', '$http', '$translate','$sce', function ($scope, $http, $translate, $sce) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    let trans = [];
    function loadTranslation(tag){
        $translate(`reservation.js.${tag}`).then(function (val) {
            trans[tag] = val;
        }, function (translationId) {
        // = translationId;
        });
    }

    loadTranslation("booked");
    loadTranslation("bookedMes");
    loadTranslation("cancel");
    loadTranslation("cancelMes");
    loadTranslation("canceled");
    loadTranslation("canceledMes");
    loadTranslation("cancelButton");
    loadTranslation("cancelKeep");

    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();
    $scope.currentLang = currentLang;
    $scope.displayLang = currentLang;

    
    $scope.competitionId = competitionId;
    $scope.teamId = teamId;
    $scope.token = token;
    $scope.myBook = null;

    $scope.go = function (path) {
        window.location = path
    }

    $scope.getLeagueName = function (id){
        return($scope.leagues.find(l => l.id === id).name)
    }
    
    $http.get("/api/competitions/leagues").then(function (response) {
        $scope.leagueName = response.data.find(l => l.id === leagueId).name;
        $http.get("/api/competitions/" + competitionId).then(function (response) {
            $scope.competition = response.data
        })
    })

    function updateList(){
        $http.get(`/api/reservation/book/${teamId}/${token}/${resvId}`).then(function (response) {
            $scope.resv = response.data;
            let booked = $scope.resv.slot.filter(s => s.myBooked);
            $scope.myBook = null;
            if(booked.length == 1){
                $scope.myBook = booked[0];
            }

            //Check 1st lang
            for(let l of $scope.resv.languages){
                if(l.language == $scope.displayLang && l.enable) return;
            }
    
            //Set alternative lang
            for(let l of $scope.resv.languages){
                if(l.enable){
                    $scope.displayLang = l.language;
                    return;
                }
            }
        })
    }
    updateList();
    

    $scope.time = function(time){
        if(!time) return;
        let options = {weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric",timeZoneName:"short"};
        return(new Intl.DateTimeFormat(navigator.language, options).format(new Date(time).getTime()));
    }

    $scope.deadline = function(){
        if(!$scope.resv) return;
        let d = new Date($scope.resv.deadline);
        let options = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",timeZoneName:"long" };
        return(new Intl.DateTimeFormat(navigator.language, options).format(d));
    }

    $scope.inDeadline = function(){
        if(!$scope.resv) return false;
        let d = new Date($scope.resv.deadline);
        return d > new Date();
    }

    $scope.book = function(slotId){
        $http.post(`/api/reservation/book/${teamId}/${token}/${resvId}` , {"slotId": slotId}).then(function (response) {
            Swal.fire(
                trans["booked"],
                trans["bookedMes"],
                'success'
            )
            updateList();
        }, function (response) {
            Swal.fire(
                'Oops...',
                response.data.msg,
                'error'
            )
            updateList();
        });
    }

    $scope.cancel = function(slot){
        Swal.fire({
            title: trans["cancel"],
            html: `${trans["cancelMes"]}<br><strong>${$scope.time(slot.start)}</strong>`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: trans["cancelButton"],
            cancelButtonText: trans["cancelKeep"]
            }).then((result) => {
            if (result.value) {
                $http.post(`/api/reservation/cancel/${teamId}/${token}/${resvId}` , {"slotId": slot.slotId}).then(function (response) {
                    Swal.fire(
                        trans["canceled"],
                        trans["canceledMes"],
                        'success'
                    )
                    updateList();
                }, function (response) {
                    Swal.fire(
                        'Oops...',
                        response.data.msg,
                        'error'
                    )
                    updateList();
                });
            }
        })

        
    }

    $scope.langContent = function(data, target){
        if(!data) return;
        if(data[target]) return data[target];
        data[target] = $sce.trustAsHtml(data.filter( function( value ) {
            return value.language == $scope.displayLang;        
        })[0][target]);

        return(data[target]);
    }

    socket = io(window.location.origin, {
        transports: ['websocket']
    });

    socket.emit('subscribe', `reservation/${resvId}`);

    socket.on('update', function () {
        updateList();
    });
    socket.on('disconnect', function() {
        socket.emit('subscribe', `reservation/${resvId}`);
    })

    $(window).on('beforeunload', function () {
        socket.emit('unsubscribe', `reservation/${resvId}`);
    });
}])
