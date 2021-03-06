// register the directive with your app module
var app = angular.module('DocumentReview', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies', 'ngSanitize']);

// function referenced by the drop target
app.controller('DocumentReviewController', ['$scope', '$uibModal', '$log', '$http', '$translate','$sce', '$timeout' , function ($scope, $uibModal, $log, $http, $translate, $sce, $timeout) {

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    let saved_mes;
    $translate('document.saved').then(function (val) {
        saved_mes = val;
    }, function (translationId) {
    // = translationId;
    });

    let upload_mes;
    $translate('document.uploaded').then(function (val) {
        upload_mes = val;
    }, function (translationId) {
    // = translationId;
    });

    let hints_mes;
    $translate('document.form.hints').then(function (val) {
        hints_mes = val;
    }, function (translationId) {
    // = translationId;
    });

    let deleted;
    $translate('common.deleted').then(function (val) {
        deleted = val;
    }, function (translationId) {
    // = translationId;
    });

    let deleteReview;
    $translate('document.review.deleteReview').then(function (val) {
        deleteReview = val;
    }, function (translationId) {
    // = translationId;
    });

    let deleteType;
    $translate('document.review.deleteType').then(function (val) {
        deleteType = val;
    }, function (translationId) {
    // = translationId;
    });

    let deletePart;
    $translate('document.review.deletePart').then(function (val) {
        deletePart = val;
    }, function (translationId) {
    // = translationId;
    });

    let deleteWhole;
    $translate('document.review.deleteWhole').then(function (val) {
        deleteWhole = val;
    }, function (translationId) {
    // = translationId;
    });

    let deletePartMes;
    $translate('document.review.deletePartMes').then(function (val) {
        deletePartMes = val;
    }, function (translationId) {
    // = translationId;
    });

    let deleteWholeMes;
    $translate('document.review.deleteWholeMes').then(function (val) {
        deleteWholeMes = val;
    }, function (translationId) {
    // = translationId;
    });


    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();

    let publicToken = "";
    $scope.token = token;

    $scope.currentLang = currentLang;
    $scope.displayLang = currentLang;

    $scope.uploaded = [];
    
    $scope.updateTime = new Date().getTime()/1000;

    $scope.videoRefresh = false;

    $scope.rangeS =  (start, end) => [...Array((end - start) + 1)].map((_, i) => start + i);

    $scope.comments = "";

    $scope.scaleFlag = false;

    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
    })

    $http.get("/api/teams/" + teamId).then(function (response) {
        $scope.team = response.data;

        $http.get("/api/competitions/leagues/"+$scope.team.league).then(function (response) {
            $scope.league = response.data
        });

        $scope.updateUploaded();
        $scope.updateReviewUploaded();

        $scope.runScore = [];
        
        $http.get("/api/competitions/" + competitionId + "/documents/" + $scope.team.league + "/review").then(function (response) {
            $scope.blocks = response.data.blocks;
            $scope.notifications = response.data.notifications;
            $scope.languages = response.data.languages;
            $scope.review = response.data.review;
            publicToken = response.data.publicToken;

            for(let r of $scope.review){
                for(let q of r.questions){
                    if(q.type != "run") continue;
                    $http.get(`/api/document/run/${teamId}/${q._id}`).then(function (response) {
                        $scope.runScore[q._id] = response.data;
                    });
                }
            }

            $http.get("/api/document/answer/"+ $scope.team._id + "/" + token).then(function (response) {
                $scope.answers = response.data;
                if(!$scope.answers.length){
                    for(let b of $scope.blocks){
                        let ba = [];
                        for(let q of b.questions){
                            if(q.type == "select") ba.push('option0');
                            else ba.push('');
                        }
                        $scope.answers.push(ba);
                    }
                }
            });

            updateReviewList();
            
            //Check 1st lang
            for(let l of $scope.languages){
                if(l.language == $scope.displayLang && l.enable) return;
            }
    
            //Set alternative lang
            for(let l of $scope.languages){
                if(l.enable){
                    $scope.displayLang = l.language;
                    return;
                }
            }
        })

        
    })

    function updateReviewList(){
        $http.get("/api/document/review/" + teamId).then(function (response) {
            $scope.reviewComments = response.data;
            for(let c of $scope.reviewComments){
                if(!c.reviewer){
                    c.reviewer = {
                        username: c.name
                    };
                }
            }

            $scope.rating=[];
            if(!$scope.reviewComments) return 0;
            for(let c of $scope.reviewComments){
                for(let b in c.comments){
                    for(let q in c.comments[b]){
                        if($scope.review[b].questions[q].type != 'scale') continue;
                        if(c.comments[b][q] == ''){
                            continue;
                        }
                        let r = Number(c.comments[b][q]);
                        if(!$scope.rating[b]) $scope.rating[b] = [];
                        if(!$scope.rating[b][q]) $scope.rating[b][q] = [];
                        $scope.rating[b][q].push(r);
                        $scope.scaleFlag = true;
                    }
                }
            }
        })
    }

    $scope.copyShareLink = function(question){
        

        let link = `${location.protocol}//${location.host}`;
        if(question == 0){
            link = `${link}/document/public_files/${$scope.team._id}/${publicToken}`
        }
        else if(question.type == "pdf"){
            link = `${link}/components/pdfjs/web/viewer.html?file=/api/document/files/${$scope.team._id}/${publicToken}/${$scope.nameUploaded(question.fileName)}`
        }else if(question.type == "picture"){
            link = `${link}/api/document/files/${$scope.team._id}/${publicToken}/${$scope.nameUploaded(question.fileName)}`
        }else if(question.type == "zip"){
            link = `${link}/api/document/files/${$scope.team._id}/${publicToken}/${$scope.nameUploaded(question.fileName)}`
        }else if(question.type == "movie"){
            link = `${link}/document/embed_video?video=/api/document/files/${$scope.team._id}/${publicToken}/${$scope.nameUploaded(question.fileName)}`
        }
        if(navigator.clipboard){
            navigator.clipboard.writeText(link);
            Toast.fire({
                type: 'success',
                title: "Copied!",
                html: link
            });
        }else{
            Toast.fire({
                type: 'error',
                title: "Not supported!"
            });
        }
        
    }


    $scope.trust = function(html){
        return($sce.trustAsHtml(html));
    }

    $scope.langContent = function(data, target){
        if(data[target]) return data[target];
        data[target] = $sce.trustAsHtml(data.filter( function( value ) {
            return value.language == $scope.displayLang;        
        })[0][target]);

        return(data[target]);
    }

    $scope.langArray = function(data, target){
        if(data[target]) return data[target];
        data[target] = data.filter( function( value ) {
            return value.language == $scope.displayLang;        
        })[0][target];
        return(data[target]);
    }
    
    $scope.changeLocale = function(){
        $scope.go('/locales');
    }

    $scope.go = function (path) {
        window.location = path
    }

    $scope.getParam = function (key) {
        var str = location.search.split("?");
        if (str.length < 2) {
          return "";
        }

        var params = str[1].split("&");
        for (var i = 0; i < params.length; i++) {
          var keyVal = params[i].split("=");
          if (keyVal[0] == key && keyVal.length == 2) {
            return decodeURIComponent(keyVal[1]);
          }
        }
        return "";
    }

    $scope.backPage = function(){
        if($scope.getParam("return")) $scope.go($scope.getParam("return"));
        else window.history.back(-1);
        return false;
    }


    const sum  = function(arr) {  
        return arr.reduce(function(prev, current, i, arr) {
            if(isNaN(current)) return prev;
            return prev+current;
        });
    };

    const isNumberCount = function(arr){
        let count = 0;
        for(let a of arr){
            if(!isNaN(a)) count += 1;
        }
        return count;
    }

    $scope.calcAve = function(blockIndex, questionIndex){
        if(!$scope.rating || !$scope.rating[blockIndex] || !$scope.rating[blockIndex][questionIndex] || $scope.rating[blockIndex][questionIndex].length == 0 ) return 0;
        return sum($scope.rating[blockIndex][questionIndex]) / isNumberCount($scope.rating[blockIndex][questionIndex]);
    }
    $scope.calcScore = function(){
        let score = 0;
        for(let b in $scope.rating){
            for(let q in $scope.rating[b]){
                if($scope.review[b].questions[q].type != 'scale') continue;
                score += $scope.calcAve(b, q);
            }
        }
        return score;
    }


    $scope.updateUploaded = function(){
        $http.get("/api/document/files/" + $scope.team._id + '/' + token).then(function (response) {
            $scope.uploaded = response.data;
            $scope.updateTime = new Date().getTime()/1000;
        })
    }

    $scope.updateReviewUploaded = function(){
        $http.get("/api/document/review/files/" + $scope.team._id).then(function (response) {
            $scope.uploadedReview = response.data;
            $scope.updateTime = new Date().getTime()/1000;
        })
    }

    $scope.checkUploaded = function(name){
        return($scope.uploaded.some((n) => new RegExp(name+'\\.').test(n)));
    }

    $scope.checkUploadedReview = function(name, user){
        return($scope.uploadedReview.some((n) => new RegExp(user + '/' + name+'\\.').test(n)));
    }

    $scope.nameUploaded = function(name){
        return($scope.uploaded[$scope.uploaded.findIndex((n) => new RegExp(name+'\\.').test(n))]);
    }

    $scope.nameUploadedReview = function(name, user){
        return($scope.uploadedReview[$scope.uploadedReview.findIndex((n) => new RegExp(user + '/' + name+'\\.').test(n))]);
    }

    $scope.getPdfLink = function(name){
        return("/components/pdfjs/web/viewer.html?file=/api/document/files/" + $scope.team._id + "/" + token + "/" + $scope.nameUploaded(name) + '&v=' + $scope.updateTime);
    }

    $scope.getPdfLinkReview = function(name, user){
        return("/components/pdfjs/web/viewer.html?file=/api/document/review/files/" + $scope.team._id + "/" + $scope.nameUploadedReview(name, user) + '&v=' + $scope.updateTime);
    }

    $scope.getVideoList = function(name){
        let res = $scope.uploaded.filter(function(value) {
            return new RegExp(name+'\\.').test(value);
        });
        return res;
    }

    $scope.getVideoListReview = function(name, user){
        let res = $scope.uploadedReview.filter(function(value) {
            return new RegExp(user + '/' + name+'\\.').test(value);
        });
        return res;
    }


    $scope.getVideoLink = function(path){
        return("/api/document/files/" + $scope.team._id + "/" + token + "/" + path + '?v=' + $scope.updateTime);
    }

    $scope.getVideoLinkReview = function(path){
        return("/api/document/review/files/" + $scope.team._id + "/" + path + '?v=' + $scope.updateTime);
    }

    $scope.getThumbnailLink = function(name){
        return("/api/document/files/" + $scope.team._id + "/" + token + "/" + $scope.nameUploaded(name+'-thumbnail') + '?v=' + $scope.updateTime);
    }

    $scope.getThumbnailLinkReview = function(name, user){
        return("/api/document/review/files/" + $scope.team._id + "/" + $scope.nameUploadedReview(name+'-thumbnail', user) + '?v=' + $scope.updateTime);
    }

    
    $scope.removeComment = function(id, block, question){
        Swal({
            title: deleteReview,
            type: 'warning',
            html:
                `<p>${deleteType}</p>` +
                `<button id="part" class="btn btn-lg btn-warning" style="margin:10px"><i class="fas fa-eraser"></i>&nbsp;${deletePart}</button>` +
                `<button id="whole" class="btn btn-lg btn-danger" style="margin:10px"><i class="fas fa-trash"></i>&nbsp;${deleteWhole}</button><br>`,
            showCancelButton: true,
            showConfirmButton: false,
            onBeforeOpen: () => {
                const content = Swal.getContent()
                const $ = content.querySelector.bind(content)

                const part = $('#part')
                const whole = $('#whole')

                part.addEventListener('click', () => {
                    Swal({
                        title: deleteReview,
                        html: `<p>${deletePartMes}</p>`,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!'
                      }).then((result) => {
                        if (result.value) {
                            $http.delete(`/api/document/review/${id}/${block}/${question}`).then(function (response) {
                                Toast.fire({
                                    type: 'success',
                                    title: deleted
                                })
                                updateReviewList();
                            }, function (response) {
                                Toast.fire({
                                    type: 'error',
                                    title: "Error: " + response.statusText,
                                    html: response.data.msg
                                })
                            });
                        }
                      })
                })

                whole.addEventListener('click', () => {
                    Swal({
                        title: deleteReview,
                        html: `<p>${deleteWholeMes}</p>`,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!'
                      }).then((result) => {
                        if (result.value) {
                            $http.delete(`/api/document/review/${id}/-1/-1`).then(function (response) {
                                Toast.fire({
                                    type: 'success',
                                    title: deleted
                                })
                                updateReviewList();
                            }, function (response) {
                                Toast.fire({
                                    type: 'error',
                                    title: "Error: " + response.statusText,
                                    html: response.data.msg
                                })
                            });
                        }
                      })
                })
            },
            onClose: () => {
            }
        })
    }

    var A = parseInt($('#ANSWER').width(), 10),
        B = parseInt($('#COMMENTS').width(), 10),
        Z = parseInt($('#DRUG').width(), 10),
        minw = parseInt((A + B + Z) * 10 / 100, 10),
        offset = $('#container').offset(),
        splitter = function(event, ui){
            var aw = parseInt(ui.position.left),
                bw = A + B - aw;
            //set widths and information...
            $('#ANSWER').css({width : aw});
            $('#COMMENTS').css({width : bw + 15});
            //qe.container.style.height = (window.innerHeight - qe.container.offsetTop - 90) + 'px';


        };
    $('#DRUG').draggable({
        axis : 'x',
        containment : [
            offset.left + minw,
            offset.top,
            offset.left + A + B - minw,
            offset.top + $('#container').height()
            ],
        drag : splitter
    });

}]);
