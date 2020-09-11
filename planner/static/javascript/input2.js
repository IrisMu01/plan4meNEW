/* handles ui */

function deleteHotelEntry(){
    $(this).parents('article').replaceWith("");
}
function addCustomHotelEntry(){
    var inputEl = $(this).parents('article').find('input.custom-name');
    var userInput = inputEl.val();
    inputEl.replaceWith(`<p class='selected-hotel-info'>${userInput}<p>`);
    $(this).replaceWith("");
}

let customHotelEntryHTML = "<article class='selected-hotel'><input class='selected-hotel-info custom-name' placeholder='Custom Entry'><div class='selected-hotel-dates'><p>From:</p><input class='selected-hotel-in' type='date'><p>To:</p><input class='selected-hotel-out' type='date'><button class='selected-hotel-add btn btn-success' type='button'>Add</button><button class='selected-hotel-del btn btn-danger' type='button'>Delete</button></div></article>";
function newHotelCustomEntry(){
    $('#all-selected-hotels').append(customHotelEntryHTML);
    $("#all-selected-hotels").animate({
        scrollTop: $(".custom-name").offset().top
    }, 500);
}

function newHotelEntry(){
    var parent = $(this).parent();
    var name = parent.find('h6').text();
    var addr = parent.find('p.hotel-info-addr').text();
    var imgLink = parent.find('img').attr('src');
    let newHotelEntryDOM = `<article class='selected-hotel'><p class='selected-hotel-info'>${name}<br/>Address: ${addr}</p><div class='selected-hotel-dates'><p>From:</p><input class='selected-hotel-in' type='date'><p>To:</p><input class='selected-hotel-out' type='date'><button class='selected-hotel-del btn btn-danger' type='button'>Delete</button></div><p class='selected-hotel-img-link'>${imgLink}</p></article>`
    $('#all-selected-hotels').append(newHotelEntryDOM);
    $('#all-selected-hotels').animate({
        scrollTop: $(".selected-hotel-info").offset().top
    }, 500);
}

// helper function for onHotelAllDone
// ('yyyy-mm-dd', 'yyyy-mm-dd') => ['yyyy-mm-dd' ...]
// generates all strings representing dates between start and end,
// from the earliest to the latest
// e.g. ['2020-08-02', '2020-08-03', ...]
var generateDates = function(start, end){
    let startDate = new Date(start);
    let endDate = new Date(end);
    let output = [];
    while (startDate < endDate){
        output = [...output, startDate.toISOString().substring(0, 10)];
        startDate.setDate(startDate.getDate() + 1);
    }
    return output;
}

// helper function for onHotelAllDone
// theDates: ['startDate1', 'endDate1', 'startDate2', 'endDate2', ...]
// returns boolean
function validHotelDates(theDates, start, end){
    let theRightDates = generateDates(start, end);
    let allBookedDates = [];
    let temp = [];
    for (var i = 0; i < theDates.length/2; i++){
        temp = generateDates(theDates[2*i], theDates[2*i+1]);
        for (var j = 0; j < temp.length; j++){
            allBookedDates.push(temp[j]);
        }
    }
    if (theRightDates.length != allBookedDates.length) { return false; }
    allBookedDates.sort();
    for (var i = 0; i < theRightDates.length; i++){
        if (theRightDates[i] != allBookedDates[i]){
            return false;
        }
    }
    return true;
}

