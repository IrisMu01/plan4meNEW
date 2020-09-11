$(document).ready(function(){
    $("#step1, #step2, #step3, #step4").mouseenter(function(theStep){
       var stepID = $(theStep.currentTarget).attr('id');
       var layerID = `#layer${stepID.substring(4)}`;
       $(layerID).css({'opacity': 0.8});
    });
    $("#step1, #step2, #step3, #step4").mouseleave(function(theStep){
        var stepID = $(theStep.currentTarget).attr('id');
        var layerID = `#layer${stepID.substring(4)}`;
        $(layerID).css({'opacity': 0});
    });
});