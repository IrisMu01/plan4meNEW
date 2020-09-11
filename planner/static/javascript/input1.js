// initialization
var cityChosen; // str, 'City, Province/State, Country'
var coordinates; //obj, {lat: num, lng: num}
var startDate, endDate; // str, 'yyyy-mm-dd'
var hotelMap; // google.maps.Map instance


$(document).ready(function(){
    // page setup
    $('#date-prompt').css('display', 'none');
    $('#final-submit').css('display', 'none');
    $('#city-prompt').fadeTo('1.5s', 1);

    // ===============================================
    // step1: choose a city
    // ===============================================
    // load the autocomplete widget
    $("#google-api").ready(() => {
        var options1 = {
            types: ['(cities)']
        };
        var inputTag = document.getElementById("get-city-name");
        var autoComplete = new google.maps.places.Autocomplete(inputTag, options1);
        autoComplete.addListener('place_changed', () => {
            cityChosen = autoComplete.getPlace().formatted_address;
            coordinates = autoComplete.getPlace().geometry.location; 
            coordinates = {lat: coordinates.lat(), lng: coordinates.lng()};
            // make coordinates into a hidden field of the form
            $("#coordinates").ready(function(){
                $("#coordinates").val(JSON.stringify(coordinates));
            });
        });
    })

    // ===============================================
    // step2: confirm the date
    // ===============================================
    // make room for the new prompt
    function onCityNameConfirm(){
        // resize the page height & change the footer's css
        $("main").css({'height': '120vh'});
        $("footer").css({'position': 'relative'});
        $("#city-prompt").css({'padding': '5vh 0px 9vh 0px'});

        // show the date prompt section
        $("#date-prompt").css('display', 'block');
        $("html, body").animate({
            scrollTop: $("#date-prompt").offset().top
        }, 500);
    };
    // binds handler to event
    $("#city-name-confirm").click(onCityNameConfirm);

    // ===============================================
    // step3: determine the hotel(s)
    // ===============================================
    // make room for the new prompt
    function onDateConfirm(){
        // input retrival & error handling
        // (commented if this step needs to be skipped for testing purposes)
        startDate = $("#date-from").val();
        endDate = $("#date-to").val();
        if ((startDate <= endDate) == false){
            $("#date-invalid").css({'opacity': '1'});
        }else{
            $("#date-invalid").css({'opacity': '0'});

            // show the final confirm button
            $('#final-submit').css('display', 'block');
        }
    };
    // binds handler to event
    $("#date-confirm").click(onDateConfirm);

    // =======================================================================================
    // =======================================================================================

    // -----------------------------------------------
    // For testing: auto-complete the city & date and
    // trigger the map section
    // -------------
    
    /*
    cityChosen = 'Toronto, ON, Canada';
    coordinates = {lat: 43.653226, lng: -79.3831843};
    startDate = '2020-07-06';
    endDate= '2020-07-13';
    // triggering events?
    $('#city-name-confirm')[0].click();
    $('#date-confirm')[0].click();*/
    // -----------------------------------------------
})