function onHotelAllDone(){
    var theElements = $(this).parents('div#hotels-selection').find('.selected-hotel-in, .selected-hotel-out');
    var theRightDates = generateDates(startDate, endDate);
    var theGivenDates = [];
    theElements.each(function(){
        theGivenDates.push($(this).val());
    });
    let check = validHotelDates(theGivenDates, startDate, endDate);
    if (check) {
        // change the hotel section's display
        // ==================================================================
        // remove the red border if hotel dates has been invalid
        $('#all-selected-hotels').css('border', '0px');
        // hide the map
        $('#hotels-map').css('display', 'none');
        // additional styling (mostly borders)
        $('#hotel-form').removeClass('not-done');
        $('#hotel-form').addClass('finished');
        // hide the buttons - 'add custom entry' and 'all done'
        $('#hotel-final-confirm').replaceWith('');
        $('#all-selected-hotels').removeClass('col-md-10');
        $('#all-selected-hotels').addClass('col-md-12');
        // hide the buttons - 'add' and 'delete' in each entry
        $('.selected-hotel-dates > button').each(function(index, element){
            $(element).css('display', 'none');
        });
        // disable the date input changes
        $('.selected-hotel-in, .selected-hotel-out').each(function(idx, element){
            $(element).prop('disabled', true);
        })
        // change all <input> into <p>
        $('.custom-name').each(function(idx, element){
            var value = $(element).val();
            $(element).replaceWith(`<p class='selected-hotel-info'>${value}</p>`);
        });
        // ==================================================================
        // programatically populate #hotel-form-data
        $('#hotel-form-data').ready(function(){
            var strOutput = ''; // the final output
            var temp_str; // stringified json about each hotel entry
            var temp_name, temp_in, temp_out, temp_img_link; // str
            var $date_div; // jquery obj
            $('.selected-hotel-info').each((idx, element) => {
                temp_name = $(element).text();
                $date_div = $(element).parent().find('div.selected-hotel-dates');
                temp_in = $date_div.find('.selected-hotel-in').val();
                temp_out = $date_div.find('.selected-hotel-out').val();
                temp_img_link = $(element).parent().find('.selected-hotel-img-link').text();
                temp_str = JSON.stringify({
                    name: temp_name,
                    check_in: temp_in,
                    check_out: temp_out,
                    img_link: temp_img_link
                });
                strOutput = strOutput + `"${idx}": ${temp_str}, `;
            });
            strOutput = '{' + strOutput.slice(0, -2) + '}';
            $('#hotel-form-data').val(strOutput);
        });
        // ==================================================================
        // display the next section & add classes for additional styling & features
        $('#poi').css('display', 'block');
        poiInputAddClasses();

    } else {
        // invalid hotel check-in/out dates
        $('#all-selected-hotels').css({'border': '1px solid red', 'border-radius': '5px'});
        alert('Invalid hotel check-in & check-out date entries')
    }
}

function poiInputAddClasses(){
    $('#poi-choices').find('input').each((idx, element)=>{
        $(element).addClass('poi-checkbox');
    });
    $('#poi-choices').find('label').each((idx, element)=>{
        $(element).addClass('poi-choices');
    });
}

function POIAllDone(){
    $('#poi-done').prop('disabled', true);
    $('#poi').css({'padding-bottom': '3%', 'border-bottom': '2px solid #ffffff'});
    $('#food, #all-done').css('display', 'block');
    $('main').css({'height': 'auto', 'overflow': 'auto'});
}

$(document).ready(function(){
    // populate the hidden fields from input1
    $('#input1-city-name').val(city);
    $('#input1-date-from').val(startDate);
    $('#input1-date-to').val(endDate);
    $('#input1-coordinates').val(cleanStrCoord);
    // hide the last two sections
    $('#poi, #food, #all-done').css('display', 'none');
    // ui
    $(document.body).on('click', '.selected-hotel-del', deleteHotelEntry);
    $(document.body).on('click', '.selected-hotel-add', addCustomHotelEntry);
    // more convoluted syntax to work with dynamic content
    $('#add-custom-entry').click(newHotelCustomEntry);
    $(document.body).on('click', '.add-this-hotel', newHotelEntry);
    $('#hotel-all-done').click(onHotelAllDone);

    // ===================================================
    // for dev process: auto-complete the hotel selection section
    /*
    $('#add-custom-entry')[0].click(); $('#add-custom-entry')[0].click();
    $('.custom-name').each(function(idx, element){$(element).val(idx);})
    $('.selected-hotel-in').each(function(idx, element){
        idx == 0 ? $(element).val('2020-08-02'): $(element).val('2020-08-03');
    });
    $('.selected-hotel-out').each(function(idx, element){
        idx == 0 ? $(element).val('2020-08-03'): $(element).val('2020-08-09');
    });
    $('#hotel-all-done')[0].click();
    */
    // ===================================================
    $('#poi-all').click(()=>{
        $('.poi-checkbox').each(function(idx, element){
            $(element).prop('checked', true);
        });
    });
    $('#poi-none').click(()=>{
        $('.poi-checkbox').each(function(idx, element){
            $(element).prop('checked', false);
        });
    });
    $('#poi-done').click(POIAllDone);

    // ===================================================
    // for dev process: auto-complete the poi selection section
    /*
    $('#poi-all')[0].click();
    $('#poi-done')[0].click();
    */
    // ===================================================

    $('#food-price').change(function(){
        let newMax = $(this).val();
        let newStr = '';
        for (var i = 0; i < newMax; i++){ newStr = newStr + '$'; }
        $('#show-food-price').text(newStr);
        $('#max-price-data').val(newMax);
    })

})