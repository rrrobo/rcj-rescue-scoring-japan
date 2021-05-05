var app = angular.module("MyPage", ['ngTouch','ngAnimate', 'pascalprecht.translate', 'ngCookies']);

app.controller("MyPageController", ['$scope', '$http', '$translate', function ($scope, $http, $translate) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();
    
    $scope.competitionId = competitionId

    $scope.go = function (path) {
        window.location = path
    }

    $scope.goResv = function (id) {
        window.open(`/mypage/${teamId}/${token}/reservation/${id}`, '_blank');
    }

    $scope.goSurv = function (id) {
        window.open(`/mypage/${teamId}/${token}/survey/${id}`, '_blank');
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

    $http.get(`/api/mail/my/${teamId}/${token}`).then(function (response) {
        $scope.mails = response.data;
    })

    $http.post(`/api/reservation/list/${competitionId}`,{
        team: teamId,
        league: leagueId
    }).then(function (response) {
        $scope.reservations = response.data;
    })

    $http.get(`/api/survey/list/${competitionId}/${leagueId}/${teamId}`).then(function (response) {
        $scope.survey = response.data;
        for(let suvr of $scope.survey){
            let name = suvr.i18n.filter(i => i.language == currentLang && suvr.languages.some( l => l.language == i.language && l.enable));
            if(name.length == 1){
                suvr.name = name[0].name;
                break;
            }else{
                let name = suvr.i18n.filter(i => suvr.languages.some( l => l.language == i.language && l.enable));
                if(name.length > 0){
                    suvr.name = name[0].name;
                    break;
                }
            }
        }
    })


    $scope.time = function(time){
        let options = {year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"};
        return(new Intl.DateTimeFormat(navigator.language, options).format(time*1000));
    }

    $scope.mailView = function(mail){
        let mailUrl = `/api/mail/get/${teamId}/${token}/${mail.mailId}`;
        $http.get(mailUrl).then(function (response) {
            let html = response.data.html.replace(/<img[^>]+>/, "");
            let plain = response.data.plain.replace(/\r?\n/g, '<br>');
            Swal.fire({
                html:'<ul class="nav nav-tabs" id="mailType" role="tablist"><li class="nav-item"><a class="nav-link active" id="html-tab" data-toggle="tab" href="#html" role="tab" aria-controls="html" aria-selected="true">HTML</a></li><li class="nav-item"><a class="nav-link" id="plain-tab" data-toggle="tab" href="#plain" role="tab" aria-controls="plain" aria-selected="false">Plain Text</a></li></ul>'+
                '<div class="tab-content" id="mailTypeContent">'+
                    '<div class="tab-pane fade show active" id="html" role="tabpanel" aria-labelledby="html-tab" style="text-align:left;max-height:calc(100vh - 200px);overflow:auto;">' + html +'</div>'+
                    '<div class="tab-pane fade" id="plain" role="tabpanel" aria-labelledby="plain-tab" style="text-align:left;max-height:calc(100vh - 200px);overflow:auto;">' + plain + '</div>'+
                '</div>',
                width: "100%",
                height: "100%",
                showCloseButton: true, 
            })
        }, function (response) {
            Toast.fire({
                type: 'error',
                title: "Error: " + response.statusText,
                html: response.data.msg
            })
        })
        
    }

    
}])