/* jquery & user interaction functionalities */

$(document).ready(function(){
    // disable the signup button first
    $("#prompt").attr('disabled', true);

    document.addEventListener("plan_ready", function(){
        // once the plan is ready, activate the sign up button
        $("#prompt").attr('disabled', false);

        var all_data = {};

        // process the data a little bit
        var all_plan_data = {};
        for (i in event.detail.plans){
            var key_name = "plan" + i.toString();
            all_plan_data[key_name] = event.detail.plans[i];
        }

        all_data['city'] = event.detail.city;
        all_data['plans'] = all_plan_data;

        // replace " with its escape character
        all_data = JSON.stringify(all_data).replace(/"/g, '&quot;');

        // populate the hidden form field with data
        $('#all-data').ready(() => {
            $('#all-data').val(all_data);
        });
        //console.log('all-data stores', $('#all-data').val());
    });
});