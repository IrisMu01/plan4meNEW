/* responsible for populating the hidden form using jQuery */


// format: {
//     "change_date": false | JSON,
//     "edit_target": false | str
// }

var form_data = {
    "change_date": false,
    "edit_target": false
};

var new_dates = {};

function onChangedUserInput(){
    // declare the array if this is the first time a plan has been edited
    var id = $(this).parent().prop('id');
    if (new_dates[id] === undefined){new_dates[id] = new Array(2);}
    if ($(this).prop('class') == "date-from-input") {
        new_dates[id][0] = {"date-from": $(this).val()};
    } else if ($(this).prop('class') == "date-to-input") {
        new_dates[id][1] = {"date-to": $(this).val()};
    }
    // make changes to form_date
    form_data["change_date"] = new_dates;
    form_data["edit_target"] = false;
}

function ajaxRequest(){
    $.ajax({
        url: $("form").attr('ajax-url'),
        type: 'GET',
        data: {"data": JSON.stringify(form_data)},
        success: function(data){
            if (data.success == true) {
                if (data.action == 'edit') {
                    window.location.replace('/editor/');
                } else {
                    window.location.reload();
                }
            }
        }
    });
}

$(document).ready(function(){
    $("#change-duration-button").click(()=>{
        $(".date-from-input, .date-to-input").change(onChangedUserInput);
    });

    // this is used specifically for editing a chosen plan
    $("#edit-plan-button").click(()=>{
        // 1. check user has made unsaved changes to the dates
        if ($(".date-from-input").length != 0){
            // user is trying to edit a plan despite unfinished changes in dates
            alert("Please apply or revert current changes before editing a plan.");
        } else if (selected_plans.length != 1){
            // technically this condition will never run
            // the edit button's disabled attr is already regulated in profile-ui.js
            alert("You can only edit one plan at once.");
        } else {
            form_data['change_date'] = false;
            form_data['delete_target'] = false;
            form_data['edit_target'] = selected_plans[0];
            ajaxRequest();
        }
    })

    // this is used specifically for changing the dates
    $("#apply-changes").click(()=>{
        var can_change = true;
        for (var id in form_data['change_date']){
            $plan = $("#plans-display").find(`#${id}`);
            if ($plan.find(".date-from-input").val() > $plan.find(".date-to-input").val()){
                can_change = false;
            }
        }
        if (can_change) {
            alert("Yay changes applicable! uwu");
            form_data['delete_target'] = false;
            form_data['edit_target'] = false;
            // make the ajax request to server side
            ajaxRequest();
        } else {
            alert("Invalid dates; please check your entires");
        }
    });

    // this is used for deleting (one or multiple) chosen plans
    // work on this tomorrow
    $("#delete-plan-button").click(()=>{
        form_data['change_date'] = false;
        form_data['edit_target'] = false;
        form_data['delete_target'] = selected_plans;
        ajaxRequest();
    });

});