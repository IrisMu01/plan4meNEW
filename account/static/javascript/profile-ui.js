/* ui for profile.html */
selected_plans = [];
// an array of strings representing each plan's id
// will be used by both profile-ui.js and profile-form.js

function checkButtons(){
    // edit plan(s) button
    if (selected_plans.length == 1){
        $("#edit-plan-button").attr("disabled", false);
    } else {
        $("#edit-plan-button").attr("disabled", true);
    }
    // delete plan(s) and change dates buttons
    if (selected_plans.length == 0){
        $("#delete-plan-button, #change-duration-button").attr("disabled", true);
    } else {
        $("#delete-plan-button, #change-duration-button").attr("disabled", false);
    }
}

// when select-multiple is checked,
// change the overlay text to "Select" and change behaviour
function onSelectMultipleChange(){
    var status = $(this).prop('checked');
    if (status) {
        // checkbox is indeed checked
        $(".one-plan").unbind("click", onOnePlanSelected);
        $(".one-plan").click(onPlansSelectionChange);
    } else {
        // checkbox have been unchecked
        unselectAllPlans();
    }
}

function onPlansSelectionChange(){
    var selected = $(this).css('background-color') == 'rgba(255, 255, 255, 0.4)';
    if (selected) {
        // change display
        $(this).css('background-color', 'rgba(255, 255, 255, 0)');
        // update the record and the "edit" button disabled attr
        var idx = selected_plans.indexOf($(this).prop('id'));
        if (idx != -1) {
            selected_plans.splice(idx, 1);
        }
        checkButtons();
    } else {
        // change display
        $(this).css('background-color', 'rgba(255, 255, 255, 0.4)');
        // enable other functionalities for the selected plan
        selected_plans.push($(this).prop('id'));
        // but disable the edit button if more than one plan is selected
        checkButtons();
    }
}

function unselectAllPlans(){
    // change display
    $(".one-plan").css('background-color', 'rgba(255, 255, 255, 0)');
    // unbind clicking event for multiple selection
    $(".one-plan").unbind("click", onPlansSelectionChange);
    // bind clicking event for single selection
    $(".one-plan").click(onOnePlanSelected);
    // change other records
    selected_plans = [];
    checkButtons();
}

function onOnePlanSelected(){
    var selected = $(this).css('background-color') == 'rgba(255, 255, 255, 0.4)';
    if (selected) {
        // change display
        $(".one-plan").css('background-color', 'rgba(255, 255, 255, 0');
        // disable relevant functionalities
        selected_plans.pop(); // when on single selection the array will always have length 1
    } else {
        // change display
        $(".one-plan").css('background-color', 'rgba(255, 255, 255, 0');
        $(this).css('background-color', 'rgba(255, 255, 255, 0.4)');
        // enalbe relvant functionalities
        selected_plans = [];
        selected_plans.push($(this).prop('id'));
    }
    checkButtons();
}

// =====================================================

function onChangeDateClicked(){
    var $selected_plans = selected_plans.map((id)=>{
        return $(`#${id}`);
    })
    $selected_plans.forEach(($element) => {
        // display
        $element.css('background-color', 'rgba(255, 255, 255, 0)');
        $element.unbind("click", onOnePlanSelected);
        $element.unbind("click", onPlansSelectionChange);
        // replace the p tags with labels and inputs
        var $p_date_from = $element.find(".date-from-p");
        var $p_date_to = $element.find(".date-to-p");
        var input1 = `
            <label class="date-from-label">From:</label>
            <input class="date-from-input" type="date"/><br/>
        `;
        var input2 = `
            <label class="date-to-label">To:</label>
            <input class="date-to-input" type="date"/>
        `;
        $p_date_from.replaceWith(input1);
        $p_date_to.replaceWith(input2);

        // move the overlay to a lower layer
        var $overlay = $element.find(".one-plan-overlay");
        $overlay.css('z-index', '-1');
    })
}

// =====================================================

$(document).ready(function(){

    // assigning ids to the plans
    $(".one-plan").each((idx, element) => {
        var id = $(element).find(".plan-id").text();
        $(element).prop('id', `plan${id}`);
    })

    checkButtons();

    $(".one-plan").click(onOnePlanSelected);
    $("#select-multiple").change(onSelectMultipleChange);

    $("#change-duration-button").click(onChangeDateClicked);
});